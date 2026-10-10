"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Compass, Sparkles, Flame, Users, Coffee, 
  Zap, Brain, Star, Target, BookOpen, Clock, Check
} from 'lucide-react';
import { RoomParticipant } from './LibraryStudyHall';
import { haptics } from '@/lib/haptics';

interface TableSynergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  occupants: RoomParticipant[];
  currentUserId?: string;
  onSendInteraction?: (receiverId: string, action: 'coffee' | 'wave' | 'energy' | 'fire' | 'brain' | 'star') => void;
}

export default function TableSynergyModal({
  isOpen,
  onClose,
  tableNumber,
  occupants = [],
  currentUserId,
  onSendInteraction,
}: TableSynergyModalProps) {
  const [sentTarget, setSentTarget] = useState<{ id: string; action: string } | null>(null);

  if (!isOpen) return null;

  const count = occupants.length;
  let synergyTier = { label: 'Bireysel Odak', bonus: '+%0 XP', color: '#94a3b8', badgeBg: 'rgba(255,255,255,0.08)' };

  if (count >= 4) {
    synergyTier = { label: 'Maksimum Masa Sinerjisi', bonus: '+%25 XP Bonusu', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.2)' };
  } else if (count === 3) {
    synergyTier = { label: 'Yüksek Masa Sinerjisi', bonus: '+%20 XP Bonusu', color: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.2)' };
  } else if (count === 2) {
    synergyTier = { label: 'Çiftli Odak Sinerjisi', bonus: '+%10 XP Bonusu', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.2)' };
  }

  const totalTableMinutes = occupants.reduce((acc, curr) => acc + (curr.focusMinutes || 25), 0);

  const handleQuickGift = (receiverId: string, action: 'coffee' | 'fire' | 'brain' | 'star') => {
    haptics.notification('success');
    setSentTarget({ id: receiverId, action });
    if (onSendInteraction) {
      onSendInteraction(receiverId, action);
    }
    setTimeout(() => setSentTarget(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0f172a] border border-white/15 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-md">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">Masa {tableNumber} Sinerji Paneli</h3>
                <span
                  style={{ backgroundColor: synergyTier.badgeBg, color: synergyTier.color }}
                  className="px-2 py-0.5 rounded-full text-xs font-black border border-white/10"
                >
                  {synergyTier.bonus}
                </span>
              </div>
              <p className="text-xs text-gray-400">Masadaki arkadaşların ve kolektif odak sinerjisi</p>
            </div>
          </div>

          {/* Synergy KPI Banner */}
          <div className="grid grid-cols-3 gap-2.5 mb-5 p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-center">
              <div className="text-[11px] text-gray-400 font-bold mb-0.5">Dolu Sandalye</div>
              <div className="text-base font-black text-white flex items-center justify-center gap-1">
                <Users size={14} className="text-sky-400" />
                <span>{count} / 4</span>
              </div>
            </div>

            <div className="text-center border-x border-white/10">
              <div className="text-[11px] text-gray-400 font-bold mb-0.5">Masa Sinerjisi</div>
              <div className="text-base font-black truncate" style={{ color: synergyTier.color }}>
                {synergyTier.label}
              </div>
            </div>

            <div className="text-center">
              <div className="text-[11px] text-gray-400 font-bold mb-0.5">Masa Toplam Odak</div>
              <div className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                <Clock size={14} />
                <span>{totalTableMinutes} Dk</span>
              </div>
            </div>
          </div>

          {/* Seated Students List */}
          <div className="text-xs font-bold text-gray-400 mb-2 flex items-center justify-between">
            <span>Masada Oturan Arkadaşlar ({count}):</span>
            <span className="text-[11px] text-sky-400">Tek tıkla ikram gönder ☕</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {occupants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                Bu masada şu anda oturan kimse yok. Masadaki boş bir sandalyeye oturarak ilk sinerjiyi başlat!
              </div>
            ) : (
              occupants.map(student => {
                const isMe = student.id === currentUserId;
                const isTargetSent = sentTarget?.id === student.id;

                return (
                  <div
                    key={student.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-sky-500/10 border-sky-400/40 shadow-sm'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {student.username?.[0]?.toUpperCase() || 'Ö'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm truncate">{student.username}</span>
                            {isMe && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-300 text-[10px] font-black">
                                SEN
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                              {student.league || 'Elmas'}
                            </span>
                          </div>
                          
                          {/* Live Status Bubble Pill */}
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-sky-300 text-xs font-bold border border-white/5 truncate max-w-[200px]">
                              {student.subject || 'Genel Tekrar'}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-semibold">
                              <Flame size={12} className="text-amber-400" />
                              {student.focusMinutes || 25} dk
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Silent Peer Gifts Buttons (For Tablemates) */}
                      {!isMe && (
                        <div className="flex items-center gap-1 shrink-0">
                          {isTargetSent ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-lg">
                              <Check size={13} /> Gönderildi!
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleQuickGift(student.id, 'coffee')}
                                title="Kahve Ismarla"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-amber-400 border border-white/10 transition-all cursor-pointer active:scale-90"
                              >
                                <Coffee size={15} />
                              </button>
                              <button
                                onClick={() => handleQuickGift(student.id, 'fire')}
                                title="Odak Alevi Gönder"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-orange-400 border border-white/10 transition-all cursor-pointer active:scale-90"
                              >
                                <Flame size={15} />
                              </button>
                              <button
                                onClick={() => handleQuickGift(student.id, 'brain')}
                                title="Zihin Açıklığı Dile"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-purple-400 border border-white/10 transition-all cursor-pointer active:scale-90"
                              >
                                <Brain size={15} />
                              </button>
                              <button
                                onClick={() => handleQuickGift(student.id, 'star')}
                                title="Masa Yıldızı Rozeti Ver"
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-yellow-400 border border-white/10 transition-all cursor-pointer active:scale-90"
                              >
                                <Star size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
