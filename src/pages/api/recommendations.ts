import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weather.service';
import { generateRecommendation } from '../../services/ai.service';

export const prerender = true;

export const GET: APIRoute = async ({ url }) => {
  const queryCity = url.searchParams.get('city')?.toLowerCase() || 'mumbai';
  const queryPersona = url.searchParams.get('persona')?.toLowerCase() || 'health';
  const locationQuery = url.searchParams.get('q') || undefined;

  try {
    // Fetch weather data for AI context (using real location query)
    const weatherData = await fetchWeatherData(queryCity, locationQuery);

    // Generate AI recommendation using Gemini or mock
    const recommendation = await generateRecommendation(queryCity, queryPersona, weatherData);

    return new Response(JSON.stringify({ recommendation }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('[API/recommendations] Error:', error);
    return new Response(JSON.stringify({ recommendation: 'AI service temporarily unavailable.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};