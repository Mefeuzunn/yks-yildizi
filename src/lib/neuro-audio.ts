/**
 * Web Audio Neuro-Acoustic Engine for YKS Yıldızı Virtual Study Rooms.
 * Synthesizes multi-track ambient soundscapes and scientifically validated
 * binaural focus frequencies (40Hz Gamma & 10Hz Alpha) with 0 network bandwidth.
 */

export type NeuroTrackId = 'rain' | 'brown' | 'lofi' | 'waves' | 'gamma' | 'alpha';

export interface NeuroTrackConfig {
  id: NeuroTrackId;
  label: string;
  category: 'ambient' | 'binaural';
  description: string;
  emoji: string;
  frequencyLabel?: string;
  defaultVolume: number;
}

export const NEURO_TRACKS: NeuroTrackConfig[] = [
  {
    id: 'gamma',
    label: '40 Hz Gama Dalgaları',
    category: 'binaural',
    description: 'Yüksek mantık, derin analitik düşünme ve zor matematik problemleri için gama frekansı.',
    emoji: '🧠',
    frequencyLabel: '40 Hz Binaural',
    defaultVolume: 0.35,
  },
  {
    id: 'alpha',
    label: '10 Hz Alfa Dalgaları',
    category: 'binaural',
    description: 'Hafıza, formül ezberi, sözel dersler ve sakin odaklanma akışı.',
    emoji: '🧘',
    frequencyLabel: '10 Hz Binaural',
    defaultVolume: 0.35,
  },
  {
    id: 'brown',
    label: 'Kahverengi Gürültü',
    category: 'ambient',
    description: 'ADHD, dikkat dağınıklığı ve iç sesleri bastıran derin, yatıştırıcı gürültü perdesi.',
    emoji: '🛡️',
    defaultVolume: 0.4,
  },
  {
    id: 'rain',
    label: 'Gece Yağmuru',
    category: 'ambient',
    description: 'Cama ve çatıya vuran dingin, sürekli yağmur damlaları.',
    emoji: '🌧️',
    defaultVolume: 0.45,
  },
  {
    id: 'lofi',
    label: 'Lofi Kafe & Şömine',
    category: 'ambient',
    description: 'Sıcak plak çıtırtısı, şömine odunu sıcaklığı ve huzurlu kafe aurası.',
    emoji: '☕',
    defaultVolume: 0.3,
  },
  {
    id: 'waves',
    label: 'Okyanus Dalgaları',
    category: 'ambient',
    description: 'Ritmik nefes alışverişine eşlik eden derin sahil dalgaları.',
    emoji: '🌊',
    defaultVolume: 0.35,
  },
];

export interface NeuroPreset {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  volumes: Partial<Record<NeuroTrackId, number>>;
}

export const NEURO_PRESETS: NeuroPreset[] = [
  {
    id: 'deep-math',
    name: 'Derin Matematik',
    emoji: '📐',
    tagline: '40Hz Gama + Yağmur ile maksimum problem çözme gücü',
    volumes: { gamma: 0.45, rain: 0.4, brown: 0.15, alpha: 0, lofi: 0, waves: 0 },
  },
  {
    id: 'memory-flow',
    name: 'Hafıza & Ezber Akışı',
    emoji: '📖',
    tagline: '10Hz Alfa + Dalgalar ile formül ve kavram ezberi',
    volumes: { alpha: 0.5, waves: 0.4, rain: 0, brown: 0, lofi: 0, gamma: 0 },
  },
  {
    id: 'adhd-shield',
    name: 'Dikkat Kalkanı',
    emoji: '🛡️',
    tagline: 'Kahverengi Gürültü + Yağmur ile dış sesleri tamamen izole et',
    volumes: { brown: 0.55, rain: 0.35, gamma: 0, alpha: 0, lofi: 0, waves: 0 },
  },
  {
    id: 'lofi-library',
    name: 'Gece Kütüphanesi',
    emoji: '🌙',
    tagline: 'Lofi sıcaklığı + 40Hz Gama ile sessiz gece çalışması',
    volumes: { lofi: 0.45, gamma: 0.25, rain: 0.2, alpha: 0, brown: 0, waves: 0 },
  },
  {
    id: 'silent',
    name: 'Tamamen Sessiz',
    emoji: '🤫',
    tagline: 'Tüm ambiyans seslerini kapat',
    volumes: { rain: 0, brown: 0, lofi: 0, waves: 0, gamma: 0, alpha: 0 },
  },
];

class NeuroAudioStudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGains: Map<NeuroTrackId, GainNode> = new Map();
  private trackNodes: Map<NeuroTrackId, any[]> = new Map();
  private noiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;

  public volumes: Record<NeuroTrackId, number> = {
    gamma: 0,
    alpha: 0,
    brown: 0,
    rain: 0,
    lofi: 0,
    waves: 0,
  };
  public masterVolume: number = 0.5;
  public activePresetId: string | null = null;

  constructor() {
    this.loadState();
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  // Pink Noise generator buffer (2 seconds loop)
  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
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
    this.noiseBuffer = buffer;
    return buffer;
  }

  // Brown Noise buffer generator (deeper integration of white noise)
  private getBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.brownNoiseBuffer) return this.brownNoiseBuffer;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    this.brownNoiseBuffer = buffer;
    return buffer;
  }

  private startTrack(id: NeuroTrackId) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Check if already running
    if (this.trackNodes.has(id)) {
      this.updateTrackVolume(id);
      return;
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.volumes[id], now);
    gainNode.connect(this.masterGain);
    this.trackGains.set(id, gainNode);

    const nodes: any[] = [gainNode];

    if (id === 'rain') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.getPinkNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);
    } else if (id === 'brown') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.getBrownNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      nodes.push(noise, filter);
    } else if (id === 'lofi') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.getPinkNoiseBuffer(ctx);
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(580, now);
      bandpass.Q.setValueAtTime(1.1, now);

      // Low vinyl sub-bass tone
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(55, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.04, now);
      sub.connect(subGain);
      subGain.connect(gainNode);
      sub.start();

      noise.connect(bandpass);
      bandpass.connect(gainNode);
      noise.start();
      nodes.push(noise, bandpass, sub, subGain);
    } else if (id === 'waves') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.getPinkNoiseBuffer(ctx);
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);

      // Wave rhythm LFO (approx 8.5 seconds cycle)
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(260, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(gainNode);
      noise.start();
      lfo.start();
      nodes.push(noise, filter, lfo, lfoGain);
    } else if (id === 'gamma') {
      // 40 Hz Binaural Beat: Left = 200 Hz, Right = 240 Hz
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(240, now);

      const gainLeft = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.3, now);
      const gainRight = ctx.createGain();
      gainRight.gain.setValueAtTime(0.3, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0); // Left channel

      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1); // Right channel

      merger.connect(gainNode);

      oscLeft.start();
      oscRight.start();
      nodes.push(oscLeft, oscRight, gainLeft, gainRight, merger);
    } else if (id === 'alpha') {
      // 10 Hz Binaural Beat: Left = 200 Hz, Right = 210 Hz
      const merger = ctx.createChannelMerger(2);

      const oscLeft = ctx.createOscillator();
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, now);

      const oscRight = ctx.createOscillator();
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(210, now);

      const gainLeft = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.35, now);
      const gainRight = ctx.createGain();
      gainRight.gain.setValueAtTime(0.35, now);

      oscLeft.connect(gainLeft);
      gainLeft.connect(merger, 0, 0);

      oscRight.connect(gainRight);
      gainRight.connect(merger, 0, 1);

      merger.connect(gainNode);

      oscLeft.start();
      oscRight.start();
      nodes.push(oscLeft, oscRight, gainLeft, gainRight, merger);
    }

    this.trackNodes.set(id, nodes);
  }

  private stopTrack(id: NeuroTrackId) {
    const nodes = this.trackNodes.get(id);
    if (!nodes) return;
    nodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (_) {}
    });
    this.trackNodes.delete(id);
    this.trackGains.delete(id);
  }

  private updateTrackVolume(id: NeuroTrackId) {
    const gainNode = this.trackGains.get(id);
    if (gainNode && this.ctx) {
      gainNode.gain.setValueAtTime(this.volumes[id], this.ctx.currentTime);
    }
  }

  public setTrackVolume(id: NeuroTrackId, vol: number) {
    this.volumes[id] = Math.max(0, Math.min(1, vol));
    this.activePresetId = null;

    if (this.volumes[id] > 0) {
      if (!this.trackNodes.has(id)) {
        this.startTrack(id);
      } else {
        this.updateTrackVolume(id);
      }
    } else {
      this.stopTrack(id);
    }

    this.saveState();
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
    this.saveState();
  }

  public applyPreset(presetId: string) {
    const preset = NEURO_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.activePresetId = presetId;
    (Object.keys(this.volumes) as NeuroTrackId[]).forEach(trackId => {
      const vol = preset.volumes[trackId] ?? 0;
      this.volumes[trackId] = vol;
      if (vol > 0) {
        if (!this.trackNodes.has(trackId)) {
          this.startTrack(trackId);
        } else {
          this.updateTrackVolume(trackId);
        }
      } else {
        this.stopTrack(trackId);
      }
    });

    this.saveState();
  }

  public stopAll() {
    (Object.keys(this.volumes) as NeuroTrackId[]).forEach(id => {
      this.volumes[id] = 0;
      this.stopTrack(id);
    });
    this.activePresetId = 'silent';
    this.saveState();
  }

  public hasAnyActive(): boolean {
    return Object.values(this.volumes).some(v => v > 0);
  }

  private saveState() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('yks_neuro_volumes', JSON.stringify(this.volumes));
      localStorage.setItem('yks_neuro_master_volume', String(this.masterVolume));
      if (this.activePresetId) {
        localStorage.setItem('yks_neuro_preset', this.activePresetId);
      } else {
        localStorage.removeItem('yks_neuro_preset');
      }
    } catch (_) {}
  }

  private loadState() {
    if (typeof window === 'undefined') return;
    try {
      const savedVols = localStorage.getItem('yks_neuro_volumes');
      if (savedVols) {
        this.volumes = { ...this.volumes, ...JSON.parse(savedVols) };
      }
      const savedMaster = localStorage.getItem('yks_neuro_master_volume');
      if (savedMaster) {
        this.masterVolume = parseFloat(savedMaster) || 0.5;
      }
      this.activePresetId = localStorage.getItem('yks_neuro_preset') || null;
    } catch (_) {}
  }
}

export const neuroAudio = new NeuroAudioStudio();
