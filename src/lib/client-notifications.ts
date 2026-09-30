'use client';

import { triggerHaptic } from '@/lib/haptics';

export type ChimeType = 'focus-complete' | 'break-complete' | 'reminder' | 'success' | 'alert';

/**
 * Web Audio API synthesized chimes - 100% self-contained, no external audio files needed!
 * Works on Safari iOS, Chrome Android, macOS, Windows without CORS or loading delays.
 */
export function playMelodicChime(type: ChimeType = 'focus-complete') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'focus-complete') {
      // 🌟 Triumphant 3-chord major chime (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.85);
      });
    } else if (type === 'break-complete') {
      // ⏰ Energetic 2-tone chime to get back to work (G5 -> C6)
      const freqs = [783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0, now + idx * 0.16);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.16 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.75);
      });
    } else if (type === 'reminder') {
      // 🔔 Soft pleasant reminder bell (A5)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } else {
      // Alert / Success
      const freqs = [587.33, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    }
  } catch (e) {
    console.warn('Audio chime warning:', e);
  }
}

/**
 * Mobile-safe local notification trigger
 * Works across ServiceWorker, Notification API, and in-app fallback
 */
export async function showLocalNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    tag?: string;
    url?: string;
    chime?: ChimeType;
    actions?: { action: string; title: string }[];
  } = {}
) {
  // 1. Play synthesized chime if requested
  if (options.chime) {
    playMelodicChime(options.chime);
  }

  // 2. Trigger phone haptics
  triggerHaptic('success');

  // 3. Dispatch in-app toast event so user sees it right in the UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('yks:in-app-notification', {
        detail: {
          title,
          body: options.body || '',
          url: options.url || '/dashboard',
          timestamp: Date.now(),
        },
      })
    );
  }

  // 4. If Notification permission not granted, stop here
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // 5. Try Service Worker showNotification (Best on iOS PWA & Android)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body: options.body || '',
          icon: options.icon || '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: options.tag || 'yks-local',
          data: { url: options.url || '/dashboard' },
          actions: options.actions || [{ action: 'open', title: 'İncele' }],
        });
        return;
      }
    } catch (e) {
      console.warn('Service worker showNotification failed, trying fallback:', e);
    }
  }

  // 6. Desktop browser fallback: new Notification()
  try {
    new Notification(title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      tag: options.tag || 'yks-local',
    });
  } catch (e) {
    console.warn('new Notification failed (expected on some mobile browsers):', e);
  }
}
