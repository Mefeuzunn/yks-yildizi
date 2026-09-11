const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("src/app/api/**/*.ts");

for (const sf of sourceFiles) {
  let modified = false;

  // Change import
  const importDec = sf.getImportDeclaration(dec => 
    dec.getModuleSpecifierValue() === '@/lib/yks-sqlite' || 
    dec.getModuleSpecifierValue() === '../../../lib/yks-sqlite' ||
    dec.getModuleSpecifierValue() === '../../lib/yks-sqlite'
  );
  
  if (importDec) {
    importDec.setModuleSpecifier('@/lib/yks-db');
    importDec.setDefaultImport('sql');
    modified = true;
  }

  // Very naive string replacement for the file text because AST manipulation for template literals + tagged templates is highly complex.
  // Actually, string replace is dangerous but let's try a hybrid approach.
  let text = sf.getFullText();
  
  // If the file uses db.prepare, let's just use string replacement for the common patterns.
  // We'll replace import db from '@/lib/yks-sqlite' manually just in case AST failed
  text = text.replace(/import db from '@\/lib\/yks-sqlite';?/g, "import sql from '@/lib/yks-db';");
  
  // This is too complex for a quick script. 
}
