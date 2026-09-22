import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

function calculateLeague(points: number): string {
  if (points < 100) return 'Bronz';
  if (points < 500) return 'Gümüş';
  if (points < 1000) return 'Altın';
  if (points < 3000) return 'Platin';
  return 'Şampiyon';
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { action, amount = 10 } = body; // default +10 XP for correct answer

    if (action !== 'add_xp') {
      return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    // 1. Get current stats
    let stats = await db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(userId) as any;
    
    // 2. If stats don't exist for some reason, create them
    if (!stats) {
      await db.prepare('INSERT INTO user_stats (user_id, solved_questions, success_rate, league, league_points, streak_days) VALUES (?, 0, 0, "Bronz", 0, 0)').run(userId);
      stats = { league_points: 0, solved_questions: 0 };
    }

    // 3. Update points
    const newPoints = stats.league_points + amount;
    const newSolved = stats.solved_questions + 1;
    const newLeague = calculateLeague(newPoints);

    await db.prepare('UPDATE user_stats SET league_points = ?, league = ?, solved_questions = ? WHERE user_id = ?').run(newPoints, newLeague, newSolved, userId);

    // Update Daily Quests for question solving
    try {
      await db.prepare(`
        UPDATE daily_quests 
        SET current_value = current_value + 1 
        WHERE user_id = ? AND date = CURRENT_DATE AND quest_type = 'questions' AND is_completed = 0
      `).run(userId);
    } catch(e) {}

    // 4. Badge check
    const { checkBadges } = await import('@/lib/badges');
    const eligibleBadges = checkBadges({ league_points: newPoints, solved_questions: newSolved });
    
    // Get existing badges
    const existingRows = await db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId) as any[];
    const existingBadgeIds = existingRows.map(r => r.badge_id);

    const newlyUnlocked: string[] = [];
    for (const b of eligibleBadges) {
      if (!existingBadgeIds.includes(b)) {
        await db.prepare('INSERT INTO user_badges (id, user_id, badge_id) VALUES (hex(randomblob(16)), ?, ?)').run(userId, b);
        newlyUnlocked.push(b);
      }
    }

    return NextResponse.json({
      success: true,
      newPoints,
      newLeague,
      gainedXp: amount,
      newBadges: newlyUnlocked
    }, { status: 200 });

  } catch (error) {
    console.error('XP Update Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
