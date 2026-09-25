import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

const getTodayKey = () => {
  const d = new Date();
  return `quit-smoking:hydration-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface HydrationCardProps {
  onUpdate?: () => void;
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ onUpdate }) => {
  const storageKey = getTodayKey();
  const goalStorageKey = 'quit-smoking:hydration-goal';
  const showIndicatorKey = 'quit-smoking:hydration-show-indicator';

  const [goalMl, setGoalMl] = useState<number>(() => {
    try {
      const savedGoal = localStorage.getItem(goalStorageKey);
      if (savedGoal !== null) return parseInt(savedGoal, 10) || 2000;
    } catch {}
    return 2000;
  });

  const [showIndicator, setShowIndicator] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(showIndicatorKey);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // default enabled
  });

  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempGoalInput, setTempGoalInput] = useState<string>(goalMl.toString());

  const [currentMl, setCurrentMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) return parseInt(saved, 10) || 0;
    } catch {}
    return 0;
  });

  const [showTip, setShowTip] = useState<boolean>(false);

  // Persist current ml
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, currentMl.toString());
    } catch {}
    onUpdate?.();
  }, [currentMl, storageKey, onUpdate]);

  // Persist goal ml
  useEffect(() => {
    try {
      localStorage.setItem(goalStorageKey, goalMl.toString());
    } catch {}
    onUpdate?.();
  }, [goalMl, onUpdate]);

  // Persist showIndicator
  useEffect(() => {
    try {
      localStorage.setItem(showIndicatorKey, showIndicator.toString());
    } catch {}
    onUpdate?.();
  }, [showIndicator, onUpdate]);

  const addWater = (amount: number) => {
    setCurrentMl((prev) => Math.max(0, Math.min(10000, prev + amount)));
  };

  const handleReset = () => {
    setCurrentMl(0);
  };

  const saveGoal = () => {
    const parsed = parseInt(tempGoalInput, 10);
    if (!isNaN(parsed) && parsed >= 500 && parsed <= 10000) {
      setGoalMl(parsed);
    }
    setIsEditingGoal(false);
  };

  const progressPct = Math.min(100, Math.round((currentMl / goalMl) * 100));
  const isGoalReached = currentMl >= goalMl;

  return (
    <div className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs transition-all mb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Гідратація: Очищення водою
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Прискорює виведення токсинів та притуплює тягу
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTip(!showTip)}
          className="p-1.5 text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5] rounded-lg transition-colors cursor-pointer"
          title="Чому вода важлива"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Tip Banner */}
      {showTip && (
        <div className="mb-3 p-3 bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/20 rounded-xl text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
          <strong className="text-[#12302B] dark:text-[#f4f4f5]">Медичний факт:</strong> Вода
          стимулює роботу нирок, які виводять нікотиновий метаболіт (котинін). Крім того, кожен
          ковток прохолодної води рефлекторно перемикає центр задоволення в мозку, полегшуючи гострий позив закурити.
        </div>
      )}

      {/* Toggle Indicator Switch */}
      <div className="mb-3 px-3 py-2 bg-[#CBDDD7]/15 dark:bg-[#1D3832]/20 border border-[#B7CDC6]/30 dark:border-[#2A4A43]/40 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] block">
            Індикатор на головному екрані
          </span>
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
            Показувати відсоток гідратації під таймером
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowIndicator(!showIndicator)}
          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            showIndicator ? 'bg-[#1E8A69] dark:bg-[#4CC9A0]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              showIndicator ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Progress & Visual Area */}
      <div className="flex items-center gap-4 p-3 bg-[#CBDDD7]/20 dark:bg-[#1D3832]/20 rounded-2xl border border-[#B7CDC6]/40 dark:border-[#2A4A43]/40 mb-3">
        {/* Animated Water Fill Glass */}
        <div className="relative w-14 h-20 bg-white/60 dark:bg-black/40 border-2 border-sky-400/50 rounded-b-2xl rounded-t-sm overflow-hidden flex-none shadow-xs">
          <div
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-sky-600 to-sky-400 transition-all duration-500 ease-out"
            style={{ height: `${progressPct}%` }}
          >
            {/* Wave crest */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-white/30 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold font-mono text-[#12302B] dark:text-white drop-shadow-xs">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Text Metrics */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                {currentMl}
              </span>
              <span className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                / {goalMl} мл
              </span>
            </div>

            {!isEditingGoal ? (
              <button
                type="button"
                onClick={() => {
                  setTempGoalInput(goalMl.toString());
                  setIsEditingGoal(true);
                }}
                className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                Змінити норму
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={500}
                  max={10000}
                  step={100}
                  value={tempGoalInput}
                  onChange={(e) => setTempGoalInput(e.target.value)}
                  className="w-16 text-xs px-1.5 py-0.5 bg-white dark:bg-black/40 border border-sky-400 rounded text-center font-mono text-[#12302B] dark:text-[#f4f4f5]"
                />
                <button
                  type="button"
                  onClick={saveGoal}
                  className="px-2 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <div className="w-full h-2 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            {isGoalReached ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Денну норму виконано!</span>
              </span>
            ) : (
              <span className="text-[#55726B] dark:text-[#8FAAA3]">
                Залишилося: <strong className="text-[#12302B] dark:text-[#f4f4f5]">{Math.max(0, goalMl - currentMl)} мл</strong>
              </span>
            )}

            {currentMl > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-0.5 cursor-pointer transition-colors"
                title="Скинути лічильник"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Скинути</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => addWater(150)}
          className="py-2 px-1 bg-white/70 dark:bg-black/20 hover:bg-sky-50 dark:hover:bg-sky-950/40 active:scale-95 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-center cursor-pointer transition-all shadow-xs"
        >
          <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] block">
            +150 мл
          </span>
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
            Чашка
          </span>
        </button>

        <button
          type="button"
          onClick={() => addWater(250)}
          className="py-2 px-1 bg-sky-500/10 hover:bg-sky-500/20 active:scale-95 border border-sky-400/30 rounded-xl text-center cursor-pointer transition-all shadow-xs"
        >
          <span className="text-xs font-bold text-sky-700 dark:text-sky-300 block">
            +250 мл
          </span>
          <span className="text-[10px] text-sky-600/80 dark:text-sky-400">
            Стакан
          </span>
        </button>

        <button
          type="button"
          onClick={() => addWater(500)}
          className="py-2 px-1 bg-teal-500/10 hover:bg-teal-500/20 active:scale-95 border border-teal-400/30 rounded-xl text-center cursor-pointer transition-all shadow-xs"
        >
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 block">
            +500 мл
          </span>
          <span className="text-[10px] text-teal-600/80 dark:text-teal-400">
            Пляшка
          </span>
        </button>

        <button
          type="button"
          onClick={() => addWater(-250)}
          disabled={currentMl <= 0}
          className="py-2 px-1 bg-white/70 dark:bg-black/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 border border-[#B7CDC6] dark:border-[#2d2d35] disabled:opacity-30 rounded-xl text-center cursor-pointer transition-all shadow-xs"
          title="Відняти 250 мл"
        >
          <span className="text-xs font-bold text-[#55726B] dark:text-[#8FAAA3] block">
            -250 мл
          </span>
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
            Відміна
          </span>
        </button>
      </div>
    </div>
  );
};
