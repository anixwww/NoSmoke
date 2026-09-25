// Web Audio API Synthesizer and Presets for Gravity Orbit Physics Simulator

export interface OrbitPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ORBIT_PRESETS: OrbitPreset[] = [
  {
    id: 'solar',
    name: 'Сонячна гармонія',
    description: 'Три стабільні орбіти з мелодійним резонансом 1:2:4',
    icon: '🪐'
  },
  {
    id: 'figure8',
    name: 'Вісімка Ейлера',
    description: 'Рівновага трьох тіл у формі нескінченності ♾️',
    icon: '♾️'
  },
  {
    id: 'rosette',
    name: 'Квітка Гравітації',
    description: 'Еліптична прецесія, що малює сакральну спірограму',
    icon: '🌸'
  },
  {
    id: 'binary',
    name: 'Подвійне Сяйво',
    description: 'Два гравітаційні центри з орбітами між ними',
    icon: '✨'
  }
];

export const ORBIT_MINDFULNESS_QUOTES = [
  'Спостерігайте за рухом орбіт — як думки, що плавно обертаються і знаходять рівновагу.',
  'Кожна стабільна орбіта народжується з балансу швидкості та притягання.',
  'Тяга до куріння розсіюється у нескінченному просторі вашої творчості.',
  'Гравітація спокою сильніша за будь-який імпульс.',
  'Творіть гармонію: музика сфер заспокоює дихання та повертає контроль.',
  'У фізиці спокою кожен рух має свій природний цикл.'
];

// Pentatonic scale frequencies for resonant chimes (F4, G4, Bb4, C5, D5, F5, G5)
const HARMONIC_PENTATONIC = [349.23, 392.0, 466.16, 523.25, 587.33, 698.46, 783.99];

class CelestialAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public init() {
    this.initCtx();
  }

  /**
   * Whisper-soft crystal chime when a celestial body passes periapsis or crosses resonance rings
   */
  playResonanceChime(harmonicIndex: number = 0) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = HARMONIC_PENTATONIC[harmonicIndex % HARMONIC_PENTATONIC.length];

      // Soft lowpass filter to prevent harsh highs
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Gentle attack and velvety decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {}
  }

  /**
   * Transmuting craving dust into pure stardust
   */
  playTransmuteSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.025, now + idx * 0.05 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.85);
      });
    } catch {}
  }

  /**
   * Slingshot launch impulse
   */
  playLaunchImpulse() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  /**
   * Harmonious orbit stabilization chord
   */
  playHarmonicStabilize() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = [261.63, 329.63, 392.0, 523.25]; // C major

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.06 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 2.1);
      });
    } catch {}
  }
}

export const celestialAudio = new CelestialAudioSynthesizer();
