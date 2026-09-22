// src/services/offline-engine.service.ts
// Offline rule-based disaster & emergency meteorological evaluation engine (IMD / WMO / NDMA standards)

export type AlertLevel = 'Red' | 'Orange' | 'Yellow' | 'None';

export interface DisasterEvaluation {
  isDisasterActive: boolean;
  hazardType: string;
  severity: 'None' | 'Moderate' | 'Severe' | 'Extreme';
  alertLevel: AlertLevel;
  disasterName: string;
  description: string;
  source: string;
  timestamp: string;
  triggerReasons: string[];
  activeProtocols: string[];
}

export interface TelemetryInputs {
  temp_c?: number;
  humidity?: number;
  wind_kph?: number;
  wind_gust_kph?: number;
  pressure_mb?: number;
  pressure_delta_3h?: number;
  precip_mm_24h?: number;
  precip_mm_hourly?: number;
  visibility_km?: number;
  visibility_m?: number;
  aqi_index?: number;
  conditionText?: string;
  conditionCode?: number;
  apiAlerts?: any[];
  locationName?: string;
}

interface HazardCandidate {
  hazardType: string;
  severity: 'Moderate' | 'Severe' | 'Extreme';
  alertLevel: 'Red' | 'Orange' | 'Yellow';
  title: string;
  description: string;
  triggerReason: string;
  protocols: string[];
  priority: number; // 3 = Red (Extreme), 2 = Orange (Severe), 1 = Yellow (Moderate)
}

