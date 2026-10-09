"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Check, Shirt, Palette, 
  Lightbulb, Cat, Headphones, Save, RotateCcw
} from 'lucide-react';
import SeatedStudentAvatar, { AvatarConfig } from './SeatedStudentAvatar';
import { haptics } from '@/lib/haptics';
import { libraryAudio } from '@/lib/library-audio';

interface AvatarWardrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  username?: string;
  target?: string;
}

const DEFAULT_CONFIG: AvatarConfig = {
  outfitType: 'hoodie',
  outfitColor: '#38bdf8',
  hairStyle: 'short',
  hairColor: '#2d1b00',
  lampColor: 'green',
  petType: 'none',
  headphonesColor: '#0ea5e9',
  skinTone: '#fcd34d',
};

const OUTFIT_TYPES = [
  { id: 'hoodie', name: 'Kapüşonlu Hoodie', icon: '🧥' },
  { id: 'sweater', name: 'Örgü Kazak', icon: '🧶' },
  { id: 'jacket', name: 'Kampüs Ceketi', icon: '👔' },
  { id: 'tshirt', name: 'Rahat Tişört', icon: '👕' },
];

const OUTFIT_COLORS = [
  { color: '#38bdf8', name: 'Siber Mavi' },
  { color: '#8b5cf6', name: 'Kozmik Mor' },
  { color: '#10b981', name: 'Zümrüt Yeşili' },
  { color: '#f59e0b', name: 'Sıcak Kehribar' },
  { color: '#ef4444', name: 'Kiraz Kırmızısı' },
  { color: '#ec4899', name: 'Neon Pembe' },
  { color: '#475569', name: 'Gece Grisi' },
  { color: '#0284c7', name: 'Okyanus Derinliği' },
];

const HAIR_STYLES = [
  { id: 'short', name: 'Kısa & Düz', icon: '✂️' },
  { id: 'curly', name: 'Bukleli Dalgalı', icon: '➰' },
  { id: 'ponytail', name: 'Atkuyruğu', icon: '🎀' },
  { id: 'messy', name: 'Dağınık & Katlı', icon: '⚡' },
  { id: 'beanie', name: 'Kışlık Bere', icon: '🧶' },
];

const HAIR_COLORS = [
  { color: '#2d1b00', name: 'Koyu Kahve' },
  { color: '#18181b', name: 'Kuzguni Siyah' },
  { color: '#d97706', name: 'Açık Kumral' },
  { color: '#991b1b', name: 'Kızıl Kestane' },
  { color: '#1e3a8a', name: 'Gece Mavisi' },
  { color: '#f472b6', name: 'Pastel Pembe' },
];

const LAMP_COLORS: { id: 'green' | 'amber' | 'cyan' | 'purple'; name: string; hex: string; desc: string }[] = [
  { id: 'green', name: 'Yeşil Banker', hex: '#10b981', desc: 'Klasik Oxford pirinç banker lambası' },
  { id: 'amber', name: 'Sıcak Kehribar', hex: '#f59e0b', desc: 'Gözü yormayan loş mum ışığı sıcaklığı' },
  { id: 'cyan', name: 'Siber Camgöbeği', hex: '#38bdf8', desc: 'Yüksek odaklı neon çalışma ışığı' },
  { id: 'purple', name: 'Lavanta Parıltısı', hex: '#a855f7', desc: 'Gece çalışmaları için meditatif ton' },
];

const PET_OPTIONS: { id: 'none' | 'cat' | 'owl'; name: string; emoji: string; desc: string }[] = [
  { id: 'none', name: 'Arkadaşsız', emoji: '🚫', desc: 'Sadece defterim ve kahvem olsun' },
  { id: 'cat', name: 'Astro-Kedi', emoji: '🐱', desc: 'Masanın köşesinde mışıl mışıl uyur' },
  { id: 'owl', name: 'Bilge Baykuş', emoji: '🦉', desc: 'Tüneyip bilge gözleriyle seni izler' },
];

const HEADPHONE_COLORS = [
  { color: '#0ea5e9', name: 'Neon Mavi' },
  { color: '#ec4899', name: 'Neon Pembe' },
  { color: '#10b981', name: 'Zümrüt Yeşili' },
  { color: '#f59e0b', name: 'Lüks Kehribar' },
  { color: '#0f172a', name: 'Mat Siyah' },
  { color: '#ffffff', name: 'Kutup Beyazı' },
];

