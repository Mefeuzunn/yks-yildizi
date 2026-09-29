"use client";

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'league' | 'status' | 'pill';
  leagueTier?: 'bronz' | 'gumus' | 'altin' | 'platin' | 'elmas' | 'sampiyon';
  status?: 'active' | 'pending' | 'idle' | 'danger';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  leagueTier = 'altin',
  status = 'active',
  pulse = false,
  className = '',
  ...props
}) => {

  if (variant === 'league') {
    const tierStyles = {
      bronz: 'bg-amber-900/20 text-amber-500 border-amber-800/40',
      gumus: 'bg-slate-300/15 text-slate-200 border-slate-300/30',
      altin: 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
      platin: 'bg-teal-400/20 text-teal-300 border-teal-400/40 shadow-[0_0_12px_rgba(45,212,191,0.2)]',
      elmas: 'bg-sky-400/20 text-sky-300 border-sky-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]',
      sampiyon: 'bg-purple-500/25 text-purple-200 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    }[leagueTier];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${tierStyles} ${className}`}
        {...props}
      >
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
        {children}
      </span>
    );
  }

  if (variant === 'status') {
    const statusStyles = {
      active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      idle: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
      danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    }[status];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles} ${className}`}
        {...props}
      >
        {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold ${className}`}
      {...props}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />}
      {children}
    </span>
  );
};
