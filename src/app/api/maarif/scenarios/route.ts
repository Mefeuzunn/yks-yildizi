import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { MAARIF_SCENARIOS_CATALOG, getMaarifScenariosCatalog } from '@/lib/maarif-scenarios';
import { MaarifGrade, MaarifSubject } from '@/types/maarif';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gradeParam = searchParams.get('grade');
    const subjectParam = searchParams.get('subject') as MaarifSubject | null;
    const termParam = searchParams.get('term');
    const examParam = searchParams.get('exam');

    const grade = gradeParam ? (parseInt(gradeParam, 10) as MaarifGrade) : undefined;
    const term = termParam ? parseInt(termParam, 10) : undefined;
    const examNumber = examParam ? parseInt(examParam, 10) : undefined;

    // 1. PostgreSQL DB Sorgusu
    try {
      let query = 'SELECT * FROM maarif_exam_scenarios WHERE 1=1';
      const params: any[] = [];

      if (grade) {
        query += ' AND grade = ?';
        params.push(grade);
      }
      if (subjectParam) {
        query += ' AND subject = ?';
        params.push(subjectParam);
      }
      if (term) {
        query += ' AND term = ?';
        params.push(term);
      }
      if (examNumber) {
        query += ' AND exam_number = ?';
        params.push(examNumber);
      }
      query += ' ORDER BY grade ASC, term ASC, exam_number ASC';

      const rows = await db.prepare(query).all(...params) as any[];

      if (rows && rows.length > 0) {
        return NextResponse.json({
          success: true,
          count: rows.length,
          scenarios: rows.map(r => ({
            ...r,
            question_distribution: typeof r.question_distribution === 'string'
              ? JSON.parse(r.question_distribution)
              : r.question_distribution,
          })),
        });
      }
    } catch (dbErr) {
      console.warn('Maarif Scenarios DB sorgusu fallback moduna geçti:', dbErr);
    }

    // 2. Fallback: Statik Katalog
    const fallbackScenarios = getMaarifScenariosCatalog(grade, subjectParam || undefined, term);

    return NextResponse.json({
      success: true,
      count: fallbackScenarios.length,
      scenarios: fallbackScenarios,
    });
  } catch (error: any) {
    console.error('Maarif Scenarios API Error:', error);
    return NextResponse.json({ error: 'Sınav senaryoları yüklenirken bir hata oluştu' }, { status: 500 });
  }
}
