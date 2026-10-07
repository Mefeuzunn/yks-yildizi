import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { MAARIF_SCENARIOS_CATALOG } from '@/lib/maarif-scenarios';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ scenarioId: string }> }) {
  try {
    const { scenarioId } = await params;

    // 1. Senaryoyu bul
    let scenario = await db.prepare('SELECT * FROM maarif_exam_scenarios WHERE id = ?').get(scenarioId) as any;
    if (!scenario) {
      scenario = MAARIF_SCENARIOS_CATALOG.find(s => s.id === scenarioId);
    }

    if (!scenario) {
      return NextResponse.json({ error: 'MEB Yazılı Senaryosu bulunamadı' }, { status: 404 });
    }

    // 2. Senaryoya ait soruları getir
    let questions = await db.prepare(`
      SELECT * FROM maarif_open_ended_questions 
      WHERE scenario_id = ? 
      ORDER BY id ASC
    `).all(scenarioId) as any[];

    // Eğer o senaryoya özel soru yoksa, o ders ve sınıfın sorularından getir
    if (!questions || questions.length === 0) {
      questions = await db.prepare(`
        SELECT * FROM maarif_open_ended_questions 
        WHERE grade = ? AND subject = ?
        ORDER BY id ASC
        LIMIT 7
      `).all(scenario.grade, scenario.subject) as any[];
    }

    const parsedQuestions = (questions || []).map((q: any) => ({
      ...q,
      rubric_criteria: typeof q.rubric_criteria === 'string' ? JSON.parse(q.rubric_criteria) : q.rubric_criteria,
      sample_solutions: typeof q.sample_solutions === 'string' ? JSON.parse(q.sample_solutions) : q.sample_solutions,
    }));

    return NextResponse.json({
      success: true,
      scenario: {
        ...scenario,
        question_distribution: typeof scenario.question_distribution === 'string'
          ? JSON.parse(scenario.question_distribution)
          : scenario.question_distribution,
      },
      questions: parsedQuestions,
      totalQuestions: parsedQuestions.length,
      totalPoints: parsedQuestions.reduce((sum: number, q: any) => sum + (q.max_score || 0), 0) || scenario.total_points || 100,
    });
  } catch (error: any) {
    console.error('Maarif Exam Session API Hatası:', error);
    return NextResponse.json({ error: 'Sınav oturumu yüklenirken hata oluştu' }, { status: 500 });
  }
}
