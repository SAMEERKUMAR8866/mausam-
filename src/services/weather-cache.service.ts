// src/services/weather-cache.service.ts
// Dynamic Multi-City IndexedDB & Local Cache Engine for Offline Weather Telemetry & Location Registry

import type { WeatherResponse } from './weather.service';

export interface CachedWeatherEntry {
  cityKey: string;
  displayName: string;
  coords?: { lat: number; lon: number };
  data: WeatherResponse;
  cachedAt: number; // Unix timestamp in milliseconds
  source?: string;
  ageMinutes?: number;
  validity?: 'valid' | 'stale' | 'invalid';
  dataQuality?: string;
  confidence?: string;
  freshness?: string;
}

export interface CachedLocationEntry {
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
  isCustomSearched?: boolean;
  lastSearchedAt?: number;
}

const DB_NAME = 'mausam_weather_db';
const DB_VERSION = 2;
const WEATHER_STORE = 'weather_cache';
const LOCATIONS_STORE = 'locations_cache';

const LOCAL_STORAGE_WEATHER_PREFIX = 'mausam_weather_cache_';
const LOCAL_STORAGE_WEATHER_INDEX = 'mausam_weather_cache_index';
const LOCAL_STORAGE_SEARCHED_LOCATIONS = 'mausam_searched_locations_cache';

