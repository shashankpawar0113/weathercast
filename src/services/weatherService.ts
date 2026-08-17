import { WeatherData, GeocodeLocation } from '../types/weather';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const weatherCache = new Map<string, CacheEntry<WeatherData>>();
const geocodeCache = new Map<string, CacheEntry<GeocodeLocation[]>>();

// Helpers for client-side direct Open-Meteo fallback (Static hosting zero-key mode)
function formatLocalTime(timestampSec: number, tzOffsetSec: number): string {
  const date = new Date((timestampSec + tzOffsetSec) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

function formatLocalDate(timestampSec: number, tzOffsetSec: number): string {
  const date = new Date((timestampSec + tzOffsetSec) * 1000);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getUTCDay()]}, ${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function interpretWmoCode(code: number, isDay: boolean = true): { condition: string; description: string; iconCode: string; weatherId: number } {
  if (code === 0) return { condition: 'Clear', description: 'Clear sky', iconCode: isDay ? '01d' : '01n', weatherId: 800 };
  if (code === 1) return { condition: 'Clear', description: 'Mainly clear', iconCode: isDay ? '01d' : '01n', weatherId: 800 };
  if (code === 2) return { condition: 'Clouds', description: 'Partly cloudy', iconCode: isDay ? '02d' : '02n', weatherId: 802 };
  if (code === 3) return { condition: 'Clouds', description: 'Overcast', iconCode: isDay ? '04d' : '04n', weatherId: 804 };
  if (code === 45 || code === 48) return { condition: 'Fog', description: 'Foggy conditions', iconCode: isDay ? '50d' : '50n', weatherId: 741 };
  if (code >= 51 && code <= 55) return { condition: 'Drizzle', description: 'Drizzle', iconCode: isDay ? '09d' : '09n', weatherId: 300 };
  if (code >= 61 && code <= 65) return { condition: 'Rain', description: code === 65 ? 'Heavy rain' : 'Rain', iconCode: isDay ? '10d' : '10n', weatherId: 500 };
  if (code >= 71 && code <= 77) return { condition: 'Snow', description: 'Snowfall', iconCode: isDay ? '13d' : '13n', weatherId: 600 };
  if (code >= 80 && code <= 82) return { condition: 'Rain', description: 'Rain showers', iconCode: isDay ? '09d' : '09n', weatherId: 521 };
  if (code >= 85 && code <= 86) return { condition: 'Snow', description: 'Snow showers', iconCode: isDay ? '13d' : '13n', weatherId: 621 };
  if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', description: 'Thunderstorm', iconCode: isDay ? '11d' : '11n', weatherId: 211 };
  return { condition: 'Clear', description: 'Clear sky', iconCode: isDay ? '01d' : '01n', weatherId: 800 };
}

async function fetchDirectOpenMeteo(lat: number, lon: number, cityName: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const tzOffsetSec = data.utc_offset_seconds || 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const cur = data.current || {};
  const isDay = cur.is_day === 1;

  const currentWmo = interpretWmoCode(cur.weather_code || 0, isDay);

  const dailyData = data.daily || {};
  const dailyDates: string[] = dailyData.time || [];
  const daily: WeatherData['daily'] = [];
  const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < Math.min(7, dailyDates.length); i++) {
    const dStr = dailyDates[i];
    const dObj = new Date(dStr + 'T12:00:00Z');
    const dayName = i === 0 ? 'Today' : daysArr[dObj.getUTCDay()];
    const dateFormatted = `${monthsArr[dObj.getUTCMonth()]} ${dObj.getUTCDate()}`;
    const wCode = (dailyData.weather_code && dailyData.weather_code[i]) || 0;
    const wmo = interpretWmoCode(wCode, true);

    daily.push({
      day: dayName,
      date: dateFormatted,
      timestamp: Math.floor(dObj.getTime() / 1000),
      tempMin: Math.round(dailyData.temperature_2m_min?.[i] ?? cur.temperature_2m ?? 20),
      tempMax: Math.round(dailyData.temperature_2m_max?.[i] ?? cur.temperature_2m ?? 25),
      condition: wmo.condition,
      description: wmo.description,
      iconCode: wmo.iconCode,
      pop: Math.round(dailyData.precipitation_probability_max?.[i] ?? 0),
      humidity: Math.round(cur.relative_humidity_2m ?? 50),
      windSpeed: Math.round(dailyData.wind_speed_10m_max?.[i] ?? (cur.wind_speed_10m ?? 10)),
    });
  }

  const hourlyData = data.hourly || {};
  const hourlyTimes: string[] = hourlyData.time || [];
  const hourly: WeatherData['hourly'] = [];

  const nowIsoPrefix = new Date((nowSec + tzOffsetSec) * 1000).toISOString().slice(0, 13);
  let startIdx = hourlyTimes.findIndex(t => t.startsWith(nowIsoPrefix));
  if (startIdx === -1) startIdx = 0;

  for (let i = startIdx; i < Math.min(startIdx + 24, hourlyTimes.length); i += 3) {
    const tStr = hourlyTimes[i];
    const tDate = new Date(tStr + ':00Z');
    const tSec = Math.floor(tDate.getTime() / 1000) - tzOffsetSec;
    const isItemDay = tDate.getUTCHours() >= 6 && tDate.getUTCHours() < 19;
    const wmo = interpretWmoCode(hourlyData.weather_code?.[i] ?? 0, isItemDay);

    hourly.push({
      time: i === startIdx ? 'Now' : formatLocalTime(tSec, tzOffsetSec),
      timestamp: tSec,
      temp: Math.round(hourlyData.temperature_2m?.[i] ?? cur.temperature_2m ?? 20),
      feelsLike: Math.round(hourlyData.apparent_temperature?.[i] ?? cur.apparent_temperature ?? 20),
      condition: wmo.condition,
      description: wmo.description,
      iconCode: wmo.iconCode,
      pop: Math.round(hourlyData.precipitation_probability?.[i] ?? 0),
      windSpeed: Math.round(hourlyData.wind_speed_10m?.[i] ?? 10),
    });
  }

  let sunriseSec = nowSec - 3600 * 4;
  let sunsetSec = nowSec + 3600 * 8;
  if (dailyData.sunrise?.[0]) {
    sunriseSec = Math.floor(new Date(dailyData.sunrise[0] + 'Z').getTime() / 1000) - tzOffsetSec;
  }
  if (dailyData.sunset?.[0]) {
    sunsetSec = Math.floor(new Date(dailyData.sunset[0] + 'Z').getTime() / 1000) - tzOffsetSec;
  }

  const sunriseTime = formatLocalTime(sunriseSec, tzOffsetSec);
  const sunsetTime = formatLocalTime(sunsetSec, tzOffsetSec);
  const totalDaylightSec = Math.max(1, sunsetSec - sunriseSec);
  const dayProgress = Math.min(100, Math.max(0, ((nowSec - sunriseSec) / totalDaylightSec) * 100));

  const daylightHours = Math.floor(totalDaylightSec / 3600);
  const daylightMins = Math.floor((totalDaylightSec % 3600) / 60);
  const daylightFormatted = `${daylightHours}h ${daylightMins}m`;

  const uvVal = dailyData.uv_index_max?.[0] ?? 4.5;
  const todayMin = daily[0]?.tempMin ?? Math.round(cur.temperature_2m - 3);
  const todayMax = daily[0]?.tempMax ?? Math.round(cur.temperature_2m + 4);

  return {
    location: {
      city: cityName,
      country: data.timezone ? data.timezone.split('/')[0] : '',
      lat,
      lon,
      timezoneOffset: tzOffsetSec,
      localTime: formatLocalTime(nowSec, tzOffsetSec),
      formattedDate: formatLocalDate(nowSec, tzOffsetSec),
    },
    current: {
      temp: Math.round(cur.temperature_2m ?? 22),
      feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 22),
      tempMin: todayMin,
      tempMax: todayMax,
      condition: currentWmo.condition,
      description: currentWmo.description,
      iconCode: currentWmo.iconCode,
      weatherId: currentWmo.weatherId,
      isDay,
    },
    hourly,
    daily,
    metrics: {
      humidity: Math.round(cur.relative_humidity_2m ?? 60),
      windSpeed: Math.round(cur.wind_speed_10m ?? 12),
      windDirection: Math.round(cur.wind_direction_10m ?? 180),
      windGust: Math.round(cur.wind_gusts_10m ?? (cur.wind_speed_10m ? cur.wind_speed_10m * 1.3 : 15)),
      pressure: Math.round(cur.surface_pressure ?? 1013),
      visibility: 10000,
      cloudCover: Math.round(cur.cloud_cover ?? 20),
      uvIndex: Number(uvVal.toFixed(1)),
      precipitationVolume: cur.precipitation ?? 0,
      pop: Math.round(dailyData.precipitation_probability_max?.[0] ?? 0),
    },
    sunCycle: {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      sunriseTimestamp: sunriseSec,
      sunsetTimestamp: sunsetSec,
      daylightDurationFormatted: daylightFormatted,
      isDay,
      dayProgressPercent: Math.round(dayProgress),
    },
    source: 'live',
  };
}

