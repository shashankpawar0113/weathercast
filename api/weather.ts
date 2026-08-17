import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  normalizeWeatherData,
  fetchOpenMeteoWeather,
  geocodeOpenMeteo,
  generateSimulatedWeather,
} from '../server/weatherApiCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'Missing city or lat/lon parameters' });
  }

  let queryLat = lat ? parseFloat(lat as string) : null;
  let queryLon = lon ? parseFloat(lon as string) : null;
  let cityName = (city as string) || '';

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  // Tier 1: OpenWeatherMap (if API Key provided)
  if (apiKey && apiKey !== '') {
    try {
      if ((queryLat === null || queryLon === null) && cityName) {
        const geoRes = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (Array.isArray(geoData) && geoData.length > 0) {
            queryLat = geoData[0].lat;
            queryLon = geoData[0].lon;
            cityName = geoData[0].name;
          }
        }
      }

      if (!cityName && queryLat !== null && queryLon !== null) {
        try {
          const revRes = await fetch(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${queryLat}&lon=${queryLon}&limit=1&appid=${apiKey}`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            if (Array.isArray(revData) && revData.length > 0 && revData[0].name) {
              cityName = revData[0].name;
            }
          }
        } catch (err) {
          console.warn('[Weather API Reverse Geocode Error]:', err);
        }
      }

      if (queryLat !== null && queryLon !== null) {
        const [currentRes, forecastRes] = await Promise.all([
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${queryLat}&lon=${queryLon}&units=metric&appid=${apiKey}`
          ),
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${queryLat}&lon=${queryLon}&units=metric&appid=${apiKey}`
          ),
        ]);

        if (currentRes.ok && forecastRes.ok) {
          const currentData = await currentRes.json();
          const forecastData = await forecastRes.json();
          const normalized = normalizeWeatherData(
            currentData,
            forecastData,
            'live',
            cityName || (city ? (city as string) : undefined)
          );
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
          return res.status(200).json(normalized);
        }
      }
    } catch (err) {
      console.warn('[OpenWeather API Error, falling back to Open-Meteo]:', err);
    }
  }

  // Tier 2: Open-Meteo Global Engine (Zero-Key Live Weather)
  try {
    if ((queryLat === null || queryLon === null) && cityName) {
      const geoResults = await geocodeOpenMeteo(cityName);
      if (geoResults.length > 0) {
        queryLat = geoResults[0].lat;
        queryLon = geoResults[0].lon;
        cityName = geoResults[0].name;
      }
    }

    if (queryLat !== null && queryLon !== null) {
      const openMeteoData = await fetchOpenMeteoWeather(
        queryLat,
        queryLon,
        cityName || 'Weather Location'
      );
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(openMeteoData);
    }
  } catch (err) {
    console.error('[Open-Meteo API Error]:', err);
  }

  // Tier 3: High-fidelity realistic simulation fallback
  const fallback = generateSimulatedWeather(
    cityName || (city as string) || 'Mumbai',
    queryLat !== null ? queryLat : undefined,
    queryLon !== null ? queryLon : undefined
  );
  return res.status(200).json(fallback);
}
