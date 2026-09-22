import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // 1. Fetch top weaknesses for this student
    // We aggregate student_mistakes or error_log. Let's pull from error_log first.
    const weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as error_count
      FROM error_log
      WHERE user_id = ?
      GROUP BY subject, topic
      ORDER BY error_count DESC
      LIMIT 2
    `).all(userId) as any[];

    if (weaknesses.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Kampa başlamak için yeterli hata veriniz bulunmuyor. Lütfen önce soru çözün!' 
      });
    }

    // Pick top 2 weak topics
    const topic1 = weaknesses[0].topic;
    const subject1 = weaknesses[0].subject;
    const topic2 = weaknesses[1]?.topic || weaknesses[0].topic;
    const subject2 = weaknesses[1]?.subject || weaknesses[0].subject;

    // 2. Clear previous Bootcamp tasks to prevent duplicates
    await db.prepare("DELETE FROM tasks WHERE user_id = ? AND title LIKE '%(AI Kampı)%'").run(userId);

    // 3. Define 7 daily tasks
    const bootcampTasks = [
      { day: 'Pazartesi', title: `${topic1}: Detaylı Konu Anlatımı Çalış (AI Kampı)`, subject: subject1, color: '#f43f5e' },
      { day: 'Salı', title: `${topic1}: Çıkmış Sorular & Formül Analizi (AI Kampı)`, subject: subject1, color: '#f59e0b' },
      { day: 'Çarşamba', title: `${topic1}: Konu Kavrama Testi Çöz (AI Kampı)`, subject: subject1, color: '#10b981' },
      { day: 'Perşembe', title: `${topic2}: Video Çözüm & Soru Tipleri (AI Kampı)`, subject: subject2, color: '#38bdf8' },
      { day: 'Cuma', title: `${topic2}: Kavrama Testi ve Not Defteri (AI Kampı)`, subject: subject2, color: '#a855f7' },
      { day: 'Cumartesi', title: `${topic1} & ${topic2}: AI Hata Sınavı Yap (AI Kampı)`, subject: subject1, color: '#ec4899' },
      { day: 'Pazar', title: `Genel AI Kamp Değerlendirmesi & Badge Kazan (AI Kampı)`, subject: 'Karma', color: '#14b8a6' }
    ];

    // 4. Write tasks to database
    const stmt = await db.prepare('INSERT INTO tasks (id, user_id, title, subject, color, date_str) VALUES (?, ?, ?, ?, ?, ?)');
    
    await db.transaction(async () => {
      for (const t of bootcampTasks) {
        const id = uuidv4();
        await stmt.run(id, userId, t.title, t.subject, t.color, t.day);
      }
    })();

    // Award badge if not already awarded
    const checkBadge = await db.prepare('SELECT 1 FROM user_badges WHERE user_id = ? AND badge_name = ?')
      .get(userId, 'AI Kampı Katılımcısı');

    if (!checkBadge) {
      await db.prepare('INSERT INTO user_badges (user_id, badge_name, badge_icon, description) VALUES (?, ?, ?, ?)')
        .run(userId, 'AI Kampı Katılımcısı', '🔥', 'İlk 7 Günlük AI Kurtarma Kampı hedefini başlattı.');
    }

    return NextResponse.json({
      success: true,
      message: '7 Günlük AI Akıllı Kurtarma Kampı başarıyla hazırlandı! Görevler haftalık programına eklendi.',
      topics: [topic1, topic2]
    });

  } catch (error: any) {
    console.error('Bootcamp Start API Error:', error);
    return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
  }
}
