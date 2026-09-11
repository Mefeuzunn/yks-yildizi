const fs = require('fs');
const files = [
  'src/app/api/ogretmen/siniflar/route.ts',
  'src/app/api/ogretmen/analytics/route.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ROUND\(AVG\(COALESCE\(([^,]+), ([^)]+)\)\), ([^)]+)\)/g, 'ROUND(CAST(AVG(COALESCE($1, $2)) AS NUMERIC), $3)');
  fs.writeFileSync(file, content);
}
