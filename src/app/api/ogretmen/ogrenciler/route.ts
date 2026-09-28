import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(request);
    if (!teacherId) return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });

    const user = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!user || user.role !== 'ogretmen') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    let students: any[];

    if (classId && classId !== 'all') {
      // Belirli bir sınıfın öğrencilerini getir (yalnızca bu öğretmenin sınıfı ise)
      students = await db.prepare(`
        SELECT u.id, u.username, u.email, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0)::int as solved_questions,
               COALESCE(us.success_rate, 0)::float as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0)::int as league_points,
               COALESCE(us.streak_days, 0)::int as streak_days,
               cs.class_id,
               tc.class_name,
               COALESCE(afs.last_heartbeat >= NOW() - INTERVAL '2 minutes', false) as is_live_active,
               COALESCE(afs.status, 'idle') as active_status,
               afs.mode as active_mode,
               afs.subject as active_subject,
               afs.topic as active_topic,
               afs.duration_min as active_duration_min,
               afs.started_at as active_started_at,
               afs.time_left_sec as active_time_left_sec,
               GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - afs.started_at)) / 60))::int as focus_elapsed_min
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        LEFT JOIN user_stats us ON u.id = us.user_id
        LEFT JOIN active_focus_sessions afs ON u.id = afs.user_id 
          AND afs.last_heartbeat >= NOW() - INTERVAL '2 minutes'
        WHERE tc.teacher_id = ? AND cs.class_id = ?
        ORDER BY is_live_active DESC, u.username ASC
      `).all(teacherId, classId) as any[];
    } else {
      // Öğretmenin kayıtlı olduğu TÜM sınıflardaki öğrencileri getir
      students = await db.prepare(`
        SELECT u.id, u.username, u.email, u.alan, u.sinif,
               COALESCE(us.solved_questions, 0)::int as solved_questions,
               COALESCE(us.success_rate, 0)::float as success_rate,
               COALESCE(us.league, 'Bronz') as league,
               COALESCE(us.league_points, 0)::int as league_points,
               COALESCE(us.streak_days, 0)::int as streak_days,
               STRING_AGG(DISTINCT tc.class_name, ', ') as class_names,
               MAX(cs.class_id) as class_id,
               COALESCE(BOOL_OR(afs.last_heartbeat >= NOW() - INTERVAL '2 minutes'), false) as is_live_active,
               MAX(COALESCE(afs.status, 'idle')) as active_status,
               MAX(afs.mode) as active_mode,
               MAX(afs.subject) as active_subject,
               MAX(afs.topic) as active_topic,
               MAX(afs.duration_min) as active_duration_min,
               MAX(afs.started_at) as active_started_at,
               MAX(afs.time_left_sec) as active_time_left_sec,
               GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(afs.started_at))) / 60))::int as focus_elapsed_min
        FROM users u
        JOIN class_students cs ON u.id = cs.student_id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        LEFT JOIN user_stats us ON u.id = us.user_id
        LEFT JOIN active_focus_sessions afs ON u.id = afs.user_id 
          AND afs.last_heartbeat >= NOW() - INTERVAL '2 minutes'
        WHERE tc.teacher_id = ?
        GROUP BY u.id, u.username, u.email, u.alan, u.sinif, us.solved_questions, us.success_rate, us.league, us.league_points, us.streak_days
        ORDER BY is_live_active DESC, u.username ASC
      `).all(teacherId) as any[];
    }

    return NextResponse.json({ 
      students: (students || []).map(s => {
        const isLive = Boolean(s.is_live_active);
        const liveStatus = isLive ? (s.active_status || 'focusing') : 'idle';
        return {
          ...s,
          solved_questions: Number(s.solved_questions) || 0,
          success_rate: Number(s.success_rate) || 0,
          league_points: Number(s.league_points) || 0,
          streak_days: Number(s.streak_days) || 0,
          is_live_focusing: isLive,
          live_status: liveStatus,
          live_mode: isLive ? (s.active_mode || 'pomodoro') : null,
          focus_elapsed_min: isLive ? (Number(s.focus_elapsed_min) || 1) : 0,
          active_time_left_sec: isLive ? (Number(s.active_time_left_sec) || 0) : 0,
        };
      })
    });
  } catch (error: any) {
    console.error('Öğrenciler listeleme hatası:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası' }, { status: 500 });
  }
}
