"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'ogrenci', alan: 'Sayisal', sinif: '12', veliCode: '', brans: 'Matematik', kurum: 'Bireysel', classCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role,
          alan: formData.role === 'ogrenci' ? formData.alan : 'Yok',
          sinif: formData.role === 'ogrenci' ? formData.sinif : 'Mezun',
          brans: formData.role === 'ogretmen' ? formData.brans : undefined,
          kurum: formData.role === 'ogretmen' ? formData.kurum : undefined,
          classCode: formData.role === 'ogrenci' ? formData.classCode : undefined,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız');
      setSuccess(true);
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (newRole: string) => {
    setFormData(prev => ({ 
      ...prev,
      role: newRole, 
      alan: 'Sayisal', sinif: '12',
      brans: 'Matematik', kurum: 'Bireysel',
      veliCode: '', classCode: ''
    }));
    setError('');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        className="premium-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px', padding: '3rem 2.5rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', 
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <Star size={24} fill="#8b5cf6" color="#8b5cf6" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>Aramıza Katıl</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>YKS yolculuğuna yıldızlar gibi başla.</p>
        </div>

        {/* Role Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => handleRoleSwitch('ogrenci')}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              background: formData.role === 'ogrenci' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              color: formData.role === 'ogrenci' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Öğrenci</button>
          <button 
            type="button"
            onClick={() => handleRoleSwitch('ogretmen')}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              background: formData.role === 'ogretmen' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: formData.role === 'ogretmen' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Öğretmen</button>
          <button 
            type="button"
            onClick={() => handleRoleSwitch('veli')}
            style={{ 
              flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              background: formData.role === 'veli' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: formData.role === 'veli' ? '#fff' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Veli</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
          {success && <div style={{ color: 'var(--success)', fontSize: '0.875rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>Kayıt başarılı! Yönlendiriliyorsunuz...</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kullanıcı Adı</label>
            <input 
              type="text" 
              className="premium-input" 
              placeholder="Kullanıcı adınızı belirleyin" 
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

          {formData.role === 'veli' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Öğrenci Bağlantı Kodu</label>
              <input 
                type="text" 
                className="premium-input" 
                placeholder="Örn: YKS-MU8F" 
                value={formData.veliCode}
                onChange={e => setFormData({...formData, veliCode: e.target.value})}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Öğrencinin profil sayfasından "Veli Takip Kodu"nu alabilirsiniz.</p>
            </div>
          ) : formData.role === 'ogrenci' ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sınıf</label>
                  <select className="premium-input" style={{ appearance: 'none' }} value={formData.sinif} onChange={e => setFormData({...formData, sinif: e.target.value})}>
                    <option value="9">9. Sınıf</option>
                    <option value="10">10. Sınıf</option>
                    <option value="11">11. Sınıf</option>
                    <option value="12">12. Sınıf</option>
                    <option value="Mezun">Mezun</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Alan</label>
                  <select className="premium-input" style={{ appearance: 'none' }} value={formData.alan} onChange={e => setFormData({...formData, alan: e.target.value})}>
                    <option value="Sayisal">Sayısal</option>
                    <option value="Esit Agirlik">Eşit Ağırlık</option>
                    <option value="Sozel">Sözel</option>
                    <option value="Dil">Dil</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sınıf Kodu <span style={{ color: 'var(--text-muted)' }}>(Opsiyonel)</span></label>
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder="Öğretmeninizden aldığınız sınıf kodu" 
                  value={formData.classCode}
                  onChange={e => setFormData({...formData, classCode: e.target.value.toUpperCase()})}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Öğretmeniniz varsa, sınıf kodunu girerek sınıfa katılabilirsiniz.</p>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Kurum / Okul</label>
                <select className="premium-input" style={{ appearance: 'none' }} value={formData.kurum} onChange={e => setFormData({...formData, kurum: e.target.value})}>
                  <option value="Bireysel">Bireysel / Özel Ders</option>
                  <option value="Devlet Okulu">Devlet Okulu</option>
                  <option value="Ozel Okul">Özel Okul / Kolej</option>
                  <option value="Dershane">Dershane / Kurs</option>
                </select>
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Branş</label>
                <select className="premium-input" style={{ appearance: 'none' }} value={formData.brans} onChange={e => setFormData({...formData, brans: e.target.value})}>
                  <option value="Matematik">Matematik</option>
                  <option value="Fizik">Fizik</option>
                  <option value="Kimya">Kimya</option>
                  <option value="Biyoloji">Biyoloji</option>
                  <option value="Turkce">Türkçe / Edebiyat</option>
                  <option value="Tarih">Tarih</option>
                  <option value="Cografya">Coğrafya</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-interactive" style={{ 
            width: '100%', marginTop: '1rem',
            background: formData.role === 'ogrenci' 
              ? 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)' 
              : 'linear-gradient(180deg, #0ea5e9 0%, #0369a1 100%)',
            boxShadow: formData.role === 'ogrenci'
              ? '0 0 0 1px rgba(255,255,255,0.1) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 0 #4c1d95, 0 8px 16px rgba(0, 0, 0, 0.4)'
              : '0 0 0 1px rgba(255,255,255,0.1) inset, 0 1px 0 rgba(255,255,255,0.2) inset, 0 4px 0 #075985, 0 8px 16px rgba(0, 0, 0, 0.4)',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Kaydediliyor...' : <><ArrowRight size={16} /> {formData.role === 'ogrenci' ? 'Öğrenci Olarak Kayıt Ol' : 'Öğretmen Olarak Kayıt Ol'}</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Zaten hesabın var mı? <Link href="/login" style={{ color: formData.role === 'ogrenci' ? '#8b5cf6' : '#38bdf8', fontWeight: 600 }}>Giriş Yap</Link>
        </p>
      </motion.div>
    </div>
  );
}
