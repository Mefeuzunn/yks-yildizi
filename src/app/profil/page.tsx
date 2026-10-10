"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, BookOpen, Star, Loader2, LogOut, Settings, Target, Sparkles, Copy, Check, School, Calendar, Award } from 'lucide-react';
import { BADGES } from '@/lib/badges';
import { SHOP_ITEMS } from '@/lib/shop-items';
import { toast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

export default function ProfilPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [equippedAvatar, setEquippedAvatar] = useState<any>(null);
  const [equippedBadge, setEquippedBadge] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleJoinTeacher = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch('/api/student/join-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode.trim() })
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success('Başarıyla öğretmeninize bağlandınız!');
        setInviteCode('');
      } else {
        toast.error(resData.error || 'Bir hata oluştu');
      }
    } catch (e) {
      toast.error('Sunucu hatası oluştu');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/user/dashboard').then(res => res.json()),
      fetch('/api/shop/inventory').then(res => res.ok ? res.json() : null),
    ]).then(([json, invData]) => {
      if (!json.error) setData(json);
      if (invData && Array.isArray(invData.equipped)) {
        const avatar = SHOP_ITEMS.find(i => i.category === 'avatars' && invData.equipped.includes(i.id));
        const badge = SHOP_ITEMS.find(i => i.category === 'badges' && invData.equipped.includes(i.id));
        setEquippedAvatar(avatar || null);
        setEquippedBadge(badge || null);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="#8b5cf6" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        Kullanıcı bilgileri bulunamadı.
      </div>
    );
  }

  const { user, stats } = data;
  const isTeacher = user.role === 'ogretmen';
  const parentCode = user.parent_code || `YKS-${(user.username || 'ST').substring(0, 2).toUpperCase()}8F`;

  const copyParentCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(parentCode).catch(() => {});
    }
    setCopiedCode(true);
    toast.success('Veli takip kodu panoya kopyalandı!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div className="profil-main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem' }}>
        
        {/* Sol Panel: Kullanıcı Kartı & Hızlı Eylemler */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div 
            className="premium-card" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            style={{ textAlign: 'center', padding: '2.5rem 1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ 
              width: '110px', height: '110px', borderRadius: '50%', 
              background: equippedAvatar ? `${equippedAvatar.color}25` : (isTeacher ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: equippedAvatar ? '3.5rem' : '2.8rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem',
              border: equippedAvatar ? `4px solid ${equippedAvatar.color}` : `4px solid ${isTeacher ? '#38bdf8' : '#8b5cf6'}`,
              boxShadow: equippedAvatar ? `0 0 25px ${equippedAvatar.color}55` : `0 0 20px ${isTeacher ? 'rgba(56,189,248,0.3)' : 'rgba(99,102,241,0.3)'}`,
              transition: 'all 0.3s ease'
            }}>
              {equippedAvatar ? equippedAvatar.emoji : (user.username ? user.username.substring(0, 2).toUpperCase() : 'YK')}
            </div>
            
            <h1 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '0.35rem', fontWeight: 700 }}>{user.username}</h1>
            
            {user.email && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                {user.email}
              </p>
            )}

            {equippedBadge && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  fontSize: '0.8rem', fontWeight: 700, padding: '3px 12px', borderRadius: '12px',
                  background: `${equippedBadge.color}20`,
                  color: equippedBadge.color,
                  border: `1px solid ${equippedBadge.color}40`,
                }}>
                  <span>{equippedBadge.emoji}</span>
                  <span>{equippedBadge.name}</span>
                </span>
              </div>
            )}

            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.3rem 0.85rem', borderRadius: '1rem', 
              background: isTeacher ? 'rgba(56, 189, 248, 0.12)' : 'rgba(139, 92, 246, 0.12)',
              color: isTeacher ? '#38bdf8' : '#a855f7', fontSize: '0.825rem', fontWeight: 600,
              marginBottom: '1.75rem',
              border: `1px solid ${isTeacher ? 'rgba(56, 189, 248, 0.25)' : 'rgba(139, 92, 246, 0.25)'}`
            }}>
              {isTeacher ? <Shield size={14} /> : <User size={14} />}
              {isTeacher ? 'Öğretmen Hesabı' : 'Öğrenci Hesabı'}
            </div>

            {user.created_at && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <Calendar size={13} />
                <span>Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}

            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={() => router.push('/ayarlar')}
                className="btn-interactive" 
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Settings size={18} color="#a855f7" /> Hesap Ayarları
              </button>
              
              <button 
                onClick={() => router.push('/magaza')}
                className="btn-interactive" 
                style={{ width: '100%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.25)' }}
              >
                <Sparkles size={18} /> Gardırop & Mağaza
              </button>

              <button 
                onClick={logout}
                className="btn-interactive" 
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <LogOut size={18} /> Çıkış Yap
              </button>
            </div>
          </motion.div>
          
          {!isTeacher && (
            <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                👨‍🏫 Öğretmene Bağlan
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1rem', lineHeight: 1.4 }}>
                Öğretmeninizin paylaştığı 6 haneli davet kodunu girerek sınıfına katılın ve ödevlerinizi takip edin.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="KOD: ABCDEF"
                  maxLength={6}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '10px', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.1em', outline: 'none' }}
                />
                <button 
                  onClick={handleJoinTeacher}
                  disabled={joining || !inviteCode}
                  className="btn-interactive"
                  style={{ background: 'var(--brand-primary)', border: 'none', color: '#fff', padding: '0 1.25rem', borderRadius: '10px', fontWeight: 600, opacity: (!inviteCode || joining) ? 0.5 : 1, cursor: 'pointer' }}
                >
                  {joining ? '...' : 'Katıl'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sağ Panel: Hedef, Eğitim ve Başarı Özeti */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 🎯 Hedef Üniversite & Bölüm Kartı */}
          {!isTeacher && (
            <motion.div 
              className="premium-card" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={22} color="#fff" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 700 }}>YKS Hedefim</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Hayalindeki üniversite ve bölüm yolculuğu</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/ayarlar')}
                  style={{ padding: '0.45rem 0.9rem', background: 'rgba(255,255,255,0.08)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Settings size={14} /> Hedefi Güncelle
                </button>
              </div>

              {user.target_university || user.target_department ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hedef Üniversite</label>
                    <div style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.3rem' }}>
                      {user.target_university || 'Belirtilmedi'}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hedef Bölüm</label>
                    <div style={{ fontSize: '1.1rem', color: '#a855f7', fontWeight: 700, marginTop: '0.3rem' }}>
                      {user.target_department || 'Belirtilmedi'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed rgba(56, 189, 248, 0.3)', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Henüz hedef üniversite ve bölüm belirlemediniz. Hedefinizi belirleyerek net hedeflerinizi anında hesaplayın!
                  </p>
                  <button 
                    onClick={() => router.push('/ayarlar')}
                    style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    🎯 Hedef Belirle
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Eğitim Bilgileri Kartı */}
          <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color={isTeacher ? "#38bdf8" : "#8b5cf6"} />
                Eğitim ve Alan Bilgileri
              </h2>
              <button 
                onClick={() => router.push('/ayarlar')}
                style={{ padding: '0.35rem 0.75rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Düzenle
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isTeacher ? 'Kurum / Okul' : 'Sınıf Seviyesi'}
                </label>
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600, marginTop: '0.3rem' }}>
                  {user.sinif ? (user.sinif === 'Mezun' ? 'Mezun' : `${user.sinif}. Sınıf`) : 'Belirtilmedi'}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isTeacher ? 'Branş' : 'Sınav Alanı'}
                </label>
                <div style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 600, marginTop: '0.3rem' }}>
                  {user.alan || (isTeacher ? user.brans : 'Belirtilmedi')}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Müfredat Rejimi
                </label>
                <div style={{ fontSize: '0.95rem', color: user.sinif === '9' || user.sinif === '10' || user.sinif === '11' ? '#10b981' : '#f59e0b', fontWeight: 600, marginTop: '0.3rem' }}>
                  {user.sinif === '9' || user.sinif === '10' || user.sinif === '11' ? '🌱 Maarif Modeli' : '📚 Klasik YKS'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Başarı Özeti */}
          {!isTeacher && (
            <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} color="#f59e0b" />
                Başarı & Performans Özeti
              </h2>
              
              <div className="profil-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mevcut Lig</div>
                  <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 700, marginTop: '0.2rem' }}>{stats.league || 'Bronz'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Çözülen Soru</div>
                  <div style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.2rem' }}>{stats.solved_questions || 0}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Başarı Oranı</div>
                  <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 700, marginTop: '0.2rem' }}>%{stats.success_rate || 0}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lig Puanı</div>
                  <div style={{ fontSize: '1.25rem', color: '#a855f7', fontWeight: 700, marginTop: '0.2rem' }}>{stats.league_points || 0}</div>
                </div>
              </div>

              {/* Veli Takip Kodu */}
              <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.04))', borderRadius: '12px', border: '1px dashed rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', color: '#fff', margin: '0 0 0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    👨‍👩‍👧 Veli Takip Kodu
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '420px', lineHeight: 1.4 }}>
                    Bu kodu velinize vererek deneme netlerinizi ve çalışma istatistiklerinizi canlı olarak takip etmesini sağlayabilirsiniz.
                  </p>
                </div>
                <button 
                  onClick={copyParentCode}
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: copiedCode ? '#059669' : '#10b981',
                    color: '#fff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '2px',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  title="Panoya Kopyalamak İçin Tıklayın"
                >
                  {copiedCode ? <Check size={18} /> : <Copy size={16} />}
                  <span>{parentCode}</span>
                </button>
              </div>

              {/* Kupa Odası (Başarı Rozetleri) */}
              <h2 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="#f59e0b" />
                Kupa Odası (Kazanılan Rozetler)
              </h2>
              <div className="profil-badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {BADGES.map(badge => {
                  const isUnlocked = data.badges?.some((b: any) => b.badge_id === badge.id);

                  if (isUnlocked) {
                    return (
                      <div key={badge.id} style={{ background: badge.colorClass, padding: '1.25rem 0.75rem', borderRadius: '12px', border: `1px solid ${badge.borderColor}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>{badge.icon}</div>
                        <div style={{ color: '#fff', fontSize: '0.825rem', fontWeight: 600 }}>{badge.title}</div>
                        <div style={{ color: badge.textColor, fontSize: '0.7rem', marginTop: '0.2rem' }}>{badge.description}</div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={badge.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem 0.75rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)', textAlign: 'center', opacity: 0.45 }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.35rem', filter: 'grayscale(1)' }}>{badge.icon}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 600 }}>{badge.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.2rem' }}>Kilitli</div>
                      </div>
                    );
                  }
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .profil-main-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .profil-stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem !important;
          }
          .profil-badges-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
