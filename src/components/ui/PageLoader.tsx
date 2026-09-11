import React from 'react';
import { Utensils } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center animate-pulse">
          <Utensils className="w-7 h-7 text-amber-600 animate-bounce" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-semibold text-slate-800 tracking-tight">Loading CampusBites</p>
        <p className="text-xs text-slate-400 mt-0.5">Fetching campus meals & fresh updates...</p>
      </div>

      {/* Quick lightweight skeleton mockup */}
      <div className="w-full max-w-4xl mt-8 space-y-4 opacity-40">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-44 bg-slate-200 rounded-2xl animate-pulse hidden sm:block" />
          <div className="h-44 bg-slate-200 rounded-2xl animate-pulse hidden md:block" />
        </div>
      </div>
    </div>
  );
};
