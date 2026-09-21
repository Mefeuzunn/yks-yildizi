const fs = require('fs');
const p = 'src/app/login/page.tsx';
let content = fs.readFileSync(p, 'utf8');

// I will re-add the missing paragraph tag.
content = content.replace(
  "          Hesabın yok mu?",
  "        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>\n          Hesabın yok mu?"
);
fs.writeFileSync(p, content);
