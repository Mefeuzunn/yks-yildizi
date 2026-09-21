const fs = require('fs');
const p = 'src/components/dashboard/ScanMistakeModal.tsx';
let content = fs.readFileSync(p, 'utf8');

// The form inputs have display: grid, gridTemplateColumns: 1fr 1fr
content = content.replace(
  /display: 'grid', gridTemplateColumns: '1fr 1fr'/g,
  "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'"
);

fs.writeFileSync(p, content);
console.log("ScanMistakeModal fixed");
