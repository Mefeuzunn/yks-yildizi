"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Coffee, Flame, Target, Brain, Check, Edit3 } from 'lucide-react';
import { haptics } from '@/lib/haptics';

export interface QuickStatusOption {
  label: string;
  emoji: string;
  type: 'focusing' | 'break';
  category: string;
}

export const PRESET_STATUS_OPTIONS: QuickStatusOption[] = [
  { label: 'Paragraf Soru Çözümü', emoji: '📖', type: 'focusing', category: 'Türkçe' },
  { label: 'AYT Matematik Pratiği', emoji: '📐', type: 'focusing', category: 'Matematik' },
  { label: 'Trigonometri Soru Bankası', emoji: '📏', type: 'focusing', category: 'Matematik' },
  { label: 'Fizik & Kimya Deney/Soru Turu', emoji: '⚡', type: 'focusing', category: 'Fen' },
  { label: 'Biyoloji Sistemler Tekrarı', emoji: '🔬', type: 'focusing', category: 'Fen' },
  { label: 'TYT Genel Deneme Sınavı', emoji: '🎯', type: 'focusing', category: 'Deneme' },
  { label: 'Derin Pomodoro Odak', emoji: '🔥', type: 'focusing', category: 'Odak' },
  { label: 'Formül & Not Ezberi', emoji: '🧠', type: 'focusing', category: 'Ezber' },
  { label: 'Tarih & Coğrafya Kavramları', emoji: '🏛️', type: 'focusing', category: 'Sosyal' },
  { label: '5 Dk Kahve & Zihin Molası', emoji: '☕', type: 'break', category: 'Mola' },
];

interface QuickStatusSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus?: string;
  onSelectStatus: (newStatus: string, statusType?: 'focusing' | 'break') => void;
}

export default function QuickStatusSelectorModal({
  isOpen,
  onClose,
  currentStatus = 'AYT Matematik',
  onSelectStatus,
}: QuickStatusSelectorModalProps) {
  const [customText, setCustomText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📖');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: QuickStatusOption) => {
    haptics.impact('light');
    const fullText = `${preset.emoji} ${preset.label}`;
    onSelectStatus(fullText, preset.type);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    haptics.notification('success');
    const fullText = `${selectedEmoji} ${customText.trim()}`;
    onSelectStatus(fullText, 'focusing');
    setCustomText('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-[#0f172a] border border-white/15 p-6 shadow-2xl overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Canlı Durum Baloncuğu</h3>
              <p className="text-xs text-gray-400">Masada ne çalıştığını arkadaşlarınla paylaş</p>
            </div>
          </div>

          {/* Live Preview of the Floating Bubble */}
          <div className="my-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-gray-400">Masanın Üzerindeki Görünüm:</span>
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500/25 to-indigo-500/20 border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] text-xs font-black text-sky-200 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{customText.trim() ? `${selectedEmoji} ${customText.trim()}` : currentStatus}</span>
            </motion.div>
          </div>

          {/* Custom Status Input Form */}
          <form onSubmit={handleCustomSubmit} className="mb-4">
            <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
              <Edit3 size={13} className="text-sky-400" />
              <span>Kendi Çalışma Durumunu Yaz:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedEmoji}
                onChange={e => setSelectedEmoji(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-2.5 py-2.5 text-base text-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="📖">📖</option>
                <option value="📐">📐</option>
                <option value="⚡">⚡</option>
                <option value="🎯">🎯</option>
                <option value="🔥">🔥</option>
                <option value="🧠">🧠</option>
                <option value="☕">☕</option>
                <option value="📝">📝</option>
                <option value="✨">✨</option>
              </select>

              <input
                type="text"
                placeholder="Örn: 20 Soru Limit Çözüyor..."
                maxLength={35}
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-sky-400"
              />

              <button
                type="submit"
                disabled={!customText.trim()}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-white text-xs font-black transition-all cursor-pointer shadow-md"
              >
                Ayarla
              </button>
            </div>
          </form>

          {/* Preset Buttons Grid */}
          <div className="text-xs font-bold text-gray-400 mb-2">
            Hızlı Şablonlar:
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {PRESET_STATUS_OPTIONS.map((preset, idx) => {
              const isSelected = currentStatus.includes(preset.label);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400/60 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-gray-300'
                  }`}
                >
                  <span className="text-base shrink-0">{preset.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate leading-tight">{preset.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{preset.category}</div>
                  </div>
                  {isSelected && <Check size={14} className="text-sky-400 shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
