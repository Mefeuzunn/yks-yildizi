const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const regex = /export default function TopicsTab\(\) \{[\s\S]*?(?=return \()/;

const replacement = `export default function TopicsTab() {
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      const rawSubjects = getSubjectsByAlan(user?.alan || 'Sayisal');
      try {
        const res = await fetch('/api/user/subjects');
        if (res.ok) {
           const { subjects: dbProgress } = await res.json();
           const merged = rawSubjects.map(sub => {
              const dbItem = dbProgress.find((p: any) => sub.name.includes(p.name));
              const completedCount = dbItem ? dbItem.completed : 0;
              
              const updatedTopics = sub.topics.map((t, index) => {
                 if (index < completedCount) return { ...t, status: 'completed' };
                 if (index === completedCount) return { ...t, status: 'in-progress' };
                 return { ...t, status: 'pending' };
              });
              
              return { ...sub, progress: completedCount, topics: updatedTopics };
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
  }, [user]);

  // Overall stats
  const totalTopics = subjects.reduce((s, sub) => s + sub.topics.length, 0);
  const completedTopics = subjects.reduce((s, sub) => s + sub.topics.filter(t => t.status === 'completed').length, 0);
  const inProgressTopics = subjects.reduce((s, sub) => s + sub.topics.filter(t => t.status === 'in-progress').length, 0);
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><div className="animate-spin text-purple-500">Yükleniyor...</div></div>;
  }

  `;

content = content.replace(regex, replacement);

// Oh wait, need to import useEffect
if(!content.includes('useEffect')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';");
}

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Rewrote TopicsTab.tsx");
