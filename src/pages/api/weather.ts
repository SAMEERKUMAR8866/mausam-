import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weather.service';

export const GET: APIRoute = async ({ url }) => {
  const queryCity = url.searchParams.get('city')?.toLowerCase() || 'mumbai';
  const locationQuery = url.searchParams.get('q') || undefined;
  const lat = url.searchParams.get('lat') || undefined;
  const lon = url.searchParams.get('lon') || undefined;

  // If lat/lon provided, use them as direct coordinates for WeatherAPI
  const finalQuery = (lat && lon) ? `${lat},${lon}` : locationQuery;

  try {
    const weatherData = await fetchWeatherData(queryCity, finalQuery);

    return new Response(JSON.stringify(weatherData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    const isNotCached = error?.notCached || false;
    return new Response(
      JSON.stringify({
        error: isNotCached ? 'not_cached' : 'Failed to fetch weather data',
        notCached: isNotCached,
        message: error?.message || 'Weather data unavailable.'
      }),
      {
        status: isNotCached ? 404 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
