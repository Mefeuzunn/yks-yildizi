const fs = require('fs');
const p = 'src/components/dashboard/FocusTab.tsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  'setTodayMinutes(data.todayMinutes ?? 0);',
  'setTodayMinutes(Number(data.todayTotalMin) || 0);'
);
content = content.replace(
  'setTodayCount(data.todayCount ?? 0);',
  'setTodayCount(Number(data.todaySessions) || 0);'
);
content = content.replace(
  'setAllTimeCount(data.allTimeCount ?? 0);',
  'setAllTimeCount(Number(data.allTimeCount) || 0);'
);
content = content.replace(
  'const found = data.weekSessions?.find',
  'const found = data.weekData?.find'
);
content = content.replace(
  'return { day: dayName, total_min: found?.total_min ?? 0, isToday: i === 6 };',
  'return { day: dayName, total_min: Number(found?.total_min) || 0, isToday: i === 6 };'
);
fs.writeFileSync(p, content);

const apiPath = 'src/app/api/user/focus/route.ts';
let apiContent = fs.readFileSync(apiPath, 'utf8');
apiContent = apiContent.replace(
  'allTimeTotalMin: allTimeRow?.total_min || 0,',
  'allTimeTotalMin: allTimeRow?.total_min || 0,\n      allTimeCount: allTimeRow?.count || 0,'
);
fs.writeFileSync(apiPath, apiContent);

console.log("Fixed FocusTab mapping");
