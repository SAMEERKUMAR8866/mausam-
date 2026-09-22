// src/services/data-quality.service.ts
// Data Freshness, Quality & Deterministic Confidence Evaluation Engine for Mausam
// Computes audit trails and scores confidence without relying on LLM self-reporting

import type { ValidatedEnvironmentalState, ValidatedField } from './data-validator.service';

export type FreshnessLevel = 'Fresh' | 'Recent' | 'Stale' | 'Very Stale' | 'Unavailable';
export type QualityScore = 'good' | 'fair' | 'poor' | 'unreliable';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface FreshnessItem<T = any> {
  value: T | null;
  unit: string;
  source: string;
  timestamp: string;
  ageMinutes: number;
  freshness: FreshnessLevel;
}

export interface DataQualityReport {
  dataQuality: QualityScore;
  confidence: ConfidenceLevel;
  freshness: FreshnessLevel;
  overallScorePct: number;
  ageMinutes: number;
  sourceTier: 'live_api' | 'cached' | 'sensor' | 'fallback' | 'unknown';
  completenessPct: number;
  validFieldsCount: number;
  totalFieldsCount: number;
  factors: {
    completeness: { score: number; max: number; desc: string };
    freshness: { score: number; max: number; desc: string };
    sourceReliability: { score: number; max: number; desc: string };
    anomalies: { penalty: number; desc: string };
  };
  fieldFreshness: Record<string, FreshnessItem>;
  explainabilitySummary: string;
}

export class DataQualityService {
  /**
   * Classifies timestamp into freshness category and computes age in minutes.
   */
  static evaluateFreshness(timestampInput?: string | number | Date): { ageMinutes: number; freshness: FreshnessLevel } {
    if (!timestampInput) {
      return { ageMinutes: 99999, freshness: 'Unavailable' };
    }

    let timestampMs: number;
    if (typeof timestampInput === 'number') {
      timestampMs = timestampInput;
    } else if (timestampInput instanceof Date) {
      timestampMs = timestampInput.getTime();
    } else {
      const parsed = Date.parse(timestampInput);
      if (isNaN(parsed)) {
        return { ageMinutes: 99999, freshness: 'Unavailable' };
      }
      timestampMs = parsed;
    }

    const now = Date.now();
    const diffMs = Math.max(0, now - timestampMs);
    const ageMinutes = Math.floor(diffMs / (1000 * 60));

    let freshness: FreshnessLevel;
    if (ageMinutes < 15) {
      freshness = 'Fresh';
    } else if (ageMinutes <= 60) {
      freshness = 'Recent';
    } else if (ageMinutes <= 360) {
      // 1 to 6 hours
      freshness = 'Stale';
    } else if (ageMinutes < 99999) {
      // > 6 hours
      freshness = 'Very Stale';
    } else {
      freshness = 'Unavailable';
    }

    return { ageMinutes, freshness };
  }

  /**
   * Transforms a validated field into a complete FreshnessItem with timestamp metadata.
   */
  static toFreshnessItem<T>(
    field: ValidatedField<T>,
    source: string,
    timestamp: string,
    ageMinutes: number,
    freshness: FreshnessLevel
  ): FreshnessItem<T> {
    return {
      value: field.value,
      unit: field.unit,
      source,
      timestamp,
      ageMinutes,
      freshness: field.status === 'valid' ? freshness : 'Unavailable'
    };
  }

