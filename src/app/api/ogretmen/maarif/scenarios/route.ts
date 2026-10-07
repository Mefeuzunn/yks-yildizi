import { NextResponse } from 'next/server';
import db from '@/lib/yks-db-async';
import { getAuthenticatedTeacherId } from '@/lib/auth-utils';
import { MAARIF_SCENARIOS_CATALOG } from '@/lib/maarif-scenarios';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const subject = searchParams.get('subject');

    let dbScenarios = await db.prepare('SELECT * FROM maarif_exam_scenarios').all() as any[];
    if (!dbScenarios || dbScenarios.length === 0) {
      dbScenarios = MAARIF_SCENARIOS_CATALOG;
    }

    let filtered = dbScenarios;
    if (grade) {
      filtered = filtered.filter(s => s.grade === Number(grade));
    }
    if (subject) {
      filtered = filtered.filter(s => s.subject.toLowerCase() === subject.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      scenarios: filtered,
    });
  } catch (error: any) {
    console.error('Teacher Maarif Scenarios GET Error:', error);
    return NextResponse.json({ error: 'MEB Senaryoları alınırken bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const teacherId = await getAuthenticatedTeacherId(req);
    if (!teacherId) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { classId, scenarioId, title, dueDate } = body;

    if (!classId || !scenarioId) {
      return NextResponse.json({ error: 'classId ve scenarioId zorunludur' }, { status: 400 });
    }

    // Öğretmenin sınıfı mı kontrol et
    const cls = await db.prepare('SELECT * FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(classId, teacherId) as any;
    if (!cls) {
      return NextResponse.json({ error: 'Sınıf bulunamadı veya yetkiniz yok' }, { status: 404 });
    }

    // Senaryoyu bul
    let scenario = await db.prepare('SELECT * FROM maarif_exam_scenarios WHERE id = ?').get(scenarioId) as any;
    if (!scenario) {
      scenario = MAARIF_SCENARIOS_CATALOG.find(s => s.id === scenarioId);
    }

    const assignmentTitle = title || `${scenario?.scenario_name || 'MEB Ortak Yazılı Sınavı'} Provası`;
    const finalDueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const assignmentId = uuidv4();

    // Ödevler tablosuna ekle
    await db.prepare(`
      INSERT INTO assignments (
        id, teacher_id, title, description, category, subject, topic, target_sinif, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assignmentId,
      teacherId,
      assignmentTitle,
      `MEB Maarif Modeli ${scenario?.term || 1}. Dönem ${scenario?.exam_number || 1}. Yazılı Senaryosu Prova Simülasyonu.`,
      'MEB Ortak Yazılı',
      scenario?.subject || 'Matematik',
      `${scenario?.grade || 9}. Sınıf MEB Senaryosu`,
      cls.class_name || String(scenario?.grade || 9),
      finalDueDate
    );

    // Sınıftaki tüm öğrencilere atama yap
    const students = await db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(classId) as any[];
    for (const st of students) {
      await db.prepare(`
        INSERT INTO assignment_submissions (
          id, assignment_id, student_id, status
        ) VALUES (?, ?, ?, 'pending')
        ON CONFLICT DO NOTHING
      `).run(uuidv4(), assignmentId, st.student_id);
    }

    return NextResponse.json({
      success: true,
      assignmentId,
      message: `"${assignmentTitle}" ödevi ${students.length} öğrenciye başarıyla atandı.`,
    });
  } catch (error: any) {
    console.error('Teacher Maarif Scenarios POST Error:', error);
    return NextResponse.json({ error: 'Senaryo ödevi atanırken bir hata oluştu' }, { status: 500 });
  }
}
