"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, GripVertical, Bot } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

type Task = {
  id: string;
  subject: string;
  title: string;
  completed: boolean;
  color: string;
  createdAt: number;
};

export default function ProgramPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ date: format(new Date(), 'yyyy-MM-dd'), subject: 'Matematik', title: '', color: '#38bdf8' });

  // Drag and Drop state
  const [draggedTask, setDraggedTask] = useState<{ dateStr: string, taskId: string } | null>(null);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  useEffect(() => {
    fetch('/api/user/tasks')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setTasks(data);
        setIsLoaded(true);
      })
      .catch(() => setIsLoaded(true));
  }, []);

  // --- Actions ---

  const toggleTask = async (dateStr: string, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Optimistic UI
    setTasks(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));

    await fetch('/api/user/tasks', { method: 'POST', body: JSON.stringify({ action: 'toggle', id: taskId }) });
  };

  const deleteTask = async (dateStr: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic UI
    setTasks(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter(t => t.id !== taskId)
    }));

    await fetch('/api/user/tasks', { method: 'POST', body: JSON.stringify({ action: 'delete', id: taskId }) });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const res = await fetch('/api/user/tasks', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', task: newTask })
    });
    const data = await res.json();

    if (data.success) {
      const newTaskObj: Task = {
        id: data.id,
        subject: newTask.subject,
        title: newTask.title,
        completed: false,
        color: newTask.color,
        createdAt: Date.now()
      };

      setTasks(prev => ({
        ...prev,
        [newTask.date]: [...(prev[newTask.date] || []), newTaskObj]
      }));
    }

    setIsModalOpen(false);
    setNewTask({ ...newTask, title: '' }); 
  };

  const generateAIPlan = async () => {
    setIsAIGenerating(true);
    try {
      const res = await fetch('/api/coach/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr: format(currentDate, 'yyyy-MM-dd') })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Hata oluştu');
      } else {
        // Refetch tasks from DB to get the new AI generated plan
        const taskRes = await fetch('/api/user/tasks');
        const tasksData = await taskRes.json();
        if (!tasksData.error) setTasks(tasksData);
      }
    } catch (e) {
      console.error(e);
      alert('Plan oluşturulamadı.');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // --- Drag and Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, dateStr: string, taskId: string) => {
    setDraggedTask({ dateStr, taskId });
    e.dataTransfer.effectAllowed = 'move';
    // Hide the default ghost image to keep it clean, or let browser handle it.
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { dateStr: sourceDateStr, taskId } = draggedTask;
    
    // If dropped in the same column, ignore
    if (sourceDateStr === targetDateStr) {
      setDraggedTask(null);
      return;
    }

    // Optimistic UI update
    setTasks(prev => {
      const sourceList = prev[sourceDateStr] || [];
      const targetList = prev[targetDateStr] || [];
      
      const taskIndex = sourceList.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prev;
      
      const taskToMove = sourceList[taskIndex];
      const newSourceList = [...sourceList];
      newSourceList.splice(taskIndex, 1);
      
      return {
        ...prev,
        [sourceDateStr]: newSourceList,
        [targetDateStr]: [...targetList, taskToMove]
      };
    });

    setDraggedTask(null);

    // Make API call to save drag & drop change
    await fetch('/api/user/tasks', {
      method: 'POST',
      body: JSON.stringify({ action: 'move', id: taskId, targetDate: targetDateStr })
    });
  };

  const navigatePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const navigateNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const navigateToday = () => setCurrentDate(new Date());

  if (!isLoaded) return null;

  // --- Render Helpers ---

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <div key={d} style={{ padding: '0.75rem', textAlign: 'center', background: 'rgba(0,0,0,0.4)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
            {d}
          </div>
        ))}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks[dateStr] || [];
          const isCurrMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={dateStr}
              onClick={() => {
                setCurrentDate(day);
                setViewMode('day');
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              style={{ 
                minHeight: '120px', 
                background: isTodayDate ? 'rgba(236, 72, 153, 0.05)' : (isCurrMonth ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)'), 
                padding: '0.5rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: draggedTask && draggedTask.dateStr !== dateStr ? '1px dashed transparent' : 'none'
              }}
              onDragEnter={(e) => e.currentTarget.style.border = '1px dashed rgba(255,255,255,0.3)'}
              onDragLeave={(e) => e.currentTarget.style.border = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ 
                  width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: isTodayDate ? '#ec4899' : 'transparent', 
                  color: isTodayDate ? '#fff' : (isCurrMonth ? '#fff' : 'var(--text-muted)'),
                  fontWeight: isTodayDate ? 700 : 500, fontSize: '0.875rem'
                }}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    {dayTasks.length} Görev
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayTasks.slice(0, 3).map(t => (
                  <div 
                    key={t.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, dateStr, t.id)}
                    style={{ fontSize: '0.7rem', padding: '2px 4px', background: `${t.color}20`, color: t.color, borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: t.completed ? 'line-through' : 'none', cursor: 'grab' }}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>+{dayTasks.length - 3} daha</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks[dateStr] || [];
          const isTodayDate = isToday(day);

          return (
            <motion.div 
              key={dateStr}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              style={{ 
                minWidth: '180px', 
                background: isTodayDate ? 'rgba(236, 72, 153, 0.05)' : 'rgba(255,255,255,0.02)', 
                borderRadius: '16px', 
                border: `1px solid ${isTodayDate ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                display: 'flex', flexDirection: 'column',
                height: 'calc(100vh - 280px)'
              }}
            >
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: isTodayDate ? '#ec4899' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {format(day, 'EEEE', { locale: tr })}
                  </div>
                  <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                    {format(day, 'd MMM', { locale: tr })}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  {dayTasks.length}
                </span>
              </div>

              <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <AnimatePresence>
                  {dayTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, dateStr, task.id)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: task.completed ? 0.5 : 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ 
                        background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.75rem', 
                        borderLeft: `3px solid ${task.color}`, position: 'relative',
                        textDecoration: task.completed ? 'line-through' : 'none', cursor: 'grab'
                      }}
                    >
                      <button onClick={(e) => toggleTask(dateStr, task.id, e)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? '#10b981' : 'var(--text-muted)' }}>
                        {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                      <button onClick={(e) => deleteTask(dateStr, task.id, e)} style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                        <X size={14} />
                      </button>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <GripVertical size={14} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                        <div style={{ fontSize: '0.65rem', color: task.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {task.subject}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#fff', paddingRight: '1.5rem', wordBreak: 'break-word' }}>
                        {task.title}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => { setNewTask({ ...newTask, date: dateStr }); setIsModalOpen(true); }}
                style={{ margin: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              >
                <Plus size={16} /> Görev Ekle
              </button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderHeader = () => {
    let titleStr = '';
    if (viewMode === 'month') titleStr = format(currentDate, 'MMMM yyyy', { locale: tr });
    else if (viewMode === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 1 });
      const e = endOfWeek(currentDate, { weekStartsOn: 1 });
      titleStr = `${format(s, 'd MMM')} - ${format(e, 'd MMM')}`;
    } else {
      titleStr = format(currentDate, 'd MMMM yyyy', { locale: tr });
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} color="#ec4899" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Takvim & Planlayıcı</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Zamanını etkin yönet, hedeflerine ulaş.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={generateAIPlan}
            disabled={isAIGenerating}
            className="btn-interactive" 
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {isAIGenerating ? <Bot size={18} className="animate-spin" /> : <Bot size={18} />} 
            {isAIGenerating ? 'Planlanıyor...' : 'AI ile Planla'}
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
            {['month', 'week', 'day'].map(m => (
              <button 
                key={m}
                onClick={() => setViewMode(m as any)}
                style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: viewMode === m ? 'rgba(236, 72, 153, 0.2)' : 'transparent', color: viewMode === m ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {m === 'month' ? 'Aylık' : m === 'week' ? 'Haftalık' : 'Günlük'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
            <button onClick={navigatePrev} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
            <span style={{ padding: '0 1rem', color: '#fff', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>{titleStr}</span>
            <button onClick={navigateNext} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight size={20} /></button>
          </div>

          <button onClick={navigateToday} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Bugün
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {renderHeader()}

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {/* Günlük görünüm implementasyonu basit tutuldu, haftalık baz alındı */}
      {viewMode === 'day' && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
          <p>Detaylı günlük görünüm haftalık görünümle birleştirilmiştir.</p>
          <button onClick={() => setViewMode('week')} className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Haftalık Görünüme Dön</button>
        </div>
      )}

      {/* Görev Ekleme Modalı */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Yeni Görev Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tarih</label>
                  <input type="date" required value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Ders / Kategori</label>
                  <select value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    <option value="Matematik">Matematik</option>
                    <option value="Fizik">Fizik</option>
                    <option value="Kimya">Kimya</option>
                    <option value="Biyoloji">Biyoloji</option>
                    <option value="Genel">Genel Tekrar / Deneme</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Görev Başlığı</label>
                  <input type="text" required placeholder="Örn: Limit Fasikülü Bitirilecek" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Renk</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map(c => (
                      <div 
                        key={c} 
                        onClick={() => setNewTask({...newTask, color: c})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer', border: newTask.color === c ? '3px solid #fff' : '3px solid transparent', boxShadow: newTask.color === c ? `0 0 10px ${c}` : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-interactive" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', marginTop: '1rem' }}>
                  Görevi Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
