import React from 'react';
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Sparkles, Maximize2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useSpotlight } from '../context/SpotlightContext';
import { formatTemp } from '../utils/formatters';
import { InteractiveWeatherCard } from './InteractiveWeatherCard';
import { ReactiveCard } from './ReactiveCard';
import { DigitalClock } from './DigitalClock';

export const HeroWeather: React.FC = () => {
  const { weatherData, unit } = useWeather();
  const { openSpotlight } = useSpotlight();

  if (!weatherData) return null;

  const { location, current, metrics } = weatherData;

  return (
    <ReactiveCard
      maxTilt={3}
      scale={1.008}
      overflowVisible={true}
      onClick={() => openSpotlight('hero')}
      className="glass-card p-6 md:p-8 transition-all group cursor-pointer relative z-30 hover:z-40"
    >
      {/* Subtle glowing radial background inside the card */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br from-brand-400/10 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

      {/* Expand indicator on hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-brand-500 p-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm z-20">
        <Maximize2 size={15} />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        {/* Top Info Bar: Location & Local Time */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <MapPin size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {location.city}
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/50">
                  {location.country}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Lat: {location.lat.toFixed(2)}° • Lon: {location.lon.toFixed(2)}°
              </p>
            </div>
          </div>

          {/* Live Digital Clock with Day/Night & Timezone Indicator */}
          <DigitalClock />
        </div>

        {/* Centerpiece: Hero Temperature & Interactive Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Main Temperature Display */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <div className="flex items-start">
              <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                {formatTemp(current.temp, unit).replace('°', '')}
              </span>
              <span className="text-4xl sm:text-5xl md:text-6xl font-light text-brand-500 dark:text-brand-400 -mt-1 ml-1">
                °{unit === 'celsius' ? 'C' : 'F'}
              </span>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                  {current.description || current.condition}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Feels like <span className="font-bold text-slate-700 dark:text-slate-200">{formatTemp(current.feelsLike, unit)}</span>
              </p>
              <div className="flex items-center space-x-3 text-xs font-semibold pt-1">
                <span className="inline-flex items-center text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                  <ArrowUp size={12} className="mr-0.5" /> H: {formatTemp(current.tempMax, unit)}
                </span>
                <span className="inline-flex items-center text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-lg">
                  <ArrowDown size={12} className="mr-0.5" /> L: {formatTemp(current.tempMin, unit)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Expanding Interactive Weather Card */}
          <div
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
            onClick={e => e.stopPropagation()}
          >
            <InteractiveWeatherCard />
          </div>
        </div>

        {/* Bottom Quick Atmospheric Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
            <Droplets size={16} className="text-sky-500" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Rain Chance</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{metrics.pop}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
            <Wind size={16} className="text-teal-500" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Wind Speed</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {unit === 'fahrenheit'
                  ? `${Math.round(metrics.windSpeed * 0.621371)} mph`
                  : `${metrics.windSpeed} km/h`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
            <Droplets size={16} className="text-indigo-500" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Humidity</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{metrics.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40">
            <Sparkles size={16} className="text-amber-500" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">UV Index</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{metrics.uvIndex} / 10</p>
            </div>
          </div>
        </div>
      </div>
    </ReactiveCard>
  );
};
