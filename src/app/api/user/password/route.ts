import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Mevcut şifre ve yeni şifre zorunludur.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json({ error: 'Yeni şifreniz mevcut şifrenizle aynı olamaz.' }, { status: 400 });
    }

    // Kullanıcıyı veritabanından al
    const user = await db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Mevcut şifreyi doğrula
    const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mevcut şifreniz hatalı.' }, { status: 400 });
    }

    // Yeni şifreyi hashle ve kaydet
    const newHash = bcrypt.hashSync(newPassword, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi.'
    });
  } catch (error: any) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Şifre güncellenirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
