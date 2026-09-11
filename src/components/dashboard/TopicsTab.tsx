import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Lock, Star, Sparkles, BookOpen, Trophy, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSubjectsByAlan, type Subject, type Topic } from '@/lib/subjectData';
import Link from 'next/link';

// ─── Skill Tree Node Component ──────────────────────────────────────────────
function TopicNode({ topic, index, subjectColor, subjectSlug, onToggle }: {
  topic: Topic; index: number; subjectColor: string; subjectSlug: string; onToggle?: () => void;
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
          borderRadius: '16px', background: bgColor, border: `1px solid ${borderColor}`,
          transition: 'all 0.2s',
          opacity: 1, // Full opacity since anything can be clicked
          boxShadow: isActive ? `0 0 20px ${subjectColor}15` : 'none',
          position: 'relative'
      }}>
        
        {/* Make the left side clickable for navigation */}
        <Link href={`/konular/${subjectSlug}/${topicSlug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
          {/* Node icon */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: isCompleted ? 'rgba(16,185,129,0.15)' : isActive ? subjectColor + '20' : '#1e293b',
            border: `2px solid ${nodeColor}`,
            boxShadow: isCompleted ? '0 0 12px rgba(16,185,129,0.3)' : isActive ? `0 0 12px ${subjectColor}30` : 'none',
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
              {isCompleted ? '✅ Tamamlandı' : isActive ? '⚡ Çalışılıyor' : '📖 Bekliyor'}
            </div>
          </div>
        </Link>

        {/* Action Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {!isCompleted ? (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if(onToggle) onToggle();
              }}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: `linear-gradient(to right, ${subjectColor}, ${subjectColor}dd)`,
                color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: `0 4px 10px ${subjectColor}40`,
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CheckCircle size={14} /> Tamamla
            </button>
          ) : (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if(onToggle) onToggle();
              }}
              style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                background: 'rgba(16,185,129,0.1)',
                color: '#10b981',
                border: '1px solid rgba(16,185,129,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Geri Al (Yanlışlıkla tıkladıysan tıkla)"
            >
              <span>+50 XP ✓</span>
            </button>
          )}
          <ChevronRight size={16} style={{ color: '#374151' }}/>
        </div>

      </div>

      {/* Connection line to next topic */}
      <div style={{
        display: 'flex', justifyContent: 'center', height: '16px',
      }}>
        <div style={{
          width: '2px', height: '100%',
          background: isCompleted ? `linear-gradient(to bottom, #10b981, ${subjectColor}40)` : 'rgba(255,255,255,0.06)',
        }}/>
      </div>
    </motion.div>
  );
}

