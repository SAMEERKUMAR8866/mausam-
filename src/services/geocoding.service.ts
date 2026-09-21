// src/services/geocoding.service.ts
// Geocoding & Reverse Geocoding service with offline fallback database

export interface GeocodingResult {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  display: string;
}

export const MOCK_LOCATIONS: GeocodingResult[] = [
  // --- India Major Metros & Cities ---
  { id: 'in-delhi', name: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.61, lon: 77.20, display: 'New Delhi, Delhi, India' },
  { id: 'in-mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.07, lon: 72.87, display: 'Mumbai, Maharashtra, India' },
  { id: 'in-bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.97, lon: 77.59, display: 'Bengaluru, Karnataka, India' },
  { id: 'in-kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.57, lon: 88.36, display: 'Kolkata, West Bengal, India' },
  { id: 'in-chennai', name: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.08, lon: 80.27, display: 'Chennai, Tamil Nadu, India' },
  { id: 'in-hyderabad', name: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.38, lon: 78.48, display: 'Hyderabad, Telangana, India' },
  { id: 'in-ahmedabad', name: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.02, lon: 72.57, display: 'Ahmedabad, Gujarat, India' },
  { id: 'in-pune', name: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.52, lon: 73.85, display: 'Pune, Maharashtra, India' },
  { id: 'in-noida', name: 'Greater Noida', region: 'Uttar Pradesh', country: 'India', lat: 28.47, lon: 77.50, display: 'Greater Noida, Uttar Pradesh, India' },
  { id: 'in-lucknow', name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.84, lon: 80.94, display: 'Lucknow, Uttar Pradesh, India' },
  { id: 'in-jaipur', name: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.91, lon: 75.78, display: 'Jaipur, Rajasthan, India' },
  { id: 'in-chandigarh', name: 'Chandigarh', region: 'Chandigarh', country: 'India', lat: 30.73, lon: 76.77, display: 'Chandigarh, Chandigarh, India' },
  { id: 'in-patna', name: 'Patna', region: 'Bihar', country: 'India', lat: 25.59, lon: 85.13, display: 'Patna, Bihar, India' },
  { id: 'in-bhopal', name: 'Bhopal', region: 'Madhya Pradesh', country: 'India', lat: 23.25, lon: 77.41, display: 'Bhopal, Madhya Pradesh, India' },
  { id: 'in-guwahati', name: 'Guwahati', region: 'Assam', country: 'India', lat: 26.14, lon: 91.73, display: 'Guwahati, Assam, India' },
  { id: 'in-visakhapatnam', name: 'Visakhapatnam', region: 'Andhra Pradesh', country: 'India', lat: 17.68, lon: 83.21, display: 'Visakhapatnam, Andhra Pradesh, India' },
  { id: 'in-kochi', name: 'Kochi', region: 'Kerala', country: 'India', lat: 9.93, lon: 76.26, display: 'Kochi, Kerala, India' },
  { id: 'in-shimla', name: 'Shimla', region: 'Himachal Pradesh', country: 'India', lat: 31.10, lon: 77.17, display: 'Shimla, Himachal Pradesh, India' },
  { id: 'in-dehradun', name: 'Dehradun', region: 'Uttarakhand', country: 'India', lat: 30.31, lon: 78.03, display: 'Dehradun, Uttarakhand, India' },
  { id: 'in-puri', name: 'Puri', region: 'Odisha', country: 'India', lat: 19.81, lon: 85.83, display: 'Puri, Odisha, India' },

  // --- International ---
  { id: 'gb-london', name: 'London', region: 'Greater London', country: 'United Kingdom', lat: 51.50, lon: -0.12, display: 'London, United Kingdom' },
  { id: 'us-nyc', name: 'New York', region: 'New York', country: 'United States', lat: 40.71, lon: -74.00, display: 'New York, United States' },
  { id: 'au-sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.86, lon: 151.20, display: 'Sydney, Australia' },
  { id: 'jp-tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.67, lon: 139.65, display: 'Tokyo, Japan' },
  { id: 'ae-dubai', name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.20, lon: 55.27, display: 'Dubai, United Arab Emirates' }
];

const COASTAL_KEYWORDS = [
  'mumbai', 'chennai', 'kolkata', 'kochi', 'visakhapatnam', 'puri', 'goa', 'panaji', 'port blair',
  'mangalore', 'surat', 'bhavnagar', 'ratnagiri', 'alibaug', 'pondicherry', 'puducherry', 'daman',
  'diu', 'kavaratti', 'paradip', 'sydney', 'miami', 'honolulu', 'san francisco'
];

export function isCoastalLocation(name = '', region = '', country = ''): boolean {
  const combined = `${name} ${region} ${country}`.toLowerCase();
  return COASTAL_KEYWORDS.some(k => combined.includes(k));
}

export function getFallbackCoordinates(cityKey: string): { lat: number; lon: number } {
  const key = cityKey.toLowerCase().replace(/_/g, ' ');
  const match = MOCK_LOCATIONS.find(l => l.name.toLowerCase().includes(key) || l.id.toLowerCase().includes(key));
  return match ? { lat: match.lat, lon: match.lon } : { lat: 28.61, lon: 77.20 };
}

export function getReverseGeocodeOffline(lat: number, lon: number): { name: string; region: string; country: string; display: string } {
  let closest = MOCK_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of MOCK_LOCATIONS) {
    const dLat = loc.lat - lat;
    const dLon = loc.lon - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = loc;
    }
  }

  // If very close (within ~0.5 deg), return closest match, else coordinates
  if (minDistance < 0.25) {
    return { name: closest.name, region: closest.region, country: closest.country, display: closest.display };
  }

  return {
    name: closest.name,
    region: closest.region,
    country: closest.country,
    display: `${closest.name}, ${closest.region}, ${closest.country}`
  };
}

export function getCityMatches(query: string): GeocodingResult[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return MOCK_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(q) ||
    l.region.toLowerCase().includes(q) ||
    l.country.toLowerCase().includes(q) ||
    l.display.toLowerCase().includes(q)
  ).slice(0, 8);
}

export function searchLocations(query: string): GeocodingResult[] {
  return getCityMatches(query);
}

export async function searchLocationsAsync(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const offlineMatches = getCityMatches(query);

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return offlineMatches;
  }

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          id: `om-${r.id || r.name}`,
          name: r.name,
          region: r.admin1 || '',
          country: r.country || 'India',
          lat: r.latitude,
          lon: r.longitude,
          display: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}, ${r.country || 'India'}`
        }));
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
