"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Trophy, Award, CheckCircle2, Clock, 
  Flame, Coffee, Users, MessageSquare, Headphones, 
  Star, ChevronRight, Gift, Zap
} from 'lucide-react';
import { haptics } from '@/lib/haptics';
import { libraryAudio } from '@/lib/library-audio';
import confetti from 'canvas-confetti';

export interface LibraryQuestProgress {
  giftsSent: number;
  focusMinutes: number;
  synergyJoined: boolean;
  statusUpdated: boolean;
  neuroUsed: boolean;
  claimedQuests: string[];
  claimedBadges: string[];
  totalGiftsLifetime?: number;
  nightOwlSession?: boolean;
  fullTableJoined?: boolean;
}

export interface QuestItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  current: number;
  target: number;
  unit: string;
  rewardXp: number;
  rewardLp: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  unlocked: boolean;
  rewardXp: number;
  rewardLp: number;
}

interface LibraryQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: LibraryQuestProgress;
  onClaimReward: (id: string, xp: number, lp: number, type: 'quest' | 'badge') => void;
}

export default function LibraryQuestsModal({
  isOpen,
  onClose,
  progress,
  onClaimReward,
}: LibraryQuestsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'badges'>('daily');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // ── Daily Quests Definition ──
  const dailyQuests: QuestItem[] = [
    {
      id: 'quest_gift',
      title: 'Cömert Kütüphaneci',
      description: 'Masadaki bir çalışma arkadaşına sessiz ikram (kahve, çay, ateş, beyin vb.) gönder.',
      icon: Coffee,
      iconColor: 'from-amber-500 to-orange-500',
      current: Math.min(progress.giftsSent || 0, 1),
      target: 1,
      unit: 'adet',
      rewardXp: 25,
      rewardLp: 5,
    },
    {
      id: 'quest_focus25',
      title: 'Derin Odaklanma Seansı',
      description: 'Masadan kalkmadan tek seferde en az 25 dakika kesintisiz odaklan.',
      icon: Flame,
      iconColor: 'from-rose-500 to-red-500',
      current: Math.min(progress.focusMinutes || 0, 25),
      target: 25,
      unit: 'dk',
      rewardXp: 50,
      rewardLp: 10,
    },
    {
      id: 'quest_synergy',
      title: 'Kolektif Güç (Masa Sinerjisi)',
      description: 'En az 2 öğrencinin oturduğu bir sinerji masasında çalış ve bonus kazan.',
      icon: Users,
      iconColor: 'from-purple-500 to-indigo-500',
      current: progress.synergyJoined ? 1 : 0,
      target: 1,
      unit: 'seans',
      rewardXp: 30,
      rewardLp: 6,
    },
    {
      id: 'quest_status',
      title: 'Aktivite Paylaşımı',
      description: 'Kütüphane konuşma baloncuğunda üzerinde çalıştığın dersi veya konuyu bildir.',
      icon: MessageSquare,
      iconColor: 'from-sky-500 to-cyan-500',
      current: progress.statusUpdated ? 1 : 0,
      target: 1,
      unit: 'durum',
      rewardXp: 15,
      rewardLp: 3,
    },
    {
      id: 'quest_neuro',
      title: 'Nöro-Akustik Odak Frekansı',
      description: 'Nöro-Akustik Stüdyodan 40Hz Gama veya 10Hz Alfa beyin dalgalarını açıp dinle.',
      icon: Headphones,
      iconColor: 'from-emerald-500 to-teal-500',
      current: progress.neuroUsed ? 1 : 0,
      target: 1,
      unit: 'seans',
      rewardXp: 20,
      rewardLp: 4,
    },
  ];

  // ── Permanent Milestone Badges Definition ──
  const badges: BadgeItem[] = [
    {
      id: 'badge_first_gift',
      title: 'İlk İkram Teşekkürü',
      description: 'Kütüphanede başka bir öğrenciye ilk jestini yap.',
      icon: '☕',
      requirement: '1 ikram gönderildi',
      unlocked: (progress.totalGiftsLifetime || progress.giftsSent || 0) >= 1,
      rewardXp: 50,
      rewardLp: 10,
    },
    {
      id: 'badge_synergy_master',
      title: 'Sinerji Gurusu',
      description: 'Tam dolu (4 kişilik) bir masada %25 sinerjiyle odak seansı gerçekleştir.',
      icon: '⚡',
      requirement: '4 kişilik masada çalışıldı',
      unlocked: !!progress.fullTableJoined,
      rewardXp: 80,
      rewardLp: 15,
    },
    {
      id: 'badge_barista',
      title: 'Cömert Barista',
      description: 'Toplamda 5 kez masa arkadaşlarına enerji ve zihin açıcı ikram ısmarla.',
      icon: '🎁',
      requirement: '5 ikram ısmarlandı',
      unlocked: (progress.totalGiftsLifetime || progress.giftsSent || 0) >= 5,
      rewardXp: 100,
      rewardLp: 20,
    },
    {
      id: 'badge_night_owl',
      title: 'Gece Baykuşu',
      description: 'Saat 21:00\'den sonra Gece Kütüphanesi aydınlatmasında odak seansı tamamla.',
      icon: '🦉',
      requirement: 'Gece kütüphanesinde çalışıldı',
      unlocked: !!progress.nightOwlSession,
      rewardXp: 60,
      rewardLp: 12,
    },
    {
      id: 'badge_hall_champion',
      title: 'Salon Şampiyonu',
      description: 'Bir günde tüm 5 günlük kütüphane görevini eksiksiz tamamla.',
      icon: '👑',
      requirement: 'Tüm günlük görevler bitti',
      unlocked: dailyQuests.every(q => q.current >= q.target),
      rewardXp: 150,
      rewardLp: 30,
    },
  ];

  const completedCount = dailyQuests.filter(q => q.current >= q.target).length;
  const claimableCount = dailyQuests.filter(
    q => q.current >= q.target && !progress.claimedQuests.includes(q.id)
  ).length;

  const handleClaim = (id: string, xp: number, lp: number, type: 'quest' | 'badge') => {
    haptics.notification('success');
    libraryAudio.playStar();
    setClaimingId(id);

    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#38bdf8']
      });
    } catch (_) {}

    setTimeout(() => {
      onClaimReward(id, xp, lp, type);
      setClaimingId(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Salon Görevleri & Başarılar</h3>
                {claimableCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black animate-pulse shadow-sm">
                    {claimableCount} Hazır!
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Kütüphanede odaklan, görevleri tamamla, XP ve Lig Puanı topla.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.impact('light');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Daily Progress Overview Strip */}
        <div className="relative mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Günlük Görev İlerlemesi</span>
              </span>
              <span className="text-amber-300 font-mono">
                {completedCount} / {dailyQuests.length} Tamamlandı
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / dailyQuests.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => {
              haptics.selection();
              setActiveTab('daily');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Clock size={13} />
            <span>Günlük Görevler</span>
            {claimableCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              haptics.selection();
              setActiveTab('badges');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award size={13} />
            <span>Salon Rozetleri ({badges.filter(b => b.unlocked).length}/{badges.length})</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="relative flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5 custom-scrollbar">
          {activeTab === 'daily' && (
            <div className="space-y-2.5">
              {dailyQuests.map((quest) => {
                const IconComponent = quest.icon;
                const isFinished = quest.current >= quest.target;
                const isClaimed = progress.claimedQuests.includes(quest.id);
                const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-white/[0.02] border-white/5 opacity-70'
                        : isFinished
                        ? 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-amber-500/30 shadow-lg'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${quest.iconColor} text-white flex items-center justify-center shrink-0 shadow-md`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{quest.title}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">
                            +{quest.rewardXp} XP · +{quest.rewardLp} LP
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                          {quest.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 shrink-0">
                            {quest.current}/{quest.target} {quest.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 flex items-center justify-end sm:justify-center">
                      {isClaimed ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Alındı</span>
                        </div>
                      ) : isFinished ? (
                        <button
                          onClick={() => handleClaim(quest.id, quest.rewardXp, quest.rewardLp, 'quest')}
                          disabled={claimingId === quest.id}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-110 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                        >
                          <Gift size={13} />
                          <span>{claimingId === quest.id ? 'Alınıyor...' : 'Ödülü Al'}</span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs font-medium">
                          Devam Ediyor
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {badges.map((badge) => {
                const isClaimed = progress.claimedBadges.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      badge.unlocked
                        ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30 shadow-md'
                        : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30">
                          +{badge.rewardXp} XP
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{badge.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                        {badge.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {badge.requirement}
                      </span>
                      {isClaimed ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Kazanıldı
                        </span>
                      ) : badge.unlocked ? (
                        <button
                          onClick={() => handleClaim(badge.id, badge.rewardXp, badge.rewardLp, 'badge')}
                          disabled={claimingId === badge.id}
                          className="px-2.5 py-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-[11px] font-black cursor-pointer shadow-sm transition-all active:scale-95"
                        >
                          Ödülü Al
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400">Kilitli 🔒</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="relative pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span>Görevler her gece 00:00'da sıfırlanır</span>
          </span>
          <button
            onClick={() => {
              haptics.impact('light');
              onClose();
            }}
            className="text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
}
