// src/lib/ai/nlpEngine.ts
import Fuse from 'fuse.js';

// --- TIP TANIMLAMALARI ---
export type Intent = 
  | 'greeting' 
  | 'motivation_low' 
  | 'exam_anxiety' 
  | 'schedule_request' 
  | 'score_drop' 
  | 'subject_struggle' 
  | 'focus_issue'
  | 'net_analysis'
  | 'general_advice'
  | 'thanks'
  | 'unknown';

export type Sentiment = 'positive' | 'negative' | 'anxious' | 'neutral';
export type Entity = string;

export interface ReportCard {
  diagnosis: string;
  prescription: string;
  chartData: { subject: string; score: number; maxScore: number }[];
}

export interface Action {
  label: string;
  url: string;
  icon?: string; // Optional lucide icon name representation
}

export interface CounselorResponse {
  text: string;
  actions?: Action[];
  report?: ReportCard;
}

// --- VERİTABANI: PATTERNLER VE DUYGULAR ---
const INTENT_PATTERNS: { intent: Intent; pattern: RegExp; weight: number }[] = [
  { intent: 'net_analysis', pattern: /(?:^|\\s)(tyt|ayt|türkçe|matematik|mat|fen|sosyal).*\\d{1,3}.*(net|doğru|yanlış|analiz|karnem)(?:\\s|$)/i, weight: 10 },
  { intent: 'greeting', pattern: /(?:^|\\s)(merhaba|selam|iyi günler|günaydın|hey|hi)(?:\\s|$)/i, weight: 1 },
  { intent: 'motivation_low', pattern: /(?:^|\\s)(motivasyonum|canım istemiyor|yoruldum|tükendim|sıkıldım|çalışasım yok|bıktım|yapamayacağım|umutsuzum|bırakacağım|olmuyor)(?:\\s|$)/i, weight: 2 },
  { intent: 'exam_anxiety', pattern: /(?:^|\\s)(kaygı|stres|heyecan|korku|panik|uykusuzluk|korkuyorum|endişe|yetişmeyecek|sınav anı|ellerim titriyor|mahvoldum)(?:\\s|$)/i, weight: 3 },
  { intent: 'schedule_request', pattern: /(?:^|\\s)(program|plan|çalışma programı|nasıl çalışmalıyım|nereden başlamalıyım|zaman yönetimi|rutin)(?:\\s|$)/i, weight: 2 },
  { intent: 'score_drop', pattern: /(?:^|\\s)(netlerim|net|düştü|artmıyor|yerinde sayıyor|deneme sonuçları|kötü geçti|puanım)(?:\\s|$)/i, weight: 2 },
  { intent: 'focus_issue', pattern: /(?:^|\\s)(odak|odaklanamıyorum|dikkatim dağılıyor|masada oturamıyorum|telefon|sosyal medya|dikkat eksikliği|hayal kuruyorum)(?:\\s|$)/i, weight: 2 },
  { intent: 'thanks', pattern: /(?:^|\\s)(teşekkürler|sağ ol|teşekkür ederim|harika|çok iyi|eyvallah|minnettarım)(?:\\s|$)/i, weight: 1 }
];

// FUZZY LOGIC (Bulanık Mantık) Veritabanı
const FUZZY_INTENTS = [
  { text: "matematik yapamıyorum", intent: 'subject_struggle' },
  { text: "mat ypmym", intent: 'subject_struggle' },
  { text: "çalışmaktan bıktım", intent: 'motivation_low' },
  { text: "çlşmktn bktm", intent: 'motivation_low' },
  { text: "netlerim artmıyor", intent: 'score_drop' },
  { text: "netim artmyr", intent: 'score_drop' },
  { text: "odaklanamıyorum", intent: 'focus_issue' },
  { text: "odklnmyrm", intent: 'focus_issue' },
  { text: "sınav stresi çok fazla", intent: 'exam_anxiety' },
  { text: "korkuyorum yetişmeyecek", intent: 'exam_anxiety' },
  { text: "program hazırlar mısın", intent: 'schedule_request' },
  { text: "nasıl çalışmalıyım", intent: 'schedule_request' }
];

const fuse = new Fuse(FUZZY_INTENTS, {
  keys: ['text'],
  includeScore: true,
  threshold: 0.4 // 0.0 mükemmel eşleşme, 0.4 toleranslı
});

