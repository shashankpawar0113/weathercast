import React from 'react';
import { Wind, Navigation, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { formatWindSpeed, getWindDirectionCompass } from '../../utils/formatters';
import { ReactiveCard } from '../ReactiveCard';

export const WindCard: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const { metrics } = weatherData;
  const speed = formatWindSpeed(metrics.windSpeed, unit);
  const gust = formatWindSpeed(metrics.windGust, unit);
  const compass = getWindDirectionCompass(metrics.windDirection);

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(45, 212, 191, 0.2)"
      onClick={() => openSpotlight('wind')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
            <Wind size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Wind & Gusts
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            {compass.abbr} ({metrics.windDirection}°)
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* Main Content: Value & Visual Compass */}
      <div className="flex items-center justify-between my-2">
        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white">
              {speed.value}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {speed.unit}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Gusts up to <span className="font-bold text-slate-700 dark:text-slate-200">{gust.value} {gust.unit}</span>
          </p>
        </div>

        {/* Visual Compass Needle Dial */}
        <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
          <span className="absolute top-1 text-[9px] font-bold text-slate-400">N</span>
          <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
          <span className="absolute left-1 text-[9px] font-bold text-slate-400">W</span>
          <span className="absolute right-1 text-[9px] font-bold text-slate-400">E</span>
          
          <div
            className="transform transition-transform duration-700 ease-out flex items-center justify-center"
            style={{ transform: `rotate(${compass.arrowRotation}deg)` }}
          >
            <Navigation size={22} className="text-teal-500 fill-teal-500" />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 font-medium">
        Blowing from <span className="font-semibold text-slate-700 dark:text-slate-300">{compass.full}</span>
      </p>
    </ReactiveCard>
  );
};
