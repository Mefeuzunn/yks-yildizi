import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`reset_${ip}`, 5, 60 * 1000); // 5 requests per min
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız. Lütfen bir dakika bekleyin.' }, { status: 429 });
    }

    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Yeni şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    // Token ile kullanıcıyı bul
    const user = await db.prepare('SELECT id, reset_token_expires FROM users WHERE reset_token = ?').get(token) as any;

    if (!user) {
      return NextResponse.json({ error: 'Geçersiz veya daha önce kullanılmış sıfırlama bağlantısı.' }, { status: 400 });
    }

    // Süre kontrolü
    if (user.reset_token_expires && new Date(user.reset_token_expires).getTime() < Date.now()) {
      return NextResponse.json({ 
        error: 'Bu sıfırlama bağlantısının geçerlilik süresi (30 dakika) dolmuş. Lütfen yeni bir bağlantı talep edin.' 
      }, { status: 400 });
    }

    // Yeni şifreyi hash'le
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(newPassword, salt);

    // Veritabanını güncelle ve token'ları temizle (tek kullanımlık güvenlik)
    await db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?')
      .run(password_hash, user.id);

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
