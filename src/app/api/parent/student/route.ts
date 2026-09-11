import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitResult = rateLimit(`parent_login_${ip}`, 10, 60 * 1000);
    
    if (!limitResult.success) {
      return NextResponse.json({ error: 'Çok fazla deneme yaptınız.' }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'Bağlantı kodu gereklidir.' }, { status: 400 });

    const student = await db.prepare('SELECT id, username, alan, sinif FROM users WHERE parent_code = ? AND role = "ogrenci"').get(code) as any;
    if (!student) return NextResponse.json({ error: 'Geçersiz bağlantı kodu.' }, { status: 404 });

    const stats = await db.prepare('SELECT * FROM user_stats WHERE user_id = ?').get(student.id) as any;
    const exams = await db.prepare('SELECT * FROM mock_exams WHERE user_id = ? ORDER BY exam_date ASC').all(student.id) as any[];
    
    // Timeline Data: Son 7 günün odaklanma logları
    const timeline = await db.prepare(`
      SELECT subject, topic, duration_min, started_at, mode 
      FROM focus_sessions 
      WHERE user_id = ? 
      ORDER BY started_at DESC LIMIT 15
    `).all(student.id);

    // Subject Focus: Son 7 günde hangi derse kaç dakika çalıştı?
    const subjectFocus = await db.prepare(`
      SELECT subject, SUM(duration_min) as total_min 
      FROM focus_sessions 
      WHERE user_id = ? AND mode = 'pomodoro' AND subject IS NOT NULL 
      AND started_at >= datetime('now', '-7 days') 
      GROUP BY subject ORDER BY total_min DESC
    `).all(student.id);

    // Mistakes Summary: En çok hata yapılan dersler
    const mistakeSummary = await db.prepare(`
      SELECT subject, COUNT(*) as mistake_count 
      FROM student_mistakes 
      WHERE user_id = ? 
      GROUP BY subject ORDER BY mistake_count DESC LIMIT 5
    `).all(student.id);

    return NextResponse.json({
      success: true,
      student: { username: student.username, alan: student.alan, sinif: student.sinif, stats: stats || null },
      exams,
      timeline,
      subjectFocus,
      mistakeSummary
    }, { status: 200 });
  } catch (error) {
    console.error('Parent API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
