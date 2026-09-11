import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let students: any[];

    if (classId) {
      students = await db.prepare(`
        SELECT u.id, u.username, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0) as solved_questions,
               COALESCE(us.success_rate, 0) as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0) as league_points,
               COALESCE(us.streak_days, 0) as streak_days,
               cs.class_id
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE cs.class_id = ?
        ORDER BY u.username ASC
      `).all(classId) as any[];
    } else {
      // Get ALL students connected to this teacher
      students = await db.prepare(`
        SELECT DISTINCT u.id, u.username, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0) as solved_questions,
               COALESCE(us.success_rate, 0) as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0) as league_points,
               COALESCE(us.streak_days, 0) as streak_days,
               cs.class_id
        FROM users u
        JOIN teacher_students ts ON u.id = ts.student_id
        LEFT JOIN class_students cs ON u.id = cs.student_id AND cs.class_id IN (SELECT id FROM teacher_classes WHERE teacher_id = ?)
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE ts.teacher_id = ?
        ORDER BY u.username ASC
      `).all(user.id, user.id) as any[];
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Öğrenciler listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
