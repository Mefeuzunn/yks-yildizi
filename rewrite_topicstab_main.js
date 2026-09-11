const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

// We need to inject handleCompleteTopic into TopicsTab
const mainRegex = /export default function TopicsTab\(\) \{[\s\S]*?useEffect\(\(\) => \{/;

const handleCompleteInjection = `export default function TopicsTab() {
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const handleCompleteTopic = async (subjectName: string, topicIndex: number) => {
    // Optimistic UI update
    setSubjects(prev => prev.map(sub => {
      if (sub.name !== subjectName) return sub;
      const newTopics = sub.topics.map((t, i) => {
        if (i < topicIndex + 1) return { ...t, status: 'completed' as const };
        if (i === topicIndex + 1) return { ...t, status: 'in-progress' as const };
        return { ...t, status: 'pending' as const };
      });
      return { ...sub, progress: topicIndex + 1, topics: newTopics };
    }));
    
    // Confetti!
    import('canvas-confetti').then((confetti) => {
      confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fcd34d'] });
    });

    try {
      await fetch('/api/user/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, action: 'increment', totalTopics: subjects.find(s => s.name === subjectName)?.topics.length })
      });
    } catch(e) { console.error(e); }
  };

  useEffect(() => {`;

content = content.replace(mainRegex, handleCompleteInjection);

// Update mapping of SubjectBranch to pass onCompleteTopic
content = content.replace(
  /<SubjectBranch\n\s+key=\{sub\.name\}\n\s+subject=\{sub\}\n\s+isOpen=\{openSubject === sub\.name\}\n\s+onToggle=\{\(\) => setOpenSubject\(openSubject === sub\.name \? null : sub\.name\)\}\n\s+\/>/g,
  `<SubjectBranch
            key={sub.name}
            subject={sub}
            isOpen={openSubject === sub.name}
            onToggle={() => setOpenSubject(openSubject === sub.name ? null : sub.name)}
            onCompleteTopic={(topicIndex) => handleCompleteTopic(sub.name, topicIndex)}
          />`
);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Updated TopicsTab main logic");
