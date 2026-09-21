const fs = require('fs');

// 1. Fix ScheduleTab.tsx
const pSchedule = 'src/components/dashboard/ScheduleTab.tsx';
let sched = fs.readFileSync(pSchedule, 'utf8');
sched = sched.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('Sparkles')) return `import { Sparkles, ${p1} } from 'lucide-react';`;
  return match;
});
sched = sched.replace(
  "style={{display:'block',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,display:'flex',alignItems:'center',gap:'6px'}}",
  "style={{display:'flex',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,alignItems:'center',gap:'6px'}}"
);
sched = sched.replace(
  "style={{display:'block',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,display:'flex',alignItems:'center',gap:'6px'}}",
  "style={{display:'flex',fontSize:'12px',color:'#9ca3af',marginBottom:'7px',fontWeight:600,alignItems:'center',gap:'6px'}}"
);
fs.writeFileSync(pSchedule, sched);

// 2. Fix veli/page.tsx FileText missing
const pVeli = 'src/app/veli/page.tsx';
let veli = fs.readFileSync(pVeli, 'utf8');
veli = veli.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('FileText')) return `import { FileText, ${p1} } from 'lucide-react';`;
  return match;
});
fs.writeFileSync(pVeli, veli);

// 3. Fix FocusTab.tsx Settings and Minimize missing
const pFocus = 'src/components/dashboard/FocusTab.tsx';
let focus = fs.readFileSync(pFocus, 'utf8');
focus = focus.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
  let adds = [];
  if (!p1.includes('Settings')) adds.push('Settings');
  if (!p1.includes('Minimize')) adds.push('Minimize');
  if (adds.length > 0) return `import { ${adds.join(', ')}, ${p1} } from 'lucide-react';`;
  return match;
});
fs.writeFileSync(pFocus, focus);

console.log("Fixed TS errors");
