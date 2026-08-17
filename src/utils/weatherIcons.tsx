import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Snowflake,
  CloudFog,
  Tornado,
} from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  iconCode?: string;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  iconCode = '',
  isDay = true,
  className = 'w-6 h-6',
  size = 24,
}) => {
  const cond = condition.toLowerCase();
  const isNight = iconCode.endsWith('n') || !isDay;

  // Thunderstorm
  if (cond.includes('thunder') || cond.includes('storm')) {
    return <CloudLightning size={size} className={`${className} text-amber-400 dark:text-amber-300 drop-shadow-md`} />;
  }

  // Snow
  if (cond.includes('snow') || cond.includes('sleet') || cond.includes('blizzard')) {
    return <Snowflake size={size} className={`${className} text-sky-200 dark:text-sky-100 animate-pulse-slow drop-shadow-md`} />;
  }

  // Rain
  if (cond.includes('rain')) {
    return <CloudRain size={size} className={`${className} text-sky-400 dark:text-sky-300 drop-shadow-md`} />;
  }

  // Drizzle
  if (cond.includes('drizzle')) {
    return <CloudDrizzle size={size} className={`${className} text-cyan-400 dark:text-cyan-300 drop-shadow-md`} />;
  }

  // Fog / Mist / Haze / Smoke
  if (
    cond.includes('fog') ||
    cond.includes('mist') ||
    cond.includes('haze') ||
    cond.includes('smoke') ||
    cond.includes('dust') ||
    cond.includes('sand')
  ) {
    return <CloudFog size={size} className={`${className} text-slate-400 dark:text-slate-300 drop-shadow-md`} />;
  }

  // Tornado / Squall
  if (cond.includes('tornado') || cond.includes('squall')) {
    return <Tornado size={size} className={`${className} text-slate-400 drop-shadow-md`} />;
  }

  // Clear Sky
  if (cond.includes('clear')) {
    if (isNight) {
      return <Moon size={size} className={`${className} text-indigo-300 dark:text-indigo-200 drop-shadow-md`} />;
    }
    return <Sun size={size} className={`${className} text-amber-400 drop-shadow-glow text-glow-amber animate-spin-slow`} />;
  }

  // Clouds
  if (cond.includes('cloud')) {
    if (cond.includes('few') || cond.includes('scattered') || cond.includes('broken')) {
      if (isNight) {
        return <CloudMoon size={size} className={`${className} text-indigo-300 drop-shadow-md`} />;
      }
      return <CloudSun size={size} className={`${className} text-amber-300 drop-shadow-md`} />;
    }
    return <Cloud size={size} className={`${className} text-slate-300 dark:text-slate-200 drop-shadow-md`} />;
  }

  // Default fallback
  if (isNight) {
    return <Moon size={size} className={`${className} text-indigo-300`} />;
  }
  return <Sun size={size} className={`${className} text-amber-400`} />;
};
