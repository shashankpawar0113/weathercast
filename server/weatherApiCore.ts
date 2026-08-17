/**
 * Server-side Weather API Core
 * Keeps OPENWEATHER_API_KEY strictly on the server and provides normalized weather data.
 */

export interface RawOpenWeatherCurrent {
  coord: { lon: number; lat: number };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
}

export interface RawOpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  clouds: { all: number };
  wind: { speed: number; deg: number; gust?: number };
  visibility: number;
  pop: number; // Probability of precipitation (0 to 1)
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  dt_txt: string;
}

export interface RawOpenWeatherForecast {
  list: RawOpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface NormalizedWeatherData {
  location: {
    city: string;
    country: string;
    lat: number;
    lon: number;
    timezoneOffset: number; // in seconds
    localTime: string;
    formattedDate: string;
  };
  current: {
    temp: number;
    feelsLike: number;
    tempMin: number;
    tempMax: number;
    condition: string;
    description: string;
    iconCode: string;
    weatherId: number;
    isDay: boolean;
  };
  hourly: Array<{
    time: string;
    timestamp: number;
    temp: number;
    feelsLike: number;
    condition: string;
    description: string;
    iconCode: string;
    pop: number; // 0 - 100%
    windSpeed: number;
  }>;
  daily: Array<{
    day: string;
    date: string;
    timestamp: number;
    tempMin: number;
    tempMax: number;
    condition: string;
    description: string;
    iconCode: string;
    pop: number;
    humidity: number;
    windSpeed: number;
  }>;
  metrics: {
    humidity: number;
    windSpeed: number;
    windDirection: number;
    windGust: number;
    pressure: number;
    visibility: number; // in meters
    cloudCover: number; // %
    uvIndex: number;
    precipitationVolume: number; // in mm
    pop: number; // %
  };
  sunCycle: {
    sunrise: string;
    sunset: string;
    sunriseTimestamp: number;
    sunsetTimestamp: number;
    daylightDurationFormatted: string;
    isDay: boolean;
    dayProgressPercent: number; // 0 to 100
  };
  source: 'live' | 'fallback';
}

export interface GeocodeLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// Fallback high-fidelity realistic dataset for instant responsiveness
const FALLBACK_CITIES: Record<string, GeocodeLocation & { tz: number; baseTemp: number; condition: string }> = {
  mumbai: { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN', state: 'Maharashtra', tz: 19800, baseTemp: 29, condition: 'Clear' },
  delhi: { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'IN', state: 'Delhi', tz: 19800, baseTemp: 26, condition: 'Haze' },
  london: { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB', state: 'England', tz: 0, baseTemp: 16, condition: 'Clouds' },
  'new york': { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US', state: 'New York', tz: -14400, baseTemp: 21, condition: 'Clear' },
  tokyo: { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP', state: 'Tokyo', tz: 32400, baseTemp: 23, condition: 'Rain' },
  paris: { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR', state: 'Île-de-France', tz: 7200, baseTemp: 19, condition: 'Clouds' },
  sydney: { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU', state: 'New South Wales', tz: 36000, baseTemp: 18, condition: 'Clear' },
  dubai: { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'AE', state: 'Dubai', tz: 14400, baseTemp: 34, condition: 'Clear' },
  singapore: { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SG', state: 'Central', tz: 28800, baseTemp: 30, condition: 'Thunderstorm' },
  'san francisco': { name: 'San Francisco', lat: 37.7749, lon: -122.4194, country: 'US', state: 'California', tz: -25200, baseTemp: 17, condition: 'Fog' },
};

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

export function normalizeWeatherData(
  current: RawOpenWeatherCurrent,
  forecast: RawOpenWeatherForecast,
  source: 'live' | 'fallback' = 'live',
  overrideCity?: string
): NormalizedWeatherData {
  const tz = current.timezone || 0;
  const nowSec = Math.floor(Date.now() / 1000);
  
  const isDay = nowSec >= current.sys.sunrise && nowSec < current.sys.sunset;
  
  // Calculate sun cycle
  const sunriseTime = formatLocalTime(current.sys.sunrise, tz);
  const sunsetTime = formatLocalTime(current.sys.sunset, tz);
  const totalDaylightSec = Math.max(1, current.sys.sunset - current.sys.sunrise);
  const dayProgress = Math.min(100, Math.max(0, ((nowSec - current.sys.sunrise) / totalDaylightSec) * 100));
  
  const daylightHours = Math.floor(totalDaylightSec / 3600);
  const daylightMins = Math.floor((totalDaylightSec % 3600) / 60);
  const daylightFormatted = `${daylightHours}h ${daylightMins}m`;

  // Build hourly forecast (next 24 hours / 8 slots of 3hr + interpolated)
  const rawList = forecast.list || [];
  const hourly: NormalizedWeatherData['hourly'] = [];
  
  // First item is current hour
  hourly.push({
    time: 'Now',
    timestamp: current.dt,
    temp: Math.round(current.main.temp),
    feelsLike: Math.round(current.main.feels_like),
    condition: current.weather[0]?.main || 'Clear',
    description: current.weather[0]?.description || '',
    iconCode: current.weather[0]?.icon || '01d',
    pop: 0,
    windSpeed: Math.round(current.wind.speed * 3.6), // convert m/s to km/h
  });

  for (let i = 0; i < Math.min(8, rawList.length); i++) {
    const item = rawList[i];
    const timeStr = formatLocalTime(item.dt, tz);
    hourly.push({
      time: timeStr,
      timestamp: item.dt,
      temp: Math.round(item.main.temp),
      feelsLike: Math.round(item.main.feels_like),
      condition: item.weather[0]?.main || 'Clear',
      description: item.weather[0]?.description || '',
      iconCode: item.weather[0]?.icon || '01d',
      pop: Math.round((item.pop || 0) * 100),
      windSpeed: Math.round(item.wind.speed * 3.6),
    });
  }

  // Group daily forecast
  const dailyMap = new Map<string, {
    day: string;
    date: string;
    timestamp: number;
    temps: number[];
    conditions: { main: string; description: string; icon: string }[];
    pops: number[];
    humidities: number[];
    winds: number[];
  }>();

  for (const item of rawList) {
    const d = new Date((item.dt + tz) * 1000);
    const dayKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[d.getUTCDay()];
    const dateStr = `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        day: dayName,
        date: dateStr,
        timestamp: item.dt,
        temps: [],
        conditions: [],
        pops: [],
        humidities: [],
        winds: [],
      });
    }

    const entry = dailyMap.get(dayKey)!;
    entry.temps.push(item.main.temp_max, item.main.temp_min);
    if (item.weather[0]) {
      entry.conditions.push({
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
    }
    entry.pops.push(item.pop || 0);
    entry.humidities.push(item.main.humidity);
    entry.winds.push(item.wind.speed * 3.6);
  }

  const daily: NormalizedWeatherData['daily'] = [];
  
  // Today's entry
  const todayMax = Math.round(Math.max(current.main.temp_max, current.main.temp));
  const todayMin = Math.round(Math.min(current.main.temp_min, current.main.temp));
  
  daily.push({
    day: 'Today',
    date: formatLocalDate(current.dt, tz).split(', ')[1] || 'Today',
    timestamp: current.dt,
    tempMin: todayMin,
    tempMax: todayMax,
    condition: current.weather[0]?.main || 'Clear',
    description: current.weather[0]?.description || '',
    iconCode: current.weather[0]?.icon || '01d',
    pop: Math.round((rawList[0]?.pop || 0) * 100),
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed * 3.6),
  });

  dailyMap.forEach((val, key) => {
    const todayKey = `${new Date((current.dt + tz) * 1000).getUTCFullYear()}-${new Date((current.dt + tz) * 1000).getUTCMonth()}-${new Date((current.dt + tz) * 1000).getUTCDate()}`;
    if (key === todayKey || daily.length >= 7) return;

    const maxT = Math.round(Math.max(...val.temps));
    const minT = Math.round(Math.min(...val.temps));
    const cond = val.conditions[Math.floor(val.conditions.length / 2)] || { main: 'Clear', description: 'clear sky', icon: '01d' };
    const avgPop = Math.round((val.pops.reduce((a, b) => a + b, 0) / Math.max(1, val.pops.length)) * 100);
    const avgHum = Math.round(val.humidities.reduce((a, b) => a + b, 0) / Math.max(1, val.humidities.length));
    const avgWind = Math.round(val.winds.reduce((a, b) => a + b, 0) / Math.max(1, val.winds.length));

    daily.push({
      day: val.day,
      date: val.date,
      timestamp: val.timestamp,
      tempMin: minT,
      tempMax: maxT,
      condition: cond.main,
      description: cond.description,
      iconCode: cond.icon,
      pop: avgPop,
      humidity: avgHum,
      windSpeed: avgWind,
    });
  });

  // Calculate realistic UV index approximation if not in raw current
  const hour = new Date((nowSec + tz) * 1000).getUTCHours();
  let estimatedUv = 0;
  if (hour >= 6 && hour <= 18) {
    const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
    const cloudFactor = 1 - (current.clouds.all / 100) * 0.7;
    const latFactor = Math.cos((current.coord.lat * Math.PI) / 180);
    estimatedUv = Math.max(0, Math.round(solarFactor * cloudFactor * latFactor * 10 * 10) / 10);
  }

  const precipVol = current.rain?.['1h'] || current.rain?.['3h'] || current.snow?.['1h'] || 0;

  // Known weather station neighborhood overrides mapping to primary metropolitan cities
  const STATION_OVERRIDES: Record<string, string> = {
    'darya ganj': 'Delhi',
    'connaught place': 'Delhi',
    'chandni chowk': 'Delhi',
    'karol bagh': 'Delhi',
    'paharganj': 'Delhi',
    'lajpat nagar': 'Delhi',
    'chanakyapuri': 'Delhi',
    'new delhi': 'Delhi',
    'chinchpokli': 'Mumbai',
    'colaba': 'Mumbai',
    'bandra': 'Mumbai',
    'andheri': 'Mumbai',
    'dadar': 'Mumbai',
    'worli': 'Mumbai',
    'kurla': 'Mumbai',
    'shibuya': 'Tokyo',
    'shinjuku': 'Tokyo',
    'manhattan': 'New York',
    'brooklyn': 'New York',
    'westminster': 'London',
    'camden': 'London',
  };

  const rawLower = (current.name || '').toLowerCase().trim();
  const stationMapped = STATION_OVERRIDES[rawLower] || current.name;

  // Format clean city name (prioritize override or clean city name over obscure station)
  const cleanCity = overrideCity && overrideCity.trim() !== ''
    ? overrideCity.split(',')[0].trim()
    : stationMapped;

  return {
    location: {
      city: cleanCity,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
      timezoneOffset: tz,
      localTime: formatLocalTime(nowSec, tz),
      formattedDate: formatLocalDate(nowSec, tz),
    },
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      tempMin: todayMin,
      tempMax: todayMax,
      condition: current.weather[0]?.main || 'Clear',
      description: current.weather[0]?.description || '',
      iconCode: current.weather[0]?.icon || '01d',
      weatherId: current.weather[0]?.id || 800,
      isDay,
    },
    hourly,
    daily,
    metrics: {
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // km/h
      windDirection: current.wind.deg || 0,
      windGust: Math.round((current.wind.gust || current.wind.speed * 1.3) * 3.6),
      pressure: current.main.pressure,
      visibility: current.visibility || 10000,
      cloudCover: current.clouds.all || 0,
      uvIndex: estimatedUv,
      precipitationVolume: precipVol,
      pop: Math.round((rawList[0]?.pop || 0) * 100),
    },
    sunCycle: {
      sunrise: sunriseTime,
      sunset: sunsetTime,
      sunriseTimestamp: current.sys.sunrise,
      sunsetTimestamp: current.sys.sunset,
      daylightDurationFormatted: daylightFormatted,
      isDay,
      dayProgressPercent: Math.round(dayProgress),
    },
    source,
  };
}

export function generateSimulatedWeather(cityQuery: string, lat?: number, lon?: number): NormalizedWeatherData {
  const q = cityQuery.toLowerCase().trim();
  const match = FALLBACK_CITIES[q] || Object.values(FALLBACK_CITIES).find(c => c.name.toLowerCase().includes(q)) || {
    name: cityQuery.charAt(0).toUpperCase() + cityQuery.slice(1) || 'London',
    lat: lat || 51.5074,
    lon: lon || -0.1278,
    country: 'GB',
    state: '',
    tz: 0,
    baseTemp: 20,
    condition: 'Clear',
  };

  const now = Math.floor(Date.now() / 1000);
  const tz = match.tz;
  const hour = new Date((now + tz) * 1000).getUTCHours();
  const isDay = hour >= 6 && hour < 19;

  const sunrise = now - (hour - 6) * 3600;
  const sunset = sunrise + 13 * 3600;

  const current: RawOpenWeatherCurrent = {
    coord: { lat: match.lat, lon: match.lon },
    weather: [{ id: 800, main: match.condition, description: `${match.condition.toLowerCase()} sky`, icon: isDay ? '01d' : '01n' }],
    main: {
      temp: match.baseTemp,
      feels_like: match.baseTemp + 1,
      temp_min: match.baseTemp - 4,
      temp_max: match.baseTemp + 5,
      pressure: 1014,
      humidity: 58,
    },
    visibility: 10000,
    wind: { speed: 4.2, deg: 230, gust: 6.1 },
    clouds: { all: match.condition === 'Clear' ? 10 : 65 },
    dt: now,
    sys: { country: match.country, sunrise, sunset },
    timezone: tz,
    id: 1001,
    name: match.name,
  };

  const forecastList: RawOpenWeatherForecastItem[] = [];
  for (let i = 1; i <= 40; i++) {
    const fTime = now + i * 3 * 3600;
    const fHour = new Date((fTime + tz) * 1000).getUTCHours();
    const tempVar = Math.sin(((fHour - 8) / 12) * Math.PI) * 4;
    forecastList.push({
      dt: fTime,
      main: {
        temp: match.baseTemp + tempVar,
        feels_like: match.baseTemp + tempVar + 1,
        temp_min: match.baseTemp + tempVar - 2,
        temp_max: match.baseTemp + tempVar + 2,
        pressure: 1013 + Math.round(Math.sin(i) * 3),
        humidity: 50 + Math.round(Math.sin(i) * 20),
      },
      weather: [{ id: 800, main: match.condition, description: `${match.condition.toLowerCase()}`, icon: (fHour >= 6 && fHour < 19) ? '02d' : '02n' }],
      clouds: { all: 30 },
      wind: { speed: 3.5, deg: 210 },
      visibility: 10000,
      pop: 0.15,
      dt_txt: new Date(fTime * 1000).toISOString().replace('T', ' ').slice(0, 19),
    });
  }

  const forecast: RawOpenWeatherForecast = {
    list: forecastList,
    city: {
      id: 1001,
      name: match.name,
      coord: { lat: match.lat, lon: match.lon },
      country: match.country,
      timezone: tz,
      sunrise,
      sunset,
    },
  };

  return normalizeWeatherData(current, forecast, 'fallback');
}

export function searchSimulatedCities(query: string): GeocodeLocation[] {
  const q = query.toLowerCase().trim();
  const results: GeocodeLocation[] = [];
  for (const key of Object.keys(FALLBACK_CITIES)) {
    const city = FALLBACK_CITIES[key];
    if (city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q) || (city.state && city.state.toLowerCase().includes(q))) {
      results.push({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        country: city.country,
        state: city.state,
      });
    }
  }
  return results;
}
