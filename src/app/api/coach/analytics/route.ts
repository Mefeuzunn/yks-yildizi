import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Seed dummy mock exams if none exist to demonstrate charts
    const examCount = await db.prepare('SELECT COUNT(*) as c FROM mock_exams WHERE user_id = ?').get(sessionId) as any;
    
    if (examCount.c === 0) {
      const dummyExams = [
        { name: 'Oca', turkish: 25, math: 15, social: 12, science: 8, total: 60 },
        { name: 'Şub', turkish: 28, math: 18, social: 14, science: 10, total: 70 },
        { name: 'Mar', turkish: 30, math: 22, social: 15, science: 12, total: 79 },
        { name: 'Nis', turkish: 32, math: 25, social: 16, science: 14, total: 87 },
      ];

      const insert = await db.prepare(`
        INSERT INTO mock_exams (user_id, exam_type, exam_name, turkish_net, math_net, social_net, science_net, total_net) 
        VALUES (?, 'TYT', ?, ?, ?, ?, ?, ?)
      `);

      await db.transaction(async () => {
        dummyExams.forEach(e => insert.run(sessionId, e.name, e.turkish, e.math, e.social, e.science, e.total));
      })();
    }

    // Fetch actual data
    const exams = await db.prepare('SELECT * FROM mock_exams WHERE user_id = ? AND exam_type = "TYT" ORDER BY id ASC').all(sessionId) as any[];

    // Transform for line chart
    const trendData = exams.map(e => ({
      name: e.exam_name || 'Deneme',
      net: e.total_net
    }));

    // Transform for radar chart (average of latest 3 exams if available, otherwise just use latest)
    let mathAvg = 0, turkAvg = 0, socAvg = 0, sciAvg = 0;
    const recent = exams.slice(-3);
    if (recent.length > 0) {
      mathAvg = recent.reduce((sum, e) => sum + e.math_net, 0) / recent.length;
      turkAvg = recent.reduce((sum, e) => sum + e.turkish_net, 0) / recent.length;
      socAvg = recent.reduce((sum, e) => sum + e.social_net, 0) / recent.length;
      sciAvg = recent.reduce((sum, e) => sum + e.science_net, 0) / recent.length;
    }

    // Convert max limits for radar (TYT: Turk 40, Math 40, Soc 20, Sci 20)
    const radarData = [
      { subject: 'Türkçe', A: turkAvg, fullMark: 40 },
      { subject: 'Matematik', A: mathAvg, fullMark: 40 },
      { subject: 'Sosyal', A: socAvg, fullMark: 20 },
      { subject: 'Fen', A: sciAvg, fullMark: 20 }
    ];

    return NextResponse.json({
      trendData,
      radarData
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
