import React from 'react';
import { AlertTriangle, RotateCw, Search } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';

export const ErrorMessage: React.FC = () => {
  const { error, refresh, searchCity, isRefreshing } = useWeather();

  if (!error) return null;

  return (
    <div className="glass-card p-6 md:p-8 text-center space-y-4 border-rose-500/30 bg-rose-500/5 my-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
        <AlertTriangle size={24} />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Weather Notice
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {error}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Try Again</span>
        </button>

        <button
          onClick={() => searchCity('London')}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
        >
          <Search size={14} />
          <span>Try London</span>
        </button>
      </div>
    </div>
  );
};
