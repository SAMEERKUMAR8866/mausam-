import type { APIRoute } from 'astro';
import { searchLocations } from '../../services/geocoding.service';

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || '';

  if (query.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const apiKey = import.meta.env.WEATHER_API_KEY;
  const lowerQuery = query.toLowerCase();

  let apiResults: any[] = [];

  // Try WeatherAPI search
  if (apiKey) {
    try {
      const apiResponse = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`
      );

      if (apiResponse.ok) {
        const raw = await apiResponse.json();
        const results = Array.isArray(raw) ? raw : (raw.value || []);
        apiResults = results.map((r: any) => ({
          id: r.id,
          name: r.name,
          region: r.region || '',
          country: r.country || '',
          lat: r.lat,
          lon: r.lon,
          display: r.region ? `${r.name}, ${r.region}, ${r.country}` : `${r.name}, ${r.country}`
        }));
      }
    } catch (error) {
      console.error('[API/search] WeatherAPI search error:', error);
    }
  }

  // Get mock results (includes all Indian states)
  const mockResults = searchLocations(query);

  // Merge: combine both, remove duplicates by name+country
  const seen = new Set<string>();
  const merged: any[] = [];

  for (const loc of [...mockResults, ...apiResults]) {
    const key = `${loc.name.toLowerCase()}_${loc.country}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({
        ...loc,
        key: loc.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      });
    }
  }

  // Sort: India first, then exact match, then starts-with
  merged.sort((a: any, b: any) => {
    const aIndia = a.country === 'India' ? 0 : 1;
    const bIndia = b.country === 'India' ? 0 : 1;
    if (aIndia !== bIndia) return aIndia - bIndia;

    const aExact = a.name.toLowerCase() === lowerQuery ? 0 : 1;
    const bExact = b.name.toLowerCase() === lowerQuery ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    const aStarts = a.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    return aStarts - bStarts;
  });

  return new Response(JSON.stringify(merged.slice(0, 10)), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
};
