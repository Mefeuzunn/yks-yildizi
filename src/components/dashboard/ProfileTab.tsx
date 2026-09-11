import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Bell, Key, LogOut } from 'lucide-react';

export default function ProfileTab() {
  const { user, logout } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          👤 Profilim
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Hesap ayarlarını, hedef üniversiteni ve bildirim tercihlerini yönet.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Main Settings Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#fff', border: '4px solid #0b0f19', boxShadow: '0 0 0 2px rgba(255,255,255,0.1)' }}>
                {user?.username ? user.username.substring(0,2).toUpperCase() : 'EU'}
              </div>
              <button style={{ position: 'absolute', bottom: 0, right: 0, width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', color: '#0b0f19', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✏️
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{user?.username || 'Efe Uzun'}</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '1rem' }}>{user?.role === 'ogrenci' ? '12. Sınıf Öğrenci' : 'Eğitmen'}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Sayısal</span>
                <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '99px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Gümüş Lig</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <User size={20} color="#38bdf8" />
               <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Kişisel Bilgiler</h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Kullanıcı Adı</label>
                <input type="text" defaultValue={user?.username || ''} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>E-posta</label>
                <input type="email" defaultValue={`${user?.username || 'efe'}@yksyildizi.com`} disabled style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Hedef Üniversite</label>
                <input type="text" defaultValue="Boğaziçi Üniversitesi" style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>Hedef Bölüm</label>
                <input type="text" defaultValue="Bilgisayar Mühendisliği" style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
               <button style={{ padding: '0.5rem 1.5rem', backgroundColor: '#38bdf8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Kaydet</button>
            </div>
          </div>

        </div>

        {/* Sidebar Settings Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }} className="hover:bg-white/5">
              <Shield size={18} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: '0.95rem' }}>Gizlilik ve Güvenlik</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }} className="hover:bg-white/5">
              <Bell size={18} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: '0.95rem' }}>Bildirim Tercihleri</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', cursor: 'pointer' }} className="hover:bg-white/5">
              <Key size={18} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: '0.95rem' }}>Şifre Değiştir</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Tehlikeli Alan</h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Hesabınızı kalıcı olarak silebilir veya sistemden çıkış yapabilirsiniz.</p>
            <button onClick={logout} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-red-500/20">
              <LogOut size={18} /> Çıkış Yap
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
