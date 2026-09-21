// src/scripts/location.ts
// Automatic GPS & reverse geolocation handler

import { detectUserLocation } from '../services/geocoding.service';
import { StorageService } from '../services/storage.service';

export async function initUserLocation(): Promise<{ key: string; display: string }> {
  const savedDisplay = StorageService.getLastLocation();
  if (savedDisplay) {
    return { key: 'saved_location', display: savedDisplay };
  }

  try {
    const detected = await detectUserLocation();
    StorageService.setLastLocation(detected.display, detected.key);
    return detected;
  } catch {
    const fallback = { key: 'new_delhi', display: 'New Delhi, Delhi, India' };
    StorageService.setLastLocation(fallback.display, fallback.key);
    return fallback;
  }
}
