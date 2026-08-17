import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, History, Loader2, Navigation } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { searchLocations } from '../services/weatherService';
import { GeocodeLocation } from '../types/weather';

export const SearchBar: React.FC = () => {
  const {
    searchCity,
    searchCoords,
    detectLocation,
    recentSearches,
    clearRecentSearches,
    isLoading,
  } = useWeather();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeLocation[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const results = await searchLocations(trimmed);
        setSuggestions(results);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      const maxIndex = suggestions.length > 0 ? suggestions.length - 1 : recentSearches.length - 1;
      setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const maxIndex = suggestions.length > 0 ? suggestions.length - 1 : recentSearches.length - 1;
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (suggestions.length > 0 && suggestions[selectedIndex]) {
          handleSelectLocation(suggestions[selectedIndex]);
          return;
        } else if (recentSearches.length > 0 && recentSearches[selectedIndex]) {
          handleSelectCity(recentSearches[selectedIndex]);
          return;
        }
      }

      if (query.trim()) {
        handleSelectCity(query.trim());
      }
    }
  };

  const handleSelectCity = (city: string) => {
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    searchCity(city);
  };

  const handleSelectLocation = (loc: GeocodeLocation) => {
    setQuery('');
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    searchCoords(loc.lat, loc.lon, loc.name);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      {/* Uiverse Cosmic Glow Input Wrapper */}
      <div className="cosmic-search-poda">
        <div className="cosmic-glow" />
        <div className="cosmic-darkBorderBg" />
        <div className="cosmic-darkBorderBg" />
        <div className="cosmic-white" />
        <div className="cosmic-border" />
        
        <div className="cosmic-main">
          {/* Custom SVG Search Icon */}
          <div className="cosmic-search-icon">
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-brand-400" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" fill="none">
                <circle stroke="url(#cosmicSearch)" r={8} cy={11} cx={11} />
                <line stroke="url(#cosmicSearchLine)" y2="16.65" y1={22} x2="16.65" x1={22} />
                <defs>
                  <linearGradient gradientTransform="rotate(50)" id="cosmicSearch">
                    <stop stopColor="#f8e7f8" offset="0%" />
                    <stop stopColor="#a855f7" offset="50%" />
                    <stop stopColor="#38bdf8" offset="100%" />
                  </linearGradient>
                  <linearGradient id="cosmicSearchLine">
                    <stop stopColor="#a855f7" offset="0%" />
                    <stop stopColor="#38bdf8" offset="100%" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search city (e.g. Tokyo, London, Delhi...)"
            aria-label="Search city or location"
            className="cosmic-input"
          />

          {/* Right Action Controls: Clear button + GPS Geolocation Filter button */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 z-10">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}

            <button
              id="filter-icon-btn"
              onClick={detectLocation}
              title="Use current GPS location"
              aria-label="Use current location"
            >
              <Navigation size={15} className="text-cyan-400 fill-cyan-400/20 hover:text-cyan-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Autocomplete / Recent Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-slate-900/95 dark:bg-slate-950/95 border border-indigo-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
          {/* Autocomplete Results */}
          {suggestions.length > 0 && (
            <div className="px-2 py-1">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-3 py-1">
                Matching Cities
              </div>
              {suggestions.map((loc, idx) => (
                <button
                  key={`${loc.name}-${loc.lat}-${loc.lon}-${idx}`}
                  onClick={() => handleSelectLocation(loc)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl text-sm transition-colors ${
                    selectedIndex === idx
                      ? 'bg-indigo-500/20 text-cyan-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <MapPin size={15} className="text-cyan-400 flex-shrink-0" />
                    <span className="truncate font-medium">{loc.name}</span>
                    {loc.state && (
                      <span className="text-xs text-slate-400 truncate">
                        {loc.state},
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0 ml-2 border border-slate-700">
                    {loc.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Loading Indicator inside Dropdown */}
          {isSearchingSuggestions && suggestions.length === 0 && (
            <div className="flex items-center justify-center space-x-2 py-6 text-slate-400 text-xs">
              <Loader2 size={16} className="animate-spin text-brand-400" />
              <span>Searching meteorological stations...</span>
            </div>
          )}

          {/* Recent Searches */}
          {suggestions.length === 0 && !isSearchingSuggestions && recentSearches.length > 0 && (
            <div className="px-2 py-1">
              <div className="flex items-center justify-between px-3 py-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                  <History size={12} />
                  <span>Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="mt-1 space-y-0.5">
                {recentSearches.map((city, idx) => (
                  <button
                    key={`${city}-${idx}`}
                    onClick={() => handleSelectCity(city)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 text-left rounded-xl text-sm transition-colors ${
                      selectedIndex === idx
                        ? 'bg-indigo-500/20 text-cyan-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-slate-400 flex-shrink-0">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className="truncate">{city}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Popular Cities */}
          {suggestions.length === 0 && !isSearchingSuggestions && recentSearches.length === 0 && (
            <div className="p-3 text-center">
              <p className="text-xs text-slate-400 mb-2 font-medium">Popular Locations</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {['Delhi', 'Mumbai', 'London', 'Tokyo', 'New York', 'Paris'].map(city => (
                  <button
                    key={city}
                    onClick={() => handleSelectCity(city)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-brand-600 hover:text-white transition-all font-medium border border-slate-700"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
