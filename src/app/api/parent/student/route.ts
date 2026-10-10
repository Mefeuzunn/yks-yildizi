import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { rateLimit } from '@/lib/rate-limit';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const limitResult = rateLimit(`parent_login_${ip}`, 15, 60 * 1000);
    
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız. Lütfen bir dakika bekleyin.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const student = await db.prepare(
      "SELECT id, username, alan, sinif FROM users WHERE UPPER(parent_code) = ? AND role = 'ogrenci'"
    ).get(cleanCode) as any;

    if (!student) {
      return NextResponse.json({ error: 'Geçersiz veya bulunamayan veli takip kodu.' }, { status: 404 });
    }

    let stats = null;
    try {
      stats = await db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(student.id) as any;
    } catch (_) {}

    let exams: any[] = [];
    try {
      exams = await db.prepare('SELECT * FROM mock_exams WHERE user_id = ? ORDER BY exam_date ASC').all(student.id) as any[];
    } catch (_) {}
    
    // Timeline Data: Son odaklanma logları
    let timeline: any[] = [];
    try {
      timeline = await db.prepare(`
        SELECT subject, topic, COALESCE(duration_min, duration_minutes, 0) as duration_min, 
               COALESCE(started_at, created_at) as started_at, mode 
        FROM focus_sessions 
        WHERE user_id = ? 
        ORDER BY COALESCE(started_at, created_at) DESC LIMIT 15
      `).all(student.id) as any[];
    } catch (_) {}

    // Subject Focus: Son 7 günde hangi derse kaç dakika çalıştı?
    let subjectFocus: any[] = [];
    try {
      subjectFocus = await db.prepare(`
        SELECT subject, SUM(COALESCE(duration_min, duration_minutes, 0)) as total_min 
        FROM focus_sessions 
        WHERE user_id = ? AND mode = 'pomodoro' AND subject IS NOT NULL 
          AND COALESCE(started_at, created_at) >= CURRENT_TIMESTAMP - INTERVAL '7 days' 
        GROUP BY subject ORDER BY total_min DESC
      `).all(student.id) as any[];
    } catch (_) {}

    // Mistakes Summary: En çok hata yapılan dersler
    let mistakeSummary: any[] = [];
    try {
      mistakeSummary = await db.prepare(`
        SELECT subject, COUNT(*) as mistake_count 
        FROM student_mistakes 
        WHERE user_id = ? 
        GROUP BY subject ORDER BY mistake_count DESC LIMIT 5
      `).all(student.id) as any[];
    } catch (_) {
      try {
        mistakeSummary = await db.prepare(`
          SELECT subject, COUNT(*) as mistake_count 
          FROM error_log 
          WHERE user_id = ? 
          GROUP BY subject ORDER BY mistake_count DESC LIMIT 5
        `).all(student.id) as any[];
      } catch (_) {}
    }

    // Live Focus Status: Öğrenci şu an canlı çalışıyor mu?
    let liveSession = { isLive: false, subject: '', topic: '', mode: 'pomodoro', elapsedMin: 0, durationMin: 25, status: 'idle' };
    try {
      const active = await db.prepare(`
        SELECT subject, topic, mode, duration_min, time_left_sec, status, started_at,
               GREATEST(1, ROUND(EXTRACT(EPOCH FROM (NOW() - started_at)) / 60))::int as elapsed_min
        FROM active_focus_sessions
        WHERE user_id = ? AND last_heartbeat >= NOW() - INTERVAL '2 minutes'
      `).get(student.id) as any;
      if (active) {
        liveSession = {
          isLive: true,
          subject: active.subject || 'Genel Odaklanma',
          topic: active.topic || '',
          mode: active.mode || 'pomodoro',
          elapsedMin: Number(active.elapsed_min) || 1,
          durationMin: Number(active.duration_min) || 25,
          status: active.status || 'focusing',
        };
      }
    } catch (_) {}

    // Today Summary: Bugün kaç dakika odaklandı ve kaç soru çözdü?
    let todaySummary = { focusMinutes: 0, solvedQuestions: 0 };
    try {
      const focusRow = await db.prepare(`
        SELECT COALESCE(SUM(COALESCE(duration_min, duration_minutes, 0)), 0)::int as mins
        FROM focus_sessions
        WHERE user_id = ? AND DATE(COALESCE(started_at, created_at)) = CURRENT_DATE
      `).get(student.id) as any;

      const questionsRow = await db.prepare(`
        SELECT COALESCE(SUM(questions_solved), 0)::int as solved
        FROM daily_stats
        WHERE user_id = ? AND date = CURRENT_DATE
      `).get(student.id) as any;

      todaySummary = {
        focusMinutes: Number(focusRow?.mins) || 0,
        solvedQuestions: Number(questionsRow?.solved) || 0,
      };
    } catch (_) {}

    // Teacher Notes: Çocuğun öğretmenlerinin yazdığı ve veliyle paylaşılan notlar
    let teacherNotes: any[] = [];
    try {
      teacherNotes = await db.prepare(`
        SELECT tsn.id, tsn.note, tsn.category, tsn.created_at,
               u.username as teacher_name, COALESCE(u.brans, 'Öğretmen') as teacher_brans
        FROM teacher_student_notes tsn
        JOIN users u ON tsn.teacher_id = u.id
        WHERE tsn.student_id = ? AND (tsn.is_shared_with_parent = true OR tsn.is_shared_with_parent IS NULL)
        ORDER BY tsn.created_at DESC
        LIMIT 10
      `).all(student.id) as any[];
    } catch (_) {}

    // Maarif Modeli Yetkinlik Puanları
    const streakDays = stats?.streak_days || 0;
    const successRate = stats?.success_rate || 70;
    const totalSolved = stats?.solved_questions || 0;
    const maarifCompetencies = [
      { name: 'Çalışma Azmi & İstikrar', score: Math.min(100, Math.max(25, streakDays * 12 + 30)), icon: '🔥', desc: `${streakDays} Gün Seri` },
      { name: 'Zihinsel Odak & Disiplin', score: Math.min(100, Math.max(30, Math.round(((todaySummary.focusMinutes || 45) / 90) * 100))), icon: '⏱️', desc: 'Pomodoro Düzeni' },
      { name: 'Analitik Problem Çözme', score: Math.min(100, Math.max(20, Math.round(Number(successRate)))), icon: '🎯', desc: `%${successRate} Doğruluk` },
      { name: 'Soru Üretkenliği & Çaba', score: Math.min(100, Math.max(25, Math.min(100, Math.round(totalSolved / 3)))), icon: '📚', desc: `${totalSolved} Toplam Soru` },
    ];

    return NextResponse.json({
      success: true,
      student: { 
        username: student.username, 
        alan: student.alan, 
        sinif: student.sinif, 
        stats: stats || null 
      },
      liveSession,
      todaySummary,
      teacherNotes: teacherNotes || [],
      maarifCompetencies,
      exams: exams || [],
      timeline: timeline || [],
      subjectFocus: subjectFocus || [],
      mistakeSummary: mistakeSummary || []
    }, { status: 200 });
  } catch (error) {
    console.error('Parent API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cheerType, note } = body;

    if (!code) {
      return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const student = await db.prepare(
      "SELECT id, username FROM users WHERE UPPER(parent_code) = ? AND role = 'ogrenci'"
    ).get(cleanCode) as any;

    if (!student) {
      return NextResponse.json({ error: 'Öğrenci bulunamadı.' }, { status: 404 });
    }

    const CHEERS: Record<string, { icon: string; title: string; defaultBody: string }> = {
      coffee: { icon: '☕', title: 'Velinden Sıcak Kahve İkramı!', defaultBody: 'Ailen seninle gurur duyuyor, harika bir çalışma serisi yakaladın! Bir fincan kahve eşliğinde mola vermeyi unutma.' },
      rocket: { icon: '🚀', title: 'Tam Destek: Yolu Açık Olsun!', defaultBody: 'Emeklerinin karşılığını alacaksın, senin arkandayız! Hedeflerine doğru tam gaz devam.' },
      heart: { icon: '❤️', title: 'Velinden Sevgi ve Moral Notu!', defaultBody: 'Bugün çok güzel çalıştın. Sonuç ne olursa olsun senin azmin her şeyden değerli.' },
      star: { icon: '⭐', title: 'Haftanın Yıldızı Sensin!', defaultBody: 'Bu haftaki disiplin ve soru çözüm performansın için seni tebrik ediyoruz!' },
    };

    const selectedCheer = CHEERS[cheerType] || CHEERS.heart;
    const finalBody = note && note.trim().length > 0 ? `${selectedCheer.defaultBody}\n\n"${note.trim()}"` : selectedCheer.defaultBody;

    const notifId = uuidv4();
    await db.prepare(`
      INSERT INTO user_notifications (id, user_id, title, body, type, icon, url, is_read, created_at)
      VALUES (?, ?, ?, ?, 'parent_cheer', ?, '/dashboard', false, NOW())
    `).run(notifId, student.id, selectedCheer.title, finalBody, selectedCheer.icon);

    return NextResponse.json({ success: true, message: 'Moral mesajınız öğrencinize başarıyla ulaştı!' });
  } catch (error) {
    console.error('Parent Cheer POST Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}

