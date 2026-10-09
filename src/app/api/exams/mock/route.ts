import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url, 'http://localhost');
    const examType = (searchParams.get('type') || 'TYT').toUpperCase();
    const alan = searchParams.get('alan') || 'Sayisal';

    let questionsList: any[] = [];

    if (examType === 'TYT') {
      // ÖSYM TYT Standart Dağılımı: 120 Soru (165 dk)
      // 40 Türkçe, 30 Matematik, 10 Geometri, 5 Tarih, 5 Coğrafya, 5 Felsefe & Din, 7 Fizik, 7 Kimya, 6 Biyoloji
      const distribution = [
        { subject: 'Türkçe', count: 40, section: 'Türkçe Testi' },
        { subject: 'Tarih', count: 5, section: 'Sosyal Bilimler Testi' },
        { subject: 'Coğrafya', count: 5, section: 'Sosyal Bilimler Testi' },
        { subject: 'Felsefe & Din', count: 10, section: 'Sosyal Bilimler Testi' },
        { subject: 'Matematik', count: 30, section: 'Temel Matematik Testi' },
        { subject: 'Geometri', count: 10, section: 'Temel Matematik Testi' },
        { subject: 'Fizik', count: 7, section: 'Fen Bilimleri Testi' },
        { subject: 'Kimya', count: 7, section: 'Fen Bilimleri Testi' },
        { subject: 'Biyoloji', count: 6, section: 'Fen Bilimleri Testi' }
      ];

      for (const item of distribution) {
        const rows = await db.prepare(`
          SELECT * FROM questions 
          WHERE subject = ? 
          ORDER BY RANDOM() 
          LIMIT ?
        `).all(item.subject, item.count) as any[];

        for (const r of rows) {
          questionsList.push({
            id: r.id,
            section: item.section,
            subject: r.subject,
            topic: r.topic,
            text: r.text,
            options: typeof r.options_json === 'string' ? JSON.parse(r.options_json) : r.options_json,
            correctOption: r.correct_option,
            difficulty: r.difficulty,
            explanation: r.explanation || 'Bu sorunun çözümü öğretmenlerimiz tarafından hazırlanmaktadır.'
          });
        }
      }
    } else {
      // ÖSYM AYT Standart Dağılımı: 80 Soru (180 dk)
      let distribution: { subject: string; count: number; section: string }[] = [];

      if (alan === 'Sayisal') {
        distribution = [
          { subject: 'Matematik', count: 30, section: 'Matematik Testi' },
          { subject: 'Geometri', count: 10, section: 'Matematik Testi' },
          { subject: 'Fizik', count: 14, section: 'Fen Bilimleri Testi' },
          { subject: 'Kimya', count: 13, section: 'Fen Bilimleri Testi' },
          { subject: 'Biyoloji', count: 13, section: 'Fen Bilimleri Testi' }
        ];
      } else if (alan === 'Esit Agirlik') {
        distribution = [
          { subject: 'Matematik', count: 30, section: 'Matematik Testi' },
          { subject: 'Geometri', count: 10, section: 'Matematik Testi' },
          { subject: 'Türk Dili ve Edebiyatı', count: 24, section: 'Türk Dili ve Edebiyatı - Sosyal-1' },
          { subject: 'Tarih', count: 10, section: 'Türk Dili ve Edebiyatı - Sosyal-1' },
          { subject: 'Coğrafya', count: 6, section: 'Türk Dili ve Edebiyatı - Sosyal-1' }
        ];
      } else {
        // Sozel
        distribution = [
          { subject: 'Türk Dili ve Edebiyatı', count: 24, section: 'Edebiyat - Sosyal-1' },
          { subject: 'Tarih', count: 21, section: 'Sosyal Bilimler-2' },
          { subject: 'Coğrafya', count: 17, section: 'Sosyal Bilimler-2' },
          { subject: 'Felsefe & Din', count: 18, section: 'Felsefe Grubu' }
        ];
      }

      for (const item of distribution) {
        const rows = await db.prepare(`
          SELECT * FROM questions 
          WHERE subject = ? 
          ORDER BY RANDOM() 
          LIMIT ?
        `).all(item.subject, item.count) as any[];

        for (const r of rows) {
          questionsList.push({
            id: r.id,
            section: item.section,
            subject: r.subject,
            topic: r.topic,
            text: r.text,
            options: typeof r.options_json === 'string' ? JSON.parse(r.options_json) : r.options_json,
            correctOption: r.correct_option,
            difficulty: r.difficulty,
            explanation: r.explanation || 'Bu sorunun çözümü öğretmenlerimiz tarafından hazırlanmaktadır.'
          });
        }
      }
    }

    // Assign consistent 1-indexed numbers
    const numberedQuestions = questionsList.map((q, idx) => ({
      ...q,
      number: idx + 1
    }));

    return NextResponse.json({
      success: true,
      examType,
      alan,
      totalQuestions: numberedQuestions.length,
      durationMinutes: examType === 'TYT' ? 165 : 180,
      questions: numberedQuestions
    }, { status: 200 });

  } catch (error: any) {
    console.error('Mock Exam Generator Error:', error);
    return NextResponse.json({ error: 'Deneme sınavı oluşturulamadı: ' + error.message }, { status: 500 });
  }
}
