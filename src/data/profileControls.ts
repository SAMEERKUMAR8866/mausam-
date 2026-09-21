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
