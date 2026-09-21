// src/services/offline-engine.service.ts
// Offline rule-based disaster evaluation engine

export interface DisasterEvaluation {
  isDisasterActive: boolean;
  hazardType: string;
  severity: 'None' | 'Moderate' | 'Severe' | 'Extreme';
  disasterName: string;
  description: string;
  source: string;
  timestamp: string;
  triggerReasons: string[];
  activeProtocols: string[];
}

export class OfflineEngineService {
  static evaluateDisaster(telemetry: {
    temp_c?: number;
    humidity?: number;
    wind_kph?: number;
    wind_gust_kph?: number;
    pressure_mb?: number;
    pressure_delta_3h?: number;
    precip_mm_24h?: number;
    aqi_index?: number;
    conditionText?: string;
    conditionCode?: number;
    apiAlerts?: any[];
    locationName?: string;
  }): DisasterEvaluation {
    const {
      temp_c = 25,
      humidity = 50,
      wind_kph = 10,
      wind_gust_kph = 0,
      pressure_mb = 1012,
      pressure_delta_3h = 0,
      precip_mm_24h = 0,
      aqi_index = 45,
      conditionText = '',
      conditionCode = 1000,
      apiAlerts = [],
      locationName = 'Current Area'
    } = telemetry;

    const reasons: string[] = [];
    let hazard = 'None';
    let severity: 'None' | 'Moderate' | 'Severe' | 'Extreme' = 'None';
    let title = '';
    let desc = '';
    let source = 'Atmospheric Telemetry & IMD Thresholds';

    // 1. Check API official alerts if present
    if (Array.isArray(apiAlerts) && apiAlerts.length > 0) {
      for (const a of apiAlerts) {
        const sev = (a.severity || '').toLowerCase();
        const text = `${a.event || ''} ${a.headline || ''} ${a.desc || ''}`.toLowerCase();
        if (sev === 'severe' || sev === 'extreme' || text.includes('warning') || text.includes('emergency') || text.includes('red alert')) {
          severity = sev === 'extreme' ? 'Extreme' : 'Severe';
          source = a.headline ? `Official Warning: ${a.headline}` : 'IMD / NDMA Disaster Alert';
          if (text.includes('cyclone') || text.includes('depression')) {
            hazard = 'Cyclone';
            title = a.event || 'Severe Cyclonic Storm Alert';
          } else if (text.includes('flood') || text.includes('inundation')) {
            hazard = 'Flash Flood';
            title = a.event || 'Flash Flood Hazard Alert';
          } else if (text.includes('rain') || text.includes('downpour')) {
            hazard = 'Heavy Downpour';
            title = a.event || 'Heavy Torrential Downpour Alert';
          } else {
            hazard = 'Severe Weather';
            title = a.event || 'Severe Weather Alert';
          }
          desc = a.desc || a.instruction || `Official severe meteorological alert active for ${locationName}.`;
          reasons.push(`Official Alert: ${a.event || a.headline} (Severity: ${a.severity})`);
          break;
        }
      }
    }

    // 2. Cyclone / Barometric Pressure drop rule
    const maxWind = Math.max(wind_kph, wind_gust_kph);
    if (pressure_delta_3h <= -3.0) {
      hazard = 'Cyclone';
      severity = 'Extreme';
      title = 'Severe Cyclonic Depression';
      desc = `Rapid atmospheric pressure drop detected (3h delta: ${pressure_delta_3h.toFixed(1)} hPa). Move away from coastal and weak structures immediately.`;
      reasons.push(`Barometer Cyclone Alert: Rapid 3h drop > 3.0 hPa`);
    } else if (pressure_mb < 960 && maxWind > 65 && hazard === 'None') {
      hazard = 'Cyclone';
      severity = 'Extreme';
      title = 'Deep Cyclonic Storm';
      desc = `Severe low pressure (${pressure_mb} hPa) and violent winds (${maxWind} km/h) indicating active cyclone storm.`;
      reasons.push(`Deep Cyclone: Barometer ${pressure_mb} hPa with gale winds > 65 km/h`);
    }

    // 3. High Wind Shear / Gale rule (>60 km/h)
    if (maxWind > 60 && (hazard === 'None' || severity !== 'Extreme')) {
      hazard = 'High Wind Shear';
      severity = maxWind >= 80 ? 'Extreme' : 'Severe';
      title = maxWind >= 80 ? 'Violent Gale & Windstorm' : 'High Wind Shear Hazard';
      desc = `Dangerous wind velocity of ${maxWind.toFixed(1)} km/h detected (> 60 km/h threshold). Severe hazard for cranes, high-rise scaffolds, and transport.`;
      reasons.push(`High Wind Velocity: ${maxWind.toFixed(1)} km/h (> 60 km/h critical threshold)`);
    }

    // 4. Flash Flood / Inundation (>40mm / 24h)
    const isThunder = [1276, 1282, 1246].includes(conditionCode);
    const condLower = conditionText.toLowerCase();
    const hasFloodWords = condLower.includes('cyclone') || condLower.includes('torrential') || condLower.includes('cloudburst') || condLower.includes('flash flood');

    if ((precip_mm_24h >= 45 || (precip_mm_24h >= 30 && isThunder) || hasFloodWords) && (hazard === 'None' || severity !== 'Extreme')) {
      hazard = precip_mm_24h >= 65 || hasFloodWords ? 'Flash Flood' : 'Heavy Downpour';
      severity = precip_mm_24h >= 65 ? 'Extreme' : 'Severe';
      title = precip_mm_24h >= 65 ? 'Flash Flood & Inundation Emergency' : 'Torrential Heavy Downpour Alert';
      desc = `Heavy precipitation of ${precip_mm_24h} mm forecast. Inundation of causeways, agricultural basins, and urban underpasses imminent.`;
      reasons.push(`Rainfall Hazard: ${precip_mm_24h} mm 24h accumulation (> 40mm threshold)`);
    }

    // 5. Severe Toxic Smog (AQI > 400)
    if (aqi_index > 400 && hazard === 'None') {
      hazard = 'Severe AQI Hazard';
      severity = 'Extreme';
      title = 'Hazardous Toxic Smog Emergency';
      desc = `Air Quality Index has reached hazardous levels (${aqi_index} AQI > 400). Immediate severe respiratory hazard for all populations.`;
      reasons.push(`Severe Air Hazard: AQI ${aqi_index} (> 400 Severe/Hazardous threshold)`);
    }

    // 6. Extreme Heatwave (>44°C or >38°C with >70% humidity)
    if ((temp_c >= 42 || (temp_c >= 38 && humidity >= 70)) && hazard === 'None') {
      hazard = 'Extreme Heatwave';
      severity = temp_c >= 44 ? 'Extreme' : 'Severe';
      title = 'Critical Heatwave & WBGT Thermal Stress';
      desc = `Extreme ambient thermal stress detected (${temp_c}°C, Humidity: ${humidity}%). High danger of heatstroke and cardiovascular stress.`;
      reasons.push(`Heatwave Alert: ${temp_c}°C with ${humidity}% humidity (WBGT Extreme Stress)`);
    }

    const isDisasterActive = severity === 'Severe' || severity === 'Extreme';
    const activeProtocols = isDisasterActive ? [
      'One-Touch Emergency Speed Dial (112, 1078, NDRF)',
      'Dynamic Profile-Specific Crisis Action Plan',
      'Zero-Cellular BLE P2P SOS Mesh Beacon',
      'Offline Directional Shelter Compass Cards',
      'Offline Emergency Go-Bag & Survival Manuals'
    ] : [];

    return {
      isDisasterActive,
      hazardType: hazard,
      severity,
      disasterName: title || 'No Active Disaster Alerts',
      description: desc || `Atmospheric and meteorological metrics are currently within nominal safety limits for ${locationName}.`,
      source,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      triggerReasons: reasons,
      activeProtocols
    };
  }
}
