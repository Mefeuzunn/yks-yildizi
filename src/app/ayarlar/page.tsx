"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Palette, Shield, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AyarlarPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#38bdf8');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const avatars = ['Felix', 'Aneka', 'Bandit', 'Jasper', 'Max'];

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setTheme(data.theme);
          setAccent(data.accent_color);
          setAvatarSeed(data.avatar_seed);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, accent_color: accent, avatar_seed: avatarSeed })
      });
      alert('Ayarlar kaydedildi!');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:'5rem'}}><Loader2 className="animate-spin" size={48} color="#38bdf8"/></div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      
      {/* Sidebar */}
      <div style={{ flex: '1 1 250px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} color="#a855f7" /> Ayarlar
        </h1>
        
        <button 
          onClick={() => setActiveTab('profil')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'profil' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeTab === 'profil' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, transition: 'all 0.2s' }}
        >
          <User size={20} /> Profil & Avatar
        </button>

        <button 
          onClick={() => setActiveTab('tema')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'tema' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeTab === 'tema' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, transition: 'all 0.2s' }}
        >
          <Palette size={20} /> Görünüm (Tema)
        </button>

        <button 
          onClick={() => setActiveTab('bildirim')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'bildirim' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeTab === 'bildirim' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, transition: 'all 0.2s' }}
        >
          <Bell size={20} /> Bildirimler
        </button>

        <button 
          onClick={() => setActiveTab('guvenlik')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'guvenlik' ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: activeTab === 'guvenlik' ? '#fff' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600, transition: 'all 0.2s' }}
        >
          <Shield size={20} /> Güvenlik
        </button>
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
                          alert('Bağlantı kodu kopyalandı!');
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
              
              <button onClick={handleSave} disabled={saving} className="btn-interactive" style={{ marginTop: '2rem', background: accent, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
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

              <button onClick={handleSave} disabled={saving} className="btn-interactive" style={{ marginTop: '3rem', background: accent, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          )}

          {activeTab === 'bildirim' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Bildirim Ayarları</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { title: 'Günlük Hatırlatıcılar', desc: 'Pomodoro ve tekrar kartları için sabah bildirimi al.' },
                  { title: 'Düello İstekleri', desc: 'Birisi seni düelloya davet ettiğinde anında uyar.' },
                  { title: 'Forum Bahsetmeleri', desc: 'Forumda biri seni etiketlediğinde bildirim gönder.' },
                  { title: 'Haftalık Rapor', desc: 'Pazar akşamları haftalık performans özetini e-posta at.' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <h4 style={{ color: '#fff', marginBottom: '0.25rem', fontSize: '1rem' }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.desc}</p>
                    </div>
                    {/* Toggle */}
                    <div style={{ width: '48px', height: '24px', background: i === 3 ? 'rgba(255,255,255,0.1)' : accent, borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                      <div style={{ width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: i === 3 ? '2px' : '26px', transition: 'left 0.2s' }} />
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
                  <input type="password" className="premium-input" placeholder="••••••••" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Yeni Şifre</label>
                  <input type="password" className="premium-input" placeholder="Yeni şifrenizi girin" />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-interactive" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}>
              <Save size={18} /> Değişiklikleri Kaydet
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
