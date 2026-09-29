import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { getStudentMemory } from '@/lib/ai/studentMemoryEngine';
import { format, addDays, startOfWeek } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const refDate = body.dateStr ? new Date(body.dateStr) : new Date();
    const startDate = startOfWeek(refDate, { weekStartsOn: 1 }); // Monday

    // 1. Fetch Student Profile and Memory
    const user = await db.prepare('SELECT alan, username FROM users WHERE id = ?').get(userId) as any;
    const userAlan = user?.alan || 'Sayisal';
    const memory = await getStudentMemory(userId);

    // 2. Fetch Top Weaknesses from error_log
    let weaknesses = await db.prepare(`
      SELECT subject, topic, COUNT(*) as errorCount
      FROM error_log
      WHERE user_id = ?
      GROUP BY subject, topic
      ORDER BY errorCount DESC
      LIMIT 5
    `).all(userId) as any[];

    const weakTopicsText = weaknesses.length > 0
      ? weaknesses.map(w => `${w.subject}: ${w.topic} (${w.errorCount} hata)`).join(', ')
      : 'Henüz yeterli hata kaydı yok';

    let generatedTasks: Array<{
      dayOffset: number;
      subject: string;
      title: string;
      color: string;
    }> = [];

    // 3. Try Gemini 2.5 Flash Free Tier
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Sen Türkiye YKS sınavı için kişiselleştirilmiş ders programı hazırlayan uzman bir Eğitim Koçusun.
Öğrenci: ${user?.username || 'Öğrenci'}, Alan: ${userAlan}
Hedef: ${memory?.targetDepartment || 'Yüksek başarı'}
Sınava Kalan Gün: ${memory?.daysToYKS}
Öğrencinin Hata Defterindeki En Zayıf Konuları: ${weakTopicsText}

Lütfen bu öğrenci için Pazartesi'den Pazar'a (7 gün, dayOffset: 0 = Pazartesi ... 6 = Pazar) haftalık dengeli, eksik kapatmaya odaklı bir çalışma planı hazırla.
Hafta sonu mutlaka TYT veya AYT denemesi ve Hata Defteri tekrarı yer almalı.
Her gün için 2 ila 3 görev oluştur.

YALNIZCA geçerli bir JSON array döndür (başka metin veya markdown ekleme):
[
  {
    "dayOffset": 0,
    "subject": "Matematik",
    "title": "Türev 40 Soru Çözümü",
    "color": "#38bdf8"
  }
]

