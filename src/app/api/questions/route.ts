import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get('yks_session')?.value;

    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        userId = authHeader.substring(7);
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Fetch from database dynamically
    const { searchParams } = new URL(req.url, 'http://localhost');
    const subject = searchParams.get('subject');
    
    let query = 'SELECT * FROM questions ORDER BY RANDOM() LIMIT 10';
    let params: any[] = [];
    
    if (subject) {
      query = 'SELECT * FROM questions WHERE subject = ? ORDER BY RANDOM() LIMIT 10';
      params = [subject];
    }
    
    const dbQuestions = await db.prepare(query).all(...params) as any[];
    
    // Parse JSON options
    const mappedQuestions = dbQuestions.map(q => ({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      text: q.text,
      options: JSON.parse(q.options_json),
      correctOption: q.correct_option,
      difficulty: q.difficulty
    }));

    return NextResponse.json({ success: true, questions: mappedQuestions }, { status: 200 });

  } catch (error) {
    console.error('Questions GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
