import React from 'react';

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Weather Skeleton */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 flex items-baseline space-x-4">
            <div className="h-24 w-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>
          <div className="md:col-span-5 flex justify-end">
            <div className="h-28 w-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Hourly Skeleton */}
      <div className="glass-card p-6 space-y-4">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="flex space-x-3 overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 w-24 flex-shrink-0 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Middle Grid Skeleton: Chart & 7-Day */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 glass-card p-6 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="lg:col-span-5 glass-card p-6 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>

      {/* Metrics Bento Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-40 glass-card bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        ))}
      </div>
    </div>
  );
};
