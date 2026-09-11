const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const regex = /<button \n\s+onClick=\{\(e\) => \{\n\s+if \(isCompleted && onUndo\) \{\n\s+e\.preventDefault\(\);\n\s+e\.stopPropagation\(\);\n\s+onUndo\(\);\n\s+\}\n\s+\}\}\n\s+style=\{\{\n\s+padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,\n\s+background: isCompleted \? 'rgba\(16,185,129,0\.1\)' : '#1e293b',\n\s+color: isCompleted \? '#10b981' : '#6b7280',\n\s+border: \`1px solid \$\{isCompleted \? 'rgba\(16,185,129,0\.2\)' : '#374151'\}\`,\n\s+cursor: isCompleted \? 'pointer' : 'default'\n\s+\}\}\n\s+>/;

const replacement = `<button 
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
                cursor: isCompleted ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if(isCompleted) e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseOut={(e) => { if(isCompleted) e.currentTarget.style.transform = 'scale(1)'; }}
              title={isCompleted ? "Geri Al (Yanlışlıkla tıkladıysan tıkla)" : ""}
            >`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Added hover effect");
