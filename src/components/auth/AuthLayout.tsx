import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Arka plan yumuşak ışık efektleri (Ambient Mesh Glow) */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Kart Konteyneri */}
      <div className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-7 shadow-2xl relative z-10">
        {/* Üst Logo ve Başlık Alanı */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Logo Alanı (Jenerik kutu ikon yerine minimal logo) */}
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <span className="text-blue-400 font-bold text-lg">Y</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Form İçeriği */}
        {children}
      </div>
    </div>
  );
};
