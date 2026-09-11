const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/FocusTab.tsx', 'utf8');

// Replace WEEKLY_DATA
content = content.replace(/const WEEKLY_DATA = \[[^\]]*\];/s, `const WEEKLY_DATA = [
  { day: 'Pzt', hours: 0 }, { day: 'Sal', hours: 0 }, { day: 'Çar', hours: 0 },
  { day: 'Per', hours: 0 }, { day: 'Cum', hours: 0 }, { day: 'Cmt', hours: 0 },
  { day: 'Paz', hours: 0 },
];`);

// Replace sessionLog state
content = content.replace(/const \[sessionLog, setSessionLog\] = useState<SessionLog\[\]>\(\[[^\]]*\]\);/s, "const [sessionLog, setSessionLog] = useState<SessionLog[]>([]);");

// Replace tasks state
content = content.replace(/const \[tasks, setTasks\] = useState\(\[[^\]]*\]\);/s, "const [tasks, setTasks] = useState<any[]>([]);");

fs.writeFileSync('src/components/dashboard/FocusTab.tsx', content);
console.log("Cleared FocusTab mocks");
