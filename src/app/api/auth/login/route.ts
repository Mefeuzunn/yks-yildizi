import { signToken } from "@/lib/jwt";
import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`login_${ip}`, 20, 60 * 1000); // 20 attempts per minute
    
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

    // Kullanıcıyı bul (Kullanıcı adı veya e-posta ile, büyük/küçük harf duyarsız)
    const user = await db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)').get(username, username) as any;
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
    
    // Müfredat modu tespiti (9, 10, 11 => maarif_v1, 12 ve mezun => legacy_yks)
    const curriculumMode = user.curriculum_mode || ((user.sinif === '9' || user.sinif === '10' || user.sinif === '11') ? 'maarif_v1' : 'legacy_yks');

    const response = NextResponse.json({
      success: true,
      message: 'Giriş başarılı!',
      token: user.id,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        sinif: user.sinif,
        alan: user.alan,
        curriculum_mode: curriculumMode
      }
    }, { status: 200 });

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
      secure: isProd,
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: '/'
    };

    response.cookies.set('yks_session', token, {
      ...cookieOpts,
      httpOnly: true
    });
    response.cookies.set('yks_role', user.role, {
      ...cookieOpts,
      httpOnly: false
    });
    response.cookies.set('yks_curriculum_mode', curriculumMode, {
      ...cookieOpts,
      httpOnly: false
    });
    response.cookies.set('yks_sinif', user.sinif || '', {
      ...cookieOpts,
      httpOnly: false
    });

    try {
      const cookieStore = await cookies();
      cookieStore.set('yks_session', token, { ...cookieOpts, httpOnly: true });
      cookieStore.set('yks_role', user.role, { ...cookieOpts, httpOnly: false });
      cookieStore.set('yks_curriculum_mode', curriculumMode, { ...cookieOpts, httpOnly: false });
      cookieStore.set('yks_sinif', user.sinif || '', { ...cookieOpts, httpOnly: false });
    } catch (_) {
      // response.cookies already sets the header
    }

    return response;

  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: error?.message || 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