// ─── Subject Card (Skill Branch) ────────────────────────────────────────────
function SubjectBranch({ subject, isOpen, onToggle, onToggleTopic }: {
  subject: Subject; isOpen: boolean; onToggle: () => void; onToggleTopic?: (topicName: string) => void;
}) {
  const completed = subject.topics.filter(t => t.status === 'completed').length;
  const inProgress = subject.topics.filter(t => t.status === 'in-progress').length;
  const total = subject.topics.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const slugify = (text: string) => {
    const trMap: Record<string, string> = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
    return text.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  };
  const subjectSlug = slugify(subject.name.split(' (')[0]);

  return (
    <div style={{
      background: '#0f172a', border: `1px solid ${isOpen ? subject.color + '30' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '20px', overflow: 'hidden', transition: 'border-color 0.3s',
    }}>
      {/* Branch header */}
      <button onClick={onToggle}
        style={{
          width: '100%', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px',
          cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left',
          position: 'relative', overflow: 'hidden',
        }}>
        {/* Subtle glow */}
        {isOpen && <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: subject.color, filter: 'blur(60px)', opacity: 0.1, pointerEvents: 'none' }}/>}

        {/* Subject icon */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px',
          background: subject.color + '18', border: `1px solid ${subject.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', flexShrink: 0,
        }}>
          {subject.icon}
        </div>

        {/* Subject info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{subject.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Progress bar */}
            <div style={{ flex: 1, height: '6px', background: '#1e293b', borderRadius: '999px', overflow: 'hidden', maxWidth: '200px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(to right, ${subject.color}88, ${subject.color})`, borderRadius: '999px' }}
              />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: subject.color, minWidth: '35px' }}>%{pct}</span>
          </div>
        </div>

        {/* Stats badges */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {completed > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(16,185,129,0.2)' }}>
              ✅ {completed}
            </span>
          )}
          {inProgress > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(245,158,11,0.2)' }}>
              ⚡ {inProgress}
            </span>
          )}
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', background: '#1e293b', padding: '4px 10px', borderRadius: '999px' }}>
            {total} Konu
          </span>
        </div>

        {/* Chevron */}
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
          style={{ color: '#6b7280', flexShrink: 0 }}>
          <ChevronDown size={20}/>
        </motion.div>
      </button>

      {/* Skill tree nodes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              {/* Tree header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 0 12px', marginBottom: '4px' }}>
                <Sparkles size={14} style={{ color: subject.color }}/>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Yetenek Ağacı</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }}/>
              </div>

              {/* Nodes */}
              {subject.topics.map((topic, i) => (
                <TopicNode
                  key={i}
                  topic={topic}
                  index={i}
                  subjectColor={subject.color}
                  subjectSlug={subjectSlug}
                  onToggle={() => onToggleTopic && onToggleTopic(topic.name)}
                />
              ))}

              {/* Branch completion reward */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '14px', borderRadius: '14px', marginTop: '4px',
                  background: pct >= 100 ? 'rgba(252,211,77,0.08)' : 'rgba(255,255,255,0.02)',
                  border: pct >= 100 ? '1px solid rgba(252,211,77,0.3)' : '1px dashed rgba(255,255,255,0.06)',
                }}>
                <Trophy size={18} style={{ color: pct >= 100 ? '#fcd34d' : '#374151' }}/>
                <span style={{ fontSize: '13px', fontWeight: 700, color: pct >= 100 ? '#fcd34d' : '#4b5563' }}>
                  {pct >= 100 ? '🏆 Branş Tamamlandı! +500 XP' : `🔒 Tüm Konuları Bitir → +500 XP Ödül`}
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function TopicsTab() {
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  
  const handleToggleTopic = async (subjectName: string, topicName: string) => {
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
  }, [user]);

  // Overall stats
  const totalTopics = subjects.reduce((s, sub) => s + sub.topics.length, 0);
  const completedTopics = subjects.reduce((s, sub) => s + sub.topics.filter(t => t.status === 'completed').length, 0);
  const inProgressTopics = subjects.reduce((s, sub) => s + sub.topics.filter(t => t.status === 'in-progress').length, 0);
  const overallPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><div className="animate-spin text-purple-500">Yükleniyor...</div></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 3vw, 32px)' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🗺️ Konu Yetenek Ağacı
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>YKS müfredatındaki tüm konuları bir oyun haritası gibi keşfet. Konuları sırayla bitir, XP kazan!</p>
      </div>

      {/* Overall progress card */}
      <div style={{
        background: '#0f172a', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '20px',
        padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: '#a855f7', filter: 'blur(80px)', opacity: 0.08, pointerEvents: 'none' }}/>

        {/* Ring */}
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8"/>
            <motion.circle cx="50" cy="50" r="42" fill="none" stroke="#a855f7" strokeWidth="8"
              strokeDasharray={2 * Math.PI * 42}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - overallPct / 100) }}
              strokeLinecap="round"
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 6px #a855f7)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>%{overallPct}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flex: 1, gap: '16px', flexWrap: 'wrap', minWidth: '200px' }}>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{completedTopics}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Tamamlanan</div>
          </div>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{inProgressTopics}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Çalışılan</div>
          </div>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#6b7280' }}>{totalTopics - completedTopics - inProgressTopics}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Kalan</div>
          </div>
          <div style={{ flex: 1, minWidth: '80px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#a855f7' }}>{subjects.length}</div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Branş</div>
          </div>
        </div>
      </div>

      {/* Subject branches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {subjects.map((sub) => (
          <SubjectBranch
            key={sub.name}
            subject={sub}
            isOpen={openSubject === sub.name}
            onToggle={() => setOpenSubject(openSubject === sub.name ? null : sub.name)}
            onToggleTopic={(topicName) => handleToggleTopic(sub.name, topicName)}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </motion.div>
  );
}
