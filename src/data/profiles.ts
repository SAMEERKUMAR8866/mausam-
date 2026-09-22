// src/data/profiles.ts
// Profiles registry and profile helpers

import { PERSONAS } from './personas';
import { PROFILE_CONFIGS } from './profileControls';

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
  savedLocations: ['Sasarām, Bihar, India', 'Mumbai, Maharashtra, India', 'London, UK', 'New Delhi, Delhi, India'],
  lastLocation: 'Sasarām, Bihar, India',
  customProfileSettings: {
    farmer: { target_crop: 'Wheat', growth_stage: 'Sowing', crop: 'Wheat', stage: 'Sowing' }
  }
};

export { PERSONAS, PROFILE_CONFIGS };
