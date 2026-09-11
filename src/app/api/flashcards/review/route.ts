import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

// Calculate next interval based on a simplified SM-2 algorithm
function calculateNextReview(quality: number, interval: number, easeFactor: number) {
  // Quality: 0 = forgot, 1 = hard, 2 = easy
  let newEase = easeFactor;
  let newInterval = interval;

  if (quality === 0) {
    newEase = Math.max(1.3, easeFactor - 0.2);
    newInterval = 1; // 1 day
  } else if (quality === 1) {
    newInterval = interval === 0 ? 1 : interval * 1.2;
  } else {
    newEase = easeFactor + 0.15;
    newInterval = interval === 0 ? 1 : interval * easeFactor;
  }

  return {
    ease: newEase,
    interval: Math.round(newInterval)
  };
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionId = authHeader.substring(7);
      }
    }

    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { cardId, quality } = await req.json();
    if (!cardId || quality === undefined) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });

    const progress = await db.prepare('SELECT * FROM flashcards_progress WHERE card_id = ? AND user_id = ?').get(cardId, sessionId) as any;
    if (!progress) return NextResponse.json({ error: 'Kart bulunamadı' }, { status: 404 });

    const { ease, interval } = calculateNextReview(quality, progress.interval || 0, progress.ease_factor || 2.5);
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    const status = quality === 0 ? 'learning' : 'learned';

    await db.prepare(`
      UPDATE flashcards_progress 
      SET status = ?, next_review_date = ?, interval = ?, ease_factor = ?, last_reviewed = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, nextDate.toISOString(), interval, ease, progress.id);

    return NextResponse.json({ success: true, nextReviewDate: nextDate.toISOString() }, { status: 200 });
  } catch (error) {
    console.error('Flashcards Review Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
