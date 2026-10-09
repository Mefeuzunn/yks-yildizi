"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Users, Moon, Sun, Sunset, CloudRain, 
  Sparkles, Coffee, Volume2, Shield, Radio, Check, 
  RotateCcw, Flame, LogOut, ArrowRight, Lamp, Compass, Shirt
} from 'lucide-react';
import SeatedStudentAvatar, { EmptyLibraryDesk, AvatarConfig } from './SeatedStudentAvatar';
import StudentDeskCardModal, { DeskCardStudent } from './StudentDeskCardModal';
import AvatarWardrobeModal from './AvatarWardrobeModal';
import { haptics } from '@/lib/haptics';
import { libraryAudio } from '@/lib/library-audio';

export interface RoomParticipant {
  id: string;
  username: string;
  league?: string;
  target?: string;
  subject?: string;
  seatId?: string;
  status?: 'focusing' | 'break' | 'afk';
  focusMinutes?: number;
  avatarConfig?: any;
}

interface LibraryStudyHallProps {
  roomId: string;
  roomName: string;
  roomTheme: string;
  participants: RoomParticipant[];
  currentUserId?: string;
  currentUsername?: string;
  currentUserTarget?: string;
  userSubject?: string;
  onSubjectChange?: (subject: string) => void;
  onSeatChange?: (seatId: string | null) => void;
  mySeatId?: string | null;
  onSendInteraction?: (receiverId: string, action: 'coffee' | 'wave' | 'energy') => void;
  timerActive?: boolean;
  timeLeftFormatted?: string;
  avatarConfig?: AvatarConfig;
  onUpdateAvatarConfig?: (config: AvatarConfig) => void;
}

// 4 Tables x 4 Seats = 16 Seats Total
const TOTAL_TABLES = 4;
const SEATS_PER_TABLE = ['A', 'B', 'C', 'D'];

