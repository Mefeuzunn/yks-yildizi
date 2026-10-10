'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Clock, Target, AlertTriangle, TrendingUp, 
  BarChart3, RefreshCw, Award, Sparkles, ChevronRight,
  BookOpen, ShieldCheck, CheckCircle2, XCircle, ArrowUpRight,
  HelpCircle, Lightbulb, Play
} from 'lucide-react';
import Link from 'next/link';

interface SpeedSummary {
  totalQuestions: number;
  avgDuration: number;
  totalTimeSpentMinutes: number;
  overallAccuracy: number;
  idealRate: number;
  distribution: {
    fast: number;
    ideal: number;
    normal: number;
    slow: number;
  };
  speedAccuracy: Record<string, { total: number; correct: number; rate: number }>;
}

interface SubjectBreakdown {
  subject: string;
  nameTr: string;
  icon: string;
  category: string;
  questionCount: number;
  avgSeconds: number;
  targetSeconds: number;
  differenceSeconds: number;
  rating: 'fast' | 'ideal' | 'normal' | 'slow';
  badgeText: string;
  color: string;
  accuracy: number;
  hasData: boolean;
}

interface TopicBottleneck {
  subject: string;
  topic: string;
  count: number;
  avgDuration: number;
  targetSeconds: number;
  differenceSeconds: number;
  isSlowerThanTarget: boolean;
  accuracy: number;
}

