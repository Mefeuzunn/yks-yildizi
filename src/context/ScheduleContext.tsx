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
}

interface ScheduleContextType {
  blocks: ScheduleBlock[];
  addBlock: (block: Omit<ScheduleBlock, 'id' | 'completed'>) => void;
  updateBlock: (id: number, updates: Partial<ScheduleBlock>) => void;
  deleteBlock: (id: number) => void;
  toggleBlock: (id: number) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    fetch('/api/user/calendar').then(res => res.json()).then(data => {
      if (data.plans) {
        setBlocks(data.plans.map((p: any) => ({
          id: p.id,
          day: p.day_of_week,
          time: p.start_time,
          duration: p.duration,
          title: p.title,
          notes: p.notes,
          color: p.color,
          completed: p.completed === 1
        })));
      }
    }).catch(console.error);
  }, []);

  const addBlock = async (newBlock: Omit<ScheduleBlock, 'id' | 'completed'>) => {
    // Optimistic UI could be implemented, but simple fetch for now
    try {
      const res = await fetch('/api/user/calendar', {
        method: 'POST',
        body: JSON.stringify({ action: 'add', day: newBlock.day, time: newBlock.time, duration: newBlock.duration, title: newBlock.title, notes: newBlock.notes, color: newBlock.color })
      });
      const data = await res.json();
      if (data.success) {
        setBlocks(prev => [...prev, { ...newBlock, id: data.id, completed: false }]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateBlock = async (id: number, updates: Partial<ScheduleBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    
    // Convert to flat properties for the API
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    const finalBlock = { ...block, ...updates };

    await fetch('/api/user/calendar', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'update', 
        id, 
        day: finalBlock.day, 
        time: finalBlock.time, 
        duration: finalBlock.duration, 
        title: finalBlock.title, 
        notes: finalBlock.notes, 
        color: finalBlock.color, 
        completed: finalBlock.completed ? 1 : 0 
      })
    });
  };

  const deleteBlock = async (id: number) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    await fetch('/api/user/calendar', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id })
    });
  };

  const toggleBlock = (id: number) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      updateBlock(id, { completed: !block.completed });
    }
  };

  return (
    <ScheduleContext.Provider value={{ blocks, addBlock, updateBlock, deleteBlock, toggleBlock }}>
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
