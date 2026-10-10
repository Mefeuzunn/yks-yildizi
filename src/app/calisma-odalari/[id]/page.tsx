"use client";

import React, { useEffect, useState, useRef, use, useCallback } from 'react';
import { 
  ArrowLeft, Users, MessageSquare, Send, Timer, Pause, Play, 
  RotateCcw, X, Volume2, VolumeX, CloudRain, Headphones, Waves, 
  Sparkles, Radio, Shield, Coffee, CheckCircle2, BookOpen, Lamp, Eye,
  Maximize2, Minimize2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { haptics } from '@/lib/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import LibraryStudyHall from '@/components/library/LibraryStudyHall';
import InviteFriendsModal from '@/components/library/InviteFriendsModal';
import NeuroAcousticStudioModal from '@/components/library/NeuroAcousticStudioModal';
import { libraryAudio } from '@/lib/library-audio';

export default function LiveStudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'users'>('chat');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNeuroStudio, setShowNeuroStudio] = useState(false);
  const [focusToast, setFocusToast] = useState<string | null>(null);
  const [completedSessionModal, setCompletedSessionModal] = useState<{
    minutes: number;
    xpGained: number;
    subject: string;
    roomName: string;
  } | null>(null);

  // Focus Time Tracking Refs (exact seconds focused without drift)
  const accumulatedFocusSecondsRef = useRef<number>(0);
  const userSubjectRef = useRef<string>('AYT Matematik');
  
  // Virtual Library Seating & Stage
  const [viewMode, setViewMode] = useState<'library' | 'clock'>('library');
  const [mySeatId, setMySeatId] = useState<string | null>(null);
  const [userSubject, setUserSubject] = useState<string>('AYT Matematik');
  const [avatarConfig, setAvatarConfig] = useState<any>(null);
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    haptics.impact('medium');
    const nextState = !isZenMode;
    setIsZenMode(nextState);
    if (typeof document !== 'undefined') {
      if (nextState) {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (typeof document !== 'undefined' && !document.fullscreenElement && isZenMode) {
        setIsZenMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isZenMode]);

  useEffect(() => {
    userSubjectRef.current = userSubject;
  }, [userSubject]);
  
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('yks_ambient_sound', type);
        } catch (_) {}
      }
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('yks_ambient_volume', String(ambientVolume));
      } catch (_) {}
    }
  }, [ambientVolume]);

  // Restore saved ambient volume and sound on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('yks_ambient_volume');
        if (savedVol) {
          const v = parseFloat(savedVol);
          if (!isNaN(v) && v >= 0.05 && v <= 1) {
            setAmbientVolume(v);
          }
        }
        const savedSound = localStorage.getItem('yks_ambient_sound');
        if (savedSound && ['rain', 'lofi', 'waves'].includes(savedSound)) {
          playAmbientSound(savedSound as any);
        }
      } catch (_) {}
    }
  }, [playAmbientSound]);

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
          const me = data.participants.find((p: any) => p.id === user?.id);
          if (me?.seatId) setMySeatId(me.seatId);
          if (me?.subject) setUserSubject(me.subject);
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
          const me = payload.data.find((p: any) => p.id === user?.id);
          if (me?.seatId) setMySeatId(me.seatId);
        } else if (payload.type === 'library-interaction' && payload.data) {
          if (payload.data.receiverId === user?.id) {
            haptics.notification('success');
            if (payload.data.actionType === 'coffee') libraryAudio.playCoffee();
            else if (payload.data.actionType === 'energy') libraryAudio.playEnergy();
            else if (payload.data.actionType === 'wave') libraryAudio.playWave();
            else if (payload.data.actionType === 'fire') libraryAudio.playFire();
            else if (payload.data.actionType === 'brain') libraryAudio.playBrain();
            else if (payload.data.actionType === 'star') libraryAudio.playStar();
          }
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

  // Load saved avatar wardrobe config from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yks_library_avatar_config');
        if (saved) {
          setAvatarConfig(JSON.parse(saved));
        }
      } catch (_) {}
    }
  }, []);

  // Save Focus Session to DB (/api/user/focus) & Update Daily Study Time
  const saveFocusSession = useCallback(async (durationMinutes: number, showModal = false) => {
    if (durationMinutes < 1) return;
    accumulatedFocusSecondsRef.current = 0;

    try {
      const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`;
      const res = await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          subject: userSubjectRef.current || 'Genel Çalışma',
          topic: roomMeta.name,
          taskName: `${roomMeta.name} - Sanal Kütüphane`,
          mode: 'pomodoro',
          durationMin: durationMinutes,
          questionsSolved: 0,
          completedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        haptics.notification('success');
        if (showModal) {
          setCompletedSessionModal({
            minutes: durationMinutes,
            xpGained: 25,
            subject: userSubjectRef.current || 'Genel Çalışma',
            roomName: roomMeta.name,
          });
        } else {
          setFocusToast(`🎯 Harika! ${durationMinutes} dk odaklanma süren ve +25 XP günlük sürene eklendi!`);
          setTimeout(() => setFocusToast(null), 4500);
        }
      }
    } catch (err) {
      console.warn('Failed to save room focus session:', err);
    }
  }, [roomMeta.name]);

  // Live Focus Heartbeat Sync with Teacher & Live Presence Dashboard
  useEffect(() => {
    if (!user) return;
    let isAlive = true;

    const sendLiveHeartbeat = (action = 'heartbeat') => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetch('/api/user/focus/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          subject: userSubjectRef.current || 'Genel Çalışma',
          topic: roomMeta.name,
          mode: 'pomodoro',
          status: timerActive ? 'focusing' : (mySeatId ? 'break' : 'paused'),
          durationMin: Math.max(1, Math.round(initialTime / 60)),
          timeLeftSec: timeLeft,
        }),
      }).catch(() => {});
    };

    // Send heartbeat immediately if seated or timer is running
    if (mySeatId || timerActive) {
      sendLiveHeartbeat('heartbeat');
    }

    const liveInterval = setInterval(() => {
      if (isAlive && (mySeatId || timerActive)) {
        sendLiveHeartbeat('heartbeat');
      }
    }, 45000);

    return () => {
      isAlive = false;
      clearInterval(liveInterval);
    };
  }, [user, mySeatId, timerActive, roomMeta.name, initialTime, timeLeft]);

  // BeforeUnload & Unmount Persistence: Save any remaining focused minutes and stop live session
  useEffect(() => {
    const handleBeforeUnload = () => {
      const seconds = accumulatedFocusSecondsRef.current;
      const mins = Math.floor(seconds / 60);
      if (mins >= 1) {
        const body = JSON.stringify({
          id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`,
          subject: userSubjectRef.current || 'Genel Çalışma',
          topic: roomMeta.name,
          taskName: `${roomMeta.name} - Sanal Kütüphane`,
          mode: 'pomodoro',
          durationMin: mins,
          questionsSolved: 0,
          completedAt: new Date().toISOString(),
        });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/user/focus', new Blob([body], { type: 'application/json' }));
        }
      }
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/user/focus/live', new Blob([JSON.stringify({ action: 'stop' })], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [roomMeta.name]);

  // Timer Tick & Focus Seconds Tracking
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        accumulatedFocusSecondsRef.current += 1;
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            haptics.notification('success');
            libraryAudio.playChime();
            fetch(`/api/rooms/${id}/timer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ timerState: 'finished', timeLeft: 0 }),
            }).catch(() => {});
            if (mySeatId) {
              fetch(`/api/rooms/${id}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sit', seatId: mySeatId, status: 'break' }),
              }).catch(() => {});
            }
            // Save completed focus session!
            const completedMins = Math.max(1, Math.round(initialTime / 60));
            saveFocusSession(completedMins, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!timerActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, id, mySeatId, initialTime, saveFocusSession]);

  const toggleTimer = () => {
    haptics.impact('light');
    const newState = !timerActive;
    setTimerActive(newState);

    if (mySeatId) {
      fetch(`/api/rooms/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sit',
          seatId: mySeatId,
          status: newState ? 'focusing' : 'break',
        }),
      }).catch(() => {});
    }

    fetch(`/api/rooms/${id}/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timerState: newState ? 'active' : 'paused', timeLeft }),
    }).catch(() => {});
  };

  const handleSeatChange = async (newSeatId: string | null) => {
    setMySeatId(newSeatId);

    const isSittingDown = Boolean(newSeatId);
    let nextTimerActive = timerActive;

    if (isSittingDown) {
      // Start focusing immediately upon sitting down!
      if (!timerActive) {
        nextTimerActive = true;
        setTimerActive(true);
        libraryAudio.playChime();
        fetch(`/api/rooms/${id}/timer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timerState: 'active', timeLeft }),
        }).catch(() => {});
      }
      const seatName = newSeatId ? newSeatId.replace('t', 'Masa ').replace('-s', ' / Koltuk ') : '';
      setFocusToast(`Masaya oturdun (${seatName}). Odaklanma seansın başladı! 🎯`);
      setTimeout(() => setFocusToast(null), 3500);
    } else {
      // User stood up: pause focus timer
      if (timerActive) {
        nextTimerActive = false;
        setTimerActive(false);
        fetch(`/api/rooms/${id}/timer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timerState: 'paused', timeLeft }),
        }).catch(() => {});
      }

      // Save accumulated focus time to daily stats if >= 1 minute
      const secondsSpent = accumulatedFocusSecondsRef.current;
      const mins = Math.floor(secondsSpent / 60);
      if (mins >= 1) {
        saveFocusSession(mins, false);
      } else {
        setFocusToast('Masadan kalktın. Odaklanma seansın duraklatıldı.');
        setTimeout(() => setFocusToast(null), 3000);
        accumulatedFocusSecondsRef.current = 0;
      }
    }

    // Instant Optimistic Update
    if (user) {
      setParticipants(prev => {
        const others = prev.filter(p => p.id !== user.id);
        return [
          ...others,
          {
            id: user.id,
            username: user.username,
            target: user.hedef || 'YKS 2026',
            league: user.league || 'Elmas',
            seatId: newSeatId,
            subject: userSubject,
            avatarConfig: avatarConfig,
            status: nextTimerActive ? 'focusing' : 'break',
            focusMinutes: 25,
          },
        ];
      });
    }

    try {
      const res = await fetch(`/api/rooms/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: newSeatId ? 'sit' : 'stand',
          seatId: newSeatId,
          currentSubject: userSubject,
          avatarConfig: avatarConfig,
          userId: user?.id,
          status: nextTimerActive ? 'focusing' : 'break',
        }),
      });
      const data = await res.json();
      if (data.participants) {
        setParticipants(data.participants);
      }
    } catch (_) {}
  };

  const handleUpdateAvatarConfig = async (newConfig: any) => {
    setAvatarConfig(newConfig);
    if (user) {
      setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, avatarConfig: newConfig } : p));
    }
    if (mySeatId) {
      try {
        const res = await fetch(`/api/rooms/${id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sit',
            seatId: mySeatId,
            currentSubject: userSubject,
            avatarConfig: newConfig,
            userId: user?.id,
            status: timerActive ? 'focusing' : 'break',
          }),
        });
        const data = await res.json();
        if (data.participants) {
          setParticipants(data.participants);
        }
      } catch (_) {}
    }
  };

  const handleSubjectChange = async (newSubject: string) => {
    setUserSubject(newSubject);
    if (user) {
      setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, subject: newSubject } : p));
    }
    if (mySeatId) {
      try {
        await fetch(`/api/rooms/${id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sit',
            seatId: mySeatId,
            currentSubject: newSubject,
            avatarConfig: avatarConfig,
            userId: user?.id,
            status: timerActive ? 'focusing' : 'break',
          }),
        });
      } catch (_) {}
    }
  };

  const handleSendInteraction = async (
    receiverId: string, 
    actionType: 'coffee' | 'wave' | 'energy' | 'fire' | 'brain' | 'star'
  ) => {
    try {
      await fetch(`/api/rooms/${id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, actionType }),
      });
    } catch (_) {}
  };

  const resetTimer = (newDuration?: number) => {
    haptics.selection();
    const duration = newDuration || initialTime;
    const secondsSpent = accumulatedFocusSecondsRef.current;
    const mins = Math.floor(secondsSpent / 60);
    if (mins >= 1) {
      saveFocusSession(mins, false);
    } else {
      accumulatedFocusSecondsRef.current = 0;
    }
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
    <div className={`flex overflow-hidden relative bg-[#080c14] ${
      isZenMode 
        ? 'fixed inset-0 z-50 h-screen w-screen' 
        : 'h-[calc(100dvh-70px)] sm:h-[calc(100vh-80px)]'
    }`}>
      {/* Floating Zen Mode Exit Button */}
      {isZenMode && (
        <button
          onClick={toggleZenMode}
          className="fixed top-4 right-4 z-50 px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-black text-amber-300 hover:text-white border border-amber-500/40 text-xs font-black shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Minimize2 size={13} />
          <span>Zen Modundan Çık</span>
        </button>
      )}

      {/* ── Left Stage: Atmospheric Screen & Pomodoro Timer ── */}
      <div className="flex-1 flex flex-col p-2.5 sm:p-5 lg:p-7 overflow-y-auto pb-32 lg:pb-8 custom-scrollbar relative z-10">
        {/* Floating Focus Status Toast */}
        <AnimatePresence>
          {focusToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 rounded-2xl bg-black/90 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-extrabold shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{focusToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Navigation & Status Bar */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <Link 
            href="/calisma-odalari" 
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold transition-all no-underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Odalara Dön</span>
            <span className="sm:hidden">Odalar</span>
          </Link>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('library')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'library'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              <span className="hidden sm:inline">Kütüphane Salonu</span>
              <span className="sm:hidden">Salon</span>
            </button>
            <button
              onClick={() => setViewMode('clock')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'clock'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Timer size={13} />
              <span className="hidden sm:inline">Büyük Sayaç</span>
              <span className="sm:hidden">Sayaç</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Invite Button */}
            <button
              onClick={() => {
                haptics.impact('light');
                setShowInviteModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/15 hover:from-emerald-500/30 hover:to-teal-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-extrabold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Arkadaşını odaya davet et"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Arkadaşını Davet Et</span>
              <span className="sm:hidden">Davet Et</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{participants.length} <span className="hidden min-[480px]:inline">Öğrenci Salonda</span><span className="min-[480px]:hidden">Odakta</span></span>
            </div>

            {/* Zen Fullscreen Focus Mode Button */}
            <button
              onClick={toggleZenMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                isZenMode
                  ? 'bg-amber-500 text-black font-extrabold shadow-amber-500/25'
                  : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30'
              }`}
              title={isZenMode ? 'Zen Modundan Çık' : 'Tam Ekran Zen Odak Modu'}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isZenMode ? 'Zen Moddan Çık' : 'Zen Odak'}</span>
            </button>
          </div>
        </div>

        {/* ── CONDITIONAL VIEW: VIRTUAL LIBRARY STAGE OR CLOCK ── */}
        {viewMode === 'library' ? (
          <div className="flex flex-col gap-6 w-full">
            {/* Virtual Library Study Hall Component */}
            <LibraryStudyHall
              roomId={id}
              roomName={roomMeta.name}
              roomTheme={roomMeta.theme}
              participants={participants}
              currentUserId={user?.id}
              currentUsername={user?.username}
              currentUserTarget={user?.hedef || 'YKS 2026'}
              userSubject={userSubject}
              onSubjectChange={handleSubjectChange}
              onSeatChange={handleSeatChange}
              mySeatId={mySeatId}
              onSendInteraction={handleSendInteraction}
              timerActive={timerActive}
              timeLeftFormatted={formatTime(timeLeft)}
              avatarConfig={avatarConfig}
              onUpdateAvatarConfig={handleUpdateAvatarConfig}
              onOpenInvite={() => setShowInviteModal(true)}
              onOpenNeuroStudio={() => setShowNeuroStudio(true)}
            />

            {/* ── Compact Docked Focus Bar & Ambience Controls ── */}
            <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0f172a]/90 border border-white/10 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 max-w-5xl mx-auto w-full">
              
              {/* Digital Timer Readout & Controls */}
              <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap justify-center">
                <div className="text-2xl min-[380px]:text-3xl sm:text-4xl font-black text-white font-mono tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTimer}
                    className={`w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                      timerActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold hover:brightness-110'
                    }`}
                    title={timerActive ? 'Durdur' : 'Başlat'}
                  >
                    {timerActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => resetTimer()}
                    className="w-9 h-9 min-[380px]:w-10 min-[380px]:h-10 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                    title="Sıfırla"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {[
                    { label: '25 dk', sec: 25 * 60 },
                    { label: '45 dk', sec: 45 * 60 },
                    { label: '5 dk', sec: 5 * 60 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => resetTimer(preset.sec)}
                      className={`px-2 min-[380px]:px-2.5 py-1 rounded-lg text-[10px] min-[380px]:text-xs font-bold border transition-all cursor-pointer ${
                        initialTime === preset.sec && !timerActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-gray-400 hover:text-white border-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ambient Sound Bar */}
              <div className="flex items-center gap-2 flex-wrap justify-center w-full md:w-auto">
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-0.5 sm:pb-0 custom-scrollbar">
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
                        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{snd.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    haptics.impact('light');
                    setShowNeuroStudio(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/15 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0"
                  title="40Hz Gama & 10Hz Alfa Beyin Dalgaları ve Ses Mikseri"
                >
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  <span>40Hz Gama & Mikser</span>
                </button>

                {ambientSound !== 'none' && (
                  <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={e => setAmbientVolume(parseFloat(e.target.value))}
                      className="w-14 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <span className="text-[10px] text-gray-400 font-mono">%{Math.round(ambientVolume * 100)}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* ── CLOCK VIEW (Large Digital Focus Clock) ── */
          <div className="flex flex-col gap-8 w-full max-w-lg mx-auto">
            {/* Ambient Sound Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
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

                <button
                  onClick={() => {
                    haptics.impact('light');
                    setShowNeuroStudio(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/15 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                  title="40Hz Gama & 10Hz Alfa Beyin Dalgaları ve Ses Mikseri"
                >
                  <Headphones className="w-3.5 h-3.5 text-indigo-400" />
                  <span>40Hz Gama Stüdyo</span>
                </button>
              </div>

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

            {/* Pomodoro Focus Clock */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#0f1523]/85 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center w-full overflow-hidden">
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

              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden mb-8 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>

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
        )}
      </div>

      {/* ── Right Panel: Chat & Participants (Desktop Sidebar) ── */}
      <div className={`${isZenMode ? '!hidden' : 'hidden lg:flex'} w-84 bg-[#0b0f19] border-l border-white/10 flex-col h-full relative z-20`}>
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
      {!isZenMode && (
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
      )}

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
            <form onSubmit={sendMessage} className="p-3 bg-black/60 border-t border-white/10 flex gap-2 pb-[calc(14px+env(safe-area-inset-bottom,10px))]">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-base sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-indigo-600 text-white w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Friend Invitation Modal ── */}
      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        roomName={roomMeta.name}
        roomId={id}
        participantCount={participants.length}
      />

      {/* ── Session Complete Celebration Modal ── */}
      <AnimatePresence>
        {completedSessionModal && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setCompletedSessionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#0f172a] border border-emerald-500/30 shadow-[0_20px_60px_rgba(16,185,129,0.25)] text-center relative overflow-hidden"
            >
              {/* Top ambient glow accent */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto mb-4 flex items-center justify-center text-black shadow-lg">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-1">
                Tebrikler! Odak Seansı Tamamlandı 🎉
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-5">
                <strong className="text-emerald-400 font-extrabold">{completedSessionModal.minutes} dakikalık</strong> çalışma süren başarıyla günlük istatistiklerine kaydedildi.
              </p>

              {/* Reward Badges */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center">
                  <span className="text-[11px] text-gray-400 font-semibold mb-0.5">Kazanılan XP</span>
                  <span className="text-lg font-black text-amber-300">+{completedSessionModal.xpGained} XP</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center">
                  <span className="text-[11px] text-gray-400 font-semibold mb-0.5">Lig Puanı</span>
                  <span className="text-lg font-black text-emerald-400">+25 LP</span>
                </div>
              </div>

              {/* Subject & Room Badge */}
              <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 mb-6 flex items-center justify-between">
                <span className="text-gray-400">Çalışılan Ders:</span>
                <span className="font-bold text-emerald-300">{completedSessionModal.subject}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    setCompletedSessionModal(null);
                    resetTimer(5 * 60); // 5 min break
                    setTimerActive(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Coffee size={15} />
                  <span>☕ 5 dk Mola</span>
                </button>
                <button
                  onClick={() => {
                    setCompletedSessionModal(null);
                    resetTimer(25 * 60);
                    setTimerActive(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black text-xs sm:text-sm font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Play size={15} className="fill-current" />
                  <span>⚡ Yeni Seans</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Neuro-Acoustic Studio Modal (40Hz & Multi-Track Mixer) ── */}
      <NeuroAcousticStudioModal
        isOpen={showNeuroStudio}
        onClose={() => setShowNeuroStudio(false)}
      />
    </div>
  );
}
