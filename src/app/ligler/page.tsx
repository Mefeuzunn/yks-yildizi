"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Trophy, Crown, Medal, Flame, TrendingUp, Loader2, Sparkles, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';

interface LeagueInfo {
  name: string;
  minXp: number;
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: React.ReactNode;
}

const LEAGUES: LeagueInfo[] = [
  { name: 'Bronz', minXp: 0, color: '#d97706', bg: 'rgba(180, 83, 9, 0.15)', border: 'rgba(217, 119, 6, 0.3)', glow: 'rgba(217, 119, 6, 0.25)', icon: <Medal size={16} /> },
  { name: 'Gümüş', minXp: 100, color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.3)', glow: 'rgba(156, 163, 175, 0.25)', icon: <Medal size={16} /> },
  { name: 'Altın', minXp: 500, color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.35)', glow: 'rgba(250, 204, 21, 0.35)', icon: <Trophy size={16} /> },
  { name: 'Platin', minXp: 1000, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)', glow: 'rgba(56, 189, 248, 0.35)', icon: <Trophy size={16} /> },
  { name: 'Elmas', minXp: 2000, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.4)', glow: 'rgba(99, 102, 241, 0.35)', icon: <Crown size={16} /> },
  { name: 'Şampiyon', minXp: 3000, color: '#c084fc', bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.5)', glow: 'rgba(168, 85, 247, 0.45)', icon: <Crown size={16} /> },
];

const LEAGUE_MAP: Record<string, LeagueInfo> = LEAGUES.reduce((acc, l) => ({ ...acc, [l.name]: l }), {});

