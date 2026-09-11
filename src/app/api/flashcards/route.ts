import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// GET all flashcards grouped by subject and topic
export async function GET(req: Request) {
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

    const cards = await db.prepare(`
      SELECT f.subject, f.topic, f.id as card_id, p.next_review_date
      FROM flashcards f
      LEFT JOIN flashcards_progress p ON f.id = p.card_id AND p.user_id = ?
      WHERE f.user_id = ?
    `).all(sessionId, sessionId) as any[];

    const now = new Date().toISOString();

    // Grouping by Subject -> Topic
    const grouped: Record<string, Record<string, { total: number; due: number }>> = {};

    for (const c of cards) {
      const subject = c.subject || 'Genel';
      const topic = c.topic || 'Genel';
      const isDue = !c.next_review_date || c.next_review_date <= now;

      if (!grouped[subject]) grouped[subject] = {};
      if (!grouped[subject][topic]) {
        grouped[subject][topic] = { total: 0, due: 0 };
      }

      grouped[subject][topic].total += 1;
      if (isDue) grouped[subject][topic].due += 1;
    }

    return NextResponse.json({ grouped }, { status: 200 });
  } catch (error) {
    console.error('Flashcards GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// Create new flashcard
export async function POST(req: Request) {
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

    const { subject, topic, front, back } = await req.json();
    if (!subject || !front || !back) return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 });

    const cardTopic = topic?.trim() || 'Genel';
    const cardId = uuidv4();
    const progressId = uuidv4();

    await db.transaction(async () => {
      // Insert card
      await db.prepare('INSERT INTO flashcards (id, user_id, subject, topic, front_text, back_text) VALUES (?, ?, ?, ?, ?, ?)')
        .run(cardId, sessionId, subject, cardTopic, front, back);
      
      // Initialize progress
      await db.prepare('INSERT INTO flashcards_progress (id, user_id, card_id, status) VALUES (?, ?, ?, ?)')
        .run(progressId, sessionId, cardId, 'new');
    })();

    return NextResponse.json({ success: true, cardId }, { status: 200 });
  } catch (error) {
    console.error('Flashcards POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
