'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, Zap, Target, CheckCircle2, 
  Sparkles, Maximize2, X, ChevronRight, Star,
  ShieldCheck, Clock, Brain, ArrowUpRight, BarChart3,
  Calendar, Layers, FileCheck2, School
} from 'lucide-react';

export const DEMO_TYT_FALLBACK = [
  { id: 101, name: 'Özdebir Türkiye Geneli TYT-1', date: '01.02.2026', net: 84.75, breakdown: { turkce: 29.5, mat: 26.25, sosyal: 14.5, fen: 14.5 } },
  { id: 102, name: '3D Simülasyon TYT-1', date: '10.02.2026', net: 89.5, breakdown: { turkce: 31.0, mat: 28.5, sosyal: 15.0, fen: 15.0 } },
  { id: 103, name: 'Limit Kronometre TYT-2', date: '19.02.2026', net: 94.25, breakdown: { turkce: 33.25, mat: 30.0, sosyal: 15.5, fen: 15.5 } },
  { id: 104, name: 'Bilgi Sarmal TYT-3', date: '28.02.2026', net: 99.5, breakdown: { turkce: 34.75, mat: 32.5, sosyal: 16.0, fen: 16.25 } },
  { id: 105, name: 'Hız ve Renk Kurumsal TYT-4', date: '09.03.2026', net: 104.25, breakdown: { turkce: 36.5, mat: 34.5, sosyal: 16.25, fen: 17.0 } },
  { id: 106, name: 'ÖSYM Prova Altın Deneme TYT-5', date: '18.03.2026', net: 108.5, breakdown: { turkce: 37.5, mat: 36.75, sosyal: 16.75, fen: 17.5 } },
];

export const DEMO_AYT_FALLBACK = [
  { id: 201, name: 'Özdebir Türkiye Geneli AYT-1', date: '04.02.2026', net: 55.0, breakdown: { mat: 26.5, fizik: 9.0, kimya: 10.0, biyo: 9.5 } },
  { id: 202, name: '3D Simülasyon AYT-2', date: '14.02.2026', net: 61.25, breakdown: { mat: 29.75, fizik: 10.5, kimya: 10.5, biyo: 10.5 } },
  { id: 203, name: 'Bilgi Sarmal AYT-3', date: '24.02.2026', net: 66.5, breakdown: { mat: 32.5, fizik: 11.0, kimya: 11.5, biyo: 11.5 } },
  { id: 204, name: 'Limit AYT-4', date: '06.03.2026', net: 71.75, breakdown: { mat: 35.0, fizik: 12.0, kimya: 12.5, biyo: 12.25 } },
  { id: 205, name: 'ÖSYM Prova Altın Deneme AYT-5', date: '16.03.2026', net: 75.5, breakdown: { mat: 37.5, fizik: 12.5, kimya: 12.75, biyo: 12.75 } },
];

type VisualKey = 'karne' | 'radar' | 'hiz' | 'egri';

interface VisualItem {
  id: VisualKey;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
}

const VISUALS: VisualItem[] = [
  {
    id: 'karne',
    tag: 'GÖRSEL 1 • NET KARNESİ',
    title: 'YKS 2026 Hedef Net Karnesi & Derece Belgesi',
    subtitle: 'Boğaziçi Bilgisayar Mühendisliği Hedefi • TYT 108.5 Net & AYT 75.5 Net',
    icon: <Award size={18} />,
    accentColor: '#10b981'
  },
  {
    id: 'radar',
    tag: 'GÖRSEL 2 • BİLİŞSEL RADAR',
    title: 'Bilişsel Yetkinlik & Konu Hakimiyet Haritası',
    subtitle: '12 Temel Branşta %94+ Hakimiyet • 47 Telafi Edilmiş Hata',
    icon: <Brain size={18} />,
    accentColor: '#8b5cf6'
  },
  {
    id: 'hiz',
    tag: 'GÖRSEL 3 • ZAMAN MATRİSİ',
    title: 'ÖSYM Soru Başına Çözüm Hızı Matrisi',
    subtitle: 'Ortalama 54 sn/soru • +22 Dakika Sınav Sonu Süre Tasarrufu',
    icon: <Zap size={18} />,
    accentColor: '#0ea5e9'
  },
  {
    id: 'egri',
    tag: 'GÖRSEL 4 • SIÇRAMA EĞRİSİ',
    title: '6 Aylık Net Gelişim & Sıçrama Yolculuğu',
    subtitle: 'Ekim 82.5 Net’ten Mart 108.5 Net’e Kesintisiz Zirve Tırmanışı',
    icon: <TrendingUp size={18} />,
    accentColor: '#f59e0b'
  }
];

