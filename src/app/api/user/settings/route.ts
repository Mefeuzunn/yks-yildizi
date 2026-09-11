import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const settings = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    // Eğer ayar yoksa default döndür (ilk giriş yapanlar için)
    if (!settings) {
      return NextResponse.json({
        theme: 'dark',
        accent_color: '#38bdf8',
        avatar_seed: 'Felix',
        email_notifications: 1,
        duel_requests: 1
      }, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { theme = 'dark', accent_color = '#38bdf8', avatar_seed = 'Felix', email_notifications = 1, duel_requests = 1 } = body;

    // Ayar var mı kontrol et, varsa güncelle, yoksa oluştur (Upsert mantığı)
    const existing = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    if (existing) {
      const updateStmt = await db.prepare(`
        UPDATE user_settings 
        SET theme = ?, accent_color = ?, avatar_seed = ?, email_notifications = ?, duel_requests = ?
        WHERE user_id = ?
      `);
      updateStmt.run(theme, accent_color, avatar_seed, email_notifications, duel_requests, userId);
    } else {
      const insertStmt = await db.prepare(`
        INSERT INTO user_settings (user_id, theme, accent_color, avatar_seed, email_notifications, duel_requests)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(userId, theme, accent_color, avatar_seed, email_notifications, duel_requests);
    }

    return NextResponse.json({ success: true, message: 'Ayarlar kaydedildi' }, { status: 200 });
  } catch (error) {
    console.error('Settings Update API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
