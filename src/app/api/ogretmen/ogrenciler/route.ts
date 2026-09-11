import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let students: any[];

    if (classId) {
      // Verify this class belongs to the teacher
      const cls = await db.prepare(
        'SELECT id FROM teacher_classes WHERE id = ? AND teacher_id = ?'
      ).get(classId, user.id) as any;

      if (!cls) {
        return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });
      }

      students = await db.prepare(`
        SELECT u.username, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0) as solved_questions,
               COALESCE(us.success_rate, 0) as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0) as league_points,
               COALESCE(us.streak_days, 0) as streak_days
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE cs.class_id = ?
        ORDER BY u.username ASC
      `).all(classId) as any[];
    } else {
      // All students across all teacher's classes
      students = await db.prepare(`
        SELECT DISTINCT u.username, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0) as solved_questions,
               COALESCE(us.success_rate, 0) as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0) as league_points,
               COALESCE(us.streak_days, 0) as streak_days
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE tc.teacher_id = ?
        ORDER BY u.username ASC
      `).all(user.id) as any[];
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Öğrenciler listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
