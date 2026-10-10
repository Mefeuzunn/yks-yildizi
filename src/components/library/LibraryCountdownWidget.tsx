"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Target, Flame, ChevronDown, ChevronUp, Sparkles, Trophy } from 'lucide-react';
import { calculateYksCountdown, getYksTargetDate } from '@/lib/yks-countdown';
import { haptics } from '@/lib/haptics';

interface LibraryCountdownWidgetProps {
  userTarget?: string;
  userGrade?: string | number;
  className?: string;
  onOpenQuests?: () => void;
  unclaimedQuestsCount?: number;
}

export default function LibraryCountdownWidget({
  userTarget = 'YKS 2026',
  userGrade,
  className = '',
  onOpenQuests,
  unclaimedQuestsCount = 0,
}: LibraryCountdownWidgetProps) {
  const [countdown, setCountdown] = useState(() => calculateYksCountdown(getYksTargetDate(userGrade)));
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const targetDate = getYksTargetDate(userGrade);
    setCountdown(calculateYksCountdown(targetDate));

    const interval = setInterval(() => {
      setCountdown(calculateYksCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [userGrade]);

  return (
    <div className={`w-full max-w-5xl mb-4 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl bg-[#0f172a]/80 border border-white/10 backdrop-blur-md px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg flex flex-col gap-2">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-40 h-10 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Main Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Countdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gray-300">YKS Sayaç:</span>
              <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-black text-amber-300">
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-white">
                  {countdown.days} <span className="text-[10px] text-amber-400 font-sans font-bold">G</span>
                </span>
                <span className="text-gray-500">:</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-white">
                  {String(countdown.hours).padStart(2, '0')} <span className="text-[10px] text-amber-400 font-sans font-bold">S</span>
                </span>
                <span className="text-gray-500">:</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-white">
                  {String(countdown.minutes).padStart(2, '0')} <span className="text-[10px] text-amber-400 font-sans font-bold">D</span>
                </span>
                <span className="text-gray-500">:</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-white">
                  {String(countdown.seconds).padStart(2, '0')} <span className="text-[10px] text-amber-400 font-sans font-bold">SN</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Target Badge & Quests Shortcut */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* User Target Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-gray-300">
              <Target size={13} className="text-sky-400" />
              <span className="text-white font-bold">{userTarget}</span>
            </div>

            {/* Quests Button */}
            {onOpenQuests && (
              <button
                onClick={() => {
                  haptics.impact('light');
                  onOpenQuests();
                }}
                className="relative flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Trophy size={13} />
                <span>Görevler</span>
                {unclaimedQuestsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            )}

            {/* Expand Details Toggle */}
            <button
              onClick={() => {
                haptics.selection();
                setIsExpanded(prev => !prev);
              }}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Sınav takvimini göster/gizle"
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Expanded Info Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden pt-2 border-t border-white/5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-200 block">TYT 2026 Oturumu</span>
                    <span className="text-[11px] text-gray-400">20 Haziran 2026 · 10:15</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-200 block">AYT 2026 Oturumu</span>
                    <span className="text-[11px] text-gray-400">21 Haziran 2026 · 10:15</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400 shrink-0" />
                  <div className="text-[11px] text-emerald-300 font-medium leading-tight">
                    Her Pomodoro seansı netlerini artırır, istikrarını koru!
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
