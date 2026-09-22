import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const achievements = await db.prepare(
      'SELECT achievement_id, achievement_name, achievement_icon, achievement_desc, unlocked_at FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC'
    ).all(userId);

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { achievement_id, achievement_name, achievement_icon, achievement_desc } = body;

    if (!achievement_id || !achievement_name) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    // Zaten kazanılmış mı?
    const existing = await db.prepare(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, achievement_id);
    
    if (existing) {
      return NextResponse.json({ success: false, message: 'Zaten kazanılmış' });
    }

    await db.prepare(
      'INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_icon, achievement_desc) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, achievement_id, achievement_name, achievement_icon || '🏅', achievement_desc || '');

    return NextResponse.json({ success: true, unlocked: true, achievement: { achievement_id, achievement_name, achievement_icon, achievement_desc } });
  } catch (error) {
    console.error('Achievement POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