export default function AvatarWardrobeModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
  username = 'Öğrenci',
  target = 'YKS 2026',
}: AvatarWardrobeModalProps) {
  const [config, setConfig] = useState<AvatarConfig>({
    ...DEFAULT_CONFIG,
    ...(currentConfig || {}),
  });

  const [activeTab, setActiveTab] = useState<'outfit' | 'hair' | 'lamp' | 'pet' | 'headphones'>('outfit');

  if (!isOpen) return null;

  const handleUpdate = (updates: Partial<AvatarConfig>) => {
    haptics.selection();
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    haptics.notification('success');
    libraryAudio.playEnergy();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('yks_library_avatar_config', JSON.stringify(config));
      } catch (_) {}
    }
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    haptics.impact('light');
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22 }}
          className="relative w-full max-w-2xl bg-[#0c121e] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <Shirt size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <span>Kütüphane Gardırobu</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    Özelleştir
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  Masanın ışığını, kıyafetini ve sevimli dostunu seç
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body: Split View (Live Desk Preview on Top/Left + Customizer on Right) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
            {/* Live Desk Preview Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#141d2e] to-[#0a0f19] border border-white/10 relative overflow-hidden flex flex-col items-center shadow-inner">
              <div className="absolute top-2 left-3 text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Canlı Masa Önizlemesi</span>
              </div>

              <div className="pt-3 scale-95 sm:scale-105 transform origin-center">
                <SeatedStudentAvatar
                  seatId="preview"
                  tableNumber={1}
                  seatLabel="SEN"
                  isCurrentUser={true}
                  lampOn={true}
                  user={{
                    id: 'preview',
                    username: username,
                    target: target,
                    subject: 'Masaüstü Hazırlığı',
                    league: 'Elmas',
                    status: 'focusing',
                    avatarConfig: config,
                  }}
                />
              </div>
            </div>

            {/* Customization Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar">
              {[
                { id: 'outfit', label: 'Kıyafet', icon: <Shirt size={13} /> },
                { id: 'hair', label: 'Saç Stili', icon: <Palette size={13} /> },
                { id: 'lamp', label: 'Masa Lambası', icon: <Lightbulb size={13} /> },
                { id: 'pet', label: 'Masa Arkadaşı', icon: <Cat size={13} /> },
                { id: 'headphones', label: 'Kulaklık', icon: <Headphones size={13} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    haptics.selection();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="space-y-4">
              {/* OUTFIT PANEL */}
              {activeTab === 'outfit' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-2 block">
                      Kıyafet Modeli
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OUTFIT_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => handleUpdate({ outfitType: type.id as any })}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            (config.outfitType || 'hoodie') === type.id
                              ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                              : 'bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-xs font-bold">{type.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-2 block">
                      Kıyafet Rengi
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {OUTFIT_COLORS.map(c => (
                        <button
                          key={c.color}
                          onClick={() => handleUpdate({ outfitColor: c.color })}
                          title={c.name}
                          className="w-10 h-10 rounded-xl relative flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md"
                          style={{ backgroundColor: c.color }}
                        >
                          {config.outfitColor === c.color && (
                            <Check size={16} className="text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HAIR PANEL */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-2 block">
                      Saç Modeli
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HAIR_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => handleUpdate({ hairStyle: style.id as any })}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            (config.hairStyle || 'short') === style.id
                              ? 'bg-purple-500/20 border-purple-500 text-white shadow-md'
                              : 'bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">{style.icon}</span>
                          <span className="text-xs font-bold">{style.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-2 block">
                      Saç Rengi
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {HAIR_COLORS.map(c => (
                        <button
                          key={c.color}
                          onClick={() => handleUpdate({ hairColor: c.color })}
                          title={c.name}
                          className="w-10 h-10 rounded-xl relative flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md border border-white/10"
                          style={{ backgroundColor: c.color }}
                        >
                          {config.hairColor === c.color && (
                            <Check size={16} className="text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* LAMP PANEL */}
              {activeTab === 'lamp' && (
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-2 block">
                    Masa Lambası Işığı & Camı
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {LAMP_COLORS.map(lamp => (
                      <button
                        key={lamp.id}
                        onClick={() => handleUpdate({ lampColor: lamp.id })}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          (config.lampColor || 'green') === lamp.id
                            ? 'bg-white/[0.08] border-white/30 text-white shadow-lg'
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg mt-0.5"
                          style={{ backgroundColor: `${lamp.hex}33`, color: lamp.hex, border: `1px solid ${lamp.hex}66` }}
                        >
                          <Lightbulb size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{lamp.name}</span>
                            {(config.lampColor || 'green') === lamp.id && (
                              <Check size={14} className="text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{lamp.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PET PANEL */}
              {activeTab === 'pet' && (
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-2 block">
                    Masaüstü Sevimli Dostun (Sessiz Kütüphane Yoldaşı)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {PET_OPTIONS.map(pet => (
                      <button
                        key={pet.id}
                        onClick={() => handleUpdate({ petType: pet.id })}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          (config.petType || 'none') === pet.id
                            ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg'
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{pet.emoji}</span>
                          {(config.petType || 'none') === pet.id && (
                            <Check size={14} className="text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{pet.name}</div>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{pet.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* HEADPHONES PANEL */}
              {activeTab === 'headphones' && (
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-2 block">
                    Kulaklık Rengi
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HEADPHONE_COLORS.map(c => (
                      <button
                        key={c.color}
                        onClick={() => handleUpdate({ headphonesColor: c.color })}
                        title={c.name}
                        className="w-10 h-10 rounded-xl relative flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md border border-white/10"
                        style={{ backgroundColor: c.color }}
                      >
                        {config.headphonesColor === c.color && (
                          <Check size={16} className={`${c.color === '#ffffff' ? 'text-black' : 'text-white'} drop-shadow-md stroke-[3]`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Sıfırla</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Save size={14} />
                <span>Kaydet & Masaya Uygula</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
