"use client";

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatWidgetProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'purple' | 'emerald' | 'amber' | 'sky' | 'rose';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  color = 'indigo',
  trend,
  trendValue,
  className = '',
}) => {

  const colorStyles = {
    indigo: {
      bg: 'bg-indigo-500/15',
      border: 'border-indigo-500/25',
      text: 'text-indigo-400',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    },
    purple: {
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/25',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    },
    emerald: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/25',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    amber: {
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    sky: {
      bg: 'bg-sky-500/15',
      border: 'border-sky-500/25',
      text: 'text-sky-400',
      glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]',
    },
    rose: {
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/25',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
  }[color];

  return (
    <div className={`p-5 rounded-2xl bg-white/[0.035] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 backdrop-blur-xl transition-all duration-300 shadow-xl flex items-center justify-between gap-4 group ${colorStyles.glow} ${className}`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</span>
          {subValue && <span className="text-xs font-medium text-gray-400">{subValue}</span>}
        </div>

        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-1 text-[11px] font-bold">
            {trend === 'up' && (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {trendValue}
              </span>
            )}
            {trend === 'down' && (
              <span className="text-rose-400 flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> {trendValue}
              </span>
            )}
            {trend === 'neutral' && (
              <span className="text-gray-400 flex items-center gap-0.5">
                <Minus className="w-3 h-3" /> {trendValue}
              </span>
            )}
          </div>
        )}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${colorStyles.bg} ${colorStyles.border} ${colorStyles.text}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
