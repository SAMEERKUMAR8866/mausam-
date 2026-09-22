// src/services/ai-response-validator.service.ts
// Schema Validation & Sanitization Engine for Gemini AI Responses
// Guarantees zero crashes on malformed LLM outputs and merges with deterministic safety fallbacks

import type { CropActionItem, RiskWarning, FarmerRecommendation } from './ai.service';
import type { DataQualityReport } from './data-quality.service';
import type { SafetyEvaluationResult } from './safety-rules.service';

export interface ValidatedAIResponseMeta {
  data_quality: string;
  confidence: string;
  freshness: string;
  age_minutes: number;
  verified_alerts: Array<{ id: string; title: string; alertLevel: string; hazardType: string }>;
  generated_at: string;
  source: 'gemini' | 'agronomic-engine' | 'deterministic-fallback';
}

export interface EnrichedFarmerRecommendation extends FarmerRecommendation {
  data_quality: string;
  confidence: string;
  freshness: string;
  verified_alerts: any[];
  generated_at: string;
}

export interface EnrichedPersonaAdvisory {
  recommendation: string;
  summary: string;
  data_quality: string;
  confidence: string;
  freshness: string;
  verified_alerts: any[];
  generated_at: string;
  source: 'gemini' | 'deterministic-fallback';
}

