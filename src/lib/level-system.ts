/**
 * YKS Yıldızı - Standart Seviye & İlerleme Motoru
 * Tüm sistem genelinde (Klanlar, Görevler, Profil, Maskotlar) tek tip seviye hesaplaması sağlar.
 */

export const XP_PER_LEVEL = 500;

/**
 * Verilen XP miktarına göre kullanıcının seviyesini (Level) döndürür.
 * Örn: 0 XP = Level 1, 500 XP = Level 2, 1000 XP = Level 3...
 */
export function getLevel(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  return Math.floor(safeXp / XP_PER_LEVEL) + 1;
}

/**
 * Bir sonraki seviyeye geçmek için gereken toplam XP eşiğini döndürür.
 */
export function getNextLevelXp(level: number): number {
  return level * XP_PER_LEVEL;
}

/**
 * Mevcut seviyedeki ilerleme detaylarını hesaplar.
 */
export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  neededForNextLevel: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  const level = getLevel(safeXp);
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const neededForNextLevel = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / neededForNextLevel) * 100));

  return {
    level,
    currentLevelXp,
    neededForNextLevel,
    progressPercent,
  };
}

/**
 * Seviyeye göre unvan/kademe adı döndürür.
 */
export function getLevelTitle(level: number): string {
  if (level >= 80) return 'Kozmik Efsane';
  if (level >= 50) return 'Büyük Üstat';
  if (level >= 30) return 'YKS Şampiyonu';
  if (level >= 20) return 'Elmas Akademisyen';
  if (level >= 10) return 'Kıdemli Kaşif';
  if (level >= 5) return 'Yıldız Yolcusu';
  return 'Yeni Başlayan';
}
