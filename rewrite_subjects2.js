const fs = require('fs');

let content = fs.readFileSync('src/lib/subjectData.ts', 'utf8');

// Find the first topic in each subject array and set it to 'in-progress'
// Since each subject has a topics: [ ... ] array, we can use a regex to find the first { name: '...', status: 'pending' } after topics: [

content = content.replace(/topics:\s*\[\s*\{\s*name:\s*([^,]+),\s*status:\s*'pending'/g, "topics: [\n      { name: $1, status: 'in-progress'");

fs.writeFileSync('src/lib/subjectData.ts', content);
console.log("Set first node of each subject to in-progress");