export default function SpeedAnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SpeedSummary | null>(null);
  const [subjects, setSubjects] = useState<SubjectBreakdown[]>([]);
  const [bottlenecks, setBottlenecks] = useState<TopicBottleneck[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Tümü' | 'Türkçe' | 'Matematik' | 'Fen' | 'Sosyal'>('Tümü');

  const fetchSpeedStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/speed-stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setSubjects(data.subjectBreakdown || []);
        setBottlenecks(data.topicBottlenecks || []);
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Speed stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeedStats();
  }, []);

  const filteredSubjects = subjects.filter(s => {
    if (selectedCategory === 'Tümü') return true;
    return s.category === selectedCategory;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <RefreshCw size={28} className="animate-spin" color="#38bdf8" />
        <p style={{ marginTop: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>ÖSYM Zaman Analitiği Hesaplanıyor...</p>
      </div>
    );
  }

  const hasData = (summary?.totalQuestions || 0) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', color: '#f8fafc' }}>
      
      {/* ── Top Header Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.65rem' }}>
              <Zap size={13} fill="#38bdf8" />
              YKS ÖSYM HIZ MOTORU
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
              Soru Çözüm Hızı & Zaman Yönetimi Karnesi
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '650px', lineHeight: 1.55, margin: 0 }}>
              TYT (165 dk / 120 soru) ve AYT (180 dk / 80 soru) ÖSYM soru başına ideal saniye standartlarına göre gerçek zamanlı analiziniz.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchSpeedStats}
              title="Yenile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.55rem 0.95rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} /> Yenile
            </button>
            <Link
              href="/soru-coz"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.55rem 1.1rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              }}
            >
              <Play size={14} fill="#ffffff" /> Süreli Soru Çöz
            </Link>
          </div>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        
        {/* KPI 1: Ortalama Hız */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Ortalama Soru Hızı</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            {summary?.avgDuration ? `${summary.avgDuration} sn` : '68 sn'}
          </div>
          <div style={{ fontSize: '0.76rem', color: (summary?.avgDuration || 68) <= 75 ? '#34d399' : '#f87171', marginTop: '0.35rem', fontWeight: 700 }}>
            {(summary?.avgDuration || 68) <= 75 ? '⚡ ÖSYM hedefinin önündesin' : '⏳ Hedefin biraz üzerinde'}
          </div>
        </div>

        {/* KPI 2: İdeal Zaman Uyumu */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>ÖSYM Hız Uyumu</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Target size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
            %{summary?.idealRate ?? 85}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            İdeal & hızlı süre oranı
          </div>
        </div>

        {/* KPI 3: Genel Doğruluk */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Doğruluk Oranı</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            %{summary?.overallAccuracy ?? 74}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Süreli çözümlerde başarı
          </div>
        </div>

        {/* KPI 4: Toplam Takip Edilen Soru */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>Takip Edilen Soru</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <BookOpen size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
            {summary?.totalQuestions || 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Toplam: {summary?.totalTimeSpentMinutes || 0} dakika çalışma
          </div>
        </div>

      </div>

      {/* ── Speed Distribution & Speed-Accuracy Correlation Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Speed Distribution Bars */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={17} color="#38bdf8" /> Hız Dağılım Profili
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ÖSYM Eşiklerine Göre</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[
              { label: 'Şimşek Hızlı ⚡', count: summary?.distribution.fast || 0, color: '#10b981', desc: 'Hedefin çok altında süre' },
              { label: 'İdeal ÖSYM Hızı 🎯', count: summary?.distribution.ideal || 0, color: '#38bdf8', desc: 'Tam ÖSYM standardında' },
              { label: 'Kabul Edilebilir ⏳', count: summary?.distribution.normal || 0, color: '#f59e0b', desc: 'Maksimum süre sınırında' },
              { label: 'Süre Aşımı / Zaman Kaybı ⚠️', count: summary?.distribution.slow || 0, color: '#ef4444', desc: 'ÖSYM hedefinin üzerinde' },
            ].map(item => {
              const total = summary?.totalQuestions || 1;
              const pct = hasData ? Math.round((item.count / total) * 100) : 25;

              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ color: item.color, fontWeight: 800 }}>{hasData ? `${item.count} soru (%${pct})` : '%25'}</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(4, pct)}%`, height: '100%', backgroundColor: item.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Speed vs. Accuracy Insight Card */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={17} color="#a855f7" /> Hız & Doğruluk Korelasyonu
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Soruları daha hızlı çözdüğünüzde mi yoksa üzerinde uzun süre düşündüğünüzde mi daha başarılısınız?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '0.74rem', color: '#6ee7b7', fontWeight: 700 }}>Hızlı Çözüm Başarısı</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                  %{summary?.speedAccuracy.fast?.rate || 82}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  {summary?.speedAccuracy.fast?.total || 0} soru çözüldü
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 700 }}>Yavaş Çözüm Başarısı</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>
                  %{summary?.speedAccuracy.slow?.rate || 48}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  {summary?.speedAccuracy.slow?.total || 0} soru çözüldü
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0.75rem 0.95rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.8rem', color: '#c4b5fd', lineHeight: 1.5 }}>
            🧠 <strong>Psikometrik Öneri:</strong> YKS’de bir soru üzerinde 2 dakikadan fazla inatlaşmak doğru yapma olasılığını artırmıyor. İlk 70 saniyede çıkış yolu göremiyorsanız hemen turlama işaretini koyup sonraki soruya geçin.
          </div>
        </div>

      </div>

      {/* ── Subject Breakdown Section ── */}
      <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem 0' }}>
              Ders Bazlı Soru Hızı ve ÖSYM Hedef Karşılaştırması
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              Kendi ortalama süreniz ile ÖSYM’nin önerdiği hedef sürenin karşılaştırması
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['Tümü', 'Türkçe', 'Matematik', 'Fen', 'Sosyal'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: selectedCategory === cat ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedCategory === cat ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? '#38bdf8' : '#94a3b8',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects List Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredSubjects.map(subj => {
            const isAhead = subj.differenceSeconds <= 0;
            const diffAbs = Math.abs(subj.differenceSeconds);

            return (
              <div
                key={subj.subject}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.35rem' }}>{subj.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>{subj.nameTr}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {subj.hasData ? `${subj.questionCount} soru çözüldü • %${subj.accuracy} doğruluk` : 'Henüz soru çözülmedi'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      backgroundColor: `${subj.color}22`,
                      color: subj.color,
                      border: `1px solid ${subj.color}44`,
                    }}
                  >
                    {subj.badgeText}
                  </div>
                </div>

                {/* Speed Metrics vs Target */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Ortalama: </span>
                    <strong style={{ color: '#ffffff', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                      {subj.avgSeconds} sn
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>ÖSYM Hedefi: </span>
                    <strong style={{ color: '#94a3b8' }}>{subj.targetSeconds} sn</strong>
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: isAhead ? '#34d399' : '#f87171',
                      }}
                    >
                      {isAhead ? `-${diffAbs} sn Hızlı ⚡` : `+${diffAbs} sn Yavaş ⏳`}
                    </span>
                  </div>
                </div>

                {/* Visual Bar Comparison */}
                <div style={{ position: 'relative', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(10, (subj.avgSeconds / (subj.targetSeconds * 1.5)) * 100))}%`,
                      backgroundColor: subj.color,
                      borderRadius: '99px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Topic Bottlenecks (Zaman Tuzakları) ── */}
      {bottlenecks.length > 0 && (
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fca5a5', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#ef4444" /> Zaman Tuzakları (En Çok Süre Kaybettiren Konular)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
                Bu konularda soru başına harcadığınız süre ÖSYM hedeflerini aşıyor
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {bottlenecks.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
                    {item.subject} • {item.topic}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 3 }}>
                    Ortalama: <strong>{item.avgDuration} sn</strong> (Hedef: {item.targetSeconds} sn)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f87171' }}>
                    +{item.differenceSeconds} sn
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Kayıp/Soru</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Astra AI Coaching Insights ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '20px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Astra AI Zaman Yönetimi Taktikleri
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Süre analizlerinize göre kişiselleştirilmiş YKS sınav stratejisi
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.85rem',
                lineHeight: 1.55,
                color: '#e2e8f0',
              }}
            >
              <Sparkles size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{rec}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
