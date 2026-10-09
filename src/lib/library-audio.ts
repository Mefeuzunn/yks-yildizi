/**
 * Web Audio API synthesizer for virtual library ambient cues & sound effects.
 * Requires 0 external audio files/bandwidth, zero latency, pure client-side synthesis.
 */

class LibraryAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch (_) {
      return null;
    }
  }

  /**
   * Resonant library meditation brass bell chime (Pomodoro finished / session started)
   * Fundamental frequency D5 (587.33 Hz) + octave D6 (1174.66 Hz) with exponential decay
   */
  public playChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, now);
      masterGain.connect(ctx.destination);

      // Osc 1: Primary chime frequency
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(1, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      // Osc 2: High harmonic shimmer
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now); // D6
      gain2.gain.setValueAtTime(0.45, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      // Osc 3: Warm overtone
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(880.00, now); // A5
      gain3.gain.setValueAtTime(0.2, now);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc3.connect(gain3);
      gain3.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 3.3);
      osc2.stop(now + 2.1);
      osc3.stop(now + 1.6);
    } catch (_) {}
  }

  /**
   * Warm porcelain coffee cup clink sound when receiving coffee
   */
  public playCoffee() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, now);
      masterGain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (_) {}
  }

  /**
   * Cosmic focus energy celestial ascending arpeggio
   */
  public playEnergy() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.14, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.65);
      });
    } catch (_) {}
  }

  /**
   * Gentle soft wave greeting sound
   */
  public playWave() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.linearRampToValueAtTime(659.25, now + 0.18); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (_) {}
  }
}

export const libraryAudio = new LibraryAudioEngine();
