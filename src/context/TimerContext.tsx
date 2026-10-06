'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  generateUUID,
  enqueueOfflineFocusSession,
  setupOfflineFocusSync,
  OfflineFocusSession,
} from '@/lib/offline-focus';
import { showLocalNotification } from '@/lib/client-notifications';

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
  setVolume: (v: number) => void;
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
  const [durations, setDurations] = useState<Record<Mode, number>>({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [totalSec, setTotalSec] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // Sound State
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Wall-Clock Target End Time (Milliseconds epoch) - guarantees 100% precision across lock screens and browser throttling
  const targetEndTimeRef = useRef<number | null>(null);

  // Synchronous Refs to always have fresh values inside event handlers
  const modeRef = useRef(mode);
  const durationsRef = useRef(durations);
  const selectedSubjectRef = useRef(selectedSubject);
  const selectedTopicRef = useRef(selectedTopic);
  const timeLeftRef = useRef(timeLeft);
  const totalSecRef = useRef(totalSec);
  const isRunningRef = useRef(isRunning);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { durationsRef.current = durations; }, [durations]);
  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { selectedTopicRef.current = selectedTopic; }, [selectedTopic]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { totalSecRef.current = totalSec; }, [totalSec]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Live Timer Notification Updater (Service Worker notification shade & Native MediaSession lock screen)
  const updateLiveTimerNotification = useCallback((
    remainingSec: number,
    totalSeconds: number,
    currentMode: Mode,
    subject: string | null
  ) => {
    if (typeof window === 'undefined') return;

    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    const modeEmoji = currentMode === 'pomodoro' ? '🍅' : currentMode === 'shortBreak' ? '☕' : '🌴';
    const modeLabel = currentMode === 'pomodoro' ? 'Odak' : currentMode === 'shortBreak' ? 'Kısa Mola' : 'Uzun Mola';
    const subj = subject || (currentMode === 'pomodoro' ? 'Genel Çalışma' : 'Dinlenme');

    // 1. Browser Tab Title
    document.title = `${modeEmoji} ${timeStr} · ${subj} | YKS Yıldızı`;

    // 2. Media Session API (Native iOS & Android Lock Screen Widget / Dynamic Island)
    // Bu yerel API, iOS APNs üzerinde push bildirimi spam'i yapmadan kilit ekranı ve bildirim merkezinde
    // temiz, tek bir canlı medya/zaman denetleyicisi sunar.
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `${modeEmoji} ${timeStr} · ${subj}`,
          artist: `YKS Yıldızı ${modeLabel} Modu`,
          album: `Hedef: ${Math.round(totalSeconds / 60)} Dakika`,
          artwork: [
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setPositionState?.({
          duration: Math.max(1, totalSeconds),
          playbackRate: 1,
          position: Math.min(totalSeconds, Math.max(0, totalSeconds - remainingSec)),
        });
      } catch (_) {}
    }
  }, []);

  const clearLiveTimerNotification = useCallback(() => {
    if (typeof window === 'undefined') return;

    document.title = 'YKS Yıldızı - Hayallerindeki Üniversiteye Adım Adım';

    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch (_) {}
    }

    if ('serviceWorker' in navigator) {
      const payload = {
        type: 'CLEAR_TIMER_NOTIFICATION',
        tag: 'yks-live-timer',
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(payload);
      } else {
        navigator.serviceWorker.ready.then((reg) => {
          reg.active?.postMessage(payload);
        }).catch(() => {});
      }
    }
  }, []);

  const switchMode = useCallback((m: Mode) => {
    setMode(m);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    const secs = (durationsRef.current[m] || MODE_CONFIG[m].minutes) * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
    clearLiveTimerNotification();
  }, [clearLiveTimerNotification]);

  const finishSession = useCallback(() => {
    const finishedMode = modeRef.current;
    setIsRunning(false);
    targetEndTimeRef.current = null;
    clearLiveTimerNotification();

    if (intervalRef.current) clearInterval(intervalRef.current);

    // Stop live focus heartbeat on backend
    fetch('/api/user/focus/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    }).catch(() => {});

    if (finishedMode === 'pomodoro') {
      const targetMin = durationsRef.current.pomodoro || 25;
      const targetSec = targetMin * 60;
      const elapsedSec = targetSec - timeLeftRef.current;

      // If elapsed is at least 2 minutes and less than target - 30s, use elapsed.
      // Otherwise default to targetMin so user gets credit for their set goal!
      let finalDurationMin = targetMin;
      if (elapsedSec >= 120 && elapsedSec < targetSec - 30) {
        finalDurationMin = Math.max(1, Math.round(elapsedSec / 60));
      }

      setPomodoroCount((c) => c + 1);

      // Trigger celebration confetti
      if (typeof window !== 'undefined') {
        import('canvas-confetti').then((m) => m.default({ particleCount: 110, spread: 70, origin: { y: 0.6 } })).catch(() => {});
      }

      // 🔔 Sound chime + Push notification + Haptic
      showLocalNotification('Tebrikler! Odak Süresi Tamamlandı 🎯', {
        body: `${finalDurationMin} dakikalık odak oturumunu başarıyla bitirdin! Şimdi hak ettiğin dinlendirici molaya geçebilirsin.`,
        chime: 'focus-complete',
        url: '/dashboard?tab=focus',
        tag: 'pomodoro-complete',
        actions: [
          { action: 'mola', title: '☕ Molaya Başla' },
        ],
      });

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
      // 🔔 Mola bitti bildirimi ve canlı çan sesi
      showLocalNotification('Mola Bitti! ⏰', {
        body: 'Mola süresi tamamlandı. Zihnin tazelendi, yeni bir odak oturumuna hazırsın!',
        chime: 'break-complete',
        url: '/dashboard?tab=focus',
        tag: 'break-complete',
        actions: [
          { action: 'odak', title: '🚀 Odaklanmaya Başla' },
        ],
      });
      switchMode('pomodoro');
    }
  }, [clearLiveTimerNotification, switchMode]);

  // Load from LocalStorage on mount with wall-clock compensation
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
        if (parsed.totalSec !== undefined) setTotalSec(parsed.totalSec);

        // Wall-clock check: If it was running with targetEndTime
        if (parsed.isRunning && parsed.targetEndTime) {
          const now = Date.now();
          const remainingSec = Math.round((parsed.targetEndTime - now) / 1000);

          if (remainingSec <= 0) {
            // Completed while away / closed!
            setTimeLeft(0);
            setIsRunning(false);
            targetEndTimeRef.current = null;
            setTimeout(() => {
              finishSession();
            }, 300);
          } else {
            // Still active - restore remaining exact seconds
            setTimeLeft(remainingSec);
            setIsRunning(true);
            targetEndTimeRef.current = parsed.targetEndTime;
          }
        } else if (parsed.timeLeft !== undefined) {
          setTimeLeft(parsed.timeLeft);
          setIsRunning(false);
          targetEndTimeRef.current = null;
        }
      }
    } catch (e) {
      console.error('Timer hydration error:', e);
    }
    setIsHydrated(true);

    // Kilit ekranında önceden birikmiş eski/takılı kalmış sayaç bildirimlerini temizle
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.getNotifications?.().then((notifications) => {
          notifications.forEach((n) => {
            if (n.tag === 'yks-live-timer' || (n.title && (n.title.includes('Odak') || n.title.includes('🍅')))) {
              n.close();
            }
          });
        }).catch(() => {});
      }).catch(() => {});
    }
  }, [finishSession]);

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
      targetEndTime: isRunning ? targetEndTimeRef.current : null,
      lastTick: isRunning ? Date.now() : null,
    };
    localStorage.setItem('yks_timer_state', JSON.stringify(stateToSave));
  }, [durations, mode, pomodoroCount, selectedSubject, selectedTopic, timeLeft, totalSec, isRunning, pendingSession, isHydrated]);

  // Screen WakeLock API: keeps screen on while actively focusing on desk
  useEffect(() => {
    if (isRunning && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      (navigator as any).wakeLock?.request('screen').then((lock: any) => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isRunning]);

  // MediaSession Action Handlers (controls from native lock screen)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        setIsRunning(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsRunning(false);
        targetEndTimeRef.current = null;
        clearLiveTimerNotification();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        setIsRunning(false);
        targetEndTimeRef.current = null;
        setTimeLeft(totalSecRef.current);
        clearLiveTimerNotification();
      });
    } catch (_) {}
  }, [clearLiveTimerNotification]);

  // Service Worker message listener for navigation requests
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TAB' && event.data?.tab) {
        window.dispatchEvent(new CustomEvent('yks:navigate-tab', { detail: event.data.tab }));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
  }, []);

  // Wall-Clock Interval Timer Engine: computes difference to targetEndTime so background throttling never loses time
  useEffect(() => {
    if (isRunning) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + timeLeftRef.current * 1000;
      }

      // Immediate notification update on start
      updateLiveTimerNotification(
        timeLeftRef.current,
        totalSecRef.current,
        modeRef.current,
        selectedSubjectRef.current
      );

      intervalRef.current = setInterval(() => {
        if (!targetEndTimeRef.current) {
          targetEndTimeRef.current = Date.now() + timeLeftRef.current * 1000;
        }

        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          targetEndTimeRef.current = null;
          setIsRunning(false);
          setTimeLeft(0);
          finishSession();
        } else {
          setTimeLeft(remaining);
          // Update live notification shade: throttled every 5 seconds or when <= 15s
          if (remaining % 5 === 0 || remaining <= 15) {
            updateLiveTimerNotification(
              remaining,
              totalSecRef.current,
              modeRef.current,
              selectedSubjectRef.current
            );
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, finishSession, updateLiveTimerNotification]);

  // VisibilityChange and Window Focus listener: instantly recalculates exact seconds upon unlocking screen
  useEffect(() => {
    const handleWakeOrFocus = () => {
      if (document.visibilityState === 'visible' && isRunningRef.current && targetEndTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));

        if (remaining <= 0) {
          targetEndTimeRef.current = null;
          setIsRunning(false);
          setTimeLeft(0);
          finishSession();
        } else {
          setTimeLeft(remaining);
          updateLiveTimerNotification(
            remaining,
            totalSecRef.current,
            modeRef.current,
            selectedSubjectRef.current
          );
        }
      }
    };

    document.addEventListener('visibilitychange', handleWakeOrFocus);
    window.addEventListener('focus', handleWakeOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleWakeOrFocus);
      window.removeEventListener('focus', handleWakeOrFocus);
    };
  }, [finishSession, updateLiveTimerNotification]);

  // Auto-sync offline focus queue when device reconnects or timer mounts
  useEffect(() => {
    const cleanup = setupOfflineFocusSync();
    return cleanup;
  }, []);

  // Live Focus Heartbeat to Supabase / Backend for Teachers
  useEffect(() => {
    if (!isHydrated) return;

    let currentStatus: 'focusing' | 'paused' | 'break' | 'break_paused' | null = null;
    const currentMode = mode;
    let currentSubject = selectedSubject || 'Genel Çalışma';
    let currentTopic = selectedTopic || '';
    const currentDuration = durations[mode] || 25;

    if (mode === 'pomodoro') {
      if (isRunning) {
        currentStatus = 'focusing';
      } else {
        if (timeLeft < totalSec) {
          currentStatus = 'paused';
        } else {
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
        body: JSON.stringify({ action: 'stop' }),
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
          timeLeftSec: timeLeftRef.current,
        }),
      }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, isRunning ? 20000 : 35000);

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, mode, selectedSubject, selectedTopic, durations, isHydrated]);

  // Before unload cleanup
  useEffect(() => {
    const handleBeforeUnload = () => {
      navigator.sendBeacon?.('/api/user/focus/live', JSON.stringify({ action: 'stop' }));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const toggle = () => {
    setIsRunning((prev) => {
      const next = !prev;
      if (next) {
        targetEndTimeRef.current = Date.now() + timeLeftRef.current * 1000;
        updateLiveTimerNotification(
          timeLeftRef.current,
          totalSecRef.current,
          modeRef.current,
          selectedSubjectRef.current
        );
      } else {
        targetEndTimeRef.current = null;
        clearLiveTimerNotification();
      }
      return next;
    });
  };

  const reset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    setTimeLeft(totalSec);
    clearLiveTimerNotification();
    fetch('/api/user/focus/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    }).catch(() => {});
  };

  const skip = useCallback(() => {
    if (modeRef.current === 'pomodoro') {
      const targetSec = (durationsRef.current.pomodoro || 25) * 60;
      const elapsedSec = targetSec - timeLeftRef.current;
      if (elapsedSec >= 60) {
        finishSession();
        return;
      }
    }
    setIsRunning(false);
    targetEndTimeRef.current = null;
    clearLiveTimerNotification();
    const next: Mode = modeRef.current === 'pomodoro'
      ? ((pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak')
      : 'pomodoro';
    switchMode(next);
  }, [finishSession, pomodoroCount, switchMode, clearLiveTimerNotification]);

  const saveSettings = (d: Record<Mode, number>) => {
    setDurations(d);
    const secs = d[mode] * 60;
    setTotalSec(secs);
    setTimeLeft(secs);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    clearLiveTimerNotification();
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
    
    const finalDuration = (customDurationMin !== undefined && customDurationMin > 0)
      ? Math.round(customDurationMin)
      : (pendingSession.durationMin || 25);

    const sessionId = generateUUID();
    const completedAt = new Date().toISOString();

    const sessionPayload: OfflineFocusSession = {
      id: sessionId,
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
      completedAt,
      createdAt: completedAt,
    };

    // If browser is offline, directly enqueue without waiting for network timeout
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueOfflineFocusSession(sessionPayload);
      setPendingSession(null);
      return;
    }

    try {
      const res = await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload),
      });

      if (!res.ok) {
        enqueueOfflineFocusSession(sessionPayload);
      }
    } catch (e: any) {
      console.warn('Network drop during focus save, enqueued offline:', e);
      enqueueOfflineFocusSession(sessionPayload);
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
      playSound, stopSound, setVolume, finishSession, saveSession, dismissSession,
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
