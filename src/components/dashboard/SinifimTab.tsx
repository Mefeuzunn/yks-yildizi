"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Megaphone, FolderOpen, ClipboardList, Clock, 
  CheckCircle, ArrowRight, Loader2, BookOpen, ExternalLink,
  Sparkles, KeyRound, LogOut, AlertCircle, Trophy, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Tab = 'duyurular' | 'odevler' | 'kaynaklar' | 'arkadaslar';

export default function SinifimTab() {
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
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [leavingClass, setLeavingClass] = useState(false);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/class');
      if (res.ok) {
        const data = await res.json();
        setClassData(data);
      }
    } catch (e) {
      console.error('Fetch class error:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const res = await fetch('/api/odevler');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (e) {
      console.error('Fetch assignments error:', e);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ogrenci') {
      fetchClassData();
      fetchAssignments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = classCodeInput.trim().toUpperCase();
    if (!clean) return;

    setJoinSubmitting(true);
    setJoinError('');
    setJoinSuccess('');

    try {
      const res = await fetch('/api/student/join-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode: clean })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setJoinSuccess(data.message || 'Sınıfa başarıyla katıldınız!');
        setClassCodeInput('');
        setTimeout(() => {
          fetchClassData();
          fetchAssignments();
        }, 1000);
      } else {
        setJoinError(data.error || 'Sınıf kodu doğrulanamadı.');
      }
    } catch (err: any) {
      setJoinError('Bağlantı hatası oluştu.');
    } finally {
      setJoinSubmitting(false);
    }
  };

  const handleLeaveClass = async () => {
    if (!confirm('Bu sınıftan ayrılmak istediğinize emin misiniz?')) return;
    setLeavingClass(true);
    try {
      const res = await fetch('/api/student/leave-class', { method: 'POST' });
      if (res.ok) {
        setClassData({ joined: false });
        fetchAssignments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLeavingClass(false);
    }
  };

  const submitAssignment = async (id: string) => {
    try {
      const res = await fetch('/api/odevler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: id })
      });
      if (res.ok) {
        fetchAssignments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="#8b5cf6" />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sınıf bilgileri yükleniyor...</p>
      </div>
    );
  }

  // ─── SINIF KATILIM EKRANI (Henüz bir sınıfa bağlı değilse) ───
  if (!classData || !classData.joined) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ maxWidth: '640px', margin: '2rem auto', padding: '0 1rem' }}
      >
        <div style={{
          background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 17, 23, 0.95) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Neon background blur */}
          <div style={{
            position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '120px', background: '#8b5cf6', filter: 'blur(80px)',
            opacity: 0.25, pointerEvents: 'none'
          }} />

          {/* Icon */}
          <div style={{
            width: '76px', height: '76px', borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.2)'
          }}>
            <KeyRound size={36} color="#a78bfa" />
          </div>

          <span style={{
            display: 'inline-block',
            padding: '4px 14px', borderRadius: '20px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 700,
            letterSpacing: '0.05em', marginBottom: '1rem'
          }}>
            SINIF PORTALI
          </span>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Öğretmenine Bağlan
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Öğretmeninizden aldığınız 6 haneli <strong style={{ color: '#f1f5f9' }}>sınıf kodunu</strong> veya <strong style={{ color: '#f1f5f9' }}>davet kodunu</strong> girerek sınıfınıza anında katılın.
          </p>

          <form onSubmit={handleJoinClass} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Örn: 9A2F4B" 
                maxLength={8}
                value={classCodeInput}
                onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.5rem',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: joinError ? '2px solid rgba(239, 68, 68, 0.6)' : '2px solid rgba(139, 92, 246, 0.3)',
                  color: '#fff',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '6px',
                  textAlign: 'center',
                  outline: 'none',
                  textTransform: 'uppercase',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                  transition: 'all 0.2s ease'
                }}
                autoFocus
                required
              />
            </div>

            {joinError && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{
                color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '0.75rem 1rem', borderRadius: '12px',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <AlertCircle size={16} /> {joinError}
              </motion.div>
            )}

            {joinSuccess && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{
                color: '#86efac', background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '0.75rem 1rem', borderRadius: '12px',
                fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                <Check size={18} /> {joinSuccess}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={joinSubmitting || !classCodeInput.trim()} 
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                border: 'none',
                cursor: joinSubmitting || !classCodeInput.trim() ? 'not-allowed' : 'pointer',
                opacity: joinSubmitting || !classCodeInput.trim() ? 0.6 : 1,
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {joinSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sınıfa Bağlanılıyor...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Sınıfa Katıl
                </>
              )}
            </button>
          </form>

          {/* Info footnote */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#64748b',
            fontSize: '0.8rem'
          }}>
            <span>💡</span>
            <span>Öğretmeninizin panelindeki 6 haneli sınıf veya davet kodunu yazmanız yeterlidir.</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── SINIF PORTALI (Öğrenci sınıfa katıldıktan sonra) ───
  const { classDetails, classmates = [], announcements = [], resources = [] } = classData;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'duyurular', label: 'Duyurular', icon: Megaphone, count: announcements.length },
    { key: 'odevler', label: 'Ödevlerim', icon: ClipboardList, count: assignments.filter(a => a.status !== 'submitted').length },
    { key: 'kaynaklar', label: 'Ders Kaynakları', icon: FolderOpen, count: resources.length },
    { key: 'arkadaslar', label: 'Sınıf Sıralaması', icon: Users, count: classmates.length },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}
    >
      {/* Sınıf Header Kartı */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(17, 24, 39, 0.8) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '18px',
          background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.35)', flexShrink: 0
        }}>
          <Users size={34} />
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.7rem', background: 'rgba(139, 92, 246, 0.2)',
              color: '#c4b5fd', padding: '3px 10px', borderRadius: '20px',
              fontWeight: 700, letterSpacing: '0.05em'
            }}>
              SINIF PORTALI
            </span>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>● Aktif Bağlantı</span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {classDetails?.class_name || 'Sınıfım'}
          </h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '0.9rem' }}>
            👨‍🏫 <strong style={{ color: '#e2e8f0' }}>{classDetails?.teacher_name}</strong>
            {classDetails?.teacher_brans && ` · ${classDetails.teacher_brans}`}
            {classDetails?.teacher_kurum && ` · ${classDetails.teacher_kurum}`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(0,0,0,0.35)', padding: '0.75rem 1.25rem',
            borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Sınıf Kodu</div>
            <code style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '2px' }}>
              {classDetails?.class_code}
            </code>
          </div>

          <button
            onClick={handleLeaveClass}
            disabled={leavingClass}
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Sınıftan Ayrıl"
          >
            <LogOut size={15} />
            {leavingClass ? 'Ayrılınıyor...' : 'Sınıftan Ayrıl'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.25rem' }}>
        {tabs.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                fontSize: '0.9rem', fontWeight: isActive ? 700 : 500,
                background: isActive ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#c4b5fd' : '#94a3b8',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <t.icon size={17} />
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span style={{
                  fontSize: '0.75rem',
                  background: isActive ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  marginLeft: '0.2rem'
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <AnimatePresence mode="wait">
        
        {/* ─── DUYURULAR ─── */}
        {activeTab === 'duyurular' && (
          <motion.div
            key="duyurular"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {announcements.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b'
              }}>
                <Megaphone size={44} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Henüz Duyuru Yok</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Öğretmeniniz bir duyuru paylaştığında burada görebileceksiniz.</p>
              </div>
            ) : (
              announcements.map((a: any) => (
                <div key={a.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderLeft: '4px solid #8b5cf6',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700 }}>{a.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.65, fontSize: '0.95rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {a.content}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ─── ÖDEVLERİM ─── */}
        {activeTab === 'odevler' && (
          <motion.div
            key="odevler"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {assignmentsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={32} color="#8b5cf6" />
              </div>
            ) : assignments.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b'
              }}>
                <CheckCircle size={44} color="#10b981" style={{ margin: '0 auto 1rem', opacity: 0.7 }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Harika! Bekleyen Ödevin Yok</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Sınıfınıza atanan yeni bir ödev bulunmuyor.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {assignments.map((assignment) => {
                  const isLate = assignment.due_date && new Date(assignment.due_date) < new Date() && assignment.status !== 'submitted';
                  const isCompleted = assignment.status === 'submitted' || assignment.status === 'graded';
                  
                  return (
                    <div 
                      key={assignment.id} 
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderLeft: isCompleted ? '4px solid #10b981' : isLate ? '4px solid #ef4444' : '4px solid #f59e0b',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{
                            fontSize: '1.1rem', color: '#fff', margin: 0, fontWeight: 700,
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            opacity: isCompleted ? 0.7 : 1
                          }}>
                            {assignment.title}
                          </h3>
                          {assignment.subject && (
                            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                              {assignment.subject}
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '4px 0 10px' }}>
                            {assignment.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                          {assignment.due_date && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isLate ? '#f87171' : 'inherit' }}>
                              <Clock size={14} /> Son Teslim: {new Date(assignment.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {assignment.teacher_name && <span>👨‍🏫 {assignment.teacher_name}</span>}
                          {assignment.status === 'graded' && (
                            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Not: {assignment.score} / 100</span>
                          )}
                        </div>
                      </div>

                      <div>
                        {isCompleted ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: '#34d399', fontWeight: 600, padding: '0.5rem 1rem',
                            background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px',
                            border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.85rem'
                          }}>
                            <CheckCircle size={16} /> {assignment.status === 'graded' ? 'Notlandırıldı' : 'Teslim Edildi'}
                          </div>
                        ) : (
                          <button 
                            onClick={() => submitAssignment(assignment.id)}
                            style={{ 
                              padding: '0.75rem 1.25rem',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff', border: 'none', borderRadius: '10px',
                              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px',
                              boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                            }}
                          >
                            <CheckCircle size={16} /> Ödevi Teslim Et
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

        {/* ─── DERS KAYNAKLARI ─── */}
        {activeTab === 'kaynaklar' && (
          <motion.div
            key="kaynaklar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}
          >
            {resources.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1'
              }}>
                <FolderOpen size={44} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Paylaşılan Kaynak Yok</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Öğretmeniniz bu sınıf için henüz ders notu veya kaynak paylaşmadı.</p>
              </div>
            ) : (
              resources.map((r: any) => (
                <div key={r.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      background: r.resource_type === 'note' ? 'rgba(56,189,248,0.15)' : r.resource_type === 'link' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', 
                      color: r.resource_type === 'note' ? '#38bdf8' : r.resource_type === 'link' ? '#34d399' : '#fcd34d', 
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 
                    }}>
                      {r.resource_type === 'note' ? 'Ders Notu' : r.resource_type === 'link' ? 'Bağlantı' : 'Doküman'}
                    </span>
                    {r.subject && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{r.subject}</span>}
                    {r.topic && <span style={{ color: '#64748b', fontSize: '0.75rem' }}>• {r.topic}</span>}
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, margin: '0 0 0.5rem' }}>{r.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.5rem', flex: 1, whiteSpace: 'pre-wrap' }}>
                    {r.content}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    <span>{new Date(r.created_at).toLocaleDateString('tr-TR')}</span>
                    {r.resource_type === 'link' && r.content && r.content.startsWith('http') && (
                      <a href={r.content} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
                        Aç <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* ─── ARKADAŞLARIM / SINIF SIRALAMASI ─── */}
        {activeTab === 'arkadaslar' && (
          <motion.div
            key="arkadaslar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <Trophy size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>Sınıf İçi Sıralama</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {classmates.map((student: any, i: number) => {
                const isCurrentUser = student.id === user?.id;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
                
                return (
                  <div 
                    key={student.id} 
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.85rem 1.25rem',
                      background: isCurrentUser ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      border: isCurrentUser ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '32px', textAlign: 'center', fontWeight: 800, fontSize: i < 3 ? '1.2rem' : '0.85rem', color: '#94a3b8'
                      }}>
                        {medal}
                      </div>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: isCurrentUser ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.85rem'
                      }}>
                        {student.username?.substring(0, 2).toUpperCase() || 'Ö'}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                          {student.username} {isCurrentUser && <span style={{ color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 600 }}>(Sen)</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {student.sinif || '12'}. Sınıf {student.alan && `· ${student.alan}`} · {student.league || 'Bronz'} Lig
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#c084fc', fontSize: '1rem' }}>
                        {(student.league_points || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Puan</span>
                      </div>
                      {student.xp && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {student.xp.toLocaleString()} XP
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
