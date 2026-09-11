"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroMockupSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4500); // Her 4.5 saniyede bir değişecek
    return () => clearInterval(timer);
  }, []);

  // --- SLAYT 1: Analiz ve Seri (Orijinal Tasarım) ---
  const AnalyticsSlide = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pt-16 px-6 pb-6 flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="absolute -right-4 top-1/4 bg-[#FFFFFF] p-4 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-3 z-20"
      >
        <div className="text-3xl">🔥</div>
        <div>
          <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Günlük Seri</div>
          <div className="text-lg font-bold text-text-heading leading-tight">12. Gün</div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="h-32 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/10 p-4 flex flex-col justify-end">
          <div className="flex justify-between items-end gap-3 h-full">
            {[40, 60, 30, 80, 100, 50, 70].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: "0%" }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: 0.1 + (i * 0.1), ease: "easeOut" }}
                className={`w-full rounded-t-md ${i === 4 ? 'bg-brand' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 h-24">
          <div className="bg-surface rounded-xl border border-gray-100 p-4"></div>
          <div className="bg-surface rounded-xl border border-gray-100 p-4"></div>
        </div>
      </div>
    </motion.div>
  );

  // --- SLAYT 2: 3D Simülasyon ---
  const SimulationSlide = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pt-16 px-6 pb-8 flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="absolute -left-4 top-1/4 bg-[#FFFFFF] p-4 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-3 z-20"
      >
        <div className="text-3xl">⚛️</div>
        <div>
          <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Simülasyon</div>
          <div className="text-lg font-bold text-text-heading leading-tight">Manyetizma</div>
        </div>
      </motion.div>

      <div className="h-full w-full bg-[#0b0f19] rounded-xl border border-slate-700 overflow-hidden relative flex items-center justify-center shadow-inner">
        {/* CSS tabanlı yapay 3D illüzyon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-4 border-dashed border-sky-400 opacity-30 absolute"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full border border-brand opacity-80 absolute flex items-center justify-center"
        >
          <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_20px_#38bdf8]" />
        </motion.div>
        
        {/* Arka plan grid deseni */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>
    </motion.div>
  );

  // --- SLAYT 3: Oyunlaştırma (Sıralama Ligi) ---
  const LeaderboardSlide = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pt-16 px-6 pb-6 flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
        className="absolute -right-4 bottom-12 bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-2xl shadow-xl shadow-orange-500/30 text-white flex items-center gap-3 z-20"
      >
        <div className="text-2xl">🏆</div>
        <div>
          <div className="text-xs font-medium uppercase opacity-90 tracking-wider">Lig Atlattın!</div>
          <div className="text-sm font-bold leading-tight">Platin Ligi</div>
        </div>
      </motion.div>

      <div className="space-y-3 h-full flex flex-col justify-center">
        {/* 1. Sıra */}
        <div className="bg-surface rounded-xl border border-amber-200 p-3 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-100/50"></div>
          <div className="relative z-10 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center font-bold text-white text-sm">1</div>
          <div className="relative z-10 flex-1">
            <div className="h-2 w-24 bg-gray-300 rounded-full mb-2"></div>
            <div className="h-1.5 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="relative z-10 text-amber-600 font-bold text-sm">2400 XP</div>
        </div>
        {/* 2. Sıra */}
        <div className="bg-surface rounded-xl border border-gray-100 p-3 flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">2</div>
          <div className="flex-1">
            <div className="h-2 w-32 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-1.5 w-20 bg-gray-100 rounded-full"></div>
          </div>
          <div className="text-gray-400 font-bold text-sm">2150 XP</div>
        </div>
        {/* 3. Sıra */}
        <div className="bg-surface rounded-xl border border-gray-100 p-3 flex items-center gap-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-700 text-sm">3</div>
          <div className="flex-1">
            <div className="h-2 w-20 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-1.5 w-12 bg-gray-100 rounded-full"></div>
          </div>
          <div className="text-gray-400 font-bold text-sm">1980 XP</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="relative h-[360px] md:h-[400px] w-full max-w-md mx-auto">
      {/* Arka Plan Parlaması */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10"
      />
      
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 relative h-full w-full overflow-hidden">
        
        {/* Sahte Tarayıcı Başlığı (Sabit) */}
        <div className="absolute top-0 left-0 w-full flex items-center gap-2 p-4 border-b border-gray-100 bg-white z-30">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="mx-auto text-[11px] text-text-muted font-medium bg-surface px-4 py-1.5 rounded-full flex gap-2 items-center">
            {currentSlide === 0 && "yksyildizi.com/analiz"}
            {currentSlide === 1 && "yksyildizi.com/simulasyon"}
            {currentSlide === 2 && "yksyildizi.com/ligler"}
          </div>
        </div>

        {/* Carousel İçeriği (Yumuşak Geçişli) */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && <AnalyticsSlide key="slide0" />}
          {currentSlide === 1 && <SimulationSlide key="slide1" />}
          {currentSlide === 2 && <LeaderboardSlide key="slide2" />}
        </AnimatePresence>

        {/* Carousel Noktaları */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-brand w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
