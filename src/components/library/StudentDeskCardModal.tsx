"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Hand, Zap, Target, BookOpen, Award, Flame, Check } from 'lucide-react';
import { haptics } from '@/lib/haptics';

export interface DeskCardStudent {
  id: string;
  username: string;
  league?: string;
  target?: string;
  subject?: string;
  focusMinutes?: number;
  seatId: string;
  tableNumber?: number;
  seatLabel?: string;
}

interface StudentDeskCardModalProps {
  student: DeskCardStudent | null;
  onClose: () => void;
  onSendInteraction: (studentId: string, action: 'coffee' | 'wave' | 'energy') => void;
  isCurrentUser?: boolean;
}

export default function StudentDeskCardModal({
  student,
  onClose,
  onSendInteraction,
  isCurrentUser = false,
}: StudentDeskCardModalProps) {
  const [sentAction, setSentAction] = useState<string | null>(null);

  if (!student) return null;

  const handleAction = (action: 'coffee' | 'wave' | 'energy') => {
    haptics.notification('success');
    setSentAction(action);
    onSendInteraction(student.id, action);
    setTimeout(() => {
      setSentAction(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-sm rounded-3xl bg-[#0f172a] border border-white/15 p-6 shadow-2xl overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header & Seat Location */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              Masa {student.tableNumber || 1} · Koltuk {student.seatLabel || 'A'}
            </span>
            {isCurrentUser && (
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black">
                Senin Masan
              </span>
            )}
          </div>

          {/* Student Profile Info */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
              {student.username?.[0]?.toUpperCase() || 'Ö'}
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {student.username}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {student.league || 'Elmas Ligi'}
                </span>
              </div>
            </div>
          </div>

          {/* Study Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <BookOpen size={13} className="text-sky-400" />
                <span>Çalıştığı Ders</span>
              </div>
              <div className="text-sm font-bold text-white truncate">
                {student.subject || 'Genel Tekrar'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                <Flame size={13} className="text-amber-400" />
                <span>Odak Süresi</span>
              </div>
              <div className="text-sm font-bold text-white">
                {student.focusMinutes ? `${student.focusMinutes} Dakika` : 'Aktif Masada'}
              </div>
            </div>
          </div>

          {/* Target University */}
          {student.target && (
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 mb-6 flex items-center gap-2.5">
              <Target size={16} className="text-sky-400 shrink-0" />
              <div className="text-xs">
                <span className="text-gray-400 block">Hedef:</span>
                <span className="text-sky-200 font-bold">{student.target}</span>
              </div>
            </div>
          )}

          {/* ── Silent Peer Interaction Buttons ── */}
          {!isCurrentUser ? (
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2.5 uppercase tracking-wider">
                Sessiz Kütüphane İkramları
              </div>

              {sentAction ? (
                <div className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-sm flex items-center justify-center gap-2">
                  <Check size={18} />
                  <span>
                    {sentAction === 'coffee' && 'Kahve masasına bırakıldı! ☕'}
                    {sentAction === 'wave' && 'Sessizce selam verildi! 👋'}
                    {sentAction === 'energy' && 'Odak enerjisi gönderildi! ⚡'}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAction('coffee')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Coffee size={18} className="text-amber-400" />
                    <span>Kahve Ver</span>
                  </button>

                  <button
                    onClick={() => handleAction('wave')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Hand size={18} className="text-sky-400" />
                    <span>Selam Ver</span>
                  </button>

                  <button
                    onClick={() => handleAction('energy')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white border border-white/10 flex flex-col items-center gap-1 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <Zap size={18} className="text-yellow-400 fill-current" />
                    <span>Enerji At</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-gray-400">
              Bu senin masan. Hedefine kilitlen ve çalışmaya devam et! 🌟
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
