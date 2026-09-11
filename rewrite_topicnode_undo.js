const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const oldRegex = /function TopicNode\(\{ topic, index, subjectColor, subjectSlug, onComplete \}: \{\n  topic: Topic; index: number; subjectColor: string; subjectSlug: string; onComplete\?: \(\) => void;\n\}\)/;

content = content.replace(oldRegex, `function TopicNode({ topic, index, subjectColor, subjectSlug, onComplete, onUndo }: {
  topic: Topic; index: number; subjectColor: string; subjectSlug: string; onComplete?: () => void; onUndo?: () => void;
})`);

const actionAreaRegex = /<div style=\{\{\n\s+padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,\n\s+background: isCompleted \? 'rgba\(16,185,129,0\.1\)' : '#1e293b',\n\s+color: isCompleted \? '#10b981' : '#6b7280',\n\s+border: \`1px solid \$\{isCompleted \? 'rgba\(16,185,129,0\.2\)' : '#374151'\}\`,\n\s+\}\}>\n\s+\{isCompleted \? <span>\+50 XP ✓<\/span> : <span>\+50 XP<\/span>\}\n\s+<\/div>/;

const newActionArea = `<button 
              onClick={(e) => {
                if (isCompleted && onUndo) {
                  e.preventDefault();
                  e.stopPropagation();
                  onUndo();
                }
              }}
              style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                background: isCompleted ? 'rgba(16,185,129,0.1)' : '#1e293b',
                color: isCompleted ? '#10b981' : '#6b7280',
                border: \`1px solid \${isCompleted ? 'rgba(16,185,129,0.2)' : '#374151'}\`,
                cursor: isCompleted ? 'pointer' : 'default'
              }}
            >
              {isCompleted ? <span>+50 XP ✓</span> : <span>+50 XP</span>}
            </button>`;

content = content.replace(actionAreaRegex, newActionArea);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("TopicNode undo added");
