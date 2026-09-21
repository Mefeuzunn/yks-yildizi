const fs = require('fs');
const p = 'src/components/dashboard/ProfileTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace the main split layout
content = content.replace(
  "display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem'",
  "display: 'flex', flexWrap: 'wrap', gap: '2rem'"
);
// Make the main column flex
content = content.replace(
  "        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>",
  "        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>"
);
// Make the side column flex
content = content.replace(
  "        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>",
  "        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>"
);

// Fix the header flex that doesn't wrap
content = content.replace(
  "display: 'flex', gap: '2rem', alignItems: 'center'",
  "display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center'"
);

// Fix the inner stats grid
content = content.replace(
  "display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem'"
);

fs.writeFileSync(p, content);
console.log("ProfileTab layout fixed");