  /**
   * Deterministically evaluates environmental data quality and confidence rating.
   */
  static evaluateQuality(
    validatedState: ValidatedEnvironmentalState,
    options: {
      isCached?: boolean;
      cachedAt?: number;
      isSensorSource?: boolean;
      isOffline?: boolean;
    } = {}
  ): DataQualityReport {
    // 1. Calculate Freshness
    const effectiveTimestamp = options.cachedAt 
      ? new Date(options.cachedAt).toISOString() 
      : (validatedState.timestamp || new Date().toISOString());

    const { ageMinutes, freshness } = this.evaluateFreshness(effectiveTimestamp);

    // 2. Identify Source Tier
    let sourceTier: 'live_api' | 'cached' | 'sensor' | 'fallback' | 'unknown' = 'live_api';
    if (options.isOffline || validatedState.source?.includes('fallback') || validatedState.source?.includes('mock')) {
      sourceTier = options.isCached ? 'cached' : 'fallback';
    } else if (options.isCached) {
      sourceTier = 'cached';
    } else if (options.isSensorSource) {
      sourceTier = 'sensor';
    }

    // 3. Completeness Evaluation
    const criticalFields = [
      { key: 'temperature', field: validatedState.temperature, weight: 20 },
      { key: 'humidity', field: validatedState.humidity, weight: 15 },
      { key: 'windSpeed', field: validatedState.windSpeed, weight: 10 },
      { key: 'rainfall24h', field: validatedState.rainfall24h, weight: 15 },
      { key: 'aqiIndex', field: validatedState.aqiIndex, weight: 15 },
      { key: 'uvIndex', field: validatedState.uvIndex, weight: 10 },
      { key: 'soilMoisture', field: validatedState.soilMoisture, weight: 5 },
      { key: 'visibilityKm', field: validatedState.visibilityKm, weight: 5 },
      { key: 'pressureMb', field: validatedState.pressureMb, weight: 5 }
    ];

    let completenessPoints = 0;
    let validCount = 0;

    criticalFields.forEach(cf => {
      if (cf.field.status === 'valid' && cf.field.value !== null) {
        completenessPoints += cf.weight;
        validCount++;
      }
    });

    const completenessPct = Math.round((completenessPoints / 100) * 100);

    // 4. Freshness Scoring (Max 40 points)
    let freshnessScore = 40;
    if (freshness === 'Fresh') freshnessScore = 40;
    else if (freshness === 'Recent') freshnessScore = 32;
    else if (freshness === 'Stale') freshnessScore = 18;
    else if (freshness === 'Very Stale') freshnessScore = 5;
    else freshnessScore = 0;

    // 5. Source Reliability Scoring (Max 30 points)
    let sourceScore = 30;
    if (sourceTier === 'live_api') sourceScore = 30;
    else if (sourceTier === 'sensor') sourceScore = 25;
    else if (sourceTier === 'cached') {
      sourceScore = freshness === 'Fresh' || freshness === 'Recent' ? 24 : 12;
    } else {
      sourceScore = 8; // fallback
    }

    // 6. Completeness Scoring (Max 30 points)
    const completenessScore = Math.round((completenessPoints / 100) * 30);

    // 7. Anomalies & Invalid Field Penalties
    let anomalyPenalty = 0;
    const anomalyDescriptions: string[] = [];

    // Penalty for invalid out-of-range/corrupt fields
    if (validatedState.invalidCount > 0) {
      const invalidPenalty = validatedState.invalidCount * 20;
      anomalyPenalty += invalidPenalty;
      anomalyDescriptions.push(`${validatedState.invalidCount} corrupt/invalid field(s) detected`);
    }

    // Conflict: High temp + Freezing frost alert
    if (validatedState.temperature.value !== null && validatedState.temperature.value > 25 && validatedState.isFrostAlert.value) {
      anomalyPenalty += 15;
      anomalyDescriptions.push('Conflicting frost alert with elevated temperature');
    }

    // Conflict: 100% rain probability with 0% cloud cover
    if (validatedState.rainProbability.value !== null && validatedState.rainProbability.value > 80 && 
        validatedState.cloudCover.value !== null && validatedState.cloudCover.value < 10) {
      anomalyPenalty += 10;
      anomalyDescriptions.push('High precipitation probability under cloudless sky');
    }

    // Total Score (0-100)
    const rawTotalScore = Math.max(0, completenessScore + freshnessScore + sourceScore - anomalyPenalty);
    const overallScorePct = Math.min(100, rawTotalScore);

    // 8. Quality & Confidence Mapping
    let dataQuality: QualityScore;
    let confidence: ConfidenceLevel;

    if (completenessPct < 30 || validatedState.invalidCount >= 3 || overallScorePct < 25) {
      dataQuality = 'unreliable';
      confidence = 'low';
    } else if (completenessPct < 50 || validatedState.invalidCount >= 1 || overallScorePct < 50 || freshness === 'Very Stale' || freshness === 'Unavailable') {
      dataQuality = 'poor';
      confidence = 'low';
    } else if (overallScorePct < 80 || freshness === 'Stale') {
      dataQuality = 'fair';
      confidence = 'medium';
    } else {
      dataQuality = 'good';
      confidence = 'high';
    }

    // Build field-level freshness dictionary
    const fieldFreshness: Record<string, FreshnessItem> = {
      temperature: this.toFreshnessItem(validatedState.temperature, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      humidity: this.toFreshnessItem(validatedState.humidity, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      windSpeed: this.toFreshnessItem(validatedState.windSpeed, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      rainfall24h: this.toFreshnessItem(validatedState.rainfall24h, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      uvIndex: this.toFreshnessItem(validatedState.uvIndex, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      aqiIndex: this.toFreshnessItem(validatedState.aqiIndex, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      soilMoisture: this.toFreshnessItem(validatedState.soilMoisture, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      visibilityKm: this.toFreshnessItem(validatedState.visibilityKm, validatedState.source, effectiveTimestamp, ageMinutes, freshness),
      pressureMb: this.toFreshnessItem(validatedState.pressureMb, validatedState.source, effectiveTimestamp, ageMinutes, freshness)
    };

    // Explainability Summary
    const explainabilitySummary = `Data Quality: ${dataQuality.toUpperCase()} (${confidence.toUpperCase()} confidence) | Freshness: ${freshness} (${ageMinutes < 1 ? '<1 min' : `${ageMinutes}m`} ago) | Source: ${sourceTier.toUpperCase()} | Completeness: ${completenessPct}% (${validCount}/${criticalFields.length} metrics verified)`;

    return {
      dataQuality,
      confidence,
      freshness,
      overallScorePct,
      ageMinutes,
      sourceTier,
      completenessPct,
      validFieldsCount: validCount,
      totalFieldsCount: criticalFields.length,
      factors: {
        completeness: { score: completenessScore, max: 30, desc: `${completenessPct}% critical fields valid` },
        freshness: { score: freshnessScore, max: 40, desc: `${freshness} (${ageMinutes}m old)` },
        sourceReliability: { score: sourceScore, max: 30, desc: `Tier: ${sourceTier}` },
        anomalies: { penalty: anomalyPenalty, desc: anomalyDescriptions.join(', ') || 'No anomalies detected' }
      },
      fieldFreshness,
      explainabilitySummary
    };
  }
}
