// src/data/mock-recommendations.ts
// Simple, clear AI recommendations for development (used when Gemini API key is not set)

export const MOCK_RECS_DB: Record<string, Record<string, string>> = {
  mumbai: {
    health: "Air quality is clean and fresh (AQI 48). The sun is moderately bright, so wear a hat or apply sunscreen for walks. Low pollen makes it a safe, pleasant day for everyone.",
    fitness: "Warm and humid weather (29.5°C). You will sweat quickly, so drink plenty of water. The best running hours are early morning (6:30–7:30 AM) or after sunset.",
    marine: "Gentle sea breeze and moderate waves (1.8m). Safe for coastal fishing boats. Swimmers should stay close to designated safe beach areas during rising tides.",
    travel: "Passing rain showers in Mumbai. Travelers heading out should keep an umbrella handy and check flight status before leaving for the airport.",
    family: "Wet roads and passing rain showers near 3:00 PM. Give kids raincoats or umbrellas for school pickup.",
    agriculture: "Recent rain (18 mm) has left paddy fields nice and moist. Great time for planting vegetables like okra or spinach. No need to water today to protect roots from rotting.",
    commute: "Wet roads and slow traffic on Western Express Highway. Keep extra braking distance behind vehicles ahead.",
    event_planner: "Warm and humid evening. If planning an outdoor gathering, set up shaded tents with cooling fans. Keep indoor backup options ready in case of rain."
  },
  new_delhi: {
    health: "Air quality is poor (AQI 245). People with breathing difficulties, seniors, and children should stay indoors and wear a face mask when going outside.",
    fitness: "Hot afternoon weather. Avoid heavy exercise in the middle of the day. Exercise early in the morning before 6:30 AM and drink plenty of water.",
    marine: "Inland area. Sea tides do not apply here. Local lakes are calm, but water evaporates quickly in the afternoon heat.",
    travel: "Hot and sunny in Delhi. Carry a water bottle, sunglasses, and wear sunscreen when heading out for sightseeing.",
    family: "Smoggy air outdoors. Children should play inside today, and drink plenty of water throughout the day.",
    agriculture: "Soil is very dry. Give wheat crops and garden plants a good watering this evening. Spread dry leaves or grass (mulch) around plants to keep moisture in the soil.",
    commute: "Hazy roads with reduced visibility. Drive carefully with headlights on and expect mild traffic delays near city center.",
    event_planner: "Hot day ahead. Provide plenty of shade, cool drinking water, and mist fans for your guests. No rain expected."
  },
  london: {
    health: "Air is clean and fresh (AQI 28). Cool and damp weather outside; dress warmly if sensitive to joint stiffness.",
    fitness: "Cool weather (16°C) with light drizzle. Great for a refreshing jog. Wear bright or reflective clothing in low light.",
    marine: "Rough waves (2.4m) and cold water. Swimming is not recommended today due to strong water currents.",
    travel: "Low clouds and light rain around London airports. Pack a warm sweater and a waterproof raincoat for your trip.",
    family: "Light drizzle throughout the day. Pack umbrellas for school travel and dress children in waterproof jackets.",
    agriculture: "Soil is moist and ready for planting winter vegetables like cabbage and kale. Put light netting over fresh seeds to protect them from birds.",
    commute: "Wet and slippery roads with morning mist. Drive with fog lights on and keep extra distance from other cars.",
    event_planner: "Damp and cold weather with high chance of rain. Indoor halls or fully waterproof marquee tents are recommended."
  },
  sydney: {
    health: "Clean ocean breeze and fresh air (AQI 32). Great weather to spend time outdoors with family.",
    fitness: "Crisp, pleasant weather (14°C). Ideal running conditions. Best running hours are morning (6:30–8:30 AM) or late afternoon.",
    marine: "Clean, gentle waves (1.5m) and sunny skies. Great day for surfing, paddleboarding, and family beach walks.",
    travel: "Flights and trains are running on schedule. Sydney evenings turn cool, so pack a light windproof jacket.",
    family: "Clear sunny skies and dry paths. Perfect day for walking to school and outdoor playground games.",
    agriculture: "Cold frost is expected tonight. Cover tender vegetables (like tomatoes and herbs) with cloths to protect them from frost damage.",
    commute: "Dry roads and clear visibility across all main routes. Smooth transit conditions with no weather delays.",
    event_planner: "Sunny skies and pleasant conditions for outdoor events. Keep outdoor patio heaters ready for when the temperature drops in the evening."
  },
  new_york: {
    health: "Moderate air quality (AQI 62) with some weed pollen. Keep allergy medicine handy if sensitive to outdoor dust or pollen.",
    fitness: "Warm, clear day (24°C). Best workout hours are early morning (6:30–8:30 AM) or sunset to avoid the midday sun.",
    marine: "Gentle waves and warm water. Great conditions for seaside strolls, paddleboarding, and family beach time.",
    travel: "Clear skies and normal flight schedules across local airports. Wear comfortable walking shoes and pack sunglasses.",
    family: "Sunny, dry pavements. Great day for walking kids to school or having an afternoon picnic in the park.",
    agriculture: "Soil moisture is good. Great day for picking ripe tomatoes, eggplants, and squash from your garden.",
    commute: "Dry streets and clear driving conditions. Smooth transit across highways and bridges.",
    event_planner: "Pleasant, clear weather. Ideal conditions for outdoor garden parties and rooftop gatherings."
  }
};
