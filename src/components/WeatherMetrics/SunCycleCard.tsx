import React from 'react';
import { Sunrise, Sunset, SunMedium, Maximize2 } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';
import { useSpotlight } from '../../context/SpotlightContext';
import { ReactiveCard } from '../ReactiveCard';

export const SunCycleCard: React.FC = () => {
  const { weatherData } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const { sunCycle } = weatherData;
  const { sunrise, sunset, daylightDurationFormatted, isDay, dayProgressPercent } = sunCycle;

  const progressRatio = Math.max(0, Math.min(100, dayProgressPercent)) / 100;
  const angle = Math.PI * (1 - progressRatio);
  const cx = 100;
  const cy = 90;
  const r = 70;
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);

  return (
    <ReactiveCard
      maxTilt={8}
      scale={1.02}
      spotlightColor="rgba(245, 158, 11, 0.2)"
      onClick={() => openSpotlight('sun')}
      className="glass-card p-5 flex flex-col justify-between cursor-pointer group"
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <SunMedium size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sun & Solar Cycle
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {daylightDurationFormatted} light
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <Maximize2 size={12} />
          </span>
        </div>
      </div>

      {/* SVG Sun Arc Trajectory Visual */}
      <div className="relative w-full h-24 my-1 flex items-center justify-center">
        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Background Arc Path */}
          <path
            d="M 30,90 A 70,70 0 0,1 170,90"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="4 4"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Active Lit Arc Path (if daytime) */}
          {isDay && (
            <path
              d="M 30,90 A 70,70 0 0,1 170,90"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="4"
              strokeDasharray="220"
              strokeDashoffset={220 - (220 * progressRatio)}
              className="transition-all duration-1000"
            />
          )}

          {/* Horizon Line */}
          <line
            x1="10"
            y1="90"
            x2="190"
            y2="90"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-300 dark:text-slate-700"
          />

          {/* Sun or Moon Marker */}
          {isDay ? (
            <g transform={`translate(${sunX}, ${sunY})`}>
              <circle r="8" fill="#F59E0B" className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <circle r="4" fill="#FEF3C7" />
            </g>
          ) : (
            <g transform="translate(100, 85)">
              <circle r="6" fill="#818CF8" className="filter drop-shadow-[0_0_6px_rgba(129,140,248,0.7)]" />
            </g>
          )}
        </svg>
      </div>

      {/* Sunrise and Sunset Times Strip */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-500">
            <Sunrise size={14} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Sunrise</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{sunrise}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-right">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Sunset</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{sunset}</p>
          </div>
          <div className="p-1 rounded-md bg-orange-500/10 text-orange-500">
            <Sunset size={14} />
          </div>
        </div>
      </div>
    </ReactiveCard>
  );
};
