import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Fetch actual data
    const exams = await db.prepare("SELECT * FROM mock_exams WHERE user_id = ? AND exam_type = 'TYT' ORDER BY exam_date ASC, id ASC").all(userId) as any[];

    let trendData: any[] = [];
    let radarData: any[] = [];

    if (exams.length > 0) {
      trendData = exams.map(e => ({
        name: e.exam_name || 'Deneme',
        net: Number(e.total_net) || 0
      }));

      const recent = exams.slice(-3);
      const mathAvg = recent.reduce((sum, e) => sum + (Number(e.math_net) || 0), 0) / recent.length;
      const turkAvg = recent.reduce((sum, e) => sum + (Number(e.turkish_net) || 0), 0) / recent.length;
      const socAvg = recent.reduce((sum, e) => sum + (Number(e.social_net) || 0), 0) / recent.length;
      const sciAvg = recent.reduce((sum, e) => sum + (Number(e.science_net) || 0), 0) / recent.length;

      radarData = [
        { subject: 'Türkçe', A: Math.round(turkAvg * 10) / 10, fullMark: 40 },
        { subject: 'Matematik', A: Math.round(mathAvg * 10) / 10, fullMark: 40 },
        { subject: 'Sosyal', A: Math.round(socAvg * 10) / 10, fullMark: 20 },
        { subject: 'Fen', A: Math.round(sciAvg * 10) / 10, fullMark: 20 }
      ];
    } else {
      trendData = [];
      radarData = [
        { subject: 'Türkçe', A: 0, fullMark: 40 },
        { subject: 'Matematik', A: 0, fullMark: 40 },
        { subject: 'Sosyal', A: 0, fullMark: 20 },
        { subject: 'Fen', A: 0, fullMark: 20 }
      ];
    }

    return NextResponse.json({
      trendData,
      radarData,
      hasExams: exams.length > 0
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
