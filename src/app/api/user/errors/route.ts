import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum, image_data } = body;

    if (!subject || !topic || !icerik || !secenekler_json || !dogru_cevap || !secilen_cevap) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    await db.transaction(async () => {
      // 1. Log in student_mistakes
      await db.prepare(`
        INSERT INTO student_mistakes (user_id, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum, image_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, subject, topic, icerik, secenekler_json, dogru_cevap, secilen_cevap, cozum || '', image_data || null);

      // 2. Sync to error_log (so study plan and coach weaknesses reflect this mistake)
      await db.prepare(`
        INSERT INTO error_log (user_id, subject, topic, question_id)
        VALUES (?, ?, ?, ?)
      `).run(sessionId, subject, topic, `user_error_${uuidv4().substring(0, 8)}`);
    })();

    return NextResponse.json({ success: true, message: 'Hata başarıyla deftere kaydedildi.' });
  } catch (error) {
    console.error('Errors POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const mistakes = await db.prepare(`
      SELECT * FROM student_mistakes 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(sessionId) as any[];

    // Parse options list
    const mapped = mistakes.map(m => ({
      id: m.id,
      subject: m.subject,
      topic: m.topic,
      icerik: m.icerik,
      secenekler: JSON.parse(m.secenekler_json || '[]'),
      dogruCevap: m.dogru_cevap,
      secilenCevap: m.secilen_cevap,
      cozum: m.cozum,
      createdAt: m.created_at,
      imageData: m.image_data
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Errors GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parametresi eksik' }, { status: 400 });
    }

    await db.prepare('DELETE FROM student_mistakes WHERE id = ? AND user_id = ?').run(id, sessionId);
    return NextResponse.json({ success: true, message: 'Hata defterinden silindi.' });
  } catch (error) {
    console.error('Errors DELETE Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
