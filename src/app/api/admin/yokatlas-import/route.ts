import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, data } = body;

    if (!year || !data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı. year ve data dizisi gerekli.' }, { status: 400 });
    }

    // SQLite Batch Insert
    await db.transaction(async () => {
      // Prepared statements for speed
      const insertUni = await db.prepare('INSERT OR IGNORE INTO universities (id, name, type, city) VALUES (?, ?, ?, ?)');
      const checkUni = await db.prepare('SELECT id FROM universities WHERE name = ?');
      const insertDep = await db.prepare('INSERT INTO departments (id, uni_id, name, faculty, score_type, base_score, ranking, quota, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

      // We need to deduplicate universities from the data array
      // A simple map to keep track of uni names to their generated UUIDs
      const uniMap = new Map<string, string>();

      for (const row of data) {
        if (!row.uni_name || !row.dep_name) continue; // Changed return to continue since it's a for loop now

        let uniId = uniMap.get(row.uni_name);
        if (!uniId) {
          // Check DB just in case it exists from a previous upload
          const existing = await checkUni.get(row.uni_name) as { id: string } | undefined;
          if (existing) {
            uniId = existing.id;
          } else {
            uniId = uuidv4();
            await insertUni.run(uniId, row.uni_name, row.uni_type || 'Devlet', row.city || 'Belirtilmedi');
          }
          uniMap.set(row.uni_name, uniId);
        }

        await insertDep.run(
          uuidv4(),
          uniId,
          row.dep_name,
          row.faculty || '',
          row.score_type || 'TYT',
          Number(row.base_score) || 0,
          Number(row.ranking) || 0,
          Number(row.quota) || 0,
          year
        );
      }
    })(); // Execute the transaction callback

    return NextResponse.json({ success: true, message: `${data.length} kayıt başarıyla içe aktarıldı.` }, { status: 200 });
  } catch (error: any) {
    console.error('YOK Atlas Import Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
  }
}
