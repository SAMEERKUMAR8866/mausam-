import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weather.service';
import { generateFarmerRecommendation, generateProfileAdvisory } from '../../services/ai.service';

export const GET: APIRoute = async ({ url }) => {
  const queryCity = url.searchParams.get('city')?.toLowerCase() || 'greater noida';
  const queryPersona = url.searchParams.get('persona')?.toLowerCase() || '';
  const locationQuery = url.searchParams.get('q') || url.searchParams.get('location') || undefined;
  const cropParam = url.searchParams.get('crop');
  const stageParam = url.searchParams.get('stage') || url.searchParams.get('growthStage');

  const isFarmerRequest = !!cropParam || queryPersona === 'agriculture' || url.searchParams.has('crop');
  const crop = cropParam || 'Wheat';
  const stage = stageParam || 'Sowing';
  const targetLocation = locationQuery || queryCity || 'Greater Noida';

  try {
    // Fetch weather data for AI context (using real location query)
    const weatherData = await fetchWeatherData(queryCity, targetLocation);

    if (isFarmerRequest) {
      // Generate specialized Farmer Recommendations
      const farmerRec = await generateFarmerRecommendation(targetLocation, crop, stage, weatherData);

      return new Response(JSON.stringify({
        ...farmerRec,
        recommendation: farmerRec.summary,
        crop,
        growthStage: stage,
        location: weatherData.location.name || targetLocation,
        weatherSummary: {
          temp_c: weatherData.current.temp_c,
          condition: weatherData.current.condition.text,
          humidity: weatherData.current.humidity,
          wind_kph: weatherData.current.wind_kph,
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

    // Standard Persona recommendation
    const persona = queryPersona || 'health';
    
    // Extract persona custom parameters
    const healthProfile = url.searchParams.get('healthProfile') || url.searchParams.get('health_profile');
    const sport = url.searchParams.get('sport') || url.searchParams.get('activityType') || url.searchParams.get('activity_type') || url.searchParams.get('sportModality');
    const flightRule = url.searchParams.get('flightRule') || url.searchParams.get('flight_rule');
    const vessel = url.searchParams.get('vessel') || url.searchParams.get('vesselType') || url.searchParams.get('vessel_type');
    const workType = url.searchParams.get('workType') || url.searchParams.get('work_type');
    const genType = url.searchParams.get('genType') || url.searchParams.get('generationType') || url.searchParams.get('generation_type');
    const fleetType = url.searchParams.get('fleetType') || url.searchParams.get('fleet_type');
    const commuteMode = url.searchParams.get('commuteMode') || url.searchParams.get('commute_mode');
    const venueType = url.searchParams.get('venueType') || url.searchParams.get('venue_type');
    const tripType = url.searchParams.get('tripType') || url.searchParams.get('trip_type');
    const priority = url.searchParams.get('priority') || url.searchParams.get('family_priority');

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
      ...(cropParam ? { target_crop: cropParam, crop: cropParam } : {}),
      ...(stageParam ? { growth_stage: stageParam, stage: stageParam } : {})
    };

    const rawCustom = url.searchParams.get('customSettings');
    if (rawCustom) {
      try {
        Object.assign(customSettings, JSON.parse(rawCustom));
      } catch {}
    }

    const advisory = await generateProfileAdvisory(persona, queryCity, targetLocation, weatherData, customSettings);

    return new Response(JSON.stringify({ 
      recommendation: advisory.recommendation,
      advisory,
      summary: advisory.summary,
      location: weatherData.location.name || targetLocation,
      persona,
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
  } catch (error: any) {
    if (!error?.notCached) {
      console.error('[API/recommendations] Error:', error);
    }
    return new Response(JSON.stringify({ 
      recommendation: 'AI advisory ready. Connect to internet or select a cached location for real-time telemetry.',
      error: error?.notCached ? 'not_cached' : 'Failed to process recommendation request'
    }), {
      status: error?.notCached ? 200 : 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};