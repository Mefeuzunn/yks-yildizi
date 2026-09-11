export const BADGES = [
  {
    id: 'kusursuz_zihin',
    icon: '🌟',
    title: 'Kusursuz Zihin',
    description: 'İlk defa 1000 Puanı geç.',
    colorClass: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(202, 138, 4, 0.1))',
    borderColor: 'rgba(234, 179, 8, 0.2)',
    textColor: '#eab308'
  },
  {
    id: 'atesli_seri',
    icon: '🔥',
    title: 'İlk Kan',
    description: 'İlk sorunu doğru cevapla.',
    colorClass: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.1))',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    textColor: '#ef4444'
  },
  {
    id: 'gladyator',
    icon: '⚔️',
    title: 'Gladyatör',
    description: 'Altın Lige yüksel.',
    colorClass: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.1))',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    textColor: '#a855f7'
  },
  {
    id: 'soru_canavari',
    icon: '🦉',
    title: 'Soru Canavarı',
    description: '50 soru çöz.',
    colorClass: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(3, 105, 161, 0.1))',
    borderColor: 'rgba(56, 189, 248, 0.2)',
    textColor: '#38bdf8'
  }
];

export function checkBadges(stats: any): string[] {
  const newUnlocked: string[] = [];
  
  if (stats.league_points >= 1000) newUnlocked.push('kusursuz_zihin');
  if (stats.solved_questions >= 1) newUnlocked.push('atesli_seri'); // İlk Kan
  if (stats.league_points >= 500) newUnlocked.push('gladyator');
  if (stats.solved_questions >= 50) newUnlocked.push('soru_canavari');

  return newUnlocked;
}
