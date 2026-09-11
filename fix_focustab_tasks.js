const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/FocusTab.tsx', 'utf8');

// Add new state variables for tasks
content = content.replace(
  /const \[tasks, setTasks\] = useState<any\[\]>\(\[\]\);/,
  `const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTask.trim()) return;
    setTasks(p => [...p, { id: Date.now().toString(), text: newTask, done: false }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));`
);

const oldColumn = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '24px' \}\}>\n\s*<div style=\{\{ background: '#131827'[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px', overflow: 'hidden' }}>
            <button onClick={() => setIsExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: activeSound ? '#8b5cf620' : '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Music size={16} style={{ color: activeSound ? '#a78bfa' : '#6b7280' }}/></div>
                <div style={{ textAlign: 'left' }}><div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>🎵 Ortam Sesleri</div><div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{activeSound ? AMBIENT_SOUNDS.find(s => s.id === activeSound)?.label + ' çalıyor' : 'Kapalı'}</div></div>
              </div>
              <ChevronRight size={18} style={{ color: '#6b7280', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.2s' }}/>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
                    {AMBIENT_SOUNDS.map(s => {
                      const isActive = activeSound === s.id;
                      return <button key={s.id} onClick={() => playSound(s.id, s.url)} style={{ background: isActive ? s.color + '15' : 'rgba(255,255,255,0.03)', border: \`1px solid \${isActive ? s.color + '40' : 'rgba(255,255,255,0.05)'}\`, borderRadius: '12px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><div style={{ color: isActive ? s.color : '#6b7280' }}>{s.icon}</div><span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#fff' : '#9ca3af' }}>{s.label}</span></button>;
                    })}
                  </div>
                  {activeSound && (
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                      <VolumeX size={16} color="#6b7280" cursor="pointer" onClick={() => setVolume(0)}/>
                      <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ flex: 1, accentColor: '#8b5cf6', height: '4px', cursor: 'pointer' }}/>
                      <Volume2 size={16} color="#6b7280"/>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} style={{ color: '#10b981' }}/> Günlük Görevler
            </h3>
            <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Yeni görev ekle..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '12px', color: '#fff', fontSize: '13px', outline: 'none' }}/>
              <button type="submit" style={{ background: '#8b5cf6', border: 'none', borderRadius: '12px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                <Plus size={18}/>
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', padding: '12px 0' }}>Görev eklenmedi.</div>
              ) : tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                  <button onClick={() => toggleTask(t.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: t.done ? '#10b981' : '#4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                  </button>
                  <span style={{ flex: 1, fontSize: '13px', color: t.done ? '#6b7280' : '#e2e8f0', textDecoration: t.done ? 'line-through' : 'none', wordBreak: 'break-word' }}>{t.text}</span>
                  <button onClick={() => removeTask(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: 0.7 }}><X size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#131827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: '#38bdf8' }}/> Haftalık Odak
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '8px' }}>
              {WEEKLY_DATA.map((d, i) => {
                const heightPct = maxWeekly > 0 ? (d.hours / maxWeekly) * 100 : (i === activeDay ? 20 : 5); // Fallback heights if 0
                const isActive = i === activeDay;
                return (
                  <div key={d.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                      <motion.div initial={{ height: 0 }} animate={{ height: \`\${heightPct}%\` }}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: isActive ? '#38bdf8' : '#374151', borderRadius: '6px' }}/>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isActive ? '#38bdf8' : '#6b7280' }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>`;

content = content.replace(oldColumn, replacement);
fs.writeFileSync('src/components/dashboard/FocusTab.tsx', content);
console.log("Restored missing components");
