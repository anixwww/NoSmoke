import React, { useState, useEffect } from 'react';
import { Zap, Timer, Gift, CheckCircle2, Plus, X, Trophy, Sparkles, Clock, RotateCcw, Coffee, Smile, Minimize2, Maximize2 } from 'lucide-react';

interface QuickGoal {
  id: string;
  title: string;
  createdAt: number;
  targetTime: number;
  isCompleted?: boolean;
  claimedAt?: number;
}

interface QuickGoalCardProps {
  accent?: string;
  startDate?: number; // timestamp of quit or last relapse
}

const STORAGE_KEY = 'quit-smoking:quick-goal';

export const QuickGoalCard: React.FC<QuickGoalCardProps> = ({ accent = 'amber', startDate }) => {
  const [quickGoal, setQuickGoal] = useState<QuickGoal | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [isCompact, setIsCompact] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:use-compact-quick-goals') === 'true' || localStorage.getItem('quit-smoking:use-compact-goals') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCompact = () => {
    const nextVal = !isCompact;
    setIsCompact(nextVal);
    try {
      localStorage.setItem('quit-smoking:use-compact-quick-goals', String(nextVal));
      window.dispatchEvent(new Event('compact-goals-change'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  useEffect(() => {
    const handleCompactChange = () => {
      try {
        const compactQuick = localStorage.getItem('quit-smoking:use-compact-quick-goals');
        const compactMain = localStorage.getItem('quit-smoking:use-compact-goals');
        setIsCompact(compactQuick === 'true' || (compactQuick === null && compactMain === 'true'));
      } catch {}
    };
    window.addEventListener('storage', handleCompactChange);
    window.addEventListener('compact-goals-change', handleCompactChange);
    return () => {
      window.removeEventListener('storage', handleCompactChange);
      window.removeEventListener('compact-goals-change', handleCompactChange);
    };
  }, []);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDurationHours, setSelectedDurationHours] = useState(3);
  const [targetTimeString, setTargetTimeString] = useState('');
  const [useSpecificTime, setUseSpecificTime] = useState(false);

  // Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save quick goal to local storage
  const saveGoal = (goal: QuickGoal | null) => {
    setQuickGoal(goal);
    try {
      if (goal) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartGoal = (title: string, durationMs: number) => {
    const creation = Date.now();
    const newGoal: QuickGoal = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim() || 'Смачненька винагорода 🎁',
      createdAt: creation,
      targetTime: creation + durationMs,
      isCompleted: false,
    };
    saveGoal(newGoal);
    setIsModalOpen(false);
    setCustomTitle('');
  };

  const handleStartWithSpecificTime = (title: string, time24h: string) => {
    if (!time24h) return;
    const [hours, minutes] = time24h.split(':').map(Number);
    const creation = Date.now();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // If time is earlier today, set for tomorrow (within 24h)
    if (targetDate.getTime() <= creation) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Ensure max 24 hours
    const maxTarget = creation + 24 * 60 * 60 * 1000;
    const finalTarget = Math.min(targetDate.getTime(), maxTarget);

    const newGoal: QuickGoal = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim() || 'Смачненька винагорода 🎁',
      createdAt: creation,
      targetTime: finalTarget,
      isCompleted: false,
    };
    saveGoal(newGoal);
    setIsModalOpen(false);
    setCustomTitle('');
  };

  const handleClaimReward = () => {
    if (!quickGoal) return;
    saveGoal(null);
  };

  const handleCancelGoal = () => {
    saveGoal(null);
  };

  // Check if relapse occurred after creating this quick goal
  const isFailed = Boolean(
    quickGoal && startDate && startDate > quickGoal.createdAt && !quickGoal.isCompleted
  );

  // Time remaining logic
  let timeLeftMs = 0;
  let isReached = false;
  let progressPct = 0;

  if (quickGoal) {
    timeLeftMs = Math.max(0, quickGoal.targetTime - now);
    isReached = now >= quickGoal.targetTime;
    const totalDuration = quickGoal.targetTime - quickGoal.createdAt;
    const elapsed = now - quickGoal.createdAt;
    progressPct = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 100;
  }

  const formatTimeLeft = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  };

  const formatTargetTime = (timeMs: number) => {
    const d = new Date(timeMs);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="mt-3">
      {/* COMPACT VIEW */}
      {isCompact ? (
        !quickGoal ? (
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-pink-500/15 dark:from-fuchsia-950/40 dark:via-purple-950/30 dark:to-pink-950/40 border border-fuchsia-400/40 dark:border-fuchsia-500/30 rounded-xl hover:border-fuchsia-500/60 transition-all active:scale-[0.99] text-left relative overflow-hidden flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-1.5 relative z-10 text-[11px] font-semibold text-fuchsia-700 dark:text-fuchsia-300">
              <Zap className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />
              <span>Швидка ціль: Натисніть, щоб задати ✨</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 relative z-10">
              <span className="text-[10px] text-fuchsia-600 dark:text-fuchsia-400 font-mono font-bold">
                до 24 год
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompact();
                }}
                className="p-1 text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 cursor-pointer rounded-lg hover:bg-fuchsia-500/10 transition-colors"
                title="Розгорнути швидку ціль"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isFailed ? (
          <div className="w-full py-1.5 px-2.5 bg-rose-500/10 dark:bg-rose-950/30 border border-rose-400/30 rounded-xl flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 truncate">
              💔 Зрив швидкої цілі
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCancelGoal}
                className="py-0.5 px-2 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Скинути</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompact();
                }}
                className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded-lg transition-colors"
                title="Розгорнути"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isReached ? (
          <div className="w-full py-1.5 px-2.5 bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-1.5 min-w-0">
              <Trophy className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate">
                🎉 {quickGoal.title}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleClaimReward}
                className="py-0.5 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shrink-0 cursor-pointer shadow-xs"
              >
                Забрати 🎁
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompact();
                }}
                className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer rounded-lg transition-colors"
                title="Розгорнути"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-pink-500/15 dark:from-fuchsia-950/40 dark:via-purple-950/30 dark:to-pink-950/40 border border-fuchsia-400/40 dark:border-fuchsia-500/30 rounded-xl hover:border-fuchsia-500/60 transition-all active:scale-[0.99] text-left relative overflow-hidden flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1 relative z-10">
              <Zap className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-[#f4f4f5] truncate">
                {quickGoal.title}
              </span>
              <div className="w-12 h-1 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 relative z-10 font-mono text-[10px] font-bold">
              <span className="text-fuchsia-600 dark:text-fuchsia-300">{formatTimeLeft(timeLeftMs)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompact();
                }}
                className="p-1 text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 cursor-pointer rounded-lg hover:bg-fuchsia-500/10 transition-colors ml-0.5"
                title="Розгорнути"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* FULL CARD VIEW */
        <div
          className="p-3.5 bg-gradient-to-r from-fuchsia-500/15 via-purple-500/10 to-pink-500/15 dark:from-fuchsia-950/40 dark:via-purple-950/30 dark:to-pink-950/40 border border-fuchsia-400/40 dark:border-fuchsia-500/30 rounded-2xl shadow-2xs relative overflow-hidden transition-all cursor-pointer hover:border-fuchsia-500/60 hover:scale-[1.01] active:scale-[0.99]"
          onClick={() => setIsModalOpen(true)}
        >
          {/* Glowing dopamine highlight background */}
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-fuchsia-400/20 dark:bg-fuchsia-500/15 rounded-full blur-xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-white/20" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-[#f4f4f5] flex items-center gap-1.5">
                  <span>Швидка ціль</span>
                  <span className="text-[9px] font-semibold lowercase bg-fuchsia-500/20 dark:bg-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 px-1.5 py-0.2 rounded-full border border-fuchsia-400/30">
                    до 24 год
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompact();
                }}
                className="p-1 text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-300 cursor-pointer rounded-lg hover:bg-fuchsia-500/10 transition-colors"
                title="Мінімізувати швидку ціль"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CONTENT STATE */}
          {!quickGoal ? (
            /* NO ACTIVE GOAL */
            <div className="relative z-10 space-y-1">
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Умова: втримайтесь від сигарет декілька годин і отримайте винагороду!
              </p>
              <div className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-1 pt-0.5">
                <Sparkles className="w-3 h-3 animate-pulse text-pink-500" />
                <span>Натисніть, щоб задати власну ціль та час ✨</span>
              </div>
            </div>
          ) : isFailed ? (
            /* FAILED GOAL DUE TO RELAPSE */
            <div className="relative z-10 space-y-2 py-1 text-center">
              <div className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-300">
                Нічого страшного! Зрив відбувся, але ви можете спробувати ще раз.
              </div>
              <button
                type="button"
                onClick={handleCancelGoal}
                className="py-1.5 px-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Скинути та розпочати нову</span>
              </button>
            </div>
          ) : isReached ? (
            /* GOAL COMPLETED / REWARD READY */
            <div className="relative z-10 space-y-2.5 py-1 animate-fade-in">
              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                <Trophy className="w-5 h-5 text-emerald-500 shrink-0 animate-bounce" />
                <div>
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    🎉 Вітаємо! Швидка ціль досягнута!
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
                    Винагорода: {quickGoal.title}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimReward}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Отримано! Насолоджуйтесь 🎉</span>
              </button>
            </div>
          ) : (
            /* ACTIVE GOAL COUNTDOWN */
            <div className="relative z-10 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <span>🎁 {quickGoal.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-fuchsia-500" />
                    <span>Умова: не курити до {formatTargetTime(quickGoal.targetTime)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-500/15 dark:bg-fuchsia-500/25 px-2 py-1 rounded-lg border border-fuchsia-400/30">
                    {formatTimeLeft(timeLeftMs)}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">залишилось</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 transition-all duration-1000"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Прогрес стриманості</span>
                  <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">{Math.floor(progressPct)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE / VIEW QUICK GOAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {quickGoal ? (
              /* ACTIVE QUICK GOAL DETAILS IN MODAL */
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-xs">
                    <Zap className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Поточна швидка ціль
                    </h3>
                    <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-medium">
                      Деталі та прогрес стриманості ⚡
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/5 to-purple-500/10 dark:from-fuchsia-950/40 dark:via-pink-950/20 dark:to-purple-950/30 border border-fuchsia-400/30 dark:border-fuchsia-500/30 rounded-2xl mb-4 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-fuchsia-700 dark:text-fuchsia-300 block mb-0.5">
                      Винагорода
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      🎁 {quickGoal.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-fuchsia-500/20">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Не курити до
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatTargetTime(quickGoal.targetTime)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Залишилось
                      </span>
                      <span className="text-sm font-bold font-mono text-fuchsia-600 dark:text-fuchsia-300">
                        {formatTimeLeft(timeLeftMs)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-fuchsia-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Прогрес стриманості</span>
                      <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 font-mono">
                        {Math.floor(progressPct)}%
                      </span>
                    </div>
                  </div>
                </div>

                {isReached && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClaimReward();
                      setIsModalOpen(false);
                    }}
                    className="w-full py-2.5 mb-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Забрати винагороду 🎉</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleCancelGoal();
                    setIsModalOpen(false);
                  }}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-400/30 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
                >
                  <X className="w-4 h-4" />
                  <span>Скасувати швидку ціль</span>
                </button>
              </div>
            ) : (
              /* CREATE NEW QUICK GOAL FORM */
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-xs">
                    <Zap className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      Нова швидка ціль
                    </h3>
                    <p className="text-xs text-fuchsia-600 dark:text-fuchsia-400 font-medium">
                      Дофамінова винагорода (до 24 годин) ✨
                    </p>
                  </div>
                </div>

                {/* Time mode selection */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      1. Оберіть час стриманості
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[1, 2, 3, 5, 8, 12, 18, 24].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => {
                            setSelectedDurationHours(hrs);
                            setUseSpecificTime(false);
                          }}
                          className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            !useSpecificTime && selectedDurationHours === hrs
                              ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-fuchsia-500 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {hrs} {hrs === 1 ? 'годинa' : hrs < 5 ? 'години' : 'годин'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="specific-time"
                        checked={useSpecificTime}
                        onChange={(e) => setUseSpecificTime(e.target.checked)}
                        className="rounded border-slate-300 text-fuchsia-500 focus:ring-fuchsia-500 cursor-pointer"
                      />
                      <label htmlFor="specific-time" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        Або вкажіть конкретний час на сьогодні/завтра
                      </label>
                    </div>

                    {useSpecificTime && (
                      <input
                        type="time"
                        value={targetTimeString}
                        onChange={(e) => setTargetTimeString(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
                      />
                    )}
                  </div>

                  {/* Reward selection */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                      2. Чим себе винагородите?
                    </label>

                    <input
                      type="text"
                      placeholder="Введіть винагороду (наприклад: Смачний лимонад 🍋)"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (useSpecificTime && targetTimeString) {
                      handleStartWithSpecificTime(customTitle, targetTimeString);
                    } else {
                      handleStartGoal(customTitle, selectedDurationHours * 3600 * 1000);
                    }
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-md active:scale-95"
                >
                  Запустити швидку ціль ⚡
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
