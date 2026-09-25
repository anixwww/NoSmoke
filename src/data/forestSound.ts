// Procedural Meditative Audio Synthesizer for the Cozy Forest
class ForestAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private breezeNode: AudioNode | null = null;
  private isBreezeActive = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Gentle water drop sound
  playWater() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch {}
  }

  // Warm radiant sun chime
  playSun() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C-major warm chord
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.04);

        gain.gain.setValueAtTime(0.04, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.5);
      });
    } catch {}
  }

  // Earthy nourishment / compost marimba
  playFood() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.22);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch {}
  }

  // Cascade of golden sands of time
  playSandPour() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const pentatonic = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760];
      for (let i = 0; i < 7; i++) {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const delay = i * 0.045 + Math.random() * 0.02;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.035, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.26);
      }
    } catch {}
  }

  // Gentle harvest acoustic celebration
  playHarvest() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + idx * 0.08);

        gain.gain.setValueAtTime(0.06, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.65);
      });
    } catch {}
  }

  // Snip weed
  playWeedSnip() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {}
  }
}

export const forestAudio = new ForestAudioSynthesizer();
