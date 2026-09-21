const fs = require('fs');
const p = 'src/components/dashboard/TestsTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// The main grid
content = content.replace(
  "gridTemplateColumns: '1fr 1fr'",
  "flexWrap: 'wrap', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'"
);
// Wait, I should just use grid with auto-fit:
content = content.replace(
  "display: 'grid', gridTemplateColumns: '1fr 1fr'",
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'"
);

fs.writeFileSync(p, content);
console.log("TestsTab layout fixed");
