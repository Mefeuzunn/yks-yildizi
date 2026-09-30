'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mountain, RefreshCw, Sparkles, BookOpen, 
  HelpCircle, ArrowLeft, CheckCircle2, XCircle, Compass, Eye
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function IzohipsHaritasiSimulation() {
  // Simülasyon Parametreleri
  const [esYukseltiAraligi, setEsYukseltiAraligi] = useState<number>(50); // delta_h (20, 50, 100m)
  const [seciliYerSekli, setSeciliYerSekli] = useState<'hepsi' | 'tepe' | 'vadi' | 'sirt' | 'cukur' | 'falez'>('hepsi');
  const [profilHattiY, setProfilHattiY] = useState<number>(140); // A-B kesit hattının Y konumu (80 - 200)

  // Sekmeler
  const [activeTab, setActiveTab] = useState<'simulasyon' | 'rehber' | 'sorular'>('simulasyon');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number | null }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Profil Çıkarma Hesaplaması (A-B doğrultusu boyunca yükseklik haritası)
  // X = 40'tan X = 460'a kadar zemin profili
  const profilNoktalari = useMemo(() => {
    const points: { x: number; y: number; h: number }[] = [];
    const step = 8;
    for (let x = 40; x <= 460; x += step) {
      // Yükseklik Fonksiyonu: Tepe 1 (x: 160, y: 130, h: 4*esYukseltiAraligi),
      // Tepe 2 (x: 360, y: 130, h: 3*esYukseltiAraligi),
      // Vadi (x: 260, y: 150), Falez (kıyı x: 420-450)
      const d1 = Math.hypot(x - 160, profilHattiY - 130);
      const d2 = Math.hypot(x - 360, profilHattiY - 130);
      const dVadi = Math.abs(x - 260);

      // Gaussian tepe 1
      const h1 = Math.max(0, 4.2 * esYukseltiAraligi * Math.exp(-(d1 * d1) / 4500));
      // Gaussian tepe 2 (Boyun ile ayrılan diğer tepe)
      const h2 = Math.max(0, 3.2 * esYukseltiAraligi * Math.exp(-(d2 * d2) / 3800));

      // Vadi çentiği
      const vadiIndirme = Math.max(0, 0.8 * esYukseltiAraligi * Math.exp(-(dVadi * dVadi) / 900));

      let h = Math.max(0, h1 + h2 - vadiIndirme);

      // Deniz seviyesi sınırı
      if (x > 430) {
        h = Math.max(0, h * (1 - (x - 430) / 30));
      }

      points.push({ x, y: profilHattiY, h: Math.round(h) });
    }
    return points;
  }, [profilHattiY, esYukseltiAraligi]);

  const maxH = Math.max(...profilNoktalari.map(p => p.h), esYukseltiAraligi * 4);

  const resetHarita = () => {
    triggerHaptic('light');
    setEsYukseltiAraligi(50);
    setSeciliYerSekli('hepsi');
    setProfilHattiY(140);
  };

  const QUIZ_QUESTIONS = [
    {
      q: "Bir izohips haritasında eş yükselti eğrilerinin birbirine çok yaklaştığı (sıklaştığı) bir bölge için aşağıdakilerden hangisi KESİNLİKLE doğrudur?",
      options: [
        "Eğim ve akarsu akış hızı fazladır",
        "Bölgenin mutlak yükseltisi sıfırdır",
        "Kapalı çukur (krater) bulunmaktadır",
        "Bölgede heyelan ve erozyon riski en azdır"
      ],
      correct: 0,
      exp: "İzohipslerin sıklaştığı yerlerde eğim fazladır. Eğim arttıkça akarsuların akış hızı, aşındırma gücü ve hidroelektrik potansiyeli artar; dağcılık zorlaşır, yol yapım maliyeti yükselir."
    },
    {
      q: "Bir akarsu vadisinde izohips eğrileri akarsuyun geçtiği yerlerde 'V' şeklinde bükülür. Bu 'V' harfinin sivri ucu nereyi gösterir?",
      options: [
        "Akarsuyun döküldüğü denizi veya gölü (Aşağı çığır)",
        "Yükseltinin arttığı kaynağı (Yukarı çığır)",
        "Batı yönünü",
        "Rüzgarın esiş doğrultusunu"
      ],
      correct: 1,
      exp: "Vadilerde izohipsler 'V' şeklinde girinti yapar ve 'V'nin sivri ucu her zaman yükseltinin ARTTIĞI kaynağı (yukarı çığırı) gösterir. Sırtlarda ise 'V'nin sivri ucu yükseltinin azaldığı yönü gösterir."
    },
    {
      q: "İç içe kapalı izohips eğrilerinin üzerinde merkeze doğru içe bakan ok işaretleri (▶) varsa bu yer şekli nedir?",
      options: [
        "Falez (Yalıyar)",
        "Kapalı Çukur (Çanak / Krater / Kaldera)",
        "Plato",
        "Delta Ovası"
      ],
      correct: 1,
      exp: "İçe doğru ok işaretleri kapalı çukurları (krater, obruk, kaldera vb.) gösterir. Okların başladığı eğriden bittiği eğriye kadar yükselti, eş yükselti aralığı kadar azalır."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Üst Navigasyon & Başlık */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/simulasyonlar"
              onClick={() => triggerHaptic('light')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                  TYT Coğrafya / Matematik
                </span>
                <span className="text-xs text-slate-400">Harita Bilgisi & Topoğrafya</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                İzohips Haritası & Canlı Profil Kesiti Simülatörü 🗺️
              </h1>
            </div>
          </div>

          {/* Sekme Seçiciler */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('simulasyon'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'simulasyon'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 Topoğrafya Haritası
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('rehber'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rehber'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 YKS Konu Özeti
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('sorular'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sorular'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎯 Soru Çözümü (3)
            </button>
          </div>
        </div>

        {/* ─── TAB 1: SİMÜLASYON ─── */}
        {activeTab === 'simulasyon' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Sol: 2 Kolonluk İzohips Haritası ve Profil Grafiği */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* 1. 2D İzohips Haritası */}
              <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Compass size={14} className="text-amber-400" />
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      2D İzohips Topoğrafya Haritası (Δh = {esYukseltiAraligi}m)
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">Kuzey ↑</span>
                </div>

                {/* SVG İzohips Çizimi */}
                <div className="w-full flex items-center justify-center">
                  <svg viewBox="0 0 500 280" className="w-full max-w-[500px] h-auto bg-[#0a1120] rounded-xl border border-slate-800">
                    {/* Deniz Alanı (Sağ kenar) */}
                    <path d="M430,0 L500,0 L500,280 L430,280 Z" fill="#0369a1" opacity="0.35" />
                    <text x="465" y="140" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle" transform="rotate(90 465 140)">
                      KARADENİZ (0m)
                    </text>

                    {/* Kıyı Çizgisi (0m İzohipsi) */}
                    <path d="M430,0 Q425,140 430,280" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                    <text x="415" y="20" fill="#38bdf8" fontSize="9" fontWeight="bold">0m</text>

                    {/* TEPE 1 (Sol Tepe: Zirve ~200m) */}
                    {/* 1. Eğri: 50m */}
                    <ellipse cx="160" cy="130" rx="100" ry="85" fill="none" stroke="#78716c" strokeWidth="1.5" />
                    <text x="75" y="130" fill="#a8a29e" fontSize="8" fontWeight="bold">{esYukseltiAraligi}m</text>

                    {/* 2. Eğri: 100m */}
                    <ellipse cx="160" cy="130" rx="75" ry="60" fill="none" stroke="#a8a29e" strokeWidth="1.5" />
                    <text x="100" y="130" fill="#a8a29e" fontSize="8" fontWeight="bold">{esYukseltiAraligi * 2}m</text>

                    {/* 3. Eğri: 150m */}
                    <ellipse cx="160" cy="130" rx="50" ry="40" fill="none" stroke="#d6d3d1" strokeWidth="1.5" />
                    <text x="125" y="130" fill="#d6d3d1" fontSize="8" fontWeight="bold">{esYukseltiAraligi * 3}m</text>

                    {/* 4. Eğri: 200m (Zirve Noktası ▲) */}
                    <ellipse cx="160" cy="130" rx="25" ry="20" fill="none" stroke="#f5f5f4" strokeWidth="2" />
                    <text x="160" y="133" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">▲ {esYukseltiAraligi * 4}m</text>
                    <text x="160" y="148" fill="#fbbf24" fontSize="8" textAnchor="middle">Sivri Tepe</text>

                    {/* TEPE 2 (Sağ Tepe: ~150m) */}
                    <ellipse cx="360" cy="130" rx="65" ry="55" fill="none" stroke="#78716c" strokeWidth="1.5" />
                    <ellipse cx="360" cy="130" rx="42" ry="35" fill="none" stroke="#a8a29e" strokeWidth="1.5" />
                    <ellipse cx="360" cy="130" rx="20" ry="16" fill="none" stroke="#f5f5f4" strokeWidth="2" />
                    <text x="360" y="133" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">▲ {esYukseltiAraligi * 3}m</text>
                    <text x="360" y="146" fill="#f59e0b" fontSize="8" textAnchor="middle">Doğu Tepesi</text>

                    {/* BOYUN (İki Tepe Arasındaki Düzlük: x: 260, y: 130) */}
                    <rect x="245" y="115" width="30" height="30" rx="6" fill="#fbbf24" fillOpacity="0.1" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="260" y="125" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle">Boyun</text>

                    {/* VADİ & AKARSU (Yukarıdan aşağıya doğru V yapan akarsu) */}
                    <path
                      d="M260,10 Q255,80 260,130 Q270,190 265,270"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                    <text x="280" y="50" fill="#06b6d4" fontSize="8" fontWeight="bold">← Akarsu (Vadi)</text>
                    <text x="280" y="240" fill="#06b6d4" fontSize="7">Akış yönü ↓</text>

                    {/* FALEZ (Deniz Kıyısında Eğrilerin Sıklaştığı Yer: x: 420-430) */}
                    <g transform="translate(420, 180)">
                      <line x1="0" y1="0" x2="8" y2="0" stroke="#f43f5e" strokeWidth="1.5" />
                      <line x1="0" y1="8" x2="8" y2="8" stroke="#f43f5e" strokeWidth="1.5" />
                      <line x1="0" y1="16" x2="8" y2="16" stroke="#f43f5e" strokeWidth="1.5" />
                      <text x="-4" y="28" fill="#fb7185" fontSize="8" fontWeight="bold">Falez (Yalıyar)</text>
                    </g>

                    {/* HAREKETLİ KESİT HATTI: A - B DOĞRULTUSU */}
                    <line
                      x1="40"
                      y1={profilHattiY}
                      x2="460"
                      y2={profilHattiY}
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                    {/* A Noktası */}
                    <circle cx="40" cy={profilHattiY} r="7" fill="#ef4444" />
                    <text x="32" y={profilHattiY - 9} fill="#ef4444" fontSize="11" fontWeight="900">A</text>

                    {/* B Noktası */}
                    <circle cx="460" cy={profilHattiY} r="7" fill="#ef4444" />
                    <text x="465" y={profilHattiY - 9} fill="#ef4444" fontSize="11" fontWeight="900">B</text>
                  </svg>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">A-B Çizgisi:</span>
                    <span>Profil kesit hattını sağdaki slider ile yukarı/aşağı kaydırabilirsiniz.</span>
                  </div>
                  <span className="font-mono text-slate-300">Y-Konumu: {profilHattiY}px</span>
                </div>
              </div>

              {/* 2. Canlı Profil Kesiti Grafiği (A - B Doğrultusu) */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-300">
                    <Eye size={14} className="text-emerald-400" />
                    <span>A-B Doğrultusundan Çıkarılan Yükselti Profili (Kesit)</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">
                    Maks. Yükselti: {Math.max(...profilNoktalari.map(p => p.h))}m
                  </span>
                </div>

                {/* SVG Profil Çizimi */}
                <div className="w-full flex items-center justify-center">
                  <svg viewBox="0 0 500 130" className="w-full max-w-[500px] h-auto bg-[#070c18] rounded-xl border border-slate-800/80">
                    <defs>
                      <linearGradient id="profileGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Yatay Kılavuz Çizgileri */}
                    <line x1="40" y1="110" x2="460" y2="110" stroke="#334155" strokeWidth="1" />
                    <text x="18" y="113" fill="#64748b" fontSize="8">0m</text>

                    <line x1="40" y1="65" x2="460" y2="65" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="12" y="68" fill="#64748b" fontSize="8">{esYukseltiAraligi * 2}m</text>

                    <line x1="40" y1="20" x2="460" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="12" y="23" fill="#64748b" fontSize="8">{esYukseltiAraligi * 4}m</text>

                    {/* Profil Dolgusu ve Eğrisi */}
                    {(() => {
                      const scaleY = (h: number) => 110 - (h / (esYukseltiAraligi * 4.5)) * 90;
                      const pathD = profilNoktalari.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${scaleY(p.h)}`).join(' ');
                      const fillD = `${pathD} L460,110 L40,110 Z`;

                      return (
                        <>
                          <path d={fillD} fill="url(#profileGrad)" />
                          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        </>
                      );
                    })()}

                    {/* A ve B Eksen Etiketleri */}
                    <text x="40" y="125" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">A (Batı)</text>
                    <text x="460" y="125" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle">B (Doğu / Deniz)</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Sağ: Kontrol Paneli */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Mountain size={16} className="text-amber-400" />
                    Harita Kontrolleri
                  </h3>
                  <button
                    onClick={resetHarita}
                    title="Sıfırla"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
                  >
                    <RefreshCw size={13} />
                    Sıfırla
                  </button>
                </div>

                {/* 1. Eş Yükselti Aralığı (Ekidistans) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Eş Yükselti Aralığı (Δh):</span>
                    <span className="font-mono text-amber-400 font-bold">{esYukseltiAraligi} metre</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[20, 50, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          triggerHaptic('light');
                          setEsYukseltiAraligi(val);
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          esYukseltiAraligi === val
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {val} m
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Haritanın ölçeği büyüdükçe eş yükselti aralığı küçülür (daha detaylı olur).
                  </p>
                </div>

                {/* 2. A-B Kesit Hattını Kaydır */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">A-B Kesit Hattı Konumu:</span>
                    <span className="font-mono text-red-400 font-bold">{profilHattiY} px</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={210}
                    step={5}
                    value={profilHattiY}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setProfilHattiY(Number(e.target.value));
                    }}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Kuzey (Zirve üstü)</span>
                    <span>Güney (Vadi altı)</span>
                  </div>
                </div>

                {/* Yer Şekilleri Hızlı Vurgulama */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-2">
                    Yer Şekli Taktik Rehberi:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="font-bold text-amber-300">🏔️ Doruk / Zirve</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Nokta veya üçgenle gösterilir.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="font-bold text-cyan-300">🌊 Vadi & Akarsu</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">V'nin ucu kaynağı gösterir.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="font-bold text-yellow-300">🐴 Boyun</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">İki tepe arası çukur düzlük.</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="font-bold text-rose-300">🌊 Falez (Uçurum)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Deniz kıyısında eğriler sıklaşır.</div>
                    </div>
                  </div>
                </div>

                {/* YKS Sınav İpucu */}
                <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-200">
                    <Sparkles size={13} className="text-amber-400" />
                    ÖSYM Profil Çıkarma Kuralı:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Profil çıkarırken A ve B noktalarının <strong>başlangıç ve bitiş yükseltilerine</strong>, hattın geçtiği <strong>tepe sayısına</strong> ve varsa <strong>vadilere</strong> dikkat ederek şıkları kolayca eleyebilirsiniz!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: YKS REHBERİ ─── */}
        {activeTab === 'rehber' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-amber-400" />
              YKS İzohips Haritaları ve Yer Şekilleri Özeti
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-300 text-base">1. İzohipslerin Temel Özellikleri</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400">
                  <li>İç içe kapalı eğrilerdir. Birbirlerini asla kesmezler.</li>
                  <li>En dıştaki eğri en alçak yeri, en içteki eğri en yüksek yeri gösterir.</li>
                  <li>Deniz seviyesi daima <strong>0 metredir</strong> (Kıyı çizgisi).</li>
                  <li>Aynı izohips eğrisi üzerindeki tüm noktaların yükseltisi birbirine eşittir.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-cyan-300 text-base">2. Vadi ve Sırt Ayrımı (Kritik YKS Farkı!)</h3>
                <p className="leading-relaxed text-xs">
                  <strong>Vadi:</strong> İzohips eğrileri 'V' şeklinde bükülür. 'V'nin sivri ucu <em>yükseltinin arttığı</em> kaynağı gösterir.
                </p>
                <p className="leading-relaxed text-xs">
                  <strong>Sırt:</strong> İzohips eğrileri yine 'V' şeklindedir ancak 'V'nin sivri ucu <em>yükseltinin azaldığı</em> yönü gösterir.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-rose-300 text-base">3. Eğim ve Eğrilerin Sıklığı</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Eğriler birbirine yaklaştıkça (sıklaştıkça) <strong>eğim artar</strong>.</li>
                  <li>Akarsuyun akış hızı, aşındırma gücü ve hidroelektrik potansiyeli artar.</li>
                  <li>Deniz kıyısında eğriler sıklaşırsa <strong>falez (yalıyar)</strong> oluşur, kıyı derinleşir, kıta sahanlığı (şelf) daralır.</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-emerald-300 text-base">4. Kapalı Çukur (Çanak) Kuralı</h3>
                <p className="leading-relaxed text-xs">
                  İç içe eğrilerin üzerinde içe doğru ok işaretleri varsa orada krater, kaldera, obruk veya çanak vardır. Okun başladığı yerden bittiği yere kadar yükselti aralığı kadar <strong>alçalır</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: QUIZ (SORULAR) ─── */}
        {activeTab === 'sorular' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle size={20} className="text-amber-400" />
                  YKS İzohips & Harita Bilgisi Soruları
                </h2>
                <p className="text-xs text-slate-400 mt-1">ÖSYM'nin TYT Coğrafya sınavında her yıl sorduğu harita sorularını çözün.</p>
              </div>
              {quizSubmitted && (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    triggerHaptic('light');
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white"
                >
                  Yeniden Çöz
                </button>
              )}
            </div>

            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((item, qIdx) => {
                const selected = quizAnswers[qIdx];
                const isCorrect = selected === item.correct;

                return (
                  <div key={qIdx} className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="font-semibold text-sm text-slate-200">
                      <span className="text-amber-400 font-bold mr-2">Soru {qIdx + 1}:</span>
                      {item.q}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let btnStyle = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800';

                        if (quizSubmitted) {
                          if (optIdx === item.correct) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-amber-600/30 border-amber-500 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => {
                              triggerHaptic('light');
                              setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                            }}
                            className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === item.correct && (
                              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isChosen && !isCorrect && (
                              <XCircle size={16} className="text-rose-400 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-400 mt-2">
                        <strong className="text-amber-300">Açıklama:</strong> {item.exp}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={() => {
                  triggerHaptic('success');
                  setQuizSubmitted(true);
                }}
                disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cevapları Kontrol Et
              </button>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
