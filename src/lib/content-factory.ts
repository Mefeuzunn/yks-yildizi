import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';
import { YKS_CURRICULUM_TAXONOMY } from './curriculum-taxonomy';
export { YKS_CURRICULUM_TAXONOMY };

interface GeneratedFlashcard {
  front_text: string;
  back_text: string;
  tip?: string;
  category: 'TYT' | 'AYT' | 'TYT/AYT';
  subject: string;
  topic: string;
}

interface GeneratedQuestion {
  text: string;
  options: { A: string; B: string; C: string; D: string; E: string };
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  difficulty: number;
  subject: string;
  topic: string;
}

/**
 * Calls Gemini 2.0 to generate official, highly pedagogical YKS flashcards
 */
export async function generateFlashcardsBatch(
  subject: string,
  topic: string,
  count = 10
): Promise<GeneratedFlashcard[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY eksik.');
  }

  const prompt = `Sen Türkiye MEB ve ÖSYM müfredatını ezbere bilen, 20 yıllık duayen bir YKS hazırlık öğretmenisin.
Ders: "${subject}"
Konu: "${topic}"

GÖREV: Bu konu için ÖSYM'nin çıkmış soruları ve MEB kazanımlarına tam uyumlu ${count} adet YÜKSEK VERİMLİ BİLGİ KARTI (Flashcard) üret.

KURALLAR:
1. Kartların ön yüzü (front_text): Net, düşündürücü soru veya kavram başlığı olmalı.
2. Kartların arka yüzü (back_text): Özet, akılda kalıcı, tam ve net açıklama içermeli. Matematik/Fen formülleri varsa standart LaTeX ($...$) formatında yazılmalıdır (örn: $E = mc^2$, $\\int f(x)dx$).
3. Her kart için 'tip' (hafıza tekniği / akrostiş / ÖSYM tuzağı uyarısı) ekle.
4. Çıktıyı KESİNLİKLE sadece geçerli bir JSON dizisi (Array) olarak ver. Markdown işareti, ek açıklama veya backtick KULLANMA.

JSON ŞEMASI:
[
  {
    "front_text": "Trigonometride Yarım Açı Formülü: $\\\\sin(2x)$ neye eşittir?",
    "back_text": "$\\\\sin(2x) = 2 \\\\cdot \\\\sin(x) \\\\cdot \\\\cos(x)$",
    "tip": "ÖSYM sadeleştirme sorularında $2\\\\sin(x)\\\\cos(x)$ görünce hemen $\\\\sin(2x)$ yapıştır!",
    "category": "AYT"
  }
]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 4096,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API Error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const resJson = await response.json();
  const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Clean markdown wrapping
  const cleanedJson = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleanedJson);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini JSON çıktısı bir dizi formatında değil.');
  }

  const result: GeneratedFlashcard[] = parsed.map((item) => ({
    front_text: item.front_text || '',
    back_text: item.back_text || '',
    tip: item.tip || '',
    category: (item.category as any) || YKS_CURRICULUM_TAXONOMY[subject]?.category || 'TYT/AYT',
    subject,
    topic,
  }));

  return result.filter(c => c.front_text && c.back_text);
}

/**
 * Saves generated flashcards into the PostgreSQL database, avoiding duplicates.
 */
export async function saveFlashcardsToDB(cards: GeneratedFlashcard[]): Promise<number> {
  let inserted = 0;

  for (const card of cards) {
    try {
      // Check for exact duplicate front_text in the same subject/topic
      const existing = await db.prepare(
        'SELECT id FROM flashcards WHERE subject = ? AND topic = ? AND front_text = ? LIMIT 1'
      ).get(card.subject, card.topic, card.front_text) as any;

      if (!existing) {
        const id = uuidv4();
        await db.prepare(`
          INSERT INTO flashcards (id, user_id, subject, topic, category, front_text, back_text, tip)
          VALUES (?, 'system', ?, ?, ?, ?, ?, ?)
        `).run(id, card.subject, card.topic, card.category, card.front_text, card.back_text, card.tip || '');

        inserted++;
      }
    } catch (e) {
      console.error('Flashcard kaydetme hatası:', e);
    }
  }

  return inserted;
}

/**
 * Calls Gemini 2.0 to generate official, highly pedagogical YKS multiple choice questions with explanations
 */
export async function generateQuestionsBatch(
  subject: string,
  topic: string,
  count = 5
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY eksik.');
  }

  const prompt = `Sen Türkiye MEB ve ÖSYM müfredatını en iyi bilen uzman bir YKS soru yazarısın.
Ders: "${subject}"
Konu: "${topic}"

GÖREV: Bu konu için ÖSYM YKS sınav standartlarında (TYT veya AYT formatında) tam ${count} adet YENİ NESİL, ÇÖZÜMLÜ, ÇOKTAN SEÇMELİ SORU üret.

KURALLAR:
1. Soru metni (text): Gerçekçi, matematiksel veya kavramsal olarak hatasız, net soru kökü. Gerekirse standart LaTeX formülü ($...$) içermeli.
2. Seçenekler (options): {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."} formatında 5 şık.
3. Doğru şık (correctOption): "A", "B", "C", "D" veya "E".
4. Zorluk (difficulty): 1 ile 5 arasında tam sayı (1: çok kolay, 3: orta YKS, 5: zor/eleme sorusu).
5. Açıklamalı çözüm (explanation): Adım adım, öğrencinin tam anlayacağı pedagojik çözüm metni.
6. Çıktı formatı: SADECE geçerli bir JSON dizisi (Array). Markdown backtick veya fazladan metin ekleme.

JSON ŞEMASI:
[
  {
    "text": "f(x) = x^3 - 3x^2 + 4 fonksiyonunun yerel minimum noktasının apsisi kaçtır?",
    "options": { "A": "0", "B": "1", "C": "2", "D": "3", "E": "4" },
    "correctOption": "C",
    "difficulty": 3,
    "explanation": "f'(x) = 3x^2 - 6x = 3x(x - 2) = 0. Kökler x = 0 ve x = 2'dir. İşaret tablosu incelendiğinde x = 2'de türev negatiften pozitife geçer, dolayısıyla yerel minimum apsisi 2'dir."
  }
]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 4096,
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API Error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const resJson = await response.json();
  const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  const cleanedJson = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const parsed = JSON.parse(cleanedJson);
  if (!Array.isArray(parsed)) {
    throw new Error('Gemini JSON çıktısı bir dizi formatında değil.');
  }

  const result: GeneratedQuestion[] = parsed.map((item) => ({
    text: item.text || '',
    options: item.options || { A: '', B: '', C: '', D: '', E: '' },
    correctOption: item.correctOption || 'A',
    difficulty: Math.max(1, Math.min(5, Number(item.difficulty) || 3)),
    explanation: item.explanation || '',
    subject,
    topic,
  }));

  return result.filter(q => q.text && q.options && q.options.A && q.options.B);
}

/**
 * Saves generated questions into the PostgreSQL questions table
 */
export async function saveQuestionsToDB(questions: GeneratedQuestion[]): Promise<number> {
  let inserted = 0;

  for (const q of questions) {
    try {
      await db.prepare(`
        INSERT INTO questions (subject, topic, text, options_json, correct_option, difficulty, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        q.subject,
        q.topic,
        q.text,
        JSON.stringify(q.options),
        q.correctOption,
        q.difficulty,
        q.explanation || ''
      );
      inserted++;
    } catch (e) {
      console.error('Soru kaydetme hatası:', e);
    }
  }

  return inserted;
}
