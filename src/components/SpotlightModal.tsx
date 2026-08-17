import React, { useRef } from 'react';
import {
  X,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Droplets,
  Gauge,
  Eye,
  Cloud,
  CloudRain,
  CalendarDays,
  TrendingUp,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useSpotlight } from '../context/SpotlightContext';
import { useWeather } from '../context/WeatherContext';
import {
  formatTemp,
  convertTemp,
  formatWindSpeed,
  getWindDirectionCompass,
  getUvCategory,
  getHumidityCategory,
  getPressureCategory,
  getVisibilityCategory,
} from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SpotlightModal: React.FC = () => {
  const { activeCard, closeSpotlight } = useSpotlight();
  const { weatherData, unit, theme } = useWeather();
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!activeCard || !weatherData) return null;

  const { location, current, metrics, hourly, daily, sunCycle } = weatherData;
  const isDark = theme === 'dark';

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      closeSpotlight();
    }
  };

  const renderCardContent = () => {
    switch (activeCard) {
      case 'hero': {
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {location.city}, {location.country}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Station Lat: {location.lat.toFixed(3)}° • Lon: {location.lon.toFixed(3)}° • {location.formattedDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {formatTemp(current.temp, unit)}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  Feels like {formatTemp(current.feelsLike, unit)} • {current.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">High / Low</span>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {formatTemp(current.tempMax, unit)} / {formatTemp(current.tempMin, unit)}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">Atmosphere</span>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                  {current.condition}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">Precipitation Chance</span>
                <p className="text-base font-bold text-sky-500 mt-1">{metrics.pop}%</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">Local Station Time</span>
                <p className="text-base font-bold text-brand-500 mt-1">{location.localTime}</p>
              </div>
            </div>
          </div>
        );
      }

      case 'hourly': {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">24-Hour Detailed Chronology</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{hourly.length} Hourly Readings</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {hourly.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-between text-center"
                >
                  <span className="text-xs font-bold text-brand-500">{h.time}</span>
                  <div className="my-2">
                    <WeatherIcon condition={h.condition} iconCode={h.iconCode} isDay={h.iconCode.endsWith('d')} size={28} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatTemp(h.temp, unit)}</span>
                  <span className="text-[11px] text-sky-500 font-semibold mt-1">💧 {h.pop}% rain</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'chart': {
        const chartData = hourly.map(item => ({
          time: item.time,
          temp: convertTemp(item.temp, unit),
          feelsLike: convertTemp(item.feelsLike, unit),
          pop: item.pop,
          wind: parseFloat(formatWindSpeed(item.windSpeed, unit).value),
        }));

        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <TrendingUp size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">24-Hour Interactive Atmosphere Chart</h3>
              </div>
              <span className="text-xs text-brand-500 font-semibold">High-Precision Spline Interpolation</span>
            </div>

            <div className="w-full h-80 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="spotlightTempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} />
                  <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={12} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    name={`Temperature (°${unit === 'celsius' ? 'C' : 'F'})`}
                    stroke="#38BDF8"
                    strokeWidth={3}
                    fill="url(#spotlightTempGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'weekly': {
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarDays size={20} className="text-brand-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">7-Day Extended Synopsis</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Meteorological Forecast Model</span>
            </div>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {daily.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800"
                >
                  <div className="w-32">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{d.day}</p>
                    <p className="text-xs text-slate-400">{d.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <WeatherIcon condition={d.condition} iconCode={d.iconCode} isDay={true} size={24} />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                      {d.condition}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatTemp(d.tempMax, unit)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{formatTemp(d.tempMin, unit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'wind': {
        const speed = formatWindSpeed(metrics.windSpeed, unit);
        const gust = formatWindSpeed(metrics.windGust, unit);
        const compass = getWindDirectionCompass(metrics.windDirection);

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Wind size={22} className="text-teal-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wind & Aerodynamics Detail</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20">
                {compass.abbr} ({metrics.windDirection}°)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Current Velocity</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{speed.value}</span>
                    <span className="text-lg font-semibold text-slate-400">{speed.unit}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Peak Gusts Recorded</p>
                  <p className="text-lg font-bold text-teal-500 mt-0.5">{gust.value} {gust.unit}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vector vector flow from <strong className="text-slate-700 dark:text-slate-200">{compass.full}</strong>.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="relative w-36 h-36 rounded-full border-2 border-dashed border-teal-500/40 flex items-center justify-center">
                  <span className="absolute top-2 text-xs font-bold text-slate-400">N</span>
                  <span className="absolute bottom-2 text-xs font-bold text-slate-400">S</span>
                  <span className="absolute left-2 text-xs font-bold text-slate-400">W</span>
                  <span className="absolute right-2 text-xs font-bold text-slate-400">E</span>
                  <div
                    className="transform transition-transform duration-700 ease-out flex items-center justify-center"
                    style={{ transform: `rotate(${compass.arrowRotation}deg)` }}
                  >
                    <Compass size={48} className="text-teal-500" />
                  </div>
                </div>
                <span className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                  Compass Bearing: {metrics.windDirection}°
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'sun': {
        const { sunrise, sunset, daylightDurationFormatted, isDay } = sunCycle;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sun size={22} className="text-amber-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Solar & Astronomical Cycle</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                {daylightDurationFormatted} of Daylight
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center space-x-3">
                <Sunrise size={28} className="text-amber-500" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Solar Dawn (Sunrise)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{sunrise}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center space-x-3">
                <Sunset size={28} className="text-orange-500" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Solar Dusk (Sunset)</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{sunset}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>• Status: <strong className="text-slate-800 dark:text-slate-200">{isDay ? 'Sun is above the horizon.' : 'Night time / Twilight.'}</strong></p>
              <p>• Golden hour and optical clarity peak near twilight transitions.</p>
            </div>
          </div>
        );
      }

      case 'uv': {
        const uv = metrics.uvIndex;
        const category = getUvCategory(uv);
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles size={22} className="text-rose-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ultraviolet Radiation (UV) Index</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${category.badgeBg}`}>
                {category.label}
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-6xl font-extrabold text-slate-900 dark:text-white">{uv}</span>
              <span className="text-base text-slate-400 font-semibold">out of 11+ Max Scale</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <ShieldCheck size={18} />
                <span>Protection & Safety Recommendation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{category.description}</p>
            </div>
          </div>
        );
      }

      case 'humidity': {
        const humidity = metrics.humidity;
        const category = getHumidityCategory(humidity);
        const dewPointC = current.temp - ((100 - humidity) / 5);

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Droplets size={22} className="text-sky-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Moisture & Dew Point Analysis</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                {category.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">Relative Humidity</span>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{humidity}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-xs text-slate-400">Dew Point</span>
                <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">{formatTemp(dewPointC, unit)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The dew point represents the temperature to which air must be cooled to become saturated with water vapor.
            </p>
          </div>
        );
      }

      case 'pressure': {
        const pressure = metrics.pressure;
        const inHg = (pressure * 0.02953).toFixed(2);
        const info = getPressureCategory(pressure);

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Gauge size={22} className="text-indigo-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Atmospheric Barometric Pressure</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {info.label}
              </span>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{pressure}</span>
              <span className="text-lg text-slate-400 font-semibold">hPa / mb</span>
              <span className="text-sm text-slate-500">({inHg} inHg)</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              {info.description}
            </p>
          </div>
        );
      }

      case 'visibility': {
        const meters = metrics.visibility;
        const category = getVisibilityCategory(meters);
        const displayDistance =
          unit === 'fahrenheit'
            ? `${(meters * 0.000621371).toFixed(1)} mi`
            : `${(meters / 1000).toFixed(1)} km`;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Eye size={22} className="text-emerald-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Optical Visibility Range</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {category.label}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{displayDistance}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">{category.description}</p>
          </div>
        );
      }

      case 'clouds': {
        const clouds = metrics.cloudCover;
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Cloud size={22} className="text-slate-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cloud Cover & Sky Saturation</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-400 border border-slate-500/20">
                {clouds}% Coverage
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{clouds}%</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {clouds > 50 ? 'Heavy cloud formation reducing solar irradiance.' : 'Clear direct atmospheric transmission.'}
            </p>
          </div>
        );
      }

      case 'rain': {
        const volMm = metrics.precipitationVolume || 0;
        const displayVol =
          unit === 'fahrenheit'
            ? `${(volMm * 0.0393701).toFixed(2)} in`
            : `${volMm.toFixed(1)} mm`;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CloudRain size={22} className="text-blue-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Precipitation & Rain Volume</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {metrics.pop}% Probability
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">{displayVol}</span>
              <span className="text-sm text-slate-400 font-semibold">in past 24h</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {volMm > 0 ? `Anticipating ${displayVol} precipitation accumulation across current cycle.` : 'No rainfall measured in station gauge.'}
            </p>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/75 backdrop-blur-2xl transition-all duration-300 animate-fade-in"
    >
      {/* Blurred background click-area hint */}
      <div className="absolute top-5 right-6 z-50 flex items-center space-x-2">
        <button
          onClick={closeSpotlight}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all shadow-lg hover:scale-105"
          title="Close spotlight view (or press Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Centered Spotlight Card */}
      <div
        ref={modalContentRef}
        className="relative w-full max-w-2xl bg-white/90 dark:bg-slate-900/90 border border-white/40 dark:border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-3xl transition-all duration-400 transform scale-100 animate-zoom-in"
      >
        {/* Subtle dynamic ambient glow inside modal */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-brand-500/20 to-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">{renderCardContent()}</div>

        {/* Bottom instructions */}
        <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Click anywhere outside or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">Esc</kbd> to return</span>
          <button
            onClick={closeSpotlight}
            className="text-brand-500 hover:text-brand-400 font-bold transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>
    </div>
  );
};
