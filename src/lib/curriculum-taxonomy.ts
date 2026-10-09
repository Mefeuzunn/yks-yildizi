export interface SubjectTaxonomy {
  category: 'TYT' | 'AYT' | 'TYT/AYT';
  topics: string[];
}

export const YKS_CURRICULUM_TAXONOMY: Record<string, SubjectTaxonomy> = {
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