export default function LibraryStudyHall({
  roomId,
  roomName,
  roomTheme,
  participants = [],
  currentUserId,
  currentUsername,
  currentUserTarget,
  userSubject = 'AYT Matematik',
  onSubjectChange,
  onSeatChange,
  mySeatId,
  onSendInteraction,
  timerActive = false,
  timeLeftFormatted,
  avatarConfig,
  onUpdateAvatarConfig,
}: LibraryStudyHallProps) {
  const [selectedStudent, setSelectedStudent] = useState<DeskCardStudent | null>(null);
  const [localInteractions, setLocalInteractions] = useState<Record<string, 'coffee' | 'wave' | 'energy'>>({});
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);

  // ── Determine Day / Sunset / Night Lighting based on real local time ──
  const timeOfDay = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 18) return 'day';
    if (hour >= 18 && hour < 21) return 'sunset';
    return 'night';
  }, []);

  // ── Map participants to their seats ──
  // If participant doesn't have an assigned seatId, give them a deterministic fallback slot
  const seatMap = useMemo(() => {
    const map: Record<string, RoomParticipant> = {};
    const unseated: RoomParticipant[] = [];

    participants.forEach(p => {
      if (p.seatId) {
        map[p.seatId] = p;
      } else {
        unseated.push(p);
      }
    });

    // Auto-place unseated into available slots
    let unseatedIdx = 0;
    for (let t = 1; t <= TOTAL_TABLES; t++) {
      for (const s of SEATS_PER_TABLE) {
        const seatId = `t${t}-s${s}`;
        if (!map[seatId] && unseatedIdx < unseated.length) {
          map[seatId] = { ...unseated[unseatedIdx], seatId };
          unseatedIdx++;
        }
      }
    }

    return map;
  }, [participants]);

  // Handle student clicking empty seat
  const handleSitDown = (seatId: string) => {
    haptics.impact('medium');
    onSeatChange?.(seatId);
  };

  // Handle student leaving seat
  const handleLeaveSeat = () => {
    haptics.impact('light');
    onSeatChange?.(null);
  };

  // Quick auto-sit
  const handleQuickSit = () => {
    for (let t = 1; t <= TOTAL_TABLES; t++) {
      for (const s of SEATS_PER_TABLE) {
        const seatId = `t${t}-s${s}`;
        if (!seatMap[seatId]) {
          handleSitDown(seatId);
          return;
        }
      }
    }
  };

  // Handle silent interaction (coffee / wave / energy)
  const handleSendInteraction = (receiverId: string, action: 'coffee' | 'wave' | 'energy') => {
    setLocalInteractions(prev => ({ ...prev, [receiverId]: action }));
    if (action === 'coffee') libraryAudio.playCoffee();
    else if (action === 'energy') libraryAudio.playEnergy();
    else if (action === 'wave') libraryAudio.playWave();
    
    onSendInteraction?.(receiverId, action);
    setTimeout(() => {
      setLocalInteractions(prev => {
        const next = { ...prev };
        delete next[receiverId];
        return next;
      });
    }, 4500);
  };

  const occupiedCount = Object.keys(seatMap).length;

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* ── Library Atmosphere Header Bar ── */}
      <div className="w-full max-w-5xl mb-4 px-4 py-3 rounded-2xl bg-[#0f172a]/90 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white">{roomName}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                {occupiedCount}/16 Masada
              </span>
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
              {timeOfDay === 'day' && <span className="flex items-center gap-1 text-amber-300"><Sun size={12} /> Gündüz Işığı</span>}
              {timeOfDay === 'sunset' && <span className="flex items-center gap-1 text-orange-300"><Sunset size={12} /> Gün Batımı</span>}
              {timeOfDay === 'night' && <span className="flex items-center gap-1 text-indigo-300"><Moon size={12} /> Gece Kütüphanesi</span>}
              <span>·</span>
              <span className="text-gray-400">Fısıltısız Sessiz Salon</span>
            </div>
          </div>
        </div>

        {/* User Desk Status / Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Wardrobe & Avatar Customizer Button */}
          <button
            onClick={() => {
              haptics.impact('light');
              setIsWardrobeOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            title="Karakterini, saçını, kıyafetini ve masa lambanı özelleştir"
          >
            <Shirt size={13} />
            <span>Gardırop & Masa</span>
          </button>

          {mySeatId ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Masadasın ({mySeatId.replace('t', 'Masa ').replace('-s', ' / Koltuk ')})</span>
              </div>
              <button
                onClick={handleLeaveSeat}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Masadan kalk"
              >
                <LogOut size={13} />
                <span>Kalk</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleQuickSit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-black text-xs font-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95"
            >
              <Lamp size={14} />
              <span>⚡ Hızlı Otur</span>
            </button>
          )}

          {/* Quick Subject Tag Select */}
          {mySeatId && onSubjectChange && (
            <select
              value={userSubject}
              onChange={e => onSubjectChange(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400 cursor-pointer"
              title="Masanızda görünecek ders"
            >
              <option value="AYT Matematik">AYT Matematik</option>
              <option value="TYT Matematik">TYT Matematik</option>
              <option value="TYT Türkçe">TYT Türkçe</option>
              <option value="AYT Fizik">AYT Fizik</option>
              <option value="AYT Kimya">AYT Kimya</option>
              <option value="AYT Biyoloji">AYT Biyoloji</option>
              <option value="AYT Edebiyat">AYT Edebiyat</option>
              <option value="AYT Tarih">AYT Tarih</option>
              <option value="Genel Deneme">Genel Deneme</option>
            </select>
          )}
        </div>
      </div>

      {/* ── Main Library Hall Scenic Stage ── */}
      <div 
        className="w-full max-w-5xl rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden p-4 sm:p-6 lg:p-8"
        style={{
          background: timeOfDay === 'night' 
            ? 'linear-gradient(180deg, #090d16 0%, #0d121f 50%, #111726 100%)'
            : timeOfDay === 'sunset'
            ? 'linear-gradient(180deg, #181124 0%, #1a162b 50%, #151a2e 100%)'
            : 'linear-gradient(180deg, #0e1526 0%, #121c33 50%, #16203a 100%)',
        }}
      >
        {/* ── Background Architectural Layer: Arched Windows & Wall Bookshelves ── */}
        <div className="absolute top-0 left-0 right-0 h-44 pointer-events-none overflow-hidden z-0 opacity-40">
          {/* Bookshelf wooden beams */}
          <div className="w-full h-full flex justify-between px-6 gap-6">
            {[1, 2, 3, 4, 5].map(b => (
              <div key={b} className="flex-1 h-36 border-x border-b border-amber-900/40 bg-amber-950/10 rounded-b-xl flex flex-col justify-end p-2 gap-1.5">
                {/* Simulated rows of books */}
                <div className="h-6 flex items-end gap-1 px-1 border-b border-amber-900/30">
                  <span className="w-2 h-5 bg-red-900/60 rounded-t-sm" />
                  <span className="w-2.5 h-6 bg-blue-900/60 rounded-t-sm" />
                  <span className="w-2 h-4 bg-emerald-900/60 rounded-t-sm" />
                  <span className="w-3 h-5.5 bg-amber-900/60 rounded-t-sm" />
                  <span className="w-2 h-5 bg-purple-900/60 rounded-t-sm" />
                </div>
                <div className="h-6 flex items-end gap-1 px-1">
                  <span className="w-2.5 h-5 bg-emerald-900/60 rounded-t-sm" />
                  <span className="w-2 h-6 bg-amber-800/60 rounded-t-sm" />
                  <span className="w-3 h-4 bg-sky-900/60 rounded-t-sm" />
                  <span className="w-2 h-5 bg-rose-900/60 rounded-t-sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Arched Window in Center */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-28 rounded-t-full border border-white/10 bg-black/40 backdrop-blur-xs flex items-center justify-center overflow-hidden">
            {timeOfDay === 'night' && (
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="absolute top-3 right-8 w-6 h-6 rounded-full bg-amber-100/30 blur-[1px] shadow-[0_0_12px_rgba(254,240,138,0.4)]" />
                {/* Tiny stars */}
                <span className="absolute top-6 left-10 w-1 h-1 bg-white rounded-full animate-ping opacity-60" />
                <span className="absolute top-12 right-16 w-0.5 h-0.5 bg-white rounded-full opacity-80" />
                <span className="absolute top-16 left-20 w-1 h-1 bg-white rounded-full opacity-50" />
              </div>
            )}
            {timeOfDay === 'sunset' && (
              <div className="w-full h-full bg-gradient-to-t from-orange-500/20 via-pink-500/10 to-transparent" />
            )}
            {timeOfDay === 'day' && (
              <div className="w-full h-full bg-gradient-to-t from-sky-400/20 via-amber-200/10 to-transparent" />
            )}
            {roomTheme === 'rain' && (
              <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-[0.5px]">
                {/* Rain streak accents */}
                <div className="w-full h-full flex justify-around opacity-30">
                  <span className="w-0.5 h-full bg-gradient-to-b from-transparent via-white to-transparent" />
                  <span className="w-0.5 h-full bg-gradient-to-b from-transparent via-white to-transparent" />
                  <span className="w-0.5 h-full bg-gradient-to-b from-transparent via-white to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Floor Parquet Texture / Atmospheric Warmth ── */}
        <div className="relative z-10 pt-16 pb-4">

          {/* ── The 4 Study Tables Grid (2x2 Layout) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[1, 2, 3, 4].map(tableNum => (
              <div
                key={tableNum}
                className="relative p-4 sm:p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center"
              >
                {/* Table Center Brass Plaque */}
                <div className="mb-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/60 to-yellow-950/60 border border-amber-600/30 text-amber-300 text-[11px] font-black tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Compass size={12} className="text-amber-400" />
                  <span>MASA {tableNum} · SESSİZ BÖLÜM</span>
                </div>

                {/* 4 Seats Grid for this Table (2 Top, 2 Bottom) */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full justify-items-center">
                  {SEATS_PER_TABLE.map(seatLetter => {
                    const seatId = `t${tableNum}-s${seatLetter}`;
                    const occupant = seatMap[seatId];
                    const isMe = occupant?.id === currentUserId;

                    if (occupant) {
                      return (
                        <SeatedStudentAvatar
                          key={seatId}
                          seatId={seatId}
                          tableNumber={tableNum}
                          seatLabel={seatLetter}
                          isCurrentUser={isMe}
                          lampOn={true}
                          user={{
                            id: occupant.id,
                            username: occupant.username,
                            league: occupant.league || 'Elmas',
                            target: isMe ? currentUserTarget : (occupant.target || 'YKS 2026'),
                            subject: isMe ? userSubject : (occupant.subject || 'Ders Çalışıyor'),
                            status: occupant.status || 'focusing',
                            avatarConfig: isMe ? (avatarConfig || occupant.avatarConfig) : occupant.avatarConfig,
                            focusMinutes: occupant.focusMinutes || 25,
                            tempInteraction: localInteractions[occupant.id] || null,
                          }}
                          onClick={() => {
                            setSelectedStudent({
                              id: occupant.id,
                              username: occupant.username,
                              league: occupant.league,
                              target: isMe ? currentUserTarget : occupant.target,
                              subject: isMe ? userSubject : occupant.subject,
                              focusMinutes: occupant.focusMinutes,
                              seatId,
                              tableNumber: tableNum,
                              seatLabel: seatLetter,
                            });
                          }}
                        />
                      );
                    }

                    // Empty Desk
                    return (
                      <EmptyLibraryDesk
                        key={seatId}
                        seatId={seatId}
                        tableNumber={tableNum}
                        seatLabel={seatLetter}
                        onSitDown={() => handleSitDown(seatId)}
                      />
                    );
                  })}
                </div>

                {/* Wooden Table Runner Detail */}
                <div className="w-full h-1 mt-4 rounded-full bg-gradient-to-r from-transparent via-amber-800/40 to-transparent" />
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ── Student Desk Profile & Interaction Modal ── */}
      <StudentDeskCardModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSendInteraction={handleSendInteraction}
        isCurrentUser={selectedStudent?.id === currentUserId}
      />

      {/* ── Avatar Wardrobe & Customization Modal ── */}
      <AvatarWardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        currentConfig={avatarConfig}
        onSave={newConfig => {
          onUpdateAvatarConfig?.(newConfig);
        }}
        username={currentUsername}
        target={currentUserTarget}
      />

    </div>
  );
}
