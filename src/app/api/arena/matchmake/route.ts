import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const user = await db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId) as any;
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    // Bot kullanıcısının varlığını kontrol et ve yoksa oluştur
    const botExist = await db.prepare("SELECT id FROM users WHERE id = 'yks-bot-user'").get() as any;
    if (!botExist) {
      await db.transaction(async () => {
        await db.prepare(`
          INSERT INTO users (id, username, password_hash, role, alan, sinif)
          VALUES ('yks-bot-user', 'AstraBot (AI)', 'mock', 'ogrenci', 'Sayisal', 'Mezun')
        `).run();
        await db.prepare(`
          INSERT OR IGNORE INTO user_stats (user_id, league, league_points, streak_days, solved_questions, success_rate)
          VALUES ('yks-bot-user', 'Şampiyon', 4850, 5, 1200, 85)
        `).run();
      })();
    }

    // Kullanıcı zaten bekleyen veya aktif bir düelloda mı?
    const existing = await db.prepare(`
      SELECT d.id, d.status 
      FROM duels d
      JOIN duel_participants dp ON d.id = dp.duel_id
      WHERE dp.user_id = ? AND d.status IN ('waiting', 'starting', 'active')
      LIMIT 1
    `).get(user.id) as any;

    if (existing) {
      return NextResponse.json({ duelId: existing.id, status: existing.status }, { status: 200 });
    }

    // Bekleyen bir düello var mı?
    const waitingDuel = await db.prepare(`
      SELECT id FROM duels WHERE status = 'waiting' LIMIT 1
    `).get() as any;

    if (waitingDuel) {
      // Düelloya katıl
      const dbQuestions = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10').all() as any[];
      const questions = dbQuestions.map((q) => ({
        id: q.id,
        metin: q.text,
        secenekler: JSON.parse(q.options_json),
        dogruCevap: q.correct_option
      }));
      const roundEndTime = new Date(Date.now() + 4000); // 3-2-1 Başla süresi
      
      await db.transaction(async () => {
        await db.prepare('INSERT INTO duel_participants (id, duel_id, user_id) VALUES (?, ?, ?)')
          .run(uuidv4(), waitingDuel.id, user.id);
        
        await db.prepare(`
          UPDATE duels 
          SET status = 'starting', questions_json = ?, round_end_time = ? 
          WHERE id = ?
        `).run(JSON.stringify(questions), roundEndTime.toISOString(), waitingDuel.id);
      })();

      return NextResponse.json({ duelId: waitingDuel.id, status: 'starting' }, { status: 200 });
    }

    // Bekleyen düello yok, yeni oluştur
    const newDuelId = uuidv4();
    await db.transaction(async () => {
      await db.prepare('INSERT INTO duels (id, status) VALUES (?, ?)')
        .run(newDuelId, 'waiting');
      await db.prepare('INSERT INTO duel_participants (id, duel_id, user_id) VALUES (?, ?, ?)')
        .run(uuidv4(), newDuelId, user.id);
    })();

    return NextResponse.json({ duelId: newDuelId, status: 'waiting' }, { status: 200 });
  } catch (error) {
    console.error('Matchmake Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
