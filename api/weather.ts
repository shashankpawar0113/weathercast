import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeWeatherData, generateSimulatedWeather } from '../server/weatherApiCore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { city, lat, lon } = req.query;

  if (!city && (!lat || !lon)) {
    return res.status(400).json({ error: 'Missing city or lat/lon parameters' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

  if (apiKey && apiKey !== '') {
    try {
      let queryLat = lat ? parseFloat(lat as string) : null;
      let queryLon = lon ? parseFloat(lon as string) : null;
      let cityName = (city as string) || '';

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

      // If coordinates provided without city name, reverse geocode
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
          return res.status(200).json(normalized);
        }
      }
    } catch (err) {
      console.error('[Weather API Error]:', err);
    }
  }

  const fallback = generateSimulatedWeather(
    (city as string) || 'Mumbai',
    lat ? parseFloat(lat as string) : undefined,
    lon ? parseFloat(lon as string) : undefined
  );
  return res.status(200).json(fallback);
}
