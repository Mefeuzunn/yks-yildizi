const fs = require('fs');
const p = 'src/components/dashboard/MistakeDetailModal.tsx';
let content = fs.readFileSync(p, 'utf8');

// Content Area flexWrap
content = content.replace(
  "<div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>",
  "<div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>"
);

// Left Area
content = content.replace(
  "            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)' }}>",
  "            <div style={{ flex: '999 1 300px', padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>"
);

// Right Area
content = content.replace(
  "            <div style={{ width: '400px', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' }}>",
  "            <div style={{ flex: '1 1 300px', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' }}>"
);

fs.writeFileSync(p, content);
console.log("MistakeDetailModal fixed");
