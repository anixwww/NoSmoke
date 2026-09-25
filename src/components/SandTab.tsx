import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getLevelCounts, drawGlowingGrain, LevelCountItem } from '../data/sandConfig';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SandTabProps {
  daysCount: number;
  onSwitchTab?: (tab: any) => void;
}

interface LevitatingGrain {
  id: string;
  level: number;
  shape: 'circle' | 'square' | 'diamond' | 'triangle' | 'pentagon' | 'star';
  color: string;
  glowColor: string;
  size: number;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  // Levitation equilibrium
  homeRadius: number;
  homeAngle: number;
  orbitSpeed: number;
  oscPhase: number;
  oscSpeed: number;
  oscAmp: number;
  sparklePhase: number;
}

interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  alpha: number;
  color: string;
}

class SoundController {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private lastSoundTime: number = 0;

  constructor() {
    try {
      const saved = localStorage.getItem('quit-smoking:sand-sound');
      if (saved !== null) {
        this.isEnabled = saved === 'true';
      }
    } catch {}
  }

  get enabled() {
    return this.isEnabled;
  }

  setEnabled(val: boolean) {
    this.isEnabled = val;
    try {
      localStorage.setItem('quit-smoking:sand-sound', val ? 'true' : 'false');
    } catch {}
    if (val) {
      this.playChime(520, 0.05);
    }
  }

  playChime(freq = 480, gainVal = 0.035) {
    if (!this.isEnabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastSoundTime < 80) return;
    this.lastSoundTime = nowMs;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainVal, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {}
  }
}

const soundManager = new SoundController();

