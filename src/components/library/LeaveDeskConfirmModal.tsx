"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, LogOut, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface LeaveDeskConfirmModalProps {
  isOpen: boolean;
  type: 'leave' | 'switch';
  currentSeatId: string | null;
  targetSeatId?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LeaveDeskConfirmModal({
  isOpen,
  type,
  currentSeatId,
  targetSeatId,
  onConfirm,
  onCancel,
}: LeaveDeskConfirmModalProps) {
  if (!isOpen) return null;

  const formatSeatLabel = (seatId: string | null) => {
    if (!seatId) return 'Bilinmeyen Masa';
    return seatId.replace('t', 'Masa ').replace('-s', ' / Koltuk ');
  };

  const isLeave = type === 'leave';

  const handleConfirm = () => {
    haptics.impact('medium');
    onConfirm();
  };

  const handleCancel = () => {
    haptics.impact('light');
    onCancel();
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={handleCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm rounded-3xl bg-[#0b101b] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Top Decorative Atmosphere Glow */}
          <div className={`absolute top-0 left-0 right-0 h-28 pointer-events-none bg-gradient-to-b ${
            isLeave 
              ? 'from-amber-500/20 via-rose-500/10 to-transparent' 
              : 'from-sky-500/20 via-indigo-500/10 to-transparent'
          }`} />

          <div className="relative p-6 flex flex-col items-center text-center">
            {/* Modal Icon Badge */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg border ${
              isLeave
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
            }`}>
              {isLeave ? <LogOut className="w-7 h-7" /> : <ArrowRight className="w-7 h-7" />}
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-lg font-black text-white">
              {isLeave ? 'Masadan Kalkmak İstiyor Musun?' : 'Masa Değiştirmek İstiyor Musun?'}
            </h3>

            {/* Seat Flow Pill */}
            <div className="my-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2">
              <span className="font-bold text-white">{formatSeatLabel(currentSeatId)}</span>
              {!isLeave && targetSeatId && (
                <>
                  <ArrowRight size={12} className="text-sky-400" />
                  <span className="font-extrabold text-sky-300">{formatSeatLabel(targetSeatId)}</span>
                </>
              )}
            </div>

            {/* Explanatory Message */}
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mb-6">
              {isLeave
                ? 'Şu anda aktif odaklanma seansındasın. Masadan kalktığında masa lamban sönecek ve salonda ayakta (izleyici) moduna geçeceksin.'
                : 'Şu anki masandan kalkıp yeni masaya geçmek üzeresin. Odaklanma süren ve seansın yeni masanda kesintisiz devam edecek.'}
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {isLeave ? (
                <>
                  {/* Cancel / Keep Studying (Prominent) */}
                  <button
                    onClick={handleCancel}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check size={16} className="stroke-[3]" />
                    <span>Hayır, Çalışmaya Devam Et</span>
                  </button>

                  {/* Confirm Leave (Subtle / Danger) */}
                  <button
                    onClick={handleConfirm}
                    className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Evet, Masadan Kalk</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Confirm Switch */}
                  <button
                    onClick={handleConfirm}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={16} />
                    <span>Evet, Yeni Masaya Geç</span>
                  </button>

                  {/* Keep Current Desk */}
                  <button
                    onClick={handleCancel}
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold active:scale-98 transition-all cursor-pointer"
                  >
                    Mevcut Masada Kal
                  </button>
                </>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
