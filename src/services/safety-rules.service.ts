// src/services/safety-rules.service.ts
// Deterministic Meteorological & Environmental Safety Rule Engine for Mausam
// Calibrated with IMD, WMO, NDMA, and OSHA Safety Standards
// Evaluates ground truth alerts deterministically so AI only personalizes rather than invents safety alerts

import type { ValidatedEnvironmentalState } from './data-validator.service';

export type AlertSeverity = 'critical' | 'warning' | 'caution' | 'favorable';
export type AlertLevel = 'Red' | 'Orange' | 'Yellow' | 'None';

export interface VerifiedSafetyAlert {
  id: string;
  title: string;
  hazardType: string;
  severity: AlertSeverity;
  alertLevel: AlertLevel;
  description: string;
  ruleThreshold: string;
  actionRequired: string;
  protocols: string[];
  personaRelevance: string[];
}

export interface SafetyEvaluationResult {
  hasActiveAlerts: boolean;
  highestAlertLevel: AlertLevel;
  alerts: VerifiedSafetyAlert[];
  safetySummary: string;
  evaluatedAt: string;
  ruleCountEvaluated: number;
}

/**
 * Centralized, Configurable Safety Thresholds
 */
export const SAFETY_THRESHOLDS = {
  HEATWAVE: {
    EXTREME_RED_C: 45.0,
    SEVERE_ORANGE_C: 40.0,
    WBGT_HIGH_STRESS_C: 38.0,
    WBGT_HIGH_HUMIDITY_PCT: 70
  },
  COLD_FREEZE: {
    EXTREME_FREEZE_RED_C: 0.0,
    FROST_ORANGE_C: 4.0
  },
  RAINFALL: {
    CLOUDBURST_HOURLY_MM: 50.0,
    EXTREME_24H_RED_MM: 204.4,
    VERY_HEAVY_24H_ORANGE_MM: 115.6,
    HEAVY_24H_YELLOW_MM: 64.5
  },
  WIND: {
    CYCLONE_RED_KPH: 65.0,
    GUST_CYCLONE_RED_KPH: 85.0,
    SQUALL_ORANGE_KPH: 45.0
  },
  AIR_QUALITY: {
    HAZARDOUS_SMOG_RED: 400,
    VERY_POOR_SMOG_ORANGE: 300,
    POOR_YELLOW: 200
  },
  VISIBILITY: {
    ZERO_VIS_RED_KM: 0.05, // 50m
    DENSE_FOG_ORANGE_KM: 0.20 // 200m
  },
  UV: {
    EXTREME_RED: 11.0,
    VERY_HIGH_ORANGE: 8.0,
    HIGH_YELLOW: 6.0
  }
} as const;

export class SafetyRulesService {
  /**
   * Evaluates all deterministic environmental safety rules against a validated state.
   */
  static evaluateSafetyRules(state: ValidatedEnvironmentalState): SafetyEvaluationResult {
    const alerts: VerifiedSafetyAlert[] = [];
    let ruleCount = 0;

    const temp = state.temperature.value;
    const humidity = state.humidity.value ?? 50;
    const wind = state.windSpeed.value ?? 0;
    const gust = state.windGust.value ?? wind;
    const rain24h = state.rainfall24h.value ?? 0;
    const rainHourly = state.rainfallHourly.value ?? 0;
    const aqi = state.aqiIndex.value;
    const uv = state.uvIndex.value;
    const visibility = state.visibilityKm.value;
    const locName = state.location.name || 'your region';

    // -------------------------------------------------------------
    // 1. Extreme Heatwave & Thermal Stress Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (temp !== null && temp >= SAFETY_THRESHOLDS.HEATWAVE.EXTREME_RED_C) {
      alerts.push({
        id: 'heatwave_extreme_red',
        title: 'Severe Heatwave Emergency (Red Alert)',
        hazardType: 'Extreme Heatwave',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Dangerous high temperature of ${temp}°C in ${locName}. High danger of severe heatstroke.`,
        ruleThreshold: `Temp >= ${SAFETY_THRESHOLDS.HEATWAVE.EXTREME_RED_C}°C`,
        actionRequired: 'Stay indoors in cool areas between 11:00 AM and 4:00 PM. Drink plenty of water with salt and lemon or ORS.',
        protocols: [
          'Stay indoors during peak sun hours (11:00 AM to 4:00 PM)',
          'Drink water, lemon water, buttermilk, or ORS frequently',
          'Never leave children, elders, or pets in closed parked vehicles',
          'Keep cattle and farm animals in covered shade with fresh water'
        ],
        personaRelevance: ['health', 'farmer', 'fitness', 'construction', 'family']
      });
    } else if (
      temp !== null &&
      (temp >= SAFETY_THRESHOLDS.HEATWAVE.SEVERE_ORANGE_C ||
        (temp >= SAFETY_THRESHOLDS.HEATWAVE.WBGT_HIGH_STRESS_C && humidity >= SAFETY_THRESHOLDS.HEATWAVE.WBGT_HIGH_HUMIDITY_PCT))
    ) {
      alerts.push({
        id: 'heatwave_severe_orange',
        title: 'Heatwave & High Heat Watch (Orange Alert)',
        hazardType: 'Extreme Heatwave',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Hot and humid weather (${temp}°C with ${humidity}% humidity) in ${locName}. Risk of heat tiredness and dehydration.`,
        ruleThreshold: `Temp >= ${SAFETY_THRESHOLDS.HEATWAVE.SEVERE_ORANGE_C}°C or (Temp >= 38°C + Humidity >= 70%)`,
        actionRequired: 'Do heavy outdoor field work early in the morning or late in the evening. Drink water often.',
        protocols: [
          'Wear loose, light-colored cotton clothes and a wide sun hat',
          'Avoid working under direct sun between 12:00 PM and 3:30 PM',
          'Keep farm animals hydrated with fresh drinking water'
        ],
        personaRelevance: ['health', 'fitness', 'farmer', 'construction']
      });
    }

