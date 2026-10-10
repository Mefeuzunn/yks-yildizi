"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Bell, Palette, Shield, Save, Loader2, CheckCircle2, 
  AlertCircle, CreditCard, Trash2, Smartphone, ExternalLink, Trophy, 
  Flame, Moon, Clock, Zap, Battery, BatteryCharging, Cpu, Sparkles,
  Target, School, Lock, Eye, EyeOff, Copy, Check, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PushNotificationToggle } from '@/components/PWAComponents';
import { usePowerState, toggleBatterySaver } from '@/components/BatteryOptimizer';
import Link from 'next/link';

export default function AyarlarPage() {
  const { user: authUser, logout } = useAuth();
  const powerState = usePowerState();
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('profil');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#38bdf8');
  
  // Profil & Akademik States
  const [alan, setAlan] = useState('Sayisal');
  const [sinif, setSinif] = useState('12');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [brans, setBrans] = useState('');
  const [kurum, setKurum] = useState('');
  const [parentCode, setParentCode] = useState('');
  const [copiedParentCode, setCopiedParentCode] = useState(false);

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  // Hesap Silme state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const avatars = ['Felix', 'Aneka', 'Bandit', 'Jasper', 'Max'];

  const TOP_UNIVERSITIES = [
    'Boğaziçi Üniversitesi',
    'Orta Doğu Teknik Üniversitesi (ODTÜ)',
    'İstanbul Teknik Üniversitesi (İTÜ)',
    'Hacettepe Üniversitesi',
    'Koç Üniversitesi',
    'Sabancı Üniversitesi',
    'Bilkent Üniversitesi',
    'İstanbul Üniversitesi',
    'Ankara Üniversitesi',
    'Ege Üniversitesi',
    'Yıldız Teknik Üniversitesi',
    'Gazi Üniversitesi',
    'Dokuz Eylül Üniversitesi',
    'Marmara Üniversitesi',
    'Cerrahpaşa Tıp Fakültesi'
  ];

  const TOP_DEPARTMENTS = [
    'Bilgisayar Mühendisliği',
    'Tıp Fakültesi',
    'Hukuk Fakültesi',
    'Elektrik-Elektronik Mühendisliği',
    'Diş Hekimliği',
    'Endüstri Mühendisliği',
    'İktisat / Ekonomi',
    'İşletme',
    'Psikoloji',
    'Mimarlık',
    'Yazılım Mühendisliği',
    'Eczacılık',
    'Moleküler Biyoloji ve Genetik',
    'İngilizce Öğretmenliği',
    'Havacılık ve Uzay Mühendisliği'
  ];

  useEffect(() => {
    // 1. Profil ve genel ayarları yükle
    Promise.all([
      fetch('/api/user/profile').then(r => r.json()),
      fetch('/api/user/settings').then(r => r.json()),
      fetch('/api/notifications/settings').then(r => r.json())
    ]).then(([profileRes, settingsRes, notifRes]) => {
      if (profileRes?.user) {
        const u = profileRes.user;
        setAlan(u.alan || 'Sayisal');
        setSinif(u.sinif || '12');
        setTargetUniversity(u.target_university || '');
        setTargetDepartment(u.target_department || '');
        setEmail(u.email || '');
        setBrans(u.brans || '');
        setKurum(u.kurum || '');
        setParentCode(u.parent_code || '');
      }

      if (settingsRes && !settingsRes.error) {
        const currentTheme = settingsRes.theme || 'dark';
        const currentAccent = settingsRes.accent_color || '#38bdf8';
        setTheme(currentTheme);
        setAccent(currentAccent);
        setAvatarSeed(settingsRes.avatar_seed || 'Felix');

        // Canlı CSS uygulaması
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', currentTheme);
          document.documentElement.style.setProperty('--brand-primary', currentAccent);
          document.documentElement.style.setProperty('--brand-accent', currentAccent);
        }
      }

      if (notifRes?.settings) {
        const s = notifRes.settings;
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

      setLoading(false);
    }).catch(err => {
      console.error('Ayarlar yükleme hatası:', err);
      setLoading(false);
    });
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

  // Canlı tema ve renk önizleme
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const handleAccentChange = (newAccent: string) => {
    setAccent(newAccent);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--brand-primary', newAccent);
      document.documentElement.style.setProperty('--brand-accent', newAccent);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Ayarları Kaydet
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme, 
          accent_color: accent, 
          avatar_seed: avatarSeed,
        })
      });

      // 2. Profil & Hedefleri Kaydet
      const profileRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alan,
          sinif,
          target_university: targetUniversity,
          target_department: targetDepartment,
          email,
          brans,
          kurum
        })
      });

      // 3. Bildirim Tercihlerini Kaydet
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

      if (profileRes.ok) {
        showToast('Tüm profil, hedef ve sistem ayarlarınız başarıyla kaydedildi!');
      } else {
        showToast('Ayarlar kaydedildi ancak profil güncellenirken uyarı oluştu.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Ayarlar kaydedilirken bir hata oluştu.', 'error');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Lütfen mevcut şifrenizi ve yeni şifrenizi girin.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Yeni şifre en az 6 karakter olmalıdır.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Yeni şifre ile şifre tekrarı uyuşmuyor.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Şifreniz başarıyla güncellendi!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Şifre güncellenemedi.', 'error');
      }
    } catch (e) {
      showToast('Sunucu bağlantı hatası oluştu.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Hesabınız silindi. Yönlendiriliyorsunuz...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        showToast(data.error || 'Hesap silinirken hata oluştu.', 'error');
        setDeletingAccount(false);
      }
    } catch (e) {
      showToast('Hesap silme işlemi başarısız oldu.', 'error');
      setDeletingAccount(false);
    }
  };

  const copyParentCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(parentCode).catch(() => {});
    }
    setCopiedParentCode(true);
    showToast('Veli bağlantı kodu panoya kopyalandı!');
    setTimeout(() => setCopiedParentCode(false), 2500);
  };

  if (loading) return <div style={{display:'flex',justifyContent:'center',marginTop:'5rem'}}><Loader2 className="animate-spin" size={48} color="#38bdf8"/></div>;

  const isMaarif = sinif === '9' || sinif === '10' || sinif === '11';

  return (
    <div className="ayarlar-page-wrap" style={{ maxWidth: '1040px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', position: 'relative' }}>
      
      {/* Toast Bildirimi */}
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
              background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
              color: '#fff',
              padding: '0.9rem 1.4rem',
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
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sol Sidebar Menü */}
      <div style={{ flex: '1 1 240px', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <Settings size={22} color="#a855f7" /> Ayarlar & Profil
        </h1>
        
        {[
          { id: 'profil', icon: User, label: 'Profil & Hedefler' },
          { id: 'tema', icon: Palette, label: 'Görünüm & Tema' },
          { id: 'performans', icon: Zap, label: 'Pil & Performans' },
          { id: 'bildirim', icon: Bell, label: 'Bildirimler' },
          { id: 'guvenlik', icon: Shield, label: 'Güvenlik & Şifre' },
          { id: 'hesap', icon: CreditCard, label: 'Hesap & Gizlilik' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', 
              borderRadius: '12px', 
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.2)' : 'transparent', 
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)', 
              border: activeTab === tab.id ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid transparent', 
              cursor: 'pointer', textAlign: 'left', fontWeight: 600, 
              transition: 'all 0.2s',
              fontSize: '0.925rem'
            }}
          >
            <tab.icon size={19} color={activeTab === tab.id ? '#c4b5fd' : undefined} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Sağ İçerik Alanı */}
      <div style={{ flex: '1 1 600px', minWidth: '320px' }}>
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="premium-card"
          style={{ padding: '2.5rem 2rem' }}
        >
          {/* ───────────────── 1. PROFİL & HEDEFLER ───────────────── */}
          {activeTab === 'profil' && (
            <div>
              <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 700 }}>Profil & Hedef Ayarları</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Sınav alanınızı, sınıfınızı ve hedef üniversitenizi özelleştirin.
                  </p>
                </div>
                <Link 
                  href="/magaza" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Sparkles size={14} /> Gardıroba Git
                </Link>
              </div>
              
              {/* Avatar Seçici */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                  alt="Avatar" 
                  style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', border: `3px solid ${accent}` }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>Avatar Stili</h3>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {avatars.map(seed => (
                      <button 
                        key={seed}
                        onClick={() => setAvatarSeed(seed)}
                        style={{ 
                          width: '42px', height: '42px', borderRadius: '50%', 
                          background: avatarSeed === seed ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)', 
                          border: avatarSeed === seed ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.15)', 
                          cursor: 'pointer', overflow: 'hidden', padding: 0 
                        }}
                        title={seed}
                      >
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} style={{ width: '100%', height: '100%' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Alanları */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Kullanıcı Adı</label>
                    <input type="text" className="premium-input" value={authUser?.username || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>E-posta Adresi</label>
                    <input 
                      type="email" 
                      className="premium-input" 
                      placeholder="adiniz@ornek.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {authUser?.role !== 'ogretmen' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Sınıf Seviyesi</label>
                        <select 
                          className="premium-input" 
                          value={sinif} 
                          onChange={(e) => setSinif(e.target.value)}
                          style={{ appearance: 'none', cursor: 'pointer' }}
                        >
                          <option value="9">9. Sınıf</option>
                          <option value="10">10. Sınıf</option>
                          <option value="11">11. Sınıf</option>
                          <option value="12">12. Sınıf</option>
                          <option value="Mezun">Mezun</option>
                        </select>
                        <span style={{ fontSize: '0.75rem', color: isMaarif ? '#10b981' : '#f59e0b', marginTop: '4px', display: 'block' }}>
                          {isMaarif ? '✓ Maarif Modeli müfredatı otomatik aktiftir.' : '✓ Klasik YKS (TYT / AYT) müfredatı aktiftir.'}
                        </span>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Sınav Alanı</label>
                        <select 
                          className="premium-input" 
                          value={alan} 
                          onChange={(e) => setAlan(e.target.value)}
                          style={{ appearance: 'none', cursor: 'pointer' }}
                        >
                          <option value="Sayisal">Sayısal (MF)</option>
                          <option value="Esit Agirlik">Eşit Ağırlık (TM)</option>
                          <option value="Sozel">Sözel (TS)</option>
                          <option value="Dil">Yabancı Dil (DİL)</option>
                          <option value="Yok">Genel / Henüz Seçilmedi</option>
                        </select>
                      </div>
                    </div>

                    {/* Hedef Üniversite & Bölüm */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <School size={15} color="#38bdf8" /> Hedef Üniversite
                        </label>
                        <input 
                          type="text" 
                          list="top-unis"
                          className="premium-input" 
                          placeholder="Örn: Boğaziçi Üniversitesi"
                          value={targetUniversity}
                          onChange={(e) => setTargetUniversity(e.target.value)}
                        />
                        <datalist id="top-unis">
                          {TOP_UNIVERSITIES.map(u => <option key={u} value={u} />)}
                        </datalist>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Target size={15} color="#a855f7" /> Hedef Bölüm
                        </label>
                        <input 
                          type="text" 
                          list="top-depts"
                          className="premium-input" 
                          placeholder="Örn: Bilgisayar Mühendisliği"
                          value={targetDepartment}
                          onChange={(e) => setTargetDepartment(e.target.value)}
                        />
                        <datalist id="top-depts">
                          {TOP_DEPARTMENTS.map(d => <option key={d} value={d} />)}
                        </datalist>
                      </div>
                    </div>

                    {/* Veli Bağlantı Kodu */}
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                          👨‍👩‍👧 Canlı Veli Takip Kodu
                        </label>
                        <button 
                          onClick={copyParentCode}
                          style={{ padding: '0.3rem 0.85rem', background: copiedParentCode ? '#059669' : 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          {copiedParentCode ? <Check size={14} /> : <Copy size={14} />}
                          {copiedParentCode ? 'Kopyalandı' : 'Kopyala'}
                        </button>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                        Aileniz bu kodla sisteme şifresiz giriş yaparak sadece deneme netlerinizi ve günlük çalışma sürelerinizi izleyebilir.
                      </p>
                      <div style={{ fontSize: '1.4rem', letterSpacing: '3px', fontWeight: 800, color: '#34d399', textAlign: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                        {parentCode || 'YÜKLENİYOR...'}
                      </div>
                    </div>
                  </>
                )}

                {authUser?.role === 'ogretmen' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Öğretmenlik Branşı</label>
                      <input 
                        type="text" 
                        className="premium-input" 
                        placeholder="Örn: Fizik, Matematik..."
                        value={brans}
                        onChange={(e) => setBrans(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Görev Yapılan Kurum / Okul</label>
                      <input 
                        type="text" 
                        className="premium-input" 
                        placeholder="Örn: Fen Lisesi, Anadolu Lisesi..."
                        value={kurum}
                        onChange={(e) => setKurum(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── 2. GÖRÜNÜM & TEMA ───────────────── */}
          {activeTab === 'tema' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Görünüm ve Tema</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Göz yormayan karanlık mod veya parlak çalışma alanını seçin, vurgu renginizi belirleyin.
              </p>
              
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Arayüz Teması</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button 
                    onClick={() => handleThemeChange('dark')} 
                    style={{ 
                      padding: '1.5rem 1rem', 
                      background: theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)', 
                      border: theme === 'dark' ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '14px', 
                      color: '#fff', 
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🌙</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: theme === 'dark' ? accent : '#fff' }}>Karanlık Uzay</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Gece çalışmaları ve OLED ekranlar için ideal</div>
                  </button>

                  <button 
                    onClick={() => handleThemeChange('light')} 
                    style={{ 
                      padding: '1.5rem 1rem', 
                      background: theme === 'light' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.02)', 
                      border: theme === 'light' ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '14px', 
                      color: '#fff', 
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>☀️</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: theme === 'light' ? accent : '#fff' }}>Aydınlık Odak</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Gündüz deneme çözümleri ve net okuma için</div>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Kişisel Vurgu Rengi</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { color: '#38bdf8', name: 'Gök Mavisi' },
                    { color: '#8b5cf6', name: 'Mor Gece' },
                    { color: '#ec4899', name: 'Neon Pembe' },
                    { color: '#10b981', name: 'Zümrüt Yeşil' },
                    { color: '#f59e0b', name: 'Altın Kehribar' }
                  ].map(item => (
                    <button 
                      key={item.color}
                      onClick={() => handleAccentChange(item.color)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '24px',
                        background: accent === item.color ? `${item.color}25` : 'rgba(255,255,255,0.03)',
                        border: accent === item.color ? `2px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer', color: '#fff', fontSize: '0.85rem', fontWeight: 600
                      }}
                    >
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: item.color }} />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── 3. PİL & PERFORMANS ───────────────── */}
          {activeTab === 'performans' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                  <Zap size={22} color="#f59e0b" /> Pil, Güç & Performans Motoru
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6, lineHeight: 1.5 }}>
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
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Pil Tasarruf Modunu (Eco Mode) Aç</span>
                    {powerState.eco && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700 }}>
                        AKTİF
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', margin: 0, lineHeight: 1.45 }}>
                    Gereksiz GPU gölgelerini kapatır, 3D simülasyonları 1x DPR pil moduna alır ve arka plan işlem yükünü sıfıra indirir.
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
              <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '1rem', fontWeight: 600 }}>Mevcut Pil Tasarruf Korumaları</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    icon: '🧊',
                    title: 'Akıllı Arka Plan Dondurucu (Background Guardian)',
                    desc: 'Uygulama arka plana atıldığında veya ekran kilitlendiğinde tüm CSS animasyonları, 3D döngüleri ve zamanlayıcılar anında dondurularak 0 CPU tüketimi sağlanır.'
                  },
                  {
                    icon: '🚀',
                    title: 'Mobil GPU & Backdrop-Blur Kısıtlayıcı',
                    desc: 'Mobil tarayıcılarda telefonun ısınmasına yol açan ağır çok katmanlı bulanıklık efektleri hafifletilerek grafik işlemcinin yükü hafifletilir.'
                  },
                  {
                    icon: '🌌',
                    title: '3D Galaksi & PhET Simülasyon Ölçekleme',
                    desc: 'Beceri Galaksisi ve PhET simülasyonlarında yoğun partiküller optimize edilir ve ekran yenileme sıklığı dinamik dengelenir.'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────── 4. BİLDİRİMLER ───────────────── */}
          {activeTab === 'bildirim' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontWeight: 700 }}>Bildirim & Hatırlatıcı Motoru</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
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
                  {isTestingPush ? 'Gönderiliyor...' : 'Test Bildirimi Gönder'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Real Push Notification Toggle Component */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <PushNotificationToggle />
                </div>

                {/* Sessiz Saatler */}
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

                {/* Akıllı Kota */}
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

                {/* Kategori Bazlı Tercihler */}
                {[
                  { title: '🍅 Odak & Pomodoro Bildirimleri', desc: 'Oturum tamamlandığında ve mola bittiğinde sesli ve titreşimli uyar.', state: notifFocus, setter: setNotifFocus },
                  { title: '☀️ Sabah Çalışma & Ders Hatırlatıcısı', desc: 'Her sabah 08:30\'da günlük ders hedeflerini ve programını anımsat.', state: notifDaily, setter: setNotifDaily },
                  { title: '🔥 Yangın Serisi (Streak) Koruyucu', desc: 'Akşam 20:30\'da serin tehlikedeyse uyar, günün yanmasını engelle.', state: notifStreak, setter: setNotifStreak },
                  { title: '📋 Ödev & Teslim Hatırlatıcıları', desc: 'Yeni ödev atandığında ve son 24 saat kaldığında doğrudan uyar.', state: notifHomework, setter: setNotifHomework },
                  { title: '⚔️ Düello & Arena Davetleri', desc: 'Birisi seni Bilgi Arenası\'nda düelloya davet ettiğinde anında bildir.', state: notifDuel, setter: setNotifDuel },
                  { title: '🔊 Ses Efektleri & Çan Sesleri', desc: 'Oturum bitişlerinde kristal netliğinde sentetik melodi çal.', state: notifSound, setter: setNotifSound },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.15rem 1.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ paddingRight: '1rem' }}>
                      <h4 style={{ color: '#fff', marginBottom: '0.2rem', fontSize: '0.925rem', fontWeight: 600 }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
                    </div>
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

          {/* ───────────────── 5. GÜVENLİK & ŞİFRE ───────────────── */}
          {activeTab === 'guvenlik' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Güvenlik & Şifre Değiştir</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Hesap güvenliğiniz için şifrenizi en az 6 karakterli ve güçlü tutmanızı öneririz.
              </p>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Mevcut Şifreniz</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrentPw ? "text" : "password"} 
                      className="premium-input" 
                      placeholder="Mevcut şifrenizi girin" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Yeni Şifre</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPw ? "text" : "password"} 
                      className="premium-input" 
                      placeholder="En az 6 karakter yeni şifre" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPw(!showNewPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Yeni Şifre Tekrarı</label>
                  <input 
                    type={showNewPw ? "text" : "password"} 
                    className="premium-input" 
                    placeholder="Yeni şifrenizi tekrar doğrulayın" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={savingPassword}
                  className="btn-interactive"
                  style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: savingPassword ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                    marginTop: '0.5rem'
                  }}
                >
                  {savingPassword ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  {savingPassword ? 'Şifre Güncelleniyor...' : 'Şifreyi Değiştir'}
                </button>
              </form>
            </div>
          )}

          {/* ───────────────── 6. HESAP & TEHLİKELİ BÖLGE ───────────────── */}
          {activeTab === 'hesap' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Hesap & Gizlilik Bilgileri</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                YKS Yıldızı hesap ayrıntılarınız ve oturum yönetimi.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Kullanıcı Adı</label>
                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{authUser?.username || 'Bilinmiyor'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Hesap Türü / Rol</label>
                    <div style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 600 }}>
                      {authUser?.role === 'ogrenci' ? 'Öğrenci Hesabı' : authUser?.role === 'veli' ? 'Veli Hesabı' : authUser?.role === 'ogretmen' ? 'Öğretmen Hesabı' : authUser?.role || 'Bilinmiyor'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Hesap Kayıt Tarihi</label>
                  <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 500 }}>
                    {authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Aktif Dönem'}
                  </div>
                </div>

                {/* Çıkış Yap Butonu */}
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Güvenli Oturum Kapatma</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '3px 0 0' }}>Mevcut cihazdaki aktif oturumunuzu güvenle sonlandırır.</p>
                  </div>
                  <button 
                    onClick={logout}
                    style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Oturumu Kapat
                  </button>
                </div>

                {/* Tehlikeli Bölge */}
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <h3 style={{ color: '#ef4444', fontSize: '1.05rem', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <AlertCircle size={20} /> Tehlikeli Bölge: Hesabı Sil
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                    Hesabınızı sildiğinizde çözdüğünüz denemeler, soru geçmişiniz, kupa ve puanlarınız kalıcı olarak veritabanından yok edilir. Bu işlem geri alınamaz.
                  </p>
                  
                  {confirmDelete ? (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={handleDeleteAccount} 
                        disabled={deletingAccount}
                        style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: deletingAccount ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                      >
                        {deletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        {deletingAccount ? 'Siliniyor...' : 'Evet, Hesabımı Kalıcı Olarak Sil'}
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(false)} 
                        disabled={deletingAccount}
                        style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        İptal Et
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDelete(true)} 
                      style={{ padding: '0.65rem 1.25rem', background: 'transparent', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.5)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={16} /> Hesabımı Sil
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ana Kaydet Butonu (Tüm sekmeler için) */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="btn-interactive" 
              style={{ 
                background: `linear-gradient(135deg, ${accent}, ${accent}dd)`, 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.925rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: `0 4px 15px ${accent}44`
              }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>

        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .ayarlar-page-wrap { 
            padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; 
            padding: 1rem 0.75rem calc(85px + env(safe-area-inset-bottom, 20px)) !important; 
          }
          .ayarlar-header { 
            flex-direction: column !important; 
            align-items: flex-start !important; 
          }
          .ayarlar-page-wrap input,
          .ayarlar-page-wrap select,
          .ayarlar-page-wrap textarea { 
            font-size: 16px !important; 
          }
        }
      `}</style>
    </div>
  );
}
