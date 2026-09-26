import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';

export const dynamic = 'force-dynamic';

// Vercel Cron: Her Pazar 18:00 TR (15:00 UTC) tetiklenir
// vercel.json: { "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 15 * * 0" }] }

export async function GET(req: Request) {
  // Güvenlik: CRON_SECRET kontrolü
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // class_weekly_reports tablosunu oluştur (yoksa)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS class_weekly_reports (
        id SERIAL PRIMARY KEY,
        class_id TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        top_weaknesses JSONB DEFAULT '[]',
        top_improvers JSONB DEFAULT '[]',
        active_student_rate DECIMAL(5,2) DEFAULT 0,
        ai_recommendations JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Tüm öğretmen + sınıf çiftlerini çek
    const classes = await db.prepare(`
      SELECT t.id as teacher_id, t.username, tc.id as class_id, tc.class_name
      FROM users t
      JOIN teacher_classes tc ON tc.teacher_id = t.id
      WHERE t.role = 'ogretmen'
    `).all() as any[];

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = new Date().toISOString().split('T')[0];

    let processed = 0;

    for (const cls of classes) {
      try {
        // 1. Zayıf konular (son 7 gün error_log)
        const topWeaknesses = await db.prepare(`
          SELECT el.subject, el.topic, COUNT(*) as error_count,
                 COUNT(DISTINCT el.user_id) as affected_students
          FROM error_log el
          JOIN class_students cs ON el.user_id = cs.student_id
          WHERE cs.class_id = ?
            AND el.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY el.subject, el.topic
          ORDER BY error_count DESC
          LIMIT 5
        `).all(cls.class_id) as any[];

        // 2. En çok gelişenler (XP/puan artışı)
        const topImprovers = await db.prepare(`
          SELECT u.username, u.id as student_id,
                 COALESCE(us.xp, 0) as xp,
                 COALESCE(us.league_points, 0) as league_points
          FROM class_students cs
          JOIN users u ON cs.student_id = u.id
          LEFT JOIN user_stats us ON u.id = us.user_id
          WHERE cs.class_id = ?
          ORDER BY us.xp DESC NULLS LAST
          LIMIT 3
        `).all(cls.class_id) as any[];

        // 3. Aktif öğrenci oranı (son 7 gün giriş yapan)
        const totalStudents = await db.prepare(`
          SELECT COUNT(*) as cnt FROM class_students WHERE class_id = ?
        `).get(cls.class_id) as any;

        const activeStudents = await db.prepare(`
          SELECT COUNT(DISTINCT u.id) as cnt
          FROM class_students cs
          JOIN users u ON cs.student_id = u.id
          LEFT JOIN user_stats us ON u.id = us.user_id
          WHERE cs.class_id = ?
            AND us.last_active >= NOW() - INTERVAL '7 days'
        `).get(cls.class_id) as any;

        const total = totalStudents?.cnt || 1;
        const active = activeStudents?.cnt || 0;
        const activeRate = (active / total) * 100;

        // 4. AI önerileri oluştur
        const recommendations: any[] = [];
        if (topWeaknesses.length > 0) {
          const top = topWeaknesses[0];
          recommendations.push({
            type: 'odev',
            subject: top.subject,
            topic: top.topic,
            label: `${top.subject} - ${top.topic} konusundan ödev ver`,
            reason: `${top.affected_students} öğrenci bu konuda ${top.error_count} hata yaptı`
          });
        }
        if (activeRate < 50) {
          recommendations.push({
            type: 'engagement',
            label: 'Sınıfı aktif platforma davet et',
            reason: `Geçen hafta öğrencilerin yalnızca %${activeRate.toFixed(0)}'i aktifti`
          });
        }

        // 5. Raporu kaydet (upsert)
        const existing = await db.prepare(`
          SELECT id FROM class_weekly_reports
          WHERE class_id = ? AND week_start = ?
        `).get(cls.class_id, weekStartStr) as any;

        if (existing) {
          await db.prepare(`
            UPDATE class_weekly_reports
            SET top_weaknesses = ?, top_improvers = ?, active_student_rate = ?, ai_recommendations = ?
            WHERE id = ?
          `).run(
            JSON.stringify(topWeaknesses),
            JSON.stringify(topImprovers),
            activeRate,
            JSON.stringify(recommendations),
            existing.id
          );
        } else {
          await db.prepare(`
            INSERT INTO class_weekly_reports
              (class_id, teacher_id, week_start, week_end, top_weaknesses, top_improvers, active_student_rate, ai_recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            cls.class_id,
            cls.teacher_id,
            weekStartStr,
            weekEndStr,
            JSON.stringify(topWeaknesses),
            JSON.stringify(topImprovers),
            activeRate,
            JSON.stringify(recommendations)
          );
        }

        processed++;
      } catch (classErr: any) {
        console.error(`Class ${cls.class_id} rapor hatası:`, classErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      totalClasses: classes.length,
      weekStart: weekStartStr,
      weekEnd: weekEndStr
    });

  } catch (error: any) {
    console.error('Weekly Report Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
