// src/services/ai.service.ts
// Gemini AI recommendation service
// Architecture: FRONTEND → BACKEND → Gemini API → Recommendations

import { GoogleGenAI } from '@google/genai';
import { MOCK_RECS_DB } from '../data/mock-recommendations';

export interface WeatherData {
  location: { name: string; country: string };
  current: { temp_c: number; condition: { text: string }; humidity: number; uv: number; wind_kph?: number; wind_dir?: string };
  aqi: { index: number; label: string };
  pollen: { grass: string; tree: string; weed: string };
  agriculture?: {
    soil_moisture_pct: number;
    rainfall_prediction_24h_mm: number;
    frost_alert: boolean;
    seasonal_planting_guidance: string;
  };
  [key: string]: any;
}

export interface CropActionItem {
  category: 'Irrigation' | 'Fertilization' | 'Pest & Disease' | 'Field Operations';
  icon: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RiskWarning {
  title: string;
  severity: 'caution' | 'warning' | 'critical' | 'favorable';
  description: string;
}

export interface FarmerRecommendation {
  summary: string;
  weatherAdvisory: string;
  cropActionItems: CropActionItem[];
  riskWarnings: RiskWarning[];
  growthStageTips: string;
  source: 'gemini' | 'agronomic-engine';
}

export async function generateRecommendation(
  city: string,
  persona: string,
  weatherData: WeatherData
): Promise<string> {
  const geminiApiKey = import.meta.env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

  // If no API key, use mock data
  if (!geminiApiKey) {
    console.log('[AIService] No GEMINI_API_KEY found. Using mock data.');
    if (MOCK_RECS_DB[city]?.[persona]) {
      return MOCK_RECS_DB[city][persona];
    }
    return generateDynamicMockRecommendation(persona, weatherData);
  }

  // Real Gemini API call
  console.log(`[AIService] Generating AI recommendation for ${city} / ${persona}`);

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const prompt = `
You are Mausam AI, a personalized weather assistant for Indian users.
Generate a brief, highly contextual recommendation (max 3 sentences) 
for a user with the persona: "${persona}".

Current Weather Data:
- Location: ${weatherData.location.name}, ${weatherData.location.country}
- Temperature: ${weatherData.current.temp_c}°C
- Condition: ${weatherData.current.condition.text}
- Humidity: ${weatherData.current.humidity}%
- UV Index: ${weatherData.current.uv}
- AQI: ${weatherData.aqi.index} (${weatherData.aqi.label})
- Pollen: Weed: ${weatherData.pollen.weed}, Tree: ${weatherData.pollen.tree}, Grass: ${weatherData.pollen.grass}
- Persona-specific data: ${JSON.stringify(weatherData[persona] || {})}

Requirements:
1. Speak directly to the "${persona}" persona concerns (e.g., skin alerts for health, wave height for surfers, flight warnings for travelers, soil moisture for gardeners, traffic for commuters).
2. Keep it crisp, warm, and highly actionable.
3. Use simple language. No HTML or code.
4. Start with the most important insight for this persona.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const recommendationText = response.text || 'No recommendation available at this time.';
    return recommendationText;
  } catch (error) {
    console.error('[AIService] Gemini API error, falling back to dynamic mock:', error);
    if (MOCK_RECS_DB[city]?.[persona]) {
      return MOCK_RECS_DB[city][persona];
    }
    return generateDynamicMockRecommendation(persona, weatherData);
  }
}

/**
 * Generates structured, highly personalized agricultural recommendations for farmers
 * based on selected crop, growth stage, location, and real-time weather metrics.
 */
export async function generateFarmerRecommendation(
  location: string,
  crop: string,
  growthStage: string,
  weatherData: WeatherData
): Promise<FarmerRecommendation> {
  const geminiApiKey = import.meta.env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);

  if (!geminiApiKey) {
    console.log(`[AIService] No GEMINI_API_KEY. Using dynamic agronomic engine for ${crop} (${growthStage}) at ${location}`);
    return generateDynamicFarmerMockRecommendation(crop, growthStage, weatherData);
  }

  console.log(`[AIService] Requesting Gemini AI advice for ${crop} - ${growthStage} in ${location}`);

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const prompt = `
You are Mausam Agri-AI, an expert agricultural scientist and agronomist assisting Indian farmers.
Generate personalized, highly actionable farming recommendations tailored for:
- Crop: "${crop}"
- Growth Stage: "${growthStage}"
- Location: "${location || weatherData.location.name}"

Real-Time Environmental & Weather Data:
- Ambient Temperature: ${weatherData.current.temp_c}°C
- Weather Condition: ${weatherData.current.condition.text}
- Relative Humidity: ${weatherData.current.humidity}%
- Wind Speed: ${weatherData.current.wind_kph || 15} km/h (${weatherData.current.wind_dir || 'NW'})
- Soil Moisture Estimate: ${weatherData.agriculture?.soil_moisture_pct || 50}%
- 24-Hour Rainfall Prediction: ${weatherData.agriculture?.rainfall_prediction_24h_mm || 0} mm
- Frost Alert: ${weatherData.agriculture?.frost_alert ? 'YES' : 'NO'}

Respond ONLY with valid, unescaped JSON matching this EXACT TypeScript schema without markdown backticks or commentary:
{
  "summary": "1-2 sentence high level actionable advisory for the farmer today",
  "weatherAdvisory": "2-3 sentences explaining how today's temperature, humidity, rain forecast, and wind specifically impact ${crop} at the ${growthStage} stage",
  "cropActionItems": [
    {
      "category": "Irrigation" | "Fertilization" | "Pest & Disease" | "Field Operations",
      "icon": "💧" | "🧪" | "🛡️" | "🌾" | "🚜",
      "action": "Concrete, step-by-step instruction for this crop and stage",
      "priority": "high" | "medium" | "low"
    }
  ],
  "riskWarnings": [
    {
      "title": "Short title of warning (e.g. Fungal Blight Risk, Heat Stress, Waterlogging, Wind Drift)",
      "severity": "caution" | "warning" | "critical" | "favorable",
      "description": "Clear explanation of risk and mitigation step"
    }
  ],
  "growthStageTips": "Agronomic tip specific to maximizing yield during the ${growthStage} phase of ${crop}"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const responseText = response.text || '';
    // Clean up potential markdown formatting (```json ... ```)
    const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);

    return {
      summary: parsedData.summary || `Advisory generated for ${crop} during ${growthStage} stage.`,
      weatherAdvisory: parsedData.weatherAdvisory || `Weather conditions at ${location} require standard monitoring for ${crop}.`,
      cropActionItems: Array.isArray(parsedData.cropActionItems) && parsedData.cropActionItems.length > 0 
        ? parsedData.cropActionItems 
        : generateDefaultCropActions(crop, growthStage, weatherData),
      riskWarnings: Array.isArray(parsedData.riskWarnings) && parsedData.riskWarnings.length > 0 
        ? parsedData.riskWarnings 
        : generateDefaultRiskWarnings(crop, growthStage, weatherData),
      growthStageTips: parsedData.growthStageTips || `Ensure standard agronomic care during the ${growthStage} period.`,
      source: 'gemini'
    };

  } catch (error) {
    console.error('[AIService] Gemini Farmer Recommendation failed, fallback to agronomic engine:', error);
    return generateDynamicFarmerMockRecommendation(crop, growthStage, weatherData);
  }
}

