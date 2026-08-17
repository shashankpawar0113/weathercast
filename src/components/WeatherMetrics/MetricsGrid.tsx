import React from 'react';
import { WindCard } from './WindCard';
import { SunCycleCard } from './SunCycleCard';
import { UVIndexCard } from './UVIndexCard';
import { HumidityCard } from './HumidityCard';
import { PressureCard } from './PressureCard';
import { VisibilityCard } from './VisibilityCard';
import { CloudCoverCard } from './CloudCoverCard';
import { PrecipitationCard } from './PrecipitationCard';
import { Activity } from 'lucide-react';

export const MetricsGrid: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
          <Activity size={16} />
        </div>
        <h2 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Atmospheric Conditions & Metrics
        </h2>
      </div>

      {/* Responsive Bento Grid: 2 cols on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <WindCard />
        <SunCycleCard />
        <UVIndexCard />
        <HumidityCard />
        <PressureCard />
        <VisibilityCard />
        <CloudCoverCard />
        <PrecipitationCard />
      </div>
    </div>
  );
};
