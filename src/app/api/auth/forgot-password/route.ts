import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`forgot_${ip}`, 5, 60 * 1000); // 5 requests per min
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız.' }, { status: 429 });
    }

    const { username, email } = await req.json();

    if (!username && !email) {
      return NextResponse.json({ error: 'Kullanıcı adı veya e-posta gereklidir.' }, { status: 400 });
    }

    // Kullanıcıyı bul
    let user;
    if (email) {
      user = await db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    } else {
      user = await db.prepare('SELECT id FROM users WHERE username = ?').get(username) as any;
    }

    if (!user) {
      // Güvenlik açısından kullanıcı bulunamadı demek yerine başarılı dönmek daha iyidir (User Enumeration engellemek için)
      return NextResponse.json({ success: true, message: 'Eğer bilgiler doğruysa şifre sıfırlama bağlantısı gönderildi.' }, { status: 200 });
    }

    // Rastgele bir token oluştur (Gerçekte bu token e-posta ile link olarak gönderilir)
    const resetToken = crypto.randomBytes(32).toString('hex');

    await db.prepare('UPDATE users SET reset_token = ? WHERE id = ?').run(resetToken, user.id);

    // TODO: Gerçek bir SMTP (Örn: Resend / Nodemailer) ile e-posta gönderimi eklenecek.
    // Şimdilik demo / geliştirme amaçlı token'ı dönüyoruz (Gerçek prodüksiyonda asla dönülmez!).
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı oluşturuldu.',
      demo_link: `/reset-password?token=${resetToken}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
