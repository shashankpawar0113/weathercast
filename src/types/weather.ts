export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeMode = 'dark' | 'light';

export interface LocationInfo {
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezoneOffset: number; // in seconds
  localTime: string;
  formattedDate: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  iconCode: string;
  weatherId: number;
  isDay: boolean;
}

export interface HourlyForecastItem {
  time: string;
  timestamp: number;
  temp: number;
  feelsLike: number;
  condition: string;
  description: string;
  iconCode: string;
  pop: number; // Probability of precipitation in %
  windSpeed: number; // in km/h
}

export interface DailyForecastItem {
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
}

export interface WeatherMetrics {
  humidity: number;
  windSpeed: number; // km/h
  windDirection: number; // 0 - 360 deg
  windGust: number;
  pressure: number; // hPa
  visibility: number; // meters
  cloudCover: number; // %
  uvIndex: number;
  precipitationVolume: number; // mm
  pop: number; // %
}

export interface SunCycle {
  sunrise: string;
  sunset: string;
  sunriseTimestamp: number;
  sunsetTimestamp: number;
  daylightDurationFormatted: string;
  isDay: boolean;
  dayProgressPercent: number; // 0 to 100
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  metrics: WeatherMetrics;
  sunCycle: SunCycle;
  source: 'live' | 'fallback';
}

export interface GeocodeLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
