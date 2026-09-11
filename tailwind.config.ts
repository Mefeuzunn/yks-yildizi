import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5', // Ana buton rengi
          hover: '#4338CA',   // Buton üzerine gelince (Hover)
          light: '#EEF2FF',   // Hafif vurgulu arka planlar
        },
        surface: {
          DEFAULT: '#F8FAFC', // Tüm sayfanın arka planı
          card: '#FFFFFF',    // Üstte duracak beyaz kartlar
        },
        text: {
          heading: '#0F172A', // Kalın başlıklar
          body: '#475569',    // Paragraf metinleri
          muted: '#94A3B8',   // Pasif metinler (Alt kısımdaki üniversite isimleri vb.)
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
      }
    }
  },
  plugins: [], corePlugins: { preflight: false },
}
export default config
