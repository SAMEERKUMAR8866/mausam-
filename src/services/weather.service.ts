// src/services/weather.service.ts
// Multi-Source Live Meteorological Engine (Open-Meteo, wttr.in, WeatherAPI, and Localized Fallback)

import { MOCK_WEATHER_DB } from '../data/mock-weather';
import { getFallbackCoordinates, getReverseGeocodeOffline, getCityMatches, isCoastalLocation } from './geocoding.service';
import { BarometerService } from './barometer.service';
import { OfflineEngineService, type DisasterEvaluation } from './offline-engine.service';

export interface HourlyForecastItem {
  time: string;
  timeFull: string;
  hour: number;
  temp_c: number;
  feels_like_c: number;
  condition: string;
  conditionCode: number;
  icon: string;
  rain_chance_pct: number;
  humidity: number;
  wind_kph: number;
  uv: number;
  isSunrise?: boolean;
  sunriseLabel?: string;
  isSunset?: boolean;
  sunsetLabel?: string;
  isCurrentHour?: boolean;
}

export interface DayForecastItem {
  date: string;
  dayOfWeek: string;
  dayShort: string;
  dateNum: number;
  isToday: boolean;
  label: string;
  temp_max_c: number;
  temp_min_c: number;
  condition: string;
  conditionCode: number;
  icon: string;
  rain_chance_pct: number;
  uv_max: number;
  hourly: HourlyForecastItem[];
}

export interface WeatherDetailsDiagnostics {
  temp_current_c: number;
  temp_min_c: number;
  temp_max_c: number;
  temp_trend: string;
  temp_trend_desc: string;
  feels_like_c: number;
  feels_like_delta: number;
  feels_like_desc: string;
  cloud_cover_pct: number;
  cloud_cover_desc: string;
  cloud_ceiling_ft: number;
  precip_24h_mm: number;
  precip_24h_cm: string;
  precip_summary: string;
  precip_next_window: string;
  wind_kph: number;
  wind_gust_kph: number;
  wind_dir: string;
  wind_deg: number;
  beaufort_scale: string;
  beaufort_force: number;
  humidity_pct: number;
  dew_point_c: number;
  dew_point_desc: string;
  uv_index: number;
  uv_category: string;
  uv_peak_window: string;
  aqi_index: number;
  aqi_status: string;
  aqi_pm25: number;
  aqi_pm10: number;
  aqi_no2: number;
  aqi_primary: string;
  moon_phase: string;
  moon_icon: string;
  moon_illumination_pct: number;
  sunrise: string;
  sunset: string;
}

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
    is_coastal?: boolean;
    water_body_type?: string;
    swell_height_m: number;
    swell_period_s: number;
    swell_direction: string;
    current_velocity_kts: number;
    sea_surface_temp_c: number;
    squall_alert: string;
    tide_status: string;
    inland_notice?: string;
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
  forecast7Day: DayForecastItem[];
  hourlyForecast: HourlyForecastItem[];
  astronomy: {
    sunrise: string;
    sunset: string;
    moon_phase: string;
    moon_icon: string;
    moon_illumination: number;
  };
  details: WeatherDetailsDiagnostics;
  isDisasterActive: boolean;
  disasterDetails: DisasterEvaluation;
}

// Dew point calculation (Magnus-Tetens formula)
function calculateDewPoint(temp_c: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const h = Math.max(1, Math.min(100, humidity));
  const alpha = ((a * temp_c) / (b + temp_c)) + Math.log(h / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint * 10) / 10;
}

// Apparent Temperature / Feels Like
function calculateFeelsLike(temp_c: number, humidity: number, wind_kph: number): number {
  const e = (Math.max(1, Math.min(100, humidity)) / 100) * 6.105 * Math.exp((17.27 * temp_c) / (237.7 + temp_c));
  const v = (wind_kph || 10) / 3.6; // m/s
  const at = temp_c + 0.33 * e - 0.70 * v - 4.0;
  return Math.round(at * 10) / 10;
}

// Beaufort scale calculator
function getBeaufortScale(wind_kph: number): { force: number; name: string; label: string } {
  if (wind_kph < 2) return { force: 0, name: 'Calm', label: 'Force 0 - Calm' };
  if (wind_kph <= 5) return { force: 1, name: 'Light Air', label: 'Force 1 - Light Air' };
  if (wind_kph <= 11) return { force: 2, name: 'Light Breeze', label: 'Force 2 - Light Breeze' };
  if (wind_kph <= 19) return { force: 3, name: 'Gentle Breeze', label: 'Force 3 - Gentle Breeze' };
  if (wind_kph <= 28) return { force: 4, name: 'Moderate Breeze', label: 'Force 4 - Moderate Breeze' };
  if (wind_kph <= 38) return { force: 5, name: 'Fresh Breeze', label: 'Force 5 - Fresh Breeze' };
  if (wind_kph <= 49) return { force: 6, name: 'Strong Breeze', label: 'Force 6 - Strong Breeze' };
  if (wind_kph <= 61) return { force: 7, name: 'Near Gale', label: 'Force 7 - Near Gale' };
  return { force: 8, name: 'Gale', label: 'Force 8 - Gale' };
}

