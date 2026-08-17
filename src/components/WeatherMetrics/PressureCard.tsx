import React from 'react';
import { Gauge, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { getPressureCategory } from '../../utils/formatters';
import { ReactiveCard } from '../ReactiveCard';

export const PressureCard: React.FC = () => {
  const { weatherData } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const pressure = weatherData.metrics.pressure;
  const inHg = (pressure * 0.02953).toFixed(2);
  const info = getPressureCategory(pressure);

  const pressurePercent = Math.max(0, Math.min(100, ((pressure - 960) / 100) * 100));

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(99, 102, 241, 0.2)"
      onClick={() => openSpotlight('pressure')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Gauge size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pressure
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {info.label}
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
            {pressure}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">hPa</span>
        </div>

        {/* Gauge bar */}
        <div className="mt-3 relative w-full h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-brand-500 rounded-full"
            style={{ width: `${pressurePercent}%` }}
          />
        </div>
      </div>

      {/* inHg & Description */}
      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>{inHg} inHg</span>
        <span>{info.description}</span>
      </div>
    </ReactiveCard>
  );
};
