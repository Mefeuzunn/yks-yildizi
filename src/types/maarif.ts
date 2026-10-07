/**
 * Türkiye Yüzyılı Maarif Modeli (9, 10 ve 11. Sınıf)
 * Veri Tipleri ve Domain Şemaları
 * 
 * Bu tipler Klasik YKS (12. Sınıf & Mezun) sisteminden tamamen izoledir.
 */

export type CurriculumMode = 'legacy_yks' | 'maarif_v1';

export type MaarifGrade = 9 | 10 | 11;

export type MaarifSubject =
  | 'Matematik'
  | 'Fizik'
  | 'Kimya'
  | 'Biyoloji'
  | 'Türk Dili ve Edebiyatı'
  | 'Tarih'
  | 'Coğrafya'
  | 'Felsefe';

export type SkillDomain =
  | 'Kavramsal Beceri'
  | 'Alan Becerisi'
  | 'Eğilim'
  | 'Sosyo-Duygusal Beceri';

export type MasteryLevel = 'Geliştirilmeli' | 'Kısmen Başarılı' | 'Yetkin';

/**
 * Maarif Öğrenme Çıktısı (Kazanım) Düğümü
 * Örn: MAT.9.1.1 (Sayılar ve Algoritmik İlişkiler)
 */
export interface MaarifCurriculumNode {
  id: string;
  grade: MaarifGrade;
  subject: MaarifSubject;
  theme_name: string;
  code: string; // "MAT.9.1.1"
  outcome_title: string;
  outcome_description: string;
  skill_domain: SkillDomain;
  has_phet_sim: boolean;
  related_sim_slug?: string;
  created_at?: string;
}

/**
 * Dereceli Puanlama Anahtarı (Rubrik) Kriteri
 */
export interface MaarifRubricCriterion {
  points: number;
  criteria: string;
  sample_step?: string;
}

/**
 * MEB Ortak Yazılı Sınav Senaryosu
 * (MEB İl/İlçe ve Okul genelinde yayınlanan Senaryo 1, Senaryo 2 vb.)
 */
export interface MaarifExamScenario {
  id: string;
  grade: MaarifGrade;
  subject: MaarifSubject;
  term: 1 | 2; // 1. Dönem veya 2. Dönem
  exam_number: 1 | 2; // 1. Yazılı veya 2. Yazılı
  scenario_name: string; // "MEB İl Geneli Senaryo 1"
  description: string;
  question_distribution: Array<{
    node_code: string;
    count: number;
    points: number;
  }>;
  total_points: number;
  created_at?: string;
}

/**
 * Maarif Açık Uçlu Soru Modeli
 * Süreç ve senaryo temelli, rubrikli ölçme aracı
 */
export interface MaarifOpenEndedQuestion {
  id: string;
  curriculum_node_code: string;
  grade: MaarifGrade;
  subject: MaarifSubject;
  scenario_id?: string;
  context_story: string; // Günlük hayat problemi / gerçek yaşam senaryosu
  image_url?: string;
  question_text: string;
  max_score: number;
  rubric_criteria: MaarifRubricCriterion[];
  sample_solutions: string[];
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  created_at?: string;
}

/**
 * Öğrencinin Açık Uçlu Yanıt ve Rubrik Değerlendirme Kaydı
 */
export interface MaarifStudentEvaluation {
  id: string;
  user_id: string;
  question_id: string;
  student_answer_text: string;
  ai_score?: number;
  ai_feedback?: string;
  teacher_score?: number;
  teacher_feedback?: string;
  rubric_breakdown?: Record<string, any>;
  mastery_level: MasteryLevel;
  evaluated_at?: string;
}

/**
 * Öğrencinin Tema Bazlı Beceri Yetkinlik İlerlemesi
 */
export interface MaarifThemeProgress {
  theme_name: string;
  subject: MaarifSubject;
  total_outcomes: number;
  mastered_outcomes: number;
  progress_percent: number;
  status: MasteryLevel;
}
