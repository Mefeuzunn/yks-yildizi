import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const scoreType = searchParams.get('scoreType') || '';
    const city = searchParams.get('city') || '';
    const uniType = searchParams.get('uniType') || '';
    const sortBy = searchParams.get('sortBy') || 'base_score_desc';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '60') || 60, 10), 100);

    let query = `
      SELECT d.*, u.name as uni_name, u.city, u.type as uni_type
      FROM departments d
      JOIN universities u ON d.uni_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      query += ` AND (d.name ILIKE ? OR u.name ILIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }
    
    if (scoreType && scoreType !== 'all') {
      query += ` AND d.score_type = ?`;
      params.push(scoreType);
    }
    
    if (city && city !== 'all') {
      query += ` AND u.city = ?`;
      params.push(city);
    }

    if (uniType && uniType !== 'all') {
      query += ` AND u.type = ?`;
      params.push(uniType);
    }

    if (sortBy === 'ranking_asc') {
      query += ` ORDER BY CASE WHEN d.ranking > 0 THEN d.ranking ELSE 9999999 END ASC LIMIT ?`;
    } else if (sortBy === 'name_asc') {
      query += ` ORDER BY d.name ASC LIMIT ?`;
    } else {
      query += ` ORDER BY d.base_score DESC LIMIT ?`;
    }
    params.push(limit);

    const results = await db.prepare(query).all(...params) as any[];

    return NextResponse.json({ success: true, departments: results }, { status: 200 });

  } catch (error) {
    console.error('Universities Search Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
