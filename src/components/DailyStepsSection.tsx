import React, { useState, useEffect } from 'react';
import { DailyMicroStep } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Footprints,
  CheckSquare,
  Info,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DEFAULT_STEPS: DailyMicroStep[] = [];

const STEPS_STORAGE_KEY = 'quit-smoking:daily-micro-steps';
const HISTORY_STORAGE_KEY = 'quit-smoking:daily-steps-history';
const SHOW_INDICATOR_KEY = 'quit-smoking:daily-steps-show-indicator';

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

interface DailyStepsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  onUpdate?: () => void;
}

export const DailyStepsSection: React.FC<DailyStepsSectionProps> = ({ isOpen, onToggle, onUpdate }) => {
  // Steps definition (defaults + user custom steps)
  const [steps, setSteps] = useState<DailyMicroStep[]>(() => {
    try {
      const saved = localStorage.getItem(STEPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_STEPS;
  });

  // History of completions by date: { [dateStr]: string[] }
  const [completions, setCompletions] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [newStepText, setNewStepText] = useState('');
  const [showTip, setShowTip] = useState(false);
  const [showIndicator, setShowIndicator] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHOW_INDICATOR_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // default enabled
  });

  const todayKey = getTodayKey();
  const todayCompletedIds = completions[todayKey] || [];

  // Persist steps
  useEffect(() => {
    try {
      localStorage.setItem(STEPS_STORAGE_KEY, JSON.stringify(steps));
    } catch {}
    onUpdate?.();
  }, [steps, onUpdate]);

  // Persist completions
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(completions));
    } catch {}
    onUpdate?.();
  }, [completions, onUpdate]);

  // Persist showIndicator
  useEffect(() => {
    try {
      localStorage.setItem(SHOW_INDICATOR_KEY, showIndicator.toString());
    } catch {}
    onUpdate?.();
  }, [showIndicator, onUpdate]);

  // Toggle step completion for today
  const handleToggleStep = (stepId: string) => {
    setCompletions((prev) => {
      const currentList = prev[todayKey] || [];
      const isDone = currentList.includes(stepId);
      const updatedList = isDone
        ? currentList.filter((id) => id !== stepId)
        : [...currentList, stepId];

      return {
        ...prev,
        [todayKey]: updatedList
      };
    });
  };

  // Add user-defined custom step
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStepText.trim();
    if (!trimmed) return;

    const newStep: DailyMicroStep = {
      id: `custom-${Date.now()}`,
      title: trimmed,
      isCustom: true,
      createdAt: Date.now()
    };

    setSteps((prev) => [...prev, newStep]);
    setNewStepText('');
  };

  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    // Also remove from completions
    setCompletions((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = next[k].filter((id) => id !== stepId);
      });
      return next;
    });
  };

  // Reset to default steps
  const handleResetDefaults = () => {
    if (confirm('Відновити стандартний список щоденних кроків? Ваші власні кроки буде скинуто.')) {
      setSteps(DEFAULT_STEPS);
    }
  };

  const totalStepsCount = steps.length;
  const completedCount = steps.filter((s) => todayCompletedIds.includes(s.id)).length;
  const progressPct = totalStepsCount > 0 ? Math.round((completedCount / totalStepsCount) * 100) : 0;
  const isAllDone = totalStepsCount > 0 && completedCount === totalStepsCount;

  return (
    <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
              Щоденні справи
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
              Дрібні звички для легкого очищення та заміни ритуалу куріння
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-none">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
              isAllDone
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                : 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
            }`}
          >
            {completedCount}/{totalStepsCount}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
          {/* Progress Bar & Header metrics */}
          <div className="p-3 bg-[#CBDDD7]/20 dark:bg-[#1D3832]/20 rounded-xl border border-[#B7CDC6]/30 dark:border-[#2A4A43]/40">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-1.5">
                <span>Прогрес на сьогодні</span>
                {isAllDone && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              </span>
              <span className="font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                {progressPct}% ({completedCount} з {totalStepsCount})
              </span>
            </div>

            <div className="w-full h-2 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isAllDone
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-teal-500 to-[#1E8A69]'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {isAllDone && (
              <div className="mt-2.5 p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Чудово! Всі дрібні кроки на сьогодні виконано 🎉</span>
              </div>
            )}
          </div>

          {/* Checklist of steps */}
          <div className="space-y-1.5">
            {steps.map((step) => {
              const isDone = todayCompletedIds.includes(step.id);
              return (
                <div
                  key={step.id}
                  className={`group p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-white/60 dark:bg-[#121212]/60 border-[#B7CDC6]/40 dark:border-[#2d2d35] hover:border-[#1E8A69]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleStep(step.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="flex-none">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-900/40" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#55726B] dark:text-[#8FAAA3] group-hover:text-[#1E8A69] transition-colors" />
                      )}
                    </div>
                    <span
                      className={`text-xs leading-snug transition-all ${
                        isDone
                          ? 'line-through text-[#55726B] dark:text-[#8FAAA3] opacity-80'
                          : 'font-medium text-[#12302B] dark:text-[#f4f4f5]'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>

                  {/* Delete button (for custom or any step) */}
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(step.id)}
                    className="p-1 text-[#55726B] dark:text-[#8FAAA3] hover:text-rose-600 dark:hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Видалити цей крок"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Add custom step form */}
          <form onSubmit={handleAddStep} className="pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="Додати свій крок (наприклад: чай з ромашкою увечері)..."
                maxLength={80}
                className="flex-1 py-2 px-3 text-xs bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] placeholder:text-[#55726B]/60 dark:placeholder:text-[#8FAAA3]/60 outline-none focus:border-[#1E8A69] transition-colors"
              />
              <button
                type="submit"
                disabled={!newStepText.trim()}
                className="py-2 px-3 bg-[#1E8A69] hover:bg-[#167054] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Додати</span>
              </button>
            </div>
          </form>

          {/* Toggle Indicator Switch */}
          <div className="mb-3 px-3 py-2 bg-[#CBDDD7]/15 dark:bg-[#1D3832]/20 border border-[#B7CDC6]/30 dark:border-[#2A4A43]/40 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] block">
                Індикатор на головному екрані
              </span>
              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                Показувати відсоток справ під таймером
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

          {/* Footer note & Reset defaults */}
          <div className="pt-2 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] flex items-center justify-between text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>Скидається щоночі на нову добу</span>
            </span>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[10px] text-[#1E8A69] dark:text-[#4CC9A0] hover:underline cursor-pointer"
            >
              Відновити стандартні
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
