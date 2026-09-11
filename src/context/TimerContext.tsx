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
}

interface TimerContextValue {
  mode: Mode;
  timeLeft: number;
  totalSec: number;
  isRunning: boolean;
  pomodoroCount: number;
  selectedSubject: string | null;
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
  playSound: (id: string, url: string) => void;
  stopSound: () => void;
  setVolume: (v: number) => void;
  saveSession: (subject: string | null, topic: string | null, taskName: string | null) => Promise<void>;
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
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);

  // Sound State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs to always have current values inside setInterval callback
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);
  const selectedSubjectRef = useRef(selectedSubject);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { durationsRef.current = durations; }, [durations]);
  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);

  const handleSessionComplete = useCallback(() => {
    const finishedMode = modeRef.current;
    const finishedDuration = durationsRef.current[finishedMode] || MODE_CONFIG[finishedMode].minutes;

    if (finishedMode === 'pomodoro') {
      setPomodoroCount(c => c + 1);
      // Show confetti
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then(m => m.default({ particleCount: 100, spread: 70, origin: { y: 0.6 } })).catch(() => {});
      }
      // Set pending session — FocusTab will show the log modal
      setPendingSession({
        mode: finishedMode,
        durationMin: finishedDuration,
        prefilledSubject: selectedSubjectRef.current,
      });
    } else {
      // For breaks, auto-save without modal
      fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: null, topic: null, taskName: null, mode: finishedMode, durationMin: finishedDuration }),
      }).catch(() => {});
    }
  }, []);

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

  const switchMode = (m: Mode) => {
    setMode(m);
    setIsRunning(false);
    const secs = (durations[m] || MODE_CONFIG[m].minutes) * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
  };

  const toggle = () => setIsRunning(r => !r);
  const reset = () => { setIsRunning(false); setTimeLeft(totalSec); };
  const skip = () => {
    setIsRunning(false);
    handleSessionComplete();
    const next: Mode = mode === 'pomodoro'
      ? ((pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak')
      : 'pomodoro';
    switchMode(next);
  };

  const saveSettings = (d: Record<Mode, number>) => {
    setDurations(d);
    const secs = d[mode] * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
    setIsRunning(false);
  };

  // Called by FocusTab after user fills in subject+topic in the modal
  const saveSession = useCallback(async (subject: string | null, topic: string | null, taskName: string | null) => {
    if (!pendingSession) return;
    try {
      await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          taskName,
          mode: pendingSession.mode,
          durationMin: pendingSession.durationMin,
        }),
      });
    } catch (e) {}
    setPendingSession(null);
  }, [pendingSession]);

  const dismissSession = useCallback(() => {
    // Save without subject/topic and close modal
    if (pendingSession) {
      fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: null, topic: null, taskName: null, mode: pendingSession.mode, durationMin: pendingSession.durationMin }),
      }).catch(() => {});
    }
    setPendingSession(null);
  }, [pendingSession]);

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
      mode, timeLeft, totalSec, isRunning, pomodoroCount, selectedSubject, durations,
      activeSound, volume, pendingSession,
      toggle, reset, skip, switchMode, saveSettings, setSelectedSubject,
      playSound, stopSound, setVolume, saveSession, dismissSession
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