export class AIResponseValidatorService {
  /**
   * Sanitizes raw text from LLM by removing markdown fences (```json ... ```)
   * and extracting the first valid JSON block.
   */
  static extractAndSanitizeJson(rawText: string): { success: boolean; data: any; rawCleaned: string } {
    if (!rawText || typeof rawText !== 'string') {
      return { success: false, data: null, rawCleaned: '' };
    }

    let cleaned = rawText.trim();

    // 1. Strip markdown code block wrappers
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    // 2. Direct JSON.parse attempt
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') {
        return { success: true, data: parsed, rawCleaned: cleaned };
      }
    } catch {
      // Continue to regex extractor
    }

    // 3. Fallback: Extract JSON object from within arbitrary text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === 'object') {
          return { success: true, data: parsed, rawCleaned: jsonMatch[0] };
        }
      } catch {}
    }

    return { success: false, data: null, rawCleaned: cleaned };
  }

  /**
   * Validates and repairs a Farmer Recommendation response from Gemini.
   * If any field is missing or invalid, merges safely with deterministic fallback data.
   */
  static validateFarmerResponse(
    rawText: string,
    fallback: FarmerRecommendation,
    qualityReport: DataQualityReport,
    safetyResult: SafetyEvaluationResult
  ): EnrichedFarmerRecommendation {
    const { success, data } = this.extractAndSanitizeJson(rawText);

    const meta: ValidatedAIResponseMeta = {
      data_quality: qualityReport.dataQuality,
      confidence: qualityReport.confidence,
      freshness: qualityReport.freshness,
      age_minutes: qualityReport.ageMinutes,
      verified_alerts: safetyResult.alerts.map(a => ({
        id: a.id,
        title: a.title,
        alertLevel: a.alertLevel,
        hazardType: a.hazardType
      })),
      generated_at: new Date().toISOString(),
      source: success ? 'gemini' : 'agronomic-engine'
    };

    if (!success || !data) {
      console.warn('[AIResponseValidator] Malformed/non-JSON Gemini output for farmer. Using verified agronomic fallback.');
      
      const fallbackWarnings: RiskWarning[] = [...fallback.riskWarnings];
      if (safetyResult.hasActiveAlerts) {
        safetyResult.alerts.forEach(alert => {
          const alreadyPresent = fallbackWarnings.some(w => w.title.toLowerCase().includes(alert.hazardType.toLowerCase()));
          if (!alreadyPresent) {
            fallbackWarnings.unshift({
              title: alert.title,
              severity: alert.severity,
              description: alert.actionRequired
            });
          }
        });
      }

      return {
        ...fallback,
        ...meta,
        riskWarnings: fallbackWarnings,
        source: 'agronomic-engine'
      };
    }

    // 1. Validate Summary
    const summary = typeof data.summary === 'string' && data.summary.trim().length > 10
      ? data.summary.trim()
      : fallback.summary;

    // 2. Validate Weather Advisory
    const weatherAdvisory = typeof data.weatherAdvisory === 'string' && data.weatherAdvisory.trim().length > 10
      ? data.weatherAdvisory.trim()
      : fallback.weatherAdvisory;

    // 3. Validate Crop Action Items
    let cropActionItems: CropActionItem[] = [];
    if (Array.isArray(data.cropActionItems) && data.cropActionItems.length > 0) {
      cropActionItems = data.cropActionItems
        .filter((item: any) => item && typeof item === 'object' && typeof item.action === 'string' && item.action.trim().length > 5)
        .map((item: any) => ({
          category: ['Irrigation', 'Fertilization', 'Pest & Disease', 'Field Operations'].includes(item.category)
            ? item.category
            : 'Field Operations',
          icon: typeof item.icon === 'string' && item.icon.length > 0 ? item.icon : '🌾',
          action: String(item.action).trim(),
          priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium'
        }));
    }
    if (cropActionItems.length === 0) {
      cropActionItems = fallback.cropActionItems;
    }

    // 4. Validate Risk Warnings
    let riskWarnings: RiskWarning[] = [];
    if (Array.isArray(data.riskWarnings) && data.riskWarnings.length > 0) {
      riskWarnings = data.riskWarnings
        .filter((w: any) => w && typeof w === 'object' && typeof w.title === 'string' && typeof w.description === 'string')
        .map((w: any) => ({
          title: String(w.title).trim(),
          severity: ['caution', 'warning', 'critical', 'favorable'].includes(w.severity) ? w.severity : 'caution',
          description: String(w.description).trim()
        }));
    }
    if (riskWarnings.length === 0) {
      riskWarnings = fallback.riskWarnings;
    }

    // 5. If there are verified deterministic safety alerts, ensure they are represented in riskWarnings
    if (safetyResult.hasActiveAlerts) {
      safetyResult.alerts.forEach(alert => {
        const alreadyPresent = riskWarnings.some(w => w.title.toLowerCase().includes(alert.hazardType.toLowerCase()));
        if (!alreadyPresent) {
          riskWarnings.unshift({
            title: alert.title,
            severity: alert.severity,
            description: alert.actionRequired
          });
        }
      });
    }

    // 6. Validate Growth Stage Tips
    const growthStageTips = typeof data.growthStageTips === 'string' && data.growthStageTips.trim().length > 10
      ? data.growthStageTips.trim()
      : fallback.growthStageTips;

    return {
      summary,
      weatherAdvisory,
      cropActionItems,
      riskWarnings,
      growthStageTips,
      source: 'gemini',
      data_quality: meta.data_quality,
      confidence: meta.confidence,
      freshness: meta.freshness,
      verified_alerts: meta.verified_alerts,
      generated_at: meta.generated_at
    };
  }

  /**
   * Validates and sanitizes standard Persona Advisory text from Gemini.
   */
  static validatePersonaResponse(
    rawText: string,
    fallback: { recommendation: string; summary: string },
    qualityReport: DataQualityReport,
    safetyResult: SafetyEvaluationResult
  ): EnrichedPersonaAdvisory {
    const meta: ValidatedAIResponseMeta = {
      data_quality: qualityReport.dataQuality,
      confidence: qualityReport.confidence,
      freshness: qualityReport.freshness,
      age_minutes: qualityReport.ageMinutes,
      verified_alerts: safetyResult.alerts.map(a => ({
        id: a.id,
        title: a.title,
        alertLevel: a.alertLevel,
        hazardType: a.hazardType
      })),
      generated_at: new Date().toISOString(),
      source: 'gemini'
    };

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 15) {
      return {
        recommendation: fallback.recommendation,
        summary: fallback.summary,
        ...meta,
        source: 'deterministic-fallback'
      };
    }

    // Check if Gemini returned JSON or plain text
    const { success, data, rawCleaned } = this.extractAndSanitizeJson(rawText);

    let recommendation = '';
    let summary = '';

    if (success && data) {
      recommendation = data.recommendation || data.summary || data.text || rawCleaned;
      summary = data.summary || fallback.summary;
    } else {
      // Plain text response
      recommendation = rawCleaned;
      summary = fallback.summary;
    }

    // If active critical safety alerts, prepend alert warning if not mentioned
    if (safetyResult.hasActiveAlerts && safetyResult.highestAlertLevel === 'Red') {
      const topAlert = safetyResult.alerts[0];
      if (!recommendation.toLowerCase().includes('alert') && !recommendation.toLowerCase().includes(topAlert.hazardType.toLowerCase())) {
        recommendation = `⚠️ [${topAlert.title}]: ${topAlert.actionRequired} — ${recommendation}`;
      }
    }

    return {
      recommendation: recommendation.trim(),
      summary: summary.trim(),
      data_quality: meta.data_quality,
      confidence: meta.confidence,
      freshness: meta.freshness,
      verified_alerts: meta.verified_alerts,
      generated_at: meta.generated_at,
      source: 'gemini'
    };
  }
}
