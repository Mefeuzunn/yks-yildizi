/**
 * YKS Yıldızı — Design System Tokens
 * 
 * Standartlaştırılmış renk paleti, tipografi skalası, kenar yuvarlıkları ve cam efektleri.
 * Linear, Brilliant ve Stripe kalitesinde tutarlı tasarım dili.
 */

export const tokens = {
  colors: {
    // Brand gradients & accents
    brand: {
      indigo: '#6366f1',
      purple: '#8b5cf6',
      pink: '#ec4899',
      blue: '#3b82f6',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      glow: 'rgba(99, 102, 241, 0.25)',
    },

    // Background surfaces (Obsidian scale)
    bg: {
      canvas: '#080c14',       // En derin arka plan
      surface: '#0b0f19',      // Standart sayfa arka planı
      card: 'rgba(255, 255, 255, 0.035)',   // Cam kart
      cardHover: 'rgba(255, 255, 255, 0.06)',
      cardElevated: '#111827', // Katı modal / drawer
      input: 'rgba(255, 255, 255, 0.04)',
    },

    // Borders
    border: {
      subtle: 'rgba(255, 255, 255, 0.07)',
      light: 'rgba(255, 255, 255, 0.12)',
      active: 'rgba(99, 102, 241, 0.4)',
      focus: '#6366f1',
    },

    // Text hierarchy
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
      accent: '#a5b4fc',
    },

    // YKS League Tiers
    leagues: {
      bronz: { name: 'Bronz', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.3)' },
      gumus: { name: 'Gümüş', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.15)', border: 'rgba(203, 213, 225, 0.3)' },
      altin: { name: 'Altın', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
      platin: { name: 'Platin', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.3)' },
      elmas: { name: 'Elmas', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
      sampiyon: { name: 'Şampiyon', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.4)' },
    }
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  shadows: {
    card: '0 4px 20px rgba(0, 0, 0, 0.25)',
    cardHover: '0 8px 30px rgba(0, 0, 0, 0.4)',
    glowIndigo: '0 0 25px rgba(99, 102, 241, 0.35)',
    glowPurple: '0 0 25px rgba(139, 92, 246, 0.35)',
    glowEmerald: '0 0 25px rgba(16, 185, 129, 0.35)',
  }
} as const;

export type ThemeTokens = typeof tokens;
