"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export const MODE_CONFIG: Record<Mode, { label: string; color: string; glow: string; minutes: number }> = {
  pomodoro:   { label: 'Odak',      color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)', minutes: 25 },
  shortBreak: { label: 'Kısa Ara',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)', minutes: 5  },
  longBreak:  { label: 'Uzun Ara',  color: '#10b981', glow: 'rgba(16,185,129,0.35)', minutes: 15 },
};

export interface PendingSession {
  mode: Mode;
  durationMin: number;
  prefilledSubject: string | null;
  prefilledTopic?: string | null;
}

interface TimerContextValue {
  mode: Mode;
  timeLeft: number;
  totalSec: number;
  isRunning: boolean;
  pomodoroCount: number;
  selectedSubject: string | null;
  selectedTopic: string | null;
  durations: Record<Mode, number>;
  activeSound: string | null;
  volume: number;
  pendingSession: PendingSession | null;

  toggle: () => void;
  reset: () => void;
  skip: () => void;
  switchMode: (m: Mode) => void;
  saveSettings: (d: Record<Mode, number>) => void;
  setSelectedSubject: (s: string | null) => void;
  setSelectedTopic: (t: string | null) => void;
  playSound: (id: string, url: string) => void;
  stopSound: () => void;
  finishSession: () => void;
  saveSession: (
    subject: string | null, 
    topic: string | null, 
    taskName: string | null,
    testStats?: {
      questionsSolved?: number;
      correctCount?: number;
      wrongCount?: number;
      emptyCount?: number;
      netScore?: number;
    },
    customDurationMin?: number
  ) => Promise<void>;
  dismissSession: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [durations, setDurations] = useState<Record<Mode,number>>({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [totalSec, setTotalSec] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);


  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yks_timer_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.durations) setDurations(parsed.durations);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.pomodoroCount !== undefined) setPomodoroCount(parsed.pomodoroCount);
        if (parsed.selectedSubject !== undefined) setSelectedSubject(parsed.selectedSubject);
        if (parsed.selectedTopic !== undefined) setSelectedTopic(parsed.selectedTopic);
        if (parsed.pendingSession !== undefined) setPendingSession(parsed.pendingSession);
        
        if (parsed.timeLeft !== undefined && parsed.totalSec !== undefined) {
          // If it was running, adjust time based on how much time passed while away
          let adjustedTimeLeft = parsed.timeLeft;
          if (parsed.isRunning && parsed.lastTick) {
            const elapsed = Math.floor((Date.now() - parsed.lastTick) / 1000);
            adjustedTimeLeft = Math.max(1, parsed.timeLeft - elapsed);
          }
          setTimeLeft(adjustedTimeLeft);
          setTotalSec(parsed.totalSec);
          setIsRunning(parsed.isRunning && adjustedTimeLeft > 0);
        }
      }
    } catch (e) {
      console.error("Timer hydration error", e);
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    const stateToSave = {
      durations,
      mode,
      pomodoroCount,
      selectedSubject,
      selectedTopic,
      timeLeft,
      totalSec,
      isRunning,
      pendingSession,
      lastTick: isRunning ? Date.now() : null
    };
    localStorage.setItem('yks_timer_state', JSON.stringify(stateToSave));
  }, [durations, mode, pomodoroCount, selectedSubject, selectedTopic, timeLeft, totalSec, isRunning, pendingSession, isHydrated]);

  // Sound State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to always have current values inside callbacks
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);
  const selectedSubjectRef = useRef(selectedSubject);
  const selectedTopicRef = useRef(selectedTopic);
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { durationsRef.current = durations; }, [durations]);
  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { selectedTopicRef.current = selectedTopic; }, [selectedTopic]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // Live Focus Heartbeat to Supabase / Backend for Teachers
  useEffect(() => {
    if (!isHydrated) return;

    let currentStatus: 'focusing' | 'paused' | 'break' | 'break_paused' | null = null;
    let currentMode = mode;
    let currentSubject = selectedSubject || 'Genel Çalışma';
    let currentTopic = selectedTopic || '';
    let currentDuration = durations[mode] || 25;

    if (mode === 'pomodoro') {
      if (isRunning) {
        currentStatus = 'focusing';
      } else {
        // If not running, are we paused during an active session?
        if (timeLeft < totalSec) {
          currentStatus = 'paused';
        } else {
          // Timer is at the very beginning (not started yet)
          currentStatus = null;
        }
      }
    } else if (mode === 'shortBreak' || mode === 'longBreak') {
      currentStatus = isRunning ? 'break' : 'break_paused';
      currentSubject = mode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola';
      currentTopic = selectedSubject ? `${selectedSubject} Molası` : (mode === 'shortBreak' ? '5 Dk Dinlenme' : '15 Dk Dinlenme');
    }

    if (!currentStatus) {
      fetch('/api/user/focus/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      }).catch(() => {});
      return;
    }

    const sendHeartbeat = () => {
      fetch('/api/user/focus/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'heartbeat',
          status: currentStatus,
          mode: currentMode,
          subject: currentSubject,
          topic: currentTopic,
          durationMin: currentDuration,
          timeLeftSec: timeLeftRef.current
        })
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, isRunning ? 20000 : 35000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, mode, selectedSubject, selectedTopic, durations, timeLeft, totalSec, isHydrated]);

  // Before unload cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon?.('/api/user/focus/live', JSON.stringify({ action: 'stop' }));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setIsRunning(false);
    const secs = (durationsRef.current[m] || MODE_CONFIG[m].minutes) * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
  }, []);

  const finishSession = useCallback(() => {
    const finishedMode = modeRef.current;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Stop live focus heartbeat on backend
    fetch('/api/user/focus/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' })
    }).catch(() => {});

    if (finishedMode === 'pomodoro') {
      const targetMin = durationsRef.current.pomodoro || 25;
      const targetSec = targetMin * 60;
      const elapsedSec = targetSec - timeLeftRef.current;

      // If elapsed is at least 2 minutes and less than target - 30s, use elapsed.
      // Otherwise default to targetMin (e.g. 25, 45, etc.) so user gets credit for their set goal!
      let finalDurationMin = targetMin;
      if (elapsedSec >= 120 && elapsedSec < targetSec - 30) {
        finalDurationMin = Math.max(1, Math.round(elapsedSec / 60));
      }

      setPomodoroCount(c => c + 1);

      // Trigger celebration confetti
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(m => m.default({ particleCount: 110, spread: 70, origin: { y: 0.6 } })).catch(() => {});
      }

      // Reset timer back to targetSec for next focus
      setTimeLeft(targetSec);

      // Open the Lesson & Topic selection modal!
      setPendingSession({
        mode: 'pomodoro',
        durationMin: finalDurationMin,
        prefilledSubject: selectedSubjectRef.current || null,
        prefilledTopic: selectedTopicRef.current || null,
      });
    } else {
      // Molalar ASLA odak süresine eklenmez ve kaydedilmez.
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Mola Bitti! ⏰', { body: 'Mola süresi tamamlandı. Yeni bir odak oturumuna başlayabilirsin.' });
      }
      switchMode('pomodoro');
    }
  }, [switchMode]);

  const handleSessionComplete = useCallback(() => {
    finishSession();
  }, [finishSession]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, handleSessionComplete]);

  const toggle = () => setIsRunning(r => !r);
  const reset = () => { 
    setIsRunning(false); 
    setTimeLeft(totalSec); 
    fetch('/api/user/focus/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' })
    }).catch(() => {});
  };

  const skip = useCallback(() => {
    if (modeRef.current === 'pomodoro') {
      const targetSec = (durationsRef.current.pomodoro || 25) * 60;
      const elapsedSec = targetSec - timeLeftRef.current;
      // If student has focused for at least 60 seconds, treat skipping as finishing & saving!
      if (elapsedSec >= 60) {
        finishSession();
        return;
      }
    }
    setIsRunning(false);
    const next: Mode = modeRef.current === 'pomodoro'
      ? ((pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak')
      : 'pomodoro';
    switchMode(next);
  }, [finishSession, pomodoroCount, switchMode]);

  const saveSettings = (d: Record<Mode, number>) => {
    setDurations(d);
    const secs = d[mode] * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  };

  // Called by FocusTab after user fills in subject+topic in the modal
  const saveSession = useCallback(async (
    subject: string | null, 
    topic: string | null, 
    taskName: string | null,
    testStats?: {
      questionsSolved?: number;
      correctCount?: number;
      wrongCount?: number;
      emptyCount?: number;
      netScore?: number;
    },
    customDurationMin?: number
  ) => {
    if (!pendingSession) return;
    try {
      const finalDuration = (customDurationMin !== undefined && customDurationMin > 0)
        ? Math.round(customDurationMin)
        : (pendingSession.durationMin || 25);

      const res = await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          taskName,
          mode: pendingSession.mode,
          durationMin: finalDuration,
          questionsSolved: testStats?.questionsSolved || 0,
          correctCount: testStats?.correctCount || 0,
          wrongCount: testStats?.wrongCount || 0,
          emptyCount: testStats?.emptyCount || 0,
          netScore: testStats?.netScore || 0,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Focus session save warning:', data.error);
      }
    } catch (e: any) {
      console.error('Kayıt edilemedi:', e);
    }
    setPendingSession(null);
  }, [pendingSession]);

  const dismissSession = useCallback(() => {
    setPendingSession(null);
  }, []);

  const playSound = useCallback((id: string, url: string) => {
    if (activeSound === id) {
      if (audioRef.current) audioRef.current.pause();
      setActiveSound(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audio.play().catch(console.error);
    audioRef.current = audio;
    setActiveSound(id);
  }, [activeSound, volume]);

  const stopSound = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setActiveSound(null);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return (
    <TimerContext.Provider value={{
      mode, timeLeft, totalSec, isRunning, pomodoroCount, selectedSubject, selectedTopic, durations,
      activeSound, volume, pendingSession,
      toggle, reset, skip, switchMode, saveSettings, setSelectedSubject, setSelectedTopic,
      playSound, stopSound, setVolume, finishSession, saveSession, dismissSession
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within TimerProvider');
  return context;
}
