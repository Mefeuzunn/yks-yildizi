const fs = require('fs');
let content = fs.readFileSync('src/components/LayoutShell.tsx', 'utf8');

// Add imports
content = content.replace(
  /import \{ AuthProvider \} from '@\/context\/AuthContext';/,
  `import { AuthProvider } from '@/context/AuthContext';\nimport { TimerProvider } from '@/context/TimerContext';\nimport GlobalTimerWidget from '@/components/GlobalTimerWidget';`
);

// Wrap children
const regex1 = /<AuthProvider>\n\s+\{children\}\n\s+<\/AuthProvider>/;
content = content.replace(regex1, `<AuthProvider>\n        <TimerProvider>\n          {children}\n          <GlobalTimerWidget />\n        </TimerProvider>\n      </AuthProvider>`);

const regex2 = /<AuthProvider>\n\s+<div style=\{\{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' \}\}>/;
content = content.replace(regex2, `<AuthProvider>\n      <TimerProvider>\n      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19' }}>`);

const regex3 = /<\/main>\n\s+<\/div>\n\s+<\/AuthProvider>/;
content = content.replace(regex3, `</main>\n        <GlobalTimerWidget />\n      </div>\n      </TimerProvider>\n    </AuthProvider>`);

fs.writeFileSync('src/components/LayoutShell.tsx', content);
console.log("Updated LayoutShell");
