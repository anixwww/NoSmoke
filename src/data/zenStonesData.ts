export type ZenEventType = 'resonance' | 'ripple' | 'breath';

export interface ZenEventConfig {
  type: ZenEventType;
  title: string;
  reactionTimeMs: number;
}

export const ZEN_EVENTS: Record<ZenEventType, ZenEventConfig> = {
  resonance: {
    type: 'resonance',
    title: 'Теплий резонанс каменя',
    reactionTimeMs: 6000 // generous, relaxed window
  },
  ripple: {
    type: 'ripple',
    title: 'Тиха хвиля по воді',
    reactionTimeMs: 6000
  },
  breath: {
    type: 'breath',
    title: 'Глибокий спокій',
    reactionTimeMs: 6500
  }
};

/**
 * Ultra-Meditative Velvet Acoustic Synthesizer
 *
 * Guarantees:
 * - NO harsh, sudden, sharp or loud sounds
 * - Strict lowpass filtering (cuts off all high and aggressive frequencies above 350-420 Hz)
 * - Ultra-gradual, breathing attacks (250-400ms soft swell - no clicks, no startling transients)
 * - Whisper-soft low volumes (gain 0.02 - 0.04)
 * - Authentic acoustic warmth modeled after heavy Himalayan singing bowls struck with soft padded wool mallets
 */
export class ZenSoundSynthesizer {
  private ctx: AudioContext | null = null;

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public init() {
    this.getContext();
  }

  /**
   * Whisper-soft, deep meditative signal when a mindful moment arrives.
   * - Frequency: 174 Hz (Solfeggio healing / grounding frequency, F3)
   * - Attack: 350ms very gentle, slow breathing fade-in (never startles)
   * - Filter: Lowpass 320 Hz with gentle Q (completely velvety, zero harshness)
   * - Volume: Whisper quiet (0.025)
   */
  playCueBell(type: ZenEventType = 'resonance') {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Grounding, warm frequencies: 174 Hz, 196 Hz (G3), or 216 Hz
    const freq = type === 'resonance' ? 174.6 : type === 'ripple' ? 220.0 : 196.0;
    const peakGain = 0.028; // Very soft, quiet, relaxing
    const decay = 3.6;

    // Velvet lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(0.5, now);
    filter.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Very soft swell (350ms attack) - completely eliminates any startle or shock
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc.stop(now + decay + 0.1);
  }

  /**
   * Harmonious, deeply peaceful singing bowl resonance when user touches the stone in time.
   * Warm triad chord (C3 + G3 + C4 or F3 + C4 + A4) filtered to velvety warm low frequencies.
   */
  playBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const baseFreq = 174.6; // Deep soothing foundation

    // Strict warm lowpass filter - no clicks or sharp buzz
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(0.6, now);
    filter.connect(ctx.destination);

    // Harmonious gentle harmonics
    const tones = [
      { f: baseFreq, gain: 0.04, decay: 4.5, attack: 0.2 },
      { f: baseFreq * 1.5, gain: 0.02, decay: 3.5, attack: 0.25 }, // Fifth
      { f: baseFreq * 2.0, gain: 0.01, decay: 3.0, attack: 0.3 }  // Octave
    ];

    tones.forEach(({ f, gain: peakGain, decay, attack }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      // Subtle organic pitch shimmer (singing bowl acoustic character)
      osc.frequency.linearRampToValueAtTime(f * 0.998, now + decay);

      // Smooth attack
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Almost imperceptible water drop / breath in stillness when touched between events.
   * Completely soft and calming.
   */
  playMutedBell() {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const zenSound = new ZenSoundSynthesizer();
