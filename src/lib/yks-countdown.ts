/**
 * YKS Yıldızı - Dinamik YKS Sayaç & Hedef Tarih Motoru
 * Öğrencinin sınıf düzeyine (12. Sınıf, Mezun, 11. Sınıf vb.) göre doğru hedef YKS sınav tarihini dinamik olarak hesaplar.
 */

// ÖSYM YKS Tarihleri (Cumartesi 10:15 TSİ)
export const YKS_DATES = {
  YKS_2026: '2026-06-20T10:15:00+03:00',
  YKS_2027: '2027-06-19T10:15:00+03:00',
  YKS_2028: '2028-06-17T10:15:00+03:00',
};

/**
 * Kullanıcının sınıf düzeyine göre hedef sınav tarihini döndürür.
 * @param sinif '9' | '10' | '11' | '12' | 'mezun' veya undefined
 */
export function getYksTargetDate(sinif?: string | number | null): Date {
  const sinifStr = String(sinif || '').trim().toLowerCase();

  if (sinifStr === '11') {
    return new Date(YKS_DATES.YKS_2027);
  }
  if (sinifStr === '10') {
    return new Date(YKS_DATES.YKS_2028);
  }
  if (sinifStr === '9') {
    return new Date('2029-06-16T10:15:00+03:00');
  }

  // 12. Sınıf, Mezun veya belirtilmemiş ise:
  // Şimdiye göre en yakın gelecekteki sınavı seç
  const now = Date.now();
  const date2026 = new Date(YKS_DATES.YKS_2026).getTime();
  if (now < date2026) {
    return new Date(YKS_DATES.YKS_2026);
  }

  return new Date(YKS_DATES.YKS_2027);
}

/**
 * Hedef tarihe kalan süreyi hesaplar.
 */
export function calculateYksCountdown(targetDate?: Date | string | null): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isPassed: boolean;
  formattedTarget: string;
} {
  const target = targetDate ? new Date(targetDate) : getYksTargetDate();
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isPassed: true,
      formattedTarget: target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isPassed: false,
    formattedTarget: target.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
