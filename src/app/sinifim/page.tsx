"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Megaphone, FolderOpen, ClipboardList, Clock, 
  CheckCircle, ArrowRight, Loader2, BookOpen, ExternalLink, Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Tab = 'duyurular' | 'odevler' | 'kaynaklar' | 'arkadaslar';

export default function StudentClassPortal() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('duyurular');
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<any>(null);
  
  // Ödevler verisi
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  
  // Sınıf kodu katılma state'i
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  const fetchClassData = async () => {
    try {
      const res = await fetch('/api/student/class');
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/odevler');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ogrenci') {
      fetchClassData();
      fetchAssignments();
    }
  }, [user]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setJoinSubmitting(true);
    setJoinError('');

    try {
      const res = await fetch('/api/auth/register', { // Kayıt aşamasında yaptığımız gibi veya ayrı bir join api
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join_class',
          classCode: classCodeInput.trim()
        })
      });
      // Not: api/auth/register'ı güncellemiştik ama doğrudan sınıf katılımı için bir api oluşturabiliriz.
      // Sınıfa katılma işlemini gerçekleştirelim
      const joinRes = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode: classCodeInput.trim() })
      });
      const data = await joinRes.json();

      if (joinRes.ok && data.success) {
        setClassCodeInput('');
        setLoading(true);
        fetchClassData();
      } else {
        setJoinError(data.error || 'Sınıfa katılırken bir hata oluştu.');
      }
    } catch (err) {
      setJoinError('Bağlantı hatası oluştu.');
    } finally {
      setJoinSubmitting(false);
    }
  };

  const submitAssignment = async (id: string) => {
    try {
      const res = await fetch('/api/odevler/teslim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: id, score: 100 })
      });
      if (res.ok) {
        fetchAssignments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'ogrenci') {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#fff' }}>Sadece öğrenciler bu sayfaya erişebilir.</div>;
  }

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="spin" size={48} color="#8b5cf6" />
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  // --- SINIF KATILIM EKRANI (Sınıfı Yoksa) ---
  if (!classData || !classData.joined) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div 
          className="premium-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '3rem 2rem', textAlign: 'center' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Users size={32} color="#8b5cf6" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>Sınıfa Katıl</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>Öğretmeninizden aldığınız 6 haneli sınıf kodunu girerek sınıf portalına erişin.</p>
          
          <form onSubmit={handleJoinClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Örn: A1B2C3" 
              value={classCodeInput}
              onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
              className="premium-input"
              style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700 }}
              required
            />
            {joinError && <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{joinError}</div>}
            
            <button type="submit" disabled={joinSubmitting} className="btn-interactive" style={{ width: '100%', background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)' }}>
              {joinSubmitting ? <Loader2 className="spin" size={18} /> : 'Sınıfa Bağlan'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const { classDetails, classmates, announcements, resources } = classData;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'duyurular', label: 'Duyurular', icon: Megaphone, count: announcements.length },
    { key: 'odevler', label: 'Ödevlerim', icon: ClipboardList, count: assignments.filter(a => a.status !== 'submitted').length },
    { key: 'kaynaklar', label: 'Ders Kaynakları', icon: FolderOpen, count: resources.length },
    { key: 'arkadaslar', label: 'Arkadaşlarım', icon: Users, count: classmates.length },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Sınıf Header */}
      <div className="premium-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <Users size={32} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>
            SINIF PORTALI
          </span>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', margin: '0.25rem 0 0' }}>{classDetails.class_name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            👨‍🏫 {classDetails.teacher_name} ({classDetails.teacher_brans} • {classDetails.teacher_kurum})
          </p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sınıf Kodu</div>
          <code style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '1px' }}>{classDetails.class_code}</code>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600,
            background: activeTab === t.key ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
            color: activeTab === t.key ? '#c084fc' : 'var(--text-secondary)',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>
            <t.icon size={18} /> 
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span style={{ fontSize: '0.75rem', background: activeTab === t.key ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '2px 6px', borderRadius: '999px', marginLeft: '0.25rem' }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* ============ DUYURULAR ============ */}
        {activeTab === 'duyurular' && (
          <motion.div key="duyurular" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {announcements.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Megaphone size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 1rem' }} />
                Henüz sınıf duyurusu yapılmamış.
              </div>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} className="premium-card" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>{a.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap' }}>{a.content}</p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ============ ÖDEVLERİM ============ */}
        {activeTab === 'odevler' && (
          <motion.div key="odevler" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {assignmentsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader2 className="spin" size={32} color="#8b5cf6" /></div>
            ) : assignments.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                Harika! Herhangi bir ödevin bulunmuyor.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {assignments.map((assignment) => {
                  const isLate = new Date(assignment.due_date) < new Date() && assignment.status !== 'submitted';
                  const isCompleted = assignment.status === 'submitted' || assignment.status === 'graded';
                  
                  return (
                    <div key={assignment.id} className="premium-card" style={{ padding: '1.5rem', borderLeft: isCompleted ? '4px solid #10b981' : isLate ? '4px solid #ef4444' : '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.25rem', textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }}>{assignment.title}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{assignment.description}</p>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isLate ? '#ef4444' : 'inherit' }}>
                            <Clock size={14} /> Son Teslim: {new Date(assignment.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {assignment.status === 'graded' && (
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Not: {assignment.score} / 100</span>
                          )}
                        </div>
                      </div>
                      <div>
                        {isCompleted ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <CheckCircle size={18} /> {assignment.status === 'graded' ? 'Notlandırıldı' : 'Teslim Edildi'}
                          </div>
                        ) : (
                          <button 
                            onClick={() => submitAssignment(assignment.id)}
                            className="btn-interactive"
                            style={{ 
                              padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', 
                              border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                          >
                            <CheckCircle size={18} /> Ödevi Teslim Et
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ============ DERS KAYNAKLARI ============ */}
        {activeTab === 'kaynaklar' && (
          <motion.div key="kaynaklar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {resources.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
                <FolderOpen size={48} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 1rem' }} />
                Paylaşılan ders kaynağı bulunmuyor.
              </div>
            ) : (
              resources.map((r: any) => (
                <div key={r.id} className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: r.resource_type === 'note' ? 'rgba(56,189,248,0.1)' : r.resource_type === 'link' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                      color: r.resource_type === 'note' ? '#38bdf8' : r.resource_type === 'link' ? '#10b981' : '#f59e0b', 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
                    }}>
                      {r.resource_type === 'note' ? 'Not' : r.resource_type === 'link' ? 'Bağlantı' : 'Görev'}
                    </span>
                    {r.subject && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.subject}</span>}
                    {r.topic && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>• {r.topic}</span>}
                  </div>
                  
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>{r.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem', flex: 1 }}>{r.content}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>{new Date(r.created_at).toLocaleDateString('tr-TR')}</span>
                    {r.resource_type === 'link' && r.content.startsWith('http') && (
                      <a href={r.content} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
                        Bağlantıyı Aç <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ============ ARKADAŞLARIM ============ */}
        {activeTab === 'arkadaslar' && (
          <motion.div key="arkadaslar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Sınıf İçi Sıralama</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {classmates.map((student: any, i: number) => {
                const isCurrentUser = student.id === user.id;
                
                return (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: isCurrentUser ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: isCurrentUser ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>
                        {i + 1}
                      </div>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        {student.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{student.username} {isCurrentUser && '(Sen)'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.alan} • {student.league || 'Bronz'} Lig</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#c084fc' }}>{(student.league_points || 0).toLocaleString()} Puan</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
