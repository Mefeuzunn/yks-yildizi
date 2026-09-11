"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => setMounted(true), []);

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

  const barHeights = [40, 60, 30, 80, 100, 50, 70];

  return (
    <div className="min-h-screen bg-surface font-sans text-text-body flex flex-col overflow-hidden">
      {/* Üst Menü (Navbar) */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="text-2xl font-heading font-extrabold text-text-heading">
          YKS Yıldızı
        </div>
        <nav className="hidden md:flex space-x-8 font-medium">
          <Link href="/soru-coz" className="hover:text-brand transition-colors">Soru Çöz</Link>
          <Link href="/simulasyonlar" className="hover:text-brand transition-colors">Simülasyonlar</Link>
          <Link href="/duello" className="hover:text-brand transition-colors">Odalar</Link>
          <Link href="/ligler" className="hover:text-brand transition-colors">Ligler</Link>
          <Link href="/rehberlik" className="hover:text-brand transition-colors">Rehberlik</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <button className="font-medium hover:text-brand transition-colors">Giriş Yap</button>
          </Link>
          <Link href="/register">
            <button className="bg-brand hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-[#4F46E5]/30 transition-all active:scale-95">
              Kayıt Ol
            </button>
          </Link>
        </div>
      </header>

      {/* Ana İçerik (Hero) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12 lg:mt-0 relative z-10">
        
        {/* Sol Sütun: Metinler ve Buton */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 pr-0 lg:pr-12"
        >
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-text-heading leading-[1.1]">
            YKS'yi Yıldız <br /> Gibi Öğren.
          </h1>
          <p className="text-lg text-text-body leading-relaxed max-w-lg">
            YKS müfredatı, etkileşimli simülasyonlar ve kişisel adaptif testlerle öğrenmek hiç bu kadar verimli olmamıştı.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/register">
              <button className="bg-brand hover:bg-[#4338CA] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-xl shadow-[#4F46E5]/30 transition-transform hover:-translate-y-1">
                Ücretsiz Başla
              </button>
            </Link>
            <Link href="/register">
              <button className="px-8 py-4 text-text-heading font-medium hover:bg-[#EEF2FF] rounded-xl transition-colors flex items-center gap-2">
                <svg className="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                Sistemi İncele
              </button>
            </Link>
          </div>
          
          {/* Sosyal Kanıt Bölümü */}
          <div className="pt-8 mt-8 border-t border-gray-200">
            <div className="flex gap-6 text-text-muted font-heading font-bold text-lg tracking-wider opacity-70">
              <span>BOĞAZİÇİ</span>
              <span>ODTÜ</span>
              <span>İTÜ</span>
            </div>
            <p className="text-sm text-text-muted mt-2">
              En iyi üniversitelere yerleşen öğrencilerin tercihi.
            </p>
          </div>
        </motion.div>

        {/* Sağ Sütun: Animasyonlu Arayüz Kartı (Mockup) */}
        <div className="relative">
          {/* Arka Plan Dekoratif Parlaması */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10"
          />
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-[#FFFFFF] rounded-2xl p-6 shadow-2xl shadow-gray-200/80 border border-gray-100 relative"
          >
            {/* Havada Asılı Dinamik Bildirim Kartı */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
              className="absolute -right-8 top-1/4 bg-[#FFFFFF] p-4 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-3 z-20 hidden md:flex"
            >
              <div className="text-3xl">🔥</div>
              <div>
                <div className="text-xs text-text-muted font-medium uppercase tracking-wider">Günlük Seri</div>
                <div className="text-lg font-bold text-text-heading leading-tight">12. Gün</div>
              </div>
            </motion.div>

            {/* Sahte Tarayıcı Başlığı */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="mx-auto text-xs text-text-muted font-medium bg-surface px-4 py-1 rounded-full">
                yksyildizi.com/dashboard
              </div>
            </div>

            {/* Mockup İçeriği Şablonu */}
            <div className="space-y-4">
              <div className="h-40 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/10 p-4 flex flex-col justify-end">
                <div className="flex justify-between items-end gap-3 h-full">
                  {barHeights.map((height, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: "0%" }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                      className={`w-full rounded-t-md ${i === 4 ? 'bg-brand' : 'bg-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-surface rounded-xl border border-gray-100 p-4"></div>
                <div className="h-32 bg-surface rounded-xl border border-gray-100 p-4"></div>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
