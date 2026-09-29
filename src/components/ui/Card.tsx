"use client";

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'elevated' | 'outline' | 'gradient';
  glow?: 'none' | 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'glass',
  glow = 'none',
  hoverable = false,
  className = '',
  ...props
}, ref) => {

  const variantStyles = {
    glass: "bg-white/[0.035] border border-white/10 backdrop-blur-xl shadow-xl",
    elevated: "bg-[#0f172a]/90 border border-white/15 shadow-2xl backdrop-blur-2xl",
    outline: "bg-transparent border border-white/15",
    gradient: "bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent border border-white/15 shadow-xl backdrop-blur-xl",
  }[variant];

  const glowStyles = {
    none: "",
    indigo: "shadow-[0_0_35px_rgba(99,102,241,0.18)] hover:shadow-[0_0_45px_rgba(99,102,241,0.3)]",
    purple: "shadow-[0_0_35px_rgba(139,92,246,0.18)] hover:shadow-[0_0_45px_rgba(139,92,246,0.3)]",
    emerald: "shadow-[0_0_35px_rgba(16,185,129,0.18)] hover:shadow-[0_0_45px_rgba(16,185,129,0.3)]",
    amber: "shadow-[0_0_35px_rgba(245,158,11,0.18)] hover:shadow-[0_0_45px_rgba(245,158,11,0.3)]",
    rose: "shadow-[0_0_35px_rgba(244,63,94,0.18)] hover:shadow-[0_0_45px_rgba(244,63,94,0.3)]",
  }[glow];

  const hoverStyles = hoverable 
    ? "transition-all duration-300 hover:scale-[1.01] hover:border-white/25 cursor-pointer" 
    : "";

  return (
    <div
      ref={ref}
      className={`rounded-3xl p-6 relative overflow-hidden ${variantStyles} ${glowStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
