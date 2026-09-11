export type Topic = {
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
};

export type Subject = {
  name: string;
  icon: string;
  color: string;
  progress: number;
  alans: string[]; // 'Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', 'All'
  topics: Topic[];
};

export const subjectsData: Subject[] = [
  // --- ORTAK TYT DERSLERİ ---
  {
    name: 'Türkçe (TYT)',
    icon: '📖',
    color: '#ef4444',
    progress: 0,
    alans: ['All'],
    topics: [
      { name: 'Sözcükte Anlam', status: 'in-progress' },
      { name: 'Cümlede Anlam', status: 'pending' },
      { name: 'Paragrafta Anlam', status: 'pending' },
      { name: 'Ses Bilgisi', status: 'pending' },
      { name: 'Yazım Kuralları', status: 'pending' },
      { name: 'Noktalama İşaretleri', status: 'pending' },
      { name: 'Sözcükte Yapı', status: 'pending' },
      { name: 'Sözcük Türleri (İsim, Sıfat, Zamir, Zarf)', status: 'pending' },
      { name: 'Edat, Bağlaç, Ünlem', status: 'pending' },
      { name: 'Fiiller ve Fiilimsiler', status: 'pending' },
      { name: 'Cümlenin Ögeleri', status: 'pending' },
      { name: 'Cümle Türleri', status: 'pending' },
      { name: 'Anlatım Bozuklukları', status: 'pending' },
    ]
  },
  {
    name: 'Tarih (TYT)',
    icon: '🏺',
    color: '#d97706',
    progress: 0,
    alans: ['All'],
    topics: [
      { name: 'Tarih Bilimine Giriş', status: 'in-progress' },
      { name: 'İlk Çağ Uygarlıkları', status: 'pending' },
      { name: 'İlk ve Orta Çağlarda Türk Dünyası', status: 'pending' },
      { name: 'İslam Tarihi ve Uygarlığı', status: 'pending' },
      { name: 'Türklerin İslamiyeti Kabulü', status: 'pending' },
      { name: 'Türkiye Tarihi', status: 'pending' },
      { name: 'Beylikten Devlete Osmanlı', status: 'pending' },
      { name: 'Dünya Gücü Osmanlı', status: 'pending' },
      { name: 'Arayış Yılları', status: 'pending' },
      { name: '18. Yüzyıl Değişim ve Diplomasi', status: 'pending' },
      { name: 'En Uzun Yüzyıl', status: 'pending' },
      { name: 'Milli Mücadele Dönemi', status: 'pending' },
      { name: 'Atatürkçülük ve Türk İnkılabı', status: 'pending' }
    ]
  },
  {
    name: 'Coğrafya (TYT)',
    icon: '🌍',
    color: '#059669',
    progress: 0,
    alans: ['All'],
    topics: [
      { name: 'Doğa ve İnsan', status: 'in-progress' },
      { name: 'Dünya\'nın Şekli ve Hareketleri', status: 'pending' },
      { name: 'Coğrafi Konum', status: 'pending' },
      { name: 'Harita Bilgisi', status: 'pending' },
      { name: 'İklim Bilgisi', status: 'pending' },
      { name: 'Türkiye\'nin İklimi', status: 'pending' },
      { name: 'Yerleşmeler', status: 'pending' },
      { name: 'Nüfus', status: 'pending' },
      { name: 'Göçler', status: 'pending' },
      { name: 'Ekonomik Faaliyetler', status: 'pending' },
      { name: 'Bölgeler ve Ülkeler', status: 'pending' },
      { name: 'Doğal Afetler', status: 'pending' }
    ]
  },
  {
    name: 'Felsefe (TYT)',
    icon: '🤔',
    color: '#7c3aed',
    progress: 0,
    alans: ['All'],
    topics: [
      { name: 'Felsefeyle Tanışma', status: 'in-progress' },
      { name: 'Bilgi Felsefesi', status: 'pending' },
      { name: 'Varlık Felsefesi', status: 'pending' },
      { name: 'Ahlak Felsefesi', status: 'pending' },
      { name: 'Sanat Felsefesi', status: 'pending' },
      { name: 'Din Felsefesi', status: 'pending' },
      { name: 'Siyaset Felsefesi', status: 'pending' },
      { name: 'Bilim Felsefesi', status: 'pending' }
    ]
  },
  {
    name: 'Din Kültürü (TYT)',
    icon: '🕌',
    color: '#0891b2',
    progress: 0,
    alans: ['All'],
    topics: [
      { name: 'Bilgi ve İnanç', status: 'in-progress' },
      { name: 'Din ve İslam', status: 'pending' },
      { name: 'İslam ve İbadet', status: 'pending' },
      { name: 'Gençlik ve Değerler', status: 'pending' },
      { name: 'Allah İnsan İlişkisi', status: 'pending' },
      { name: 'Hz. Muhammed', status: 'pending' },
      { name: 'Vahiy ve Akıl', status: 'pending' }
    ]
  },
  {
    name: 'Matematik (TYT-AYT)',
    icon: '📐',
    color: '#3b82f6',
    progress: 0,
    alans: ['Sayisal', 'Esit Agirlik'], // Sözelciler TYT mat görebilir ama genelde AYT görmez. Dilciler de TYT mat görür.
    // Ancak TYT Matematik ortak olduğu için "All" yapıp sadece AYT konularını filtrelemek karmaşık olur.
    // Kolaylık için Matematik (TYT-AYT) Sayısal ve EA için, Matematik (TYT) ise Sözel ve Dil için ayırıyoruz.
    topics: [
      { name: 'Temel Kavramlar', status: 'in-progress' },
      { name: 'Sayı Basamakları', status: 'pending' },
      { name: 'Bölme ve Bölünebilme', status: 'pending' },
      { name: 'EBOB-EKOK', status: 'pending' },
      { name: 'Rasyonel Sayılar', status: 'pending' },
      { name: 'Basit Eşitsizlikler', status: 'pending' },
      { name: 'Mutlak Değer', status: 'pending' },
      { name: 'Üslü ve Köklü Sayılar', status: 'pending' },
      { name: 'Çarpanlara Ayırma', status: 'pending' },
      { name: 'Oran-Orantı', status: 'pending' },
      { name: 'Problemler', status: 'pending' },
      { name: 'Kümeler', status: 'pending' },
      { name: 'Mantık', status: 'pending' },
      { name: 'Fonksiyonlar', status: 'pending' },
      { name: 'Polinomlar', status: 'pending' },
      { name: '2. Dereceden Denklemler', status: 'pending' },
      { name: 'Parabol', status: 'pending' },
      { name: 'Karmaşık Sayılar', status: 'pending' },
      { name: 'Eşitsizlikler', status: 'pending' },
      { name: 'Trigonometri', status: 'pending' },
      { name: 'Logaritma', status: 'pending' },
      { name: 'Diziler', status: 'pending' },
      { name: 'Limit ve Süreklilik', status: 'pending' },
      { name: 'Türev', status: 'pending' },
      { name: 'İntegral', status: 'pending' },
      { name: 'Permütasyon, Kombinasyon, Olasılık', status: 'pending' },
    ]
  },
  {
    name: 'Matematik (TYT Sadece)',
    icon: '📐',
    color: '#3b82f6',
    progress: 0,
    alans: ['Sozel', 'Dil'], 
    topics: [
      { name: 'Temel Kavramlar', status: 'in-progress' },
      { name: 'Sayı Basamakları', status: 'pending' },
      { name: 'Bölme ve Bölünebilme', status: 'pending' },
      { name: 'EBOB-EKOK', status: 'pending' },
      { name: 'Rasyonel Sayılar', status: 'pending' },
      { name: 'Basit Eşitsizlikler', status: 'pending' },
      { name: 'Mutlak Değer', status: 'pending' },
      { name: 'Üslü ve Köklü Sayılar', status: 'pending' },
      { name: 'Çarpanlara Ayırma', status: 'pending' },
      { name: 'Oran-Orantı', status: 'pending' },
      { name: 'Problemler', status: 'pending' },
      { name: 'Kümeler', status: 'pending' },
      { name: 'Mantık', status: 'pending' },
      { name: 'Fonksiyonlar', status: 'pending' }
    ]
  },
  {
    name: 'Geometri (TYT-AYT)',
    icon: '📏',
    color: '#8b5cf6',
    progress: 0,
    alans: ['Sayisal', 'Esit Agirlik'],
    topics: [
      { name: 'Doğruda ve Üçgende Açılar', status: 'in-progress' },
      { name: 'Dik ve Özel Üçgenler', status: 'pending' },
      { name: 'İkizkenar ve Eşkenar Üçgen', status: 'pending' },
      { name: 'Üçgende Açıortay ve Kenarortay', status: 'pending' },
      { name: 'Üçgende Eşlik ve Benzerlik', status: 'pending' },
      { name: 'Üçgende Alan', status: 'pending' },
      { name: 'Çokgenler ve Dörtgenler', status: 'pending' },
      { name: 'Paralelkenar ve Eşkenar Dörtgen', status: 'pending' },
      { name: 'Dikdörtgen ve Kare', status: 'pending' },
      { name: 'Yamuk', status: 'pending' },
      { name: 'Çemberde Açı ve Uzunluk', status: 'pending' },
      { name: 'Dairenin Çevresi ve Alanı', status: 'pending' },
      { name: 'Analitik Geometri', status: 'pending' },
      { name: 'Katı Cisimler', status: 'pending' },
      { name: 'Çemberin Analitik İncelenmesi', status: 'pending' },
    ]
  },
  {
    name: 'Geometri (TYT Sadece)',
    icon: '📏',
    color: '#8b5cf6',
    progress: 0,
    alans: ['Sozel', 'Dil'],
    topics: [
      { name: 'Doğruda ve Üçgende Açılar', status: 'in-progress' },
      { name: 'Dik ve Özel Üçgenler', status: 'pending' },
      { name: 'İkizkenar ve Eşkenar Üçgen', status: 'pending' },
      { name: 'Üçgende Açıortay ve Kenarortay', status: 'pending' },
      { name: 'Üçgende Eşlik ve Benzerlik', status: 'pending' },
      { name: 'Üçgende Alan', status: 'pending' },
      { name: 'Çokgenler ve Dörtgenler', status: 'pending' },
      { name: 'Katı Cisimler', status: 'pending' }
    ]
  },

  // --- SAYISAL ÖZEL DERSLER ---
  {
    name: 'Fizik (TYT-AYT)',
    icon: '⚛️',
    color: '#f59e0b',
    progress: 0,
    alans: ['Sayisal'],
    topics: [
      { name: 'Fizik Bilimine Giriş', status: 'in-progress' },
      { name: 'Madde ve Özellikleri', status: 'pending' },
      { name: 'Hareket ve Kuvvet', status: 'pending' },
      { name: 'İş, Güç ve Enerji (TYT)', status: 'pending' },
      { name: 'Isı ve Sıcaklık', status: 'pending' },
      { name: 'Basınç ve Kaldırma Kuvveti', status: 'pending' },
      { name: 'Elektrostatik (TYT)', status: 'pending' },
      { name: 'Elektrik Akımı ve Manyetizma', status: 'pending' },
      { name: 'Optik', status: 'pending' },
      { name: 'Dalgalar', status: 'pending' },
      { name: 'Vektörler ve Bağıl Hareket', status: 'pending' },
      { name: 'Newton\'un Hareket Yasaları', status: 'pending' },
      { name: 'Bir Boyutta Sabit İvmeli Hareket', status: 'pending' },
      { name: 'İki Boyutta Hareket (Atışlar)', status: 'pending' },
      { name: 'Enerji ve Hareket (AYT)', status: 'pending' },
      { name: 'İtme ve Çizgisel Momentum', status: 'pending' },
      { name: 'Tork, Denge ve Kütle Merkezi', status: 'pending' },
      { name: 'Basit Makineler', status: 'pending' },
      { name: 'Elektriksel Kuvvet ve Elektrik Alan', status: 'pending' },
      { name: 'Manyetizma ve Elektromanyetik İndüklenme', status: 'pending' },
      { name: 'Alternatif Akım ve Transformatörler', status: 'pending' },
      { name: 'Çembersel Hareket', status: 'pending' },
      { name: 'Basit Harmonik Hareket', status: 'pending' },
      { name: 'Dalga Mekaniği', status: 'pending' },
      { name: 'Atom Fiziğine Giriş ve Radyoaktivite', status: 'pending' },
      { name: 'Modern Fizik', status: 'pending' },
    ]
  },
  {
    name: 'Kimya (TYT-AYT)',
    icon: '🧪',
    color: '#10b981',
    progress: 0,
    alans: ['Sayisal'],
    topics: [
      { name: 'Kimya Bilimi', status: 'in-progress' },
      { name: 'Atom ve Periyodik Sistem', status: 'pending' },
      { name: 'Kimyasal Türler Arası Etkileşimler', status: 'pending' },
      { name: 'Maddenin Halleri', status: 'pending' },
      { name: 'Doğa ve Kimya', status: 'pending' },
      { name: 'Kimyanın Temel Kanunları ve Mol', status: 'pending' },
      { name: 'Karışımlar', status: 'pending' },
      { name: 'Asitler, Bazlar ve Tuzlar', status: 'pending' },
      { name: 'Kimya Her Yerde', status: 'pending' },
      { name: 'Modern Atom Teorisi', status: 'pending' },
      { name: 'Gazlar (AYT)', status: 'pending' },
      { name: 'Sıvı Çözeltiler ve Çözünürlük', status: 'pending' },
      { name: 'Kimyasal Tepkimelerde Enerji', status: 'pending' },
      { name: 'Kimyasal Tepkimelerde Hız', status: 'pending' },
      { name: 'Kimyasal Tepkimelerde Denge', status: 'pending' },
      { name: 'Asit-Baz Dengesi', status: 'pending' },
      { name: 'Çözünürlük Dengesi', status: 'pending' },
      { name: 'Kimya ve Elektrik (Elektrokimya)', status: 'pending' },
      { name: 'Karbon Kimyasına Giriş', status: 'pending' },
      { name: 'Organik Kimya', status: 'pending' },
      { name: 'Enerji Kaynakları ve Bilimsel Gelişmeler', status: 'pending' },
    ]
  },
  {
    name: 'Biyoloji (TYT-AYT)',
    icon: '🧬',
    color: '#ec4899',
    progress: 0,
    alans: ['Sayisal'],
    topics: [
      { name: 'Yaşam Bilimi Biyoloji', status: 'in-progress' },
      { name: 'Hücre', status: 'pending' },
      { name: 'Canlıların Dünyası', status: 'pending' },
      { name: 'Hücre Bölünmeleri', status: 'pending' },
      { name: 'Kalıtımın Genel İlkeleri', status: 'pending' },
      { name: 'Ekosistem Ekolojisi ve Güncel Çevre Sorunları', status: 'pending' },
      { name: 'Sinir Sistemi', status: 'pending' },
      { name: 'Endokrin Sistem', status: 'pending' },
      { name: 'Duyu Organları', status: 'pending' },
      { name: 'Destek ve Hareket Sistemi', status: 'pending' },
      { name: 'Sindirim Sistemi', status: 'pending' },
      { name: 'Dolaşım ve Bağışıklık Sistemi', status: 'pending' },
      { name: 'Solunum Sistemi', status: 'pending' },
      { name: 'Boşaltım Sistemi', status: 'pending' },
      { name: 'Üreme Sistemi ve Embriyonik Gelişim', status: 'pending' },
      { name: 'Komünite ve Popülasyon Ekolojisi', status: 'pending' },
      { name: 'Nükleik Asitler ve Protein Sentezi', status: 'pending' },
      { name: 'Canlılarda Enerji Dönüşümleri (Fotosentez, Solunum)', status: 'pending' },
      { name: 'Bitki Biyolojisi', status: 'pending' },
      { name: 'Canlılar ve Çevre', status: 'pending' },
    ]
  },
  {
    name: 'Fen Bilimleri (TYT Sadece)',
    icon: '🔬',
    color: '#0ea5e9',
    progress: 0,
    alans: ['Esit Agirlik', 'Sozel', 'Dil'],
    topics: [
      { name: 'Fizik Bilimine Giriş', status: 'in-progress' },
      { name: 'Madde ve Özellikleri', status: 'pending' },
      { name: 'Hareket ve Kuvvet', status: 'pending' },
      { name: 'Isı ve Sıcaklık', status: 'pending' },
      { name: 'Optik', status: 'pending' },
      { name: 'Kimya Bilimi', status: 'pending' },
      { name: 'Atom ve Periyodik Sistem', status: 'pending' },
      { name: 'Maddenin Halleri', status: 'pending' },
      { name: 'Yaşam Bilimi Biyoloji', status: 'pending' },
      { name: 'Hücre', status: 'pending' }
    ]
  },

  // --- EŞİT AĞIRLIK VE SÖZEL ÖZEL DERSLER ---
  {
    name: 'Edebiyat (AYT)',
    icon: '📚',
    color: '#be123c',
    progress: 0,
    alans: ['Esit Agirlik', 'Sozel'],
    topics: [
      { name: 'Güzel Sanatlar ve Edebiyat', status: 'in-progress' },
      { name: 'Şiir Bilgisi', status: 'pending' },
      { name: 'Söz Sanatları', status: 'pending' },
      { name: 'İslamiyet Öncesi Türk Edebiyatı', status: 'pending' },
      { name: 'Geçiş Dönemi Eserleri', status: 'pending' },
      { name: 'Halk Edebiyatı', status: 'pending' },
      { name: 'Divan Edebiyatı', status: 'pending' },
      { name: 'Edebi Akımlar', status: 'pending' },
      { name: 'Tanzimat Edebiyatı', status: 'pending' },
      { name: 'Servetifünun ve Fecriati Edebiyatı', status: 'pending' },
      { name: 'Milli Edebiyat Dönemi', status: 'pending' },
      { name: 'Cumhuriyet Dönemi Türk Edebiyatı', status: 'pending' },
      { name: 'Dünya Edebiyatı', status: 'pending' },
    ]
  },
  {
    name: 'Tarih-1 (AYT)',
    icon: '🗺️',
    color: '#b45309',
    progress: 0,
    alans: ['Esit Agirlik', 'Sozel'],
    topics: [
      { name: 'Tarih ve Zaman', status: 'in-progress' },
      { name: 'İnsanlığın İlk Dönemleri', status: 'pending' },
      { name: 'Orta Çağ\'da Dünya', status: 'pending' },
      { name: 'İlk ve Orta Çağlarda Türk Dünyası', status: 'pending' },
      { name: 'İslam Medeniyetinin Doğuşu', status: 'pending' },
      { name: 'Türklerin İslamiyet\'i Kabulü', status: 'pending' },
      { name: 'Osmanlı Devleti Kuruluş ve Yükselme', status: 'pending' },
      { name: 'Değişim Çağında Avrupa ve Osmanlı', status: 'pending' },
      { name: 'Milli Mücadele', status: 'pending' },
      { name: 'Atatürkçülük ve Türk İnkılabı', status: 'pending' },
    ]
  },
  {
    name: 'Coğrafya-1 (AYT)',
    icon: '🏞️',
    color: '#047857',
    progress: 0,
    alans: ['Esit Agirlik', 'Sozel'],
    topics: [
      { name: 'Doğal Sistemler', status: 'in-progress' },
      { name: 'Beşeri Sistemler', status: 'pending' },
      { name: 'Mekansal Sentez Türkiye', status: 'pending' },
      { name: 'Küresel Ortam: Bölgeler ve Ülkeler', status: 'pending' },
      { name: 'Çevre ve Toplum', status: 'pending' },
      { name: 'Ekonomik Faaliyetler', status: 'pending' }
    ]
  },

  // --- SÖZEL ÖZEL DERSLER ---
  {
    name: 'Tarih-2 (AYT)',
    icon: '🏛️',
    color: '#92400e',
    progress: 0,
    alans: ['Sozel'],
    topics: [
      { name: 'Tarih ve Zaman (Detay)', status: 'in-progress' },
      { name: 'İlk Çağ Uygarlıkları (Detay)', status: 'pending' },
      { name: 'Osmanlı Kültür ve Medeniyeti', status: 'pending' },
      { name: '20. Yüzyıl Başlarında Osmanlı Devleti', status: 'pending' },
      { name: 'İki Savaş Arasındaki Dönemde Türkiye ve Dünya', status: 'pending' },
      { name: 'II. Dünya Savaşı Sürecinde Türkiye ve Dünya', status: 'pending' },
      { name: 'Soğuk Savaş Dönemi', status: 'pending' },
      { name: 'Yumuşama (Detant) Dönemi', status: 'pending' },
      { name: 'Küreselleşen Dünya', status: 'pending' },
      { name: 'Türklerde Devlet Teşkilatı', status: 'pending' },
    ]
  },
  {
    name: 'Coğrafya-2 (AYT)',
    icon: '🏔️',
    color: '#065f46',
    progress: 0,
    alans: ['Sozel'],
    topics: [
      { name: 'Ekstrem Doğa Olayları', status: 'in-progress' },
      { name: 'Geleceğin Dünyası', status: 'pending' },
      { name: 'Türkiye\'nin Yer Şekilleri', status: 'pending' },
      { name: 'Türkiye\'nin İklimi ve Bitki Örtüsü', status: 'pending' },
      { name: 'Tarım ve Hayvancılık (Türkiye ve Dünya)', status: 'pending' },
      { name: 'Madenler ve Enerji Kaynakları', status: 'pending' },
      { name: 'Sanayi ve Ticaret', status: 'pending' },
      { name: 'Turizm', status: 'pending' },
      { name: 'Küresel Çevre Sorunları', status: 'pending' }
    ]
  },
  {
    name: 'Felsefe Grubu (AYT)',
    icon: '🧠',
    color: '#5b21b6',
    progress: 0,
    alans: ['Sozel'],
    topics: [
      { name: 'Psikoloji Bilimini Tanıyalım', status: 'in-progress' },
      { name: 'Psikolojinin Temel Süreçleri', status: 'pending' },
      { name: 'Öğrenme, Bellek, Düşünme', status: 'pending' },
      { name: 'Ruh Sağlığının Temelleri', status: 'pending' },
      { name: 'Sosyolojiye Giriş', status: 'pending' },
      { name: 'Birey ve Toplum', status: 'pending' },
      { name: 'Toplumsal Yapı', status: 'pending' },
      { name: 'Toplumsal Değişme ve Gelişme', status: 'pending' },
      { name: 'Mantığa Giriş', status: 'pending' },
      { name: 'Klasik Mantık', status: 'pending' },
      { name: 'Mantık ve Dil', status: 'pending' },
      { name: 'Sembolik Mantık', status: 'pending' }
    ]
  },

  // --- DİL ÖZEL DERSLER ---
  {
    name: 'Yabancı Dil (YDT)',
    icon: '🇬🇧',
    color: '#e11d48',
    progress: 0,
    alans: ['Dil'],
    topics: [
      { name: 'Vocabulary', status: 'in-progress' },
      { name: 'Grammar (Tenses, Modals, Passive)', status: 'pending' },
      { name: 'Cloze Test', status: 'pending' },
      { name: 'Sentence Completion', status: 'pending' },
      { name: 'English-Turkish Translation', status: 'pending' },
      { name: 'Turkish-English Translation', status: 'pending' },
      { name: 'Reading Comprehension', status: 'pending' },
      { name: 'Dialogue Completion', status: 'pending' },
      { name: 'Restatement', status: 'pending' },
      { name: 'Paragraph Completion', status: 'pending' },
      { name: 'Irrelevant Sentence', status: 'pending' }
    ]
  }
];

