import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Droplets, Wind, Thermometer, Maximize2 } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useSpotlight } from '../context/SpotlightContext';
import { convertTemp, formatWindSpeed } from '../utils/formatters';
import { ReactiveCard } from './ReactiveCard';

type ChartMetric = 'temp' | 'pop' | 'wind';

export const WeatherChart: React.FC = () => {
  const { weatherData, unit, theme } = useWeather();
  const { openSpotlight } = useSpotlight();
  const [metric, setMetric] = useState<ChartMetric>('temp');

  if (!weatherData || !weatherData.hourly || weatherData.hourly.length === 0) return null;

  const isDark = theme === 'dark';

  // Format chart data based on selected metric
  const chartData = weatherData.hourly.map(item => {
    const displayTemp = convertTemp(item.temp, unit);
    const displayFeelsLike = convertTemp(item.feelsLike, unit);
    const windFormatted = formatWindSpeed(item.windSpeed, unit);

    return {
      time: item.time,
      temp: displayTemp,
      feelsLike: displayFeelsLike,
      pop: item.pop,
      wind: parseFloat(windFormatted.value),
      condition: item.condition,
      description: item.description,
      rawItem: item,
    };
  });

  const metricConfigs = {
    temp: {
      label: `Temperature (°${unit === 'celsius' ? 'C' : 'F'})`,
      stroke: isDark ? '#38BDF8' : '#0284C7',
      fillStart: isDark ? '#38BDF8' : '#0284C7',
      unitSuffix: `°${unit === 'celsius' ? 'C' : 'F'}`,
      dataKey: 'temp',
    },
    pop: {
      label: 'Precipitation Chance (%)',
      stroke: isDark ? '#60A5FA' : '#2563EB',
      fillStart: isDark ? '#60A5FA' : '#2563EB',
      unitSuffix: '%',
      dataKey: 'pop',
    },
    wind: {
      label: `Wind Speed (${unit === 'fahrenheit' ? 'mph' : 'km/h'})`,
      stroke: isDark ? '#2DD4BF' : '#0D9488',
      fillStart: isDark ? '#2DD4BF' : '#0D9488',
      unitSuffix: unit === 'fahrenheit' ? ' mph' : ' km/h',
      dataKey: 'wind',
    },
  };

  const activeConfig = metricConfigs[metric];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl text-xs space-y-1 z-50">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="capitalize text-slate-400 font-normal">{data.condition}</span>
          </p>
          <div className="pt-1 space-y-1">
            <p className="text-white font-extrabold text-sm">
              {activeConfig.label.split(' ')[0]}:{' '}
              <span className="text-brand-400">
                {payload[0].value}
                {activeConfig.unitSuffix}
              </span>
            </p>
            {metric === 'temp' && (
              <p className="text-slate-400">
                Feels like: {data.feelsLike}° • Rain: {data.pop}%
              </p>
            )}
            {metric === 'pop' && (
              <p className="text-slate-400">
                Temp: {data.temp}° • Wind: {data.wind} {unit === 'fahrenheit' ? 'mph' : 'km/h'}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ReactiveCard
      maxTilt={4}
      scale={1.008}
      onClick={() => openSpotlight('chart')}
      className="glass-card p-5 md:p-6 cursor-pointer group"
    >
      {/* Header with Metric Switchers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
            <TrendingUp size={16} />
          </div>
          <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-200">
            24-Hour Forecast Trend
          </h2>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 p-1">
            <Maximize2 size={13} />
          </span>
        </div>

        {/* Metric Selector Tabs */}
        <div
          className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold z-10"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setMetric('temp')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
              metric === 'temp'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Thermometer size={13} />
            <span>Temp</span>
          </button>

          <button
            onClick={() => setMetric('pop')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
              metric === 'pop'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Droplets size={13} />
            <span>Rain %</span>
          </button>

          <button
            onClick={() => setMetric('wind')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl transition-all ${
              metric === 'wind'
                ? 'bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wind size={13} />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-56 md:h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeConfig.fillStart} stopOpacity={0.4} />
                <stop offset="95%" stopColor={activeConfig.fillStart} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke={isDark ? '#64748B' : '#94A3B8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={isDark ? '#64748B' : '#94A3B8'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={metric === 'pop' ? [0, 100] : ['auto', 'auto']}
              unit={metric === 'pop' ? '%' : ''}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={activeConfig.dataKey}
              stroke={activeConfig.stroke}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartGradient)"
              activeDot={{
                r: 6,
                fill: activeConfig.stroke,
                stroke: isDark ? '#0F172A' : '#FFFFFF',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ReactiveCard>
  );
};
