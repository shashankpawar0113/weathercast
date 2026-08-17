import React from 'react';
import { CloudSun, ShieldCheck } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const Footer: React.FC = () => {
  const { weatherData } = useWeather();
  const isLive = weatherData?.source === 'live';

  return (
    <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold">
            <CloudSun size={14} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm">
              WeatherCast
            </span>
            <span className="text-slate-400 dark:text-slate-500 ml-2">
              — Precision Meteorological Intelligence
            </span>
          </div>
        </div>

        {/* Live Station & Security Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-emerald-400' : 'bg-sky-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-sky-500'}`} />
            </span>
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {isLive ? 'OpenWeather Live Station Active' : 'Station Sync Online'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-slate-400">
            <ShieldCheck size={14} className="text-brand-500" />
            <span>Secure Serverless API Proxy</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-[11px] text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} WeatherCast. All meteorological rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
