import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TabType, OrbitVoyageState, DragonState } from '../types';
import {
  ORBIT_PRESETS,
  ORBIT_MINDFULNESS_QUOTES,
  celestialAudio
} from '../data/orbitGameData';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface OrbitVoyageTabProps {
  cigsAvoided: number;
  orbitState: OrbitVoyageState;
  dragonState?: DragonState;
  onUpdateOrbitState: (updater: (prev: OrbitVoyageState) => OrbitVoyageState) => void;
  onUpdateDragonState?: (updater: (prev: DragonState) => DragonState) => void;
  onSwitchTab: (tab: TabType) => void;
}

interface Attractor {
  id: string;
  x: number;
  y: number;
  mass: number;
  radius: number;
  color: string;
  glowColor: string;
}

interface OrbitingBody {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  trail: { x: number; y: number }[];
  harmonicIndex: number;
  lastDistance: number;
  distanceTrend: number; // -1 approaching, 1 moving away
  periapsisTriggered: boolean;
  laps: number;
  angleTraversed: number;
  lastAngle: number;
}

interface CravingMote {
  id: number;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
}

interface StardustSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
}

const PALETTE = [
  { color: '#38BDF8', glow: '#0284C7' }, // Cyan
  { color: '#34D399', glow: '#059669' }, // Emerald
  { color: '#FBBF24', glow: '#D97706' }, // Amber
  { color: '#C084FC', glow: '#7E22CE' }, // Violet
  { color: '#FB7185', glow: '#E11D48' }, // Rose
  { color: '#67E8F9', glow: '#0891B2' }  // Teal
];

