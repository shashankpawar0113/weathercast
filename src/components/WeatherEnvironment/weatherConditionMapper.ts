import { WeatherData } from '../../types/weather';
import { WeatherEnvType, SolarPhase, WeatherEnvState, SkyColorPalette } from './types';

/**
 * Maps OpenWeather API condition codes and parameters to a complete WeatherEnvState
 */
export function mapWeatherToEnvironment(weather: WeatherData | null, isDarkTheme: boolean = true): WeatherEnvState {
  if (!weather) {
    return getDefaultEnvState(isDarkTheme);
  }

  const { current, metrics, sunCycle } = weather;
  const weatherId = current.weatherId || 800;
  const conditionStr = (current.condition || '').toLowerCase();
  const descStr = (current.description || '').toLowerCase();
  const nowSec = Math.floor(Date.now() / 1000);
  const sunrise = sunCycle.sunriseTimestamp;
  const sunset = sunCycle.sunsetTimestamp;

  // 1. Determine Solar Phase (day, night, sunrise, sunset)
  let solarPhase: SolarPhase = current.isDay ? 'day' : 'night';
  let sunAltitude = current.isDay ? 0.7 : -0.7;

  if (sunrise && sunset) {
    const sunriseDiff = nowSec - sunrise;
    const sunsetDiff = nowSec - sunset;

    // Within 45 minutes (2700s) of sunrise
    if (Math.abs(sunriseDiff) < 2700) {
      solarPhase = 'sunrise';
      sunAltitude = (sunriseDiff / 2700) * 0.3 + 0.1;
    }
    // Within 45 minutes of sunset
    else if (Math.abs(sunsetDiff) < 2700) {
      solarPhase = 'sunset';
      sunAltitude = 0.3 - (sunsetDiff / 2700) * 0.3;
    } else if (nowSec >= sunrise && nowSec <= sunset) {
      solarPhase = 'day';
      const dayFraction = (nowSec - sunrise) / Math.max(1, sunset - sunrise);
      sunAltitude = Math.sin(dayFraction * Math.PI);
    } else {
      solarPhase = 'night';
      sunAltitude = -0.5;
    }
  }

  // 2. Determine Weather Environment Type
  let envType: WeatherEnvType = 'clear';
  let rainIntensity = 0;
  let snowIntensity = 0;
  let fogDensity = 0;
  let thunderFrequency = 0;
  let cloudCover = metrics.cloudCover || 0;

  // Check Thunderstorm (2xx or keyword)
  if ((weatherId >= 200 && weatherId < 300) || conditionStr.includes('thunder') || descStr.includes('thunder')) {
    envType = 'thunderstorm';
    thunderFrequency = weatherId === 211 || weatherId === 212 ? 0.85 : 0.55;
    rainIntensity = 0.85;
    cloudCover = Math.max(85, cloudCover);
  }
  // Check Snow (6xx or keyword)
  else if ((weatherId >= 600 && weatherId < 700) || conditionStr.includes('snow') || descStr.includes('snow') || conditionStr.includes('sleet')) {
    envType = 'snow';
    snowIntensity = weatherId >= 602 ? 0.95 : 0.65;
    cloudCover = Math.max(70, cloudCover);
  }
  // Check Drizzle (3xx or keyword)
  else if ((weatherId >= 300 && weatherId < 400) || conditionStr.includes('drizzle') || descStr.includes('drizzle')) {
    envType = 'drizzle';
    rainIntensity = 0.35;
    cloudCover = Math.max(65, cloudCover);
  }
  // Check Heavy Rain / Rain (5xx or keyword)
  else if ((weatherId >= 500 && weatherId < 600) || conditionStr.includes('rain') || descStr.includes('rain')) {
    if (weatherId === 502 || weatherId === 503 || weatherId === 504 || weatherId === 522 || descStr.includes('heavy')) {
      envType = 'heavy-rain';
      rainIntensity = 0.95;
    } else {
      envType = 'rain';
      rainIntensity = 0.65;
    }
    cloudCover = Math.max(80, cloudCover);
  }
  // Check Fog / Mist / Atmosphere (7xx or keyword)
  else if ((weatherId >= 700 && weatherId < 800) || conditionStr.includes('fog') || conditionStr.includes('mist') || conditionStr.includes('haze') || conditionStr.includes('smoke')) {
    if (weatherId === 741 || conditionStr.includes('fog')) {
      envType = 'fog';
      fogDensity = 0.9;
    } else {
      envType = 'mist';
      fogDensity = 0.6;
    }
    cloudCover = Math.max(50, cloudCover);
  }
  // Check Cloudy / Overcast (803, 804 or keyword)
  else if (weatherId === 803 || weatherId === 804 || descStr.includes('overcast') || descStr.includes('broken clouds')) {
    envType = 'cloudy';
    cloudCover = Math.max(85, cloudCover);
  }
  // Check Partly Cloudy (801, 802 or keyword)
  else if (weatherId === 801 || weatherId === 802 || conditionStr.includes('cloud')) {
    envType = 'partly-cloudy';
    cloudCover = Math.max(35, cloudCover);
  }
  // Clear (800)
  else {
    envType = 'clear';
    cloudCover = Math.min(15, cloudCover);
  }

  // 3. Wind speed & direction
  const rawWindSpeed = metrics.windSpeed || 10; // km/h
  const windSpeedNorm = Math.min(2.0, Math.max(0.2, rawWindSpeed / 25));
  const windAngleRad = ((metrics.windDirection || 220) * Math.PI) / 180;

  // 4. Generate Distinct Atmosphere Palette
  const palette = generateEnvironmentPalette(envType, solarPhase);

  // 5. Sun rays & bloom calculation
  let sunRayIntensity = 0;
  let lightBloomIntensity = 0;

  if (envType === 'clear') {
    if (solarPhase === 'day') {
      sunRayIntensity = 0.8;
      lightBloomIntensity = 0.85;
    } else if (solarPhase === 'sunrise' || solarPhase === 'sunset') {
      sunRayIntensity = 0.95;
      lightBloomIntensity = 1.0;
    }
  } else if (envType === 'partly-cloudy') {
    if (solarPhase === 'day' || solarPhase === 'sunrise' || solarPhase === 'sunset') {
      sunRayIntensity = 0.5;
      lightBloomIntensity = 0.55;
    }
  }

  return {
    type: envType,
    solarPhase,
    isDay: current.isDay,
    sunAltitude,
    sunAzimuth: 0,
    palette,
    windSpeed: windSpeedNorm,
    windAngle: windAngleRad,
    cloudCover,
    rainIntensity,
    snowIntensity,
    fogDensity,
    thunderFrequency,
    sunRayIntensity,
    lightBloomIntensity,
  };
}