const NEXT_LEAGUE_THRESHOLDS: Record<string, { next: string; xp: number }> = {
  'Bronz': { next: 'Gümüş', xp: 100 },
  'Gümüş': { next: 'Altın', xp: 500 },
  'Altın': { next: 'Platin', xp: 1000 },
  'Platin': { next: 'Elmas', xp: 2000 },
  'Elmas': { next: 'Şampiyon', xp: 3000 },
  'Şampiyon': { next: 'Maksimum Lig', xp: 3000 }
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState<any>({ league: 'Bronz', league_points: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('Hepsi');

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
          setCurrentUserStats(data.currentUserStats || { league: 'Bronz', league_points: 0 });
        }
      } catch (err) {
        console.error('Leaderboard error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#080c14' }}>
        <Loader2 className="animate-spin" size={48} color="#facc15" />
      </div>
    );
  }

  // Find user's rank
  const myRankIndex = leaderboard.findIndex(u => u.isCurrentUser);
  const myRank = myRankIndex !== -1 ? leaderboard[myRankIndex].rank : '-';

  const userLeague = currentUserStats.league || 'Bronz';
  const userScore = currentUserStats.league_points || 0;
  const currentLeagueInfo = LEAGUE_MAP[userLeague] || LEAGUE_MAP['Bronz'];
  const nextTarget = NEXT_LEAGUE_THRESHOLDS[userLeague] || NEXT_LEAGUE_THRESHOLDS['Bronz'];
  const progressPercent = userLeague === 'Şampiyon' ? 100 : Math.min(100, Math.max(0, (userScore / nextTarget.xp) * 100));

  // Filtered leaderboard
  const filteredLeaderboard = selectedTierFilter === 'Hepsi'
    ? leaderboard
    : leaderboard.filter(u => u.tier?.toLowerCase() === selectedTierFilter.toLowerCase());

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="custom-scrollbar" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))' }}>
      
      {/* ── Header ── */}
      <header style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 35px rgba(234, 179, 8, 0.35)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Trophy size={28} color="#080c14" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.85rem)', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Şampiyonlar Ligi
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.3)' }}>CANLI</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
              Soru çöz, düelloları kazan ve Türkiye genelinde zirveye tırman.
            </p>
          </div>
        </div>

        {/* User Quick Rank Pill */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="#38bdf8" />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Sıran:</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>#{myRank}</span>
          </div>
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} color="#ef4444" />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Puan:</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#facc15' }}>{userScore.toLocaleString('tr-TR')} XP</span>
          </div>
        </div>
      </header>

      {/* ── League Tiers Track ── */}
      <div style={{ marginBottom: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '12px 16px', overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '8px', WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setSelectedTierFilter('Hepsi')}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            border: selectedTierFilter === 'Hepsi' ? '1px solid #6366f1' : '1px solid transparent',
            background: selectedTierFilter === 'Hepsi' ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: selectedTierFilter === 'Hepsi' ? '#fff' : '#94a3b8',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
        >
          Tüm Sıralama
        </button>
        {LEAGUES.map((l, i) => {
          const isCurrent = l.name.toLowerCase() === userLeague.toLowerCase();
          const isSelected = selectedTierFilter.toLowerCase() === l.name.toLowerCase();
          return (
            <React.Fragment key={l.name}>
              <button
                onClick={() => setSelectedTierFilter(l.name)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? `1px solid ${l.color}` : isCurrent ? `1px dashed ${l.color}` : '1px solid rgba(255,255,255,0.06)',
                  background: isSelected ? l.bg : isCurrent ? 'rgba(255,255,255,0.04)' : 'transparent',
                  color: isSelected ? l.color : isCurrent ? '#fff' : '#94a3b8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {l.icon}
                <span>{l.name}</span>
                {isCurrent && <span style={{ fontSize: '9px', background: l.color, color: '#000', padding: '1px 5px', borderRadius: '6px', fontWeight: 800 }}>SEN</span>}
              </button>
              {i < LEAGUES.length - 1 && <ChevronRight size={14} color="rgba(255,255,255,0.15)" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Main Layout Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN — User Status Card & Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Current User Tier Progress Card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ 
              backgroundColor: '#0f172a', 
              border: `1px solid ${currentLeagueInfo.border}`, 
              borderRadius: '24px', 
              padding: 'clamp(20px, 4vw, 28px)', 
              position: 'relative', 
              overflow: 'hidden',
              boxShadow: `0 0 30px ${currentLeagueInfo.glow}`
            }}
          >
            {/* Top ambient glow */}
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', background: currentLeagueInfo.color, filter: 'blur(60px)', opacity: 0.2, borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '28px', position: 'relative', zIndex: 10 }}>
              <div style={{ 
                width: '68px', height: '68px', borderRadius: '20px', 
                background: currentLeagueInfo.bg,
                border: `1.5px solid ${currentLeagueInfo.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${currentLeagueInfo.glow}`
              }}>
                <Crown size={34} color={currentLeagueInfo.color} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Mevcut Ligin</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: currentLeagueInfo.color, letterSpacing: '-0.02em' }}>
                  {userLeague} Ligi
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Sezon Sonu Ödülleri Aktif</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <TrendingUp size={16} color="#38bdf8" />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Sıralama</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>#{myRank}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Flame size={16} color="#ef4444" />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Lig Puanı</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#facc15' }}>
                  {userScore.toLocaleString('tr-TR')} <span style={{ fontSize: '11px', color: '#64748b' }}>XP</span>
                </div>
              </div>
            </div>

            {/* Progress to Next Tier */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                  {nextTarget.next === 'Maksimum Lig' ? 'Zirvedesin!' : `${nextTarget.next} Ligi'ne Yükselme`}
                </span>
                <span style={{ fontSize: '12px', color: currentLeagueInfo.color, fontWeight: 700 }}>
                  {userScore.toLocaleString('tr-TR')} / {nextTarget.xp.toLocaleString('tr-TR')} XP
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '999px', width: '100%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progressPercent}%` }} 
                  transition={{ duration: 1.2, ease: 'easeOut' }} 
                  style={{ 
                    height: '100%', 
                    background: `linear-gradient(90deg, #6366f1, ${currentLeagueInfo.color})`, 
                    borderRadius: '999px', 
                    boxShadow: `0 0 10px ${currentLeagueInfo.glow}` 
                  }} 
                />
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>%{progressPercent.toFixed(0)} tamamlandı</span>
                {userLeague !== 'Şampiyon' && (
                  <span>{(nextTarget.xp - userScore > 0 ? nextTarget.xp - userScore : 0).toLocaleString('tr-TR')} XP kaldı</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Rules Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>
              <ShieldCheck size={18} color="#10b981" /> Lig Kuralları & Puanlama
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#94a3b8', fontSize: '12px', lineHeight: 1.8 }}>
              <li>Her çözülen doğru test sorusu: <strong style={{ color: '#f1f5f9' }}>+10 XP</strong></li>
              <li>Bilgi Arenası düello galibiyeti: <strong style={{ color: '#f1f5f9' }}>+50 XP</strong></li>
              <li>Haftalık lig birincilerine özel <strong style={{ color: '#facc15' }}>Şampiyon Rozeti</strong> verilir.</li>
              <li>Sıralama her 60 saniyede bir otomatik güncellenir.</li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN — Podium + Leaderboard Table & Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px', overflow: 'hidden' }}
        >
          {/* ── 3D PODIUM SHOWCASE (Desktop & Mobile) ── */}
          {top3.length >= 3 && (
            <div style={{ padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px) 16px', background: 'radial-gradient(ellipse at top, rgba(250, 204, 21, 0.08) 0%, transparent 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(250, 204, 21, 0.12)', padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(250, 204, 21, 0.25)' }}>
                  👑 Zirvedeki Şampiyonlar
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'clamp(8px, 2vw, 16px)', maxWidth: '540px', margin: '0 auto' }}>
                
                {/* 2nd Place — Silver */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 'clamp(46px, 8vw, 56px)', height: 'clamp(46px, 8vw, 56px)', borderRadius: '50%',
                    background: top3[1].avatarEmoji ? `${top3[1].avatarColor || '#9ca3af'}25` : 'linear-gradient(135deg, #9ca3af, #4b5563)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: top3[1].avatarEmoji ? '22px' : '15px',
                    border: `2px solid ${top3[1].avatarColor || '#9ca3af'}`,
                    boxShadow: '0 4px 16px rgba(156, 163, 175, 0.35)', position: 'relative'
                  }}>
                    {top3[1].avatarEmoji || (top3[1].name || 'U').substring(0,2).toUpperCase()}
                    <span style={{ position: 'absolute', top: -12, fontSize: '18px' }}>🥈</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginTop: '8px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                    {top3[1].name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                    {top3[1].score.toLocaleString('tr-TR')} XP
                  </div>
                  <div style={{ width: '100%', height: 'clamp(55px, 9vw, 90px)', background: 'linear-gradient(180deg, rgba(156,163,175,0.25) 0%, rgba(156,163,175,0.04) 100%)', borderRadius: '12px 12px 0 0', marginTop: '8px', borderTop: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontWeight: 900, fontSize: '18px' }}>
                    2
                  </div>
                </div>

                {/* 1st Place — Gold (Center, Elevated) */}
                <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 'clamp(58px, 10vw, 70px)', height: 'clamp(58px, 10vw, 70px)', borderRadius: '50%',
                    background: top3[0].avatarEmoji ? `${top3[0].avatarColor || '#facc15'}30` : 'linear-gradient(135deg, #facc15, #ca8a04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 900, fontSize: top3[0].avatarEmoji ? '26px' : '18px',
                    border: `3px solid ${top3[0].avatarColor || '#facc15'}`,
                    boxShadow: '0 0 30px rgba(250, 204, 21, 0.55)', position: 'relative'
                  }}>
                    {top3[0].avatarEmoji || (top3[0].name || 'U').substring(0,2).toUpperCase()}
                    <span style={{ position: 'absolute', top: -16, fontSize: '24px' }}>👑</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#facc15', marginTop: '8px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                    {top3[0].name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#fef08a', fontWeight: 700 }}>
                    {top3[0].score.toLocaleString('tr-TR')} XP
                  </div>
                  <div style={{ width: '100%', height: 'clamp(80px, 13vw, 130px)', background: 'linear-gradient(180deg, rgba(250,204,21,0.3) 0%, rgba(250,204,21,0.05) 100%)', borderRadius: '14px 14px 0 0', marginTop: '8px', borderTop: '3px solid #facc15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontWeight: 900, fontSize: '24px' }}>
                    1
                  </div>
                </div>

                {/* 3rd Place — Bronze */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 'clamp(46px, 8vw, 56px)', height: 'clamp(46px, 8vw, 56px)', borderRadius: '50%',
                    background: top3[2].avatarEmoji ? `${top3[2].avatarColor || '#d97706'}25` : 'linear-gradient(135deg, #d97706, #78350f)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: top3[2].avatarEmoji ? '22px' : '15px',
                    border: `2px solid ${top3[2].avatarColor || '#d97706'}`,
                    boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)', position: 'relative'
                  }}>
                    {top3[2].avatarEmoji || (top3[2].name || 'U').substring(0,2).toUpperCase()}
                    <span style={{ position: 'absolute', top: -12, fontSize: '18px' }}>🥉</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginTop: '8px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                    {top3[2].name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>
                    {top3[2].score.toLocaleString('tr-TR')} XP
                  </div>
                  <div style={{ width: '100%', height: 'clamp(45px, 7vw, 70px)', background: 'linear-gradient(180deg, rgba(217,119,6,0.25) 0%, rgba(217,119,6,0.04) 100%)', borderRadius: '12px 12px 0 0', marginTop: '8px', borderTop: '2px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: 900, fontSize: '18px' }}>
                    3
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── DESKTOP TABLE VIEW ── */}
          <div className="desktop-only" style={{ width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ padding: '16px 24px', width: '70px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Öğrenci</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Lig Kademesi</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Toplam Puan</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      Bu kategoride kayıtlı öğrenci bulunamadı.
                    </td>
                  </tr>
                )}
                {filteredLeaderboard.map((userRow, idx) => {
                  const isCurrentUser = userRow.isCurrentUser;
                  const tierData = LEAGUE_MAP[userRow.tier] || LEAGUE_MAP['Bronz'];
                  
                  let rankDisplay: React.ReactNode = <span style={{ color: '#94a3b8', fontWeight: 600 }}>{userRow.rank}</span>;
                  if (userRow.rank === 1) rankDisplay = <span style={{ fontSize: '20px' }}>🥇</span>;
                  if (userRow.rank === 2) rankDisplay = <span style={{ fontSize: '20px' }}>🥈</span>;
                  if (userRow.rank === 3) rankDisplay = <span style={{ fontSize: '20px' }}>🥉</span>;

                  return (
                    <tr 
                      key={userRow.rank} 
                      style={{ 
                        backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                        borderBottom: idx === filteredLeaderboard.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: userRow.rank <= 3 ? 800 : 600 }}>
                        {rankDisplay}
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? '#fff' : '#d1d5db' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: userRow.avatarEmoji ? `${userRow.avatarColor || '#6366f1'}25` : 'linear-gradient(135deg, #334155, #1e293b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: userRow.avatarEmoji ? '18px' : '13px', fontWeight: 700, color: '#fff',
                            border: userRow.avatarEmoji ? `1.5px solid ${userRow.avatarColor || '#6366f1'}` : (isCurrentUser ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)'),
                            boxShadow: userRow.avatarEmoji ? `0 0 10px ${userRow.avatarColor || '#6366f1'}40` : 'none',
                            flexShrink: 0
                          }}>
                            {userRow.avatarEmoji || (userRow.name || 'U').substring(0,2).toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: isCurrentUser ? '#fff' : '#e2e8f0', fontWeight: isCurrentUser ? 800 : 600 }}>
                              {userRow.name}
                            </span>
                            {isCurrentUser && (
                              <span style={{ fontSize: '11px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 7px', borderRadius: '6px', fontWeight: 700 }}>
                                SEN
                              </span>
                            )}
                            {userRow.badgeName && (
                              <span style={{
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                                background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)',
                                display: 'inline-flex', alignItems: 'center', gap: '4px'
                              }}>
                                <span>{userRow.badgeEmoji}</span>
                                <span>{userRow.badgeName}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px',
                          backgroundColor: tierData.bg,
                          color: tierData.color,
                          border: `1px solid ${tierData.border}`,
                        }}>
                          {tierData.icon}
                          {userRow.tier}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 800, color: isCurrentUser ? '#818cf8' : '#f1f5f9', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {userRow.score.toLocaleString('tr-TR')} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>XP</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE LIST VIEW ── */}
          <div className="mobile-only" style={{ padding: '16px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', padding: '0 4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {selectedTierFilter} Sıralaması
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                {filteredLeaderboard.length} Öğrenci
              </span>
            </div>

            {filteredLeaderboard.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Bu kategoride kayıtlı öğrenci bulunamadı.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredLeaderboard.map((userRow) => {
                  const isCurrentUser = userRow.isCurrentUser;
                  const tierData = LEAGUE_MAP[userRow.tier] || LEAGUE_MAP['Bronz'];

                  return (
                    <div
                      key={userRow.rank}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: '16px',
                        backgroundColor: isCurrentUser ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: isCurrentUser ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      {/* Rank */}
                      <div style={{ width: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: userRow.rank === 1 ? '#facc15' : userRow.rank === 2 ? '#9ca3af' : userRow.rank === 3 ? '#d97706' : '#64748b' }}>
                        {userRow.rank <= 3 ? (userRow.rank === 1 ? '🥇' : userRow.rank === 2 ? '🥈' : '🥉') : `#${userRow.rank}`}
                      </div>

                      {/* Avatar */}
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: userRow.avatarEmoji ? `${userRow.avatarColor || '#6366f1'}25` : 'linear-gradient(135deg, #334155, #1e293b)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: userRow.avatarEmoji ? '18px' : '12px', fontWeight: 700, color: '#fff',
                        border: userRow.avatarEmoji ? `1.5px solid ${userRow.avatarColor || '#6366f1'}` : (isCurrentUser ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)'),
                        boxShadow: userRow.avatarEmoji ? `0 0 10px ${userRow.avatarColor || '#6366f1'}40` : 'none',
                        flexShrink: 0
                      }}>
                        {userRow.avatarEmoji || (userRow.name || 'U').substring(0,2).toUpperCase()}
                      </div>

                      {/* Name & Tier */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '14px', fontWeight: isCurrentUser ? 800 : 600, color: isCurrentUser ? '#fff' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {userRow.name}
                          </span>
                          {isCurrentUser && (
                            <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>
                              SEN
                            </span>
                          )}
                          {userRow.badgeName && (
                            <span style={{
                              fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '6px',
                              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.25)',
                              display: 'inline-flex', alignItems: 'center', gap: '2px', flexShrink: 0
                            }}>
                              <span>{userRow.badgeEmoji}</span>
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '6px', backgroundColor: tierData.bg, color: tierData.color, marginTop: '2px' }}>
                          {tierData.icon}
                          {userRow.tier}
                        </div>
                      </div>

                      {/* Score */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: isCurrentUser ? '#818cf8' : '#fff', fontVariantNumeric: 'tabular-nums' }}>
                          {userRow.score.toLocaleString('tr-TR')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>XP</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </motion.div>
      </div>

      <style jsx>{`
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