export class OfflineEngineService {
  static evaluateDisaster(telemetry: TelemetryInputs): DisasterEvaluation {
    const {
      temp_c = 25,
      humidity = 50,
      wind_kph = 10,
      wind_gust_kph = 0,
      pressure_mb = 1012,
      pressure_delta_3h = 0,
      precip_mm_24h = 0,
      precip_mm_hourly = 0,
      visibility_km = 10,
      visibility_m = 10000,
      aqi_index = 45,
      conditionText = '',
      conditionCode = 1000,
      apiAlerts = [],
      locationName = 'Current Area'
    } = telemetry;

    const candidates: HazardCandidate[] = [];
    const source = 'Atmospheric Telemetry & IMD Calibrated Rules';
    const maxWind = Math.max(wind_kph, wind_gust_kph);
    const effectiveVisM = visibility_m < 10000 ? visibility_m : (visibility_km ? visibility_km * 1000 : 10000);

    // -------------------------------------------------------------
    // 1. Official API Alerts (IMD / NDMA / CAP Alerts)
    // -------------------------------------------------------------
    if (Array.isArray(apiAlerts) && apiAlerts.length > 0) {
      for (const a of apiAlerts) {
        const sev = (a.severity || '').toLowerCase();
        const text = `${a.event || ''} ${a.headline || ''} ${a.desc || ''}`.toLowerCase();
        if (sev === 'severe' || sev === 'extreme' || text.includes('warning') || text.includes('emergency') || text.includes('red alert')) {
          const isExtreme = sev === 'extreme' || text.includes('emergency') || text.includes('red alert');
          candidates.push({
            hazardType: text.includes('cyclone') ? 'Cyclone' : text.includes('flood') ? 'Flash Flood' : 'Severe Weather',
            severity: isExtreme ? 'Extreme' : 'Severe',
            alertLevel: isExtreme ? 'Red' : 'Orange',
            title: a.event || a.headline || (isExtreme ? 'Official Critical Weather Red Alert' : 'Official Severe Weather Warning'),
            description: a.desc || a.instruction || `Official meteorological alert active for ${locationName}.`,
            triggerReason: `Official CAP Alert: ${a.event || a.headline || 'Severe Alert'} (Severity: ${a.severity || 'High'})`,
            protocols: [
              'Follow official IMD / NDMA district civil defense broadcast instructions',
              'Keep emergency battery radio and mobile powerbanks fully charged',
              'Avoid outdoor transit and secure essential emergency supplies'
            ],
            priority: isExtreme ? 3 : 2
          });
          break;
        }
      }
    }

    // -------------------------------------------------------------
    // 2. Rainfall & Flood Triggers (Standard Meteorological Thresholds)
    // -------------------------------------------------------------
    const condLower = conditionText.toLowerCase();
    const isThunderOrCloudburst = conditionCode >= 95 || [1276, 1282, 1246].includes(conditionCode) || condLower.includes('cloudburst') || condLower.includes('torrential');

    // Critical Red Alert: Hourly rainfall > 50 mm/h OR 24-hour rainfall > 204.4 mm
    if (precip_mm_hourly > 50 || precip_mm_24h > 204.4 || (precip_mm_hourly > 40 && isThunderOrCloudburst)) {
      const isCloudburst = precip_mm_hourly > 50 || (precip_mm_hourly > 40 && isThunderOrCloudburst);
      candidates.push({
        hazardType: 'Flash Flood',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: isCloudburst ? 'Cloudburst & Flash Flood Emergency (Red Alert)' : 'Heavy Flood & Water Inundation (Red Alert)',
        description: isCloudburst
          ? `Torrential cloudburst rain of ${precip_mm_hourly.toFixed(1)} mm/h detected in ${locationName}. Sudden flash flooding active.`
          : `Extremely heavy 24-hour rain of ${precip_mm_24h.toFixed(1)} mm detected in ${locationName}. Deep waterlogging and flooding active.`,
        triggerReason: isCloudburst
          ? `Cloudburst Rain: ${precip_mm_hourly.toFixed(1)} mm/h`
          : `Heavy 24h Rain: ${precip_mm_24h.toFixed(1)} mm`,
        protocols: [
          'Move immediately away from riverbeds, nullahs, and low-lying areas',
          'Move to higher ground or upper concrete floors',
          'Turn off main electrical breakers and keep appliances unplugged',
          'Never drive or walk through flood waters',
          'Boil drinking water before drinking'
        ],
        priority: 3
      });
    }
    // Orange Alert (Severe Rainfall Watch): 24-hour rainfall between 115.6 mm and 204.4 mm
    else if (precip_mm_24h >= 115.6 && precip_mm_24h <= 204.4) {
      candidates.push({
        hazardType: 'Severe Rainfall',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: 'Severe Rainfall Watch (Orange Alert)',
        description: `Very heavy rain of ${precip_mm_24h.toFixed(1)} mm forecast within 24 hours in ${locationName}. High risk of waterlogging on roads and in fields.`,
        triggerReason: `Heavy 24h Rain: ${precip_mm_24h.toFixed(1)} mm`,
        protocols: [
          'Avoid driving through flooded underpasses and waterlogged roads',
          'Open field drains so water flows away from crop roots',
          'Keep emergency lights, torches, and clean drinking water ready',
          'Secure loose outdoor materials and farm equipment'
        ],
        priority: 2
      });
    }
    // Yellow Advisory (Heavy Rain): 24-hour rainfall between 64.5 mm and 115.5 mm
    else if (precip_mm_24h >= 64.5 && precip_mm_24h < 115.6) {
      candidates.push({
        hazardType: 'Heavy Rain',
        severity: 'Moderate',
        alertLevel: 'Yellow',
        title: 'Heavy Rainfall Advisory (Yellow Warning)',
        description: `Heavy rain of ${precip_mm_24h.toFixed(1)} mm expected in 24 hours in ${locationName}. Wet, slippery roads and travel delays probable.`,
        triggerReason: `Rain 24h: ${precip_mm_24h.toFixed(1)} mm`,
        protocols: [
          'Carry an umbrella or raincoat and allow extra travel time',
          'Wait until rain stops before spraying fields with medicines or fertilizer',
          'Drive carefully and watch for slippery roads'
        ],
        priority: 1
      });
    }
    // Normal / Moderate (< 64.5 mm in 24h and <= 50 mm/h): Do not trigger disaster alerts.

    // -------------------------------------------------------------
    // 3. High Winds & Cyclone Triggers
    // -------------------------------------------------------------
    // Red Alert: Sustained wind > 65 km/h OR gusts > 85 km/h OR extreme 3h pressure drop <= -15.0 hPa OR deep depression with high winds
    if (wind_kph > 65 || wind_gust_kph > 85 || pressure_delta_3h <= -15.0 || (pressure_mb < 960 && maxWind > 55)) {
      const isPressureTrigger = pressure_delta_3h <= -15.0;
      candidates.push({
        hazardType: 'Cyclone',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: isPressureTrigger ? 'Severe Storm & Cyclone Alert (Red Alert)' : 'Violent Cyclone & Severe Gale Emergency (Red Alert)',
        description: isPressureTrigger
          ? `Extreme rapid atmospheric depression (${pressure_delta_3h.toFixed(1)} hPa in 3h) detected in ${locationName}. Severe cyclonic storm circulation developing rapidly.`
          : `Destructive high winds detected in ${locationName} (Sustained: ${wind_kph.toFixed(1)} km/h, Gusts: ${wind_gust_kph.toFixed(1)} km/h). High danger of structural damage.`,
        triggerReason: isPressureTrigger
          ? `Barometer Plunge: ${pressure_delta_3h.toFixed(1)} hPa in 3h`
          : `Gale Winds: ${wind_kph.toFixed(1)} km/h (Gusts: ${wind_gust_kph.toFixed(1)} km/h)`,
        protocols: [
          'Stay inside strong concrete rooms away from glass windows',
          'Stop all crane lifts, scaffolding, and boat trips immediately',
          'Turn off gas valves and main electrical switches before peak winds'
        ],
        priority: 3
      });
    }
    // Orange Advisory: Sustained wind between 45 km/h and 65 km/h (or gusts 65–85 km/h) OR rapid pressure drop between -6.0 and -15.0 hPa
    else if ((wind_kph >= 45 && wind_kph <= 65) || (wind_gust_kph >= 65 && wind_gust_kph <= 85) || (pressure_delta_3h <= -6.0 && pressure_delta_3h > -15.0)) {
      const isPressureWatch = pressure_delta_3h <= -6.0 && pressure_delta_3h > -15.0;
      candidates.push({
        hazardType: isPressureWatch ? 'Cyclone Watch' : 'High Gale Wind',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: isPressureWatch ? 'Rapid Barometric Drop & Cyclone Watch (Orange Alert)' : 'High Gale Wind & Squall Watch (Orange Alert)',
        description: isPressureWatch
          ? `Significant 3h barometric pressure drop (${pressure_delta_3h.toFixed(1)} hPa) in ${locationName}. Developing low-pressure system under monitoring.`
          : `Strong winds of ${wind_kph.toFixed(1)} km/h (gusts up to ${wind_gust_kph.toFixed(1)} km/h) in ${locationName}. Risk of tin sheets blowing away and branches breaking.`,
        triggerReason: isPressureWatch
          ? `Rapid Barometer Drop: ${pressure_delta_3h.toFixed(1)} hPa in 3h`
          : `High Wind: ${wind_kph.toFixed(1)} km/h`,
        protocols: [
          'Tie down loose tin sheets, solar panels, and farm tools',
          'Do not park cars or tie animals under large tree branches',
          'Drive slowly and carefully on open highways'
        ],
        priority: 2
      });
    }

    // -------------------------------------------------------------
    // 4. Extreme Temperatures (Heatwave & Cold Wave / Freeze)
    // -------------------------------------------------------------
    // Severe Heatwave Red Alert: Temp >= 45°C
    if (temp_c >= 45) {
      candidates.push({
        hazardType: 'Extreme Heatwave',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: 'Severe Heatwave Emergency (Red Alert)',
        description: `Dangerous high temperature of ${temp_c.toFixed(1)}°C in ${locationName}. High danger of severe heatstroke.`,
        triggerReason: `Extreme Heat: ${temp_c.toFixed(1)}°C`,
        protocols: [
          'Stay indoors in cool areas during peak sun hours (11:00 AM – 04:00 PM)',
          'Drink water, lemon water, buttermilk, or ORS frequently',
          'Never leave children, elders, or pets in closed parked vehicles',
          'Keep cattle and farm animals in covered shade with fresh water'
        ],
        priority: 3
      });
    }
    // Heatwave Orange Advisory: Temp 40°C–44.9°C (or WBGT stress >= 38°C with humidity >= 70%)
    else if (temp_c >= 40 || (temp_c >= 38 && humidity >= 70)) {
      candidates.push({
        hazardType: 'Extreme Heatwave',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: 'Heatwave & High Heat Watch (Orange Alert)',
        description: `Hot and humid weather (${temp_c.toFixed(1)}°C, ${humidity}% humidity) in ${locationName}. Risk of heat tiredness and dehydration.`,
        triggerReason: `Heat Stress: ${temp_c.toFixed(1)}°C with ${humidity}% humidity`,
        protocols: [
          'Do heavy outdoor work early in the morning or in the evening',
          'Wear loose, light-colored cotton clothes and a wide sun hat',
          'Drink plenty of water throughout the day'
        ],
        priority: 2
      });
    }

    // Severe Cold / Frost Red Alert: Temp < 0°C
    if (temp_c < 0) {
      candidates.push({
        hazardType: 'Severe Frost & Freeze',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: 'Freezing Cold Emergency (Red Alert)',
        description: `Freezing cold temperature of ${temp_c.toFixed(1)}°C in ${locationName}. Danger of black ice, severe cold stress, and crop damage.`,
        triggerReason: `Freezing Cold: ${temp_c.toFixed(1)}°C`,
        protocols: [
          'Wrap water pipes to prevent freezing and bursting',
          'Cover vegetable crops and young plants with straw or cloth',
          'Keep farm animals in dry, sheltered sheds with straw bedding',
          'Dress in warm woolen layers and avoid prolonged cold exposure'
        ],
        priority: 3
      });
    }
    // Cold Wave Orange Advisory: Temp 0°C–4°C
    else if (temp_c >= 0 && temp_c <= 4) {
      candidates.push({
        hazardType: 'Cold Wave',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: 'Cold Wave & Ground Frost Caution (Orange Alert)',
        description: `Near-freezing temperature of ${temp_c.toFixed(1)}°C in ${locationName}. High risk of frost damage for young crops.`,
        triggerReason: `Cold Wave: ${temp_c.toFixed(1)}°C`,
        protocols: [
          'Give a light evening watering to your fields to keep soil warm against frost',
          'Cover young saplings and nursery beds',
          'Ensure adequate warmth for children and elderly family members'
        ],
        priority: 2
      });
    }

    // -------------------------------------------------------------
    // 5. Visibility / Dense Fog Triggers
    // -------------------------------------------------------------
    // Red Alert: Visibility < 50 meters (< 0.05 km)
    if (effectiveVisM < 50) {
      candidates.push({
        hazardType: 'Dense Fog',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: 'Zero Visibility & Dense Fog Emergency (Red Alert)',
        description: `Zero visibility fog (${effectiveVisM.toFixed(0)} meters in ${locationName}). High risk of highway accidents.`,
        triggerReason: `Zero Visibility: ${effectiveVisM.toFixed(0)}m`,
        protocols: [
          'Turn on low-beam fog headlights and vehicle hazard flashers',
          'Keep extra distance from other cars; do not overtake',
          'Drive slowly under 30 km/h and follow road lines',
          'Expect flight and train delays'
        ],
        priority: 3
      });
    }
    // Orange Advisory: Visibility between 50m and 200m
    else if (effectiveVisM >= 50 && effectiveVisM <= 200) {
      candidates.push({
        hazardType: 'Dense Fog',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: 'Dense Fog Navigation Advisory (Orange Alert)',
        description: `Dense fog with poor visibility (${effectiveVisM.toFixed(0)} meters in ${locationName}). Slow and careful driving needed.`,
        triggerReason: `Dense Fog: ${effectiveVisM.toFixed(0)}m`,
        protocols: [
          'Turn on fog lights and maintain safe following distances',
          'Avoid sudden lane changes and drive at moderate speeds'
        ],
        priority: 2
      });
    }

    // -------------------------------------------------------------
    // 6. Air Quality Index (AQI) Triggers
    // -------------------------------------------------------------
    // Red Emergency: AQI > 400 (Hazardous / Severe+)
    if (aqi_index > 400) {
      candidates.push({
        hazardType: 'Hazardous Air Quality',
        severity: 'Extreme',
        alertLevel: 'Red',
        title: 'Hazardous Toxic Smog Emergency (Red Alert)',
        description: `Air quality has reached dangerous smog levels (${aqi_index} AQI in ${locationName}). Harmful to breathe for everyone.`,
        triggerReason: `Toxic Smog: AQI ${aqi_index}`,
        protocols: [
          'Wear a certified N95 mask whenever stepping outside',
          'Keep windows and doors closed to keep smog outside',
          'Avoid outdoor jogging, cycling, and heavy physical work',
          'Keep asthma inhalers and breathing medicines ready'
        ],
        priority: 3
      });
    }
    // Orange Advisory: AQI 301–400 (Very Poor / Severe)
    else if (aqi_index >= 301 && aqi_index <= 400) {
      candidates.push({
        hazardType: 'Severe Air Quality',
        severity: 'Severe',
        alertLevel: 'Orange',
        title: 'Poor Air Quality Advisory (Orange Alert)',
        description: `Poor smoggy air (${aqi_index} AQI in ${locationName}). Can cause coughing and breathing discomfort for children and seniors.`,
        triggerReason: `Poor Air Quality: AQI ${aqi_index}`,
        protocols: [
          'Wear a face mask outdoors during morning smog hours',
          'Do not burn dry leaves, garbage, or crop stubble',
          'Children and elderly should limit outdoor playtime and walks'
        ],
        priority: 2
      });
    }

    // -------------------------------------------------------------
    // 7. Multi-Hazard Priority Resolution & Output Synthesis
    // -------------------------------------------------------------
    // Sort candidates by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);

    const activeCandidate = candidates[0];

    if (!activeCandidate) {
      return {
        isDisasterActive: false,
        hazardType: 'None',
        severity: 'None',
        alertLevel: 'None',
        disasterName: 'No Active Disaster Alerts',
        description: `Atmospheric metrics and precipitation levels are currently within nominal safety limits for ${locationName}.`,
        source,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        triggerReasons: [],
        activeProtocols: []
      };
    }

    // Aggregate trigger reasons from all active candidates (de-duplicated)
    const allReasons = Array.from(new Set(candidates.map(c => c.triggerReason)));
    
    // Core emergency protocols
    const baselineProtocols = activeCandidate.priority === 3 ? [
      'One-Touch Emergency Speed Dial (112, 1078, NDRF)',
      'Zero-Cellular BLE P2P SOS Mesh Beacon Broadcast',
      'Offline Directional Shelter Compass Navigation'
    ] : [];

    const activeProtocols = Array.from(new Set([...activeCandidate.protocols, ...baselineProtocols]));

    return {
      isDisasterActive: true,
      hazardType: activeCandidate.hazardType,
      severity: activeCandidate.severity,
      alertLevel: activeCandidate.alertLevel,
      disasterName: activeCandidate.title,
      description: activeCandidate.description,
      source,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      triggerReasons: allReasons,
      activeProtocols
    };
  }
}

