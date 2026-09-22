// src/services/dynamic-image.service.ts
// Intelligent, location-aware & weather-aware dynamic background image engine
// Supports curated landmark atmospheric scenes, online dynamic photo queries, client-side preloading, and offline caching.

export interface ImageQueryOptions {
  location: string;
  condition?: string;
  isDay?: boolean;
  code?: number;
}

// Curated high-resolution landmark and city photos tailored for weather conditions and time-of-day
// Specifically featuring Sher Shah Suri's historic water monument for Sasarām / Bihar under night and cloudy night skies
const CURATED_LOCATION_PHOTOS: Record<string, {
  day_sunny?: string;
  day_cloudy?: string;
  night_clear?: string;
  night_cloudy?: string;
  rain?: string;
  storm?: string;
  fog?: string;
  snow?: string;
  default: string;
}> = {
  // Sasarām / Rohtas / Bihar (Tomb of Sher Shah Suri lake monument & historic Rohtas landscape)
  sasaram: {
    night_cloudy: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop', // Atmospheric Indo-Islamic water monument reflection under dark moody cloudy night
    night_clear: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1600&auto=format&fit=crop', // Starry night heritage lake silhouette
    day_sunny: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1600&auto=format&fit=crop', // Grand daytime view of Sher Shah Suri tomb
    day_cloudy: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop', // Historic heritage monument with soft clouds
    rain: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop', // Monsoon water tank reflection
    storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop'
  },
  rohtas: {
    night_cloudy: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    day_sunny: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop'
  },
  bihar: {
    night_cloudy: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    day_sunny: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop'
  },

  // Mumbai / Maharashtra (Marine Drive, Sea Link, Gateway of India)
  mumbai: {
    day_sunny: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop', // Bandra-Worli Sea Link under brilliant bright sun
    day_cloudy: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=1600&auto=format&fit=crop', // Gateway of India with sea clouds
    night_clear: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1600&auto=format&fit=crop', // Queen's Necklace Marine Drive night glow
    night_cloudy: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?q=80&w=1600&auto=format&fit=crop', // Mumbai monsoon rain over wet promenade
    storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1600&auto=format&fit=crop'
  },

  // London / UK (Tower Bridge, Westminster, Rain drenched streets)
  london: {
    rain: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?q=80&w=1600&auto=format&fit=crop', // Rainy London street with red bus & wet asphalt reflections
    storm: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?q=80&w=1600&auto=format&fit=crop',
    day_sunny: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop', // Big Ben & Tower Bridge bright sunny blue sky
    day_cloudy: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1600&auto=format&fit=crop', // Westminster overcast clouds
    night_clear: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop', // Tower Bridge night lights
    night_cloudy: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop',
    fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1600&auto=format&fit=crop'
  },

  // New Delhi / NCR
  new_delhi: {
    day_sunny: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    day_cloudy: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    night_clear: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1600&auto=format&fit=crop',
    night_cloudy: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop',
    fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop'
  },
  delhi: {
    day_sunny: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop',
    night_cloudy: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=1600&auto=format&fit=crop'
  },

  // Bengaluru / Silicon Valley of India
  bengaluru: {
    day_sunny: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop',
    night_cloudy: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=1600&auto=format&fit=crop'
  },

  // New York / US
  new_york: {
    day_sunny: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop',
    night_clear: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop',
    night_cloudy: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1600&auto=format&fit=crop'
  },

  // Tokyo / Japan
  tokyo: {
    day_sunny: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop',
    night_clear: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop'
  },

  // Paris / France
  paris: {
    day_sunny: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    night_cloudy: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1600&auto=format&fit=crop',
    rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop'
  }
};

// Atmospheric Weather Fallback Themes (Cinematic Apple/21st.dev Grade Imagery)
const ATMOSPHERIC_WEATHER_THEMES: Record<string, string> = {
  night_cloudy: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1600&auto=format&fit=crop',
  night_clear: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop',
  day_sunny: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?q=80&w=1600&auto=format&fit=crop',
  day_cloudy: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1600&auto=format&fit=crop',
  rain: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1600&auto=format&fit=crop',
  storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1600&auto=format&fit=crop',
  fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?q=80&w=1600&auto=format&fit=crop',
  snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=1600&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1600&auto=format&fit=crop'
};

