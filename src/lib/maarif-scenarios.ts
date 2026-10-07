import { MaarifExamScenario, MaarifSubject, MaarifGrade } from '../types/maarif';

/**
 * MEB Ortak Yazılı Sınav Senaryo Şablonları Kataloğu
 * 
 * Millî Eğitim Bakanlığı Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğü
 * tarafından yayımlanan konu soru dağılım tablolarına (Senaryo 1 & 2) birebir uygundur.
 */

export const MAARIF_SCENARIOS_CATALOG: MaarifExamScenario[] = [
  // ─── 9. Sınıf Matematik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-mat-9-1-1',
    grade: 9,
    subject: 'Matematik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1 (Temel Düzey)',
    description: 'Gerçek sayılar kümesinde işlemler ve basit algoritmik modelleme ağırlıklı 7 açık uçlu soru.',
    question_distribution: [
      { node_code: 'MAT.9.1.1', count: 3, points: 45 },
      { node_code: 'MAT.9.1.2', count: 2, points: 30 },
      { node_code: 'MAT.9.2.1', count: 2, points: 25 },
    ],
    total_points: 100,
  },
  {
    id: 'scen-mat-9-1-2',
    grade: 9,
    subject: 'Matematik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB Okul Geneli Senaryo 2 (Analitik & İleri Düzey)',
    description: 'Doğrusal değişim ve gerçek yaşam problem modellemelerini kapsayan 6 karmaşık açık uçlu soru.',
    question_distribution: [
      { node_code: 'MAT.9.1.1', count: 2, points: 30 },
      { node_code: 'MAT.9.1.2', count: 2, points: 30 },
      { node_code: 'MAT.9.2.1', count: 2, points: 40 },
    ],
    total_points: 100,
  },
  {
    id: 'scen-mat-9-1-2-1',
    grade: 9,
    subject: 'Matematik',
    term: 1,
    exam_number: 2,
    scenario_name: 'MEB 1. Dönem 2. Yazılı Senaryo 1',
    description: 'Birinci dereceden denklem sistemleri ve üçgende temel açı bağıntılarını içeren sınav provası.',
    question_distribution: [
      { node_code: 'MAT.9.2.2', count: 4, points: 60 },
      { node_code: 'MAT.9.3.1', count: 3, points: 40 },
    ],
    total_points: 100,
  },

  // ─── 9. Sınıf Fizik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-fiz-9-1-1',
    grade: 9,
    subject: 'Fizik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1 (Kavramsal Temel)',
    description: 'Fizik bilimine giriş, büyüklükler ve net kuvvetin ivmeyle ilişkisi üzerine 5 açık uçlu soru.',
    question_distribution: [
      { node_code: 'FİZ.9.1.1', count: 2, points: 40 },
      { node_code: 'FİZ.9.2.1', count: 3, points: 60 },
    ],
    total_points: 100,
  },
  {
    id: 'scen-fiz-9-1-2',
    grade: 9,
    subject: 'Fizik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB Okul Geneli Senaryo 2 (Dinamik Deneyleri)',
    description: 'Sürtünme kuvveti ve Newton hareket yasalarının deney verileriyle analiz edildiği 5 senaryolu soru.',
    question_distribution: [
      { node_code: 'FİZ.9.1.1', count: 1, points: 20 },
      { node_code: 'FİZ.9.2.1', count: 2, points: 40 },
      { node_code: 'FİZ.9.2.2', count: 2, points: 40 },
    ],
    total_points: 100,
  },

  // ─── 9. Sınıf Kimya 1. Dönem 1. Yazılı ───
  {
    id: 'scen-kim-9-1-1',
    grade: 9,
    subject: 'Kimya',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB Ortak Yazılı Senaryo 1',
    description: 'Kimya güvenliği ve atom altı taneciklerin periyodik sistemdeki dizilimini sorgulayan 6 soru.',
    question_distribution: [
      { node_code: 'KİM.9.1.1', count: 2, points: 30 },
      { node_code: 'KİM.9.2.1', count: 4, points: 70 },
    ],
    total_points: 100,
  },

  // ─── 9. Sınıf Biyoloji 1. Dönem 1. Yazılı ───
  {
    id: 'scen-biy-9-1-1',
    grade: 9,
    subject: 'Biyoloji',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB Ortak Yazılı Senaryo 1',
    description: 'Canlıların temel bileşenleri ve hücre zarından madde geçiş süreçleri üzerine 6 açık uçlu soru.',
    question_distribution: [
      { node_code: 'BİY.9.1.1', count: 3, points: 50 },
      { node_code: 'BİY.9.2.1', count: 3, points: 50 },
    ],
    total_points: 100,
  },

  // ─── 9. Sınıf Türk Dili ve Edebiyatı 1. Dönem 1. Yazılı ───
  {
    id: 'scen-edb-9-1-1',
    grade: 9,
    subject: 'Türk Dili ve Edebiyatı',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1',
    description: 'Edebiyat-sanat ilişkisi ve olay/durum hikâyesinde anlatıcı bakış açısı metin tahlili soruları.',
    question_distribution: [
      { node_code: 'EDB.9.1.1', count: 2, points: 40 },
      { node_code: 'EDB.9.2.1', count: 3, points: 60 },
    ],
    total_points: 100,
  },

  // ─── 10. Sınıf Matematik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-mat-10-1-1',
    grade: 10,
    subject: 'Matematik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1',
    description: 'Fonksiyon grafikleri, birebir-örtenlik ve polinom kavramlarını içeren 6 açık uçlu soru.',
    question_distribution: [
      { node_code: 'MAT.10.1.1', count: 3, points: 50 },
      { node_code: 'MAT.10.1.2', count: 3, points: 50 },
    ],
    total_points: 100,
  },

  // ─── 10. Sınıf Fizik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-fiz-10-1-1',
    grade: 10,
    subject: 'Fizik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1',
    description: 'Elektrik devreleri, seri-paralel bağlama ve Ohm yasası hesaplamalarını içeren 5 soru.',
    question_distribution: [
      { node_code: 'FİZ.10.1.1', count: 5, points: 100 },
    ],
    total_points: 100,
  },

  // ─── 11. Sınıf Matematik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-mat-11-1-1',
    grade: 11,
    subject: 'Matematik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1',
    description: 'Yönlü açılar, birim çember ve analitik geometride doğru denklemlerini kapsayan 6 soru.',
    question_distribution: [
      { node_code: 'MAT.11.1.1', count: 3, points: 50 },
      { node_code: 'MAT.11.2.1', count: 3, points: 50 },
    ],
    total_points: 100,
  },

  // ─── 11. Sınıf Fizik 1. Dönem 1. Yazılı ───
  {
    id: 'scen-fiz-11-1-1',
    grade: 11,
    subject: 'Fizik',
    term: 1,
    exam_number: 1,
    scenario_name: 'MEB İl Geneli Senaryo 1',
    description: 'Atış hareketleri ve itme-çizgisel momentum korunumunu içeren vektörel hesaplama soruları.',
    question_distribution: [
      { node_code: 'FİZ.11.1.1', count: 3, points: 50 },
      { node_code: 'FİZ.11.2.1', count: 3, points: 50 },
    ],
    total_points: 100,
  },
];

export function getMaarifScenariosCatalog(grade?: MaarifGrade, subject?: MaarifSubject, term?: number): MaarifExamScenario[] {
  return MAARIF_SCENARIOS_CATALOG.filter(scen => {
    if (grade && scen.grade !== grade) return false;
    if (subject && scen.subject !== subject) return false;
    if (term && scen.term !== term) return false;
    return true;
  });
}
