import React, { useState, useEffect } from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { SpotlightProvider } from './context/SpotlightContext';
import { WeatherBackground } from './components/WeatherBackground';
import { Header } from './components/Header';
import { HeroWeather } from './components/HeroWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { WeatherChart } from './components/WeatherChart';
import { WeeklyForecast } from './components/WeeklyForecast';
import { MetricsGrid } from './components/WeatherMetrics/MetricsGrid';
import { EarthLoader } from './components/EarthLoader';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';
import { SpotlightModal } from './components/SpotlightModal';
import { GlobeModal } from './components/GlobeModal/GlobeModal';

const DashboardContent: React.FC = () => {
  const { isLoading, weatherData, error, isGlobeOpen, closeGlobe } = useWeather();
  const [isInitialStartup, setIsInitialStartup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialStartup(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialStartup) {
    return <EarthLoader fullScreen={true} durationMs={3000} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-brand-500 selection:text-white relative z-10">
      <WeatherBackground />
      <SpotlightModal />
      <GlobeModal isOpen={isGlobeOpen} onClose={closeGlobe} />
      
      <div>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error && <ErrorMessage />}

          {isLoading && !weatherData ? (
            <EarthLoader />
          ) : (
            <>
              {/* Primary Current Weather Hero */}
              <HeroWeather />

              {/* 24-Hour Hourly Carousel */}
              <HourlyForecast />

              {/* Middle Section: Interactive Forecast Chart & 7-Day Outlook */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 w-full">
                  <WeatherChart />
                </div>
                <div className="lg:col-span-5 w-full">
                  <WeeklyForecast />
                </div>
              </div>

              {/* Comprehensive Atmospheric Bento Grid */}
              <MetricsGrid />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <WeatherProvider>
      <SpotlightProvider>
        <DashboardContent />
      </SpotlightProvider>
    </WeatherProvider>
  );
}
