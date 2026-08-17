import React from 'react';
import { Cloud, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { ReactiveCard } from '../ReactiveCard';

export const CloudCoverCard: React.FC = () => {
  const { weatherData } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const clouds = weatherData.metrics.cloudCover;

  let cloudText = 'Clear skies';
  if (clouds > 80) cloudText = 'Overcast sky';
  else if (clouds > 50) cloudText = 'Mostly cloudy';
  else if (clouds > 20) cloudText = 'Partly cloudy';

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(148, 163, 184, 0.2)"
      onClick={() => openSpotlight('clouds')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-500">
            <Cloud size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cloud Cover
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {cloudText}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* Main Value */}
      <div className="my-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
            {clouds}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">%</span>
        </div>

        {/* Cloud coverage visual bars */}
        <div className="mt-3 w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-slate-400 to-slate-600 rounded-full transition-all duration-700"
            style={{ width: `${clouds}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
        {clouds < 30 ? 'High sunshine visibility.' : 'Reduced direct solar radiation.'}
      </p>
    </ReactiveCard>
  );
};
