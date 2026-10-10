"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, X, Volume2, VolumeX, Sparkles, Brain, 
  RotateCcw, Sliders, Shield, Info, Check, Zap
} from 'lucide-react';
import { 
  neuroAudio, NEURO_TRACKS, NEURO_PRESETS, 
  NeuroTrackId 
} from '@/lib/neuro-audio';
import { haptics } from '@/lib/haptics';

interface NeuroAcousticStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NeuroAcousticStudioModal({
  isOpen,
  onClose,
}: NeuroAcousticStudioModalProps) {
  const [volumes, setVolumes] = useState<Record<NeuroTrackId, number>>({ ...neuroAudio.volumes });
  const [masterVolume, setMasterVolume] = useState<number>(neuroAudio.masterVolume);
  const [activePreset, setActivePreset] = useState<string | null>(neuroAudio.activePresetId);
  const [activeTab, setActiveTab] = useState<'presets' | 'mixer'>('presets');

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setVolumes({ ...neuroAudio.volumes });
      setMasterVolume(neuroAudio.masterVolume);
      setActivePreset(neuroAudio.activePresetId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetId: string) => {
    haptics.selection();
    neuroAudio.applyPreset(presetId);
    setVolumes({ ...neuroAudio.volumes });
    setActivePreset(presetId);
  };

  const handleTrackChange = (id: NeuroTrackId, val: number) => {
    neuroAudio.setTrackVolume(id, val);
    setVolumes(prev => ({ ...prev, [id]: val }));
    setActivePreset(null);
  };

  const handleMasterChange = (val: number) => {
    neuroAudio.setMasterVolume(val);
    setMasterVolume(val);
  };

  const handleMuteAll = () => {
    haptics.impact('light');
    neuroAudio.stopAll();
    setVolumes({ ...neuroAudio.volumes });
    setActivePreset('silent');
  };

  const hasAnyActive = Object.values(volumes).some(v => v > 0);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden relative"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ── Header Bar ── */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Nöro-Akustik Ses Stüdyosu</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  Binaural 40Hz
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Beyin dalgalarını ve doğa seslerini dilediğin gibi karıştırarak odaklan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation Tabs & Master Volume Bar ── */}
        <div className="px-4 sm:px-6 py-3 border-b border-white/5 bg-white/[0.015] flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Sub-tabs */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} />
              <span>Hazır Modlar</span>
            </button>
            <button
              onClick={() => setActiveTab('mixer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mixer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sliders size={13} />
              <span>Çok Kanallı Mikser</span>
            </button>
          </div>

          {/* Master Volume & Mute */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleMuteAll}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 cursor-pointer"
              title="Tüm sesleri kapat"
            >
              <VolumeX size={14} />
              <span className="hidden sm:inline">Sessiz</span>
            </button>

            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Volume2 size={14} className="text-indigo-400" />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={e => handleMasterChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                title="Ana Ses Düzeyi"
              />
              <span className="text-[11px] font-mono text-gray-300 min-w-[28px] text-right">
                %{Math.round(masterVolume * 100)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar relative z-10">
          {activeTab === 'presets' ? (
            /* ── PRESETS VIEW ── */
            <div className="flex flex-col gap-3">
              <div className="mb-1 text-xs text-gray-400 flex items-center gap-1.5">
                <Brain size={14} className="text-indigo-400" />
                <span>Tek dokunuşla bilimsel olarak optimize edilmiş odak frekanslarını seç:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NEURO_PRESETS.map(preset => {
                  const isSelected = activePreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{preset.emoji}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {preset.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                              {preset.tagline}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      {/* Active Tracks Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-white/5">
                        {Object.entries(preset.volumes)
                          .filter(([_, v]) => (v || 0) > 0)
                          .map(([trackId, vol]) => {
                            const track = NEURO_TRACKS.find(t => t.id === trackId);
                            if (!track) return null;
                            return (
                              <span
                                key={trackId}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/5 flex items-center gap-1 font-mono"
                              >
                                <span>{track.emoji}</span>
                                <span>{track.label.split(' ')[0]}</span>
                                <span className="text-indigo-400 font-bold">%{Math.round((vol || 0) * 100)}</span>
                              </span>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Headphone Recommendation Banner */}
              <div className="mt-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
                <Info size={18} className="shrink-0 text-indigo-400" />
                <span>
                  <strong>İpucu:</strong> 40 Hz ve 10 Hz binaural dalgalar kulaklık takıldığında sol ve sağ kulağa farklı frekanslar göndererek beynin odak merkezini senkronize eder.
                </span>
              </div>
            </div>
          ) : (
            /* ── MULTI-CHANNEL MIXER VIEW ── */
            <div className="flex flex-col gap-4">
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>Her bir ses katmanının düzeyini serbestçe ayarla:</span>
                <button
                  onClick={() => {
                    haptics.selection();
                    setActiveTab('presets');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  Modlara Dön
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {NEURO_TRACKS.map(track => {
                  const vol = volumes[track.id] || 0;
                  const isActive = vol > 0;
                  return (
                    <div
                      key={track.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        isActive
                          ? 'bg-indigo-500/10 border-indigo-500/35 shadow-sm'
                          : 'bg-white/[0.02] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{track.emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold text-white">{track.label}</span>
                              {track.frequencyLabel && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                                  {track.frequencyLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 line-clamp-1">{track.description}</span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-indigo-300 min-w-[32px] text-right">
                          %{Math.round(vol * 100)}
                        </span>
                      </div>

                      {/* Slider & Quick Toggle */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={vol}
                          onChange={e => handleTrackChange(track.id, parseFloat(e.target.value))}
                          className="flex-1 h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />

                        <button
                          onClick={() => handleTrackChange(track.id, isActive ? 0 : track.defaultVolume)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white/5 text-gray-400 hover:text-white'
                          }`}
                        >
                          {isActive ? 'Kapat' : 'Aç'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer Bar ── */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${hasAnyActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
            <span>{hasAnyActive ? 'Ambiyans Aktif Çalıyor' : 'Ambiyans Sessiz'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            Tamam
          </button>
        </div>
      </motion.div>
    </div>
  );
}
