// src/data/mock-weather.ts
// Mock weather data for development (used when WeatherAPI key is not set)

export const MOCK_WEATHER_DB: Record<string, any> = {
  mumbai: {
    location: { name: "Mumbai", country: "India", timezone: "Asia/Kolkata", localTime: "2026-08-30 13:40" },
    current: { temp_c: 29.5, condition: { text: "Passing Showers", code: 1063, icon: "rainy" }, humidity: 88, uv: 6.0, wind_kph: 24.5, wind_dir: "WSW", visibility_km: 8.0, pressure_mb: 1008 },
    aqi: { index: 48, label: "Good", pm25: 12.4, pm10: 22.8, no2: 8.2, o3: 15.1 },
    pollen: { grass: "Low", tree: "Low", weed: "Negligible" },
    fitness: { sunrise: "06:12 AM", sunset: "06:58 PM", best_running_hours: ["06:30 AM - 07:30 AM", "06:30 PM - 07:30 PM"], heat_alert: false, comfort_index: 78 },
    marine: { sea_condition: "Moderate Chop", wave_height_m: 1.8, water_temp_c: 27.5, tide_timings: [{ time: "08:14 AM", type: "High", height_m: 3.8 }, { time: "02:22 PM", type: "Low", height_m: 1.1 }, { time: "08:35 PM", type: "High", height_m: 4.1 }] },
    travel: { saved_destinations: [{ name: "London", temp_c: 16.0, condition: "Drizzle" }, { name: "New York", temp_c: 24.0, condition: "Sunny" }], flight_alerts: { status: "Minor Delays", details: "Monsoon winds causing 15-min departure holds on westbound flights." }, packing_suggestions: "Carry an umbrella and light waterproof shell. High humidity means light breathable fabrics." },
    family: { school_commute: "Wet roads. Expect slow traffic in low-lying areas.", rain_alerts: "Light showers expected around 03:00 PM, timing with school dismissal.", severe_warning: null },
    agriculture: { soil_moisture_pct: 82.5, rainfall_prediction_24h_mm: 18.4, frost_alert: false, seasonal_planting_guidance: "Ideal conditions for transplanting rice and sowing okra. No manual watering required today." },
    commute: { traffic_status: "Slow traffic on Western Express Highway due to lane narrowing.", visibility_alert: "Visibility normal at 8km. Wet tarmac precautions apply.", storm_fog_alert: "No storm or fog warnings." },
    event_planner: { extended_comfort: "Humid conditions. Outdoor gatherings will require cooling systems. 40% probability of rain.", rain_probability_pct: 40 }
  },
  new_delhi: {
    location: { name: "New Delhi", country: "India", timezone: "Asia/Kolkata", localTime: "2026-08-30 13:40" },
    current: { temp_c: 34.0, condition: { text: "Hazy Sunshine", code: 1000, icon: "sunny" }, humidity: 52, uv: 9.0, wind_kph: 12.0, wind_dir: "WNW", visibility_km: 3.0, pressure_mb: 1002 },
    aqi: { index: 245, label: "Poor", pm25: 112.5, pm10: 198.0, no2: 32.4, o3: 45.1 },
    pollen: { grass: "Moderate", tree: "High", weed: "Moderate" },
    fitness: { sunrise: "05:58 AM", sunset: "06:44 PM", best_running_hours: ["05:00 AM - 06:15 AM", "07:30 PM - 08:30 PM"], heat_alert: true, comfort_index: 52 },
    marine: { sea_condition: "N/A (Inland)", wave_height_m: 0, water_temp_c: 0, tide_timings: [] },
    travel: { saved_destinations: [{ name: "Mumbai", temp_c: 29.5, condition: "Passing Showers" }, { name: "Sydney", temp_c: 14.2, condition: "Clear" }], flight_alerts: { status: "Normal", details: "No flight disruptions reported." }, packing_suggestions: "Wear high SPF sunscreen, sunglasses, and loose linen clothing. A mask is suggested due to poor AQI." },
    family: { school_commute: "Normal traffic. Smog alert: limit children's outdoor playtime.", rain_alerts: "Zero chance of precipitation during school hours.", severe_warning: "High UV Warning: Seek shade between 11 AM and 3 PM." },
    agriculture: { soil_moisture_pct: 31.2, rainfall_prediction_24h_mm: 0, frost_alert: false, seasonal_planting_guidance: "Soil moisture is low. Irrigate vegetable fields this evening. Mulch around saplings to retain moisture." },
    commute: { traffic_status: "Dense traffic near Connaught Place. Dry roads.", visibility_alert: "Hazy conditions. Visibility reduced to 3km. Use low beams in dusty zones.", storm_fog_alert: "Dust storm alert active for late evening." },
    event_planner: { extended_comfort: "Very hot and dry. Outdoor events should supply shaded tents and ample hydration. 0% chance of rain.", rain_probability_pct: 0 }
  },
  london: {
    location: { name: "London", country: "United Kingdom", timezone: "Europe/London", localTime: "2026-08-30 09:10" },
    current: { temp_c: 16.0, condition: { text: "Light Drizzle", code: 1153, icon: "rainy" }, humidity: 92, uv: 2.0, wind_kph: 18.5, wind_dir: "SW", visibility_km: 6.0, pressure_mb: 1014 },
    aqi: { index: 28, label: "Good", pm25: 4.8, pm10: 8.2, no2: 12.1, o3: 18.5 },
    pollen: { grass: "Negligible", tree: "Low", weed: "Low" },
    fitness: { sunrise: "06:08 AM", sunset: "07:54 PM", best_running_hours: ["10:00 AM - 12:00 PM", "04:00 PM - 06:00 PM"], heat_alert: false, comfort_index: 85 },
    marine: { sea_condition: "Rough swell", wave_height_m: 2.4, water_temp_c: 14.5, tide_timings: [{ time: "11:24 AM", type: "Low", height_m: 0.9 }, { time: "05:42 PM", type: "High", height_m: 5.6 }] },
    travel: { saved_destinations: [{ name: "Mumbai", temp_c: 29.5, condition: "Passing Showers" }, { name: "New York", temp_c: 24.0, condition: "Sunny" }], flight_alerts: { status: "Minor Delays", details: "LHR airport reporting 10-15 min delays on incoming flights due to low cloud cover." }, packing_suggestions: "Carry a raincoat and layered fleece. London weather is damp and windy today." },
    family: { school_commute: "Slippery roads. Carry umbrellas for walking routes.", rain_alerts: "Intermittent drizzle expected all day; continuous rain during school pickup (3:30 PM).", severe_warning: null },
    agriculture: { soil_moisture_pct: 78.4, rainfall_prediction_24h_mm: 4.2, frost_alert: false, seasonal_planting_guidance: "Excellent planting weather for autumn brassicas (cabbage, broccoli). Protect seeds from birds." },
    commute: { traffic_status: "Standard congestion on M25. Wet asphalt requires cautious braking.", visibility_alert: "Reduced visibility due to mist (6km). Keep safe following distances.", storm_fog_alert: "Mist warning in effect." },
    event_planner: { extended_comfort: "Cool and damp. Indoor options strongly recommended. 80% chance of light rain.", rain_probability_pct: 80 }
  },
  sydney: {
    location: { name: "Sydney", country: "Australia", timezone: "Australia/Sydney", localTime: "2026-08-30 18:10" },
    current: { temp_c: 14.2, condition: { text: "Clear and Crisp", code: 1000, icon: "sunny" }, humidity: 62, uv: 1.0, wind_kph: 15.0, wind_dir: "W", visibility_km: 10.0, pressure_mb: 1022 },
    aqi: { index: 32, label: "Good", pm25: 6.2, pm10: 11.4, no2: 5.1, o3: 22.4 },
    pollen: { grass: "Low", tree: "Negligible", weed: "Low" },
    fitness: { sunrise: "06:14 AM", sunset: "05:35 PM", best_running_hours: ["06:30 AM - 08:30 AM", "03:30 PM - 05:00 PM"], heat_alert: false, comfort_index: 92 },
    marine: { sea_condition: "Clean Offshore Swell", wave_height_m: 1.5, water_temp_c: 18.0, tide_timings: [{ time: "05:48 AM", type: "Low", height_m: 0.3 }, { time: "12:12 PM", type: "High", height_m: 1.4 }, { time: "06:18 PM", type: "Low", height_m: 0.4 }] },
    travel: { saved_destinations: [{ name: "Mumbai", temp_c: 29.5, condition: "Passing Showers" }, { name: "New Delhi", temp_c: 34.0, condition: "Hazy Sunshine" }], flight_alerts: { status: "Normal", details: "All flights operating on schedule." }, packing_suggestions: "Bring a warm jacket for the evening. Cool ocean breezes make it feel colder." },
    family: { school_commute: "Clear roads. Great weather for outdoor after-school sports.", rain_alerts: "0% probability of rain.", severe_warning: null },
    agriculture: { soil_moisture_pct: 54.8, rainfall_prediction_24h_mm: 0, frost_alert: true, seasonal_planting_guidance: "Frost alert for overnight in outlying valleys. Cover tender plants. Ideal pruning weather." },
    commute: { traffic_status: "Heavy traffic crossing Harbour Bridge. Dry roads.", visibility_alert: "Perfect visibility (10km+). Clear skies.", storm_fog_alert: "No travel hazards." },
    event_planner: { extended_comfort: "Crisp and clear. Excellent for outdoor gatherings, but provide patio heaters for evening comfort. 0% rain risk.", rain_probability_pct: 0 }
  },
  new_york: {
    location: { name: "New York", country: "United States", timezone: "America/New_York", localTime: "2026-08-30 04:10" },
    current: { temp_c: 24.0, condition: { text: "Sunny and Warm", code: 1000, icon: "sunny" }, humidity: 55, uv: 7.0, wind_kph: 10.5, wind_dir: "SSE", visibility_km: 10.0, pressure_mb: 1016 },
    aqi: { index: 62, label: "Moderate", pm25: 18.2, pm10: 28.4, no2: 15.6, o3: 31.0 },
    pollen: { grass: "Moderate", tree: "Low", weed: "High" },
    fitness: { sunrise: "06:16 AM", sunset: "07:35 PM", best_running_hours: ["06:30 AM - 08:30 AM", "06:30 PM - 08:00 PM"], heat_alert: false, comfort_index: 85 },
    marine: { sea_condition: "Gentle swell", wave_height_m: 0.8, water_temp_c: 22.0, tide_timings: [{ time: "02:14 AM", type: "High", height_m: 1.5 }, { time: "08:32 AM", type: "Low", height_m: 0.2 }, { time: "02:44 PM", type: "High", height_m: 1.6 }] },
    travel: { saved_destinations: [{ name: "London", temp_c: 16.0, condition: "Drizzle" }, { name: "Sydney", temp_c: 14.2, condition: "Clear" }], flight_alerts: { status: "Normal", details: "All local airports (JFK, LGA, EWR) operating normally." }, packing_suggestions: "Pack light, breathable cotton layers. Perfect weather for walking in Central Park." },
    family: { school_commute: "Normal traffic on FDR Drive. Dry roads. Perfect school walk conditions.", rain_alerts: "No rain expected.", severe_warning: null },
    agriculture: { soil_moisture_pct: 48.2, rainfall_prediction_24h_mm: 0, frost_alert: false, seasonal_planting_guidance: "Normal watering schedule. Good window for harvesting tomatoes and summer squash." },
    commute: { traffic_status: "Minor construction delays on Brooklyn Bridge. Dry streets.", visibility_alert: "Excellent visibility (10km+). Clear skies.", storm_fog_alert: "No storm or fog warnings." },
    event_planner: { extended_comfort: "Warm and pleasant comfort index. Ideal conditions for outdoor events or weddings. 5% chance of rain.", rain_probability_pct: 5 }
  }
};
