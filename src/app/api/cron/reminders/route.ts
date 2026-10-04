import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { sendSmartPushToUser, isWithinQuietHours } from '@/lib/push-notifications';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Cron Security check
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (process.env.NODE_ENV === 'production' && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const now = new Date();
    // Turkey time is UTC+3
    const trHour = (now.getUTCHours() + 3) % 24;

    let morningRemindersSent = 0;
    let streakWarningsSent = 0;
    let homeworkRemindersSent = 0;
    let skippedQuietHours = 0;

    // Genel gece sessizliği kontrolü (23:00 - 07:30 arası toplu hatırlatıcıları durdur)
    if (isWithinQuietHours('23:00', '07:30', now)) {
      return NextResponse.json({
        success: true,
        message: 'Sessiz saatler (gece dinlenme periyodu) aktif, otomatik hatırlatıcı gönderilmedi.',
        trHour,
        skippedQuietHours: true,
      });
    }

    // ─── 1. Sabah Hatırlatıcısı (07:30 - 10:30 arası) ─────────────────
    if (trHour >= 7 && trHour <= 10) {
      // Find students who haven't received a morning reminder today
      const eligibleStudents = await db.prepare(`
        SELECT u.id, u.username
        FROM users u
        LEFT JOIN user_notification_settings s ON u.id = s.user_id
        WHERE u.role = 'ogrenci'
          AND (s.notif_daily_reminder IS NULL OR s.notif_daily_reminder = true)
          AND NOT EXISTS (
            SELECT 1 FROM user_notifications un
            WHERE un.user_id = u.id
              AND un.type = 'morning_plan'
              AND un.created_at::date = CURRENT_DATE
          )
        LIMIT 50
      `).all() as any[];

      for (const st of eligibleStudents) {
        const notifTitle = '☀️ Günaydın! Günlük YKS Hedefin Seni Bekliyor 🎯';
        const notifBody = `Merhaba ${st.username || 'Öğrenci'}! Bugün odaklanma süreni başlat, hedefine bir adım daha yaklaş.`;

        const res = await sendSmartPushToUser(st.id, {
          title: notifTitle,
          body: notifBody,
          url: '/dashboard?tab=focus',
          tag: 'morning-reminder',
          actions: [{ action: 'open', title: '🚀 Odaklan' }]
        }, {
          category: 'daily_reminder',
          isAutomated: true,
          type: 'morning_plan',
          icon: '☀️',
          url: '/dashboard?tab=focus'
        });

        if (res.pushSent) morningRemindersSent++;
        if (res.reason === 'quiet_hours') skippedQuietHours++;
      }
    }

    // ─── 2. Akşam Seri (Streak) Koruyucusu (19:00 - 22:45 arası) ──────
    if (trHour >= 19 && trHour <= 22) {
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
        const notifBody = `${st.username}, serin gece yarısı sonlanabilir! 1 soru çöz veya 10 dk odaklan, serini kurtar! ⭐`;

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
        if (res.reason === 'quiet_hours') skippedQuietHours++;
      }
    }

    // ─── 3. Ödev Teslimine 24 Saat / 3 Saat Kalan Hatırlatıcılar ───────
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
        url: '/odevlerim',
        tag: `hw-due-${hw.assignment_id}`,
        actions: [{ action: 'open', title: '📋 Ödeve Git' }]
      }, {
        category: 'homework',
        isAutomated: true,
        type: 'homework',
        icon: '⏳',
        url: '/odevlerim'
      });

      if (res.pushSent) homeworkRemindersSent++;
      if (res.reason === 'quiet_hours') skippedQuietHours++;
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      trHour,
      results: {
        morningRemindersSent,
        streakWarningsSent,
        homeworkRemindersSent,
        skippedQuietHours,
      }
    });

  } catch (error: any) {
    console.error('Cron Reminders Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
