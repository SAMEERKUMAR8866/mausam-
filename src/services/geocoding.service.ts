// src/services/geocoding.service.ts
// Intelligent Geocoding & Reverse Geocoding service with Pre-Populated Offline DB, Typo Tolerance & Fallback Suggestions

import { PREPOPULATED_OFFLINE_LOCATIONS, REGIONAL_STATE_MAPPINGS, type OfflineLocation } from '../data/offline-locations';
import { WeatherCacheService } from './weather-cache.service';
import { NetworkService } from './network.service';

export interface GeocodingResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  display: string;
  category?: string;
  aliases?: string[];
  isCoastal?: boolean;
  isFallback?: boolean;
  matchType?: 'exact' | 'prefix' | 'alias' | 'regional' | 'fuzzy' | 'fallback' | 'live';
  suggestionReason?: string;
}

// Backward compatibility export
export const MOCK_LOCATIONS: GeocodingResult[] = PREPOPULATED_OFFLINE_LOCATIONS.map(loc => ({
  id: loc.id,
  name: loc.name,
  region: loc.region,
  country: loc.country,
  lat: loc.lat,
  lon: loc.lon,
  display: loc.display,
  category: loc.category,
  aliases: loc.aliases,
  isCoastal: loc.isCoastal
}));

const COASTAL_KEYWORDS = [
  'mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'puri', 'goa', 'panaji', 'port blair',
  'mangalore', 'surat', 'bhavnagar', 'ratnagiri', 'alibaug', 'pondicherry', 'puducherry', 'daman',
  'diu', 'kavaratti', 'paradip', 'sydney', 'miami', 'honolulu', 'san francisco', 'tokyo', 'dubai', 'singapore', 'new york'
];

export function isCoastalLocation(name = '', region = '', country = ''): boolean {
  const combined = `${name} ${region} ${country}`.toLowerCase();
  return COASTAL_KEYWORDS.some(k => combined.includes(k));
}

export function getFallbackCoordinates(cityKey: string): { lat: number; lon: number } {
  const key = cityKey.toLowerCase().replace(/_/g, ' ');
  const match = PREPOPULATED_OFFLINE_LOCATIONS.find(
    l => l.name.toLowerCase().includes(key) ||
         l.id.toLowerCase().includes(key) ||
         (l.aliases && l.aliases.some(a => a.toLowerCase().includes(key)))
  );
  return match ? { lat: match.lat, lon: match.lon } : { lat: 28.47, lon: 77.50 }; // Default to Greater Noida / Delhi NCR
}

export function getReverseGeocodeOffline(lat: number, lon: number): { name: string; region: string; country: string; display: string } {
  let closest: OfflineLocation = PREPOPULATED_OFFLINE_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of PREPOPULATED_OFFLINE_LOCATIONS) {
    const dLat = loc.lat - lat;
    const dLon = loc.lon - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = loc;
    }
  }

  // If reasonably close, return closest location match
  if (minDistance < 0.6) {
    return { name: closest.name, region: closest.region, country: closest.country, display: closest.display };
  }

  return {
    name: closest.name,
    region: closest.region,
    country: closest.country,
    display: `${closest.name}, ${closest.region}, ${closest.country}`
  };
}

const SEARCHED_LOCATIONS_KEY = 'mausam_searched_locations_cache';

