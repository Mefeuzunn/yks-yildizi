const fs = require('fs');

let content = fs.readFileSync('src/lib/subjectData.ts', 'utf8');

// Replace all progress: <number> with progress: 0
content = content.replace(/progress:\s*\d+/g, 'progress: 0');

// Replace all status: 'completed' or 'in-progress' with 'pending'
content = content.replace(/status:\s*'completed'/g, "status: 'pending'");
content = content.replace(/status:\s*'in-progress'/g, "status: 'pending'");

fs.writeFileSync('src/lib/subjectData.ts', content);
console.log("Cleared subjectData.ts");
