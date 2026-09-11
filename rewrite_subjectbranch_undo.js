const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const regex1 = /function SubjectBranch\(\{ subject, isOpen, onToggle, onCompleteTopic \}: \{\n\s+subject: Subject; isOpen: boolean; onToggle: \(\) => void; onCompleteTopic\?: \(index: number\) => void;\n\}\)/;
content = content.replace(regex1, `function SubjectBranch({ subject, isOpen, onToggle, onCompleteTopic, onUndoTopic }: {
  subject: Subject; isOpen: boolean; onToggle: () => void; onCompleteTopic?: (index: number) => void; onUndoTopic?: (index: number) => void;
})`);

const regex2 = /onComplete=\{\(\) => onCompleteTopic && onCompleteTopic\(i\)\}\n\s+\/>/g;
content = content.replace(regex2, `onComplete={() => onCompleteTopic && onCompleteTopic(i)}
                  onUndo={() => onUndoTopic && onUndoTopic(i)}
                />`);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("SubjectBranch undo added");
