import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const assignments = await db.prepare(`
      SELECT a.id, a.title, a.description, a.due_date, a.created_at,
             s.status, s.score, s.submitted_at,
             u.username as teacher_name
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON a.teacher_id = u.id
      WHERE s.student_id = ?
      ORDER BY 
        CASE WHEN s.status = 'pending' THEN 0 ELSE 1 END,
        a.due_date ASC NULLS LAST
    `).all(userId) as any[];

    return NextResponse.json({ assignments });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { assignmentId } = await req.json();
    if (!assignmentId) return NextResponse.json({ error: 'assignmentId gerekli' }, { status: 400 });

    await db.prepare(`
      UPDATE assignment_submissions
      SET status = 'submitted', submitted_at = NOW()
      WHERE assignment_id = ? AND student_id = ?
    `).run(assignmentId, userId);

    return NextResponse.json({ success: true });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
