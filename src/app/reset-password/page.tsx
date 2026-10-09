'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles, Mail, Send, ArrowLeft } from 'lucide-react';
import { toast } from '@/context/ToastContext';
import { triggerHaptic } from '@/lib/haptics';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // State for Password Reset (When token exists)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for Requesting Reset Link (When token does NOT exist)
  const [identifier, setIdentifier] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);

  // 1. Yeni Şifre Kaydetme (Token mevcut olduğunda)
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakterden oluşmalıdır.');
      toast.warning('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      toast.warning('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    triggerHaptic();

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Şifre sıfırlanamadı.');
      }

      setIsSuccess(true);
      toast.success('Şifreniz başarıyla güncellendi!');
      
      setTimeout(() => {
        router.push('/login');
      }, 2500);

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'Sıfırlama işlemi başarısız.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Sıfırlama Bağlantısı İsteme (Token yokken)
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Lütfen e-posta adresinizi veya kullanıcı adınızı girin.');
      toast.warning('Bilgilerinizi giriniz.');
      return;
    }

    setLoading(true);
    triggerHaptic();

    try {
      const isEmail = identifier.includes('@');
      const payload = isEmail ? { email: identifier.trim() } : { username: identifier.trim() };

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'İstek gönderilemedi.');
      }

      setRequestSent(true);
      if (data.demo_link) {
        setDemoLink(data.demo_link);
      }
      toast.success('Sıfırlama bağlantısı gönderildi!');
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
      toast.error(err.message || 'İstek gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#070a13' }}>
      {/* Arka plan parlama efektleri */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none rounded-full blur-[120px] opacity-25"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, #a855f7 100%)' }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10 rounded-2xl p-8"
        style={{
          background: 'linear-gradient(180deg, rgba(19, 27, 46, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* ================= MOD A: TOKEN VAR (YENİ ŞİFRE GİRİŞİ) ================= */}
        {token ? (
          <div>
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc'
                }}
              >
                <KeyRound size={30} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 mb-3">
                <Sparkles size={13} /> Güvenli Hesap Kurtarma
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Yeni Şifre Belirle</h1>
              <p className="text-slate-400 text-xs mt-1">
                Hesabınız için güçlü ve hatırlayabileceğiniz yeni bir şifre girin.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {isSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Şifreniz Değiştirildi!</h3>
                <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                  Hesabınız başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  Hemen Giriş Yap <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Yeni Şifre</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Yeni Şifre Tekrar</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar yazın"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                    boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle & Kaydet'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ================= MOD B: TOKEN YOK (BAĞLANTI İSTEME) ================= */
          <div>
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.2))',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c084fc'
                }}
              >
                <Lock size={30} />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 mb-3">
                <Sparkles size={13} /> Şifremi Unuttum
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Hesabınızı Kurtarın</h1>
              <p className="text-slate-400 text-xs mt-1">
                Kayıtlı e-posta adresinizi veya kullanıcı adınızı girin. Size güvenli sıfırlama bağlantısı göndereceğiz.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {requestSent ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                  <Mail size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Bağlantı Gönderildi!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Eğer bilgileriniz sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı e-posta adresinize iletildi. Lütfen gelen kutunuzu kontrol edin.
                </p>

                {demoLink && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-left">
                    <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={12} /> Geliştirici & Test Bağlantısı
                    </div>
                    <p className="text-slate-400 text-[11px] mb-2">
                      Geliştirme ortamında olduğunuz için bağlantıyı doğrudan kullanabilirsiniz:
                    </p>
                    <Link
                      href={demoLink}
                      className="text-xs text-indigo-400 hover:text-indigo-300 break-all underline font-mono"
                    >
                      {demoLink}
                    </Link>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Giriş Ekranına Dön
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-posta veya Kullanıcı Adı</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="ornek@ogrenci.com veya kullaniciadi"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 transition-all outline-none"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all active:scale-[0.98] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
                    boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</span>
                </button>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs text-slate-400 hover:text-indigo-400 transition-colors inline-flex items-center gap-1">
                    <ArrowLeft size={13} /> Giriş ekranına geri dön
                  </Link>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#070a13', color: '#94a3b8' }}>
        Yükleniyor...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
