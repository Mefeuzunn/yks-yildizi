import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Giriş Yap | YKS Yıldızı',
  description: 'YKS Yıldızı öğrenci ve öğretmen giriş paneli',
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Tekrar Hoş Geldin"
      subtitle="Kaldığın yerden devam etmek için giriş yap"
    >
      <LoginForm />
    </AuthLayout>
  );
}
