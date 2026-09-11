const fs = require('fs');
let content = fs.readFileSync('tailwind.config.ts', 'utf8');
content = content.replace(
  "  content: [",
  "  content: [\n    './**/*.{js,ts,jsx,tsx,mdx}',"
);
fs.writeFileSync('tailwind.config.ts', content);
console.log("Updated tailwind.config.ts content paths");
