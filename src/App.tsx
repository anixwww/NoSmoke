import React from 'react';
import {
  TabType,
  MoneySettings,
  DayRating,
  Streak,
  GoalsState,
  TreeState,
} from './types';
import { CounterTab } from './components/CounterTab';
import { HealthTab } from './components/HealthTab';
import { MoneyTab } from './components/MoneyTab';
import { StateSurveyTab } from './components/StateSurveyTab';
import { TreeTab } from './components/TreeTab';
import { SandTab } from './components/SandTab';
import { MoreTab } from './components/MoreTab';
import { SosModal } from './components/SosModal';
import { SetupModal, RelapseModal } from './components/Modals';
import { StardustBackground } from './components/StardustBackground';
import {
  Clock,
  HeartPulse,
  Coins,
  Smile,
  Trees,
  Hourglass,
  MoreHorizontal,
  ShieldAlert
} from 'lucide-react';

const STORAGE_KEYS = {
  START: 'quit-smoking:start',
  MONEY: 'quit-smoking:money',
  DAYS: 'quit-smoking:days',
  STREAKS: 'quit-smoking:streaks',
  REASONS: 'quit-smoking:reasons',
  GOALS: 'quit-smoking:goals',
  TREE: 'quit-smoking:tree',
  THEME: 'quit-smoking:theme',
  ACCENT: 'quit-smoking:accent'
};

const DEFAULT_REASONS = [
  'Дихати на повні груди без задишки',
  'Зберегти здорове серце та судини',
  'Бути прикладом для своїх дітей та близьких',
  'Заощадити кошти на власні мрії',
  'Повернути чистий смак та свіжий подих'
];

