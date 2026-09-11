import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { assignment_id, score } = await req.json();

    await db.prepare(`
      UPDATE assignment_submissions 
      SET status = 'submitted', score = ?, submitted_at = CURRENT_TIMESTAMP
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, assignment_id, sessionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