export default function DemoVisualsShowcase() {
  const [activeVisual, setActiveVisual] = useState<VisualKey>('karne');
  const [modalOpen, setModalOpen] = useState(false);

  const currentItem = VISUALS.find(v => v.id === activeVisual) || VISUALS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '0.5rem' }}>
      
      {/* ── Demo Account Top Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(20, 83, 45, 0.4) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '20%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                color: '#fff',
                fontSize: '22px'
              }}
            >
              🌟
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', letterSpacing: '0.04em' }}>
                  TANITIM & DEMO PORTALI
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7' }}>
                  Hesap: deneme@gmail.com
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  • Sunum & İnceleme Modu
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '6px 0 2px 0', letterSpacing: '-0.01em' }}>
                YKS Yıldızı Analiz & Başarı Vitrini
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, maxWidth: '720px' }}>
                Kullanıcılara ve velilere tanıtım amacıyla hazırlanmış örnek YKS net karnesi, bilişsel konu haritası, soru hızı matrisi ve gelişim eğrisi demo görselleri aşağıda sunulmuştur.
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.1rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.4) 100%)',
              border: '1px solid rgba(167, 139, 250, 0.4)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            <Maximize2 size={14} />
            Demo Görsellerini Büyüt (HD Sunum)
          </button>
        </div>
      </div>

      {/* ── Demo Visual Selector Tabs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {VISUALS.map((item) => {
          const isActive = activeVisual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveVisual(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '14px',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? `1.5px solid ${item.accentColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: isActive ? `0 6px 20px ${item.accentColor}25` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: `${item.accentColor}20`,
                  border: `1px solid ${item.accentColor}40`,
                  color: item.accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: item.accentColor, letterSpacing: '0.04em' }}>
                  {item.tag}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Visual Preview Canvas (Main Showcase Card) ── */}
      <div
        className="premium-card"
        style={{
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          border: `1.5px solid ${currentItem.accentColor}35`,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
          boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${currentItem.accentColor}10`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: currentItem.accentColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              <Sparkles size={13} /> {currentItem.tag}
            </div>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {currentItem.title}
            </h4>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              {currentItem.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
              Tanıtım Görseli
            </span>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Maximize2 size={13} /> Tam Ekran
            </button>
          </div>
        </div>

        {/* Render Selected Visual Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVisual}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeVisual === 'karne' && <VisualKarneContent />}
            {activeVisual === 'radar' && <VisualRadarContent />}
            {activeVisual === 'hiz' && <VisualHizContent />}
            {activeVisual === 'egri' && <VisualEgriContent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fullscreen HD Lightbox Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(3, 7, 18, 0.88)',
              backdropFilter: 'blur(12px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '920px',
                maxHeight: '90vh',
                overflowY: 'auto',
                backgroundColor: '#0f172a',
                border: '1.5px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.2)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: currentItem.accentColor, fontSize: '11px', fontWeight: 800 }}>
                  <Award size={14} /> DEMO GÖRSELİ • HD SUNUM MODU (deneme@gmail.com)
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '4px 0 0 0' }}>
                  {currentItem.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                  {currentItem.subtitle}
                </p>
              </div>

              {/* Modal Body */}
              <div>
                {activeVisual === 'karne' && <VisualKarneContent isLarge />}
                {activeVisual === 'radar' && <VisualRadarContent isLarge />}
                {activeVisual === 'hiz' && <VisualHizContent isLarge />}
                {activeVisual === 'egri' && <VisualEgriContent isLarge />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── Visual 1 Content: YKS Net Karnesi & Sıralama Simülasyonu ───
function VisualKarneContent({ isLarge }: { isLarge?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Certificate Header Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.25) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
            🎓
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#6ee7b7', letterSpacing: '0.04em' }}>
              HEDEF ÜNİVERSİTE VE BÖLÜM
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Boğaziçi Üniversitesi — Bilgisayar Mühendisliği (İngilizce)
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <School size={13} color="#6ee7b7" /> SAY Puan Türü • 2025 Taban Sıralaması: ~1.850 • Öğrenci Durumu: <strong style={{ color: '#34d399' }}>Eşik Başarıyla Aşıldı</strong>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.25)', color: '#6ee7b7', display: 'inline-block', marginBottom: '4px' }}>
            ✓ ONAYLI PROVA BELGESİ
          </span>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
            538.45 <span style={{ fontSize: '0.8rem', color: '#6ee7b7' }}>Puan</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Tahmini YKS Yerleştirme</span>
        </div>
      </div>

      {/* TYT & AYT Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        
        {/* TYT Box */}
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>TYT (120 Soru)</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>108.50 <span style={{ fontSize: '11px', color: '#94a3b8' }}>Net</span></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
            {[
              { label: 'Türkçe', net: '37.50', color: '#f43f5e' },
              { label: 'Matematik', net: '36.75', color: '#38bdf8' },
              { label: 'Fen', net: '17.50', color: '#10b981' },
              { label: 'Sosyal', net: '16.75', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '6px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: s.color, marginTop: '2px' }}>{s.net}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AYT Box */}
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#a78bfa' }}>AYT Sayısal (80 Soru)</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>75.50 <span style={{ fontSize: '11px', color: '#94a3b8' }}>Net</span></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center' }}>
            {[
              { label: 'Matematik', net: '37.50', color: '#38bdf8' },
              { label: 'Fizik', net: '12.50', color: '#8b5cf6' },
              { label: 'Kimya', net: '12.75', color: '#10b981' },
              { label: 'Biyoloji', net: '12.75', color: '#ec4899' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '6px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: s.color, marginTop: '2px' }}>{s.net}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Predicted Rank & Simulation Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Tahmini Türkiye Sıralaması</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>İlk 850 – 1.450</div>
          <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>🏆 Türkiye Geneli İlk %0.04 Dilim</div>
        </div>
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hedef Kazanma Olasılığı</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>%96.4</div>
          <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '2px' }}>Boğaziçi Kotası Üzerinde</div>
        </div>
        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>AI Koç Güvenilirlik Skoru</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', marginTop: '2px' }}>9.8 / 10</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>11 Deneme Analiz Verisiyle</div>
        </div>
      </div>

    </div>
  );
}

// ─── Visual 2 Content: Bilişsel Radar & Konu Hakimiyeti ───
function VisualRadarContent({ isLarge }: { isLarge?: boolean }) {
  const topics = [
    { subject: 'Matematik', topic: 'Limit - Türev - İntegral', mastery: 96, questions: 420, errors: 6, status: 'Üstat' },
    { subject: 'Matematik', topic: 'Trigonometri & Analitik Geometri', mastery: 94, questions: 310, errors: 8, status: 'Üstat' },
    { subject: 'Fizik', topic: 'Modern Fizik & Kuantum Mekaniği', mastery: 92, questions: 260, errors: 7, status: 'İleri' },
    { subject: 'Kimya', topic: 'Organik Kimya (Reaksiyonlar)', mastery: 95, questions: 340, errors: 5, status: 'Üstat' },
    { subject: 'Biyoloji', topic: 'Kalıtım & Biyoteknoloji', mastery: 89, questions: 210, errors: 9, status: 'İleri' },
    { subject: 'Türkçe', topic: 'Paragraf Hız & Çıkarım Gücü', mastery: 94, questions: 580, errors: 12, status: 'Üstat' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Radar Highlight Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 800 }}>BİLİŞSEL YETKİNLİK İNDEKSİ</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>%93.8 Genel Konu Hakimiyeti</div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '12px' }}>
          <span style={{ color: '#4ade80' }}>✓ 47 Hata Telafi Edildi</span>
          <span style={{ color: '#38bdf8' }}>✓ 0 Kritik Açık Konu</span>
          <span style={{ color: '#f59e0b' }}>✓ 2.120 Çözülen Soru</span>
        </div>
      </div>

      {/* Topic Mastery Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: isLarge ? '1fr 1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {topics.map((t, i) => (
          <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>{t.subject}</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{t.topic}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#a78bfa' }}>%{t.mastery}</span>
                <span style={{ fontSize: '10px', display: 'block', color: '#10b981' }}>{t.status}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${t.mastery}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #10b981)', borderRadius: '3px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
              <span>{t.questions} soru çözüldü</span>
              <span>{t.errors} telafi edildi</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Visual 3 Content: ÖSYM Soru Hızı & Zaman Yönetimi ───
function VisualHizContent({ isLarge }: { isLarge?: boolean }) {
  const branchPace = [
    { subject: 'Türkçe', questions: 40, duration: '38 dk 40 sn', avgSec: 58, targetSec: 75, savedMin: '+11 dk', rating: 'S-Tier' },
    { subject: 'Matematik', questions: 40, duration: '43 dk 20 sn', avgSec: 65, targetSec: 80, savedMin: '+10 dk', rating: 'S-Tier' },
    { subject: 'Fen Bilimleri', questions: 20, duration: '14 dk 00 sn', avgSec: 42, targetSec: 50, savedMin: '+2.5 dk', rating: 'A-Tier' },
    { subject: 'Sosyal Bilgiler', questions: 20, duration: '11 dk 20 sn', avgSec: 34, targetSec: 40, savedMin: '+2 dk', rating: 'A-Tier' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Pace Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div style={{ padding: '14px', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>Ortalama Soru Süresi</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>54 Saniye</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>ÖSYM Limiti: 75 sn/soru</div>
        </div>

        <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>Sınav Sonu Süre Fazlası</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>+22 Dakika</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Turlama & Kontrol Zamanı</div>
        </div>

        <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>120 Soru Toplam Süre</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>107 Dakika</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>165 dakikalık sürenin %65'i</div>
        </div>

        <div style={{ padding: '14px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#c4b5fd', fontWeight: 700 }}>Hız & Stres Seviyesi</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a78bfa', marginTop: '2px' }}>🏆 S-Tier</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Elit Zaman Yönetimi</div>
        </div>
      </div>

      {/* Branch Pace Table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>
              <th style={{ padding: '10px 14px' }}>Ders / Branş</th>
              <th style={{ padding: '10px 14px' }}>Soru</th>
              <th style={{ padding: '10px 14px' }}>Bitirme Süresi</th>
              <th style={{ padding: '10px 14px' }}>Ort. Saniye</th>
              <th style={{ padding: '10px 14px' }}>Kazanç</th>
              <th style={{ padding: '10px 14px' }}>Seviye</th>
            </tr>
          </thead>
          <tbody>
            {branchPace.map((b, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#e2e8f0' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{b.subject}</td>
                <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{b.questions}</td>
                <td style={{ padding: '10px 14px', color: '#38bdf8', fontWeight: 600 }}>{b.duration}</td>
                <td style={{ padding: '10px 14px' }}>{b.avgSec} sn/soru</td>
                <td style={{ padding: '10px 14px', color: '#4ade80', fontWeight: 700 }}>{b.savedMin}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
                    {b.rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ─── Visual 4 Content: 6 Aylık Net Sıçrama Eğrisi ───
function VisualEgriContent({ isLarge }: { isLarge?: boolean }) {
  const steps = [
    { month: 'Ekim', net: '82.50 Net', gain: 'Başlangıç', focus: 'Durum Tespiti & Eksik Konu Analizi', badge: 'Tanılama' },
    { month: 'Kasım', net: '88.00 Net', gain: '+5.50 Net', focus: 'Paragraf Hızlandırma & Temel Kavramlar', badge: 'Temel Kampı' },
    { month: 'Aralık', net: '93.50 Net', gain: '+5.50 Net', focus: 'Fonksiyonlar, Geometri & Hareket Dinamiği', badge: 'Gelişim Kampı' },
    { month: 'Ocak', net: '99.00 Net', gain: '+5.50 Net', focus: 'TYT 100 Eşiğine Hücum & Fen Hakimiyeti', badge: 'Eşik Aşıldı' },
    { month: 'Şubat', net: '104.25 Net', gain: '+5.25 Net', focus: 'AYT Sayısal Entegrasyonu & Turlama Tekniği', badge: 'AYT Zirvesi' },
    { month: 'Mart', net: '108.50 Net', gain: '+4.25 Net', focus: 'Boğaziçi Bilgisayar Hedef Kotası Aşıldı! 🚀', badge: 'ZİRVE DERECE' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Big Headline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#fcd34d', fontWeight: 800 }}>SIÇRAMA TRAJEKTORİSİ</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>82.50 Net ➔ 108.50 Net (+26.0 Net Artış)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>+26.0 Net</span>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>6 Aylık Toplam Kazanım</div>
        </div>
      </div>

      {/* Trajectory Step Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isLarge ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {steps.map((st, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              backgroundColor: i === steps.length - 1 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
              border: i === steps.length - 1 ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8' }}>{st.month}</span>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: i === steps.length - 1 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)', color: i === steps.length - 1 ? '#6ee7b7' : '#94a3b8' }}>
                {st.badge}
              </span>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: i === steps.length - 1 ? '#10b981' : '#ffffff', lineHeight: 1 }}>
              {st.net}
            </div>

            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, margin: '4px 0 6px 0' }}>
              {st.gain}
            </div>

            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
              {st.focus}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
