const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// I will look for: <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}> right after {/* ── Right Column ── */}
content = content.replace(
  "{/* ── Right Column ── */}\n        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>",
  "{/* ── Right Column ── */}\n        <div style={{ flex: '999 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>"
);

fs.writeFileSync(p, content);
console.log("Fixed Focus Right column");