export async function fetchWeatherData(params: {
  city?: string;
  lat?: number;
  lon?: number;
  forceRefresh?: boolean;
}): Promise<WeatherData> {
  const cacheKey = params.city
    ? `city:${params.city.toLowerCase().trim()}`
    : `coords:${params.lat?.toFixed(4)},${params.lon?.toFixed(4)}`;

  if (!params.forceRefresh && weatherCache.has(cacheKey)) {
    const cached = weatherCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Tier 1: Try Server Proxy (/api/weather)
  try {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.set('city', params.city);
    if (params.lat !== undefined && params.lon !== undefined) {
      queryParams.set('lat', params.lat.toString());
      queryParams.set('lon', params.lon.toString());
    }

    const response = await fetch(`/api/weather?${queryParams.toString()}`);
    if (response.ok) {
      const data: WeatherData = await response.json();
      weatherCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (err) {
    console.warn('[Proxy /api/weather unavailable, falling back to direct Open-Meteo]:', err);
  }

  // Tier 2: Static Hosting Direct Fallback (e.g. GitHub Pages / Static hosting)
  let targetLat = params.lat;
  let targetLon = params.lon;
  let targetCity = params.city || 'Delhi';

  if ((targetLat === undefined || targetLon === undefined) && params.city) {
    const geoLocations = await searchLocations(params.city);
    if (geoLocations.length > 0) {
      targetLat = geoLocations[0].lat;
      targetLon = geoLocations[0].lon;
      targetCity = geoLocations[0].name;
    } else {
      targetLat = 28.6139;
      targetLon = 77.209;
    }
  }

  const directData = await fetchDirectOpenMeteo(targetLat ?? 28.6139, targetLon ?? 77.209, targetCity);
  weatherCache.set(cacheKey, { data: directData, timestamp: Date.now() });
  return directData;
}

export async function searchLocations(query: string): Promise<GeocodeLocation[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cacheKey = q.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    const cached = geocodeCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  // Tier 1: Server Proxy (/api/geocode)
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (response.ok) {
      const data: GeocodeLocation[] = await response.json();
      geocodeCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    }
  } catch (err) {
    console.warn('[Proxy /api/geocode failed, using direct Open-Meteo search]:', err);
  }

  // Tier 2: Direct Open-Meteo Geocoding
  try {
    const directRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
    if (directRes.ok) {
      const directJson = await directRes.json();
      if (directJson.results && Array.isArray(directJson.results)) {
        const results: GeocodeLocation[] = directJson.results.map((item: any) => ({
          name: item.name,
          lat: item.latitude,
          lon: item.longitude,
          country: item.country_code || item.country || '',
          state: item.admin1 || undefined,
        }));
        geocodeCache.set(cacheKey, { data: results, timestamp: Date.now() });
        return results;
      }
    }
  } catch (err) {
    console.error('Direct geocode request failed:', err);
  }

  return [];
}

export async function detectUserLocation(): Promise<{ city: string; lat: number; lon: number }> {
  // Tier 1: Server Proxy (/api/detect-location)
  try {
    const res = await fetch('/api/detect-location');
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || 'Delhi',
        lat: data.lat || 28.6139,
        lon: data.lon || 77.209,
      };
    }
  } catch (err) {
    console.warn('Proxy detectUserLocation failed, fallback to direct ipapi:', err);
  }

  // Tier 2: Direct IP geolocation
  try {
    const directRes = await fetch('https://ipapi.co/json/');
    if (directRes.ok) {
      const data = await directRes.json();
      return {
        city: data.city || 'Delhi',
        lat: data.latitude || 28.6139,
        lon: data.longitude || 77.209,
      };
    }
  } catch (err) {
    console.warn('Direct IP geolocation failed, using fallback coordinates:', err);
  }

  return {
    city: 'Delhi',
    lat: 28.6139,
    lon: 77.209,
  };
}