    // -------------------------------------------------------------
    // 2. Sub-Zero Freeze & Frost Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (temp !== null && temp < SAFETY_THRESHOLDS.COLD_FREEZE.EXTREME_FREEZE_RED_C) {
      alerts.push({
        id: 'frost_freeze_red',
        title: 'Freezing Cold Emergency (Red Alert)',
        hazardType: 'Severe Frost & Freeze',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Freezing cold temperature of ${temp}°C in ${locName}. Risk of frostbite, ice on roads, and crop damage.`,
        ruleThreshold: `Temp < ${SAFETY_THRESHOLDS.COLD_FREEZE.EXTREME_FREEZE_RED_C}°C`,
        actionRequired: 'Wrap water pipes, cover outdoor crops, and shelter farm animals in dry rooms.',
        protocols: [
          'Protect water pipes from freezing and bursting',
          'Cover vegetable crops and saplings with dry straw or cloth',
          'Keep farm animals in dry, sheltered sheds with dry straw bedding'
        ],
        personaRelevance: ['farmer', 'health', 'logistics', 'commute']
      });
    } else if (temp !== null && temp >= 0 && temp <= SAFETY_THRESHOLDS.COLD_FREEZE.FROST_ORANGE_C) {
      alerts.push({
        id: 'frost_ground_orange',
        title: 'Ground Frost & Cold Wave Caution (Orange Alert)',
        hazardType: 'Cold Wave',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Near-freezing temperature of ${temp}°C in ${locName}. High risk of frost damage for young crops.`,
        ruleThreshold: `Temp <= ${SAFETY_THRESHOLDS.COLD_FREEZE.FROST_ORANGE_C}°C`,
        actionRequired: 'Give a light evening watering to your fields to keep the soil warm and protect young plant shoots.',
        protocols: [
          'Give a light evening watering to protect crop roots from frost',
          'Cover young saplings and nursery beds',
          'Dress children and elderly family members in warm woolen layers'
        ],
        personaRelevance: ['farmer', 'health', 'family']
      });
    }

    // -------------------------------------------------------------
    // 3. Deluge, Cloudburst & Heavy Rainfall Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (rainHourly >= SAFETY_THRESHOLDS.RAINFALL.CLOUDBURST_HOURLY_MM || rain24h >= SAFETY_THRESHOLDS.RAINFALL.EXTREME_24H_RED_MM) {
      const isCloudburst = rainHourly >= SAFETY_THRESHOLDS.RAINFALL.CLOUDBURST_HOURLY_MM;
      alerts.push({
        id: 'rainfall_extreme_red',
        title: isCloudburst ? 'Cloudburst & Flash Flood Emergency (Red Alert)' : 'Heavy Flood & Water Inundation (Red Alert)',
        hazardType: 'Flash Flood',
        severity: 'critical',
        alertLevel: 'Red',
        description: isCloudburst
          ? `Torrential cloudburst rain of ${rainHourly} mm/h in ${locName}. Danger of sudden flash flooding.`
          : `Extremely heavy rain of ${rain24h} mm in ${locName}. Risk of deep waterlogging and flooding.`,
        ruleThreshold: isCloudburst ? `Rain Hourly >= 50 mm/h` : `Rain 24h >= 204.4 mm`,
        actionRequired: 'Move away from low-lying areas and rivers immediately. Move to higher ground or upper floors.',
        protocols: [
          'Move immediately to higher ground away from riverbeds and low underpasses',
          'Turn off main electrical switches and keep appliances unplugged',
          'Never walk or drive through moving flood water',
          'Boil drinking water before drinking'
        ],
        personaRelevance: ['farmer', 'commute', 'logistics', 'travel', 'family', 'maritime']
      });
    } else if (rain24h >= SAFETY_THRESHOLDS.RAINFALL.VERY_HEAVY_24H_ORANGE_MM) {
      alerts.push({
        id: 'rainfall_very_heavy_orange',
        title: 'Severe Rainfall & Waterlogging Watch (Orange Alert)',
        hazardType: 'Severe Rainfall',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Very heavy rain of ${rain24h} mm in ${locName}. Risk of waterlogging on roads and in farm fields.`,
        ruleThreshold: `Rain 24h >= 115.6 mm`,
        actionRequired: 'Open field drains so water flows away from crops, and avoid unnecessary highway driving.',
        protocols: [
          'Avoid driving through flooded underpasses and waterlogged roads',
          'Open field drainage furrows to keep water from standing around crop roots',
          'Keep emergency lights, charged phones, and clean drinking water ready'
        ],
        personaRelevance: ['farmer', 'commute', 'logistics', 'construction']
      });
    } else if (rain24h >= SAFETY_THRESHOLDS.RAINFALL.HEAVY_24H_YELLOW_MM) {
      alerts.push({
        id: 'rainfall_heavy_yellow',
        title: 'Heavy Rainfall Advisory (Yellow Warning)',
        hazardType: 'Heavy Rain',
        severity: 'caution',
        alertLevel: 'Yellow',
        description: `Heavy rain of ${rain24h} mm forecast in ${locName}. Wet, slippery roads and minor water puddles.`,
        ruleThreshold: `Rain 24h >= 64.5 mm`,
        actionRequired: 'Carry an umbrella or raincoat, and postpone spraying medicines in fields until rain stops.',
        protocols: [
          'Wait until rain stops before spraying pesticide or spreading urea in fields',
          'Allow extra travel time and drive carefully on wet roads'
        ],
        personaRelevance: ['farmer', 'commute', 'travel', 'event_planner']
      });
    }

    // -------------------------------------------------------------
    // 4. High Gales, Squalls & Cyclone Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (wind >= SAFETY_THRESHOLDS.WIND.CYCLONE_RED_KPH || gust >= SAFETY_THRESHOLDS.WIND.GUST_CYCLONE_RED_KPH) {
      alerts.push({
        id: 'wind_cyclone_red',
        title: 'Destructive Cyclone Gale Emergency (Red Alert)',
        hazardType: 'Cyclone',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Very strong destructive winds (${wind} km/h, gusts up to ${gust} km/h) in ${locName}. High risk of falling trees and roof damage.`,
        ruleThreshold: `Wind >= 65 km/h or Gusts >= 85 km/h`,
        actionRequired: 'Stay inside strong concrete buildings immediately. Stop all outdoor work and boat trips.',
        protocols: [
          'Stay inside strong concrete rooms away from glass windows',
          'Stop all crane lifts, scaffolding, and boat trips immediately',
          'Turn off gas cylinders and main power switches'
        ],
        personaRelevance: ['maritime', 'aviation', 'construction', 'logistics', 'farmer']
      });
    } else if (wind >= SAFETY_THRESHOLDS.WIND.SQUALL_ORANGE_KPH || gust >= 65) {
      alerts.push({
        id: 'wind_squall_orange',
        title: 'High Gale Wind & Squall Watch (Orange Alert)',
        hazardType: 'High Gale Wind',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Strong gusty winds of ${wind} km/h in ${locName}. Risk of tin sheets blowing away and branches breaking.`,
        ruleThreshold: `Wind >= 45 km/h or Gusts >= 65 km/h`,
        actionRequired: 'Tie down loose tin sheets, farm tools, and banners. Drive slowly on highways.',
        protocols: [
          'Tie down loose tin sheets, solar panels, and farm equipment',
          'Do not park cars or tie animals under large tree branches',
          'Drive slowly and carefully on open highways'
        ],
        personaRelevance: ['maritime', 'aviation', 'construction', 'logistics']
      });
    }

    // -------------------------------------------------------------
    // 5. Air Quality (AQI) Smog Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (aqi !== null && aqi >= SAFETY_THRESHOLDS.AIR_QUALITY.HAZARDOUS_SMOG_RED) {
      alerts.push({
        id: 'aqi_hazardous_red',
        title: 'Hazardous Toxic Smog Emergency (Red Alert)',
        hazardType: 'Hazardous Air Quality',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Air quality has reached dangerous smog levels (${aqi} AQI in ${locName}). Breathing this air is harmful to everyone.`,
        ruleThreshold: `AQI >= ${SAFETY_THRESHOLDS.AIR_QUALITY.HAZARDOUS_SMOG_RED}`,
        actionRequired: 'Wear an N95 mask outdoors, keep windows closed, and avoid all outdoor exercise.',
        protocols: [
          'Wear a protective N95 mask whenever stepping outside',
          'Keep windows and doors closed to keep smog outside',
          'Avoid outdoor jogging, cycling, or heavy physical work',
          'Keep asthma inhalers and breathing medicines ready'
        ],
        personaRelevance: ['health', 'fitness', 'family', 'commute']
      });
    } else if (aqi !== null && aqi >= SAFETY_THRESHOLDS.AIR_QUALITY.VERY_POOR_SMOG_ORANGE) {
      alerts.push({
        id: 'aqi_very_poor_orange',
        title: 'Poor Air Quality Watch (Orange Alert)',
        hazardType: 'Severe Air Quality',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Poor smoggy air (${aqi} AQI in ${locName}). Can cause coughing and breathing discomfort for children, seniors, and asthmatics.`,
        ruleThreshold: `AQI >= ${SAFETY_THRESHOLDS.AIR_QUALITY.VERY_POOR_SMOG_ORANGE}`,
        actionRequired: 'Wear a face mask outdoors during morning hours and avoid heavy outdoor workouts.',
        protocols: [
          'Wear a face mask outdoors during morning smog hours',
          'Children and elderly should limit outdoor playtime and walks',
          'Do not burn dry leaves, garbage, or crop stubble'
        ],
        personaRelevance: ['health', 'fitness', 'family']
      });
    }

    // -------------------------------------------------------------
    // 6. Zero Visibility & Dense Fog Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (visibility !== null && visibility <= SAFETY_THRESHOLDS.VISIBILITY.ZERO_VIS_RED_KM) {
      alerts.push({
        id: 'fog_zero_vis_red',
        title: 'Zero Visibility & Dense Fog Emergency (Red Alert)',
        hazardType: 'Dense Fog',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Zero visibility fog (${(visibility * 1000).toFixed(0)} meters in ${locName}). High risk of highway accidents.`,
        ruleThreshold: `Visibility <= 0.05 km (50m)`,
        actionRequired: 'Turn on low-beam fog lights and emergency hazard lights. Slow down below 30 km/h.',
        protocols: [
          'Turn on low-beam fog lights and hazard flashers',
          'Keep extra distance from the vehicle ahead and do not overtake',
          'Expect flight and train delays'
        ],
        personaRelevance: ['commute', 'logistics', 'aviation', 'travel']
      });
    } else if (visibility !== null && visibility <= SAFETY_THRESHOLDS.VISIBILITY.DENSE_FOG_ORANGE_KM) {
      alerts.push({
        id: 'fog_dense_orange',
        title: 'Dense Fog Navigation Advisory (Orange Alert)',
        hazardType: 'Dense Fog',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Dense fog with poor visibility (${(visibility * 1000).toFixed(0)} meters in ${locName}). Slow and careful driving needed.`,
        ruleThreshold: `Visibility <= 0.20 km (200m)`,
        actionRequired: 'Drive with fog lamps on and keep a safe distance from other vehicles.',
        protocols: [
          'Turn on fog lamps and drive at a safe, moderate speed',
          'Check road travel updates before long journeys'
        ],
        personaRelevance: ['commute', 'logistics', 'aviation']
      });
    }

    // -------------------------------------------------------------
    // 7. Ultraviolet Radiation (UV) Rules
    // -------------------------------------------------------------
    ruleCount++;
    if (uv !== null && uv >= SAFETY_THRESHOLDS.UV.EXTREME_RED) {
      alerts.push({
        id: 'uv_extreme_red',
        title: 'Extreme UV Radiation Alert (Red Alert)',
        hazardType: 'Extreme UV Radiation',
        severity: 'critical',
        alertLevel: 'Red',
        description: `Extreme midday sun and UV rays in ${locName}. Bare skin and eyes can burn quickly.`,
        ruleThreshold: `UV >= ${SAFETY_THRESHOLDS.UV.EXTREME_RED}`,
        actionRequired: 'Avoid direct sun in the middle of the day. Wear sunglasses, a sun hat, and apply sunscreen.',
        protocols: [
          'Stay in the shade between 11:30 AM and 3:30 PM',
          'Apply sunscreen on face and arms before going outside',
          'Wear sunglasses and a wide-brim hat or cap'
        ],
        personaRelevance: ['health', 'fitness', 'family', 'travel', 'construction']
      });
    } else if (uv !== null && uv >= SAFETY_THRESHOLDS.UV.VERY_HIGH_ORANGE) {
      alerts.push({
        id: 'uv_very_high_orange',
        title: 'High UV Radiation Watch (Orange Alert)',
        hazardType: 'High UV Radiation',
        severity: 'warning',
        alertLevel: 'Orange',
        description: `Very bright sun and strong UV rays in ${locName}. Risk of sunburn during afternoon hours.`,
        ruleThreshold: `UV >= ${SAFETY_THRESHOLDS.UV.VERY_HIGH_ORANGE}`,
        actionRequired: 'Apply sunscreen and wear sunglasses when spending time outdoors in the afternoon.',
        protocols: [
          'Apply sunscreen before going outdoors',
          'Wear sunglasses and take shade during bright afternoon hours'
        ],
        personaRelevance: ['health', 'fitness', 'family', 'travel']
      });
    }

    // -------------------------------------------------------------
    // Priority Sorting & Output Synthesis
    // -------------------------------------------------------------
    const levelRank: Record<AlertLevel, number> = { Red: 3, Orange: 2, Yellow: 1, None: 0 };
    alerts.sort((a, b) => levelRank[b.alertLevel] - levelRank[a.alertLevel]);

    const highestAlertLevel: AlertLevel = alerts.length > 0 ? alerts[0].alertLevel : 'None';
    const hasActiveAlerts = alerts.length > 0;

    const safetySummary = hasActiveAlerts
      ? `${alerts.length} verified safety alert(s) active. Highest: ${highestAlertLevel.toUpperCase()} (${alerts[0].hazardType}). Immediate protocol compliance recommended.`
      : `All atmospheric and environmental metrics are within nominal safety thresholds in ${locName}.`;

    return {
      hasActiveAlerts,
      highestAlertLevel,
      alerts,
      safetySummary,
      evaluatedAt: new Date().toISOString(),
      ruleCountEvaluated: ruleCount
    };
  }

  /**
   * Generates a concise deterministic safety prompt block to inject into AI context.
   */
  static generateAISafetyContext(safetyResult: SafetyEvaluationResult): string {
    if (!safetyResult.hasActiveAlerts) {
      return `VERIFIED SAFETY RULES: All environmental parameters are nominal (Green / Safe). Zero disaster triggers active.`;
    }

    const alertLines = safetyResult.alerts.map(a => 
      `- [${a.alertLevel.toUpperCase()} ALERT] ${a.hazardType}: ${a.title}. Rule: ${a.ruleThreshold}. Action: ${a.actionRequired}`
    );

    return `VERIFIED SAFETY RULES (DETERMINISTIC GROUND TRUTH - DO NOT OVERRIDE OR INVENT):
Highest Level: ${safetyResult.highestAlertLevel} Alert
Active Alerts:
${alertLines.join('\n')}
Instructions for AI: You MUST acknowledge and prioritize these verified safety alerts. Explain their practical implications for the user's active persona.`;
  }
}
