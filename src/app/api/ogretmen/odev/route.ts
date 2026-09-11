import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { generateQuestionFromTemplate } from '@/lib/engine';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const assignments = await db.prepare(`
      SELECT a.*,
             COUNT(asub.id) as total_assigned,
             SUM(CASE WHEN asub.status IN ('submitted', 'graded') THEN 1 ELSE 0 END) as submitted_count
      FROM assignments a
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id
      WHERE a.teacher_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `).all(user.id) as any[];

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Ödevler listeleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('yks_session')?.value;

    if (!sessionId) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(sessionId) as any;
    if (!user || user.role !== 'ogretmen') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, class_id, due_date, generateQuestions, subject, topic, questionCount = 5 } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Ödev başlığı gerekli' }, { status: 400 });
    }

    if (!class_id) {
      return NextResponse.json({ error: 'Sınıf seçimi gerekli' }, { status: 400 });
    }

    // Sınıf doğrulaması
    const cls = await db.prepare('SELECT * FROM teacher_classes WHERE id = ? AND teacher_id = ?').get(class_id, user.id) as any;
    if (!cls) return NextResponse.json({ error: 'Sınıf bulunamadı' }, { status: 404 });

    const assignmentId = uuidv4();
    let questionsJson = null;

    // YKS Yıldızı Zeki Soru Üretim Motoru (Faz 2 Derin Entegrasyonu)
    if (generateQuestions && subject) {
      const generated = [];
      const topicRow = topic ? await db.prepare('SELECT id FROM konular WHERE isim = ?').get(topic) as any : null;
      
      let templates = [];
      if (topicRow) {
        templates = await db.prepare('SELECT * FROM soru_sablonlari WHERE konu_id = ? ORDER BY RANDOM() LIMIT 10').all(topicRow.id) as any[];
      } else {
        // Just get some random templates for the subject
        // Normally we'd join dersler but let's just get random for now if topic isn't specified
        templates = await db.prepare('SELECT * FROM soru_sablonlari ORDER BY RANDOM() LIMIT 10').all() as any[];
      }

      if (templates.length > 0) {
        for (let i = 0; i < Math.min(questionCount, 10); i++) {
          const t = templates[Math.floor(Math.random() * templates.length)];
          const q = generateQuestionFromTemplate(t);
          if (q) generated.push(q);
        }
        if (generated.length > 0) {
          questionsJson = JSON.stringify(generated);
        }
      }
    }

    const students = await db.prepare('SELECT student_id FROM class_students WHERE class_id = ?').all(class_id) as any[];

    await db.transaction(async () => {
      await db.prepare(`
        INSERT INTO assignments (id, teacher_id, title, description, target_sinif, target_alan, due_date, questions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(assignmentId, user.id, title.trim(), description || null, null, null, due_date || null, questionsJson);

      const insertSub = await db.prepare(`
        INSERT INTO assignment_submissions (id, assignment_id, student_id, status)
        VALUES (?, ?, ?, 'pending')
      `);

      for (const student of students) {
        await insertSub.run(uuidv4(), assignmentId, student.student_id);
      }
    })();

    const created = await db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);

    return NextResponse.json({
      success: true,
      assignment: created,
      assignedStudents: students.length,
      generatedCount: questionsJson ? JSON.parse(questionsJson).length : 0
    }, { status: 201 });
  } catch (error) {
    console.error('Ödev oluşturma hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
