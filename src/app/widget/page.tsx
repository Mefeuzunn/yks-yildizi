'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  Timer, 
  PlusCircle, 
  ExternalLink, 
  RefreshCw, 
  Smartphone,
  ChevronRight,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  Clock,
  Target
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import WidgetInstallModal from '@/components/WidgetInstallModal';

interface WidgetData {
  daysRemaining: number;
  todayQuestions: number;
  dailyGoal: number;
  streak: number;
  currentLeague: string;
  motivationalQuote: string;
  username: string;
  focusMinutesToday: number;
  progressPercent: number;
  yksTargetDate: string;
  updatedAt: string;
}

type WidgetType = 'compact' | 'medium' | 'tip' | 'live';
type WidgetTheme = 'oled' | 'purple' | 'emerald' | 'gold';

const THEMES: Record<WidgetTheme, {
  name: string;
  bg: string;
  border: string;
  accent: string;
  accentGlow: string;
  textMuted: string;
  cardBg: string;
  highlightBg: string;
}> = {
  oled: {
    name: 'OLED Gece',
    bg: 'radial-gradient(circle at 50% 20%, #090d16 0%, #020617 100%)',
    border: 'rgba(56, 189, 248, 0.35)',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
    textMuted: '#94a3b8',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    highlightBg: 'rgba(56, 189, 248, 0.15)',
  },
  purple: {
    name: 'Kozmik Mor',
    bg: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 100%)',
    border: 'rgba(168, 85, 247, 0.4)',
    accent: '#c084fc',
    accentGlow: 'rgba(168, 85, 247, 0.3)',
    textMuted: '#cbd5e1',
    cardBg: 'rgba(30, 27, 75, 0.85)',
    highlightBg: 'rgba(168, 85, 247, 0.15)',
  },
  emerald: {
    name: 'Siber Zümrüt',
    bg: 'radial-gradient(circle at 50% 20%, #022c22 0%, #02120e 100%)',
    border: 'rgba(16, 185, 129, 0.4)',
    accent: '#34d399',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    textMuted: '#a7f3d0',
    cardBg: 'rgba(6, 78, 59, 0.85)',
    highlightBg: 'rgba(16, 185, 129, 0.15)',
  },
  gold: {
    name: 'Şampiyon Altın',
    bg: 'radial-gradient(circle at 50% 20%, #451a03 0%, #180901 100%)',
    border: 'rgba(245, 158, 11, 0.45)',
    accent: '#fbbf24',
    accentGlow: 'rgba(245, 158, 11, 0.3)',
    textMuted: '#fde68a',
    cardBg: 'rgba(69, 26, 3, 0.85)',
    highlightBg: 'rgba(245, 158, 11, 0.15)',
  },
};

export default function StandaloneWidgetPage() {
  return (
    <React.Suspense fallback={<WidgetLoadingFallback />}>
      <WidgetContent />
    </React.Suspense>
  );
}

function WidgetLoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#38bdf8',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <RefreshCw className="animate-spin" size={32} />
    </div>
  );
}

function WidgetContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams?.get('type') || searchParams?.get('size') || 'medium';
  const initialType: WidgetType = rawType === 'small' ? 'compact' : rawType === 'large' ? 'medium' : (rawType as WidgetType);
  const rawTheme = (searchParams?.get('theme') || 'oled') as WidgetTheme;
  const initialTheme: WidgetTheme = THEMES[rawTheme] ? rawTheme : 'oled';

  const [activeType, setActiveType] = useState<WidgetType>(initialType);
  const [activeTheme, setActiveTheme] = useState<WidgetTheme>(initialTheme);
  const theme = THEMES[activeTheme];

  const isEmbed = searchParams?.get('embed') === 'true';

  const [data, setData] = useState<WidgetData>({
    daysRemaining: 256,
    todayQuestions: 0,
    dailyGoal: 50,
    streak: 1,
    currentLeague: 'Bronz',
    motivationalQuote: 'Zorluklar seni yıldırmasın; yıldızlar karanlıkta parlar. ✨',
    username: 'YKS Şampiyonu',
    focusMinutesToday: 0,
    progressPercent: 0,
    yksTargetDate: '2027-06-19T10:15:00',
    updatedAt: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Canlı saat ve saniye sayacı
  const [timeDetails, setTimeDetails] = useState({
    days: 256,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/widget/data', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Widget fetch error:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const target = new Date(data.yksTargetDate || '2027-06-19T10:15:00+03:00').getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeDetails({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeDetails({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [data.yksTargetDate]);

  const progress = Math.min(100, Math.round((data.todayQuestions / Math.max(1, data.dailyGoal)) * 100));

  return (
    <div
      style={{
        minHeight: isEmbed ? 'auto' : '100vh',
        background: theme.bg,
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isEmbed ? '8px' : '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── ÜST KONTROL & GEZİNTİ ÇUBUĞU (Yalnızca tam sayfa modunda) ── */}
      {!isEmbed && (
        <div style={{
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 20,
        }}>
          {/* Üst Başlık & Panele Dön */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                fontSize: '12.5px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Panele Dön
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>Widget Stüdyosu</span>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: 6, background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>CANLI</span>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={isRefreshing}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span style={{ fontSize: '11px' }}>Yenile</span>
            </button>
          </div>

          {/* Widget Boyutu & Türü Seçici */}
          <div style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(255,255,255,0.05)',
            padding: 4,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            overflowX: 'auto',
          }}>
            {[
              { id: 'compact', label: '◻️ Kare' },
              { id: 'medium', label: '▭ Geniş' },
              { id: 'tip', label: '💡 İpucu' },
              { id: 'live', label: '🔴 Canlı' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveType(t.id as WidgetType);
                }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 10,
                  fontSize: '12px',
                  fontWeight: activeType === t.id ? 800 : 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeType === t.id ? 'rgba(56,189,248,0.25)' : 'transparent',
                  color: activeType === t.id ? '#38bdf8' : '#94a3b8',
                  boxShadow: activeType === t.id ? '0 2px 8px rgba(56,189,248,0.2)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── A: KARE 2x2 WIDGET GÖRÜNÜMÜ ── */}
      {activeType === 'compact' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '320px',
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1.5px solid ${theme.border}`,
            borderRadius: '28px',
            padding: '20px',
            boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 35px ${theme.accentGlow}`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '280px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>YKS 2027</span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
              🔥 {data.streak} Gün
            </span>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <div style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1, color: theme.accent, letterSpacing: '-0.02em', textShadow: `0 0 25px ${theme.accentGlow}` }}>
              {timeDetails.days}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: theme.textMuted, marginTop: '4px', letterSpacing: '0.08em' }}>
              GÜN KALDI
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
              {timeDetails.hours.toString().padStart(2, '0')}:{timeDetails.minutes.toString().padStart(2, '0')}:{timeDetails.seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '10px 12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Bugün:</span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{data.todayQuestions} / {data.dailyGoal} Soru</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
            <Link
              href="/dashboard?tab=focus"
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: theme.highlightBg,
                border: `1px solid ${theme.border}`,
                color: theme.accent,
                fontSize: '11px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Odaklan
            </Link>
            <Link
              href="/dashboard"
              style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Uygulamaya Git
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── B: GENİŞ 4x2 WIDGET GÖRÜNÜMÜ (STANDART) ── */}
      {activeType === 'medium' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.border}`,
            borderRadius: '24px',
            padding: '20px',
            boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 35px ${theme.accentGlow}`,
            boxSizing: 'border-box',
          }}
        >
          {/* Üst Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 0 14px ${theme.accentGlow}`,
                }}
              >
                <Sparkles size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.04em', color: '#f8fafc' }}>
                    YKS YILDIZI
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      backgroundColor: theme.highlightBg,
                      color: theme.accent,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    2027
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  {data.username || 'Öğrenci'} · {data.currentLeague} Lig
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Flame size={14} className="animate-pulse" />
                <span>{data.streak} Gün</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  fetchData();
                }}
                title="Tazele"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Sayaç */}
          <div
            style={{
              backgroundColor: 'rgba(2, 6, 23, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '14px 16px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                YKS 2027 Geri Sayım
              </span>
              <span style={{ fontSize: '11px', color: theme.accent, fontWeight: 600 }}>
                19 Haziran 2027
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '34px', fontWeight: 900, color: theme.accent, lineHeight: 1 }}>
                  {timeDetails.days}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>GÜN</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                  {timeDetails.hours.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>SAAT</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                  {timeDetails.minutes.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>DAKİKA</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: theme.accent, lineHeight: 1 }}>
                  {timeDetails.seconds.toString().padStart(2, '0')}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>SANİYE</div>
              </div>
            </div>
          </div>

          {/* İlerleme Barı */}
          <div
            style={{
              backgroundColor: 'rgba(2, 6, 23, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '12px 14px',
              marginBottom: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={14} color={theme.accent} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>Bugünkü Soru Hedefi</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: progress >= 100 ? '#4ade80' : theme.accent }}>
                {data.todayQuestions} / {data.dailyGoal} Soru ({progress}%)
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: theme.accent, borderRadius: '999px' }}
              />
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Link
              href="/dashboard?tab=focus"
              style={{
                padding: '10px',
                backgroundColor: theme.highlightBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.accent,
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Timer size={14} />
              <span>Odaklan</span>
            </Link>

            <Link
              href="/dashboard?tab=focus&action=add-questions"
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <PlusCircle size={14} />
              <span>Soru Ekle</span>
            </Link>

            <Link
              href="/dashboard"
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Uygulama</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── C: ÖSYM HAP BİLGİ WIDGET GÖRÜNÜMÜ ── */}
      {activeType === 'tip' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            background: theme.cardBg,
            backdropFilter: 'blur(20px)',
            border: `1.5px solid ${theme.border}`,
            borderRadius: '24px',
            padding: '20px',
            boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 35px ${theme.accentGlow}`,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={16} color="#f59e0b" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>GÜNÜN ÖSYM TÜYOSU & STRATEJİSİ</span>
            </div>
            <span style={{ fontSize: '11px', color: theme.accent, fontWeight: 700 }}>
              Kalan: {data.daysRemaining} Gün
            </span>
          </div>

          <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px' }}>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#f8fafc', lineHeight: 1.6, fontWeight: 500 }}>
              &ldquo;{data.motivationalQuote}&rdquo;
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              🔥 {data.streak} Günlük Seri
            </span>
            <Link
              href="/soru-coz"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: theme.highlightBg,
                color: theme.accent,
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Hemen Soru Çöz →
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── D: LIVE ACTIVITY / KİLİT EKRANI GÖRÜNÜMÜ ── */}
      {activeType === 'live' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '26px',
            padding: '16px 20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>YKS Odak Seansı</div>
                <div style={{ fontSize: '10px', color: '#34d399' }}>Canlı Pomodoro & Kilit Ekranı</div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '8px' }}>
              🔥 {data.streak} Gün
            </span>
          </div>

          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '0.04em' }}>
              24:50
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Kalan YKS Günü: {data.daysRemaining} | Çözülen Soru: {data.todayQuestions}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <Link
              href="/dashboard?tab=focus"
              style={{
                padding: '9px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#000',
                fontSize: '12px',
                fontWeight: 800,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Sayacı Başlat
            </Link>
            <Link
              href="/dashboard"
              style={{
                padding: '9px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Uygulama
            </Link>
          </div>
        </motion.div>
      )}

      {/* Ana Ekrana Ekle Butonu & Rehber */}
      {!isEmbed && (
        <div style={{
          marginTop: '22px',
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'center',
        }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setShowInstallModal(true);
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #0284c7, #8b5cf6)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px 20px',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4), 0 0 16px rgba(139, 92, 246, 0.3)',
              touchAction: 'manipulation',
            }}
          >
            <Smartphone size={18} />
            <span>Telefon Ana Ekranına Widget Olarak Ekle (Rehber & QR)</span>
          </button>

          <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
            iOS (Safari / Scriptable) & Android (Chrome / Widget) ile canlı senkronizasyon
          </p>
        </div>
      )}

      {/* Widget Kurulum Rehberi Modalı */}
      <WidgetInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
