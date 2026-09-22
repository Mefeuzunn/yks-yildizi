import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Öğrencinin kayıtlı olduğu sınıfları bul
    let classRows: any[] = [];
    try {
      classRows = await db.prepare(
        `SELECT class_id FROM class_students WHERE student_id = ?`
      ).all(userId) as any[];
    } catch (_) {}

    if (classRows.length === 0) {
      return NextResponse.json({ announcements: [] });
    }

    const classIds = classRows.map((r) => r.class_id);
    const placeholders = classIds.map(() => '?').join(',');

    // O sınıflara ait duyuruları getir
    let announcements: any[] = [];
    try {
      announcements = await db.prepare(`
        SELECT ta.id, ta.title, ta.content, ta.created_at,
               tc.class_name,
               u.username AS teacher_name
        FROM teacher_announcements ta
        JOIN teacher_classes tc ON ta.class_id = tc.id
        JOIN users u ON tc.teacher_id = u.id
        WHERE ta.class_id IN (${placeholders})
        ORDER BY ta.created_at DESC
        LIMIT 15
      `).all(...classIds) as any[];
    } catch (_) {}

    return NextResponse.json({ announcements });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
