'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { RoleSelector, Role } from './RoleSelector';

export const LoginForm = () => {
  const [role, setRole] = useState<Role>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialNotice, setSocialNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSocialNotice('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
      }

      // Role check and redirect
      if (data.user?.role === 'ogretmen' || role === 'teacher') {
        window.location.href = '/ogretmen/dashboard';
      } else if (data.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setSocialNotice('Google ile giriş entegrasyonu yakında aktif olacaktır.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rol Seçici */}
      <RoleSelector selectedRole={role} onChange={setRole} />

      {/* Hata Bildirimi */}
      {error && (
        <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-center animate-fadeIn">
          {error}
        </div>
      )}

      {/* Bilgilendirme */}
      {socialNotice && (
        <div className="p-3 text-xs rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-center animate-fadeIn">
          {socialNotice}
        </div>
      )}

      {/* Kullanıcı Adı / E-posta */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-300">Kullanıcı Adı veya E-posta</label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={role === 'student' ? 'ogrenci_kullanici veya e-posta' : 'ogretmen_kullanici veya e-posta'}
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          required
          autoComplete="username"
        />
      </div>

      {/* Şifre */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-slate-300">Şifre</label>
          <Link href="/reset-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Şifremi Unuttum
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          required
          autoComplete="current-password"
        />
      </div>

      {/* Giriş Butonu (Flat & Modern) */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Giriş Yapılıyor...
          </>
        ) : (
          role === 'student' ? 'Öğrenci Olarak Giriş Yap' : 'Öğretmen Olarak Giriş Yap'
        )}
      </button>

      {/* Ayırıcı */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="border-t border-slate-800 w-full" />
        <span className="bg-slate-900/60 px-3 text-xs text-slate-500 uppercase tracking-wider absolute">
          veya
        </span>
      </div>

      {/* Sosyal Giriş (Google) */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2.5 bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 text-slate-200 text-xs font-medium py-2.5 rounded-xl transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Google ile Devam Et
      </button>

      {/* Kayıt Ol Yönlendirmesi */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Hesabın yok mu?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
            Hemen Kayıt Ol
          </Link>
        </p>
      </div>
    </form>
  );
};
