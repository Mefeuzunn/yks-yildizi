const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const mainLogicRegex = /const handleUndoTopic = async \(subjectName: string, topicIndex: number\) => \{[\s\S]*?useEffect\(\(\) => \{[\s\S]*?loadProgress\(\);\n\s+\}, \[user\]\);/;

const newMainLogic = `const handleToggleTopic = async (subjectName: string, topicName: string) => {
    let isCompleting = false;

    // Optimistic UI update
    setSubjects(prev => prev.map(sub => {
      if (sub.name !== subjectName) return sub;
      
      const newTopics = sub.topics.map(t => {
        if (t.name === topicName) {
          isCompleting = t.status !== 'completed';
          return { ...t, status: isCompleting ? 'completed' : 'pending' } as const;
        }
        return t;
      });

      // Recalculate which one is 'in-progress'
      // The first 'pending' topic should be 'in-progress'
      let foundInProgress = false;
      const finalTopics = newTopics.map(t => {
        if (t.status === 'completed') return t;
        if (!foundInProgress) {
          foundInProgress = true;
          return { ...t, status: 'in-progress' } as const;
        }
        return { ...t, status: 'pending' } as const;
      });

      const completedCount = finalTopics.filter(t => t.status === 'completed').length;
      return { ...sub, progress: completedCount, topics: finalTopics };
    }));

    if (isCompleting) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fcd34d'] });
      });
    }

    try {
      await fetch('/api/user/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectName, 
          action: 'toggle', 
          topicName,
          totalTopics: subjects.find(s => s.name === subjectName)?.topics.length 
        })
      });
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    async function loadProgress() {
      const rawSubjects = getSubjectsByAlan(user?.alan || 'Sayisal');
      try {
        const res = await fetch('/api/user/subjects');
        if (res.ok) {
           const { subjects: dbProgress } = await res.json();
           const merged = rawSubjects.map(sub => {
              const dbItem = dbProgress.find((p: any) => sub.name.includes(p.name));
              const completedList = dbItem ? (dbItem.completedList || []) : [];
              
              let foundInProgress = false;
              const updatedTopics = sub.topics.map(t => {
                 if (completedList.includes(t.name)) {
                   return { ...t, status: 'completed' as const };
                 }
                 if (!foundInProgress) {
                   foundInProgress = true;
                   return { ...t, status: 'in-progress' as const };
                 }
                 return { ...t, status: 'pending' as const };
              });
              
              return { ...sub, progress: completedList.length, topics: updatedTopics };
           });
           setSubjects(merged);
        } else {
           setSubjects(rawSubjects);
        }
      } catch(e) {
        console.error(e);
        setSubjects(rawSubjects);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [user]);`;

content = content.replace(mainLogicRegex, newMainLogic);

const branchCallRegex = /<SubjectBranch\n\s+key=\{sub\.name\}\n\s+subject=\{sub\}\n\s+isOpen=\{openSubject === sub\.name\}\n\s+onToggle=\{\(\) => setOpenSubject\(openSubject === sub\.name \? null : sub\.name\)\}\n\s+onCompleteTopic=\{[\s\S]*?onUndoTopic=\{[\s\S]*?\/>/;

const newBranchCall = `<SubjectBranch
            key={sub.name}
            subject={sub}
            isOpen={openSubject === sub.name}
            onToggle={() => setOpenSubject(openSubject === sub.name ? null : sub.name)}
            onToggleTopic={(topicName) => handleToggleTopic(sub.name, topicName)}
          />`;

content = content.replace(branchCallRegex, newBranchCall);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Rewrote main logic for non-linear");
