import db from '@/lib/yks-db-async';
import { v4 as uuidv4 } from 'uuid';

export const YKS_CURRICULUM_TAXONOMY: Record<string, { category: 'TYT' | 'AYT' | 'TYT/AYT'; topics: string[] }> = {
  'Matematik': {
    category: 'TYT/AYT',
    topics: [
      'Temel Kavramlar & Sayı Basamakları',
      'Bölme - Bölünebilme & EBOB-EKOK',
      'Rasyonel ve Köklü Sayılar',
      'Birinci Dereceden Denklem ve Eşitsizlikler',
      'Mutlak Değer',
      'Üslü ve Köklü İfadeler',
      'Çarpanlara Ayırma & Özdeşlikler',
      'Oran - Orantı ve Problemler',
      'Kümeler ve Mantık',
      'Fonksiyonlar & Grafikleri',
      'Polinomlar',
      'İkinci Dereceden Denklemler & Karmaşık Sayılar',
      'Parabol',
      'Trigonometri',
      'Logaritma',
      'Diziler & Seriler',
      'Limit ve Süreklilik',
      'Türev ve Uygulamaları',
      'İntegral ve Alan Hesabı',
      'Permütasyon - Kombinasyon - Olasılık'
    ]
  },
  'Geometri': {
    category: 'TYT/AYT',
    topics: [
      'Doğruda ve Üçgende Açılar',
      'Özel Üçgenler (Dik, İkizkenar, Eşkenar)',
      'Üçgende Benzerlik ve Alan',
      'Açıortay ve Kenarortay Bağıntıları',
      'Çokgenler ve Dörtgenler',
      'Çemberde Açı ve Uzunluk',
      'Dairede Alan ve Çevre',
      'Noktanın ve Doğrunun Analitiği',
      'Dönüşümlerle Geometri',
      'Çemberin Analitik İncelenmesi',
      'Katı Cisimler (Prizma, Piramit, Koni, Küre)'
    ]
  },
  'Fizik': {
    category: 'TYT/AYT',
    topics: [
      'Fizik Bilimine Giriş & Madde-Özkütle',
      'Kuvvet, Hareket ve Newton Yasaları',
      'İş, Güç ve Mekanik Enerji Korunumu',
      'Isı, Sıcaklık ve Genleşme',
      'Elektrostatik & Elektrik Akımı',
      'Optik: Yansıma, Kırılma ve Mercekler',
      'Dalgalar: Yay, Su ve Ses Dalgaları',
      'Vektörler ve Bağıl Hareket',
      'İki Boyutta Hareket (Atışlar)',
      'Tork, Denge ve Kütle Merkezi',
      'Basit Makineler',
      'Düzgün Elektrik Alan ve Sığaçlar (Kondansatör)',
      'Manyetizma ve İndüksiyon (Faraday & Lenz)',
      'Alternatif Akım ve Transformatörler',
      'Düzgün Çembersel Hareket ve Dönme',
      'Basit Harmonik Hareket',
      'Dalga Mekaniği ve Doppler Olayı',
      'Fotoelektrik Olayı ve Fotonlar',
      'Özel Görelilik & Radyoaktivite'
    ]
  },
  'Kimya': {
    category: 'TYT/AYT',
    topics: [
      'Kimya Disiplinleri ve Güvenlik',
      'Atom Modelleri ve Periyodik Sistem',
      'Kimyasal Türler Arası Etkileşimler',
      'Maddenin Halleri ve Gaz Yasaları',
      'Mol Kavramı ve Kimyasal Hesaplamalar',
      'Karışımlar ve Ayırma Yöntemleri',
      'Asitler, Bazlar ve Tuzlar',
      'Modern Atom Teorisi ve Kuantum Sayıları',
      'Sıvı Çözeltiler ve Koligatif Özellikler',
      'Kimyasal Tepkimelerde Enerji (Entalpi)',
      'Tepkime Hızları ve Çarpışma Teorisi',
      'Kimyasal Denge ve Le Chatelier İlkesi',
      'Sulu Çözelti Dengeleri (pH & Titrasyon)',
      'Çözünürlük Dengesi (Kçç)',
      'Kimya ve Elektrik (Galvanik ve Elektrolitik Piller)',
      'Karbon Kimyasına Giriş ve Hibritleşme',
      'Organik Bileşikler: Hidrokarbonlar ve Fonksiyonel Gruplar'
    ]
  },
  'Biyoloji': {
    category: 'TYT/AYT',
    topics: [
      'Canlıların Temel Bileşikleri (Organik & İnorganik)',
      'Hücre Yapısı ve Organeller',
      'Madde Geçişleri (Difüzyon, Osmoz, Aktif Taşıma)',
      'Canlılar Dünyası ve Sınıflandırma',
      'Hücre Bölünmeleri (Mitoz ve Mayoz)',
      'Kalıtım ve Mendel Yasaları',
      'Ekosistem Ekolojisi ve Madde Döngüleri',
      'Nükleik Asitler (DNA, RNA) ve Protein Sentezi',
      'Fotosentez ve Kemosentez',
      'Hücresel Solunum (Glikoliz, Krebs, ETS)',
      'Bitki Biyolojisi (Doku, Organ ve Taşınım)',
      'Sinir Sistemi ve Duyu Organları',
      'Endokrin Sistem ve Hormonlar',
      'Dolaşım ve Bağışıklık Sistemi',
      'Solunum ve Boşaltım Sistemi'
    ]
  },
  'Türkçe': {
    category: 'TYT',
    topics: [
      'Sözcükte Anlam ve Söz Öbekleri',
      'Cümlede Anlam ve İlişkiler',
      'Paragrafta Ana Düşünce ve Yardımcı Düşünceler',
      'Paragrafın Yapısı ve Akışı Bozan Cümleler',
      'Anlatım Teknikleri ve Düşünceyi Geliştirme Yolları',
      'Ses Bilgisi Kuralları',
      'Yazım Kuralları (Büyük Harfler, De/Da, Ki)',
      'Noktalama İşaretleri',
      'Sözcük Türleri (İsim, Sıfat, Zamir, Zarf, Edat, Bağlaç)',
      'Fiiller, Ek Fiil ve Fiilimsiler',
      'Cümlenin Ögeleri ve Cümle Türleri'
    ]
  },
  'Türk Dili ve Edebiyatı': {
    category: 'AYT',
    topics: [
      'Şiir Bilgisi: Nazım Birimi, Ölçü, Uyak ve Redif',
      'Edebi Sanatlar (Teşbih, İstiare, Mecazımürsel vb.)',
      'İslamiyet Öncesi ve Geçiş Dönemi Türk Edebiyatı',
      'Halk Edebiyatı (Anonim, Aşık, Dini-Tasavvufi)',
      'Divan Edebiyatı Nazım Şekilleri ve Şairleri',
      'Tanzimat Edebiyatı (1. ve 2. Dönem Sanatçıları)',
      'Servet-i Fünun ve Fecr-i Ati Edebiyatı',
      'Milli Edebiyat Dönemi ve Genç Kalemler',
      'Cumhuriyet Dönemi Şiir Akımları',
      'Cumhuriyet Dönemi Roman ve Hikaye'
    ]
  },
  'Tarih': {
    category: 'TYT/AYT',
    topics: [
      'Tarih Bilimine Giriş ve Zamanın Taksimi',
      'İlk Çağ Medeniyetleri ve Kültür Merkezleri',
      'İlk ve Orta Çağlarda Türk Dünyası (Göktürk, Uygur)',
      'İslam Medeniyetinin Doğuşu ve Yayılışı',
      'İlk Türk İslam Devletleri (Karahanlı, Gazneli, Selçuklu)',
      'Osmanlı Kuruluş ve Yükselme Dönemi',
      'Klasik Çağda Osmanlı Devlet Teşkilatı ve Kültürü',
      'I. Dünya Savaşı ve Osmanlı Cepheleri',
      'Milli Mücadele: Kongreler ve Genelgeler',
      'Kurtuluş Savaşı Muharebeleri ve Antlaşmalar',
      'Atatürk İlkeleri ve Cumhuriyet İnkılapları'
    ]
  },
  'Coğrafya': {
    category: 'TYT/AYT',
    topics: [
      'Doğa, İnsan ve Coğrafyanın Bölümleri',
      'Dünya\'nın Şekli, Günlük ve Yıllık Hareketleri',
      'Coğrafi Konum, Paralel, Meridyen ve Yerel Saat',
      'Harita Bilgisi ve İzohips Yöntemleri',
      'İklim Elemanları: Sıcaklık, Basınç, Rüzgar, Nem',
      'Büyük İklim Tipleri ve Türkiye İklimi',
      'İç ve Dış Kuvvetler (Volkanizma, Akarsu, Rüzgar)',
      'Nüfusun Dağılışı, Piramitleri ve Göç Hareketleri',
      'Doğal Afetler ve Çevre Koruma',
      'Türkiye\'nin Yer Şekilleri ve Ekonomik Coğrafyası'
    ]
  },
  'Felsefe & Din': {
    category: 'TYT',
    topics: [
      'Felsefenin Anlamı ve Düşünmenin Doğası',
      'Bilgi Felsefesi (Epistemoloji: Doğruluk, Kaynaklar)',
      'Varlık Felsefesi (Ontoloji: Madde, İdea, Oluş)',
      'Ahlak Felsefesi (Etik: Özgürlük ve Evrensel Ahlak)',
      'Din Felsefesi ve Tanrı Kanıtlamaları',
      'Siyaset ve Sanat Felsefesi',
      'İslam İnanç Esasları (Tevhid, Nübüvvet, Ahiret)',
      'İslam\'da İbadetler ve Ahlaki Değerler',
      'Kur\'an\'da Akıl, Bilgi ve Yorum Farklılıkları'
    ]
  }
};

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
