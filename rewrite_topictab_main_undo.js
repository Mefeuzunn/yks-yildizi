const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const regex1 = /const handleCompleteTopic = async \(subjectName: string, topicIndex: number\) => \{/;
const replacement1 = `
  const handleUndoTopic = async (subjectName: string, topicIndex: number) => {
    // Only allow undoing the EXACT last completed topic, or any topic which forces setting the progress to topicIndex
    setSubjects(prev => prev.map(sub => {
      if (sub.name !== subjectName) return sub;
      const newTopics = sub.topics.map((t, i) => {
        if (i < topicIndex) return { ...t, status: 'completed' as const };
        if (i === topicIndex) return { ...t, status: 'in-progress' as const };
        return { ...t, status: 'pending' as const };
      });
      return { ...sub, progress: topicIndex, topics: newTopics };
    }));

    try {
      await fetch('/api/user/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectName, action: topicIndex, totalTopics: subjects.find(s => s.name === subjectName)?.topics.length })
      });
    } catch(e) { console.error(e); }
  };

  const handleCompleteTopic = async (subjectName: string, topicIndex: number) => {`;

content = content.replace(regex1, replacement1);

const regex2 = /onCompleteTopic=\{\(topicIndex\) => handleCompleteTopic\(sub\.name, topicIndex\)\}\n\s+\/>/g;
content = content.replace(regex2, `onCompleteTopic={(topicIndex) => handleCompleteTopic(sub.name, topicIndex)}
            onUndoTopic={(topicIndex) => handleUndoTopic(sub.name, topicIndex)}
          />`);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Main undo added");
