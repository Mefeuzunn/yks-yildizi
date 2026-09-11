import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function POST(req: Request) {
  const cookieStore = await cookies();
    const userId = cookieStore.get('yks_session')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { assignment_id, score } = await req.json();

    await db.prepare(`
      UPDATE assignment_submissions 
      SET status = 'graded', score = ?, submitted_at = CURRENT_TIMESTAMP
      WHERE assignment_id = ? AND student_id = ?
    `).run(score, assignment_id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ödev gönderilirken hata:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
