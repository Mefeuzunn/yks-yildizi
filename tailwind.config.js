/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366F1', // Primary brand color
          hover: '#4F46E5',   // Hover
          light: 'rgba(99, 102, 241, 0.12)', // Subtle highlight backgrounds
          indigo: '#6366F1',
          maarif: '#10B981',
          math: '#3B82F6',
          physics: '#8B5CF6',
          chemistry: '#06B6D4',
          biology: '#EC4899',
          literature: '#F59E0B',
          history: '#D97706',
          geography: '#14B8A6',
        },
        surface: {
          canvas: '#080C14',
          DEFAULT: '#0F1523',
          card: '#0F1523',
          cardHover: '#141C2E',
          elevated: '#162035',
          inset: '#090E18',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.07)',
          default: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.20)',
        },
        text: {
          heading: '#FFFFFF',
          primary: '#F1F5F9',
          body: '#CBD5E1',
          muted: '#94A3B8',
          faint: '#64748B',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-inter)', '-apple-system', 'sans-serif'],
        heading: ['var(--font-outfit)', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.09)',
        'glow-brand': '0 0 24px -4px rgba(99, 102, 241, 0.25)',
        'glow-maarif': '0 0 24px -4px rgba(16, 185, 129, 0.25)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    }
  },
  plugins: [],
  corePlugins: { preflight: false },
};
