import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const mode = searchParams.get('mode') || 'due'; // 'due' | 'all' | 'learning' | 'mastered'

    let query = `
      SELECT 
        f.id, 
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
        p.review_count,
        p.last_reviewed
      FROM flashcards f
      LEFT JOIN flashcards_progress p ON f.id = p.card_id AND p.user_id = ?
      WHERE (f.user_id = ? OR f.user_id = 'system' OR f.user_id IS NULL)
    `;
    const params: any[] = [userId, userId];

    if (subject && subject !== 'all' && subject !== 'Tümü') {
      query += ` AND f.subject = ?`;
      params.push(subject);
    }

    if (topic && topic !== 'all' && topic !== 'Tümü') {
      query += ` AND f.topic = ?`;
      params.push(topic);
    }

    query += ` ORDER BY p.next_review_date ASC NULLS FIRST, f.id ASC`;

    const allCards = await db.prepare(query).all(...params) as any[];

    const now = new Date();
    let filteredCards = allCards;

    if (mode === 'due') {
      // Filter for cards ready to be reviewed (never reviewed or next_review_date <= now)
      filteredCards = allCards.filter(c => !c.next_review_date || new Date(c.next_review_date) <= now);
      // If there are no due cards in this topic/subject, fall back to all cards for revision practice
      if (filteredCards.length === 0 && allCards.length > 0) {
        filteredCards = allCards;
      }
    } else if (mode === 'learning') {
      filteredCards = allCards.filter(c => c.status === 'learning' || (!c.repetitions || c.repetitions < 3));
    } else if (mode === 'mastered') {
      filteredCards = allCards.filter(c => (c.repetitions && c.repetitions >= 3) || c.status === 'mastered' || c.status === 'learned');
    }

    return NextResponse.json({
      success: true,
      cards: filteredCards,
      totalSubjectCards: allCards.length,
      mode
    }, { status: 200 });
  } catch (error) {
    console.error('Flashcards Study GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
