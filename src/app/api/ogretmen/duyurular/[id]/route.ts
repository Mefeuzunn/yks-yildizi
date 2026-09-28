import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { id } = await params;
    const announcement = await db.prepare(`
      SELECT ta.*, tc.class_name
      FROM teacher_announcements ta
      LEFT JOIN teacher_classes tc ON ta.class_id = tc.id
      WHERE ta.id = ? AND ta.teacher_id = ?
    `).get(id, user.id) as any;

    if (!announcement) return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
    return NextResponse.json({ announcement });
  } catch (error: any) {
    console.error('Duyuru getirme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { title, content, class_id, category = 'Genel', event_date } = body;

    if (!title || !title.trim()) return NextResponse.json({ error: 'Duyuru başlığı gerekli' }, { status: 400 });

    const formattedDate = event_date ? new Date(event_date).toISOString() : null;

    const result = await db.prepare(`
      UPDATE teacher_announcements
      SET title = ?, content = ?, class_id = ?, category = ?, event_date = ?
      WHERE id = ? AND teacher_id = ?
    `).run(title.trim(), content || null, class_id || null, category || 'Genel', formattedDate, id, user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Duyuru bulunamadı veya güncelleme yetkiniz yok' }, { status: 404 });
    }

    const updated = await db.prepare('SELECT * FROM teacher_announcements WHERE id = ?').get(id);
    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    console.error('Duyuru güncelleme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { id } = await params;

    const result = await db.prepare(`
      DELETE FROM teacher_announcements
      WHERE id = ? AND teacher_id = ?
    `).run(id, user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Duyuru bulunamadı veya silme yetkiniz yok' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Duyuru silindi' });
  } catch (error: any) {
    console.error('Duyuru silme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
