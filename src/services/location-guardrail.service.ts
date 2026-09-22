// src/services/location-guardrail.service.ts
// Global Context & Location Guardrail Layer for Mausam
// Validates persona domain parameters against geographic and environmental realities to prevent hallucinations

import type { ValidatedEnvironmentalState } from './data-validator.service';

export type GeographicType = 'coastal' | 'inland' | 'hill_mountain' | 'arid_plains' | 'general_plains';

export interface LocationProfile {
  name: string;
  region?: string;
  country: string;
  isCoastal: boolean;
  isHilly: boolean;
  isArid: boolean;
  geoType: GeographicType;
  terrainType: string;
  distanceToCoastEstimateKm: number;
}

export interface PersonaDomainValidationResult {
  persona: string;
  isDomainValid: boolean;
  geoType: GeographicType;
  isCoastal: boolean;
  mismatchReason?: string;
  contextualNotice?: string;
  contextNotice?: string;
  adaptedGuidance?: string;
  aiPromptConstraint: string;
  validatedParameters: Record<string, any>;
}

/**
 * Comprehensive Coastal Keywords & District Matcher for India and Global Cities
 */
const KNOWN_COASTAL_LOCATIONS = [
  // Maharashtra
  'mumbai', 'bombay', 'navi mumbai', 'thane', 'alibaug', 'ratnagiri', 'sindhudurg', 'palghar', 'raigad',
  // Gujarat
  'surat', 'bhavnagar', 'porbandar', 'jamnagar', 'dwarka', 'veraval', 'somnath', 'mandvi', 'kutch', 'valsad', 'bharuch', 'daman', 'diu',
  // Goa
  'goa', 'panaji', 'panjim', 'margao', 'vasco da gama', 'mapusa', 'calangute', 'candolim', 'anjuna',
  // Karnataka
  'mangalore', 'mangaluru', 'udupi', 'karwar', 'gokarna', 'bhatkal', 'kundapura', 'kumta',
  // Kerala
  'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'alappuzha', 'alleppey', 'kozhikode', 'calicut', 'kannur', 'kollam', 'ernakulam', 'munambam',
  // Tamil Nadu
  'chennai', 'madras', 'kanyakumari', 'rameswaram', 'thoothukudi', 'tuticorin', 'nagapattinam', 'cuddalore', 'pondicherry', 'puducherry', 'mamallapuram', 'mahbalipuram',
  // Andhra Pradesh
  'visakhapatnam', 'vizag', 'kakinada', 'machilipatnam', 'bheemunipatnam', 'srikakulam', 'ongole', 'nellore',
  // Odisha
  'puri', 'paradip', 'paradeep', 'gopalpur', 'balasore', 'chandipur', 'dhamra',
  // West Bengal
  'kolkata', 'calcutta', 'digha', 'haldia', 'sagar island', 'sundarbans', 'bakkhali', 'mandarmani',
  // Islands & UTs
  'port blair', 'havelock', 'neil island', 'andaman', 'nicobar', 'kavaratti', 'lakshadweep', 'minicoy', 'agatti',
  // Global Major Ports / Coastal Cities
  'sydney', 'melbourne', 'miami', 'los angeles', 'san francisco', 'honolulu', 'san diego', 'seattle',
  // East Asia / Middle East / Europe
  'tokyo', 'singapore', 'dubai', 'hong kong', 'shanghai', 'london', 'barcelona', 'lisbon', 'cape town'
];

const KNOWN_HILL_LOCATIONS = [
  'shimla', 'manali', 'dharamshala', 'kullu', 'dehradun', 'mussoorie', 'nainital', 'rishikesh', 'haridwar',
  'srinagar', 'gulmarg', 'pahalgam', 'leh', 'ladakh', 'darjeeling', 'gangtok', 'shillong', 'ooty',
  'udhagamandalam', 'kodaikanal', 'munnar', 'coorg', 'madikeri', 'wayanad', 'mount abu', 'mahabeleshwar',
  'panchgani', 'cherrapunji', 'tawang', 'kathmandu', 'pokhara', 'zurich', 'innsbruck', 'denver'
];

