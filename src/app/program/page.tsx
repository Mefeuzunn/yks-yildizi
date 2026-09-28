"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, ChevronLeft, ChevronRight, CheckCircle2, Circle, GripVertical, Bot } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, startOfMonth, endOfMonth, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { haptics } from '@/lib/haptics';

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
    haptics.selection();
    
    // Optimistic UI
    setTasks(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));

    await fetch('/api/user/tasks', { method: 'POST', body: JSON.stringify({ action: 'toggle', id: taskId }) });
  };

  const deleteTask = async (dateStr: string, taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    haptics.impact('light');
    
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

    haptics.notification('success');
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
    haptics.selection();
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
        haptics.notification('success');
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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

    haptics.impact('light');

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
    haptics.selection();
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const navigateNext = () => {
    haptics.selection();
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const navigateToday = () => {
    haptics.selection();
    setCurrentDate(new Date());
  };

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
                haptics.selection();
                setCurrentDate(day);
                setViewMode('week');
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              style={{ 
                minHeight: '100px', 
                background: isTodayDate ? 'rgba(236, 72, 153, 0.05)' : (isCurrMonth ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.6)'), 
                padding: '0.4rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
                border: draggedTask && draggedTask.dateStr !== dateStr ? '1px dashed transparent' : 'none'
              }}
              onDragEnter={(e) => e.currentTarget.style.border = '1px dashed rgba(255,255,255,0.3)'}
              onDragLeave={(e) => e.currentTarget.style.border = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ 
                  width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', background: isTodayDate ? '#ec4899' : 'transparent', 
                  color: isTodayDate ? '#fff' : (isCurrMonth ? '#fff' : 'var(--text-muted)'),
                  fontWeight: isTodayDate ? 700 : 500, fontSize: '0.8rem'
                }}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    {dayTasks.length}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {dayTasks.slice(0, 2).map(t => (
                  <div 
                    key={t.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, dateStr, t.id)}
                    style={{ fontSize: '0.68rem', padding: '2px 4px', background: `${t.color}20`, color: t.color, borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: t.completed ? 'line-through' : 'none', cursor: 'grab' }}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center' }}>+{dayTasks.length - 2}</div>
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

    const activeMobileDateStr = format(currentDate, 'yyyy-MM-dd');
    const activeMobileTasks = tasks[activeMobileDateStr] || [];
    const isTodayMobile = isToday(currentDate);

    return (
      <>
        {/* Desktop View: 7-Column Layout (100% Intact) */}
        <div className="desktop-only custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
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

        {/* Mobile View: Day Ribbon + Active Day Task Card */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Day Ribbon */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {days.map((day) => {
              const dStr = format(day, 'yyyy-MM-dd');
              const isSelected = format(currentDate, 'yyyy-MM-dd') === dStr;
              const isTodayDate = isToday(day);
              const dayTaskCount = (tasks[dStr] || []).length;
              return (
                <button
                  key={dStr}
                  onClick={() => {
                    haptics.selection();
                    setCurrentDate(day);
                  }}
                  style={{
                    flex: '1 0 0',
                    minWidth: '44px',
                    padding: '8px 3px',
                    borderRadius: '12px',
                    border: isSelected ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.1))' : (isTodayDate ? 'rgba(236,72,153,0.08)' : 'rgba(255,255,255,0.03)'),
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '10px', color: isSelected ? '#ec4899' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {format(day, 'EEE', { locale: tr })}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800 }}>
                    {format(day, 'd')}
                  </span>
                  {dayTaskCount > 0 ? (
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#ec4899' : '#38bdf8' }} />
                  ) : (
                    <span style={{ width: 5, height: 5 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Day Tasks Card */}
          <div style={{
            background: isTodayMobile ? 'rgba(236, 72, 153, 0.05)' : 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: `1px solid ${isTodayMobile ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.08)'}`,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: isTodayMobile ? '#ec4899' : 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {format(currentDate, 'EEEE', { locale: tr })}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  {format(currentDate, 'd MMMM yyyy', { locale: tr })}
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 700 }}>
                {activeMobileTasks.length} Görev
              </span>
            </div>

            {activeMobileTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Bu gün için henüz bir görev eklenmedi.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <AnimatePresence>
                  {activeMobileTasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: task.completed ? 0.5 : 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{ 
                        background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '0.85rem', 
                        borderLeft: `3px solid ${task.color}`, position: 'relative',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}
                    >
                      <button onClick={(e) => toggleTask(activeMobileDateStr, task.id, e)} style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? '#10b981' : 'var(--text-muted)', padding: '4px' }}>
                        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                      <button onClick={(e) => deleteTask(activeMobileDateStr, task.id, e)} style={{ position: 'absolute', bottom: '0.85rem', right: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}>
                        <X size={16} />
                      </button>
                      
                      <div style={{ fontSize: '0.65rem', color: task.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                        {task.subject}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#fff', paddingRight: '2rem', wordBreak: 'break-word', fontWeight: 500 }}>
                        {task.title}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            <button 
              onClick={() => {
                haptics.selection();
                setNewTask({ ...newTask, date: activeMobileDateStr });
                setIsModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '0.85rem',
                minHeight: '44px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px dashed rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={18} /> Görev Ekle
            </button>
          </div>
        </div>
      </>
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
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem' }}>Takvim & Planlayıcı</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Zamanını etkin yönet, hedeflerine ulaş.</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={generateAIPlan}
            disabled={isAIGenerating}
            className="btn-interactive" 
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '0.65rem 1rem', fontSize: '0.85rem', minHeight: '40px' }}
          >
            {isAIGenerating ? <Bot size={18} className="animate-spin" /> : <Bot size={18} />} 
            {isAIGenerating ? 'Planlanıyor...' : 'AI ile Planla'}
          </button>
          
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
            {['month', 'week'].map(m => (
              <button 
                key={m}
                onClick={() => {
                  haptics.selection();
                  setViewMode(m as any);
                }}
                style={{ padding: '0.5rem 0.85rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, background: viewMode === m ? 'rgba(236, 72, 153, 0.2)' : 'transparent', color: viewMode === m ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {m === 'month' ? 'Aylık' : 'Haftalık'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
            <button onClick={navigatePrev} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
            <span style={{ padding: '0 0.75rem', color: '#fff', fontWeight: 600, minWidth: '120px', textAlign: 'center', fontSize: '0.85rem' }}>{titleStr}</span>
            <button onClick={navigateNext} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight size={20} /></button>
          </div>

          <button onClick={navigateToday} style={{ padding: '0.5rem 0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, minHeight: '40px' }}>
            Bugün
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      
      {renderHeader()}

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
          <p>Detaylı günlük görünüm haftalık görünümle birleştirilmiştir.</p>
          <button onClick={() => setViewMode('week')} className="btn-secondary" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Haftalık Görünüme Dön</button>
        </div>
      )}

      {/* Görev Ekleme Modalı (Desktop centered, Mobile bottom-sheet) */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="program-modal-overlay"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="program-modal-box"
              style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle on mobile */}
              <div className="mobile-only modal-drag-handle" style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '-0.75rem auto 1rem' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: 0, fontWeight: 700 }}>Yeni Görev Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Tarih</label>
                  <input type="date" required value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} className="program-input-touch" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Ders / Kategori</label>
                  <select value={newTask.subject} onChange={e => setNewTask({...newTask, subject: e.target.value})} className="program-input-touch" style={{ width: '100%', padding: '0.75rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                    <option value="Matematik">Matematik</option>
                    <option value="Fizik">Fizik</option>
                    <option value="Kimya">Kimya</option>
                    <option value="Biyoloji">Biyoloji</option>
                    <option value="Genel">Genel Tekrar / Deneme</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Görev Başlığı</label>
                  <input type="text" required placeholder="Örn: Limit Fasikülü Bitirilecek" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="program-input-touch" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Renk</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map(c => (
                      <div 
                        key={c} 
                        onClick={() => { haptics.selection(); setNewTask({...newTask, color: c}); }}
                        style={{ width: '34px', height: '34px', borderRadius: '50%', background: c, cursor: 'pointer', border: newTask.color === c ? '3px solid #fff' : '3px solid transparent', boxShadow: newTask.color === c ? `0 0 10px ${c}` : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-interactive" style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', marginTop: '0.75rem', minHeight: '44px', fontWeight: 700 }}>
                  Görevi Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .program-modal-overlay {
            align-items: flex-end !important;
            padding: 0 !important;
          }
          .program-modal-box {
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            padding: 1.25rem !important;
            padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px)) !important;
          }
          .program-input-touch {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
