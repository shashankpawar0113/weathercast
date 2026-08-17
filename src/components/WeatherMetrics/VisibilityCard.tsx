import React from 'react';
import { Eye, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { getVisibilityCategory } from '../../utils/formatters';
import { ReactiveCard } from '../ReactiveCard';

export const VisibilityCard: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const meters = weatherData.metrics.visibility;
  const category = getVisibilityCategory(meters);

  const displayDistance =
    unit === 'fahrenheit'
      ? `${(meters * 0.000621371).toFixed(1)} mi`
      : `${(meters / 1000).toFixed(1)} km`;

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(16, 185, 129, 0.2)"
      onClick={() => openSpotlight('visibility')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Eye size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Visibility
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {category.label}
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
            {displayDistance.split(' ')[0]}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {displayDistance.split(' ')[1]}
          </span>
        </div>

        {/* Progress bar based on 10km max */}
        <div className="mt-3 w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (meters / 10000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
        {category.description}
      </p>
    </ReactiveCard>
  );
};