const SENTIMENT_PATTERNS = {
  negative: /(?:^|\\s)(kötü|berbat|yapamıyorum|yoruldum|tükendim|artmıyor|düştü|sıkıldım|bıktım|olmuyor|mahvoldum)(?:\\s|$)/i,
  anxious: /(?:^|\\s)(korkuyorum|yetişmeyecek|stresliyim|panik|uyuyamıyorum|kaygı)(?:\\s|$)/i,
  positive: /(?:^|\\s)(iyi|harika|süper|başardım|arttı|çok şükür|teşekkür|heyecanlıyım)(?:\\s|$)/i,
};

const SUBJECTS = [
  'matematik', 'türkçe', 'paragraf', 'geometri', 'fizik', 'kimya', 'biyoloji', 
  'tarih', 'coğrafya', 'felsefe', 'din', 'dil', 'tyt', 'ayt'
];

// --- VERİTABANI: YANITLAR VE AKSİYONLAR ---
const RESPONSES: Record<Intent, string[]> = {
  greeting: [
    "Merhaba! Eğitim yolculuğunda sana tam destek olmak için buradayım. Hedeflerimize ulaşmak için bugün neyi çözüyoruz?",
    "Selam! Ben senin kişisel yapay zeka eğitim koçunum. Bugün kendini nasıl hissediyorsun, planlarımız tıkırında mı?"
  ],
  motivation_low: [
    "Motivasyon her zaman zirvede kalmaz, bu çok doğal bir durum. Yola çıkış amacını, o çok istediğin üniversite kapısından içeri girdiğin ilk günü hayal et. Şampiyonlar yorulduklarında değil, işleri bittiğinde dururlar.",
    "Bazen tükenmiş hissetmek bu maratonun bir parçasıdır. Unutma, başarı pes etmeyenlerin ve her düştüğünde daha güçlü kalkanların hikayesidir. Bugün sadece küçük bir adım at, devamı gelecektir."
  ],
  exam_anxiety: [
    "Sınav stresi, kontrol edebildiğin sürece seni zinde tutan ve savaşmaya iten bir yakıttır. Ama nefes alamayacak gibi hissediyorsan, dur. Gözlerini kapat, 4 saniye nefes al, 4 saniye tut, 4 saniye ver. Bu sadece bir sınav, senin değerini ölçmüyor.",
    "Kaygılanıyorsun çünkü hedeflerini önemsiyorsun; bu harika bir şey! Ancak sonucun veya sıralamanın değil, sadece bugünkü sürecinin senin elinde olduğunu unutma. Sadece masadaki kitaba odaklan."
  ],
  schedule_request: [
    "Mükemmel bir programın sırrı 'gerçekçilik' ve 'sürdürülebilirlik'tir. Günde 10 saat çalışmak yerine, odaklanmış 4 saat çok daha değerlidir. Öncelikle zayıf olduğun branşları sabah saatlerine koyarak başlayalım.",
    "Haftalık plan yaparken 'Pazar Sendromu'nu önlemek için pazar öğleden sonranı mutlaka tamamen boş bırak. Her gün istisnasız 1 paragraf ve 1 problem branş denemesi çözmeyi de rutin haline getirmeliyiz."
  ],
  score_drop: [
    "Netlerin bir noktada takılması çalışmadığını değil, beyninin bilgileri sindirmeye başladığını, yani bir 'plato' evresinde olduğunu gösterir. Artık konu çalışmayı bırakıp branş denemelerinde yanlışlarını kesip 'Hata Defteri' oluşturma vakti gelmiş.",
    "Deneme sonuçlarındaki dalgalanmalar moralini bozmasın! Bazen yayınların zorluk dereceleri seni yanıltabilir. Bizim için önemli olan kaç doğru yaptığın değil, yapamadığın sorulardan hangi kazanımları öğrendiğindir."
  ],
  subject_struggle: [
    "Bu derste zorlanman çok normal. Önemli olan sorunun kökünü bulmak: Temelden eksiğin mi var? Kavramları mı karıştırıyorsun yoksa sadece işlem hatası mı yapıyorsun? Sorunu doğru analiz edersen, çözümü yarılamış olursun.",
    "Bir dersi sevmeden başarmak ciddi bir psikolojik yüktür. Ona karşı önyargılarını sadece bir haftalığına kenara bırak. Her gün o derse sadece 20 dakika ayır. Göreceksin ki, çalıştıkça sevecek, sevdikçe başaracaksın."
  ],
  focus_issue: [
    "Odaklanma sorununun bir numaralı sebebi beynimizin kısa vadeli dopamin aramasıdır (telefon vb.). Telefonu kesinlikle başka bir odaya bırakıp 25 dakikalık (Pomodoro) katı seanslarla masada oturmayı dene.",
    "Eğer aklına sürekli başka düşünceler geliyorsa, masanın yanına bir 'Çöp Kutusu Kağıdı' koy. Aklına gelen tüm dikkat dağıtıcıları o kağıda yaz ve 'çalışmam bitince buna bakacağım' diyerek zihnini rahatlat."
  ],
  thanks: [
    "Rica ederim! Senin başarıya ulaşman benim tasarlanma amacım ve en büyük motivasyonum. Ne zaman takılırsan ben buradayım."
  ],
  net_analysis: [
    "Net verilerini aldım ve derinlemesine bir analiz oluşturdum. Hemen aşağıdan detaylı Yapay Zeka Karneni inceleyebilirsin."
  ],
  general_advice: [
    "YKS bir zeka testi değil, kriz yönetimi ve disiplin testidir. Süreci iyi yöneten kazanır.",
    "Kendini başkalarıyla kıyaslama. Senin tek rakibin dünkü sen'sin."
  ],
  unknown: [
    "Tam olarak ne demek istediğini anlayamadım ama YKS maratonunun zorlu bir süreç olduğunu biliyorum. Hangi konuda yardıma ihtiyacın var? Motivasyon mu, program yapmak mı yoksa sınav stresi mi?"
  ]
};

