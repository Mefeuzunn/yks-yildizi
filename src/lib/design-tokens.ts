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
      indigo: '#2563eb',
      purple: '#1d4ed8',
      pink: '#ec4899',
      blue: '#3b82f6',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
      glow: 'rgba(37, 99, 235, 0.25)',
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
      active: 'rgba(37, 99, 235, 0.4)',
      focus: '#2563eb',
    },

    // Text hierarchy
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
      accent: '#60a5fa',
    },

    // YKS League Tiers
    leagues: {
      bronz: { name: 'Bronz', color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)', border: 'rgba(205, 127, 50, 0.3)' },
      gumus: { name: 'Gümüş', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.15)', border: 'rgba(203, 213, 225, 0.3)' },
      altin: { name: 'Altın', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)' },
      platin: { name: 'Platin', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.3)' },
      elmas: { name: 'Elmas', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
      sampiyon: { name: 'Şampiyon', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.2)', border: 'rgba(37, 99, 235, 0.4)' },
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
    glowIndigo: '0 0 25px rgba(37, 99, 235, 0.35)',
    glowPurple: '0 0 25px rgba(2, 132, 199, 0.35)',
    glowEmerald: '0 0 25px rgba(16, 185, 129, 0.35)',
  }
} as const;

export type ThemeTokens = typeof tokens;
