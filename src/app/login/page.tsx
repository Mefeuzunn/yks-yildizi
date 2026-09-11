"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [role, setRole] = useState('ogrenci');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Giriş başarısız');
      
      // Role bazlı yönlendirme
      if (data.user?.role === 'ogretmen') {
        window.location.href = '/ogretmen/dashboard';
      } else if (data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        className="premium-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '400px', padding: '3rem 2.5rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: role === 'ogrenci' 
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(56, 189, 248, 0.05))'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', 
            border: role === 'ogrenci' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <LogIn size={24} color={role === 'ogrenci' ? "#38bdf8" : "#10b981"} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>Tekrar Hoş Geldin</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kaldığın yerden devam et.</p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => setRole('ogrenci')}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              background: role === 'ogrenci' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: role === 'ogrenci' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Öğrenci Girişi</button>
          <button 
            type="button"
            onClick={() => setRole('ogretmen')}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              background: role === 'ogretmen' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: role === 'ogretmen' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Öğretmen Girişi</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="premium-input" 
              placeholder={role === 'ogrenci' ? "ogrenci_kullanici" : "ogretmen_kullanici"}
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Şifre</label>
            <input 
              type="password" 
              className="premium-input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-interactive" style={{ 
            width: '100%', marginTop: '0.5rem',
            background: role === 'ogrenci' 
              ? 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)'
              : 'linear-gradient(180deg, #10b981 0%, #047857 100%)',
            boxShadow: role === 'ogrenci'
              ? '0 0 0 1px rgba(255,255,255,0.1) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 0 #075985, 0 8px 16px rgba(0, 0, 0, 0.4)'
              : '0 0 0 1px rgba(255,255,255,0.1) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 0 #064e3b, 0 8px 16px rgba(0, 0, 0, 0.4)',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Giriş Yapılıyor...' : <><ArrowRight size={16} /> {role === 'ogrenci' ? 'Öğrenci Girişi' : 'Öğretmen Girişi'}</>}
          </button>
        </form>

        {/* Demo Öğrenci Giriş Butonu */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={async () => {
              setFormData({ username: 'demo', password: '123' });
              setRole('ogrenci');
              setLoading(true);
              setError('');
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: 'demo', password: '123456' })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Demo giriş başarısız');
                window.location.href = '/dashboard';
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            ⚡ Demo Öğrenci Hesabı ile Hızlı Giriş Yap
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Hesabın yok mu? <Link href="/register" style={{ color: role === 'ogrenci' ? '#38bdf8' : '#10b981', fontWeight: 600 }}>Hemen Kayıt Ol</Link>
        </p>
      </motion.div>
    </div>
  );
}
