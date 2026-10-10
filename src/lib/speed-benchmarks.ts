/**
 * ÖSYM YKS Standartları Soru Çözüm Hızı ve Zaman Yönetimi Referansları
 * 
 * TYT Sınavı: 165 Dakika / 120 Soru (Soru başına ortalama ~82.5 saniye)
 * AYT Sınavı: 180 Dakika / 80 Soru (Soru başına ortalama ~135 saniye)
 */

export interface SubjectSpeedBenchmark {
  subject: string;
  nameTr: string;
  targetSeconds: number;       // İdeal ÖSYM hedefi (saniye)
  fastThreshold: number;       // Bu sürenin altı "Şimşek Hızlı"
  normalThreshold: number;     // Bu sürenin altı "Normal/Dengeli"
  warningThreshold: number;    // Bu sürenin üstü "Süre Aşımı / Zaman Kaybı"
  icon: string;
  category: 'Türkçe' | 'Matematik' | 'Fen' | 'Sosyal';
  tips: {
    fast: string;
    ideal: string;
    slow: string;
  };
}

export const SPEED_BENCHMARKS: Record<string, SubjectSpeedBenchmark> = {
  'Türkçe': {
    subject: 'Türkçe',
    nameTr: 'Türkçe & Paragraf',
    targetSeconds: 65,
    fastThreshold: 45,
    normalThreshold: 85,
    warningThreshold: 95,
    icon: '📖',
    category: 'Türkçe',
    tips: {
      fast: 'Harika hız! Ancak ana fikir ve olumsuz köklü (değinilmemiştir vb.) sorularda dikkatsizlik yapmadığından emin ol.',
      ideal: 'Mükemmel ÖSYM standardı! 40 soruyu ~45 dakikada bitirip matematiğe zaman kazandırıyorsun.',
      slow: 'Paragrafı iki kez okuma alışkanlığı süreyi uzatıyor olabilir. Önce soru kökünü ve şıkları göz ucuyla tara.',
    },
  },
  'Edebiyat': {
    subject: 'Edebiyat',
    nameTr: 'Türk Dili ve Edebiyatı',
    targetSeconds: 55,
    fastThreshold: 35,
    normalThreshold: 75,
    warningThreshold: 85,
    icon: '✍️',
    category: 'Türkçe',
    tips: {
      fast: 'Hızlı bilgi hatırlama! Eser-yazar eşleştirmelerinde çok güçlüsün.',
      ideal: 'İdeal AYT temposu! Edebi akım ve şiir bilgisi sorularını net dakikalarda çözüyorsun.',
      slow: 'Şiir tahlili sorularında takılıyorsan ilk turda işaretleyip ikinci tura bırakma taktiğini uygula.',
    },
  },
  'Matematik': {
    subject: 'Matematik',
    nameTr: 'Temel & İleri Matematik',
    targetSeconds: 95,
    fastThreshold: 65,
    normalThreshold: 125,
    warningThreshold: 140,
    icon: '📐',
    category: 'Matematik',
    tips: {
      fast: 'İnanılmaz hız! İşlem hatası riskini kontrol altında tutmak için sağlamasını yap.',
      ideal: 'Kusursuz YKS temposu! Yeni nesil kurgusal sorular için tam hedeflenen süre aralığındasın.',
      slow: '120 saniyeyi geçen sorularda soruyla inatlaşma! Turlama tekniğiyle işaret koyup geçmek sana sınav kazandırır.',
    },
  },
  'Geometri': {
    subject: 'Geometri',
    nameTr: 'Geometri',
    targetSeconds: 90,
    fastThreshold: 60,
    normalThreshold: 120,
    warningThreshold: 135,
    icon: '📏',
    category: 'Matematik',
    tips: {
      fast: 'Görsel zekan formda! Ek çizimleri (yardımcı doğru) ilk bakışta yakalıyorsun.',
      ideal: 'Dengeli geometri temposu. Şekil üzerindeki verileri soru metniyle eşleştirmeyi ihmal etme.',
      slow: 'Şekli göremezsen kağıdı çevir veya 45 saniye sonra geç. Geometride turlamak zihni tazeler.',
    },
  },
  'Fizik': {
    subject: 'Fizik',
    nameTr: 'Fizik',
    targetSeconds: 65,
    fastThreshold: 45,
    normalThreshold: 85,
    warningThreshold: 95,
    icon: '⚡',
    category: 'Fen',
    tips: {
      fast: 'Kavramsal netlik harika! Öncüllü sorularda \'kesinlikle\' ibarelerine ekstra dikkat et.',
      ideal: 'ÖSYM Fen standardında ilerliyorsun. Sayısal ve sözel fizik dengen gayet iyi.',
      slow: 'Formül çıkarmakla vakit kaybetmek yerine temel doğa yasası ve birim analizini hatırla.',
    },
  },
  'Kimya': {
    subject: 'Kimya',
    nameTr: 'Kimya',
    targetSeconds: 55,
    fastThreshold: 35,
    normalThreshold: 75,
    warningThreshold: 85,
    icon: '🧪',
    category: 'Fen',
    tips: {
      fast: 'Yıldırım hızı! Mol ve periyodik sistem sorularını reflex haline getirmişsin.',
      ideal: 'İdeal kimya süresi. TYT Kimya’yı 6-7 dakikada bitirip diğer branşlara zaman aktarabilirsin.',
      slow: 'Sayısal hesaplamalı (stokiyometri, gazlar) sorularda pratik sadeleştirme adımlarına odaklan.',
    },
  },
  'Biyoloji': {
    subject: 'Biyoloji',
    nameTr: 'Biyoloji',
    targetSeconds: 50,
    fastThreshold: 30,
    normalThreshold: 70,
    warningThreshold: 80,
    icon: '🔬',
    category: 'Fen',
    tips: {
      fast: 'Müthiş bilgi hakimiyeti! Biyoloji senin en büyük zaman kumbaran olabilir.',
      ideal: 'ÖSYM standart süresindesin. Kalıtım ve hücre sorularında öncülleri sakin oku.',
      slow: 'Uzun deney ve grafik sorularında sadece sorulan parametreyi odak noktası yap.',
    },
  },
  'Tarih': {
    subject: 'Tarih',
    nameTr: 'Tarih',
    targetSeconds: 45,
    fastThreshold: 28,
    normalThreshold: 65,
    warningThreshold: 75,
    icon: '🏛️',
    category: 'Sosyal',
    tips: {
      fast: 'Kronoloji ve kavram bilgin yerinde. Hızlıca net toplayıp ilerliyorsun.',
      ideal: 'İdeal sosyal temposu. Paragraf yorumlu tarih soruları için tam dozaj.',
      slow: 'Kendi yorumunu katmadan sadece metinde verilen bilgiye göre karar ver.',
    },
  },
  'Coğrafya': {
    subject: 'Coğrafya',
    nameTr: 'Coğrafya',
    targetSeconds: 45,
    fastThreshold: 28,
    normalThreshold: 65,
    warningThreshold: 75,
    icon: '🌍',
    category: 'Sosyal',
    tips: {
      fast: 'Harita ve koordinat okuman çok keskin!',
      ideal: 'Dengeli süre. Dünya/Türkiye haritası sorularında işaretli bölgeleri hızla tarıyorsun.',
      slow: 'Harita sorularında iklim ve yer şekilleri kodlamalarını tekrar etmek süreyi yarıya indirir.',
    },
  },
  'Felsefe': {
    subject: 'Felsefe',
    nameTr: 'Felsefe & Mantık',
    targetSeconds: 45,
    fastThreshold: 28,
    normalThreshold: 65,
    warningThreshold: 75,
    icon: '🤔',
    category: 'Sosyal',
    tips: {
      fast: 'Filozof görüşlerini ve temel akımları hızla ayırt ediyorsun.',
      ideal: 'Kavramsal yorum soruları için ideal odaklanma süresi.',
      slow: 'Metnin felsefi jargonu içinde kaybolma, filozofun savunduğu tek ana tezi bul.',
    },
  },
  'Din Kültürü': {
    subject: 'Din Kültürü',
    nameTr: 'Din Kültürü ve Ahlak Bilgisi',
    targetSeconds: 40,
    fastThreshold: 25,
    normalThreshold: 55,
    warningThreshold: 65,
    icon: '✨',
    category: 'Sosyal',
    tips: {
      fast: 'Kavramlar ve ayet mealleri zihninde çok taze!',
      ideal: 'ÖSYM standart süresi. Sakin ve emin adımlarla net cebe giriyor.',
      slow: 'Ayet/hadis metninden çıkarılabilecek doğrudan yargıya odaklan.',
    },
  },
};

