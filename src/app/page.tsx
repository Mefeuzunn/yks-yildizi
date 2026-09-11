"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ProductMockup = () => (
  <div style={{
    width: '100%',
    maxWidth: 520,
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 20px 40px -10px rgba(79, 70, 229, 0.15)',
    overflow: 'hidden',
    fontFamily: 'var(--font-inter), sans-serif',
  }}>
    {/* Top bar */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid #F1F5F9',
      background: '#F8FAFC',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
      </div>
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6,
        padding: '4px 8px', fontSize: 11, color: '#94A3B8', fontWeight: 500
      }}>
        yksyildizi.com/dashboard
      </div>
      <div style={{ width: 44 }} />
    </div>

    {/* Content */}
    <div style={{ padding: 24 }}>
      <h3 style={{
        fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16,
        textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-outfit), sans-serif'
      }}>
        Haftalık İlerleme
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginBottom: 24 }}>
        {[30, 45, 25, 75, 55, 90, 40].map((h, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: '100%', height: `${h}%`,
              background: i === 5 ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' : '#E2E8F0',
              borderRadius: 4, transition: 'all 0.3s ease'
            }} />
            <span style={{ fontSize: 10, color: i === 5 ? '#4F46E5' : '#94A3B8', fontWeight: 600 }}>
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#F8FAFC' }}>
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600, display: 'block', marginBottom: 4 }}>MATEMATİK</span>
          <p style={{ fontSize: 12, color: '#0F172A', fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>
            f(x) = x² - 4x + m - 1 fonk. tepe noktası?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, color: '#475569' }}>A) m - 2</div>
            <div style={{ padding: '6px 12px', background: '#EEF2FF', border: '1px solid #4F46E5', borderRadius: 6, fontSize: 11, color: '#4F46E5', fontWeight: 600 }}>B) m - 5</div>
            <div style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 11, color: '#475569' }}>C) m + 1</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, display: 'block', marginBottom: 2 }}>GÜNLÜK SERİ</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', fontFamily: 'var(--font-outfit), sans-serif' }}>12</span>
              <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>Gün</span>
            </div>
          </div>
          <div style={{ background: '#10B981', borderRadius: 12, padding: 16, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9, display: 'block', marginBottom: 2 }}>HEDEF YÜZDESİ</span>
              <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i < 7 ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StatBlock = ({ value, label }: { value: string, label: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      fontSize: 40, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: 4,
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      {value}
    </div>
    <div style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>
      {label}
    </div>
  </div>
);

const FeatureCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: '32px 24px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(79, 70, 229, 0.15)';
    e.currentTarget.style.borderColor = '#C7D2FE';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
    e.currentTarget.style.borderColor = '#E2E8F0';
  }}>
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      background: '#EEF2FF',
      color: '#4F46E5',
      fontSize: 12,
      fontWeight: 700,
      borderRadius: 8,
      marginBottom: 16,
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>{number}</span>
    <h3 style={{
      fontSize: 18,
      fontWeight: 700,
      color: '#0F172A',
      marginBottom: 12,
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>{title}</h3>
    <p style={{
      fontSize: 14,
      color: '#475569',
      lineHeight: 1.6,
    }}>
      {description}
    </p>
  </div>
);

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
    <>
      <style>{`
        .landing-root {
          font-family: var(--font-inter), sans-serif;
          background: #F8FAFC;
          color: #0F172A;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          min-height: 100vh;
        }

        .landing-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .landing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
        }

        .landing-nav-links {
          display: flex;
          gap: 32px;
        }

        .landing-nav-link {
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: color 0.15s;
        }

        .landing-nav-link:hover {
          color: #0F172A;
        }

        .landing-btn-outline {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          background: transparent;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .landing-btn-outline:hover {
          border-color: #CBD5E1;
          color: #0F172A;
          background: #F1F5F9;
        }

        .landing-btn-primary {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
        }

        .landing-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px -2px rgba(79, 70, 229, 0.3);
        }

        .landing-btn-hero {
          padding: 16px 36px;
          font-size: 16px;
          font-weight: 700;
          color: #FFFFFF;
          background: linear-gradient(135deg, #4F46E5 0%, #4338CA 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);
        }

        .landing-btn-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.45);
        }

        .footer-link-item {
          display: block;
          font-size: 14px;
          color: #475569;
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.15s;
        }
        
        .footer-link-item:hover {
          color: #4F46E5;
        }

        .footer-col-title {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: var(--font-outfit), sans-serif;
        }

        @media (max-width: 900px) {
          .landing-nav-links { display: none; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px; text-align: center; }
          .hero-content { margin: 0 auto; align-items: center; }
          .hero-mockup { justify-self: center !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      <div className="landing-root">
        
        {/* ─── HEADER ─── */}
        <header style={{ borderBottom: '1px solid #E2E8F0', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div className="landing-container landing-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', fontFamily: 'var(--font-outfit), sans-serif' }}>
                YKS Yıldızı
              </span>
            </div>

            <nav className="landing-nav-links">
              <Link href="/soru-coz" className="landing-nav-link">Soru Çöz</Link>
              <Link href="/simulasyonlar" className="landing-nav-link">Simülasyonlar</Link>
              <Link href="/duello" className="landing-nav-link">Odalar</Link>
              <Link href="/ligler" className="landing-nav-link">Ligler</Link>
              <Link href="/rehberlik" className="landing-nav-link">Rehberlik</Link>
            </nav>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/login">
                <button className="landing-btn-outline">Giriş Yap</button>
              </Link>
              <Link href="/register">
                <button className="landing-btn-primary">Kayıt Ol</button>
              </Link>
            </div>
          </div>
        </header>

        {/* ─── HERO SECTION ─── */}
        <section style={{ padding: '80px 0 100px', overflow: 'hidden' }}>
          <div className="landing-container">
            <div className="hero-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 32,
              alignItems: 'center'
            }}>
              
              {/* Left: Copy */}
              <div className="hero-content" style={{ display: 'flex', flexDirection: 'column', maxWidth: 540 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', background: '#EEF2FF', borderRadius: 20,
                  marginBottom: 24, alignSelf: 'flex-start', border: '1px solid #C7D2FE'
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5', letterSpacing: '0.02em' }}>Yeni Nesil YKS Platformu</span>
                </div>

                <h1 style={{
                  fontSize: 56,
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  marginBottom: 24,
                  fontFamily: 'var(--font-outfit), sans-serif'
                }}>
                  YKS'yi Yıldız<br />Gibi <span style={{ color: '#4F46E5' }}>Öğren.</span>
                </h1>
                
                <p style={{
                  fontSize: 18,
                  color: '#475569',
                  lineHeight: 1.6,
                  marginBottom: 32,
                }}>
                  YKS müfredatı, etkileşimli simülasyonlar ve kişisel adaptif testlerle öğrenmek hiç bu kadar modern ve verimli olmamıştı.
                </p>

                <div style={{ display: 'flex', gap: 16 }}>
                  <Link href="/register">
                    <button className="landing-btn-hero">Ücretsiz Başla</button>
                  </Link>
                </div>

                {/* Social Proof */}
                <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    {['BOĞAZİÇİ', 'ODTÜ', 'İTÜ', 'BİLKENT'].map(uni => (
                      <span key={uni} style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#94A3B8',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-outfit), sans-serif'
                      }}>{uni}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
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
        <section style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '56px 0', background: '#FFFFFF' }}>
          <div className="landing-container">
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 48,
            }}>
              <StatBlock value="8.800+" label="Soru Havuzu" />
              <StatBlock value="2.400+" label="Aktif Öğrenci" />
              <StatBlock value="54" label="Alt Konu Başlığı" />
              <StatBlock value="4.9/5" label="Öğrenci Puanı" />
            </div>
          </div>
        </section>


        {/* ─── FEATURES SECTION ─── */}
        <section style={{ padding: '96px 0', background: '#F8FAFC' }}>
          <div className="landing-container">
            <div style={{ maxWidth: 540, marginBottom: 56, textAlign: 'center', margin: '0 auto 64px' }}>
              <h2 style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                marginBottom: 16,
                fontFamily: 'var(--font-outfit), sans-serif'
              }}>Neden YKS Yıldızı?</h2>
              <p style={{
                fontSize: 16,
                color: '#475569',
                lineHeight: 1.6,
              }}>
                Klasik test kitaplarını ve sıkıcı eğitim materyallerini unutun. Modern, oyunlaştırılmış ve yapay zeka destekli eğitim modeline geçin.
              </p>
            </div>

            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}>
              <FeatureCard
                number="01"
                title="Adaptif Öğrenme"
                description="8.800+ sorudan oluşan havuzda, zayıf olduğun konular yapay zeka tarafından analiz edilir ve odaklanman gereken testler önüne getirilir."
              />
              <FeatureCard
                number="02"
                title="Sıralama Ligleri"
                description="Türkiye genelindeki öğrencilerle yarış. Rozetler kazan, XP biriktir ve Platin Lig'e kadar tırmanarak başarı hissini yaşa."
              />
              <FeatureCard
                number="03"
                title="Akıllı Hata Defteri"
                description="Çözdüğün her testteki hatalar akıllı defterine kaydedilir. Benzer soru tipleriyle pratik yaparak konuyu eksiksiz öğren."
              />
              <FeatureCard
                number="04"
                title="3D Simülasyonlar"
                description="Fizik, Kimya ve Biyoloji derslerindeki soyut kavramları PhET entegrasyonu ve 3D modeller ile görselleştir."
              />
              <FeatureCard
                number="05"
                title="Çalışma Odaları"
                description="Pomodoro tekniği, Lofi çalışma müzikleri ve odak hayvanınla (sanal pet) çalışma verimini en üst seviyeye çıkar."
              />
              <FeatureCard
                number="06"
                title="AstraTutor AI Koç"
                description="7/24 sorularını sorabileceğin, sana özel çalışma planı çizen ve tercih sürecinde rehberlik yapan yapay zeka eğitim koçu."
              />
            </div>
          </div>
        </section>


        {/* ─── CTA SECTION ─── */}
        <section style={{ padding: '100px 0', background: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div className="landing-container" style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: 40,
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: 16,
              fontFamily: 'var(--font-outfit), sans-serif'
            }}>Hayalindeki Üniversiteye<br />Bir Adım Kaldı</h2>
            <p style={{
              fontSize: 18,
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: 520,
              margin: '0 auto',
            }}>
              Hemen ücretsiz hesabını oluştur ve yeni nesil YKS hazırlık platformuyla rakiplerinin bir adım önüne geç.
            </p>
            <Link href="/register" style={{ display: 'inline-block', marginTop: 32 }}>
              <button className="landing-btn-hero">Ücretsiz Hesabını Oluştur</button>
            </Link>
          </div>
        </section>


        {/* ─── FOOTER ─── */}
        <footer style={{ padding: '64px 0 32px', background: '#F8FAFC' }}>
          <div className="landing-container">
            <div className="footer-grid" style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 48,
              marginBottom: 48,
            }}>
              {/* Brand */}
              <div>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  marginBottom: 16,
                  fontFamily: 'var(--font-outfit), sans-serif'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" fill="currentColor"/>
                  </svg>
                  YKS Yıldızı
                </span>
                <p style={{
                  fontSize: 14,
                  color: '#475569',
                  lineHeight: 1.6,
                  maxWidth: 280,
                }}>
                  Türkiye'nin en modern, adaptif ve veri odaklı üniversiteye hazırlık ekosistemi.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 className="footer-col-title">Platform</h4>
                <Link href="/soru-coz" className="footer-link-item">Soru Havuzu</Link>
                <Link href="/simulasyonlar" className="footer-link-item">Simülasyonlar</Link>
                <Link href="/ligler" className="footer-link-item">Ligler & Düello</Link>
                <Link href="/puan-hesaplama" className="footer-link-item">YÖK Atlas Analiz</Link>
              </div>

              {/* Destek */}
              <div>
                <h4 className="footer-col-title">Hizmetler</h4>
                <Link href="/rehberlik" className="footer-link-item">AstraTutor AI</Link>
                <Link href="/forum" className="footer-link-item">Öğrenci Forumu</Link>
                <Link href="/ogretmen/dashboard" className="footer-link-item">Öğretmen Paneli</Link>
                <Link href="/veli" className="footer-link-item">Veli Takibi</Link>
              </div>

              {/* İletişim */}
              <div>
                <h4 className="footer-col-title">İletişim</h4>
                <span className="footer-link-item">destek@yksyildizi.com</span>
                <span className="footer-link-item">0850 123 45 67</span>
              </div>
            </div>

            <div style={{ height: 1, background: '#E2E8F0', width: '100%' }} />
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 24,
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <span style={{ fontSize: 13, color: '#94A3B8' }}>© 2026 YKS Yıldızı. Tüm hakları saklıdır.</span>
              <div style={{ display: 'flex', gap: 24 }}>
                <Link href="/gizlilik" style={{ fontSize: 13, color: '#94A3B8', transition: 'color 0.15s' }}>Gizlilik Politikası</Link>
                <Link href="/kullanim" style={{ fontSize: 13, color: '#94A3B8', transition: 'color 0.15s' }}>Kullanım Koşulları</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