export const getSubjectsByAlan = (alan: string) => {
  // alan string: 'Sayisal', 'Esit Agirlik', 'Sozel', 'Dil', or null/undefined
  const normalizedAlan = alan || 'Sayisal'; // Default to Sayisal if empty
  
  return subjectsData.filter(s => 
    s.alans.includes('All') || s.alans.includes(normalizedAlan)
  );
};

export const getQuickSelectsByAlan = (alan: string) => {
  const normalizedAlan = alan || 'Sayisal';

  // Ortak kısayollar
  const common = [
    { title: 'Paragraf Rutini', color: '#8b5cf6' },
    { title: 'TYT Türkçe', color: '#0ea5e9' },
    { title: 'TYT Mat Deneme', color: '#3b82f6' },
    { title: 'Geometri Konu', color: '#10b981' }
  ];

  if (normalizedAlan === 'Sayisal') {
    return [
      ...common,
      { title: 'AYT Fizik Soru', color: '#f59e0b' },
      { title: 'AYT Kimya', color: '#ec4899' },
      { title: 'AYT Biyoloji', color: '#14b8a6' },
      { title: 'AYT Matematik', color: '#2563eb' }
    ];
  } else if (normalizedAlan === 'Esit Agirlik') {
    return [
      ...common,
      { title: 'AYT Edebiyat', color: '#be123c' },
      { title: 'Tarih Soru', color: '#b45309' },
      { title: 'Coğrafya Harita', color: '#047857' },
      { title: 'AYT Matematik', color: '#2563eb' }
    ];
  } else if (normalizedAlan === 'Sozel') {
    return [
      ...common,
      { title: 'AYT Edebiyat', color: '#be123c' },
      { title: 'Tarih Detay', color: '#92400e' },
      { title: 'Felsefe Grubu', color: '#5b21b6' },
      { title: 'Coğrafya Konu', color: '#065f46' }
    ];
  } else if (normalizedAlan === 'Dil') {
    return [
      ...common,
      { title: 'YDT Vocabulary', color: '#e11d48' },
      { title: 'Reading Paragraf', color: '#be123c' },
      { title: 'Grammar Tekrar', color: '#9f1239' },
      { title: 'Deneme Analizi', color: '#881337' }
    ];
  }

  return common;
};