// Genel varsayılan benchmark
const DEFAULT_BENCHMARK: SubjectSpeedBenchmark = {
  subject: 'Genel',
  nameTr: 'Genel Soru',
  targetSeconds: 70,
  fastThreshold: 45,
  normalThreshold: 90,
  warningThreshold: 110,
  icon: '🎯',
  category: 'Matematik',
  tips: {
    fast: 'Çok hızlı çözüldü, doğruluğu teyit et.',
    ideal: 'ÖSYM hedef süresi içinde çözüldü.',
    slow: 'Süre standartların üzerinde, turlama tekniğini uygula.',
  },
};

export type SpeedRating = 'fast' | 'ideal' | 'normal' | 'slow';

export interface SpeedEvaluation {
  rating: SpeedRating;
  label: string;
  badgeText: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  targetSeconds: number;
  differenceSeconds: number; // Negatif = hedeften hızlı (iyi), Pozitif = hedeften yavaş
  advice: string;
}

export function getSubjectBenchmark(subject?: string): SubjectSpeedBenchmark {
  if (!subject) return DEFAULT_BENCHMARK;
  
  // Basit normalizasyon
  const clean = subject.trim();
  if (SPEED_BENCHMARKS[clean]) return SPEED_BENCHMARKS[clean];

  for (const [key, val] of Object.entries(SPEED_BENCHMARKS)) {
    if (clean.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(clean.toLowerCase())) {
      return val;
    }
  }

  return DEFAULT_BENCHMARK;
}

