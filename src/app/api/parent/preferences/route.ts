import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { rateLimit } from '@/lib/rate-limit';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS parent_notification_preferences (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE,
        parent_name TEXT DEFAULT '',
        parent_phone TEXT DEFAULT '',
        whatsapp_active BOOLEAN DEFAULT false,
        sms_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (e: any) {
    console.error('Error ensuring parent_notification_preferences table:', e?.message);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const student = await db.prepare(
      "SELECT id, username FROM users WHERE UPPER(parent_code) = ? AND role = 'ogrenci'"
    ).get(cleanCode) as any;

    if (!student) {
      return NextResponse.json({ error: 'Geçersiz veli takip kodu.' }, { status: 404 });
    }

    await ensureTable();

    const prefs = await db.prepare(
      "SELECT parent_name, parent_phone, whatsapp_active, sms_active, updated_at FROM parent_notification_preferences WHERE student_id = ?"
    ).get(student.id) as any;

    return NextResponse.json({
      success: true,
      preferences: prefs || {
        parent_name: '',
        parent_phone: '',
        whatsapp_active: false,
        sms_active: false
      }
    });
  } catch (error: any) {
    console.error('Parent Preferences GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const limit = rateLimit(`parent_prefs_${ip}`, 30, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: 'Çok fazla istek gönderildi.' }, { status: 429 });
    }

    const body = await req.json();
    const { code, parent_phone, parent_name, whatsapp_active, sms_active } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const student = await db.prepare(
      "SELECT id, username FROM users WHERE UPPER(parent_code) = ? AND role = 'ogrenci'"
    ).get(cleanCode) as any;

    if (!student) {
      return NextResponse.json({ error: 'Geçersiz veli takip kodu.' }, { status: 404 });
    }

    await ensureTable();

    const id = uuidv4();
    const cleanPhone = (parent_phone || '').trim();
    const cleanName = (parent_name || '').trim();
    const isWhatsapp = Boolean(whatsapp_active);
    const isSms = Boolean(sms_active);

    await db.prepare(`
      INSERT INTO parent_notification_preferences (id, student_id, parent_name, parent_phone, whatsapp_active, sms_active, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON CONFLICT (student_id) DO UPDATE SET
        parent_name = EXCLUDED.parent_name,
        parent_phone = EXCLUDED.parent_phone,
        whatsapp_active = EXCLUDED.whatsapp_active,
        sms_active = EXCLUDED.sms_active,
        updated_at = NOW()
    `).run(id, student.id, cleanName, cleanPhone, isWhatsapp, isSms);

    return NextResponse.json({
      success: true,
      message: 'Veli bildirim tercihleri başarıyla kaydedildi.',
      preferences: {
        parent_name: cleanName,
        parent_phone: cleanPhone,
        whatsapp_active: isWhatsapp,
        sms_active: isSms
      }
    });
  } catch (error: any) {
    console.error('Parent Preferences POST error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
