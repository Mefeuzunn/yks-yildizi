const fs = require('fs');
const p = 'src/app/register/page.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace standard flex gap with wrap
content = content.replace(
  /<div style={{ display: 'flex', gap: '1rem' }}>/g,
  "<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>"
);

// Ensure the inner items have minWidth so they actually wrap on very small screens,
// but flex: 1 already does flex-basis: 0%. Let's just add minWidth: '150px' to the flex: 1
content = content.replace(
  /<div style={{ flex: 1 }}>/g,
  "<div style={{ flex: '1 1 150px' }}>"
);

fs.writeFileSync(p, content);
console.log("Fixed Register page layout");
