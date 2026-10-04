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
  BookOpen
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
      backgroundColor: '#0b0f19',
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
  const size = searchParams?.get('size') || 'large'; // 'small' | 'medium' | 'large'
  const isEmbed = searchParams?.get('embed') === 'true';

  const [data, setData] = useState<WidgetData>({
    daysRemaining: 257,
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

  // Canlı saniye geri sayımı
  const [timeDetails, setTimeDetails] = useState({
    days: 257,
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
    // 60 saniyede bir otomatik tazeleyerek canlı senkronize kal
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Canlı saniye sayacı
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
        backgroundColor: '#0b0f19',
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
      {/* Arka plan ambient ışık efektleri */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Widget Kartı */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: size === 'small' ? '280px' : size === 'medium' ? '460px' : '520px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: size === 'small' ? '16px' : '22px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.1)',
          boxSizing: 'border-box',
        }}
      >
        {/* Üst Bar: Marka + Seri + Rozet */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
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
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  2027
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                {data.username || 'Öğrenci'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Seri Rozeti */}
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

            {/* Lig Rozeti */}
            {size !== 'small' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  color: '#c084fc',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Trophy size={13} />
                <span>{data.currentLeague}</span>
              </div>
            )}

            {/* Manuel Yenile Butonu */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                fetchData();
              }}
              title="Verileri Güncelle"
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

        {/* Ana Sayaç: Kalan Gün & Süre */}
        <div
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '14px 16px',
            marginBottom: '14px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              YKS 2027 Geri Sayım
            </span>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
              19 Haziran 2027
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                {timeDetails.days}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>
                GÜN
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                {timeDetails.hours.toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>
                SAAT
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                {timeDetails.minutes.toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>
                DAKİKA
              </div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 300, color: '#334155' }}>:</div>

            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#a855f7', lineHeight: 1 }}>
                {timeDetails.seconds.toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>
                SANİYE
              </div>
            </div>
          </div>
        </div>

        {/* Günlük Hedef & Soru İlerlemesi */}
        <div
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '12px 14px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} color="#38bdf8" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                Bugünkü Soru Hedefi
              </span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: progress >= 100 ? '#4ade80' : '#38bdf8' }}>
              {data.todayQuestions} / {data.dailyGoal} Soru ({progress}%)
            </span>
          </div>

          {/* İlerleme Çubuğu */}
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: progress >= 100 
                  ? 'linear-gradient(90deg, #10b981, #34d399)' 
                  : 'linear-gradient(90deg, #38bdf8, #818cf8)',
                borderRadius: '999px',
              }}
            />
          </div>

          {data.focusMinutesToday > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                ⏱️ Bugün {data.focusMinutesToday} dk odaklanıldı
              </span>
            </div>
          )}
        </div>

        {/* Motivasyon Sözü */}
        {size !== 'small' && (
          <div
            style={{
              fontStyle: 'italic',
              fontSize: '12px',
              color: '#94a3b8',
              textAlign: 'center',
              lineHeight: 1.5,
              marginBottom: '16px',
              padding: '0 8px',
            }}
          >
            &ldquo;{data.motivationalQuote}&rdquo;
          </div>
        )}

        {/* Hızlı Aksiyon Butonları */}
        <div style={{ display: 'grid', gridTemplateColumns: size === 'small' ? '1fr 1fr' : '1fr 1fr 1fr', gap: '8px' }}>
          <Link
            href="/dashboard?tab=focus"
            onClick={() => triggerHaptic('medium')}
            style={{
              padding: '10px',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Timer size={14} />
            <span>Odaklan</span>
          </Link>

          <Link
            href="/dashboard?tab=focus&action=add-questions"
            onClick={() => triggerHaptic('medium')}
            style={{
              padding: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <PlusCircle size={14} />
            <span>Soru Ekle</span>
          </Link>

          {size !== 'small' && (
            <Link
              href="/dashboard"
              onClick={() => triggerHaptic('light')}
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
                transition: 'all 0.2s',
              }}
            >
              <span>Uygulama</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {/* Ana Ekrana Ekle Butonu */}
        {!isEmbed && (
          <div style={{ marginTop: '14px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowInstallModal(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              <Smartphone size={13} />
              <span>Bu widget&apos;ı telefonunun ana ekranına nasıl eklersin?</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Widget Kurulum Rehberi Modalı */}
      <WidgetInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}
