import React from 'react';
import { CloudRain, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { ReactiveCard } from '../ReactiveCard';

export const PrecipitationCard: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const { metrics } = weatherData;
  const volMm = metrics.precipitationVolume || 0;
  const displayVol =
    unit === 'fahrenheit'
      ? `${(volMm * 0.0393701).toFixed(2)} in`
      : `${volMm.toFixed(1)} mm`;

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(59, 130, 246, 0.2)"
      onClick={() => openSpotlight('rain')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <CloudRain size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Precipitation
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {metrics.pop}% chance
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* Main Value */}
      <div className="my-2">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
            {displayVol.split(' ')[0]}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {displayVol.split(' ')[1]} in 24h
          </span>
        </div>

        {/* Probability bar */}
        <div className="mt-3 w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-sky-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(5, metrics.pop)}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
        {volMm > 0 ? `${displayVol} expected in upcoming cycles.` : 'No precipitation detected recently.'}
      </p>
    </ReactiveCard>
  );
};
