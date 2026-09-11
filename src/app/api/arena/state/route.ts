import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const duelId = searchParams.get('duelId');
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!duelId || !sessionId) return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });

    const duel = await db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId) as any;
    if (!duel) return NextResponse.json({ error: 'Düello bulunamadı' }, { status: 404 });

    const participants = await db.prepare(`
      SELECT dp.user_id, dp.score, dp.answers_json, u.username
      FROM duel_participants dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.duel_id = ?
    `).all(duelId) as any[];

    // Durum kontrolü ve Tur İlerletme Mantığı
    let status = duel.status;
    let current_round = duel.current_round;
    let round_end_time = duel.round_end_time;
    let questions = JSON.parse(duel.questions_json || '[]');
    let winner_id = duel.winner_id;

    const now = new Date();

    if (status === 'waiting') {
      const createdAt = new Date(duel.created_at || now);
      const elapsedMs = now.getTime() - createdAt.getTime();
      
      if (elapsedMs > 5000 && participants.length === 1) {
        const dbQuestions = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT 10').all() as any[];
        const matchQuestions = dbQuestions.map((q) => ({
          id: q.id,
          metin: q.text,
          secenekler: JSON.parse(q.options_json),
          dogruCevap: q.correct_option
        }));
        
        const newEndTime = new Date(now.getTime() + 4000);
        
        await db.transaction(async () => {
          await db.prepare('INSERT OR IGNORE INTO duel_participants (id, duel_id, user_id) VALUES (?, ?, ?)')
            .run(uuidv4(), duelId, 'yks-bot-user');
          
          await db.prepare(`
            UPDATE duels 
            SET status = 'starting', questions_json = ?, round_end_time = ? 
            WHERE id = ?
          `).run(JSON.stringify(matchQuestions), newEndTime.toISOString(), duelId);
        })();

        status = 'starting';
        round_end_time = newEndTime.toISOString();
        questions = matchQuestions;
        
        participants.push({
          user_id: 'yks-bot-user',
          username: 'AstraBot (AI)',
          score: 0,
          answers_json: '[]'
        });
      }
    }

    if (status === 'starting' && new Date(round_end_time) <= now) {
      // 3 saniye bitti, tur 1 başlasın (15 saniye süre)
      status = 'active';
      round_end_time = new Date(now.getTime() + 15000).toISOString();
      await db.prepare("UPDATE duels SET status = 'active', round_end_time = ? WHERE id = ?").run(round_end_time, duelId);
    } 
    else if (status === 'active') {
      // Bot cevabı simülasyonu
      const botIndex = participants.findIndex(p => p.user_id === 'yks-bot-user');
      if (botIndex !== -1) {
        const botAnswers = JSON.parse(participants[botIndex].answers_json || '[]');
        const botHasAnswered = botAnswers.some((a: any) => a.round === current_round);
        
        if (!botHasAnswered) {
          const roundStartTime = new Date(round_end_time).getTime() - 17000;
          const elapsedMs = now.getTime() - roundStartTime;
          
          const botDelaySeed = (duelId.charCodeAt(0) + duelId.charCodeAt(duelId.length - 1) + current_round) * 17;
          const botDelayMs = 3500 + (botDelaySeed % 4000);
          
          if (elapsedMs > botDelayMs) {
            const currentQuestion = questions[current_round - 1];
            if (currentQuestion) {
              const botAccuracySeed = (botDelaySeed * 3) % 100;
              const isCorrect = botAccuracySeed < 80; // %80 doğruluk payı
              
              const selectedOption = isCorrect 
                ? currentQuestion.dogruCevap 
                : currentQuestion.secenekler.find((o: string) => o !== currentQuestion.dogruCevap) || currentQuestion.secenekler[0];
                
              let scoreEarned = 0;
              if (isCorrect) {
                const timeLeftMs = 15000 - botDelayMs;
                if (timeLeftMs > 0) {
                  scoreEarned = Math.floor((timeLeftMs / 15000) * 1000);
                  if (scoreEarned > 1000) scoreEarned = 1000;
                }
                if (scoreEarned < 200) scoreEarned = 200;
              }
              
              botAnswers.push({
                round: current_round,
                selectedOption,
                isCorrect,
                score: scoreEarned
              });
              
              await db.prepare(`
                UPDATE duel_participants 
                SET answers_json = ?, score = score + ? 
                WHERE duel_id = ? AND user_id = 'yks-bot-user'
              `).run(JSON.stringify(botAnswers), scoreEarned, duelId);
              
              participants[botIndex].answers_json = JSON.stringify(botAnswers);
              participants[botIndex].score += scoreEarned;
            }
          }
        }
      }

      const p1Answers = JSON.parse(participants[0]?.answers_json || '[]');
      const p2Answers = participants[1] ? JSON.parse(participants[1].answers_json || '[]') : [];
      
      const p1Answered = p1Answers.some((a: any) => a.round === current_round);
      const p2Answered = p2Answers.some((a: any) => a.round === current_round);
      
      const bothAnswered = p1Answered && p2Answered;
      const timeIsUp = new Date(round_end_time) <= now;

      if (bothAnswered || timeIsUp) {
        // Yeni tura geç veya bitir
        if (current_round >= questions.length) {
          status = 'finished';
          // Kazananı belirle
          const p1Score = participants[0].score;
          const p2Score = participants[1] ? participants[1].score : 0;
          if (p1Score > p2Score) winner_id = participants[0].user_id;
          else if (p2Score > p1Score) winner_id = participants[1]?.user_id;
          else winner_id = 'draw';
          
          await db.prepare("UPDATE duels SET status = 'finished', winner_id = ? WHERE id = ?").run(winner_id, duelId);
          
          // XP ver
          if (winner_id && winner_id !== 'draw') {
             await db.prepare('UPDATE user_stats SET league_points = league_points + 50 WHERE user_id = ?').run(winner_id);
             
             // Clan contribution
             const clanMember = await db.prepare('SELECT clan_id FROM clan_members WHERE user_id = ?').get(winner_id) as any;
             if (clanMember) {
                await db.prepare('UPDATE clan_members SET weekly_contribution = weekly_contribution + 50 WHERE user_id = ?').run(winner_id);
                await db.prepare('UPDATE clans SET weekly_xp = weekly_xp + 50 WHERE id = ?').run(clanMember.clan_id);
             }
          }
        } else {
          // Sonraki tur için 3 saniye bekleme (Soru geçiş efekti için)
          // Aslında UI'da bunu handle edebiliriz. Biz doğrudan +17 saniye ekleyip round'u artıralım
          // 2 saniye cevapları görme, 15 saniye yeni soru = 17 saniye.
          current_round++;
          // round_end_time UI tarafında "sonuç gösterimi" için offsetlenecek.
          round_end_time = new Date(now.getTime() + 17000).toISOString();
          await db.prepare("UPDATE duels SET current_round = ?, round_end_time = ? WHERE id = ?").run(current_round, round_end_time, duelId);
        }
      }
    }

    // İstemciye gidecek veriyi hazırla
    // Güvenlik: Rakibin cevabını tur bitmeden gösterme
    const mappedParticipants = participants.map(p => {
      const answers = JSON.parse(p.answers_json || '[]');
      const isMe = p.user_id === sessionId;
      const timeIsUp = new Date(round_end_time) <= now;
      const bothAnswered = participants.every(px => JSON.parse(px.answers_json || '[]').some((a:any) => a.round === current_round));
      const roundFinished = timeIsUp || bothAnswered;

      return {
        user_id: p.user_id,
        username: p.username,
        score: p.score,
        // Rakip ise ve tur bitmediyse sadece "cevap verdi" bilgisini gönder
        answeredCurrentRound: answers.some((a: any) => a.round === current_round),
        latestAnswer: (!isMe && !roundFinished && status === 'active') ? null : answers.find((a: any) => a.round === current_round)
      };
    });

    const currentQuestion = questions[current_round - 1] || null;
    if (currentQuestion && status === 'active') {
       // İstemciye doğru cevabı gönderme, hile yapılmasın
       // Ancak /answer route'unda kontrol edeceğiz
       // Şimdilik UI için gerekli olabilir, biz sadece API de dogruCevap'i silelim, /answer endpointi duels veritabanindan okusun
    }

    return NextResponse.json({
      status,
      current_round,
      round_end_time,
      winner_id,
      question: currentQuestion,
      participants: mappedParticipants
    }, { status: 200 });

  } catch (error) {
    console.error('Arena State Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
