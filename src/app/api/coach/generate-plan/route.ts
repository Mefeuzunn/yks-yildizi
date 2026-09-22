import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { format, addDays, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { dateStr } = await req.json(); // Optional reference date, usually today
    const refDate = dateStr ? new Date(dateStr) : new Date();
    const startDate = startOfWeek(refDate, { weekStartsOn: 1 });

    // 1. Get Top Weaknesses
    let weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as errorCount
      FROM error_log
      WHERE user_id = ?
      GROUP BY subject, topic
      ORDER BY errorCount DESC
      LIMIT 3
    `).all(userId) as any[];

    // Hata verisi yoksa akıllı fallback (alana göre ders/konu belirleme)
    if (weaknesses.length === 0) {
      const user = await db.prepare('SELECT alan FROM users WHERE id = ?').get(userId) as any;
      const userAlan = user?.alan || 'Sayisal';

      if (userAlan === 'Sayisal') {
        weaknesses = [
          { subject: 'Matematik', topic: 'Türev ve Uygulamaları' },
          { subject: 'Fizik', topic: 'Basit Harmonik Hareket' },
          { subject: 'Kimya', topic: 'Tepkimelerde Denge' }
        ];
      } else if (userAlan === 'Esit Agirlik') {
        weaknesses = [
          { subject: 'Matematik', topic: 'Fonksiyon Grafikleri' },
          { subject: 'Türkçe', topic: 'Paragrafta Anlam' },
          { subject: 'Tarih', topic: 'Milli Mücadele Dönemi' }
        ];
      } else if (userAlan === 'Sozel') {
        weaknesses = [
          { subject: 'Türkçe', topic: 'Cümle Türleri' },
          { subject: 'Tarih', topic: 'Osmanlı Devleti Kuruluş' },
          { subject: 'Coğrafya', topic: 'Türkiye Nüfus Dağılımı' }
        ];
      } else if (userAlan === 'Dil') {
        weaknesses = [
          { subject: 'Genel', topic: 'İngilizce Okuma-Anlama' },
          { subject: 'Türkçe', topic: 'Noktalama İşaretleri' },
          { subject: 'Genel', topic: 'İngilizce Tense Tekrarı' }
        ];
      } else {
        weaknesses = [
          { subject: 'Matematik', topic: 'Temel Kavramlar' },
          { subject: 'Türkçe', topic: 'Paragrafta Anlam' },
          { subject: 'Genel', topic: 'Kitap Okuma & Tekrar' }
        ];
      }
    }

    // 2. Generate tasks based on weaknesses
    const newTasks: any[] = [];
    
    // Day 0: Primary Weakness Concept Review
    if (weaknesses[0]) {
      newTasks.push({ dayOffset: 0, subject: weaknesses[0].subject, title: `${weaknesses[0].topic} Konu Anlatımı (AI Tavsiyesi)`, color: '#ef4444' });
      newTasks.push({ dayOffset: 1, subject: weaknesses[0].subject, title: `${weaknesses[0].topic} Soru Çözümü 50 Soru`, color: '#ef4444' });
    }

    // Day 2: Secondary Weakness
    if (weaknesses[1]) {
      newTasks.push({ dayOffset: 2, subject: weaknesses[1].subject, title: `${weaknesses[1].topic} Tekrarı`, color: '#f59e0b' });
      newTasks.push({ dayOffset: 3, subject: weaknesses[1].subject, title: `${weaknesses[1].topic} 2 Test Çöz`, color: '#f59e0b' });
    }

    // Day 4: Tertiary
    if (weaknesses[2]) {
      newTasks.push({ dayOffset: 4, subject: weaknesses[2].subject, title: `${weaknesses[2].topic} Gözden Geçirme`, color: '#38bdf8' });
    }

    // Weekend: General Mocks
    newTasks.push({ dayOffset: 5, subject: 'Genel', title: 'TYT Genel Denemesi Çöz', color: '#ec4899' });
    newTasks.push({ dayOffset: 6, subject: 'Genel', title: 'Haftalık Hata Defteri Analizi', color: '#10b981' });

    // 3. Save to database
    const deleteTasks = await db.prepare('DELETE FROM tasks WHERE user_id = ? AND date_str BETWEEN ? AND ?');
    const insertTask = await db.prepare('INSERT INTO tasks (id, user_id, title, subject, color, date_str) VALUES (?, ?, ?, ?, ?, ?)');
    
    await db.transaction(async () => {
      // Çakışmaları önlemek için ilgili haftanın eski görevlerini sil
      const startOfWeekStr = format(startDate, 'yyyy-MM-dd');
      const endOfWeekStr = format(addDays(startDate, 6), 'yyyy-MM-dd');
      deleteTasks.run(userId, startOfWeekStr, endOfWeekStr);

      newTasks.forEach(task => {
        const targetDate = format(addDays(startDate, task.dayOffset), 'yyyy-MM-dd');
        insertTask.run(uuidv4(), userId, task.title, task.subject, task.color, targetDate);
      });
    })();

    return NextResponse.json({ success: true, message: 'Plan başarıyla oluşturuldu.' });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