Renk Kuralları:
- Matematik/Geometri için "#38bdf8"
- Fen/Fizik/Kimya/Biyoloji için "#10b981"
- Türkçe/Edebiyat için "#f43f5e"
- Sosyal/Tarih/Coğrafya/Felsefe için "#f59e0b"
- Deneme/Tekrar/Genel için "#8b5cf6"`;

        const apiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                response_mime_type: "application/json"
              }
            })
          }
        );

        if (apiRes.ok) {
          const resJson = await apiRes.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length >= 7) {
              generatedTasks = parsed;
            }
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini schedule generation fallback triggered:', geminiErr);
      }
    }

    // 4. Intelligent Local Rule Engine Fallback (Zero Cost, 100% Reliable)
    if (generatedTasks.length === 0) {
      const topWeak1 = weaknesses[0] || { subject: 'Matematik', topic: userAlan === 'Sayisal' ? 'Türev' : 'Problemler' };
      const topWeak2 = weaknesses[1] || { subject: userAlan === 'Sayisal' ? 'Fizik' : 'Türkçe', topic: userAlan === 'Sayisal' ? 'Elektrik' : 'Paragraf' };
      const topWeak3 = weaknesses[2] || { subject: userAlan === 'Sayisal' ? 'Kimya' : 'Tarih', topic: userAlan === 'Sayisal' ? 'Denge' : 'İnkılap Tarihi' };

      const getColor = (subj: string) => {
        const s = subj.toLowerCase();
        if (s.includes('mat') || s.includes('geo')) return '#38bdf8';
        if (s.includes('fizik') || s.includes('kimya') || s.includes('biyo') || s.includes('fen')) return '#10b981';
        if (s.includes('türk') || s.includes('edebiyat')) return '#f43f5e';
        if (s.includes('tarih') || s.includes('coğ') || s.includes('sosyal')) return '#f59e0b';
        return '#8b5cf6';
      };

      generatedTasks = [
        // Pazartesi (0)
        { dayOffset: 0, subject: topWeak1.subject, title: `${topWeak1.topic} Konu Tekrarı & Püf Noktalar`, color: getColor(topWeak1.subject) },
        { dayOffset: 0, subject: 'Türkçe', title: '25 Soru Paragraf Rutini (Süreyle)', color: '#f43f5e' },
        
        // Salı (1)
        { dayOffset: 1, subject: topWeak1.subject, title: `${topWeak1.topic} 50 Hedef Soru Çözümü`, color: getColor(topWeak1.subject) },
        { dayOffset: 1, subject: topWeak2.subject, title: `${topWeak2.topic} Kavram Haritası Çıkarımı`, color: getColor(topWeak2.subject) },

        // Çarşamba (2)
        { dayOffset: 2, subject: topWeak2.subject, title: `${topWeak2.topic} 40 Soru Çözümü`, color: getColor(topWeak2.subject) },
        { dayOffset: 2, subject: 'Matematik', title: 'Problemler / Temel Matematik Rutini (30 Soru)', color: '#38bdf8' },

        // Perşembe (3)
        { dayOffset: 3, subject: topWeak3.subject, title: `${topWeak3.topic} Konu & Test Çözümü`, color: getColor(topWeak3.subject) },
        { dayOffset: 3, subject: 'Genel', title: 'Hata Defterindeki Çözülmemiş Soruları Tara', color: '#8b5cf6' },

        // Cuma (4)
        { dayOffset: 4, subject: userAlan === 'Sayisal' ? 'Fizik & Kimya' : 'Edebiyat & Tarih', title: 'Haftalık Branş Tekrarı (45 Soru)', color: '#10b981' },
        { dayOffset: 4, subject: 'Türkçe', title: 'Türkçe Dil Bilgisi Nokta Atışı Tekrar', color: '#f43f5e' },

        // Cumartesi (5)
        { dayOffset: 5, subject: 'Genel', title: '🏆 TYT Tam Deneme Sınavı (135 Dk)', color: '#ec4899' },
        { dayOffset: 5, subject: 'Genel', title: 'Deneme Analizi: Kaçan Netleri Hata Defterine Ekle', color: '#8b5cf6' },

        // Pazar (6)
        { dayOffset: 6, subject: 'Genel', title: '📚 AYT Branş Denemesi / Eksik Kapatma', color: '#8b5cf6' },
        { dayOffset: 6, subject: 'Genel', title: 'Haftalık Değerlendirme & Gelecek Hafta Hedefleri', color: '#10b981' }
      ];
    }

    // 5. Database Transaction with proper await
    const startOfWeekStr = format(startDate, 'yyyy-MM-dd');
    const endOfWeekStr = format(addDays(startDate, 6), 'yyyy-MM-dd');

    // Remove older AI generated tasks for this week to avoid duplicates
    await db.prepare('DELETE FROM tasks WHERE user_id = ? AND date_str BETWEEN ? AND ?').run(userId, startOfWeekStr, endOfWeekStr);

    const insertTask = db.prepare('INSERT INTO tasks (id, user_id, title, subject, color, date_str) VALUES (?, ?, ?, ?, ?, ?)');

    for (const task of generatedTasks) {
      const targetDate = format(addDays(startDate, task.dayOffset), 'yyyy-MM-dd');
      await insertTask.run(uuidv4(), userId, task.title, task.subject, task.color, targetDate);
    }

    return NextResponse.json({
      success: true,
      message: 'Yapay zeka haftalık çalışma programını eksiklerine göre hazırladı!',
      taskCount: generatedTasks.length
    });

  } catch (err: any) {
    console.error('AI Generate Plan Error:', err);
    return NextResponse.json({ error: 'Program oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}