export default function App() {
  // Load initial state with safe localStorage parsing
  const [startDate, setStartDate] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.START);
      if (v) {
        const n = Number(v);
        if (isFinite(n) && n > 0) return n;
      }
    } catch {}
    // Default to 3 days ago if first open for friendly preview
    return Date.now() - 3 * 24 * 3600 * 1000;
  });

  const [money, setMoney] = React.useState<MoneySettings | null>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.MONEY);
      if (v) return JSON.parse(v);
    } catch {}
    return { perDay: 15, packPrice: 100, packSize: 20, cur: '₴' };
  });

  const [days, setDays] = React.useState<Record<string, DayRating>>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.DAYS);
      if (v) return JSON.parse(v);
    } catch {}
    return {};
  });

  const [streaks, setStreaks] = React.useState<Streak[]>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.STREAKS);
      if (v) return JSON.parse(v);
    } catch {}
    return [];
  });

  const [reasons, setReasons] = React.useState<string[]>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.REASONS);
      if (v) return JSON.parse(v);
    } catch {}
    return DEFAULT_REASONS;
  });

  const [goals, setGoals] = React.useState<GoalsState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (v) return JSON.parse(v);
    } catch {}
    return {
      base: 0,
      queue: [
        { id: 'g1', name: 'Бездротові навушники', amount: 2500 },
        { id: 'g2', name: 'Вікенд у горах', amount: 6000 }
      ],
      done: []
    };
  });

  const [treeState, setTreeState] = React.useState<TreeState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.TREE);
      if (v) return JSON.parse(v);
    } catch {}
    return { forest: [], current: null };
  });

  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.THEME);
      if (v === 'light' || v === 'dark' || v === 'system') return v;
    } catch {}
    return 'system';
  });

  const [accent, setAccent] = React.useState<string>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ACCENT);
      if (v) return v;
    } catch {}
    return 'green';
  });

  const [activeTab, setActiveTab] = React.useState<TabType>('counter');
  const [isSosOpen, setIsSosOpen] = React.useState(false);
  const [isSetupOpen, setIsSetupOpen] = React.useState(false);
  const [isRelapseOpen, setIsRelapseOpen] = React.useState(false);

  // Time difference in milliseconds, updated strictly 1 time per second for MAX ENERGY EFFICIENCY!
  const [diffMs, setDiffMs] = React.useState<number>(() => Math.max(0, Date.now() - startDate));

  // 1-second interval loop with page visibility pausing (Item 5)
  React.useEffect(() => {
    const updateTime = () => {
      setDiffMs(Math.max(0, Date.now() - startDate));
    };

    updateTime();
    let intervalId: any = null;

    const startTimer = () => {
      if (!intervalId) {
        updateTime();
        intervalId = setInterval(updateTime, 1000);
      }
    };

    const stopTimer = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Listen to visibilitychange: sleep timer when tab is hidden, wake up when visible!
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    if (!document.hidden) {
      startTimer();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startDate]);

  // Apply theme & accent class to root
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    if (accent && accent !== 'green') {
      root.setAttribute('data-accent', accent);
    } else {
      root.removeAttribute('data-accent');
    }
  }, [theme, accent]);

  // Sync to localStorage
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.START, String(startDate)); } catch {}
  }, [startDate]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(money)); } catch {}
  }, [money]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(days)); } catch {}
  }, [days]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(streaks)); } catch {}
  }, [streaks]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.REASONS, JSON.stringify(reasons)); } catch {}
  }, [reasons]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals)); } catch {}
  }, [goals]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TREE, JSON.stringify(treeState)); } catch {}
  }, [treeState]);

  // Auto-decay and growth pause for current tree if not maintained every hour
  React.useEffect(() => {
    if (!treeState.current) return;
    const now = Date.now();
    const tree = treeState.current;
    const last = tree.lastTick || tree.plantedAt;
    const elapsedMs = now - last;
    if (elapsedMs < 5000) return;

    const elapsedHours = elapsedMs / (3600 * 1000);
    const newWater = Math.max(0, tree.water - elapsedHours * 50);
    const newSun = Math.max(0, tree.sun - elapsedHours * 45);
    const newFood = Math.max(0, tree.food - elapsedHours * 35);

    let newGrowth = tree.growth;
    if (newWater >= 30 && newSun >= 30 && newFood >= 30 && tree.growth < 100) {
      newGrowth = Math.min(100, tree.growth + elapsedHours * 3.0);
    }

    if (
      newWater !== tree.water ||
      newSun !== tree.sun ||
      newFood !== tree.food ||
      newGrowth !== tree.growth
    ) {
      setTreeState({
        ...treeState,
        current: {
          ...tree,
          water: newWater,
          sun: newSun,
          food: newFood,
          growth: newGrowth,
          lastTick: now
        }
      });
    }
  }, [diffMs]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.THEME, theme); } catch {}
  }, [theme]);

  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ACCENT, accent); } catch {}
  }, [accent]);

  // Total free time including previous streaks
  const pastFreeMs = streaks.reduce((acc, s) => acc + (s.to - s.from), 0);
  const totalFreeMs = diffMs + pastFreeMs;
  const longestStreakMs = Math.max(diffMs, ...streaks.map((s) => s.to - s.from));

  const totalDays = Math.floor(totalFreeMs / (24 * 3600 * 1000));
  const totalHours = Math.floor(totalFreeMs / (3600 * 1000));
  const totalSeconds = Math.floor(totalFreeMs / 1000);

  // Calculations for money and cigarettes avoided
  const cigsAvoided = money ? (totalFreeMs / (24 * 3600 * 1000)) * money.perDay : 0;
  const totalSaved = money ? (cigsAvoided / money.packSize) * money.packPrice : 0;

  // Dot badges
  const todayKey = (() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();
  const hasRatedToday = !!days[todayKey];
  const canPlantTree = Math.floor(cigsAvoided / 300) > (treeState.forest.length + (treeState.current ? 1 : 0)) && !treeState.current;

  // Handlers
  const handleSaveDate = (newMs: number) => {
    setStartDate(newMs);
    setDiffMs(Math.max(0, Date.now() - newMs));
    setStreaks([]);
    setGoals(prev => ({ ...prev, base: 0, done: [] }));
    setIsSetupOpen(false);
  };

  const handleConfirmRelapse = (whenMs: number, note: string) => {
    const streak: Streak = {
      from: startDate,
      to: whenMs,
      note
    };
    setStreaks((prev) => [...prev, streak]);
    setStartDate(whenMs);
    setDiffMs(Math.max(0, Date.now() - whenMs));
    setIsRelapseOpen(false);
    setIsSosOpen(false);
    setActiveTab('counter');
  };

  const handleUndoLastRelapse = () => {
    if (streaks.length === 0) return;
    const last = streaks[streaks.length - 1];
    setStartDate(last.from);
    setStreaks(streaks.slice(0, -1));
    setDiffMs(Math.max(0, Date.now() - last.from));
  };

  const handleSaveDayRating = (dateKey: string, rating: DayRating) => {
    setDays((prev) => ({
      ...prev,
      [dateKey]: rating
    }));
  };

  const handleDeleteDayRating = (dateKey: string) => {
    setDays((prev) => {
      const copy = { ...prev };
      delete copy[dateKey];
      return copy;
    });
  };

  const handleRestoreAllData = (backup: any) => {
    if (backup.start) setStartDate(backup.start);
    if (backup.money) setMoney(backup.money);
    if (backup.days) setDays(backup.days);
    if (backup.streaks) setStreaks(backup.streaks);
    if (backup.reasons) setReasons(backup.reasons);
    if (backup.goals) setGoals(backup.goals);
    if (backup.tree) setTreeState(backup.tree);
    alert('Дані успішно відновлено!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-md mx-auto w-full px-4 pt-5 pb-20 select-none relative z-10">
      <StardustBackground />
      {/* Top Bar: Minimal with Eco-battery icon badge */}
      <header className="flex items-center justify-end pb-2 mb-2">
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'counter' && (
          <CounterTab
            diffMs={diffMs}
            startDate={startDate}
            money={money}
            totalSaved={totalSaved}
            cigsAvoided={cigsAvoided}
            treeState={treeState}
            daysCount={totalSeconds}
            reasons={reasons}
            goals={goals}
            activeGoalName={goals.queue[0]?.name}
            activeGoalPct={
              goals.queue[0]
                ? Math.min(
                    100,
                    Math.floor(
                      (Math.max(0, totalSaved - goals.base) / goals.queue[0].amount) * 100
                    )
                  )
                : 0
            }
            onOpenSos={() => setIsSosOpen(true)}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenRelapse={() => setIsRelapseOpen(true)}
            onSwitchTab={setActiveTab}
            dayRatings={days}
          />
        )}

        {activeTab === 'health' && (
          <HealthTab diffMs={totalFreeMs} startDate={startDate} />
        )}

        {activeTab === 'money' && (
          <MoneyTab
            money={money}
            totalSaved={totalSaved}
            cigsAvoided={cigsAvoided}
            daysCount={totalDays}
            diffMs={totalFreeMs}
            goals={goals}
            onSaveMoneySettings={setMoney}
            onUpdateGoals={setGoals}
          />
        )}

        {activeTab === 'state' && (
          <StateSurveyTab
            days={days}
            onSaveRating={handleSaveDayRating}
            onDeleteRating={handleDeleteDayRating}
          />
        )}

        {activeTab === 'tree' && (
          <TreeTab
            treeState={treeState}
            money={money}
            cigsAvoided={cigsAvoided}
            onUpdateTreeState={setTreeState}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'sand' && (
          <SandTab daysCount={totalSeconds} onSwitchTab={setActiveTab} />
        )}

        {activeTab === 'more' && (
          <MoreTab
            reasons={reasons}
            streaks={streaks}
            currentStart={startDate}
            totalFreeMs={totalFreeMs}
            longestStreakMs={longestStreakMs}
            money={money}
            days={days}
            goals={goals}
            treeState={treeState}
            theme={theme}
            accent={accent}
            onUpdateReasons={setReasons}
            onSetTheme={setTheme}
            onSetAccent={setAccent}
            onUndoLastRelapse={handleUndoLastRelapse}
            onRestoreAllData={handleRestoreAllData}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenRelapse={() => setIsRelapseOpen(true)}
            onSwitchTab={setActiveTab}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#E9F1EE]/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-[#B7CDC6] dark:border-[#2d2d35] py-2 px-2 sm:px-4 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5 text-center">
          {/* 1. Counter / Home */}
          <button
            type="button"
            onClick={() => setActiveTab('counter')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'counter'
                ? 'text-[#1E8A69] dark:text-[#4CC9A0] font-bold scale-105'
                : 'text-[#55726B] dark:text-[#8FAAA3] font-medium hover:text-[#12302B]'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Головна</span>
          </button>

          {/* 2. Health */}
          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'health'
                ? 'text-[#1E8A69] dark:text-[#4CC9A0] font-bold scale-105'
                : 'text-[#55726B] dark:text-[#8FAAA3] font-medium hover:text-[#12302B]'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Здоров’я</span>
          </button>

          {/* 3. SOS */}
          <button
            type="button"
            id="nav-btn-sos"
            onClick={() => setIsSosOpen(true)}
            className="py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#E4F1ED]"
            aria-label="SOS"
          >
            <ShieldAlert className="w-5 h-5 text-[#A33A2C] dark:text-[#F08C7D]" />
            <span className="text-[10px] sm:text-[11px] leading-tight font-semibold text-[#A33A2C] dark:text-[#F08C7D]">SOS</span>
          </button>

          {/* 4. State (Стан) */}
          <button
            type="button"
            onClick={() => setActiveTab('state')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer relative transition-all ${
              activeTab === 'state'
                ? 'text-[#1E8A69] dark:text-[#4CC9A0] font-bold scale-105'
                : 'text-[#55726B] dark:text-[#8FAAA3] font-medium hover:text-[#12302B]'
            }`}
          >
            {!hasRatedToday && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#C9701A] ring-2 ring-[#E9F1EE] dark:ring-[#0D1E1B]" />
            )}
            <Smile className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Стан</span>
          </button>

          {/* 5. Money / Goals */}
          <button
            type="button"
            onClick={() => setActiveTab('money')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'money'
                ? 'text-[#1E8A69] dark:text-[#4CC9A0] font-bold scale-105'
                : 'text-[#55726B] dark:text-[#8FAAA3] font-medium hover:text-[#12302B]'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Гроші</span>
          </button>

          {/* 6. More */}
          <button
            type="button"
            onClick={() => setActiveTab('more')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'more'
                ? 'text-[#1E8A69] dark:text-[#4CC9A0] font-bold scale-105'
                : 'text-[#55726B] dark:text-[#8FAAA3] font-medium hover:text-[#12302B]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Ще</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {isSosOpen && (
        <SosModal
          reasons={reasons}
          onClose={() => setIsSosOpen(false)}
          onCravingOver={() => {
            setIsSosOpen(false);
            alert('Чудово! Чергову хвилю тяги успішно подолано!');
          }}
          onRelapse={() => {
            setIsSosOpen(false);
            setIsRelapseOpen(true);
          }}
        />
      )}

      <SetupModal
        initialDateMs={startDate}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onSave={handleSaveDate}
      />

      <RelapseModal
        isOpen={isRelapseOpen}
        currentStart={startDate}
        onClose={() => setIsRelapseOpen(false)}
        onConfirmRelapse={handleConfirmRelapse}
      />
    </div>
  );
}
