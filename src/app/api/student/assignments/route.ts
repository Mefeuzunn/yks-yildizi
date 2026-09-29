import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const assignments = await db.prepare(`
      SELECT a.id, a.title, a.description, a.due_date, a.created_at, asub.status, asub.score, a.questions_json, u.username as teacher_name
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      WHERE asub.student_id = ?
      ORDER BY a.created_at DESC
    `).all(userId);

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error('Ödevlerim çekilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
