const fs = require('fs');
const p = 'src/components/dashboard/AnalysisTab.tsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  'style={{ flex: \'1 1 300px\' }} style={{ padding: \'2rem\', position: \'relative\', overflow: \'hidden\', borderLeft: \'4px solid #8b5cf6\' }}',
  'style={{ flex: \'1 1 300px\', padding: \'2rem\', position: \'relative\', overflow: \'hidden\', borderLeft: \'4px solid #8b5cf6\' }}'
);

fs.writeFileSync(p, content);
console.log("Fixed duplicate style in AnalysisTab");
