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

    const userStmt = await db.prepare(`SELECT id, username, role, alan, sinif FROM users WHERE id = ?`);
    const user = userStmt.get(userId) as any;

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    const statsStmt = await db.prepare(`SELECT * FROM user_stats WHERE user_id = ?`);
    const stats = statsStmt.get(user.id);

    const errorStmt = await db.prepare(`SELECT * FROM error_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`);
    const errors = errorStmt.all(user.id);

    const badgesRows = await db.prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?').all(user.id) as any[];

    return NextResponse.json({
      user,
      stats: stats || { solved_questions: 0, success_rate: 0, league: 'Bronz', league_points: 0, streak_days: 0 },
      errors: errors || [],
      badges: badgesRows || []
    });

  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
