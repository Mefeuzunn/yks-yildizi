const fs = require('fs');
let content = fs.readFileSync('tailwind.config.ts', 'utf8');

const target = `      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
      }`;

const replacement = `      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      animation: {
        marquee: 'marquee 30s linear infinite'
      }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('tailwind.config.ts', content);
  console.log("tailwind.config.ts updated");
} else {
  console.log("Target not found");
}
