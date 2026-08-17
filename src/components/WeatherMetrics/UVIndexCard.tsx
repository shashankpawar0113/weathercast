import React from 'react';
import { Sun, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { getUvCategory } from '../../utils/formatters';
import { ReactiveCard } from '../ReactiveCard';

export const UVIndexCard: React.FC = () => {
  const { weatherData } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const uv = weatherData.metrics.uvIndex;
  const category = getUvCategory(uv);
  const uvPercent = Math.min(100, (uv / 11) * 100);

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(244, 63, 94, 0.2)"
      onClick={() => openSpotlight('uv')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
            <Sun size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            UV Index
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${category.badgeBg}`}>
            {category.label}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* Main Value & Gauge */}
      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
            {uv}
          </span>
          <span className="text-xs font-semibold text-slate-400">/ 11+</span>
        </div>

        {/* Multi-color gradient UV bar */}
        <div className="mt-3 relative w-full h-2.5 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-amber-400 via-rose-500 to-purple-600 rounded-full opacity-80" />
          <div
            className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] border border-slate-900 -ml-1 transition-all duration-700"
            style={{ left: `${uvPercent}%` }}
          />
        </div>
      </div>

      {/* Advice Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
        {category.description}
      </p>
    </ReactiveCard>
  );
};
