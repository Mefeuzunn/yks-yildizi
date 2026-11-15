"use client";

import React, { useEffect, useState, Suspense, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ScheduleProvider } from '@/context/ScheduleContext';
import {
  FileText, BarChart3, BookOpen, Flame, Check, Heart, Sparkles, TrendingUp,
  ChevronRight, X, Lock, Shield, Award, Clock, Zap, Target, BrainCircuit,
  Rocket, Compass, Play, ArrowUpRight, Trophy, Bell, AlertCircle, RefreshCw,
  Calendar, CheckCircle2, ChevronDown, Layers, HelpCircle, Star, GraduationCap,
  CheckSquare
} from 'lucide-react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptics';
import MobileLiveActivityWidget from '@/components/MobileLiveActivityWidget';
import PullToRefresh from '@/components/mobile/PullToRefresh';
import { MASCOTS, getEquippedMascot, getNextMascot, getUnlockedMascots, getMascotById, type Mascot } from '@/lib/mascots';
import { calculateYksCountdown, getYksTargetDate } from '@/lib/yks-countdown';

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
const SinifimTab = dynamic(() => import('@/components/dashboard/SinifimTab'), { loading: () => _renderSkeleton() });

function _renderSkeleton() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
        .skeleton {
          animation: customPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
      `}} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '110px', width: '100%' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="skeleton" style={{ height: '130px' }}></div>
          <div className="skeleton" style={{ height: '130px' }}></div>
          <div className="skeleton" style={{ height: '130px' }}></div>
          <div className="skeleton" style={{ height: '130px' }}></div>
        </div>
        <div className="skeleton" style={{ height: '320px', width: '100%' }}></div>
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
  active_mascot?: string;
  solved_questions?: number;
  success_rate?: number;
  streak_days?: number;
  league?: string;
  league_points?: number;
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

interface MascotVillageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentXp: number;
  equippedMascot: Mascot;
  unlockedMascots: Mascot[];
  onEquip: (mascot: Mascot) => Promise<void>;
  equippingId: string | null;
}

function MascotVillageModal({
  isOpen,
  onClose,
  currentXp,
  equippedMascot,
  unlockedMascots,
  onEquip,
  equippingId,
}: MascotVillageModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 17, 0.86)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '90vh',
          backgroundColor: '#0a0f1d',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.06), transparent)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px' }}>🏡</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Maskot Köyü & Çalışma Yoldaşları
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
              Soru çözdükçe ve odaklandıkça XP kazan, yeni yoldaşların kilitlerini aç ve aktif çalışma partnerini seç!
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              ⚡ Toplam: {currentXp.toLocaleString('tr-TR')} XP
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mascot Grid */}
        <div
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {MASCOTS.map((m) => {
            const isUnlocked = currentXp >= m.requiredXp;
            const isEquipped = equippedMascot.id === m.id;
            const isEquipping = equippingId === m.id;
            const remainingXp = Math.max(0, m.requiredXp - currentXp);
            const progressPct = m.requiredXp === 0 ? 100 : Math.min(100, Math.round((currentXp / m.requiredXp) * 100));

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: isEquipped ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                  border: isEquipped
                    ? '2px solid #10b981'
                    : isUnlocked
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  opacity: isUnlocked ? 1 : 0.65,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: m.color,
                      backgroundColor: `${m.color}18`,
                      border: `1px solid ${m.color}35`,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Seviye {m.level}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isUnlocked ? '#94a3b8' : '#eab308',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {!isUnlocked && <Lock size={12} />}
                    {m.requiredXp === 0 ? '0 XP (Başlangıç)' : `${m.requiredXp.toLocaleString('tr-TR')} XP`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: isUnlocked ? m.bgGradient : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isUnlocked ? m.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '34px',
                      filter: isUnlocked ? `drop-shadow(0 0 10px ${m.glow})` : 'grayscale(0.8)',
                      flexShrink: 0,
                    }}
                  >
                    {m.emoji}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {m.name}
                      </h4>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: m.color }}>
                        ({m.nickname})
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: 600 }}>
                      {m.title}
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        padding: '1px 6px',
                        borderRadius: '6px',
                        marginTop: '4px',
                      }}
                    >
                      🎯 {m.specialty}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 10px', flex: 1 }}>
                  {m.description}
                </p>

                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    marginBottom: '14px',
                  }}
                >
                  "{m.quotes[0]}"
                </div>

                <div>
                  {isEquipped ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#4ade80',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Check size={14} /> Aktif Yoldaşın
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onEquip(m)}
                      disabled={isEquipping}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${m.color}, #1d4ed8)`,
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: isEquipping ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: `0 4px 14px ${m.glow}`,
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <Sparkles size={13} />
                      {isEquipping ? 'Seçiliyor...' : 'Yoldaş Yap'}
                    </button>
                  ) : (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '10.5px',
                          color: '#64748b',
                          marginBottom: '4px',
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={10} /> Kilitli
                        </span>
                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>
                          {remainingXp.toLocaleString('tr-TR')} XP Kaldı
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            backgroundImage: 'linear-gradient(to right, #eab308, #f59e0b)',
                            borderRadius: '999px',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');

  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(0);
  const [dueMistakesCount, setDueMistakesCount] = useState<number>(0);

  // Mascot interactive petting, modal & mood states
  const [isMascotModalOpen, setIsMascotModalOpen] = useState(false);
  const [equippingMascotId, setEquippingMascotId] = useState<string | null>(null);
  const [pofudukWiggle, setPofudukWiggle] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number }[]>([]);

  // Live countdown state
  const targetYksDate = useMemo(() => getYksTargetDate(user?.sinif), [user?.sinif]);
  const [countdown, setCountdown] = useState(() => calculateYksCountdown(targetYksDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateYksCountdown(targetYksDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetYksDate]);

  const currentXp = stats?.xp || 0;
  const equippedMascot = getEquippedMascot(stats?.active_mascot, currentXp);
  const unlockedMascots = getUnlockedMascots(currentXp);
  const nextMascotData = getNextMascot(currentXp);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    const newUrl = newTab === 'home' ? '/dashboard' : `/dashboard?tab=${newTab}`;
    window.history.pushState(null, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePetMascot = () => {
    haptics.impact('light');
    setPofudukWiggle(true);
    setTimeout(() => setPofudukWiggle(false), 500);

    const reactionPool = [
      ...(equippedMascot.petReactions || []),
      ...(equippedMascot.quotes || [])
    ];
    const randomQuote = reactionPool[Math.floor(Math.random() * reactionPool.length)] || "Birlikte başaracağız! 🌟";
    setSpeechBubble(randomQuote);
    setTimeout(() => setSpeechBubble(null), 3400);

    const heartId = Date.now();
    setFloatingHearts(prev => [...prev, { id: heartId, x: (Math.random() - 0.5) * 60 }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== heartId));
    }, 900);
  };

  const handleEquipMascot = async (targetMascot: Mascot) => {
    if (currentXp < targetMascot.requiredXp) return;
    setEquippingMascotId(targetMascot.id);
    try {
      const res = await fetch('/api/user/mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mascotId: targetMascot.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(prev => prev ? { ...prev, active_mascot: targetMascot.id } : prev);
        try {
          localStorage.setItem('yks_focus_pet', JSON.stringify(targetMascot));
          window.dispatchEvent(new Event('pet-updated'));
        } catch (_) {}
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        setIsMascotModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to equip mascot:', err);
    } finally {
      setEquippingMascotId(null);
    }
  };

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

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchGamificationData(),
      fetch('/api/odevler').then(r => r.ok ? r.json() : { assignments: [] }).then(d => {
        setPendingAssignments((d.assignments ?? []).filter((a: any) => a.status === 'pending'));
      }).catch(() => {}),
      fetch('/api/ogrenci/duyurular').then(r => r.ok ? r.json() : { announcements: [] }).then(d => {
        setAnnouncements(d.announcements ?? []);
      }).catch(() => {}),
      fetch('/api/user/focus').then(r => r.ok ? r.json() : null).then(d => {
        if (d?.todayFocus?.total_min !== undefined) {
          setTodayFocusMinutes(d.todayFocus.total_min);
        }
      }).catch(() => {}),
      fetch('/api/user/errors').then(r => r.ok ? r.json() : []).then(items => {
        if (Array.isArray(items)) {
          const now = new Date();
          const due = items.filter((m: any) => !m.next_review_at || new Date(m.next_review_at) <= now).length;
          setDueMistakesCount(due);
        }
      }).catch(() => {})
    ]);
  }, []);

  useEffect(() => {
    if (user) {
      handleRefresh();
    }
  }, [user, handleRefresh]);

  useEffect(() => {
    if (user) {
      if (user.role === 'ogretmen') {
        window.location.href = '/ogretmen/dashboard';
      } else if (user.role === 'veli') {
        window.location.href = '/veli';
      } else if (
        user.curriculum_mode === 'maarif_v1' ||
        ['9', '10', '11'].includes(user.sinif)
      ) {
        window.location.href = '/maarif';
      }
    }
  }, [user]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('home');
    }
  }, [tabParam]);

  useEffect(() => {
    const handleTabNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        handleTabChange(customEvent.detail);
      }
    };
    window.addEventListener('yks:navigate-tab', handleTabNav);
    return () => window.removeEventListener('yks:navigate-tab', handleTabNav);
  }, [handleTabChange]);

  const renderHome = () => {
    const formattedDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-canvas, #05080f)',
          padding: '16px 0 64px',
          boxSizing: 'border-box',
        }}
        className="dashboard-home"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 1. TOP COCKPIT DECK & STATUS RIBBON                                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '20px 24px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.4) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 24px rgba(0, 0, 0, 0.35)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Left: User Identity & Greeting */}
            <div style={{ minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#818cf8',
                  }}
                >
                  {user?.sinif ? `${user.sinif}. Sınıf` : '12. Sınıf'} • {user?.alan || 'Sayısal'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                  {formattedDate}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(22px, 3.5vw, 28px)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Merhaba, {user?.username || 'Şampiyon'}! <span style={{ display: 'inline-block', transform: 'rotate(0deg)' }}>👋</span>
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 500 }}>
                {stats?.streak_days && stats.streak_days > 2
                  ? `🔥 Harika gidiyorsun! ${stats.streak_days} gündür serini kesintisiz sürdürüyorsun.`
                  : 'Bugün hangi hedefine odaklanacaksın?'}
              </p>
            </div>

            {/* Right: Live YKS Countdown & Quick Action Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Live YKS 2026 Countdown Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(6, 182, 212, 0.1)',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>YKS 2026:</span>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#38bdf8', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                  {countdown.days}g {countdown.hours}s {countdown.minutes}d
                </span>
              </div>

              {/* Target Department / Goal Pill */}
              <button
                onClick={() => handleTabChange('hedef')}
                style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '12px',
                  padding: '8px 14px',
                  color: '#fbbf24',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.16s ease',
                }}
                title="Hedeflerini ve Net Çizgini Güncelle"
              >
                <Target size={14} color="#f59e0b" />
                <span>{user?.target_department || 'Hedef Belirle'}</span>
              </button>

              {/* Official Progress Report (PDF / Veli) */}
              {user?.parent_code && (
                <Link
                  href={`/veli?code=${encodeURIComponent(user.parent_code)}`}
                  style={{
                    fontSize: '12.5px',
                    color: '#c4b5fd',
                    backgroundColor: 'rgba(139, 92, 246, 0.12)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.16s ease',
                  }}
                  title="Resmi Öğrenci Gelişim Karnesini ve Veli Raporunu İncele / PDF Olarak Kaydet"
                >
                  <GraduationCap size={15} />
                  <span>Karnem & PDF</span>
                </Link>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 2. COCKPIT TAB NAVIGATION RIBBON                                      */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '20px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {[
              { id: 'home', label: 'Genel Bakış', icon: Layers },
              { id: 'focus', label: 'Odaklanma', icon: Clock },
              { id: 'tests', label: 'Soru & Test', icon: BookOpen },
              { id: 'mistakes', label: 'Hata Defterim', icon: CheckSquare, badge: dueMistakesCount > 0 ? dueMistakesCount : null },
              { id: 'schedule', label: 'Çalışma Takvimim', icon: Calendar },
              { id: 'analysis', label: 'Gelişim Analizi', icon: BarChart3 },
              { id: 'astratutor', label: 'AstraTutor AI', icon: BrainCircuit, isAi: true },
              { id: 'hedef', label: 'Hedef & Netler', icon: Target },
              { id: 'sinifim', label: 'Sınıfım & Ödevler', icon: Trophy, badge: pendingAssignments.length > 0 ? pendingAssignments.length : null },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: isActive
                      ? '1px solid rgba(99, 102, 241, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: isActive
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(255, 255, 255, 0.02)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} color={isActive ? (tab.isAi ? '#38bdf8' : '#60a5fa') : '#64748b'} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '1px 6px',
                        marginLeft: '2px',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Maarif Modeli Öğrencileri İçin Özel Portal Banner'ı */}
          {(user?.curriculum_mode === 'maarif_v1' || user?.sinif === '9' || user?.sinif === '10' || user?.sinif === '11') && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🌱</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#34d399' }}>
                    {user?.sinif ? `${user.sinif}. Sınıf` : '9-11. Sınıf'} Maarif Modeli Müfredatın Hazır!
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                    MEB Ortak Yazılı Sınav Senaryoları ve yeni tema çıktıları için Maarif Portalı'nı ziyaret et.
                  </div>
                </div>
              </div>
              <Link
                href="/maarif"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.16s ease',
                }}
              >
                <span>Maarif Portalına Geç</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}

          {/* Live Activity Widget */}
          <div style={{ marginBottom: '20px' }}>
            <MobileLiveActivityWidget
              streak={stats?.streak_days || 1}
              solvedQuestions={stats?.solved_questions || 0}
              dailyGoal={40}
            />
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 3. QUICK ACTION COMMAND MATRIX (4 PRIMARY LAUNCHPADS)                 */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            {/* Launchpad 1: Pomodoro & Focus */}
            <div
              onClick={() => handleTabChange('focus')}
              style={{
                backgroundColor: 'var(--bg-card, #0f1523)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2.5px solid #2563eb',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={20} color="#a78bfa" />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#a78bfa',
                      background: 'rgba(139, 92, 246, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Bugün: {todayFocusMinutes} dk
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                  Odaklanma Seansı
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  25 dk derin çalışma, arka plan ambient sesleri ve mola döngüsü.
                </p>
              </div>
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#a78bfa',
                }}
              >
                <span>Hemen Başlat</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Launchpad 2: Soru Çözüm Stüdyosu */}
            <Link
              href="/soru-coz"
              style={{
                backgroundColor: 'var(--bg-card, #0f1523)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2.5px solid #10b981',
                borderRadius: '16px',
                padding: '18px 20px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOpen size={20} color="#34d399" />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#34d399',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {stats?.solved_questions ? `${stats.solved_questions} Soru` : 'Soru Havuzu'}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                  Soru Çözüm Stüdyosu
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  TYT ve AYT branş soruları, anında çözüm ve yapay zeka analizi.
                </p>
              </div>
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#34d399',
                }}
              >
                <span>Soruları Çöz</span>
                <ChevronRight size={14} />
              </div>
            </Link>

            {/* Launchpad 3: Hata Defteri & Leitner */}
            <div
              onClick={() => handleTabChange('mistakes')}
              style={{
                backgroundColor: 'var(--bg-card, #0f1523)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2.5px solid #f43f5e',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckSquare size={20} color="#fb7185" />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: dueMistakesCount > 0 ? '#fb7185' : '#94a3b8',
                      background: dueMistakesCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.06)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {dueMistakesCount > 0 ? `${dueMistakesCount} Tekrar` : 'Hatasız'}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                  Hata Defteri & Tekrar
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  5 Kutu Leitner algoritmasıyla yanlış yaptığın soruları kalıcı hafızaya al.
                </p>
              </div>
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#fb7185',
                }}
              >
                <span>Hataları İncele</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Launchpad 4: AstraTutor AI Koçu */}
            <div
              onClick={() => handleTabChange('astratutor')}
              style={{
                backgroundColor: 'var(--bg-card, #0f1523)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: '2.5px solid #f59e0b',
                borderRadius: '16px',
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BrainCircuit size={20} color="#fbbf24" />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#fbbf24',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    7/24 Aktif
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                  AstraTutor AI Koçu
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  Soru çözümü, sınav stratejisi ve psikolojik danışmanlık koçun.
                </p>
              </div>
              <div
                style={{
                  marginTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#fbbf24',
                }}
              >
                <span>Koça Soru Sor</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 4. COMPANION STUDIO & 4 CORE STATS                                    */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            {/* Mascot Companion Card */}
            <div
              style={{
                flex: '1 1 320px',
                backgroundColor: 'var(--bg-card, #0f1523)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderTop: `2.5px solid ${equippedMascot.color}`,
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
              }}
            >
              {/* Glow background */}
              <div
                style={{
                  position: 'absolute',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  background: equippedMascot.color,
                  filter: 'blur(90px)',
                  opacity: 0.15,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Speech Bubble */}
              <AnimatePresence>
                {speechBubble && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.85 }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '16px',
                      right: '16px',
                      textAlign: 'center',
                      background: 'rgba(8, 12, 20, 0.95)',
                      border: `1px solid ${equippedMascot.color}70`,
                      borderRadius: '12px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '11px',
                      fontWeight: 700,
                      boxShadow: `0 6px 20px rgba(0,0,0,0.6), 0 0 15px ${equippedMascot.glow}`,
                      zIndex: 20,
                      pointerEvents: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {speechBubble}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating hearts */}
              {floatingHearts.map((h) => (
                <motion.span
                  key={h.id}
                  initial={{ opacity: 1, y: 0, x: h.x, scale: 0.8 }}
                  animate={{ opacity: 0, y: -50, scale: 1.3 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  style={{ position: 'absolute', top: '75px', left: '50%', fontSize: '20px', pointerEvents: 'none', zIndex: 25 }}
                >
                  💖
                </motion.span>
              ))}

              {/* Top Controls: Status pill & Mascot Village Button */}
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', zIndex: 2 }}>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: equippedMascot.color,
                    backgroundColor: `${equippedMascot.color}15`,
                    border: `1px solid ${equippedMascot.color}35`,
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {equippedMascot.title} • Lvl {equippedMascot.level}
                </div>

                <button
                  onClick={() => setIsMascotModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    color: '#e2e8f0',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Maskot Köyü: Yeni maskotları keşfet ve aktif yoldaşını değiştir!"
                >
                  <Sparkles size={11} color={equippedMascot.color} />
                  <span>Maskot Köyü</span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      backgroundColor: `${equippedMascot.color}25`,
                      color: equippedMascot.color,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: 800,
                    }}
                  >
                    {unlockedMascots.length}/{MASCOTS.length}
                  </span>
                </button>
              </div>

              {/* Animated Mascot Avatar with Petting Wiggle */}
              <motion.div
                onClick={handlePetMascot}
                animate={pofudukWiggle ? { rotate: [-12, 12, -8, 8, -4, 4, 0], scale: [1, 1.25, 1] } : { scale: [1, 1.08, 1] }}
                transition={pofudukWiggle ? { duration: 0.5 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontSize: '66px',
                  marginBottom: '6px',
                  marginTop: '4px',
                  filter: `drop-shadow(0 0 16px ${equippedMascot.glow})`,
                  position: 'relative',
                  zIndex: 1,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                title={`${equippedMascot.name}'i sevmek için tıkla!`}
              >
                {equippedMascot.emoji}
              </motion.div>

              <div style={{ textAlign: 'center', marginBottom: '6px', zIndex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {equippedMascot.name} <span style={{ color: equippedMascot.color, fontSize: '15px' }}>({equippedMascot.nickname})</span>
                </h3>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                  🎯 {equippedMascot.specialty}
                </div>
              </div>

              {/* Pet button */}
              <button
                onClick={handlePetMascot}
                style={{
                  marginBottom: '14px',
                  background: 'rgba(236,72,153,0.12)',
                  border: '1px solid rgba(236,72,153,0.35)',
                  color: '#f472b6',
                  borderRadius: '999px',
                  padding: '5px 16px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.16s ease',
                  zIndex: 1,
                }}
              >
                <Heart size={12} fill="#f472b6" /> {equippedMascot.nickname}'i Sev
              </button>

              {/* Next Mascot Progression */}
              <div style={{ width: '100%', marginBottom: '12px', zIndex: 1 }}>
                {nextMascotData ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '5px', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Sonraki:</span>
                        <span style={{ color: nextMascotData.mascot.color, fontWeight: 700 }}>
                          {nextMascotData.mascot.emoji} {nextMascotData.mascot.nickname}
                        </span>
                      </span>
                      <span style={{ color: '#f1f5f9', fontVariantNumeric: 'tabular-nums' }}>
                        {nextMascotData.remainingXp.toLocaleString('tr-TR')} XP kaldı (%{nextMascotData.progressPercent})
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#090e18', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextMascotData.progressPercent}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{ height: '100%', backgroundImage: `linear-gradient(to right, ${equippedMascot.color}, ${nextMascotData.mascot.color})`, borderRadius: '999px' }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(168, 85, 247, 0.15))',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#fef08a'
                  }}>
                    👑 Tüm Maskotlar Açıldı! Kozmik Şampiyonsun!
                  </div>
                )}
              </div>

              {/* Stats bars: Mutluluk & Enerji */}
              <div style={{ width: '100%', marginBottom: '8px', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
                  <span>😊 Mutluluk</span>
                  <span style={{ color: '#f472b6', fontVariantNumeric: 'tabular-nums' }}>{stats?.pofuduk_happiness ?? 85}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#090e18', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.pofuduk_happiness ?? 85}%`, height: '100%', backgroundImage: 'linear-gradient(to right, #ec4899, #38bdf8)', borderRadius: '999px' }} />
                </div>
              </div>
              <div style={{ width: '100%', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px', fontWeight: 600 }}>
                  <span>⚡ Enerji</span>
                  <span style={{ color: '#fbbf24', fontVariantNumeric: 'tabular-nums' }}>{stats?.pofuduk_energy ?? 60}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#090e18', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats?.pofuduk_energy ?? 60}%`, height: '100%', backgroundImage: 'linear-gradient(to right, #eab308, #f97316)', borderRadius: '999px' }} />
                </div>
              </div>
            </div>

            {/* 4 Core Stat Cards */}
            <div style={{ flex: '2 1 320px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {/* Çözülen Soru */}
              <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '2.5px solid #2563eb', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={13} color="#38bdf8" />
                    </div>
                    <span>Çözülen Soru</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {(stats?.solved_questions ?? 0).toLocaleString('tr-TR')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Toplam soru hacmi</span>
                </div>
              </div>

              {/* Başarı Oranı */}
              <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '2.5px solid #22c55e', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={13} color="#4ade80" />
                    </div>
                    <span>Başarı Oranı</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    %{stats?.success_rate ?? 0}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Doğruluk yüzdesi</span>
                </div>
              </div>

              {/* Lig Puanı */}
              <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '2.5px solid #3b82f6', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={13} color="#60a5fa" />
                    </div>
                    <span>Lig Puanı</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {(stats?.league_points ?? 0).toLocaleString('tr-TR')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>🏆 {stats?.league || 'Bronz'} Ligi</span>
                </div>
              </div>

              {/* Çalışma Serisi */}
              <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '2.5px solid #f97316', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flame size={13} color="#fb923c" />
                    </div>
                    <span>Çalışma Serisi</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '6px', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                    {stats?.streak_days ?? 0} <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>gün</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 700 }}>🔥 Alevin canlı</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 5. GÜNLÜK GÖREVLER & GİZEMLİ SANDIK (GAMIFICATION)                   */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #0f1523)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯 Günlük Görevler</span>
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>Görevleri tamamla, XP topla ve günlük ödül sandığını aç!</p>
              </div>
              <span
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.12)',
                  color: '#4ade80',
                  fontSize: '11.5px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {quests.length > 0 ? `${quests.filter(q => q.is_completed === 1).length}/${quests.length} Tamamlandı` : '0/0 Tamamlandı'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
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

                      confetti({
                        particleCount: 80,
                        spread: 70,
                        origin: { y: 0.7 },
                        colors: ['#2563eb', '#fcd34d', '#22c55e', '#3b82f6', '#ec4899'],
                      });
                      fetchGamificationData();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: quest.is_completed === 1 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '12px',
                    border: quest.is_completed === 1 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.07)',
                    cursor: quest.is_completed === 1 ? 'default' : 'pointer',
                    transition: 'all 0.16s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {quest.is_completed === 1 ? (
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '2px solid #64748b', backgroundColor: 'transparent', boxSizing: 'border-box', flexShrink: 0 }}></div>
                    )}
                    <div style={{ fontSize: '13.5px', color: quest.is_completed === 1 ? '#64748b' : '#ffffff', textDecoration: quest.is_completed === 1 ? 'line-through' : 'none', fontWeight: quest.is_completed === 1 ? 500 : 600 }}>
                      {quest.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '3px 10px', borderRadius: '6px', fontVariantNumeric: 'tabular-nums' }}>
                    +{quest.xp_reward} XP
                  </div>
                </div>
              ))}
              {quests.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Şu an için görev bulunmuyor.</div>
              )}
            </div>
            
            {/* Daily Chest Action */}
            {quests.length > 0 && quests.every(q => q.is_completed === 1) ? (
              <div
                onClick={() => {
                  confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#f59e0b', '#fbbf24', '#eab308', '#ca8a04', '#10b981']
                  });
                }}
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid rgba(234, 179, 8, 0.45)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)',
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: '24px' }}>🔓</span>
                <div>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '14.5px', textShadow: '0 0 10px rgba(251, 191, 36, 0.5)' }}>
                    Günlük Sandığı Aç! (+50 Bonus XP)
                  </span>
                  <div style={{ fontSize: '11px', color: '#fef08a' }}>Tüm günlük hedeflerini tamamladın, ödülünü al!</div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '1px dashed rgba(234, 179, 8, 0.25)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '13px' }}>Günlük Sandık Kilitli ({quests.filter(q => q.is_completed === 1).length}/{quests.length} Görev)</span>
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 6. ÖDEVLER + DUYURULAR STREAM                                         */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Ödevlerim */}
            <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋 Bekleyen Ödevlerim</span>
                </span>
                {pendingAssignments.length > 0 && (
                  <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.25)' }}>
                    {pendingAssignments.length} bekliyor
                  </span>
                )}
              </div>
              {pendingAssignments.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                  🎉 Bekleyen öğretmen ödevin bulunmuyor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingAssignments.slice(0, 3).map((a: any) => {
                    const isOverdue = a.due_date && new Date(a.due_date) < new Date();
                    return (
                      <div
                        key={a.id}
                        onClick={() => handleTabChange('sinifim')}
                        style={{
                          padding: '12px 14px',
                          background: 'rgba(255,255,255,0.025)',
                          borderRadius: '10px',
                          border: `1px solid ${isOverdue ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{a.title}</div>
                          {isOverdue && (
                            <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800 }}>Süresi Geçti</span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>
                          {a.teacher_name} · {a.due_date ? new Date(a.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 'Süresiz'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duyurular */}
            <div style={{ backgroundColor: 'var(--bg-card, #0f1523)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📢 Sınıf Duyuruları</span>
                </span>
              </div>
              {announcements.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                  Henüz yeni bir duyuru bulunmuyor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {announcements.slice(0, 3).map((a: any) => (
                    <div key={a.id} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.025)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{a.title}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>
                        {a.teacher_name} · {new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 7. BAŞARIMLAR RAKI (ACHIEVEMENTS)                                     */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #0f1523)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="#eab308" />
                <span>Kazanılan Başarımlar</span>
              </h3>
              <span style={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#60a5fa', fontSize: '11.5px', padding: '4px 12px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                {achievements.length} Başarım
              </span>
            </div>

            {achievements.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.08)', fontSize: '13px' }}>
                Henüz hiç başarım kilidi açılmadı. Test çözerek ve serini koruyarak ilk başarımını kazan!
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '9999px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.15s ease',
                    }}
                    title={ach.description}
                  >
                    <span style={{ fontSize: '18px' }}>{ach.icon || '🏆'}</span>
                    <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}>{ach.name}</span>
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
    <div style={{ width: '100%', height: '100%', fontFamily: 'var(--font-sans, "Inter", sans-serif)' }}>
      <AnimatePresence mode="wait">
        {(activeTab === 'home' || !activeTab) && (
          <motion.div key="home" style={{ height: '100%' }}>
            <PullToRefresh onRefresh={handleRefresh}>
              {renderHome()}
            </PullToRefresh>
          </motion.div>
        )}
        {activeTab === 'hedef' && <HedefTab key="hedef" />}
        {activeTab === 'mistakes' && <MistakesTab key="mistakes" />}
        {activeTab === 'topics' && <TopicsTab key="topics" />}
        {activeTab === 'tests' && <TestsTab key="tests" />}
        {activeTab === 'analysis' && <AnalysisTab key="analysis" />}
        {activeTab === 'cards' && <CardsTab key="cards" />}
        {activeTab === 'focus' && <FocusTab key="focus" />}
        {activeTab === 'schedule' && <ScheduleTab key="schedule" />}
        {activeTab === 'astratutor' && <AstraTutorTab key="astratutor" />}
        {(activeTab === 'tercih-robotu' || activeTab === 'tercih_robotu') && <TercihRobotuTab key="tercih-robotu" />}
        {(activeTab === 'tercih-listem' || activeTab === 'tercih_listem') && <TercihListemTab key="tercih-listem" />}
        {(activeTab === 'sinif' || activeTab === 'sinifim') && <SinifimTab key="sinif" />}
        {activeTab === 'forum' && <ForumTab key="forum" />}
        {(activeTab === 'profile' || activeTab === 'profil') && <ProfileTab key="profile" />}
      </AnimatePresence>

      {/* Mascot Village Modal */}
      <AnimatePresence>
        {isMascotModalOpen && (
          <MascotVillageModal
            isOpen={isMascotModalOpen}
            onClose={() => setIsMascotModalOpen(false)}
            currentXp={currentXp}
            equippedMascot={equippedMascot}
            unlockedMascots={unlockedMascots}
            onEquip={handleEquipMascot}
            equippingId={equippingMascotId}
          />
        )}
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
