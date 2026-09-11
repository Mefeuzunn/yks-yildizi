const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

content = content.replace(
  /\{\/\* Node icon \*\/\}\n\s+<div style=\{\{/g,
  `{/* Node icon */}
          <div 
            onClick={(e) => {
              if (isActive && onComplete) {
                e.preventDefault();
                e.stopPropagation();
                onComplete();
              }
            }}
            style={{`
);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Added onClick to Node icon");
