"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coffee, Heart, Play, X, Wind, Brain } from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { libraryAudio } from '@/lib/library-audio';

interface FatigueAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBreak: () => void;
  focusMinutes: number;
}

export default function FatigueAlertModal({
  isOpen,
  onClose,
  onStartBreak,
  focusMinutes = 75,
}: FatigueAlertModalProps) {
  const [breathingStep, setBreathingStep] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathCount, setBreathCount] = useState(4);

  // 4-7-8 Breathing Guide Engine
  useEffect(() => {
    if (breathingStep === 'idle') return;

    let timer: NodeJS.Timeout;
    if (breathingStep === 'inhale') {
      setBreathCount(4);
      timer = setTimeout(() => setBreathingStep('hold'), 4000);
    } else if (breathingStep === 'hold') {
      setBreathCount(7);
      timer = setTimeout(() => setBreathingStep('exhale'), 7000);
    } else if (breathingStep === 'exhale') {
      setBreathCount(8);
      timer = setTimeout(() => setBreathingStep('inhale'), 8000);
    }

    return () => clearTimeout(timer);
  }, [breathingStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-[#0b0f19] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col text-center"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            haptics.impact('light');
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
          <Brain className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-white">
          Zihnini Taze Tut: {focusMinutes} Dk Odak
        </h3>
        <p className="text-xs text-gray-300 mt-1.5 leading-relaxed px-2">
          Aralıksız yüksek verimle çalıştın! Nörobilimsel araştırmalar, 75 dakikayı aşan seanslarda verilen 5 dakikalık kısa molaların bilgiyi uzun süreli hafızaya 2 kat daha hızlı kodladığını gösteriyor.
        </p>

        {/* 4-7-8 Breathing Tool Interactive Section */}
        {breathingStep !== 'idle' ? (
          <div className="my-5 p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{
                scale: breathingStep === 'inhale' ? 1.3 : breathingStep === 'hold' ? 1.3 : 1,
              }}
              transition={{
                duration: breathingStep === 'inhale' ? 4 : breathingStep === 'hold' ? 0 : 8,
                ease: 'easeInOut',
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-500/30 to-teal-500/30 border border-indigo-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              <Wind className="w-8 h-8 text-sky-300" />
            </motion.div>

            <div className="text-sm font-black text-white tracking-wide">
              {breathingStep === 'inhale' && 'Nefes Al (4 sn)...'}
              {breathingStep === 'hold' && 'Nefesi Tut (7 sn)...'}
              {breathingStep === 'exhale' && 'Yavaşça Ver (8 sn)...'}
            </div>
            <p className="text-[11px] text-gray-400">
              Omuzlarını gevşet ve gözlerini dinlendir.
            </p>
          </div>
        ) : (
          <div className="my-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-around text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              <span className="text-base">☕</span>
              <span>Kısa Kahve & Çay</span>
            </div>
            <span className="text-gray-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base">👀</span>
              <span>Göz Dinlendirme</span>
            </div>
            <span className="text-gray-600">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-base">🧘</span>
              <span>Derin Nefes</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={() => {
              haptics.notification('success');
              libraryAudio.playCoffee();
              onStartBreak();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Coffee size={15} />
            <span>5 Dakika Mola Başlat</span>
          </button>

          {breathingStep === 'idle' ? (
            <button
              onClick={() => {
                haptics.impact('light');
                setBreathingStep('inhale');
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sky-300 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wind size={15} />
              <span>4-7-8 Nefes Egzersizi Yap</span>
            </button>
          ) : (
            <button
              onClick={() => setBreathingStep('idle')}
              className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-medium cursor-pointer"
            >
              Egzersizi Bitir
            </button>
          )}

          <button
            onClick={() => {
              haptics.impact('light');
              onClose();
            }}
            className="text-xs text-gray-500 hover:text-gray-300 mt-1 transition-colors cursor-pointer"
          >
            Harikayım, Kesintisiz Devam Et
          </button>
        </div>
      </motion.div>
    </div>
  );
}
