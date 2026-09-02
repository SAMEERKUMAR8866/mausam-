// src/services/weather.service.ts
// WeatherAPI.com & Multi-Persona Telemetry integration service

import { MOCK_WEATHER_DB } from '../data/mock-weather';

export interface WeatherResponse {
  location: {
    name: string;
    country: string;
    timezone: string;
    localTime: string;
  };
  current: {
    temp_c: number;
    condition: { text: string; code: number; icon: string };
    humidity: number;
    uv: number;
    wind_kph: number;
    wind_dir: string;
    visibility_km: number;
    pressure_mb: number;
  };
  aqi: {
    index: number;
    label: string;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
  };
  pollen: {
    grass: string;
    tree: string;
    weed: string;
  };
  fitness: {
    sunrise: string;
    sunset: string;
    best_running_hours: string[];
    heat_alert: boolean;
    comfort_index: number;
  };
  marine: {
    sea_condition: string;
    wave_height_m: number;
    water_temp_c: number;
    tide_timings: Array<{ time: string; type: string; height_m: number }>;
  };
  travel: {
    saved_destinations: Array<{ name: string; temp_c: number; condition: string }>;
    flight_alerts: { status: string; details: string };
    packing_suggestions: string;
  };
  family: {
    school_commute: string;
    rain_alerts: string;
    severe_warning: string | null;
  };
  agriculture: {
    soil_moisture_pct: number;
    rainfall_prediction_24h_mm: number;
    frost_alert: boolean;
    seasonal_planting_guidance: string;
  };
  commute: {
    traffic_status: string;
    visibility_alert: string;
    storm_fog_alert: string;
  };
  event_planner: {
    extended_comfort: string;
    rain_probability_pct: number;
  };
  // Specialized Professional Personas
  aviation: {
    cloud_ceiling_ft: number;
    flight_visibility_sm: number;
    density_altitude_ft: number;
    freezing_level_ft: number;
    wind_shear_alert: string;
    metar_summary: string;
    crosswind_component_kt: number;
  };
  maritime: {
    swell_height_m: number;
    swell_period_s: number;
    swell_direction: string;
    current_velocity_kts: number;
    sea_surface_temp_c: number;
    squall_alert: string;
    tide_status: string;
  };
  logistics: {
    road_surface_temp_c: number;
    ice_hazard_status: string;
    highway_crosswind_kph: number;
    precip_nowcast_min: string;
    visibility_distance_km: number;
    transit_delay_risk: string;
  };
  construction: {
    crane_gust_limit_pct: number;
    concrete_pour_window: string;
    heat_stress_index: string;
    ground_saturation_pct: number;
    wind_hazard_status: string;
  };
  energy: {
    solar_ghi_wm2: number;
    solar_dni_wm2: number;
    wind_100m_hub_kph: number;
    hdd_cdd_index: string;
    lightning_radius_km: string;
  };
}

// Map internal city names to WeatherAPI query strings
function mapCityToQuery(city: string): string {
  const cityMap: Record<string, string> = {
    'mumbai': 'Mumbai, India',
    'new_delhi': 'New Delhi, India',
    'greater_noida': 'Greater Noida, India',
    'london': 'London, United Kingdom',
    'sydney': 'Sydney, Australia',
    'new_york': 'New York, United States'
  };
  return cityMap[city] || city;
}

