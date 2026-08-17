import React from 'react';
import { WeatherEnvironmentCanvas } from './WeatherEnvironment/WeatherEnvironmentCanvas';

export const WeatherBackground: React.FC = () => {
  return (
    <>
      {/* Full Procedural Weather-Reactive Canvas Environment */}
      <WeatherEnvironmentCanvas />

      {/* Lightweight Atmospheric Readability & Contrast Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-700 overflow-hidden">
        {/* Soft Vignette along edges to frame content */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

        {/* Micro-dot Atmospheric Grid Texture */}
        <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>
    </>
  );
};
