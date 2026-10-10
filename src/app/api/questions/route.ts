import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Fetch from database dynamically
    const { searchParams } = new URL(req.url, 'http://localhost');
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10') || 10, 1), 50);
    
    let query = 'SELECT * FROM questions';
    let params: any[] = [];
    const conds: string[] = [];
    
    if (subject && subject !== 'all') {
      conds.push('(LOWER(subject) = LOWER(?) OR LOWER(subject) LIKE ?)');
      params.push(subject, `%${subject.toLowerCase()}%`);
    }
    if (topic && topic !== 'all') {
      conds.push('(LOWER(topic) = LOWER(?) OR LOWER(topic) LIKE ?)');
      params.push(topic, `%${topic.toLowerCase()}%`);
    }
    
    if (conds.length > 0) {
      query += ' WHERE ' + conds.join(' AND ');
    }
    query += ' ORDER BY RANDOM() LIMIT ?';
    params.push(limit);
    
    let dbQuestions = await db.prepare(query).all(...params) as any[];
    
    // If topic yielded no results but subject was given, fallback to subject
    if (dbQuestions.length === 0 && subject && subject !== 'all' && topic) {
      dbQuestions = await db.prepare(`SELECT * FROM questions WHERE (LOWER(subject) = LOWER(?) OR LOWER(subject) LIKE ?) ORDER BY RANDOM() LIMIT ?`).all(subject, `%${subject.toLowerCase()}%`, limit) as any[];
    }
    // If still 0, fallback to general
    if (dbQuestions.length === 0) {
      dbQuestions = await db.prepare('SELECT * FROM questions ORDER BY RANDOM() LIMIT ?').all(limit) as any[];
    }
    
    // Parse options
    const mappedQuestions = dbQuestions.map(q => {
      let optionsObj: Record<string, string> = {};
      try {
        optionsObj = typeof q.options_json === 'string' ? JSON.parse(q.options_json) : (q.options_json || {});
      } catch (_) {}
      
      const letters = ['A', 'B', 'C', 'D', 'E'];
      const optionsArray = Object.keys(optionsObj).length > 0
        ? letters.map(l => optionsObj[l] || '').filter(Boolean)
        : (Array.isArray(q.options_json) ? q.options_json : ['A', 'B', 'C', 'D', 'E']);
        
      const correctLetter = (q.correct_option || 'A').toUpperCase();
      const correctIdx = letters.indexOf(correctLetter) >= 0 ? letters.indexOf(correctLetter) : 0;
      
      return {
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        text: q.text,
        options: optionsArray,
        optionsMap: optionsObj,
        correctOption: correctLetter,
        correctAnswer: correctIdx,
        difficulty: q.difficulty,
        explanation: q.explanation || ''
      };
    });

    return NextResponse.json({ success: true, questions: mappedQuestions }, { status: 200 });

  } catch (error) {
    console.error('Questions GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
