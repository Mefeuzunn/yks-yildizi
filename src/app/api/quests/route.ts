import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const QUEST_TEMPLATES = [
  { id: 'q1', type: 'focus', target: 60, xp: 50, desc: 'Bugün 60 dakika odaklan' },
  { id: 'q2', type: 'focus', target: 120, xp: 100, desc: 'Bugün 120 dakika odaklan' },
  { id: 'q3', type: 'questions', target: 50, xp: 75, desc: 'Bugün 50 soru çöz' },
  { id: 'q4', type: 'duel', target: 3, xp: 100, desc: 'Bugün 3 düello kazan' },
  { id: 'q5', type: 'login', target: 1, xp: 20, desc: 'Sisteme giriş yap' },
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const todayStr = new Date().toISOString().split('T')[0];

    // Check if user has quests for today
    let quests = await db.prepare('SELECT * FROM daily_quests WHERE user_id = ? AND date = ?').all(sessionId, todayStr) as any[];

    if (quests.length === 0) {
      // Generate 3 random quests for today
      const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      await db.transaction(async () => {
        for (const q of shuffled) {
          await db.prepare(`
            INSERT INTO daily_quests (id, user_id, date, quest_type, target_value, current_value, xp_reward, is_completed, description)
            VALUES (?, ?, ?, ?, ?, 0, ?, 0, ?)
          `).run(uuidv4(), sessionId, todayStr, q.type, q.target, q.xp, q.desc);
        }
      })();
      
      quests = await db.prepare('SELECT * FROM daily_quests WHERE user_id = ? AND date = ?').all(sessionId, todayStr) as any[];
    }

    return NextResponse.json({ quests });
  } catch (error) {
    console.error('Quests API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { questId } = await req.json();

    const quest = await db.prepare('SELECT * FROM daily_quests WHERE id = ? AND user_id = ?').get(questId, sessionId) as any;
    if (!quest) return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    
    if (quest.is_completed) {
      return NextResponse.json({ error: 'Görev zaten tamamlanmış' }, { status: 400 });
    }

    if (quest.current_value < quest.target_value) {
      return NextResponse.json({ error: 'Görev henüz tamamlanmamış' }, { status: 400 });
    }

    // Mark completed and give XP
    await db.transaction(async () => {
      await db.prepare('UPDATE daily_quests SET is_completed = 1 WHERE id = ?').run(questId);
      await db.prepare('UPDATE user_stats SET league_points = league_points + ? WHERE user_id = ?').run(quest.xp_reward, sessionId);
    })();

    return NextResponse.json({ success: true, xpEarned: quest.xp_reward });
  } catch (error) {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
