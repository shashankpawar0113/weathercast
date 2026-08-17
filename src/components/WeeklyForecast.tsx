import React from 'react';
import { CalendarDays, Droplets, Maximize2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useSpotlight } from '../context/SpotlightContext';
import { formatTemp, convertTemp } from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';
import { ReactiveCard } from './ReactiveCard';

export const WeeklyForecast: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData || !weatherData.daily || weatherData.daily.length === 0) return null;

  const { daily } = weatherData;

  const allMins = daily.map(d => convertTemp(d.tempMin, unit));
  const allMaxs = daily.map(d => convertTemp(d.tempMax, unit));
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, globalMax - globalMin);

  return (
    <ReactiveCard
      maxTilt={4}
      scale={1.008}
      onClick={() => openSpotlight('weekly')}
      className="glass-card p-5 md:p-6 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
            <CalendarDays size={16} />
          </div>
          <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-200">
            7-Day Outlook
          </h2>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 p-1">
          <Maximize2 size={14} />
        </span>
      </div>

      {/* Daily Cards List */}
      <div className="space-y-2.5">
        {daily.map((item, idx) => {
          const itemMin = convertTemp(item.tempMin, unit);
          const itemMax = convertTemp(item.tempMax, unit);
          
          const leftPercent = Math.max(0, ((itemMin - globalMin) / totalRange) * 100);
          const widthPercent = Math.max(12, ((itemMax - itemMin) / totalRange) * 100);

          return (
            <div
              key={`${item.day}-${item.date}-${idx}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 hover:border-brand-500/30 hover:bg-white/70 dark:hover:bg-slate-900/70 hover:translate-x-1 transition-all text-xs sm:text-sm"
            >
              {/* Day & Date */}
              <div className="w-24 sm:w-28 flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100">{item.day}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{item.date}</span>
              </div>

              {/* Weather Icon & Rain Badge */}
              <div className="flex items-center space-x-2 sm:space-x-3 w-28 sm:w-36">
                <div className="transform-gpu transition-transform hover:scale-110">
                  <WeatherIcon
                    condition={item.condition}
                    iconCode={item.iconCode}
                    isDay={true}
                    size={22}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate capitalize text-xs">
                    {item.condition}
                  </span>
                  {item.pop > 10 ? (
                    <span className="inline-flex items-center text-[10px] font-bold text-sky-500 dark:text-sky-400">
                      <Droplets size={10} className="mr-0.5" />
                      {item.pop}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">0% rain</span>
                  )}
                </div>
              </div>

              {/* Temperature Bar Visual & High/Low */}
              <div className="flex-1 hidden md:flex items-center px-4">
                <span className="w-8 text-right font-medium text-slate-400 text-xs">
                  {formatTemp(item.tempMin, unit)}
                </span>
                
                {/* Visual Bar Track */}
                <div className="flex-1 mx-3 h-2 bg-slate-200/60 dark:bg-slate-800 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-brand-500 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="w-8 text-left font-bold text-slate-800 dark:text-slate-100 text-xs">
                  {formatTemp(item.tempMax, unit)}
                </span>
              </div>

              {/* Mobile Min/Max Display */}
              <div className="flex md:hidden items-center space-x-2 text-xs font-bold">
                <span className="text-slate-400 font-medium">{formatTemp(item.tempMin, unit)}</span>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <span className="text-slate-800 dark:text-slate-100">{formatTemp(item.tempMax, unit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ReactiveCard>
  );
};
