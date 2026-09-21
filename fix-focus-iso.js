const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  '=> s.day === iso',
  '=> s.day.split(\'T\')[0] === iso'
);

fs.writeFileSync(p, content);
console.log("Fixed ISO date matching");
