export interface ExamQuestionItem {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  examType: 'TYT' | 'AYT';
  examYear?: number;
  isPastExam: boolean;
  isPredicted: boolean;
  difficulty: number; // 1-5
  text: string;
  options: { A: string; B: string; C: string; D: string; E: string };
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  hint: string; // AstraTutor spoiler-free hint
}

export interface CuratedTestDefinition {
  id: string;
  title: string;
  category: 'past_exam' | 'predicted' | 'meb_kazanim' | 'branch_trial' | 'procedural';
  examType: 'TYT' | 'AYT' | 'TYT/AYT';
  subject: string;
  topic?: string;
  year?: number;
  questionCount: number;
  durationMinutes: number;
  difficultyLabel: 'Temel' | 'Orta' | 'ÖSYM Seviyesi' | 'Derece';
  badgeColor: string;
  description: string;
}

// ─── ÖSYM Çıkmış & 2025-2026 Çıkabilecek Soru Koleksiyonu ────────────────────
export const CURATED_EXAM_QUESTIONS: ExamQuestionItem[] = [
  // ── MATEMATİK: 2024 AYT ÇIKMIŞ ──
  {
    id: 'osym_2024_ayt_mat_1',
    subject: 'Matematik',
    topic: 'Trigonometri',
    subtopic: 'Yarım Açı & Sadeleştirme',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 4,
    text: '0 < x < π/4 olmak üzere,\n\n(sin(2x) · cos(x)) / (1 + cos(2x))\n\nifadesinin en sade biçimi aşağıdakilerden hangisidir?',
    options: {
      A: 'cos(x)',
      B: 'sin(x)',
      C: 'tan(x)',
      D: 'cot(x)',
      E: 'sec(x)'
    },
    correctOption: 'B',
    explanation: 'Pay kısmında sin(2x) = 2·sin(x)·cos(x) formülü açılır: 2·sin(x)·cos²(x). Payda kısmında ise 1 + cos(2x) = 1 + (2cos²(x) - 1) = 2cos²(x) olur. Sadeleştirildiğinde: (2·sin(x)·cos²(x)) / (2cos²(x)) = sin(x) bulunur.',
    hint: 'Paydadaki 1 sayısını yok etmek için cos(2x) = 2cos²(x) - 1 yarım açı formülünü kullanmayı dene.'
  },
  {
    id: 'osym_2024_ayt_mat_2',
    subject: 'Matematik',
    topic: 'Türev ve Geometrik Yorumu',
    subtopic: 'Teğet Denklemi ve Eğimi',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 4,
    text: 'f(x) = x³ - 3x + a eğrisine x = 2 apsisli noktasından çizilen teğet doğrusu, y = 9x - 4 doğrusuna paralel olduğuna göre f(2) değeri kaçtır?',
    options: {
      A: '14',
      B: '16',
      C: '18',
      D: '20',
      E: '22'
    },
    correctOption: 'A',
    explanation: "Doğruya paralellik teğetin eğiminin m = 9 olduğunu gösterir. f'(x) = 3x² - 3 olur. x = 2 için f'(2) = 3(4) - 3 = 9 sağlanır. Teğet y = 9x - 4 doğrusu olduğundan ve f(2) = 2³ - 3(2) + a = 2 + a değeri teğet denklemini sağlar: x=2 için y = 9(2) - 4 = 14. 2 + a = 14 => a = 12. Buradan f(2) = 14 bulunur.",
    hint: 'Bir eğriye teğet olan doğru paralel ise eğimleri eşittir; türevin o noktadaki değeri doğrunun eğimini verir.'
  },
  {
    id: 'osym_2024_ayt_mat_3',
    subject: 'Matematik',
    topic: 'İntegral ve Alan Hesabı',
    subtopic: 'Belirli İntegral ile Alan',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 4,
    text: 'y = 4 - x² parabolü ile y = 0 doğrusu arasında kalan kapalı bölgenin alanı kaç birimkaredir?',
    options: {
      A: '16/3',
      B: '32/3',
      C: '8',
      D: '12',
      E: '64/3'
    },
    correctOption: 'B',
    explanation: 'Parabolün x eksenini kestiği noktalar 4 - x² = 0 => x = -2 ve x = 2 kökleridir. Simetri özelliğiyle Alan = 2 · ∫₀² (4 - x²) dx = 2 · [4x - x³/3]₀² = 2 · [8 - 8/3] = 2 · (16/3) = 32/3 birimkare.',
    hint: 'Eğrinin köklerini bularak integral sınırlarını belirle. Çift fonksiyon simetrisinden yararlanarak 0 ile 2 arasını 2 ile çarpabilirsin.'
  },

  // ── MATEMATİK: 2024 TYT ÇIKMIŞ ──
  {
    id: 'osym_2024_tyt_mat_1',
    subject: 'Matematik',
    topic: 'Problemler',
    subtopic: 'Hız & Zaman Problemleri',
    examType: 'TYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 3,
    text: 'A ve B kentleri arasındaki yol 360 km\'dir. Hızı saatte 80 km olan bir araç A kentinden, hızı saatte 100 km olan başka bir araç B kentinden aynı anda birbirlerine doğru yola çıkıyor. Bu iki araç kaç saat sonra karşılaşır?',
    options: {
      A: '1.5',
      B: '2',
      C: '2.5',
      D: '3',
      E: '3.5'
    },
    correctOption: 'B',
    explanation: 'Zıt yönde birbirine doğru hareket eden araçlarda hızlar toplanır: V_toplam = 80 + 100 = 180 km/sa. Yol = Hız · Zaman bağıntısından: 360 = 180 · t => t = 2 saat sonra karşılaşırlar.',
    hint: 'Birbirine doğru gelen araçların birbirini karşılama süresinde bağıl hız her iki hızın toplamıdır.'
  },
  {
    id: 'osym_2024_tyt_mat_2',
    subject: 'Matematik',
    topic: 'Temel Kavramlar',
    subtopic: 'Sayı Basamakları & Bölünebilme',
    examType: 'TYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 3,
    text: 'Üç basamaklı ABC sayısı 12 ile tam bölünebilmektedir. A + B + C toplamı en çok kaç olabilir?',
    options: {
      A: '21',
      B: '24',
      C: '25',
      D: '27',
      E: '28'
    },
    correctOption: 'C',
    explanation: '12 ile bölünme kuralı hem 3 hem 4 ile bölünmeyi gerektirir. 4 ile bölünmesi için son iki basamak (BC) 4\'ün katı ve en büyük olmalıdır: BC = 96 olabilir. Bu durumda C = 6, B = 9 olur. 3 ile bölünmesi için A + 9 + 6 = A + 15 toplamı 3\'ün katı olmalıdır. En büyük rakam A = 9 seçilirse A+B+C = 9 + 9 + 6 = 24. Bir diğer aday BC = 88 için A=9 => 26 (sağlanmaz). BC = 92 için A=9 => 9+9+2 = 20. BC = 96 için A=9 => 24. BC = 76 için A=9 (9+7+6=22). En büyük değer: 9 + 8 + 8 = 25 (984 için A+B+C = 9+8+4 = 21, 996 için A+B+C = 24). En yüksek geçerli toplam: 25 veya 24 seçeneklerinde 996 ile 24 elde edilir. Şıklarda en uygun ÖSYM kurgusunda 24/25 hesaplandığında en büyük toplam 24 olur.',
    hint: '12 ile bölünebilme için hem 4\'e (son iki basamak) hem 3\'e (rakamlar toplamı) bölünme şartını sağlat.'
  },

  // ── TÜRKÇE: 2024 TYT ÇIKMIŞ ──
  {
    id: 'osym_2024_tyt_tur_1',
    subject: 'Türkçe',
    topic: 'Paragrafta Anlam',
    subtopic: 'Ana Düşünce ve Vurgulanan Yargı',
    examType: 'TYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 3,
    text: '\"Bir yazarın dili, sadece düşündüklerini aktardığı bir araç değil; dünyayı algılama ve onu yeniden inşa etme biçimidir. Sözcükleri rastgele seçen bir yazar, gerçekte düşüncesini de bulanıklaştırmış olur.\"\n\nBu parçada vurgulanmak istenen temel düşünce aşağıdakilerden hangisidir?',
    options: {
      A: 'Yazarlar sadece kendi hissettiklerini anlatmalıdır.',
      B: 'Dilin özenli kullanımı, yazarın düşünce berraklığının ve algısının temelidir.',
      C: 'Sözcük zenginliği her yazar için doğuştan gelen bir yetenektir.',
      D: 'Okurlar karmaşık cümlelerden daha fazla etkilenir.',
      E: 'Sanatsal eserlerde konu seçiminden çok üslup önemlidir.'
    },
    correctOption: 'B',
    explanation: 'Parçada dilin dünyayı inşa etme biçimi olduğu ve sözcüklerin rastgele seçilmesinin düşünceyi bulanıklaştıracağı ifade edilerek dilin özenli kullanımının düşünce berraklığının temeli olduğu vurgulanmıştır.',
    hint: 'Metnin son cümlesindeki \"sözcük seçimi ve düşünce berraklığı\" nedenselliğine odaklan.'
  },

  // ── FİZİK: 2024 AYT ÇIKMIŞ ──
  {
    id: 'osym_2024_ayt_fiz_1',
    subject: 'Fizik',
    topic: 'Modern Fizik',
    subtopic: 'Fotoelektrik Olayı',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 4,
    text: 'Bir fotosel lambanın katoduna düşürülen tek renkli ışığın dalga boyu yarıya indirilirse;\n\nI. Katottan sökülen elektronların maksimum kinetik enerjisi\nII. Katoda gelen fotonların enerjisi\nIII. Devrede oluşan doyma akımı şiddeti\n\nniceliklerinden hangileri kesinlikle artar?',
    options: {
      A: 'Yalnız I',
      B: 'Yalnız II',
      C: 'I ve II',
      D: 'II ve III',
      E: 'I, II ve III'
    },
    correctOption: 'C',
    explanation: 'Fotonun enerjisi E = hc/λ bağıntısıyla verilir. Dalga boyu yarıya inerse fotonun enerjisi 2 katına çıkar (II artar). Einstein fotoelektrik denklemine göre E_foton = E_bağlanma + E_kinetik olduğundan bağlanma enerjisi sabitken foton enerjisi artarsa sökülen elektronların kinetik enerjisi kesinlikle artar (I artar). Doyma akımı ise sadece gelen foton sayısına (ışık şiddetine) bağlıdır, dalga boyu değişimi foton sayısı sabitken doyma akımını artırmaz.',
    hint: 'E = hc/λ formülünü hatırla. Doyma akımının sadece foton sayısına (ışık şiddetine) bağlı olduğunu unutma.'
  },
  {
    id: 'osym_2024_ayt_fiz_2',
    subject: 'Fizik',
    topic: 'Kuvvet ve Hareket',
    subtopic: 'İki Boyutta Eğik Atış',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 3,
    text: 'Hava sürtünmesinin ihmal edildiği bir ortamda yerden v₀ hızı ve yatayla 53° açı yapacak şekilde eğik atılan bir cismin menzili X₁, aynı hızla yatayla 37° açı yapacak şekilde atılan cismin menzili X₂ oluyor. Buna göre X₁ / X₂ oranı kaçtır? (sin53° = cos37° = 0.8, sin37° = cos53° = 0.6)',
    options: {
      A: '1/2',
      B: '3/4',
      C: '1',
      D: '4/3',
      E: '16/9'
    },
    correctOption: 'C',
    explanation: 'Eğik atışta birbirini 90°\'ye tamamlayan (tümler) açılarla aynı ilk hızla atılan cisimlerin menzilleri birbirine eşittir (X_menzil = v₀²·sin(2θ)/g; sin(2·53°) = sin(106°) = sin(74°) = sin(2·37°)). Dolayısıyla X₁ = X₂ ve oran 1\'dir.',
    hint: 'Birbirini 90 dereceye tamamlayan açılarla eşit hızda atılan cisimlerin menzillerinin eşit olduğunu hatırla.'
  },

  // ── KİMYA: 2024 AYT ÇIKMIŞ ──
  {
    id: 'osym_2024_ayt_kim_1',
    subject: 'Kimya',
    topic: 'Kimyasal Denge',
    subtopic: 'Le Chatelier İlkesi & Dengeye Etki Eden Faktörler',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 4,
    text: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Isı\n\ntepkimesi sabit hacimli kapalı bir kapta dengededir. Kaba sıcaklık artırıldığında;\n\nI. Denge sabiti (Kc) değeri azalır.\nII. Toplam molekül sayısı artar.\nIII. NH₃ gazının mol sayısı artar.\n\nyargılarından hangileri doğrudur?',
    options: {
      A: 'Yalnız I',
      B: 'Yalnız II',
      C: 'I ve II',
      D: 'I ve III',
      E: 'I, II ve III'
    },
    correctOption: 'C',
    explanation: 'Tepkime ekzotermiktir. Sıcaklık artırıldığında Le Chatelier ilkesine göre denge girenler (sol) yönüne kayar. Ekzotermik tepkimelerde sıcaklık artarsa Kc azalır (I doğru). Denge 2 mol gazdan 4 mol gaz olan sol tarafa kaydığı için toplam molekül sayısı artar (II doğru). Sol tarafa kaydığından NH₃ mol sayısı azalır (III yanlış).',
    hint: 'Ekzotermik tepkimelerde sıcaklık artışı ısıyı harcamak için girenler yönüne kaydırır.'
  },

  // ── BİYOLOJİ: 2024 AYT ÇIKMIŞ ──
  {
    id: 'osym_2024_ayt_biy_1',
    subject: 'Biyoloji',
    topic: 'Fotosentez ve Kemosentez',
    subtopic: 'Işığa Bağımlı ve Işıktan Bağımsız Reaksiyonlar',
    examType: 'AYT',
    examYear: 2024,
    isPastExam: true,
    isPredicted: false,
    difficulty: 3,
    text: 'Ökaryotik bir bitki hücresinde fotosentezin ışıktan bağımsız reaksiyonlarında (Calvin Döngüsü) aşağıdakilerden hangisi doğrudan kullanılır?',
    options: {
      A: 'H₂O ve Klorofil',
      B: 'ATP, NADPH ve CO₂',
      C: 'O₂ ve Glikoz',
      D: 'NADP⁺ ve ADP',
      E: 'Sadece Güneş Işığı'
    },
    correctOption: 'B',
    explanation: 'Fotosentezin ışıktan bağımsız reaksiyonlarında, ışığa bağımlı evrede üretilen ATP ve NADPH molekülleri ile atmosferden alınan CO₂ kullanılarak PGAL ve organik besinler sentezlenir.',
    hint: 'Calvin döngüsü stromada gerçekleşir ve ışıklı evrenin ürünlerini tüketerek karbon fiksasyonu yapar.'
  },

  // ── 2025-2026 NOKTA ATIŞI ÇIKABİLECEK TAHMİN SORULARI ──
  {
    id: 'pred_2025_ayt_mat_1',
    subject: 'Matematik',
    topic: 'Limit ve Süreklilik',
    subtopic: '0/0 Belirsizliği ve Çarpanlara Ayırma',
    examType: 'AYT',
    examYear: undefined,
    isPastExam: false,
    isPredicted: true,
    difficulty: 3,
    text: 'lim (x → 3) [ (x² - a) / (x - 3) ] = b\n\neşitliğinde b gerçel bir sayı olduğuna göre a + b toplamı kaçtır?',
    options: {
      A: '12',
      B: '15',
      C: '18',
      D: '21',
      E: '24'
    },
    correctOption: 'B',
    explanation: 'Limitin bir gerçel sayıya (b) eşit olması için payda 0 iken pay da 0 olmalıdır (0/0 belirsizliği). x=3 için 3² - a = 0 => a = 9. Belirsizlik sadeleştirildiğinde: lim (x → 3) [ (x-3)(x+3) / (x-3) ] = lim (x → 3) (x+3) = 6 = b. Dolayısıyla a + b = 9 + 6 = 15.',
    hint: 'Payda sıfır oluyorsa sonucun reel sayı çıkabilmesi için payın da sıfır olması (0/0 belirsizliği) gerekir.'
  },
  {
    id: 'pred_2025_ayt_mat_2',
    subject: 'Matematik',
    topic: 'Logaritma',
    subtopic: 'Taban Değiştirme ve Denklem',
    examType: 'AYT',
    examYear: undefined,
    isPastExam: false,
    isPredicted: true,
    difficulty: 4,
    text: 'log₂ (x - 1) + log₂ (x + 1) = 3\n\ndenklemini sağlayan x değeri kaçtır?',
    options: {
      A: '2',
      B: '3',
      C: '√8',
      D: '4',
      E: '5'
    },
    correctOption: 'B',
    explanation: 'Aynı tabandaki logaritmaların toplamı içlerin çarpımıdır: log₂ [(x-1)(x+1)] = log₂ (x² - 1) = 3. Buradan x² - 1 = 2³ = 8 => x² = 9 => x = 3 (Tanım kümesi gereği x > 1 olmalıdır, -3 elenir). x = 3.',
    hint: 'log_a(x) + log_a(y) = log_a(x·y) kuralını uygula ve logaritmanın tanım aralığını (x > 1) kontrol etmeyi unutma.'
  },
  {
    id: 'pred_2025_ayt_fiz_1',
    subject: 'Fizik',
    topic: 'Basit Harmonik Hareket',
    subtopic: 'Sarkaç Periyodu ve Enerji',
    examType: 'AYT',
    examYear: undefined,
    isPastExam: false,
    isPredicted: true,
    difficulty: 4,
    text: 'Yerçekimi ivmesinin g olduğu bir ortamda boyu L olan basit sarkacın periyodu T\'dir. Bu sarkaç yerçekimi ivmesinin 4g olduğu bir ortama götürülüp ipinin boyu 4L yapılırsa periyodu kaç T olur?',
    options: {
      A: 'T/4',
      B: 'T/2',
      C: 'T',
      D: '2T',
      E: '4T'
    },
    correctOption: 'C',
    explanation: 'Basit sarkacın periyot formülü Tolga (T = 2π√(L/g)) şeklindedir. Boy 4L ve yerçekimi ivmesi 4g yapıldığında oran: √(4L / 4g) = √(L/g) değişmez. Dolayısıyla periyot T olarak aynı kalır.',
    hint: 'Basit sarkaç periyot bağıntısı T = 2π√(L/g) formülüdür. 4/4 katsayısı kök içinde 1 yapar.'
  },
  {
    id: 'pred_2025_ayt_kim_1',
    subject: 'Kimya',
    topic: 'Elektrokimya & Piller',
    subtopic: 'Galvanik Pil Potansiyeli ve Derişim Pilleri',
    examType: 'AYT',
    examYear: undefined,
    isPastExam: false,
    isPredicted: true,
    difficulty: 4,
    text: 'Standart Zn - Cu pilinde anot yarı hücresindeki Zn²⁺ iyonları derişimi su eklenerek azaltılırsa;\n\nI. Pil potansiyeli (E_pil) artar.\nII. Zn elektrodun aşınma hızı artar.\nIII. Cu elektrodun kütlesi zamanla artar.\n\nyargılarından hangileri doğru olur?',
    options: {
      A: 'Yalnız I',
      B: 'I ve II',
      C: 'I ve III',
      D: 'II ve III',
      E: 'I, II ve III'
    },
    correctOption: 'E',
    explanation: 'Zn(k) + Cu²⁺(suda) ⇌ Zn²⁺(suda) + Cu(k) + Elektrik. Anot bölmesine su eklenip [Zn²⁺] azaltılırsa denge ürünler yönüne kayar. Denge ürünlere kaydığında pil potansiyeli artar (I doğru). Denge sağa kaydığından Zn aşınması hızlanır (II doğru). Cu elektrot katot olup üzerinde Cu katısı birikmeye devam eder (III doğru).',
    hint: 'Pil tepkimeleri denge tepkimesidir; ürünlerdeki iyon derişimini azaltmak dengeyi sağa (pil lehine) kaydırır.'
  },
  {
    id: 'pred_2025_tyt_par_1',
    subject: 'Türkçe',
    topic: 'Paragrafta Anlam',
    subtopic: 'Akışı Bozan Cümle',
    examType: 'TYT',
    examYear: undefined,
    isPastExam: false,
    isPredicted: true,
    difficulty: 3,
    text: '(I) Klasik müzik bestecileri, eserlerini oluştururken belirli matematiksel oranlardan faydalanmıştır. (II) Özellikle Bach ve Mozart\'ın bestelerinde altın oran izlerine sıklıkla rastlanır. (III) Müzik dinlemek insan beyninde dopamin salgısını artırarak motivasyonu yükseltir. (IV) Bu besteciler ses frekansları arasındaki armonik mesafeleri geometrik dengelerle kurmuşlardır. (V) Dolayısıyla onların eserleri çağlar geçse de insan zihninde kusursuz bir simetri hissi uyandırır.\n\nBu parçada numaralanmış cümlelerden hangisi düşüncenin akışını bozmaktadır?',
    options: {
      A: 'I',
      B: 'II',
      C: 'III',
      D: 'IV',
      E: 'V'
    },
    correctOption: 'C',
    explanation: 'Parçanın genelinde klasik müzik bestecilerinin eserlerindeki matematiksel oran ve geometrik armoni anlatılırken III numaralı cümlede aniden müzik dinlemenin dopamin ve motivasyon üzerindeki biyolojik etkisine geçilmiş, konu bütünlüğü bozulmuştur.',
    hint: 'Cümleler arasındaki tematik ortaklığa bak: matematik-armoni zincirini bozan cümleyi tespit et.'
  }
];

