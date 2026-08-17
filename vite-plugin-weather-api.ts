import type { Plugin } from 'vite';
import dotenv from 'dotenv';
import {
  normalizeWeatherData,
  fetchOpenMeteoWeather,
  geocodeOpenMeteo,
  generateSimulatedWeather,
  searchSimulatedCities,
} from './server/weatherApiCore';

// Load .env on server start
dotenv.config();

export function weatherApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-weather-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);

        if (url.pathname === '/api/detect-location') {
          try {
            const geoRes = await fetch('https://ipapi.co/json/');
            if (geoRes.ok) {
              const data = await geoRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  city: data.city || 'Delhi',
                  region: data.region || '',
                  country: data.country_code || 'IN',
                  lat: data.latitude || 28.6139,
                  lon: data.longitude || 77.209,
                })
              );
              return;
            }
          } catch (err) {
            console.error('[WeatherAPI Location Detect Error]:', err);
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              city: 'Delhi',
              region: 'Delhi',
              country: 'IN',
              lat: 28.6139,
              lon: 77.209,
            })
          );
          return;
        }

        if (url.pathname === '/api/geocode') {
          const q = url.searchParams.get('q');
          if (!q) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing query parameter q' }));
            return;
          }

          const cleanQuery = q.trim();
          const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

          if (apiKey && apiKey !== '') {
            try {
              const geoRes = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanQuery)}&limit=10&appid=${apiKey}`
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

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(uniqueResults.slice(0, 5)));
                  return;
                }
              }
            } catch (err) {
              console.error('[WeatherAPI Geocode Error]:', err);
            }
          }

          // Open-Meteo Geocoding Fallback
          try {
            const openMeteoResults = await geocodeOpenMeteo(cleanQuery);
            if (openMeteoResults.length > 0) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(openMeteoResults.slice(0, 5)));
              return;
            }
          } catch (err) {
            console.error('[WeatherAPI Open-Meteo Geocode Error]:', err);
          }

          // Simulated fallback
          const fallbackResults = searchSimulatedCities(cleanQuery);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(fallbackResults));
          return;
        }

        if (url.pathname === '/api/weather') {
          const city = url.searchParams.get('city');
          const lat = url.searchParams.get('lat');
          const lon = url.searchParams.get('lon');
          const apiKey = process.env.OPENWEATHER_API_KEY?.trim();

          if (!city && (!lat || !lon)) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing city or lat/lon parameters' }));
            return;
          }

          let queryLat = lat ? parseFloat(lat) : null;
          let queryLon = lon ? parseFloat(lon) : null;
          let cityName = city || '';

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
                  console.warn('[WeatherAPI Reverse Geocode Error]:', err);
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
                    cityName || (city ? city : undefined)
                  );
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(normalized));
                  return;
                }
              }
            } catch (err) {
              console.warn('[WeatherAPI OpenWeather Error, trying Open-Meteo]:', err);
            }
          }

          // Open-Meteo Zero-Key Live Engine
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
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(openMeteoData));
              return;
            }
          } catch (err) {
            console.error('[WeatherAPI Open-Meteo Live Error]:', err);
          }

          // Fallback simulation
          const fallbackData = generateSimulatedWeather(
            cityName || city || 'Mumbai',
            queryLat !== null ? queryLat : undefined,
            queryLon !== null ? queryLon : undefined
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(fallbackData));
          return;
        }

        next();
      });
    },
  };
}
