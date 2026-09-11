const fs = require('fs');

const files = [
  'src/app/api/student/assignments/route.ts',
  'src/app/api/student/assignments/submit/route.ts',
];

files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  
  // Replace broken import
  c = c.replace(/import \{ getUserId \} from '@\/lib\/auth';\n?/g, '');
  c = c.replace(/import \{ getUserId \} from ["']@\/lib\/auth["'];\n?/g, '');
  
  // Add proper cookies import if not present
  if (!c.includes("from 'next/headers'")) {
    c = c.replace("import { NextResponse } from 'next/server';", "import { NextResponse } from 'next/server';\nimport { cookies } from 'next/headers';");
  }
  
  // Replace getUserId() call with cookie-based session
  c = c.replace(
    /const userId = await getUserId\(\);/g,
    "const cookieStore = await cookies();\n    const userId = cookieStore.get('yks_session')?.value;"
  );
  
  fs.writeFileSync(file, c);
  console.log('Fixed:', file);
});
