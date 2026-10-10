'use client';

export interface OfflineQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface OfflineQuizSubmission {
  id: string;
  questionId: string;
  subject: string;
  topic: string;
  selectedOption: number;
  isCorrect: boolean;
  answeredAt: string;
}

export const OFFLINE_QUESTIONS: OfflineQuestion[] = [
  {
    id: 'off-1',
    subject: 'Türkçe',
    topic: 'Sözcükte Anlam',
    question: 'Aşağıdaki cümlelerin hangisinde "ince" sözcüğü mecaz anlamda kullanılmıştır?',
    options: [
      'A) İnce bir kumaştan dikilmiş bir gömlek giymişti.',
      'B) İnce fikirli bir insan olduğu her hareketinden belliydi.',
      'C) İnce bir dal kırılınca kuş havalandı.',
      'D) Çocuğun ince bacakları titriyordu.',
      'E) Kitabın ince kapağı yıpranmıştı.'
    ],
    correctAnswer: 1,
    explanation: '"İnce fikirli" ifadesinde ince, zayıf/kalın olmayan değil, nazik ve duyarlı anlamında mecazen kullanılmıştır.'
  },
  {
    id: 'off-2',
    subject: 'Matematik',
    topic: 'Temel Kavramlar',
    question: 'Ardışık üç tek sayının toplamı 51 olduğuna göre, bu sayıların en büyüğü kaçtır?',
    options: [
      'A) 15',
      'B) 17',
      'C) 19',
      'D) 21',
      'E) 23'
    ],
    correctAnswer: 2,
    explanation: 'Ortadaki sayı 51 / 3 = 17\'dir. Sayılar 15, 17, 19 olduğundan en büyüğü 19\'dur.'
  },
  {
    id: 'off-3',
    subject: 'Tarih',
    topic: 'İlk Türk Devletleri',
    question: 'Tarihte Türk adıyla kurulan ilk devlet aşağıdakilerden hangisidir?',
    options: [
      'A) Asya Hun Devleti',
      'B) Uygur Devleti',
      'C) Köktürk Devleti',
      'D) Avar Kağanlığı',
      'E) Hazar Devleti'
    ],
    correctAnswer: 2,
    explanation: 'Bumin Kağan önderliğinde kurulan I. Köktürk Devleti, Türk adını resmi devlet adı olarak kullanan ilk devlettir.'
  },
  {
    id: 'off-4',
    subject: 'Coğrafya',
    topic: 'İklim Bilgisi',
    question: 'Türkiye\'de yıllık sıcaklık farkının en az olduğu iklim tipi ve bölge hangisidir?',
    options: [
      'A) Karadeniz İklimi - Karadeniz Kıyıları',
      'B) Karasal İklim - İç Anadolu',
      'C) Akdeniz İklimi - Güneydoğu Anadolu',
      'D) Sert Karasal İklim - Erzurum-Kars',
      'E) Marmara Geçiş İklimi - Trakya'
    ],
    correctAnswer: 0,
    explanation: 'Nemlilik ve bulutluluğun en yüksek olduğu Karadeniz ikliminde yıllık ve günlük sıcaklık farkı en azdır.'
  },
  {
    id: 'off-5',
    subject: 'Biyoloji',
    topic: 'Hücre Organelleri',
    question: 'Hücrede protein sentezinden sorumlu olan ve zarsız yapıya sahip organel hangisidir?',
    options: [
      'A) Mitokondri',
      'B) Ribozom',
      'C) Lizozom',
      'D) Golgi Aygıtı',
      'E) Endoplazmik Retikulum'
    ],
    correctAnswer: 1,
    explanation: 'Ribozom, tüm canlı hücrelerde bulunan, rRNA ve proteinden oluşan zarsız bir organeldir.'
  },
  {
    id: 'off-6',
    subject: 'Fizik',
    topic: 'Kuvvet ve Hareket',
    question: 'Bir cisme etki eden net kuvvet sıfır olduğunda, cismin hareket durumu hakkında ne söylenebilir?',
    options: [
      'A) Cisim kesinlikle durur.',
      'B) Cisim ivmeli hareket yapar.',
      'C) Duruyorsa durur, hareket halindeyse sabit hızla devam eder (Eylemsizlik).',
      'D) Cisim dairesel hareket yapar.',
      'E) Cismin mekanik enerjisi sürekli artar.'
    ],
    correctAnswer: 2,
    explanation: 'Newton\'un 1. Hareket Yasası (Eylemsizlik): Net kuvvet sıfırsa duran cisim durur, hareket halindeki cisim sabit hızla düzgün doğrusal hareketine devam eder.'
  }
];

const OFFLINE_QUIZ_STORAGE_KEY = 'yks_offline_quiz_queue_v1';

export function getOfflineQuizSubmissions(): OfflineQuizSubmission[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUIZ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQuizSubmission(sub: OfflineQuizSubmission): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getOfflineQuizSubmissions();
    list.push(sub);
    localStorage.setItem(OFFLINE_QUIZ_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('saveOfflineQuizSubmission error:', e);
  }
}

export function clearOfflineQuizSubmissions(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(OFFLINE_QUIZ_STORAGE_KEY);
  } catch (_) {}
}

export async function syncOfflineQuizSubmissions(): Promise<{ synced: number; xpAwarded: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, xpAwarded: 0 };
  }

  const submissions = getOfflineQuizSubmissions();
  if (submissions.length === 0) return { synced: 0, xpAwarded: 0 };

  let correctCount = 0;
  for (const s of submissions) {
    if (s.isCorrect) correctCount++;
  }

  const xpToAward = correctCount * 15;

  try {
    if (xpToAward > 0) {
      await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xp: xpToAward,
          reason: `Çevrimdışı Çözülen ${submissions.length} Soru (${correctCount} Doğru)`
        })
      });
    }

    clearOfflineQuizSubmissions();
    return { synced: submissions.length, xpAwarded: xpToAward };
  } catch (err) {
    console.warn('Sync offline quiz failed:', err);
    return { synced: 0, xpAwarded: 0 };
  }
}