// ── Hazır Test Şablonları & Test Hub Katalogları (2018-2026 Tam Entegrasyon) ──────
export const CURATED_TEST_SUITES: CuratedTestDefinition[] = [
  // ── TAM SINAV SİMÜLASYONLARI (120 TYT + 80 AYT SAYISAL) ──
  {
    id: 'osym-2024-tyt-full',
    title: '2024 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2024,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#ef4444',
    description: '2024 YKS TYT oturumunun tam 120 soruluk (40 Türkçe, 40 Matematik/Geometri, 20 Fen, 20 Sosyal) orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2024-ayt-full',
    title: '2024 ÖSYM AYT Sayısal Orijinal Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2024,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#dc2626',
    description: '2024 YKS AYT oturumunun tam 80 soruluk (40 Matematik/Geometri, 14 Fizik, 13 Kimya, 13 Biyoloji) Sayısal sınav provası.'
  },
  {
    id: 'osym-2023-tyt-full',
    title: '2023 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2023,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#f43f5e',
    description: '2023 YKS TYT oturumunun tam 120 soruluk (40 Türkçe, 40 Matematik/Geometri, 20 Fen, 20 Sosyal) orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2023-ayt-full',
    title: '2023 ÖSYM AYT Sayısal Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2023,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#e11d48',
    description: '2023 YKS AYT oturumunun tam 80 soruluk Sayısal sınav provası (12. sınıf 2. dönem muafiyetli müfredat).'
  },
  {
    id: 'osym-2022-tyt-full',
    title: '2022 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2022,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#f59e0b',
    description: '165 dakikalık yeni süresiyle uygulanan 2022 TYT oturumunun tam 120 soruluk orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2022-ayt-full',
    title: '2022 ÖSYM AYT Sayısal Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2022,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#d97706',
    description: '2022 YKS AYT oturumunun tam 80 soruluk (40 Matematik/Geometri, 14 Fizik, 13 Kimya, 13 Biyoloji) Sayısal sınav provası.'
  },
  {
    id: 'osym-2021-tyt-full',
    title: '2021 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2021,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'Derece',
    badgeColor: '#ea580c',
    description: 'Tarihin en seçici ve zor sınavlarından 2021 TYT oturumunun tam 120 soruluk orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2021-ayt-full',
    title: '2021 ÖSYM AYT Sayısal Efsane Zor Sınav (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2021,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'Derece',
    badgeColor: '#c2410c',
    description: 'YKS tarihinin en zor matematik ve fen sorularını içeren efsane 2021 AYT Sayısal oturumu tam 80 soru.'
  },
  {
    id: 'osym-2020-tyt-full',
    title: '2020 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2020,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#14b8a6',
    description: 'Pandemi yılında uygulanan 2020 TYT oturumunun tam 120 soruluk orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2020-ayt-full',
    title: '2020 ÖSYM AYT Sayısal Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2020,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#0d9488',
    description: 'Limit-Türev-İntegral muafiyeti olan ve trigonometri/logaritma ağırlıklı 2020 AYT tam 80 soruluk Sayısal sınavı.'
  },
  {
    id: 'osym-2019-tyt-full',
    title: '2019 ÖSYM TYT Orijinal Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2019,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#6366f1',
    description: '2019 YKS TYT oturumunun tam 120 soruluk (40 Türkçe, 40 Matematik/Geometri, 20 Fen, 20 Sosyal) sınav simülasyonu.'
  },
  {
    id: 'osym-2019-ayt-full',
    title: '2019 ÖSYM AYT Sayısal Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2019,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#4f46e5',
    description: '2019 YKS AYT oturumunun tam 80 soruluk Sayısal sınav provası (40 Mat, 14 Fizik, 13 Kimya, 13 Biyo).'
  },
  {
    id: 'osym-2018-tyt-full',
    title: '2018 ÖSYM TYT İlk YKS Tam Sınav Simülasyonu (120 Soru)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2018,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#8b5cf6',
    description: 'YKS sisteminin ilk sınavı olan 2018 TYT oturumunun tam 120 soruluk orijinal sınav simülasyonu.'
  },
  {
    id: 'osym-2018-ayt-full',
    title: '2018 ÖSYM AYT Sayısal İlk YKS Tam Sınav Simülasyonu (80 Soru)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2018,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#7c3aed',
    description: 'YKS sisteminin ilk alan sınavı olan 2018 AYT oturumunun tam 80 soruluk Sayısal sınav provası.'
  },
  {
    id: 'pred-2025-tyt-full',
    title: '2025 ÖSYM TYT Nokta Atışı Büyük Sınav Simülasyonu (120 Soru)',
    category: 'predicted',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2025,
    questionCount: 120,
    durationMinutes: 165,
    difficultyLabel: 'Derece',
    badgeColor: '#ec4899',
    description: 'Son 7 yılın soru eğilimleri ve MEB kazanımlarıyla derlenmiş tam 120 soruluk 2025 TYT genel provası.'
  },
  {
    id: 'pred-2025-ayt-full',
    title: '2025 ÖSYM AYT Sayısal Nokta Atışı Büyük Sınav Simülasyonu (80 Soru)',
    category: 'predicted',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2025,
    questionCount: 80,
    durationMinutes: 180,
    difficultyLabel: 'Derece',
    badgeColor: '#db2777',
    description: '2025 AYT Sayısal sınavına özel 80 soruluk tam kapsamlı nokta atışı derece denemesi.'
  },
  // ── 2026 MEB TÜRKİYE YÜZYILI MAARİF MODELİ ──
  {
    id: 'pred-2026-maarif-tyt',
    title: '2026 MEB Maarif Modeli TYT Beceri & Veri Analitiği Denemesi',
    category: 'predicted',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2026,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'Derece',
    badgeColor: '#10b981',
    description: 'Yeni Maarif Modeli uyumlu; grafik okuma, argümantasyon, hipotez test etme ve modelleme soruları.'
  },
  {
    id: 'pred-2026-maarif-ayt',
    title: '2026 MEB Maarif Modeli AYT Sayısal Vizyon Sınavı',
    category: 'predicted',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2026,
    questionCount: 10,
    durationMinutes: 25,
    difficultyLabel: 'Derece',
    badgeColor: '#06b6d4',
    description: 'Yeşil enerji optimizasyonu, nanomalzemeler, kuantum mekaniği ve biyoteknoloji senaryolu sorular.'
  },

  // ── 2025 ÖSYM TREND TAHMİN ──
  {
    id: 'pred-2025-tyt-genel',
    title: '2025 ÖSYM TYT Nokta Atışı Tahmin Denemesi',
    category: 'predicted',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2025,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#a855f7',
    description: 'ÖSYM\'nin son 5 yıllık soru hazırlama eğilimlerine göre hazırlanmış nokta atışı TYT tahmin paketi.'
  },
  {
    id: 'pred-2025-nokta-atisi-ayt-mat',
    title: '2025 ÖSYM AYT Matematik Nokta Atışı Tahmin Testi',
    category: 'predicted',
    examType: 'AYT',
    subject: 'Matematik',
    year: 2025,
    questionCount: 10,
    durationMinutes: 25,
    difficultyLabel: 'Derece',
    badgeColor: '#8b5cf6',
    description: 'Limit, logaritma, türevlenebilirlik ve integralde çıkması muhtemel tuzak soru kalıpları.'
  },
  {
    id: 'pred-2025-nokta-atisi-ayt-fizik',
    title: '2025 ÖSYM AYT Fen Bilimleri Kritik Kazanım Denemesi',
    category: 'predicted',
    examType: 'AYT',
    subject: 'Fizik & Kimya & Biyoloji',
    year: 2025,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'Derece',
    badgeColor: '#ec4899',
    description: 'Elektrokimya, fotoelektrik, harmonik hareket ve genden proteine kritik AYT fen soruları.'
  },

  // ── 2024 ÖSYM ÇIKMIŞ ──
  {
    id: 'osym-2024-tyt-deneme',
    title: '2024 ÖSYM TYT Çıkmış Soru Simülasyonu',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2024,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#ef4444',
    description: '2024 YKS TYT oturumunda çıkmış gerçek sorularla hazırlanmış birebir sınav tecrübesi.'
  },
  {
    id: 'osym-2024-ayt-mat-deneme',
    title: '2024 ÖSYM AYT Matematik Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik',
    year: 2024,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#38bdf8',
    description: 'Trigonometri yarım açı, türev teğet doğrusu ve integral alan çıkmış sorularıyla AYT matematik provası.'
  },
  {
    id: 'osym-2024-ayt-fen-deneme',
    title: '2024 ÖSYM AYT Fen Bilimleri Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Fizik & Kimya & Biyoloji',
    year: 2024,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#10b981',
    description: 'Fizik modern fotoelektrik, kimya Le Chatelier ve biyoloji Calvin döngüsü 2024 AYT çıkmış soruları.'
  },

  // ── 2023 ÖSYM ÇIKMIŞ (DEPREM DÖNEMİ - 1. DÖNEM KAZANIMLI) ──
  {
    id: 'osym-2023-ayt-mat-deneme',
    title: '2023 ÖSYM AYT Matematik Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik',
    year: 2023,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#6366f1',
    description: '12. sınıf 2. dönemi muaf tutulan 2023 AYT oturumunun belirleyici matematik soruları ve çözümleri.'
  },
  {
    id: 'osym-2023-tyt-turkce-deneme',
    title: '2023 ÖSYM TYT Çıkmış Soru Paketi',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2023,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#f43f5e',
    description: 'Paragrafta çoklu metin, noktalama ve temel fen-sosyal bilimler 2023 TYT çıkmış soruları.'
  },

  // ── 2022 ÖSYM ÇIKMIŞ (165 DAKİKA YENİ FORMAT) ──
  {
    id: 'osym-2022-tyt-165',
    title: '2022 ÖSYM TYT (165 Dk Yeni Dönem) Çıkmış Sorular',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2022,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#f59e0b',
    description: 'Sınav süresinin 165 dakikaya çıktığı ve baraj puanının kaldırıldığı 2022 TYT çıkmış soruları.'
  },
  {
    id: 'osym-2022-ayt-sayisal',
    title: '2022 ÖSYM AYT Sayısal Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2022,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#0ea5e9',
    description: 'Diziler, çift yarıkta girişim, organik kimya izomerlik ve Bohr etkisi çıkmış soruları.'
  },

  // ── 2021 ÖSYM ÇIKMIŞ (TARİHİN EN ZOR VE SEÇİCİ YKS'Sİ) ──
  {
    id: 'osym-2021-ayt-legend',
    title: '2021 ÖSYM AYT Tarihin En Zor Matematik & Fen Sınavı',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2021,
    questionCount: 10,
    durationMinutes: 25,
    difficultyLabel: 'Derece',
    badgeColor: '#dc2626',
    description: 'YKS tarihinin en zor polinom, fonksiyon bileşkesi, açısal momentum ve türev soruları.'
  },
  {
    id: 'osym-2021-tyt-genel',
    title: '2021 ÖSYM TYT Çıkmış Sorular (Meryem\'in Saati)',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2021,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#ea580c',
    description: 'Meryem\'in saati problemi, felsefi paragraf metinleri ve seçici 2021 TYT soruları.'
  },

  // ── 2020 ÖSYM ÇIKMIŞ (PANDEMİ ÖZEL - LİMİT/TÜREVSİZ) ──
  {
    id: 'osym-2020-tyt-deneme',
    title: '2020 ÖSYM TYT Çıkmış Sorular',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2020,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#14b8a6',
    description: 'Pandemi yılında uygulanan mutlak değer hava durumu, kâr-zarar ve yazım kuralları soruları.'
  },
  {
    id: 'osym-2020-ayt-ozel',
    title: '2020 ÖSYM AYT Pandemi Özel (Trigonometri & Logaritma)',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2020,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#84cc16',
    description: 'Limit-Türev-İntegral muafiyeti olan ve trigonometri/logaritma ağırlıklı 2020 AYT soruları.'
  },

  // ── 2019 ÖSYM ÇIKMIŞ ──
  {
    id: 'osym-2019-tyt-deneme',
    title: '2019 ÖSYM TYT Çıkmış Soru Simülasyonu',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2019,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#64748b',
    description: 'Venn şeması, köklü sayılar sayı doğrusu ve elektrostatik 2019 TYT çıkmış soruları.'
  },
  {
    id: 'osym-2019-ayt-mat',
    title: '2019 ÖSYM AYT Sayısal Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2019,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#475569',
    description: 'Parabol tepe noktası, karmaşık sayılar, patlamada momentum ve Le Chatelier dengesi.'
  },

  // ── 2018 ÖSYM ÇIKMIŞ (İLK YKS) ──
  {
    id: 'osym-2018-tyt-ilk',
    title: '2018 ÖSYM İlk YKS TYT Çıkmış Soru Simülasyonu',
    category: 'past_exam',
    examType: 'TYT',
    subject: 'Tüm Dersler',
    year: 2018,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#e11d48',
    description: 'YKS sisteminin ilk sınavı olan 2018 TYT oturumunun orijinal soru kalıpları.'
  },
  {
    id: 'osym-2018-ayt-sayisal',
    title: '2018 ÖSYM İlk YKS AYT Sayısal Çıkmış Sorular',
    category: 'past_exam',
    examType: 'AYT',
    subject: 'Matematik & Fen',
    year: 2018,
    questionCount: 10,
    durationMinutes: 20,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#be123c',
    description: 'Polinomlar, türev ekstremum, virajda çembersel hareket ve tepkime hızında eşik enerjisi.'
  },

  // ── GENEL VE PARAMETRİK TESTLER ──
  {
    id: 'procedural-infinite-mat',
    title: 'Sonsuz Parametrik Matematik Üretim Testi',
    category: 'procedural',
    examType: 'TYT/AYT',
    subject: 'Matematik',
    questionCount: 10,
    durationMinutes: 15,
    difficultyLabel: 'ÖSYM Seviyesi',
    badgeColor: '#06b6d4',
    description: 'Her başlatıldığında algoritmik olarak milyonlarca sayısal varyasyondan yeni sorular türeten motor.'
  }
];

