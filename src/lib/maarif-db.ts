import db from '@/lib/yks-db-async';
import {
  MaarifCurriculumNode,
  MaarifExamScenario,
  MaarifOpenEndedQuestion,
  MaarifStudentEvaluation,
  MaarifSubject,
  MaarifGrade,
} from '@/types/maarif';

/**
 * Maarif Modeli Veritabanı Şeması Başlatıcı (İdempotent Migration)
 * Klasik YKS tablolarına dokunmaz; tamamen izole yeni tablolar açar.
 */
export async function initMaarifDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Users tablosuna curriculum_mode alanı ekleme
    await db.prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS curriculum_mode TEXT DEFAULT 'legacy_yks'
    `).run();

    // 9, 10, 11. sınıftaki öğrencileri maarif moduna eşle
    await db.prepare(`
      UPDATE users 
      SET curriculum_mode = 'maarif_v1' 
      WHERE (sinif = '9' OR sinif = '10' OR sinif = '11')
        AND (curriculum_mode IS NULL OR curriculum_mode = 'legacy_yks')
    `).run();

    // 1b. teacher_classes tablosuna curriculum_mode ve grade ekleme
    await db.prepare(`
      ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS curriculum_mode TEXT DEFAULT 'legacy_yks'
    `).run();
    await db.prepare(`
      ALTER TABLE teacher_classes ADD COLUMN IF NOT EXISTS grade INTEGER DEFAULT 12
    `).run();

    await db.prepare(`
      UPDATE teacher_classes
      SET curriculum_mode = 'maarif_v1',
          grade = CASE
            WHEN class_name LIKE '9%' THEN 9
            WHEN class_name LIKE '10%' THEN 10
            WHEN class_name LIKE '11%' THEN 11
            ELSE 9
          END
      WHERE (class_name LIKE '9%' OR class_name LIKE '10%' OR class_name LIKE '11%')
        AND (curriculum_mode IS NULL OR curriculum_mode = 'legacy_yks')
    `).run();

    // 2. Maarif Müfredat Düğümleri (Temalar ve Öğrenme Çıktıları)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS maarif_curriculum_nodes (
        id TEXT PRIMARY KEY,
        grade INTEGER NOT NULL,
        subject TEXT NOT NULL,
        theme_name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        outcome_title TEXT NOT NULL,
        outcome_description TEXT NOT NULL,
        skill_domain TEXT NOT NULL,
        has_phet_sim BOOLEAN DEFAULT false,
        related_sim_slug TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // İndeksler
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_maarif_nodes_grade_subject ON maarif_curriculum_nodes (grade, subject)
    `).run();

    // 3. MEB Ortak Yazılı Sınav Senaryoları
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS maarif_exam_scenarios (
        id TEXT PRIMARY KEY,
        grade INTEGER NOT NULL,
        subject TEXT NOT NULL,
        term INTEGER NOT NULL,
        exam_number INTEGER NOT NULL,
        scenario_name TEXT NOT NULL,
        description TEXT,
        question_distribution JSONB NOT NULL DEFAULT '[]',
        total_points INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_maarif_scenarios_lookup ON maarif_exam_scenarios (grade, subject, term, exam_number)
    `).run();

    // 4. Maarif Açık Uçlu Soru Havuzu (Rubrikli)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS maarif_open_ended_questions (
        id TEXT PRIMARY KEY,
        curriculum_node_code TEXT NOT NULL,
        grade INTEGER NOT NULL,
        subject TEXT NOT NULL,
        scenario_id TEXT,
        context_story TEXT NOT NULL,
        image_url TEXT,
        question_text TEXT NOT NULL,
        max_score INTEGER NOT NULL DEFAULT 10,
        rubric_criteria JSONB NOT NULL DEFAULT '[]',
        sample_solutions JSONB NOT NULL DEFAULT '[]',
        difficulty_level INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_maarif_questions_node ON maarif_open_ended_questions (curriculum_node_code)
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_maarif_questions_grade_subject ON maarif_open_ended_questions (grade, subject)
    `).run();

    // 5. Öğrenci Süreç ve Rubrik Değerlendirme Takibi
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS maarif_student_evaluations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        student_answer_text TEXT NOT NULL,
        ai_score INTEGER,
        ai_feedback TEXT,
        teacher_score INTEGER,
        teacher_feedback TEXT,
        rubric_breakdown JSONB DEFAULT '{}',
        mastery_level TEXT DEFAULT 'Geliştirilmeli',
        evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_maarif_evaluations_user ON maarif_student_evaluations (user_id)
    `).run();

    return { success: true, message: 'Maarif Modeli veritabanı şeması ve tabloları başarıyla oluşturuldu.' };
  } catch (err: any) {
    console.error('Maarif DB init hatası:', err);
    throw err;
  }
}

/**
 * Belirli bir sınıf ve derse ait Maarif çıktılarını getirir.
 */
export async function getMaarifCurriculumNodes(grade: MaarifGrade, subject?: MaarifSubject): Promise<MaarifCurriculumNode[]> {
  try {
    if (subject) {
      const rows = await db.prepare(`
        SELECT * FROM maarif_curriculum_nodes 
        WHERE grade = ? AND subject = ?
        ORDER BY code ASC
      `).all(grade, subject) as any[];
      return rows;
    }
    const rows = await db.prepare(`
      SELECT * FROM maarif_curriculum_nodes 
      WHERE grade = ?
      ORDER BY subject ASC, code ASC
    `).all(grade) as any[];
    return rows;
  } catch (e: any) {
    console.error('getMaarifCurriculumNodes error:', e);
    return [];
  }
}

/**
 * Belirli bir sınıf ve derse ait MEB Senaryolarını getirir.
 */
export async function getMaarifScenarios(grade: MaarifGrade, subject: MaarifSubject, term?: number): Promise<MaarifExamScenario[]> {
  try {
    if (term) {
      const rows = await db.prepare(`
        SELECT * FROM maarif_exam_scenarios 
        WHERE grade = ? AND subject = ? AND term = ?
        ORDER BY exam_number ASC, scenario_name ASC
      `).all(grade, subject, term) as any[];
      return rows;
    }
    const rows = await db.prepare(`
      SELECT * FROM maarif_exam_scenarios 
      WHERE grade = ? AND subject = ?
      ORDER BY term ASC, exam_number ASC
    `).all(grade, subject) as any[];
    return rows;
  } catch (e: any) {
    console.error('getMaarifScenarios error:', e);
    return [];
  }
}

/**
 * Öğrencinin müfredat modunu tespit eder.
 */
export function resolveCurriculumMode(sinif?: string | null, customMode?: string | null): 'legacy_yks' | 'maarif_v1' {
  if (customMode === 'maarif_v1') return 'maarif_v1';
  if (customMode === 'legacy_yks') return 'legacy_yks';
  if (sinif === '9' || sinif === '10' || sinif === '11') return 'maarif_v1';
  return 'legacy_yks';
}