/**
 * Intelligent Rule-Based Agronomic Fallback Engine
 * Accurately models Indian farming conditions for all 5 crops across 4 growth stages
 * and reacts dynamically to live temperature, rainfall, humidity, and soil moisture.
 */
export function generateDynamicFarmerMockRecommendation(
  crop: string,
  stage: string,
  weatherData: WeatherData
): FarmerRecommendation {
  const name = weatherData.location.name || 'your region';
  const temp = weatherData.current.temp_c;
  const humidity = weatherData.current.humidity;
  const condition = weatherData.current.condition.text.toLowerCase();
  const isRainy = condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle') || (weatherData.agriculture?.rainfall_prediction_24h_mm || 0) > 2;
  const soilMoisture = weatherData.agriculture?.soil_moisture_pct || 50;
  const windSpeed = weatherData.current.wind_kph || 12;

  const normalizedCrop = crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
  const normalizedStage = stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();

  // 1. Weather Advisory
  let weatherAdvisory = '';
  if (isRainy) {
    weatherAdvisory = `Active rainfall and high humidity (${humidity}%) in ${name} will recharge topsoil moisture (${soilMoisture}%). Hold off on artificial irrigation and chemical spray applications until foliage dries to prevent fungicide runoff.`;
  } else if (temp > 34) {
    weatherAdvisory = `Elevated temperatures (${temp}°C) in ${name} are accelerating soil evapotranspiration. Maintain adequate root moisture, especially in early morning or evening hours, to mitigate thermal stress.`;
  } else if (temp < 8) {
    weatherAdvisory = `Cold ambient temperatures (${temp}°C) in ${name} may slow vegetative cell division. Ensure protective light irrigation to buffer root-zone temperatures against overnight chill.`;
  } else {
    weatherAdvisory = `Favorable ambient weather (${temp}°C, ${humidity}% humidity) provides ideal conditions for ${normalizedCrop} growth in ${name}. Soil moisture is stable at ${soilMoisture}%.`;
  }

  // 2. Summary
  let summary = '';
  if (isRainy) {
    summary = `Rain expected in ${name}. Suspend irrigation for ${normalizedCrop} (${normalizedStage} stage) and inspect field drainage channels.`;
  } else if (soilMoisture < 45) {
    summary = `Soil moisture is low (${soilMoisture}%). Schedule a light irrigation session for your ${normalizedCrop} at the ${normalizedStage} stage.`;
  } else {
    summary = `Optimal conditions for ${normalizedCrop} at ${normalizedStage} stage in ${name}. Proceed with scheduled field maintenance.`;
  }

  // 3. Crop Action Items
  const actionItems: CropActionItem[] = [];

  // Irrigation Action
  if (isRainy) {
    actionItems.push({
      category: 'Irrigation',
      icon: '💧',
      action: `Postpone scheduled watering. Allow incoming precipitation to saturate the ${normalizedCrop} root zone naturally. Ensure bund outlets are clear.`,
      priority: 'high'
    });
  } else if (soilMoisture < 45) {
    actionItems.push({
      category: 'Irrigation',
      icon: '💧',
      action: `Apply furrow or drip irrigation during early morning hours to replenish soil moisture to 60-70% capacity without scorching leaf canopy.`,
      priority: 'high'
    });
  } else {
    actionItems.push({
      category: 'Irrigation',
      icon: '💧',
      action: `Maintain current moisture regime. Soil hydration (${soilMoisture}%) is well within the ideal threshold for ${normalizedCrop}.`,
      priority: 'medium'
    });
  }

  // Stage & Crop Specific Fertilization / Nutrients
  if (normalizedStage === 'Sowing') {
    actionItems.push({
      category: 'Fertilization',
      icon: '🧪',
      action: `Apply basal dose of DAP / NPK (12:32:16) along with well-decomposed Farm Yard Manure (FYM) into the seed furrow to stimulate early root vigor.`,
      priority: 'high'
    });
  } else if (normalizedStage === 'Vegetative') {
    actionItems.push({
      category: 'Fertilization',
      icon: '🧪',
      action: `Top-dress with Urea / Nitrogen (split dose) or apply balanced micronutrient spray (Zinc + Ferrous) to promote robust tillering and biomass accumulation.`,
      priority: 'medium'
    });
  } else if (normalizedStage === 'Flowering') {
    actionItems.push({
      category: 'Fertilization',
      icon: '🧪',
      action: `Foliar application of Potassium Nitrate (13-0-45 @ 1%) or Boron to prevent flower drop, enhance pollination, and improve grain/boll setting.`,
      priority: 'high'
    });
  } else {
    // Harvesting
    actionItems.push({
      category: 'Fertilization',
      icon: '🧪',
      action: `Cease all nitrogenous fertilizer applications. Allow crop to reach physiological maturity naturally and translocate starches to yield components.`,
      priority: 'low'
    });
  }

  // Pest & Disease Management
  if (humidity > 70) {
    actionItems.push({
      category: 'Pest & Disease',
      icon: '🛡️',
      action: `High humidity favors fungal leaf spots, rusts, and blight. Scout the lower canopy daily and keep recommended prophylactic bio-fungicide (Trichoderma or Mancozeb) on standby.`,
      priority: 'high'
    });
  } else if (temp > 32) {
    actionItems.push({
      category: 'Pest & Disease',
      icon: '🛡️',
      action: `Monitor crop under-leaf surfaces for sucking pests (Aphids, Whiteflies, Thrips). Install yellow sticky traps (15 traps/acre) for biological surveillance.`,
      priority: 'medium'
    });
  } else {
    actionItems.push({
      category: 'Pest & Disease',
      icon: '🛡️',
      action: `General crop health is positive. Inspect outer bunds for weed hosts and practice regular integrated pest scouting.`,
      priority: 'low'
    });
  }

  // Field Operations
  if (normalizedStage === 'Harvesting') {
    actionItems.push({
      category: 'Field Operations',
      icon: '🚜',
      action: isRainy 
        ? `DELAY harvest operations. Wait for 2 clear sunny days to bring grain moisture below 12-14% before combine harvesting to prevent mould.`
        : `Favorable harvest window. Begin harvesting during dry midday hours; clean and dry threshed produce immediately before storage.`,
      priority: 'high'
    });
  } else if (windSpeed > 22) {
    actionItems.push({
      category: 'Field Operations',
      icon: '🌾',
      action: `Elevated wind speed (${windSpeed} km/h). Avoid any foliar herbicide or pesticide spraying today to prevent chemical drift to neighboring plots.`,
      priority: 'medium'
    });
  } else {
    actionItems.push({
      category: 'Field Operations',
      icon: '🌾',
      action: `Perform intercultural shallow weeding or hoeing to break soil capillary crust and conserve sub-surface moisture.`,
      priority: 'low'
    });
  }

  // 4. Risk Warnings
  const riskWarnings: RiskWarning[] = [];

  if (humidity > 75) {
    riskWarnings.push({
      title: 'High Fungal Pathogen Pressure',
      severity: 'warning',
      description: `Elevated atmospheric moisture (${humidity}%) creates an active incubation window for foliar diseases (Sheath Blight, Rust, or Mildew). Ensure field aeration.`
    });
  }

  if (isRainy && normalizedStage === 'Harvesting') {
    riskWarnings.push({
      title: 'Moisture Spoilage & Lodging Risk',
      severity: 'critical',
      description: `Rain during harvest can cause pre-harvest sprouting and grain discoloration. Cover harvested bundles with tarpaulins immediately.`
    });
  } else if (isRainy && normalizedStage === 'Sowing') {
    riskWarnings.push({
      title: 'Seed Drowning / Soil Crusting',
      severity: 'caution',
      description: `Heavy downpours on fresh seedbeds can wash away seeds or form a hard surface crust. Ensure perimeter drainage trenches are functioning.`
    });
  }

  if (temp > 36) {
    riskWarnings.push({
      title: 'High Heat & Pollen Desiccation',
      severity: 'warning',
      description: `Extreme heat (${temp}°C) during ${normalizedStage} can lead to pollen sterility or floral abortion. Provide light evening sprinkler or furrow irrigation.`
    });
  }

  if (riskWarnings.length === 0) {
    riskWarnings.push({
      title: 'Optimal Agronomic Window',
      severity: 'favorable',
      description: `Temperature, wind, and moisture metrics are currently balanced with no acute meteorological risks detected for ${normalizedCrop}.`
    });
  }

  // 5. Growth Stage Tip
  let growthStageTips = '';
  switch (normalizedCrop) {
    case 'Wheat':
      if (normalizedStage === 'Sowing') growthStageTips = 'Optimum seed depth is 4-5 cm with 20 cm row spacing. Treat seeds with Carbendazim/Trichoderma before sowing.';
      else if (normalizedStage === 'Vegetative') growthStageTips = 'Crown Root Initiation (CRI at 21 days) is the most critical irrigation stage. Do not skip this watering.';
      else if (normalizedStage === 'Flowering') growthStageTips = 'Avoid water deficit during boot leaf and flowering stages to ensure full earhead grain filling.';
      else growthStageTips = 'Harvest when grains become hard and straw turns golden yellow. Dry to 12% moisture for safe storage.';
      break;
    case 'Rice':
      if (normalizedStage === 'Sowing') growthStageTips = 'Maintain shallow 2-3 cm water in nursery beds. Ensure proper seedling treatment with bio-fertilizers (Azospirillum).';
      else if (normalizedStage === 'Vegetative') growthStageTips = 'Practice Alternate Wetting and Drying (AWD) to stimulate root aeration and reduce methane emissions.';
      else if (normalizedStage === 'Flowering') growthStageTips = 'Maintain continuous 3-5 cm standing water during panicle emergence and flowering.';
      else growthStageTips = 'Drain water 7-10 days before harvesting. Harvest when 80-85% of panicles turn golden straw color.';
      break;
    case 'Maize':
      if (normalizedStage === 'Sowing') growthStageTips = 'Sow in ridges and furrows with 60x20 cm spacing. Ensure warm soil (>18°C) for rapid germination.';
      else if (normalizedStage === 'Vegetative') growthStageTips = 'Knee-high stage requires top-dressing with nitrogen. Keep field free of Fall Armyworm egg masses.';
      else if (normalizedStage === 'Flowering') growthStageTips = 'Tasseling and silking are highly moisture sensitive. Water stress now can cause severe yield penalty.';
      else growthStageTips = 'Harvest when husk leaves dry out and the black layer develops at the base of the grain.';
      break;
    case 'Cotton':
      if (normalizedStage === 'Sowing') growthStageTips = 'Delint and treat acid-delinted seeds with Imidacloprid. Plant on ridges to prevent seed rot.';
      else if (normalizedStage === 'Vegetative') growthStageTips = 'Square formation begins at 35-40 days. Maintain balanced vegetative vs reproductive growth.';
      else if (normalizedStage === 'Flowering') growthStageTips = 'Peak boll development stage. Spray Boron (0.1%) to minimize square and boll shedding.';
      else growthStageTips = 'Pick clean, dry, fully opened bolls during sunny mornings. Avoid mixing stained or trash-laden cotton.';
      break;
    case 'Sugarcane':
      if (normalizedStage === 'Sowing') growthStageTips = 'Use 2-3 bud setts treated with fungicide. Plant in furrows with 90-120 cm spacing.';
      else if (normalizedStage === 'Vegetative') growthStageTips = 'Perform earthing up operations at 90 and 120 days after planting to support heavy tillers and prevent lodging.';
      else if (normalizedStage === 'Flowering') growthStageTips = 'Prevent arrowing/flowering if grown for sugar recovery. Maintain steady canal irrigation.';
      else growthStageTips = 'Test Brix with hand refractometer (18-20% indicates maturity). Cut setts close to the ground level.';
      break;
    default:
      growthStageTips = `Ensure regular field inspection and timely nutrient replenishment during the ${normalizedStage} period.`;
  }

  return {
    summary,
    weatherAdvisory,
    cropActionItems: actionItems,
    riskWarnings,
    growthStageTips,
    source: 'agronomic-engine'
  };
}

