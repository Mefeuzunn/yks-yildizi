"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, Users, BookOpen, CloudRain, Code, Loader2, 
  Sparkles, Timer, Flame, Shield, ArrowRight, Radio, Volume2
} from 'lucide-react';
import Link from 'next/link';

interface Room {
  id: string;
  name: string;
  theme: string;
  max_capacity: number;
  current_participants: number;
}

export default function CalismaOdalariLobby() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'library' | 'lofi' | 'rain' | 'tech'>('all');

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalStudying = rooms.reduce((acc, r) => acc + (Number(r.current_participants) || 0), 0);

  const getThemeConfig = (theme: string) => {
    switch (theme) {
      case 'library':
        return {
          icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
          emoji: '📚',
          accent: '#10b981',
          glow: 'rgba(16, 185, 129, 0.25)',
          gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
          border: 'rgba(16, 185, 129, 0.3)',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          title: 'Sessiz Kütüphane',
          desc: 'Derin konsantrasyon, fısıltısız çalışma ve saf kütüphane sessizliği.',
          features: ['Sıfır Gürültü', '25/5 Pomodoro', 'Derin Odak']
        };
      case 'lofi':
        return {
          icon: <Headphones className="w-6 h-6 text-purple-400" />,
          emoji: '☕',
          accent: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.25)',
          gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
          border: 'rgba(139, 92, 246, 0.3)',
          badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
          title: 'Lofi Chill Cafe',
          desc: 'Yumuşak lofi beatleri eşliğinde motivasyonu tazeleyen kahve molası ambiyansı.',
          features: ['Lofi Hip Hop', 'Canlı Sohbet', 'Motivasyon']
        };
      case 'rain':
        return {
          icon: <CloudRain className="w-6 h-6 text-sky-400" />,
          emoji: '🌧️',
          accent: '#0ea5e9',
          glow: 'rgba(14, 165, 233, 0.25)',
          gradient: 'from-sky-500/15 via-sky-500/5 to-transparent',
          border: 'rgba(14, 165, 233, 0.3)',
          badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
          title: 'Gece & Yağmur',
          desc: 'Pencereye vuran sakinleştirici yağmur sesleri ve gece çalışma dinginliği.',
          features: ['Doğa Sesleri', 'Stres Azaltıcı', 'Gece Modu']
        };
      case 'tech':
        return {
          icon: <Code className="w-6 h-6 text-amber-400" />,
          emoji: '⚡',
          accent: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.25)',
          gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
          border: 'rgba(245, 158, 11, 0.3)',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          title: 'Sayısal & Maraton',
          desc: 'Zorlu matematik ve fen soru maratonları için tasarlanmış yüksek tempolu oda.',
          features: ['Soru Maratonu', 'Formül Paylaşımı', '50/10 Blok']
        };
      default:
        return {
          icon: <Users className="w-6 h-6 text-indigo-400" />,
          emoji: '👥',
          accent: '#6366f1',
          glow: 'rgba(99, 102, 241, 0.25)',
          gradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
          border: 'rgba(99, 102, 241, 0.3)',
          badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
          title: 'Genel Çalışma',
          desc: 'Tüm branşlardan öğrencilerin birlikte hazırlandığı serbest etüt salonu.',
          features: ['Serbest Etüt', 'Sohbet', 'Pomodoro']
        };
    }
  };

  const filteredRooms = filter === 'all' ? rooms : rooms.filter(r => r.theme === filter);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Sanal çalışma odaları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      {/* Hero Header */}
      <div className="relative mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Canlı Sanal Kütüphane • Study With Me</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Birlikte Çalış, Asla Yalnız Kalma
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Hedefine yürüyen binlerce YKS adayıyla aynı anda odaklan. Dahili Lofi ve yağmur ambiyansı, senkronize Pomodoro sayacı ve sessiz çalışma disiplini seni bekliyor.
            </p>
          </div>

          {/* Quick Live Stats Pill Box */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black text-white">{totalStudying}</div>
                <div className="text-[11px] text-gray-400 font-medium">Odakta Öğrenci</div>
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 min-w-[140px]">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-black text-white">25/5</div>
                <div className="text-[11px] text-gray-400 font-medium">Pomodoro Döngüsü</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 custom-scrollbar">
        {[
          { id: 'all', label: 'Tüm Odalar', emoji: '✨' },
          { id: 'library', label: 'Sessiz Kütüphane', emoji: '📚' },
          { id: 'lofi', label: 'Lofi Chill Cafe', emoji: '☕' },
          { id: 'rain', label: 'Gece & Yağmur', emoji: '🌧️' },
          { id: 'tech', label: 'Sayısal & Maraton', emoji: '⚡' },
        ].map(tab => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <span className="text-sm">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <AnimatePresence mode="popLayout">
          {filteredRooms.map((room, i) => {
            const config = getThemeConfig(room.theme);
            const occupancyPct = Math.min(100, Math.round(((room.current_participants || 0) / (room.max_capacity || 50)) * 100));

            return (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="group relative rounded-3xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/10 hover:border-white/20 transition-all duration-300 p-6 flex flex-col justify-between backdrop-blur-md shadow-xl hover:shadow-2xl overflow-hidden"
              >
                {/* Ambient Card Header Glow */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${config.gradient} pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`} 
                />

                <div className="relative z-10">
                  {/* Top Bar: Icon + Live Occupancy Pill */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.04)', 
                        borderColor: config.border,
                        boxShadow: `0 0 24px ${config.glow}`
                      }}
                    >
                      {config.icon}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm">
                      <span className={`w-2 h-2 rounded-full ${room.current_participants > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                      <span className="text-xs font-bold text-gray-200">
                        {room.current_participants || 0} / {room.max_capacity}
                      </span>
                    </div>
                  </div>

                  {/* Room Title & Theme */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${config.badge}`}>
                        <span>{config.emoji}</span>
                        <span>{config.title}</span>
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-indigo-200 transition-colors">
                      {room.name}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5">
                    {config.desc}
                  </p>

                  {/* Feature Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {config.features.map((feat, fIdx) => (
                      <span 
                        key={fIdx} 
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-gray-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                      <span>Doluluk Oranı</span>
                      <span>%{occupancyPct}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.max(4, occupancyPct)}%`,
                          backgroundColor: config.accent
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <div className="relative z-10 pt-2 border-t border-white/5">
                  <Link href={`/calisma-odalari/${room.id}`} className="no-underline block">
                    <button 
                      type="button"
                      className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-sm border border-white/10 hover:border-transparent transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] cursor-pointer active:scale-[0.99]"
                    >
                      <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Odaya Katıl & Odaklan</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Science & Tip Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
          <Flame className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-base mb-1">
            Study With Me Yöntemi Neden İşe Yarıyor?
          </h4>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Psikolojide <strong className="text-white">Sosyal Kolaylaştırma (Social Facilitation)</strong> olarak adlandırılan ilkeye göre; aynı hedefe koşan diğer öğrencilerle eşzamanlı bir odada bulunmak dikkati dağıtıcı unsurları %43 oranında azaltır ve masada kalma süresini belirgin biçimde uzatır.
          </p>
        </div>
      </div>
    </div>
  );
}
