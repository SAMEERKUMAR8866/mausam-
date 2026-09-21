// public/sw.js
// Mausam Offline Service Worker & Telemetry Cache Interceptor

const CACHE_NAME = 'mausam-app-v2';
const WEATHER_API_CACHE = 'mausam-weather-api-v2';
const SEARCH_API_CACHE = 'mausam-search-api-v2';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/farmer',
  '/onboarding',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico'
];

// Pre-bundled baseline locations for instant service worker fallback
const DEFAULT_OFFLINE_LOCATIONS = [
  { id: 'in-delhi', name: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.61, lon: 77.20, display: 'New Delhi, Delhi, India', category: 'Capital' },
  { id: 'in-noida', name: 'Greater Noida', region: 'Uttar Pradesh', country: 'India', lat: 28.47, lon: 77.50, display: 'Greater Noida, Uttar Pradesh, India', category: 'Tech Hub' },
  { id: 'in-gurugram', name: 'Gurugram', region: 'Haryana', country: 'India', lat: 28.46, lon: 77.03, display: 'Gurugram, Haryana, India', category: 'Tech Hub' },
  { id: 'in-bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.97, lon: 77.59, display: 'Bengaluru, Karnataka, India', category: 'Tech Hub' },
  { id: 'in-mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.07, lon: 72.87, display: 'Mumbai, Maharashtra, India', category: 'Metro', isCoastal: true },
  { id: 'in-hyderabad', name: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.38, lon: 78.48, display: 'Hyderabad, Telangana, India', category: 'Tech Hub' },
  { id: 'in-chennai', name: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.08, lon: 80.27, display: 'Chennai, Tamil Nadu, India', category: 'Metro', isCoastal: true },
  { id: 'in-kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.57, lon: 88.36, display: 'Kolkata, West Bengal, India', category: 'Metro', isCoastal: true },
  { id: 'in-lucknow', name: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.84, lon: 80.94, display: 'Lucknow, Uttar Pradesh, India', category: 'Capital' },
  { id: 'in-jaipur', name: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.91, lon: 75.78, display: 'Jaipur, Rajasthan, India', category: 'Capital' },
  { id: 'in-chandigarh', name: 'Chandigarh', region: 'Chandigarh', country: 'India', lat: 30.73, lon: 76.77, display: 'Chandigarh, Chandigarh, India', category: 'Capital' },
  { id: 'gb-london', name: 'London', region: 'Greater London', country: 'United Kingdom', lat: 51.50, lon: -0.12, display: 'London, Greater London, United Kingdom', category: 'Global' },
  { id: 'us-nyc', name: 'New York', region: 'New York', country: 'United States', lat: 40.71, lon: -74.00, display: 'New York, New York, United States', category: 'Global', isCoastal: true },
  { id: 'jp-tokyo', name: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.67, lon: 139.65, display: 'Tokyo, Kanto, Japan', category: 'Global', isCoastal: true }
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching static assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== WEATHER_API_CACHE && key !== SEARCH_API_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Intercept /api/search requests (Network-first with offline location database fallback)
  if (url.pathname.startsWith('/api/search')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(SEARCH_API_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check cached response in CacheStorage
          const cache = await caches.open(SEARCH_API_CACHE);
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) return cachedResponse;

          // Search from pre-bundled offline list
          const query = (url.searchParams.get('q') || '').toLowerCase().trim();
          let matches = DEFAULT_OFFLINE_LOCATIONS.filter(l =>
            l.name.toLowerCase().includes(query) ||
            l.region.toLowerCase().includes(query) ||
            l.country.toLowerCase().includes(query) ||
            l.display.toLowerCase().includes(query)
          );

          if (matches.length === 0) {
            matches = DEFAULT_OFFLINE_LOCATIONS.slice(0, 5).map(l => ({
              ...l,
              isFallback: true,
              suggestionReason: `Offline suggestion for "${query}"`
            }));
          }

          return new Response(JSON.stringify(matches), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        })
    );
    return;
  }

  // 2. Intercept /api/weather requests
  if (url.pathname.startsWith('/api/weather')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(WEATHER_API_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed - look in CacheStorage
          const cache = await caches.open(WEATHER_API_CACHE);
          const cachedResponse = await cache.match(event.request);

          if (cachedResponse) {
            return cachedResponse;
          }

          // Return clean JSON Response (never throw or return invalid response)
          const cityParam = url.searchParams.get('city') || url.searchParams.get('q') || 'selected location';
          return new Response(
            JSON.stringify({
              error: 'not_cached',
              notCached: true,
              message: `Weather data for ${cityParam} is not cached. Connect to internet to fetch initial data.`
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 3. Static Assets & Pages: Network-first with Cache fallback
  if (event.request.method === 'GET' && (url.origin === self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok && event.request.method === 'GET') {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;

          // If navigation request fails, return cached index
          if (event.request.mode === 'navigate') {
            const indexCached = await caches.match('/');
            if (indexCached) return indexCached;
          }

          return new Response('Network error occurred and asset is not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  }
});
