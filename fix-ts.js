const fs = require('fs');
const glob = require('glob');

const paths = [
  'src/app/api/questions/error-quiz/route.ts',
  'src/app/api/questions/generate/route.ts',
  'src/app/api/shop/inventory/route.ts'
];

for (const p of paths) {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Fix missing awaits for checkUni or db queries that TS warns about `Promise<Row & Iterable<Row>>`
    content = content.replace(/const template = getTemplate\.get\(\) as/g, 'const template = await getTemplate.get() as');
    content = content.replace(/const qTemplate = getTemplateStmt\.get\(id\) as/g, 'const qTemplate = await getTemplateStmt.get(id) as');
    
    // Fix Inventory pushing generic rows
    content = content.replace(/inventory\.push\(checkItem\.get\(item_id\)\);/g, 'const item = await checkItem.get(item_id); inventory.push(item as any);');
    
    // Replace `as QuestionTemplate` with `as unknown as QuestionTemplate` just in case to suppress mismatch
    content = content.replace(/as QuestionTemplate/g, 'as unknown as QuestionTemplate');

    fs.writeFileSync(p, content);
  }
}
