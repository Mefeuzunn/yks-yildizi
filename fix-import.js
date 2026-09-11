const fs = require('fs');

let content = fs.readFileSync('src/app/api/admin/yokatlas-import/route.ts', 'utf8');

content = content.replace(
  'data.forEach((row: any) => {',
  'for (const row of data) {'
);

// We need to replace the closing `});` of `forEach` with `}`.
// Easiest is to regex replace it. 
content = content.replace(
  /}\);?\s*return NextResponse.json/g,
  '}\n\n      return NextResponse.json'
);

content = content.replace(
  'const existing = checkUni.get(row.uni_name) as { id: string } | undefined;',
  'const existing = await checkUni.get(row.uni_name) as { id: string } | undefined;'
);

content = content.replace(
  'insertUni.run(',
  'await insertUni.run('
);

content = content.replace(
  'insertDep.run(',
  'await insertDep.run('
);

fs.writeFileSync('src/app/api/admin/yokatlas-import/route.ts', content);
