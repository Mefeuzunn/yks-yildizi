import { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Kayıt Ol | YKS Yıldızı',
  description: 'YKS Yıldızı öğrenci, öğretmen ve veli kayıt paneli',
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Aramıza Katıl"
      subtitle="YKS yolculuğuna sistemli ve güçlü bir başlangıç yap."
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Yükleniyor...</div>}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
