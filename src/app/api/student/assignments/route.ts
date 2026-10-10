import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Ensure feedback column exists
    try {
      await db.prepare("ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS feedback TEXT DEFAULT ''").run();
    } catch (_) {}

    const assignments = await db.prepare(`
      SELECT 
        a.id, 
        a.title, 
        a.description, 
        a.due_date, 
        a.created_at,
        a.subject,
        a.topic,
        a.category,
        asub.status, 
        asub.score, 
        asub.submitted_at,
        COALESCE(asub.feedback, '') as teacher_feedback,
        a.questions_json, 
        u.username as teacher_name,
        COALESCE(u.brans, 'Öğretmen') as teacher_brans
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      WHERE asub.student_id = ?
      ORDER BY 
        CASE 
          WHEN asub.status = 'pending' THEN 0 
          ELSE 1 
        END,
        a.due_date ASC NULLS LAST,
        a.created_at DESC
    `).all(userId);

    return NextResponse.json({ success: true, assignments: assignments || [] });
  } catch (error) {
    console.error('Ödevlerim çekilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
