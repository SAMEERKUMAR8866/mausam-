// src/data/profiles.ts
// Profiles registry and profile helpers

import { PERSONAS, type PersonaDefinition } from './personas';
import { PROFILE_CONFIGS, type PersonaProfileConfig } from './profileControls';

export interface UserPreferences {
  activePersona: string;
  language: string;
  savedLocations: string[];
  lastLocation: string;
  offlineCachedData?: any;
  customProfileSettings?: Record<string, any>;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  activePersona: 'farmer',
  language: 'en',
  savedLocations: ['New Delhi, Delhi, India', 'Mumbai, Maharashtra, India', 'Greater Noida, Uttar Pradesh, India'],
  lastLocation: 'New Delhi, Delhi, India',
  customProfileSettings: {
    farmer: { crop: 'Wheat', stage: 'Vegetative' }
  }
};

export { PERSONAS, PROFILE_CONFIGS };
