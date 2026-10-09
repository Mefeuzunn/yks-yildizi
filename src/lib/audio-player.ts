'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioPlayOptions {
  speed?: number; // 0.8, 1.0, 1.25, 1.5
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeAudioElement: HTMLAudioElement | null = null;
let activeStopCallback: (() => void) | null = null;

/**
 * Normalizes text to be spoken smoothly in Turkish, converting math symbols
 * and formulas to human-like words.
 */
export function cleanTurkishTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 bölü $2')
    .replace(/\\int_?\{?([^}]*)\}?\^?\{?([^}]*)\}?/g, 'integral')
    .replace(/\\sum/g, 'toplam sembolü')
    .replace(/\\lim/g, 'limit')
    .replace(/\\sqrt\{([^}]+)\}/g, 'karekök $1')
    .replace(/\^2/g, ' kare')
    .replace(/\^3/g, ' küp')
    .replace(/\^\{([^}]+)\}/g, ' üssü $1')
    .replace(/\\cdot|\\times/g, ' çarpı ')
    .replace(/\\pm/g, ' artı eksi ')
    .replace(/\\approx/g, ' yaklaşık olarak ')
    .replace(/\\neq/g, ' eşit değildir ')
    .replace(/\\le|\\leq/g, ' küçük eşittir ')
    .replace(/\\ge|\\geq/g, ' büyük eşittir ')
    .replace(/\\infty/g, ' sonsuz ')
    .replace(/\\alpha/g, ' alfa ')
    .replace(/\\beta/g, ' beta ')
    .replace(/\\theta/g, ' teta ')
    .replace(/\\pi/g, ' pi sayısı ')
    .replace(/\\Delta/g, ' delta ')
    .replace(/\\lambda/g, ' lamda ')
    .replace(/\$+/g, ' ')
    .replace(/\[\.\.\.\]/g, 'boşluk')
    .replace(/[*#`_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Stops any currently active audio, whether from server API or browser SpeechSynthesis.
 */
export function stopNaturalAudio(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch (_) {}
    activeAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  if (activeStopCallback) {
    activeStopCallback();
    activeStopCallback = null;
  }
}

/**
 * Finds the most natural, human-sounding Turkish voice installed in the browser.
 */
function getBestNaturalTurkishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const trVoices = voices.filter(v => v.lang.startsWith('tr') || v.lang.includes('TR'));

  if (trVoices.length === 0) return null;

  // Priority ranking for natural neural voices
  const preferredNames = [
    'Google Türkçe',
    'Google Turkish',
    'Microsoft Ahmet Online (Natural) - Turkish (Turkey)',
    'Microsoft Emel Online (Natural) - Turkish (Turkey)',
    'Microsoft Ahmet',
    'Microsoft Emel',
    'Yelda',
    'Cem',
    'Siri',
  ];

  for (const preferred of preferredNames) {
    const found = trVoices.find(v => v.name.toLowerCase().includes(preferred.toLowerCase()));
    if (found) return found;
  }

  // Fallback to any Turkish voice with "natural" or "online" in its name
  const naturalFallback = trVoices.find(v => 
    v.name.toLowerCase().includes('natural') || 
    v.name.toLowerCase().includes('online') ||
    v.name.toLowerCase().includes('enhanced')
  );
  if (naturalFallback) return naturalFallback;

  return trVoices[0] || null;
}

/**
 * Client-side fallback using SpeechSynthesis with prioritized neural voice.
 */
function playSpeechSynthesisFallback(text: string, options?: AudioPlayOptions): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onError?.(new Error('Konuşma sentezleyici desteklenmiyor'));
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanTurkishTextForSpeech(text));
    utterance.lang = 'tr-TR';
    utterance.rate = (options?.speed || 1.0) * 0.95;
    utterance.pitch = 1.0;

    const bestVoice = getBestNaturalTurkishVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
      activeStopCallback = null;
    };

    utterance.onerror = (e) => {
      // Don't report error if canceled intentionally
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        options?.onError?.(e);
      }
      activeStopCallback = null;
    };

    window.speechSynthesis.speak(utterance);

    const stopFn = () => {
      window.speechSynthesis.cancel();
      options?.onEnd?.();
    };
    activeStopCallback = stopFn;
    return stopFn;
  } catch (err) {
    options?.onError?.(err);
    return () => {};
  }
}

/**
 * Plays human-grade natural Turkish audio for the given text.
 * Primary: /api/tts endpoint (Google Neural Voice MP3 stream)
 * Fallback: High-grade browser SpeechSynthesis voice.
 */
export async function playNaturalAudio(
  text: string,
  options?: AudioPlayOptions
): Promise<() => void> {
  stopNaturalAudio();

  const cleaned = cleanTurkishTextForSpeech(text);
  if (!cleaned) {
    options?.onEnd?.();
    return () => {};
  }

  // If text is short or normal, attempt the Neural API route
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleaned)}`;
    const audio = new Audio();
    activeAudioElement = audio;

    audio.playbackRate = options?.speed || 1.0;

    const stopFn = () => {
      if (activeAudioElement === audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        activeAudioElement = null;
      }
      options?.onEnd?.();
    };
    activeStopCallback = stopFn;

    audio.onplay = () => {
      options?.onStart?.();
    };

    audio.onended = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      activeStopCallback = null;
      options?.onEnd?.();
    };

    audio.onerror = () => {
      // If server streaming fails, automatically fall back to browser natural voice
      console.warn('Neural TTS API failed, falling back to client synthesis');
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      playSpeechSynthesisFallback(cleaned, options);
    };

    audio.src = audioUrl;
    await audio.play();

    return stopFn;
  } catch (err) {
    // Autoplay policy or network error -> fallback
    console.warn('Audio play error, falling back:', err);
    return playSpeechSynthesisFallback(cleaned, options);
  }
}

/**
 * React Hook for seamless natural voice playback in flashcards and tutor tabs.
 */
export function useNaturalAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopNaturalAudio();
    };
  }, []);

  const stop = useCallback(() => {
    stopNaturalAudio();
    setIsPlaying(false);
    setCurrentText(null);
  }, []);

  const play = useCallback(
    async (text: string, customSpeed?: number) => {
      stop();
      setCurrentText(text);
      setIsPlaying(true);

      const effectiveSpeed = customSpeed || speed;

      const stopFn = await playNaturalAudio(text, {
        speed: effectiveSpeed,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentText(null);
        },
        onError: () => {
          setIsPlaying(false);
          setCurrentText(null);
        },
      });

      stopRef.current = stopFn;
    },
    [speed, stop]
  );

  const toggle = useCallback(
    (text: string) => {
      if (isPlaying && currentText === text) {
        stop();
      } else {
        play(text);
      }
    },
    [isPlaying, currentText, play, stop]
  );

  return {
    isPlaying,
    currentText,
    speed,
    setSpeed,
    play,
    stop,
    toggle,
  };
}