export const SandTab: React.FC<SandTabProps> = ({ daysCount, onSwitchTab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const grainsRef = useRef<LevitatingGrain[]>([]);
  const ripplesRef = useRef<TouchRipple[]>([]);
  const pointerRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    lastX: number;
    lastY: number;
    vx: number;
    vy: number;
  }>({
    x: 0,
    y: 0,
    active: false,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0
  });

  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const dimensionsRef = useRef<{ w: number; h: number }>({ w: 320, h: 360 });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.enabled);
  const [isLevelsOpen, setIsLevelsOpen] = useState<boolean>(false);

  const levelCounts = useMemo(() => getLevelCounts(daysCount), [daysCount]);

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
  };

  // Synchronize levitating grains
  const syncGrains = (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const targetGrains: LevitatingGrain[] = [];
    const maxRadius = Math.min(w, h) * 0.42;

    let globalIndex = 0;
    levelCounts.forEach((item) => {
      const cfg = item.config;
      const count = Math.min(item.count, 45); // Smooth performance cap

      for (let i = 0; i < count; i++) {
        globalIndex++;
        const id = `lev-${cfg.level}-${i}`;
        const existing = grainsRef.current.find((g) => g.id === id);

        // Golden ratio spiral distribution for levitation center
        const phi = (Math.sqrt(5) + 1) / 2;
        const angle = globalIndex * phi * Math.PI * 2;
        // Radial distribution based on level & index
        const distRatio = Math.sqrt(globalIndex / (Math.max(1, daysCount) + 10));
        const baseRadius = 18 + distRatio * (maxRadius - 20) + (cfg.level * 4);
        const homeRadius = Math.min(maxRadius, baseRadius);

        const radius = Math.max(3.8, cfg.size * 0.85);

        if (existing) {
          existing.homeRadius = homeRadius;
          existing.homeAngle = angle;
          targetGrains.push(existing);
        } else {
          // Spawn near center with gentle initial velocity
          const initAngle = angle + (Math.random() - 0.5) * 0.4;
          const initDist = homeRadius * (0.8 + Math.random() * 0.4);
          targetGrains.push({
            id,
            level: cfg.level,
            shape: cfg.shape,
            color: cfg.color,
            glowColor: cfg.glow,
            size: cfg.size,
            radius,
            x: cx + Math.cos(initAngle) * initDist,
            y: cy + Math.sin(initAngle) * initDist,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 1.5,
            homeRadius,
            homeAngle: angle,
            orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.08),
            oscPhase: Math.random() * Math.PI * 2,
            oscSpeed: 0.8 + Math.random() * 1.2,
            oscAmp: 6 + Math.random() * 10,
            sparklePhase: Math.random() * Math.PI * 2
          });
        }
      }
    });

    grainsRef.current = targetGrains;
  };

  // Impulse burst: scatters grains in 360 degrees and lets them levitate back to center
  const handlePulseBurst = () => {
    soundManager.playChime(620, 0.06);
    const { w, h } = dimensionsRef.current;
    const cx = w / 2;
    const cy = h / 2;

    // Add central shockwave ripple
    ripplesRef.current.push({
      x: cx,
      y: cy,
      radius: 10,
      maxRadius: Math.max(w, h) * 0.65,
      strength: 400,
      alpha: 0.9,
      color: '#F59E0B'
    });

    grainsRef.current.forEach((g) => {
      const dx = g.x - cx;
      const dy = g.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const blast = 260 + Math.random() * 180;
      g.vx += (dx / dist) * blast;
      g.vy += (dy / dist) * blast;
      g.rotSpeed += (Math.random() - 0.5) * 8;
    });
  };

  // Add a touch ripple shockwave
  const addRipple = (x: number, y: number, color = '#38BDF8') => {
    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 140,
      strength: 220,
      alpha: 0.85,
      color
    });
    if (ripplesRef.current.length > 6) {
      ripplesRef.current.shift();
    }
  };

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerRef.current = {
      x,
      y,
      lastX: x,
      lastY: y,
      vx: 0,
      vy: 0,
      active: true
    };

    addRipple(x, y, '#F59E0B');
    soundManager.playChime(500, 0.04);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerRef.current.active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const vx = (x - pointerRef.current.lastX) * 20;
    const vy = (y - pointerRef.current.lastY) * 20;

    pointerRef.current.x = x;
    pointerRef.current.y = y;
    pointerRef.current.lastX = x;
    pointerRef.current.lastY = y;
    pointerRef.current.vx = vx;
    pointerRef.current.vy = vy;
  };

  const handlePointerEnd = () => {
    pointerRef.current.active = false;
    pointerRef.current.vx = 0;
    pointerRef.current.vy = 0;
  };

  // Main Levitation Physics & Render Loop
  const tick = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const t = now * 0.001;
    const dt = Math.min(0.04, (now - lastTimeRef.current) * 0.001);
    lastTimeRef.current = now;

    // 1. Clear background with celestial deep glow
    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(w, h) * 0.7);
    bgGrad.addColorStop(0, '#101B30');
    bgGrad.addColorStop(0.45, '#090E1B');
    bgGrad.addColorStop(1, '#03060C');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Center Levitation Aura & Sacred Rings
    const levPulse = Math.sin(t * 1.8) * 0.08 + 0.92;
    const coreRadius = (35 + Math.sin(t * 1.2) * 6) * levPulse;

    // Soft central glow
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.8);
    coreGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    coreGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Delicate concentric orbital rings
    ctx.save();
    [0.7, 1.2, 1.8, 2.4].forEach((scale, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * scale, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.16)' : 'rgba(245, 158, 11, 0.14)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
    });
    ctx.restore();

    // 3. Update & render touch ripples
    const activeRipples: TouchRipple[] = [];
    ripplesRef.current.forEach((rip) => {
      rip.radius += 180 * dt;
      rip.alpha *= 0.96;

      if (rip.alpha > 0.02 && rip.radius < rip.maxRadius) {
        activeRipples.push(rip);

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha * 0.45;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.restore();
      }
    });
    ripplesRef.current = activeRipples;

    // 4. Physics Step for Levitating Grains
    const grains = grainsRef.current;
    const ptr = pointerRef.current;

    for (let i = 0; i < grains.length; i++) {
      const g = grains[i];

      // Current equilibrium target orbiting the center
      const currentOrbitAngle = g.homeAngle + t * g.orbitSpeed;
      const breathingDist = g.homeRadius + Math.sin(t * g.oscSpeed + g.oscPhase) * g.oscAmp;
      const tx = cx + Math.cos(currentOrbitAngle) * breathingDist;
      const ty = cy + Math.sin(currentOrbitAngle) * breathingDist;

      // Restoring levitation harmonic spring towards equilibrium
      const springK = 3.2; // Smooth levitation elasticity
      let ax = (tx - g.x) * springK;
      let ay = (ty - g.y) * springK;

      // Touch / pointer interaction: natural smooth fluid kinetic dispersion & drag
      if (ptr.active) {
        const pdx = g.x - ptr.x;
        const pdy = g.y - ptr.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy) || 1;

        if (pdist < 180) {
          const proximity = 1 - pdist / 180;
          const force = proximity * proximity * 300;
          ax += (pdx / pdist) * force;
          ay += (pdy / pdist) * force;
          ax += ptr.vx * 0.16;
          ay += ptr.vy * 0.16;
        }
      }

      // Ripple shockwave impulses
      ripplesRef.current.forEach((rip) => {
        const rdx = g.x - rip.x;
        const rdy = g.y - rip.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
        const diff = Math.abs(rdist - rip.radius);
        if (diff < 22) {
          const push = (1 - diff / 22) * rip.strength * rip.alpha;
          ax += (rdx / rdist) * push;
          ay += (rdy / rdist) * push;
        }
      });

      // Air viscosity / smooth damping
      g.vx = (g.vx + ax * dt) * 0.94;
      g.vy = (g.vy + ay * dt) * 0.94;
      g.x += g.vx * dt * 28;
      g.y += g.vy * dt * 28;
      g.rot += (g.rotSpeed + (g.vx + g.vy) * 0.05) * dt;

      // Soft canvas perimeter boundaries
      const pad = g.radius + 6;
      if (g.x < pad) { g.x = pad; g.vx = Math.abs(g.vx) * 0.5; }
      else if (g.x > w - pad) { g.x = w - pad; g.vx = -Math.abs(g.vx) * 0.5; }
      if (g.y < pad) { g.y = pad; g.vy = Math.abs(g.vy) * 0.5; }
      else if (g.y > h - pad) { g.y = h - pad; g.vy = -Math.abs(g.vy) * 0.5; }
    }

    // 5. Inter-particle gentle repulsion (prevents stacking, keeps constellation clean)
    for (let i = 0; i < grains.length; i++) {
      for (let j = i + 1; j < grains.length; j++) {
        const p1 = grains[i];
        const p2 = grains[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius + 4;

        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          p1.x -= nx * overlap * 0.4;
          p1.y -= ny * overlap * 0.4;
          p2.x += nx * overlap * 0.4;
          p2.y += ny * overlap * 0.4;

          p1.vx -= nx * 10;
          p1.vy -= ny * 10;
          p2.vx += nx * 10;
          p2.vy += ny * 10;
        }
      }
    }

    // 6. Render Glowing Levitating Grains
    for (let i = 0; i < grains.length; i++) {
      const g = grains[i];
      const sparkle = 1 + 0.12 * Math.sin(t * 3 + g.sparklePhase);
      const drawSize = g.radius * sparkle;

      drawGlowingGrain(
        ctx,
        g.shape,
        g.x,
        g.y,
        drawSize,
        g.rot,
        g.color,
        g.glowColor,
        Math.min(16, drawSize * 1.8)
      );
    }

    rafIdRef.current = requestAnimationFrame(tick);
  };

  // Canvas setup & resize observer
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(160, Math.floor(rect.width));
      const h = Math.max(200, Math.floor(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      dimensionsRef.current = { w, h };
      syncGrains(w, h);
    };

    handleResize();
    const ro = new ResizeObserver(() => handleResize());
    ro.observe(container);

    rafIdRef.current = requestAnimationFrame(tick);

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      } else {
        lastTimeRef.current = performance.now();
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Update grains whenever daysCount changes
  useEffect(() => {
    const { w, h } = dimensionsRef.current;
    syncGrains(w, h);
  }, [daysCount]);

  const totalGrainsCount = grainsRef.current.length;

  return (
    <div className="flex flex-col flex-1 pb-10 max-w-md mx-auto w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab('counter')}
              className="p-1.5 -ml-1 text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-[#1E8A69]/10 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
              Піщинки часу (Левітація)
            </h1>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Левітують по центру та реагують на ваші дотики
            </p>
          </div>
        </div>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
            soundEnabled
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
              : 'bg-white/60 dark:bg-[#1c1c21]/60 border-[#B7CDC6] dark:border-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
          }`}
          title={soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Levitating Canvas */}
      <div
        ref={containerRef}
        className="w-full aspect-[4/3] rounded-3xl overflow-hidden mb-3 relative shadow-md touch-none select-none border border-[#B7CDC6] dark:border-[#2d2d35] bg-[#0A0F1D]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Pulse / Core Burst Button on Canvas */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={handlePulseBurst}
            className="py-1 px-3 bg-black/45 hover:bg-black/70 active:scale-95 text-amber-300 rounded-full backdrop-blur-xs border border-amber-400/30 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            title="Імпульс розсіювання"
          >
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Імпульс</span>
          </button>
        </div>

        {/* Canvas Bottom Hint */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none">
          <span className="text-[10px] text-white/80 font-medium bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
            ✨ Торкайтеся або проведіть по екрану для взаємодії
          </span>
          <span className="text-[10px] text-white/70 font-mono bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs border border-white/10">
            {totalGrainsCount} у полі
          </span>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-3 text-center shadow-xs">
        <div>
          <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5 font-semibold">
            Піщинок чистоти
          </span>
          <span className="text-xl font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
            {daysCount.toLocaleString('uk-UA')}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5 font-semibold">
            Кристалів у левітації
          </span>
          <span className="text-xl font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
            {totalGrainsCount}
          </span>
        </div>
      </div>

      {/* Description Info Notice */}
      <div className="p-3.5 bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-3 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
        <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
          Піщинки тримаються в постійному балансі у центрі завдяки гармонійному полю. Кожен дотик виводить їх із рівноваги, після чого вони плавно повертаються до свого сяючого ядра.
        </p>
      </div>

      {/* Collapsible Crystals List */}
      <div className="bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsLevelsOpen(!isLevelsOpen)}
          className="w-full p-3.5 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-[#1E8A69]/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
            <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Рівні кристалів (Кожні 10 об&apos;єднуються)
            </span>
          </div>
          {isLevelsOpen ? (
            <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
          )}
        </button>

        {isLevelsOpen && (
          <div className="p-3.5 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-2 mt-1">
            {levelCounts.map((item: LevelCountItem) => {
              const cfg = item.config;
              const count = item.count;
              return (
                <div
                  key={cfg.level}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all ${
                    count > 0
                      ? 'border-[#1E8A69]/40 bg-white dark:bg-[#1c1c21] shadow-xs'
                      : 'border-transparent opacity-35'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shadow-xs"
                      style={{
                        backgroundColor: cfg.color,
                        boxShadow: `0 0 8px ${cfg.glow}`
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                        {cfg.name}
                      </div>
                      <div className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                        {cfg.level === 1 ? '1 піщинка' : `10^${cfg.level - 1} піщинок`}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                    {count} шт.
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
