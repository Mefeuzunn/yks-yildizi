import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { duelId, selectedOption, round } = await req.json();
    if (!duelId || !selectedOption || !round) return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });

    const duel = await db.prepare('SELECT status, current_round, round_end_time, questions_json FROM duels WHERE id = ?').get(duelId) as any;
    if (!duel || duel.status !== 'active') {
      return NextResponse.json({ error: 'Düello aktif değil' }, { status: 400 });
    }

    if (duel.current_round !== round) {
      return NextResponse.json({ error: 'Yanlış tur' }, { status: 400 });
    }

    const participant = await db.prepare('SELECT answers_json, score FROM duel_participants WHERE duel_id = ? AND user_id = ?').get(duelId, userId) as any;
    if (!participant) return NextResponse.json({ error: 'Katılımcı bulunamadı' }, { status: 404 });

    const answers = JSON.parse(participant.answers_json || '[]');
    // Daha önce cevaplamış mı?
    if (answers.some((a: any) => a.round === round)) {
      return NextResponse.json({ error: 'Zaten cevaplandı' }, { status: 400 });
    }

    const questions = JSON.parse(duel.questions_json || '[]');
    const currentQuestion = questions[round - 1];

    const isCorrect = selectedOption === currentQuestion.dogruCevap;
    
    // Hız Puanı Hesaplama (Süre bitimine ne kadar çok kaldıysa o kadar puan, Max: 1000)
    let scoreEarned = 0;
    if (isCorrect) {
      const now = new Date();
      const endTime = new Date(duel.round_end_time);
      // Offset düşülmemiş tam 15 saniyelik kısımdan kalan süreyi hesapla
      // State API'sinde +17 sn (2s geçiş offseti + 15s soru süresi) eklemiştik
      const timeLeftMs = endTime.getTime() - now.getTime() - 2000; 
      
      if (timeLeftMs > 0) {
         // max 15000 ms -> 1000 puan
         scoreEarned = Math.floor((timeLeftMs / 15000) * 1000);
         if (scoreEarned > 1000) scoreEarned = 1000;
      }
      // En az taban puan (Süre çok azalsa da doğru yapıldığı için)
      if (scoreEarned < 200) scoreEarned = 200;
    }

    answers.push({
      round,
      selectedOption,
      isCorrect,
      score: scoreEarned
    });

    await db.transaction(async () => {
       await db.prepare(`
         UPDATE duel_participants 
         SET answers_json = ?, score = score + ? 
         WHERE duel_id = ? AND user_id = ?
       `).run(JSON.stringify(answers), scoreEarned, duelId, userId);
    })();

    return NextResponse.json({ success: true, isCorrect, scoreEarned }, { status: 200 });

  } catch (error) {
    console.error('Arena Answer Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
