"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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

  return (
    <div className="min-h-screen bg-surface font-sans text-text-body flex flex-col">
      {/* Üst Menü (Navbar) */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12 lg:mt-0">
        
        {/* Sol Sütun: Metinler ve Buton */}
        <div className="space-y-8 pr-0 lg:pr-12">
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-text-heading leading-[1.1]">
            YKS'yi Yıldız <br /> Gibi Öğren.
          </h1>
          <p className="text-lg text-text-body leading-relaxed max-w-lg">
            YKS müfredatı, etkileşimli simülasyonlar ve kişisel adaptif testlerle öğrenmek hiç bu kadar verimli olmamıştı.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/register">
              <button className="bg-brand hover:bg-[#4338CA] text-white px-8 py-4 rounded-xl text-lg font-medium shadow-xl shadow-[#4F46E5]/30 transition-all hover:-translate-y-1">
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
        </div>

        {/* Sağ Sütun: Arayüz Kartı (Mockup) */}
        <div className="relative">
          {/* Arka Plan Dekoratif Parlaması */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-2xl shadow-gray-200/80 border border-gray-100">
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
              <div className="h-32 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/10 p-4 flex flex-col justify-end">
                <div className="flex justify-between items-end gap-2">
                  {[40, 60, 30, 80, 100, 50, 70].map((height, i) => (
                    <div key={i} className={`w-full rounded-t-md ${i === 4 ? 'bg-brand' : 'bg-gray-200'}`} style={{ height: `${height}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-40 bg-surface rounded-xl border border-gray-100 p-4"></div>
                <div className="h-40 bg-surface rounded-xl border border-gray-100 p-4"></div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
