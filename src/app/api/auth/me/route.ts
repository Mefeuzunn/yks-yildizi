import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('yks_session')?.value;

    // Check Authorization header for mobile clients
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let userId = token;
    try {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        userId = payload.userId as string;
      }
    } catch(e) {}

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await db.prepare('SELECT id, username, role, alan, sinif, brans, kurum, parent_code, target_university, target_department, invite_code FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const stats = await db.prepare('SELECT league, league_points FROM user_stats WHERE user_id = ?').get(userId) as any;
    if (stats) {
      user.league = stats.league;
      user.league_points = stats.league_points;
    } else {
      user.league = 'Bronz';
      user.league_points = 0;
    }

    return NextResponse.json({
      authenticated: true,
      user
    }, { status: 200 });

  } catch (error: any) {
    console.error('Me API Error:', error);
    return NextResponse.json({ authenticated: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
