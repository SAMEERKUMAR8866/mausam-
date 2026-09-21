// src/data/mock-recommendations.ts
// Mock AI recommendations for development (used when Gemini API key is not set)

export const MOCK_RECS_DB: Record<string, Record<string, string>> = {
  mumbai: {
    health: "PM2.5 levels are low (12.4 µg/m³), indicating excellent air quality (AQI 48). With moderate UV (6.0), consider a short outdoor walk but apply SPF 30+. Pollen levels are low, making it a safe day for asthma and allergy sufferers.",
    fitness: "Warm weather (29.5°C) and high humidity (88%) will increase sweat rates. The best running hours are 6:30 AM - 7:30 AM or after 6:30 PM. Watch for slippery paths from passing showers.",
    marine: "Moderate chop with 1.8m waves. Sea surface temperature is 27.5°C. High tides at 8:14 AM (3.8m) and 8:35 PM (4.1m). Surfers should catch the clean sets early; recreational swimmers should remain cautious during rising tides.",
    travel: "Travelers heading to London should pack rainwear as drizzle is active (16°C). For flights leaving Mumbai, note minor delays due to monsoon wind shear; double check departure times before heading out.",
    family: "Expect school commute delays due to wet roads. Light rain predicted near 3:00 PM, so pack raincoats and boots for school pickups.",
    agriculture: "Paddy fields have optimal moisture (82.5%) after 18.4mm rainfall. Sowing okra or spinach is highly favorable. Suspend manual watering today to avoid root rot.",
    commute: "Traffic congestion is slow on Western Express Highway due to lane narrowing. Visibility is normal (8km), but maintain extra braking distance on wet tarmac.",
    event_planner: "Comfort index is high/sticky due to 88% humidity. If planning outdoor gatherings or weddings, ensure marquee shade and portable cooling fans are available. 40% probability of rain suggests a tent backup is wise."
  },
  new_delhi: {
    health: "Air Quality is POOR (AQI 245, PM2.5 112.5 µg/m³). Health-sensitive individuals, asthmatics, and children should limit outdoor exposure and wear N95 masks. Very high UV Index (9.0) means sunburn can occur in 15 minutes.",
    fitness: "High heat alerts active. Outdoor workouts are strongly discouraged during midday. The best running hours are 5:00 AM - 6:15 AM or after 7:30 PM. Hydrate intensely before and during activities.",
    marine: "Inland location. Sea conditions are not applicable. Local lakes are calm, but high heat means rapid evaporation.",
    travel: "For travelers visiting Sydney, pack warm winter gear as it's clear but cold (14.2°C). High UV warning in Delhi: carry a wide-brimmed hat, SPF 50+, and hydration packs.",
    family: "School commute is normal, but smog conditions mean school recess should be held indoors. High UV Warning: apply sunscreen to children before they leave for school.",
    agriculture: "Soil moisture is very low (31.2%). Manual irrigation is required for wheat crops and saplings this evening. Mulch around plants to reduce water loss.",
    commute: "Dry roads, but visibility is reduced to 3km due to hazy smog. Use low beams in dusty zones and expect delays near Connaught Place.",
    event_planner: "Extreme heat risk. Shaded tents, outdoor air-coolers, and mist fans are mandatory for guest safety. Rain probability is 0%, eliminating precipitation concerns."
  },
  london: {
    health: "AQI is excellent (28). However, high humidity (92%) and dampness may trigger joint sensitivity. Pollen counts are negligible, providing relief to hay fever sufferers.",
    fitness: "Cool temperatures (16.0°C) and light drizzle make for refreshing runs. The best running hours are 10:00 AM - 12:00 PM and 4:00 PM - 6:00 PM. Wear reflective gear for low-light visibility.",
    marine: "Rough swell with 2.4m waves. Water temperature is cold (14.5°C). High tide at 5:42 PM (5.6m). Surfers should wear a 4/3mm wetsuit; swimming not advised due to strong rip currents.",
    travel: "Flights arriving at Heathrow are experiencing 10-15 minute delays due to low cloud cover. Ensure you pack a warm fleece and high-quality raincoat.",
    family: "Carry umbrellas for walking school commutes. Intermittent drizzle all day with continuous rain during school pickup (3:30 PM). Dress children in waterproof jackets.",
    agriculture: "High soil moisture (78.4%). Excellent window for planting autumn brassicas like cabbage and kale. Protect newly sown seeds from birds with netting.",
    commute: "Slippery roads and mist. Congestion on M25 is high. Drive with fog lights on and double your standard stopping distance behind other vehicles.",
    event_planner: "Outdoor gatherings will be cold and damp. Indoor options are highly recommended. Rain probability is 80%, so outdoor marquee setups must be fully waterproof."
  },
  sydney: {
    health: "Excellent air quality (AQI 32) and clean ocean breeze. Low UV Index (1.0) and negligible pollen makes it a great day for allergy-prone individuals to spend time outdoors.",
    fitness: "Crisp autumn weather (14.2°C). Ideal running conditions. Best running hours are 6:30 AM - 8:30 AM and 3:30 PM - 5:00 PM. Keep muscles warm with full-length running tights.",
    marine: "Clean offshore swell with 1.5m waves and west winds. Water temp is 18.0°C. Best tide for surfing is rising tide between 8:00 AM and 11:30 AM. Standard 3/2mm wetsuit recommended.",
    travel: "Flights are operating normally. Travelers visiting Mumbai or Delhi should pack light, breathable layers. Sydney evening is cold; pack a windproof jacket.",
    family: "Clear roads and sunny skies. Ideal day for walking to school and outdoor sports. Kids will need sweaters for after-school outdoor play.",
    agriculture: "Overnight frost alert active for low-lying valleys. Cover tender crops (tomatoes, herbs) tonight. Frost is highly beneficial for pruning stone fruit trees.",
    commute: "Dry pavement and excellent visibility (10km+). Congestion reported crossing Harbour Bridge, but weather-related hazards are zero.",
    event_planner: "Perfect conditions for outdoor events or weddings. Clear skies, but evening temperatures will drop. Providing patio heaters or fire pits will enhance guest comfort."
  },
  new_york: {
    health: "AQI is moderate (62). Weed pollen is high today; sensitive allergy sufferers should take preventative medication and rinse off after spending time outdoors.",
    fitness: "Warm and clear day (24.0°C). Best running hours are early morning (6:30 AM - 8:30 AM) or sunset (6:30 PM - 8:00 PM) to avoid peak midday sun.",
    marine: "Gentle swell (0.8m wave height) with warm water temperature (22.0°C). Tides are low at 8:32 AM and high at 2:44 PM. Perfect conditions for family beach walks or paddleboarding.",
    travel: "Local airports (JFK, LGA, EWR) report normal flight schedules. Packing suggestion: standard summer clothes, comfortable sneakers for walking, and a light jacket for air-conditioned rooms.",
    family: "Ideal day for walking school commutes. Clear dry pavements. No rain gear needed. Great day for an after-school picnic in Central Park.",
    agriculture: "Soil moisture is average (48.2%). Normal irrigation schedule. Ideal window for harvesting ripe tomatoes, eggplants, and summer squash.",
    commute: "Dry, clear streets. Minor construction delays on Brooklyn Bridge, but overall commute conditions are excellent.",
    event_planner: "Highly pleasant comfort index. Ideal conditions for outdoor garden parties or rooftop weddings. Rain risk is negligible (5%)."
  }
};
