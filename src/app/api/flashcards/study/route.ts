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

    if (!subject) return NextResponse.json({ error: 'Ders seçimi zorunludur' }, { status: 400 });

    let query = `
      SELECT f.*, p.status, p.next_review_date, p.interval, p.ease_factor
      FROM flashcards f
      LEFT JOIN flashcards_progress p ON f.id = p.card_id AND p.user_id = ?
      WHERE f.user_id = ? AND f.subject = ?
    `;
    const params: any[] = [userId, userId, subject];

    if (topic) {
      query += ` AND f.topic = ?`;
      params.push(topic);
    }

    const cards = await db.prepare(query).all(...params) as any[];

    // Calculate due cards
    const now = new Date().toISOString();
    const dueCards = cards.filter(c => !c.next_review_date || c.next_review_date <= now);

    return NextResponse.json(dueCards, { status: 200 });
  } catch (error) {
    console.error('Flashcards Study GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