export function evaluateQuestionSpeed(subject: string, seconds: number): SpeedEvaluation {
  const bench = getSubjectBenchmark(subject);
  const diff = seconds - bench.targetSeconds;

  if (seconds <= bench.fastThreshold) {
    return {
      rating: 'fast',
      label: 'Şimşek Hızında ⚡',
      badgeText: 'Çok Hızlı',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.14)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      targetSeconds: bench.targetSeconds,
      differenceSeconds: diff,
      advice: bench.tips.fast,
    };
  }

  if (seconds <= bench.targetSeconds + 10) {
    return {
      rating: 'ideal',
      label: 'İdeal ÖSYM Hızı 🎯',
      badgeText: 'İdeal Hız',
      color: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.14)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
      targetSeconds: bench.targetSeconds,
      differenceSeconds: diff,
      advice: bench.tips.ideal,
    };
  }

  if (seconds <= bench.warningThreshold) {
    return {
      rating: 'normal',
      label: 'Kabul Edilebilir Süre ⏳',
      badgeText: 'Dengeli',
      color: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.14)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      targetSeconds: bench.targetSeconds,
      differenceSeconds: diff,
      advice: bench.tips.ideal,
    };
  }

  return {
    rating: 'slow',
    label: 'Zaman Aşımı Uyarısı ⚠️',
    badgeText: 'Süre Aşımı',
    color: '#ef4444',
    badgeBg: 'rgba(239, 68, 68, 0.14)',
    badgeBorder: 'rgba(239, 68, 68, 0.35)',
    targetSeconds: bench.targetSeconds,
    differenceSeconds: diff,
    advice: bench.tips.slow,
  };
}
