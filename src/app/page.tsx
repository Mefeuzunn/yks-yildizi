"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────────────────────
   INLINE PRODUCT MOCKUP — Bento-style dashboard
   preview rendered as pure HTML/CSS
   ───────────────────────────────────────────── */
const ProductMockup = () => (
  <div style={{
    width: '100%',
    maxWidth: 520,
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  }}>
    {/* Top bar */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      borderBottom: '1px solid #F3F4F6',
      background: '#FAFAFA',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
      </div>
      <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.02em' }}>
        yksyildizi.com/dashboard
      </span>
      <div style={{ width: 40 }} />
    </div>

    {/* Bento Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 }}>

      {/* Progress Chart Card */}
      <div style={{
        gridColumn: '1 / -1',
        background: '#FAFAFA',
        border: '1px solid #F3F4F6',
        borderRadius: 6,
        padding: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Haftalık İlerleme</span>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>Bu hafta</span>
        </div>
        {/* Mini bar chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48 }}>
          {[32, 48, 28, 56, 72, 64, 44].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              background: i === 4 ? '#2563EB' : '#E5E7EB',
              borderRadius: 3,
              transition: 'height 0.3s ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d, i) => (
            <span key={i} style={{ fontSize: 9, color: '#9CA3AF', flex: 1, textAlign: 'center' }}>{d}</span>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div style={{
        background: '#FAFAFA',
        border: '1px solid #F3F4F6',
        borderRadius: 6,
        padding: 14,
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#2563EB', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Matematik</span>
        <p style={{ fontSize: 11, color: '#374151', marginTop: 6, lineHeight: 1.5 }}>
          f(x) = x³ − 3x² + 5 fonksiyonunun yerel minimum noktası?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {['A) −1', 'B) 0', 'C) 2', 'D) 3'].map((opt, i) => (
            <div key={i} style={{
              fontSize: 10,
              padding: '5px 8px',
              borderRadius: 4,
              border: i === 2 ? '1.5px solid #2563EB' : '1px solid #E5E7EB',
              background: i === 2 ? '#EFF6FF' : '#FFFFFF',
              color: i === 2 ? '#2563EB' : '#4B5563',
              fontWeight: i === 2 ? 600 : 400,
            }}>{opt}</div>
          ))}
        </div>
      </div>

      {/* Stats Card */}
      <div style={{
        background: '#FAFAFA',
        border: '1px solid #F3F4F6',
        borderRadius: 6,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Günlük Seri</span>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginTop: 4 }}>12</div>
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>gün üst üste</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,1,1,1,1,1,1,1,1,1,1,1,0,0].map((active, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 2,
                background: active ? '#059669' : '#E5E7EB',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);


/* ─────────────────────────────────────────────
   FEATURE CARD COMPONENT
   ───────────────────────────────────────────── */
const FeatureCard = ({ title, description, number }: { title: string; description: string; number: string }) => (
  <div style={{
    padding: '32px 28px',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
  }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
      (e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB';
    }}
  >
    <span style={{
      display: 'inline-block',
      fontSize: 12,
      fontWeight: 600,
      color: '#2563EB',
      marginBottom: 16,
      fontVariantNumeric: 'tabular-nums',
    }}>{number}</span>
    <h3 style={{
      fontSize: 18,
      fontWeight: 600,
      color: '#111827',
      marginBottom: 8,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    }}>{title}</h3>
    <p style={{
      fontSize: 14,
      color: '#6B7280',
      lineHeight: 1.65,
    }}>{description}</p>
  </div>
);


/* ─────────────────────────────────────────────
   STAT BLOCK COMPONENT
   ───────────────────────────────────────────── */
const StatBlock = ({ value, label }: { value: string; label: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontSize: 40,
      fontWeight: 700,
      color: '#111827',
      letterSpacing: '-0.03em',
      lineHeight: 1,
    }}>{value}</div>
    <div style={{
      fontSize: 14,
      color: '#6B7280',
      marginTop: 6,
      fontWeight: 400,
    }}>{label}</div>
  </div>
);


/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────── */
export default function Home() {
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
    <>
      {/* ── SCOPED STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .landing-root {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #FAFAFA;
          color: #111827;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          min-height: 100vh;
        }

        /* Reset dark theme artifacts from layout */
        .landing-root * {
          box-shadow: none;
        }

        .landing-root a {
          color: inherit;
          text-decoration: none;
        }

        .landing-root button {
          box-shadow: none;
          transform: none;
          filter: none;
        }

        .landing-root button:hover {
          box-shadow: none;
          transform: none;
          filter: none;
        }

        .landing-root button:active {
          box-shadow: none;
          transform: none !important;
          filter: none;
        }

        .landing-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #4B5563;
          transition: color 0.15s ease;
          padding: 4px 0;
          background: none !important;
          border: none !important;
        }
        .landing-nav-link:hover {
          color: #111827;
        }

        .landing-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background: #2563EB;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
          font-family: 'Inter', sans-serif;
        }
        .landing-btn-primary:hover {
          background: #1D4ED8;
        }

        .landing-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          background: transparent;
          color: #4B5563;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: color 0.15s ease;
          font-family: 'Inter', sans-serif;
        }
        .landing-btn-ghost:hover {
          color: #111827;
        }

        .landing-btn-hero {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          background: #2563EB;
          color: #FFFFFF;
          font-size: 16px;
          font-weight: 600;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
          font-family: 'Inter', sans-serif;
        }
        .landing-btn-hero:hover {
          background: #1D4ED8;
        }

        .landing-h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 0;
        }

        .landing-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .landing-divider {
          width: 100%;
          height: 1px;
          background: #E5E7EB;
        }

        .footer-col-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .footer-link-item {
          display: block;
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 10px;
          transition: color 0.15s ease;
        }
        .footer-link-item:hover {
          color: #111827;
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            text-align: center;
          }
          .hero-mockup {
            justify-self: center !important;
          }
          .hero-copy {
            align-items: center !important;
          }
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>

      <div className="landing-root">

        {/* ─── NAVBAR ─── */}
        <nav style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(250, 250, 250, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div className="landing-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.03em',
              }}>YKS Yıldızı</span>
            </Link>

            {/* Center Links */}
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <Link href="/soru-coz" className="landing-nav-link">Soru Çöz</Link>
              <Link href="/simulasyonlar" className="landing-nav-link">Simülasyonlar</Link>
              <Link href="/calisma-odalari" className="landing-nav-link">Odalar</Link>
              <Link href="/ligler" className="landing-nav-link">Ligler</Link>
              <Link href="/rehberlik" className="landing-nav-link">Rehberlik</Link>
            </div>

            {/* Auth Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Link href="/login">
                <button className="landing-btn-ghost">Giriş Yap</button>
              </Link>
              <Link href="/register">
                <button className="landing-btn-primary">Kayıt Ol</button>
              </Link>
            </div>
          </div>
          <div className="landing-divider" />
        </nav>


        {/* ─── HERO SECTION ─── */}
        <section style={{ paddingTop: 80, paddingBottom: 96 }}>
          <div className="landing-container">
            <div className="hero-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 64,
              alignItems: 'center',
            }}>

              {/* Left: Copy */}
              <div className="hero-copy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h1 className="landing-h1">
                  YKS'yi Yıldız<br />Gibi Öğren.
                </h1>
                <p style={{
                  fontSize: 17,
                  color: '#4B5563',
                  lineHeight: 1.65,
                  marginTop: 20,
                  maxWidth: 460,
                }}>
                  YKS müfredatı, etkileşimli simülasyonlar ve kişisel adaptif testlerle
                  öğrenmek hiç bu kadar verimli olmamıştı.
                </p>

                <Link href="/register" style={{ marginTop: 32 }}>
                  <button className="landing-btn-hero">Ücretsiz Başla</button>
                </Link>

                {/* Social Proof */}
                <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {['Boğaziçi', 'ODTÜ', 'İTÜ'].map((uni, i) => (
                      <span key={i} style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#9CA3AF',
                        letterSpacing: '0.01em',
                        textTransform: 'uppercase',
                      }}>{uni}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                    En iyi üniversitelere yerleşen öğrencilerin tercihi.
                  </span>
                </div>
              </div>

              {/* Right: Product Mockup */}
              <div className="hero-mockup" style={{ justifySelf: 'end' }}>
                <ProductMockup />
              </div>

            </div>
          </div>
        </section>


        {/* ─── STATS BAR ─── */}
        <section style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '56px 0', background: '#FFFFFF' }}>
          <div className="landing-container">
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 48,
            }}>
              <StatBlock value="8.800+" label="Soru havuzu" />
              <StatBlock value="2.400+" label="Aktif öğrenci" />
              <StatBlock value="54" label="Alt konu başlığı" />
              <StatBlock value="4.9/5" label="Öğrenci puanı" />
            </div>
          </div>
        </section>


        {/* ─── FEATURES SECTION ─── */}
        <section style={{ padding: '96px 0' }}>
          <div className="landing-container">
            <div style={{ maxWidth: 480, marginBottom: 56 }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#111827',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: 12,
              }}>Neden YKS Yıldızı?</h2>
              <p style={{
                fontSize: 16,
                color: '#6B7280',
                lineHeight: 1.65,
              }}>
                Klasik test kitaplarını ve statik soru bankalarını unutun.
                Her öğrenciye özel, ölçülebilir bir öğrenme deneyimi sunuyoruz.
              </p>
            </div>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}>
              <FeatureCard
                number="01"
                title="Adaptif Soru Havuzu"
                description="8.800+ sorudan oluşan havuzda, yanlış yaptığın konular otomatik olarak ağırlıklandırılır. Sana en verimli çalışma setini sunar."
              />
              <FeatureCard
                number="02"
                title="Gerçek Zamanlı Düello"
                description="Türkiye genelindeki öğrencilerle birebir yarış. Süreye karşı çöz, sıralamanı yükselt ve zayıf konularını keşfet."
              />
              <FeatureCard
                number="03"
                title="Akıllı Hata Defteri"
                description="Her yanlışın kayıt altına alınır ve benzerleri sana tekrar gösterilir. Konuyu tam öğrenene kadar takip eder."
              />
              <FeatureCard
                number="04"
                title="Etkileşimli Simülasyonlar"
                description="Fizik, Kimya ve Matematik konularını görsel simülasyonlarla deneyimle. Soyut kavramları somutlaştır."
              />
              <FeatureCard
                number="05"
                title="Çalışma Odaları"
                description="Pomodoro zamanlayıcı, lofi müzik ve ortak çalışma ortamıyla motivasyonunu yüksek tut."
              />
              <FeatureCard
                number="06"
                title="Kişisel Rehberlik"
                description="Tercih robotu ve puan hesaplama araçlarıyla hedefine en uygun üniversite ve bölümü belirle."
              />
            </div>
          </div>
        </section>


        {/* ─── CTA SECTION ─── */}
        <section style={{ padding: '80px 0', background: '#FFFFFF', borderTop: '1px solid #E5E7EB' }}>
          <div className="landing-container" style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#111827',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: 12,
            }}>Hayalindeki Üniversiteye Bir Adım Kaldı</h2>
            <p style={{
              fontSize: 16,
              color: '#6B7280',
              lineHeight: 1.65,
              maxWidth: 480,
              margin: '0 auto',
            }}>
              Hemen ücretsiz hesabını oluştur ve YKS'ye hazırlanmanın en verimli yoluyla tanış.
            </p>
            <Link href="/register" style={{ display: 'inline-block', marginTop: 28 }}>
              <button className="landing-btn-hero">Ücretsiz Başla</button>
            </Link>
          </div>
        </section>


        {/* ─── FOOTER ─── */}
        <footer style={{ borderTop: '1px solid #E5E7EB', padding: '56px 0 32px', background: '#FAFAFA' }}>
          <div className="landing-container">
            <div className="footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 48,
              marginBottom: 40,
            }}>
              {/* Brand */}
              <div>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#111827',
                  letterSpacing: '-0.03em',
                  display: 'block',
                  marginBottom: 12,
                }}>YKS Yıldızı</span>
                <p style={{
                  fontSize: 14,
                  color: '#6B7280',
                  lineHeight: 1.65,
                  maxWidth: 280,
                }}>
                  Türkiye'nin adaptif, veri odaklı üniversiteye hazırlık platformu.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 className="footer-col-title">Platform</h4>
                <Link href="/soru-coz" className="footer-link-item">Soru Çöz</Link>
                <Link href="/simulasyonlar" className="footer-link-item">Simülasyonlar</Link>
                <Link href="/duello" className="footer-link-item">Düello</Link>
                <Link href="/puan-hesaplama" className="footer-link-item">Puan Hesapla</Link>
              </div>

              {/* Destek */}
              <div>
                <h4 className="footer-col-title">Destek</h4>
                <Link href="/rehberlik" className="footer-link-item">Rehberlik</Link>
                <Link href="/forum" className="footer-link-item">Forum</Link>
                <Link href="/veli" className="footer-link-item">Veli Paneli</Link>
              </div>

              {/* İletişim */}
              <div>
                <h4 className="footer-col-title">İletişim</h4>
                <span className="footer-link-item">destek@yksyildizi.com</span>
                <span className="footer-link-item">0850 123 45 67</span>
              </div>
            </div>

            <div className="landing-divider" />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>© 2026 YKS Yıldızı. Tüm hakları saklıdır.</span>
              <div style={{ display: 'flex', gap: 20 }}>
                <Link href="/gizlilik" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.15s' }}>Gizlilik Politikası</Link>
                <Link href="/kullanim" style={{ fontSize: 13, color: '#9CA3AF', transition: 'color 0.15s' }}>Kullanım Koşulları</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
