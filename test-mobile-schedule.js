const fs = require('fs');
const p = 'src/components/dashboard/ScheduleTab.tsx';
let content = fs.readFileSync(p, 'utf8');

// I will check where DAYS is used
const daysUsage = content.match(/DAYS\.map/g);
console.log(daysUsage.length);
