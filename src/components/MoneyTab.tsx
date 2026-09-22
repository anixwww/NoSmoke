import React from 'react';
import {
  MoneySettings,
  GoalsState,
  SavingsGoal,
  CompletedGoal,
  CustomMilestoneGoal,
  GoalCategory,
} from '../types';
import {
  GOAL_CATEGORIES,
  GOAL_PRESETS,
  TIME_MILESTONES,
  CIGARETTE_MILESTONES,
  GoalPreset,
} from '../data/goalsData';
import {
  Target,
  PiggyBank,
  Plus,
  Check,
  Trash2,
  Edit3,
  ArrowUp,
  Sparkles,
  Trophy,
  Clock,
  Flame,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Gift,
  Calendar,
  Zap,
} from 'lucide-react';

interface MoneyTabProps {
  money: MoneySettings | null;
  totalSaved: number;
  cigsAvoided: number;
  daysCount: number;
  diffMs?: number;
  goals: GoalsState;
  onSaveMoneySettings: (settings: MoneySettings) => void;
  onUpdateGoals: (newGoals: GoalsState) => void;
}

export const MoneyTab: React.FC<MoneyTabProps> = ({
  money,
  totalSaved,
  cigsAvoided,
  daysCount,
  diffMs = 0,
  goals,
  onSaveMoneySettings,
  onUpdateGoals,
}) => {
  // Top view toggle: 'goals' (Система цілей) vs 'finance' (Скарбничка & Тарифи)
  const [activeView, setActiveView] = React.useState<'goals' | 'finance'>('goals');

  // Goals filter tab: 'savings' | 'presets' | 'time' | 'cigs' | 'done'
  const [goalsTab, setGoalsTab] = React.useState<'savings' | 'presets' | 'time' | 'cigs' | 'done'>('savings');

  // Money settings edit form
  const [isEditingSettings, setIsEditingSettings] = React.useState(!money);
  const [perDay, setPerDay] = React.useState(money ? String(money.perDay) : '15');
  const [packPrice, setPackPrice] = React.useState(money ? String(money.packPrice) : '100');
  const [packSize, setPackSize] = React.useState(money ? String(money.packSize) : '20');
  const [currency, setCurrency] = React.useState(money ? money.cur : '₴');

  // Add custom savings goal form state
  const [showAddGoal, setShowAddGoal] = React.useState(false);
  const [goalName, setGoalName] = React.useState('');
  const [goalAmount, setGoalAmount] = React.useState('');
  const [goalCategory, setGoalCategory] = React.useState<GoalCategory>('gadget');
  const [goalNotes, setGoalNotes] = React.useState('');

  // Add custom time milestone modal state
  const [showAddCustomTime, setShowAddCustomTime] = React.useState(false);
  const [customMilestoneTitle, setCustomMilestoneTitle] = React.useState('');
  const [customMilestoneDays, setCustomMilestoneDays] = React.useState('');

  // Success celebration message
  const [celebrationGoal, setCelebrationGoal] = React.useState<CompletedGoal | null>(null);

  const handleSaveSettings = () => {
    const pd = parseFloat(perDay.replace(',', '.'));
    const pp = parseFloat(packPrice.replace(',', '.'));
    const ps = parseFloat(packSize.replace(',', '.'));
    if (!pd || pd <= 0 || !pp || pp <= 0 || !ps || ps <= 0) {
      alert('Будь ласка, вкажіть коректні додатні числа для всіх полів.');
      return;
    }
    onSaveMoneySettings({
      perDay: pd,
      packPrice: pp,
      packSize: ps,
      cur: currency,
    });
    setIsEditingSettings(false);
  };

  // Add custom goal
  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const amt = parseFloat(goalAmount.replace(',', '.'));
    if (!goalName.trim() || !amt || amt <= 0) {
      alert('Вкажіть назву цілі та додатну суму.');
      return;
    }
    const catConfig = GOAL_CATEGORIES.find((c) => c.id === goalCategory);
    const newGoal: SavingsGoal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: goalName.trim(),
      amount: amt,
      category: goalCategory,
      icon: catConfig?.icon || '🎯',
      notes: goalNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    onUpdateGoals({
      ...goals,
      queue: [...goals.queue, newGoal],
    });

    setGoalName('');
    setGoalAmount('');
    setGoalNotes('');
    setShowAddGoal(false);
  };

  // Add preset goal
  const handleAddPreset = (preset: GoalPreset) => {
    const newGoal: SavingsGoal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: preset.name,
      amount: preset.amount,
      category: preset.category,
      icon: preset.icon,
      notes: preset.description,
      createdAt: Date.now(),
    };

    onUpdateGoals({
      ...goals,
      queue: [...goals.queue, newGoal],
    });

    setGoalsTab('savings');
  };

  // Delete goal from queue
  const handleDeleteGoal = (goalId: string) => {
    onUpdateGoals({
      ...goals,
      queue: goals.queue.filter((g) => g.id !== goalId),
    });
  };

  // Move goal to top of queue (make it active)
  const handleMakeActive = (index: number) => {
    if (index === 0) return;
    const target = goals.queue[index];
    const rest = goals.queue.filter((_, i) => i !== index);
    onUpdateGoals({
      ...goals,
      queue: [target, ...rest],
    });
  };

  // Mark active goal as purchased / fulfilled
  const handleCompleteActiveGoal = () => {
    if (!activeGoal) return;
    const completed: CompletedGoal = {
      ...activeGoal,
      at: Date.now(),
      total: activeGoal.amount,
    };

    // Set base to current totalSaved so accumulation for the NEXT goal starts from 0 at this exact moment
    onUpdateGoals({
      ...goals,
      base: totalSaved,
      queue: goals.queue.slice(1),
      done: [completed, ...(goals.done || [])],
    });

    setCelebrationGoal(completed);
  };

  // Add custom time milestone
  const handleAddCustomMilestone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const d = parseInt(customMilestoneDays, 10);
    if (!customMilestoneTitle.trim() || !d || d <= 0) {
      alert('Вкажіть назву виклику та кількість днів.');
      return;
    }
    const newMilestone: CustomMilestoneGoal = {
      id: `cm-${Date.now()}`,
      title: customMilestoneTitle.trim(),
      targetDays: d,
      icon: '🎯',
      createdAt: Date.now(),
    };

    onUpdateGoals({
      ...goals,
      customMilestones: [...(goals.customMilestones || []), newMilestone],
    });

    setCustomMilestoneTitle('');
    setCustomMilestoneDays('');
    setShowAddCustomTime(false);
  };

  const handleDeleteCustomMilestone = (id: string) => {
    onUpdateGoals({
      ...goals,
      customMilestones: (goals.customMilestones || []).filter((m) => m.id !== id),
    });
  };

  // Financial metrics
  const packsAvoided = money ? (cigsAvoided / money.packSize).toFixed(1) : '0';
  const dailyCost = money ? (money.perDay / money.packSize) * money.packPrice : 0;

  // Active goal computations
  const activeGoal = goals.queue[0];
  const withinCurrentGoal = activeGoal ? Math.max(0, totalSaved - goals.base) : 0;
  const activeGoalPct = activeGoal
    ? Math.min(100, Math.floor((withinCurrentGoal / activeGoal.amount) * 100))
    : 0;
  const isGoalReadyToBuy = activeGoal && withinCurrentGoal >= activeGoal.amount;

  // Remaining money & projected days until goal completion
  const remainingCost = activeGoal ? Math.max(0, activeGoal.amount - withinCurrentGoal) : 0;
  const daysUntilActiveGoal =
    dailyCost > 0 && remainingCost > 0 ? Math.ceil(remainingCost / dailyCost) : 0;

  const projectedDate = React.useMemo(() => {
    if (daysUntilActiveGoal <= 0) return null;
    const target = new Date(Date.now() + daysUntilActiveGoal * 24 * 3600 * 1000);
    return target.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
  }, [daysUntilActiveGoal]);

  // Total completed money
  const totalCompletedAmount = (goals.done || []).reduce((acc, g) => acc + (g.total || g.amount), 0);

  // Time milestones passed
  const completedTimeMilestonesCount = TIME_MILESTONES.filter((m) => daysCount >= m.days).length;
  const completedCigMilestonesCount = CIGARETTE_MILESTONES.filter((m) => cigsAvoided >= m.count).length;

  return (
    <div className="flex flex-col flex-1 pb-10 max-w-md mx-auto w-full">
      {/* 1. Header with View Switcher */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
              Цілі та Фінанси
            </h1>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
              Перетворюй невикурені сигарети на реальні мрії
            </p>
          </div>

          {/* Quick Tariff Settings Toggle Button */}
          {money && (
            <button
              type="button"
              onClick={() => {
                setActiveView('finance');
                setIsEditingSettings(!isEditingSettings);
              }}
              className="p-2 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/50 dark:hover:bg-[#112723]/50 rounded-xl text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Налаштування тарифу"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Тариф</span>
            </button>
          )}
        </div>

        {/* Master View Segmented Switcher */}
        <div className="grid grid-cols-2 p-1 bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveView('goals')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'goals'
                ? 'bg-[#1E8A69] text-white shadow-xs'
                : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#E4F1ED]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Система Цілей</span>
            {goals.queue.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeView === 'goals'
                    ? 'bg-white/25 text-white'
                    : 'bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0]'
                }`}
              >
                {goals.queue.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('finance')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'finance'
                ? 'bg-[#1E8A69] text-white shadow-xs'
                : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#E4F1ED]'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Скарбничка & Тарифи</span>
          </button>
        </div>
      </div>

      {/* Celebration Modal when goal is fulfilled */}
      {celebrationGoal && (
        <div className="p-4 bg-gradient-to-br from-[#1E8A69]/20 to-[#4CC9A0]/20 border-2 border-[#1E8A69] rounded-3xl mb-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="text-3xl mb-1">🎉 🥳 🎁</div>
          <h3 className="text-base font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
            Вітаємо! Мрія стала реальністю!
          </h3>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mt-1 mb-3">
            Ви заробили на <strong>«{celebrationGoal.name}»</strong> ({celebrationGoal.total}{' '}
            {money?.cur}) завдяки чистим легеням і силі волі.
          </p>
          <button
            type="button"
            onClick={() => setCelebrationGoal(null)}
            className="py-1.5 px-4 bg-[#1E8A69] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
          >
            Пишаюся собою!
          </button>
        </div>
      )}

      {/* ===================== VIEW 1: GOALS SYSTEM ===================== */}
      {activeView === 'goals' && (
        <div className="space-y-4">
          {/* A. HERO ACTIVE GOAL CARD */}
          {activeGoal ? (
            <div className="p-4 bg-gradient-to-br from-white/95 to-[#EAF5F0]/90 dark:from-[#112723]/95 dark:to-[#0D221E]/90 border-2 border-[#1E8A69]/40 rounded-3xl shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E8A69]/15 border border-[#1E8A69]/30 flex items-center justify-center text-2xl flex-none shadow-inner">
                    {activeGoal.icon || '🎯'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E8A69] dark:text-[#4CC9A0] block">
                      Поточна головна мета
                    </span>
                    <h2 className="text-base font-extrabold text-[#12302B] dark:text-[#f4f4f5] leading-tight">
                      {activeGoal.name}
                    </h2>
                    {activeGoal.notes && (
                      <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] line-clamp-1 mt-0.5">
                        {activeGoal.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                    {activeGoalPct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-2 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isGoalReadyToBuy
                      ? 'bg-gradient-to-r from-[#1E8A69] to-[#4CC9A0] animate-pulse'
                      : 'bg-[#1E8A69] dark:bg-[#4CC9A0]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, activeGoalPct))}%` }}
                />
              </div>

              {/* Amount and Projection info */}
              <div className="flex items-center justify-between text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3">
                <span>
                  Накопичено:{' '}
                  <strong className="text-[#12302B] dark:text-[#f4f4f5]">
                    {Math.floor(withinCurrentGoal).toLocaleString('uk-UA')} {money?.cur}
                  </strong>{' '}
                  з {activeGoal.amount.toLocaleString('uk-UA')} {money?.cur}
                </span>

                {isGoalReadyToBuy ? (
                  <span className="font-bold text-[#1E8A69] dark:text-[#4CC9A0] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Вся сума зібрана!
                  </span>
                ) : (
                  <span>
                    Залишилось: {Math.ceil(remainingCost).toLocaleString('uk-UA')} {money?.cur}
                  </span>
                )}
              </div>

              {/* Dynamic Projection Badge */}
              {!isGoalReadyToBuy && projectedDate && dailyCost > 0 && (
                <div className="p-2.5 bg-[#1E8A69]/10 dark:bg-[#1E8A69]/20 rounded-xl flex items-center gap-2 text-xs text-[#1E8A69] dark:text-[#4CC9A0] mb-3">
                  <Calendar className="w-4 h-4 flex-none" />
                  <span className="text-[11px] leading-snug">
                    За поточного темпу ти досягнеш мети за <strong>{daysUntilActiveGoal} днів</strong>{' '}
                    (орієнтовно <strong>{projectedDate}</strong>)!
                  </span>
                </div>
              )}

              {/* Goal Action Buttons */}
              <div className="flex gap-2">
                {isGoalReadyToBuy ? (
                  <button
                    type="button"
                    onClick={handleCompleteActiveGoal}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#1E8A69] to-[#2BA882] hover:from-[#187558] hover:to-[#228C6C] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Придбано! Записати в Зал досягнень 🎉</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteActiveGoal}
                    className="py-1.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/40 text-xs font-semibold rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
                    title="Якщо ви вже придбали цю річ раніше або хочете закрити її"
                  >
                    Відзначити придбання
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteGoal(activeGoal.id)}
                  className="py-1.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-red-400 hover:text-red-500 text-xs rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Active Goal Banner */
            <div className="p-5 bg-white/70 dark:bg-[#1c1c21]/70 border border-dashed border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1E8A69]/10 text-2xl flex items-center justify-center mx-auto mb-2 text-[#1E8A69]">
                🎯
              </div>
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                У вас ще немає активної цілі
              </h3>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mt-1 mb-3">
                Створіть свою мрію або оберіть готовий шаблон, щоб бачити матеріальну цінність кожного дня чистоти!
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(true)}
                  className="py-2 px-3.5 bg-[#1E8A69] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Своя мета</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGoalsTab('presets')}
                  className="py-2 px-3.5 border border-[#1E8A69] text-[#1E8A69] dark:text-[#4CC9A0] text-xs font-bold rounded-xl cursor-pointer hover:bg-[#1E8A69]/10 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Обрати з шаблонів</span>
                </button>
              </div>
            </div>
          )}

          {/* B. GOAL TABS CATEGORY SELECTOR */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setGoalsTab('savings')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                goalsTab === 'savings'
                  ? 'bg-[#1E8A69] text-white'
                  : 'bg-white/60 dark:bg-[#1c1c21]/60 text-[#55726B] dark:text-[#8FAAA3] border border-[#B7CDC6] dark:border-[#2d2d35]'
              }`}
            >
              🛍️ Черга мрій ({goals.queue.length})
            </button>

            <button
              type="button"
              onClick={() => setGoalsTab('presets')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                goalsTab === 'presets'
                  ? 'bg-[#1E8A69] text-white'
                  : 'bg-white/60 dark:bg-[#1c1c21]/60 text-[#55726B] dark:text-[#8FAAA3] border border-[#B7CDC6] dark:border-[#2d2d35]'
              }`}
            >
              ⚡ Шаблони
            </button>

            <button
              type="button"
              onClick={() => setGoalsTab('time')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                goalsTab === 'time'
                  ? 'bg-[#1E8A69] text-white'
                  : 'bg-white/60 dark:bg-[#1c1c21]/60 text-[#55726B] dark:text-[#8FAAA3] border border-[#B7CDC6] dark:border-[#2d2d35]'
              }`}
            >
              ⏱️ Час ({completedTimeMilestonesCount}/{TIME_MILESTONES.length})
            </button>

            <button
              type="button"
              onClick={() => setGoalsTab('cigs')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                goalsTab === 'cigs'
                  ? 'bg-[#1E8A69] text-white'
                  : 'bg-white/60 dark:bg-[#1c1c21]/60 text-[#55726B] dark:text-[#8FAAA3] border border-[#B7CDC6] dark:border-[#2d2d35]'
              }`}
            >
              🚭 Сигарети ({completedCigMilestonesCount}/{CIGARETTE_MILESTONES.length})
            </button>

            <button
              type="button"
              onClick={() => setGoalsTab('done')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-colors ${
                goalsTab === 'done'
                  ? 'bg-[#1E8A69] text-white'
                  : 'bg-white/60 dark:bg-[#1c1c21]/60 text-[#55726B] dark:text-[#8FAAA3] border border-[#B7CDC6] dark:border-[#2d2d35]'
              }`}
            >
              🏆 Зал слави ({(goals.done || []).length})
            </button>
          </div>

          {/* Form to Add Custom Goal */}
          {showAddGoal && (
            <div className="p-4 bg-white dark:bg-[#1c1c21] border border-[#1E8A69]/40 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E8A69] dark:text-[#4CC9A0]">
                  Створення нової цілі
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="text-xs text-[#55726B] hover:text-[#12302B]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                    Назва покупки чи мрії
                  </label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Наприклад: Нові навушники, поїздка в гори"
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                      Вартість ({money ? money.cur : '₴'})
                    </label>
                    <input
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="3500"
                      className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                      Категорія
                    </label>
                    <select
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                      className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    >
                      {GOAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                    Мотиваційна замітка (необов’язково)
                  </label>
                  <input
                    type="text"
                    value={goalNotes}
                    onChange={(e) => setGoalNotes(e.target.value)}
                    placeholder="Чому це важливо для мене..."
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 py-2 border border-[#B7CDC6] text-xs font-semibold rounded-xl text-[#55726B]"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#1E8A69] text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Зберегти ціль
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1: SAVINGS QUEUE */}
          {goalsTab === 'savings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Черга цілей ({goals.queue.length})
                </span>
                {!showAddGoal && (
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(true)}
                    className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0] flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Додати ціль</span>
                  </button>
                )}
              </div>

              {goals.queue.length === 0 ? (
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic py-3 text-center">
                  У вас немає цілей у черзі. Додайте нову ціль або оберіть із готових шаблонів!
                </p>
              ) : (
                <div className="space-y-2">
                  {goals.queue.map((g, idx) => {
                    const isCurrent = idx === 0;
                    return (
                      <div
                        key={g.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-[#1E8A69]/10 border-[#1E8A69]/40 dark:bg-[#1E8A69]/20'
                            : 'bg-white/70 dark:bg-[#1c1c21]/70 border-[#B7CDC6] dark:border-[#2d2d35]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl flex-none">{g.icon || '🎯'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                                {g.name}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#1E8A69] text-white text-[9px] font-bold">
                                  Активна
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                              {g.amount.toLocaleString('uk-UA')} {money?.cur}
                              {isCurrent && ` • ${activeGoalPct}% накопичено`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-none">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleMakeActive(idx)}
                              className="px-2 py-1 bg-white/80 dark:bg-[#1c1c21] hover:bg-[#1E8A69] hover:text-white border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[10px] font-bold text-[#55726B] dark:text-[#8FAAA3] transition-colors cursor-pointer flex items-center gap-1"
                              title="Зробити активною"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span>Зробити 1-ю</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1.5 text-[#55726B] hover:text-red-500 rounded-lg cursor-pointer"
                            title="Видалити"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET IDEAS */}
          {goalsTab === 'presets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Популярні цілі-нагороди
                  </h3>
                  <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                    Додавайте в один клік як заохочення за кожен етап
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{preset.icon}</span>
                        <span className="text-xs font-extrabold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                          {preset.amount.toLocaleString('uk-UA')} {money ? money.cur : '₴'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] leading-tight mb-1">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] line-clamp-2 mb-2">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddPreset(preset)}
                      className="w-full py-1.5 bg-[#1E8A69]/10 hover:bg-[#1E8A69] text-[#1E8A69] hover:text-white dark:bg-[#1E8A69]/20 dark:text-[#4CC9A0] dark:hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Додати в чергу</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIME MILESTONES */}
          {goalsTab === 'time' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Часові рубежі чистоти
                  </h3>
                  <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                    Науково підтверджені етапи очищення організму
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCustomTime(!showAddCustomTime)}
                  className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0] flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Власний виклик</span>
                </button>
              </div>

              {/* Form for custom time challenge */}
              {showAddCustomTime && (
                <div className="p-3 bg-white dark:bg-[#1c1c21] border border-[#1E8A69]/40 rounded-2xl mb-2">
                  <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] mb-2">
                    Додати особисту часову дату
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={customMilestoneTitle}
                      onChange={(e) => setCustomMilestoneTitle(e.target.value)}
                      placeholder="Напр. До дня народження"
                      className="text-xs p-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    />
                    <input
                      type="number"
                      value={customMilestoneDays}
                      onChange={(e) => setCustomMilestoneDays(e.target.value)}
                      placeholder="Кількість днів (напр. 50)"
                      className="text-xs p-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCustomTime(false)}
                      className="flex-1 py-1 text-xs border border-[#B7CDC6] rounded-lg text-[#55726B]"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomMilestone}
                      className="flex-1 py-1 bg-[#1E8A69] text-white text-xs font-bold rounded-lg"
                    >
                      Зберегти виклик
                    </button>
                  </div>
                </div>
              )}

              {/* Custom milestones if any */}
              {(goals.customMilestones || []).length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-[11px] font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                    Ваші особисті виклики:
                  </span>
                  {(goals.customMilestones || []).map((cm) => {
                    const isPassed = cm.targetDays ? daysCount >= cm.targetDays : false;
                    const pct = cm.targetDays
                      ? Math.min(100, Math.floor((daysCount / cm.targetDays) * 100))
                      : 0;
                    return (
                      <div
                        key={cm.id}
                        className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{cm.icon || '🎯'}</span>
                            <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                              {cm.title}
                            </span>
                            {isPassed && (
                              <span className="px-1.5 py-0.5 rounded bg-[#1E8A69] text-white text-[9px] font-bold">
                                Досягнуто!
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                            {daysCount} з {cm.targetDays} днів ({pct}%)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomMilestone(cm.id)}
                          className="text-[#55726B] hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Built-in Scientific Milestones List */}
              <div className="space-y-2.5">
                {TIME_MILESTONES.map((m, idx) => {
                  const isAchieved = daysCount >= m.days;
                  const isCurrent =
                    !isAchieved && (idx === 0 || daysCount >= TIME_MILESTONES[idx - 1].days);
                  const progressPct = Math.min(100, Math.floor((daysCount / m.days) * 100));

                  return (
                    <div
                      key={m.days}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isAchieved
                          ? 'bg-[#1E8A69]/10 border-[#1E8A69]/40 dark:bg-[#1E8A69]/15'
                          : isCurrent
                          ? 'bg-white dark:bg-[#1c1c21] border-[#1E8A69] shadow-xs'
                          : 'bg-white/50 dark:bg-[#1c1c21]/50 border-[#B7CDC6]/60 dark:border-[#2d2d35]/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                                {m.label} — {m.achievement}
                              </h4>
                            </div>
                            <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                              {isAchieved
                                ? 'Етап успішно завершено'
                                : `Потрібно: ${m.days} ${m.days === 1 ? 'день' : m.days < 5 ? 'дні' : 'днів'}`}
                            </span>
                          </div>
                        </div>

                        {isAchieved ? (
                          <div className="flex items-center gap-1 text-[#1E8A69] dark:text-[#4CC9A0] font-bold text-xs">
                            <Check className="w-4 h-4" />
                            <span>Пройдено</span>
                          </div>
                        ) : isCurrent ? (
                          <span className="text-xs font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                            {progressPct}%
                          </span>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-[#55726B] opacity-60" />
                        )}
                      </div>

                      {/* Fact */}
                      <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed mb-2">
                        {m.fact}
                      </p>

                      {/* Progress bar for current milestone */}
                      {isCurrent && (
                        <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full"
                            style={{ width: `${Math.max(5, progressPct)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CIGARETTES AVOIDED MILESTONES */}
          {goalsTab === 'cigs' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Рубежі невикурених сигарет
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                  Кожна невикурена сигарета — це додаткові 11 хвилин життя
                </p>
              </div>

              <div className="space-y-2.5">
                {CIGARETTE_MILESTONES.map((cm) => {
                  const isAchieved = cigsAvoided >= cm.count;
                  const pct = Math.min(100, Math.floor((cigsAvoided / cm.count) * 100));

                  return (
                    <div
                      key={cm.count}
                      className={`p-3 rounded-2xl border transition-all ${
                        isAchieved
                          ? 'bg-[#1E8A69]/10 border-[#1E8A69]/40 dark:bg-[#1E8A69]/15'
                          : 'bg-white/70 dark:bg-[#1c1c21]/70 border-[#B7CDC6] dark:border-[#2d2d35]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{cm.icon}</span>
                          <div>
                            <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                              {cm.label}
                            </span>
                            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                              {cm.description}
                            </p>
                          </div>
                        </div>

                        {isAchieved ? (
                          <div className="flex items-center gap-1 text-[#1E8A69] dark:text-[#4CC9A0] text-xs font-bold">
                            <Check className="w-4 h-4" />
                            <span>Виконано</span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-[#55726B] dark:text-[#8FAAA3]">
                            {pct}%
                          </span>
                        )}
                      </div>

                      {!isAchieved && (
                        <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mt-2">
                          <div
                            className="h-full bg-[#1E8A69] rounded-full"
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLETED GOALS (HALL OF FAME) */}
          {goalsTab === 'done' && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-br from-amber-500/15 to-[#1E8A69]/15 border border-amber-500/30 rounded-3xl text-center">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                <span className="text-[11px] uppercase font-bold text-[#55726B] dark:text-[#8FAAA3] block">
                  Загальна сума досягнутих мрій
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#1E8A69] dark:text-[#4CC9A0] my-1">
                  {totalCompletedAmount.toLocaleString('uk-UA')} {money ? money.cur : '₴'}
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                  Ці гроші не перетворилися на дим і попіл, а подарували вам радість та користь!
                </p>
              </div>

              {(goals.done || []).length === 0 ? (
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic py-4 text-center">
                  У вас поки що немає куплених цілей. Досягайте 100% за поточною метою та натискайте
                  «Придбано!», щоб увічнити її в Залі слави.
                </p>
              ) : (
                <div className="space-y-2">
                  {(goals.done || []).map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{d.icon || '🎁'}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                            {d.name}
                          </h4>
                          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                            Придбано {new Date(d.at).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                          +{(d.total || d.amount).toLocaleString('uk-UA')} {money?.cur}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== VIEW 2: FINANCIAL CALCULATOR & RATES ===================== */}
      {activeView === 'finance' && (
        <div className="space-y-4">
          {/* Main Saved Showcase */}
          <div className="p-5 bg-gradient-to-br from-white/95 to-[#1E8A69]/10 dark:from-[#112723]/95 dark:to-[#4CC9A0]/10 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl shadow-xs text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-[#55726B] dark:text-[#8FAAA3] block mb-1">
              Всього заощаджено коштів
            </span>
            <div className="text-4xl font-extrabold font-mono text-[#1E8A69] dark:text-[#4CC9A0] mb-2 tracking-tight">
              {Math.floor(totalSaved).toLocaleString('uk-UA')} {money ? money.cur : '₴'}
            </div>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
              Не куплено приблизно <strong>{Math.floor(cigsAvoided)}</strong> сигарет ({packsAvoided}{' '}
              пачок)
            </p>
          </div>

          {/* Average savings breakdown */}
          {money && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
                <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                  Заощадження на день
                </span>
                <span className="text-base font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {dailyCost.toFixed(1)} {money.cur}
                </span>
              </div>

              <div className="p-3 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
                <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                  На тиждень
                </span>
                <span className="text-base font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {(dailyCost * 7).toFixed(0)} {money.cur}
                </span>
              </div>

              <div className="p-3 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
                <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                  На місяць (30 днів)
                </span>
                <span className="text-base font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {(dailyCost * 30).toFixed(0)} {money.cur}
                </span>
              </div>

              <div className="p-3 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
                <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                  На рік (365 днів)
                </span>
                <span className="text-base font-bold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {(dailyCost * 365).toLocaleString('uk-UA')} {money.cur}
                </span>
              </div>
            </div>
          )}

          {/* Settings form */}
          <div className="p-4 bg-white/90 dark:bg-[#1c1c21]/90 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Параметри розрахунку тарифу
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingSettings(!isEditingSettings)}
                className="text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0]"
              >
                {isEditingSettings ? 'Приховати' : 'Редагувати'}
              </button>
            </div>

            {isEditingSettings && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                    Кількість сигарет на день
                  </label>
                  <input
                    type="number"
                    value={perDay}
                    onChange={(e) => setPerDay(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    placeholder="15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                      Ціна пачки
                    </label>
                    <input
                      type="number"
                      value={packPrice}
                      onChange={(e) => setPackPrice(e.target.value)}
                      className="w-full text-sm p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                      placeholder="100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                      Валюта
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full text-sm p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    >
                      <option value="₴">₴ (Гривня)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                      <option value="zł">zł (PLN)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                    Сигарет у пачці
                  </label>
                  <input
                    type="number"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    className="w-full text-sm p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
                    placeholder="20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 bg-[#1E8A69] hover:bg-[#187558] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Зберегти та перерахувати
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
