"use client";

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { haptics } from '@/lib/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  enableHaptics?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  enableHaptics = true,
  className = '',
  onClick,
  ...props
}, ref) => {

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (enableHaptics) {
      haptics.impact('light');
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Base layout styles
  const baseClasses = "relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  // Size styles
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[32px]",
    md: "px-4 py-2.5 text-sm gap-2 min-h-[42px]",
    lg: "px-6 py-3.5 text-base gap-2.5 min-h-[50px] rounded-2xl",
  }[size];

  // Variant styles
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-white/10 hover:brightness-110",
    secondary: "bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 hover:text-white border border-white/10 backdrop-blur-md",
    glass: "bg-white/[0.035] hover:bg-white/[0.08] text-gray-200 hover:text-white border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg",
    outline: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-white/20 hover:border-white/40",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-transparent",
    danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:brightness-110 border border-rose-500/20",
  }[variant];

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
