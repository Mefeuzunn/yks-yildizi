const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace the grid container
content = content.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px,460px) 1fr', gap: '24px', alignItems: 'start' }}>",
  "<div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>"
);

// Find the timer card opening div
content = content.replace(
  "        <div style={{ background: '#0f172a', border: `1px solid ${cfg.glow}`, borderRadius: '28px', padding: '32px',\n                      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',",
  "        <div style={{ flex: '1 1 300px', maxWidth: '460px', width: '100%', background: '#0f172a', border: `1px solid ${cfg.glow}`, borderRadius: '28px', padding: '32px',\n                      display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',"
);

// Find the right panel opening div
// From: {/* ── Right Column (Stats & Tasks) ── */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
content = content.replace(
  "        {/* ── Right Column (Stats & Tasks) ── */}\n        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>",
  "        {/* ── Right Column (Stats & Tasks) ── */}\n        <div style={{ flex: '999 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>"
);

fs.writeFileSync(p, content);
console.log("Fixed FocusTab layout");