export const OrbitVoyageTab: React.FC<OrbitVoyageTabProps> = ({
  orbitState,
  dragonState,
  onUpdateOrbitState,
  onUpdateDragonState,
  onSwitchTab
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [keepTrails, setKeepTrails] = useState<boolean>(false); // Spirograph mode
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('solar');

  // Interactive Drag & Launch state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const soundEnabled = orbitState.soundEnabled ?? true;

  // Local live session stats
  const [liveStardust, setLiveStardust] = useState<number>(orbitState.stardustCollected || 0);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [activeBodiesCount, setActiveBodiesCount] = useState<number>(0);

  // Transfer Stardust to Dragon
  const handleTransferToDragon = () => {
    if (liveStardust <= 0) return;
    const amount = liveStardust;

    // Reset here
    setLiveStardust(0);
    onUpdateOrbitState((prev) => ({
      ...prev,
      stardustCollected: 0
    }));

    // Add to Dragon
    if (onUpdateDragonState) {
      onUpdateDragonState((prev) => ({
        ...prev,
        stardust: (prev.stardust || 0) + amount
      }));
    }

    if (soundEnabled) {
      celestialAudio.playHarmonicStabilize();
    }

    setTransferSuccess(`+${amount} Зоряного пилу передано Дракону!`);
    setTimeout(() => {
      setTransferSuccess(null);
    }, 4500);
  };

  // Random soothing quote
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Physics World Entities Refs (so animation loop never loses state)
  const attractorsRef = useRef<Attractor[]>([
    {
      id: 'core-sun',
      x: 300,
      y: 250,
      mass: 4200,
      radius: 14,
      color: '#FEF08A',
      glowColor: '#F59E0B'
    }
  ]);

  const bodiesRef = useRef<OrbitingBody[]>([]);
  const cravingMotesRef = useRef<CravingMote[]>([]);
  const sparksRef = useRef<StardustSpark[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const nextBodyIdRef = useRef<number>(1);

  // G Constant
  const G = 1.0;

  // Cycle mindful quotes periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ORBIT_MINDFULNESS_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Spawn craving motes that drift in space waiting for transmutation
  const spawnCravingMote = useCallback((width: number, height: number) => {
    const center = attractorsRef.current[0] || { x: width / 2, y: height / 2 };
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 110;
    return {
      id: Math.random(),
      x: center.x + Math.cos(angle) * dist,
      y: center.y + Math.sin(angle) * dist,
      radius: 9 + Math.random() * 5,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      opacity: 0.65
    };
  }, []);

  // Preset Loaders
  const loadPreset = useCallback(
    (presetId: string) => {
      setActivePreset(presetId);
      const canvas = canvasRef.current;
      const width = canvas ? canvas.width / (window.devicePixelRatio || 1) : 600;
      const height = canvas ? canvas.height / (window.devicePixelRatio || 1) : 500;
      const cx = width / 2;
      const cy = height / 2;

      bodiesRef.current = [];
      sparksRef.current = [];

      if (presetId === 'solar') {
        attractorsRef.current = [
          {
            id: 'sun',
            x: cx,
            y: cy,
            mass: 4200,
            radius: 14,
            color: '#FEF08A',
            glowColor: '#F59E0B'
          }
        ];

        // 3 stable circular Keplerian orbits: v = sqrt(G*M / r)
        const radii = [65, 110, 160];
        radii.forEach((r, idx) => {
          const v = Math.sqrt((G * 4200) / r);
          const palette = PALETTE[idx % PALETTE.length];
          bodiesRef.current.push({
            id: nextBodyIdRef.current++,
            x: cx + r,
            y: cy,
            vx: 0,
            vy: v,
            radius: 5,
            color: palette.color,
            glowColor: palette.glow,
            trail: [],
            harmonicIndex: idx,
            lastDistance: r,
            distanceTrend: 0,
            periapsisTriggered: false,
            laps: 0,
            angleTraversed: 0,
            lastAngle: 0
          });
        });
      } else if (presetId === 'figure8') {
        // Euler-like 3-body infinity resonance
        attractorsRef.current = [
          {
            id: 'core-left',
            x: cx - 65,
            y: cy,
            mass: 2800,
            radius: 11,
            color: '#7DD3FC',
            glowColor: '#0284C7'
          },
          {
            id: 'core-right',
            x: cx + 65,
            y: cy,
            mass: 2800,
            radius: 11,
            color: '#FDE68A',
            glowColor: '#D97706'
          }
        ];

        bodiesRef.current = [
          {
            id: nextBodyIdRef.current++,
            x: cx,
            y: cy - 75,
            vx: 3.5,
            vy: 0,
            radius: 5.5,
            color: '#34D399',
            glowColor: '#059669',
            trail: [],
            harmonicIndex: 2,
            lastDistance: 75,
            distanceTrend: 0,
            periapsisTriggered: false,
            laps: 0,
            angleTraversed: 0,
            lastAngle: 0
          },
          {
            id: nextBodyIdRef.current++,
            x: cx,
            y: cy + 75,
            vx: -3.5,
            vy: 0,
            radius: 5.5,
            color: '#C084FC',
            glowColor: '#7E22CE',
            trail: [],
            harmonicIndex: 4,
            lastDistance: 75,
            distanceTrend: 0,
            periapsisTriggered: false,
            laps: 0,
            angleTraversed: 0,
            lastAngle: 0
          }
        ];
      } else if (presetId === 'rosette') {
        // Precessing eccentric orbit that draws a celestial sacred flower
        attractorsRef.current = [
          {
            id: 'sun',
            x: cx,
            y: cy,
            mass: 4500,
            radius: 13,
            color: '#FEF08A',
            glowColor: '#F59E0B'
          }
        ];

        bodiesRef.current = [
          {
            id: nextBodyIdRef.current++,
            x: cx + 130,
            y: cy,
            vx: 0,
            vy: 3.8, // Slightly below circular speed -> high eccentricity
            radius: 5,
            color: '#FB7185',
            glowColor: '#E11D48',
            trail: [],
            harmonicIndex: 3,
            lastDistance: 130,
            distanceTrend: 0,
            periapsisTriggered: false,
            laps: 0,
            angleTraversed: 0,
            lastAngle: 0
          }
        ];
        setKeepTrails(true);
      } else if (presetId === 'binary') {
        attractorsRef.current = [
          {
            id: 'star-a',
            x: cx - 45,
            y: cy,
            mass: 3200,
            radius: 12,
            color: '#FDE047',
            glowColor: '#CA8A04'
          },
          {
            id: 'star-b',
            x: cx + 45,
            y: cy,
            mass: 3200,
            radius: 12,
            color: '#A7F3D0',
            glowColor: '#059669'
          }
        ];

        // Circumbinary outer orbit
        bodiesRef.current = [
          {
            id: nextBodyIdRef.current++,
            x: cx,
            y: cy - 140,
            vx: 4.6,
            vy: 0,
            radius: 5.5,
            color: '#38BDF8',
            glowColor: '#0284C7',
            trail: [],
            harmonicIndex: 1,
            lastDistance: 140,
            distanceTrend: 0,
            periapsisTriggered: false,
            laps: 0,
            angleTraversed: 0,
            lastAngle: 0
          }
        ];
      }

      // Populate craving motes
      cravingMotesRef.current = [
        spawnCravingMote(width, height),
        spawnCravingMote(width, height),
        spawnCravingMote(width, height)
      ];

      setActiveBodiesCount(bodiesRef.current.length);

      if (soundEnabled) {
        celestialAudio.playHarmonicStabilize();
      }
    },
    [G, soundEnabled, spawnCravingMote]
  );

  // Resize canvas to match display size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Adjust primary attractor position to center
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      if (attractorsRef.current[0]) {
        attractorsRef.current[0].x = cx;
        attractorsRef.current[0].y = cy;
      }

      loadPreset('solar');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loadPreset]);

  // Add new user-launched body
  const launchBody = (
    startX: number,
    startY: number,
    vx: number,
    vy: number
  ) => {
    const palette = PALETTE[bodiesRef.current.length % PALETTE.length];
    const newBody: OrbitingBody = {
      id: nextBodyIdRef.current++,
      x: startX,
      y: startY,
      vx,
      vy,
      radius: 5,
      color: palette.color,
      glowColor: palette.glow,
      trail: [],
      harmonicIndex: bodiesRef.current.length % 7,
      lastDistance: 100,
      distanceTrend: 0,
      periapsisTriggered: false,
      laps: 0,
      angleTraversed: 0,
      lastAngle: Math.atan2(startY - (attractorsRef.current[0]?.y || 0), startX - (attractorsRef.current[0]?.x || 0))
    };

    bodiesRef.current.push(newBody);
    setActiveBodiesCount(bodiesRef.current.length);

    if (soundEnabled) {
      celestialAudio.playLaunchImpulse();
    }

    onUpdateOrbitState((prev) => ({
      ...prev,
      totalFlights: (prev.totalFlights || 0) + 1
    }));
  };

  // Trajectory Prediction Helper (Simulates next 45 steps for dotted aim line)
  const calculatePredictedTrajectory = (
    startX: number,
    startY: number,
    vx: number,
    vy: number
  ) => {
    const points: { x: number; y: number }[] = [];
    let curX = startX;
    let curY = startY;
    let curVx = vx;
    let curVy = vy;
    const dt = 0.55;

    for (let i = 0; i < 48; i++) {
      let ax = 0;
      let ay = 0;
      for (const att of attractorsRef.current) {
        const dx = att.x - curX;
        const dy = att.y - curY;
        const distSq = dx * dx + dy * dy + 300;
        const dist = Math.sqrt(distSq);
        const f = (G * att.mass) / distSq;
        ax += (f * dx) / dist;
        ay += (f * dy) / dist;
      }
      curVx += ax * dt;
      curVy += ay * dt;
      curX += curVx * dt;
      curY += curVy * dt;

      if (i % 2 === 0) {
        points.push({ x: curX, y: curY });
      }
    }
    return points;
  };

  // Main 60fps Physics & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const render = (time: number) => {
      const dtMs = time - lastTime;
      lastTime = time;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Background clearing / Trail fading
      if (keepTrails) {
        ctx.fillStyle = 'rgba(10, 16, 14, 0.05)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Physics integration step
      const steps = isPaused ? 0 : simSpeed > 1.5 ? 3 : 2;
      const dt = 0.5 * (simSpeed / (steps || 1));

      for (let s = 0; s < steps; s++) {
        // Update orbiting bodies
        for (let i = bodiesRef.current.length - 1; i >= 0; i--) {
          const b = bodiesRef.current[i];
          let totalAx = 0;
          let totalAy = 0;
          let nearestDist = Infinity;

          for (const att of attractorsRef.current) {
            const dx = att.x - b.x;
            const dy = att.y - b.y;
            const distSq = dx * dx + dy * dy + 280;
            const dist = Math.sqrt(distSq);
            if (dist < nearestDist) nearestDist = dist;

            const force = (G * att.mass) / distSq;
            totalAx += (force * dx) / dist;
            totalAy += (force * dy) / dist;
          }

          // Symplectic Euler Integration
          b.vx += totalAx * dt;
          b.vy += totalAy * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Record trail point
          if (s === 0) {
            b.trail.push({ x: b.x, y: b.y });
            const maxTrail = keepTrails ? 250 : 70;
            if (b.trail.length > maxTrail) b.trail.shift();
          }

          // Periapsis detection (closest approach to central star triggers crystal harmonic chime)
          if (nearestDist > b.lastDistance && b.distanceTrend <= 0 && nearestDist < 140) {
            // Reached periapsis
            if (!b.periapsisTriggered && soundEnabled) {
              celestialAudio.playResonanceChime(b.harmonicIndex);
              b.periapsisTriggered = true;

              // Emit small harmless pulse spark
              for (let p = 0; p < 4; p++) {
                sparksRef.current.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 1.5,
                  vy: (Math.random() - 0.5) * 1.5,
                  color: b.color,
                  alpha: 0.8,
                  life: 25
                });
              }
            }
          } else if (nearestDist < b.lastDistance) {
            b.periapsisTriggered = false;
          }
          b.distanceTrend = nearestDist > b.lastDistance ? 1 : -1;
          b.lastDistance = nearestDist;

          // Remove if escaped into deep infinity (too far)
          if (b.x < -400 || b.x > width + 400 || b.y < -400 || b.y > height + 400) {
            bodiesRef.current.splice(i, 1);
            setActiveBodiesCount(bodiesRef.current.length);
            continue;
          }

          // Check collisions with craving motes (Transmutation!)
          for (let m = cravingMotesRef.current.length - 1; m >= 0; m--) {
            const mote = cravingMotesRef.current[m];
            const mdx = b.x - mote.x;
            const mdy = b.y - mote.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < mote.radius + b.radius + 6) {
              // Craving transmuted!
              if (soundEnabled) {
                celestialAudio.playTransmuteSound();
              }

              // Sparkles burst
              for (let k = 0; k < 12; k++) {
                const spAngle = Math.random() * Math.PI * 2;
                const spSpeed = 0.8 + Math.random() * 2.2;
                sparksRef.current.push({
                  x: mote.x,
                  y: mote.y,
                  vx: Math.cos(spAngle) * spSpeed,
                  vy: Math.sin(spAngle) * spSpeed,
                  color: '#FDE047',
                  alpha: 1.0,
                  life: 40
                });
              }

              // Update stats
              setLiveStardust((prev) => prev + 15);
              onUpdateOrbitState((prev) => ({
                ...prev,
                stardustCollected: (prev.stardustCollected || 0) + 15,
                cravingsCleared: (prev.cravingsCleared || 0) + 1,
                highScoreDistance: Math.max(prev.highScoreDistance || 0, (prev.cravingsCleared || 0) + 1)
              }));

              // Respawn mote elsewhere
              cravingMotesRef.current.splice(m, 1);
              cravingMotesRef.current.push(spawnCravingMote(width, height));
            }
          }
        }

        // Update sparks
        for (let sp = sparksRef.current.length - 1; sp >= 0; sp--) {
          const spark = sparksRef.current[sp];
          spark.x += spark.vx;
          spark.y += spark.vy;
          spark.alpha *= 0.95;
          spark.life--;
          if (spark.life <= 0 || spark.alpha <= 0.02) {
            sparksRef.current.splice(sp, 1);
          }
        }
      }

      // ----------------------------------------------------
      // RENDER PASSES
      // ----------------------------------------------------

      // 1. Draw Attractors (Central Stars)
      for (const att of attractorsRef.current) {
        // Deep soft outer glow
        const glow = ctx.createRadialGradient(att.x, att.y, 2, att.x, att.y, att.radius * 3.8);
        glow.addColorStop(0, att.color);
        glow.addColorStop(0.35, att.glowColor);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(att.x, att.y, att.radius * 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Star Core
        ctx.fillStyle = att.color;
        ctx.beginPath();
        ctx.arc(att.x, att.y, att.radius, 0, Math.PI * 2);
        ctx.fill();

        // Delicate orbital guide circles
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
        ctx.lineWidth = 1;
        [65, 110, 160].forEach((ringR) => {
          ctx.beginPath();
          ctx.arc(att.x, att.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // 2. Draw Craving Motes (Nicotine smog clouds to absorb)
      for (const mote of cravingMotesRef.current) {
        const moteGlow = ctx.createRadialGradient(
          mote.x,
          mote.y,
          2,
          mote.x,
          mote.y,
          mote.radius * 1.8
        );
        moteGlow.addColorStop(0, 'rgba(192, 132, 252, 0.7)');
        moteGlow.addColorStop(0.6, 'rgba(126, 34, 206, 0.35)');
        moteGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = moteGlow;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Center core
        ctx.fillStyle = 'rgba(233, 213, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Orbiting Bodies and Glowing Trails
      for (const b of bodiesRef.current) {
        // Draw Trail
        if (b.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x, b.trail[0].y);
          for (let t = 1; t < b.trail.length; t++) {
            ctx.lineTo(b.trail[t].x, b.trail[t].y);
          }
          ctx.strokeStyle = b.color;
          ctx.lineWidth = keepTrails ? 1.2 : 2.0;
          ctx.globalAlpha = keepTrails ? 0.35 : 0.45;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // Body Outer Glow
        const bGlow = ctx.createRadialGradient(b.x, b.y, 1, b.x, b.y, b.radius * 3);
        bGlow.addColorStop(0, b.color);
        bGlow.addColorStop(0.5, b.glowColor);
        bGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = bGlow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Body Core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Draw Stardust Sparks
      for (const sp of sparksRef.current) {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 5. Draw Active Slingshot Trajectory Prediction while Dragging
      if (isDragging && dragStart && dragCurrent) {
        const dx = dragStart.x - dragCurrent.x;
        const dy = dragStart.y - dragCurrent.y;
        const launchVx = dx * 0.085;
        const launchVy = dy * 0.085;

        // Slingshot Pull Vector Line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Predicted Trajectory Path
        const predPoints = calculatePredictedTrajectory(dragStart.x, dragStart.y, launchVx, launchVy);
        if (predPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(predPoints[0].x, predPoints[0].y);
          for (let p = 1; p < predPoints.length; p++) {
            ctx.lineTo(predPoints[p].x, predPoints[p].y);
          }
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.8;
          ctx.globalAlpha = 0.75;
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Trajectory nodes
          predPoints.forEach((pt, idx) => {
            if (idx % 3 === 0) {
              ctx.fillStyle = '#7DD3FC';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        // Start origin marker
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(dragStart.x, dragStart.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [G, isPaused, keepTrails, simSpeed, soundEnabled, isDragging, dragStart, dragCurrent, spawnCravingMote]);

  // Touch / Mouse Slingshot Handlers
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    celestialAudio.init();
    const pos = getCanvasCoords(e);
    setIsDragging(true);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const pos = getCanvasCoords(e);
    setDragCurrent(pos);
  };

  const handlePointerUp = () => {
    if (isDragging && dragStart && dragCurrent) {
      const dx = dragStart.x - dragCurrent.x;
      const dy = dragStart.y - dragCurrent.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If dragged enough, launch with vector velocity
      if (dist > 8) {
        const vx = dx * 0.085;
        const vy = dy * 0.085;
        launchBody(dragStart.x, dragStart.y, vx, vy);
      } else {
        // Quick tap: spawn at position with subtle circular orbital kick around center star
        const att = attractorsRef.current[0] || { x: 300, y: 250 };
        const ddx = dragStart.x - att.x;
        const ddy = dragStart.y - att.y;
        const r = Math.sqrt(ddx * ddx + ddy * ddy) || 80;
        const v = Math.sqrt((G * 4200) / r);
        // Tangent vector
        const vx = (-ddy / r) * v;
        const vy = (ddx / r) * v;
        launchBody(dragStart.x, dragStart.y, vx, vy);
      }
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const clearAllBodies = () => {
    bodiesRef.current = [];
    sparksRef.current = [];
    setActiveBodiesCount(0);
  };

  const toggleSound = () => {
    celestialAudio.init();
    onUpdateOrbitState((prev) => ({
      ...prev,
      soundEnabled: !soundEnabled
    }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-8 select-none max-w-lg mx-auto w-full">
      {/* Top Bar: Nav, Presets, Audio Toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] hover:border-[#38BDF8] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Guide / How to play */}
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="p-1.5 rounded-xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] hover:text-[#38BDF8] transition-colors cursor-pointer"
            title="Як грати"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400'
                : 'bg-white/70 dark:bg-[#18181d]/80 border-[#B7CDC6] dark:border-[#2d2d35] text-[#8FAAA3]'
            }`}
            title={soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Celestial Physics Canvas Card */}
      <div className="relative w-full bg-[#090E0D] border border-cyan-950/80 rounded-3xl p-3 sm:p-4 shadow-xl overflow-hidden flex flex-col">
        {/* Header inside canvas: Title, Active stats & Live instruction */}
        <div className="flex items-center justify-between gap-2 mb-2 px-1 z-10">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Гравітаційні Орбіти</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Фізичний симулятор
              </span>
            </h2>
            <p className="text-[11px] text-cyan-200/60 truncate max-w-[240px] sm:max-w-xs">
              Тягніть по полю для запуску орбіти • Дотик розчиняє тягу
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300 font-mono">
              Тіл: {activeBodiesCount}
            </span>
          </div>
        </div>

        {/* Interactive Physics Canvas */}
        <div
          ref={containerRef}
          className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#050B0A] via-[#081210] to-[#040807] cursor-crosshair touch-none"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Prompt overlay if 0 bodies */}
          {activeBodiesCount === 0 && !isDragging && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4 bg-black/20">
              <Sparkles className="w-6 h-6 text-cyan-400 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-cyan-100 mb-1">
                Потягніть мишкою або пальцем, щоб запустити орбіту
              </p>
              <p className="text-[11px] text-cyan-300/60 max-w-xs">
                Створюйте еліпси, спірограми або виберіть готовий шаблон унизу
              </p>
            </div>
          )}
        </div>

        {/* Mindful Ambient Quote */}
        <div className="py-2 px-1 text-center">
          <p className="text-[11px] text-emerald-300/70 italic transition-all duration-700">
            «{ORBIT_MINDFULNESS_QUOTES[quoteIndex]}»
          </p>
        </div>

        {/* Creative Controls & Preset Switcher */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5 z-10">
          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {ORBIT_PRESETS.map((pr) => (
              <button
                key={pr.id}
                type="button"
                onClick={() => loadPreset(pr.id)}
                className={`py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
                  activePreset === pr.id
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-xs'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                }`}
                title={pr.description}
              >
                <span>{pr.icon}</span>
                <span className="truncate">{pr.name}</span>
              </button>
            ))}
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Play / Pause */}
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer"
                title={isPaused ? 'Відновити симуляцію' : 'Пауза'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Speed Switcher */}
              <button
                type="button"
                onClick={() => setSimSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
                className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-mono transition-all cursor-pointer"
                title="Швидкість симуляції"
              >
                {simSpeed}x
              </button>

              {/* Spirograph mode / Keep trails */}
              <button
                type="button"
                onClick={() => setKeepTrails(!keepTrails)}
                className={`px-2 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  keepTrails
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-400/40'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
                title="Режим малювання візерунка орбіт (Спірограф)"
              >
                <Layers className="w-3 h-3" />
                <span>Спірограф</span>
              </button>
            </div>

            {/* Clear bodies */}
            <button
              type="button"
              onClick={clearAllBodies}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-red-500/15 text-gray-400 hover:text-red-300 text-[10px] transition-all cursor-pointer"
              title="Очистити простір"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Очистити</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stardust & Transfer to Dragon Card */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-white/80 dark:bg-[#141b18] border border-[#B7CDC6] dark:border-[#1E2E28] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl flex-none">
            ✨
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">
                Зоряний пил
              </span>
              {dragonState && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                  У Дракона: {dragonState.stardust || 0} ✨
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-amber-500 dark:text-amber-400 font-mono leading-tight">
              {liveStardust} ✨
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            disabled={liveStardust <= 0}
            onClick={handleTransferToDragon}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
              liveStardust > 0
                ? 'bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white shadow-emerald-600/20'
                : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-transparent'
            }`}
          >
            <span>🐉</span>
            <span>Передати Дракону</span>
            {liveStardust > 0 && <span className="font-mono">(+{liveStardust})</span>}
          </button>
        </div>
      </div>

      {transferSuccess && (
        <div className="w-full mt-2.5 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5 font-medium">
            <span>✨</span>
            <span>{transferSuccess}</span>
          </span>
          <button
            type="button"
            onClick={() => onSwitchTab('dragon')}
            className="text-[11px] font-bold underline hover:opacity-80 ml-2 cursor-pointer flex items-center gap-1"
          >
            <span>До Дракона</span>
            <span>🐉</span>
          </button>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#111816] border border-cyan-500/30 rounded-3xl p-5 max-w-sm w-full text-white shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-cyan-300 mb-2 flex items-center gap-2">
              <span>🪐</span>
              <span>Як керувати орбітами</span>
            </h3>

            <div className="space-y-2.5 text-xs text-cyan-100/80 leading-relaxed">
              <p>
                <strong>1. Запуск орбіти:</strong> торкніться будь-якого місця поля, потягніть у протилежний бік (як рогатку) і відпустіть. Пунктир покаже точну майбутню траєкторію.
              </p>
              <p>
                <strong>2. Музика сфер:</strong> коли небесне тіло проходить найближчу точку до зірки (перицентр), воно звучить ніжним кришталевим акордом.
              </p>
              <p>
                <strong>3. Розчинення тяги:</strong> спрямовуйте орбіти крізь фіолетові хмаринки смогу — вони розсипаються на цілющий золотий зоряний пил.
              </p>
              <p>
                <strong>4. Спірограф:</strong> увімкніть режим «Спірограф», щоб спостерігати, як орбіти малюють сакральні геометричні візерунки у космосі.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-xs text-white transition-all cursor-pointer"
            >
              Зрозуміло • Творити орбіти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
