import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedUserId } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req) || 'anonymous_student';
    const body = await req.json();
    const { scenarioId, answers = {}, timeSpentSeconds = 0 } = body;

    if (!scenarioId) {
      return NextResponse.json({ error: 'scenarioId gereklidir' }, { status: 400 });
    }

    const questionIds = Object.keys(answers);
    const submissionId = `sub_${uuidv4().substring(0, 8)}`;

    // Her yanıtı maarif_student_evaluations tablosuna kaydet
    for (const qId of questionIds) {
      const answerText = answers[qId] || '';
      if (answerText.trim()) {
        const evalId = uuidv4();
        await db.prepare(`
          INSERT INTO maarif_student_evaluations (
            id, user_id, question_id, student_answer_text, mastery_level, evaluated_at
          ) VALUES (?, ?, ?, ?, ?, NOW())
        `).run(evalId, userId, qId, answerText, 'Kısmen Başarılı');
      }
    }

    return NextResponse.json({
      success: true,
      submissionId,
      answeredCount: questionIds.filter(qId => answers[qId]?.trim().length > 0).length,
      totalCount: questionIds.length,
      timeSpentSeconds,
      message: 'MEB Yazılı Sınav yanıtları başarıyla kaydedildi.',
    });
  } catch (error: any) {
    console.error('Maarif Exam Submit API Error:', error);
    return NextResponse.json({ error: 'Sınav gönderilirken bir hata oluştu' }, { status: 500 });
  }
}
