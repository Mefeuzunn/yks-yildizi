'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  User, Shield, Bell, Key, LogOut, Save, Loader2,
  CheckCircle, GraduationCap, Target, Calendar,
  Trophy, Flame, BookOpen, Copy, Check
} from 'lucide-react';
import { PushNotificationToggle } from '@/components/PWAComponents';
import { SHOP_ITEMS } from '@/lib/shop-items';

interface ProfileData {
  username: string;
  email: string;
  sinif: string;
  alan: string;
  target_uni: string;
  target_dept: string;
  parent_code: string;
  created_at: string;
}

interface StatsData {
  solved_questions: number;
  success_rate: number;
  streak_days: number;
  league: string;
  league_points: number;
  xp: number;
  total_focus_minutes: number;
}

export default function ProfileTab() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<'profil' | 'bildirim' | 'guvenlik'>('profil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    username: '', email: '', sinif: '12', alan: 'Sayısal',
    target_uni: '', target_dept: '', parent_code: '', created_at: '',
  });
  const [stats, setStats] = useState<StatsData>({
    solved_questions: 0, success_rate: 0, streak_days: 0,
    league: 'Bronz', league_points: 0, xp: 0, total_focus_minutes: 0,
  });
  const [equippedAvatar, setEquippedAvatar] = useState<any>(null);
  const [equippedBadge, setEquippedBadge] = useState<any>(null);

  // Password change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/user/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/user/target').then(r => r.ok ? r.json() : null),
      fetch('/api/shop/inventory').then(r => r.ok ? r.json() : null),
    ]).then(([dashData, targetData, invData]) => {
      if (dashData) {
        setStats({
          solved_questions: dashData.stats?.solved_questions || 0,
          success_rate: dashData.stats?.success_rate || 0,
          streak_days: dashData.stats?.streak_days || 0,
          league: dashData.stats?.league || 'Bronz',
          league_points: dashData.stats?.league_points || 0,
          xp: dashData.stats?.xp || 0,
          total_focus_minutes: dashData.stats?.total_focus_min || 0,
        });
      }
      if (invData && Array.isArray(invData.equipped)) {
        const avatar = SHOP_ITEMS.find(i => i.category === 'avatars' && invData.equipped.includes(i.id));
        const badge = SHOP_ITEMS.find(i => i.category === 'badges' && invData.equipped.includes(i.id));
        setEquippedAvatar(avatar || null);
        setEquippedBadge(badge || null);
      }
      setProfile(p => ({
        ...p,
        username: user?.username || '',
        email: (user as any)?.email || '',
        sinif: (user as any)?.sinif || '12',
        alan: (user as any)?.alan || 'Sayısal',
        parent_code: (user as any)?.parent_code || '',
        created_at: (user as any)?.created_at || '',
        target_uni: targetData?.target_uni || targetData?.university || '',
        target_dept: targetData?.target_dept || targetData?.department || '',
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: profile.target_uni,
          department: profile.target_dept,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmPassword) return alert('Yeni şifreler eşleşmiyor!');
    if (newPassword.length < 6) return alert('Şifre en az 6 karakter olmalı!');

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (res.ok) {
        setSaved(true);
        setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        alert(data.error || 'Şifre değiştirme başarısız');
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const copyParentCode = () => {
    if (profile.parent_code) {
      navigator.clipboard.writeText(profile.parent_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="animate-spin" size={36} color="#6366f1" />
      </div>
    );
  }

  const LEAGUE_COLORS: Record<string, string> = {
    'Bronz': '#cd7f32', 'Gümüş': '#c0c0c0', 'Altın': '#ffd700',
    'Platin': '#e5e4e2', 'Elmas': '#b9f2ff', 'Şampiyon': '#ff6b6b',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '1.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', fontSize: '0.9rem', outline: 'none',
    transition: 'border 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem',
    color: '#64748b', fontSize: '0.8rem', fontWeight: 600,
  };

  const sectionBtnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.75rem 1rem', borderRadius: '10px', width: '100%',
    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
    color: active ? '#a5b4fc' : '#64748b',
    border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
    transition: 'all 0.2s', textAlign: 'left' as const,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          👤 Profilim
        </h2>
        <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Hesap bilgilerini düzenle, hedeflerini belirle, bildirim tercihlerini yönet.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>

        {/* ── Left Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

          {/* Avatar Card */}
          <div style={{
            ...cardStyle,
            background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)',
            border: '1px solid rgba(99,102,241,0.15)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: equippedAvatar ? `${equippedAvatar.color}25` : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: equippedAvatar ? '2.2rem' : '1.5rem',
              margin: '0 auto 0.75rem',
              boxShadow: equippedAvatar ? `0 0 25px ${equippedAvatar.color}55` : '0 0 20px rgba(99,102,241,0.35)',
              border: equippedAvatar ? `2.5px solid ${equippedAvatar.color}` : 'none',
              transition: 'all 0.3s ease'
            }}>
              {equippedAvatar ? equippedAvatar.emoji : (profile.username ? profile.username.substring(0, 2).toUpperCase() : 'KL')}
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {profile.username || 'Kullanıcı'}
            </h3>
            {equippedBadge && (
              <div style={{ marginTop: '0.4rem' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px',
                  background: `${equippedBadge.color}20`,
                  color: equippedBadge.color,
                  border: `1px solid ${equippedBadge.color}40`,
                }}>
                  <span>{equippedBadge.emoji}</span>
                  <span>{equippedBadge.name}</span>
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(16,185,129,0.12)', color: '#34d399',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>{profile.sinif}. Sınıf</span>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px',
                background: `${LEAGUE_COLORS[stats.league] || '#cd7f32'}18`,
                color: LEAGUE_COLORS[stats.league] || '#cd7f32',
                border: `1px solid ${LEAGUE_COLORS[stats.league] || '#cd7f32'}40`,
              }}>{stats.league} Lig</span>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem' }}>{stats.solved_questions}</div>
                <div style={{ color: '#475569', fontSize: '0.65rem' }}>Soru</div>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>%{stats.success_rate}</div>
                <div style={{ color: '#475569', fontSize: '0.65rem' }}>Başarı</div>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.1rem' }}>{stats.streak_days}</div>
                <div style={{ color: '#475569', fontSize: '0.65rem' }}>🔥 Seri</div>
              </div>
              <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ color: '#a855f7', fontWeight: 800, fontSize: '1.1rem' }}>{stats.xp}</div>
                <div style={{ color: '#475569', fontSize: '0.65rem' }}>XP</div>
              </div>
            </div>
          </div>

          {/* Section Buttons */}
          <button onClick={() => setActiveSection('profil')} style={sectionBtnStyle(activeSection === 'profil')}>
            <User size={16} /> Kişisel Bilgiler
          </button>
          <button onClick={() => setActiveSection('bildirim')} style={sectionBtnStyle(activeSection === 'bildirim')}>
            <Bell size={16} /> Bildirimler
          </button>
          <button onClick={() => setActiveSection('guvenlik')} style={sectionBtnStyle(activeSection === 'guvenlik')}>
            <Shield size={16} /> Güvenlik
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              ...sectionBtnStyle(false),
              color: '#f87171',
              marginTop: '0.5rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>

        {/* ── Right Content ── */}
        <div>
          <motion.div key={activeSection} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── Kişisel Bilgiler ─── */}
            {activeSection === 'profil' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#6366f1" /> Kişisel Bilgiler
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Kullanıcı Adı</label>
                      <input type="text" value={profile.username} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>E-posta</label>
                      <input type="email" value={profile.email || '-'} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sınıf</label>
                      <input type="text" value={profile.sinif === 'Mezun' ? 'Mezun' : `${profile.sinif}. Sınıf`} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Alan</label>
                      <input type="text" value={profile.alan || 'Belirtilmemiş'} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                    </div>
                  </div>
                </div>

                {/* Hedef */}
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GraduationCap size={18} color="#10b981" /> Hedef Üniversite & Bölüm
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Hedef Üniversite</label>
                      <input
                        type="text"
                        value={profile.target_uni}
                        onChange={e => setProfile(p => ({ ...p, target_uni: e.target.value }))}
                        placeholder="Örn: Boğaziçi Üniversitesi"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Hedef Bölüm</label>
                      <input
                        type="text"
                        value={profile.target_dept}
                        onChange={e => setProfile(p => ({ ...p, target_dept: e.target.value }))}
                        placeholder="Örn: Bilgisayar Mühendisliği"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Veli Bağlantı Kodu */}
                {profile.parent_code && (
                  <div style={{
                    ...cardStyle,
                    background: 'rgba(16,185,129,0.04)',
                    border: '1px solid rgba(16,185,129,0.15)',
                  }}>
                    <h3 style={{ color: '#10b981', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      👨‍👩‍👧 Veli Bağlantı Kodu
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      Bu kodu velinize verin. Bu kodla sisteme kayıt olmadan gelişiminizi takip edebilir.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        flex: 1, padding: '0.75rem 1rem', borderRadius: '10px',
                        background: 'rgba(0,0,0,0.3)', textAlign: 'center',
                        fontSize: '1.5rem', fontWeight: 800, letterSpacing: '4px', color: '#fff',
                      }}>
                        {profile.parent_code}
                      </div>
                      <button
                        onClick={copyParentCode}
                        style={{
                          padding: '0.75rem 1rem', borderRadius: '10px',
                          background: codeCopied ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          fontWeight: 600, fontSize: '0.85rem',
                        }}
                      >
                        {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                        {codeCopied ? 'Kopyalandı!' : 'Kopyala'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '12px',
                    background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                    opacity: saving ? 0.7 : 1,
                    transition: 'all 0.3s',
                    boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(99,102,241,0.3)',
                  }}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
                  {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            )}

            {/* ─── Bildirimler ─── */}
            {activeSection === 'bildirim' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} color="#f59e0b" /> Anlık Bildirimler
                  </h3>
                  <PushNotificationToggle />
                  <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                    Ödev atamaları, haftalık raporlar ve önemli güncellemeler için telefonunuza anlık bildirim gelir.
                  </p>
                </div>
              </div>
            )}

            {/* ─── Güvenlik ─── */}
            {activeSection === 'guvenlik' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={18} color="#f43f5e" /> Şifre Değiştir
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Mevcut Şifre</label>
                      <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Yeni Şifre</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="En az 6 karakter" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Yeni Şifre (Tekrar)</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Yeni şifrenizi tekrar girin" style={inputStyle} />
                    </div>
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !oldPassword || !newPassword}
                    style={{
                      marginTop: '1rem', padding: '0.7rem 1.5rem', borderRadius: '10px',
                      background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                      color: '#fb7185', fontWeight: 600, fontSize: '0.9rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      opacity: (!oldPassword || !newPassword) ? 0.5 : 1,
                    }}
                  >
                    <Key size={16} /> Şifreyi Güncelle
                  </button>
                </div>

                {/* Account Info */}
                <div style={cardStyle}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#38bdf8" /> Hesap Bilgileri
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hesap Türü</span>
                      <span style={{ color: '#e2e8f0' }}>{user?.role === 'ogretmen' ? 'Eğitmen' : 'Öğrenci'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Üyelik Tarihi</span>
                      <span style={{ color: '#e2e8f0' }}>
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
