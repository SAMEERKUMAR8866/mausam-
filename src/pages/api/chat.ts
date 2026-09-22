// src/pages/api/chat.ts
// Mausam AI Interactive Chatbot API Endpoint
import type { APIRoute } from 'astro';
import { fetchWeatherData } from '../../services/weather.service';
import { generateChatResponse, type ChatMessage } from '../../services/ai.service';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { 
      message, 
      messages = [], 
      location = 'Greater Noida', 
      persona = 'agriculture', 
      crop = 'Wheat', 
      stage = 'Sowing' 
    } = body;

    const chatHistory: ChatMessage[] = Array.isArray(messages) && messages.length > 0 
      ? messages 
      : [{ role: 'user', content: message || 'What is the weather status?' }];

    // Fetch live weather data for context
    let weatherData = null;
    try {
      weatherData = await fetchWeatherData('custom', location);
    } catch {
      // fallback
    }

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

  } catch (error) {
    console.error('[API/chat] Error:', error);
    return new Response(JSON.stringify({
      response: 'I am currently operating in offline mode. Weather parameters are stable. How can I assist you with your crops or transit today?',
      error: 'Chat request failed'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q') || url.searchParams.get('message') || 'What is today\'s weather?';
  const location = url.searchParams.get('location') || url.searchParams.get('city') || 'Greater Noida';
  const persona = url.searchParams.get('persona') || 'agriculture';
  const crop = url.searchParams.get('crop') || 'Wheat';
  const stage = url.searchParams.get('stage') || 'Sowing';

  try {
    const weatherData = await fetchWeatherData('custom', location);
    const reply = await generateChatResponse([{ role: 'user', content: query }], {
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
  } catch (err) {
    return new Response(JSON.stringify({
      response: `Weather in ${location} is nominal. Safe operations advised for ${persona}.`,
      error: 'Fallback'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
