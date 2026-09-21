// src/data/personas.ts
// 12 Full Persona Definitions matching Mausam specification

export interface PersonaDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  badge: string;
  accentColor: string;
  primaryMetrics: string[];
  defaultLocation?: string;
}

export const PERSONAS: Record<string, PersonaDefinition> = {
  farmer: {
    id: "farmer",
    name: "Farmer / Agriculture",
    category: "Agri-Intelligence",
    icon: "🌾",
    description: "Hyperlocal crop advisory, root-zone soil saturation, and rainfall nowcasting",
    badge: "Kisan Intel",
    accentColor: "emerald",
    primaryMetrics: ["Soil Moisture", "24h Rain", "Ambient Temp", "Crop Risk"]
  },
  agriculture: {
    id: "agriculture",
    name: "Farmer / Agriculture",
    category: "Agri-Intelligence",
    icon: "🌾",
    description: "Hyperlocal crop advisory, root-zone soil saturation, and rainfall nowcasting",
    badge: "Kisan Intel",
    accentColor: "emerald",
    primaryMetrics: ["Soil Moisture", "24h Rain", "Ambient Temp", "Crop Risk"]
  },
  health: {
    id: "health",
    name: "Health-Conscious",
    category: "Wellness & Air",
    icon: "🌿",
    description: "Air quality alerts, pollen forecasts, UV index, and respiratory safety",
    badge: "Health Intel",
    accentColor: "emerald",
    primaryMetrics: ["AQI Index", "Pollen Count", "UV Index", "Humidity"]
  },
  fitness: {
    id: "fitness",
    name: "Outdoor Fitness",
    category: "Sports & Training",
    icon: "🏃",
    description: "Best running hours, heat stress warnings, wind gusts, and hydration index",
    badge: "Performance",
    accentColor: "cyan",
    primaryMetrics: ["Running Hours", "Sunrise / Set", "Wind Gusts", "Heat Stress"]
  },
  maritime: {
    id: "maritime",
    name: "Beach & Maritime",
    category: "Coastal & Fleet",
    icon: "🏄",
    description: "Ocean swell height, tide cycles, squall warnings, and sea surface temperature",
    badge: "Coastal Intel",
    accentColor: "cyan",
    primaryMetrics: ["Swell Height", "Tide Cycles", "Sea Temp", "Squall Alert"]
  },
  travel: {
    id: "travel",
    name: "Travelers",
    category: "Navigation & Transit",
    icon: "✈️",
    description: "Multi-city trackers, airport runway delay alerts, and luggage packing advice",
    badge: "Voyage",
    accentColor: "amber",
    primaryMetrics: ["Flight Status", "Luggage Tips", "Destination Temp", "Rain Radar"]
  },
  family: {
    id: "family",
    name: "Parents & Families",
    category: "Daily Routines",
    icon: "🎒",
    description: "School commute road safety, rain timelines, and severe weather warnings",
    badge: "Family Safety",
    accentColor: "pink",
    primaryMetrics: ["Commute Index", "Rain Timeline", "Severe Alerts", "Comfort"]
  },
  commute: {
    id: "commute",
    name: "Daily Commuters",
    category: "Urban Mobility",
    icon: "🚗",
    description: "Highway traffic weather index, fog/visibility warnings, and storm tracking",
    badge: "Transit",
    accentColor: "blue",
    primaryMetrics: ["Highway Status", "Visibility", "Storm Warning", "Tarmac Temp"]
  },
  event_planner: {
    id: "event_planner",
    name: "Event Planners",
    category: "Occasions & Gatherings",
    icon: "📅",
    description: "12-hour gathering comfort rating, rain probability, and gust alerts",
    badge: "Event Ops",
    accentColor: "violet",
    primaryMetrics: ["Event Comfort", "Rain Chance", "Wind Safety", "Thermal Load"]
  },
  aviation: {
    id: "aviation",
    name: "Aviation & Aerospace",
    category: "Flight Operations",
    icon: "✈️",
    description: "METAR observations, cloud ceiling AGL, density altitude, and wind shear vectors",
    badge: "ICAO / METAR",
    accentColor: "sky",
    primaryMetrics: ["Cloud Ceiling", "Visibility", "Density Alt", "Wind Shear"]
  },
  logistics: {
    id: "logistics",
    name: "Logistics & Transport",
    category: "Fleet Logistics",
    icon: "🚚",
    description: "Highway asphalt temperature, crosswind stability, and 60-min nowcast",
    badge: "Fleet Ops",
    accentColor: "amber",
    primaryMetrics: ["Road Temp", "Crosswind", "Nowcast (60m)", "Route Risk"]
  },
  construction: {
    id: "construction",
    name: "Construction & Infra",
    category: "Heavy Civil Works",
    icon: "🏗️",
    description: "Tower crane gust limits, concrete curing windows, and worker WBGT heat stress",
    badge: "OSHA Safety",
    accentColor: "orange",
    primaryMetrics: ["Crane Gusts", "Pour Window", "WBGT Heat", "Soil Traction"]
  },
  energy: {
    id: "energy",
    name: "Energy & Grid Utilities",
    category: "Renewable Dispatch",
    icon: "⚡",
    description: "Solar GHI/DNI irradiance, 100m hub wind velocity, and grid degree-days load",
    badge: "Grid Intel",
    accentColor: "yellow",
    primaryMetrics: ["Solar GHI", "100m Wind", "Degree Days", "Lightning"]
  }
};

export const PERSONA_LIST: PersonaDefinition[] = [
  PERSONAS.farmer,
  PERSONAS.health,
  PERSONAS.fitness,
  PERSONAS.maritime,
  PERSONAS.travel,
  PERSONAS.family,
  PERSONAS.commute,
  PERSONAS.event_planner,
  PERSONAS.aviation,
  PERSONAS.logistics,
  PERSONAS.construction,
  PERSONAS.energy
];
