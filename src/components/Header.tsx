import React from 'react';
import { Sun, Moon, RotateCw, CloudSun, Globe } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  const {
    unit,
    toggleUnit,
    theme,
    toggleTheme,
    refresh,
    isRefreshing,
    openGlobe,
  } = useWeather();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand Logo & Live Pulse */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <CloudSun size={20} className="text-amber-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-500"></span>
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-slate-700 dark:from-white dark:via-sky-200 dark:to-slate-300 bg-clip-text text-transparent">
                WeatherCast
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                Live Radar
              </span>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center space-x-1.5 md:hidden">
            {/* Globe on Mobile */}
            <button
              onClick={openGlobe}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-500 dark:text-cyan-400 transition-colors"
              title="Open 3D Earth Globe"
            >
              <Globe size={16} className="animate-spin-slow" />
            </button>

            {/* Unit Switcher */}
            <button
              onClick={toggleUnit}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-700 dark:text-slate-300 transition-colors"
              title="Switch Temperature Unit"
            >
              {unit === 'celsius' ? '°C' : '°F'}
            </button>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
              title="Refresh Weather"
            >
              <RotateCw size={16} className={isRefreshing ? 'animate-spin text-brand-500' : ''} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center max-w-xl mx-auto w-full">
          <SearchBar />
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center space-x-2.5">
          {/* 3D Earth Globe Trigger Button (Between Search and Temp Unit Toggle) */}
          <button
            onClick={openGlobe}
            className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/15 via-sky-500/20 to-blue-600/15 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-500 dark:text-cyan-300 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
            title="Open 3D Interactive Earth Globe"
            aria-label="3D Earth Globe Explorer"
          >
            <Globe size={18} className="animate-spin-slow text-cyan-500 dark:text-cyan-300 group-hover:text-cyan-200 transition-colors" />
          </button>

          {/* Unit Toggle Pill (°C / °F) */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <button
              onClick={() => unit !== 'celsius' && toggleUnit()}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                unit === 'celsius'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => unit !== 'fahrenheit' && toggleUnit()}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                unit === 'fahrenheit'
                  ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all shadow-sm active:scale-95"
            title="Refresh Data"
          >
            <RotateCw size={17} className={isRefreshing ? 'animate-spin text-brand-500' : ''} />
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all shadow-sm active:scale-95"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon size={17} className="text-slate-700 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
