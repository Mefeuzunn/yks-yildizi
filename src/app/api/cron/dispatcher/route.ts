import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { sendSmartPushToUser, isWithinQuietHours } from '@/lib/push-notifications';
import { generateFlashcardsBatch, saveFlashcardsToDB } from '@/lib/content-factory';
import { YKS_CURRICULUM_TAXONOMY } from '@/lib/curriculum-taxonomy';

export const dynamic = 'force-dynamic';

/**
 * Master Cron Dispatcher for Vercel Hobby Plan (1 cron job limit).
 * Runs daily at 15:00 UTC (18:00 TR).
 * 
 * Functions performed:
 * 1. Daily Study Reminders & Evening Streak Guardian (Streak uyarısı)
 * 2. Homework Due-Date Approaching Reminders (24h / 3h)
 * 3. Sunday Weekly Class Reports & Teacher Digests (Pazar 18:00 TR)
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    // Turkey is UTC+3
    const trDay = (now.getUTCDay() + (now.getUTCHours() + 3 >= 24 ? 1 : 0)) % 7;
    const trHour = (now.getUTCHours() + 3) % 24;

    const summary: Record<string, any> = {
      timestamp: now.toISOString(),
      trHour,
      trDay,
      tasksExecuted: [],
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // 1. STREAK GUARDIAN & AKŞAM HATIRLATICILARI (Daily)
    // ─────────────────────────────────────────────────────────────────────────────
    if (!isWithinQuietHours('23:00', '07:30', now)) {
      let streakWarningsSent = 0;
      let homeworkRemindersSent = 0;

      // Soru çözmemiş ve serisi bozulma tehlikesinde olan öğrenciler
      const endangeredStreaks = await db.prepare(`
        SELECT u.id, u.username, st.streak_days
        FROM users u
        JOIN user_stats st ON u.id = st.user_id
        LEFT JOIN user_notification_settings s ON u.id = s.user_id
        WHERE u.role = 'ogrenci'
          AND st.streak_days >= 1
          AND (st.last_active IS NULL OR st.last_active::date < CURRENT_DATE)
          AND (s.notif_streak_warning IS NULL OR s.notif_streak_warning = true)
          AND NOT EXISTS (
            SELECT 1 FROM user_notifications un
            WHERE un.user_id = u.id
              AND un.type = 'streak_alert'
              AND un.created_at::date = CURRENT_DATE
          )
        LIMIT 50
      `).all() as any[];

      for (const st of endangeredStreaks) {
        const notifTitle = `🔥 ${st.streak_days} Günlük Serin Tehlikede!`;
        const notifBody = `${st.username || 'Şampiyon'}, serin bu gece sonlanabilir! 1 soru çöz veya 10 dk odaklan, serini kurtar! ⭐`;

        const res = await sendSmartPushToUser(st.id, {
          title: notifTitle,
          body: notifBody,
          url: '/dashboard?tab=focus',
          tag: 'streak-guardian',
          actions: [{ action: 'open', title: '🔥 Seriyi Kurtar' }]
        }, {
          category: 'streak_warning',
          isAutomated: true,
          type: 'streak_alert',
          icon: '🔥',
          url: '/dashboard?tab=focus'
        });

        if (res.pushSent) streakWarningsSent++;
      }

      // ─────────────────────────────────────────────────────────────────────────
      // 2. ÖDEV TESLİM HATIRLATMALARI (Son 24 saat kalanlar)
      // ─────────────────────────────────────────────────────────────────────────
      const dueAssignments = await db.prepare(`
        SELECT asub.student_id, a.id as assignment_id, a.title, a.due_date, u.username
        FROM assignment_submissions asub
        JOIN assignments a ON asub.assignment_id = a.id
        JOIN users u ON asub.student_id = u.id
        LEFT JOIN user_notification_settings s ON asub.student_id = s.user_id
        WHERE (asub.status = 'pending' OR asub.status IS NULL)
          AND a.due_date IS NOT NULL
          AND a.due_date > NOW()
          AND a.due_date < NOW() + INTERVAL '24 hours'
          AND (s.notif_homework IS NULL OR s.notif_homework = true)
          AND NOT EXISTS (
            SELECT 1 FROM user_notifications un
            WHERE un.user_id = asub.student_id
              AND un.url LIKE '%' || a.id || '%'
              AND un.created_at > NOW() - INTERVAL '12 hours'
          )
        LIMIT 40
      `).all() as any[];

      for (const hw of dueAssignments) {
        const remainingHours = Math.max(1, Math.round((new Date(hw.due_date).getTime() - Date.now()) / (1000 * 60 * 60)));
        const notifTitle = `⏳ Ödev Teslimine Son ${remainingHours} Saat!`;
        const notifBody = `"${hw.title}" ödevini sisteme yüklemeyi unutma. Başarılar dileriz! 📋`;

        const res = await sendSmartPushToUser(hw.student_id, {
          title: notifTitle,
          body: notifBody,
          url: '/dashboard',
          tag: `hw-due-${hw.assignment_id}`,
          actions: [{ action: 'open', title: '📋 Ödeve Git' }]
        }, {
          category: 'homework',
          isAutomated: true,
          type: 'homework',
          icon: '⏳',
          url: '/dashboard'
        });

        if (res.pushSent) homeworkRemindersSent++;
      }

      summary.reminders = {
        streakWarningsSent,
        homeworkRemindersSent,
      };
      summary.tasksExecuted.push('daily_reminders');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // 3. HAFTALIK SINIF RAPORU (Her Pazar saat 18:00 TR)
    // ─────────────────────────────────────────────────────────────────────────────
    // trDay === 0 -> Pazar
    if (trDay === 0) {
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

      let reportsProcessed = 0;

      for (const cls of classes) {
        try {
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

          const topImprovers = await db.prepare(`
            SELECT u.id as student_id, u.username,
                   COALESCE(us.league_points, 0) as league_points,
                   COALESCE(us.solved_questions, 0) as solved_questions
            FROM class_students cs
            JOIN users u ON cs.student_id = u.id
            LEFT JOIN user_stats us ON us.user_id = u.id
            WHERE cs.class_id = ?
            ORDER BY us.league_points DESC NULLS LAST
            LIMIT 3
          `).all(cls.class_id) as any[];

          const totalStudentRow = await db.prepare(
            `SELECT COUNT(*) as cnt FROM class_students WHERE class_id = ?`
          ).get(cls.class_id) as any;
          const totalStudents = totalStudentRow?.cnt || 0;

          const activeStudentRow = await db.prepare(`
            SELECT COUNT(DISTINCT user_id) as cnt
            FROM error_log el
            JOIN class_students cs ON el.user_id = cs.student_id
            WHERE cs.class_id = ? AND el.created_at >= NOW() - INTERVAL '7 days'
          `).get(cls.class_id) as any;
          const activeStudents = activeStudentRow?.cnt || 0;
          const activeStudentRate = totalStudents > 0
            ? Math.round((activeStudents / totalStudents) * 1000) / 10
            : 0;

          const aiRecommendations = topWeaknesses.slice(0, 3).map((w: any) => ({
            topic: `${w.subject} - ${w.topic}`,
            errorCount: w.error_count,
            affectedStudents: w.affected_students,
            suggestedAction: `"${w.subject} - ${w.topic}" konusunda ${w.affected_students} öğrenci hata yaptı. Bu konuya özel bir ödev veya pekiştirme testi atayabilirsiniz.`
          }));

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
            activeStudentRate,
            JSON.stringify(aiRecommendations)
          );

          reportsProcessed++;
        } catch (innerErr) {
          console.error(`Weekly report generation error for class ${cls.class_id}:`, innerErr);
        }
      }

      summary.weeklyReports = { reportsProcessed, totalClasses: classes.length };
      summary.tasksExecuted.push('weekly_reports');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. OTONOM AI İÇERİK FABRİKASI (Autonomous Daily Curriculum Replenishment)
    // ─────────────────────────────────────────────────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      try {
        // En az bilgi kartına sahip veya son 7 günde en çok hata yapılan konuyu tespit et
        const weakestSubjectTopic = await db.prepare(`
          SELECT el.subject, el.topic, COUNT(*) as err_count
          FROM error_log el
          WHERE el.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY el.subject, el.topic
          ORDER BY err_count DESC
          LIMIT 1
        `).get() as any;

        let targetSubject = weakestSubjectTopic?.subject;
        let targetTopic = weakestSubjectTopic?.topic;
        let category: 'TYT' | 'AYT' | 'TYT/AYT' = 'TYT/AYT';

        const subjects = Object.keys(YKS_CURRICULUM_TAXONOMY);
        if (!targetSubject || !YKS_CURRICULUM_TAXONOMY[targetSubject]) {
          targetSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const meta = YKS_CURRICULUM_TAXONOMY[targetSubject];
          targetTopic = meta.topics[Math.floor(Math.random() * meta.topics.length)];
          category = meta.category;
        } else {
          category = YKS_CURRICULUM_TAXONOMY[targetSubject].category;
          if (!targetTopic) {
            const meta = YKS_CURRICULUM_TAXONOMY[targetSubject];
            targetTopic = meta.topics[0];
          }
        }

        const generatedCards = await generateFlashcardsBatch({
          subject: targetSubject,
          topic: targetTopic,
          category,
          count: 10,
        });

        if (generatedCards.length > 0) {
          const savedCount = await saveFlashcardsToDB(generatedCards);
          summary.contentFactory = {
            status: 'success',
            subject: targetSubject,
            topic: targetTopic,
            cardsGenerated: savedCount,
            reason: weakestSubjectTopic?.err_count ? 'weak_topic_booster' : 'curriculum_expansion',
          };
          summary.tasksExecuted.push('autonomous_content_factory');
        }
      } catch (cfErr: any) {
        console.error('Autonomous Content Factory cron error:', cfErr);
        summary.contentFactory = { status: 'error', error: cfErr?.message };
      }
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error('Master Cron Dispatcher Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