// --- YARDIMCI FONKSİYONLAR ---

// Metni temizleme (Basit Tokenization)
function sanitizeText(text: string): string {
  return text.toLowerCase().replace(/[.,!?;:()]/g, ' ').trim();
}

// Duygu Analizi (Sentiment Analysis)
function analyzeSentiment(text: string): Sentiment {
  const sanitized = sanitizeText(text);
  if (SENTIMENT_PATTERNS.anxious.test(sanitized)) return 'anxious';
  if (SENTIMENT_PATTERNS.negative.test(sanitized)) return 'negative';
  if (SENTIMENT_PATTERNS.positive.test(sanitized)) return 'positive';
  return 'neutral';
}

// Varlık ve Konu Hafızası (Context Memory)
function extractSubjects(text: string): Entity[] {
  const sanitized = sanitizeText(text);
  return SUBJECTS.filter(sub => new RegExp(`\\b${sub}\\b`, 'i').test(sanitized));
}

// Çoklu Niyet Algılama (Multi-Intent Detection) + FUZZY LOGIC
function detectIntents(text: string): Intent[] {
  const sanitized = sanitizeText(text);
  const detected: { intent: Intent; weight: number }[] = [];
  
  // 1. Kural Tabanlı Arama (Regex)
  INTENT_PATTERNS.forEach(item => {
    if (item.pattern.test(sanitized)) {
      detected.push({ intent: item.intent, weight: item.weight });
    }
  });

  // 2. Bulanık Mantık Araması (Fuzzy Search - Typo Toleranslı)
  const fuzzyResults = fuse.search(sanitized);
  if (fuzzyResults.length > 0 && fuzzyResults[0].score !== undefined && fuzzyResults[0].score < 0.4) {
    // Fuse'da score düştükçe isabet artar
    const bestMatch = fuzzyResults[0].item.intent as Intent;
    detected.push({ intent: bestMatch, weight: 2.5 }); // Fuzzy eşleşmesine yüksek ağırlık ver
  }

  // Ağırlığa göre sırala
  detected.sort((a, b) => b.weight - a.weight);
  
  // En baskın 2 niyeti al
  return Array.from(new Set(detected.map(d => d.intent))).slice(0, 2);
}

// --- ANA MOTOR (MAIN ENGINE) ---

