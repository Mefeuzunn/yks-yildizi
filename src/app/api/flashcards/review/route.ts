import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

interface SM2Result {
  interval: number;
  easeFactor: number;
  repetitions: number;
  status: 'learning' | 'mastered';
}

// SuperMemo-2 Spaced Repetition Engine
function calculateSM2(
  quality: number, 
  currentInterval: number, 
  currentEase: number, 
  currentReps: number
): SM2Result {
  let interval = currentInterval || 0;
  let easeFactor = currentEase || 2.5;
  let repetitions = currentReps || 0;
  let status: 'learning' | 'mastered' = 'learning';

  // Normalize quality rating:
  // 0: Tekrar / Unuttum
  // 1: Zor / Zorlandım
  // 2: İyi / Bildim
  // 3 or 4 or 5: Kolay / Mükemmel
  if (quality === 0) {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.20);
    status = 'learning';
  } else if (quality === 1) {
    repetitions += 1;
    interval = interval <= 1 ? 1 : Math.round(interval * 1.2);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    status = 'learning';
  } else if (quality === 2) {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    status = repetitions >= 3 ? 'mastered' : 'learning';
  } else {
    // Quality >= 3 (Kolay)
    repetitions += 1;
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    if (repetitions === 1) {
      interval = 3;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor * 1.3);
    }
    status = repetitions >= 2 ? 'mastered' : 'learning';
  }

  return {
    interval: Math.max(1, interval),
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    status
  };
}

async function handleReviewRequest(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json();
    const cardId = body.cardId || body.id;
    const quality = body.quality !== undefined ? Number(body.quality) : 2;

    if (!cardId) {
      return NextResponse.json({ error: 'cardId zorunludur' }, { status: 400 });
    }

    // 1. Fetch current progress if exists
    const existingProgress = await db.prepare(`
      SELECT * FROM flashcards_progress WHERE card_id = ? AND user_id = ?
    `).get(cardId, userId) as any;

    const currentInterval = existingProgress?.interval || 0;
    const currentEase = existingProgress?.ease_factor || 2.5;
    const currentReps = existingProgress?.repetitions || 0;
    const currentReviewCount = (existingProgress?.review_count || 0) + 1;

    // 2. Calculate next review schedule
    const sm2 = calculateSM2(quality, currentInterval, currentEase, currentReps);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + sm2.interval);
    const nextReviewIso = nextDate.toISOString();

    const progressId = existingProgress?.id || uuidv4();

    // 3. Atomic Upsert on (user_id, card_id)
    await db.prepare(`
      INSERT INTO flashcards_progress (
        id, user_id, card_id, status, next_review_date, 
        interval, ease_factor, repetitions, review_count, last_reviewed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, card_id) DO UPDATE SET
        status = EXCLUDED.status,
        next_review_date = EXCLUDED.next_review_date,
        interval = EXCLUDED.interval,
        ease_factor = EXCLUDED.ease_factor,
        repetitions = EXCLUDED.repetitions,
        review_count = flashcards_progress.review_count + 1,
        last_reviewed = CURRENT_TIMESTAMP
    `).run(
      progressId,
      userId,
      cardId,
      sm2.status,
      nextReviewIso,
      sm2.interval,
      sm2.easeFactor,
      sm2.repetitions,
      currentReviewCount
    );

    // 4. Award XP (+5) to student stats
    try {
      await db.prepare(`
        UPDATE user_stats 
        SET xp = COALESCE(xp, 0) + 5,
            last_active = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(userId);
    } catch (_) {
      // Ignore if user_stats doesn't exist
    }

    return NextResponse.json({
      success: true,
      cardId,
      status: sm2.status,
      interval: sm2.interval,
      easeFactor: sm2.easeFactor,
      repetitions: sm2.repetitions,
      nextReviewDate: nextReviewIso,
      xpGained: 5
    }, { status: 200 });
  } catch (error) {
    console.error('Flashcards Review Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handleReviewRequest(req);
}

export async function PUT(req: Request) {
  return handleReviewRequest(req);
}
