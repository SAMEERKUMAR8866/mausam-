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
    if (typeof window === 'undefined') return 'Sasarām, Bihar, India';
    return localStorage.getItem(STORAGE_KEYS.LAST_LOCATION) || 'Sasarām, Bihar, India';
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

  static getDefaultProfileSettings(personaId: string): Record<string, any> {
    const normKey = (personaId === 'agriculture' ? 'farmer' : personaId).toLowerCase();
    const defaults: Record<string, any> = {};

    // Standard baseline defaults for specific personas
    if (normKey === 'farmer') {
      defaults.target_crop = 'Wheat';
      defaults.growth_stage = 'Sowing';
      defaults.crop = 'Wheat';
      defaults.stage = 'Sowing';
    } else if (normKey === 'health') {
      defaults.health_profile = 'Standard';
    } else if (normKey === 'fitness') {
      defaults.activity_type = 'Running';
    } else if (normKey === 'maritime' || normKey === 'marine') {
      defaults.vessel_type = 'Surf';
    } else if (normKey === 'aviation') {
      defaults.flight_rule = 'VFR';
    }

    return defaults;
  }

  static getProfileCustomSettings(personaId: string): Record<string, any> {
    const normKey = (personaId === 'agriculture' ? 'farmer' : personaId).toLowerCase();
    const defaults = this.getDefaultProfileSettings(normKey);
    if (typeof window === 'undefined') return defaults;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETTINGS);
      const all = raw ? JSON.parse(raw) : {};
      const saved = all[normKey] || all[personaId] || {};

      // If farmer, also check legacy explicit localStorage items
      if (normKey === 'farmer') {
        const legCrop = localStorage.getItem('mausam_farmer_crop');
        const legStage = localStorage.getItem('mausam_farmer_stage');
        if (legCrop && !saved.target_crop && !saved.crop) saved.target_crop = legCrop;
        if (legStage && !saved.growth_stage && !saved.stage) saved.growth_stage = legStage;
      }

      const merged = { ...defaults, ...saved };

      // Ensure bidirectional alias synchronization
      if (merged.crop && !merged.target_crop) merged.target_crop = merged.crop;
      if (merged.target_crop && !merged.crop) merged.crop = merged.target_crop;
      if (merged.stage && !merged.growth_stage) merged.growth_stage = merged.stage;
      if (merged.growth_stage && !merged.stage) merged.stage = merged.growth_stage;

      return merged;
    } catch {
      return defaults;
    }
  }

  static setProfileCustomSetting(personaId: string, key: string, value: any): void {
    if (typeof window === 'undefined') return;
    const normKey = (personaId === 'agriculture' ? 'farmer' : personaId).toLowerCase();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETTINGS);
      const all = raw ? JSON.parse(raw) : {};
      const current = { ...this.getDefaultProfileSettings(normKey), ...(all[normKey] || all[personaId] || {}) };
      
      current[key] = value;

      // Synchronize aliases across storage
      if (key === 'target_crop' || key === 'crop') {
        current.target_crop = value;
        current.crop = value;
        if (normKey === 'farmer') {
          localStorage.setItem('mausam_farmer_crop', value);
        }
      }
      if (key === 'growth_stage' || key === 'stage') {
        current.growth_stage = value;
        current.stage = value;
        if (normKey === 'farmer') {
          localStorage.setItem('mausam_farmer_stage', value);
        }
      }

      all[normKey] = current;
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SETTINGS, JSON.stringify(all));

      // Broadcast synchronous unified events
      window.dispatchEvent(new CustomEvent('mausam-profile-setting-changed', {
        detail: { personaId: normKey, key, value, allSettings: current }
      }));
      window.dispatchEvent(new CustomEvent('mausam-profile-option-selected', {
        detail: { personaId: normKey, groupId: key, optionId: value, allSettings: current }
      }));
      window.dispatchEvent(new CustomEvent('mausam-state-synced', {
        detail: { personaId: normKey, key, value, allSettings: current }
      }));
    } catch (err) {
      console.warn('[StorageService] setProfileCustomSetting error:', err);
    }
  }

  static getActiveCrop(): string {
    const settings = this.getProfileCustomSettings('farmer');
    return settings.target_crop || 'Wheat';
  }

  static setActiveCrop(crop: string): void {
    this.setProfileCustomSetting('farmer', 'target_crop', crop);
  }

  static getActiveStage(): string {
    const settings = this.getProfileCustomSettings('farmer');
    return settings.growth_stage || 'Sowing';
  }

  static setActiveStage(stage: string): void {
    this.setProfileCustomSetting('farmer', 'growth_stage', stage);
  }
}