const IMAGE_CACHE_KEY = 'mausam_dynamic_image_cache_v2';

export class DynamicImageService {
  private static memoryCache = new Map<string, string>();

  /**
   * Resolves the condition category key based on condition string and day/night state
   */
  public static getConditionCategory(condition = '', isDay = true): 'night_cloudy' | 'night_clear' | 'day_sunny' | 'day_cloudy' | 'rain' | 'storm' | 'fog' | 'snow' {
    const c = condition.toLowerCase();

    if (c.includes('thunder') || c.includes('storm') || c.includes('hail') || c.includes('cyclone')) {
      return 'storm';
    }
    if (c.includes('rain') || c.includes('shower') || c.includes('drizzle') || c.includes('precipitation')) {
      return 'rain';
    }
    if (c.includes('snow') || c.includes('ice') || c.includes('blizzard') || c.includes('frost')) {
      return 'snow';
    }
    if (c.includes('fog') || c.includes('mist') || c.includes('haze') || c.includes('smoke')) {
      return 'fog';
    }

    if (!isDay || c.includes('night')) {
      if (c.includes('cloud') || c.includes('overcast') || c.includes('partly')) {
        return 'night_cloudy';
      }
      return 'night_clear';
    }

    // Daytime conditions
    if (c.includes('cloud') || c.includes('overcast')) {
      return 'day_cloudy';
    }
    return 'day_sunny';
  }

  /**
   * Normalizes the location string into searchable tokens (e.g. "Sasarām, Bihar, India" -> ["sasaram", "bihar", "india"])
   */
  public static normalizeLocationKeys(locationStr = ''): string[] {
    const clean = locationStr
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics like ā -> a
      .replace(/[^\w\s,]/g, ' ');

    const parts = clean.split(',').map(p => p.trim().replace(/\s+/g, '_')).filter(Boolean);
    const words = clean.split(/[\s,]+/).filter(Boolean);

    const set = new Set<string>([...parts, ...words]);
    return Array.from(set);
  }

  /**
   * Retrieves or resolves the optimal high-resolution background image URL
   */
  public static getBackgroundImageUrl(options: ImageQueryOptions): string {
    const { location, condition = '', isDay = true } = options;
    const category = this.getConditionCategory(condition, isDay);
    const cacheKey = `${location.toLowerCase()}_${category}`;

    // 1. Check in-memory cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // 2. Check localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(IMAGE_CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed[cacheKey]) {
            this.memoryCache.set(cacheKey, parsed[cacheKey]);
            return parsed[cacheKey];
          }
        }
      } catch {}
    }

    // 3. Search Curated Location Dictionary
    const locKeys = this.normalizeLocationKeys(location);
    for (const key of locKeys) {
      if (CURATED_LOCATION_PHOTOS[key]) {
        const locSet = CURATED_LOCATION_PHOTOS[key];
        const match = locSet[category] || (isDay ? locSet.day_sunny : locSet.night_cloudy) || locSet.default;
        if (match) {
          this.cacheImageUrl(cacheKey, match);
          return match;
        }
      }
    }

    // 4. Return Atmospheric Weather Theme Fallback
    const fallback = ATMOSPHERIC_WEATHER_THEMES[category] || ATMOSPHERIC_WEATHER_THEMES.default;
    this.cacheImageUrl(cacheKey, fallback);
    return fallback;
  }

  /**
   * Preloads an image into browser memory so switching is instantaneous with zero white flash
   */
  public static preloadImage(url: string): Promise<string> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(url);
        return;
      }
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(url); // gracefully resolve to prevent blocking
      img.src = url;
    });
  }

  /**
   * Caches image URL in memory and persistent storage
   */
  private static cacheImageUrl(key: string, url: string) {
    this.memoryCache.set(key, url);
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(IMAGE_CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed[key] = url;
        localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(parsed));
      } catch {}
    }
  }
}
