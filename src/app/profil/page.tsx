"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, BookOpen, Star, Loader2, LogOut, Settings } from 'lucide-react';
import { BADGES } from '@/lib/badges';

export default function ProfilPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/dashboard')
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
        setLoading(false);
      })
      .catch(err => {
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Sol Panel: Kullanıcı Kartı */}
        <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: isTeacher ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem',
            border: `4px solid ${isTeacher ? '#38bdf8' : '#a855f7'}`,
            boxShadow: `0 0 20px ${isTeacher ? 'rgba(56,189,248,0.3)' : 'rgba(139,92,246,0.3)'}`
          }}>
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>{user.username}</h1>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.25rem 0.75rem', borderRadius: '1rem', 
            background: isTeacher ? 'rgba(56, 189, 248, 0.1)' : 'rgba(139, 92, 246, 0.1)',
            color: isTeacher ? '#38bdf8' : '#a855f7', fontSize: '0.875rem', fontWeight: 600,
            marginBottom: '2rem'
          }}>
            {isTeacher ? <Shield size={14} /> : <User size={14} />}
            {isTeacher ? 'Öğretmen Hesabı' : 'Öğrenci Hesabı'}
          </div>

          <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-interactive" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '0.75rem' }}>
              <Settings size={18} /> Hesap Ayarları
            </button>
            <button className="btn-interactive" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <LogOut size={18} /> Çıkış Yap
            </button>
          </div>
        </motion.div>

        {/* Sağ Panel: Detaylar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color={isTeacher ? "#38bdf8" : "#8b5cf6"} />
              Eğitim Bilgileri
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isTeacher ? 'Kurum / Okul' : 'Sınıf'}
                </label>
                <div style={{ fontSize: '1.125rem', color: '#fff', fontWeight: 600, marginTop: '0.25rem' }}>
                  {user.sinif} {isTeacher ? '' : '. Sınıf'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isTeacher ? 'Branş' : 'Alan'}
                </label>
                <div style={{ fontSize: '1.125rem', color: '#fff', fontWeight: 600, marginTop: '0.25rem' }}>
                  {user.alan}
                </div>
              </div>
            </div>
          </motion.div>

          {!isTeacher && (
            <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} color="#f59e0b" />
                Başarı Özeti
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lig</div>
                  <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{stats.league}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Çözülen Soru</div>
                  <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{stats.solved_questions}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Başarı Oranı</div>
                  <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>%{stats.success_rate}</div>
                </div>
              </div>

              {/* Veli Bağlantı Kodu Area */}
              <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', borderRadius: '12px', border: '1px dashed rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>👨👩👦 Veli Takip Kodu</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bu kodu ailenize vererek sizin gelişiminizi izlemelerini sağlayabilirsiniz.</p>
                </div>
                <div style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '2px', cursor: 'pointer' }} onClick={() => alert('Kod kopyalandı!')}>
                  YKS-{user.username.substring(0,2).toUpperCase()}8F
                </div>
              </div>

              {/* Kupa Odası (Başarı Rozetleri) */}
              <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={20} color="#f59e0b" />
                Kupa Odası (Rozetler)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {BADGES.map(badge => {
                  const isUnlocked = data.badges?.some((b: any) => b.badge_id === badge.id);

                  if (isUnlocked) {
                    return (
                      <div key={badge.id} style={{ background: badge.colorClass, padding: '1.5rem', borderRadius: '12px', border: `1px solid ${badge.borderColor}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                        <div style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>{badge.title}</div>
                        <div style={{ color: badge.textColor, fontSize: '0.75rem', marginTop: '0.25rem' }}>{badge.description}</div>
                      </div>
                    );
                  } else {
                    return (
                      <div key={badge.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5 }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', filter: 'grayscale(1)' }}>{badge.icon}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>{badge.title}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Kilitli</div>
                      </div>
                    );
                  }
                })}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
