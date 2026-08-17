import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WeatherData, TemperatureUnit, ThemeMode } from '../types/weather';
import { fetchWeatherData, detectUserLocation } from '../services/weatherService';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTheme } from '../hooks/useTheme';

interface WeatherContextType {
  weatherData: WeatherData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  toggleUnit: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  recentSearches: string[];
  addRecentSearch: (city: string) => void;
  clearRecentSearches: () => void;
  searchCity: (cityName: string) => Promise<void>;
  searchCoords: (lat: number, lon: number, customName?: string) => Promise<void>;
  refresh: () => Promise<void>;
  detectLocation: () => void;
  currentQuery: { city?: string; lat?: number; lon?: number };
  isGlobeOpen: boolean;
  openGlobe: () => void;
  closeGlobe: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGlobeOpen, setIsGlobeOpen] = useState<boolean>(false);

  const openGlobe = () => setIsGlobeOpen(true);
  const closeGlobe = () => setIsGlobeOpen(false);

  const [unit, setUnit] = useLocalStorage<TemperatureUnit>('weathercast_unit', 'celsius');
  const [theme, toggleTheme] = useTheme();
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('weathercast_recent', [
    'Mumbai',
    'London',
    'Tokyo',
    'New York',
    'Paris',
  ]);

  const [currentQuery, setCurrentQuery] = useState<{ city?: string; lat?: number; lon?: number }>({
    city: 'Mumbai',
  });

  const toggleUnit = () => {
    setUnit(prev => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  const addRecentSearch = useCallback((city: string) => {
    const trimmed = city.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 6);
    });
  }, [setRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  const loadWeather = useCallback(
    async (params: { city?: string; lat?: number; lon?: number; forceRefresh?: boolean }) => {
      if (params.forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await fetchWeatherData(params);
        setWeatherData(data);
        if (data.location?.city) {
          addRecentSearch(data.location.city);
        }
      } catch (err: any) {
        console.error('Weather load failure:', err);
        setError('Unable to load weather information. Please check your connection or try another city.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [addRecentSearch]
  );

  const searchCity = async (cityName: string) => {
    const trimmed = cityName.trim();
    if (!trimmed) return;
    setCurrentQuery({ city: trimmed });
    await loadWeather({ city: trimmed });
  };

  const searchCoords = async (lat: number, lon: number, customName?: string) => {
    setCurrentQuery({ lat, lon, city: customName });
    await loadWeather({ lat, lon, city: customName });
  };

  const refresh = async () => {
    await loadWeather({ ...currentQuery, forceRefresh: true });
  };

  const detectLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          searchCoords(latitude, longitude);
        },
        async err => {
          console.warn('GPS Geolocation denied or unavailable, using IP detection:', err);
          const ipLoc = await detectUserLocation();
          searchCoords(ipLoc.lat, ipLoc.lon, ipLoc.city);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      const ipLoc = await detectUserLocation();
      searchCoords(ipLoc.lat, ipLoc.lon, ipLoc.city);
    }
  };

  // Initial load: Automatically detect user's actual current location
  useEffect(() => {
    let isMounted = true;

    const initLocationWeather = async () => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            if (isMounted) {
              searchCoords(pos.coords.latitude, pos.coords.longitude);
            }
          },
          async () => {
            if (isMounted) {
              const ipLoc = await detectUserLocation();
              searchCoords(ipLoc.lat, ipLoc.lon, ipLoc.city);
            }
          },
          { timeout: 3000, enableHighAccuracy: false }
        );
      } else {
        const ipLoc = await detectUserLocation();
        if (isMounted) {
          searchCoords(ipLoc.lat, ipLoc.lon, ipLoc.city);
        }
      }
    };

    initLocationWeather();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        isLoading,
        isRefreshing,
        error,
        unit,
        setUnit,
        toggleUnit,
        theme,
        toggleTheme,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        searchCity,
        searchCoords,
        refresh,
        detectLocation,
        currentQuery,
        isGlobeOpen,
        openGlobe,
        closeGlobe,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
