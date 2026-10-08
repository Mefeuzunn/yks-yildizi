'use client';

export interface OfflineFocusSession {
  id: string;
  subject: string | null;
  topic: string | null;
  taskName: string | null;
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  durationMin: number;
  questionsSolved: number;
  correctCount: number;
  wrongCount: number;
  emptyCount: number;
  netScore: number;
  completedAt: string; // ISO String
  createdAt: string;   // ISO String
  syncAttempts?: number;
}

const OFFLINE_QUEUE_KEY = 'yks_offline_focus_queue_v1';

// Safe UUID Generator for browser environments
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get all pending offline focus sessions
export function getOfflineFocusQueue(): OfflineFocusSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read offline focus queue:', err);
    return [];
  }
}

// Save queue back to localStorage
function saveOfflineFocusQueue(queue: OfflineFocusSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline focus queue:', err);
  }
}

// Add a completed session to the offline queue
export function enqueueOfflineFocusSession(session: OfflineFocusSession): void {
  const currentQueue = getOfflineFocusQueue();
  // Prevent duplicate insertion of the exact same session ID
  if (!currentQueue.some(item => item.id === session.id)) {
    currentQueue.push({
      ...session,
      syncAttempts: 0,
      createdAt: session.createdAt || new Date().toISOString(),
    });
    saveOfflineFocusQueue(currentQueue);
  }

  // Dispatch custom event to notify UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('yks-focus-offline-saved', {
        detail: {
          session,
          pendingCount: currentQueue.length,
          message: `${session.durationMin} dakikalık odaklanma oturumunuz cihazınıza güvenle kaydedildi.`,
        },
      })
    );
  }
}

// Remove a synced session from queue by ID
export function removeOfflineFocusSession(sessionId: string): void {
  const currentQueue = getOfflineFocusQueue();
  const filtered = currentQueue.filter(item => item.id !== sessionId);
  saveOfflineFocusQueue(filtered);
}

// Sync all pending offline sessions to backend
let isSyncInProgress = false;

export async function syncOfflineFocusQueue(): Promise<{
  syncedCount: number;
  failedCount: number;
  totalMinutes: number;
}> {
  if (typeof window === 'undefined') return { syncedCount: 0, failedCount: 0, totalMinutes: 0 };
  if (!navigator.onLine) return { syncedCount: 0, failedCount: 0, totalMinutes: 0 };
  if (isSyncInProgress) return { syncedCount: 0, failedCount: 0, totalMinutes: 0 };

  const queue = getOfflineFocusQueue();
  if (queue.length === 0) return { syncedCount: 0, failedCount: 0, totalMinutes: 0 };

  isSyncInProgress = true;
  let syncedCount = 0;
  let failedCount = 0;
  let totalMinutes = 0;

  for (const session of [...queue]) {
    try {
      const res = await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          subject: session.subject,
          topic: session.topic,
          taskName: session.taskName,
          mode: session.mode,
          durationMin: session.durationMin,
          questionsSolved: session.questionsSolved,
          correctCount: session.correctCount,
          wrongCount: session.wrongCount,
          emptyCount: session.emptyCount,
          netScore: session.netScore,
          completedAt: session.completedAt,
          isOfflineSync: true,
        }),
      });

      if (res.ok) {
        removeOfflineFocusSession(session.id);
        syncedCount++;
        totalMinutes += session.durationMin;
      } else {
        // Increment sync attempts
        session.syncAttempts = (session.syncAttempts || 0) + 1;
        failedCount++;
      }
    } catch (netErr) {
      console.warn(`Sync failed for session ${session.id}:`, netErr);
      failedCount++;
      break; // Stop further requests if network is down again
    }
  }

  isSyncInProgress = false;

  // If at least one session was successfully synced, notify the user
  if (syncedCount > 0 && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('yks-focus-synced', {
        detail: {
          syncedCount,
          totalMinutes,
          remainingCount: getOfflineFocusQueue().length,
        },
      })
    );
  }

  return { syncedCount, failedCount, totalMinutes };
}

// Global auto-sync listener setup
export function setupOfflineFocusSync(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    // Wait 1.5 seconds for network connection to stabilize
    setTimeout(() => {
      syncOfflineFocusQueue().catch(console.error);
    }, 1500);
  };

  // Check immediately on load if online and has pending queue
  if (navigator.onLine && getOfflineFocusQueue().length > 0) {
    handleOnline();
  }

  window.addEventListener('online', handleOnline);

  // Also check periodically when online every 90 seconds (pauses when hidden)
  const interval = setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (navigator.onLine && getOfflineFocusQueue().length > 0) {
      syncOfflineFocusQueue().catch(() => {});
    }
  }, 90000);

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(interval);
  };
}