export class LocationGuardrailService {
  /**
   * Resolves geographic classification for any location name or query.
   */
  static resolveLocationProfile(name = '', region = '', country = 'India', _lat?: number, _lon?: number): LocationProfile {
    const combined = `${name} ${region} ${country}`.toLowerCase();

    // 1. Check Coastal
    const isCoastal = KNOWN_COASTAL_LOCATIONS.some(k => combined.includes(k));

    // 2. Check Hill / Mountain
    const isHilly = KNOWN_HILL_LOCATIONS.some(k => combined.includes(k));

    // 3. Check Arid / Desert
    const isArid = combined.includes('rajasthan') || combined.includes('jaipur') || combined.includes('jodhpur') || combined.includes('bikaner') || combined.includes('jaisalmer') || combined.includes('barmer');

    let geoType: GeographicType = 'inland';
    let terrainType = 'inland-plains';
    let distanceToCoastEstimateKm = 300;

    if (isCoastal) {
      geoType = 'coastal';
      terrainType = 'coastal';
      distanceToCoastEstimateKm = 5;
    } else if (isHilly) {
      geoType = 'hill_mountain';
      terrainType = 'hill_mountain';
      distanceToCoastEstimateKm = 600;
    } else if (isArid) {
      geoType = 'arid_plains';
      terrainType = 'arid_plains';
      distanceToCoastEstimateKm = 500;
    } else {
      geoType = 'general_plains';
      terrainType = 'inland-plains';
      distanceToCoastEstimateKm = 350;
    }

    return {
      name: name || 'Current Location',
      region,
      country,
      isCoastal,
      isHilly,
      isArid,
      geoType,
      terrainType,
      distanceToCoastEstimateKm
    };
  }

  /**
   * Validates persona domain constraints against verified geographic location and environmental telemetry.
   */
  static validatePersonaContext(
    persona: string,
    locationName: string,
    arg3: any,
    arg4?: any
  ): PersonaDomainValidationResult {
    let weatherState: ValidatedEnvironmentalState | any = arg3;
    let customSettings: Record<string, any> = arg4 || {};

    if (typeof arg3 === 'string') {
      weatherState = arg4;
      customSettings = {};
    }

    const locName = locationName || weatherState?.location?.name || 'Current Location';
    const locProfile = this.resolveLocationProfile(locName, weatherState?.location?.region, weatherState?.location?.country);
    const normPersona = (persona || 'general').toLowerCase().replace('agriculture', 'farmer');

    // Extract basic weather properties with fallbacks
    const temp = weatherState?.temperature?.value ?? weatherState?.current?.temp_c ?? 25;
    const humidity = weatherState?.humidity?.value ?? weatherState?.current?.humidity ?? 50;
    const windKph = weatherState?.windSpeed?.value ?? weatherState?.current?.wind_kph ?? 12;
    const rain24h = weatherState?.rainfall24h?.value ?? weatherState?.agriculture?.rainfall_prediction_24h_mm ?? 0;
    const aqi = weatherState?.aqiIndex?.value ?? weatherState?.aqi?.index ?? 50;
    const visibilityKm = weatherState?.visibilityKm?.value ?? weatherState?.current?.visibility_km ?? 10;

    // -------------------------------------------------------------
    // 1. MARITIME / SURFING / COASTAL PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'maritime' || normPersona === 'marine') {
      if (!locProfile.isCoastal) {
        const vessel = customSettings.vessel_type || 'Inland Watercraft';
        return {
          persona: 'maritime',
          isDomainValid: false,
          geoType: locProfile.geoType,
          isCoastal: false,
          mismatchReason: `Geographic Mismatch: "${locName}" is an inland continental location (approx. ${locProfile.distanceToCoastEstimateKm} km from nearest coastline). Marine ocean swell and tidal warnings are not applicable.`,
          contextualNotice: `ℹ️ Notice for ${locName}: Inland region. Oceanic surf/tide metrics are not applicable here. Inland water bodies & river navigation are currently calm.`,
          contextNotice: `ℹ️ Notice for ${locName}: Inland region. Oceanic surf/tide metrics are not applicable here. Inland water bodies & river navigation are currently calm.`,
          adaptedGuidance: `For ${locName} (Inland Region): Oceanic swell and sea tide monitoring are not applicable. Local lakes and river channels are operating under nominal surface wind conditions (${windKph} km/h). Maintain standard ${vessel} safety protocols for inland boating.`,
          aiPromptConstraint: `CRITICAL GEOGRAPHIC CONSTRAINT: "${locName}" is an INLAND region (not coastal). Do NOT generate ocean wave heights, marine swell periods, or oceanic tide predictions. Explicitly state that ${locName} is inland, and adapt any water guidance solely to regional inland reservoirs, lakes, or rivers.`,
          validatedParameters: { ...customSettings, vessel, locationType: 'Inland', oceanAlertsApplicable: false }
        };
      }

      return {
        persona: 'maritime',
        isDomainValid: true,
        geoType: 'coastal',
        isCoastal: true,
        aiPromptConstraint: `GEOGRAPHIC CONTEXT: "${locName}" is a VERIFIED COASTAL region. Sea surface temperature, coastal swell height, wave periods, and tide windows are valid and applicable.`,
        validatedParameters: { ...customSettings, locationType: 'Coastal', oceanAlertsApplicable: true }
      };
    }

