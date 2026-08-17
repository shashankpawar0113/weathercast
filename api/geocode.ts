import type { VercelRequest, VercelResponse } from '@vercel/node';
import { geocodeOpenMeteo, searchSimulatedCities } from '../server/weatherApiCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  const cleanQuery = q.trim();
  if (cleanQuery.length < 2) {
    return res.status(200).json([]);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  // Tier 1: OpenWeatherMap (if API Key provided)
  if (apiKey && apiKey !== '') {
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanQuery)}&limit=5&appid=${apiKey}`
      );
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const seen = new Set<string>();
          const uniqueResults: any[] = [];
          for (const item of data) {
            const key = `${item.name.toLowerCase()}-${(item.state || '').toLowerCase()}-${item.country.toLowerCase()}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueResults.push(item);
            }
          }
          res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
          return res.status(200).json(uniqueResults.slice(0, 5));
        }
      }
    } catch (err) {
      console.warn('[OpenWeather Geocode Error, falling back to Open-Meteo]:', err);
    }
  }

  // Tier 2: Open-Meteo Global Geocoding (Zero-Key Engine)
  try {
    const openMeteoResults = await geocodeOpenMeteo(cleanQuery);
    if (openMeteoResults.length > 0) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(openMeteoResults.slice(0, 5));
    }
  } catch (err) {
    console.error('[Open-Meteo Geocoding Error]:', err);
  }

  // Tier 3: Simulated cities search fallback
  const fallback = searchSimulatedCities(cleanQuery);
  return res.status(200).json(fallback);
}
