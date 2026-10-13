import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { calculateLeague } from '@/lib/league-system';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

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
      await db.prepare("INSERT INTO user_stats (user_id, solved_questions, success_rate, league, league_points, streak_days) VALUES (?, 0, 0, 'Bronz', 0, 0)").run(userId);
      stats = { league_points: 0, solved_questions: 0 };
    }

    // 3. Update points
    const newPoints = stats.league_points + amount;
    const newSolved = stats.solved_questions + 1;
    const newLeague = calculateLeague(newPoints);

    await db.prepare('UPDATE user_stats SET league_points = ?, league = ?, solved_questions = ? WHERE user_id = ?').run(newPoints, newLeague, newSolved, userId);

    // Sync clan weekly progress
    try {
      const clanMember = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(userId) as any;
      if (clanMember?.clan_id) {
        await db.prepare('UPDATE clan_members SET weekly_contribution = weekly_contribution + ? WHERE user_id = ?').run(amount, userId);
        await db.prepare('UPDATE clans SET weekly_xp = weekly_xp + ?, total_xp = total_xp + ? WHERE id = ?').run(amount, amount, clanMember.clan_id);
      }
    } catch (_) {}

    // Update Daily Quests for question solving
    try {
      await db.prepare(`
        UPDATE daily_quests 
        SET progress = COALESCE(progress, 0) + 1 
        WHERE user_id = ? AND created_date = CURRENT_DATE::text AND is_completed = 0
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
        await db.prepare('INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)').run(uuidv4(), userId, b);
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
