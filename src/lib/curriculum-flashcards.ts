export interface CurriculumFlashcard {
  id: string;
  subject: string;
  topic: string;
  category: 'TYT' | 'AYT' | 'TYT/AYT';
  front_text: string;
  back_text: string;
  tip?: string;
}

export const SUBJECT_LIST = [
  'Matematik',
  'Geometri',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Türkçe',
  'Türk Dili ve Edebiyatı',
  'Tarih',
  'Coğrafya',
  'Felsefe & Din'
] as const;

export const CURRICULUM_FLASHCARDS: CurriculumFlashcard[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // ── MATEMATİK (TYT & AYT) ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-001',
    subject: 'Matematik',
    topic: 'Temel Kavramlar',
    category: 'TYT',
    front_text: 'Ardışık n tane tek sayının toplamı nasıl pratik olarak hesaplanır?',
    back_text: '1 + 3 + 5 + ... + (2n - 1) = n² formülüyle hesaplanır.\nÖrn: İlk 10 tek sayının toplamı = 10² = 100.',
    tip: '💡 Son terim 2n - 1 olarak eşitlenip n bulunur, ardından n² alınır.'
  },
  {
    id: 'mat-002',
    subject: 'Matematik',
    topic: 'Bölünebilme Kuralları',
    category: 'TYT',
    front_text: '11 ile bölünebilme kuralı nedir?',
    back_text: 'Sayının basamakları sağdan sola doğru +, -, +, -, ... şeklinde işaretlenir. İşaretli toplam 11\'in katı veya 0 ise sayı 11\'e tam bölünür.',
    tip: '⚠️ Sağdan (birler basamağından) ve mutlaka (+) ile başlamayı unutmayın!'
  },
  {
    id: 'mat-003',
    subject: 'Matematik',
    topic: 'EBOB - EKOK',
    category: 'TYT',
    front_text: 'İki pozitif tam sayı a ve b için EBOB ve EKOK çarpımı neye eşittir?',
    back_text: 'EBOB(a, b) × EKOK(a, b) = a × b\n(Bu bağıntı yalnızca iki sayı için geçerlidir, üç sayı için geçerli değildir).',
    tip: '⚡ Aralarında asal iki sayının EBOB\'u 1, EKOK\'u ise çarpımları (a × b) olur.'
  },
  {
    id: 'mat-004',
    subject: 'Matematik',
    topic: 'Mutlak Değer',
    category: 'TYT',
    front_text: '|x - a| + |x - b| ifadesinin alabileceği en küçük değer nedir?',
    back_text: 'Kritik noktalardan biri (x = a veya x = b) yerine yazıldığında çıkan değerdir ve geometrik olarak |a - b| uzunluğuna eşittir.',
    tip: '🎯 Sayı doğrusu üzerinde x noktasının a ve b noktalarına olan uzaklıkları toplamıdır.'
  },
  {
    id: 'mat-005',
    subject: 'Matematik',
    topic: 'Üslü ve Köklü Sayılar',
    category: 'TYT',
    front_text: '√(a ± 2√b) iç içe kök kuralı nasıl çözülür?',
    back_text: 'Çarpımları b, toplamları a olan iki sayı m ve n (m > n) olmak üzere:\n√(a ± 2√b) = √m ± √n\nÖrn: √(8 + 2√15) = √5 + √3 (5×3=15, 5+3=8).',
    tip: '⚠️ İçteki kökün katsayısı mutlaka 2 olmalıdır. Değilse 2 çarpanı içeri alınır veya dışarı çıkarılır.'
  },
  {
    id: 'mat-006',
    subject: 'Matematik',
    topic: 'Çarpanlara Ayırma',
    category: 'TYT',
    front_text: 'İki küp toplamı ve farkı (a³ ± b³) açılımları nasıldır?',
    back_text: 'a³ + b³ = (a + b)(a² - ab + b²)\na³ - b³ = (a - b)(a² + ab + b²)',
    tip: '🔑 İpucu: İlk parantezin işareti ana işaretle aynı, ikinci parantezdeki çarpım teriminin (ab) işareti zıttır.'
  },
  {
    id: 'mat-007',
    subject: 'Matematik',
    topic: 'Fonksiyonlar',
    category: 'TYT/AYT',
    front_text: 'Tek ve Çift fonksiyonların cebirsel ve grafiksel özellikleri nelerdir?',
    back_text: '• Çift Fonksiyon: f(-x) = f(x). Grafiği y-eksenine göre simetriktir. (Tüm dereceler çift)\n• Tek Fonksiyon: f(-x) = -f(x). Grafiği orijine (0,0) göre simetriktir. (Tüm dereceler tek)',
    tip: '🚨 ÖSYM uyarısı: Orijine göre simetrik denildiğinde hemen f(-x) = -f(x) tek fonksiyon özelliğini uygulayın.'
  },
  {
    id: 'mat-008',
    subject: 'Matematik',
    topic: 'Polinomlar',
    category: 'AYT',
    front_text: 'P(x) polinomunun (ax - b) ile bölümünden kalan nasıl bulunur?',
    back_text: 'Bölen sıfıra eşitlenir: ax - b = 0 ⇒ x = b/a.\nBulunan değer P(x)\'te yerine yazılır: Kalan = P(b/a).',
    tip: '🎯 Polinom bölmesi yapmadan doğrudan kökü yerine yazmak süreyi yarıya indirir.'
  },
  {
    id: 'mat-009',
    subject: 'Matematik',
    topic: 'İkinci Dereceden Denklemler',
    category: 'AYT',
    front_text: 'ax² + bx + c = 0 denkleminde Kökler Toplamı ve Çarpımı formülleri nelerdir?',
    back_text: '• Kökler Toplamı: x₁ + x₂ = -b / a\n• Kökler Çarpımı: x₁ · x₂ = c / a\n• Kökler Farkının Mutlak Değeri: |x₁ - x₂| = √Δ / |a|',
    tip: '⭐ Kökleri x₁ ve x₂ olan denklem: x² - (x₁ + x₂)x + (x₁ · x₂) = 0'
  },
  {
    id: 'mat-010',
    subject: 'Matematik',
    topic: 'Parabol',
    category: 'AYT',
    front_text: 'y = ax² + bx + c parabolünün Tepe Noktası T(r, k) koordinatları nasıl bulunur?',
    back_text: '• r = -b / (2a)  (Aynı zamanda parabolün Simetri Eksenidir: x = r)\n• k = f(r) = (4ac - b²) / (4a)\nParabol denklemi: y = a(x - r)² + k olarak da yazılabilir.',
    tip: '🔥 Parabolün alabileceği en büyük/en küçük değer k = f(r) değeridir.'
  },
  {
    id: 'mat-011',
    subject: 'Matematik',
    topic: 'Trigonometri',
    category: 'AYT',
    front_text: 'Yarım Açı (İki Kat Açı) formülleri: sin(2x) ve cos(2x) açılımları nelerdir?',
    back_text: '• sin(2x) = 2 · sin(x) · cos(x)\n• cos(2x) = cos²(x) - sin²(x)\n           = 2cos²(x) - 1\n           = 1 - 2sin²(x)',
    tip: '💡 Yanındaki 1 sayısını yok etmek için cos(2x) açılımlarından uygun olanı seçilir.'
  },
  {
    id: 'mat-012',
    subject: 'Matematik',
    topic: 'Trigonometri',
    category: 'AYT',
    front_text: 'Toplam - Fark Formülleri: sin(a ± b) ve cos(a ± b) açılımları nelerdir?',
    back_text: '• sin(a + b) = sin(a)cos(b) + cos(a)sin(b)\n• sin(a - b) = sin(a)cos(b) - cos(a)sin(b)\n• cos(a + b) = cos(a)cos(b) - sin(a)sin(b)\n• cos(a - b) = cos(a)cos(b) + sin(a)sin(b)',
    tip: '🧠 Hafıza Çivisi: Sinüs paylaşımcıdır (sin-cos-cos-sin), Kosinüs bencildir (cos-cos-sin-sin) ve işareti ters çevirir!'
  },
  {
    id: 'mat-013',
    subject: 'Matematik',
    topic: 'Logaritma',
    category: 'AYT',
    front_text: 'Logaritma Taban Değiştirme ve Kuvvet Kuralları nelerdir?',
    back_text: '• Taban Değiştirme: log_b(a) = log_c(a) / log_c(b) = ln(a) / ln(b)\n• Ters Çevirme: log_b(a) = 1 / log_a(b)\n• Kuvvet Kuralı: log_(b^n)(a^m) = (m/n) · log_b(a)\n• Yer Değiştirme: a^(log_b(c)) = c^(log_b(a))',
    tip: '🎯 Taban ve logaritması alınan sayının tabanları aynı kuvvete dönüştürülerek üsler başa kesir olarak atılır.'
  },
  {
    id: 'mat-014',
    subject: 'Matematik',
    topic: 'Diziler',
    category: 'AYT',
    front_text: 'Aritmetik ve Geometrik Dizi Genel Terim ve İlk n Terim Toplamı (Sn) formülleri?',
    back_text: '• Aritmetik Dizi:\n  a_n = a₁ + (n - 1)d\n  S_n = (n/2) · [2a₁ + (n - 1)d] = (n/2) · (a₁ + a_n)\n\n• Geometrik Dizi:\n  a_n = a₁ · r^(n - 1)\n  S_n = a₁ · (1 - r^n) / (1 - r)  (r ≠ 1)',
    tip: '📌 Aritmetik dizide eşit uzaklıktaki terimlerin toplamı ortadakinin 2 katıdır: a₁ + a₉ = 2a₅.'
  },
  {
    id: 'mat-015',
    subject: 'Matematik',
    topic: 'Limit & Süreklilik',
    category: 'AYT',
    front_text: 'Bir fonksiyonun x = a noktasında sürekli olmasının 3 temel şartı nedir?',
    back_text: '1. f(a) tanımlı olmalıdır.\n2. x → a sağdan ve soldan limitleri var ve birbirine eşit olmalıdır: lim(x→a⁻) f(x) = lim(x→a⁺) f(x) = L.\n3. Bu limit değeri fonksiyonun o noktadaki değerine eşit olmalıdır: L = f(a).',
    tip: '⚠️ Limit olması süreklilik için gereklidir ama tek başına yeterli değildir; nokta tanımlı ve limite eşit olmalıdır.'
  },
  {
    id: 'mat-016',
    subject: 'Matematik',
    topic: 'Türev',
    category: 'AYT',
    front_text: 'Çarpımın ve Bölümün Türevi Kuralları nelerdir?',
    back_text: '• Çarpım: [f(x) · g(x)]\' = f\'(x)g(x) + f(x)g\'(x)\n• Bölüm: [f(x) / g(x)]\' = [f\'(x)g(x) - f(x)g\'(x)] / [g(x)]²\n• Bileşke (Zincir Kuralı): [f(g(x))]\' = f\'(g(x)) · g\'(x)',
    tip: '⚠️ Bölüm türevinin paydasında [g(x)]² olduğunu ve pay kısmında çıkarma işareti olduğunu unutmayın!'
  },
  {
    id: 'mat-017',
    subject: 'Matematik',
    topic: 'Türev',
    category: 'AYT',
    front_text: 'Türevin Geometrik Yorumu: Teğet Denklemi nasıl yazılır?',
    back_text: 'f(x) fonksiyonuna x = x₀ noktasından çizilen teğetin eğimi m_t = f\'(x₀)\'dır.\nTeğet denklemi:\ny - y₀ = m_t · (x - x₀)\nNormalin eğimi: m_t · m_n = -1 ⇒ m_n = -1 / f\'(x₀).',
    tip: '🔥 f\'(x) = 0 olan noktalarda teğet x-eksenine paraleldir (yatay teğet).'
  },
  {
    id: 'mat-018',
    subject: 'Matematik',
    topic: 'İntegral',
    category: 'AYT',
    front_text: 'Değişken Değiştirme Yöntemi (u-dönüşümü) ne zaman ve nasıl uygulanır?',
    back_text: 'İntegral içinde hem bir f(g(x)) fonksiyonu hem de içinin türevi g\'(x) çarpan olarak varsa:\nu = g(x) ⇒ du = g\'(x)dx dönüşümü yapılır.\n∫ f(g(x)) · g\'(x)dx = ∫ f(u)du haline gelir.',
    tip: '🎯 Karmaşık ifadenin parantez içine veya kök altına "u" denir.'
  },
  {
    id: 'mat-019',
    subject: 'Matematik',
    topic: 'İntegral',
    category: 'AYT',
    front_text: 'İki eğri arasında kalan alan integralle nasıl hesaplanır?',
    back_text: 'x = a\'dan x = b\'ye kadar f(x) üstte, g(x) altta kalıyorsa:\nAlan = ∫[a dan b\'ye] (f(x) - g(x)) dx = ∫ (Üst Fonksiyon - Alt Fonksiyon) dx.',
    tip: '⚠️ Alan negatif olamaz! İntegral sonucu negatif çıkarsa alt ve üst eğrilerin kesişim noktaları kontrol edilmelidir.'
  },
  {
    id: 'mat-020',
    subject: 'Matematik',
    topic: 'Permütasyon - Kombinasyon',
    category: 'TYT/AYT',
    front_text: 'Permütasyon ve Kombinasyon farkı ve formülleri nelerdir?',
    back_text: '• Permütasyon (Sıralama): Sıra önemlidir. P(n, r) = n! / (n - r)!\n• Kombinasyon (Seçme): Sıra önemsizdir, sadece grup seçilir. C(n, r) = n! / [r! · (n - r)!]\nÖzellik: C(n, r) = C(n, n - r).',
    tip: '💡 "Kişileri yan yana oturtma/dizme" = Permütasyon; "Ekip/komisyon seçme" = Kombinasyon.'
  },
  {
    id: 'mat-021',
    subject: 'Matematik',
    topic: 'Binom Açılımı',
    category: 'AYT',
    front_text: '(x + y)ⁿ açılımında baştan (r + 1). terim nasıl bulunur?',
    back_text: 'Baştan (r + 1). terim = C(n, r) · x^(n - r) · y^r\n• Toplam terim sayısı: n + 1 tanedir.\n• Katsayılar toplamı için x = 1, y = 1 yazılır.\n• Sabit terim için x = 0, y = 0 yazılır (tanımsızlık yoksa).',
    tip: '🎯 Baştan 4. terim sorulduğunda r + 1 = 4 ⇒ r = 3 alınır.'
  },
  {
    id: 'mat-022',
    subject: 'Matematik',
    topic: 'Olasılık',
    category: 'TYT/AYT',
    front_text: 'Koşullu Olasılık P(A | B) formülü ve Bağımsız Olaylar kuralı nedir?',
    back_text: '• Koşullu Olasılık (B olayı gerçekleştiğinde A\'nın olasılığı):\n  P(A | B) = P(A ∩ B) / P(B)\n• Bağımsız Olaylar (Biri diğerini etkilemez):\n  P(A ∩ B) = P(A) · P(B)',
    tip: '🎲 Koşullu olasılıkta örnek uzay tüm evrensel küme değil, gerçekleşen B kümesidir.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── GEOMETRİ (TYT & AYT) ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'geo-001',
    subject: 'Geometri',
    topic: 'Özel Üçgenler',
    category: 'TYT/AYT',
    front_text: '30°-60°-90° ve 45°-45°-90° özel üçgenlerinin kenar oranları nelerdir?',
    back_text: '• 30°-60°-90°: 30° karşısı a ise, 60° karşısı a√3, 90° (hipotenüs) karşısı 2a.\n• 45°-45°-90°: Dik kenarlar a, a ise hipotenüs a√2.\n• 15°-75°-90°: Hipotenüse inen yükseklik h ise hipotenüs 4h.',
    tip: '⚡ Kenar uzunlukları tam sayı olan dik üçgenler: 3-4-5, 5-12-13, 8-15-17, 7-24-25 ve katları.'
  },
  {
    id: 'geo-002',
    subject: 'Geometri',
    topic: 'Üçgende Benzerlik',
    category: 'TYT/AYT',
    front_text: 'Benzerlik oranı k olan iki üçgende Çevreler ve Alanlar oranı nedir?',
    back_text: '• Çevreler Oranı = Benzerlik Oranı = k\n• Yükseklikler, Açıortaylar, Kenarortaylar Oranı = k\n• Alanlar Oranı = (Benzerlik Oranı)² = k²',
    tip: '🔥 Alanlar oranı benzerlik oranının KARESİDİR. Hacimler oranı ise KÜBÜDÜR (k³).'
  },
  {
    id: 'geo-003',
    subject: 'Geometri',
    topic: 'Çember & Daire',
    category: 'TYT/AYT',
    front_text: 'Çemberde Merkez Açı ve Çevre Açı özellikleri nelerdir?',
    back_text: '• Merkez Açı: Köşesi merkezde olan açıdır, gördüğü yayın ölçüsüne eşittir: α = m(AB).\n• Çevre Açı: Köşesi çember üzerinde olan açıdır, gördüğü yayın ölçüsünün yarısına eşittir: β = m(AB) / 2.\n• Kural: Çapı gören çevre açı daima 90°\'dir.',
    tip: '🎯 Çapı gören çevre açının 90° olma kuralı ÖSYM\'nin en çok sorduğu geometri tuzaklarından biridir.'
  },
  {
    id: 'geo-004',
    subject: 'Geometri',
    topic: 'Analitik Geometri',
    category: 'AYT',
    front_text: 'Noktanın Doğruya Olan Uzaklığı Formülü nedir?',
    back_text: 'A(x₀, y₀) noktasının ax + by + c = 0 doğrusuna olan dik uzaklığı (d):\nd = |a·x₀ + b·y₀ + c| / √(a² + b²)',
    tip: '⚠️ Formülü uygulamadan önce doğrunun tüm terimlerini eşitliğin tek tarafına toplayıp "= 0" haline getirin.'
  },
  {
    id: 'geo-005',
    subject: 'Geometri',
    topic: 'Katı Cisimler',
    category: 'TYT/AYT',
    front_text: 'Küre, Koni ve Silindirin Hacim ve Yüzey Alanı Formülleri nelerdir?',
    back_text: '• Silindir: V = πr²h, Yanal Alan = 2πrh\n• Koni: V = (1/3)πr²h, Yanal Alan = πrℓ (ℓ: ana doğru)\n• Küre: V = (4/3)πr³, Yüzey Alanı = 4πr²',
    tip: '💡 Sivri uçlu cisimlerin (koni, piramit) hacmi daima 1/3 ile çarpılır.'
  },
  {
    id: 'geo-006',
    subject: 'Geometri',
    topic: 'Üçgende Açıortay',
    category: 'TYT/AYT',
    front_text: 'İç Açıortay Teoremi ve Kenar Bağıntıları nelerdir?',
    back_text: 'ABC üçgeninde AN iç açıortay olmak üzere:\n• Kenar Oranı: AB / AC = BN / NC  (Kolların oranı, tabandaki parçaların oranına eşittir).\n• Açıortay Uzunluğu: |AN|² = |AB|·|AC| - |BN|·|NC|.',
    tip: '📐 İç açıortayların kesim noktası, üçgenin İÇ TEĞET ÇEMBERİNİN merkezidir.'
  },
  {
    id: 'geo-007',
    subject: 'Geometri',
    topic: 'Üçgende Kenarortay',
    category: 'TYT/AYT',
    front_text: 'Ağırlık Merkezi (G) ve Muhteşem Üçlü Kuralı nedir?',
    back_text: '• Ağırlık Merkezi (G): Kenarortayların kesişim noktasıdır. Kenara 1 birim, köşeye 2 birim uzaklıktadır (1\'e 2 kuralı: 2k - k).\n• Muhteşem Üçlü: Bir dik üçgende hipotenüse çizilen kenarortay, hipotenüsün yarısına eşittir: Va = a/2.',
    tip: '⭐ Dik açıdan inen kenarortayı gördüğünüz an Muhteşem Üçlüyü çizip 3 eşitliği işaretleyin.'
  },
  {
    id: 'geo-008',
    subject: 'Geometri',
    topic: 'Dörtgenler & Yamuk',
    category: 'TYT/AYT',
    front_text: 'Yamukta Orta Taban ve Alan Formülü nedir?',
    back_text: 'Alt tabanı a, üst tabanı c, yüksekliği h olan yamukta:\n• Orta Taban: k = (a + c) / 2\n• Alan: A = [(a + c) / 2] · h = Orta Taban × Yükseklik.',
    tip: '📏 İkizkenar yamukta köşegenler birbirine eşittir ve taban açıları aynıdır.'
  },
  {
    id: 'geo-009',
    subject: 'Geometri',
    topic: 'Çember & Teğet',
    category: 'TYT/AYT',
    front_text: 'Çemberde Teğet - Kiriş Özellikleri nelerdir?',
    back_text: '• Merkezden teğet değme noktasına çizilen yarıçap teğete DİKTİR (r ⊥ d).\n• Çember dışındaki bir noktadan çizilen iki teğet parçasının uzunlukları birbirine EŞİTTİR.\n• Merkezden kirişe inen dikme, kirişi iki eşit parçaya böler.',
    tip: '🎯 Çemberde teğet doğrusu gördüğünüzde merkezden teğet noktasına dik yarıçap çekmek sorunun kilidini açar.'
  },
  {
    id: 'geo-010',
    subject: 'Geometri',
    topic: 'Çemberin Analitiği',
    category: 'AYT',
    front_text: 'Merkezi M(a, b) ve yarıçapı r olan standart çember denklemi nedir?',
    back_text: '(x - a)² + (y - b)² = r²\n• Orijin merkezli çember: x² + y² = r²\n• Genel Denklem: x² + y² + Dx + Ey + F = 0\n  Merkez: M(-D/2, -E/2), Yarıçap: r = (1/2)√(D² + E² - 4F).',
    tip: '⚠️ Genel denklemde x² ve y² katsayıları mutlaka 1 olmalıdır. Farklıysa önce bölünür.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── FİZİK (TYT & AYT) ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'fiz-001',
    subject: 'Fizik',
    topic: 'Kuvvet ve Hareket',
    category: 'TYT/AYT',
    front_text: 'Newton\'un 3 Temel Hareket Yasası nelerdir?',
    back_text: '1. Eylemsizlik: Net kuvvet sıfırsa (F_net = 0), duran cisim durur, hareketli cisim sabit hızla düzgün doğrusal hareket yapar.\n2. Temel Prensip: F_net = m · a (İvme, net kuvvetle doğru, kütleyle ters orantılıdır).\n3. Etki - Tepki: F_etki = -F_tepki (Büyüklükleri eşit, yönleri zıt, farklı cisimler üzerindedirler).',
    tip: '⚠️ Etki ve tepki kuvvetleri FARKLI cisimler üzerine uygulandığı için birbirini ASLA yok etmezler!'
  },
  {
    id: 'fiz-002',
    subject: 'Fizik',
    topic: 'İş, Güç ve Enerji',
    category: 'TYT',
    front_text: 'Mekanik İş ve Güç formülleri ve birimleri nelerdir?',
    back_text: '• İş: W = F · Δx · cos(α)  [Birim: Joule = N · m]\n  (Kuvvet yer değiştirmeye dik ise α = 90° ⇒ İş sıfırdır).\n• Güç: P = W / t = F · v_ort  [Birim: Watt = Joule / s]\n• Kinetik Enerji: E_k = (1/2)m v²\n• Potansiyel Enerji: E_p = mgh',
    tip: '🎯 Elinde çantayla yatay yolda sabit hızla yürüyen öğrenci fiziksel anlamda iş yapmaz (Kuvvet yukarı, hareket ileri).'
  },
  {
    id: 'fiz-003',
    subject: 'Fizik',
    topic: 'İtme ve Momentum',
    category: 'AYT',
    front_text: 'İtme (I) ve Çizgisel Momentum (P) ilişkisi nedir?',
    back_text: '• Momentum: P = m · v (Vektöreldir)\n• İtme: I = F_net · Δt (Vektöreldir)\n• Temel Bağıntı: I = ΔP = P_son - P_ilk\n• Dış kuvvet yoksa (F_net = 0): Toplam momentum daima korunur (P_ilk = P_son).',
    tip: '🚗 Çarpışmalarda airbag ve bükülebilen tamponlar etkileşim süresini (Δt) uzatarak vücuda etki eden kuvveti (F) azaltır.'
  },
  {
    id: 'fiz-004',
    subject: 'Fizik',
    topic: 'Basit Harmonik Hareket',
    category: 'AYT',
    front_text: 'Yaylı Sarkaç ve Basit Sarkacın Periyot Formülleri nelerdir?',
    back_text: '• Yaylı Sarkaç (TAMeK): T = 2π · √(m / k)\n  (Kütleye ve yay sabitine bağlıdır; yerçekimine veya açıya bağlı DEĞİLDİR).\n• Basit Sarkaç (ToLGa): T = 2π · √(L / g)\n  (İp boyuna ve yerçekimi ivmesine bağlıdır; kütleye bağlı DEĞİLDİR).',
    tip: '🧠 Kodlama: Yaylı Sarkaç = TAMeK (m/k), Basit Sarkaç = ToLGa (L/g).'
  },
  {
    id: 'fiz-005',
    subject: 'Fizik',
    topic: 'Elektrostatik & Sığaçlar',
    category: 'AYT',
    front_text: 'Sığaç (Kondansatör) sığası, yükü ve depolanan enerjisi formülleri?',
    back_text: '• Sığa (Kapasite): C = ε · (A / d)  (Levhaların alanına ve dielektrik sabite bağlıdır)\n• Yük Denklemi: Q = C · V\n• Depolanan Enerji: E = (1/2) Q · V = (1/2) C · V² = Q² / (2C)',
    tip: '🔋 Pile bağlıyken V sabittir. Pilden çıkarılmışsa yük (Q) sabittir.'
  },
  {
    id: 'fiz-006',
    subject: 'Fizik',
    topic: 'Manyetizma & İndüksiyon',
    category: 'AYT',
    front_text: 'Faraday ve Lenz İndüksiyon Yasası nedir?',
    back_text: '• Manyetik Akı: Φ = B · A · cos(θ)\n• Faraday Kanunu: İndüksiyon emk\'sı akının zamanla değişim hızına eşittir: ε = -N · (ΔΦ / Δt)\n• Lenz Kanunu: İndüksiyon akımı, kendisini oluşturan akı değişimine KARŞI KOYACAK yönde manyetik alan üretir (Eksi işaretinin sebebi).',
    tip: '🧲 Akı artıyorsa ters yönde B_ind, akı azalıyorsa aynı yönde B_ind oluşur.'
  },
  {
    id: 'fiz-007',
    subject: 'Fizik',
    topic: 'Dalgalar & Optik',
    category: 'AYT',
    front_text: 'Işığın Kırılması: Snell Yasası ve Tam Yansıma Kuralı nedir?',
    back_text: '• Snell Yasası: n₁ · sin(θ₁) = n₂ · sin(θ₂)\n• Çok yoğun ortamdan (büyük n) az yoğun ortama (küçük n) geçerken:\n  - θ < θ_s : Kırılarak normalden uzaklaşır.\n  - θ = θ_s : Sınır açısıyla kırılır, yüzeyi yalar (90°).\n  - θ > θ_s : TAM YANSIMA yapar (Ortama geçemez).',
    tip: '💎 Fiber optik kablolar, serap olayı ve prizmalarda tam yansıma prensibi kullanılır.'
  },
  {
    id: 'fiz-008',
    subject: 'Fizik',
    topic: 'Modern Fizik',
    category: 'AYT',
    front_text: 'Einstein Fotoelektrik Denklemi ve Durdurma Gerilimi bağıntısı nedir?',
    back_text: '• Foton Enerjisi: E_foton = E_bağlanma + E_kinetik\n  h · f = h · f₀ + (1/2)m v_max²\n  (h·c / λ = h·c / λ₀ + E_k)\n• Durdurma Gerilimi: E_kinetik = e · V_kesme\n  (Işığın şiddeti kinetik enerjiyi DEĞİŞTİRMEZ, sadece kopan elektron sayısını artırır).',
    tip: '🚨 ÖSYM Klasiği: Işık şiddeti (parlaklık) foton sayısını ve akımı artırır; elektronların hızını ve durdurma gerilimini ASLA etkilemez!'
  },
  {
    id: 'fiz-009',
    subject: 'Fizik',
    topic: 'Çembersel Hareket',
    category: 'AYT',
    front_text: 'Düzgün Çembersel Harekette Çizgisel Hız, Açısal Hız ve Merkezcil İvme formülleri?',
    back_text: '• Çizgisel Hız: v = 2πr / T = ω · r\n• Açısal Hız: ω = 2π / T = 2πf\n• Merkezcil İvme: a_m = v² / r = ω² · r (Daima merkeze doğrudur)\n• Merkezcil Kuvvet: F_net = m · a_m = m · v² / r = m · ω² · r',
    tip: '🔄 Merkezcil kuvvet bağımsız yeni bir kuvvet türü DEĞİLDİR; cismi yörüngede tutan net kuvvettir (ip gerilmesi, yerçekimi veya sürtünme).'
  },
  {
    id: 'fiz-010',
    subject: 'Fizik',
    topic: 'Alternatif Akım',
    category: 'AYT',
    front_text: 'Transformatörler sarım sayısı, gerilim ve akım ilişkisi nedir?',
    back_text: 'V_primer / V_sekonder = N_primer / N_sekonder = I_sekonder / I_primer\n• İdeal transformatörde güç korunur: P_giriş = P_çıkış (V_p · I_p = V_s · I_s).\n• N_s > N_p ise Yükseltici, N_s < N_p ise Alçaltıcı transformatördür.',
    tip: '⚠️ Transformatörler SADECE alternatif akımla (AC) çalışır, doğru akımla (DC) ASLA çalışmaz!'
  },
  {
    id: 'fiz-011',
    subject: 'Fizik',
    topic: 'Madde & Basınç',
    category: 'TYT',
    front_text: 'Sıvıların Kaldırma Kuvveti ve Sıvı Basıncı Formülleri nelerdir?',
    back_text: '• Sıvı Basıncı: P = h · d · g  (Derinlik, özkütle ve yerçekimine bağlıdır; kabın şekline bağlı DEĞİLDİR).\n• Kaldırma Kuvveti: F_k = V_batan · d_sıvı · g  (Yeri değişen sıvının ağırlığına eşittir).\n• Yüzen ve askıda kalan cisimlerde: F_k = G_cisim.',
    tip: '⚓ Batan cisimlerde kaldırma kuvveti cismin ağırlığından küçüktür (F_k < G).'
  },
  {
    id: 'fiz-012',
    subject: 'Fizik',
    topic: 'Isı ve Sıcaklık',
    category: 'TYT',
    front_text: 'Isı Alışverişi (Q = m·c·ΔT) ve Hal Değişimi formülleri nelerdir?',
    back_text: '• Sıcaklık Değişimi: Q = m · c · ΔT  (Kör Macit)\n  c: özgül ısı (maddeler için ayırt edici),\n  C = m·c: Isı sığası (madde miktarına bağlı).\n• Hal Değişimi: Q = m · L  (L_e: erime ısısı, L_b: buharlaşma ısısı). Hal değişirken sıcaklık SABİTTİR.',
    tip: '🌡️ Sıcaklık bir enerji değildir, termometreyle ölçülür. Isı ise aktarılan termal enerjidir.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── KİMYA (TYT & AYT) ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'kim-001',
    subject: 'Kimya',
    topic: 'Kimyasal Türler Arası Etkileşimler',
    category: 'TYT',
    front_text: 'Güçlü ve Zayıf Etkileşimler nasıl sınıflandırılır?',
    back_text: '• Güçlü Etkileşimler (Kimyasal bağlar): İyonik Bağ, Kovalent Bağ (Polar/Apolar), Metalik Bağ.\n• Zayıf Etkileşimler (Fiziksel bağlar):\n  1. Van der Waals Bağları: Dipol-dipol, İyon-dipol, London (İndüklenmiş dipol - İndüklenmiş dipol).\n  2. Hidrojen Bağı: H atomunun F, O, N atomlarına doğrudan bağlı olması durumunda oluşur.',
    tip: '💧 Zayıf etkileşimlerin en güçlüsü Hidrojen Bağıdır; soy gazlarda ve apolar moleküllerde sadece London kuvveti görülür.'
  },
  {
    id: 'kim-002',
    subject: 'Kimya',
    topic: 'Mol Kavramı & Hesaplamalar',
    category: 'TYT',
    front_text: 'Mol hesaplama temel formülleri nelerdir?',
    back_text: '• Kütleden Mol: n = m / M_A\n• Tanecik Sayısından: n = N / N_A  (N_A = 6,02 · 10²³)\n• Gaz Hacminden (NK - 0°C, 1 atm): n = V / 22,4 L\n• Gaz Hacminden (Oda Koşulları - 25°C, 1 atm): n = V / 24,5 L',
    tip: '⚠️ V / 22,4 formülü SADECE gazlar için ve SADECE Normal Koşullarda (NK) geçerlidir; sıvılar için uygulanamaz!'
  },
  {
    id: 'kim-003',
    subject: 'Kimya',
    topic: 'Gazlar',
    category: 'AYT',
    front_text: 'İdeal Gaz Yasası ve Graham Difüzyon Yasası nedir?',
    back_text: '• İdeal Gaz Denklemi: P · V = n · R · T (Paran Varsa Ne Rahat)\n  R = 22,4 / 273 veya 0,082, T mutlaka Kelvin (K = °C + 273).\n• Graham Difüzyon Yasası: Gazların yayılma hızı molekül kütlesinin kareköküyle ters, mutlak sıcaklığın kareköküyle doğru orantılıdır:\n  v₁ / v₂ = √(M₂ / M₁) · √(T₁ / T₂)',
    tip: '💨 Molekül ağırlığı küçük (hafif) ve sıcaklığı yüksek olan gaz daima daha hızlı yayılır.'
  },
  {
    id: 'kim-004',
    subject: 'Kimya',
    topic: 'Sıvı Çözeltiler & Koligatif Özellikler',
    category: 'AYT',
    front_text: 'Molarite, Molalite ve Kaynama Noktası Yükselmesi (Ebülyoskopi) formülleri?',
    back_text: '• Molarite (M): M = n_çözünen / V_çözelti (Litre)\n• Molalite (m): m = n_çözünen / m_çözücü (kg)\n• Kaynama Noktası Artışı: ΔT_k = K_k · m · i\n  (i = van \'t Hoff faktörü: çözünürken ortama verilen toplam tanecik sayısı. Glikoz için i=1, NaCl için i=2).',
    tip: '🧂 Çözeltideki toplam iyon derişimi ne kadar fazlaysa, kaynama noktası o kadar yüksek, donma noktası o kadar düşüktür.'
  },
  {
    id: 'kim-005',
    subject: 'Kimya',
    topic: 'Kimyasal Tepkimelerde Enerji',
    category: 'AYT',
    front_text: 'Endotermik ve Ekzotermik Tepkimelerin Temel Farkları Nelerdir?',
    back_text: '• Endotermik (ΔH > 0): Isı alır. Ürünlerin enerjisi girenlerden büyüktür (ΔH = H_ürün - H_giren). Sıcaklık arttıkça denge ürünlere kayar. Minimum enerjiye eğilim girenler yönündedir.\n• Ekzotermik (ΔH < 0): Isı verir. Girenlerin enerjisi ürünlerden büyüktür. Minimum enerjiye eğilim ürünler yönündedir.',
    tip: '🔥 Bağ kırılması daima Endotermiktir; bağ oluşumu daima Ekzotermiktir.'
  },
  {
    id: 'kim-006',
    subject: 'Kimya',
    topic: 'Kimyasal Denge',
    category: 'AYT',
    front_text: 'Le Chatelier Prensibi: Sıcaklık, Basınç ve Hacim Dengeyi Nasıl Etkiler?',
    back_text: 'Dengeye dışarıdan bir etki yapıldığında sistem bu etkiyi azaltacak yöne kayar.\n• Sıcaklık: Isı verilen taraftan uzaklaşır.\n• Hacim Azalması (Basınç Artışı): Sistem gaz mol sayısının AZ olduğu tarafa kayar.\n• Denge Sabiti (Kc): SADECE ve SADECE sıcaklıkla değişir! (Katalizör, derişim, basınç Kc\'yi değiştirmez).',
    tip: '🚨 ÖSYM Soru Bankosu: Kc veya Kp değerini değiştirebilen tek faktör SICAKLIKTIR.'
  },
  {
    id: 'kim-007',
    subject: 'Kimya',
    topic: 'Kimya ve Elektrik',
    category: 'AYT',
    front_text: 'Galvanik Pillerde Anot ve Katot Nasıl Belirlenir?',
    back_text: '• Anot (Yükseltgenme): Yükseltgenme potansiyeli (E°_yükseltgenme) BÜYÜK olan metal anottur. Aşınır (kütlesi azalır). Elektron anottan dış devreye verilir.\n• Katot (İndirgenme): Çözeltideki katyonlar katotta indirgenir (kütlesi artar).\n• Tuz Köprüsü: Anyonlar Anota, Katyonlar Katota göç eder (An-An, Kat-Kat).',
    tip: '🧠 Kodlama: KİMYA (Katotta İndirgenme, Mayot/Anotta Yükseltgenme).'
  },
  {
    id: 'kim-008',
    subject: 'Kimya',
    topic: 'Organik Kimya',
    category: 'AYT',
    front_text: 'Markovnikov Kuralı nedir ve organik katılma tepkimelerinde nasıl uygulanır?',
    back_text: 'Asimetrik alkenlere H-X (asit) veya H-OH (su) katılırken; hidrojen (H), çift bağlı karbonlardan hidrojen sayısı FAZLA olana bağlanır. Halojen veya -OH ise hidrojen sayısı AZ olana bağlanır.',
    tip: '🧠 Hafıza Çivisi: "Zengin olan daha da zenginleşir" (Çok hidrojeni olana hidrojen gider).'
  },
  {
    id: 'kim-009',
    subject: 'Kimya',
    topic: 'Periyodik Tablo',
    category: 'TYT',
    front_text: 'Periyodik Sistemde Soldan Sağa ve Yukarıdan Aşağıya İyonlaşma Enerjisi nasıl değişir?',
    back_text: '• Yukarıdan Aşağıya: Katman sayısı arttığı için iyonlaşma enerjisi AZALIR.\n• Soldan Sağa: Genellikle ARTAR ancak "3 aşağı, 5 yukarı" kuralı vardır:\n  1A < 3A < 2A < 4A < 6A < 5A < 7A < 8A\n  (2A ve 5A küresel simetriden dolayı kendilerinden sonra gelen 3A ve 6A\'dan daha kararlıdır).',
    tip: '🚨 2A ve 5A\'nın küresel simetriden dolayı yüksek iyonlaşma enerjisine sahip olması ÖSYM\'nin en sevdiği tuzaktır.'
  },
  {
    id: 'kim-010',
    subject: 'Kimya',
    topic: 'Asitler ve Bazlar',
    category: 'TYT/AYT',
    front_text: 'Metallerin Asitlerle Tepkimeleri: Hangi metaller hangi gazı açığa çıkarır?',
    back_text: '• Aktif Metaller (Na, K, Mg, Fe, Zn vb.): Asitlerle tepkimeye girip H₂ gazı çıkarırlar.\n• Amfoter Metaller (Zengin Pabuçlu Beyaz Çoraplı Ali - Zn, Pb, Be, Cr, Al): Hem asitlerle hem KUVVETLİ bazlarla H₂ gazı çıkarırlar.\n• Yarı Soy Metaller (Cu, Ag, Hg): Oksijensiz asitlerle tepkime VERMEZ. Derişik HNO₃ ile NO₂, seyreltik HNO₃ ile NO, derişik H₂SO₄ ile SO₂ gazı çıkarırlar.\n• Tam Soy Metaller (Au, Pt): Sadece Kral Suyu ile tepkime verirler.',
    tip: '⚠️ Yarı soy metaller (Bakır, Gümüş, Cıva) asla H₂ gazı çıkaramaz!'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── BİYOLOJİ (TYT & AYT) ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'biy-001',
    subject: 'Biyoloji',
    topic: 'Hücre ve Organeller',
    category: 'TYT',
    front_text: 'Zarsız, Tek Zarlı ve Çift Zarlı Organeller Nelerdir?',
    back_text: '• Zarsız Organeller: Ribozom, Sentrozom.\n• Tek Zarlı Organeller: Endoplazmik Retikulum, Golgi, Lizozom, Peroksizom, Koful.\n• Çift Zarlı Organeller: Mitokondri, Kloroplast (Plastitler).\n(Prokaryot hücrelerde sadece ribozom bulunur; zarlı organel ve çekirdek yoktur).',
    tip: '🔬 Mitokondri ve Kloroplastın kendilerine ait halkasal DNA, RNA ve ribozomları vardır; kendilerini eşleyebilirler.'
  },
  {
    id: 'biy-002',
    subject: 'Biyoloji',
    topic: 'Enzimler',
    category: 'TYT',
    front_text: 'Enzimlerin Temel Çalışma Mekanizması ve Özellikleri Nelerdir?',
    back_text: '• Aktivasyon enerjisini DÜŞÜRÜR; tepkimeyi başlatmaz (başlamış tepkimeyi hızlandırır).\n• Tepkime sonucunda değişmeden çıkarlar (tekrar tekrar kullanılırlar).\n• Substrata özgüdürler (Anahtar-Kilit uyumu).\n• Enzim-substrat yüzeyi arttıkça tepkime hızı artar (Kıyma etin parça etten hızlı sindirilmesi substrat yüzeyi ile ilgilidir).',
    tip: '⚠️ Enzimler tepkimenin serbest enerji değişimini (ΔG) veya ürün miktarını DEĞİŞTİRMEZ, sadece dengeye ulaşma süresini kısaltır.'
  },
  {
    id: 'biy-003',
    subject: 'Biyoloji',
    topic: 'Hücre Bölünmeleri',
    category: 'TYT',
    front_text: 'Mitoz ve Mayoz Bölünme Arasındaki Kritik Farklar Nelerdir?',
    back_text: '• Mitoz: Vücut hücrelerinde görülür, 2 hücre oluşur, kromozom sayısı sabit kalır (2n → 2n), genetik çeşitlilik oluşmaz (kalıtsal ikizler).\n• Mayoz: Eşey ana hücrelerinde görülür, 4 hücre oluşur, kromozom sayısı yarıya iner (2n → n).\n• Mayoz-1 Profaz-1 evresinde tetrat, sinapsis ve Krossing-over (parça değişimi) ile genetik çeşitlilik sağlanır.',
    tip: '🧬 Kardeş kromatitler Mayoz-2 Anafaz-2\'de ayrılır; homolog kromozomlar ise Mayoz-1 Anafaz-1\'de ayrılır.'
  },
  {
    id: 'biy-004',
    subject: 'Biyoloji',
    topic: 'Kalıtım',
    category: 'TYT',
    front_text: 'X\'e Bağlı Çekinik Kalıtım Özellikleri Nelerdir? (Renk Körlüğü & Hemofili)',
    back_text: '• Erkeklerde tek X bulunduğu için geni taşıyan erkekler kesinlikle HASTADIR (XʳY).\n• Dişilerin hasta olması için hem anne hem babadan çekinik geni alması gerekir (XʳXʳ).\n• Hasta bir kız çocuğunun babası KESİNLİKLE hastadır.\n• Hasta bir annenin bütün erkek çocukları KESİNLİKLE hastadır.',
    tip: '🩸 Soy ağacı sorularında önce hasta erkekleri (XʳY), ardından onların annelerini tarayarak ilerleyin.'
  },
  {
    id: 'biy-005',
    subject: 'Biyoloji',
    topic: 'Sinir Sistemi',
    category: 'AYT',
    front_text: 'Nöronda İmpuls İletimi: Polarizasyon, Depolarizasyon ve Repolarizasyon nedir?',
    back_text: '• Polarizasyon (Dinlenme): Dışarısı (+), içerisi (-). Na⁺/K⁺ pompası aktiftir (ATP harcanır).\n• Depolarizasyon (Uyarı): Na⁺ kapıları açılır, Na⁺ hücre içine hücum eder. İçerisi (+), dışarısı (-) olur.\n• Repolarizasyon: K⁺ kapıları açılır, K⁺ hücre dışına çıkar. Dışarısı tekrar (+), içerisi (-) olur.',
    tip: '⚡ Miyelin kılıf ve akson çapının artması impuls iletim hızını ARTIRIR; uyarının şiddeti ise hızı DEĞİŞTİRMEZ, sadece impuls frekansını (sayısını) artırır.'
  },
  {
    id: 'biy-006',
    subject: 'Biyoloji',
    topic: 'Endokrin Sistem',
    category: 'AYT',
    front_text: 'Kan Şekerini Düzenleyen İnsülin ve Glukagon Hormonlarının Görevleri?',
    back_text: '• İnsülin (Pankreas Beta hücreleri): Yüksek kan şekerini DÜŞÜRÜR. Glikozun hücrelere ve karaciğere (glikojen olarak) geçişini sağlar.\n• Glukagon (Pankreas Alfa hücreleri): Düşük kan şekerini YÜKSELTİR. Karaciğerdeki glikojeni glikoza çevirip kana verir (Çizgili kaslardaki glikojen kana verilmez!).',
    tip: '🎯 Çizgili kaslar glikoz-6-fosfataz enzimi içermediği için kas glikojeni doğrudan kana geçemez, sadece kendi ihtiyacında kullanılır.'
  },
  {
    id: 'biy-007',
    subject: 'Biyoloji',
    topic: 'Fotosentez ve Kemosentez',
    category: 'AYT',
    front_text: 'Fotosentezin Işığa Bağımlı ve Işıktan Bağımsız (Calvin) Evreleri Nerede Gerçekleşir?',
    back_text: '• Işığa Bağımlı Evre (Tilakoit Zar): Işık ve klorofil kullanılır. Su fotolize uğrar (O₂ açığa çıkar). ATP ve NADPH üretilir.\n• Işıktan Bağımsız Evre (Stroma): Işığa bağımlı evreden gelen ATP ve NADPH kullanılır. CO₂ harcanır ve PGAL (Glikoz/Organik besin) sentezlenir.',
    tip: '🍃 Atmosfere verilen oksijenin kaynağı karbondioksit (CO₂) DEĞİL, parçalanan SU (H₂O) molekülüdür.'
  },
  {
    id: 'biy-008',
    subject: 'Biyoloji',
    topic: 'Hücresel Solunum',
    category: 'AYT',
    front_text: 'Oksijenli Solunum Evreleri ve En Fazla ATP Üretilen Basamak Hangisidir?',
    back_text: '1. Glikoliz (Sitoplazma): 1 Glikoz → 2 Pirüvat. Net 2 ATP (Substrat Düzeyinde Fosforilasyon), 2 NADH.\n2. Pirüvat Oksidasyonu & Krebs Döngüsü (Mitokondri Matriksi): CO₂ çıkışı, 2 ATP, NADH ve FADH₂ üretimi.\n3. ETS (Mitokondri Krista Zarı): Oksidatif fosforilasyon ile EN FAZLA ATP burada üretilir. Son elektron alıcısı O₂\'dir ve su oluşur.',
    tip: '🔋 Glikoliz evresi tüm canlılarda ortaktır çünkü enzimler ve reaksiyon basamakları evrenseldir.'
  },
  {
    id: 'biy-009',
    subject: 'Biyoloji',
    topic: 'Genden Proteine',
    category: 'AYT',
    front_text: 'Protein Sentezinde Transkripsiyon ve Translasyon Nerede ve Nasıl Olur?',
    back_text: '• Transkripsiyon (Yazılma): DNA anlamlı zincirinden mRNA sentezidir. Ökaryotlarda çekirdekte, prokaryotlarda sitoplazmada olur.\n• Translasyon (Okunma): Ribozomda mRNA kodonlarına uygun tRNA antikodonlarının amino asit getirmesi ve peptit bağı kurmasıdır.\n• Başlama Kodonu: AUG (Metiyonin amino asidini kodlar).\n• Durdurma Kodonları: UAA, UAG, UGA (Amino asit karşılığı yoktur).',
    tip: '🧬 Durdurma (Stop) kodonlarına karşılık gelen tRNA bulunmaz; sentez sonlandırıcı faktörle biter.'
  },
  {
    id: 'biy-010',
    subject: 'Biyoloji',
    topic: 'Dolaşım Sistemi',
    category: 'AYT',
    front_text: 'Kalbin Odacıkları, Kapakçıkları ve Kan Dolaşım Yolu Nasıldır?',
    back_text: '• Sağ Taraf: Kirli kan (CO₂ çok) taşır. Sağ kulakçık ile sağ karıncık arasında Triküspit (3\'lü) kapakçık vardır.\n• Sol Taraf: Temiz kan (O₂ çok) taşır. Sol kulakçık ile sol karıncık arasında Biküspit (Mitral) kapakçık vardır.\n• Küçük Kan Dolaşımı: Sağ Karıncık → Akciğer Atardamarı (kirli) → Akciğer → Akciğer Toplardamarı (temiz) → Sol Kulakçık.\n• Büyük Kan Dolaşımı: Sol Karıncık → Aort (temiz) → Vücut → Ana Toplardamarlar (kirli) → Sağ Kulakçık.',
    tip: '🫀 Akciğer atardamarı kirli kan taşıyan TEK atardamardır; akciğer toplardamarı temiz kan taşıyan TEK toplardamardır.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── TÜRKÇE (TYT) ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'tur-001',
    subject: 'Türkçe',
    topic: 'Yazım Kuralları',
    category: 'TYT',
    front_text: '"-de/-da" ve "-ki" bağlaç ve eklerinin yazım ayrımı nasıl yapılır?',
    back_text: '• "de/da": Cümleden çıkarıldığında anlam tamamen bozulmuyorsa bağlaçtır, AYRI yazılır (te/ta biçimi yoktur!). Anlam bozuluyorsa bulunma hâl ekidir, BİTİŞİK yazılır.\n• "-ki": Kelimenin sonuna "-ler" eki getirildiğinde anlamlı oluyorsa (evdekiler, masadakiler) ektir, BİTİŞİK yazılır. Anlamsız oluyorsa bağlaçtır, AYRI yazılır (Bilmem ki-ler ✗).',
    tip: '🧠 Kalıplaşmış bitişik yazılan "-ki" bağlaçları: SOMBAHÇEMİ (Sanki, Oysaki, Mademki, Belki, Halbuki, Çünkü, Meğerki, İllaki).'
  },
  {
    id: 'tur-002',
    subject: 'Türkçe',
    topic: 'Ses Bilgisi',
    category: 'TYT',
    front_text: 'Ünlü Düşmesi, Ünsüz Benzeşmesi (Sertleşme) ve Yumuşama kuralları?',
    back_text: '• Ünlü Düşmesi: burun-u → burnu, akıl-ı → aklı, kayıp olmak → kaybolmak.\n• Ünsüz Benzeşmesi (Sertleşme): FıSTıKÇı ŞaHaP ile biten kelimelere c, d, g ile başlayan ek gelince ç, t, k olur: kitap-cı → kitapçı, git-di → gitti.\n• Ünsüz Yumuşaması: p, ç, t, k ile biten kelimelere ünlü gelince b, c, d, ğ olur: dolap-ı → dolabı, ağaç-a → ağaca.',
    tip: '⚠️ Özel isimlerde yazarken yumuşama gösterilmez: "Zonguldak\'a" yazılır, "Zonguldağa" okunur.'
  },
  {
    id: 'tur-003',
    subject: 'Türkçe',
    topic: 'Cümle Ögeleri',
    category: 'TYT',
    front_text: 'Cümle ögeleri bulunurken uygulanması gereken sıralama ve temel kural nedir?',
    back_text: 'Sıralama: Y-Ö-N-T (Yüklem → Özne → Nesne → Tümleçler).\n1. Önce Yüklem bulunur.\n2. Yükleme "Kim/Ne?" soruları sorularak ÖZNE bulunur.\n3. Sonra Belirtili Nesne (Kimi/Neyi?) veya Belirtisiz Nesne (Ne?) bulunur.\n4. Zarf Tümleci (Nasıl, Ne zaman, Neden) ve Dolaylı Tümleç (Kime, Kimde, Nereye) bulunur.',
    tip: '🚨 Tamlamalar, deyimler, ikilemeler ve birleşik eylemler ASLA bölünemez; tek bir öge olarak alınır.'
  },
  {
    id: 'tur-004',
    subject: 'Türkçe',
    topic: 'Sözcük Türleri',
    category: 'TYT',
    front_text: 'Sıfat ile Zarf Arasındaki Temel Fark Nasıl Ayırt Edilir?',
    back_text: '• Sıfat (Önad): İSMİ niteleyen veya belirten sözcüklerdir (Nasıl ev? → Güzel ev).\n• Zarf (Belirteç): FİİLİ, fiilimsiyi veya başka bir sıfatı/zarfı niteleyen sözcüklerdir (Nasıl konuştu? → Güzel konuştu; Ne kadar güzel? → Çok güzel).',
    tip: '🔍 Bir sözcüğün türünü belirlerken daima sağındaki sözcüğe bakın: İsmin önündeyse sıfat, eylemin önündeyse zarftır.'
  },
  {
    id: 'tur-005',
    subject: 'Türkçe',
    topic: 'Fiilde Çatı',
    category: 'TYT',
    front_text: 'Öznesine Göre Fiil Çatıları: Etken, Edilgen, Dönüşlü ve İşteş Çatı Nasıl Anlaşılır?',
    back_text: '• Etken: İşi yapan özne bellidir (Gerçek veya gizli özne vardır). Çatı eki almaz.\n• Edilgen: İşi yapan belli değildir, "-l / -n" eki alır. Sözde özne bulunur (Cam kırıldı).\n• Dönüşlü: İşi yapan da işten etkilenen de aynı öznedir, "-l / -n" eki alır (Kendi kendine: Aynaya bakıp süslendi).\n• İşteş: Eylem karşılıklı veya birlikte yapılır, "-ş" eki alır (Selamlaşmak, kaçışmak).',
    tip: '⚠️ İsim cümlelerinde çatı özelliği KESİNLİKLE aranmaz!'
  },
  {
    id: 'tur-006',
    subject: 'Türkçe',
    topic: 'Noktalama İşaretleri',
    category: 'TYT',
    front_text: 'Noktalı Virgül (;) Hangi Durumlarda Kullanılır?',
    back_text: '1. Cümle içinde virgüllerle ayrılmış tür veya takımları birbirinden ayırmak için (Erkeklere Ali, Can; kızlara Ayşe, Elif adı verildi).\n2. Ögeleri arasında virgül bulunan sıralı cümleleri birbirinden ayırmak için (At ölür, meydan kalır; yiğit ölür, şan kalır).\n3. İkiden fazla eş değer ögeler arasında virgül bulunan özneden sonra.',
    tip: '🚨 Cümlede hiç virgül (,) yoksa NOKTALI VİRGÜL (;) ASLA kullanılamaz!'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── TÜRK DİLİ VE EDEBİYATI (AYT) ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'edeb-001',
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Divan Edebiyatı',
    category: 'AYT',
    front_text: 'Divan Edebiyatının 5 Büyük Şairi ve En Önemli Eserleri Nelerdir?',
    back_text: '1. Fuzûlî: Şikâyetnâme (ilk edebi mektup), Leylâ vü Mecnûn, Su Kasidesi.\n2. Bâkî: Sultanü\'ş-Şuarâ unvanı, Kanuni Mersiyesi.\n3. Nedîm: Lale Devri şairi, Şarkı nazım şeklinin ustası, İstanbul Türkçesi.\n4. Şeyh Gâlib: Hüsn ü Aşk (mesnevi), Sebk-i Hindî akımı temsilcisi.\n5. Nef\'î: Kaside ustası, hiciv türünde "Sihâm-ı Kazâ" (Kaza Okları).',
    tip: '👑 Bâkî din dışı konularda yazmış ve hiç mesnevi yazmamıştır. Fuzûlî ise ızdırap ve aşk şairidir.'
  },
  {
    id: 'edeb-002',
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Tanzimat & Servet-i Fünun',
    category: 'AYT',
    front_text: 'Türk Edebiyatında İlkler: İlk Romanlar ve Tiyatrolar Hangileridir?',
    back_text: '• İlk Çeviri Roman: Telemak (Yusuf Kâmil Paşa)\n• İlk Yerli Roman: Taaşşuk-ı Talat ve Fitnat (Şemsettin Sami)\n• İlk Edebi Roman: İntibah (Namık Kemal)\n• İlk Tarihi Roman: Cezmi (Namık Kemal)\n• İlk Realist Roman: Araba Sevdası (Recaizade Mahmut Ekrem)\n• İlk Köy Romanı: Karabibik (Nabizade Nazım)\n• İlk Sahnelenen Tiyatro: Vatan yahut Silistre (Namık Kemal)',
    tip: '🎯 ÖSYM her iki yılda bir "İlkler" tablosundan en az bir soru sorar.'
  },
  {
    id: 'edeb-003',
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Edebi Sanatlar',
    category: 'AYT',
    front_text: 'Teşbih, İstiare, Tezat ve Telmih Sanatları Nasıl Ayırt Edilir?',
    back_text: '• Teşbih-i Beliğ: Yalnızca benzeyen ve kendisine benzetilenle yapılan benzetmedir (Kömür gözlüm).\n• Açık İstiare: Yalnızca Kendisine Benzetilen kullanılır (Gökte bir altın top parlıyor → Güneş).\n• Kapalı İstiare: Yalnızca Benzeyen kullanılır, benzetilene ait bir özellik verilir (Rüzgar fısıldadı).\n• Tezat: Zıt kavramların veya durumların bir arada kullanılması (Ağlarım hatıra geldikçe gülüştüklerimiz).\n• Telmih: Herkesçe bilinen tarihi, dini veya efsanevi bir olaya/kişiye gönderme yapma.',
    tip: '✨ Teşhis (kişileştirme) olan her yerde otomatik olarak KAPALI İSTİARE sanatı da vardır.'
  },
  {
    id: 'edeb-004',
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'İslamiyet Öncesi & Geçiş Dönemi',
    category: 'AYT',
    front_text: 'Geçiş Dönemi 4 Temel Eseri ve Yazarları Kimlerdir?',
    back_text: '1. Kutadgu Bilig (Mutluluk Veren Bilgi): Yusuf Has Hacib (İlk mesnevi, ilk aruz, ilk siyasetname).\n2. Divanü Lügati\'t-Türk: Kaşgarlı Mahmud (İlk Türkçe sözlük, ilk ansiklopedi, ilk harita).\n3. Atabetü\'l-Hakayık (Hakikatlerin Eşiği): Edip Ahmet Yükneki (Ahlak ve öğüt kitabı).\n4. Divan-ı Hikmet: Hoca Ahmet Yesevi (İlk tasavvufi şiirler, hikmetler).',
    tip: '📜 Bu eserler Karahanlı Türkçesi (Hakaniye Lehçesi) ile yazılmıştır.'
  },
  {
    id: 'edeb-005',
    subject: 'Türk Dili ve Edebiyatı',
    topic: 'Milli Edebiyat & Cumhuriyet',
    category: 'AYT',
    front_text: 'Genç Kalemler ve Yeni Lisan Hareketi (1911) Temel İlkeleri Nelerdir?',
    back_text: 'Selanik\'te Ömer Seyfettin, Ziya Gökalp ve Ali Canip Yöntem tarafından başlatılmıştır.\n• Dilde sadeleşme savunulmuştur.\n• İstanbul Türkçesinin konuşma dili yazı dili haline getirilmiştir.\n• Arapça ve Farsça dil bilgisi kuralları terk edilmiş, Türkçeye mal olmuş yabancı kelimeler Türkçe sayılmıştır.\n• Aruz yerine hece ölçüsü, milli temalar esas alınmıştır.',
    tip: '✍️ Ömer Seyfettin\'in "Yeni Lisan" makalesi Milli Edebiyatın manifestosu sayılır.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── TARİH (TYT & AYT) ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'tar-001',
    subject: 'Tarih',
    topic: 'İlk Türk Devletleri',
    category: 'TYT',
    front_text: 'İslamiyet Öncesi Türk Devletlerinde Kut Anlayışı ve İkili Teşkilat nedir?',
    back_text: '• Kut Anlayışı: Yönetme yetkisinin Gök Tengri tarafından kağana verildiği inancıdır. Kan yoluyla tüm hanedan erkeklerine geçtiği için taht kavgalarına ve devletlerin kısa ömürlü olmasına yol açmıştır.\n• İkili Teşkilat: Devletin Doğu ve Batı olarak ikiye ayrılarak yönetilmesidir. Doğu\'da asıl hükümdar (Kağan), Batı\'da ise iç işlerinde serbest olan kardeşi (Yabgu) bulunur.',
    tip: '📌 Kut inancı devlet yönetiminde merkezi otoriteyi zayıflatmış ve Türk veraset sisteminde belirsizlik yaratmıştır.'
  },
  {
    id: 'tar-002',
    subject: 'Tarih',
    topic: 'Osmanlı Devleti',
    category: 'TYT/AYT',
    front_text: 'Tımar Sistemi Nedir ve Osmanlı\'ya Sağladığı 4 Temel Yarar Nelerdir?',
    back_text: 'Toprak gelirlerinin hizmet karşılığı asker ve devlet memurlarına bırakılması sistemidir.\n1. Hazineden para çıkmadan savaşa hazır devasa bir ordu (Cebelü / Tımarlı Sipahi) kurulmuştur.\n2. Tarımsal üretimde süreklilik sağlanmıştır.\n3. Taşrada asayiş ve güvenlik sağlanmıştır.\n4. Vergilerin düzenli toplanması kolaylaşmıştır.',
    tip: '🌾 Tımar arazisi devlete aittir (Mîrî arazi); sipahi toprağı satamaz, devredemez, miras bırakamaz.'
  },
  {
    id: 'tar-003',
    subject: 'Tarih',
    topic: 'Kurtuluş Savaşı',
    category: 'TYT/AYT',
    front_text: 'Amasya Genelgesi\'nin (1919) Tarihi Önemi ve Maddeleri Nelerdir?',
    back_text: 'Milli Mücadele\'nin Amacı, Gerekçesi ve Yöntemi ilk kez ilan edilmiştir.\n• Gerekçe: "Vatanın bütünlüğü, milletin bağımsızlığı tehlikededir. İstanbul Hükûmeti görevini yerine getirememektedir."\n• Yöntem ve Amaç: "Milletin bağımsızlığını, yine milletin azim ve kararı kurtaracaktır." (İlk kez ulusal egemenlikten bahsedilmiştir).',
    tip: '🔥 "Milletin azim ve kararı" ifadesi açıkça ileride Cumhuriyet rejimine geçileceğinin ilk sinyalidir.'
  },
  {
    id: 'tar-004',
    subject: 'Tarih',
    topic: 'Atatürk İlkeleri',
    category: 'TYT/AYT',
    front_text: 'Atatürk\'ün 6 Temel İlkesinin Anahtar Kelimeleri Nelerdir?',
    back_text: '• Cumhuriyetçilik: Millet egemenliği, seçim, demokrasi, meclis, oy.\n• Milliyetçilik: Türk dili, Türk tarihi, bağımsızlık, milli birlik.\n• Halkçılık: Eşitlik, adalet, ayrıcalıkların kaldırılması, sosyal yardım.\n• Devletçilik: Ekonomi, fabrika açma, karma ekonomi, kalkınma planı.\n• Laiklik: Akıl, bilim, din ve vicdan hürriyeti, akılcılık.\n• İnkılapçılık: Dinamizm, çağdaşlaşma, yenilik, Batılılaşma.',
    tip: '🎯 Anahtar kelimeler sorudaki metinde taranarak doğrudan doğru ilke bulunur.'
  },
  {
    id: 'tar-005',
    subject: 'Tarih',
    topic: 'İlk Çağ Uygarlıkları',
    category: 'TYT',
    front_text: 'Anadolu ve Mezopotamya Medeniyetlerinin Dünya Mirasına En Büyük Katkıları Nelerdir?',
    back_text: '• Sümerler: Yazıyı (Çivi yazısı) ilk kez buldular, Ziggurat tapınakları ile astronomi ve ay yılı takvimini geliştirdiler.\n• Hititler: Tarihte ilk yazılı antlaşma (Kadeş Antlaşması, Mısır ile), Anal (yıllıklar) ile tarafsız tarih yazıcılığı, Pankuş meclisi.\n• Lidyalılar: Parayı ilk kez icat ettiler, Kral Yolu\'nu canlandırdılar.\n• İyonlar: Özgür düşünce ortamı sayesinde felsefe, matematik ve tıbbın temelini attılar (Tales, Pisagor, Hipokrat).',
    tip: '🏛️ Lidyalılar ordularında paralı asker kullandıkları için kısa sürede yıkılmışlardır.'
  },
  {
    id: 'tar-006',
    subject: 'Tarih',
    topic: 'Kurtuluş Savaşı Antlaşmalar',
    category: 'TYT/AYT',
    front_text: 'Lozan Barış Antlaşması\'nda (1923) Çözülen ve Çözülemeyen Konular Nelerdir?',
    back_text: '• Çözülenler: Kapitülasyonlar tamamen kaldırıldı, Ermeni devleti talebi reddedildi, Dış Borçlar Osmanlı\'dan ayrılan devletlere paylaştırıldı, Azınlıklar Türk vatandaşı sayıldı.\n• Aleyhimize Çözülen / Ertelenenler:\n  - Boğazlar: Uluslararası bir komisyona bırakıldı (1936 Montrö ile çözüldü).\n  - Hatay: Fransa mandasındaki Suriye sınırında kaldı (1939\'da anavatana katıldı).\n  - Musul (Irak Sınırı): Çözülemedi, İngiltere ile sonraya bırakıldı (1926 Ankara Antlaşması ile İngiltere kontrolündeki Irak\'a bırakıldı).',
    tip: '📜 Lozan\'da egemenliğimizi sınırlayan "Boğazlar Komisyonu", Montrö Boğazlar Sözleşmesi ile kaldırılarak tam kontrol Türkiye\'ye geçmiştir.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── COĞRAFYA (TYT & AYT) ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'cog-001',
    subject: 'Coğrafya',
    topic: 'Coğrafi Konum & Saatler',
    category: 'TYT',
    front_text: 'Türkiye\'nin Matematik Konumu ve Sonuçları Nelerdir?',
    back_text: '36°-42° Kuzey paralelleri, 26°-45° Doğu meridyenleri arasındadır.\n• Kuzey Yarım Küre ve Orta Kuşaktadır (Dört mevsim belirgin yaşanır, Akdeniz iklim kuşağındadır).\n• Batı rüzgarları ve cephe yağışları etkilidir.\n• Güneyden esen rüzgarlar sıcaklığı artırır, kuzeyden esenler düşürür.\n• Bakı yönü daima Güney yamaçlardır.',
    tip: '🧭 Rüzgarlar kodlaması: KaSıP-YeL (Karayel, Yıldız, Poyraz soğutur; Samyeli, Kıble, Lodos ısıtır).'
  },
  {
    id: 'cog-002',
    subject: 'Coğrafya',
    topic: 'İklim Tipleri',
    category: 'TYT',
    front_text: 'Dünya\'da ve Türkiye\'de Akdeniz İkliminin Karakteristik Özellikleri Nelerdir?',
    back_text: '• Yazları sıcak ve kurak, kışları ılık ve yağışlıdır.\n• Yağışların büyük kısmı kışın "Cephesel (Frontal)" kökenlidir.\n• Doğal bitki örtüsü "Maki" (kızılçam ormanlarının tahrip edilmesiyle oluşan bodur çalılar).\n• Toprak tipi: Kırmızı renkli kalkerli "Terra-Rossa".\n• Zeytin, turunçgiller, defne, lavanta, zakkum karakteristik türleridir.',
    tip: '🌊 Türkiye\'de Akdeniz, Ege ve Güney Marmara kıyılarında yaygındır.'
  },
  {
    id: 'cog-003',
    subject: 'Coğrafya',
    topic: 'Harita Bilgisi & İzohipsler',
    category: 'TYT',
    front_text: 'İzohips (Eş Yükselti) Haritalarında Sırt, Vadi ve Falez Nasıl Ayırt Edilir?',
    back_text: '• Vadi: İzohipslerin "V" şeklindeki sivri ucu yüksek rakıma (tepeye) doğru bakıyorsa vadidir (akarsu yatağı).\n• Sırt: "V" şeklinin sivri ucu alçak rakıma (aşağıya) doğru bakıyorsa sırttır.\n• Falez (Yalıyar): İzohips çizgilerinin deniz kıyısında birbirine çok yaklaştığı dik uçurumlardır.',
    tip: '⛰️ Çizgilerin sıklaştığı yerlerde eğim fazladır, akarsu akış hızı ve aşındırma gücü yüksektir.'
  },
  {
    id: 'cog-004',
    subject: 'Coğrafya',
    topic: 'İç ve Dış Kuvvetler',
    category: 'TYT/AYT',
    front_text: 'Karstik Aşınım ve Birikim Şekilleri Nelerdir? (Türkiye\'de Nerede Yaygındır?)',
    back_text: 'Kalker (kireç taşı), jips ve kaya tuzu gibi suda kolay eriyebilen kayaçların bulunduğu sahalardır.\n• Aşınım Şekilleri: Lapya (en küçüğü) → Dolin → Uvala → Polye (en büyüğü/Gölova), Obruk, Mağara, Düden.\n• Birikim Şekilleri: Sarkıt, Dikit, Sütun, Traverten (Pamukkale).\n• Türkiye\'de en yaygın bölge: Akdeniz Bölgesi (Teke ve Taşeli Platoları).',
    tip: '🏔️ Polyeler (Kestel, Elmalı, Korkuteli, Muğla vb.) verimli karstik ova ve tarım alanlarıdır.'
  },
  {
    id: 'cog-005',
    subject: 'Coğrafya',
    topic: 'Nüfus ve Yerleşme',
    category: 'TYT/AYT',
    front_text: 'Nüfus Piramitleri: Tabanı Geniş ve Arı Kovanı Piramitleri Ne Anlatır?',
    back_text: '• Tabanı Geniş Üçgen Piramit: Doğum oranları çok yüksektir, genç nüfus fazladır, ortalama yaşam süresi kısadır. Gelişmemiş / Az gelişmiş ülkeler (Örn: Nijerya).\n• Arı Kovanı Piramidi: Doğum ve ölüm oranları düşüktür, nüfus artış hızı durağandır, yaşlı nüfus oranı yüksektir. Gelişmiş ülkeler (Örn: Almanya, İsveç, Japonya).',
    tip: '👥 Bir ülkenin gelişmişlik düzeyi arttıkça nüfus piramidinin tabanı daralır, tepesi (yaşlı nüfus) genişler.'
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ── FELSEFE & DİN KÜLTÜRÜ (TYT) ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'fel-001',
    subject: 'Felsefe & Din',
    topic: 'Bilgi Felsefesi (Epistemoloji)',
    category: 'TYT',
    front_text: 'Rasyonalizm, Empirizm ve Kritisizm akımlarının bilgi kaynağı anlayışları nelerdir?',
    back_text: '• Rasyonalizm (Akılcılık): Doğru bilgiye akılla (apriori) ulaşılır. Bilgiler doğuştan gelir. (Sokrates, Platon, Descartes, Hegel).\n• Empirizm (Deneycilik): Doğuştan bilgi yoktur. İnsan zihni boş bir levhadır (Tabula Rasa). Bilgi duyum ve deneyimle kazanılır. (John Locke, David Hume).\n• Kritisizm (Eleştiricilik): Bilgi hem deneyle başlar hem akılla şekillenir. "Görüsüz kavramlar boş, kavramsız görüler kördür." (Immanuel Kant).',
    tip: '🧠 Kodlama: Kant her iki akımı sentezleyip eleştirdiği için Kritisizm olarak adlandırılmıştır.'
  },
  {
    id: 'fel-002',
    subject: 'Felsefe & Din',
    topic: 'Din Kültürü Temel Kavramlar',
    category: 'TYT',
    front_text: 'İslam Düşüncesinde Tevhid, İhlas, Takva ve İhsan Kavramları Nelerdir?',
    back_text: '• Tevhid: Allah\'ın varlığına, birliğine ve eşi benzeri olmadığına inanmak.\n• İhlas: İbadet ve amelleri sadece ve sadece Allah rızası için, samimiyetle yapmak; gösterişten (riyadan) uzak durmak.\n• Takva: Allah\'ın emir ve yasaklarına karşı sorumluluk bilinciyle hareket etmek, günahtan sakınmak.\n• İhsan: Allah\'ı görüyormuş gibi ibadet etmektir; çünkü kul O\'nu görmese de O kulu görmektedir.',
    tip: '✨ Cebrail Hadisinde "İhsan" tanımı ÖSYM Din Kültürü sınavlarında defalarca doğrudan sorulmuştur.'
  },
  {
    id: 'fel-003',
    subject: 'Felsefe & Din',
    topic: 'Ahlak Felsefesi (Etik)',
    category: 'TYT',
    front_text: 'Immanuel Kant\'ın "Ödev Ahlakı" (Deontoloji) ve Kategorik İmperatif Nedir?',
    back_text: 'Bir eylemin ahlaki değerini onun sonucu (çıkar, mutluluk, menfaat) değil, niyet ve ödev duygusu belirler.\n• Koşulsuz Buyruk (Kategorik İmperatif): "Öyle hareket et ki eyleminin ilkesi genel bir yasa haline gelebilsin."\n• Bir kişiye yardım ederken "Bana da yardım etsinler" veya "Cennete gideyim" düşüncesi varsa o eylem ahlaki DEĞİLDİR; sadece ödev bilinciyle yapılmışsa ahlakidir.',
    tip: '⚖️ Kant ahlakında sonuç değil, sadece ve sadece İYİ NİYET ve ÖDEV esastır.'
  },
  {
    id: 'fel-004',
    subject: 'Felsefe & Din',
    topic: 'Varlık Felsefesi (Ontoloji)',
    category: 'TYT',
    front_text: 'Varlığın Mahiyeti: İdealizm, Materyalizm ve Düalizm Nedir?',
    back_text: '• İdealizm (Fikircilik): Varlığın temeli maddedir değil, düşüncedir/ruhtur (Platon\'un İdealar Kuramı, Hegel).\n• Materyalizm (Maddecilik): Varlığın temeli somut maddedir; düşünce maddenin bir ürünüdür (Demokritos, Marx).\n• Düalizm (İkicilik): Varlık hem madde (beden) hem ruh (düşünce) olmak üzere iki tözden oluşur (Descartes).',
    tip: '💭 Descartes\'ın "Düşünüyorum, öyleyse varım" (Cogito ergo sum) sözü Düalizmin temel taşıdır.'
  },
  {
    id: 'fel-005',
    subject: 'Felsefe & Din',
    topic: 'İnanç Esasları (Kader ve İrade)',
    category: 'TYT',
    front_text: 'Külli İrade, Cüzi İrade ve Tevekkül Kavramları Nelerdir?',
    back_text: '• Külli İrade: Yüce Allah\'ın sınırsız, mutlak iradesidir. İnsanın doğum yeri, ırkı, ana babası gibi seçemediği alanlardır (Sorumluluk yoktur).\n• Cüzi İrade: Allah tarafından insana verilen seçme özgürlüğü ve iradedir. İyiyi ya da kötüyü tercih edebilir (İnsan bundan sorumludur ve hesaba çekilecektir).\n• Tevekkül: Bir iş için gereken bütün sebepleri yerine getirip, elden gelen tüm çabayı gösterdikten sonra sonuca razı olup Allah\'a güvenip dayanmaktır.',
    tip: '🎯 Sınava hiç çalışmadan "Allah hakkımda hayırlısını versin" demek tevekkül değil, tembelliktir. Önce çalışıp sonra dua etmek tevekküldür.'
  }
];