export class WeatherCacheService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('indexedDB' in window)) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 1. Weather cache store
        if (!db.objectStoreNames.contains(WEATHER_STORE)) {
          const wStore = db.createObjectStore(WEATHER_STORE, { keyPath: 'cityKey' });
          wStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          wStore.createIndex('displayName', 'displayName', { unique: false });
        }

        // 2. Locations cache store
        if (!db.objectStoreNames.contains(LOCATIONS_STORE)) {
          const lStore = db.createObjectStore(LOCATIONS_STORE, { keyPath: 'id' });
          lStore.createIndex('name', 'name', { unique: false });
          lStore.createIndex('region', 'region', { unique: false });
          lStore.createIndex('lastSearchedAt', 'lastSearchedAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('[WeatherCache] IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Normalizes city key / query strings into a standardized lookup key.
   * Handles coordinates "28.61, 77.20" -> "28.61,77.20", "New Delhi, Delhi, India" -> "new_delhi"
   */
  static normalizeKey(query: string): string {
    if (!query) return 'new_delhi';
    const trimmed = query.trim().toLowerCase();

    // Coordinate match
    const coords = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    if (coords) {
      return `${parseFloat(coords[1]).toFixed(2)},${parseFloat(coords[3]).toFixed(2)}`;
    }

    // City display name: "Mumbai, Maharashtra, India" -> "mumbai"
    const firstPart = trimmed.split(',')[0].trim();
    return firstPart.replace(/[^a-z0-9]+/g, '_');
  }

  /**
   * Formats a timestamp into human-readable relative time string.
   */
  static formatTimeAgo(timestamp: number): string {
    if (!timestamp) return 'recently';
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 30) return 'just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  }

  // =========================================================================
  // WEATHER TELEMETRY STORAGE
  // =========================================================================

  /**
   * Saves dynamic weather data for any city/location in IndexedDB and localStorage mirror.
   */
  static async saveWeather(
    cityKeyOrQuery: string,
    data: WeatherResponse,
    displayName?: string,
    coords?: { lat: number; lon: number }
  ): Promise<void> {
    if (typeof window === 'undefined' || !data) return;

    const normalizedKey = this.normalizeKey(cityKeyOrQuery);
    const resolvedDisplay = displayName || `${data.location?.name || normalizedKey}, ${data.location?.country || 'India'}`;

    const entry: CachedWeatherEntry = {
      cityKey: normalizedKey,
      displayName: resolvedDisplay,
      coords,
      data,
      cachedAt: Date.now()
    };

    // 1. Save in localStorage mirror (instant synchronous lookup & fallback)
    try {
      localStorage.setItem(`${LOCAL_STORAGE_WEATHER_PREFIX}${normalizedKey}`, JSON.stringify(entry));
      const indexRaw = localStorage.getItem(LOCAL_STORAGE_WEATHER_INDEX);
      const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
      if (!index.includes(normalizedKey)) {
        index.push(normalizedKey);
        localStorage.setItem(LOCAL_STORAGE_WEATHER_INDEX, JSON.stringify(index));
      }
    } catch (e) {
      console.warn('[WeatherCache] LocalStorage save warning:', e);
    }

    // 2. Save in IndexedDB (robust persistent storage)
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(WEATHER_STORE, 'readwrite');
        const store = tx.objectStore(WEATHER_STORE);
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[WeatherCache] IndexedDB save fallback:', err);
    }
  }

  /**
   * Retrieves cached weather data for a specific city.
   */
  static async getWeather(cityKeyOrQuery: string): Promise<CachedWeatherEntry | null> {
    if (typeof window === 'undefined') return null;

    const normalizedKey = this.normalizeKey(cityKeyOrQuery);

    // 1. Try IndexedDB
    try {
      const db = await this.getDB();
      const entry = await new Promise<CachedWeatherEntry | null>((resolve) => {
        const tx = db.transaction(WEATHER_STORE, 'readonly');
        const store = tx.objectStore(WEATHER_STORE);
        const req = store.get(normalizedKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (entry) return entry;
    } catch {}

    // 2. Fallback to LocalStorage mirror
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_WEATHER_PREFIX}${normalizedKey}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}

    return null;
  }

  /**
   * Retrieves all cached weather entries across all cities.
   */
  static async getAllCached(): Promise<CachedWeatherEntry[]> {
    if (typeof window === 'undefined') return [];

    try {
      const db = await this.getDB();
      return await new Promise<CachedWeatherEntry[]>((resolve) => {
        const tx = db.transaction(WEATHER_STORE, 'readonly');
        const store = tx.objectStore(WEATHER_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      // Fallback from localStorage
      try {
        const indexRaw = localStorage.getItem(LOCAL_STORAGE_WEATHER_INDEX);
        const index: string[] = indexRaw ? JSON.parse(indexRaw) : [];
        const results: CachedWeatherEntry[] = [];
        for (const k of index) {
          const raw = localStorage.getItem(`${LOCAL_STORAGE_WEATHER_PREFIX}${k}`);
          if (raw) results.push(JSON.parse(raw));
        }
        return results;
      } catch {
        return [];
      }
    }
  }

  /**
   * Retrieves the most recently cached entry across all stored cities.
   */
  static async getLastCachedEntry(): Promise<CachedWeatherEntry | null> {
    const all = await this.getAllCached();
    if (!all || all.length === 0) return null;
    all.sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0));
    return all[0] || null;
  }

  /**
   * Deletes a cached city entry.
   */
  static async deleteWeather(cityKeyOrQuery: string): Promise<void> {
    if (typeof window === 'undefined') return;

    const normalizedKey = this.normalizeKey(cityKeyOrQuery);

    try {
      localStorage.removeItem(`${LOCAL_STORAGE_WEATHER_PREFIX}${normalizedKey}`);
      const indexRaw = localStorage.getItem(LOCAL_STORAGE_WEATHER_INDEX);
      if (indexRaw) {
        const index: string[] = JSON.parse(indexRaw);
        const updated = index.filter(k => k !== normalizedKey);
        localStorage.setItem(LOCAL_STORAGE_WEATHER_INDEX, JSON.stringify(updated));
      }
    } catch {}

    try {
      const db = await this.getDB();
      const tx = db.transaction(WEATHER_STORE, 'readwrite');
      tx.objectStore(WEATHER_STORE).delete(normalizedKey);
    } catch {}
  }

  // =========================================================================
  // LOCATION REGISTRY STORAGE & PERSISTENT SYNC
  // =========================================================================

  /**
   * Persists a location record to both IndexedDB and LocalStorage mirror.
   */
  static async saveLocationRecord(loc: CachedLocationEntry): Promise<void> {
    if (typeof window === 'undefined' || !loc || !loc.name) return;

    const entry: CachedLocationEntry = {
      ...loc,
      id: loc.id || `loc-${loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      lastSearchedAt: Date.now()
    };

    // 1. Sync to localStorage recent searches
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SEARCHED_LOCATIONS);
      const list: CachedLocationEntry[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter(l => l.id !== entry.id && l.name.toLowerCase() !== entry.name.toLowerCase());
      const updated = [entry, ...filtered].slice(0, 100);
      localStorage.setItem(LOCAL_STORAGE_SEARCHED_LOCATIONS, JSON.stringify(updated));
    } catch (e) {
      console.warn('[WeatherCache] LocalStorage save location warning:', e);
    }

    // 2. Sync to IndexedDB locations_cache store
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(LOCATIONS_STORE, 'readwrite');
        const store = tx.objectStore(LOCATIONS_STORE);
        const req = store.put(entry);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[WeatherCache] IndexedDB save location warning:', err);
    }
  }

  /**
   * Retrieves all location records saved in IndexedDB / LocalStorage.
   */
  static async getAllSavedLocations(): Promise<CachedLocationEntry[]> {
    if (typeof window === 'undefined') return [];

    try {
      const db = await this.getDB();
      const items = await new Promise<CachedLocationEntry[]>((resolve) => {
        const tx = db.transaction(LOCATIONS_STORE, 'readonly');
        const store = tx.objectStore(LOCATIONS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (items && items.length > 0) return items;
    } catch {}

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SEARCHED_LOCATIONS);
      if (raw) {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
      }
    } catch {}

    return [];
  }
}