export function generateCounselorResponse(userMessages: { text: string; sender: string }[]): CounselorResponse {
  if (userMessages.length === 0) {
    return { text: RESPONSES.greeting[0] };
  }

  // Bağlam (Context) oluştur: Son mesajı ve geçmişteki konuları analiz et
  const lastUserMsg = userMessages[userMessages.length - 1].text;
  
  // KALICI HAFIZA (PERSISTENT MEMORY)
  // Kullanıcının daha önceki mesajlarında bahsettiği "eski" konuları hatırla.
  // Geri dönüş (Welcome back) senaryosu:
  if (userMessages.length > 3) {
    // API, frontend'in localStorage'dan yüklediği tüm geçmişi alıyor.
    // Proaktif olarak geçmiş referanslar yapılabilir.
  }

  const sentiment = analyzeSentiment(lastUserMsg);
  const currentSubjects = extractSubjects(lastUserMsg);
  const intents = detectIntents(lastUserMsg);

  // Hafıza (Memory): Eğer mevcut mesajda konu yoksa, önceki mesajlara bak
  let contextualSubjects = [...currentSubjects];
  if (contextualSubjects.length === 0 && userMessages.length > 2) {
    const previousUserMsg = userMessages[userMessages.length - 3]?.text || '';
    contextualSubjects = extractSubjects(previousUserMsg);
  }

  // Özel Durum: Eğer konu var ama niyet bulunamadıysa, o konuda zorlanıyor demektir
  if (contextualSubjects.length > 0 && intents.length === 0) {
    intents.push('subject_struggle');
  }

  if (intents.length === 0) {
    intents.push('unknown');
  }

  // Yanıtı Sentezleme (Synthesis)
  let responseText = "";
  const actions: Action[] = [];
  let report: ReportCard | undefined = undefined;

  // Özel Durum: Net Analizi (AI Report Card)
  if (intents[0] === 'net_analysis') {
    // Basit regex ile cümleden netleri çıkarma (Mock Extraction)
    const textStr = lastUserMsg.toLowerCase();
    
    // Default değerler
    let mat = 10, tur = 20, fen = 5, sos = 10;
    
    // Basit kural tabanlı parser
    const matMatch = textStr.match(/mat(?:ematik)?\\s*(\\d+)/);
    if (matMatch) mat = parseInt(matMatch[1]);
    
    const turMatch = textStr.match(/türkçe\\s*(\\d+)/);
    if (turMatch) tur = parseInt(turMatch[1]);

    const fenMatch = textStr.match(/fen\\s*(\\d+)/);
    if (fenMatch) fen = parseInt(fenMatch[1]);

    const sosMatch = textStr.match(/sos(?:yal)?\\s*(\\d+)/);
    if (sosMatch) sos = parseInt(sosMatch[1]);

    // Rapor oluştur
    report = {
      chartData: [
        { subject: 'Türkçe', score: tur, maxScore: 40 },
        { subject: 'Matematik', score: mat, maxScore: 40 },
        { subject: 'Fen', score: fen, maxScore: 20 },
        { subject: 'Sosyal', score: sos, maxScore: 20 }
      ],
      diagnosis: mat < 15 ? 
        "Matematik temelin şu an riskli bölgede. Okuduğunu anlama becerin (Türkçe) fena değil ancak sayısal analiz ve işlem pratiğinde kopukluklar yaşıyorsun." :
        "Sayısal işlem becerin gayet yerinde, ancak eksik olduğun branşlar (özellikle okuduğunu hızlı anlama) seni zaman kaybına uğratıyor olabilir.",
      prescription: mat < 15 ?
        "TYT Matematik İlk 12 Konu fasiküllerine yoğunlaşmalı ve günde en az 30 problem çözmelisin." :
        "Hemen genel branş denemelerine geçmeli ve özellikle Paragraf / Sosyal kısmında hızlanmak için süreli deneme pratiği yapmalısın."
    };
    
    responseText = RESPONSES.net_analysis[0];
    actions.push({ label: 'Türkiye Geneli Sıralamanı Gör', url: '/puan-hesaplama', icon: 'Calculator' });
    
    return { text: responseText, actions, report };
  }

  // Duygu durumuna göre ön ek (Empati Katmanı)
  if (sentiment === 'anxious') {
    responseText += "Şu an çok kaygılı olduğunu hissedebiliyorum. Lütfen derin bir nefes al, her şeyin üstesinden gelebilecek güce sahipsin. ";
  } else if (sentiment === 'negative' && !intents.includes('motivation_low')) {
    responseText += "Sesinde bir yorgunluk ve hayal kırıklığı seziyorum, ki bu çok insani bir durum. ";
  } else if (sentiment === 'positive') {
    responseText += "Harika bir enerji hissediyorum! Bu pozitifliğin sana büyük başarılar getirecek. ";
  }

  // Birinci (Ana) Niyete göre cevap
  const primaryIntent = intents[0];
  const possibleAnswers = RESPONSES[primaryIntent];
  let mainAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];

  // Eğer belirli bir ders konuşuluyorsa cevabı dinamikleştir
  if (contextualSubjects.length > 0 && primaryIntent !== 'unknown' && primaryIntent !== 'greeting' && primaryIntent !== 'thanks') {
    const subStr = contextualSubjects.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ve ');
    if (primaryIntent === 'subject_struggle') {
      mainAnswer = `${subStr} dersi özelinde zorlanmanı anlıyorum. ` + mainAnswer;
      actions.push({ label: `${subStr} Simülasyonları`, url: '/simulasyonlar', icon: 'BookOpen' });
    } else if (primaryIntent === 'score_drop') {
      mainAnswer = `Özellikle ${subStr} netlerindeki düşüş canını sıkmış olmalı. ` + mainAnswer;
      actions.push({ label: `${subStr} AI Soru Çöz`, url: '/soru-coz', icon: 'Target' });
    } else if (primaryIntent === 'schedule_request') {
      mainAnswer = `${subStr} dersini programının en verimli saatlerine eklemeliyiz. ` + mainAnswer;
    }
  }

  responseText += mainAnswer;

  // DİNAMİK SORU SORMA (PROACTIVE AI)
  // AI sadece cevap vermez, teşhis için öğrenciyi konuşturur.
  if (primaryIntent === 'subject_struggle' && userMessages.length < 4) {
     responseText += " Peki bu zorluk sence nereden kaynaklanıyor? Konu eksikliğinden mi, yoksa soruları yorumlamakta mı zorlanıyorsun?";
  } else if (primaryIntent === 'focus_issue' && userMessages.length < 4) {
     responseText += " Masaya oturduğunda aklını ilk çelen şey ne oluyor? Telefon mu, yoksa sürekli başka şeyler mi düşünüyorsun?";
  } else if (primaryIntent === 'exam_anxiety' && userMessages.length < 4) {
     responseText += " Bu kaygı en çok deneme çözerken mi yoksa sadece sınavı düşününce mi tetikleniyor?";
  }

  // İkinci (Ek) Niyet varsa, onu da cümlenin sonuna bağla
  if (intents.length > 1) {
    const secondaryIntent = intents[1];
    if (secondaryIntent === 'motivation_low') {
      responseText += " Ayrıca motivasyonunu sağlam tutmak için hedeflerini gözden geçirmeni öneririm.";
    } else if (secondaryIntent === 'focus_issue') {
      responseText += " Buna ek olarak odaklanma problemi yaşıyorsan, çevrendeki dikkat dağıtıcıları tamamen ortadan kaldırmalısın.";
    }
  }

  // Akıllı Aksiyon Yönlendirmeleri (Dynamic Actions Router)
  if (intents.includes('focus_issue')) {
    actions.push({ label: 'Pomodoro Başlat', url: '/pomodoro', icon: 'Timer' });
    actions.push({ label: 'Sanal Kütüphaneye Katıl', url: '/calisma-odalari', icon: 'Users' });
  }
  if (intents.includes('score_drop')) {
    actions.push({ label: 'Puanını & Sıralamanı Hesapla', url: '/puan-hesaplama', icon: 'Calculator' });
    actions.push({ label: 'Türkiye Geneli Denemeler', url: '/denemeler', icon: 'BarChart' });
  }
  if (intents.includes('schedule_request')) {
    actions.push({ label: 'Haftalık Programına Git', url: '/program', icon: 'Calendar' });
  }
  if (intents.includes('exam_anxiety')) {
    actions.push({ label: 'Sanal Kütüphanede Birlikte Çalış', url: '/calisma-odalari', icon: 'HeartHandshake' });
  }
  if (intents.includes('motivation_low')) {
    actions.push({ label: 'Arena Düellosuna Gir (Motivasyon)', url: '/duello', icon: 'Swords' });
  }

  // Duplicate action engelleme
  const uniqueActions = Array.from(new Set(actions.map(a => a.label)))
    .map(label => actions.find(a => a.label === label)!);

  return {
    text: responseText.trim(),
    actions: uniqueActions.length > 0 ? uniqueActions : undefined
  };
}



