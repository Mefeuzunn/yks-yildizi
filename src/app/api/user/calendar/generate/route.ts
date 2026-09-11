import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.prepare('SELECT alan FROM users WHERE id = ?').get(sessionId) as any;
    
    await db.prepare('DELETE FROM study_plans WHERE user_id = ?').run(sessionId);

    const generateSchedule = async (day: number, time: number, duration: number, title: string, color: string) => {
      await db.prepare(
        'INSERT INTO study_plans (user_id, day_of_week, start_time, duration, title, color, completed) VALUES (?, ?, ?, ?, ?, ?, 0)'
      ).run(sessionId, day, time, duration, title, color);
    };
    
    const isSayisal = user.alan === 'Sayisal';
    const colors = { mat: '#3b82f6', fen: '#10b981', turkce: '#ef4444', sosyal: '#f59e0b', deneme: '#8b5cf6' };

    await generateSchedule(0, 16, 2, 'Matematik Soru Çözümü', colors.mat);
    await generateSchedule(0, 19, 2, isSayisal ? 'Fizik Tekrarı' : 'Edebiyat Tekrarı', colors.fen);
    await generateSchedule(1, 16, 2, 'Türkçe Paragraf', colors.turkce);
    await generateSchedule(1, 19, 2, 'Geometri', colors.mat);
    await generateSchedule(2, 17, 3, isSayisal ? 'Kimya & Biyoloji' : 'Tarih & Coğrafya', colors.sosyal);
    await generateSchedule(3, 16, 2, 'Matematik Problemler', colors.mat);
    await generateSchedule(3, 19, 2, 'Sosyal Bilimler', colors.sosyal);
    await generateSchedule(4, 18, 3, 'Haftalık Konu Tekrarı', colors.turkce);
    await generateSchedule(5, 10, 4, 'TYT Genel Deneme', colors.deneme);
    await generateSchedule(5, 15, 2, 'Deneme Analizi', colors.deneme);
    await generateSchedule(6, 11, 3, 'AYT Deneme / Branş Deneme', colors.deneme);
    await generateSchedule(6, 16, 2, 'Gelecek Haftaya Hazırlık', colors.mat);

    return NextResponse.json({ success: true, message: 'Yapay zeka haftalık planını oluşturdu!' });

  } catch (error) {
    console.error('Generate Schedule Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
