import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET all flashcards grouped by subject and topic with Spaced Repetition stats
export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const cards = await db.prepare(`
      SELECT 
        f.id as card_id, 
        f.subject, 
        f.topic, 
        f.category, 
        f.front_text, 
        f.back_text, 
        f.tip,
        p.status, 
        p.next_review_date, 
        p.interval, 
        p.ease_factor, 
        p.repetitions, 
        p.review_count
      FROM flashcards f
      LEFT JOIN flashcards_progress p ON f.id = p.card_id AND p.user_id = ?
      WHERE f.user_id = ? OR f.user_id = 'system' OR f.user_id IS NULL
      ORDER BY f.subject, f.topic, f.id
    `).all(userId, userId) as any[];

    const now = new Date();

    // Grouping by Subject -> Topic
    const grouped: Record<string, Record<string, { total: number; due: number; mastered: number; learning: number }>> = {};
    let totalCards = 0;
    let totalDue = 0;
    let totalMastered = 0;
    let totalLearning = 0;

    for (const c of cards) {
      const subject = c.subject || 'Genel';
      const topic = c.topic || 'Genel';
      
      const isDue = !c.next_review_date || new Date(c.next_review_date) <= now;
      const isMastered = (c.repetitions && c.repetitions >= 3) || c.status === 'learned' || c.status === 'mastered';
      const isLearning = c.status === 'learning' || (c.review_count && c.review_count > 0 && !isMastered);

      if (!grouped[subject]) grouped[subject] = {};
      if (!grouped[subject][topic]) {
        grouped[subject][topic] = { total: 0, due: 0, mastered: 0, learning: 0 };
      }

      grouped[subject][topic].total += 1;
      totalCards += 1;

      if (isDue) {
        grouped[subject][topic].due += 1;
        totalDue += 1;
      }
      if (isMastered) {
        grouped[subject][topic].mastered += 1;
        totalMastered += 1;
      } else if (isLearning) {
        grouped[subject][topic].learning += 1;
        totalLearning += 1;
      }
    }

    return NextResponse.json({ 
      success: true,
      grouped,
      stats: {
        totalCards,
        totalDue,
        totalMastered,
        totalLearning
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Flashcards GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Create new user-defined flashcard
export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { subject, topic, category, front, back, tip } = await req.json();
    if (!subject || !front || !back) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });

    const cardTopic = topic?.trim() || 'Genel';
    const cardCategory = category || 'TYT/AYT';
    const cardTip = tip?.trim() || '';
    const cardId = uuidv4();
    const progressId = uuidv4();

    await db.transaction(async () => {
      // Insert card
      await db.prepare(`
        INSERT INTO flashcards (id, user_id, subject, topic, category, front_text, back_text, tip) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(cardId, userId, subject, cardTopic, cardCategory, front, back, cardTip);
      
      // Initialize progress
      await db.prepare(`
        INSERT INTO flashcards_progress (id, user_id, card_id, status, next_review_date, interval, ease_factor, repetitions, review_count) 
        VALUES (?, ?, ?, 'new', CURRENT_TIMESTAMP, 0, 2.5, 0, 0)
      `).run(progressId, userId, cardId);
    })();

    return NextResponse.json({ success: true, cardId }, { status: 200 });
  } catch (error) {
    console.error('Flashcards POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