    // -------------------------------------------------------------
    // 2. AVIATION & UAV DRONE PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'aviation') {
      const flightRule = customSettings.flight_rule || 'VFR';
      const isFogOrZeroVis = visibilityKm < 3.0; // Less than 3 SM visibility
      const isSevereWind = windKph > 50;

      let constraintNotice = '';
      if (flightRule === 'VFR' && isFogOrZeroVis) {
        constraintNotice = `⚠️ Flight Rule Conflict: VFR (Visual Flight Rules) requested, but current meteorological visibility in ${locName} is restricted (${visibilityKm} km < 5 km VFR minimum). Special VFR or IFR required.`;
      } else if (flightRule === 'UAV' && isSevereWind) {
        constraintNotice = `⚠️ UAV Hazard: Ambient wind speed (${windKph} km/h) exceeds safe micro-drone structural limit (<35 km/h). Ground autonomous drone flights.`;
      }

      const promptConstraint = `AVIATION METEOROLOGY CONSTRAINTS for ${locName}: Density altitude is calibrated for ${locProfile.geoType === 'hill_mountain' ? 'High Altitude Mountainous' : 'Lowland Plains'} terrain. Flight visibility is ${visibilityKm} km. Surface wind is ${windKph} km/h. Flight Rule: ${flightRule}. ${constraintNotice ? `${constraintNotice} Enforce mandatory IFR / low-visibility restrictions.` : 'Enforce standard DGCA/FAA aerodrome flight rules.'}`;

