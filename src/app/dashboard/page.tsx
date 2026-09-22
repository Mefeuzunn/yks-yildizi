"use client";

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ScheduleProvider } from '@/context/ScheduleContext';
import { FileText, BarChart3, BookOpen, Flame, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';

// ─── Pofuduk Evolution System ──────────────────────────────────────────────
const POFUDUK_STAGES = [
  { minLevel: 1,  emoji: '🥚', name: 'Yumurta',        title: 'Yeni Doğmuş',      color: '#9ca3af', glow: 'rgba(156,163,175,0.3)' },
  { minLevel: 3,  emoji: '🐣', name: 'Civciv',          title: 'Meraklı Kaşif',     color: '#fcd34d', glow: 'rgba(252,211,77,0.3)' },
  { minLevel: 5,  emoji: '🦊', name: 'Pofuduk',         title: 'Azimli Öğrenci',    color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  { minLevel: 10, emoji: '🐺', name: 'Kurt Pofuduk',    title: 'Odaklanmış Savaşçı',color: '#6366f1', glow: 'rgba(99,102,241,0.3)' },
  { minLevel: 15, emoji: '🦁', name: 'Aslan Pofuduk',   title: 'Lider',             color: '#eab308', glow: 'rgba(234,179,8,0.3)' },
  { minLevel: 20, emoji: '🐉', name: 'Ejderha Pofuduk', title: 'Efsanevi',          color: '#ef4444', glow: 'rgba(239,68,68,0.3)' },
  { minLevel: 30, emoji: '⭐', name: 'Yıldız Pofuduk',  title: 'YKS Yıldızı',       color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
];

function getPofudukStage(level: number) {
  let stage = POFUDUK_STAGES[0];
  for (const s of POFUDUK_STAGES) {
    if (level >= s.minLevel) stage = s;
  }
  return stage;
}

function getNextStage(level: number) {
  for (const s of POFUDUK_STAGES) {
    if (level < s.minLevel) return s;
  }
  return null;
}

const MistakesTab = dynamic(() => import('@/components/dashboard/MistakesTab'), { loading: () => _renderSkeleton() });
const TopicsTab = dynamic(() => import('@/components/dashboard/TopicsTab'), { loading: () => _renderSkeleton() });
const TestsTab = dynamic(() => import('@/components/dashboard/TestsTab'), { loading: () => _renderSkeleton() });
const AnalysisTab = dynamic(() => import('@/components/dashboard/AnalysisTab'), { loading: () => _renderSkeleton() });
const CardsTab = dynamic(() => import('@/components/dashboard/CardsTab'), { loading: () => _renderSkeleton() });
const FocusTab = dynamic(() => import('@/components/dashboard/FocusTab'), { loading: () => _renderSkeleton() });
const ScheduleTab = dynamic(() => import('@/components/dashboard/ScheduleTab'), { loading: () => _renderSkeleton() });
const ForumTab = dynamic(() => import('@/components/dashboard/ForumTab'), { loading: () => _renderSkeleton() });
const ProfileTab = dynamic(() => import('@/components/dashboard/ProfileTab'), { loading: () => _renderSkeleton() });
const HedefTab = dynamic(() => import('@/components/dashboard/HedefTab'), { loading: () => _renderSkeleton() });
const TercihRobotuTab = dynamic(() => import('@/components/dashboard/TercihRobotuTab'), { loading: () => _renderSkeleton() });
const TercihListemTab = dynamic(() => import('@/components/dashboard/TercihListemTab'), { loading: () => _renderSkeleton() });
const AstraTutorTab = dynamic(() => import('@/components/dashboard/AstraTutorTab'), { loading: () => _renderSkeleton() });

function _renderSkeleton() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .skeleton {
          animation: customPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: #E5E7EB;
          border-radius: 12px;
        }
      `}} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div className="skeleton" style={{ height: '140px' }}></div>
          <div className="skeleton" style={{ height: '140px' }}></div>
          <div className="skeleton" style={{ height: '140px' }}></div>
          <div className="skeleton" style={{ height: '140px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
      </div>
    </div>
  );
}

interface GamificationStats {
  xp: number;
  coins: number;
  pofuduk_level: number;
  pofuduk_energy: number;
  pofuduk_happiness: number;
}

interface Quest {
  id: number;
  title: string;
  xp_reward: number;
  is_completed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [timeLeft, setTimeLeft] = useState({ days: 359, hours: 7, minutes: 21, seconds: 49 });
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pendingAssignments, setPendingAssignments] = React.useState<any[]>([]);
  const [announcements, setAnnouncements] = React.useState<any[]>([]);

  const fetchGamificationData = async () => {
    try {
      const res = await fetch('/api/gamification');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setQuests(data.quests);
      }
      
      const achRes = await fetch('/api/achievements');
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGamificationData();
      fetch('/api/odevler').then(r => r.ok ? r.json() : {assignments: []}).then(d => {
        setPendingAssignments((d.assignments ?? []).filter((a: any) => a.status === 'pending'));
      }).catch(() => {});
      fetch('/api/ogrenci/duyurular').then(r => r.ok ? r.json() : {announcements: []}).then(d => {
        setAnnouncements(d.announcements ?? []);
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'ogretmen') {
      window.location.href = '/ogretmen/dashboard';
    }
  }, [user]);

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('home');
    }
  }, [tabParam]);

  // Update timer (Target: 2027)
  useEffect(() => {
    const targetDate = new Date('2027-06-19T10:15:00').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderHome = () => {
    const formattedDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ minHeight: '100vh', backgroundColor: '#020617', padding: '16px 0', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box' }} className="dashboard-home">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', margin: '0 0 4px 0', lineHeight: 1.2 }}>
                Merhaba, {user?.username || 'Efe'}! 👋
              </h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, fontWeight: 500 }}>
                Bugün hangi konuyu keşfedeceksin?
              </p>
            </div>
            <div style={{ fontSize: '12px', color: '#e5e7eb', backgroundColor: '#1e293b', padding: '6px 14px', borderRadius: '9999px', fontWeight: 500, border: '1px solid #334155', flexShrink: 0 }}>
              {formattedDate}
            </div>
          </div>

          {/* YKS Countdown */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px', fontWeight: 500 }}>
              YKS 2027'ye Kalan Süre
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
              {/* Gün */}
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #a855f7', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(168, 85, 247, 0.1)' }}>
                <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#a855f7', textShadow: '0 0 10px rgba(168,85,247,0.3)' }}>{timeLeft.days}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>GÜN</span>
              </div>
              {/* Saat */}
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #22c55e', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(34, 197, 94, 0.1)' }}>
                <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#22c55e', textShadow: '0 0 10px rgba(34,197,94,0.3)' }}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>SAAT</span>
              </div>
              {/* Dakika */}
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #eab308', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(234, 179, 8, 0.1)' }}>
                <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#eab308', textShadow: '0 0 10px rgba(234,179,8,0.3)' }}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>DAKİKA</span>
              </div>
              {/* Saniye */}
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #ef4444', borderRadius: '12px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)' }}>
                <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, color: '#ef4444', textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px' }}>SANİYE</span>
              </div>
            </div>
          </div>

          {/* Odak Dostun (Pofuduk) & Stats Row container */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            
            {/* Odak Dostun — Pofuduk Evolution */}
            {(() => {
              const level = stats?.pofuduk_level || 1;
              const stage = getPofudukStage(level);
              const next = getNextStage(level);
              const xp = stats?.xp || 0;
              const xpNeeded = level * 500;
              const xpPct = Math.min(100, (xp / xpNeeded) * 100);
              return (
                <div style={{ flex: '1 1 300px', backgroundColor: '#0f172a', border: `1px solid ${stage.color}30`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {/* Glow background */}
                  <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: stage.color, filter: 'blur(80px)', opacity: 0.12, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}/>
                  
                  {/* Animated emoji */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: '64px', marginBottom: '12px', filter: `drop-shadow(0 0 12px ${stage.glow})`, position: 'relative', zIndex: 1 }}
                  >
                    {stage.emoji}
                  </motion.div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '2px', zIndex: 1 }}>{stage.name}</h3>
                  <div style={{ fontSize: '11px', color: stage.color, fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1 }}>{stage.title}</div>
                  <div style={{ fontSize: '13px', color: '#a855f7', fontWeight: 600, marginBottom: '8px', zIndex: 1 }}>Seviye {level}</div>
                  
                  {/* XP Progress */}
                  <div style={{ width: '100%', marginBottom: '12px', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '6px', fontWeight: 600 }}>
                      <span>XP</span>
                      <span>{xp} / {xpNeeded}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${xpPct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', backgroundImage: `linear-gradient(to right, ${stage.color}88, ${stage.color})`, borderRadius: '999px' }}/>
                    </div>
                  </div>

                  {/* Stats bars */}
                  <div style={{ width: '100%', marginBottom: '10px', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#d1d5db', marginBottom: '4px', fontWeight: 600 }}>
                      <span>😊 Mutluluk</span>
                      <span>{stats?.pofuduk_happiness ?? 85}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats?.pofuduk_happiness ?? 85}%`, height: '100%', backgroundImage: 'linear-gradient(to right, #ec4899, #a855f7)', borderRadius: '999px' }}/>
                    </div>
                  </div>
                  <div style={{ width: '100%', marginBottom: '14px', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#d1d5db', marginBottom: '4px', fontWeight: 600 }}>
                      <span>⚡ Enerji</span>
                      <span>{stats?.pofuduk_energy ?? 60}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${stats?.pofuduk_energy ?? 60}%`, height: '100%', backgroundImage: 'linear-gradient(to right, #eab308, #f97316)', borderRadius: '999px' }}/>
                    </div>
                  </div>

                  {/* Next evolution preview */}
                  {next && (
                    <div style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                      <span style={{ fontSize: '18px' }}>{next.emoji}</span>
                      <div>
                        <div style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>Sonraki Evrim: Lvl {next.minLevel}</div>
                        <div style={{ fontSize: '11px', color: next.color, fontWeight: 700 }}>{next.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 4 Stat Cards */}
            <div style={{ flex: '2 1 300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #a855f7', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>Çözülen Test</div>
                   <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>0</div>
                 </div>
              </div>
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #22c55e', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>Ortalama Puan</div>
                   <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>0%</div>
                 </div>
              </div>
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #3b82f6', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>Tamamlanan Konu</div>
                   <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>0</div>
                 </div>
              </div>
              <div style={{ backgroundColor: '#0f172a', borderTop: '2px solid #f97316', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>Çalışma Serisi</div>
                   <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                     0 <span style={{ fontSize: '16px', fontWeight: 600, color: '#9ca3af' }}>gün</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* ── Ödevler + Duyurular Row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Ödevlerim */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>📋 Ödevlerim</span>
                {pendingAssignments.length > 0 && (
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {pendingAssignments.length} bekliyor
                  </span>
                )}
              </div>
              {pendingAssignments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Bekleyen ödeviniz yok 🎉</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingAssignments.slice(0, 3).map((a: any) => {
                    const isOverdue = a.due_date && new Date(a.due_date) < new Date();
                    return (
                      <div key={a.id} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: `1px solid ${isOverdue ? '#FCA5A5' : '#E5E7EB'}` }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.title}</div>
                        <div style={{ fontSize: 11, color: isOverdue ? '#EF4444' : '#9CA3AF', marginTop: 2 }}>
                          {a.teacher_name} · {a.due_date ? new Date(a.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Süresiz'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duyurular */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>📢 Duyurular</span>
              </div>
              {announcements.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Yeni duyuru yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {announcements.slice(0, 3).map((a: any) => (
                    <div key={a.id} style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {a.teacher_name} · {new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Günlük Görevler */}

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Günlük Görevler</h3>
              <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '12px', padding: '6px 12px', borderRadius: '9999px', fontWeight: 600, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                {quests.length > 0 ? `${quests.filter(q => q.is_completed === 1).length}/${quests.length} Tamamlandı` : '0/0 Tamamlandı'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {quests.map((quest) => (
                <div 
                  key={quest.id}
                  onClick={async () => {
                    if (quest.is_completed === 0) {
                      await fetch('/api/gamification/quest', { method: 'POST', body: JSON.stringify({ questId: quest.id }) });
                      
                      try {
                        await fetch('/api/achievements/check', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ context: 'quest_completed' })
                        });
                      } catch (e) {
                        console.error(e);
                      }

                      // 🎉 Fire confetti!
                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.7 },
                        colors: ['#a855f7', '#fcd34d', '#22c55e', '#3b82f6', '#ec4899'],
                      });
                      fetchGamificationData();
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#1e293b', borderRadius: '12px', border: quest.is_completed === 1 ? 'none' : '1px solid #374151', cursor: quest.is_completed === 1 ? 'default' : 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {quest.is_completed === 1 ? (
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #6b7280', backgroundColor: 'transparent', boxSizing: 'border-box', flexShrink: 0 }}></div>
                    )}
                    <div style={{ fontSize: '15px', color: quest.is_completed === 1 ? '#9ca3af' : '#ffffff', textDecoration: quest.is_completed === 1 ? 'line-through' : 'none', fontWeight: quest.is_completed === 1 ? 500 : 600 }}>{quest.title}</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fcd34d' }}>+{quest.xp_reward} XP</div>
                </div>
              ))}
              {quests.length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>Şu an için görev bulunmuyor.</div>
              )}
            </div>
            
            {/* Chest */}
            {quests.length > 0 && quests.every(q => q.is_completed === 1) ? (
              <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.5)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', boxShadow: '0 0 15px rgba(234, 179, 8, 0.3)' }}>
                <span style={{ fontSize: '20px' }}>🔓</span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '15px', textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>Sandığı Aç!</span>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px dashed rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '15px' }}>Günlük Sandık Kilitli</span>
              </div>
            )}
          </div>

          {/* Başarımlarım */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏅 Başarımlarım
              </h3>
              <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', fontSize: '12px', padding: '6px 12px', borderRadius: '9999px', fontWeight: 600, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                {achievements.length} Başarım
              </span>
            </div>

            {achievements.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px dashed #374151' }}>
                Henüz hiç başarım kazanmadın. Çalışmaya devam et!
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {achievements.map((ach) => (
                  <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#1e293b', borderRadius: '9999px', border: '1px solid #374151' }}>
                    <span style={{ fontSize: '1.25rem' }}>{ach.icon || '🏆'}</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px' }}>{ach.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', fontFamily: '"Inter", sans-serif' }}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && <motion.div key="home" style={{ height: '100%' }}>{renderHome()}</motion.div>}
        {activeTab === 'hedef' && <HedefTab key="hedef" />}
        {activeTab === 'mistakes' && <MistakesTab key="mistakes" />}
        {activeTab === 'topics' && <TopicsTab key="topics" />}
        {activeTab === 'tests' && <TestsTab key="tests" />}
        {activeTab === 'analysis' && <AnalysisTab key="analysis" />}
        {activeTab === 'cards' && <CardsTab key="cards" />}
        {activeTab === 'focus' && <FocusTab key="focus" />}
        {activeTab === 'schedule' && <ScheduleTab key="schedule" />}
        {activeTab === 'astratutor' && <AstraTutorTab key="astratutor" />}
        {activeTab === 'tercih-robotu' && <TercihRobotuTab key="tercih-robotu" />}
        {activeTab === 'tercih-listem' && <TercihListemTab key="tercih-listem" />}
        {activeTab === 'forum' && <ForumTab key="forum" />}
        {activeTab === 'profile' && <ProfileTab key="profile" />}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ScheduleProvider>
      <Suspense fallback={<div style={{ padding: '32px', color: '#fff' }}>Yükleniyor...</div>}>
        <DashboardContent />
      </Suspense>
    </ScheduleProvider>
  );
}
