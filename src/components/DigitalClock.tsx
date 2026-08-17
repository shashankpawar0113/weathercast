import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunrise, Sunset, Calendar, Globe } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const DigitalClock: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { weatherData, openGlobe } = useWeather();
  const [timeState, setTimeState] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    ampm: string;
    dateFormatted: string;
    dayName: string;
    phase: 'day' | 'night' | 'sunrise' | 'sunset';
    tzFormatted: string;
  } | null>(null);

  useEffect(() => {
    if (!weatherData) return;

    const tzOffset = weatherData.location.timezoneOffset || 0;
    const sunrise = weatherData.sunCycle.sunriseTimestamp;
    const sunset = weatherData.sunCycle.sunsetTimestamp;

    const updateClock = () => {
      const now = new Date();
      // now.getTime() is UTC epoch in milliseconds.
      // tzOffset is the location's offset from UTC in seconds.
      const targetLocalEpochMs = now.getTime() + tzOffset * 1000;
      const localDate = new Date(targetLocalEpochMs);

      let h = localDate.getUTCHours();
      const m = localDate.getUTCMinutes();
      const s = localDate.getUTCSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;

      const hours = h12 < 10 ? `0${h12}` : `${h12}`;
      const minutes = m < 10 ? `0${m}` : `${m}`;
      const seconds = s < 10 ? `0${s}` : `${s}`;

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[localDate.getUTCDay()];
      const dateFormatted = `${dayName}, ${months[localDate.getUTCMonth()]} ${localDate.getUTCDate()}`;

      // Determine day / night / sunrise / sunset phase using UTC epoch seconds
      const nowUtcSec = Math.floor(now.getTime() / 1000);
      let phase: 'day' | 'night' | 'sunrise' | 'sunset' = weatherData.current.isDay ? 'day' : 'night';

      if (sunrise && sunset) {
        const sunriseDiff = nowUtcSec - sunrise;
        const sunsetDiff = nowUtcSec - sunset;

        if (Math.abs(sunriseDiff) < 2700) {
          phase = 'sunrise';
        } else if (Math.abs(sunsetDiff) < 2700) {
          phase = 'sunset';
        } else if (nowUtcSec >= sunrise && nowUtcSec <= sunset) {
          phase = 'day';
        } else {
          phase = 'night';
        }
      }

      // Format timezone offset (e.g. UTC +5:30)
      const tzHours = Math.floor(Math.abs(tzOffset) / 3600);
      const tzMinutes = Math.floor((Math.abs(tzOffset) % 3600) / 60);
      const tzSign = tzOffset >= 0 ? '+' : '-';
      const tzFormatted = `UTC${tzSign}${tzHours}${tzMinutes > 0 ? `:${tzMinutes < 10 ? '0' : ''}${tzMinutes}` : ''}`;

      setTimeState({
        hours,
        minutes,
        seconds,
        ampm,
        dateFormatted,
        dayName,
        phase,
        tzFormatted,
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [weatherData]);

  if (!timeState) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/80 shadow-md backdrop-blur-md transition-all ${className}`}
    >
      {/* Live Digital LED Clock */}
      <div className="flex items-center space-x-1 font-mono">
        <div className="flex items-center bg-slate-900/90 dark:bg-black/60 px-2.5 py-1.5 rounded-xl border border-slate-800 text-brand-400 dark:text-cyan-400 font-extrabold text-base md:text-lg tracking-wider shadow-inner">
          <span>{timeState.hours}</span>
          <span className="animate-pulse mx-0.5 text-brand-500 dark:text-cyan-500">:</span>
          <span>{timeState.minutes}</span>
          <span className="animate-pulse mx-0.5 text-brand-500/60 dark:text-cyan-500/60">:</span>
          <span className="text-xs text-brand-300 dark:text-cyan-300 ml-0.5">{timeState.seconds}</span>
        </div>
        <span className="text-[11px] font-bold px-1.5 py-1 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
          {timeState.ampm}
        </span>
      </div>

      <div className="h-6 w-px bg-slate-300/60 dark:bg-slate-700/60 hidden sm:block" />

      {/* Date & Timezone */}
      <div className="flex flex-col text-left">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Calendar size={12} className="text-brand-500 shrink-0" />
          <span className="truncate">{timeState.dateFormatted}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
          <Globe size={11} className="text-slate-400 shrink-0" />
          <span>{timeState.tzFormatted} • Local Time</span>
        </div>
      </div>

      <div className="h-6 w-px bg-slate-300/60 dark:bg-slate-700/60 hidden sm:block" />

      {/* Day / Night / Solar Phase Pill Badge & 3D Earth Trigger */}
      <div className="flex items-center space-x-2">
        {timeState.phase === 'day' && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs shadow-sm">
            <Sun size={14} className="animate-spin-slow text-amber-500" />
            <span>DAY</span>
          </div>
        )}

        {timeState.phase === 'night' && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs shadow-sm">
            <Moon size={14} className="text-indigo-400" />
            <span>NIGHT</span>
          </div>
        )}

        {timeState.phase === 'sunrise' && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs shadow-sm">
            <Sunrise size={14} className="text-orange-500" />
            <span>DAWN</span>
          </div>
        )}

        {timeState.phase === 'sunset' && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-xs shadow-sm">
            <Sunset size={14} className="text-purple-400" />
            <span>DUSK</span>
          </div>
        )}

        {/* Little 3D Earth Globe Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openGlobe();
          }}
          className="relative group/globe p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 border border-cyan-500/40 hover:border-cyan-400 text-cyan-500 dark:text-cyan-300 shadow-sm transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
          title="Open 3D Interactive Earth Globe"
          aria-label="Open 3D Earth Globe"
        >
          <Globe size={15} className="animate-spin-slow text-cyan-500 dark:text-cyan-300 group-hover/globe:text-cyan-200 transition-colors" />
          <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-bold text-white shadow-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover/globe:opacity-100 transition-opacity pointer-events-none z-30">
            3D Globe
          </span>
        </button>
      </div>
    </div>
  );
};
