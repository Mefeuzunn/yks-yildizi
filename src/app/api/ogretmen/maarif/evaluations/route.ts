import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    let evaluations: any[];

    if (classId && classId !== 'all') {
      evaluations = await db.prepare(`
        SELECT 
          mse.id, mse.user_id, mse.question_id, mse.student_answer_text,
          mse.ai_score, mse.ai_feedback, mse.teacher_score, mse.teacher_feedback,
          mse.rubric_breakdown, mse.mastery_level, mse.evaluated_at,
          u.username as student_username, u.sinif as student_grade,
          moq.curriculum_node_code, moq.grade, moq.subject, moq.question_text,
          moq.max_score, moq.rubric_criteria
        FROM maarif_student_evaluations mse
        JOIN users u ON mse.user_id = u.id
        JOIN class_students cs ON u.id = cs.student_id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        JOIN maarif_open_ended_questions moq ON mse.question_id = moq.id
        WHERE tc.id = ? AND tc.teacher_id = ?
        ORDER BY mse.evaluated_at DESC
        LIMIT 50
      `).all(classId, teacherId) as any[];
    } else {
      evaluations = await db.prepare(`
        SELECT 
          mse.id, mse.user_id, mse.question_id, mse.student_answer_text,
          mse.ai_score, mse.ai_feedback, mse.teacher_score, mse.teacher_feedback,
          mse.rubric_breakdown, mse.mastery_level, mse.evaluated_at,
          u.username as student_username, u.sinif as student_grade,
          moq.curriculum_node_code, moq.grade, moq.subject, moq.question_text,
          moq.max_score, moq.rubric_criteria
        FROM maarif_student_evaluations mse
        JOIN users u ON mse.user_id = u.id
        JOIN class_students cs ON u.id = cs.student_id
        JOIN teacher_classes tc ON cs.class_id = tc.id
        JOIN maarif_open_ended_questions moq ON mse.question_id = moq.id
        WHERE tc.teacher_id = ?
        ORDER BY mse.evaluated_at DESC
        LIMIT 50
      `).all(teacherId) as any[];
    }

    const parsedEvaluations = (evaluations || []).map((e: any) => ({
      ...e,
      rubric_breakdown: typeof e.rubric_breakdown === 'string'
        ? JSON.parse(e.rubric_breakdown)
        : e.rubric_breakdown,
      rubric_criteria: typeof e.rubric_criteria === 'string'
        ? JSON.parse(e.rubric_criteria)
        : e.rubric_criteria,
    }));

    return NextResponse.json({
      success: true,
      evaluations: parsedEvaluations,
      count: parsedEvaluations.length,
    });
  } catch (error: any) {
    console.error('Teacher Maarif Evaluations GET Error:', error);
    return NextResponse.json({ error: 'Değerlendirmeler getirilirken bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { evaluationId, teacherScore, teacherFeedback = '' } = body;

    if (!evaluationId || teacherScore === undefined) {
      return NextResponse.json({ error: 'evaluationId ve teacherScore zorunludur' }, { status: 400 });
    }

    // Öğretmenin bu öğrenciye erişim yetkisi var mı kontrol et
    const allowed = await db.prepare(`
      SELECT mse.id
      FROM maarif_student_evaluations mse
      JOIN class_students cs ON mse.user_id = cs.student_id
      JOIN teacher_classes tc ON cs.class_id = tc.id
      WHERE mse.id = ? AND tc.teacher_id = ?
      LIMIT 1
    `).get(evaluationId, teacherId);

    if (!allowed) {
      return NextResponse.json({ error: 'Bu değerlendirmeye not verme yetkiniz yok' }, { status: 403 });
    }

    await db.prepare(`
      UPDATE maarif_student_evaluations
      SET teacher_score = ?, teacher_feedback = ?
      WHERE id = ?
    `).run(Number(teacherScore), teacherFeedback.trim(), evaluationId);

    return NextResponse.json({
      success: true,
      message: 'Öğretmen rubrik notu ve geri bildirimi kaydedildi.',
    });
  } catch (error: any) {
    console.error('Teacher Maarif Evaluations POST Error:', error);
    return NextResponse.json({ error: 'Değerlendirme notu kaydedilirken bir hata oluştu' }, { status: 500 });
  }
}
