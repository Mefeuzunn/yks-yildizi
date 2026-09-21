const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  'const found = data.weekData?.find((s: { day: string; total_min: number }) => s.day.split(\'T\')[0] === iso);',
  'const daySessions = data.weekData?.filter((s: { day: string; total_min: number }) => s.day.split(\'T\')[0] === iso) || [];\n          const dailyTotal = daySessions.reduce((acc: number, curr: any) => acc + (Number(curr.total_min) || 0), 0);'
);

content = content.replace(
  'return { day: dayName, total_min: Number(found?.total_min) || 0, isToday: i === 6 };',
  'return { day: dayName, total_min: dailyTotal, isToday: i === 6 };'
);

fs.writeFileSync(p, content);
console.log("Fixed FocusTab graph aggregation");
