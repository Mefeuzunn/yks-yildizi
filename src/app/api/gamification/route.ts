import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import crypto from 'crypto';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const QUEST_TEMPLATES = [
  { title: 'Matematik 20 Soru Çöz', target: 20, xp_reward: 50 },
  { title: 'Türkçe 30 Soru Çöz', target: 30, xp_reward: 60 },
  { title: 'Fizik 15 Soru Çöz', target: 15, xp_reward: 40 },
  { title: 'Kimya 10 Soru Çöz', target: 10, xp_reward: 30 },
  { title: 'Biyoloji 25 Soru Çöz', target: 25, xp_reward: 50 },
  { title: 'Günde 2 Saat Çalış', target: 120, xp_reward: 100 },
];

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Stats
    let stats = await db.prepare(`
      SELECT xp, coins, pofuduk_level, pofuduk_energy, pofuduk_happiness 
      FROM user_stats 
      WHERE user_id = ?
    `).get(userId) as any;

    if (!stats) {
      stats = { xp: 0, coins: 0, pofuduk_level: 1, pofuduk_energy: 100, pofuduk_happiness: 100 };
    }

    // 2. Fetch Quests
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let quests = await db.prepare(`
      SELECT * FROM daily_quests 
      WHERE user_id = ? AND created_date = ?
    `).all(userId, today) as any[];

    if (!quests || quests.length === 0) {
      // Generate 3 random quests
      const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      const insertQuest = await db.prepare(`
        INSERT INTO daily_quests (id, user_id, title, target, progress, xp_reward, is_completed, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await db.transaction(async () => {
        selected.forEach(q => {
          insertQuest.run(crypto.randomUUID(), userId, q.title, q.target, 0, q.xp_reward, 0, today);
        });
      })();

      quests = await db.prepare(`
        SELECT * FROM daily_quests 
        WHERE user_id = ? AND created_date = ?
      `).all(userId, today) as any[];
    }

    return NextResponse.json({ stats, quests });
  } catch (error: any) {
    console.error('Gamification GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
