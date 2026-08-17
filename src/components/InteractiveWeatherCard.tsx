import React from 'react';
import { useWeather } from '../context/WeatherContext';
import { formatTemp, formatWindSpeed } from '../utils/formatters';

export const InteractiveWeatherCard: React.FC = () => {
  const { weatherData, unit } = useWeather();

  if (!weatherData) return null;

  const { location, current, metrics } = weatherData;
  const windInfo = formatWindSpeed(metrics.windSpeed, unit);

  let healthStatus = 'Healthy';
  let healthBg = '#22c55e';
  if (metrics.uvIndex > 8 || metrics.humidity > 85) {
    healthStatus = 'Moderate';
    healthBg = '#f59e0b';
  }

  return (
    <div className="interactive-card-wrapper">
      <div className="cardm">
        {/* Front Weather Card (Matches Screenshot 2) */}
        <div className="card">
          {/* Crisp 3D Golden Sun & Cloud Artwork */}
          <div className="weather-art">
            <svg width="74" height="74" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="cardSunGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="55%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </radialGradient>
                <linearGradient id="cardCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <filter id="cloudSoftShadow" x="-20%" y="-20%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* Glowing Warm Sun Sphere */}
              <circle cx="42" cy="45" r="30" fill="url(#cardSunGrad)" />

              {/* Fluffy 3D Cloud Foreground */}
              <g filter="url(#cloudSoftShadow)">
                <path
                  d="M62 65 H40 A10 10 0 0 1 40 45 A14 14 0 0 1 65 42 A12 12 0 0 1 74 54 A12 12 0 0 1 62 65 Z"
                  fill="url(#cardCloudGrad)"
                />
              </g>
            </svg>
          </div>

          {/* Temperature and City */}
          <div className="weather-info">
            <div className="main-temp">{formatTemp(current.temp, unit)}</div>
            <div className="main-location">
              {location.city}, {location.country}
            </div>
          </div>
        </div>

        {/* Hidden Expanding Drawer Card (Appears Only on Hover) */}
        <div className="card2">
          {/* Upper Metrics: Humidity & Wind */}
          <div className="upper">
            <div className="humidity-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <div className="stat-text">
                Humidity
                <br />
                <span className="text-slate-500 font-semibold">{metrics.humidity}%</span>
              </div>
            </div>

            <div className="air-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
              </svg>
              <div className="stat-text">
                Wind
                <br />
                <span className="text-slate-500 font-semibold">
                  {windInfo.value} {windInfo.unit}
                </span>
              </div>
            </div>
          </div>

          {/* Lower Metrics: UV, Real Feel, Pressure */}
          <div className="lower">
            <div className="lower-stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
              </svg>
              <div className="lower-stat-text">
                UV
                <br />
                <span className="text-slate-500">{metrics.uvIndex}</span>
              </div>
            </div>

            <div className="lower-stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
              <div className="lower-stat-text">
                Real Feel
                <br />
                <span className="text-slate-500">{formatTemp(current.feelsLike, unit)}</span>
              </div>
            </div>

            <div className="lower-stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              <div className="lower-stat-text">
                Pressure
                <br />
                <span className="text-slate-500">{metrics.pressure} mb</span>
              </div>
            </div>
          </div>

          {/* Bottom Health Pill */}
          <div className="card3" style={{ background: healthBg }}>
            {healthStatus}
          </div>
        </div>
      </div>
    </div>
  );
};
