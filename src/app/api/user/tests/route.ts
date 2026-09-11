import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const sessions = await db.prepare('SELECT * FROM test_sessions WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    
    const mapped = sessions.map(s => ({
      id: s.id,
      test_type: s.test_type,
      score: s.score,
      correct_count: s.correct_count,
      wrong_count: s.wrong_count,
      blank_count: s.blank_count,
      duration: s.duration,
      details: JSON.parse(s.details_json),
      created_at: s.created_at
    }));

    return NextResponse.json({ success: true, sessions: mapped }, { status: 200 });

  } catch (error) {
    console.error('Test Sessions GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
