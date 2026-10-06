'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  Layers, 
  ExternalLink,
  Sparkles,
  Flame,
  Clock,
  Target,
  BookOpen,
  QrCode,
  Palette,
  ShieldCheck,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '@/lib/haptics';

interface WidgetInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WidgetType = 'compact' | 'medium' | 'tip' | 'live';
type WidgetTheme = 'oled' | 'purple' | 'emerald' | 'gold';
type PlatformTab = 'ios' | 'android' | 'qr';

interface WidgetData {
  daysRemaining: number;
  todayQuestions: number;
  dailyGoal: number;
  streak: number;
  currentLeague: string;
  motivationalQuote: string;
  username: string;
  focusMinutesToday: number;
}

const THEMES: Record<WidgetTheme, {
  name: string;
  badge: string;
  bg: string;
  border: string;
  accent: string;
  accentGlow: string;
  textMuted: string;
  highlightBg: string;
}> = {
  oled: {
    name: 'OLED Gece',
    badge: '🌌',
    bg: 'linear-gradient(145deg, #020617, #0b0f19)',
    border: 'rgba(56, 189, 248, 0.35)',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    textMuted: '#94a3b8',
    highlightBg: 'rgba(56, 189, 248, 0.12)',
  },
  purple: {
    name: 'Kozmik Mor',
    badge: '🔮',
    bg: 'linear-gradient(145deg, #1e1b4b, #0f172a)',
    border: 'rgba(168, 85, 247, 0.4)',
    accent: '#c084fc',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    textMuted: '#cbd5e1',
    highlightBg: 'rgba(168, 85, 247, 0.15)',
  },
  emerald: {
    name: 'Siber Zümrüt',
    badge: '⚡',
    bg: 'linear-gradient(145deg, #022c22, #0b0f19)',
    border: 'rgba(16, 185, 129, 0.4)',
    accent: '#34d399',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    textMuted: '#a7f3d0',
    highlightBg: 'rgba(16, 185, 129, 0.15)',
  },
  gold: {
    name: 'Şampiyon Altın',
    badge: '👑',
    bg: 'linear-gradient(145deg, #451a03, #0f172a)',
    border: 'rgba(245, 158, 11, 0.45)',
    accent: '#fbbf24',
    accentGlow: 'rgba(245, 158, 11, 0.3)',
    textMuted: '#fde68a',
    highlightBg: 'rgba(245, 158, 11, 0.15)',
  },
};

