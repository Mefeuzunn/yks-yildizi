import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { assignment_id, score } = await req.json();

    await db.prepare(`
      UPDATE assignment_submissions 
      SET status = 'submitted', score = ?, submitted_at = CURRENT_TIMESTAMP
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, assignment_id, userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
