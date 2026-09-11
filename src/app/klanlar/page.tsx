"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Users, Zap, Trophy, Plus, Crown, LogOut, Search, Star, Loader2, X, Mail, Check, AlertCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Seviye sistemi: her 200 XP = 1 seviye
function getLevel(xp: number) {
  return Math.floor(xp / 200) + 1;
}
function getLevelProgress(xp: number) {
  return xp % 200;
}

const CLAN_CREATE_MIN_XP = 1000; // Level 5
const CLAN_CREATE_MIN_LEVEL = 5;

const ICON_OPTIONS = ['⚔️', '🛡️', '🔥', '⚡', '🌟', '🏆', '🦅', '🐉', '🎯', '💎', '🧠', '🚀'];
const COLOR_OPTIONS = ['#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];

export default function KlanlarPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Klan Ligi' | 'Klanım' | 'Klan Bul'>('Klan Ligi');
  const [clans, setClans] = useState<any[]>([]);
  const [myClan, setMyClan] = useState<any>(null);
  const [myClanDetails, setMyClanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClan, setSelectedClan] = useState<any>(null);
  const [myXp, setMyXp] = useState(0);
  const [myLevel, setMyLevel] = useState(1);

  // Create form
  const [createForm, setCreateForm] = useState({ name: '', description: '', icon: '⚔️', color: '#8b5cf6' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Invite system
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      // Fetch XP
      const statsRes = await fetch('/api/gamification');
      const statsData = await statsRes.json();
      const xp = statsData?.stats?.xp || 0;
      setMyXp(xp);
      setMyLevel(getLevel(xp));

      // Fetch clans
      const res = await fetch('/api/clans');
      const data = await res.json();
      const fetchedClans = data.clans || [];
      setClans(fetchedClans);

      if (data.userClanId) {
        const mine = fetchedClans.find((c: any) => c.id === data.userClanId);
        setMyClan(mine || null);

        if (mine) {
          const detailRes = await fetch(`/api/clans/${data.userClanId}`);
          const detailData = await detailRes.json();
          setMyClanDetails(detailData);
        }
      }

      // Fetch pending invites
      const invRes = await fetch('/api/clans/invite');
      const invData = await invRes.json();
      setPendingInvites(invData.invites || []);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function createClan() {
    if (!createForm.name.trim()) return;
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await fetch('/api/clans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (data.error) {
        setCreateError(data.error);
      } else {
        await fetchAll();
        setActiveTab('Klanım');
      }
    } catch {
      setCreateError('Sunucu hatası');
    } finally {
      setCreateLoading(false);
    }
  }

  async function joinClan(clanId: string) {
    try {
      const res = await fetch('/api/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clanId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
        setActiveTab('Klanım');
      } else {
        alert(data.error || 'Katılma başarısız');
      }
    } catch {
      alert('Sunucu hatası');
    }
  }

  async function leaveClan() {
    if (!confirm('Klandan ayrılmak istediğinden emin misin?')) return;
    try {
      const res = await fetch('/api/clans/leave', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMyClan(null);
        setMyClanDetails(null);
        await fetchAll();
      }
    } catch {
      alert('Sunucu hatası');
    }
  }

  async function sendInvite() {
    if (!inviteUsername.trim()) return;
    setInviteLoading(true);
    setInviteMsg('');
    try {
      const res = await fetch('/api/clans/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', username: inviteUsername })
      });
      const data = await res.json();
      setInviteMsg(data.message || data.error || '');
      if (data.success) setInviteUsername('');
    } catch {
      setInviteMsg('Sunucu hatası');
    } finally {
      setInviteLoading(false);
    }
  }

  async function respondToInvite(inviteId: string, accept: boolean) {
    try {
      const res = await fetch('/api/clans/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: accept ? 'accept' : 'reject', inviteId })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAll();
      } else {
        alert(data.error || 'İşlem başarısız');
      }
    } catch {
      alert('Sunucu hatası');
    }
  }

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
  };

  const canCreateClan = myXp >= CLAN_CREATE_MIN_XP;
  const levelProgressPct = (getLevelProgress(myXp) / 200) * 100;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            🛡️ Klanlar
          </h1>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            Arkadaşlarınla klan kur, haftalık XP savaşında zirvede ol!
          </p>
        </div>
        {/* Seviye Göstergesi */}
        <div style={{ ...card, padding: '1rem 1.5rem', minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Star size={16} color="#f59e0b" />
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>Seviye {myLevel}</span>
            <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>{myXp} XP</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${levelProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>{getLevelProgress(myXp)}/200 XP → Seviye {myLevel + 1}</div>
        </div>
      </div>

      {/* Gelen Davetler Banner */}
      <AnimatePresence>
        {pendingInvites.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '12px', padding: '1rem 1.5rem' }}>
            <div style={{ fontWeight: 700, color: '#c4b5fd', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} /> {pendingInvites.length} Klan Daveti
            </div>
            {pendingInvites.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '1.5rem' }}>{inv.clan_icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{inv.clan_name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}> — {inv.invited_by_username} seni davet etti</span>
                </div>
                <button onClick={() => respondToInvite(inv.id, true)} style={{ background: '#10b981', border: 'none', borderRadius: '8px', padding: '6px 14px', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={14} /> Kabul
                </button>
                <button onClick={() => respondToInvite(inv.id, false)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '6px 14px', color: '#f87171', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X size={14} /> Reddet
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bilgi Banner */}
      <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', color: '#93c5fd', fontSize: '0.85rem' }}>
        <strong>📢 Nasıl çalışır?</strong> Her hafta soru çözdükçe, düello kazandıkça ve görev tamamladıkça klanına XP katkısı yaparsın. En çok XP toplayan klan <strong>Şampiyonlar Ligi Rozeti</strong> kazanır!
        {!canCreateClan && <span style={{ display: 'block', marginTop: '0.4rem', color: '#fbbf24' }}>⚠️ Klan kurmak için <strong>Seviye 5 (1000 XP)</strong> gereklidir. Şu anki seviyeniz: <strong>Seviye {myLevel}</strong></span>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '0.35rem' }}>
        {(['Klan Ligi', 'Klanım', 'Klan Bul'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
              color: activeTab === tab ? '#c4b5fd' : '#64748b', }}>
            {tab}
          </button>
        ))}
      </div>

      {/* === KLAN LİGİ === */}
      {activeTab === 'Klan Ligi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clans.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Henüz hiç klan kurulmamış. İlk klanı sen kur!</p>}
          {clans.map((clan: any, i: number) => (
            <motion.div key={clan.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedClan(clan)}
              style={{ ...card, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                border: myClan?.id === clan.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: myClan?.id === clan.id ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.04)' }}>
              <div style={{ width: '40px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 900, color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3a' : '#64748b' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div style={{ fontSize: '2rem' }}>{clan.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {clan.name}
                  {myClan?.id === clan.id && <span style={{ background: 'rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '99px' }}>KLANİM</span>}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{clan.member_count || 0} üye</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#a78bfa', fontSize: '1.1rem' }}>{clan.weekly_xp} <span style={{ fontSize: '0.7rem', color: '#64748b' }}>haftalık XP</span></div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{clan.total_xp} toplam</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* === KLANIM === */}
      {activeTab === 'Klanım' && (
        <div>
          {!myClan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ ...card, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🛡️</div>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>Henüz bir klana üye değilsin</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Klan kur veya mevcut bir klana katıl</p>
              </div>

              {/* Seviye kilidi */}
              {!canCreateClan ? (
                <div style={{ ...card, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Lock size={24} color="#f87171" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fca5a5' }}>Klan Kurma Kilitli</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Seviye 5 (1000 XP) gereklidir</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${Math.min((myXp / CLAN_CREATE_MIN_XP) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', borderRadius: '8px', transition: 'width 0.5s ease' }} />
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'right' }}>{myXp} / {CLAN_CREATE_MIN_XP} XP</div>
                  <button onClick={() => setActiveTab('Klan Bul')} style={{ width: '100%', marginTop: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>
                    Mevcut Klanlara Katıl →
                  </button>
                </div>
              ) : (
                <div style={card}>
                  <h3 style={{ color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} color="#8b5cf6" /> Yeni Klan Kur
                  </h3>

                  {/* Icon seçici */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Klan İkonu</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {ICON_OPTIONS.map(icon => (
                        <button key={icon} onClick={() => setCreateForm(f => ({ ...f, icon }))}
                          style={{ width: '40px', height: '40px', fontSize: '1.2rem', border: createForm.icon === icon ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', background: createForm.icon === icon ? 'rgba(139,92,246,0.2)' : 'transparent', cursor: 'pointer' }}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color seçici */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Klan Rengi</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {COLOR_OPTIONS.map(color => (
                        <button key={color} onClick={() => setCreateForm(f => ({ ...f, color }))}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, border: createForm.color === color ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>

                  <input placeholder="Klan Adı *" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '0.75rem' }} />
                  <textarea placeholder="Klan Açıklaması *" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} />
                  {createError && (
                    <div style={{ color: '#f87171', fontSize: '0.8rem', margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={14} /> {createError}
                    </div>
                  )}
                  <button onClick={createClan} disabled={createLoading || !createForm.name.trim() || !createForm.description.trim()}
                    style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '10px', padding: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', opacity: createLoading ? 0.7 : 1 }}>
                    {createLoading ? '⏳ Kuruluyor...' : `${createForm.icon} Klan Kur`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Klan Detayı */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Klan Başlığı */}
              <div style={{ ...card, background: `linear-gradient(135deg, ${myClan.color}22, rgba(255,255,255,0.02))`, border: `1px solid ${myClan.color}44` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>{myClan.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{myClan.name}</h2>
                    <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{myClan.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                      <span style={{ color: '#a78bfa', fontWeight: 700 }}>⚡ {myClan.weekly_xp} Haftalık XP</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• {myClan.member_count} Üye</span>
                    </div>
                  </div>
                  <button onClick={leaveClan} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '8px 14px', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8rem' }}>
                    <LogOut size={14} /> Ayrıl
                  </button>
                </div>
              </div>

              {/* Davet Sistemi */}
              <div style={card}>
                <h3 style={{ color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={18} color="#8b5cf6" /> Arkadaş Davet Et
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input placeholder="Kullanıcı adı gir..." value={inviteUsername} onChange={e => setInviteUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendInvite()}
                    style={{ flex: 1, padding: '10px 14px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '14px', outline: 'none' }} />
                  <button onClick={sendInvite} disabled={inviteLoading || !inviteUsername.trim()}
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '10px', padding: '10px 18px', color: '#fff', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', opacity: inviteLoading ? 0.7 : 1 }}>
                    {inviteLoading ? '⏳' : '📨 Davet Et'}
                  </button>
                </div>
                {inviteMsg && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                    background: inviteMsg.includes('gönderildi') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    color: inviteMsg.includes('gönderildi') ? '#34d399' : '#f87171', border: inviteMsg.includes('gönderildi') ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                    {inviteMsg}
                  </div>
                )}
              </div>

              {/* Üyeler */}
              <div style={card}>
                <h3 style={{ color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="#8b5cf6" /> Üyeler
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(myClanDetails?.members || []).sort((a: any, b: any) => b.weekly_contribution - a.weekly_contribution).map((m: any, i: number) => (
                    <div key={m.user_id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c4b5fd', fontWeight: 700, fontSize: '0.85rem' }}>
                        {m.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{m.username}</span>
                        {m.role === 'leader' && <span style={{ marginLeft: '0.5rem', color: '#f59e0b', fontSize: '0.7rem' }}>👑 Lider</span>}
                      </div>
                      <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem' }}>+{m.weekly_contribution} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === KLAN BUL === */}
      {activeTab === 'Klan Bul' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {clans.length === 0 && <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>Henüz hiç klan kurulmamış.</p>}
          {clans.map((clan: any) => (
            <div key={clan.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem' }}>{clan.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#fff' }}>{clan.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{clan.description} • {clan.member_count || 0} üye</div>
              </div>
              <div style={{ textAlign: 'right', marginRight: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: '#a78bfa' }}>{clan.weekly_xp} XP/hafta</div>
              </div>
              {!myClan && (
                <button onClick={() => joinClan(clan.id)}
                  style={{ background: `${clan.color}33`, border: `1px solid ${clan.color}66`, borderRadius: '10px', padding: '8px 16px', color: clan.color, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Katıl
                </button>
              )}
              {myClan?.id === clan.id && (
                <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '0.8rem' }}>✓ Klanın</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Klan Detay Modal */}
      <AnimatePresence>
        {selectedClan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedClan(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#12141c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', maxWidth: '480px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{selectedClan.icon}</span>
                  <div>
                    <h2 style={{ color: '#fff', margin: 0 }}>{selectedClan.name}</h2>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.8rem' }}>{selectedClan.member_count} üye</p>
                  </div>
                </div>
                <button onClick={() => setSelectedClan(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{selectedClan.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: '1.5rem' }}>{selectedClan.weekly_xp}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Haftalık XP</div>
                </div>
                <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ color: '#93c5fd', fontWeight: 800, fontSize: '1.5rem' }}>{selectedClan.total_xp}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Toplam XP</div>
                </div>
              </div>
              {!myClan && (
                <button onClick={() => { joinClan(selectedClan.id); setSelectedClan(null); }}
                  style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                  Bu Klana Katıl
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