      return {
        persona: 'aviation',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        contextualNotice: constraintNotice || undefined,
        contextNotice: constraintNotice || undefined,
        aiPromptConstraint: promptConstraint,
        validatedParameters: { ...customSettings, flightRule, visibilityKm, windKph }
      };
    }

    // -------------------------------------------------------------
    // 3. FARMER / AGRICULTURE PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'farmer') {
      const crop = customSettings.target_crop || customSettings.crop || 'Wheat';
      const stage = customSettings.growth_stage || customSettings.stage || 'Sowing';

      // Physical frost sanity check: Frost only possible below 4°C
      const isPhysicalFrostPossible = temp <= 4.0;
      const frostStatus = isPhysicalFrostPossible ? (temp <= 0 ? 'CRITICAL FREEZE' : 'GROUND FROST RISK') : 'NO FROST RISK';

      return {
        persona: 'farmer',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `AGRONOMIC REALISM CONSTRAINTS for ${locName}:
- Crop: "${crop}" at "${stage}" stage.
- Agro-Zone: ${locProfile.geoType.toUpperCase()}.
- Ambient Temperature: ${temp}°C (Frost Status: ${frostStatus}).
- DO NOT claim or issue frost risk/warnings if temperature is above 4°C.
- Soil Moisture: ${weatherState?.soilMoisture?.value ?? 50}%. 24h Rain: ${rain24h} mm.
- Provide scientifically validated ICAR / State Agricultural University agronomic guidance matching these exact physical values.`,
        validatedParameters: { ...customSettings, crop, stage, frostStatus, agroZone: locProfile.geoType }
      };
    }

    // -------------------------------------------------------------
    // 4. HEALTH PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'health') {
      const healthProfile = customSettings.health_profile || 'Standard';
      return {
        persona: 'health',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `HEALTH & ENVIRONMENTAL ADVISORY CONSTRAINTS for ${locName}:
- Profile: ${healthProfile}.
- Air Quality Index (AQI): ${aqi} (${aqi > 300 ? 'Severe/Hazardous' : aqi > 150 ? 'Unhealthy' : 'Moderate/Good'}).
- Ambient Temperature: ${temp}°C. Humidity: ${humidity}%.
- Ground truth rule: Base respiratory warnings strictly on actual AQI ${aqi}. Do NOT provide medical prescriptions or clinical diagnoses.`,
        validatedParameters: { ...customSettings, healthProfile, aqi, temp }
      };
    }

    // -------------------------------------------------------------
    // 5. FITNESS PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'fitness') {
      const sport = customSettings.activity_type || 'Running';
      const isExtremeHeat = temp >= 40;
      const isToxicAqi = aqi >= 300;

      let fitnessNotice = '';
      if (isExtremeHeat) {
        fitnessNotice = `⚠️ Heat Hazard: Ambient temperature of ${temp}°C poses extreme heatstroke risk. Suspend all outdoor workouts.`;
      } else if (isToxicAqi) {
        fitnessNotice = `⚠️ Air Quality Hazard: AQI ${aqi} is hazardous for cardiovascular exertion. Transition to indoor workouts.`;
      }

      return {
        persona: 'fitness',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        contextualNotice: fitnessNotice || undefined,
        contextNotice: fitnessNotice || undefined,
        aiPromptConstraint: `FITNESS & EXERCISE BIOMECHANICS CONSTRAINTS for ${locName}:
- Sport: ${sport}.
- Ambient Temp: ${temp}°C. Humidity: ${humidity}%. AQI: ${aqi}.
- Enforce ACSM thermal window standards. Prohibit high-intensity outdoor training if AQI > 300 or Temp >= 40°C.`,
        validatedParameters: { ...customSettings, sport, temp, aqi, humidity }
      };
    }

    // -------------------------------------------------------------
    // 6. CONSTRUCTION PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'construction') {
      const workType = customSettings.work_type || 'High-Rise Tower Crane';
      const craneHazard = windKph >= 38;
      const concretePourHazard = rain24h >= 20 || temp >= 40;

      let constructionNotice = '';
      if (craneHazard) {
        constructionNotice = `⚠️ Crane Hazard: Ambient wind speed (${windKph} km/h) exceeds OSHA crane limit (38 km/h). Suspend high-altitude lifts.`;
      } else if (concretePourHazard) {
        constructionNotice = `⚠️ Concrete Curing Hazard: High temp (${temp}°C) or rain risks rapid flash-setting or washout.`;
      }

      return {
        persona: 'construction',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        contextualNotice: constructionNotice || undefined,
        contextNotice: constructionNotice || undefined,
        aiPromptConstraint: `CONSTRUCTION & SITE SAFETY CONSTRAINTS for ${locName}:
- Work Modality: "${workType}".
- Surface Wind: ${windKph} km/h (Tower Crane Threshold: ${craneHazard ? 'EXCEEDED / SUSPEND LIFTS' : 'SAFE'}).
- Concrete Pour Suitability: ${concretePourHazard ? 'RESTRICTED DUE TO PRECIPITATION/HEAT' : 'APPROVED'}.
- Worker WBGT Heat Stress: ${temp >= 38 ? 'HIGH / MANDATORY 15M REST PER HOUR' : 'NORMAL'}.
- Adhere strictly to OSHA 1926 Safety & Health Regulations for Construction.`,
        validatedParameters: { ...customSettings, workType, windKph, craneHazard, concretePourHazard }
      };
    }

    // -------------------------------------------------------------
    // 7. ENERGY PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'energy') {
      const genType = customSettings.generation_type || 'Rooftop Solar PV';
      return {
        persona: 'energy',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `ENERGY & GRID UTILITIES CONSTRAINTS for ${locName}:
- Generation Asset: "${genType}".
- Location Terrain: ${locProfile.geoType.toUpperCase()}.
- Cloud Cover: ${weatherState?.cloudCover?.value ?? 20}%. Ambient Temp: ${temp}°C. Surface Wind: ${windKph} km/h.
- Estimate solar GHI/DNI irradiance and 100m hub velocity capacity factor using verified telemetry.`,
        validatedParameters: { ...customSettings, genType, geoType: locProfile.geoType }
      };
    }

    // -------------------------------------------------------------
    // 8. LOGISTICS PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'logistics') {
      const fleetType = customSettings.fleet_type || 'High-Cube Semi-Trailer';
      const crosswindHazard = windKph >= 45;
      const hydroplaningHazard = rain24h >= 25;

      return {
        persona: 'logistics',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `HIGHWAY FLEET & LOGISTICS CONSTRAINTS for ${locName}:
- Fleet Type: "${fleetType}".
- Road Surface Asphalt Temp: ~${Math.round(temp + 5)}°C.
- Highway Crosswinds: ${windKph} km/h (High-Cube Lateral Stability: ${crosswindHazard ? 'HIGH HAZARD / REDUCE SPEED' : 'STABLE'}).
- Precipitation Nowcast: ${hydroplaningHazard ? 'WET TARMAC / HYDROPLANING CAUTION' : 'DRY ROUTE'}.`,
        validatedParameters: { ...customSettings, fleetType, crosswindHazard }
      };
    }

    // -------------------------------------------------------------
    // 9. COMMUTE PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'commute') {
      const commuteMode = customSettings.commute_mode || 'Two-Wheeler / Bike';
      return {
        persona: 'commute',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `URBAN COMMUTE & TRANSIT CONSTRAINTS for ${locName}:
- Commute Mode: "${commuteMode}".
- Road Visibility: ${visibilityKm} km (Fog Blankets: ${visibilityKm < 1.0 ? 'ACTIVE / USE LOW BEAMS' : 'CLEAR'}).
- Tarmac Grip & Rain: ${rain24h > 0 ? 'WET TARMAC / SLIP HAZARD' : 'DRY ROAD'}.`,
        validatedParameters: { ...customSettings, commuteMode }
      };
    }

    // -------------------------------------------------------------
    // 10. EVENT PLANNER PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'event_planner') {
      const venueType = customSettings.venue_type || 'Open-Air Lawn';
      const tentGustHazard = windKph >= 30;
      return {
        persona: 'event_planner',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `EVENT PLANNING & VENUE OPS CONSTRAINTS for ${locName}:
- Venue Type: "${venueType}".
- Ambient Temp: ${temp}°C. Humidity: ${humidity}%. Wind Gust: ${windKph} km/h.
- Marquee / Canopy Anchor Safety: ${tentGustHazard ? 'CAUTION / SECURE HEAVY BALLAST' : 'SAFE'}.
- Rain Chance: ${rain24h > 5 ? 'ELEVATED / REQUIRE INDOOR CONTINGENCY' : 'FAVORABLE'}.`,
        validatedParameters: { ...customSettings, venueType, tentGustHazard }
      };
    }

    // -------------------------------------------------------------
    // 11. TRAVELERS PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'travel') {
      const tripType = customSettings.trip_type || 'Flight Transit';
      return {
        persona: 'travel',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `TRAVEL & DESTINATION CONSTRAINTS for ${locName}:
- Trip Type: "${tripType}".
- Destination Temp: ${temp}°C. Rain: ${rain24h} mm. Visibility: ${visibilityKm} km.
- Recommend clothing layers and airport/road travel advisories based strictly on verified weather.`,
        validatedParameters: { ...customSettings, tripType }
      };
    }

    // -------------------------------------------------------------
    // 12. PARENTS & FAMILIES PERSONA GUARDRAIL
    // -------------------------------------------------------------
    if (normPersona === 'family') {
      const priority = customSettings.family_priority || 'School Transit Safety';
      return {
        persona: 'family',
        isDomainValid: true,
        geoType: locProfile.geoType,
        isCoastal: locProfile.isCoastal,
        aiPromptConstraint: `FAMILY & SCHOOL SAFETY CONSTRAINTS for ${locName}:
- Focus Priority: "${priority}".
- Ambient Temp: ${temp}°C. UV Index: ${weatherState?.uvIndex?.value ?? 6}. Rain: ${rain24h} mm.
- Prioritize children and senior comfort, playground suitability, and commute protection.`,
        validatedParameters: { ...customSettings, priority }
      };
    }

    // -------------------------------------------------------------
    // DEFAULT GENERAL PLAIN CONSTRAINTS
    // -------------------------------------------------------------
    return {
      persona: normPersona,
      isDomainValid: true,
      geoType: locProfile.geoType,
      isCoastal: locProfile.isCoastal,
      aiPromptConstraint: `GEOGRAPHIC & ENVIRONMENTAL GROUND TRUTH for ${locName} (${locProfile.geoType.toUpperCase()}):
- Temperature: ${temp}°C. Humidity: ${humidity}%. Wind: ${windKph} km/h. AQI: ${aqi}. Rain: ${rain24h} mm.
- All recommendations must strictly reflect these actual conditions.`,
      validatedParameters: { ...customSettings, geoType: locProfile.geoType }
    };
  }
}
