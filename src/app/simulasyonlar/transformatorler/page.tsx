'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, RefreshCw, Sparkles, BookOpen, 
  HelpCircle, ArrowLeft, CheckCircle2, XCircle, Lightbulb
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function TransformatorlerSimulation() {
  // Transformatör Parametreleri
  const [primerSarim, setPrimerSarim] = useState<number>(50); // Np (10 - 200)
  const [sekonderSarim, setSekonderSarim] = useState<number>(100); // Ns (10 - 200)
  const [girisVoltaj, setGirisVoltaj] = useState<number>(100); // Vp (10V - 220V)
  const [yukDirenci, setYukDirenci] = useState<number>(50); // R (10 ohm - 200 ohm)
  const [verimYuzde, setVerimYuzde] = useState<number>(100); // % verim (60% - 100%)
  const [acFrekans, setAcFrekans] = useState<number>(50); // 50 Hz

  // Quiz state
  const [activeTab, setActiveTab] = useState<'simulasyon' | 'rehber' | 'sorular'>('simulasyon');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number | null }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Animasyon fazı
  const [animPhase, setAnimPhase] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase = (phase + 0.1) % (2 * Math.PI);
      setAnimPhase(phase);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Fizik Hesaplamaları
  const donusumOrani = sekonderSarim / primerSarim; // Ns / Np
  const cikisVoltaj = Math.round(girisVoltaj * donusumOrani * (verimYuzde / 100)); // Vs = Vp * (Ns/Np) * (verim/100)
  const cikisAkim = Number((cikisVoltaj / yukDirenci).toFixed(2)); // Is = Vs / R
  const cikisGuc = Math.round(cikisVoltaj * cikisAkim); // Ps = Vs * Is

  // Giriş Gücü ve Akımı: Pp = Ps / (verim/100) => Ip = Pp / Vp
  const girisGuc = Math.round(cikisGuc / (verimYuzde / 100));
  const girisAkim = Number((girisGuc / Math.max(1, girisVoltaj)).toFixed(2));

  // Yükseltici mi İndirici mi?
  const tip = sekonderSarim > primerSarim ? 'Yükseltici (Step-Up)' : sekonderSarim < primerSarim ? 'İndirici (Step-Down)' : 'Birebir (İzole)';

  // Lamba Durumu
  const nominalVoltaj = 100;
  const lambaOrani = Math.min(2, cikisVoltaj / nominalVoltaj);
  const lambaDurumu = cikisVoltaj === 0 ? 'Sönük' : cikisVoltaj < 60 ? 'Loş / Soluk' : cikisVoltaj <= 140 ? 'Normal / İdeal' : 'Aşırı Parlak (Patlama Riski!)';

  const resetParams = () => {
    triggerHaptic('light');
    setPrimerSarim(50);
    setSekonderSarim(100);
    setGirisVoltaj(100);
    setYukDirenci(50);
    setVerimYuzde(100);
  };

  const QUIZ_QUESTIONS = [
    {
      q: "İdeal bir transformatörde sekonder sarım sayısı primer sarım sayısının 3 katına çıkarılırsa çıkış gerilimi ve çıkış gücü nasıl değişir?",
      options: [
        "Gerilim 3 katına çıkar, güç değişmez",
        "Gerilim 3 katına çıkar, güç 3 katına çıkar",
        "Gerilim 3 katına çıkar, güç 9 katına çıkar",
        "Gerilim 3 kat azalır, güç yarıya iner"
      ],
      correct: 0,
      exp: "İdeal transformatörlerde verim %100 kabul edildiğinden giriş gücü çıkış gücüne daima eşittir (P_primer = P_sekonder). Gerilim ise sarım sayısı ile doğru orantılı olarak 3 katına çıkar (Vs = 3 * Vp)."
    },
    {
      q: "Bir transformatörün primerine doğru akım (DC) kaynağı bağlanırsa sekonder bobinde ne gözlenir?",
      options: [
        "Sürekli ve sabit bir DC gerilimi üretilir",
        "Sekonderde sürekli yüksek frekanslı AC gerilimi oluşur",
        "Yalnızca anahtar açılıp kapanırken anlık indüksiyon akımı oluşur, sürekli gerilim sıfırdır",
        "Transformatör anında yüksek verimle çalışmaya başlar"
      ],
      correct: 2,
      exp: "Transformatörler Faraday İndüksiyon Kanununa göre çalışır (Manyetik akı değişimi gereklidir: ΔΦ/Δt). Sabit doğru akımda (DC) manyetik akı sabit kalır, bu yüzden sürekli gerilim üretilmez; yalnızca anahtar açılıp kapanırken anlık indüksiyon gerilimi gözlenir."
    },
    {
      q: "Verimi %80 olan bir indirici transformatörde çıkış gücü 160 Watt ise giriş gücü kaç Watt'tır?",
      options: [
        "128 Watt",
        "160 Watt",
        "200 Watt",
        "240 Watt"
      ],
      correct: 2,
      exp: "Verim = (P_çıkış / P_giriş) * 100 => 0.80 = 160 / P_giriş => P_giriş = 160 / 0.80 = 200 Watt bulunur."
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
                <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold">
                  AYT Fizik
                </span>
                <span className="text-xs text-slate-400">Alternatif Akım & İndüksiyon</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                Transformatörler & İndüksiyon Laboratuvarı ⚡
              </h1>
            </div>
          </div>

          {/* Sekme Seçiciler */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('simulasyon'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'simulasyon'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 Simülatör
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('rehber'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rehber'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 YKS Konu Özeti
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('sorular'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sorular'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
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
            
            {/* Sol: 2 Kolonluk İnteraktif Canvas / Çizim Alanı */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Çekirdek ve Bobinler Görseli */}
              <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Demir Çekirdek & Manyetik Akı (AC 50Hz)
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    sekonderSarim > primerSarim
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : sekonderSarim < primerSarim
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-700/30 text-slate-300'
                  }`}>
                    {tip}
                  </span>
                </div>

                {/* SVG Transformatör Şeması */}
                <div className="w-full flex items-center justify-center py-4">
                  <svg viewBox="0 0 540 280" className="w-full max-w-[520px] h-auto">
                    <defs>
                      <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="50%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <radialGradient id="fluxGlow">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Dış Demir Çekirdek */}
                    <rect x="70" y="30" width="400" height="220" rx="16" fill="url(#ironGrad)" stroke="#475569" strokeWidth="4" />
                    {/* İç Boşluk */}
                    <rect x="150" y="80" width="240" height="120" rx="10" fill="#080c14" stroke="#475569" strokeWidth="3" />

                    {/* Manyetik Akı Çizgileri Animasyonu */}
                    <rect
                      x="110" y="55" width="320" height="170" rx="12"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2.5"
                      strokeDasharray="8 8"
                      strokeDashoffset={-animPhase * 25}
                      opacity={girisVoltaj > 0 ? 0.75 : 0.1}
                    />

                    {/* SOL BOBİN (PRİMER) */}
                    <g transform="translate(60, 60)">
                      <rect x="0" y="0" width="20" height="160" rx="4" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
                      {/* Sarım sargıları */}
                      {Array.from({ length: Math.min(24, Math.max(6, Math.round(primerSarim / 6))) }).map((_, i) => (
                        <rect
                          key={`p_${i}`}
                          x="-6"
                          y={8 + i * 6.5}
                          width="32"
                          height="4"
                          rx="2"
                          fill="#818cf8"
                          opacity={0.9}
                        />
                      ))}
                      {/* Sol AC Kaynak Bağlantısı */}
                      <path d="M-6,20 L-40,20 L-40,140 L-6,140" fill="none" stroke="#6366f1" strokeWidth="3" />
                      {/* AC Sembolü */}
                      <circle cx="-40" cy="80" r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
                      <text x="-40" y="85" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="bold">~</text>
                      <text x="-40" y="112" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">
                        {girisVoltaj}V AC
                      </text>
                    </g>

                    {/* SAĞ BOBİN (SEKONDER) */}
                    <g transform="translate(460, 60)">
                      <rect x="0" y="0" width="20" height="160" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
                      {/* Sarım sargıları */}
                      {Array.from({ length: Math.min(24, Math.max(6, Math.round(sekonderSarim / 6))) }).map((_, i) => (
                        <rect
                          key={`s_${i}`}
                          x="-6"
                          y={8 + i * 6.5}
                          width="32"
                          height="4"
                          rx="2"
                          fill="#f472b6"
                          opacity={0.9}
                        />
                      ))}
                      {/* Sağ Yük / Lamba Bağlantısı */}
                      <path d="M26,20 L60,20 L60,140 L26,140" fill="none" stroke="#ec4899" strokeWidth="3" />
                      {/* Lamba / Direnç */}
                      <circle
                        cx="60"
                        cy="80"
                        r="18"
                        fill={cikisVoltaj === 0 ? '#1e293b' : lambaOrani > 1.4 ? '#fef08a' : '#facc15'}
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        style={{
                          filter: cikisVoltaj > 0 ? `drop-shadow(0 0 ${12 * lambaOrani}px rgba(250, 204, 21, 0.9))` : 'none'
                        }}
                      />
                      <text x="60" y="85" textAnchor="middle" fill="#0f172a" fontSize="14">💡</text>
                      <text x="60" y="115" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">
                        {cikisVoltaj}V ({cikisGuc}W)
                      </text>
                    </g>

                    {/* Metrik Göstergeleri */}
                    <text x="110" y="245" fill="#a5b4fc" fontSize="11" fontWeight="bold">
                      Primer: Np = {primerSarim}
                    </text>
                    <text x="350" y="245" fill="#f472b6" fontSize="11" fontWeight="bold">
                      Sekonder: Ns = {sekonderSarim}
                    </text>
                  </svg>
                </div>

                {/* Formül & Anlık Oran Şeridi */}
                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Dönüşüm Bağıntısı:</span>
                    <span className="font-mono text-violet-300 font-bold bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800">
                      Vp / Vs = Np / Ns = {primerSarim} / {sekonderSarim} = {(primerSarim / sekonderSarim).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Lamba Durumu:</span>
                    <span className={`font-bold ${
                      lambaDurumu.includes('Patlama') ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      💡 {lambaDurumu}
                    </span>
                  </div>
                </div>
              </div>

              {/* Canlı Çıkış İstatistik Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Çıkış Gerilimi (Vs)</div>
                  <div className="text-2xl font-black text-violet-300 mt-1">{cikisVoltaj} V</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Giriş: {girisVoltaj} V</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Çıkış Akımı (Is)</div>
                  <div className="text-2xl font-black text-pink-300 mt-1">{cikisAkim} A</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Yük: {yukDirenci} Ω</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Giriş Akımı (Ip)</div>
                  <div className="text-2xl font-black text-indigo-300 mt-1">{girisAkim} A</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Güç Korumu</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Sistem Verimi</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">%{verimYuzde}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{verimYuzde === 100 ? 'İdeal Transformatör' : 'Kayıplı'}</div>
                </div>
              </div>
            </div>

            {/* Sağ: Kontrol Paneli */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Zap size={16} className="text-violet-400" />
                    Kontrol Parametreleri
                  </h3>
                  <button
                    onClick={resetParams}
                    title="Sıfırla"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
                  >
                    <RefreshCw size={13} />
                    Sıfırla
                  </button>
                </div>

                {/* 1. Primer Sarım Sayısı (Np) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Primer Sarım (Np):</span>
                    <span className="font-mono text-indigo-400">{primerSarim} sarım</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={primerSarim}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setPrimerSarim(Number(e.target.value));
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 (Düşük)</span>
                    <span>200 (Yüksek)</span>
                  </div>
                </div>

                {/* 2. Sekonder Sarım Sayısı (Ns) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Sekonder Sarım (Ns):</span>
                    <span className="font-mono text-pink-400">{sekonderSarim} sarım</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={sekonderSarim}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setSekonderSarim(Number(e.target.value));
                    }}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 (Düşük)</span>
                    <span>200 (Yüksek)</span>
                  </div>
                </div>

                {/* 3. Giriş Gerilimi (Vp) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Giriş Gerilimi (Vp):</span>
                    <span className="font-mono text-violet-400">{girisVoltaj} V</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={220}
                    step={10}
                    value={girisVoltaj}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setGirisVoltaj(Number(e.target.value));
                    }}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 V</span>
                    <span>220 V (Şebeke)</span>
                  </div>
                </div>

                {/* 4. Yük Direnci (R) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Lamba / Yük Direnci (R):</span>
                    <span className="font-mono text-amber-400">{yukDirenci} Ω</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={yukDirenci}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setYukDirenci(Number(e.target.value));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* 5. Sistem Verimi (%) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Verim (%):</span>
                    <span className="font-mono text-emerald-400">%{verimYuzde}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={100}
                    step={5}
                    value={verimYuzde}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setVerimYuzde(Number(e.target.value));
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>%60 (Isı Kaybı)</span>
                    <span>%100 (İdeal)</span>
                  </div>
                </div>

                {/* YKS İpucu Kartı */}
                <div className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-xl text-xs text-violet-300 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-violet-200">
                    <Lightbulb size={13} className="text-amber-400" />
                    ÖSYM Sınav Taktikleri:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Gerilim yükselirse akım azalır (<span className="text-violet-300 font-mono">Vs &gt; Vp ise Is &lt; Ip</span>). Uzun mesafeli elektrik iletim hatlarında enerjiyi az kayıpla taşımak için gerilim yükseltilir!
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
              <BookOpen size={20} className="text-violet-400" />
              YKS Transformatörler Konu Özeti & Formüller
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-violet-300 text-base">1. Temel Çalışma İlkesi</h3>
                <p className="leading-relaxed text-xs">
                  Transformatörler, alternatif akımın gerilimini yükseltmek ya da alçaltmak için kullanılan indüksiyon aygıtlarıdır. 
                  Faraday İndüksiyon Kanununa göre demir çekirdekteki manyetik akı değişimi (<span className="font-mono text-violet-400">ΔΦ/Δt</span>) sekonder bobinde gerilim indükler.
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800">
                  Vp / Vs = Np / Ns
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-pink-300 text-base">2. Güç ve Akım Bağıntısı</h3>
                <p className="leading-relaxed text-xs">
                  <strong>İdeal Transformatörde:</strong> Isı ve manyetik kayıp yoktur. Giriş gücü çıkış gücüne eşittir:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-pink-300 border border-slate-800">
                  P_primer = P_sekonder  =&gt;  Vp * Ip = Vs * Is
                </div>
                <p className="text-[11px] text-slate-400">
                  Dolayısıyla gerilim ile akım ters orantılıdır: <span className="font-mono text-white">Vp / Vs = Is / Ip</span>.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-300 text-base">3. Verim Hesabı</h3>
                <p className="leading-relaxed text-xs">
                  Gerçek (pratik) transformatörlerde demir çekirdeğin histerezis kaybı ve bakır tellerin direnci nedeniyle verim %100'den düşüktür:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-amber-300 border border-slate-800">
                  Verim (%) = (P_çıkış / P_giriş) * 100 = (Vs * Is) / (Vp * Ip) * 100
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-emerald-300 text-base">4. Önemli YKS Tuzakları ⚠️</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li><strong>DC Akım:</strong> Transformatörler sabit doğru akımla (pil, akü vb.) sürekli çalışmaz!</li>
                  <li><strong>Frekans:</strong> Transformatörler alternatif akımın frekansını kesinlikle DEĞİŞTİRMEZ (fp = fs).</li>
                  <li><strong>İndirici Transformatör:</strong> Np &gt; Ns, Vp &gt; Vs, Ip &lt; Is.</li>
                  <li><strong>Yükseltici Transformatör:</strong> Ns &gt; Np, Vs &gt; Vp, Is &lt; Ip.</li>
                </ul>
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
                  <HelpCircle size={20} className="text-violet-400" />
                  YKS Formatında Transformatör Soruları
                </h2>
                <p className="text-xs text-slate-400 mt-1">Önceki yıllarda sorulmuş benzer kalıpları çözerek konuyu pekiştirin.</p>
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
                      <span className="text-violet-400 font-bold mr-2">Soru {qIdx + 1}:</span>
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
                          btnStyle = 'bg-violet-600/30 border-violet-500 text-white font-bold';
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
                        <strong className="text-violet-300">Açıklama:</strong> {item.exp}
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
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
