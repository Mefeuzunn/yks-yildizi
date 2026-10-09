import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`forgot_${ip}`, 5, 60 * 1000); // 5 requests per min
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız. Lütfen bir dakika sonra tekrar deneyin.' }, { status: 429 });
    }

    const { username, email } = await req.json();

    if (!username && !email) {
      return NextResponse.json({ error: 'Kullanıcı adı veya e-posta adresi gereklidir.' }, { status: 400 });
    }

    // Ensure reset_token_expires column exists
    try {
      await db.prepare(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP
      `).run();
    } catch (_) {}

    // Kullanıcıyı bul
    let user: any;
    if (email) {
      user = await db.prepare('SELECT id, username, email FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    } else {
      user = await db.prepare('SELECT id, username, email FROM users WHERE LOWER(username) = LOWER(?)').get(username);
    }

    // Güvenlik: Kullanıcı bulunamadığında bile sistem dışarıya "kullanıcı yok" bilgisi sızdırmaz
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'Kayıtlı bilgilerinizle eşleşen bir hesap varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' 
      }, { status: 200 });
    }

    // Rastgele 32-byte kriptografik token ve 30 dakikalık geçerlilik süresi
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
      .run(resetToken, expiresAt, user.id);

    // URL oluştur
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yks-yildizi.vercel.app';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Hedef e-posta: Kullanıcının kayıtlı adresi veya girilen adres
    const targetEmail = user.email || email;

    if (targetEmail) {
      await sendPasswordResetEmail({
        to: targetEmail,
        username: user.username || 'Öğrencimiz',
        resetUrl,
        expiresInMinutes: 30
      });
    }

    // Güvenlik standartlarına uygun yanıt
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı kayıtlı e-posta adresinize iletildi. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol ediniz.',
      // Geliştirme kolaylığı için sadece production dışı ortamlarda demo link döner
      ...(isDevelopment ? { demo_link: resetUrl } : {})
    }, { status: 200 });

  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
