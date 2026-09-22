import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    // Seed dummy data if user has no error logs (to demonstrate the feature)
    const count = await db.prepare('SELECT COUNT(*) as c FROM error_log WHERE user_id = ?').get(userId) as any;
    
    if (count.c === 0) {
      const dummyErrors = [
        { subject: 'Matematik', topic: 'Türev Alma Kuralları', count: 14 },
        { subject: 'Matematik', topic: 'Türev Alma Kuralları', count: 0 }, // Duplicate subject logic below
        { subject: 'Fizik', topic: 'Bağıl Hareket', count: 8 },
        { subject: 'Kimya', topic: 'Organik Kimya Giriş', count: 5 },
      ];
      
      const insert = await db.prepare('INSERT INTO error_log (user_id, subject, topic, question_id) VALUES (?, ?, ?, ?)');
      
      await db.transaction(async () => {
        dummyErrors.forEach(de => {
          for (let i = 0; i < (de.count || 1); i++) {
            insert.run(userId, de.subject, de.topic, `dummy_q_${Math.random()}`);
          }
        });
      })();
    }

    // Now calculate weaknesses
    const weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as errorCount
      FROM error_log
      WHERE user_id = ?
      GROUP BY subject, topic
      ORDER BY errorCount DESC
      LIMIT 3
    `).all(userId) as any[];

    // Format with severity and colors
    const formatted = weaknesses.map((w, index) => {
      let severity = 'İncelenmeli';
      let color = '#38bdf8'; // blue
      
      if (index === 0 || w.errorCount > 10) {
        severity = 'Kritik';
        color = '#ef4444'; // red
      } else if (index === 1 || w.errorCount > 5) {
        severity = 'Uyarı';
        color = '#f59e0b'; // orange
      }

      return {
        ...w,
        severity,
        color
      };
    });

    return NextResponse.json({
      weaknesses: formatted,
      primaryWeakness: formatted[0] || null
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
