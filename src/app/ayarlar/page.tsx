"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, Palette, Shield, Save, Loader2, CheckCircle2, AlertCircle, CreditCard, Trash2, Smartphone, ExternalLink, Trophy, Flame, Moon, Clock, Zap, Battery, BatteryCharging, Cpu, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PushNotificationToggle } from '@/components/PWAComponents';
import { usePowerState, toggleBatterySaver } from '@/components/BatteryOptimizer';

export default function AyarlarPage() {
  const { user } = useAuth();
  const powerState = usePowerState();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('profil');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#38bdf8');
  
  // Bildirim states
  const [notifFocus, setNotifFocus] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifHomework, setNotifHomework] = useState(true);
  const [notifDuel, setNotifDuel] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('23:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [frequencyLimit, setFrequencyLimit] = useState<'smart' | 'minimal' | 'all'>('smart');
  const [isTestingPush, setIsTestingPush] = useState(false);

  // Güvenlik states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Hesap Silme state
  const [confirmDelete, setConfirmDelete] = useState(false);

  const avatars = ['Felix', 'Aneka', 'Bandit', 'Jasper', 'Max'];

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setTheme(data.theme || 'dark');
          setAccent(data.accent_color || '#38bdf8');
          setAvatarSeed(data.avatar_seed || 'Felix');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/notifications/settings')
      .then(res => res.json())
      .then(d => {
        if (d?.settings) {
          const s = d.settings;
          setNotifFocus(s.notif_focus ?? true);
          setNotifDaily(s.notif_daily_reminder ?? true);
          setNotifStreak(s.notif_streak_warning ?? true);
          setNotifHomework(s.notif_homework ?? true);
          setNotifDuel(s.notif_duel ?? true);
          setNotifSound(s.notif_sound ?? true);
          setQuietHoursEnabled(s.quiet_hours_enabled ?? true);
          setQuietHoursStart(s.quiet_hours_start || '23:00');
          setQuietHoursEnd(s.quiet_hours_end || '08:00');
          setFrequencyLimit(s.frequency_limit || 'smart');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        setBatteryLevel(Math.round(b.level * 100));
        setIsCharging(b.charging);
        b.addEventListener('levelchange', () => setBatteryLevel(Math.round(b.level * 100)));
        b.addEventListener('chargingchange', () => setIsCharging(b.charging));
      }).catch(() => {});
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme, 
          accent_color: accent, 
          avatar_seed: avatarSeed,
        })
      });

      await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notif_focus: notifFocus,
          notif_daily_reminder: notifDaily,
          notif_streak_warning: notifStreak,
          notif_homework: notifHomework,
          notif_duel: notifDuel,
          notif_sound: notifSound,
          quiet_hours_enabled: quietHoursEnabled,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
          frequency_limit: frequencyLimit,
          max_daily_notifs: frequencyLimit === 'minimal' ? 1 : 2,
        })
      });

      showToast('Ayarlar ve bildirim tercihleri başarıyla kaydedildi!');
    } catch (err) {
      console.error(err);
      showToast('Ayarlar kaydedilirken bir hata oluştu.', 'error');
    }
    setSaving(false);
  };

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    // API call to delete account goes here
    showToast('Hesap silme talebi alındı. (Sadece arayüz)', 'success');
    setConfirmDelete(false);
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:'5rem'}}><Loader2 className="animate-spin" size={48} color="#38bdf8"/></div>;

  return (
    <div className="ayarlar-page-wrap" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', position: 'relative' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: 'calc(76px + env(safe-area-inset-bottom))',
              right: '1.5rem',
              maxWidth: 'calc(100vw - 3rem)',
              background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              zIndex: 1000,
              backdropFilter: 'blur(10px)'
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontWeight: 500 }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div style={{ flex: '1 1 250px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="#a855f7" /> Ayarlar
        </h1>
        
        {[
          { id: 'profil', icon: User, label: 'Profil & Avatar' },
          { id: 'hesap', icon: CreditCard, label: 'Hesap' },
          { id: 'tema', icon: Palette, label: 'Görünüm (Tema)' },
          { id: 'performans', icon: Zap, label: 'Pil & Performans' },
          { id: 'bildirim', icon: Bell, label: 'Bildirimler' },
          { id: 'guvenlik', icon: Shield, label: 'Güvenlik' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
              borderRadius: '12px', 
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent', 
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)', 
              border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, 
              transition: 'all 0.2s' 
            }}
          >
            <tab.icon size={20} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1 }}>
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card"
          style={{ padding: '3rem' }}
        >
          {activeTab === 'profil' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Profil & Avatar</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', border: `2px solid ${accent}` }} />
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Hazır Avatarlar</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {avatars.map(seed => (
                      <button 
                        key={seed}
                        onClick={() => setAvatarSeed(seed)}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', overflow: 'hidden' }}
                      >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} style={{ width: '100%', height: '100%' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Kullanıcı Adı</label>
                  <input type="text" className="premium-input" defaultValue={user?.username || ''} disabled />
                </div>
                
                {user?.role === 'ogrenci' && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        👨‍👩‍👧 Veli Bağlantı Kodu
                      </label>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(user?.parent_code || '');
                          showToast('Bağlantı kodu kopyalandı!');
                        }}
                        style={{ padding: '0.25rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Kopyala
                      </button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Bu kodu veliniz ile paylaşın. Veliniz sisteme kayıt olmadan, sadece bu kod ile netlerinizi ve gelişiminizi takip edebilir.
                    </p>
                    <div style={{ fontSize: '1.5rem', letterSpacing: '4px', fontWeight: 800, color: '#fff', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px' }}>
                      {user?.parent_code || 'YÜKLENİYOR...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'hesap' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Hesap Bilgileri</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Kullanıcı Adı</label>
                    <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 500 }}>{user?.username || 'Bilinmiyor'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rol</label>
                    <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 500, textTransform: 'capitalize' }}>
                      {user?.role === 'ogrenci' ? 'Öğrenci' : user?.role === 'veli' ? 'Veli' : user?.role || 'Bilinmiyor'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Hesap Oluşturulma Tarihi</label>
                  <div style={{ color: '#fff', fontSize: '1.125rem', fontWeight: 500 }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Bilinmiyor'}
                  </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <h3 style={{ color: '#ef4444', fontSize: '1.125rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> Tehlikeli Bölge
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak yok edilir. Bu işlem geri alınamaz.
                  </p>
                  
                  {confirmDelete ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '0.75rem', background: '#ef4444', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Trash2 size={18} /> Evet, Hesabımı Sil
                      </button>
                      <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                        İptal Et
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleDeleteAccount} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.5)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trash2 size={18} /> Hesabı Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tema' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Görünüm ve Tema</h2>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Ana Tema</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setTheme('dark')} style={{ flex: 1, padding: '1.5rem', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'transparent', border: theme === 'dark' ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>
                    Karanlık Uzay (Varsayılan)
                  </button>
                  <button onClick={() => setTheme('light')} style={{ flex: 1, padding: '1.5rem', background: theme === 'light' ? 'rgba(255,255,255,0.05)' : 'transparent', border: theme === 'light' ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}>
                    Aydınlık Odak
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Vurgu Rengi</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setAccent(c)}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', background: c, border: accent === c ? '4px solid #fff' : '4px solid transparent', cursor: 'pointer', boxShadow: accent === c ? `0 0 15px ${c}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performans' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Zap size={24} color="#f59e0b" /> Pil, Güç & Performans Motoru
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 6, lineHeight: 1.5 }}>
                  Mobil ve web deneyiminizde cihazınızın aşırı ısınmasını ve pilinin tükenmesini önleyen akıllı donanım kalkanı.
                </p>
              </div>

              {/* Canlı Pil & Donanım Durumu */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Cihaz Bataryası</span>
                    {isCharging ? <BatteryCharging size={18} color="#10b981" /> : <Battery size={18} color={powerState.eco ? '#f59e0b' : '#38bdf8'} />}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                    {batteryLevel !== null ? `%${batteryLevel}` : 'Optimizasyon Aktif'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isCharging ? '#34d399' : 'var(--text-muted)', marginTop: 4 }}>
                    {isCharging ? '⚡ Şarj Cihazına Bağlı' : (batteryLevel !== null ? '🔋 Batarya Gücüyle Çalışıyor' : 'Akıllı Güç Denetleyicisi Devrede')}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Güç Profili</span>
                    <Cpu size={18} color={powerState.eco ? '#10b981' : '#a855f7'} />
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: powerState.eco ? '#10b981' : '#fff' }}>
                    {powerState.eco ? 'Eko Mod (Tasarruf)' : 'Dinamik Standart'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: powerState.eco ? '#6ee7b7' : 'var(--text-muted)', marginTop: 4 }}>
                    {powerState.eco ? '✓ GPU & Arka Plan Koruması Aktif' : 'Standart Efektler Devrede'}
                  </div>
                </div>
              </div>

              {/* Ana Eko Mod Anahtarı */}
              <div style={{ padding: '1.5rem', background: powerState.eco ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)', borderRadius: '16px', border: powerState.eco ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Pil Tasarruf Modunu (Eco Mode) Aç</span>
                    {powerState.eco && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700 }}>
                        AKTİF
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.45 }}>
                    Gereksiz GPU gölgelerini kapatır, 3D simülasyonları 1x DPR pil moduna alır ve arka plan işlem yükünü sıfıra indirir. Pil seviyesi %20 altına düştüğünde de otomatik devreye girer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newState = toggleBatterySaver();
                    showToast(newState ? 'Pil Tasarruf Modu (Eco) Aktifleştirildi' : 'Standart Performans Moduna Geçildi');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: powerState.eco ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: powerState.eco ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    transition: 'all 0.2s',
                    boxShadow: powerState.eco ? '0 4px 14px rgba(16,185,129,0.3)' : 'none'
                  }}
                >
                  <Zap size={18} fill={powerState.eco ? '#fff' : 'none'} />
                  {powerState.eco ? 'Eko Modu Kapat' : 'Eko Modu Aç'}
                </button>
              </div>

              {/* Akıllı Optimizasyon Detayları */}
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Mevcut Pil Tasarruf Korumaları</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    icon: '🧊',
                    title: 'Akıllı Arka Plan Dondurucu (Background Guardian)',
                    desc: 'Uygulama arka plana atıldığında veya ekran kilitlendiğinde tüm CSS animasyonları, Three.js 3D döngüleri ve zamanlayıcılar anında dondurularak 0 CPU tüketimi sağlanır.'
                  },
                  {
                    icon: '🚀',
                    title: 'Mobil GPU & Backdrop-Blur Kısıtlayıcı',
                    desc: 'Mobil tarayıcılarda telefonun ısınmasına yol açan ağır çok katmanlı bulanıklık efektleri (backdrop-filter) hafifletilerek grafik işlemcinin yükü hafifletilir.'
                  },
                  {
                    icon: '🌌',
                    title: '3D Galaksi & Simülasyon Ölçekleme',
                    desc: 'Beceri Galaksisi ve PhET simülasyonlarında 5,000 partikül yerine hafifletilmiş 1,600 partiküllü sahne kullanılır ve ekran yenileme sıklığı optimize edilir.'
                  },
                  {
                    icon: '📴',
                    title: 'Ağ Telsizi & Heartbeat Uyku Modu',
                    desc: 'Ders sayacı duraklatıldığında veya oturum bittiğinde sunucuya yapılan tüm periyodik kalp atışları kesilir; mobil Wi-Fi/Hücresel çipinin uyku moduna geçmesine izin verilir.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bildirim' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: 0 }}>Bildirim & Hatırlatıcı Motoru</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                    Odaklanma, ders programı, ödev teslimleri ve yangın serisi hatırlatıcılarını özelleştirin.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    setIsTestingPush(true);
                    try {
                      const res = await fetch('/api/notifications/test', { method: 'POST' });
                      const d = await res.json();
                      showToast(d.message || 'Test bildirimi iletildi!');
                    } catch (e) {
                      showToast('Test bildirimi gönderilemedi.', 'error');
                    } finally {
                      setIsTestingPush(false);
                    }
                  }}
                  disabled={isTestingPush}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.2))',
                    border: '1px solid rgba(139,92,246,0.45)',
                    color: '#c4b5fd',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Bell size={14} />
                  {isTestingPush ? 'Gönderiliyor...' : 'Cihazıma Test Bildirimi Gönder'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Real Push Notification Toggle Component */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <PushNotificationToggle />
                </div>

                {/* ─── 🌙 Sessiz Saatler (Rahatsız Etme) ─── */}
                <div style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))', borderRadius: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: quietHoursEnabled ? '12px' : 0 }}>
                    <div style={{ paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Moon size={18} color="#38bdf8" />
                        <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                          Sessiz Saatler (Gece Rahatsız Etme)
                        </h4>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        Belirlediğin saat aralığında push bildirimler engellenir, uykun ve dinlenmen bölünmez.
                      </p>
                    </div>

                    {/* Toggle */}
                    <div 
                      onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                      style={{ width: '48px', height: '24px', background: quietHoursEnabled ? accent : 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}
                    >
                      <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: quietHoursEnabled ? '26px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>

                  {quietHoursEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Başlangıç:</span>
                        <input
                          type="time"
                          value={quietHoursStart}
                          onChange={(e) => setQuietHoursStart(e.target.value)}
                          style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            padding: '4px 8px',
                            fontSize: '13px',
                          }}
                        />
                      </div>
                      <span style={{ color: '#64748b' }}>➔</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Bitiş:</span>
                        <input
                          type="time"
                          value={quietHoursEnd}
                          onChange={(e) => setQuietHoursEnd(e.target.value)}
                          style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            padding: '4px 8px',
                            fontSize: '13px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: '#38bdf8', fontStyle: 'italic' }}>
                        (Varsayılan: 23:00 – 08:00)
                      </span>
                    </div>
                  )}
                </div>

                {/* ─── 🛡️ Akıllı Spam Önleme & Gönderim Sıklığı ─── */}
                <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={18} color="#a855f7" />
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                        Akıllı Bildirim Kotası (Spam Koruma)
                      </h4>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      Otomatik motivasyon ve hatırlatıcıların sıklığını sınırlandırın.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'smart', label: '🌟 Akıllı & Ölçülü', desc: 'Günde en fazla 2 bildirim (Önerilen)' },
                      { id: 'minimal', label: '🔕 Minimal', desc: 'Günde en fazla 1 bildirim (Kritik olanlar)' },
                      { id: 'all', label: '⚡ Tüm Bildirimler', desc: 'Kota sınırı olmadan ilet' },
                    ].map((opt) => {
                      const isSelected = frequencyLimit === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setFrequencyLimit(opt.id as any)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                            border: isSelected ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#c084fc' : '#f8fafc' }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>
                            {opt.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── Kategori Bazlı Tercihler ─── */}
                {[
                  { title: '🍅 Odak & Pomodoro Bildirimleri', desc: 'Oturum tamamlandığında ve mola bittiğinde sesli ve titreşimli uyar.', state: notifFocus, setter: setNotifFocus },
                  { title: '☀️ Sabah Çalışma & Ders Hatırlatıcısı', desc: 'Her sabah 08:30\'da günlük ders hedeflerini ve programını anımsat.', state: notifDaily, setter: setNotifDaily },
                  { title: '🔥 Yangın Serisi (Streak) Koruyucu', desc: 'Akşam 20:30\'da serin tehlikedeyse uyar, günün yanmasını engelle.', state: notifStreak, setter: setNotifStreak },
                  { title: '📋 Ödev & Teslim Hatırlatıcıları', desc: 'Yeni ödev atandığında ve son 24 saat kaldığında doğrudan uyar.', state: notifHomework, setter: setNotifHomework },
                  { title: '⚔️ Düello & Arena Davetleri', desc: 'Birisi seni Bilgi Arenası\'nda düelloya davet ettiğinde anında bildir.', state: notifDuel, setter: setNotifDuel },
                  { title: '🔊 Ses Efektleri & Çan Sesleri', desc: 'Oturum bitişlerinde kristal netliğinde sentetik melodi çal.', state: notifSound, setter: setNotifSound },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingRight: '1rem' }}>
                      <h4 style={{ color: '#fff', marginBottom: '0.25rem', fontSize: '0.95rem', fontWeight: 600 }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                    </div>
                    {/* Toggle */}
                    <div 
                      onClick={() => item.setter(!item.state)}
                      style={{ width: '48px', height: '24px', background: item.state ? accent : 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}
                    >
                      <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: item.state ? '26px' : '2px', transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'guvenlik' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Güvenlik & Şifre</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mevcut Şifre</label>
                  <input 
                    type="password" 
                    className="premium-input" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Yeni Şifre</label>
                  <input 
                    type="password" 
                    className="premium-input" 
                    placeholder="Yeni şifrenizi girin" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} disabled={saving} className="btn-interactive" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none' }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>

        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .ayarlar-page-wrap { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; padding: 1rem 0.75rem calc(85px + env(safe-area-inset-bottom, 20px)) !important; }
          .ayarlar-header { flex-direction: column !important; align-items: flex-start !important; }
          .ayarlar-grid { grid-template-columns: 1fr !important; }
          .ayarlar-page-wrap input,
          .ayarlar-page-wrap select,
          .ayarlar-page-wrap textarea { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}
