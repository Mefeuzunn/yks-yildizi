"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ScheduleBlock {
  id: number;
  day: number;
  time: number;
  duration: number;
  title: string;
  notes?: string;
  color: string;
  completed: boolean;
  studied_minutes?: number;
  questions_solved?: number;
  last_completed_week?: string;
}

interface ScheduleContextType {
  blocks: ScheduleBlock[];
  addBlock: (block: Omit<ScheduleBlock, 'id' | 'completed' | 'studied_minutes' | 'questions_solved'>) => Promise<void>;
  updateBlock: (id: number, updates: Partial<ScheduleBlock>) => Promise<void>;
  deleteBlock: (id: number) => Promise<void>;
  toggleBlock: (id: number) => void;
  resetWeek: () => Promise<void>;
  refreshSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/user/calendar');
      const data = await res.json();
      if (data.plans) {
        setBlocks(data.plans.map((p: any) => ({
          id: p.id,
          day: p.day_of_week,
          time: p.start_time,
          duration: p.duration,
          title: p.title,
          notes: p.notes,
          color: p.color,
          completed: p.completed === 1,
          studied_minutes: Number(p.studied_minutes) || 0,
          questions_solved: Number(p.questions_solved) || 0,
          last_completed_week: p.last_completed_week || '',
        })));
      }
    } catch (e) {
      console.error('Error fetching calendar schedule:', e);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const addBlock = async (newBlock: Omit<ScheduleBlock, 'id' | 'completed' | 'studied_minutes' | 'questions_solved'>) => {
    try {
      const res = await fetch('/api/user/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add', 
          day: newBlock.day, 
          time: newBlock.time, 
          duration: newBlock.duration, 
          title: newBlock.title, 
          notes: newBlock.notes, 
          color: newBlock.color 
        })
      });
      const data = await res.json();
      if (data.success) {
        setBlocks(prev => [...prev, { 
          ...newBlock, 
          id: data.id, 
          completed: false, 
          studied_minutes: 0, 
          questions_solved: 0 
        }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateBlock = async (id: number, updates: Partial<ScheduleBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const finalBlock = { ...block, ...updates };

    try {
      await fetch('/api/user/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update', 
          id, 
          day: finalBlock.day, 
          time: finalBlock.time, 
          duration: finalBlock.duration, 
          title: finalBlock.title, 
          notes: finalBlock.notes, 
          color: finalBlock.color, 
          completed: finalBlock.completed ? 1 : 0,
          studied_minutes: finalBlock.studied_minutes !== undefined ? finalBlock.studied_minutes : null,
          questions_solved: finalBlock.questions_solved !== undefined ? finalBlock.questions_solved : null,
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteBlock = async (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    try {
      await fetch('/api/user/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBlock = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const nextCompleted = !block.completed;
      updateBlock(id, { 
        completed: nextCompleted,
        studied_minutes: nextCompleted && (!block.studied_minutes || block.studied_minutes === 0) 
          ? block.duration * 60 
          : block.studied_minutes
      });
    }
  };

  const resetWeek = async () => {
    setBlocks(prev => prev.map(b => ({
      ...b,
      completed: false,
      studied_minutes: 0,
      questions_solved: 0,
    })));

    try {
      await fetch('/api/user/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_week' })
      });
    } catch (e) {
      console.error('Reset week error:', e);
    }
  };

  return (
    <ScheduleContext.Provider value={{ 
      blocks, 
      addBlock, 
      updateBlock, 
      deleteBlock, 
      toggleBlock, 
      resetWeek, 
      refreshSchedule: fetchSchedule 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}

