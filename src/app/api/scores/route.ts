import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

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

    const scores = await db.prepare('SELECT * FROM score_calculations WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    
    const mapped = scores.map(s => ({
      id: s.id,
      title: s.title,
      obp: s.obp,
      tyt_json: JSON.parse(s.tyt_json),
      ayt_json: s.ayt_json ? JSON.parse(s.ayt_json) : null,
      tyt_score: s.tyt_score,
      say_score: s.say_score,
      ea_score: s.ea_score,
      soz_score: s.soz_score,
      dil_score: s.dil_score,
      created_at: s.created_at
    }));

    return NextResponse.json({ success: true, scores: mapped }, { status: 200 });
  } catch (error) {
    console.error('Scores GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const { title, obp, tyt_json, ayt_json, tyt_score, say_score, ea_score, soz_score, dil_score } = body;
    const scoreId = uuidv4();

    const insertScore = await db.prepare(`
      INSERT INTO score_calculations (id, user_id, title, obp, tyt_json, ayt_json, tyt_score, say_score, ea_score, soz_score, dil_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertScore.run(
      scoreId, userId, title || 'Hesaplama', obp, 
      JSON.stringify(tyt_json), 
      ayt_json ? JSON.stringify(ayt_json) : null, 
      tyt_score || 0, say_score || 0, ea_score || 0, soz_score || 0, dil_score || 0
    );

    return NextResponse.json({ success: true, scoreId }, { status: 201 });
  } catch (error) {
    console.error('Score Submission Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
