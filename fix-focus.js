const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// Replace the 300x300 fixed sizes in the main timer circle
content = content.replace(
  "width: '300px', height: '300px', borderRadius: '50%',",
  "width: '100%', maxWidth: '300px', aspectRatio: '1/1', borderRadius: '50%',"
);

// We need to also check the SVG stroke circles inside it
content = content.replace(
  "<svg width=\"300\" height=\"300\"",
  "<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 300 300\" preserveAspectRatio=\"xMidYMid meet\""
);

// We need to fix the grid in Ambient Sounds
content = content.replace(
  "gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'",
  "gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px'"
);

fs.writeFileSync(p, content);
console.log("Focus fixed");