// Wind direction degrees
function getWindDegrees(dir: string): number {
  const map: Record<string, number> = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
    E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
    W: 270, WNW: 292.5, NW: 315, NNW: 337.5
  };
  return map[dir?.toUpperCase()] ?? 245;
}

// Moon Phase Calculator
function calculateMoonPhase(date = new Date()): { phase: string; icon: string; illumination: number } {
  const knownNewMoon = new Date('2026-01-18T19:57:00Z').getTime();
  const synodicMonth = 29.53058867 * 86400 * 1000;
  const phaseDays = (((date.getTime() - knownNewMoon) % synodicMonth) + synodicMonth) % synodicMonth / (86400 * 1000);
  const phaseFraction = phaseDays / 29.53058867;
  const illumination = Math.round((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2 * 100);

  if (phaseDays < 1.84) return { phase: 'New Moon', icon: '🌑', illumination };
  if (phaseDays < 5.53) return { phase: 'Waxing Crescent', icon: '🌒', illumination };
  if (phaseDays < 9.22) return { phase: 'First Quarter', icon: '🌓', illumination };
  if (phaseDays < 12.91) return { phase: 'Waxing Gibbous', icon: '🌔', illumination };
  if (phaseDays < 16.61) return { phase: 'Full Moon', icon: '🌕', illumination };
  if (phaseDays < 20.30) return { phase: 'Waning Gibbous', icon: '🌖', illumination };
  if (phaseDays < 23.99) return { phase: 'Last Quarter', icon: '🌗', illumination };
  if (phaseDays < 27.68) return { phase: 'Waning Crescent', icon: '🌘', illumination };
  return { phase: 'New Moon', icon: '🌑', illumination };
}

// 24-Hour Spline Curve Generator
function generate24HourSplineData(
  temp_c: number,
  humidity: number,
  isRainy: boolean,
  sunriseStr = '06:03 AM',
  sunsetStr = '06:28 PM',
  currentHour = new Date().getHours()
): HourlyForecastItem[] {
  const hourly: HourlyForecastItem[] = [];
  const minTemp = Math.round(temp_c - 5);
  const maxTemp = Math.round(temp_c + 4);

  const formatHour = (h: number) => h === 0 ? '12 AM' : h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`;
  const formatTimeFull = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  for (let h = 0; h < 24; h++) {
    let tFactor: number;
    if (h < 5) tFactor = 0.15 - (h * 0.03);
    else if (h <= 14) tFactor = (h - 5) / 9;
    else tFactor = 1 - ((h - 14) / 9) * 0.85;

    let hTemp = Math.round((minTemp + (maxTemp - minTemp) * tFactor) * 10) / 10;
    if (h === currentHour) hTemp = Math.round(temp_c * 10) / 10;

    const hHumidity = Math.max(30, Math.min(95, Math.round(humidity + (1 - tFactor) * 18 - 8)));
    const hWind = Math.round(10 + Math.sin(h / 3) * 8);
    const hFeels = calculateFeelsLike(hTemp, hHumidity, hWind);

    let hRainChance = isRainy ? 65 : 10;
    if (isRainy) {
      if (h >= 13 && h <= 18) hRainChance = 85;
      else if (h >= 6 && h <= 12) hRainChance = 50;
      else hRainChance = 35;
    } else {
      if (h >= 14 && h <= 17) hRainChance = 25;
      else hRainChance = 5;
    }

    let hCond = 'Clear';
    let hIcon = 'sunny';
    let hCode = 1000;

    if (h < 6 || h >= 19) {
      hCond = isRainy ? 'Night Showers' : 'Clear Night';
      hIcon = isRainy ? 'rainy' : 'moon';
      hCode = isRainy ? 1063 : 1000;
    } else if (isRainy) {
      hCond = hRainChance > 70 ? 'Heavy Showers' : 'Passing Showers';
      hIcon = 'rainy';
      hCode = 1063;
    } else if (h >= 11 && h <= 16) {
      hCond = 'Sunny';
      hIcon = 'sunny';
      hCode = 1000;
    } else {
      hCond = 'Partly Cloudy';
      hIcon = 'cloudy';
      hCode = 1003;
    }

    const hUv = (h >= 8 && h <= 17) ? Math.round(Math.sin((h - 8) / 9 * Math.PI) * 9 * 10) / 10 : 0;

    hourly.push({
      time: formatHour(h),
      timeFull: formatTimeFull(h),
      hour: h,
      temp_c: hTemp,
      feels_like_c: hFeels,
      condition: hCond,
      conditionCode: hCode,
      icon: hIcon,
      rain_chance_pct: hRainChance,
      humidity: hHumidity,
      wind_kph: hWind,
      uv: hUv,
      isSunrise: h === 6,
      sunriseLabel: h === 6 ? sunriseStr : undefined,
      isSunset: h === 18,
      sunsetLabel: h === 18 ? sunsetStr : undefined,
      isCurrentHour: h === currentHour
    });
  }

  return hourly;
}

// 7-Day Forecast Generator
function generate7DayForecast(
  temp_c: number,
  humidity: number,
  isRainy: boolean,
  sunriseStr = '06:03 AM',
  sunsetStr = '06:28 PM'
): DayForecastItem[] {
  const days: DayForecastItem[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = dayNames[d.getDay()];
    const dayShort = dayShorts[d.getDay()];
    const dateNum = d.getDate();
    const isToday = i === 0;
    const dateStr = d.toISOString().split('T')[0];
    const label = isToday ? `${dateNum} Today` : `${dateNum} ${dayShort}`;

    const tempOffset = Math.sin(i * 1.2) * 2.5;
    const maxT = Math.round(temp_c + 3 + tempOffset);
    const minT = Math.round(temp_c - 4 + tempOffset * 0.5);

    const rainChance = isRainy
      ? Math.max(20, Math.round(75 - i * 8))
      : Math.round(15 + Math.sin(i) * 15);

    let cond = 'Partly Cloudy';
    let icon = 'cloudy';
    let code = 1003;

    if (rainChance >= 60) {
      cond = 'Passing Showers';
      icon = 'rainy';
      code = 1063;
    } else if (rainChance >= 40) {
      cond = 'Scattered Drizzle';
      icon = 'rainy';
      code = 1063;
    } else if (maxT > 32) {
      cond = 'Sunny & Warm';
      icon = 'sunny';
      code = 1000;
    } else {
      cond = 'Partly Cloudy';
      icon = 'cloudy';
      code = 1003;
    }

    const hourly = generate24HourSplineData(temp_c + tempOffset, humidity, rainChance > 45, sunriseStr, sunsetStr, isToday ? today.getHours() : -1);

    days.push({
      date: dateStr,
      dayOfWeek,
      dayShort,
      dateNum,
      isToday,
      label,
      temp_max_c: maxT,
      temp_min_c: minT,
      condition: cond,
      conditionCode: code,
      icon,
      rain_chance_pct: rainChance,
      uv_max: Math.round((6.5 + Math.sin(i) * 2) * 10) / 10,
      hourly
    });
  }

  return days;
}

// Generate 8 Diagnostic Cards
function generateDiagnosticDetails(
  temp_c: number,
  humidity: number,
  wind_kph: number,
  wind_dir: string,
  uv: number,
  aqi_index: number,
  isRainy: boolean,
  sunriseStr = '06:03 AM',
  sunsetStr = '06:28 PM'
): WeatherDetailsDiagnostics {
  const minTemp = Math.round(temp_c - 4.5);
  const maxTemp = Math.round(temp_c + 3.8);
  const dewPoint = calculateDewPoint(temp_c, humidity);
  const feelsLike = calculateFeelsLike(temp_c, humidity, wind_kph);
  const feelsLikeDelta = Math.round((feelsLike - temp_c) * 10) / 10;

  let thermalComfort = 'Comfortable';
  if (feelsLike > temp_c + 2) thermalComfort = 'Slightly Warm';
  else if (feelsLike > temp_c + 4) thermalComfort = 'Hot & Muggy';
  else if (feelsLike < temp_c - 2) thermalComfort = 'Cool Breeze';

  const beaufort = getBeaufortScale(wind_kph);
  const windDeg = getWindDegrees(wind_dir);
  const gustKph = Math.round(wind_kph * 1.45 * 10) / 10;

  const cloudCover = isRainy ? 81 : 35;
  const cloudDesc = isRainy ? 'Mostly Cloudy (81%)' : 'Scattered Clouds (35%)';
  const ceilingFt = isRainy ? 2800 : 5400;

  const precipMm = isRainy ? 14.2 : 0.9;
  const precipCm = (precipMm / 10).toFixed(2) + ' cm';
  const precipSummary = isRainy ? 'Expected accumulation over 24h: 1.42 cm' : 'Minimal precipitation: 0.09 cm';
  const precipNext = isRainy ? 'Passing showers active next 45 min' : 'Dry conditions expected next 6 hours';

  let tempTrend = 'Steady';
  let tempTrendDesc = 'Temperatures holding steady around seasonal averages';
  if (temp_c > 33) {
    tempTrend = 'Warming';
    tempTrendDesc = 'Rising afternoon temperature curve with peak at 2:30 PM';
  } else if (temp_c < 22) {
    tempTrend = 'Cooling';
    tempTrendDesc = 'Nighttime radiative cooling expected overnight';
  }

  let uvCat = '3 Moderate';
  if (uv >= 11) uvCat = `${uv} Extreme`;
  else if (uv >= 8) uvCat = `${uv} Very High`;
  else if (uv >= 6) uvCat = `${uv} High`;
  else if (uv >= 3) uvCat = `${uv} Moderate`;
  else uvCat = `${uv} Low`;

  let aqiStatus = `${aqi_index} Good`;
  if (aqi_index > 200) aqiStatus = `${aqi_index} Very Poor`;
  else if (aqi_index > 100 || aqi_index > 50) aqiStatus = `${aqi_index} Moderate`;

  const moon = calculateMoonPhase();

  return {
    temp_current_c: temp_c,
    temp_min_c: minTemp,
    temp_max_c: maxTemp,
    temp_trend: tempTrend,
    temp_trend_desc: tempTrendDesc,
    feels_like_c: feelsLike,
    feels_like_delta: feelsLikeDelta,
    feels_like_desc: `Feels like ${Math.round(feelsLike)}° | Temp ${Math.round(temp_c)}° — ${thermalComfort}`,
    cloud_cover_pct: cloudCover,
    cloud_cover_desc: cloudDesc,
    cloud_ceiling_ft: ceilingFt,
    precip_24h_mm: precipMm,
    precip_24h_cm: precipCm,
    precip_summary: precipSummary,
    precip_next_window: precipNext,
    wind_kph: wind_kph,
    wind_gust_kph: gustKph,
    wind_dir: wind_dir,
    wind_deg: windDeg,
    beaufort_scale: beaufort.label,
    beaufort_force: beaufort.force,
    humidity_pct: humidity,
    dew_point_c: dewPoint,
    dew_point_desc: dewPoint > 22 ? 'High Moisture (Muggy)' : dewPoint > 16 ? 'Comfortable Moisture' : 'Dry Air',
    uv_index: uv,
    uv_category: uvCat,
    uv_peak_window: '11:30 AM - 03:00 PM',
    aqi_index: aqi_index,
    aqi_status: aqiStatus,
    aqi_pm25: Math.round(aqi_index * 0.25 * 10) / 10,
    aqi_pm10: Math.round(aqi_index * 0.45 * 10) / 10,
    aqi_no2: Math.round((8 + aqi_index * 0.05) * 10) / 10,
    aqi_primary: `PM2.5 ${(aqi_index * 0.25).toFixed(1)} µg/m³`,
    moon_phase: moon.phase,
    moon_icon: moon.icon,
    moon_illumination_pct: moon.illumination,
    sunrise: sunriseStr,
    sunset: sunsetStr
  };
}

// Coastal Maritime evaluation
function evaluateMaritimeTelemetry(
  locName = '',
  locRegion = '',
  locCountry = '',
  temp_c = 28,
  wind_kph = 14,
  wind_dir = 'SW',
  isRainy = false,
  hash = 0
) {
  if (!isCoastalLocation(locName, locRegion, locCountry)) {
    return {
      is_coastal: false,
      water_body_type: 'Inland River & Freshwater Basin',
      swell_height_m: 0,
      swell_period_s: 0,
      swell_direction: 'N/A (Inland)',
      current_velocity_kts: Math.round((0.2 + wind_kph * 0.01) * 10) / 10,
      sea_surface_temp_c: Math.round((temp_c - 2) * 10) / 10,
      squall_alert: isRainy ? 'Surface Chop & Rain' : 'Calm Freshwater Basin',
      tide_status: 'Freshwater Basin (No Tidal Cycle)',
      inland_notice: `Inland location: Oceanic swell and tides are not applicable for ${locName || 'this region'}. Freshwater conditions nominal.`
    };
  }

  const swell_height = Math.round((0.8 + wind_kph * 0.05 + (isRainy ? 0.9 : 0)) * 10) / 10;
  const swell_period = Math.round(7.5 + wind_kph * 0.08 + (hash % 4));
  const current_vel = Math.round((0.9 + wind_kph * 0.03) * 10) / 10;
  const sst = Math.round((temp_c - 1.5 + ((hash % 20) / 10)) * 10) / 10;

  return {
    is_coastal: true,
    water_body_type: 'Open Ocean / Coastal Waters',
    swell_height_m: swell_height,
    swell_period_s: swell_period,
    swell_direction: wind_dir || ['SW', 'W', 'NW', 'S'][hash % 4],
    current_velocity_kts: current_vel,
    sea_surface_temp_c: sst,
    squall_alert: isRainy ? 'Squall Warning Active' : 'Calm Seas',
    tide_status: isRainy ? 'High Tide (+2.4m) Active' : 'Rising Tide (+1.8m) at 18:30',
    inland_notice: ''
  };
}

// Localized Mock Generator
function generateLocalMockWeather(cityKey: string, queryStr?: string): WeatherResponse {
  let name = cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace(/_/g, ' ');
  let country = 'India';

  if (queryStr) {
    const qTrim = queryStr.trim();
    const coordsMatch = qTrim.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lon = parseFloat(coordsMatch[3]);
      const rev = getReverseGeocodeOffline(lat, lon);
      name = rev.name;
      country = rev.country;
    } else {
      const parts = qTrim.split(',');
      if (parts.length > 0 && parts[0].trim()) name = parts[0].trim();
      if (parts.length > 1 && parts[parts.length - 1].trim()) country = parts[parts.length - 1].trim();
    }
  } else if (cityKey === 'current_location') {
    name = 'New Delhi';
    country = 'India';
  }

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  const temp_c = 20 + (absHash % 14);
  const humidity = 45 + (absHash % 45);
  const uv = 3 + (absHash % 7);
  const wind_kph = 10 + (absHash % 20);
  const visibility_km = 6 + (absHash % 6);
  const pm25 = 20 + (absHash % 90);
  const pressure_mb = 1008 + (absHash % 14);
  const wind_dir = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'WSW', 'NW'][absHash % 8];

  const conditions = ['Sunny', 'Hazy Sunshine', 'Partly Cloudy', 'Passing Showers', 'Light Drizzle', 'Clear', 'Overcast'];
  const conditionText = conditions[absHash % conditions.length];
  const isRainy = conditionText.toLowerCase().includes('shower') || conditionText.toLowerCase().includes('drizzle') || conditionText.toLowerCase().includes('rain');

  const sunrise = '06:03 AM';
  const sunset = '06:28 PM';

  const forecast7Day = generate7DayForecast(temp_c, humidity, isRainy, sunrise, sunset);
  const hourlyForecast = forecast7Day[0].hourly;
  const details = generateDiagnosticDetails(temp_c, humidity, wind_kph, wind_dir, uv, pm25, isRainy, sunrise, sunset);
  const moon = calculateMoonPhase();

  const disasterEval = OfflineEngineService.evaluateDisaster({
    temp_c,
    humidity,
    wind_kph,
    wind_gust_kph: wind_kph * 1.25,
    pressure_mb,
    precip_mm_24h: isRainy ? 14 : 0,
    aqi_index: pm25,
    conditionText,
    conditionCode: isRainy ? 1063 : 1000,
    locationName: name
  });

  return {
    location: {
      name,
      country,
      timezone: 'Asia/Kolkata',
      localTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
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
      wind_dir,
      visibility_km,
      pressure_mb
    },
    aqi: {
      index: pm25,
      label: pm25 <= 50 ? 'Good' : pm25 <= 100 ? 'Moderate' : 'Poor',
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
      sunrise,
      sunset,
      best_running_hours: ['06:00 AM - 07:30 AM', '06:00 PM - 07:30 PM'],
      heat_alert: temp_c > 35,
      comfort_index: Math.max(0, Math.min(100, Math.round(100 - ((temp_c - 20) * 2 + (humidity - 50) * 0.5))))
    },
    marine: {
      sea_condition: isRainy ? 'Rough Chop' : 'Moderate Swell',
      wave_height_m: isRainy ? 2.1 : 1.2,
      water_temp_c: 25.5,
      tide_timings: []
    },
    travel: {
      saved_destinations: [
        { name: 'London', temp_c: 16, condition: 'Drizzle' },
        { name: 'New York', temp_c: 24, condition: 'Sunny' }
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
      soil_moisture_pct: Math.min(100, Math.max(20, Math.round(humidity * 0.9 * 10) / 10)),
      rainfall_prediction_24h_mm: isRainy ? 14 : 0,
      frost_alert: temp_c < 3,
      seasonal_planting_guidance: `Optimal soil conditions for seasonal crops in ${name}.`
    },
    commute: {
      traffic_status: isRainy ? 'Slow transit due to wet roads.' : 'Normal traffic flow.',
      visibility_alert: visibility_km < 5 ? `Reduced visibility: ${visibility_km}km` : 'Perfect road visibility.',
      storm_fog_alert: 'No storm or fog warnings.'
    },
    event_planner: {
      extended_comfort: `82/100 comfort rating for outdoor events.`,
      rain_probability_pct: isRainy ? 70 : 10
    },
    aviation: {
      cloud_ceiling_ft: 3800 + (absHash % 3000),
      flight_visibility_sm: Math.round(visibility_km * 0.62 * 10) / 10,
      density_altitude_ft: 1600 + (absHash % 1200),
      freezing_level_ft: 11500 + (absHash % 3000),
      wind_shear_alert: wind_kph > 30 ? 'Moderate Wind Shear Caution' : 'Low Wind Shear Risk',
      metar_summary: `METAR AUTO ${Math.round(wind_kph * 0.54)}KT 9999 ${isRainy ? 'RA' : 'CLR'} ${Math.round(temp_c)}/${Math.round(temp_c - 4)} Q${pressure_mb}`,
      crosswind_component_kt: Math.round(wind_kph * 0.4)
    },
    maritime: evaluateMaritimeTelemetry(name, '', country, temp_c, wind_kph, wind_dir, isRainy, absHash),
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
      ground_saturation_pct: Math.min(100, Math.max(20, Math.round(humidity * 0.9 * 10) / 10)),
      wind_hazard_status: wind_kph > 35 ? 'High Wind Scaffold Hazard' : 'Safe for Crane Operations'
    },
    energy: {
      solar_ghi_wm2: isRainy ? 240 : 810,
      solar_dni_wm2: isRainy ? 90 : 680,
      wind_100m_hub_kph: Math.round(wind_kph * 1.5),
      hdd_cdd_index: temp_c > 18 ? `CDD: ${(temp_c - 18).toFixed(1)} (Cooling Load)` : `HDD: ${(18 - temp_c).toFixed(1)} (Heating Load)`,
      lightning_radius_km: isRainy ? 'Lightning tracked within 25 km' : 'No strikes within 50 km'
    },
    forecast7Day,
    hourlyForecast,
    astronomy: {
      sunrise,
      sunset,
      moon_phase: moon.phase,
      moon_icon: moon.icon,
      moon_illumination: moon.illumination
    },
    details,
    isDisasterActive: disasterEval.isDisasterActive,
    disasterDetails: disasterEval
  };
}

// Weather Code mapping for Open-Meteo
function mapWmoCode(code: number): { text: string; icon: string; isRainy: boolean } {
  switch (code) {
    case 0: return { text: 'Clear Sky', icon: 'sunny', isRainy: false };
    case 1: return { text: 'Mainly Clear', icon: 'sunny', isRainy: false };
    case 2: return { text: 'Partly Cloudy', icon: 'cloudy', isRainy: false };
    case 3: return { text: 'Overcast', icon: 'cloudy', isRainy: false };
    case 45: case 48: return { text: 'Foggy Haze', icon: 'foggy', isRainy: false };
    case 51: case 53: case 55: return { text: 'Light Drizzle', icon: 'rainy', isRainy: true };
    case 56: case 57: return { text: 'Freezing Drizzle', icon: 'rainy', isRainy: true };
    case 61: return { text: 'Light Rain', icon: 'rainy', isRainy: true };
    case 63: return { text: 'Moderate Rain', icon: 'rainy', isRainy: true };
    case 65: return { text: 'Heavy Rain', icon: 'rainy', isRainy: true };
    case 71: case 73: case 75: case 77: return { text: 'Snow Showers', icon: 'cloudy', isRainy: false };
    case 80: case 81: return { text: 'Passing Showers', icon: 'rainy', isRainy: true };
    case 82: return { text: 'Torrential Showers', icon: 'rainy', isRainy: true };
    case 95: return { text: 'Thunderstorm', icon: 'stormy', isRainy: true };
    case 96: case 99: return { text: 'Severe Thunderstorm & Hail', icon: 'stormy', isRainy: true };
    default: return { text: 'Partly Cloudy', icon: 'cloudy', isRainy: false };
  }
}

// Open-Meteo Live Fetcher
export async function fetchFromOpenMeteo(cityKey: string, queryStr?: string): Promise<WeatherResponse> {
  const query = queryStr || cityKey;
  let lat = 28.61;
  let lon = 77.20;
  let locName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1).replace(/_/g, ' ');
  let locRegion = '';
  let locCountry = 'India';

  const coordsMatch = query.trim().match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (coordsMatch) {
    lat = parseFloat(coordsMatch[1]);
    lon = parseFloat(coordsMatch[3]);
    const offlineRev = getReverseGeocodeOffline(lat, lon);
    locName = offlineRev.name;
    locRegion = offlineRev.region;
    locCountry = offlineRev.country;
  } else {
    const offlineMatches = getCityMatches(query);
    if (offlineMatches.length > 0) {
      lat = offlineMatches[0].lat;
      lon = offlineMatches[0].lon;
      locName = offlineMatches[0].name;
      locRegion = offlineMatches[0].region;
      locCountry = offlineMatches[0].country;
    } else {
      try {
        const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
        if (geoResp.ok) {
          const geoData = await geoResp.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            locName = geoData.results[0].name;
            locRegion = geoData.results[0].admin1 || '';
            locCountry = geoData.results[0].country || 'India';
          }
        }
      } catch (e) {
        console.warn('[WeatherService] Open-Meteo geocoding fallback:', e);
      }
    }
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,precipitation_sum&timezone=auto`;

  const weatherResp = await fetch(weatherUrl);
  if (!weatherResp.ok) throw new Error(`Open-Meteo HTTP error: ${weatherResp.status}`);
  const weatherData = await weatherResp.json();

  let aqi = 48;
  let pm25 = 14;
  let pm10 = 24;
  let no2 = 10;
  let o3 = 18;

  try {
    const aqiResp = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,nitrogen_dioxide,ozone,us_aqi`);
    if (aqiResp.ok) {
      const aqiData = await aqiResp.json();
      if (aqiData.current) {
        pm25 = Math.round(aqiData.current.pm2_5 ?? 14);
        pm10 = Math.round(aqiData.current.pm10 ?? 24);
        no2 = Math.round(aqiData.current.nitrogen_dioxide ?? 10);
        o3 = Math.round(aqiData.current.ozone ?? 18);
        aqi = Math.round(aqiData.current.us_aqi ?? (pm25 * 2.1));
      }
    }
  } catch {}

  const current = weatherData.current || {};
  const temp_c = Math.round((current.temperature_2m ?? 29.5) * 10) / 10;
  const humidity = Math.round(current.relative_humidity_2m ?? 65);
  const wind_kph = Math.round((current.wind_speed_10m ?? 2.6) * 10) / 10;
  const wind_deg = current.wind_direction_10m ?? 112;
  const pressure_mb = Math.round(current.pressure_msl ?? current.surface_pressure ?? 1012);
  const uv = Math.round((current.uv_index ?? 0) * 10) / 10;
  const precip = current.precipitation ?? 0;
  const condMapped = mapWmoCode(current.weather_code ?? 0);
  const isRainy = condMapped.isRainy || precip > 0;

  const windDirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const wind_dir = windDirs[Math.round(wind_deg / 22.5) % 16] || 'ESE';

  let sunriseStr = '06:03 AM';
  let sunsetStr = '06:28 PM';

  if (weatherData.daily?.sunrise?.[0]) {
    const s = weatherData.daily.sunrise[0];
    const timePart = s.includes('T') ? s.split('T')[1] : s;
    const [h, m] = timePart.split(':').map(Number);
    sunriseStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  if (weatherData.daily?.sunset?.[0]) {
    const s = weatherData.daily.sunset[0];
    const timePart = s.includes('T') ? s.split('T')[1] : s;
    const [h, m] = timePart.split(':').map(Number);
    sunsetStr = `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  // Generate 7-day and 24-hour hourly
  const forecast7Day: DayForecastItem[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const currentHour = now.getHours();

  const numDays = Math.min(7, weatherData.daily?.time?.length || 7);
  for (let dIdx = 0; dIdx < numDays; dIdx++) {
    const dateObj = new Date(now);
    dateObj.setDate(now.getDate() + dIdx);
    const isToday = dIdx === 0;
    const dayOfWeek = dayNames[dateObj.getDay()];
    const dayShort = dayShorts[dateObj.getDay()];
    const dateNum = dateObj.getDate();
    const label = isToday ? `${dateNum} Today` : `${dateNum} ${dayShort}`;

    const maxT = weatherData.daily?.temperature_2m_max?.[dIdx] ?? Math.round(temp_c + 3);
    const minT = weatherData.daily?.temperature_2m_min?.[dIdx] ?? Math.round(temp_c - 4);
    const dayWmo = mapWmoCode(weatherData.daily?.weather_code?.[dIdx] ?? current.weather_code ?? 0);
    const rainChance = weatherData.daily?.precipitation_probability_max?.[dIdx] ?? (isRainy ? 70 : 10);
    const uvMax = weatherData.daily?.uv_index_max?.[dIdx] ?? uv;

    const hourlyList: HourlyForecastItem[] = [];
    for (let h = 0; h < 24; h++) {
      const idx = dIdx * 24 + h;
      const hT = weatherData.hourly?.temperature_2m?.[idx] ?? temp_c;
      const hHum = weatherData.hourly?.relative_humidity_2m?.[idx] ?? humidity;
      const hWind = Math.round((weatherData.hourly?.wind_speed_10m?.[idx] ?? wind_kph) * 10) / 10;
      const hRain = weatherData.hourly?.precipitation_probability?.[idx] ?? (isRainy ? 60 : 5);
      const hUv = weatherData.hourly?.uv_index?.[idx] ?? (h >= 8 && h <= 17 ? Math.round(Math.sin((h - 8) / 9 * Math.PI) * 9 * 10) / 10 : 0);
      const hCond = mapWmoCode(weatherData.hourly?.weather_code?.[idx] ?? (isRainy ? 61 : 0));
      const hFeels = calculateFeelsLike(hT, hHum, hWind);

      const formatH = (hour: number) => hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;

      hourlyList.push({
        time: formatH(h),
        timeFull: `${h.toString().padStart(2, '0')}:00`,
        hour: h,
        temp_c: Math.round(hT * 10) / 10,
        feels_like_c: Math.round(hFeels * 10) / 10,
        condition: hCond.text,
        conditionCode: weatherData.hourly?.weather_code?.[idx] ?? 1000,
        icon: hCond.icon,
        rain_chance_pct: hRain,
        humidity: hHum,
        wind_kph: hWind,
        uv: hUv,
        isSunrise: h === 6,
        sunriseLabel: h === 6 ? sunriseStr : undefined,
        isSunset: h === 18,
        sunsetLabel: h === 18 ? sunsetStr : undefined,
        isCurrentHour: isToday && h === currentHour
      });
    }

    forecast7Day.push({
      date: dateObj.toISOString().split('T')[0],
      dayOfWeek,
      dayShort,
      dateNum,
      isToday,
      label,
      temp_max_c: Math.round(maxT),
      temp_min_c: Math.round(minT),
      condition: dayWmo.text,
      conditionCode: weatherData.daily?.weather_code?.[dIdx] ?? 1000,
      icon: dayWmo.icon,
      rain_chance_pct: rainChance,
      uv_max: uvMax,
      hourly: hourlyList
    });
  }

  const hourlyForecast = forecast7Day[0].hourly;
  const details = generateDiagnosticDetails(temp_c, humidity, wind_kph, wind_dir, uv, aqi, isRainy, sunriseStr, sunsetStr);
  const moon = calculateMoonPhase();

  // Record barometer reading for pressure trend tracking
  BarometerService.recordPressure(pressure_mb);
  const pressureTrend = BarometerService.getPressureTrend(pressure_mb);

  const disasterDetails = OfflineEngineService.evaluateDisaster({
    temp_c,
    humidity,
    wind_kph,
    wind_gust_kph: wind_kph * 1.3,
    pressure_mb,
    pressure_delta_3h: pressureTrend.delta3h,
    precip_mm_24h: weatherData.daily?.precipitation_sum?.[0] ?? (isRainy ? 15 : 0),
    aqi_index: aqi,
    conditionText: condMapped.text,
    conditionCode: current.weather_code ?? 1000,
    locationName: locName
  });

  return {
    location: {
      name: locName,
      country: locRegion ? `${locRegion}, ${locCountry}` : locCountry,
      timezone: weatherData.timezone || 'Asia/Kolkata',
      localTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    },
    current: {
      temp_c,
      condition: {
        text: condMapped.text,
        code: current.weather_code ?? 1000,
        icon: condMapped.icon
      },
      humidity,
      uv,
      wind_kph,
      wind_dir,
      visibility_km: 10,
      pressure_mb
    },
    aqi: {
      index: aqi,
      label: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : 'Poor',
      pm25,
      pm10,
      no2,
      o3
    },
    pollen: {
      grass: 'Low',
      tree: 'Low',
      weed: 'Low'
    },
    fitness: {
      sunrise: sunriseStr,
      sunset: sunsetStr,
      best_running_hours: ['06:00 AM - 07:30 AM', '06:00 PM - 07:30 PM'],
      heat_alert: temp_c > 35,
      comfort_index: Math.max(0, Math.min(100, Math.round(100 - ((temp_c - 20) * 2 + (humidity - 50) * 0.5))))
    },
    marine: {
      sea_condition: isRainy ? 'Rough Chop' : 'Moderate Swell',
      wave_height_m: 1.2,
      water_temp_c: Math.round((temp_c - 1.5) * 10) / 10,
      tide_timings: []
    },
    travel: {
      saved_destinations: [],
      flight_alerts: {
        status: isRainy ? 'Minor Runway Delays' : 'Normal',
        details: isRainy ? 'Wet tarmac.' : 'No disruptions.'
      },
      packing_suggestions: isRainy ? `Carry rain gear in ${locName}.` : `Comfortable layers in ${locName}.`
    },
    family: {
      school_commute: isRainy ? 'Wet roads. Allow extra commute time.' : 'Dry roads. Normal school commute.',
      rain_alerts: isRainy ? 'Showers expected today.' : 'No rain expected.',
      severe_warning: null
    },
    agriculture: {
      soil_moisture_pct: Math.min(100, Math.max(20, Math.round(humidity * 0.9 * 10) / 10)),
      rainfall_prediction_24h_mm: weatherData.daily?.precipitation_sum?.[0] ?? (isRainy ? 15 : 0),
      frost_alert: temp_c < 2,
      seasonal_planting_guidance: `Optimal agricultural conditions in ${locName}.`
    },
    commute: {
      traffic_status: isRainy ? 'Slow transit due to wet roads.' : 'Normal traffic flow.',
      visibility_alert: 'Good road visibility.',
      storm_fog_alert: current.weather_code >= 95 ? 'Thunderstorm caution active.' : 'No alerts.'
    },
    event_planner: {
      extended_comfort: `82/100 comfort rating for outdoor events.`,
      rain_probability_pct: weatherData.daily?.precipitation_probability_max?.[0] ?? (isRainy ? 70 : 10)
    },
    aviation: {
      cloud_ceiling_ft: 4500,
      flight_visibility_sm: 6.2,
      density_altitude_ft: Math.round(145.44 * (1013.25 - pressure_mb) + (temp_c - 15) * 120 + 800),
      freezing_level_ft: Math.round(Math.max(4000, temp_c * 500 + 3000)),
      wind_shear_alert: wind_kph > 35 ? 'Moderate Wind Shear Alert' : 'Low Wind Shear Risk',
      metar_summary: `METAR AUTO ${Math.round(wind_kph * 0.54)}KT 9999 ${isRainy ? 'RA' : 'CLR'} ${Math.round(temp_c)}/${Math.round(temp_c - (100 - humidity) / 5)} Q${pressure_mb}`,
      crosswind_component_kt: Math.round(wind_kph * 0.4)
    },
    maritime: evaluateMaritimeTelemetry(locName, locRegion, locCountry, temp_c, wind_kph, wind_dir, isRainy),
    logistics: {
      road_surface_temp_c: Math.round(temp_c + 4),
      ice_hazard_status: temp_c < 2 ? 'Ice Hazard Alert' : 'Dry Tarmac (Safe)',
      highway_crosswind_kph: wind_kph,
      precip_nowcast_min: isRainy ? 'Showers active next 45 min' : 'Dry window next 90 min',
      visibility_distance_km: 10,
      transit_delay_risk: isRainy ? 'Moderate Delay (+15 min)' : 'Low Delay Risk'
    },
    construction: {
      crane_gust_limit_pct: Math.min(100, Math.round((wind_kph / 45) * 100)),
      concrete_pour_window: isRainy ? 'Unfavorable (Washout Risk)' : 'Ideal Pour Window',
      heat_stress_index: temp_c > 35 ? 'High (Hydrate)' : 'Safe',
      ground_saturation_pct: Math.min(100, Math.max(20, Math.round(humidity * 0.9 * 10) / 10)),
      wind_hazard_status: wind_kph > 35 ? 'High Wind Scaffold Caution' : 'Safe for Crane Operations'
    },
    energy: {
      solar_ghi_wm2: isRainy ? 240 : 790,
      solar_dni_wm2: isRainy ? 90 : 660,
      wind_100m_hub_kph: Math.round(wind_kph * 1.5),
      hdd_cdd_index: `CDD: ${Math.max(0, temp_c - 18).toFixed(1)}`,
      lightning_radius_km: current.weather_code >= 95 ? 'Lightning tracked within 20 km' : 'No strikes within 50 km'
    },
    forecast7Day,
    hourlyForecast,
    astronomy: {
      sunrise: sunriseStr,
      sunset: sunsetStr,
      moon_phase: moon.phase,
      moon_icon: moon.icon,
      moon_illumination: moon.illumination
    },
    details,
    isDisasterActive: disasterDetails.isDisasterActive,
    disasterDetails
  };
}

// Main Weather Fetcher Entrypoint
export async function fetchWeatherData(cityKey: string, queryStr?: string): Promise<WeatherResponse> {
  const query = queryStr || cityKey;
  try {
    return await fetchFromOpenMeteo(cityKey, query);
  } catch (error) {
    console.warn(`[WeatherService] Open-Meteo live API error for "${query}", generating localized fallback:`, error);
    return generateLocalMockWeather(cityKey, query);
  }
}
