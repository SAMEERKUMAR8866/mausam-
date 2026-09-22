// src/data/profileControls.ts
// Configuration for dynamic persona selection controls (e.g. Target Crop & Growth Stage for Farmer)

export interface SelectorOption {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

export interface ProfileControlGroup {
  groupId: string;
  title: string;
  subTitle: string;
  icon: string;
  options: SelectorOption[];
}

export interface PersonaProfileConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  badges: string[];
  controls: ProfileControlGroup[];
  kpiCards: {
    id: string;
    label: string;
    unit: string;
    defaultVal: string;
    defaultBadge: string;
    defaultProgress: number;
    description: string;
    icon: string;
  }[];
  defaultOperations: {
    id: string;
    task: string;
    status: 'urgent' | 'recommended' | 'safe';
    category: string;
  }[];
  hazards: {
    id: string;
    title: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    desc: string;
  }[];
}

export const PROFILE_CONFIGS: Record<string, PersonaProfileConfig> = {
  farmer: {
    id: "farmer",
    name: "Farmer",
    title: "Farmer / Precision Agriculture",
    subtitle: "Hyperlocal crop advisory, root-zone soil saturation, and rainfall nowcasting",
    icon: "🌾",
    badges: ["PERSONALIZED VIEW", "KISAN INTEL", "Agronomy"],
    controls: [
      {
        groupId: "target_crop",
        title: "TARGET CROP",
        subTitle: "Select standing target crop",
        icon: "🌱",
        options: [
          { id: "Wheat", label: "Wheat", subLabel: "गेहूं (Cereal)", icon: "🌾", badge: "Rabi", badgeColor: "emerald" },
          { id: "Rice", label: "Rice / Paddy", subLabel: "धान (Wetland)", icon: "🍚", badge: "Kharif", badgeColor: "cyan" },
          { id: "Maize", label: "Maize", subLabel: "मक्का (Corn)", icon: "🌽", badge: "Coarse", badgeColor: "amber" },
          { id: "Cotton", label: "Cotton", subLabel: "कपास (Fiber)", icon: "☁️", badge: "Cash", badgeColor: "violet" },
          { id: "Sugarcane", label: "Sugarcane", subLabel: "गन्ना (Sugar)", icon: "🎋", badge: "Annual", badgeColor: "emerald" }
        ]
      },
      {
        groupId: "growth_stage",
        title: "GROWTH STAGE",
        subTitle: "Current phenological phase",
        icon: "⚙️",
        options: [
          { id: "Sowing", label: "1 Sowing", subLabel: "Seedbed & Emergence" },
          { id: "Vegetative", label: "2 Vegetative", subLabel: "Crown Root & Tillering" },
          { id: "Flowering", label: "3 Flowering", subLabel: "Boot Leaf & Anthesis" },
          { id: "Harvesting", label: "4 Harvesting", subLabel: "Grain Ripening & Cut" }
        ]
      }
    ],
    kpiCards: [
      {
        id: "soil_moisture",
        label: "SOIL MOISTURE & SATURATION",
        unit: "%",
        defaultVal: "58.5%",
        defaultBadge: "Optimal",
        defaultProgress: 58.5,
        description: "15cm root-depth capillary hydration buffer.",
        icon: "💧"
      },
      {
        id: "precip_24h",
        label: "24H PRECIPITATION FORECAST",
        unit: "mm",
        defaultVal: "4.5 mm",
        defaultBadge: "Rain Expected",
        defaultProgress: 45,
        description: "Dry field window suitable for spraying & weeding.",
        icon: "🌧️"
      },
      {
        id: "micro_climate",
        label: "AMBIENT MICRO-CLIMATE",
        unit: "°C",
        defaultVal: "29.6°C",
        defaultBadge: "Favorable",
        defaultProgress: 68,
        description: "RH 65% • Wind: 2.6 km/h ESE",
        icon: "🌡️"
      },
      {
        id: "crop_risk",
        label: "CROP RISK & YIELD HEALTH",
        unit: "",
        defaultVal: "Low Risk",
        defaultBadge: "Favorable",
        defaultProgress: 88,
        description: "Yield Health: 95% • No frost alerts active.",
        icon: "🛡️"
      }
    ],
    defaultOperations: [
      { id: "op-1", task: "Withhold foliar urea spraying before evening precipitation", status: "recommended", category: "Nutrient Mgmt" },
      { id: "op-2", task: "Ensure drainage trenches are clear around standing wheat plots", status: "urgent", category: "Drainage" },
      { id: "op-3", task: "Check for yellow rust or aphid activity on vegetative canopy", status: "safe", category: "Pest Scouting" }
    ],
    hazards: [
      { id: "haz-1", title: "Passing Rain Showers", severity: "moderate", desc: "Showers expected; delay chemical pesticide spraying until foliage dries." }
    ]
  },
  health: {
    id: "health",
    name: "Health-Conscious",
    title: "Health & Environmental Wellness",
    subtitle: "Real-time air pollutants, respiratory warnings, and UV skin protection advice",
    icon: "🌿",
    badges: ["WELLNESS INTEL", "Air Science"],
    controls: [
      {
        groupId: "health_profile",
        title: "HEALTH PROFILE",
        subTitle: "Tailor respiratory and allergen advisories",
        icon: "🫁",
        options: [
          { id: "Standard", label: "Standard Adult", subLabel: "General wellness & UV alerts", icon: "👤" },
          { id: "Asthma", label: "Asthma / Respiratory", subLabel: "High particulate sensitivity", icon: "🫁", badge: "Sensitive", badgeColor: "amber" },
          { id: "Senior", label: "Senior Citizen", subLabel: "Thermal & humidity protection", icon: "👵" },
          { id: "Child", label: "Toddler / Infant", subLabel: "Air & heat stress shield", icon: "👶" }
        ]
      }
    ],
    kpiCards: [
      { id: "aqi_kpi", label: "AIR QUALITY INDEX", unit: "AQI", defaultVal: "48 (Good)", defaultBadge: "Good", defaultProgress: 24, description: "PM2.5: 12.4 µg/m³ • PM10: 22.8 µg/m³", icon: "🍃" },
      { id: "pollen_kpi", label: "POLLEN ALLERGENS", unit: "", defaultVal: "Low", defaultBadge: "Minimal", defaultProgress: 15, description: "Grass: Low • Tree: Low • Weed: Negligible", icon: "🌸" },
      { id: "uv_kpi", label: "UV HAZARD INDEX", unit: "UVI", defaultVal: "6.0", defaultBadge: "Moderate", defaultProgress: 60, description: "Sunscreen SPF 30+ recommended outdoors.", icon: "☀️" },
      { id: "humidity_kpi", label: "AIR MOISTURE & DEW", unit: "%", defaultVal: "65%", defaultBadge: "Optimal", defaultProgress: 65, description: "Comfortable ambient breathing index.", icon: "💧" }
    ],
    defaultOperations: [
      { id: "op-h1", task: "Safe for outdoor breathing & exercises without N95 mask", status: "safe", category: "Respiratory" },
      { id: "op-h2", task: "Apply broad-spectrum sunscreen between 11:30 AM and 3:00 PM", status: "recommended", category: "UV Defense" }
    ],
    hazards: []
  },
  fitness: {
    id: "fitness",
    name: "Outdoor Fitness",
    title: "Outdoor Athletic Performance",
    subtitle: "Thermal comfort windows, hydration requirements, and sprint conditions",
    icon: "🏃",
    badges: ["ATHLETIC INTEL", "Physiology"],
    controls: [
      {
        groupId: "activity_type",
        title: "SPORT TYPE",
        subTitle: "Select training modality",
        icon: "🏅",
        options: [
          { id: "Running", label: "Long Distance Run", subLabel: "Pacing & thermal fatigue", icon: "🏃" },
          { id: "Cycling", label: "Road Cycling", subLabel: "Headwinds & wet grip", icon: "🚴" },
          { id: "Crossfit", label: "Outdoor HIIT", subLabel: "WBGT heat stress", icon: "🏋️" }
        ]
      }
    ],
    kpiCards: [
      { id: "run_hours", label: "OPTIMAL TRAINING WINDOW", unit: "", defaultVal: "06:00 - 07:30 AM", defaultBadge: "Optimal", defaultProgress: 90, description: "Coolest thermal index with gentle winds.", icon: "⏰" },
      { id: "heat_stress", label: "WBGT HEAT STRESS", unit: "", defaultVal: "Safe", defaultBadge: "Low Risk", defaultProgress: 25, description: "Hydrate with 500ml water per 45 min workout.", icon: "🔥" },
      { id: "wind_res", label: "AERODYNAMIC WIND", unit: "kph", defaultVal: "8.5 kph", defaultBadge: "Gentle", defaultProgress: 20, description: "Minimal aerodynamic drag on sprint routes.", icon: "💨" },
      { id: "comfort_fit", label: "PHYSIOLOGY COMFORT", unit: "/100", defaultVal: "84/100", defaultBadge: "Excellent", defaultProgress: 84, description: "Nominal sweat rate and core temperature stability.", icon: "⚡" }
    ],
    defaultOperations: [
      { id: "op-f1", task: "Schedule outdoor cardio session before 08:30 AM", status: "recommended", category: "Schedule" }
    ],
    hazards: []
  },
  maritime: {
    id: "maritime",
    name: "Beach & Maritime",
    title: "Coastal & Maritime Fleet Intelligence",
    subtitle: "Ocean swell dynamics, tidal cycle vectors, and coastal squall warnings",
    icon: "🏄",
    badges: ["OCEANIC INTEL", "IMO Compliant"],
    controls: [
      {
        groupId: "vessel_type",
        title: "VESSEL / CRAFT",
        subTitle: "Coastal craft specifications",
        icon: "🚢",
        options: [
          { id: "Surf", label: "Surfboard / Kayak", subLabel: "Wave break & rip currents", icon: "🏄" },
          { id: "Trawler", label: "Fishing Trawler", subLabel: "Coastal squall limits", icon: "🛥️" },
          { id: "Cargo", label: "Cargo Vessel", subLabel: "Deep sea draft & swell", icon: "🚢" }
        ]
      }
    ],
    kpiCards: [
      { id: "swell_kpi", label: "SIGNIFICANT SWELL HEIGHT", unit: "m", defaultVal: "1.4 m", defaultBadge: "Moderate", defaultProgress: 35, description: "Period: 8.5s from SW • Clean wave faces.", icon: "🌊" },
      { id: "tide_kpi", label: "COASTAL TIDE STATUS", unit: "", defaultVal: "Rising High Tide", defaultBadge: "Flood Tide", defaultProgress: 75, description: "Next peak: +2.1m at 18:30 IST.", icon: "🌕" },
      { id: "sst_kpi", label: "SEA SURFACE TEMP (SST)", unit: "°C", defaultVal: "27.5°C", defaultBadge: "Warm", defaultProgress: 70, description: "Coastal water surface thermal layer.", icon: "🌡️" },
      { id: "squall_kpi", label: "SQUALL & CHOP ALERT", unit: "", defaultVal: "Safe Seas", defaultBadge: "Normal", defaultProgress: 15, description: "No sudden gust fronts detected within 20 NM.", icon: "⚓" }
    ],
    defaultOperations: [
      { id: "op-m1", task: "Safe for nearshore surfing and small craft navigation", status: "safe", category: "Navigation" }
    ],
    hazards: []
  },
  aviation: {
    id: "aviation",
    name: "Aviation & Aerospace",
    title: "Aviation & Aerospace Flight Operations",
    subtitle: "METAR observations, cloud ceiling AGL, density altitude, and wind shear vectors",
    icon: "✈️",
    badges: ["ICAO / METAR", "Aviation Intel"],
    controls: [
      {
        groupId: "flight_rule",
        title: "FLIGHT RULES",
        subTitle: "Operational flight category",
        icon: "🛫",
        options: [
          { id: "VFR", label: "VFR General Aviation", subLabel: "Visual meteorological limits", icon: "🛩️", badge: "VFR", badgeColor: "emerald" },
          { id: "IFR", label: "IFR Commercial", subLabel: "Instrument landing approaches", icon: "✈️", badge: "IFR", badgeColor: "cyan" },
          { id: "UAV", label: "Drone / UAV Fleet", subLabel: "400ft AGL micro-gusts", icon: "🛸", badge: "UAV", badgeColor: "violet" }
        ]
      }
    ],
    kpiCards: [
      { id: "ceiling_kpi", label: "CLOUD CEILING (AGL)", unit: "ft", defaultVal: "4,500 ft", defaultBadge: "VFR Nominal", defaultProgress: 75, description: "Cloud base above ground level.", icon: "☁️" },
      { id: "vis_kpi", label: "FLIGHT VISIBILITY", unit: "SM", defaultVal: "6.2 SM", defaultBadge: "Clear", defaultProgress: 90, description: "METAR AUTO 12KT 9999 CLR.", icon: "👁️" },
      { id: "density_kpi", label: "DENSITY ALTITUDE", unit: "ft", defaultVal: "1,850 ft", defaultBadge: "Normal", defaultProgress: 30, description: "Engine & lift performance factor.", icon: "📈" },
      { id: "shear_kpi", label: "CROSSWIND COMPONENT", unit: "kt", defaultVal: "8 kt X-Wind", defaultBadge: "Low Risk", defaultProgress: 25, description: "No microburst or wind shear alert.", icon: "💨" }
    ],
    defaultOperations: [
      { id: "op-av1", task: "Runway conditions nominal for visual approaches", status: "safe", category: "Flight Ops" }
    ],
    hazards: []
  },
  travel: {
    id: "travel",
    name: "Travelers",
    title: "Travel & Multi-City Navigator",
    subtitle: "Destination trackers, airline delays, and smart luggage packing advice",
    icon: "✈️",
    badges: ["VOYAGE INTEL", "Luggage Tips"],
    controls: [],
    kpiCards: [
      { id: "flight_kpi", label: "AIRPORT DEPARTURE STATUS", unit: "", defaultVal: "On Schedule", defaultBadge: "Normal", defaultProgress: 95, description: "No major weather holds active.", icon: "🛫" },
      { id: "pack_kpi", label: "LUGGAGE PACKING", unit: "", defaultVal: "Light Layers", defaultBadge: "Advised", defaultProgress: 50, description: "Warm afternoon, cool breeze at night.", icon: "🧳" },
      { id: "dest_kpi", label: "SAVED DESTINATIONS", unit: "", defaultVal: "2 Tracked", defaultBadge: "Syncing", defaultProgress: 100, description: "London 16°C • New York 24°C", icon: "🌍" },
      { id: "comfort_tr", label: "TRANSIT COMFORT", unit: "", defaultVal: "Excellent", defaultBadge: "Optimal", defaultProgress: 88, description: "Pleasant outdoor sightseeing conditions.", icon: "🚶" }
    ],
    defaultOperations: [],
    hazards: []
  },
  family: {
    id: "family",
    name: "Parents & Families",
    title: "Family Routines & School Safety",
    subtitle: "School commute road safety, rain timelines, and severe weather warnings",
    icon: "🎒",
    badges: ["FAMILY FIRST", "Daily Safety"],
    controls: [],
    kpiCards: [
      { id: "sch_kpi", label: "SCHOOL COMMUTE INDEX", unit: "", defaultVal: "Dry Roads", defaultBadge: "Safe", defaultProgress: 90, description: "Normal transit with clear visibility.", icon: "🚌" },
      { id: "rain_fam_kpi", label: "RAIN TIMELINE", unit: "", defaultVal: "Dry until 5 PM", defaultBadge: "Clear", defaultProgress: 80, description: "Carry light umbrella for evening.", icon: "🌂" },
      { id: "play_kpi", label: "PLAYGROUND WEATHER", unit: "", defaultVal: "Ideal", defaultBadge: "Safe", defaultProgress: 85, description: "UV Index moderate, playground friendly.", icon: "⚽" },
      { id: "warn_fam_kpi", label: "SEVERE WEATHER BULLETINS", unit: "", defaultVal: "None Active", defaultBadge: "Nominal", defaultProgress: 10, description: "No thunderstorms or lightning advisories.", icon: "🛡️" }
    ],
    defaultOperations: [],
    hazards: []
  },
  commute: {
    id: "commute",
    name: "Daily Commuters",
    title: "Urban Commute & Highway Transit",
    subtitle: "Highway traffic weather index, fog/visibility warnings, and storm tracking",
    icon: "🚗",
    badges: ["MOBILITY INTEL", "Live Transit"],
    controls: [],
    kpiCards: [
      { id: "traffic_kpi", label: "HIGHWAY TRAFFIC INDEX", unit: "", defaultVal: "Normal Flow", defaultBadge: "Clear", defaultProgress: 85, description: "Tarmac dry, minimal delays on expressways.", icon: "🛣️" },
      { id: "vis_com_kpi", label: "ROAD VISIBILITY", unit: "km", defaultVal: "10 km", defaultBadge: "Excellent", defaultProgress: 95, description: "Clear line of sight, no fog blankets.", icon: "👀" },
      { id: "tarmac_kpi", label: "TARMAC SURFACE TEMP", unit: "°C", defaultVal: "34°C", defaultBadge: "Normal", defaultProgress: 55, description: "Optimal tire grip and stopping distances.", icon: "🚗" },
      { id: "storm_com_kpi", label: "STORM / SQUALL WARNING", unit: "", defaultVal: "No Warnings", defaultBadge: "Safe", defaultProgress: 10, description: "No sudden downpours on evening routes.", icon: "⚡" }
    ],
    defaultOperations: [],
    hazards: []
  },
  event_planner: {
    id: "event_planner",
    name: "Event Planners",
    title: "Event Planning & Outdoor Gatherings",
    subtitle: "12-hour gathering comfort rating, rain probability, and gust alerts",
    icon: "📅",
    badges: ["EVENT OPS", "Venue Intel"],
    controls: [],
    kpiCards: [
      { id: "event_comf_kpi", label: "VENUE COMFORT INDEX", unit: "/100", defaultVal: "82/100", defaultBadge: "Outdoor Ready", defaultProgress: 82, description: "Comfortable ambient thermal environment.", icon: "🎪" },
      { id: "rain_ev_kpi", label: "RAIN PROBABILITY (12H)", unit: "%", defaultVal: "15%", defaultBadge: "Low Risk", defaultProgress: 15, description: "Open-air lawn setups suitable.", icon: "☔" },
      { id: "gust_ev_kpi", label: "CANOPY / TENT GUST LIMIT", unit: "kph", defaultVal: "12 kph", defaultBadge: "Safe", defaultProgress: 25, description: "Wind speeds well below marquee anchor limits.", icon: "⛺" },
      { id: "thermal_ev_kpi", label: "EVENING RADIATIVE DROP", unit: "°C", defaultVal: "24°C @ 8 PM", defaultBadge: "Mild", defaultProgress: 60, description: "Provide light ambient patio heaters if needed.", icon: "🌙" }
    ],
    defaultOperations: [],
    hazards: []
  },
  logistics: {
    id: "logistics",
    name: "Logistics & Transport",
    title: "Logistics & Highway Fleet Transport",
    subtitle: "Highway asphalt temperature, crosswind stability, and 60-min nowcast",
    icon: "🚚",
    badges: ["FLEET INTEL", "Logistics Ops"],
    controls: [],
    kpiCards: [
      { id: "road_kpi", label: "ROAD SURFACE TEMP", unit: "°C", defaultVal: "34°C", defaultBadge: "Safe Grip", defaultProgress: 60, description: "No hydroplaning or ice hazard.", icon: "🛣️" },
      { id: "wind_log_kpi", label: "HIGHWAY CROSSWIND", unit: "kph", defaultVal: "14.5 kph", defaultBadge: "Stable", defaultProgress: 30, description: "High-cube trailer lateral stability nominal.", icon: "💨" },
      { id: "nowcast_kpi", label: "PRECIPITATION NOWCAST", unit: "", defaultVal: "Dry Window (90m)", defaultBadge: "Clear", defaultProgress: 90, description: "No route slowdowns expected next 90 min.", icon: "⏱️" },
      { id: "delay_kpi", label: "TRANSIT DELAY HAZARD", unit: "", defaultVal: "Low Delay Risk", defaultBadge: "On-Time", defaultProgress: 15, description: "Expressway corridors operating at speed.", icon: "📦" }
    ],
    defaultOperations: [],
    hazards: []
  },
  construction: {
    id: "construction",
    name: "Construction & Infra",
    title: "Construction & Civil Infrastructure",
    subtitle: "Tower crane gust limits, concrete curing windows, and worker WBGT heat stress",
    icon: "🏗️",
    badges: ["OSHA INTEL", "Site Safety"],
    controls: [],
    kpiCards: [
      { id: "crane_kpi", label: "TOWER CRANE GUST LIMIT", unit: "%", defaultVal: "32% of Max", defaultBadge: "Safe", defaultProgress: 32, description: "Wind gusts well below 38 kph OSHA limit.", icon: "🏗️" },
      { id: "pour_kpi", label: "CONCRETE POUR SUITABILITY", unit: "", defaultVal: "Ideal Pour Window", defaultBadge: "Approved", defaultProgress: 95, description: "Curing temperature and humidity optimal.", icon: "🧱" },
      { id: "wbgt_kpi", label: "WORKER WBGT HEAT STRESS", unit: "", defaultVal: "Safe Level", defaultBadge: "Green", defaultProgress: 20, description: "Standard 15 min rest breaks per 2 hours.", icon: "👷" },
      { id: "soil_const_kpi", label: "GROUND TRACTION SATURATION", unit: "%", defaultVal: "48%", defaultBadge: "Firm", defaultProgress: 48, description: "Heavy earthmoving machinery traction stable.", icon: "🚜" }
    ],
    defaultOperations: [],
    hazards: []
  },
  energy: {
    id: "energy",
    name: "Energy & Grid Utilities",
    title: "Renewable Energy & Grid Utilities",
    subtitle: "Solar GHI/DNI irradiance, 100m hub wind velocity, and grid degree-days load",
    icon: "⚡",
    badges: ["GRID INTEL", "Dispatch Ops"],
    controls: [],
    kpiCards: [
      { id: "solar_kpi", label: "SOLAR GHI IRRADIANCE", unit: "W/m²", defaultVal: "780 W/m²", defaultBadge: "High Output", defaultProgress: 85, description: "GHI: 780 W/m² • DNI: 640 W/m² peak generation.", icon: "☀️" },
      { id: "wind100_kpi", label: "100M HUB WIND VELOCITY", unit: "kph", defaultVal: "37 kph", defaultBadge: "Generation Peak", defaultProgress: 75, description: "Wind turbine capacity factor at 82%.", icon: "🌀" },
      { id: "hdd_cdd_kpi", label: "GRID THERMAL DEMAND", unit: "", defaultVal: "CDD: 11.5", defaultBadge: "Moderate", defaultProgress: 55, description: "Cooling air conditioning load index.", icon: "⚡" },
      { id: "light_kpi", label: "LIGHTNING STRIKE RADIUS", unit: "km", defaultVal: "No strikes in 35km", defaultBadge: "Clear", defaultProgress: 5, description: "Substation transmission lines secure.", icon: "🌩️" }
    ],
    defaultOperations: [],
    hazards: []
  }
};

