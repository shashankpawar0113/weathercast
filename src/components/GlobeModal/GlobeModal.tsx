import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCw,
  Compass,
  MapPin,
  Search,
  Globe,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { GlobeCanvas, GlobeCity, MAJOR_GLOBE_CITIES } from './GlobeCanvas';
import { useWeather } from '../../context/WeatherContext';

interface GlobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobeModal: React.FC<GlobeModalProps> = ({ isOpen, onClose }) => {
  const { searchCoords, searchCity } = useWeather();
  const [hoveredCity, setHoveredCity] = useState<GlobeCity | null>(null);
  const [selectedLoc, setSelectedLoc] = useState<{ lat: number; lon: number; name?: string } | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [targetFocus, setTargetFocus] = useState<{ lat: number; lon: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLocationSelect = (loc: { lat: number; lon: number; name?: string }) => {
    setSelectedLoc(loc);
    setTargetFocus({ lat: loc.lat, lon: loc.lon });
  };

  const handleApplyLocation = async () => {
    if (!selectedLoc) return;
    setIsApplying(true);
    if (selectedLoc.name) {
      await searchCoords(selectedLoc.lat, selectedLoc.lon, selectedLoc.name);
    } else {
      await searchCoords(selectedLoc.lat, selectedLoc.lon);
    }
    setIsApplying(false);
    onClose();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Check if city in major list
    const found = MAJOR_GLOBE_CITIES.find(
      c => c.name.toLowerCase().includes(q) || c.country.toLowerCase() === q
    );

    if (found) {
      handleLocationSelect({ lat: found.lat, lon: found.lon, name: found.name });
    } else {
      // Fallback geocode search
      searchCity(searchQuery).then(() => {
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-2xl animate-fade-in">
      {/* Background radial cosmic glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-cyan-500/10 via-sky-600/10 to-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-2xl backdrop-blur-xl overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white shadow-lg shadow-brand-500/25">
              <Globe size={20} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-display font-extrabold tracking-tight">
                  3D Interactive Earth
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                  GLOBAL RADAR
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Drag to rotate • Scroll to zoom • Click any pin or surface coordinate
              </p>
            </div>
          </div>

          {/* Quick Search on Globe */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Fly to city (e.g. Tokyo)..."
              className="w-full bg-slate-800/70 border border-slate-700/80 text-xs text-white placeholder-slate-400 rounded-2xl pl-9 pr-8 py-2 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
            aria-label="Close Globe Explorer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3D Canvas Center Stage */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <GlobeCanvas
            onSelectLocation={handleLocationSelect}
            hoveredCity={hoveredCity}
            setHoveredCity={setHoveredCity}
            autoRotate={autoRotate}
            targetFocus={targetFocus}
            isLocationSelected={selectedLoc !== null}
          />

          {/* Floating HUD Controls (Top-Right) */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
            <button
              onClick={() => setAutoRotate(prev => !prev)}
              className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all shadow-lg flex items-center justify-center ${
                autoRotate
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
            >
              <RotateCw size={17} className={autoRotate ? 'animate-spin-slow' : ''} />
            </button>

            <button
              onClick={() => {
                setSelectedLoc(null);
                setTargetFocus(null);
              }}
              className="p-2.5 rounded-2xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md transition-all shadow-lg flex items-center justify-center"
              title="Reset View & Orbit"
            >
              <Compass size={17} />
            </button>
          </div>

          {/* Quick Continental Jump Pills (Top-Left) */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-20 max-w-md hidden sm:flex">
            {MAJOR_GLOBE_CITIES.slice(0, 6).map(city => (
              <button
                key={city.name}
                onClick={() => handleLocationSelect({ lat: city.lat, lon: city.lon, name: city.name })}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-xl bg-slate-900/80 hover:bg-brand-500/20 border border-slate-700 hover:border-brand-400/50 text-slate-300 hover:text-white backdrop-blur-md transition-all"
              >
                📍 {city.name}
              </button>
            ))}
          </div>

          {/* Hover City Tooltip Card */}
          {hoveredCity && !selectedLoc && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
              <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl backdrop-blur-md flex items-center space-x-2">
                <MapPin size={14} className="text-cyan-400" />
                <span className="text-sm font-bold text-white">{hoveredCity.name}, {hoveredCity.country}</span>
                <span className="text-xs text-slate-400">({hoveredCity.lat.toFixed(1)}°, {hoveredCity.lon.toFixed(1)}°)</span>
              </div>
            </div>
          )}

          {/* Bottom Selected Location Action Bar */}
          {selectedLoc && (
            <div className="absolute bottom-4 left-4 right-4 z-30 animate-fade-in-up">
              <div className="max-w-xl mx-auto p-4 rounded-3xl bg-slate-900/95 border border-brand-500/40 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center space-x-1.5">
                      <span>{selectedLoc.name || 'Custom Coordinate'}</span>
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Latitude: {selectedLoc.lat.toFixed(3)}° • Longitude: {selectedLoc.lon.toFixed(3)}°
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedLoc(null);
                      setTargetFocus(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApplyLocation}
                    disabled={isApplying}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 to-sky-400 hover:from-brand-600 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <span>{isApplying ? 'Loading...' : 'View Weather'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
