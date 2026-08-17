import React from 'react';
import { Droplets, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { getHumidityCategory, formatTemp } from '../../utils/formatters';
import { ReactiveCard } from '../ReactiveCard';

export const HumidityCard: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const { metrics, current } = weatherData;
  const humidity = metrics.humidity;
  const category = getHumidityCategory(humidity);

  const dewPointC = current.temp - ((100 - humidity) / 5);

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(14, 165, 233, 0.2)"
      onClick={() => openSpotlight('humidity')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <Droplets size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Humidity
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            {category.label}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* Main Value & Bar */}
      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
            {humidity}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">%</span>
        </div>

        {/* Moisture progress bar */}
        <div className="mt-3 w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${humidity}%` }}
          />
        </div>
      </div>

      {/* Dew point & description */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>The dew point is {formatTemp(dewPointC, unit)}</span>
      </div>
    </ReactiveCard>
  );
};
