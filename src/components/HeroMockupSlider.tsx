'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bot, LineChart, Headphones, Play, Radio, Volume2 } from 'lucide-react';

export default function HeroMockupSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!document.hidden) {
          setCurrentSlide((prev) => (prev + 1) % 4);
        }
      }, 5500);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (timer) clearInterval(timer);
      } else {
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // --- SLAYT 0: 🔬 3D Simülasyonlar (Doppler & Dalga Fiziği) ---
  const SimulationSlide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 pt-14 px-5 pb-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-1.5">
            <Sparkles size={12} />
            AYT Fizik
          </span>
          <span className="text-xs text-slate-400">Doppler & Dalga Modeli</span>
        </div>
        <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          ● 60 FPS Canlı
        </span>
      </div>

      {/* İnteraktif Dalga Simülasyon Görseli */}
      <div className="relative h-44 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Hareketli Dalga Halkaları */}
        {[0, 1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            animate={{
              scale: [1, 2.8],
              opacity: [0.8, 0],
              x: [-20, 40],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: ring * 0.55,
              ease: 'easeOut',
            }}
            className="absolute w-20 h-20 rounded-full border border-violet-400/50 pointer-events-none"
            style={{
              boxShadow: '0 0 15px rgba(167, 139, 250, 0.25)',
            }}
          />
        ))}

        {/* Ses Kaynağı / Parçacık */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-lg shadow-violet-500/50 flex items-center justify-center text-white text-xs font-bold animate-pulse">
            🔊
          </div>
          <span className="text-[10px] text-violet-300 font-mono mt-1 font-bold">Kaynak: v = 0.6c</span>
        </div>

        {/* Sağ & Sol Frekans Bilgileri */}
        <div className="absolute left-3 bottom-3 text-left">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Gözlemci A (Uzaklaşan)</div>
          <div className="text-xs font-mono font-bold text-rose-400">f' = 320 Hz (Kırmızıya Kayma)</div>
        </div>
        <div className="absolute right-3 bottom-3 text-right">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Gözlemci B (Yaklaşan)</div>
          <div className="text-xs font-mono font-bold text-emerald-400">f' = 640 Hz (Maviye Kayma)</div>
        </div>
      </div>

      {/* Alt Parametre Kontrol Çubuğu */}
      <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Frekans:</span>
          <span className="font-mono text-white font-bold">440 Hz</span>
        </div>
        <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
        </div>
        <span className="text-violet-400 font-semibold cursor-pointer">49 Deneyden 1'i →</span>
      </div>
    </motion.div>
  );

  // --- SLAYT 1: 🤖 AstraTutor Sokratik AI Koçu ---
  const AstraTutorSlide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 pt-14 px-5 pb-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5">
            <Bot size={12} />
            AstraTutor AI
          </span>
          <span className="text-xs text-slate-400">Sokratik Ders Koçu</span>
        </div>
        <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
          ● Gemini 3.5 Flash
        </span>
      </div>

      {/* Chat Mesaj Akışı */}
      <div className="space-y-3 my-auto">
        {/* Öğrenci */}
        <div className="flex justify-end">
          <div className="max-w-[82%] bg-violet-600/30 border border-violet-500/40 rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs text-slate-200">
            Hocam, parabolün tepe noktasında türev neden sıfır olur?
          </div>
        </div>

        {/* AI Yanıtı */}
        <div className="flex justify-start items-start gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
            ✦
          </div>
          <div className="max-w-[85%] bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-slate-300 leading-relaxed shadow-lg">
            <p className="mb-1.5">
              Çünkü türev, bir eğrinin teğetinin eğimidir: <span className="font-mono text-violet-300 bg-violet-950/60 px-1 py-0.5 rounded">m = f'(x)</span>.
            </p>
            <p className="text-slate-400">
              Tepe noktasında çizilen teğet x eksenine paraleldir (yataydır). Yatay doğrunun eğimi nedir?
            </p>
          </div>
        </div>
      </div>

      {/* Alt Sokratik İpucu Çubuğu */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Sesli Dinleme & Formül Çözümü Aktif
        </span>
        <span className="text-indigo-400 font-bold">Soruyu Çöz →</span>
      </div>
    </motion.div>
  );

  // --- SLAYT 2: 📈 Canlı Net Takibi & Hedef ---
  const NetTrackerSlide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 pt-14 px-5 pb-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <LineChart size={12} />
            Net Sihirbazı
          </span>
          <span className="text-xs text-slate-400">Son 30 Günlük İlerleme</span>
        </div>
        <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          +16.75 Net Artış 🚀
        </span>
      </div>

      {/* Net Kartları */}
      <div className="grid grid-cols-2 gap-3 my-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TYT Genel Net</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            104<span className="text-slate-500 text-base">.25</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">↑ Geçen ay: 88.50</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AYT Sayısal Net</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            74<span className="text-slate-500 text-base">.50</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">↑ Geçen ay: 62.00</div>
        </div>
      </div>

      {/* Neon SVG Çizgi Grafiği */}
      <div className="relative h-20 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-end px-3 pb-2">
        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="netGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            d="M0,85 L15,75 L30,70 L50,55 L70,40 L85,25 L100,10"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M0,85 L15,75 L30,70 L50,55 L70,40 L85,25 L100,10 L100,100 L0,100 Z"
            fill="url(#netGrad)"
          />
        </svg>
        <div className="relative z-10 w-full flex justify-between text-[10px] text-slate-500 font-mono">
          <span>1. Deneme</span>
          <span>5. Deneme</span>
          <span>10. Deneme</span>
          <span className="text-emerald-400 font-bold">15. Deneme</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>Hedef: <strong className="text-white">İTÜ Bilgisayar Mühendisliği</strong></span>
        <span className="text-emerald-400 font-semibold">Tebrikler, Barajı Aştın! 🏆</span>
      </div>
    </motion.div>
  );

  // --- SLAYT 3: 🎧 Canlı Çalışma Odaları & Pomodoro ---
  const StudyRoomSlide = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 pt-14 px-5 pb-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Headphones size={12} />
            Lofi Chill Cafe
          </span>
          <span className="text-xs text-slate-400">Canlı Çalışma Odası</span>
        </div>
        <span className="text-xs text-rose-400 font-mono flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          142 Öğrenci Odakta
        </span>
      </div>

      {/* Dairesel Pomodoro Sayacı ve Ambiyans */}
      <div className="flex items-center justify-center gap-6 my-auto">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <motion.div
            initial={{ rotate: -90 }}
            className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent border-l-transparent rotate-45"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.4))',
            }}
          />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              24<span className="text-amber-400 animate-pulse">:</span>59
            </div>
            <div className="text-[10px] text-amber-300 uppercase tracking-widest font-bold mt-0.5">
              ODAKLANDIN
            </div>
          </div>
        </div>

        {/* Canlı Katılımcılar & Müzik Çubuğu */}
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Volume2 size={11} className="text-amber-400" /> Dahili Web Audio Ambiyansı
            </div>
            <div className="font-semibold text-slate-200">Hafif Gece Yağmuru & Lofi</div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold border border-slate-900">E</div>
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold border border-slate-900">M</div>
              <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold border border-slate-900">A</div>
            </div>
            <span className="text-[11px] text-slate-400">+139 kişi şu an çalışıyor</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400">Web Ses Sentezleyicisi (0 Gecikme)</span>
        <span className="text-amber-400 font-bold">Odaya Katıl 🎧</span>
      </div>
    </motion.div>
  );

  return (
    <div className="relative h-[380px] md:h-[410px] w-full max-w-lg mx-auto">
      {/* Arka Plan Radial Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -z-10 pointer-events-none"
      />

      {/* macOS Dark Window Container */}
      <div className="bg-slate-950/90 rounded-2xl shadow-2xl shadow-black/80 border border-slate-800/90 backdrop-blur-xl relative h-full w-full overflow-hidden">
        {/* macOS Style Window Top Bar */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/70 z-30">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-slate-950/70 border border-slate-800/80 px-4 py-1 rounded-full flex gap-2 items-center">
            <span className="text-emerald-400">🔒</span>
            {currentSlide === 0 && 'yksyildizi.com/simulasyonlar/doppler'}
            {currentSlide === 1 && 'yksyildizi.com/astratutor-ai'}
            {currentSlide === 2 && 'yksyildizi.com/denemeler/analiz'}
            {currentSlide === 3 && 'yksyildizi.com/calisma-odalari/lofi'}
          </div>

          <div className="w-12 text-right">
            <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
          </div>
        </div>

        {/* Carousel Content */}
        <AnimatePresence mode="wait">
          {currentSlide === 0 && <SimulationSlide key="sim" />}
          {currentSlide === 1 && <AstraTutorSlide key="ai" />}
          {currentSlide === 2 && <NetTrackerSlide key="net" />}
          {currentSlide === 3 && <StudyRoomSlide key="room" />}
        </AnimatePresence>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'bg-violet-400 w-6' : 'bg-slate-700 w-2 hover:bg-slate-500'
              }`}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
