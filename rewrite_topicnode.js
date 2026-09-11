const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

// 1. Update TopicNode Props
content = content.replace(
  /function TopicNode\(\{ topic, index, subjectColor, subjectSlug \}: \{/,
  "function TopicNode({ topic, index, subjectColor, subjectSlug, onComplete }: {"
);
content = content.replace(
  /topic: Topic; index: number; subjectColor: string; subjectSlug: string;/,
  "topic: Topic; index: number; subjectColor: string; subjectSlug: string; onComplete?: () => void;"
);

// 2. Add onClick to Node icon
content = content.replace(
  /\/\* Node icon \*\/\n\s+<div style=\{\{/,
  `/* Node icon */
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

// 3. Update SubjectBranch Props
content = content.replace(
  /function SubjectBranch\(\{ subject, isOpen, onToggle \}: \{/,
  "function SubjectBranch({ subject, isOpen, onToggle, onCompleteTopic }: {"
);
content = content.replace(
  /subject: Subject; isOpen: boolean; onToggle: \(\) => void;/,
  "subject: Subject; isOpen: boolean; onToggle: () => void; onCompleteTopic?: (index: number) => void;"
);

// 4. Pass onComplete to TopicNode inside SubjectBranch
content = content.replace(
  /<TopicNode\n\s+key=\{i\}\n\s+topic=\{topic\}\n\s+index=\{i\}\n\s+subjectColor=\{subject\.color\}\n\s+subjectSlug=\{subjectSlug\}\n\s+\/>/g,
  `<TopicNode
                  key={i}
                  topic={topic}
                  index={i}
                  subjectColor={subject.color}
                  subjectSlug={subjectSlug}
                  onComplete={() => onCompleteTopic && onCompleteTopic(i)}
                />`
);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Updated TopicNode and SubjectBranch");
