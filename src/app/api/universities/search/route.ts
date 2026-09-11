import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const scoreType = searchParams.get('scoreType') || '';
    const city = searchParams.get('city') || '';

    let query = `
      SELECT d.*, u.name as uni_name, u.city, u.type as uni_type
      FROM departments d
      JOIN universities u ON d.uni_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      query += ` AND (d.name LIKE ? OR u.name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (scoreType) {
      query += ` AND d.score_type = ?`;
      params.push(scoreType);
    }
    
    if (city) {
      query += ` AND u.city = ?`;
      params.push(city);
    }

    query += ` ORDER BY d.base_score DESC LIMIT 50`;

    const results = await db.prepare(query).all(...params) as any[];

    return NextResponse.json({ success: true, departments: results }, { status: 200 });

  } catch (error) {
    console.error('Universities Search Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
