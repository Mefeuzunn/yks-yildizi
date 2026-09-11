const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/TopicsTab.tsx', 'utf8');

const regex = /function TopicNode\(\{[\s\S]*?\{\/\* Connection line to next topic \*\//;

const newTopicNode = `function TopicNode({ topic, index, subjectColor, subjectSlug, onComplete }: {
  topic: Topic; index: number; subjectColor: string; subjectSlug: string; onComplete?: () => void;
}) {
  const slugify = (text: string) => {
    const trMap: Record<string, string> = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
    return text.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };
  const topicSlug = slugify(topic.name);

  const isCompleted = topic.status === 'completed';
  const isActive = topic.status === 'in-progress';
  const isLocked = topic.status === 'pending';

  const nodeColor = isCompleted ? '#10b981' : isActive ? subjectColor : '#374151';
  const bgColor = isCompleted ? 'rgba(16,185,129,0.08)' : isActive ? subjectColor + '12' : 'rgba(255,255,255,0.02)';
  const borderColor = isCompleted ? '#10b98140' : isActive ? subjectColor + '50' : 'rgba(255,255,255,0.06)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
          borderRadius: '16px', background: bgColor, border: \`1px solid \${borderColor}\`,
          transition: 'all 0.2s',
          opacity: isLocked ? 0.6 : 1,
          boxShadow: isActive ? \`0 0 20px \${subjectColor}15\` : 'none',
          position: 'relative'
      }}>
        
        {/* Make the left side clickable for navigation */}
        <Link href={\`/konular/\${subjectSlug}/\${topicSlug}\`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Node icon */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isCompleted ? 'rgba(16,185,129,0.15)' : isActive ? subjectColor + '20' : '#1e293b',
            border: \`2px solid \${nodeColor}\`,
            boxShadow: isCompleted ? '0 0 12px rgba(16,185,129,0.3)' : isActive ? \`0 0 12px \${subjectColor}30\` : 'none',
          }}>
            {isCompleted ? <CheckCircle size={20} style={{ color: '#10b981' }}/> :
             isActive ? <Zap size={18} style={{ color: subjectColor }}/> :
             <Lock size={16} style={{ color: '#4b5563' }}/>}
          </div>

          {/* Topic info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '14px', fontWeight: isActive ? 700 : 600,
              color: isCompleted ? '#6b7280' : isActive ? '#fff' : '#94a3b8',
              textDecoration: isCompleted ? 'line-through' : 'none',
              textDecorationColor: '#4b5563',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {topic.name}
            </div>
            <div style={{ fontSize: '11px', color: isCompleted ? '#4b5563' : isActive ? subjectColor : '#374151', fontWeight: 600, marginTop: '2px' }}>
              {isCompleted ? '✅ Tamamlandı' : isActive ? '⚡ Çalışılıyor' : '🔒 Kilitli'}
            </div>
          </div>
        </Link>

        {/* Action / XP Area (Right side, completely separate from Link) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {isActive ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if(onComplete) onComplete();
              }}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: \`linear-gradient(to right, \${subjectColor}, \${subjectColor}dd)\`,
                color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: \`0 4px 10px \${subjectColor}40\`,
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <CheckCircle size={14} /> Tamamla
            </button>
          ) : (
            <div style={{
              padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
              background: isCompleted ? 'rgba(16,185,129,0.1)' : '#1e293b',
              color: isCompleted ? '#10b981' : '#6b7280',
              border: \`1px solid \${isCompleted ? 'rgba(16,185,129,0.2)' : '#374151'}\`,
            }}>
              {isCompleted ? <span>+50 XP ✓</span> : <span>+50 XP</span>}
            </div>
          )}
          <ChevronRight size={16} style={{ color: '#374151' }}/>
        </div>

      </div>

      {/* Connection line to next topic */`;

content = content.replace(regex, newTopicNode);

fs.writeFileSync('src/components/dashboard/TopicsTab.tsx', content);
console.log("Replaced TopicNode correctly");
