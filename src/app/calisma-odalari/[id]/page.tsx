"use client";

import React, { useEffect, useState, useRef, use, useCallback } from 'react';
import { 
  ArrowLeft, Users, MessageSquare, Send, Timer, Pause, Play, 
  RotateCcw, X, Volume2, VolumeX, CloudRain, Headphones, Waves, 
  Sparkles, Radio, Shield, Coffee, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { haptics } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveStudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'users'>('chat');
  
  const chatRef = useRef<HTMLDivElement>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);

  // Pomodoro State
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Web Audio Synthesized Ambience Player (0 token, 0 network overhead)
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi' | 'waves'>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const soundNodesRef = useRef<any[]>([]);

  // Room metadata based on id
  const getRoomMeta = (roomId: string) => {
    switch (roomId) {
      case 'room-1':
        return { name: 'Sessiz Kütüphane', theme: 'library', color: '#10b981', gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent' };
      case 'room-2':
        return { name: 'Lofi Chill Cafe', theme: 'lofi', color: '#8b5cf6', gradient: 'from-purple-500/20 via-purple-500/5 to-transparent' };
      case 'room-3':
        return { name: 'Gece & Yağmur', theme: 'rain', color: '#0ea5e9', gradient: 'from-sky-500/20 via-sky-500/5 to-transparent' };
      case 'room-4':
        return { name: 'Sayısalcılar Zirvesi', theme: 'tech', color: '#f59e0b', gradient: 'from-amber-500/20 via-amber-500/5 to-transparent' };
      default:
        return { name: 'Çalışma Odası', theme: 'general', color: '#6366f1', gradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent' };
    }
  };

  const roomMeta = getRoomMeta(id);

  // Web Audio Ambience Engine
  const stopAmbientSound = useCallback(() => {
    soundNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (_) {}
    });
    soundNodesRef.current = [];
  }, []);

  const playAmbientSound = useCallback((type: 'none' | 'rain' | 'lofi' | 'waves') => {
    stopAmbientSound();
    if (type === 'none') {
      setAmbientSound('none');
      return;
    }

    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(ambientVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Pink / Brown Noise Buffer generator
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      if (type === 'rain') {
        // Rain: gentle lowpass filtered noise
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        soundNodesRef.current = [noiseSource, filter, masterGain];
      } else if (type === 'lofi') {
        // Lofi Cafe vinyl warmth: warm bandpass noise + low hum
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55, ctx.currentTime);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.04, ctx.currentTime);
        subOsc.connect(subGain);
        subGain.connect(masterGain);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        subOsc.start();
        soundNodesRef.current = [noiseSource, filter, subOsc, subGain, masterGain];
      } else if (type === 'waves') {
        // Ocean Waves: modulated lowpass
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // 8-second wave period
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(250, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        lfo.start();
        soundNodesRef.current = [noiseSource, filter, lfo, lfoGain, masterGain];
      }

      setAmbientSound(type);
    } catch (e) {
      console.warn('Web Audio ambience failed:', e);
      setAmbientSound('none');
    }
  }, [ambientVolume, stopAmbientSound]);

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [stopAmbientSound]);

  // Initialize Realtime SSE & Room Presence
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // 1. Join room
    fetch(`/api/rooms/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join' }),
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.participants) {
          setParticipants(data.participants);
        }
      })
      .catch(() => {});

    // 2. Fetch initial messages
    fetch(`/api/rooms/${id}/chat`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    // 3. Connect to Server-Sent Events (SSE)
    const eventSource = new EventSource(`/api/rooms/${id}/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'new-message' && payload.data) {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.data.id)) return prev;
            return [...prev, payload.data];
          });
        } else if (payload.type === 'room-users' && Array.isArray(payload.data)) {
          setParticipants(payload.data);
        } else if (payload.type === 'update-timer' && payload.data) {
          if (payload.data.timerState === 'active') {
            setTimerActive(true);
            setTimeLeft(payload.data.timeLeft);
          } else if (payload.data.timerState === 'paused') {
            setTimerActive(false);
            setTimeLeft(payload.data.timeLeft);
          } else if (payload.data.timerState === 'finished') {
            setTimerActive(false);
            setTimeLeft(0);
          }
        }
      } catch (_) {}
    };

    // 4. Presence Heartbeat (Battery Optimized: relaxed interval and paused when hidden)
    const pingInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch(`/api/rooms/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping' }),
      })
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.participants) {
            setParticipants(data.participants);
          }
        })
        .catch(() => {});
    }, 40000);

    return () => {
      isMounted = false;
      clearInterval(pingInterval);
      eventSource.close();

      fetch(`/api/rooms/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [user, id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    if (mobileChatRef.current) {
      mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
    }
  }, [messages, showMobileDrawer, activeSideTab]);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            haptics.notification('success');
            fetch(`/api/rooms/${id}/timer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ timerState: 'finished', timeLeft: 0 }),
            }).catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!timerActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, id]);

  const toggleTimer = () => {
    haptics.impact('light');
    const newState = !timerActive;
    setTimerActive(newState);
    fetch(`/api/rooms/${id}/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timerState: newState ? 'active' : 'paused', timeLeft }),
    }).catch(() => {});
  };

  const resetTimer = (newDuration?: number) => {
    haptics.selection();
    const duration = newDuration || initialTime;
    setInitialTime(duration);
    setTimerActive(false);
    setTimeLeft(duration);
    fetch(`/api/rooms/${id}/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timerState: 'paused', timeLeft: duration }),
    }).catch(() => {});
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    haptics.impact('light');
    const textToSend = newMessage.trim();
    setNewMessage('');

    const tempId = Date.now().toString();
    const optimisticMsg = {
      id: tempId,
      sender: user.username,
      text: textToSend,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/rooms/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => prev.map(m => m.id === tempId ? data.message : m));
      }
    } catch (_) {}
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = Math.min(100, Math.max(0, Math.round(((initialTime - timeLeft) / initialTime) * 100)));

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Oda bağlantısı kuruluyor...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden relative bg-[#080c14]">
      {/* ── Left Stage: Atmospheric Screen & Pomodoro Timer ── */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto pb-32 lg:pb-8 custom-scrollbar relative z-10">
        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link 
            href="/calisma-odalari" 
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Odalara Dön</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{participants.length} Öğrenci Odakta</span>
            </div>
          </div>
        </div>

        {/* ── Atmosphere Visual Hero Card ── */}
        <div className="relative w-full aspect-[21/9] min-h-[180px] max-h-[280px] rounded-3xl mb-8 overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-8 bg-[#0b0f19]">
          {/* Subtle Ambient Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${roomMeta.gradient} pointer-events-none`} />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          {/* Top Stage Badges */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-xs font-bold text-gray-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>CANLI ÇALIŞMA AMBİYANSI</span>
            </div>

            {ambientSound !== 'none' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="capitalize">{ambientSound} Çalıyor</span>
              </div>
            )}
          </div>

          {/* Bottom Stage Title */}
          <div className="relative z-10">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {roomMeta.name}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
              Senin gibi hedefine kilitlenmiş öğrencilerle aynı anda masadasın. Dikkat dağıtıcıları kapat, odaklan.
            </p>
          </div>
        </div>

        {/* ── Ambient Sound Bar ── */}
        <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs sm:text-sm font-bold text-white">Ambiyans Sesi:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'none', label: 'Sessiz', icon: VolumeX },
              { id: 'rain', label: 'Yağmur', icon: CloudRain },
              { id: 'lofi', label: 'Lofi Cafe', icon: Coffee },
              { id: 'waves', label: 'Dalgalar', icon: Waves },
            ].map(snd => {
              const Icon = snd.icon;
              const isCurrent = ambientSound === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => playAmbientSound(snd.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{snd.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2 min-w-[120px]">
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                title="Ses Düzeyi"
              />
              <span className="text-[11px] text-gray-400 font-mono">%{Math.round(ambientVolume * 100)}</span>
            </div>
          )}
        </div>

        {/* ── Pomodoro Focus Clock ── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0f1523]/85 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center max-w-lg mx-auto w-full overflow-hidden">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
            {[
              { label: '25 dk (Klasik)', sec: 25 * 60 },
              { label: '45 dk (Derin)', sec: 45 * 60 },
              { label: '50 dk (Blok)', sec: 50 * 60 },
              { label: '5 dk (Mola)', sec: 5 * 60 },
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => resetTimer(preset.sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-[0.98] ${
                  initialTime === preset.sec && !timerActive
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-white/5 text-gray-400 hover:text-white border-white/5 hover:border-white/10'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Glowing Digital Digits */}
          <div className="relative mb-6">
            <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 font-mono tracking-tighter drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]">
              {formatTime(timeLeft)}
            </div>
            <div className="text-center mt-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                timerActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse' 
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                {timerActive ? '⚡ Odak Seansı Sürüyor' : '⏸️ Duraklatıldı'}
              </span>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-8 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${timerProgress}%` }}
            />
          </div>

          {/* Play/Pause & Reset Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] ${
                timerActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_4px_25px_rgba(99,102,241,0.4)] hover:brightness-110'
              }`}
              title={timerActive ? 'Durdur' : 'Başlat'}
            >
              {timerActive ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </button>

            <button
              onClick={() => resetTimer()}
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
              title="Sıfırla"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Chat & Participants (Desktop Sidebar) ── */}
      <div className="hidden lg:flex w-84 bg-[#0b0f19] border-l border-white/10 flex-col h-full relative z-20">
        {/* Tab Headers */}
        <div className="p-3 border-b border-white/10 bg-white/[0.015] flex gap-2">
          <button
            onClick={() => setActiveSideTab('chat')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSideTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Sohbet</span>
          </button>

          <button
            onClick={() => setActiveSideTab('users')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSideTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kişiler ({participants.length})</span>
          </button>
        </div>

        {/* Content Body */}
        {activeSideTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Scroll Area */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">
                  Henüz mesaj yok. İlk motivasyon mesajını sen yaz!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={msg.id || i} 
                    className={`flex flex-col max-w-[88%] ${
                      msg.isSystem 
                        ? 'mx-auto items-center' 
                        : (msg.sender === user?.username ? 'self-end items-end' : 'self-start items-start')
                    }`}
                  >
                    {msg.isSystem ? (
                      <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                        {msg.text}
                      </span>
                    ) : (
                      <>
                        {msg.sender !== user?.username && (
                          <span className="text-[10px] text-gray-400 mb-1 ml-1 font-semibold">{msg.sender}</span>
                        )}
                        <div className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          msg.sender === user?.username 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-xs shadow-md' 
                            : 'bg-white/[0.06] text-gray-200 border border-white/10 rounded-bl-xs'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-gray-500 mt-0.5 px-1 font-mono">
                          {msg.time || ''}
                        </span>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} className="p-3 bg-black/40 border-t border-white/10 flex gap-2">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Bir şeyler yaz..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white w-9 h-9 flex items-center justify-center rounded-xl disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* Participants List */
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar">
            {participants.map(p => (
              <div 
                key={p.id || p.username} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {p.username?.[0]?.toUpperCase() || 'Ö'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{p.username}</div>
                    <div className="text-[10px] text-gray-400">Canlı Odakta</div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  {p.league || 'Öğrenci'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile Floating Chat Button ── */}
      <button
        onClick={() => {
          haptics.selection();
          setShowMobileDrawer(true);
        }}
        className="lg:hidden fixed bottom-[calc(76px+env(safe-area-inset-bottom,20px))] left-4 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-full shadow-[0_8px_25px_rgba(99,102,241,0.5)] flex items-center gap-2 font-bold text-xs border border-white/20 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Sohbet & Kişiler</span>
        <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">
          {participants.length}
        </span>
      </button>

      {/* ── Mobile Bottom Sheet Drawer ── */}
      {showMobileDrawer && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-50 flex flex-col justify-end backdrop-blur-sm"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div 
            className="bg-[#0b0f19] rounded-t-3xl max-h-[82vh] h-[540px] flex flex-col shadow-2xl relative border-t border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag Handle & Close */}
            <div className="pt-3 pb-2 px-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">Oda Sohbeti & Katılımcılar</span>
              </div>
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Participants Horizontal Strip */}
            <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
              <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
                {participants.length} Odakta:
              </span>
              {participants.map(p => (
                <span key={p.id || p.username} className="inline-flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 text-xs text-gray-300 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{p.username}</span>
                </span>
              ))}
            </div>

            {/* Mobile Messages */}
            <div ref={mobileChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 custom-scrollbar">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id || i} 
                  className={`flex flex-col max-w-[85%] ${
                    msg.isSystem ? 'mx-auto items-center' : (msg.sender === user?.username ? 'self-end items-end' : 'self-start items-start')
                  }`}
                >
                  {msg.isSystem ? (
                    <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-full">{msg.text}</span>
                  ) : (
                    <>
                      {msg.sender !== user?.username && <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.sender}</span>}
                      <div className={`px-3 py-2 rounded-2xl text-xs ${
                        msg.sender === user?.username ? 'bg-indigo-600 text-white rounded-br-xs' : 'bg-white/10 text-gray-200 rounded-bl-xs'
                      }`}>
                        {msg.text}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Chat Input */}
            <form onSubmit={sendMessage} className="p-3 bg-black/60 border-t border-white/10 flex gap-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
