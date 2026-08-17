import React, { useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, Droplets, Maximize2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useSpotlight } from '../context/SpotlightContext';
import { formatTemp } from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';
import { ReactiveCard } from './ReactiveCard';

export const HourlyForecast: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) return null;

  const { hourly } = weatherData;

  const scroll = (direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <ReactiveCard
      maxTilt={3}
      scale={1.006}
      onClick={() => openSpotlight('hourly')}
      className="glass-card p-5 md:p-6 cursor-pointer group relative z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
            <Clock size={16} />
          </div>
          <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Hourly Forecast
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Next 24 Hours</span>
        </div>

        {/* Scroll Buttons & Maximize hint */}
        <div className="flex items-center space-x-1">
          <div className="hidden sm:flex items-center space-x-1 mr-2">
            <button
              onClick={e => scroll('left', e)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={e => scroll('right', e)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 p-1">
            <Maximize2 size={14} />
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
      >
        {hourly.map((hour, idx) => {
          const isNow = idx === 0;
          return (
            <div
              key={`${hour.timestamp}-${idx}`}
              className={`flex-shrink-0 snap-start flex flex-col items-center justify-between p-3.5 rounded-2xl w-[96px] md:w-[104px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                isNow
                  ? 'bg-gradient-to-b from-brand-500/15 via-brand-500/5 to-transparent border border-brand-500/30 shadow-sm'
                  : 'bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 hover:border-brand-500/30 hover:bg-white/60 dark:hover:bg-slate-900/60'
              }`}
            >
              {/* Time Label */}
              <span
                className={`text-xs font-bold ${
                  isNow
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {hour.time}
              </span>

              {/* Weather Icon */}
              <div className="my-2.5 transform-gpu transition-transform hover:scale-115">
                <WeatherIcon
                  condition={hour.condition}
                  iconCode={hour.iconCode}
                  isDay={hour.iconCode.endsWith('d') || hour.time.includes('AM') || hour.time === 'Now'}
                  size={26}
                />
              </div>

              {/* Temperature */}
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatTemp(hour.temp, unit)}
              </span>

              {/* Rain Chance */}
              <div className="mt-1.5 flex items-center space-x-1">
                {hour.pop > 0 ? (
                  <span className="inline-flex items-center text-[10px] font-bold text-sky-500 dark:text-sky-400">
                    <Droplets size={10} className="mr-0.5" />
                    {hour.pop}%
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ReactiveCard>
  );
};
