import { WeatherData, GeocodeLocation } from '../types/weather';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const weatherCache = new Map<string, CacheEntry<WeatherData>>();
const geocodeCache = new Map<string, CacheEntry<GeocodeLocation[]>>();

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

  const queryParams = new URLSearchParams();
  if (params.city) queryParams.set('city', params.city);
  if (params.lat !== undefined && params.lon !== undefined) {
    queryParams.set('lat', params.lat.toString());
    queryParams.set('lon', params.lon.toString());
  }

  const response = await fetch(`/api/weather?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load weather data: ${response.statusText}`);
  }

  const data: WeatherData = await response.json();
  weatherCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
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

  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error(`Geocode request failed: ${response.statusText}`);
    }

    const data: GeocodeLocation[] = await response.json();
    geocodeCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error('Geocode request failed:', err);
    return [];
  }
}

export async function detectUserLocation(): Promise<{ city: string; lat: number; lon: number }> {
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
    console.warn('detectUserLocation failed, fallback to Delhi:', err);
  }
  return {
    city: 'Delhi',
    lat: 28.6139,
    lon: 77.209,
  };
}
