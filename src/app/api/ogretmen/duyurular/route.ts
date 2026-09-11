import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const announcements = await db.prepare(`
      SELECT ta.*, tc.class_name
      FROM teacher_announcements ta
      LEFT JOIN teacher_classes tc ON ta.class_id = tc.id
      WHERE ta.teacher_id = ?
      ORDER BY ta.created_at DESC
    `).all(user.id) as any[];

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Duyurular listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, class_id } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Duyuru başlığı gerekli' }, { status: 400 });
    }

    // If class_id is provided, verify it belongs to this teacher
    if (class_id) {
      const cls = await db.prepare(
        'SELECT id FROM teacher_classes WHERE id = ? AND teacher_id = ?'
      ).get(class_id, user.id) as any;

      if (!cls) {
        return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
      }
    }

    const id = uuidv4();

    await db.prepare(`
      INSERT INTO teacher_announcements (id, teacher_id, class_id, title, content)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, user.id, class_id || null, title.trim(), content || null);

    const created = await db.prepare('SELECT * FROM teacher_announcements WHERE id = ?').get(id);

    return NextResponse.json({ announcement: created }, { status: 201 });
  } catch (error) {
    console.error('Duyuru oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
