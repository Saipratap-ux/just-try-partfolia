import type { AudioSettings } from '../types/portfolio';

const STORAGE_KEY = 'saipratap_audio_prefs_v1';

const DEFAULT_SETTINGS: AudioSettings = {
  musicPlaying: false, // Strictly OFF by default per PRD
  sfxEnabled: false, // Strictly OFF by default per PRD
  muted: false,
  volume: 0.45,
};

type Listener = (settings: AudioSettings) => void;

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private arpTimer: number | null = null;
  private settings: AudioSettings;
  private listeners = new Set<Listener>();
  private lastHoverAt = 0;

  constructor() {
    this.settings = this.loadPrefs();
  }

  private loadPrefs(): AudioSettings {
    if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        musicPlaying: false, // Always start paused until user clicks Play
        sfxEnabled: Boolean(parsed.sfxEnabled),
        muted: Boolean(parsed.muted),
        volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.45,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private savePrefs() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sfxEnabled: this.settings.sfxEnabled,
          muted: this.settings.muted,
          volume: this.settings.volume,
        }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }

  private notify() {
    const snapshot = { ...this.settings };
    this.listeners.forEach((cb) => cb(snapshot));
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener({ ...this.settings });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.syncGains();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private syncGains() {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const effectiveMaster = this.settings.muted ? 0 : this.settings.volume;
    this.masterGain.gain.setTargetAtTime(effectiveMaster, now, 0.06);
    this.musicGain.gain.setTargetAtTime(this.settings.musicPlaying ? 0.35 : 0, now, 0.25);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxEnabled ? 0.55 : 0, now, 0.04);
  }

  public async toggleMusic(): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const nextPlaying = !this.settings.musicPlaying;
    this.settings.musicPlaying = nextPlaying;

    if (nextPlaying) {
      if (this.settings.muted) {
        this.settings.muted = false;
      }
      // Enable subtle SFX when user opts into the audio experience for the first time
      if (!this.settings.sfxEnabled) {
        this.settings.sfxEnabled = true;
      }
      this.startAmbientPad(ctx);
      this.playStartupChime();
    } else {
      this.stopAmbientPad();
    }

    this.syncGains();
    this.savePrefs();
    this.notify();
  }

  public toggleSfx(): void {
    this.ensureContext();
    this.settings.sfxEnabled = !this.settings.sfxEnabled;
    if (this.settings.sfxEnabled && this.settings.muted) {
      this.settings.muted = false;
    }
    this.syncGains();
    this.savePrefs();
    this.notify();
    if (this.settings.sfxEnabled) {
      this.playClick();
    }
  }

  public toggleMute(): void {
    this.ensureContext();
    this.settings.muted = !this.settings.muted;
    this.syncGains();
    this.savePrefs();
    this.notify();
  }

  public setVolume(value: number): void {
    this.ensureContext();
    this.settings.volume = Math.min(1, Math.max(0, value));
    if (this.settings.volume > 0 && this.settings.muted) {
      this.settings.muted = false;
    }
    this.syncGains();
    this.savePrefs();
    this.notify();
  }

  private startAmbientPad(ctx: AudioContext) {
    this.stopAmbientPad();
    if (!this.musicGain) return;

    // Warm cosmic D-minor9 harmonic drone (D2, A2, E3, F3)
    const freqs = [73.42, 110.0, 164.81, 174.61];
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 440;
    filter.Q.value = 1.4;
    filter.connect(this.musicGain);

    // Slow breathing LFO modulating filter cutoff
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.lfoOsc = lfo;

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (idx - 1.5) * 4;
      oscGain.gain.value = idx === 0 ? 0.28 : 0.14;
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.droneOscs.push(osc);
    });

    // Gentle procedural cosmic bell notes every ~3.2s
    const bellScale = [293.66, 329.63, 349.23, 440.0, 523.25, 659.25];
    let step = 0;
    this.arpTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.settings.musicPlaying || this.settings.muted) return;
      const now = this.ctx.currentTime;
      const note = bellScale[(step * 2 + (step % 3)) % bellScale.length];
      step += 1;

      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.08, now + 0.12);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(env);
      env.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 2.9);
    }, 3200);
  }

  private stopAmbientPad() {
    if (this.arpTimer !== null) {
      clearInterval(this.arpTimer);
      this.arpTimer = null;
    }
    this.droneOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already stopped oscillators
      }
    });
    this.droneOscs = [];
    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch {
        // Ignore
      }
      this.lfoOsc = null;
    }
  }

  public playStartupChime() {
    if (this.settings.muted || (!this.settings.sfxEnabled && !this.settings.musicPlaying)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const notes = [293.66, 440.0, 587.33];
    notes.forEach((freq, i) => {
      const now = ctx.currentTime + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  public playClick() {
    if (this.settings.muted || !this.settings.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playHover() {
    if (this.settings.muted || !this.settings.sfxEnabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastHoverAt < 90) return;
    this.lastHoverAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.045);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playTransition() {
    if (this.settings.muted || !this.settings.sfxEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.16);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }
}

export const audioEngine = new CosmicAudioEngine();