export function getProfileConfig(personaId: string): PersonaProfileConfig {
  return PROFILE_CONFIGS[personaId] || PROFILE_CONFIGS.farmer;
}

export interface OperationItem {
  id: string;
  task: string;
  status: 'urgent' | 'recommended' | 'safe';
  category: string;
}

export function getDynamicOperationsForPersona(
  personaId: string,
  customSettings: Record<string, any> = {},
  weatherData?: any
): OperationItem[] {
  const normPersona = (personaId === 'agriculture' ? 'farmer' : personaId).toLowerCase();
  const config = PROFILE_CONFIGS[normPersona] || PROFILE_CONFIGS.farmer;

  // 1. Farmer: Filter by Crop & Growth Stage
  if (normPersona === 'farmer') {
    const crop = (customSettings.target_crop || customSettings.crop || 'Wheat').toLowerCase();
    const stage = (customSettings.growth_stage || customSettings.stage || 'Sowing').toLowerCase();

    // RICE / PADDY
    if (crop.includes('rice') || crop.includes('paddy') || crop.includes('dhan')) {
      if (stage.includes('sow') || stage.includes('nursery')) {
        return [
          { id: 'rice-sow-1', task: 'Keep 1 inch (2–3 cm) shallow standing water over nursery beds', status: 'urgent', category: 'Nursery Care' },
          { id: 'rice-sow-2', task: 'Treat paddy seeds in saltwater solution to select heavy seeds', status: 'recommended', category: 'Seed Treatment' },
          { id: 'rice-sow-3', task: 'Clear drainage channels around nursery to prevent seed washing', status: 'safe', category: 'Field Drainage' }
        ];
      }
      if (stage.includes('veg') || stage.includes('till')) {
        return [
          { id: 'rice-veg-1', task: 'Maintain 1 to 2 inches water layer while tillers branch out', status: 'urgent', category: 'Water Layer' },
          { id: 'rice-veg-2', task: 'Top-dress with 30 kg Urea per acre 20–25 days after transplanting', status: 'recommended', category: 'Fertilizer' },
          { id: 'rice-veg-3', task: 'Inspect stem base for stem borer holes or leaf rolls', status: 'safe', category: 'Pest Scouting' }
        ];
      }
      if (stage.includes('flow') || stage.includes('head')) {
        return [
          { id: 'rice-flow-1', task: 'Maintain continuous 2-inch standing water during flowering', status: 'urgent', category: 'Moisture Shield' },
          { id: 'rice-flow-2', task: 'Withhold chemical sprays during morning pollination (9 AM–11 AM)', status: 'recommended', category: 'Pollination' },
          { id: 'rice-flow-3', task: 'Check lower stems near water level for brown planthopper bugs', status: 'safe', category: 'Pest Watch' }
        ];
      }
      if (stage.includes('harv') || stage.includes('matur') || stage.includes('cut')) {
        return [
          { id: 'rice-harv-1', task: 'Drain field water completely 10 to 12 days before cutting', status: 'urgent', category: 'Field Drainage' },
          { id: 'rice-harv-2', task: 'Harvest when 85% of earheads turn dry golden yellow', status: 'recommended', category: 'Harvest Cut' },
          { id: 'rice-harv-3', task: 'Sun-dry harvested grains on clean tarpaulins to 12% moisture', status: 'safe', category: 'Grain Storage' }
        ];
      }
    }

    // WHEAT
    if (crop.includes('wheat') || crop.includes('gehun')) {
      if (stage.includes('sow')) {
        return [
          { id: 'wheat-sow-1', task: 'Sow seeds in rows 8 inches apart and 2 inches deep in moist soil', status: 'urgent', category: 'Sowing Depth' },
          { id: 'wheat-sow-2', task: 'Treat wheat seeds with bio-fertilizer before sowing', status: 'recommended', category: 'Seed Treatment' },
          { id: 'wheat-sow-3', task: 'Clear field furrows to prevent water stagnation in seed rows', status: 'safe', category: 'Field Drainage' }
        ];
      }
      if (stage.includes('veg') || stage.includes('till')) {
        return [
          { id: 'wheat-veg-1', task: 'Apply first light irrigation 20–25 days after sowing at crown root stage', status: 'urgent', category: 'First Irrigation' },
          { id: 'wheat-veg-2', task: 'Top-dress with 30 kg Urea per acre immediately following first watering', status: 'recommended', category: 'Nutrient Boost' },
          { id: 'wheat-veg-3', task: 'Inspect leaf undersides for orange or yellow rust fungal powder', status: 'safe', category: 'Rust Inspection' }
        ];
      }
      if (stage.includes('flow') || stage.includes('head')) {
        return [
          { id: 'wheat-flow-1', task: 'Maintain steady root-zone moisture; avoid irrigation during gusty winds', status: 'urgent', category: 'Water Balance' },
          { id: 'wheat-flow-2', task: 'Spray light potassium solution if afternoon temperatures cross 30°C', status: 'recommended', category: 'Heat Defense' },
          { id: 'wheat-flow-3', task: 'Inspect earheads for aphid clusters or loose smut black heads', status: 'safe', category: 'Pest Scouting' }
        ];
      }
      if (stage.includes('harv') || stage.includes('matur') || stage.includes('cut')) {
        return [
          { id: 'wheat-harv-1', task: 'Check grain dryness: harvest when grains snap crisply between teeth', status: 'urgent', category: 'Maturity Check' },
          { id: 'wheat-harv-2', task: 'Arrange combine harvester or clean sickles and dry threshing area', status: 'recommended', category: 'Equipment Prep' },
          { id: 'wheat-harv-3', task: 'Store wheat in cool, dry, rodent-proof bins with neem leaves', status: 'safe', category: 'Safe Storage' }
        ];
      }
    }

    // MAIZE / CORN
    if (crop.includes('maize') || crop.includes('corn') || crop.includes('makka')) {
      if (stage.includes('sow')) {
        return [
          { id: 'maize-sow-1', task: 'Sow single seeds at 2 feet row spacing in well-drained moist soil', status: 'urgent', category: 'Seed Spacing' },
          { id: 'maize-sow-2', task: 'Apply basal DAP fertilizer in furrows below seed level', status: 'recommended', category: 'Basal Dressing' },
          { id: 'maize-sow-3', task: 'Ensure field drainage lines are open to prevent standing water', status: 'safe', category: 'Drainage' }
        ];
      }
      if (stage.includes('veg') || stage.includes('till')) {
        return [
          { id: 'maize-veg-1', task: 'Check whorl leaves and central funnels for fall armyworm caterpillars', status: 'urgent', category: 'Pest Scouting' },
          { id: 'maize-veg-2', task: 'Mound soil around plant base (earthing up) at knee-high stage', status: 'recommended', category: 'Earthing Up' },
          { id: 'maize-veg-3', task: 'Top-dress with 25 kg Urea per acre before intercultural weeding', status: 'safe', category: 'Fertilizer' }
        ];
      }
      if (stage.includes('flow') || stage.includes('head')) {
        return [
          { id: 'maize-flow-1', task: 'Keep soil well-watered during tasseling and silking (critical stage)', status: 'urgent', category: 'Tasseling Water' },
          { id: 'maize-flow-2', task: 'Scout silk emergence on young cobs for caterpillar damage', status: 'recommended', category: 'Cob Protection' },
          { id: 'maize-flow-3', task: 'Ensure furrows drain excess water after heavy rain', status: 'safe', category: 'Drainage' }
        ];
      }
      if (stage.includes('harv') || stage.includes('matur') || stage.includes('cut')) {
        return [
          { id: 'maize-harv-1', task: 'Harvest when outer cob husks turn papery dry and light brown', status: 'urgent', category: 'Cob Harvest' },
          { id: 'maize-harv-2', task: 'De-husk and sun-dry cobs until kernels are hard and glossy', status: 'recommended', category: 'Sun Drying' },
          { id: 'maize-harv-3', task: 'Shell dried kernels and pack in moisture-tight bags', status: 'safe', category: 'Safe Storage' }
        ];
      }
    }

    // COTTON
    if (crop.includes('cotton') || crop.includes('kapas')) {
      if (stage.includes('sow')) {
        return [
          { id: 'cotton-sow-1', task: 'Sow cotton seeds on ridges 3 feet apart for good root aeration', status: 'urgent', category: 'Ridge Sowing' },
          { id: 'cotton-sow-2', task: 'Treat seeds with imidacloprid to protect early seedlings', status: 'recommended', category: 'Seed Coat' },
          { id: 'cotton-sow-3', task: 'Avoid sowing in sticky wet mud; ensure light moist seedbed', status: 'safe', category: 'Seedbed Moisture' }
        ];
      }
      if (stage.includes('veg') || stage.includes('till')) {
        return [
          { id: 'cotton-veg-1', task: 'Scout leaf undersides for whiteflies, jassids, and aphids', status: 'urgent', category: 'Pest Watch' },
          { id: 'cotton-veg-2', task: 'Hoe and weed between rows to keep soil loose and aerated', status: 'recommended', category: 'Intercultural' },
          { id: 'cotton-veg-3', task: 'Apply split dose of nitrogen fertilizer along crop rows', status: 'safe', category: 'Nutrient Boost' }
        ];
      }
      if (stage.includes('flow') || stage.includes('head')) {
        return [
          { id: 'cotton-flow-1', task: 'Inspect squares and young bolls for pink bollworm entry holes', status: 'urgent', category: 'Bollworm Check' },
          { id: 'cotton-flow-2', task: 'Maintain light furrow irrigation; avoid waterlogging in plots', status: 'recommended', category: 'Furrow Water' },
          { id: 'cotton-flow-3', task: 'Foliar spray 1% potassium nitrate to prevent flower drop', status: 'safe', category: 'Boll Nutrition' }
        ];
      }
      if (stage.includes('harv') || stage.includes('matur') || stage.includes('cut')) {
        return [
          { id: 'cotton-harv-1', task: 'Pick fully burst, clean white cotton bolls in dry morning sunlight', status: 'urgent', category: 'Boll Picking' },
          { id: 'cotton-harv-2', task: 'Do not pick wet or dew-covered cotton to preserve fiber grade', status: 'recommended', category: 'Quality Care' },
          { id: 'cotton-harv-3', task: 'Store clean picked cotton in dry rooms free from dust and moisture', status: 'safe', category: 'Storage' }
        ];
      }
    }

    // SUGARCANE
    if (crop.includes('sugarcane') || crop.includes('ganna')) {
      if (stage.includes('sow')) {
        return [
          { id: 'cane-sow-1', task: 'Plant 3-bud cane setts in 3-foot furrows with organic compost', status: 'urgent', category: 'Sett Planting' },
          { id: 'cane-sow-2', task: 'Treat cane setts with carbendazim solution to prevent red rot', status: 'recommended', category: 'Sett Treatment' },
          { id: 'cane-sow-3', task: 'Give immediate light irrigation to settle soil around cane setts', status: 'safe', category: 'First Watering' }
        ];
      }
      if (stage.includes('veg') || stage.includes('till')) {
        return [
          { id: 'cane-veg-1', task: 'Mound soil firmly around cane clumps (earthing up) to stop lodging', status: 'urgent', category: 'Earthing Up' },
          { id: 'cane-veg-2', task: 'Check shoots for early shoot borer dead hearts', status: 'recommended', category: 'Borer Scouting' },
          { id: 'cane-veg-3', task: 'Apply 50 kg Urea per acre before second intercultural weeding', status: 'safe', category: 'Cane Nutrition' }
        ];
      }
      if (stage.includes('flow') || stage.includes('head')) {
        return [
          { id: 'cane-flow-1', task: 'Tie cane clumps together in bundles to resist strong winds', status: 'urgent', category: 'Propping & Tying' },
          { id: 'cane-flow-2', task: 'Remove dry lower cane leaves to improve air circulation and sunlight', status: 'recommended', category: 'De-trashing' },
          { id: 'cane-flow-3', task: 'Maintain 10–12 day furrow irrigation schedule during grand growth', status: 'safe', category: 'Irrigation' }
        ];
      }
      if (stage.includes('harv') || stage.includes('matur') || stage.includes('cut')) {
        return [
          { id: 'cane-harv-1', task: 'Test sweetness: cut cane flush at ground level for maximum sugar yield', status: 'urgent', category: 'Ground Cut' },
          { id: 'cane-harv-2', task: 'Stop irrigation 15 days before harvest to concentrate sucrose', status: 'recommended', category: 'Pre-Harvest Dry' },
          { id: 'cane-harv-3', task: 'Transport harvested cane to sugar mill within 24 hours of cutting', status: 'safe', category: 'Mill Transport' }
        ];
      }
    }
  }

  // 2. Health Persona: Filter by Health Profile
  if (normPersona === 'health') {
    const profile = (customSettings.health_profile || 'Standard').toLowerCase();
    if (profile.includes('asthma') || profile.includes('respirat')) {
      return [
        { id: 'h-asthma-1', task: 'Carry rescue inhaler on all outdoor transit and commutes', status: 'urgent', category: 'Respiratory Care' },
        { id: 'h-asthma-2', task: 'Avoid intense outdoor exercise if AQI crosses 100', status: 'recommended', category: 'Air Quality Limit' },
        { id: 'h-asthma-3', task: 'Keep room windows closed during dusty or windy hours', status: 'safe', category: 'Indoor Environment' }
      ];
    }
    if (profile.includes('senior')) {
      return [
        { id: 'h-senior-1', task: 'Avoid walking in peak afternoon heat (12 PM - 3 PM)', status: 'urgent', category: 'Heat Shield' },
        { id: 'h-senior-2', task: 'Drink warm water with electrolytes throughout the day', status: 'recommended', category: 'Hydration' },
        { id: 'h-senior-3', task: 'Wear slip-resistant footwear on damp walkways and stairs', status: 'safe', category: 'Fall Prevention' }
      ];
    }
    if (profile.includes('child') || profile.includes('infant')) {
      return [
        { id: 'h-child-1', task: 'Ensure adequate water and fruit juice intake during playground time', status: 'urgent', category: 'Child Hydration' },
        { id: 'h-child-2', task: 'Apply broad-spectrum infant sunscreen before outdoor activities', status: 'recommended', category: 'UV Protection' },
        { id: 'h-child-3', task: 'Avoid heavy traffic roadside exposure during morning peak hours', status: 'safe', category: 'Clean Air' }
      ];
    }
    return [
      { id: 'h-std-1', task: 'Maintain daily hydration target of 2.5 to 3 liters of water', status: 'recommended', category: 'Hydration' },
      { id: 'h-std-2', task: 'Apply SPF 30+ sunscreen if outdoors between 11 AM and 3 PM', status: 'recommended', category: 'UV Defense' },
      { id: 'h-std-3', task: 'Air quality and weather conditions are safe for outdoor workouts', status: 'safe', category: 'Daily Routine' }
    ];
  }

  // 3. Fitness Persona: Filter by Activity Type
  if (normPersona === 'fitness') {
    const sport = (customSettings.activity_type || 'Running').toLowerCase();
    if (sport.includes('cycl')) {
      return [
        { id: 'fit-cyc-1', task: 'Check tire pressure and wet cornering traction before riding', status: 'urgent', category: 'Bike Safety' },
        { id: 'fit-cyc-2', task: 'Plan route along sheltered roads to minimize headwinds', status: 'recommended', category: 'Route Planning' },
        { id: 'fit-cyc-3', task: 'Carry electrolyte hydration bottles for rides over 45 minutes', status: 'safe', category: 'Hydration' }
      ];
    }
    if (sport.includes('crossfit') || sport.includes('hiit')) {
      return [
        { id: 'fit-hiit-1', task: 'Monitor heat stress index before high-intensity outdoor sets', status: 'urgent', category: 'Heat Stress' },
        { id: 'fit-hiit-2', task: 'Take 3-minute shade rests between high-intensity circuit intervals', status: 'recommended', category: 'Rest Windows' },
        { id: 'fit-hiit-3', task: 'Keep cold water and sweat towels accessible near workout station', status: 'safe', category: 'Workout Prep' }
      ];
    }
    return [
      { id: 'fit-run-1', task: 'Schedule outdoor run during cool morning window (6 AM - 7:30 AM)', status: 'recommended', category: 'Pacing Window' },
      { id: 'fit-run-2', task: 'Hydrate with 200ml water every 20 minutes of steady running', status: 'urgent', category: 'Hydration' },
      { id: 'fit-run-3', task: 'Wear light reflective running apparel for road safety', status: 'safe', category: 'Running Gear' }
    ];
  }

  // 4. Aviation Persona: Filter by Flight Rule
  if (normPersona === 'aviation') {
    const rule = (customSettings.flight_rule || 'VFR').toUpperCase();
    if (rule === 'IFR') {
      return [
        { id: 'av-ifr-1', task: 'Verify runway visual range (RVR) and instrument minimums', status: 'urgent', category: 'Approach Minima' },
        { id: 'av-ifr-2', task: 'Review icing and turbulence SIGMETs along cruising levels', status: 'recommended', category: 'SIGMET Review' },
        { id: 'av-ifr-3', task: 'Confirm alternate airport weather and holding fuel reserves', status: 'safe', category: 'Fuel Reserves' }
      ];
    }
    if (rule === 'UAV' || rule === 'DRONE') {
      return [
        { id: 'av-uav-1', task: 'Keep drone flight within 400 ft AGL visual line-of-sight limit', status: 'urgent', category: 'Airspace Rules' },
        { id: 'av-uav-2', task: 'Check micro-gust velocities before takeoff (keep under 25 kph)', status: 'recommended', category: 'Gust Limit' },
        { id: 'av-uav-3', task: 'Monitor battery temperature in cold or hot ambient air', status: 'safe', category: 'Battery Health' }
      ];
    }
    return [
      { id: 'av-vfr-1', task: 'Verify cloud ceiling exceeds 3,000 ft AGL along visual route', status: 'urgent', category: 'Visual Flight' },
      { id: 'av-vfr-2', task: 'Check crosswind component against aircraft maximum limit', status: 'recommended', category: 'Crosswind Check' },
      { id: 'av-vfr-3', task: 'Inspect destination METAR for sudden fog or rain bands', status: 'safe', category: 'METAR Tracking' }
    ];
  }

  // 5. Maritime Persona: Filter by Vessel Type
  if (normPersona === 'maritime' || normPersona === 'marine') {
    const vessel = (customSettings.vessel_type || 'Surf').toLowerCase();
    if (vessel.includes('trawl') || vessel.includes('fish')) {
      return [
        { id: 'mar-trawl-1', task: 'Verify coastal squall bulletins before venturing past 12 NM', status: 'urgent', category: 'Squall Bulletin' },
        { id: 'mar-trawl-2', task: 'Inspect VHF marine radio and life jackets before cast-off', status: 'recommended', category: 'Vessel Safety' },
        { id: 'mar-trawl-3', task: 'Track tidal cycles for safe shallow harbor return', status: 'safe', category: 'Tidal Planning' }
      ];
    }
    if (vessel.includes('cargo') || vessel.includes('ship')) {
      return [
        { id: 'mar-cargo-1', task: 'Secure deck cargo against rolling swell and pitching', status: 'urgent', category: 'Deck Lashing' },
        { id: 'mar-cargo-2', task: 'Review significant wave height and swell period along sea lane', status: 'recommended', category: 'Route Forecast' },
        { id: 'mar-cargo-3', task: 'Monitor coastal harbor channel entry draft clearances', status: 'safe', category: 'Draft Clearance' }
      ];
    }
    return [
      { id: 'mar-surf-1', task: 'Identify rip current channels before entering the surf zone', status: 'urgent', category: 'Water Safety' },
      { id: 'mar-surf-2', task: 'Check breaking wave face height and offshore wind direction', status: 'recommended', category: 'Swell Analysis' },
      { id: 'mar-surf-3', task: 'Apply reef-safe water-resistant sunscreen SPF 50+', status: 'safe', category: 'Skin Protection' }
    ];
  }

  // Fallback to default operations defined on config
  return config.defaultOperations && config.defaultOperations.length > 0
    ? config.defaultOperations
    : [
        { id: 'gen-1', task: 'Standard environmental and operational parameters nominal', status: 'safe', category: 'General' },
        { id: 'gen-2', task: 'Weather conditions favorable for scheduled operations', status: 'recommended', category: 'Monitoring' }
      ];
}

