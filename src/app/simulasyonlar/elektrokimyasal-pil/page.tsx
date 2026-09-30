'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, RefreshCw, Sparkles, BookOpen, 
  HelpCircle, ArrowLeft, CheckCircle2, XCircle, Beaker, Flame
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function ElektrokimyasalPilSimulation() {
  // Parametreler
  const [znDerisim, setZnDerisim] = useState<number>(1.0); // Anot [Zn2+] (0.01 - 2.0 M)
  const [cuDerisim, setCuDerisim] = useState<number>(1.0); // Katot [Cu2+] (0.01 - 2.0 M)
  const [sicaklikC, setSicaklikC] = useState<number>(25); // Sıcaklık (°C)
  const [devreAcik, setDevreAcik] = useState<boolean>(true); // Anahtar açık/kapalı
  const [gecenSure, setGecenSure] = useState<number>(0); // saniye

  // Sekmeler
  const [activeTab, setActiveTab] = useState<'simulasyon' | 'rehber' | 'sorular'>('simulasyon');
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number | null }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Animasyon
  const [electronOffset, setElectronOffset] = useState<number>(0);

  useEffect(() => {
    if (!devreAcik) return;
    const interval = setInterval(() => {
      setElectronOffset((prev) => (prev + 1) % 100);
      setGecenSure((prev) => prev + 1);
    }, 40);
    return () => clearInterval(interval);
  }, [devreAcik]);

  // Standart Potansiyeller:
  // Zn -> Zn2+ + 2e-   E°_yüks = +0.76 V
  // Cu2+ + 2e- -> Cu   E°_ind = +0.34 V
  const eStandart = 1.10; // Volt
  const n = 2; // Aktarılan elektron sayısı

  // Nernst Eşitliği:
  // E_pil = E° - (0.0592 / n) * log(Q)
  // Q = [Zn2+] / [Cu2+]
  // Sıcaklık faktörü: T_K / 298.15
  const sicaklikK = sicaklikC + 273.15;
  const nernstSabiti = (0.0592 * (sicaklikK / 298.15)) / n;
  const Q = znDerisim / cuDerisim;
  const ePil = devreAcik 
    ? Math.max(0, Number((eStandart - nernstSabiti * Math.log10(Q)).toFixed(3)))
    : 0;

  // Çubuk kütle değişimleri (Görsel temsil)
  const znAsinma = Math.min(15, gecenSure * 0.15); // Anot erir
  const cuKalinlasma = Math.min(15, gecenSure * 0.15); // Katot kalınlaşır

  const resetPil = () => {
    triggerHaptic('light');
    setZnDerisim(1.0);
    setCuDerisim(1.0);
    setSicaklikC(25);
    setGecenSure(0);
    setDevreAcik(true);
  };

  const QUIZ_QUESTIONS = [
    {
      q: "Zn - Cu standart galvanik pilinde Anot kabına saf su eklenirse pil gerilimi (E_pil) nasıl değişir?",
      options: [
        "Artar",
        "Azalır",
        "Değişmez",
        "Sıfıra düşer"
      ],
      correct: 0,
      exp: "Pil tepkimesi: Zn(k) + Cu2+(suda) ⇌ Zn2+(suda) + Cu(k) + Isı. Anot kabına su eklenirse [Zn2+] derişimi azalır. Le Chatelier ilkesine göre sistem derişimi artırmak için ürünler yönüne (sağa) kayar ve E_pil artar!"
    },
    {
      q: "Nernst Eşitliği için aşağıdakilerden hangisi doğrudur?",
      options: [
        "Katot çözeltisinin derişimi artırılırsa pil potansiyeli azalır",
        "Pil tepkimesi ekzotermik olduğundan sıcaklık artarsa pil potansiyeli azalır",
        "Anot çözeltisinin derişimi artırılırsa pil potansiyeli artar",
        "Tuz köprüsü devreden çıkarılırsa pil daha yüksek gerilimle çalışır"
      ],
      correct: 1,
      exp: "Tüm galvanik piller ekzotermiktir (ısı açığa çıkarır: ΔH < 0). Sıcaklık artırıldığında denge girenler yönüne kayar ve pil gerilimi düşer. Ayrıca tuz köprüsü çıkarılırsa devre açılır ve gerilim sıfır olur."
    },
    {
      q: "Bir galvanik pilde tuz köprüsünün temel görevi nedir?",
      options: [
        "Elektronları anottan katota iletmek",
        "Elektrik akımını iki katına çıkarmak",
        "İyon denkliğini sağlayarak yük dengesizliğini ve kutuplanmayı önlemek",
        "Çözeltilerin buharlaşmasını engellemek"
      ],
      correct: 2,
      exp: "Tuz köprüsü devreyi tamamlar ve yük denkliğini sağlar: Anyonlar anota, katyonlar katota göç ederek çözeltilerin kutuplanmasını önler."
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
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  AYT Kimya
                </span>
                <span className="text-xs text-slate-400">Elektrokimya & Nernst Eşitliği</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                Galvanik Pil & Daniell Hücresi Simülasyonu 🔋
              </h1>
            </div>
          </div>

          {/* Sekme Seçiciler */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('simulasyon'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'simulasyon'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 Canlı Pil Hücresi
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('rehber'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rehber'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📖 YKS Konu Özeti
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setActiveTab('sorular'); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sorular'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
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

            {/* Sol: 2 Kolonluk Pil Düzeneği Şeması */}
            <div className="lg:col-span-2 space-y-5">
              
              <div className="relative rounded-2xl bg-slate-950/80 border border-slate-800 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Zn(k) | Zn²⁺(suda) || Cu²⁺(suda) | Cu(k)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setDevreAcik(!devreAcik);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        devreAcik
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {devreAcik ? '⚡ Devre Kapalı (Akım Var)' : '⛔ Devre Açık (Akım Yok)'}
                    </button>
                  </div>
                </div>

                {/* SVG Galvanik Pil Düzeneği */}
                <div className="w-full flex items-center justify-center py-2">
                  <svg viewBox="0 0 540 320" className="w-full max-w-[530px] h-auto">
                    <defs>
                      <linearGradient id="znGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                      <linearGradient id="cuGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#c2410c" />
                      </linearGradient>
                      <linearGradient id="znSolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.45" />
                      </linearGradient>
                      <linearGradient id="cuSolGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7" />
                      </linearGradient>
                    </defs>

                    {/* Dış Devre Kablosu */}
                    <path
                      d="M110,130 L110,40 L430,40 L430,130"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="4"
                    />

                    {/* Dış Devrede Elektron Akışı (Canlı Noktalar: Anottan Katota -> Sağ yönde) */}
                    {devreAcik && Array.from({ length: 8 }).map((_, idx) => {
                      const pos = (electronOffset + idx * 12.5) % 100;
                      let cx = 110;
                      let cy = 40;
                      if (pos < 25) {
                        cx = 110;
                        cy = 130 - (pos / 25) * 90;
                      } else if (pos < 75) {
                        cx = 110 + ((pos - 25) / 50) * 320;
                        cy = 40;
                      } else {
                        cx = 430;
                        cy = 40 + ((pos - 75) / 25) * 90;
                      }
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r="4"
                          fill="#facc15"
                          style={{ filter: 'drop-shadow(0 0 6px #facc15)' }}
                        />
                      );
                    })}

                    {/* Voltmetre Kadranı */}
                    <g transform="translate(270, 40)">
                      <circle cx="0" cy="0" r="28" fill="#0f172a" stroke="#8b5cf6" strokeWidth="3" />
                      <text x="0" y="-8" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">VOLTMETRE</text>
                      <text x="0" y="8" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="900" fontFamily="monospace">
                        {ePil.toFixed(2)}V
                      </text>
                      <text x="0" y="20" textAnchor="middle" fill="#c4b5fd" fontSize="7">E_pil</text>
                    </g>

                    {/* Elektron Akış Yönü Oku */}
                    {devreAcik && (
                      <g transform="translate(350, 26)">
                        <text x="0" y="0" fill="#facc15" fontSize="10" fontWeight="bold">e⁻ akışı →</text>
                      </g>
                    )}

                    {/* SOL KAP: ANOT (Zn) */}
                    <g transform="translate(40, 120)">
                      {/* Beher Camı */}
                      <rect x="0" y="30" width="140" height="150" rx="8" fill="none" stroke="#64748b" strokeWidth="3" />
                      {/* Çözelti: ZnSO4 */}
                      <rect x="4" y="60" width="132" height="116" rx="6" fill="url(#znSolGrad)" />
                      {/* Zn Elektrot (Anot - Zamanla erir) */}
                      <rect
                        x={45 + znAsinma / 2}
                        y={-20}
                        width={30 - znAsinma}
                        height={160}
                        rx="3"
                        fill="url(#znGrad)"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      />
                      <text x="60" y="-28" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">Zn (Anot)</text>
                      <text x="70" y="110" textAnchor="middle" fill="#bae6fd" fontSize="10" fontWeight="bold">
                        [Zn²⁺] = {znDerisim} M
                      </text>
                      <text x="70" y="125" textAnchor="middle" fill="#7dd3fc" fontSize="9">
                        ZnSO₄ Çözeltisi
                      </text>
                    </g>

                    {/* SAĞ KAP: KATOT (Cu) */}
                    <g transform="translate(360, 120)">
                      {/* Beher Camı */}
                      <rect x="0" y="30" width="140" height="150" rx="8" fill="none" stroke="#64748b" strokeWidth="3" />
                      {/* Çözelti: CuSO4 */}
                      <rect x="4" y="60" width="132" height="116" rx="6" fill="url(#cuSolGrad)" />
                      {/* Cu Elektrot (Katot - Zamanla kalınlaşır) */}
                      <rect
                        x={45 - cuKalinlasma / 2}
                        y={-20}
                        width={30 + cuKalinlasma}
                        height={160}
                        rx="3"
                        fill="url(#cuGrad)"
                        stroke="#ea580c"
                        strokeWidth="1.5"
                      />
                      <text x="60" y="-28" textAnchor="middle" fill="#fb923c" fontSize="11" fontWeight="bold">Cu (Katot)</text>
                      <text x="70" y="110" textAnchor="middle" fill="#bfdbfe" fontSize="10" fontWeight="bold">
                        [Cu²⁺] = {cuDerisim} M
                      </text>
                      <text x="70" y="125" textAnchor="middle" fill="#93c5fd" fontSize="9">
                        CuSO₄ Çözeltisi
                      </text>
                    </g>

                    {/* TUZ KÖPRÜSÜ (Ters U Borusu: KNO3) */}
                    <g transform="translate(195, 120)">
                      <path
                        d="M0,80 L0,30 Q0,10 20,10 L130,10 Q150,10 150,30 L150,80"
                        fill="none"
                        stroke="#fef08a"
                        strokeWidth="16"
                        strokeLinecap="round"
                        opacity="0.85"
                      />
                      <text x="75" y="2" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">
                        Tuz Köprüsü (KNO₃)
                      </text>
                      {/* İyon Göçü */}
                      <text x="10" y="55" fill="#f87171" fontSize="8" fontWeight="bold">NO₃⁻ →</text>
                      <text x="115" y="55" fill="#60a5fa" fontSize="8" fontWeight="bold">→ K⁺</text>
                    </g>
                  </svg>
                </div>

                {/* Nernst Canlı Formülü */}
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Nernst Eşitliği: </span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      E_pil = 1.10 - ({nernstSabiti.toFixed(4)}) · log({Q.toFixed(2)}) = {ePil.toFixed(3)} V
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Tepkime Yönü:</span>
                    <span className="font-bold text-violet-300">
                      {Q < 1 ? 'Ürünler Lehine (E_pil &gt; E°)' : Q > 1 ? 'Girenler Lehine (E_pil &lt; E°)' : 'Standart Denge (E_pil = E°)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Canlı İstatistik Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pil Potansiyeli (E_pil)</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{ePil.toFixed(2)} V</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">E° = 1.10 V</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Derişim Oranı (Q)</div>
                  <div className="text-2xl font-black text-violet-400 mt-1">{Q.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">[Zn²⁺] / [Cu²⁺]</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Anot Zn Kütlesi</div>
                  <div className="text-xl font-black text-rose-400 mt-1.5">Aşınıyor 📉</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Zn → Zn²⁺ + 2e⁻</div>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Katot Cu Kütlesi</div>
                  <div className="text-xl font-black text-amber-400 mt-1.5">Artıyor 📈</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Cu²⁺ + 2e⁻ → Cu</div>
                </div>
              </div>
            </div>

            {/* Sağ: Kontrol Paneli */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Beaker size={16} className="text-emerald-400" />
                    Çözelti & Sıcaklık Kontrolü
                  </h3>
                  <button
                    onClick={resetPil}
                    title="Sıfırla"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1"
                  >
                    <RefreshCw size={13} />
                    Sıfırla
                  </button>
                </div>

                {/* 1. Anot [Zn2+] Derişimi */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Anot [Zn²⁺] Derişimi:</span>
                    <span className="font-mono text-cyan-400 font-bold">{znDerisim} M</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={2.0}
                    step={0.05}
                    value={znDerisim}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setZnDerisim(Number(e.target.value));
                    }}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.01 M (Seyreltik)</span>
                    <span>2.0 M (Derişik)</span>
                  </div>
                </div>

                {/* 2. Katot [Cu2+] Derişimi */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Katot [Cu²⁺] Derişimi:</span>
                    <span className="font-mono text-orange-400 font-bold">{cuDerisim} M</span>
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={2.0}
                    step={0.05}
                    value={cuDerisim}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setCuDerisim(Number(e.target.value));
                    }}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.01 M (Seyreltik)</span>
                    <span>2.0 M (Derişik)</span>
                  </div>
                </div>

                {/* 3. Sıcaklık Ayarı */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">Hücre Sıcaklığı:</span>
                    <span className="font-mono text-amber-400 font-bold">{sicaklikC} °C ({sicaklikK} K)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    step={5}
                    value={sicaklikC}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setSicaklikC(Number(e.target.value));
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 °C (Soğuk)</span>
                    <span>25 °C (Oda)</span>
                    <span>80 °C (Sıcak)</span>
                  </div>
                </div>

                {/* Hızlı Eylem Butonları */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setZnDerisim(0.01);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    💧 Anota Su Ekle
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setCuDerisim(2.0);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    🧂 Katota Cu²⁺ Ekle
                  </button>
                </div>

                {/* YKS Önemli Not */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-emerald-200">
                    <Sparkles size={13} className="text-amber-400" />
                    Kritik YKS Kuralı:
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Anot derişimi azalır veya Katot derişimi artarsa denge <strong>ürünlere kayar ve E_pil artar</strong>. Sıcaklık artarsa ekzotermik tepkime girenler yönüne kayar ve <strong>E_pil azalır</strong>!
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
              <BookOpen size={20} className="text-emerald-400" />
              YKS Elektrokimyasal Piller & Nernst Özeti
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-emerald-300 text-base">1. Anot ve Katot Tespiti (KİMYA Kuralı)</h3>
                <p className="leading-relaxed text-xs">
                  <strong>K-İ-M-Y-A:</strong> Katotta İndirgenme, Yükseltgenme Anotta gerçekleşir!
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
                  <li>Aktifliği (yükseltgenme potansiyeli) büyük olan elektrot <strong>ANOT</strong> olur.</li>
                  <li>Anot çubuğu zamanla çözünür ve kütlesi azalır: Zn → Zn²⁺ + 2e⁻</li>
                  <li>Katot çubuğunun yüzeyinde metal toplanır ve kütlesi artar: Cu²⁺ + 2e⁻ → Cu</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-violet-300 text-base">2. Nernst Eşitliği</h3>
                <p className="leading-relaxed text-xs">
                  Standart olmayan koşullarda ([İyon] ≠ 1M) pil gerilimi Nernst denklemi ile hesaplanır:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-xs text-emerald-300 border border-slate-800">
                  E_pil = E°_pil - (0.0592 / n) · log(Q)
                </div>
                <p className="text-[11px] text-slate-400">
                  Q = [Anot iyonu] / [Katot iyonu] (Katsayılar üs olarak alınır).
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-amber-300 text-base">3. Tuz Köprüsünün Rolü</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Devreyi tamamlar ve yük dengesini korur.</li>
                  <li><strong>Anyonlar Anota</strong> göç eder (Artan pozitif yükü dengeler).</li>
                  <li><strong>Katyonlar Katota</strong> göç eder (Azalan pozitif yükü dengeler).</li>
                  <li>Tuz köprüsü çekilirse akım derhal kesilir (E_pil = 0).</li>
                </ul>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h3 className="font-bold text-rose-300 text-base">4. Sıcaklık ve Basınç Etkisi</h3>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>Tüm kimyasal piller <strong>ekzotermiktir (Isı veren)</strong>.</li>
                  <li>Sıcaklık artışı dengeyi sola (girenler yönüne) kaydırır ve pil potansiyelini düşürür.</li>
                  <li>Gaz elektrotlu pillerde (Örn: H₂ elektrotu) gaz basıncı artışı denge yönüne göre gerilimi etkiler.</li>
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
                  <HelpCircle size={20} className="text-emerald-400" />
                  YKS Elektrokimya Test Soruları
                </h2>
                <p className="text-xs text-slate-400 mt-1">ÖSYM'nin her yıl banko sorduğu pil ve derişim sorularını çözün.</p>
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
                      <span className="text-emerald-400 font-bold mr-2">Soru {qIdx + 1}:</span>
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
                          btnStyle = 'bg-emerald-600/30 border-emerald-500 text-white font-bold';
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
                        <strong className="text-emerald-300">Açıklama:</strong> {item.exp}
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
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
