import { TemperatureUnit } from '../types/weather';

export function convertTemp(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  const converted = convertTemp(celsius, unit);
  return `${converted}°`;
}

export function formatWindSpeed(speedKmH: number, unit: TemperatureUnit): { value: string; unit: string } {
  if (unit === 'fahrenheit') {
    // mph
    const mph = Math.round(speedKmH * 0.621371);
    return { value: `${mph}`, unit: 'mph' };
  }
  return { value: `${Math.round(speedKmH)}`, unit: 'km/h' };
}

export function getWindDirectionCompass(deg: number): { abbr: string; full: string; arrowRotation: number } {
  const directions = [
    { abbr: 'N', full: 'North' },
    { abbr: 'NNE', full: 'North-Northeast' },
    { abbr: 'NE', full: 'Northeast' },
    { abbr: 'ENE', full: 'East-Northeast' },
    { abbr: 'E', full: 'East' },
    { abbr: 'ESE', full: 'East-Southeast' },
    { abbr: 'SE', full: 'Southeast' },
    { abbr: 'SSE', full: 'South-Southeast' },
    { abbr: 'S', full: 'South' },
    { abbr: 'SSW', full: 'South-Southwest' },
    { abbr: 'SW', full: 'Southwest' },
    { abbr: 'WSW', full: 'West-Southwest' },
    { abbr: 'W', full: 'West' },
    { abbr: 'WNW', full: 'West-Northwest' },
    { abbr: 'NW', full: 'Northwest' },
    { abbr: 'NNW', full: 'North-Northwest' },
  ];

  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return {
    abbr: directions[index].abbr,
    full: directions[index].full,
    arrowRotation: deg,
  };
}

export function getUvCategory(uv: number): {
  label: string;
  colorClass: string;
  badgeBg: string;
  description: string;
} {
  if (uv <= 2) {
    return {
      label: 'Low',
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      description: 'No protection needed. Safe for outdoor activities.',
    };
  }
  if (uv <= 5) {
    return {
      label: 'Moderate',
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      description: 'Wear sunscreen and sunglasses during midday hours.',
    };
  }
  if (uv <= 7) {
    return {
      label: 'High',
      colorClass: 'text-orange-400',
      badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
      description: 'Seek shade during peak hours. Slip on a hat.',
    };
  }
  if (uv <= 10) {
    return {
      label: 'Very High',
      colorClass: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      description: 'Avoid sun exposure around midday. Sun protection essential.',
    };
  }
  return {
    label: 'Extreme',
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    description: 'Take all precautions. Unprotected skin burns rapidly.',
  };
}

export function getHumidityCategory(humidity: number): {
  label: string;
  colorClass: string;
  description: string;
} {
  if (humidity < 30) {
    return {
      label: 'Dry',
      colorClass: 'text-amber-400',
      description: 'Air is dry. Stay hydrated.',
    };
  }
  if (humidity <= 60) {
    return {
      label: 'Comfortable',
      colorClass: 'text-emerald-400',
      description: 'Ideal indoor & outdoor moisture.',
    };
  }
  if (humidity <= 80) {
    return {
      label: 'Humid',
      colorClass: 'text-sky-400',
      description: 'Sticky and humid atmosphere.',
    };
  }
  return {
    label: 'Very Humid',
    colorClass: 'text-indigo-400',
    description: 'High moisture. Condensation likely.',
  };
}

export function getVisibilityCategory(meters: number): {
  formatted: string;
  label: string;
  description: string;
} {
  const km = (meters / 1000).toFixed(1);
  if (meters >= 10000) {
    return {
      formatted: `${km} km`,
      label: 'Crystal Clear',
      description: 'Perfect visibility for miles.',
    };
  }
  if (meters >= 5000) {
    return {
      formatted: `${km} km`,
      label: 'Good',
      description: 'Clear horizon with light haze.',
    };
  }
  if (meters >= 2000) {
    return {
      formatted: `${km} km`,
      label: 'Moderate',
      description: 'Noticeable haze or mist.',
    };
  }
  return {
    formatted: `${km} km`,
    label: 'Poor',
    description: 'Dense fog or heavy precipitation.',
  };
}

export function getPressureCategory(hPa: number): {
  label: string;
  description: string;
} {
  if (hPa > 1020) {
    return { label: 'High Pressure', description: 'Fair, settled weather.' };
  }
  if (hPa < 1005) {
    return { label: 'Low Pressure', description: 'Stormy or unsettled air.' };
  }
  return { label: 'Normal Pressure', description: 'Stable atmospheric conditions.' };
}
