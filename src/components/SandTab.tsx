import React from 'react';
import { LEVEL_CONFIG, getLevelCounts, drawGrainShape } from '../data/sandConfig';

interface SandTabProps {
  daysCount: number;
  onSwitchTab?: (tab: any) => void;
}

interface SandGrain {
  level: number;
  size: number;
  shape: 'circle' | 'square' | 'diamond' | 'triangle' | 'pentagon' | 'star';
  color: string;
  glowColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  ox: number;
  oy: number;
  ph: number;
  twinklePhase: number;
  createdAt: number;
}

export const SandTab: React.FC<SandTabProps> = ({ daysCount, onSwitchTab }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const particlesRef = React.useRef<SandGrain[]>([]);
  const touchPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = React.useRef<number | null>(null);
  const dimensionsRef = React.useRef<{ w: number; h: number }>({ w: 320, h: 240 });

  const levelCounts = React.useMemo(() => getLevelCounts(daysCount), [daysCount]);


  const initParticles = (w: number, h: number) => {
    const list: SandGrain[] = [];
    const cx = w / 2;
    const cy = h / 2;
    const now = performance.now() * 0.001;

    levelCounts.forEach((item) => {
      const cfg = item.config;
      const count = Math.min(item.count, 50);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * Math.min(w, h) * 0.28;
        list.push({
          level: cfg.level,
          size: cfg.size,
          shape: cfg.shape,
          color: cfg.color,
          glowColor: cfg.glow,
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 1.5,
          ox: Math.cos(angle) * (15 + Math.random() * 20),
          oy: Math.sin(angle) * (15 + Math.random() * 20),
          ph: Math.random() * Math.PI * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          createdAt: now + Math.random() * 0.3 // slight staggered smooth appearance
        });
      }
    });

    particlesRef.current = list;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    touchPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!touchPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    touchPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerEnd = () => {
    touchPointRef.current = null;
  };

  const renderFrame = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    ctx.clearRect(0, 0, w, h);

    const touch = touchPointRef.current;
    const particles = particlesRef.current;
    const cx = w / 2;
    const cy = h / 2;
    const t = timestamp * 0.001;
    const dt = 0.016;

    // Background subtle starfield glow
    ctx.fillStyle = 'rgba(7, 19, 17, 0.15)';
    ctx.fillRect(0, 0, w, h);



    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Physics: spring to touch or gentle float around center
      let ax = 0;
      let ay = 0;

      if (touch) {
        ax += (touch.x + p.ox - p.x) * 28;
        ay += (touch.y + p.oy - p.y) * 28;
      } else {
        ax += (cx + p.ox - p.x) * 6;
        ay += (cy + p.oy - p.y) * 6;
        // Zero-gravity cosmic harmonic float
        ax += Math.sin(t * 1.4 + p.ph) * 22;
        ay += Math.cos(t * 1.6 + p.ph * 1.2) * 22;
      }

      p.vx = (p.vx + ax * dt) * 0.94;
      p.vy = (p.vy + ay * dt) * 0.94;
      p.x += p.vx * dt * 35;
      p.y += p.vy * dt * 35;
      p.rot += p.rotSpeed * dt * (touch ? 2.5 : 1);

      // Boundary bounds
      const pad = p.size + 4;
      if (p.x < pad) { p.x = pad; p.vx = -p.vx * 0.5; }
      else if (p.x > w - pad) { p.x = w - pad; p.vx = -p.vx * 0.5; }
      if (p.y < pad) { p.y = pad; p.vy = -p.vy * 0.5; }
      else if (p.y > h - pad) { p.y = h - pad; p.vy = -p.vy * 0.5; }

      // Twinkle & Pulsing glow & Smooth fade-in
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.5 + p.twinklePhase);
      const fadeIn = Math.min(1, Math.max(0, (t - p.createdAt) * 2.5));
      const drawSize = p.size * (touch ? 1.15 : pulse) * Math.min(1, 0.4 + 0.6 * fadeIn);

      ctx.save();
      ctx.globalAlpha = fadeIn;
      // Outer bright glowing halo
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = touch ? 18 : 12;

      // Radiant glowing gradient with white hot center
      const grad = ctx.createRadialGradient(
        p.x - drawSize * 0.25,
        p.y - drawSize * 0.25,
        drawSize * 0.1,
        p.x,
        p.y,
        drawSize * 1.2
      );
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.35, p.glowColor);
      grad.addColorStop(1, p.color);

      ctx.fillStyle = grad;
      drawGrainShape(ctx, p.shape, p.x, p.y, drawSize, p.rot);
      ctx.fill();

      // Sharp white specular gleam
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(p.x - drawSize * 0.3, p.y - drawSize * 0.3, Math.max(1, drawSize * 0.25), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    rafIdRef.current = requestAnimationFrame(renderFrame);
  };

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(100, Math.floor(rect.width));
      const h = Math.max(160, Math.floor(rect.height));
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      dimensionsRef.current = { w, h };
      initParticles(w, h);
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);

    rafIdRef.current = requestAnimationFrame(renderFrame);

    const handleVis = () => {
      if (document.hidden) {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      } else {
        if (!rafIdRef.current) {
          rafIdRef.current = requestAnimationFrame(renderFrame);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVis);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [daysCount]);

  const totalParticles = particlesRef.current.length;

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2 mb-3">
        {onSwitchTab && (
          <button
            type="button"
            onClick={() => onSwitchTab('counter')}
            className="p-1.5 -ml-1 text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-[#1E8A69]/10 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            ← Назад
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
            Піщинки часу (Сяючі)
          </h1>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            1 година свободи = 1 піщинка. Кожні 10 піщинок об'єднуються на наступний рівень!
          </p>
        </div>
      </div>

      {/* Interactive Canvas Box */}
      <div
        ref={containerRef}
        className="w-full aspect-[4/3] bg-[#0A1614] dark:bg-[#071311] border-2 border-[#1E8A69]/50 dark:border-[#4CC9A0]/50 rounded-3xl overflow-hidden mb-4 relative shadow-lg touch-none select-none"
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
        <div className="absolute bottom-2.5 right-3 text-[10px] text-white/80 font-medium pointer-events-none bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/10">
          ✨ Торкніться та утримуйте для взаємодії
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 text-center shadow-xs">
        <div>
          <span className="text-xs text-[#55726B] dark:text-[#8FAAA3] block mb-0.5 font-semibold">
            Всього секунд
          </span>
          <span className="text-2xl font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
            {daysCount.toLocaleString('uk-UA')}
          </span>
        </div>
        <div>
          <span className="text-xs text-[#55726B] dark:text-[#8FAAA3] block mb-0.5 font-semibold">
            Піщинок у полі
          </span>
          <span className="text-2xl font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
            {totalParticles}
          </span>
        </div>
      </div>



      {/* Levels list with visual icons and glow */}
      <div className="p-4 bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3] mb-3">
          Рівні піщинок (кожні 10 об’єднуються)
        </h3>
        <div className="space-y-2">
          {levelCounts.map((item) => {
            const cfg = item.config;
            const count = item.count;
            return (
              <div
                key={cfg.level}
                className={`flex items-center justify-between text-xs py-1.5 px-3 rounded-xl border transition-all ${
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
                  <span className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                    {cfg.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                  {count} шт.
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
