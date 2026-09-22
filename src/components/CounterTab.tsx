import React from 'react';
import { MoneySettings, TreeState, GoalsState } from '../types';
import { TREE_SPECIES, getTreeStageInfo } from '../data/treeSpecies';
import { getTodayHealthFact, HEALTH_MILESTONES } from '../data/healthData';
import { LEVEL_CONFIG, getLevelCounts, drawGlowingGrain } from '../data/sandConfig';
import {
  User,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Trees,
  ArrowRight,
  Target,
  Check,
  Lock
} from 'lucide-react';
import { StateChart } from './StateChart';
import { DayRating } from '../types';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredHours: number;
}

const STAR_ACHIEVEMENTS: Achievement[] = [
  { id: 'star_1', title: 'Перша зоря', description: '1 година', icon: '✨', requiredHours: 1 },
  { id: 'star_12', title: 'Зоряний подих', description: '12 годин', icon: '🌟', requiredHours: 12 },
  { id: 'star_24', title: 'Перша доба', description: '24 години', icon: '🌌', requiredHours: 24 },
  { id: 'star_72', title: 'Сузір’я Волі', description: '3 доби', icon: '🌠', requiredHours: 72 },
  { id: 'star_168', title: 'Зоряний Вітер', description: '1 тиждень', icon: '☄️', requiredHours: 168 },
  { id: 'star_360', title: 'Орбітальний Супутник', description: '15 днів', icon: '🛰️', requiredHours: 360 },
  { id: 'star_720', title: 'Місячний Мандрівник', description: '30 днів', icon: '🌙', requiredHours: 720 },
  { id: 'star_2160', title: 'Сонячний Капітан', description: '90 днів', icon: '☀️', requiredHours: 2160 },
  { id: 'star_4380', title: 'Космічний Піонер', description: '180 днів', icon: '🚀', requiredHours: 4380 },
  { id: 'star_8760', title: 'Галактична Легенда', description: '1 рік', icon: '🪐', requiredHours: 8760 },
];

interface CounterTabProps {
  diffMs: number;
  startDate: number;
  money: MoneySettings | null;
  totalSaved: number;
  cigsAvoided: number;
  treeState: TreeState;
  daysCount: number;
  reasons: string[];
  goals?: GoalsState;
  activeGoalName?: string;
  activeGoalPct?: number;
  onOpenSos: () => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onSwitchTab: (tab: any) => void;
  dayRatings: Record<string, DayRating>;
}

