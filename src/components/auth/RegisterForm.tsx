'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Role = 'student' | 'teacher' | 'parent';

export const RegisterForm = () => {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Değerleri
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    grade: '12. Sınıf',
    field: 'Sayısal',
    classCode: '',
    branch: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            role: role,
            grade: role === 'student' ? formData.grade : null,
            field: role === 'student' ? formData.field : null,
            class_code: role === 'student' ? formData.classCode?.trim() : null,
            branch: role === 'teacher' ? formData.branch?.trim() : null,
          },
        },
      });

      if (error) {
        // Fallback: Yerel API üzerinden de dene (geriye dönük uyumluluk)
        const sinifMap: Record<string, string> = {
          '9. Sınıf': '9', '10. Sınıf': '10', '11. Sınıf': '11', '12. Sınıf': '12', 'Mezun': 'Mezun'
        };
        const alanMap: Record<string, string> = {
          'Sayısal': 'Sayisal', 'Eşit Ağırlık': 'Esit Agirlik', 'Sözel': 'Sozel', 'Dil': 'Dil'
        };
        const backendRole = role === 'student' ? 'ogrenci' : role === 'teacher' ? 'ogretmen' : 'veli';

        const localRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: backendRole,
            sinif: sinifMap[formData.grade] || '12',
            alan: alanMap[formData.field] || 'Sayisal',
            classCode: formData.classCode?.trim() || undefined,
            brans: formData.branch?.trim() || undefined,
          }),
        });

        if (localRes.ok) {
          setSuccess(true);
          setTimeout(() => {
            if (role === 'teacher') router.push('/ogretmen/dashboard');
            else if (role === 'parent') router.push('/veli');
            else router.push('/dashboard');
            router.refresh();
          }, 1200);
          return;
        }

        setErrorMsg('Kayıt başarısız: ' + error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          if (role === 'teacher') router.push('/ogretmen/dashboard');
          else if (role === 'parent') router.push('/veli');
          else router.push('/dashboard');
          router.refresh();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg('Kayıt oluşturulurken bir hata oluştu: ' + (err.message || ''));
      setLoading(false);
    }
  };

  return (
    <div>
      {/* İlerleme Çubuğu (Progress Indicator) */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            1
          </span>
          <span className="text-xs text-slate-300 font-medium">Hesap Bilgileri</span>
        </div>
        <div className="h-[1px] flex-1 bg-slate-800 mx-3" />
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            2
          </span>
          <span className="text-xs text-slate-400 font-medium">Detaylar</span>
        </div>
      </div>

      {/* 3'lü Rol Seçici */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 mb-5">
        {(['student', 'teacher', 'parent'] as Role[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all capitalize border-0 cursor-pointer ${
              role === r
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-transparent'
            }`}
          >
            {r === 'student' ? 'Öğrenci' : r === 'teacher' ? 'Öğretmen' : 'Veli'}
          </button>
        ))}
      </div>

      {/* Hata Bildirimi */}
      {errorMsg && (
        <div className="mb-4 p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-center animate-fadeIn">
          {errorMsg}
        </div>
      )}

      {/* Başarı Bildirimi */}
      {success && (
        <div className="mb-4 p-3 text-xs rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center animate-fadeIn">
          ✅ Kaydınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...
        </div>
      )}

      {/* 1. ADIM: HESAP BİLGİLERİ */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Ad Soyad</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Adınızı girin"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">E-posta</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@alanadi.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Şifre</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="En az 6 karakter"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 border-0 cursor-pointer flex items-center justify-center gap-1"
          >
            Devam Et →
          </button>
        </form>
      )}

      {/* 2. ADIM: EĞİTİM & ROL DETAYLARI */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {role === 'student' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Sınıf</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="9. Sınıf">9. Sınıf</option>
                    <option value="10. Sınıf">10. Sınıf</option>
                    <option value="11. Sınıf">11. Sınıf</option>
                    <option value="12. Sınıf">12. Sınıf</option>
                    <option value="Mezun">Mezun</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Alan</label>
                  <select
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Sayısal">Sayısal</option>
                    <option value="Eşit Ağırlık">Eşit Ağırlık</option>
                    <option value="Sözel">Sözel</option>
                    <option value="Dil">Dil</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-slate-300">Sınıf Kodu</label>
                  <span className="text-[11px] text-slate-500">Opsiyonel</span>
                </div>
                <input
                  type="text"
                  name="classCode"
                  value={formData.classCode}
                  onChange={handleChange}
                  placeholder="Örn: ABC-123"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Öğretmeninizden aldığınız bir kod varsa girebilirsiniz.
                </p>
              </div>
            </>
          )}

          {role === 'teacher' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Branş</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="Örn: Matematik, Fizik"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {role === 'parent' && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-slate-300">Öğrenci Bağlantı Kodu</label>
                <span className="text-[11px] text-slate-500">Opsiyonel</span>
              </div>
              <input
                type="text"
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                placeholder="Örn: YKS-1234"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Öğrencinizin profil sayfasındaki veli takip kodunu girerek hesabınızı bağlayabilirsiniz.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setStep(1);
              }}
              className="w-1/3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-sm font-medium py-2.5 rounded-xl transition-colors border-0 cursor-pointer"
            >
              Geri
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Kaydediliyor...
                </>
              ) : (
                'Kaydı Tamamla'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Giriş Yap Linki */}
      <div className="text-center pt-5">
        <p className="text-xs text-slate-400">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
};
