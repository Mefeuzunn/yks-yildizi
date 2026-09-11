const fs = require('fs');
let content = fs.readFileSync('tailwind.config.ts', 'utf8');

content = content.replace(
  "'100%': { transform: 'translateX(-100%)' }",
  "'100%': { transform: 'translateX(-50%)' }"
);

fs.writeFileSync('tailwind.config.ts', content);
console.log("Fixed marquee animation to -50%");