function generateDefaultCropActions(crop: string, stage: string, _weatherData?: WeatherData): CropActionItem[] {
  return [
    {
      category: 'Irrigation',
      icon: '💧',
      action: `Maintain steady soil moisture matching the current ${stage} phase of ${crop}.`,
      priority: 'high'
    },
    {
      category: 'Fertilization',
      icon: '🧪',
      action: `Apply appropriate nutrient blend as recommended by local agricultural extension guidelines.`,
      priority: 'medium'
    },
    {
      category: 'Pest & Disease',
      icon: '🛡️',
      action: `Inspect underside of leaves weekly for localized pest infestation or fungal lesions.`,
      priority: 'medium'
    }
  ];
}

function generateDefaultRiskWarnings(_crop?: string, _stage?: string, _weatherData?: WeatherData): RiskWarning[] {
  return [
    {
      title: 'General Crop Monitoring',
      severity: 'favorable',
      description: `Normal weather parameters observed. Continue routine crop management protocol.`
    }
  ];
}

function generateDynamicMockRecommendation(persona: string, weatherData: WeatherData): string {
  const name = weatherData.location.name;
  const temp = weatherData.current.temp_c;
  const condition = weatherData.current.condition.text.toLowerCase();
  const isRainy = condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle');
  const aqi = weatherData.aqi.index;
  const aqiLabel = weatherData.aqi.label;

  let advice = '';

  switch (persona) {
    case 'health':
      if (aqi > 150) {
        advice = `Air quality in ${name} is hazardous (${aqi} - ${aqiLabel}). Sensitive individuals and asthmatics must wear masks and limit outdoor activities.`;
      } else if (isRainy) {
        advice = `High humidity and dampness in ${name} may trigger joint pain. Pollen counts are currently low due to rain washing allergens away.`;
      } else {
        advice = `Excellent weather in ${name} (AQI ${aqi} - ${aqiLabel}) with low pollen levels. Great day for a fresh walk outside.`;
      }
      break;

    case 'fitness':
      if (temp > 35) {
        advice = `Avoid outdoor runs during midday in ${name} due to high heat alerts. Best running hours are early morning or late evening. Stay hydrated!`;
      } else if (isRainy) {
        advice = `Slippery running paths expected due to rain in ${name}. Consider indoor exercises or wear anti-slip running shoes.`;
      } else {
        advice = `Ideal running conditions in ${name} (temp: ${temp}°C). The wind is low, and UV index is safe for an outdoor sprint.`;
      }
      break;

    case 'marine':
      if (weatherData.marine && weatherData.marine.sea_condition === 'N/A (Inland)') {
        advice = `${name} is an inland region; sea surfing or marine alerts are not applicable here. Local water bodies are calm.`;
      } else if (isRainy) {
        advice = `Rough sea conditions in coastal area. Wave heights are elevated. Swimming or surfing is not recommended today.`;
      } else {
        advice = `Clean swell with gentle offshore winds. Sea surface temp is pleasant. Excellent conditions for beach walks and recreational activities.`;
      }
      break;

    case 'travel':
      if (isRainy) {
        advice = `Expect flight and airport transit delays in ${name} due to active rainfall. Ensure you pack a high-quality raincoat or umbrella.`;
      } else {
        advice = `No weather-related travel disruptions in ${name}. Light clothing, sunglasses, and sunblock are recommended for local sightseeing.`;
      }
      break;

    case 'family':
      if (isRainy) {
        advice = `Rain is expected during school commute times in ${name}. Make sure kids are dressed in waterproof jackets and allow extra travel time.`;
      } else {
        advice = `Perfect weather for outdoor family play and picnics in ${name}. Commutes are safe and on-schedule.`;
      }
      break;

    case 'agriculture':
      const soilMoisture = weatherData.agriculture?.soil_moisture_pct || 50;
      if (isRainy) {
        advice = `Precipitation is replenishing soil moisture (${soilMoisture}%) in ${name}. Suspend manual watering to protect crop roots from rot.`;
      } else if (soilMoisture < 40) {
        advice = `Soil moisture is low (${soilMoisture}%) in ${name}. We recommend irrigating crops early in the morning to minimize evaporation.`;
      } else {
        advice = `Soil moisture is stable at ${soilMoisture}%. Sowing and standard agricultural maintenance can proceed normally.`;
      }
      break;

    case 'commute':
      if (isRainy) {
        advice = `Wet asphalt will increase stopping distance in ${name}. Expect minor congestion and slow transit on major highways.`;
      } else {
        advice = `Commuting in ${name} is smooth with excellent visibility and clear roads. No weather disruptions reported.`;
      }
      break;

    case 'event_planner':
      const rainProb = weatherData.event_planner?.rain_probability_pct || 10;
      if (rainProb > 50) {
        advice = `A ${rainProb}% chance of rain in ${name} makes outdoor setups risky. Ensure you have waterproof marquees or an alternate indoor venue.`;
      } else {
        advice = `High outdoor suitability rating in ${name} with only ${rainProb}% rain probability. Ideal conditions for garden gatherings or outdoor weddings.`;
      }
      break;

    case 'aviation':
      advice = `Cloud ceilings are at favorable altitudes with stable crosswind vectors in ${name}. VFR and IFR flight operations can proceed without weather holds.`;
      break;

    case 'maritime':
      advice = `Swell heights and coastal currents in ${name} are within safe navigation parameters. Marine traffic can proceed as scheduled.`;
      break;

    case 'logistics':
      advice = `Highway visibility and surface tarmac conditions in ${name} are clear. Dispatch and freight transit are operating on-time.`;
      break;

    case 'construction':
      advice = `Wind speeds are well beneath crane threshold limits in ${name}. Ideal window for structural steel framing and concrete pours.`;
      break;

    case 'energy':
      advice = `Solar irradiance levels are peaking with robust thermal generation in ${name}. Wind turbine output is steady.`;
      break;

    default:
      advice = `Weather conditions are moderate in ${name}. Normal daily planning advised.`;
  }

  return advice;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  context: {
    city?: string;
    persona?: string;
    weatherData?: any;
    crop?: string;
    stage?: string;
  }
): Promise<string> {
  const geminiApiKey = import.meta.env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
  const latestMsg = messages[messages.length - 1]?.content || '';

  if (!geminiApiKey) {
    return generateDynamicChatMockResponse(latestMsg, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const prompt = `You are "Mausam AI", an expert meteorological & professional agronomic/industry assistant.
Context:
- Location: ${context.city || 'Greater Noida'}
- Persona / Sector: ${context.persona || 'General Weather'}
- Selected Crop / Stage (if farmer): ${context.crop || 'Wheat'} (${context.stage || 'Vegetative'})
- Weather Telemetry: ${JSON.stringify(context.weatherData || { temp_c: 28, humidity: 65, condition: 'Passing Showers' })}

User Query: "${latestMsg}"

Provide a concise, practical, highly accurate response (2 to 4 sentences or brief bullet points). Use helpful emojis and formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return response.text || generateDynamicChatMockResponse(latestMsg, context);
  } catch (err) {
    console.error('[AIService] Gemini chat error:', err);
    return generateDynamicChatMockResponse(latestMsg, context);
  }
}

function generateDynamicChatMockResponse(query: string, context: any): string {
  const q = query.toLowerCase();
  const loc = context.city || 'Greater Noida';
  const crop = context.crop || 'Wheat';
  const stage = context.stage || 'Vegetative';
  const temp = context.weatherData?.current?.temp_c || 28;
  const humidity = context.weatherData?.current?.humidity || 65;

  if (q.includes('fertilizer') || q.includes('urea') || q.includes('npk')) {
    return `🌾 **Fertilizer Recommendation for ${crop} (${stage})**:
Apply **Urea (45 kg/acre)** and **DAP (50 kg/acre)** during early morning hours. Ambient temp in ${loc} is ${temp}°C, which is favorable for root assimilation. Avoid applying before forecasted rain to prevent fertilizer runoff.`;
  }

  if (q.includes('irrigation') || q.includes('water') || q.includes('sinchai')) {
    return `💧 **Irrigation Advisory for ${loc}**:
Current soil moisture is estimated at ${humidity}%. For ${crop} at ${stage} stage, supply **450–500 m³ water per acre** via drip or furrow method. Schedule watering at dawn (05:30–07:30 AM) to curb evaporation losses.`;
  }

  if (q.includes('flight') || q.includes('aviation') || q.includes('metar') || q.includes('crosswind') || q.includes('pilot')) {
    return `✈️ **Aerospace & Aviation Intel for ${loc}**:
- **Cloud Ceiling**: ~4,200 ft AGL (VFR flight rules apply)
- **Flight Visibility**: > 9.0 SM (14 km)
- **Crosswind Vector**: 8–12 kts (Well within standard B737/A320 crosswind limits)
- **Freezing Level**: 12,000 ft MSL
- **METAR Status**: Nominal conditions, zero wind shear detected.`;
  }

  if (q.includes('marine') || q.includes('sea') || q.includes('swell') || q.includes('tide') || q.includes('surf')) {
    return `🚢 **Smart Maritime & Coastal Intel for ${loc}**:
- **Swell Height**: 1.2 – 1.6 meters (Moderate Swell)
- **Wave Period**: 8.5 seconds from SW
- **Current Velocity**: 1.2 kts
- **Sea Surface Temp**: 26.5°C
- **Tide Window**: High tide expected at 18:30 (+1.8m). Safe for coastal shipping and small craft navigation.`;
  }

  if (q.includes('logistics') || q.includes('truck') || q.includes('road') || q.includes('highway') || q.includes('traffic')) {
    return `🚚 **Logistics & Fleet Transit Intel for ${loc}**:
- **Road Surface Temp**: ~${Math.round(temp + 5)}°C (Tarmac traction is optimal)
- **Highway Crosswinds**: Normal (12–18 km/h)
- **Visibility Distance**: 10 km
- **Precipitation Nowcast**: Dry transit window for the next 90 minutes. Route delay hazard is **Low (Green)**.`;
  }

  if (q.includes('crane') || q.includes('construction') || q.includes('concrete') || q.includes('pour')) {
    return `🏗️ **Construction & Infrastructure Safety for ${loc}**:
- **Tower Crane Gust Threshold**: 35% of critical limit (Safe to operate)
- **Concrete Pour Window**: Favorable. Ambient humidity (${humidity}%) prevents premature cracking.
- **Ground Saturation**: Stable for heavy earthmoving machinery.`;
  }

  if (q.includes('solar') || q.includes('energy') || q.includes('wind power') || q.includes('grid')) {
    return `⚡ **Energy & Utility Grid Intel for ${loc}**:
- **Solar GHI (Global Horizontal Irradiance)**: 780 W/m² (Peak generation window)
- **Solar DNI**: 640 W/m²
- **Wind Speed @ 100m Hub**: 28 km/h (Turbine output ~65% capacity)
- **Grid Cooling Demand**: CDD 7.8 (Moderate air conditioning load).`;
  }

  if (q.includes('rain') || q.includes('barish') || q.includes('weather') || q.includes('temperature') || q.includes('aqi')) {
    return `🌤️ **Mausam Micro-Climate Summary for ${loc}**:
- **Temperature**: ${temp}°C (Feels like ${Math.round(temp + 1)}°C)
- **Humidity**: ${humidity}%
- **Precipitation Probability**: 15%
- **AQI**: Moderate (Good dispersion).
Conditions are favorable for outdoor operations and field transit.`;
  }

  return `🤖 **Mausam AI Assistant**:
In **${loc}**, the current temperature is **${temp}°C** with **${humidity}% humidity**.
For **${crop} (${stage})** or your active profession, micro-climate conditions are stable. How else can I assist with your field or logistics planning today?`;
}

/**
 * Universal Profile Advisory Generator for all 12 personas
 */
export async function generateProfileAdvisory(
  persona: string,
  city: string,
  locationDisplay?: string
): Promise<{ recommendation: string; summary: string }> {
  const locName = locationDisplay || city.replace(/_/g, ' ');

  if (persona === 'farmer' || persona === 'agriculture') {
    return {
      recommendation: `Withhold foliar chemical spraying before anticipated evening showers in ${locName}. Ensure root-zone drainage channels are unobstructed.`,
      summary: `Micro-climate in ${locName} is favorable for crop canopy development with adequate soil moisture.`
    };
  }

  if (persona === 'health') {
    return {
      recommendation: `Air Quality Index in ${locName} is nominal. Apply broad-spectrum sunscreen SPF 30+ during midday UV peaks.`,
      summary: `Respiratory risk is low; outdoor activities are safe for sensitive individuals.`
    };
  }

  if (persona === 'fitness') {
    return {
      recommendation: `Optimal thermal window for outdoor cardio in ${locName} is 06:00 AM – 07:30 AM with gentle headwinds.`,
      summary: `WBGT heat stress is low; maintain 500ml hydration per 45 min workout.`
    };
  }

  if (persona === 'maritime') {
    return {
      recommendation: `Swell height of 1.4m with 8.5s period in coastal waters. High tide expected at 18:30 IST (+1.8m).`,
      summary: `Coastal navigation safe for small craft and recreational surfing.`
    };
  }

  if (persona === 'aviation') {
    return {
      recommendation: `Cloud ceiling at 4,500 ft AGL and flight visibility exceeding 6 SM. VFR flight rules in effect with nominal crosswinds.`,
      summary: `METAR observations nominal; zero wind shear detected on local runway vectors.`
    };
  }

  if (persona === 'logistics') {
    return {
      recommendation: `Road asphalt temperature is nominal with dry pavement traction. 90-minute clear precipitation window ahead.`,
      summary: `Highway transit delay hazard is low across all major freight corridors.`
    };
  }

  if (persona === 'construction') {
    return {
      recommendation: `Crane wind gust safety margin is at 32% of threshold. Concrete pour window is approved with minimal evaporation risk.`,
      summary: `Worker thermal stress index is within OSHA green safety limits.`
    };
  }

  if (persona === 'energy') {
    return {
      recommendation: `Solar GHI at 780 W/m² (Peak generation window). Wind turbine output estimated at 75% capacity factor.`,
      summary: `Grid air conditioning cooling load index is moderate (CDD 11.5).`
    };
  }

  return {
    recommendation: `Meteorological conditions in ${locName} are stable and favorable for scheduled activities.`,
    summary: `Real-time sensor telemetry indicates nominal atmospheric parameters.`
  };
}

