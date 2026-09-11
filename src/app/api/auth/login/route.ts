import { signToken } from "@/lib/jwt";
import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`login_${ip}`, 10, 60 * 1000); // 10 attempts per minute
    
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Çok fazla giriş denemesi. Lütfen 1 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
    }

    username = username.trim();

    // Kullanıcıyı bul (Büyük/küçük harf ve boşluk duyarsız arama)
    const user = await db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username) as any;
    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' }, { status: 401 });
    }

    
    // Şifreyi doğrula
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı veya şifre hatalı.' }, { status: 401 });
    }

    // JWT oluştur
    const token = await signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set('yks_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });
    cookieStore.set('yks_role', user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    });

    return NextResponse.json({ success: true, message: 'Giriş başarılı!', token: user.id, user: { id: user.id, username: user.username, role: user.role } }, { status: 200 });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
