import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`reset_${ip}`, 5, 60 * 1000); // 5 requests per min
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız.' }, { status: 429 });
    }

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Eksik bilgi.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    // Token ile kullanıcıyı bul
    const user = await db.prepare('SELECT id FROM users WHERE reset_token = ?').get(token) as any;

    if (!user) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş bağlantı.' }, { status: 400 });
    }

    // Yeni şifreyi hash'le
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(newPassword, salt);

    // Veritabanını güncelle ve token'ı temizle (Sadece 1 kez kullanılabilmesi için)
    await db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?').run(password_hash, user.id);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