export const CounterTab: React.FC<CounterTabProps> = ({
  diffMs,
  startDate,
  money,
  totalSaved,
  cigsAvoided,
  treeState,
  daysCount,
  reasons,
  goals,
  activeGoalName,
  activeGoalPct,
  onOpenSos,
  onOpenSetup,
  onOpenRelapse,
  onSwitchTab,
  dayRatings
}) => {
  const [currentReasonIdx, setCurrentReasonIdx] = React.useState(0);
  const miniCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const miniRafRef = React.useRef<number | null>(null);

  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma !== null && event.beta !== null) {
        const x = Math.max(-5, Math.min(5, event.gamma / 5));
        const y = Math.max(-5, Math.min(5, event.beta / 5));
        setTilt({ x, y });
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const MIN_MS = 60 * 1000;
  const SEC_MS = 1000;

  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diffMs % HOUR_MS) / MIN_MS);
  const seconds = Math.floor((diffMs % MIN_MS) / SEC_MS);

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const todayFact = getTodayHealthFact(diffMs);
  const currentReason = reasons.length > 0 ? reasons[currentReasonIdx % reasons.length] : null;

  const nextReason = () => {
    if (reasons.length > 1) {
      setCurrentReasonIdx((prev) => (prev + 1) % reasons.length);
    }
  };

  const formattedStartDate = React.useMemo(() => {
    try {
      return new Date(startDate).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(startDate).toLocaleString();
    }
  }, [startDate]);

  // Formatted human quit time with Ukrainian declensions
  // e.g. "Ти не куриш 10 днів, 12 годин і 13хв"
  const humanQuitTimeText = React.useMemo(() => {
    const getDaysWord = (d: number) => {
      const m10 = d % 10;
      const m100 = d % 100;
      if (m100 >= 11 && m100 <= 14) return 'днів';
      if (m10 === 1) return 'день';
      if (m10 >= 2 && m10 <= 4) return 'дні';
      return 'днів';
    };

    const getHoursWord = (h: number) => {
      const m10 = h % 10;
      const m100 = h % 100;
      if (m100 >= 11 && m100 <= 14) return 'годин';
      if (m10 === 1) return 'година';
      if (m10 >= 2 && m10 <= 4) return 'години';
      return 'годин';
    };

    if (days > 0) {
      return `${days} ${getDaysWord(days)} ${hours} ${getHoursWord(hours)} ${minutes}хв`;
    }
    if (hours > 0) {
      return `${hours} ${getHoursWord(hours)} ${minutes}хв`;
    }
    return `${Math.max(1, minutes)}хв`;
  }, [days, hours, minutes]);

  // Freedom duration human-readable text

  // Packs avoided human-readable text (e.g. "123.8 пачки", "5 пачок", "1 пачка")
  const packsAvoidedText = React.useMemo(() => {
    if (!money || !money.packSize) return '0 пачок';
    const packs = cigsAvoided / money.packSize;
    const str = packs.toFixed(1);
    if (str.endsWith('.0')) {
      const intVal = Math.round(packs);
      const mod10 = intVal % 10;
      const mod100 = intVal % 100;
      if (mod100 >= 11 && mod100 <= 14) return `${intVal} пачок`;
      if (mod10 === 1) return `${intVal} пачка`;
      if (mod10 >= 2 && mod10 <= 4) return `${intVal} пачки`;
      return `${intVal} пачок`;
    }
    return `${str} пачки`;
  }, [cigsAvoided, money]);

  // Dream economy calculations
  const spentOnDreams = React.useMemo(() => {
    return (goals?.done || []).reduce((acc, g) => acc + (g.total || g.amount), 0);
  }, [goals?.done]);

  const availableForDreams = React.useMemo(() => {
    return Math.max(0, totalSaved - (goals?.base || 0));
  }, [totalSaved, goals?.base]);

  // Sand level badges breakdown
  const sandLevelBadges = React.useMemo(() => {
    const items = getLevelCounts(daysCount).filter(item => item.count > 0).slice(-4).reverse();

    if (items.length === 0) {
      return (
        <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] font-medium">
          🌱 Менше 1 секунди (перша піщинка формується)
        </span>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {items.map((item) => (
          <span
            key={item.level}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/5 dark:bg-black/30 border border-[#B7CDC6]/50 dark:border-[#2d2d35] text-[10px] font-mono font-bold"
            style={{ color: item.config.color }}
          >
            <span>{item.count} × Рівень {item.level}</span>
          </span>
        ))}
      </div>
    );
  }, [daysCount]);

  // Tree stats for clickable card
  const currentTree = treeState.current;
  const currentSpecies = (currentTree && TREE_SPECIES[currentTree.speciesId]) ? TREE_SPECIES[currentTree.speciesId] : TREE_SPECIES.pine;
  const currentStage = currentTree ? getTreeStageInfo(currentTree.growth) : null;
  const treeGrowth = currentTree ? Math.floor(currentTree.growth) : 8;

  // Real sand simulation on the home page card matching actual daysCount
  React.useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 240;
    const h = 48;
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const items = getLevelCounts(daysCount);

    const particles: {
      shape: string;
      color: string;
      glowColor: string;
      size: number;
      baseX: number;
      baseY: number;
      rot: number;
      rotSpeed: number;
      ph: number;
      speed: number;
    }[] = [];

    const grainItems: {
      shape: string;
      color: string;
      glowColor: string;
      size: number;
    }[] = [];

    items.forEach(item => {
      const count = Math.min(item.count, 20);
      for (let i = 0; i < count; i++) {
        grainItems.push({
          shape: item.config.shape,
          color: item.config.color,
          glowColor: item.config.glow,
          size: Math.min(8.5, Math.max(3.5, item.config.size * 0.55))
        });
      }
    });

    if (grainItems.length === 0) {
      grainItems.push({
        shape: 'circle',
        color: '#F59E0B',
        glowColor: '#FDE68A',
        size: 4
      });
    }

    const totalGrains = grainItems.length;
    grainItems.forEach((item, idx) => {
      const xSpacing = totalGrains > 1 ? (w - 40) / (totalGrains - 1) : 0;
      const baseX = totalGrains > 1 ? 20 + idx * xSpacing : w / 2;
      const baseY = h / 2 + Math.sin(idx * 1.8) * 5;
      particles.push({
        ...item,
        baseX,
        baseY,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 1.2,
        ph: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.7
      });
    });

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.035;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const px = p.baseX + Math.sin(t * p.speed + p.ph) * 3;
        const py = p.baseY + Math.cos(t * p.speed * 0.85 + p.ph) * 3;
        const rot = p.rot + t * p.rotSpeed;

        drawGlowingGrain(ctx, p.shape, px, py, p.size, rot, p.color, p.glowColor, 8);
      }

      miniRafRef.current = requestAnimationFrame(render);
    };

    render();

    const handleVis = () => {
      if (document.hidden) {
        if (miniRafRef.current) {
          cancelAnimationFrame(miniRafRef.current);
          miniRafRef.current = null;
        }
      } else {
        if (!miniRafRef.current) {
          render();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      if (miniRafRef.current) cancelAnimationFrame(miniRafRef.current);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, [daysCount]);

  return (
    <div className="flex flex-col flex-1 pb-6 max-w-md mx-auto w-full">
      {/* 1. ТАЙМЕР */}
      <div 
        className="mb-6 p-4 flex flex-col justify-center items-center relative"
        style={{
          transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <canvas 
          ref={miniCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#1E8A69] to-[#4CC9A0] bg-clip-text text-transparent tracking-tight tabular-nums whitespace-nowrap animate-breathing">
          {humanQuitTimeText}
        </h1>

        {/* Current active star badge under timer */}
        {(() => {
          const totalHours = diffMs / (3600 * 1000);
          const unlocked = STAR_ACHIEVEMENTS.filter((ach) => totalHours >= ach.requiredHours);
          const currentBadge = unlocked.length > 0 ? unlocked[unlocked.length - 1] : STAR_ACHIEVEMENTS[0];
          return (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#1E8A69]/30 dark:border-[#4CC9A0]/30 rounded-full shadow-xs backdrop-blur-xs">
              <span className="text-base">{currentBadge.icon}</span>
              <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                {currentBadge.title}
              </span>
              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] font-mono">
                ({currentBadge.description})
              </span>
            </div>
          );
        })()}
      </div>

      {/* 2. ЕКОНОМІЧНА СКЛАДОВА / МРІЇ */}
      <div className="mb-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
        <div className="grid grid-cols-3 gap-2">
          {/* 1. ЗАОЩАДЖЕНО */}
          <button
            type="button"
            onClick={() => onSwitchTab('money')}
            className="p-2 rounded-xl bg-[#1E8A69]/5 hover:bg-[#1E8A69]/10 text-center transition-all cursor-pointer group"
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
              Заощаджено
            </span>
            <span className="text-sm font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0] block">
              {Math.floor(totalSaved).toLocaleString('uk-UA')} грн
            </span>
          </button>

          {/* 3. ВИТРАЧЕНО НА МРІЇ */}
          <button
            type="button"
            onClick={() => onSwitchTab('money')}
            className="p-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-center transition-all cursor-pointer group"
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
              Витрачено
            </span>
            <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 block">
              {Math.floor(spentOnDreams).toLocaleString('uk-UA')} грн
            </span>
          </button>

          {/* 4. ДОСТУПНО НА МРІЇ */}
          <button
            type="button"
            onClick={() => onSwitchTab('money')}
            className="p-2 rounded-xl bg-[#1E8A69]/10 hover:bg-[#1E8A69]/20 text-center transition-all cursor-pointer group"
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1E8A69] dark:text-[#4CC9A0] block mb-0.5">
              Доступно
            </span>
            <span className="text-sm font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0] block">
              {Math.floor(availableForDreams).toLocaleString('uk-UA')} грн
            </span>
          </button>
        </div>
      </div>

      {/* АКТУАЛЬНА ЦІЛЬ */}
      {/* 3. ІНФОРМАЦІЯ ПРО ПОТОЧНИЙ ЕТАП ЗДОРОВ'Я */}
      <div
        onClick={() => onSwitchTab('health')}
        className="mb-4 p-3.5 bg-gradient-to-r from-[#1E8A69]/10 to-[#5B54C8]/10 dark:from-[#4CC9A0]/15 dark:to-[#A29BFF]/15 border border-[#1E8A69]/25 dark:border-[#4CC9A0]/30 rounded-2xl cursor-pointer hover:border-[#1E8A69]/50 transition-all flex items-start gap-3 group shadow-xs"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-[#1c1c21] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs flex-none mt-0.5">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E8A69] dark:text-[#4CC9A0]">
              Тіло відновлюється
            </span>
            <span className="text-xs text-[#55726B] dark:text-[#8FAAA3] group-hover:underline font-medium">
              {Math.min(100, Math.floor((daysCount / 365) * 100))}%
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#12302B] dark:text-[#f4f4f5]">
            {todayFact}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#1E8A69] dark:text-[#4CC9A0] font-semibold">
            <span className="opacity-80">Наступний рубіж:</span>
            <span className="bg-[#1E8A69]/10 px-1.5 py-0.5 rounded-md">
              {daysCount < 30 ? '30 днів' : daysCount < 90 ? '90 днів' : '1 рік'}
            </span>
          </div>
          {/* Progress bar for lung health */}
          <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-[#1E8A69] to-[#4CC9A0] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (daysCount / 365) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5. ДОСЯГНЕННЯ */}
      <div className="mb-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
            Досягнення
          </h3>
          <span className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
            {HEALTH_MILESTONES.filter(m => m.t <= diffMs).length} / {HEALTH_MILESTONES.length}
          </span>
        </div>
        
        <div className="space-y-4">
          {(() => {
            // Show latest completed and next few upcoming
            const completed = HEALTH_MILESTONES.filter(m => m.t <= diffMs).slice(-1);
            const upcoming = HEALTH_MILESTONES.filter(m => m.t > diffMs).slice(0, 2);
            
            return [...completed, ...upcoming].map((m, idx) => {
              const isCompleted = m.t <= diffMs;
              const prevMilestoneTime = [...HEALTH_MILESTONES].reverse().find((prev: any) => prev.t < m.t)?.t || 0;
              const totalDuration = m.t - prevMilestoneTime;
              const passedDuration = Math.min(totalDuration, diffMs - prevMilestoneTime);
              const pct = isCompleted ? 100 : Math.min(100, Math.max(0, (passedDuration / totalDuration) * 100));

              return (
                <div key={m.id} className={isCompleted ? 'opacity-70' : ''}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xl">{isCompleted ? <Check className="w-5 h-5 text-[#1E8A69]" /> : m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                        {m.title}
                      </p>
                      {!isCompleted && <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">{Math.round(pct)}%</p>}
                    </div>
                    {!isCompleted && <Lock className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />}
                  </div>
                  {!isCompleted && (
                    <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>

      <div className="mb-4 p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Піщинки часу: {daysCount}
          </h3>
        </div>

        {/* Interactive glowing sand particles canvas */}
        <div
          onClick={() => onSwitchTab('sand')}
          className="relative h-14 w-full bg-[#CBDDD7]/30 dark:bg-[#1D3832]/40 rounded-xl overflow-hidden mb-2.5 border border-[#B7CDC6]/40 dark:border-[#2d2d35]/40 cursor-pointer group"
          title="Натисніть для переходу в кімнату медитації піщинок"
        >
          <canvas ref={miniCanvasRef} className="w-full h-full block" />
        </div>
        
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
          Це візуалізація вашого часу без паління. Об'єднюйте піщинки у кристали.
        </p>
      </div>

      {/* 5. КАРПАТСЬКА СОСНА (З АНІМАЦІЄЮ ХИТАННЯ ВЕРХІВОК ДЕРЕВ) */}
      <button
        type="button"
        onClick={() => onSwitchTab('tree')}
        className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#112723] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                {currentSpecies.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E8A69]/10 text-[#1E8A69] dark:text-[#4CC9A0] font-bold">
                {treeGrowth}% ріст
              </span>
            </div>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-1">
              {currentTree
                ? `Етап: ${currentStage?.name || 'Ріст'} • Торкніться для догляду`
                : 'Посадіть сосну в саду та доглядайте за нею'}
            </p>
            <span className="text-[11px] text-[#1E8A69] dark:text-[#4CC9A0] font-medium flex items-center gap-1">
              <span>{currentSpecies.symbol}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Animated Swaying Carpathian Pine Tree Illustration */}
          <div className="relative w-24 h-24 flex-none flex items-center justify-center">
            {/* Gentle mountain breeze lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <path
                d="M10,25 Q35,18 60,24 T95,22"
                fill="none"
                stroke="#4CC9A0"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-breeze opacity-60"
              />
              <path
                d="M5,50 Q30,44 55,50 T90,46"
                fill="none"
                stroke="#1E8A69"
                strokeWidth="1"
                strokeDasharray="3 5"
                className="animate-breeze opacity-40"
                style={{ animationDelay: '1.4s' }}
              />
            </svg>

            {/* Carpathian Pine SVG with swaying branches and crown */}
            <svg
              viewBox="0 0 120 140"
              className="w-full h-full drop-shadow-sm select-none"
              style={{ overflow: 'visible' }}
            >
              {/* Mountain Earth Base */}
              <ellipse cx="60" cy="132" rx="42" ry="6" fill="#85532F" opacity="0.25" />
              <ellipse cx="60" cy="130" rx="34" ry="4" fill="#15803D" opacity="0.4" />

              {/* Secondary distant smaller pine swaying */}
              <g transform="translate(80, 66) scale(0.42)" className="animate-pine-crown" style={{ animationDelay: '1s' }}>
                <rect x="26" y="65" width="8" height="30" fill="#664C35" rx="3" />
                <polygon points="30,10 5,60 55,60" fill="#1B6B45" opacity="0.8" />
                <polygon points="30,30 0,80 60,80" fill="#15803D" opacity="0.75" />
              </g>

              {/* Main Tree Trunk */}
              <path d="M56,86 L54,130 L66,130 L64,86 Z" fill="#6B4829" />
              <path d="M58,94 L57,125" stroke="#4D331B" strokeWidth="1.5" strokeLinecap="round" />

              {/* Tier 1: Bottom Lush Pine Branches */}
              <g>
                <polygon
                  points="60,65 18,105 44,103 30,118 90,118 76,103 102,105"
                  fill="#145A32"
                />
                <polygon
                  points="60,65 24,102 46,100 36,114 84,114 74,100 96,102"
                  fill="#1B6B45"
                />
              </g>

              {/* Tier 2: Mid Pine Branches (gentle swaying) */}
              <g className="animate-pine-mid">
                <polygon
                  points="60,42 26,78 48,76 38,88 82,88 72,76 94,78"
                  fill="#1B6B45"
                />
                <polygon
                  points="60,42 32,75 50,73 42,84 78,84 70,73 88,75"
                  fill="#228B53"
                />
              </g>

              {/* Tier 3: Top Pine Crown / "Верхівка дерева" (distinct swaying in wind) */}
              <g className="animate-pine-crown">
                <polygon
                  points="60,12 36,52 50,50 42,60 78,60 70,50 84,52"
                  fill="#228B53"
                />
                <polygon
                  points="60,12 42,48 52,47 46,56 74,56 68,47 78,48"
                  fill="#2F9360"
                />
                {/* Tip Apex Needle Star */}
                <circle cx="60" cy="12" r="2.5" fill="#4CC9A0" opacity="0.9" />
                <polygon points="60,6 62,12 60,10 58,12" fill="#86EFAC" />
              </g>
            </svg>
          </div>
        </div>
      </button>

      <StateChart days={dayRatings} />
    </div>
  );
};
