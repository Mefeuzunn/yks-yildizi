import React from 'react';

export interface LeagueTier {
  name: string;
  minXp: number;
  color: string;
  bg: string;
  border: string;
  glow: string;
  emoji: string;
}

export const LEAGUE_TIERS: LeagueTier[] = [
  {
    name: 'Bronz',
    minXp: 0,
    color: '#d97706',
    bg: 'rgba(180, 83, 9, 0.15)',
    border: 'rgba(217, 119, 6, 0.3)',
    glow: 'rgba(217, 119, 6, 0.25)',
    emoji: '🥉'
  },
  {
    name: 'Gümüş',
    minXp: 500,
    color: '#9ca3af',
    bg: 'rgba(156, 163, 175, 0.15)',
    border: 'rgba(156, 163, 175, 0.3)',
    glow: 'rgba(156, 163, 175, 0.25)',
    emoji: '🥈'
  },
  {
    name: 'Altın',
    minXp: 1500,
    color: '#facc15',
    bg: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.35)',
    glow: 'rgba(250, 204, 21, 0.35)',
    emoji: '🥇'
  },
  {
    name: 'Platin',
    minXp: 3500,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
    glow: 'rgba(56, 189, 248, 0.35)',
    emoji: '💠'
  },
  {
    name: 'Elmas',
    minXp: 7500,
    color: '#818cf8',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.4)',
    glow: 'rgba(99, 102, 241, 0.35)',
    emoji: '💎'
  },
  {
    name: 'Şampiyon',
    minXp: 15000,
    color: '#c084fc',
    bg: 'rgba(168, 85, 247, 0.2)',
    border: 'rgba(168, 85, 247, 0.5)',
    glow: 'rgba(168, 85, 247, 0.45)',
    emoji: '👑'
  },
  {
    name: 'Üstat',
    minXp: 25000,
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.2)',
    border: 'rgba(244, 63, 94, 0.5)',
    glow: 'rgba(244, 63, 94, 0.45)',
    emoji: '🔥'
  },
  {
    name: 'Kozmik Efsane',
    minXp: 40000,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.25)',
    border: 'rgba(236, 72, 153, 0.6)',
    glow: 'rgba(236, 72, 153, 0.55)',
    emoji: '🌌'
  }
];

export const LEAGUE_MAP: Record<string, LeagueTier> = LEAGUE_TIERS.reduce(
  (acc, l) => ({ ...acc, [l.name]: l }),
  {}
);

export function calculateLeague(points: number): string {
  const p = Math.max(0, points || 0);
  if (p >= 40000) return 'Kozmik Efsane';
  if (p >= 25000) return 'Üstat';
  if (p >= 15000) return 'Şampiyon';
  if (p >= 7500) return 'Elmas';
  if (p >= 3500) return 'Platin';
  if (p >= 1500) return 'Altın';
  if (p >= 500) return 'Gümüş';
  return 'Bronz';
}

export function getLeagueInfo(leagueName: string): LeagueTier {
  return LEAGUE_MAP[leagueName] || LEAGUE_MAP['Bronz'];
}

export function getNextLeagueThreshold(currentLeague: string): { next: string; xp: number } {
  const thresholds: Record<string, { next: string; xp: number }> = {
    'Bronz': { next: 'Gümüş', xp: 500 },
    'Gümüş': { next: 'Altın', xp: 1500 },
    'Altın': { next: 'Platin', xp: 3500 },
    'Platin': { next: 'Elmas', xp: 7500 },
    'Elmas': { next: 'Şampiyon', xp: 15000 },
    'Şampiyon': { next: 'Üstat', xp: 25000 },
    'Üstat': { next: 'Kozmik Efsane', xp: 40000 },
    'Kozmik Efsane': { next: 'Maksimum Lig', xp: 40000 }
  };
  return thresholds[currentLeague] || thresholds['Bronz'];
}