function generateEnvironmentPalette(
  type: WeatherEnvType,
  phase: SolarPhase
): SkyColorPalette {
  // 1. THUNDERSTORM
  if (type === 'thunderstorm') {
    return {
      top: '#050212',
      middle: '#0e0b24',
      bottom: '#1e143d',
      ambientLight: 'rgba(168, 85, 247, 0.25)',
      sunGlow: 'rgba(192, 132, 252, 0.4)',
      cloudBase: 'rgba(15, 10, 35, 0.88)',
      cloudHighlight: 'rgba(91, 33, 182, 0.6)',
      cloudShadow: 'rgba(2, 0, 10, 0.95)',
      particleColor: 'rgba(196, 181, 253, 0.75)',
    };
  }

  // 2. HEAVY RAIN
  if (type === 'heavy-rain') {
    if (phase === 'night') {
      return {
        top: '#030714',
        middle: '#071026',
        bottom: '#0d1d3d',
        ambientLight: 'rgba(56, 189, 248, 0.1)',
        sunGlow: 'rgba(14, 165, 233, 0.15)',
        cloudBase: 'rgba(7, 16, 38, 0.85)',
        cloudHighlight: 'rgba(30, 58, 138, 0.5)',
        cloudShadow: 'rgba(1, 4, 12, 0.95)',
        particleColor: 'rgba(186, 230, 253, 0.75)',
      };
    }
    return {
      top: '#0f172a',
      middle: '#1e293b',
      bottom: '#334155',
      ambientLight: 'rgba(56, 189, 248, 0.2)',
      sunGlow: 'rgba(14, 165, 233, 0.25)',
      cloudBase: 'rgba(30, 41, 59, 0.85)',
      cloudHighlight: 'rgba(71, 85, 105, 0.65)',
      cloudShadow: 'rgba(15, 23, 42, 0.95)',
      particleColor: 'rgba(224, 242, 254, 0.8)',
    };
  }

  // 3. REGULAR RAIN & DRIZZLE
  if (type === 'rain' || type === 'drizzle') {
    if (phase === 'night') {
      return {
        top: '#050a17',
        middle: '#0a142c',
        bottom: '#112246',
        ambientLight: 'rgba(56, 189, 248, 0.12)',
        sunGlow: 'rgba(14, 165, 233, 0.18)',
        cloudBase: 'rgba(10, 20, 44, 0.8)',
        cloudHighlight: 'rgba(29, 78, 216, 0.45)',
        cloudShadow: 'rgba(2, 6, 23, 0.92)',
        particleColor: 'rgba(186, 230, 253, 0.7)',
      };
    }
    return {
      top: '#1a283e',
      middle: '#2a3d5c',
      bottom: '#3f567c',
      ambientLight: 'rgba(186, 230, 253, 0.25)',
      sunGlow: 'rgba(56, 189, 248, 0.3)',
      cloudBase: 'rgba(42, 61, 92, 0.8)',
      cloudHighlight: 'rgba(100, 116, 139, 0.6)',
      cloudShadow: 'rgba(15, 23, 42, 0.9)',
      particleColor: 'rgba(224, 242, 254, 0.75)',
    };
  }

  // 4. SNOW
  if (type === 'snow') {
    if (phase === 'night') {
      return {
        top: '#050c1e',
        middle: '#0d1c38',
        bottom: '#193059',
        ambientLight: 'rgba(224, 242, 254, 0.18)',
        sunGlow: 'rgba(186, 230, 253, 0.22)',
        cloudBase: 'rgba(15, 28, 56, 0.75)',
        cloudHighlight: 'rgba(59, 130, 246, 0.4)',
        cloudShadow: 'rgba(2, 6, 23, 0.9)',
        particleColor: 'rgba(255, 255, 255, 0.95)',
      };
    }
    return {
      top: '#334155',
      middle: '#475569',
      bottom: '#64748b',
      ambientLight: 'rgba(240, 249, 255, 0.35)',
      sunGlow: 'rgba(255, 255, 255, 0.45)',
      cloudBase: 'rgba(100, 116, 139, 0.75)',
      cloudHighlight: 'rgba(226, 232, 240, 0.7)',
      cloudShadow: 'rgba(30, 41, 59, 0.8)',
      particleColor: 'rgba(255, 255, 255, 0.98)',
    };
  }

  // 5. MIST / FOG
  if (type === 'mist' || type === 'fog') {
    if (phase === 'night') {
      return {
        top: '#060a14',
        middle: '#0e172a',
        bottom: '#1a2942',
        ambientLight: 'rgba(148, 163, 184, 0.15)',
        sunGlow: 'rgba(148, 163, 184, 0.2)',
        cloudBase: 'rgba(20, 32, 54, 0.7)',
        cloudHighlight: 'rgba(51, 65, 85, 0.45)',
        cloudShadow: 'rgba(10, 16, 30, 0.88)',
        particleColor: 'rgba(203, 213, 225, 0.35)',
      };
    }
    return {
      top: '#475569',
      middle: '#64748b',
      bottom: '#94a3b8',
      ambientLight: 'rgba(255, 255, 255, 0.3)',
      sunGlow: 'rgba(255, 255, 255, 0.4)',
      cloudBase: 'rgba(148, 163, 184, 0.75)',
      cloudHighlight: 'rgba(241, 245, 249, 0.7)',
      cloudShadow: 'rgba(71, 85, 105, 0.65)',
      particleColor: 'rgba(248, 250, 252, 0.5)',
    };
  }

  // 6. CLOUDY / OVERCAST (Like Australia with overcast clouds)
  if (type === 'cloudy') {
    if (phase === 'night') {
      return {
        top: '#080d1a',
        middle: '#111b30',
        bottom: '#1a2744',
        ambientLight: 'rgba(148, 163, 184, 0.15)',
        sunGlow: 'rgba(99, 102, 241, 0.15)',
        cloudBase: 'rgba(17, 27, 48, 0.85)',
        cloudHighlight: 'rgba(51, 65, 85, 0.55)',
        cloudShadow: 'rgba(4, 7, 14, 0.95)',
        particleColor: 'rgba(203, 213, 225, 0.5)',
      };
    }
    if (phase === 'sunset' || phase === 'sunrise') {
      return {
        top: '#2e1065',
        middle: '#701a75',
        bottom: '#c2410c',
        ambientLight: 'rgba(251, 146, 60, 0.3)',
        sunGlow: 'rgba(245, 158, 11, 0.45)',
        cloudBase: 'rgba(88, 28, 135, 0.7)',
        cloudHighlight: 'rgba(251, 146, 60, 0.8)',
        cloudShadow: 'rgba(30, 27, 75, 0.9)',
        particleColor: 'rgba(254, 215, 170, 0.7)',
      };
    }
    // Daytime Overcast
    return {
      top: '#2b394e',
      middle: '#475569',
      bottom: '#64748b',
      ambientLight: 'rgba(203, 213, 225, 0.35)',
      sunGlow: 'rgba(241, 245, 249, 0.4)',
      cloudBase: 'rgba(71, 85, 105, 0.85)',
      cloudHighlight: 'rgba(203, 213, 225, 0.75)',
      cloudShadow: 'rgba(30, 41, 59, 0.92)',
      particleColor: 'rgba(255, 255, 255, 0.7)',
    };
  }

  // 7. PARTLY CLOUDY
  if (type === 'partly-cloudy') {
    if (phase === 'night') {
      return {
        top: '#030716',
        middle: '#08122c',
        bottom: '#102047',
        ambientLight: 'rgba(56, 189, 248, 0.15)',
        sunGlow: 'rgba(99, 102, 241, 0.2)',
        cloudBase: 'rgba(12, 24, 52, 0.75)',
        cloudHighlight: 'rgba(59, 130, 246, 0.4)',
        cloudShadow: 'rgba(2, 6, 23, 0.9)',
        particleColor: 'rgba(255, 255, 255, 0.8)',
      };
    }
    if (phase === 'sunset') {
      return {
        top: '#1e1b4b',
        middle: '#831843',
        bottom: '#ea580c',
        ambientLight: 'rgba(251, 146, 60, 0.35)',
        sunGlow: 'rgba(245, 158, 11, 0.5)',
        cloudBase: 'rgba(112, 26, 117, 0.65)',
        cloudHighlight: 'rgba(251, 146, 60, 0.85)',
        cloudShadow: 'rgba(30, 27, 75, 0.85)',
        particleColor: 'rgba(254, 215, 170, 0.75)',
      };
    }
    if (phase === 'sunrise') {
      return {
        top: '#172554',
        middle: '#6b21a8',
        bottom: '#f97316',
        ambientLight: 'rgba(253, 186, 116, 0.35)',
        sunGlow: 'rgba(251, 191, 36, 0.5)',
        cloudBase: 'rgba(88, 28, 135, 0.65)',
        cloudHighlight: 'rgba(253, 186, 116, 0.85)',
        cloudShadow: 'rgba(23, 37, 84, 0.85)',
        particleColor: 'rgba(254, 215, 170, 0.75)',
      };
    }
    // Daytime Partly Cloudy (Vibrant Azure Sky with Soft Clouds)
    return {
      top: '#0369a1',
      middle: '#0ea5e9',
      bottom: '#7dd3fc',
      ambientLight: 'rgba(255, 255, 255, 0.38)',
      sunGlow: 'rgba(254, 240, 138, 0.55)',
      cloudBase: 'rgba(255, 255, 255, 0.88)',
      cloudHighlight: 'rgba(255, 255, 255, 0.98)',
      cloudShadow: 'rgba(125, 211, 252, 0.5)',
      particleColor: 'rgba(255, 255, 255, 0.9)',
    };
  }

  // 8. SUNRISE / SUNSET CLEAR
  if (phase === 'sunset') {
    return {
      top: '#1e1b4b',
      middle: '#9f1239',
      bottom: '#ea580c',
      ambientLight: 'rgba(251, 146, 60, 0.4)',
      sunGlow: 'rgba(245, 158, 11, 0.6)',
      cloudBase: 'rgba(112, 26, 117, 0.6)',
      cloudHighlight: 'rgba(251, 146, 60, 0.85)',
      cloudShadow: 'rgba(30, 27, 75, 0.8)',
      particleColor: 'rgba(254, 215, 170, 0.75)',
    };
  }
  if (phase === 'sunrise') {
    return {
      top: '#0f172a',
      middle: '#581c87',
      bottom: '#f97316',
      ambientLight: 'rgba(253, 186, 116, 0.4)',
      sunGlow: 'rgba(251, 191, 36, 0.6)',
      cloudBase: 'rgba(88, 28, 135, 0.6)',
      cloudHighlight: 'rgba(253, 186, 116, 0.85)',
      cloudShadow: 'rgba(15, 23, 42, 0.8)',
      particleColor: 'rgba(254, 215, 170, 0.75)',
    };
  }

  // 9. NIGHTTIME CLEAR
  if (phase === 'night') {
    return {
      top: '#020617',
      middle: '#070f26',
      bottom: '#0f1c3d',
      ambientLight: 'rgba(56, 189, 248, 0.15)',
      sunGlow: 'rgba(99, 102, 241, 0.22)',
      cloudBase: 'rgba(15, 28, 58, 0.7)',
      cloudHighlight: 'rgba(59, 130, 246, 0.45)',
      cloudShadow: 'rgba(2, 6, 23, 0.95)',
      particleColor: 'rgba(255, 255, 255, 0.9)',
    };
  }

  // 10. DAYTIME CLEAR (Cinematic Atmospheric Azure Sky)
  return {
    top: '#0284c7',
    middle: '#38bdf8',
    bottom: '#bae6fd',
    ambientLight: 'rgba(255, 255, 255, 0.42)',
    sunGlow: 'rgba(254, 240, 138, 0.6)',
    cloudBase: 'rgba(255, 255, 255, 0.9)',
    cloudHighlight: 'rgba(255, 255, 255, 1)',
    cloudShadow: 'rgba(186, 230, 253, 0.55)',
    particleColor: 'rgba(255, 255, 255, 0.85)',
  };
}

function getDefaultEnvState(isDarkTheme: boolean): WeatherEnvState {
  return {
    type: 'clear',
    solarPhase: 'day',
    isDay: true,
    sunAltitude: 0.8,
    sunAzimuth: 0,
    palette: generateEnvironmentPalette('clear', isDarkTheme ? 'night' : 'day'),
    windSpeed: 0.5,
    windAngle: 1.2,
    cloudCover: 10,
    rainIntensity: 0,
    snowIntensity: 0,
    fogDensity: 0,
    thunderFrequency: 0,
    sunRayIntensity: 0.75,
    lightBloomIntensity: 0.8,
  };
}
