import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('yks_session');

    if (!session || !session.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.value;
    const body = await req.json();
    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 });
    }

    // 1. Check if quest exists and is not completed
    const quest = await db.prepare(`
      SELECT * FROM daily_quests 
      WHERE id = ? AND user_id = ?
    `).get(questId, userId) as any;

    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 });
    }

    if (quest.is_completed === 1) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 });
    }

    // 2. Mark quest as completed
    await db.prepare(`
      UPDATE daily_quests 
      SET is_completed = 1, progress = target
      WHERE id = ?
    `).run(questId);

    // 3. Update user_stats
    const xpReward = quest.xp_reward || 0;
    const coinsReward = Math.floor(xpReward / 2);

    let stats = await db.prepare(`
      SELECT xp, coins, pofuduk_level, pofuduk_energy, pofuduk_happiness 
      FROM user_stats 
      WHERE user_id = ?
    `).get(userId) as any;

    if (!stats) {
      // Create stats if it doesn't exist
      await db.prepare(`
        INSERT INTO user_stats (user_id, xp, coins, pofuduk_level, pofuduk_energy, pofuduk_happiness)
        VALUES (?, 0, 0, 1, 100, 100)
      `).run(userId);
      stats = { xp: 0, coins: 0, pofuduk_level: 1, pofuduk_energy: 100, pofuduk_happiness: 100 };
    }

    const newXp = (stats.xp || 0) + xpReward;
    const newCoins = (stats.coins || 0) + coinsReward;
    const newLevel = Math.floor(newXp / 500) + 1;
    const newHappiness = Math.min((stats.pofuduk_happiness || 100) + 10, 100);

    await db.prepare(`
      UPDATE user_stats
      SET xp = ?, coins = ?, pofuduk_level = ?, pofuduk_happiness = ?
      WHERE user_id = ?
    `).run(newXp, newCoins, newLevel, newHappiness, userId);

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        xp: newXp,
        coins: newCoins,
        pofuduk_level: newLevel,
        pofuduk_happiness: newHappiness
      },
      questId
    });

  } catch (error: any) {
    console.error('Gamification Quest POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
