import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Check, 
  Trash2, 
  Clock, 
  Sparkles, 
  Trophy, 
  Gift, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';
import { GoalsState, MoneySettings, SavingsGoal, CompletedGoal } from '../types';

interface GoalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalsState;
  totalSaved: number;
  money: MoneySettings | null;
  onAddGoal: (name: string, amount?: number, targetDate?: string) => void;
  onCompleteGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  isOpen,
  onClose,
  goals,
  totalSaved,
  money,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal
}) => {
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const netSaved = Math.max(0, totalSaved - (goals?.base || 0));
  const activeGoal = goals?.queue && goals.queue.length > 0 ? goals.queue[0] : null;
  const amount = activeGoal?.amount || 0;
  const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
  const isGoalReached = pct >= 100;

  // Daily rate and estimated target date
  const dailyRate = money ? (money.perDay / (money.packSize || 20)) * money.packPrice : 0;
  const remainingAmount = Math.max(0, amount - netSaved);

  let estDateText = '';
  if (isGoalReached && activeGoal) {
    estDateText = '🎉 Мета вже накопичена!';
  } else if (remainingAmount > 0 && dailyRate > 0) {
    const daysLeft = Math.ceil(remainingAmount / dailyRate);
    const targetDate = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);
    const formattedTargetDate = targetDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const daysWord = (d: number) => {
      const m10 = d % 10;
      const m100 = d % 100;
      if (m100 >= 11 && m100 <= 14) return 'днів';
      if (m10 === 1) return 'день';
      if (m10 >= 2 && m10 <= 4) return 'дні';
      return 'днів';
    };

    estDateText = `~${formattedTargetDate} (ще ~${daysLeft} ${daysWord(daysLeft)})`;
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = goalName.trim();
    if (!trimmed) return;

    const numAmount = goalAmount ? parseFloat(goalAmount) : undefined;
    onAddGoal(trimmed, numAmount, goalDate.trim() || undefined);

    setGoalName('');
    setGoalAmount('');
    setGoalDate('');

    setToastMessage('Ціль успішно додано! ✨');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Налаштування цілей
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
            title="Закрити"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback toast */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active Primary Goal Summary */}
        {activeGoal && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-amber-950/40 border border-amber-400/30 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" />
                <span>Поточна ціль №1</span>
              </span>
              {amount > 0 && (
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                  {amount.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              🎯 {activeGoal.name}
            </h3>

            {amount > 0 && (
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isGoalReached
                        ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse'
                        : 'bg-gradient-to-r from-amber-500 via-rose-400 to-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-600 dark:text-slate-400">
                    Накопичено: <strong className="text-amber-600 dark:text-amber-400">{Math.floor(netSaved).toLocaleString('uk-UA')} ₴</strong>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{pct}%</span>
                </div>

                {estDateText && (
                  <div className="pt-2 border-t border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 flex-none" />
                    <span>{estDateText}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Goal Form */}
        <form onSubmit={handleCreate} className="space-y-3 mb-5 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Додати нову ціль
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Назва цілі *
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              placeholder="Наприклад: Нові кросівки, Подорож, Книга..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Сума (₴)
              </label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="1500"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Бажана дата
              </label>
              <input
                type="text"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                placeholder="до Нового Року..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
          >
            <span>Додати в чергу цілей</span>
          </button>
        </form>

        {/* List of Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Активні цілі ({goals.queue.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Виконано раніше: {goals.done.length}
            </span>
          </div>

          {goals.queue.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 italic">
              Черга цілей порожня. Вкажіть бажану ціль вище!
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {goals.queue.map((g, idx) => {
                const gAmount = g.amount || 0;
                const gPct = gAmount > 0 ? Math.min(100, Math.floor((netSaved / gAmount) * 100)) : 0;
                const gCanClose = gAmount > 0 ? netSaved >= gAmount : true;

                return (
                  <div
                    key={g.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/50 dark:border-amber-700/40'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {g.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {gAmount > 0 && (
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              {gAmount.toLocaleString('uk-UA')} ₴
                            </span>
                          )}
                          {g.targetDate && <span>📅 {g.targetDate}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onCompleteGoal(g.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ${
                            gCanClose
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                          }`}
                          title="Позначити виконаною"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Виконати</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteGoal(g.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                          title="Видалити ціль"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
