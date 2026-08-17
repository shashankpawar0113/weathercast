export type WeatherEnvType =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'drizzle'
  | 'rain'
  | 'heavy-rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'fog'
  | 'extreme';

export type SolarPhase = 'day' | 'night' | 'sunrise' | 'sunset';

export interface SkyColorPalette {
  top: string;
  middle: string;
  bottom: string;
  ambientLight: string;
  sunGlow: string;
  cloudBase: string;
  cloudHighlight: string;
  cloudShadow: string;
  particleColor: string;
}

export interface WeatherEnvState {
  type: WeatherEnvType;
  solarPhase: SolarPhase;
  isDay: boolean;
  sunAltitude: number; // -1 (midnight) to 1 (solar noon)
  sunAzimuth: number; // angle from sunrise to sunset
  palette: SkyColorPalette;
  
  // Dynamic parameters from API
  windSpeed: number; // m/s or km/h normalized (0 to 1.5)
  windAngle: number; // in radians
  cloudCover: number; // 0 to 100%
  rainIntensity: number; // 0 to 1
  snowIntensity: number; // 0 to 1
  fogDensity: number; // 0 to 1
  thunderFrequency: number; // 0 to 1
  
  // Sun ray & bloom intensity
  sunRayIntensity: number; // 0 to 1
  lightBloomIntensity: number; // 0 to 1
}

export interface CursorState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
  isInside: boolean;
}
