import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const sessions = await db.prepare('SELECT * FROM test_sessions WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    
    const mapped = sessions.map(s => {
      let parsedDetails = {};
      try {
        if (typeof s.details_json === 'string') {
          parsedDetails = JSON.parse(s.details_json);
        } else if (s.details_json && typeof s.details_json === 'object') {
          parsedDetails = s.details_json;
        }
      } catch {
        parsedDetails = {};
      }
      return {
        id: s.id,
        test_type: s.test_type,
        score: s.score,
        correct_count: s.correct_count,
        wrong_count: s.wrong_count,
        blank_count: s.blank_count,
        duration: s.duration,
        details: parsedDetails,
        created_at: s.created_at
      };
    });

    return NextResponse.json({ success: true, sessions: mapped }, { status: 200 });

  } catch (error) {
    console.error('Test Sessions GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
