import { MaarifCurriculumNode, MaarifSubject, MaarifGrade, SkillDomain } from '../types/maarif';

/**
 * Türkiye Yüzyılı Maarif Modeli
 * 9, 10 ve 11. Sınıf Müfredat ve Öğrenme Çıktıları Kataloğu
 * 
 * MEB Talim ve Terbiye Kurulu Başkanlığı onaylı yeni öğretim programlarına %100 uyumludur.
 * Klasik YKS (TYT-AYT) konularından tamamen bağımsızdır.
 */

export const MAARIF_CATALOG: MaarifCurriculumNode[] = [
  // ═════════════════════════════════════════════════════════════════════════
  // 📐 9. SINIF MATEMATİK (Mantık ve Kümeler kaldırıldı; Algoritmalar, Sayılar ve Fonksiyonel İlişkiler eklendi)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-9-1-1',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Sayılar ve Algoritmik İlişkiler',
    code: 'MAT.9.1.1',
    outcome_title: 'Gerçek Sayılar Kümesinde Algoritmik İşlemler',
    outcome_description: 'Gerçek sayı kümeleri arasındaki hiyerarşik ilişkileri belirler ve adım adım algoritmik hesaplama süreçlerini modeller.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'kesirler',
  },
  {
    id: 'mat-9-1-2',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Sayılar ve Algoritmik İlişkiler',
    code: 'MAT.9.1.2',
    outcome_title: 'Sayı Basamakları ve Modüler Aritmetiksel Örüntüler',
    outcome_description: 'Sayı basamakları ve bölünebilme ilişkilerini gerçek yaşam bağlamlarındaki döngüsel örüntülerle açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: false,
  },
  {
    id: 'mat-9-2-1',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Değişim, Fonksiyonel İlişkiler ve Modeller',
    code: 'MAT.9.2.1',
    outcome_title: 'Doğrusal Değişim ve Oransal Akıl Yürütme',
    outcome_description: 'İki nicelik arasındaki sabit değişim oranını analiz ederek doğrusal fonksiyonel bağıntıları grafik ve tabloyla ifade eder.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'matematik-grafikleri',
  },
  {
    id: 'mat-9-2-2',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Değişim, Fonksiyonel İlişkiler ve Modeller',
    code: 'MAT.9.2.2',
    outcome_title: 'Birinci Dereceden Denklem ve Eşitsizlik Modelleri',
    outcome_description: 'Gerçek yaşamdaki kısıt ve optimizasyon problemlerini birinci dereceden denklem ve eşitsizlik sistemleriyle modeller.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'mat-9-3-1',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Şekil, Uzay ve Geometrik Akıl Yürütme',
    code: 'MAT.9.3.1',
    outcome_title: 'Üçgenlerde Açılar ve Uzamsal Doğruluk',
    outcome_description: 'Düzlemde açı ve kenar bağıntılarını geometrik ispat adımlarıyla açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'mat-9-3-2',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Şekil, Uzay ve Geometrik Akıl Yürütme',
    code: 'MAT.9.3.2',
    outcome_title: 'Üçgenlerde Benzerlik ve Eşlik Dönüşümleri',
    outcome_description: 'Benzerlik oranı ve orantılı doğru parçaları yardımıyla doğrudan ölçülemeyen uzaklıkları hesaplar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: false,
  },
  {
    id: 'mat-9-4-1',
    grade: 9,
    subject: 'Matematik',
    theme_name: 'Veri Analitiği ve İstatistiksel Süreçler',
    code: 'MAT.9.4.1',
    outcome_title: 'İstatistiksel Araştırma Süreci ve Veri Dağılımları',
    outcome_description: 'Merkezi eğilim ve yayılım ölçülerini kullanarak bir veri kümesinin eğilimini yorumlar ve çıkarım yapar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'galton',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 📐 10. SINIF MATEMATİK
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-10-1-1',
    grade: 10,
    subject: 'Matematik',
    theme_name: 'Cebirsel Yapılar ve Fonksiyon Sistemleri',
    code: 'MAT.10.1.1',
    outcome_title: 'Fonksiyonların Niteliksel Özellikleri ve Bileşke',
    outcome_description: 'Birebir, örten ve ters fonksiyon kavramlarını gerçek yaşam verileriyle ilişkilendirir.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'matematik-grafikleri',
  },
  {
    id: 'mat-10-1-2',
    grade: 10,
    subject: 'Matematik',
    theme_name: 'Cebirsel Yapılar ve Fonksiyon Sistemleri',
    code: 'MAT.10.1.2',
    outcome_title: 'Polinom Kavramı ve Cebirsel Çarpanlara Ayırma',
    outcome_description: 'Polinom işlemlerini alan ve hacim modelleriyle geometrik olarak açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'polinom',
  },
  {
    id: 'mat-10-2-1',
    grade: 10,
    subject: 'Matematik',
    theme_name: 'İkinci Dereceden İlişkiler ve Parabolik Modeller',
    code: 'MAT.10.2.1',
    outcome_title: 'İkinci Dereceden Bir Bilinmeyenli Denklemler',
    outcome_description: 'İkinci dereceden denklemlerin köklerini ve diskriminant ilişkisini cebirsel ve grafiksel analiz eder.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'mat-10-3-1',
    grade: 10,
    subject: 'Matematik',
    theme_name: 'Dörtgenler, Çokgenler ve Düzlemsel Geometri',
    code: 'MAT.10.3.1',
    outcome_title: 'Özel Dörtgenlerin Geometrik Nitelikleri ve Alan',
    outcome_description: 'Paralelkenar, eşkenar dörtgen, dikdörtgen ve yamuk alan bağıntılarını ispatlar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'alan-olusturucu',
  },
  {
    id: 'mat-10-4-1',
    grade: 10,
    subject: 'Matematik',
    theme_name: 'Ayrık Olaylar ve Koşullu Olasılık',
    code: 'MAT.10.4.1',
    outcome_title: 'Sayma Yöntemleri, Permütasyon ve Kombinasyon',
    outcome_description: 'Olayların gerçekleşme sayısını çarpma ve toplama kuralları ile modelleyerek hesaplar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 📐 11. SINIF MATEMATİK
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'mat-11-1-1',
    grade: 11,
    subject: 'Matematik',
    theme_name: 'Trigonometrik Fonksiyonlar ve Periyodik Modeller',
    code: 'MAT.11.1.1',
    outcome_title: 'Yönlü Açı, Birim Çember ve Trigonometrik Bağıntılar',
    outcome_description: 'Birim çember üzerinde sinüs, kosinüs, tanjant değerlerini periyodik hareketlerle modeller.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'birim-cember',
  },
  {
    id: 'mat-11-2-1',
    grade: 11,
    subject: 'Matematik',
    theme_name: 'Analitik Geometri ve Doğrusal Konumlar',
    code: 'MAT.11.2.1',
    outcome_title: 'Noktanın ve Doğrunun Analitik İncelenmesi',
    outcome_description: 'İki nokta arası uzaklık, doğru eğimi ve doğruların birbirine göre durumlarını koordinat düzleminde analiz eder.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: false,
  },
  {
    id: 'mat-11-3-1',
    grade: 11,
    subject: 'Matematik',
    theme_name: 'Fonksiyonlarda Değişim Oranları ve Parabolik Optimizasyon',
    code: 'MAT.11.3.1',
    outcome_title: 'Ortalama Değişim Oranı ve Parabolün Tepe Noktası',
    outcome_description: 'Gerçek yaşamdaki maliyet-kâr veya atış yörüngelerinde en büyük/en küçük değerleri parabol ile bulur.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'turev',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ⚡ 9. SINIF FİZİK (Kavramsal ve Deney Ağırlıklı Sistem Yaklaşımı)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'fiz-9-1-1',
    grade: 9,
    subject: 'Fizik',
    theme_name: 'Bilimsel Sorgulama ve Doğa',
    code: 'FİZ.9.1.1',
    outcome_title: 'Fiziksel Nicelikler, Birim Sistemleri ve Modelleme',
    outcome_description: 'Temel ve türetilmiş büyüklükleri SI birim sistemiyle ifade eder ve bilimsel modellerin sınırlarını açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'fiz-9-2-1',
    grade: 9,
    subject: 'Fizik',
    theme_name: 'Kuvvet, Hareket ve Dinamik Etkileşimler',
    code: 'FİZ.9.2.1',
    outcome_title: 'Net Kuvvet, İvme ve Newton Hareket Yasaları',
    outcome_description: 'Dengelenmiş ve dengelenmemiş kuvvetler etkisindeki cisimlerin hareketini deneylerle analiz eder.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'kuvvet-ve-hareket',
  },
  {
    id: 'fiz-9-2-2',
    grade: 9,
    subject: 'Fizik',
    theme_name: 'Kuvvet, Hareket ve Dinamik Etkileşimler',
    code: 'FİZ.9.2.2',
    outcome_title: 'Sürtünme Kuvveti ve Hareket Kısıtları',
    outcome_description: 'Statik ve kinetik sürtünme katsayılarının harekete etkisini simülasyon üzerinden açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'surtunme',
  },
  {
    id: 'fiz-9-3-1',
    grade: 9,
    subject: 'Fizik',
    theme_name: 'Enerji, Dönüşümler ve Sürdürülebilirlik',
    code: 'FİZ.9.3.1',
    outcome_title: 'İş, Güç ve Mekanik Enerji Korunumu',
    outcome_description: 'Kinetik ve potansiyel enerji arasındaki dönüşümleri sürtünmeli/sürtünmesiz ortamlarda açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'enerji-parki',
  },
  {
    id: 'fiz-9-4-1',
    grade: 9,
    subject: 'Fizik',
    theme_name: 'Madde, Yoğunluk ve Akışkanlar',
    code: 'FİZ.9.4.1',
    outcome_title: 'Kütle, Hacim, Özkütle ve Kaldırma Kuvveti',
    outcome_description: 'Özkütle ilişkisini ve sıvıların kaldırma kuvvetini Arşimet ilkesiyle açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'kati-cisimler',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ⚡ 10. SINIF FİZİK
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'fiz-10-1-1',
    grade: 10,
    subject: 'Fizik',
    theme_name: 'Elektrik ve Manyetizma',
    code: 'FİZ.10.1.1',
    outcome_title: 'Elektrik Akımı, Direnç ve Ohm Yasası',
    outcome_description: 'Seri ve paralel bağlı devre elemanlarında potansiyel fark, akım ve eşdeğer direnç ölçümü yapar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'elektrik-devresi',
  },
  {
    id: 'fiz-10-2-1',
    grade: 10,
    subject: 'Fizik',
    theme_name: 'Dalgalar ve Titreşim Hareketi',
    code: 'FİZ.10.2.1',
    outcome_title: 'Dalga Özellikleri, Yay ve Su Dalgalarında İlerleme',
    outcome_description: 'Periyot, frekans, dalga boyu ve hız arasındaki bağıntıyı dalgaların yansımasıyla ilişkilendirir.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'yay-dalgalari',
  },
  {
    id: 'fiz-10-3-1',
    grade: 10,
    subject: 'Fizik',
    theme_name: 'Optik ve Işık Olayları',
    code: 'FİZ.10.3.1',
    outcome_title: 'Işığın Kırılması, Tam Yansıma ve Mercekler',
    outcome_description: 'Işığın farklı ortamlardaki kırılma indisini Snell yasası ve mercek odak uzaklığı ile açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'isigin-kirilmasi',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ⚡ 11. SINIF FİZİK
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'fiz-11-1-1',
    grade: 11,
    subject: 'Fizik',
    theme_name: 'İki Boyutta Hareket ve Dinamik',
    code: 'FİZ.11.1.1',
    outcome_title: 'Atış Hareketleri ve Bağıl Hız',
    outcome_description: 'Yatay ve eğik atış hareketlerinde menzil, tepe noktası ve uçuş süresini vektörel hız bileşenleriyle hesaplar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'egik-atis',
  },
  {
    id: 'fiz-11-2-1',
    grade: 11,
    subject: 'Fizik',
    theme_name: 'İtme ve Çizgisel Momentum Korunumu',
    code: 'FİZ.11.2.1',
    outcome_title: 'İtme-Momentum Bağıntısı ve Esnek Çarpışmalar',
    outcome_description: 'Çarpışmalarda momentum ve kinetik enerji korunumunu analitik olarak modeller.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'momentum',
  },
  {
    id: 'fiz-11-3-1',
    grade: 11,
    subject: 'Fizik',
    theme_name: 'Elektromanyetizma ve İndüksiyon Akımı',
    code: 'FİZ.11.3.1',
    outcome_title: 'Manyetik Akı Değişimi ve Faraday Yasası',
    outcome_description: 'Manyetik alanda hareket eden iletkenlerde oluşan indüksiyon EMK değerini ve Lenz kuralını açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'manyetik-induksiyon',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧪 9. SINIF KİMYA
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'kim-9-1-1',
    grade: 9,
    subject: 'Kimya',
    theme_name: 'Kimya Bilimi, Güvenlik ve Yaşam',
    code: 'KİM.9.1.1',
    outcome_title: 'Kimya Disiplinleri ve Laboratuvar Güvenliği',
    outcome_description: 'Kimya alanındaki meslekleri, güvenlik piktogramlarını ve simyadan kimyaya dönüşümü açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'kim-9-2-1',
    grade: 9,
    subject: 'Kimya',
    theme_name: 'Atomun Yapısı ve Periyodik Sistem',
    code: 'KİM.9.2.1',
    outcome_title: 'Atom Altı Tanecikler ve Periyodik Özelliklerin Değişimi',
    outcome_description: 'Elektron, proton ve nötron dizilimlerini modelleyerek iyonlaşma enerjisi ve elektronegatiflik eğilimlerini yorumlar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'atom-olustur',
  },
  {
    id: 'kim-9-3-1',
    grade: 9,
    subject: 'Kimya',
    theme_name: 'Kimyasal Türler Arası Etkileşimler',
    code: 'KİM.9.3.1',
    outcome_title: 'Güçlü ve Zayıf Etkileşimler (İyonik, Kovalent, Hidrojen)',
    outcome_description: 'Lewis yapısı, bağ polarlığı ve moleküller arası çekim kuvvetlerinin erime/kaynama noktasına etkisini analiz eder.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'molekul-sekilleri',
  },
  {
    id: 'kim-9-4-1',
    grade: 9,
    subject: 'Kimya',
    theme_name: 'Maddenin Halleri ve Faz Geçişleri',
    code: 'KİM.9.4.1',
    outcome_title: 'Gaz Kanunları ve Katı-Sıvı Geçiş Dinamikleri',
    outcome_description: 'Sıcaklık, hacim ve basınç değişimlerinin tanecikler arası mesafeye etkisini deneylerle açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'maddenin-halleri',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧪 10. SINIF KİMYA
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'kim-10-1-1',
    grade: 10,
    subject: 'Kimya',
    theme_name: 'Kimyanın Temel Kanunları ve Mol Hesaplamaları',
    code: 'KİM.10.1.1',
    outcome_title: 'Kütlenin Korunumu ve Mol Hesaplamaları',
    outcome_description: 'Kimyasal tepkime denklemlerinde sınırlayıcı bileşeni ve teorik verimi stokiometrik hesaplamalarla açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: false,
  },
  {
    id: 'kim-10-2-1',
    grade: 10,
    subject: 'Kimya',
    theme_name: 'Asitler, Bazlar ve Tuz Dengesi',
    code: 'KİM.10.2.1',
    outcome_title: 'Asit-Baz Tepkimeleri ve Nötralleşme Süreci',
    outcome_description: 'pH kavramını, indikatör renk değişimlerini ve asit-baz titrasyonunda eşdeğerlik noktasını açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'titrasyon',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧪 11. SINIF KİMYA
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'kim-11-1-1',
    grade: 11,
    subject: 'Kimya',
    theme_name: 'Gaz Davranışları ve Kinetik Teori',
    code: 'KİM.11.1.1',
    outcome_title: 'İdeal Gaz Yasası ve Difüzyon',
    outcome_description: 'Basınç, hacim, mol ve sıcaklık parametrelerini ideal gaz denkleminde modeller; Graham difüzyonunu açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'ideal-gaz',
  },
  {
    id: 'kim-11-2-1',
    grade: 11,
    subject: 'Kimya',
    theme_name: 'Kimyasal Denge ve Le Chatelier İlkesi',
    code: 'KİM.11.2.1',
    outcome_title: 'Denge Durumu ve Dış Etkiler',
    outcome_description: 'Sıcaklık, derişim ve basınç değişimlerinin dengeye etkisini Le Chatelier ilkesiyle tahmin eder.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'le-chatelier',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧬 9. SINIF BİYOLOJİ
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'biy-9-1-1',
    grade: 9,
    subject: 'Biyoloji',
    theme_name: 'Yaşamın Biyokimyasal Temelleri',
    code: 'BİY.9.1.1',
    outcome_title: 'Canlıların Temel Bileşenleri ve Enzim Mekanizması',
    outcome_description: 'Karbonhidrat, lipid, protein ve nükleik asitlerin hücresel işlevlerini ve enzim etkinliğini açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: true,
    related_sim_slug: 'enzim-kinetigi',
  },
  {
    id: 'biy-9-2-1',
    grade: 9,
    subject: 'Biyoloji',
    theme_name: 'Hücresel Organizasyon ve Madde Geçişleri',
    code: 'BİY.9.2.1',
    outcome_title: 'Hücre Zarı, Osmoz, Difüzyon ve Aktif Taşıma',
    outcome_description: 'Hücre zarından madde geçiş mekanizmalarını turgor, plazmoliz ve deplazmoliz deneyleriyle modeller.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'hucre-zari',
  },
  {
    id: 'biy-9-3-1',
    grade: 9,
    subject: 'Biyoloji',
    theme_name: 'Canlılar Dünyası ve Biyoçeşitlilik',
    code: 'BİY.9.3.1',
    outcome_title: 'Sınıflandırma İlkeleri ve Canlı Âlemleri',
    outcome_description: 'Canlıların ikili adlandırma (binomial) sistemini ve çevreye uyum adaptasyonlarını inceler.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧬 10. SINIF BİYOLOJİ
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'biy-10-1-1',
    grade: 10,
    subject: 'Biyoloji',
    theme_name: 'Hücre Bölünmeleri ve Üreme Döngüleri',
    code: 'BİY.10.1.1',
    outcome_title: 'Mitoz ve Mayoz Bölünme Evreleri, Krossing-over',
    outcome_description: 'Genetik çeşitliliğin homolog kromozom ayrılması ve krossing-over ile ilişkisini mikroskobik modellerle açıklar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'mayoz-bolunme',
  },
  {
    id: 'biy-10-2-1',
    grade: 10,
    subject: 'Biyoloji',
    theme_name: 'Kalıtım İlkeleri ve Genetik Varyasyon',
    code: 'BİY.10.2.1',
    outcome_title: 'Mendel İlkeleri, Punnett Karesi ve Soyağacı Analizi',
    outcome_description: 'Monohibrit/dihibrit çaprazlamaları Punnett karesiyle modeller, X ve Y kromozomuna bağlı kalıtımı çözümler.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'punnett',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 🧬 11. SINIF BİYOLOJİ
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'biy-11-1-1',
    grade: 11,
    subject: 'Biyoloji',
    theme_name: 'İnsan Fizyolojisi ve Denetleyici Sistemler',
    code: 'BİY.11.1.1',
    outcome_title: 'Sinir Sistemi, Endokrin Bezler ve Homeostazi',
    outcome_description: 'İmpuls iletimini, nörotransmitter maddeleri ve hormonların iç dengeyi sağlama mekanizmasını açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 📖 9. SINIF TÜRK DİLİ VE EDEBİYATI (4 Temel Dil Becerisi ve Metin Tahlili)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'edb-9-1-1',
    grade: 9,
    subject: 'Türk Dili ve Edebiyatı',
    theme_name: 'Dil, İletişim ve Edebî Metin Tahlili',
    code: 'EDB.9.1.1',
    outcome_title: 'Edebiyatın Güzel Sanatlarla ve Bilimle İlişkisi',
    outcome_description: 'Metnin bağlamını, yazarın amacını ve dilin işlevlerini (göndergesel, şiirsel, kanalı kontrol) çözümler.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'edb-9-2-1',
    grade: 9,
    subject: 'Türk Dili ve Edebiyatı',
    theme_name: 'Olay Çevresinde Gelişen Metinler: Hikâye',
    code: 'EDB.9.2.1',
    outcome_title: 'Olay ve Durum Hikâyesinde Yapı Unsurları',
    outcome_description: 'Kişi, zaman, mekân ve anlatıcı bakış açılarını (hâkim, kahraman, gözlemci) metin üzerinde ayırt eder.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: false,
  },
  {
    id: 'edb-9-3-1',
    grade: 9,
    subject: 'Türk Dili ve Edebiyatı',
    theme_name: 'Coşku ve Heyecanı Dile Getiren Metinler: Şiir',
    code: 'EDB.9.3.1',
    outcome_title: 'Şiirde Ahenk Unsurları, Ölçü ve Kafiye',
    outcome_description: 'Hece ve aruz ölçüsünü, redif ve kafiye çeşitlerini, imge ve söz sanatlarını metin üzerinde tahlil eder.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 📜 9. SINIF TARİH & COĞRAFYA
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'tar-9-1-1',
    grade: 9,
    subject: 'Tarih',
    theme_name: 'Tarih Yazımı ve Geçmişin İnşası',
    code: 'TAR.9.1.1',
    outcome_title: 'Tarihsel Bilgi Kaynakları ve Eleştirel Yaklaşım',
    outcome_description: 'Birincil ve ikincil kaynakları ayırt eder, tarih araştırmalarında tenkit ve tahlil basamaklarını açıklar.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'tar-9-2-1',
    grade: 9,
    subject: 'Tarih',
    theme_name: 'İlk ve Orta Çağlarda Türk Dünyası',
    code: 'TAR.9.2.1',
    outcome_title: 'Konargöçer Yaşam Kültürü ve Boy Teşkilatı',
    outcome_description: 'İlk Türk devletlerinde ordu-millet anlayışını, kut inancını ve ikili teşkilat sistemini analiz eder.',
    skill_domain: 'Kavramsal Beceri',
    has_phet_sim: false,
  },
  {
    id: 'cog-9-1-1',
    grade: 9,
    subject: 'Coğrafya',
    theme_name: 'Doğal Sistemler ve Harita Okuryazarlığı',
    code: 'COĞ.9.1.1',
    outcome_title: 'Harita Projeksiyonları, Ölçek ve Koordinat Sistemi',
    outcome_description: 'Coğrafi koordinat sistemini kullanarak yerel saat hesaplar ve izohips haritalarında yer şekillerini yorumlar.',
    skill_domain: 'Alan Becerisi',
    has_phet_sim: true,
    related_sim_slug: 'izohips-haritasi',
  },
];

/**
 * Filtreleme yardımcı fonksiyonları
 */
export function getMaarifCatalogNodes(grade?: MaarifGrade, subject?: MaarifSubject): MaarifCurriculumNode[] {
  return MAARIF_CATALOG.filter(node => {
    if (grade && node.grade !== grade) return false;
    if (subject && node.subject !== subject) return false;
    return true;
  });
}

export function getMaarifThemes(grade: MaarifGrade, subject: MaarifSubject): string[] {
  const nodes = getMaarifCatalogNodes(grade, subject);
  return Array.from(new Set(nodes.map(n => n.theme_name)));
}

export function getMaarifNodeByCode(code: string): MaarifCurriculumNode | undefined {
  return MAARIF_CATALOG.find(n => n.code === code);
}
