import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Minimize2, 
  Maximize2, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import { getBodySystemsRecovery, HEALTH_MILESTONES, getTodayHealthFact } from '../data/healthData';

interface HealthRecoveryWidgetProps {
  diffMs: number;
  startDate: number;
  accent?: string;
  onOpenFullHealth: () => void;
}

const STORAGE_KEY = 'quit-smoking:health-widget-display-mode'; // 'expanded' | 'compact' | 'hidden'

export const HealthRecoveryWidget: React.FC<HealthRecoveryWidgetProps> = ({
  diffMs,
  startDate,
  accent = 'green',
  onOpenFullHealth
}) => {
  const [displayMode, setDisplayMode] = useState<'expanded' | 'compact' | 'hidden'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'compact' || saved === 'hidden' || saved === 'expanded') {
        return saved;
      }
    } catch {}
    return 'expanded';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, displayMode);
    } catch {}
  }, [displayMode]);

  // Calculations
  const allSystems = getBodySystemsRecovery(diffMs);
  const activeSystems = allSystems.filter((s) => s.progress < 100);
  const currentStage = activeSystems.length > 0 ? activeSystems[0] : allSystems[allSystems.length - 1];
  
  // Total overall average recovery
  const avgRecovery = Math.round(allSystems.reduce((acc, s) => acc + s.progress, 0) / allSystems.length);

  // Next WHO Medical Milestone
  const nextMilestone = HEALTH_MILESTONES.find((m) => m.t > diffMs) || HEALTH_MILESTONES[HEALTH_MILESTONES.length - 1];
  const isMilestoneCompleted = nextMilestone.t <= diffMs;
  const prevMilestoneTime = [...HEALTH_MILESTONES].reverse().find((prev) => prev.t < nextMilestone.t)?.t || 0;
  const totalMilestoneDuration = nextMilestone.t - prevMilestoneTime;
  const currentMilestoneProgress = isMilestoneCompleted 
    ? 100 
    : Math.min(100, Math.max(0, ((diffMs - prevMilestoneTime) / (totalMilestoneDuration || 1)) * 100));

  const msLeft = nextMilestone.t - diffMs;
  let milestoneTimeText = '';
  if (isMilestoneCompleted) {
    milestoneTimeText = 'Досягнуто 🎉';
  } else {
    const hoursLeft = msLeft / (1000 * 60 * 60);
    if (hoursLeft < 24) {
      milestoneTimeText = `ще ${Math.ceil(hoursLeft)} год.`;
    } else {
      const daysLeft = Math.ceil(hoursLeft / 24);
      milestoneTimeText = `ще ${daysLeft} дн.`;
    }
  }

  const todayFact = getTodayHealthFact(diffMs);

  // Key spotlight systems
  const keySystems = allSystems.filter(s => 
    s.name.includes('Бронх') || 
    s.name.includes('Серцево') || 
    s.name.includes('Дофамін') || 
    s.name.includes('Легені')
  ).slice(0, 4);

  // Accent helper styles
  const getAccentText = () => {
    switch (accent) {
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      case 'gray': return 'text-slate-600 dark:text-slate-400';
      case 'amber': return 'text-amber-600 dark:text-amber-400';
      case 'rose': return 'text-rose-600 dark:text-rose-400';
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'teal': return 'text-teal-600 dark:text-teal-400';
      case 'sage': return 'text-stone-600 dark:text-stone-400';
      case 'green':
      default: return 'text-[#1E8A69] dark:text-[#4CC9A0]';
    }
  };

  const getAccentBg = () => {
    switch (accent) {
      case 'indigo': return 'bg-indigo-500/10 dark:bg-indigo-400/15';
      case 'gray': return 'bg-slate-500/10 dark:bg-slate-400/15';
      case 'amber': return 'bg-amber-500/10 dark:bg-amber-400/15';
      case 'rose': return 'bg-rose-500/10 dark:bg-rose-400/15';
      case 'emerald': return 'bg-emerald-500/10 dark:bg-emerald-400/15';
      case 'teal': return 'bg-teal-500/10 dark:bg-teal-400/15';
      case 'sage': return 'bg-stone-500/10 dark:bg-stone-400/15';
      case 'green':
      default: return 'bg-[#1E8A69]/10 dark:bg-[#1E8A69]/20';
    }
  };

  const getAccentBorder = () => {
    switch (accent) {
      case 'indigo': return 'border-indigo-500/30 dark:border-indigo-400/30';
      case 'gray': return 'border-slate-400/30 dark:border-slate-500/30';
      case 'amber': return 'border-amber-500/30 dark:border-amber-400/30';
      case 'rose': return 'border-rose-500/30 dark:border-rose-400/30';
      case 'emerald': return 'border-emerald-500/30 dark:border-emerald-400/30';
      case 'teal': return 'border-teal-500/30 dark:border-teal-400/30';
      case 'sage': return 'border-stone-500/30 dark:border-stone-400/30';
      case 'green':
      default: return 'border-emerald-600/30 dark:border-emerald-400/30';
    }
  };

  // If closed / hidden completely
  if (displayMode === 'hidden') {
    return (
      <div className="mt-3 flex items-center justify-between py-1.5 px-3 bg-slate-100/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 rounded-xl text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
          <span>Віджет здоров'я приховано</span>
        </div>
        <button
          type="button"
          onClick={() => setDisplayMode('expanded')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Показати</span>
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // If compact / minimized
  if (displayMode === 'compact') {
    return (
      <div className={`mt-3 p-3 bg-white/70 dark:bg-[#1c1c21]/70 border ${getAccentBorder()} rounded-2xl shadow-xs transition-all`}>
        <div className="flex items-center justify-between gap-2">
          <div 
            onClick={onOpenFullHealth}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer group"
          >
            <span className="text-lg flex-none animate-pulse">{currentStage.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-bold text-slate-800 dark:text-[#f4f4f5] truncate group-hover:${getAccentText()} transition-colors`}>
                  {currentStage.name}
                </span>
                <span className={`text-[10px] font-mono font-bold ${getAccentText()} flex-none`}>
                  {currentStage.progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${currentStage.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-none ml-1">
            <button
              type="button"
              onClick={() => setDisplayMode('expanded')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              title="Розгорнути детальний віджет"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('hidden')}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
              title="Закрити віджет"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full Expanded Detailed Widget
  return (
    <div className={`mt-3 p-4 bg-white/80 dark:bg-[#1c1c21]/80 border ${getAccentBorder()} rounded-2xl shadow-xs transition-all relative overflow-hidden`}>
      {/* Top Header with title and controls */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-xl ${getAccentBg()} ${getAccentText()} flex items-center justify-center flex-none`}>
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-[#f4f4f5] flex items-center gap-1.5">
              <span>Відновлення організму</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${getAccentBg()} ${getAccentText()}`}>
                Загалом {avgRecovery}%
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-[#8FAAA3]">
              Поточний біологічний етап та медичні маркери ВООЗ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 flex-none">
          <button
            type="button"
            onClick={() => setDisplayMode('compact')}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            title="Мінімізувати віджет"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('hidden')}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
            title="Закрити віджет (завжди доступно у «Ще»)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. ПОТОЧНИЙ АКТИВНИЙ БІОЛОГІЧНИЙ ЕТАП (ДЕТАЛЬНИЙ) */}
      <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 mb-2.5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl flex-none">{currentStage.icon}</span>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                Активна фаза відновлення
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-[#f4f4f5] truncate">
                {currentStage.name}
              </h4>
            </div>
          </div>
          <div className="text-right flex-none">
            <span className={`text-xs font-mono font-bold ${getAccentText()}`}>
              {currentStage.progress.toFixed(1)}%
            </span>
            <span className="block text-[9px] text-slate-400 font-medium">
              {currentStage.timeRemainingText}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {currentStage.description}
        </p>
      </div>

      {/* 2. НАЙБЛИЖЧИЙ МЕДИЧНИЙ РУБІЖ ВООЗ */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-teal-500/5 dark:from-teal-950/20 dark:to-emerald-950/20 border border-teal-500/20 dark:border-teal-500/20 mb-2.5">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base flex-none">{nextMilestone.icon}</span>
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider block">
                Медичний рубіж ВООЗ
              </span>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {nextMilestone.title}
              </h5>
            </div>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 flex-none">
            {currentMilestoneProgress.toFixed(0)}% • {milestoneTimeText}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-teal-500 to-emerald-400"
            style={{ width: `${currentMilestoneProgress}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-500 dark:text-[#8FAAA3] leading-tight">
          💡 <span className="italic">{nextMilestone.medicalFact}</span>
        </p>
      </div>

      {/* 3. КЛЮЧОВІ ОРГАНИ ТА СИСТЕМИ (МІНІ-СІТКА) */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {keySystems.map((sys) => (
          <div 
            key={sys.name}
            className="p-2 rounded-lg bg-slate-50/60 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 flex items-center gap-2"
          >
            <span className="text-sm flex-none">{sys.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[10px] mb-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {sys.name.split(' ')[0]}
                </span>
                <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                  {Math.round(sys.progress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-500/80 transition-all duration-300"
                  style={{ width: `${sys.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ФАКТ ДНЯ ТА ПЕРЕХІД ДО ПОВНОЇ ВКЛАДКИ */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-none" />
          <p className="text-[10px] text-slate-600 dark:text-slate-300 italic truncate" title={todayFact}>
            «{todayFact}»
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFullHealth}
          className={`text-[11px] font-bold ${getAccentText()} hover:underline flex items-center gap-1 flex-none cursor-pointer`}
        >
          <span>Усі 10 систем</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
