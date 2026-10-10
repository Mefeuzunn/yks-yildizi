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

    try {
      await db.prepare("ALTER TABLE mock_exams ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'").run();
    } catch (_) {}

    const exams = await db.prepare('SELECT * FROM mock_exams WHERE user_id = ? ORDER BY exam_date ASC').all(userId) as any[];
    
    // CamelCase map
    const mapped = exams.map(e => {
      let parsedDetails = {};
      try {
        parsedDetails = typeof e.details === 'string' ? JSON.parse(e.details) : (e.details || {});
      } catch (_) {}

      return {
        id: e.id,
        name: e.exam_name,
        date: new Date(e.exam_date).toISOString().split('T')[0],
        type: e.exam_type,
        turkishNet: e.turkish_net,
        socialNet: e.social_net,
        mathNet: e.math_net,
        scienceNet: e.science_net,
        totalNet: e.total_net,
        details: parsedDetails
      };
    });

    return NextResponse.json(mapped, { status: 200 });
  } catch (error) {
    console.error('Exams GET Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    try {
      await db.prepare("ALTER TABLE mock_exams ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'").run();
    } catch (_) {}

    const body = await req.json();
    const { 
      exam_type, 
      exam_name, 
      turkish_net = 0, 
      math_net = 0, 
      social_net = 0, 
      science_net = 0, 
      total_net = 0, 
      exam_date,
      details = {}
    } = body;

    const detailsJson = JSON.stringify(details || {});

    const stmt = await db.prepare(`
      INSERT INTO mock_exams (user_id, exam_type, exam_name, turkish_net, math_net, social_net, science_net, total_net, exam_date, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = await stmt.run(
      userId, 
      exam_type, 
      exam_name || `${exam_type} Denemesi`, 
      Number(turkish_net) || 0, 
      Number(math_net) || 0, 
      Number(social_net) || 0, 
      Number(science_net) || 0, 
      Number(total_net) || 0, 
      exam_date || new Date().toISOString(),
      detailsJson
    );

    return NextResponse.json({ success: true, id: info.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('Exams POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID eksik' }, { status: 400 });
    }

    const stmt = await db.prepare('DELETE FROM mock_exams WHERE id = ? AND user_id = ?');
    const info = await stmt.run(id, userId);

    if (info.changes === 0) {
      return NextResponse.json({ error: 'Deneme bulunamadı veya yetkisiz' }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Exams DELETE Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
