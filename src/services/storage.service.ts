// src/services/storage.service.ts
// Client-side storage and user preferences manager

import type { UserPreferences } from '../data/profiles';
import { DEFAULT_PREFERENCES } from '../data/profiles';

const STORAGE_KEYS = {
  PREFERENCES: 'mausam_user_preferences',
  ACTIVE_PERSONA: 'mausam_active_persona',
  LANGUAGE: 'mausam_language',
  LAST_LOCATION: 'mausam_location_display',
  CITY_KEY: 'mausam_city',
  SAVED_LOCATIONS: 'mausam_saved_locations',
  LAST_WEATHER: 'mausam_last_weather_data',
  CUSTOM_SETTINGS: 'mausam_profile_custom_settings'
};

export class StorageService {
  static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (!raw) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(prefs: Partial<UserPreferences>): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch {}
  }

  static getActivePersona(): string {
    if (typeof window === 'undefined') return 'farmer';
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA) || 'farmer';
  }

  static setActivePersona(personaId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, personaId);
    window.dispatchEvent(new CustomEvent('mausam-persona-changed', { detail: { personaId } }));
  }

  static getLanguage(): string {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  }

  static setLanguage(langCode: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, langCode);
    window.dispatchEvent(new CustomEvent('mausam-language-changed', { detail: { langCode } }));
  }

  static getSavedLocations(): string[] {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES.savedLocations;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_LOCATIONS);
      if (!raw) return DEFAULT_PREFERENCES.savedLocations;
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : DEFAULT_PREFERENCES.savedLocations;
    } catch {
      return DEFAULT_PREFERENCES.savedLocations;
    }
  }

  static addSavedLocation(loc: string): void {
    if (typeof window === 'undefined' || !loc) return;
    const current = this.getSavedLocations();
    if (!current.includes(loc)) {
      const updated = [loc, ...current].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('mausam-saved-locations-changed', { detail: { locations: updated } }));
    }
  }

  static removeSavedLocation(loc: string): void {
    if (typeof window === 'undefined') return;
    const current = this.getSavedLocations();
    const updated = current.filter(l => l !== loc);
    localStorage.setItem(STORAGE_KEYS.SAVED_LOCATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('mausam-saved-locations-changed', { detail: { locations: updated } }));
  }

  static getLastLocation(): string {
    if (typeof window === 'undefined') return 'New Delhi, Delhi, India';
    return localStorage.getItem(STORAGE_KEYS.LAST_LOCATION) || 'New Delhi, Delhi, India';
  }

  static setLastLocation(display: string, cityKey?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, display);
    if (cityKey) localStorage.setItem(STORAGE_KEYS.CITY_KEY, cityKey);
  }

  static getLastWeatherData(): any {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_WEATHER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  static setLastWeatherData(data: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_WEATHER, JSON.stringify(data));
    } catch {}
  }

  static getProfileCustomSettings(personaId: string): Record<string, any> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETTINGS);
      if (!raw) return {};
      const all = JSON.parse(raw);
      return all[personaId] || {};
    } catch {
      return {};
    }
  }

  static setProfileCustomSetting(personaId: string, key: string, value: any): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETTINGS);
      const all = raw ? JSON.parse(raw) : {};
      all[personaId] = { ...(all[personaId] || {}), [key]: value };
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SETTINGS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('mausam-profile-setting-changed', { detail: { personaId, key, value } }));
    } catch {}
  }
}
