"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Landmark } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import FadeInUp from '@/components/FadeInUp';
import UniversityCarousel from '@/components/UniversityCarousel';
import HeroMockupSlider from '@/components/HeroMockupSlider';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isMobileMenuOpen]);
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
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="text-2xl font-heading font-extrabold text-text-heading z-50">
          YKS Yıldızı
        </div>
        
        {/* Masaüstü Menü */}
        <nav className="hidden md:flex space-x-8 font-medium">
          <Link href="/soru-coz" className="hover:text-brand transition-colors text-text-body">Soru Çöz</Link>
          <Link href="/simulasyonlar" className="hover:text-brand transition-colors text-text-body">Simülasyonlar</Link>
          <Link href="/duello" className="hover:text-brand transition-colors text-text-body">Odalar</Link>
          <Link href="/ligler" className="hover:text-brand transition-colors text-text-body">Ligler</Link>
          <Link href="/rehberlik" className="hover:text-brand transition-colors text-text-body">Rehberlik</Link>
        </nav>
        
        {/* Masaüstü Butonlar */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <button className="font-medium hover:text-brand transition-colors text-text-body">Giriş Yap</button>
          </Link>
          <Link href="/register">
            <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand/30 transition-all active:scale-95">
              Kayıt Ol
            </button>
          </Link>
        </div>

        {/* Mobil Hamburger Butonu */}
        <button 
          className="md:hidden z-50 text-text-heading p-2 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobil Tam Ekran Menü */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-surface z-40 flex flex-col pt-24 px-6 pb-8 md:hidden"
          >
            <div className="flex flex-col space-y-6 text-xl font-heading font-semibold text-center flex-1 mt-10">
              {[
                { title: "Soru Çöz", href: "/soru-coz" },
                { title: "Simülasyonlar", href: "/simulasyonlar" },
                { title: "Odalar", href: "/duello" },
                { title: "Ligler", href: "/ligler" },
                { title: "Rehberlik", href: "/rehberlik" },
              ].map((link, index) => (
                <Link key={index} href={link.href} passHref legacyBehavior>
                  <motion.a 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (index * 0.1) }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-text-heading hover:text-brand transition-colors"
                  >
                    {link.title}
                  </motion.a>
                </Link>
              ))}
            </div>

            {/* Mobil Alt Butonlar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col space-y-4 w-full mt-auto"
            >
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 text-text-heading font-medium border border-gray-200 rounded-xl">
                  Giriş Yap
                </button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full py-4 bg-brand text-white font-medium rounded-xl shadow-lg shadow-brand/30">
                  Kayıt Ol
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          
          {/* Sosyal Kanıt Bölümü (Marquee) */}
          <div className="w-full">
            <p className="text-sm text-text-muted mt-8 font-medium">
              Türkiye'nin en iyi üniversitelerine yerleşen öğrencilerin tercihi.
            </p>
            <UniversityCarousel />
          </div>
        </motion.div>

        {/* Sağ Sütun: Animasyonlu Arayüz Kartı (Mockup) */}
        <div className="relative w-full">
          <HeroMockupSlider />
        </div>

      </main>

      {/* İstatistik Bölümü */}
      <div className="py-20 bg-white border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          
          <div className="space-y-2">
            <div className="text-4xl font-heading font-extrabold text-text-heading flex justify-center items-center">
              <AnimatedCounter targetValue={8800} />
              <span className="text-brand">+</span>
            </div>
            <p className="text-sm font-medium text-text-muted">Soru Havuzu</p>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-heading font-extrabold text-text-heading flex justify-center items-center">
              <AnimatedCounter targetValue={2400} />
              <span className="text-brand">+</span>
            </div>
            <p className="text-sm font-medium text-text-muted">Aktif Öğrenci</p>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-heading font-extrabold text-text-heading">
              <AnimatedCounter targetValue={54} />
            </div>
            <p className="text-sm font-medium text-text-muted">Alt Konu Başlığı</p>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-heading font-extrabold text-text-heading flex justify-center items-center">
              <span>4.9</span>
              <span className="text-2xl text-text-muted ml-1">/5</span>
            </div>
            <p className="text-sm font-medium text-text-muted">Öğrenci Puanı</p>
          </div>

        </div>
      </div>

      {/* ─── FEATURES SECTION (NEDEN YKS YILDIZI?) ─── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-16">
            <FadeInUp delay={0.1}>
              <h2 className="text-4xl font-heading font-extrabold text-text-heading mb-6">
                Neden YKS Yıldızı?
              </h2>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-lg text-text-body">
                Klasik test kitaplarını ve statik soru bankalarını unutun. Yapay zeka ile kişiselleştirilmiş, oyunlaştırılmış ve ölçülebilir bir öğrenme deneyimi sunuyoruz.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInUp delay={0.3}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">01</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">Adaptif Öğrenme</h3>
                <p className="text-text-body leading-relaxed">
                  8.800+ sorudan oluşan havuzda, zayıf olduğun konular yapay zeka tarafından analiz edilir ve odaklanman gereken testler önüne getirilir.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">02</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">Sıralama Ligleri</h3>
                <p className="text-text-body leading-relaxed">
                  Türkiye genelindeki öğrencilerle yarış. Rozetler kazan, XP biriktir ve Platin Lig'e kadar tırmanarak başarı hissini yaşa.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">03</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">3D Simülasyonlar</h3>
                <p className="text-text-body leading-relaxed">
                  Fizik, Kimya ve Biyoloji derslerindeki soyut kavramları PhET entegrasyonu ve 3D modeller ile görselleştirerek öğren.
                </p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 bg-white border-t border-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInUp delay={0.1}>
            <h2 className="text-4xl font-heading font-extrabold text-text-heading mb-6">
              Hayalindeki Üniversiteye<br />Bir Adım Kaldı
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-lg text-text-body max-w-2xl mx-auto mb-10">
              Hemen ücretsiz hesabını oluştur ve yeni nesil YKS hazırlık platformuyla rakiplerinin bir adım önüne geç.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.3}>
            <Link href="/register">
              <button className="bg-brand hover:bg-brand-hover text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-brand/30 transition-transform hover:-translate-y-1">
                Ücretsiz Hesabını Oluştur
              </button>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="text-xl font-heading font-extrabold text-text-heading flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" fill="currentColor"/>
                </svg>
                YKS Yıldızı
              </div>
              <p className="text-sm text-text-body">
                Türkiye'nin en modern, adaptif ve veri odaklı üniversiteye hazırlık ekosistemi.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li><Link href="/soru-coz" className="hover:text-brand transition-colors">Soru Havuzu</Link></li>
                <li><Link href="/simulasyonlar" className="hover:text-brand transition-colors">Simülasyonlar</Link></li>
                <li><Link href="/ligler" className="hover:text-brand transition-colors">Ligler & Düello</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">Hizmetler</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li><Link href="/rehberlik" className="hover:text-brand transition-colors">AstraTutor AI</Link></li>
                <li><Link href="/forum" className="hover:text-brand transition-colors">Öğrenci Forumu</Link></li>
                <li><Link href="/veli" className="hover:text-brand transition-colors">Veli Takibi</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">İletişim</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li>destek@yksyildizi.com</li>
                <li>0850 123 45 67</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">© 2026 YKS Yıldızı. Tüm hakları saklıdır.</p>
            <div className="flex gap-6 text-xs text-text-muted font-medium">
              <Link href="/gizlilik" className="hover:text-brand">Gizlilik Politikası</Link>
              <Link href="/kullanim" className="hover:text-brand">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
