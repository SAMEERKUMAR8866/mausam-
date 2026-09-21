// src/scripts/client-api-bridge.ts
// Intercepts client-side /api/* fetch requests for static & offline PWA / Android Capacitor compatibility

import { fetchWeatherData } from '../services/weather.service';
import { generateProfileAdvisory } from '../services/ai.service';
import { searchLocations } from '../services/geocoding.service';
import { StorageService } from '../services/storage.service';

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    try {
      // 1. /api/weather interceptor
      if (urlStr.includes('/api/weather')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const city = urlObj.searchParams.get('city') || 'new_delhi';
        const q = urlObj.searchParams.get('q') || undefined;

        try {
          // If online, try original fetch first (in dev or SSR mode)
          if (navigator.onLine) {
            const resp = await originalFetch(input, init);
            if (resp.ok) {
              const data = await resp.clone().json();
              StorageService.setLastWeatherData(data);
              return resp;
            }
          }
        } catch {}

        // Direct client-side engine fallback
        const weatherData = await fetchWeatherData(city, q);
        StorageService.setLastWeatherData(weatherData);

        return new Response(JSON.stringify(weatherData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 2. /api/recommendations interceptor
      if (urlStr.includes('/api/recommendations')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const city = urlObj.searchParams.get('city') || 'new_delhi';
        const persona = urlObj.searchParams.get('persona') || 'farmer';
        const display = urlObj.searchParams.get('display') || undefined;

        try {
          if (navigator.onLine) {
            const resp = await originalFetch(input, init);
            if (resp.ok) return resp;
          }
        } catch {}

        const advisory = await generateProfileAdvisory(persona, city, display);
        return new Response(JSON.stringify({ recommendation: advisory.recommendation, advisory }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3. /api/search interceptor
      if (urlStr.includes('/api/search')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const query = urlObj.searchParams.get('q') || '';
        const results = await searchLocations(query);

        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (err) {
      console.warn('[ClientApiBridge] Interceptor handled error:', err);
    }

    return originalFetch(input, init);
  };
}
