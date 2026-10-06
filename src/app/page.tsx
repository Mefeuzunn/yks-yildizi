"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Sparkles, Bot, Headphones, Swords, 
  BookOpen, ChevronRight, CheckCircle2, Zap, ArrowRight, Star
} from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import FadeInUp from '@/components/FadeInUp';
import UniversityCarousel from '@/components/UniversityCarousel';
import HeroMockupSlider from '@/components/HeroMockupSlider';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ogretmen') {
        router.push('/ogretmen/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (!mounted || loading || user) return null;

  const NAV_LINKS = [
    { title: "Soru Çöz", href: "/soru-coz", badge: "AI" },
    { title: "Simülasyonlar", href: "/simulasyonlar", badge: "49 Deney" },
    { title: "Çalışma Odaları", href: "/calisma-odalari", badge: "Lofi" },
    { title: "Widget Stüdyosu", href: "/widget", badge: "Canlı" },
    { title: "Ligler & Arena", href: "/ligler" },
    { title: "Rehberlik", href: "/rehberlik" },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-300 font-sans flex flex-col overflow-x-hidden selection:bg-violet-600 selection:text-white relative">
      {/* Arka Plan Ambient Radial Işıkları */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[450px] h-[450px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ─── NAVBAR (Üst Menü) ─── */}
      <header className="w-full border-b border-slate-800/80 bg-[#080c14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-decoration-none group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Star size={20} className="fill-amber-300 text-amber-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                YKS Yıldızı
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Yeni Nesil Hazırlık Platformu
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
              >
                {item.title}
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Masaüstü Butonlar */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login">
              <button className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all border border-slate-700/60">
                Giriş Yap
              </button>
            </Link>
            <Link href="/register">
              <button className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30">
                Ücretsiz Kayıt Ol
              </button>
            </Link>
          </div>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-slate-300 p-2 rounded-lg hover:bg-slate-800/60 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menü"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Mobil Tam Ekran Menü */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-20 bg-[#080c14]/95 backdrop-blur-2xl z-40 flex flex-col p-6 md:hidden border-b border-slate-800"
          >
            <div className="flex flex-col space-y-3 flex-1 mt-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-white font-semibold text-base hover:bg-violet-950/30 hover:border-violet-500/40 transition-all"
                >
                  <span>{link.title}</span>
                  {link.badge ? (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                      {link.badge}
                    </span>
                  ) : (
                    <ChevronRight size={18} className="text-slate-500" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex flex-col space-y-3 pt-6 border-t border-slate-800">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-3.5 text-center text-white font-semibold rounded-xl bg-slate-800/80 border border-slate-700">
                  Giriş Yap
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-3.5 text-center text-white font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30">
                  Ücretsiz Başla
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO BÖLÜMÜ ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24 relative z-10">
        {/* Sol Sütun: Başlık, Açıklama ve Butonlar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 lg:pr-6"
        >
          {/* Üst Rozet */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Sparkles size={14} className="text-violet-400" />
            <span>49+ İnteraktif Laboratuvar • Gemini 3.5 AI Koçu</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.12] tracking-tight">
            YKS'yi Ezberleme, <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Görselleştir ve Kazan.
            </span>
          </h1>

          {/* Alt Paragraf */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            49+ etkileşimli fizik, kimya, biyoloji simülasyonu, Sokratik yapay zeka ders koçu, canlı lofi çalışma odaları ve Türkiye ligleriyle YKS hazırlığını dünya standardına taşı.
          </p>

          {/* Aksiyon Butonları */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/register">
              <button className="px-7 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-base font-bold shadow-xl shadow-violet-600/35 transition-all hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30 flex items-center gap-2">
                <span>Hemen Ücretsiz Başla</span>
                <ArrowRight size={18} />
              </button>
            </Link>

            <Link href="/widget">
              <button className="px-5 py-3.5 bg-gradient-to-r from-sky-500/15 to-violet-500/15 hover:from-sky-500/25 hover:to-violet-500/25 text-sky-300 hover:text-white rounded-xl text-base font-semibold border border-sky-500/30 transition-all flex items-center gap-2 hover:border-sky-400">
                <span>🧩 Canlı Widget Ekle</span>
              </button>
            </Link>

            <Link href="/simulasyonlar">
              <button className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-base font-semibold border border-slate-700/80 transition-all flex items-center gap-2 hover:border-slate-600">
                <span>🔬 49+ Simülasyonu İncele</span>
              </button>
            </Link>
          </div>

          {/* Avantaj Tikleri */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>%100 Ücretsiz Erişim</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 size={16} className="text-sky-400" />
              <span>iOS & Android Canlı Widget</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 size={16} className="text-violet-400" />
              <span>Kredi Kartı Gerekmez</span>
            </div>
          </div>

          {/* Üniversiteler Sosyal Kanıtı */}
          <div className="w-full pt-4">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-2">
              Türkiye'nin En İyi Üniversitelerini Hedefleyen Öğrencilerin Tercihi
            </p>
            <UniversityCarousel />
          </div>
        </motion.div>

        {/* Sağ Sütun: Canlı İnteraktif Vitrin (Mockup) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full"
        >
          <HeroMockupSlider />
        </motion.div>
      </main>

      {/* ─── PLATFORM RAKAMLARI (CANLI İSTATİSTİKLER) ─── */}
      <section className="py-16 border-y border-slate-800/80 bg-slate-950/60 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl md:text-4xl font-extrabold text-white flex justify-center items-center">
              <AnimatedCounter targetValue={49} />
              <span className="text-violet-400 ml-0.5">+</span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">İnteraktif Laboratuvar</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl md:text-4xl font-extrabold text-white flex justify-center items-center">
              <AnimatedCounter targetValue={8800} />
              <span className="text-indigo-400 ml-0.5">+</span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">Adaptif Soru Havuzu</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl md:text-4xl font-extrabold text-white flex justify-center items-center">
              <span>%</span>
              <AnimatedCounter targetValue={94} />
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">Öğrenci Başarı Artışı</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 flex justify-center items-center">
              <span>0₺</span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-slate-400 mt-1">Öğrencilere Tamamen Ücretsiz</p>
          </div>
        </div>
      </section>

      {/* ─── NEDEN YKS YILDIZI? (6 TEMEL ÖZELLİK) ─── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-16 space-y-3">
            <FadeInUp delay={0.1}>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                PİYASA ÜSTÜ EĞİTİM STANDARDI
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-3 tracking-tight">
                Neden YKS Yıldızı?
              </h2>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-base text-slate-400 leading-relaxed">
                Klasik soru bankalarını ve statik ezber yöntemlerini unutun. Laboratuvar deneyimleri, yapay zeka ders koçluğu ve gerçek zamanlı liglerle öğrenmeyi bir oyuna dönüştürüyoruz.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kart 1: Simülasyonlar */}
            <FadeInUp delay={0.2}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-violet-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    🔬
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    49+ İnteraktif Simülasyon
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Fizik, Kimya, Biyoloji ve Matematik formüllerini ezberlemek yerine; dalgaları, gaz difüzyonunu, pilleri ve fotosentezi tarayıcında canlı deneyerek kavra.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-violet-400 flex items-center gap-1">
                  <span>Deneyleri Keşfet</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>

            {/* Kart 2: AstraTutor Sokratik AI */}
            <FadeInUp delay={0.3}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    🤖
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    AstraTutor Sokratik AI Koç
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Cevabı doğrudan verip geçmek yerine seni yönlendiren, formülleri KaTeX ile açıklayan ve 7/24 sesli yanıt veren kişisel rehberlik ve ders koçu.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-indigo-400 flex items-center gap-1">
                  <span>AI Koçu Dene</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>

            {/* Kart 3: Sanal Çalışma Odaları */}
            <FadeInUp delay={0.4}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    🎧
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    Lofi Sanal Çalışma Odaları
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Dahili Web Audio yağmur ve lofi müzik sentezleyicisi, Pomodoro odak sayacı ve Türkiye'nin dört bir yanından canlı çalışan öğrencilerle motive ol.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-amber-400 flex items-center gap-1">
                  <span>Odalara Göz At</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>

            {/* Kart 4: Bilgi Arenası */}
            <FadeInUp delay={0.5}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    ⚔️
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    Bilgi Arenası & 1v1 Düello
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    E-spor ses efektleri ve zaman sınırlı sorularla diğer YKS adaylarıyla yarış. Lig puanı topla, haftalık liderlik tablosunda adını zirveye yazdır.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-rose-400 flex items-center gap-1">
                  <span>Arenaya Katıl</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>

            {/* Kart 5: PWA & Mobil App */}
            <FadeInUp delay={0.6}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    📱
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    App Store Kalitesinde PWA
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Telefonuna tek dokunuşla ekle. İnternetin kopsa dahi odaklanmaya devam et, haptik dokunsal titreşimlerle gerçek native uygulama konforunu yaşa.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <span>PWA Özellikleri</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>

            {/* Kart 6: Hata Defteri */}
            <FadeInUp delay={0.7}>
              <div className="h-full p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all group flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-2xl mb-5 group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2.5">
                    Akıllı Hata Defteri & Analiz
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Yanlış yaptığın veya boş bıraktığın sorular kaybolmaz. Sistem zayıf olduğun kazanımları tespit eder ve sana özel eksik kapatma programı üretir.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <span>Analiz Sistemini Gör</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ─── BÜYÜK ÇAĞRI BÖLÜMÜ (CTA BANNER) ─── */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-3xl p-10 md:p-16 overflow-hidden bg-gradient-to-r from-violet-900/40 via-indigo-900/40 to-slate-900/80 border border-violet-500/30 text-center shadow-2xl shadow-violet-950/50 backdrop-blur-xl">
            {/* Parıltı Efekti */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                🚀 YKS 2027 İÇİN ŞİMDİDEN BAŞLA
              </span>

              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Hayalindeki Üniversiteye <br />
                <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  Bir Adım Kaldı.
                </span>
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Hemen ücretsiz hesabını oluştur; 49 simülasyon, akıllı soru havuzu ve yapay zeka ders koçu ile rakiplerinin önüne geç.
              </p>

              <div className="pt-2">
                <Link href="/register">
                  <button className="px-9 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-lg font-extrabold shadow-xl shadow-violet-600/40 transition-all hover:scale-105 active:scale-95 border border-violet-400/30 inline-flex items-center gap-2.5">
                    <span>Ücretsiz Hesabını Oluştur</span>
                    <ArrowRight size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER (Alt Bilgi) ─── */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-14 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* 1. Sütun: Marka */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
                  <Star size={16} className="fill-amber-300 text-amber-300" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">YKS Yıldızı</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Türkiye'nin en modern, simülasyon tabanlı ve yapay zeka destekli üniversiteye hazırlık ekosistemi.
              </p>
              <div className="text-xs text-slate-500 font-mono">
                Sürüm 2.4 • Gemini 3.5 Flash
              </div>
            </div>

            {/* 2. Sütun: Platform */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li><Link href="/soru-coz" className="hover:text-violet-400 transition-colors">Soru Çöz (AI Destekli)</Link></li>
                <li><Link href="/simulasyonlar" className="hover:text-violet-400 transition-colors">49+ İnteraktif Deney</Link></li>
                <li><Link href="/calisma-odalari" className="hover:text-violet-400 transition-colors">Lofi Çalışma Odaları</Link></li>
                <li><Link href="/duello" className="hover:text-violet-400 transition-colors">Bilgi Arenası Düello</Link></li>
                <li><Link href="/ligler" className="hover:text-violet-400 transition-colors">Şampiyonlar Ligi</Link></li>
              </ul>
            </div>

            {/* 3. Sütun: Araçlar */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                Araçlar & Rehberlik
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li><Link href="/rehberlik" className="hover:text-violet-400 transition-colors">AstraTutor Sınav Koçu</Link></li>
                <li><Link href="/puan-hesaplama" className="hover:text-violet-400 transition-colors">YKS Puan Hesaplama</Link></li>
                <li><Link href="/denemeler" className="hover:text-violet-400 transition-colors">Net Sihirbazı & Takip</Link></li>
                <li><Link href="/dashboard?tab=focus" className="hover:text-violet-400 transition-colors">Pomodoro Odak Modu</Link></li>
                <li><Link href="/veli" className="hover:text-violet-400 transition-colors">Veli Bilgilendirme</Link></li>
              </ul>
            </div>

            {/* 4. Sütun: İletişim */}
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">
                İletişim & Destek
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
                <li className="text-slate-300">destek@yksyildizi.com</li>
                <li>Öğrenci ve Öğretmen Destek Hattı</li>
                <li className="pt-2">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                    ● Sistemler %100 Çevrimiçi
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2026 YKS Yıldızı. Tüm hakları saklıdır. Öğrenciler için sevgiyle geliştirildi.</p>
            <div className="flex gap-6 font-medium">
              <Link href="/gizlilik" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</Link>
              <Link href="/kullanim" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
