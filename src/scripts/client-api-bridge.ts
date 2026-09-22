// src/scripts/client-api-bridge.ts
// Client-side API route interceptor for Astro Static & Capacitor Android / PWA builds
// Routes /api/* directly to client-side services, eliminating frozen build artifacts

import { fetchWeatherData } from '../services/weather.service';
import { generateProfileAdvisory, generateFarmerRecommendation, generateChatResponse, type ChatMessage } from '../services/ai.service';
import { searchLocationsAsync } from '../services/geocoding.service';
import { StorageService } from '../services/storage.service';
import { NetworkService } from '../services/network.service';

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

    try {
      // 1. /api/weather Interceptor
      if (urlStr.includes('/api/weather')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const city = urlObj.searchParams.get('city') || 'sasaram';
        const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('location') || undefined;
        const lat = urlObj.searchParams.get('lat');
        const lon = urlObj.searchParams.get('lon');
        const finalQuery = (lat && lon) ? `${lat},${lon}` : q;

        try {
          const weatherData = await fetchWeatherData(city, finalQuery);
          StorageService.setLastWeatherData(weatherData);

          if (weatherData.location) {
            const locName = weatherData.location.name || city;
            const locCountry = weatherData.location.country || 'India';
            const display = `${locName}, ${locCountry}`;
            StorageService.setLastLocation(display, city);
          }

          return new Response(JSON.stringify(weatherData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (err: any) {
          console.warn('[ClientApiBridge] /api/weather error:', err);
          const fallbackData = StorageService.getLastWeatherData();
          return new Response(
            JSON.stringify(fallbackData || {
              error: 'offline_fallback',
              isCached: true,
              message: 'Offline weather state active.'
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // 2. /api/search Interceptor with Pre-Populated DB & Fallback Suggestions
      if (urlStr.includes('/api/search')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const query = urlObj.searchParams.get('q') || '';
        const results = await searchLocationsAsync(query);

        return new Response(JSON.stringify(results), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 3. /api/recommendations Interceptor
      if (urlStr.includes('/api/recommendations')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const city = urlObj.searchParams.get('city')?.toLowerCase() || 'greater noida';
        const persona = urlObj.searchParams.get('persona')?.toLowerCase() || 'farmer';
        const crop = urlObj.searchParams.get('crop') || 'Wheat';
        const stage = urlObj.searchParams.get('stage') || urlObj.searchParams.get('growthStage') || 'Sowing';
        const locationQuery = urlObj.searchParams.get('q') || urlObj.searchParams.get('location') || city || 'Greater Noida';
        const isFarmer = !!urlObj.searchParams.get('crop') || persona === 'agriculture' || persona === 'farmer';

        let weatherData = null;
        try {
          weatherData = await fetchWeatherData(city, locationQuery);
        } catch {}

        if (isFarmer && weatherData) {
          const farmerRec = await generateFarmerRecommendation(locationQuery, crop, stage, weatherData);
          return new Response(JSON.stringify({
            ...farmerRec,
            recommendation: farmerRec.summary,
            crop,
            growthStage: stage,
            location: weatherData.location?.name || locationQuery,
            weatherSummary: {
              temp_c: weatherData.current?.temp_c,
              condition: weatherData.current?.condition?.text,
              humidity: weatherData.current?.humidity,
              wind_kph: weatherData.current?.wind_kph,
              soil_moisture_pct: weatherData.agriculture?.soil_moisture_pct || 50,
              rainfall_prediction_24h_mm: weatherData.agriculture?.rainfall_prediction_24h_mm || 0,
              frost_alert: weatherData.agriculture?.frost_alert || false
            }
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        const healthProfile = urlObj.searchParams.get('healthProfile') || urlObj.searchParams.get('health_profile');
        const sport = urlObj.searchParams.get('sport') || urlObj.searchParams.get('activityType') || urlObj.searchParams.get('activity_type') || urlObj.searchParams.get('sportModality');
        const flightRule = urlObj.searchParams.get('flightRule') || urlObj.searchParams.get('flight_rule');
        const vessel = urlObj.searchParams.get('vessel') || urlObj.searchParams.get('vesselType') || urlObj.searchParams.get('vessel_type');
        const workType = urlObj.searchParams.get('workType') || urlObj.searchParams.get('work_type');
        const genType = urlObj.searchParams.get('genType') || urlObj.searchParams.get('generationType') || urlObj.searchParams.get('generation_type');
        const fleetType = urlObj.searchParams.get('fleetType') || urlObj.searchParams.get('fleet_type');
        const commuteMode = urlObj.searchParams.get('commuteMode') || urlObj.searchParams.get('commute_mode');
        const venueType = urlObj.searchParams.get('venueType') || urlObj.searchParams.get('venue_type');
        const tripType = urlObj.searchParams.get('tripType') || urlObj.searchParams.get('trip_type');
        const priority = urlObj.searchParams.get('priority') || urlObj.searchParams.get('family_priority');

        const customSettings: Record<string, any> = {
          ...(healthProfile ? { healthProfile, health_profile: healthProfile } : {}),
          ...(sport ? { sport, sportModality: sport, activityType: sport, activity_type: sport } : {}),
          ...(flightRule ? { flightRule, flight_rule: flightRule } : {}),
          ...(vessel ? { vessel, vesselType: vessel, vessel_type: vessel } : {}),
          ...(workType ? { workType, work_type: workType } : {}),
          ...(genType ? { genType, generationType: genType, generation_type: genType } : {}),
          ...(fleetType ? { fleetType, fleet_type: fleetType } : {}),
          ...(commuteMode ? { commuteMode, commute_mode: commuteMode } : {}),
          ...(venueType ? { venueType, venue_type: venueType } : {}),
          ...(tripType ? { tripType, trip_type: tripType } : {}),
          ...(priority ? { priority, family_priority: priority } : {}),
          ...(crop ? { target_crop: crop, crop } : {}),
          ...(stage ? { growth_stage: stage, stage } : {})
        };

        const rawCustom = urlObj.searchParams.get('customSettings');
        if (rawCustom) {
          try {
            Object.assign(customSettings, JSON.parse(rawCustom));
          } catch {}
        }

        const advisory = await generateProfileAdvisory(persona, city, locationQuery, weatherData, customSettings);
        return new Response(JSON.stringify({
          recommendation: advisory.recommendation,
          advisory,
          summary: advisory.summary,
          data_quality: advisory.data_quality || 'good',
          confidence: advisory.confidence || 'high',
          freshness: advisory.freshness || 'Fresh',
          verified_alerts: advisory.verified_alerts || [],
          source: advisory.source || 'deterministic-engine'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 4. /api/chat Interceptor
      if (urlStr.includes('/api/chat')) {
        let bodyData: any = {};
        if (init?.body) {
          try {
            bodyData = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
          } catch {}
        } else if (urlStr.includes('?')) {
          const urlObj = new URL(urlStr, window.location.origin);
          bodyData = {
            message: urlObj.searchParams.get('q') || urlObj.searchParams.get('message') || '',
            location: urlObj.searchParams.get('location') || urlObj.searchParams.get('city') || 'Greater Noida',
            persona: urlObj.searchParams.get('persona') || 'agriculture',
            crop: urlObj.searchParams.get('crop') || 'Wheat',
            stage: urlObj.searchParams.get('stage') || 'Sowing'
          };
        }

        const {
          message,
          messages = [],
          location = 'Greater Noida',
          persona = 'agriculture',
          crop = 'Wheat',
          stage = 'Sowing'
        } = bodyData;

        const chatHistory: ChatMessage[] = Array.isArray(messages) && messages.length > 0
          ? messages
          : [{ role: 'user', content: message || 'What is the weather status?' }];

        let weatherData = null;
        try {
          weatherData = await fetchWeatherData('custom', location);
        } catch {}

        const reply = await generateChatResponse(chatHistory, {
          city: location,
          persona,
          crop,
          stage,
          weatherData
        });

        return new Response(JSON.stringify({
          response: reply,
          location,
          persona,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (err) {
      console.warn('[ClientApiBridge] Interceptor error, falling back to network fetch:', err);
    }

    return originalFetch(input, init);
  };
}

export {};