export function getCachedSearchedLocations(): GeocodingResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEARCHED_LOCATIONS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveSearchedLocation(loc: GeocodingResult): void {
  if (typeof window === 'undefined' || !loc || !loc.name) return;
  try {
    const current = getCachedSearchedLocations();
    const normName = loc.name.toLowerCase().trim();
    const normRegion = (loc.region || '').toLowerCase().trim();
    const normCountry = (loc.country || '').toLowerCase().trim();

    const filtered = current.filter(l => {
      const matchName = l.name.toLowerCase().trim() === normName;
      const matchRegion = (l.region || '').toLowerCase().trim() === normRegion;
      const matchCountry = (l.country || '').toLowerCase().trim() === normCountry;
      return !(matchName && matchRegion && matchCountry) && l.id !== loc.id;
    });

    const entry: GeocodingResult = {
      id: loc.id || `loc-${normName.replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: loc.name,
      region: loc.region || '',
      country: loc.country || 'India',
      lat: loc.lat,
      lon: loc.lon,
      display: loc.display || `${loc.name}${loc.region ? `, ${loc.region}` : ''}, ${loc.country || 'India'}`,
      category: loc.category || 'District',
      isCoastal: loc.isCoastal ?? isCoastalLocation(loc.name, loc.region, loc.country)
    };

    const updated = [entry, ...filtered].slice(0, 50);
    localStorage.setItem(SEARCHED_LOCATIONS_KEY, JSON.stringify(updated));

    // Persistent sync to IndexedDB
    WeatherCacheService.saveLocationRecord({
      ...entry,
      isCustomSearched: true,
      lastSearchedAt: Date.now()
    }).catch(() => {});
  } catch (e) {
    console.warn('[GeocodingService] Failed to cache searched location:', e);
  }
}

// =========================================================================
// FUZZY STRING MATCHING & TYPO TOLERANCE ALGORITHMS
// =========================================================================

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }
  return dp[m][n];
}

function getBigrams(str: string): Set<string> {
  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bigrams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * Calculates similarity coefficient between 0 (no match) and 1 (exact match)
 * Combines Levenshtein distance and Dice's bigram coefficient for robust typo matching.
 */
function calculateSimilarity(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (q === t) return 1.0;
  if (t.startsWith(q)) return 0.95;
  if (t.includes(q)) return 0.85;

  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 1.0;

  const levDist = levenshteinDistance(q, t);
  const levScore = Math.max(0, 1 - levDist / maxLen);

  // Bigram Dice score
  const b1 = getBigrams(q);
  const b2 = getBigrams(t);
  let intersection = 0;
  for (const bg of b1) {
    if (b2.has(bg)) intersection++;
  }
  const bigramScore = (b1.size + b2.size > 0) ? (2 * intersection) / (b1.size + b2.size) : 0;

  return Math.max(levScore, bigramScore);
}

// =========================================================================
// ADVANCED OFFLINE SEARCH WITH REGIONAL FALLBACK & SUGGESTIONS
// =========================================================================

/**
 * Searches the pre-populated offline database and user cached locations.
 * Uses exact, prefix, alias, regional, and fuzzy matching with fallback suggestions.
 */
export function getCityMatches(query: string): GeocodingResult[] {
  if (!query || query.trim().length === 0) {
    // Return curated popular hubs if empty
    return PREPOPULATED_OFFLINE_LOCATIONS.slice(0, 8).map(loc => ({
      ...loc,
      matchType: 'exact'
    }));
  }

  const rawQuery = query.toLowerCase().trim();
  const tokens = rawQuery.split(/[\s,]+/).filter(t => t.length > 0);

  // Combine user cached history + pre-populated database
  const userCached = getCachedSearchedLocations();
  const allLocationsMap = new Map<string, GeocodingResult>();

  // Insert pre-populated first
  for (const loc of PREPOPULATED_OFFLINE_LOCATIONS) {
    allLocationsMap.set(loc.id, { ...loc });
  }

  // Insert / override with user cached
  for (const loc of userCached) {
    allLocationsMap.set(loc.id, {
      ...loc,
      category: loc.category || 'District'
    });
  }

  const allLocations = Array.from(allLocationsMap.values());

  const exactMatches: GeocodingResult[] = [];
  const prefixMatches: GeocodingResult[] = [];
  const tokenMatches: GeocodingResult[] = [];
  const regionalMatches: GeocodingResult[] = [];
  const fuzzyMatches: { loc: GeocodingResult; score: number }[] = [];

  const seenIds = new Set<string>();

  // 1. Direct Matching (Exact, Prefix, Aliases, Tokens)
  for (const loc of allLocations) {
    const nameLower = loc.name.toLowerCase();
    const regionLower = (loc.region || '').toLowerCase();
    const countryLower = (loc.country || '').toLowerCase();
    const displayLower = (loc.display || '').toLowerCase();
    const aliases = (loc.aliases || []).map(a => a.toLowerCase());

    // 1.1 Exact Name or Alias Match
    if (nameLower === rawQuery || aliases.includes(rawQuery)) {
      if (!seenIds.has(loc.id)) {
        seenIds.add(loc.id);
        exactMatches.push({ ...loc, matchType: 'exact' });
      }
      continue;
    }

    // 1.2 Starts With / Prefix Match
    if (nameLower.startsWith(rawQuery) || aliases.some(a => a.startsWith(rawQuery))) {
      if (!seenIds.has(loc.id)) {
        seenIds.add(loc.id);
        prefixMatches.push({ ...loc, matchType: 'prefix' });
      }
      continue;
    }

    // 1.3 Substring or Multi-token Match
    const isSubstring = nameLower.includes(rawQuery) ||
      regionLower.includes(rawQuery) ||
      countryLower.includes(rawQuery) ||
      displayLower.includes(rawQuery) ||
      aliases.some(a => a.includes(rawQuery));

    const allTokensMatch = tokens.every(t =>
      nameLower.includes(t) ||
      regionLower.includes(t) ||
      countryLower.includes(t) ||
      aliases.some(a => a.includes(t))
    );

    if (isSubstring || allTokensMatch) {
      if (!seenIds.has(loc.id)) {
        seenIds.add(loc.id);
        tokenMatches.push({ ...loc, matchType: 'alias' });
      }
      continue;
    }

    // 1.4 Fuzzy Score for Typo Tolerance
    let bestSimilarity = calculateSimilarity(rawQuery, nameLower);
    // Check individual words in multi-word names (e.g. "Delhi" in "New Delhi")
    for (const word of nameLower.split(/\s+/)) {
      if (word.length >= 3) {
        const wSim = calculateSimilarity(rawQuery, word);
        if (wSim > bestSimilarity) bestSimilarity = wSim;
      }
    }
    for (const alias of aliases) {
      const sim = calculateSimilarity(rawQuery, alias);
      if (sim > bestSimilarity) bestSimilarity = sim;
    }

    // Typo tolerance threshold (e.g. "noyda" -> 0.8, "dheli" -> 0.8, "begaluru" -> 0.88)
    if (bestSimilarity >= 0.60) {
      if (!seenIds.has(loc.id)) {
        seenIds.add(loc.id);
        fuzzyMatches.push({
          loc: {
            ...loc,
            matchType: 'fuzzy',
            suggestionReason: `Did you mean ${loc.name}?`
          },
          score: bestSimilarity
        });
      }
    }
  }

  // 2. Regional / State Fallback (e.g., searching "Uttar Pradesh" or "UP" or "Karnataka")
  for (const [regionKey, locIds] of Object.entries(REGIONAL_STATE_MAPPINGS)) {
    if (regionKey.includes(rawQuery) || rawQuery.includes(regionKey)) {
      for (const id of locIds) {
        if (!seenIds.has(id)) {
          const loc = allLocationsMap.get(id);
          if (loc) {
            seenIds.add(id);
            regionalMatches.push({
              ...loc,
              matchType: 'regional',
              suggestionReason: `Regional Hub for ${regionKey.toUpperCase()}`
            });
          }
        }
      }
    }
  }

  // Sort fuzzy matches by similarity score descending
  fuzzyMatches.sort((a, b) => b.score - a.score);

  // Combine primary matches
  const primaryResults = [
    ...exactMatches,
    ...prefixMatches,
    ...tokenMatches,
    ...fuzzyMatches.map(f => f.loc),
    ...regionalMatches
  ];

  if (primaryResults.length > 0) {
    return primaryResults.slice(0, 10);
  }

  // =========================================================================
  // 3. Helpful Fallback Suggestions (Never Return Empty Dead Ends Offline!)
  // =========================================================================
  // If no direct or fuzzy match is found, provide top regional default hubs
  const fallbackSuggestions: GeocodingResult[] = [
    {
      ...PREPOPULATED_OFFLINE_LOCATIONS[1], // Greater Noida
      isFallback: true,
      matchType: 'fallback',
      suggestionReason: `Offline suggestion for "${query}" (Regional Hub)`
    },
    {
      ...PREPOPULATED_OFFLINE_LOCATIONS[0], // New Delhi
      isFallback: true,
      matchType: 'fallback',
      suggestionReason: `National Capital Hub (Offline Ready)`
    },
    {
      ...PREPOPULATED_OFFLINE_LOCATIONS[6], // Bengaluru
      isFallback: true,
      matchType: 'fallback',
      suggestionReason: `Major Tech Hub (Offline Ready)`
    },
    {
      ...PREPOPULATED_OFFLINE_LOCATIONS[7], // Mumbai
      isFallback: true,
      matchType: 'fallback',
      suggestionReason: `Financial & Coastal Metro (Offline Ready)`
    }
  ];

  return fallbackSuggestions;
}

export function searchLocations(query: string): GeocodingResult[] {
  return getCityMatches(query);
}

/**
 * Async location search with live Open-Meteo geocoding API when online,
 * and intelligent offline database search with fallback suggestions when offline.
 */
export async function searchLocationsAsync(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length === 0) return [];

  const isOnline = typeof navigator !== 'undefined' ? (navigator.onLine && NetworkService.isOnline()) : true;
  const offlineMatches = getCityMatches(query);

  if (!isOnline) {
    return offlineMatches;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`,
      { signal: controller.signal }
    ).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const liveResults: GeocodingResult[] = data.results.map((r: any) => ({
          id: `om-${r.id || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: r.name,
          region: r.admin1 || '',
          country: r.country || 'India',
          lat: r.latitude,
          lon: r.longitude,
          display: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}, ${r.country || 'India'}`,
          category: 'District',
          isCoastal: isCoastalLocation(r.name, r.admin1, r.country),
          matchType: 'live'
        }));

        // Dynamically save live results to offline persistent cache
        if (typeof window !== 'undefined') {
          liveResults.forEach(r => saveSearchedLocation(r));
        }

        return liveResults;
      }
    }
  } catch (err) {
    console.warn('[GeocodingService] Online search fallback to local DB:', err);
  }

  return offlineMatches;
}

export async function detectUserLocation(): Promise<{ key: string; display: string; lat: number; lon: number }> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const rev = getReverseGeocodeOffline(lat, lon);
          resolve({
            key: `${lat.toFixed(2)},${lon.toFixed(2)}`,
            display: rev.display,
            lat,
            lon
          });
        },
        () => {
          resolve({ key: 'new_delhi', display: 'New Delhi, Delhi, India', lat: 28.61, lon: 77.20 });
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      resolve({ key: 'new_delhi', display: 'New Delhi, Delhi, India', lat: 28.61, lon: 77.20 });
    }
  });
}
