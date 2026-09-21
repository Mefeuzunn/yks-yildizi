const fs = require('fs');
const p = 'src/components/dashboard/ActiveTestModal.tsx';
let content = fs.readFileSync(p, 'utf8');

// Content Area flexWrap
content = content.replace(
  "<div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>",
  "<div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>"
);

// Left Area
content = content.replace(
  "          <div style={{ flex: 1, padding: '3rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>",
  "          <div style={{ flex: '999 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>"
);

// Right Area
content = content.replace(
  "          <div style={{ width: '350px', backgroundColor: '#0a0d14', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '2rem', overflowY: 'auto' }}>",
  "          <div style={{ flex: '1 1 300px', backgroundColor: '#0a0d14', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>"
);

// Optik Grid
content = content.replace(
  /gridTemplateColumns: 'repeat\(5, 1fr\)'/g,
  "gridTemplateColumns: 'repeat(auto-fit, minmax(36px, 1fr))'"
);

fs.writeFileSync(p, content);
console.log("ActiveTestModal fixed");
