import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weather.service';
import { generateRecommendation, generateFarmerRecommendation } from '../../services/ai.service';

export const GET: APIRoute = async ({ url }) => {
  const queryCity = url.searchParams.get('city')?.toLowerCase() || 'greater noida';
  const queryPersona = url.searchParams.get('persona')?.toLowerCase() || '';
  const locationQuery = url.searchParams.get('q') || url.searchParams.get('location') || undefined;
  const cropParam = url.searchParams.get('crop');
  const stageParam = url.searchParams.get('stage') || url.searchParams.get('growthStage');

  const isFarmerRequest = !!cropParam || queryPersona === 'agriculture' || url.searchParams.has('crop');
  const crop = cropParam || 'Wheat';
  const stage = stageParam || 'Vegetative';
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
    const recommendation = await generateRecommendation(queryCity, persona, weatherData);

    return new Response(JSON.stringify({ recommendation }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[API/recommendations] Error:', error);
    return new Response(JSON.stringify({ 
      recommendation: 'AI service temporarily unavailable. Standard agronomic monitoring recommended.',
      error: 'Failed to process recommendation request'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};