export default function WidgetInstallModal({ isOpen, onClose }: WidgetInstallModalProps) {
  const [selectedType, setSelectedType] = useState<WidgetType>('compact');
  const [selectedTheme, setSelectedTheme] = useState<WidgetTheme>('oled');
  const [activeTab, setActiveTab] = useState<PlatformTab>('ios');
  const [copied, setCopied] = useState(false);

  const [data, setData] = useState<WidgetData>({
    daysRemaining: 256,
    todayQuestions: 35,
    dailyGoal: 50,
    streak: 7,
    currentLeague: 'Elmas',
    motivationalQuote: 'Zorluklar seni yıldırmasın; yıldızlar karanlıkta parlar. ✨',
    username: 'YKS Öğrencisi',
    focusMinutesToday: 90,
  });

  // Otomatik platform algılama
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setActiveTab('ios');
      } else if (/Android/i.test(ua)) {
        setActiveTab('android');
      } else {
        setActiveTab('qr');
      }
    }
  }, []);

  // Kullanıcının güncel widget verisini çek
  useEffect(() => {
    if (isOpen) {
      fetch('/api/widget/data', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json && json.status === 'success') {
            setData({
              daysRemaining: json.daysRemaining || 256,
              todayQuestions: json.todayQuestions || 0,
              dailyGoal: json.dailyGoal || 50,
              streak: json.streak || 1,
              currentLeague: json.currentLeague || 'Bronz',
              motivationalQuote: json.motivationalQuote || 'Çalışmaya devam et!',
              username: json.username || 'YKS Şampiyonu',
              focusMinutesToday: json.focusMinutesToday || 0,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Escape tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentTheme = THEMES[selectedTheme];
  const widgetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/widget?type=${selectedType}&theme=${selectedTheme}`
    : `https://yks-yildizi.vercel.app/widget?type=${selectedType}&theme=${selectedTheme}`;

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(widgetUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const currentHourMinute = new Date().toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 8, 16, 0.88)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 1,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '560px',
              maxHeight: 'min(92vh, 680px)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0c111d',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.15)',
              color: '#f8fafc',
              overflow: 'hidden',
            }}
          >
            {/* ── 1. SABİT BAŞLIK (HEADER) ── */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                backgroundColor: '#0c111d',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
                  }}
                >
                  <Sparkles size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                      YKS Widget Stüdyosu
                    </h2>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                        color: '#000',
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Kişiselleştir, canlı önizle ve telefonuna yerleştir
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                aria-label="Kapat"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── 2. KAYDIRILABİLİR GÖVDE (MOCKUP + SEÇİCİLER + REHBER) ── */}
            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* ── 2.A: CANLI TELEFON MOCKUP'I (DEVICE PREVIEW) ── */}
              <div
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.8), rgba(15, 23, 42, 0.6))',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Smartphone size={14} color="#38bdf8" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                    CANLI TELEFON ÖNİZLEMESİ
                  </span>
                </div>

                {/* iPhone / Android Gövde Çerçevesi */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    borderRadius: '34px',
                    padding: '8px',
                    background: '#181b22',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 2px #2d3340',
                  }}
                >
                  {/* Telefon Ekranı */}
                  <div
                    style={{
                      width: '100%',
                      borderRadius: '26px',
                      background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 60%, #0369a1 100%)',
                      padding: '12px 10px',
                      boxSizing: 'border-box',
                      minHeight: '230px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Dynamic Island / Çentik & Saat */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                        {currentHourMinute}
                      </span>
                      <div
                        style={{
                          width: '64px',
                          height: '14px',
                          borderRadius: '8px',
                          backgroundColor: '#000',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                        <div style={{ width: '10px', height: '6px', borderRadius: '2px', background: '#fff' }} />
                      </div>
                    </div>

                    {/* SEÇİLEN WIDGET GÖRÜNÜMÜ */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
                      {selectedType === 'compact' && (
                        /* KARE 2x2 WIDGET */
                        <motion.div
                          key="compact"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            width: '136px',
                            height: '136px',
                            borderRadius: '22px',
                            background: currentTheme.bg,
                            border: `1.5px solid ${currentTheme.border}`,
                            padding: '12px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: `0 10px 24px -6px rgba(0,0,0,0.8), 0 0 20px ${currentTheme.accentGlow}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Sparkles size={12} color={currentTheme.accent} />
                              <span style={{ fontSize: '9px', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>YKS 2027</span>
                            </div>
                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.2)', padding: '1px 5px', borderRadius: '6px' }}>
                              🔥 {data.streak}
                            </span>
                          </div>

                          <div style={{ textAlign: 'center', margin: '4px 0' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1, color: currentTheme.accent, letterSpacing: '-0.02em' }}>
                              {data.daysRemaining}
                            </div>
                            <div style={{ fontSize: '8.5px', fontWeight: 700, color: currentTheme.textMuted, marginTop: '2px' }}>
                              GÜN KALDI
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '4px' }}>
                            <span style={{ fontSize: '8px', color: '#94a3b8' }}>Bugün:</span>
                            <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#fff' }}>{data.todayQuestions} Soru</span>
                          </div>
                        </motion.div>
                      )}

                      {selectedType === 'medium' && (
                        /* GENİŞ 4x2 WIDGET */
                        <motion.div
                          key="medium"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            width: '100%',
                            borderRadius: '20px',
                            background: currentTheme.bg,
                            border: `1.5px solid ${currentTheme.border}`,
                            padding: '12px 14px',
                            boxSizing: 'border-box',
                            boxShadow: `0 10px 24px -6px rgba(0,0,0,0.8), 0 0 20px ${currentTheme.accentGlow}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Sparkles size={13} color={currentTheme.accent} />
                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff' }}>YKS YILDIZI</span>
                              <span style={{ fontSize: '8.5px', padding: '1px 5px', borderRadius: '4px', background: currentTheme.highlightBg, color: currentTheme.accent, fontWeight: 700 }}>
                                {data.currentLeague} Lig
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b' }}>
                              🔥 {data.streak} Gün
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '8px', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '8px', color: currentTheme.textMuted, fontWeight: 700 }}>SINAVA KALAN</div>
                              <div style={{ fontSize: '24px', fontWeight: 900, color: currentTheme.accent, lineHeight: 1.1 }}>
                                {data.daysRemaining} <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>GÜN</span>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginBottom: '3px' }}>
                                <span>GÜNLÜK HEDEF</span>
                                <span style={{ color: '#fff', fontWeight: 700 }}>{data.todayQuestions}/{data.dailyGoal}</span>
                              </div>
                              <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, (data.todayQuestions / data.dailyGoal) * 100)}%`, background: currentTheme.accent }} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {selectedType === 'tip' && (
                        /* ÖSYM HAP BİLGİ WIDGET */
                        <motion.div
                          key="tip"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            width: '100%',
                            borderRadius: '20px',
                            background: currentTheme.bg,
                            border: `1.5px solid ${currentTheme.border}`,
                            padding: '12px 14px',
                            boxSizing: 'border-box',
                            boxShadow: `0 10px 24px -6px rgba(0,0,0,0.8), 0 0 20px ${currentTheme.accentGlow}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Lightbulb size={12} color="#f59e0b" />
                              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#f59e0b' }}>GÜNÜN ÖSYM TÜYOSU</span>
                            </div>
                            <span style={{ fontSize: '8.5px', color: currentTheme.accent, fontWeight: 700 }}>
                              Kalan: {data.daysRemaining}g
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '10px', color: '#f8fafc', lineHeight: 1.4, fontWeight: 500 }}>
                            {data.motivationalQuote}
                          </p>
                        </motion.div>
                      )}

                      {selectedType === 'live' && (
                        /* CANLI KİLİT EKRANI (LIVE ACTIVITY) */
                        <motion.div
                          key="live"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            width: '100%',
                            borderRadius: '22px',
                            background: 'rgba(15, 23, 42, 0.92)',
                            backdropFilter: 'blur(16px)',
                            border: '1.5px solid rgba(255,255,255,0.18)',
                            padding: '10px 14px',
                            boxSizing: 'border-box',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={15} color="#fff" />
                              </div>
                              <div>
                                <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#fff' }}>YKS Odak Seansı</div>
                                <div style={{ fontSize: '8px', color: '#34d399' }}>Canlı Pomodoro Aktif</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>24:50</div>
                              <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>Hedef: 25 Dk</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Alt Ekran İkon Çubuğu (Telefon Hissi) */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 0 2px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {['📚', '📝', '⚡', '⚙️'].map((icon, i) => (
                        <div key={i} style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                          {icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2.B: 1. ADIM: WIDGET TİPİ SEÇ ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                  <Layers size={14} color="#38bdf8" /> 1. Widget Tipini Seç
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'compact', title: 'Kare (2x2)', desc: 'Kalan Gün & Seri', icon: Clock },
                    { id: 'medium', title: 'Geniş (4x2)', desc: 'İlerleme & Hedef', icon: Target },
                    { id: 'tip', title: 'Hap Bilgi (4x2)', desc: 'ÖSYM Formül Kartı', icon: BookOpen },
                    { id: 'live', title: 'Kilit Ekranı', desc: 'Canlı Pomodoro Barı', icon: Sparkles },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedType(t.id as WidgetType);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          border: `1.5px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                          background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                          color: '#fff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#000' : '#94a3b8', flexShrink: 0 }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#fff' }}>{t.title}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2.C: 2. ADIM: RENK VE TEMA SEÇ ── */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                  <Palette size={14} color="#c084fc" /> 2. Renk Temasını Belirle
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(Object.keys(THEMES) as WidgetTheme[]).map((themeKey) => {
                    const t = THEMES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedTheme(themeKey);
                        }}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isSelected ? t.accent : 'rgba(255,255,255,0.08)'}`,
                          background: isSelected ? t.highlightBg : 'rgba(255,255,255,0.02)',
                          color: isSelected ? t.accent : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '11px',
                          fontWeight: 700,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '14px' }}>{t.badge}</span>
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 2.D: 3. ADIM: TELEFONUNA KURULUM REHBERİ ── */}
              <div style={{ background: 'rgba(2, 6, 23, 0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
                    3. Telefonuna Kurulum Yolu
                  </span>

                  {/* Platform Tab Butonları */}
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '2px', borderRadius: '8px' }}>
                    {[
                      { id: 'ios', label: '🍎 iOS' },
                      { id: 'android', label: '🤖 Android' },
                      { id: 'qr', label: '📷 QR Kod' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setActiveTab(tab.id as PlatformTab);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: activeTab === tab.id ? '#38bdf8' : 'transparent',
                          color: activeTab === tab.id ? '#000' : '#94a3b8',
                          transition: 'all 0.15s',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* İÇERİK: iOS Rehberi */}
                {activeTab === 'ios' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#c084fc', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Aşağıdaki <b>&quot;Canlı Widget Aç&quot;</b> butonuna dokunun veya linki Safari&apos;de açın.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#c084fc', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Safari altındaki <b>Paylaş (kareden çıkan ok 📤)</b> butonuna dokunup <b>&quot;Ana Ekrana Ekle&quot;</b> deyin.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#c084fc', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Artık çerçevesiz, özel temalı widget&apos;ınız telefonunuzun ana ekranında bağımsız bir mini araç olarak çalışır!
                      </p>
                    </div>
                  </div>
                )}

                {/* İÇERİK: Android Rehberi */}
                {activeTab === 'android' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Chrome sağ üstündeki <b>üç nokta (⋮)</b> menüsüne girip <b>&quot;Ana Ekrana Ekle&quot;</b> veya <b>&quot;Uygulamayı Yükle&quot;</b> deyin.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '10px' }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', color: '#000', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                        Ana ekranda boş bir yere <b>uzun basın</b>. <b>&quot;Araç Takımları (Widgets)&quot;</b> sekmesinden <b>YKS Yıldızı</b> sayacını ekranınıza sürükleyin.
                      </p>
                    </div>
                  </div>
                )}

                {/* İÇERİK: QR Kod (Masaüstü için Kusursuz Çözüm) */}
                {activeTab === 'qr' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ background: '#fff', padding: '6px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QRCodeSVG value={widgetUrl} size={88} level="M" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                        Telefonun Kamerasıyla Tara
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        iPhone veya Android telefonunun kamerasını açıp bu karekodu okut. Tasarladığın özel widget doğrudan telefonunda açılacaktır.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. SABİT ALT BUTONLAR (FOOTER) ── */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#0c111d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={widgetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('medium')}
                  style={{
                    padding: '9px 14px',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    borderRadius: '11px',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  }}
                >
                  <Layers size={14} />
                  <span>Canlı Widget Aç</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '9px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '11px',
                    color: copied ? '#4ade80' : '#f8fafc',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    touchAction: 'manipulation',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                style={{
                  padding: '9px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '11px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
