"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, Palette, Shield, Save, Loader2, CheckCircle2, AlertCircle, CreditCard, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PushNotificationToggle } from '@/components/PWAComponents';

export default function AyarlarPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#38bdf8');
  
  // Bildirim states
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifDuel, setNotifDuel] = useState(true);
  const [notifForum, setNotifForum] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);

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
          // Extra settings can be handled by backend if supported
          notifications: { daily: notifDaily, duel: notifDuel, forum: notifForum, weekly: notifWeekly }
        })
      });
      showToast('Ayarlar başarıyla kaydedildi!');
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

          {activeTab === 'bildirim' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Bildirim Ayarları</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Real Push Notification Toggle Component */}
                <div style={{ marginBottom: '1rem' }}>
                  <PushNotificationToggle />
                </div>
                
                {[
                  { title: 'Günlük Hatırlatıcılar', desc: 'Pomodoro ve tekrar kartları için sabah bildirimi al.', state: notifDaily, setter: setNotifDaily },
                  { title: 'Düello İstekleri', desc: 'Birisi seni düelloya davet ettiğinde anında uyar.', state: notifDuel, setter: setNotifDuel },
                  { title: 'Forum Bahsetmeleri', desc: 'Forumda biri seni etiketlediğinde bildirim gönder.', state: notifForum, setter: setNotifForum },
                  { title: 'Haftalık Rapor', desc: 'Pazar akşamları haftalık performans özetini e-posta at.', state: notifWeekly, setter: setNotifWeekly }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h4 style={{ color: '#fff', marginBottom: '0.25rem', fontSize: '1rem' }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.desc}</p>
                    </div>
                    {/* Toggle */}
                    <div 
                      onClick={() => item.setter(!item.state)}
                      style={{ width: '48px', height: '24px', background: item.state ? accent : 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
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