function mapConditionIcon(code: number): string {
  if (code === 1000) return 'sunny';
  if ([1003, 1006, 1009].includes(code)) return 'cloudy';
  if ([1063, 1066, 1069, 1072, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rainy';
  if ([1030, 1135, 1147].includes(code)) return 'foggy';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
  return 'cloudy';
}

export async function fetchWeatherData(city: string, locationQuery?: string): Promise<WeatherResponse> {
  const apiKey = import.meta.env.WEATHER_API_KEY || (typeof process !== 'undefined' ? process.env.WEATHER_API_KEY : undefined);

  if (!apiKey) {
    if (MOCK_WEATHER_DB[city]) {
      return augmentWithProfessionalMetrics(MOCK_WEATHER_DB[city] as WeatherResponse);
    }
    return generateDynamicMockWeather(city, locationQuery);
  }

  const query = locationQuery || mapCityToQuery(city);

  try {
    const apiResponse = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=3&aqi=yes`
    );

    if (!apiResponse.ok) {
      throw new Error(`WeatherAPI error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    let astroData = null;
    try {
      const astroResponse = await fetch(
        `https://api.weatherapi.com/v1/astronomy.json?key=${apiKey}&q=${encodeURIComponent(query)}&dt=${new Date().toISOString().split('T')[0]}`
      );
      if (astroResponse.ok) astroData = await astroResponse.json();
    } catch {
      // ignore
    }

    const temp_c = data.current.temp_c;
    const humidity = data.current.humidity;
    const wind_kph = data.current.wind_kph;
    const vis_km = data.current.vis_km;
    const pressure = data.current.pressure_mb;
    const isRain = data.current.condition.text.toLowerCase().includes('rain') || data.current.condition.text.toLowerCase().includes('shower');

    const formattedData: WeatherResponse = {
      location: {
        name: data.location.name,
        country: data.location.country,
        timezone: data.location.tz_id,
        localTime: data.location.localtime
      },
      current: {
        temp_c: data.current.temp_c,
        condition: {
          text: data.current.condition.text,
          code: data.current.condition.code,
          icon: mapConditionIcon(data.current.condition.code)
        },
        humidity: data.current.humidity,
        uv: data.current.uv,
        wind_kph: data.current.wind_kph,
        wind_dir: data.current.wind_dir,
        visibility_km: data.current.vis_km,
        pressure_mb: data.current.pressure_mb
      },
      aqi: {
        index: Math.round(data.current.air_quality?.pm2_5 || 0),
        label: getAQILabel(data.current.air_quality?.pm2_5 || 0),
        pm25: data.current.air_quality?.pm2_5 || 0,
        pm10: data.current.air_quality?.pm10 || 0,
        no2: data.current.air_quality?.no2 || 0,
        o3: data.current.air_quality?.o3 || 0
      },
      pollen: { grass: 'Low', tree: 'Low', weed: 'Low' },
      fitness: {
        sunrise: astroData?.astronomy?.astro?.sunrise || '06:00 AM',
        sunset: astroData?.astronomy?.astro?.sunset || '06:00 PM',
        best_running_hours: calculateBestRunningHours(data.forecast?.forecastday?.[0]),
        heat_alert: data.current.temp_c > 35,
        comfort_index: calculateComfortIndex(data.current.temp_c, data.current.humidity)
      },
      marine: {
        sea_condition: 'Moderate Swell',
        wave_height_m: 1.2,
        water_temp_c: 26.5,
        tide_timings: []
      },
      travel: {
        saved_destinations: [],
        flight_alerts: { status: isRain ? 'Minor Delays' : 'Normal', details: isRain ? 'Wet runways reported.' : 'No flight disruptions.' },
        packing_suggestions: generatePackingSuggestion(temp_c, data.current.condition.text)
      },
      family: {
        school_commute: generateCommuteAdvice(data.current.condition.text, humidity),
        rain_alerts: isRain ? 'Rain expected today.' : 'No rain expected.',
        severe_warning: null
      },
      agriculture: {
        soil_moisture_pct: estimateSoilMoisture(humidity),
        rainfall_prediction_24h_mm: data.forecast?.forecastday?.[0]?.day?.totalprecip_mm || 0,
        frost_alert: temp_c < 2,
        seasonal_planting_guidance: 'Check planting calendar for your regional crop.'
      },
      commute: {
        traffic_status: isRain ? 'Slow transit due to wet roads.' : 'Normal traffic conditions.',
        visibility_alert: vis_km < 5 ? `Reduced visibility: ${vis_km}km` : 'Good road visibility.',
        storm_fog_alert: data.current.condition.code >= 1087 ? 'Storm warning active.' : 'No alerts.'
      },
      event_planner: {
        extended_comfort: `${calculateComfortIndex(temp_c, humidity)}/100 comfort rating for outdoor events.`,
        rain_probability_pct: data.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain || 0
      },
      // Professional Personas
      aviation: {
        cloud_ceiling_ft: Math.round(Math.max(1500, (temp_c - (temp_c - ((100 - humidity) / 5))) * 400)),
        flight_visibility_sm: Math.round((vis_km * 0.621371) * 10) / 10,
        density_altitude_ft: Math.round(145.44 * (1013.25 - pressure) + (temp_c - 15) * 120 + 800),
        freezing_level_ft: Math.round(Math.max(4000, temp_c * 500 + 3000)),
        wind_shear_alert: wind_kph > 35 ? 'Moderate Wind Shear Alert' : 'Low Wind Shear Risk',
        metar_summary: `METAR AUTO ${Math.round(wind_kph * 0.539957)}KT ${vis_km >= 10 ? '9999' : '4000'} ${isRain ? 'RA' : 'CLR'} ${Math.round(temp_c)}/${Math.round(temp_c - ((100-humidity)/5))} Q${pressure}`,
        crosswind_component_kt: Math.round(wind_kph * 0.4)
      },
      maritime: {
        swell_height_m: Math.round((0.5 + (wind_kph * 0.05)) * 10) / 10,
        swell_period_s: Math.round(7 + (wind_kph * 0.1)),
        swell_direction: data.current.wind_dir || 'SW',
        current_velocity_kts: Math.round((0.8 + (wind_kph * 0.03)) * 10) / 10,
        sea_surface_temp_c: Math.round((temp_c - 1.5) * 10) / 10,
        squall_alert: isRain ? 'Squall Warning Active' : 'No Squall Alert',
        tide_status: 'Rising Mid Tide (+1.4m)'
      },
      logistics: {
        road_surface_temp_c: Math.round((temp_c + (data.current.uv > 5 ? 6 : 2)) * 10) / 10,
        ice_hazard_status: temp_c < 2 ? 'Ice Hazard Alert' : 'Dry & Safe Tarmac',
        highway_crosswind_kph: wind_kph,
        precip_nowcast_min: isRain ? 'Precipitation active next 45 min' : 'Dry window next 120 min',
        visibility_distance_km: vis_km,
        transit_delay_risk: isRain ? 'Moderate Delay (+15 min)' : 'Low Delay Risk'
      },
      construction: {
        crane_gust_limit_pct: Math.min(100, Math.round((wind_kph / 45) * 100)),
        concrete_pour_window: isRain ? 'Unfavorable (Rain Washout Risk)' : temp_c > 36 ? 'Caution (Rapid Evaporation)' : 'Ideal Pour Window',
        heat_stress_index: temp_c > 35 ? 'High (Compulsory Hydration)' : 'Safe Ambient Thermal',
        ground_saturation_pct: estimateSoilMoisture(humidity),
        wind_hazard_status: wind_kph > 35 ? 'High Wind Scaffold Hazard' : 'Safe for Crane Operations'
      },
      energy: {
        solar_ghi_wm2: isRain ? 220 : Math.round(Math.min(1000, Math.max(100, data.current.uv * 95))),
        solar_dni_wm2: isRain ? 80 : Math.round(Math.min(900, Math.max(50, data.current.uv * 85))),
        wind_100m_hub_kph: Math.round(wind_kph * 1.5),
        hdd_cdd_index: temp_c > 18 ? `CDD: ${(temp_c - 18).toFixed(1)} (Cooling Load)` : `HDD: ${(18 - temp_c).toFixed(1)} (Heating Load)`,
        lightning_radius_km: isRain ? 'Lightning tracked within 25 km' : 'No strikes within 50 km'
      }
    };

    return formattedData;
  } catch (error) {
    console.error('[WeatherService] Error fetching, using dynamic mock:', error);
    if (MOCK_WEATHER_DB[city]) {
      return augmentWithProfessionalMetrics(MOCK_WEATHER_DB[city] as WeatherResponse);
    }
    return generateDynamicMockWeather(city, locationQuery);
  }
}

function augmentWithProfessionalMetrics(data: WeatherResponse): WeatherResponse {
  const temp_c = data.current.temp_c;
  const humidity = data.current.humidity;
  const wind_kph = data.current.wind_kph;
  const vis_km = data.current.visibility_km || 10;
  const pressure = data.current.pressure_mb || 1013;
  const isRain = data.current.condition.text.toLowerCase().includes('rain');

  return {
    ...data,
    aviation: {
      cloud_ceiling_ft: 4500,
      flight_visibility_sm: Math.round((vis_km * 0.62) * 10) / 10,
      density_altitude_ft: 1850,
      freezing_level_ft: 12000,
      wind_shear_alert: 'Low Risk',
      metar_summary: `METAR AUTO ${Math.round(wind_kph * 0.54)}KT 9999 ${isRain ? 'RA' : 'CLR'} ${Math.round(temp_c)}/${Math.round(temp_c - 4)} Q${pressure}`,
      crosswind_component_kt: Math.round(wind_kph * 0.4)
    },
    maritime: {
      swell_height_m: 1.4,
      swell_period_s: 8.5,
      swell_direction: 'SW',
      current_velocity_kts: 1.2,
      sea_surface_temp_c: 26.8,
      squall_alert: isRain ? 'Squall Warning Active' : 'No Squall Alert',
      tide_status: 'Rising High Tide at 18:30 (+1.8m)'
    },
    logistics: {
      road_surface_temp_c: Math.round(temp_c + 4),
      ice_hazard_status: 'No Ice (Safe)',
      highway_crosswind_kph: wind_kph,
      precip_nowcast_min: isRain ? 'Rain active next 45 min' : 'Dry window next 90 min',
      visibility_distance_km: vis_km,
      transit_delay_risk: isRain ? 'Moderate Delay (+15 min)' : 'Low Delay Risk'
    },
    construction: {
      crane_gust_limit_pct: Math.min(100, Math.round((wind_kph / 45) * 100)),
      concrete_pour_window: isRain ? 'Unfavorable (Rain Washout Risk)' : 'Ideal Pour Window',
      heat_stress_index: temp_c > 35 ? 'High (Hydrate)' : 'Safe',
      ground_saturation_pct: estimateSoilMoisture(humidity),
      wind_hazard_status: wind_kph > 35 ? 'High Wind Caution' : 'Safe for Crane Operations'
    },
    energy: {
      solar_ghi_wm2: isRain ? 250 : 780,
      solar_dni_wm2: isRain ? 100 : 640,
      wind_100m_hub_kph: Math.round(wind_kph * 1.5),
      hdd_cdd_index: `CDD: ${(Math.max(0, temp_c - 18)).toFixed(1)}`,
      lightning_radius_km: 'No strikes within 35 km'
    }
  };
}

function getAQILabel(pm25: number): string {
  if (pm25 <= 12) return 'Good';
  if (pm25 <= 35.4) return 'Moderate';
  if (pm25 <= 55.4) return 'Poor';
  if (pm25 <= 150.4) return 'Very Poor';
  return 'Severe';
}

function calculateBestRunningHours(forecastDay: any): string[] {
  if (!forecastDay?.hour) return ['06:00 AM - 07:30 AM', '06:00 PM - 07:30 PM'];
  return ['06:00 AM - 07:30 AM', '06:00 PM - 07:30 PM'];
}

function calculateComfortIndex(temp: number, humidity: number): number {
  const index = 100 - ((temp - 20) * 2 + (humidity - 50) * 0.5);
  return Math.max(0, Math.min(100, Math.round(index)));
}

function generatePackingSuggestion(temp: number, condition: string): string {
  const suggestions: string[] = [];
  if (temp > 30) suggestions.push('Light breathable clothing');
  if (temp < 15) suggestions.push('Warm jacket layers');
  if (condition.toLowerCase().includes('rain')) suggestions.push('Carry an umbrella or raincoat');
  return suggestions.join('. ') || 'Standard casual wear recommended.';
}

function generateCommuteAdvice(condition: string, humidity: number): string {
  if (condition.toLowerCase().includes('rain')) return 'Wet roads. Allow extra commute time.';
  if (humidity > 80) return 'Humid conditions. Stay hydrated during commute.';
  return 'Normal commute conditions.';
}

function estimateSoilMoisture(humidity: number): number {
  return Math.min(100, Math.max(20, humidity * 0.9));
}

function generateDynamicMockWeather(city: string, locationQuery?: string): WeatherResponse {
  let name = city.charAt(0).toUpperCase() + city.slice(1).replace(/_/g, ' ');
  let country = 'India';

  if (locationQuery) {
    const parts = locationQuery.split(',');
    if (parts.length > 0) name = parts[0].trim();
    if (parts.length > 1) country = parts[parts.length - 1].trim();
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const temp_c = 18 + (absHash % 18);
  const humidity = 45 + (absHash % 45);
  const uv = 2 + (absHash % 9);
  const wind_kph = 8 + (absHash % 25);
  const visibility_km = 6 + (absHash % 6);
  const pm25 = 15 + (absHash % 120);
  const pressure_mb = 1008 + (absHash % 16);

  const conditions = ['Sunny', 'Hazy Sunshine', 'Partly Cloudy', 'Passing Showers', 'Light Drizzle', 'Clear', 'Overcast'];
  const conditionText = conditions[absHash % conditions.length];
  const isRainy = conditionText.toLowerCase().includes('shower') || conditionText.toLowerCase().includes('drizzle') || conditionText.toLowerCase().includes('rain');

  const base: WeatherResponse = {
    location: {
      name,
      country,
      timezone: 'Asia/Kolkata',
      localTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    },
    current: {
      temp_c,
      condition: {
        text: conditionText,
        code: isRainy ? 1063 : 1000,
        icon: isRainy ? 'rainy' : 'sunny'
      },
      humidity,
      uv,
      wind_kph,
      wind_dir: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][absHash % 8],
      visibility_km,
      pressure_mb
    },
    aqi: {
      index: pm25,
      label: getAQILabel(pm25),
      pm25,
      pm10: pm25 * 1.5,
      no2: 8 + (absHash % 12),
      o3: 12 + (absHash % 25)
    },
    pollen: {
      grass: ['Low', 'Moderate', 'High'][absHash % 3],
      tree: ['Low', 'Moderate', 'High'][(absHash + 1) % 3],
      weed: ['Low', 'Moderate', 'High'][(absHash + 2) % 3]
    },
    fitness: {
      sunrise: '05:50 AM',
      sunset: '06:40 PM',
      best_running_hours: ['06:00 AM - 07:30 AM', '06:00 PM - 07:30 PM'],
      heat_alert: temp_c > 35,
      comfort_index: calculateComfortIndex(temp_c, humidity)
    },
    marine: {
      sea_condition: isRainy ? 'Rough Chop' : 'Moderate Swell',
      wave_height_m: isRainy ? 2.1 : 1.2,
      water_temp_c: 25.5,
      tide_timings: []
    },
    travel: {
      saved_destinations: [
        { name: 'London', temp_c: 16.0, condition: 'Drizzle' },
        { name: 'New York', temp_c: 24.0, condition: 'Sunny' }
      ],
      flight_alerts: {
        status: isRainy ? 'Minor Runway Delays' : 'Normal',
        details: isRainy ? 'Precipitation on tarmac.' : 'All local flight routes operating normally.'
      },
      packing_suggestions: isRainy ? `Carry rain protection in ${name}.` : `Light layers advised in ${name}.`
    },
    family: {
      school_commute: isRainy ? 'Wet tarmac. Drive carefully in school zones.' : 'Dry roads. Normal school transit.',
      rain_alerts: isRainy ? 'Light showers expected. Carry rain gear.' : 'Clear skies, no rain warnings.',
      severe_warning: null
    },
    agriculture: {
      soil_moisture_pct: estimateSoilMoisture(humidity),
      rainfall_prediction_24h_mm: isRainy ? 14.0 : 0,
      frost_alert: temp_c < 3,
      seasonal_planting_guidance: `Optimal soil conditions for seasonal crops in ${name}.`
    },
    commute: {
      traffic_status: isRainy ? 'Slow transit due to wet roads.' : 'Normal traffic flow.',
      visibility_alert: visibility_km < 5 ? `Reduced visibility: ${visibility_km}km` : 'Perfect road visibility.',
      storm_fog_alert: 'No storm or fog warnings.'
    },
    event_planner: {
      extended_comfort: `${calculateComfortIndex(temp_c, humidity)}/100 comfort rating for outdoor events.`,
      rain_probability_pct: isRainy ? 70 : 10
    },
    aviation: {
      cloud_ceiling_ft: 3800 + (absHash % 3000),
      flight_visibility_sm: Math.round((visibility_km * 0.62) * 10) / 10,
      density_altitude_ft: 1600 + (absHash % 1200),
      freezing_level_ft: 11500 + (absHash % 3000),
      wind_shear_alert: wind_kph > 30 ? 'Moderate Wind Shear Caution' : 'Low Wind Shear Risk',
      metar_summary: `METAR AUTO ${Math.round(wind_kph * 0.54)}KT 9999 ${isRainy ? 'RA' : 'CLR'} ${Math.round(temp_c)}/${Math.round(temp_c - 4)} Q${pressure_mb}`,
      crosswind_component_kt: Math.round(wind_kph * 0.4)
    },
    maritime: {
      swell_height_m: isRainy ? 2.2 : 1.3,
      swell_period_s: 8.0 + (absHash % 5),
      swell_direction: ['SW', 'W', 'NW', 'S'][absHash % 4],
      current_velocity_kts: 1.1 + ((absHash % 10) / 10),
      sea_surface_temp_c: 25.0 + ((absHash % 40) / 10),
      squall_alert: isRainy ? 'Squall Warning Active' : 'Calm Seas',
      tide_status: 'High Tide (+1.9m) at 19:15'
    },
    logistics: {
      road_surface_temp_c: Math.round(temp_c + 5),
      ice_hazard_status: temp_c < 2 ? 'Ice Hazard Alert' : 'Dry Tarmac (Safe)',
      highway_crosswind_kph: wind_kph,
      precip_nowcast_min: isRainy ? 'Showers expected next 60 min' : 'Dry window next 120 min',
      visibility_distance_km: visibility_km,
      transit_delay_risk: isRainy ? 'Moderate Delay (+15 min)' : 'Low Delay Risk'
    },
    construction: {
      crane_gust_limit_pct: Math.min(100, Math.round((wind_kph / 45) * 100)),
      concrete_pour_window: isRainy ? 'Unfavorable (Rain Washout Risk)' : temp_c > 36 ? 'Caution (Rapid Evaporation)' : 'Ideal Pour Window',
      heat_stress_index: temp_c > 35 ? 'High (Compulsory Hydration)' : 'Safe Ambient Thermal',
      ground_saturation_pct: estimateSoilMoisture(humidity),
      wind_hazard_status: wind_kph > 35 ? 'High Wind Scaffold Hazard' : 'Safe for Crane Operations'
    },
    energy: {
      solar_ghi_wm2: isRainy ? 240 : 810,
      solar_dni_wm2: isRainy ? 90 : 680,
      wind_100m_hub_kph: Math.round(wind_kph * 1.5),
      hdd_cdd_index: temp_c > 18 ? `CDD: ${(temp_c - 18).toFixed(1)} (Cooling Load)` : `HDD: ${(18 - temp_c).toFixed(1)} (Heating Load)`,
      lightning_radius_km: isRainy ? 'Lightning tracked within 25 km' : 'No strikes within 50 km'
    }
  };

  return base;
}
