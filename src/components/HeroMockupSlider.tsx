"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroMockupSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // --- SLAYT 1: Odak Modu (Focus) ---
  const FocusSlide = () => (
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
        <div className="text-3xl">⏱️</div>
        <div>
          <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Odak Modu</div>
          <div className="text-lg font-bold text-text-heading leading-tight">Derin Çalışma</div>
        </div>
      </motion.div>

      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Arka plan halkası */}
          <div className="absolute inset-0 rounded-full border-[10px] border-gray-100"></div>
          {/* İlerleme halkası (Animasyonlu) */}
          <motion.div 
            initial={{ rotate: -90, strokeDasharray: "0 1000" }}
            animate={{ strokeDasharray: "200 1000" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-[10px] border-brand border-t-transparent border-l-transparent rotate-45"
          ></motion.div>
          {/* Süre */}
          <div className="text-4xl font-heading font-extrabold text-text-heading">24<span className="animate-pulse">:</span>59</div>
        </div>
        
        {/* Aktif Ders */}
        <div className="bg-surface px-5 py-3 rounded-xl border border-gray-200 w-full flex justify-between items-center shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Matematik</span>
          <span className="text-sm font-bold text-brand">Limit ve Süreklilik</span>
        </div>
      </div>
    </motion.div>
  );

  // --- SLAYT 2: Net Takibi (Net Tracker) ---
  const NetTrackerSlide = () => (
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
        <div className="text-3xl">📈</div>
        <div>
          <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Son 1 Ay</div>
          <div className="text-lg font-bold text-emerald-500 leading-tight">+12 Net Artış</div>
        </div>
      </motion.div>

      <div className="flex flex-col h-full justify-center gap-4">
        {/* Üst Kartlar */}
        <div className="flex justify-between gap-4">
          <div className="flex-1 bg-surface rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">TYT Neti</div>
            <div className="text-2xl font-extrabold text-text-heading">85<span className="text-lg text-gray-400">.25</span></div>
          </div>
          <div className="flex-1 bg-surface rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">AYT Neti</div>
            <div className="text-2xl font-extrabold text-text-heading">64<span className="text-lg text-gray-400">.50</span></div>
          </div>
        </div>

        {/* Grafik (Sahte Line Chart) */}
        <div className="h-28 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/10 relative overflow-hidden flex items-end px-4 pt-4">
          <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d="M0,80 L20,65 L40,70 L60,40 L80,30 L100,10" 
              fill="none" 
              stroke="#4F46E5" 
              strokeWidth="4" 
              strokeLinejoin="round" 
              strokeLinecap="round" 
            />
            <motion.path 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              d="M0,80 L20,65 L40,70 L60,40 L80,30 L100,10 L100,100 L0,100 Z" 
              fill="#4F46E5" 
              fillOpacity="0.1" 
            />
          </svg>
          {/* Grafik Noktaları */}
          <div className="absolute w-2 h-2 bg-brand rounded-full right-0 top-[10%] shadow-[0_0_10px_#4F46E5]"></div>
        </div>
      </div>
    </motion.div>
  );

  // --- SLAYT 3: Ders Planlama (Planner) ---
  const PlannerSlide = () => (
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
        className="absolute -right-4 bottom-12 bg-gradient-to-r from-brand to-indigo-500 p-3 rounded-2xl shadow-xl shadow-brand/30 text-white flex items-center gap-3 z-20"
      >
        <div className="text-2xl">✨</div>
        <div>
          <div className="text-xs font-medium uppercase opacity-90 tracking-wider">Yapay Zeka</div>
          <div className="text-sm font-bold leading-tight">Haftalık Plan Hazır</div>
        </div>
      </motion.div>

      <div className="flex gap-3 h-full pt-4">
        {/* Kolon 1: Pazartesi */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[11px] text-center font-bold text-gray-400 uppercase tracking-widest">Pzt</div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="bg-brand/10 border border-brand/20 p-2.5 rounded-lg text-brand">
            <div className="text-xs font-bold mb-1">Matematik</div>
            <div className="text-[10px] opacity-70">2 Saat</div>
          </motion.div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-rose-600">
            <div className="text-xs font-bold mb-1">Fizik</div>
            <div className="text-[10px] opacity-70">1.5 Saat</div>
          </motion.div>
        </div>
        {/* Kolon 2: Salı */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[11px] text-center font-bold text-gray-400 uppercase tracking-widest">Sal</div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.3}} className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-600">
            <div className="text-xs font-bold mb-1">Biyoloji</div>
            <div className="text-[10px] opacity-70">2 Saat</div>
          </motion.div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}} className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-600">
            <div className="text-xs font-bold mb-1">Kimya</div>
            <div className="text-[10px] opacity-70">1 Saat</div>
          </motion.div>
        </div>
        {/* Kolon 3: Çarşamba */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[11px] text-center font-bold text-gray-400 uppercase tracking-widest">Çar</div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.5}} className="bg-brand/10 border border-brand/20 p-2.5 rounded-lg text-brand">
            <div className="text-xs font-bold mb-1">Geometri</div>
            <div className="text-[10px] opacity-70">1.5 Saat</div>
          </motion.div>
          <motion.div initial={{y:10, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.6}} className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg text-purple-600">
            <div className="text-xs font-bold mb-1">Türkçe</div>
            <div className="text-[10px] opacity-70">1 Saat</div>
          </motion.div>
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10 pointer-events-none"
      />
      
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 relative h-full w-full overflow-hidden">
        
        {/* Sahte Tarayıcı Başlığı (Sabit) */}
        <div className="absolute top-0 left-0 w-full flex items-center gap-2 p-4 border-b border-gray-100 bg-white z-30">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="mx-auto text-[11px] text-text-muted font-medium bg-surface px-4 py-1.5 rounded-full flex gap-2 items-center transition-all">
            {currentSlide === 0 && "yksyildizi.com/odak"}
            {currentSlide === 1 && "yksyildizi.com/denemeler"}
            {currentSlide === 2 && "yksyildizi.com/program"}
          </div>
        </div>

        {/* Carousel İçeriği (Yumuşak Geçişli) */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && <FocusSlide key="slide0" />}
          {currentSlide === 1 && <NetTrackerSlide key="slide1" />}
          {currentSlide === 2 && <PlannerSlide key="slide2" />}
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
