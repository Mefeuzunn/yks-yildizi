import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });

    const teacher = await db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacherId) as any;
    if (!teacher || teacher.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0');

    if (!classId) return NextResponse.json({ error: 'classId gerekli' }, { status: 400 });

    // Hedef haftanın başlangıç ve bitiş tarihleri
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - weekOffset * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Kaydedilmiş rapor var mı?
    const savedReport = await db.prepare(`
      SELECT * FROM class_weekly_reports
      WHERE class_id = ? AND week_start >= ? AND week_start < ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(classId, weekStartStr, weekEndStr) as any;

    if (savedReport) {
      return NextResponse.json({
        success: true,
        isLive: false,
        report: {
          week_start: savedReport.week_start,
          week_end: savedReport.week_end,
          top_weaknesses: typeof savedReport.top_weaknesses === 'string'
            ? JSON.parse(savedReport.top_weaknesses) : savedReport.top_weaknesses,
          top_improvers: typeof savedReport.top_improvers === 'string'
            ? JSON.parse(savedReport.top_improvers) : savedReport.top_improvers,
          active_student_rate: savedReport.active_student_rate,
          ai_recommendations: typeof savedReport.ai_recommendations === 'string'
            ? JSON.parse(savedReport.ai_recommendations) : savedReport.ai_recommendations,
        }
      });
    }

    // Canlı hesaplama (kayıtlı rapor yoksa)
    const intervalClause = weekOffset === 0
      ? `AND el.created_at >= NOW() - INTERVAL '7 days'`
      : `AND el.created_at BETWEEN '${weekStartStr}' AND '${weekEndStr}'`;

    const topWeaknesses = await db.prepare(`
      SELECT el.subject, el.topic, COUNT(*) as error_count,
             COUNT(DISTINCT el.user_id) as affected_students
      FROM error_log el
      JOIN class_students cs ON el.user_id = cs.student_id
      WHERE cs.class_id = ? ${intervalClause}
      GROUP BY el.subject, el.topic
      ORDER BY error_count DESC
      LIMIT 5
    `).all(classId) as any[];

    const topImprovers = await db.prepare(`
      SELECT u.username, COALESCE(us.xp, 0) as xp
      FROM class_students cs
      JOIN users u ON cs.student_id = u.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE cs.class_id = ?
      ORDER BY us.xp DESC NULLS LAST
      LIMIT 3
    `).all(classId) as any[];

    const totalStudents = await db.prepare(
      'SELECT COUNT(*) as cnt FROM class_students WHERE class_id = ?'
    ).get(classId) as any;

    const activeStudents = await db.prepare(`
      SELECT COUNT(DISTINCT u.id) as cnt
      FROM class_students cs
      JOIN users u ON cs.student_id = u.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE cs.class_id = ?
        AND us.last_active >= NOW() - INTERVAL '7 days'
    `).get(classId) as any;

    const total = totalStudents?.cnt || 1;
    const active = activeStudents?.cnt || 0;
    const activeRate = (active / total) * 100;

    return NextResponse.json({
      success: true,
      isLive: true,
      report: {
        week_start: weekStartStr,
        week_end: weekEndStr,
        top_weaknesses: topWeaknesses,
        top_improvers: topImprovers,
        active_student_rate: activeRate,
        ai_recommendations: []
      }
    });

  } catch (error: any) {
    console.error('Weekly Report API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
