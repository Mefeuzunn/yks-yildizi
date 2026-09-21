const fs = require('fs');
const p = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace padding: '24px' with just padding: 0 since the layout already handles padding.
// Or just let CSS handle it.
content = content.replace(
  "style={{ minHeight: '100vh', backgroundColor: '#020617', padding: '24px', fontFamily: '\"Inter\", sans-serif', boxSizing: 'border-box' }}",
  "style={{ minHeight: '100vh', backgroundColor: '#020617', padding: '16px 0', fontFamily: '\"Inter\", sans-serif', boxSizing: 'border-box' }}"
);
fs.writeFileSync(p, content);
console.log("Fixed padding on dashboard home");
