const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/AnalysisTab.tsx', 'utf8');

content = content.replace(/const studyHours = \[[^\]]*\]/s, `const studyHours = [
    { day: 'Pzt', hours: 0 }, { day: 'Sal', hours: 0 }, { day: 'Çar', hours: 0 },
    { day: 'Per', hours: 0 }, { day: 'Cum', hours: 0 }, { day: 'Cmt', hours: 0 },
    { day: 'Paz', hours: 0 }
  ]`);

fs.writeFileSync('src/components/dashboard/AnalysisTab.tsx', content);
