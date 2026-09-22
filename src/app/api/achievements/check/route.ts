import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

const ACHIEVEMENTS = {
  late_night: {
    id: 'night_owl',
    name: 'Gece Kuşu 🦉',
    icon: '🦉',
    desc: 'Gece 23:00 - 04:00 arasında çalıştın!'
  },
  streak_7: {
    id: 'streak_master',
    name: 'Devamlılık Ustası 🔥',
    icon: '🔥',
    desc: '7 gün üst üste çalışma serisine ulaştın!'
  },
  questions_100: {
    id: 'century',
    name: 'Yüzlük Kulüp 💯',
    icon: '💯',
    desc: '100 soru çözdün!'
  },
  duel_win: {
    id: 'gladiator',
    name: 'Gladyatör ⚔️',
    icon: '⚔️',
    desc: 'İlk düellonu kazandın!'
  },
  focus_60: {
    id: 'deep_focus',
    name: 'Derin Odak 🧠',
    icon: '🧠',
    desc: 'Bir günde 60 dakika kesintisiz odaklandın!'
  }
};

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { context } = body;

    if (!context || !(context in ACHIEVEMENTS)) {
      return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
    }

    const achievementDef = ACHIEVEMENTS[context as keyof typeof ACHIEVEMENTS];

    // Check if already unlocked
    const existing = await db.prepare('SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievementDef.id);
    if (existing) {
      return NextResponse.json({ unlocked: false, achievement: achievementDef });
    }

    let conditionMet = false;

    if (context === 'late_night') {
      const currentHour = new Date().getHours();
      if (currentHour >= 23 || currentHour < 4) {
        conditionMet = true;
      }
    } else if (context === 'streak_7') {
      const stats = await db.prepare('SELECT streak_days FROM user_stats WHERE user_id = ?').get(userId);
      if (stats && stats.streak_days >= 7) {
        conditionMet = true;
      }
    } else if (context === 'questions_100') {
      const stats = await db.prepare('SELECT solved_questions FROM user_stats WHERE user_id = ?').get(userId);
      if (stats && stats.solved_questions >= 100) {
        conditionMet = true;
      }
    } else if (context === 'duel_win') {
      const wins = await db.prepare("SELECT COUNT(*) as win_count FROM duel_participants WHERE user_id = ? AND status = 'winner'").get(userId);
      if (wins && wins.win_count > 0) {
        conditionMet = true;
      }
    } else if (context === 'focus_60') {
      const today = new Date().toISOString().split('T')[0];
      const focus = await db.prepare("SELECT SUM(duration_min) as total_focus FROM focus_sessions WHERE user_id = ? AND DATE(created_at) = ?").get(userId, today);
      if (focus && focus.total_focus >= 60) {
        conditionMet = true;
      }
    }

    if (conditionMet) {
      await db.prepare(`
        INSERT INTO user_achievements (user_id, achievement_id, achievement_name, achievement_icon, achievement_desc)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `).run(userId, achievementDef.id, achievementDef.name, achievementDef.icon, achievementDef.desc);
      
      return NextResponse.json({ unlocked: true, achievement: achievementDef });
    }

    return NextResponse.json({ unlocked: false, achievement: achievementDef });

  } catch (error: any) {
    console.error('Error checking achievement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
