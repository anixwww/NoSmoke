import React from 'react';
import {
  TabType,
  MoneySettings,
  DayRating,
  Streak,
  GoalsState,
  TreeState,
  DragonState,
  ZenIslandState,
  OrbitVoyageState,
  SavingsGoal,
  CompletedGoal,
} from './types';
import { CounterTab } from './components/CounterTab';
import { HealthTab } from './components/HealthTab';
import { StateSurveyTab } from './components/StateSurveyTab';
import { TreeTab } from './components/TreeTab';
import { SandTab } from './components/SandTab';
import { DragonTab } from './components/DragonTab';
import { ZenIslandTab } from './components/ZenIslandTab';
import { OrbitVoyageTab } from './components/OrbitVoyageTab';
import { MoreTab } from './components/MoreTab';
import { SosModal } from './components/SosModal';
import { SetupModal, RelapseModal } from './components/Modals';
import { OnboardingModal } from './components/OnboardingModal';
import { StardustBackground } from './components/StardustBackground';
import { IntermediatePromptModal } from './components/IntermediatePromptModal';
import { calculateCigsAvoided, calculateTotalSaved } from './utils/moneyCalculator';
import {
  Clock,
  HeartPulse,
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
  DRAGON: 'quit-smoking:dragon',
  ZEN: 'quit-smoking:zen-island',
  ORBIT: 'quit-smoking:orbit',
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

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TREE, JSON.stringify(treeState));
    } catch {}
  }, [treeState]);

  const [dragonState, setDragonState] = React.useState<DragonState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.DRAGON);
      if (v) {
        const parsed = JSON.parse(v);
        return {
          ...parsed,
          level: parsed.level || 1,
          infernalDust: parsed.infernalDust || 0,
          dungeonFloor: parsed.dungeonFloor || 1,
          dungeonWins: parsed.dungeonWins || 0
        };
      }
    } catch {}
    return {
      name: 'Астрал',
      level: 1,
      energy: 85,
      stardust: 15,
      infernalDust: 0,
      dungeonFloor: 1,
      dungeonWins: 0,
      totalBreaths: 0,
      unlockedConstellations: [],
      relics: []
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAGON, JSON.stringify(dragonState));
    } catch {}
  }, [dragonState]);

  const [zenState, setZenState] = React.useState<ZenIslandState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ZEN);
      if (v) {
        const p = JSON.parse(v);
        return {
          totalSounds: p.totalSounds || 0,
          heardInTime: p.heardInTime || 0,
          harmonyScore: p.harmonyScore || 0,
          bestStreak: p.bestStreak || 0,
          cravingsDefeated: p.cravingsDefeated || 0,
          tremorsCalmed: p.tremorsCalmed || 0,
          butterfliesMet: p.butterfliesMet || 0,
          ghostsDispelled: p.ghostsDispelled || 0,
          soundEnabled: p.soundEnabled ?? true
        };
      }
    } catch {}
    return {
      totalSounds: 0,
      heardInTime: 0,
      harmonyScore: 0,
      bestStreak: 0,
      cravingsDefeated: 0,
      tremorsCalmed: 0,
      butterfliesMet: 0,
      ghostsDispelled: 0,
      soundEnabled: true
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ZEN, JSON.stringify(zenState));
    } catch {}
  }, [zenState]);

  const [orbitState, setOrbitState] = React.useState<OrbitVoyageState>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.ORBIT);
      if (v) return JSON.parse(v);
    } catch {}
    return {
      highScoreDistance: 0,
      totalFlights: 0,
      cravingsCleared: 0,
      oxygenCollected: 0,
      stardustCollected: 0,
      unlockedShips: ['ship-aurora'],
      selectedShipId: 'ship-aurora',
      soundEnabled: true
    };
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORBIT, JSON.stringify(orbitState));
    } catch {}
  }, [orbitState]);

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
    return 'indigo';
  });

  const [activeTab, setActiveTab] = React.useState<TabType>('counter');
  const [isSosOpen, setIsSosOpen] = React.useState(false);
  const [isSetupOpen, setIsSetupOpen] = React.useState(false);
  const [isRelapseOpen, setIsRelapseOpen] = React.useState(false);
  const [isIntermediatePromptOpen, setIsIntermediatePromptOpen] = React.useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState<boolean>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:onboarded');
      if (!v) return true;
    } catch {}
    return false;
  });
  const [appToast, setAppToast] = React.useState<string | null>(null);

  const [promptIntervalMinutes, setPromptIntervalMinutes] = React.useState<number>(() => {
    try {
      const v = localStorage.getItem('quit-smoking:prompt-interval-min');
      if (v) {
        const n = Number(v);
        if (!isNaN(n) && n > 0) return n;
      }
    } catch {}
    return 30; // default 30 mins
  });

  // 30-minute interval to prompt for intermediate state assessment
  React.useEffect(() => {
    const checkInterval = setInterval(() => {
      const lastPrompt = Number(localStorage.getItem('quit-smoking:last-prompt') || 0);
      const now = Date.now();
      const intervalMs = promptIntervalMinutes * 60 * 1000;
      if (!lastPrompt || now - lastPrompt >= intervalMs) {
        setIsIntermediatePromptOpen(true);
      }
    }, 45000);

    return () => clearInterval(checkInterval);
  }, [promptIntervalMinutes]);

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

    if (accent) {
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

  // Total free time intervals (past streaks + active streak)
  const intervals = React.useMemo(() => {
    const list = streaks.map((s) => ({ from: s.from, to: s.to }));
    list.push({ from: startDate, to: Date.now() });
    return list;
  }, [streaks, startDate, diffMs]);

  // Calculations for money and cigarettes avoided (supports price changes over time)
  const cigsAvoided = calculateCigsAvoided(intervals, money);
  const totalSaved = calculateTotalSaved(intervals, money);

  // Dot badges
  const todayKey = (() => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  })();
  const hasRatedToday = !!days[todayKey];
  const canPlantTree = Math.floor(cigsAvoided / 300) > (treeState.forest.length + (treeState.current ? 1 : 0)) && !treeState.current;

  const getAccentTextClass = (id: string) => {
    switch (id) {
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

  // Handlers
  const handleSaveDate = (newMs: number) => {
    setStartDate(newMs);
    setDiffMs(Math.max(0, Date.now() - newMs));
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

  const handleAddGoal = (name: string, amount?: number, targetDate?: string) => {
    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      name,
      amount: amount && amount > 0 ? amount : undefined,
      targetDate: targetDate ? targetDate : undefined,
      createdAt: Date.now()
    };
    setGoals(prev => ({
      ...prev,
      queue: [...prev.queue, newGoal]
    }));
  };

  const handleCompleteGoal = (goalId: string) => {
    setGoals(prev => {
      const goal = prev.queue.find(g => g.id === goalId);
      if (!goal) return prev;
      const newQueue = prev.queue.filter(g => g.id !== goalId);
      const completed: CompletedGoal = {
        ...goal,
        at: Date.now(),
        total: goal.amount || totalSaved
      };
      return {
        ...prev,
        base: goal.amount ? prev.base + goal.amount : prev.base,
        queue: newQueue,
        done: [completed, ...prev.done]
      };
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => ({
      ...prev,
      queue: prev.queue.filter(g => g.id !== goalId),
      done: prev.done.filter(g => g.id !== goalId)
    }));
  };

  const handleAddReason = (newReason: string) => {
    const trimmed = newReason.trim();
    if (!trimmed) return;
    setReasons((prev) => [...prev, trimmed]);
  };

  const handleDeleteReason = (index: number) => {
    setReasons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDayRating = (dateKey: string, rating: DayRating) => {
    setDays((prev) => ({
      ...prev,
      [dateKey]: rating
    }));
  };

  const handleIntermediatePromptSubmit = (entryData: {
    mood: number;
    craving: number;
    anxiety: number;
    energy: number;
    balance: number;
    focus: number;
    note: string;
  }) => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const todayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const existing = days[todayKey] || {
      mood: entryData.mood,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      surveys: [],
      entries: []
    };

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: timeStr,
      mood: entryData.mood,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      energy: entryData.energy,
      balance: entryData.balance,
      focus: entryData.focus,
      note: entryData.note
    };

    const updatedSurveys = [...(existing.surveys || existing.entries || []), newEntry];
    handleSaveDayRating(todayKey, {
      ...existing,
      craving: entryData.craving,
      anxiety: entryData.anxiety,
      mood: entryData.mood,
      surveys: updatedSurveys,
      entries: updatedSurveys
    });

    localStorage.setItem('quit-smoking:last-prompt', String(Date.now()));
    setIsIntermediatePromptOpen(false);
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
    setAppToast('Дані успішно відновлено! ✨');
    setTimeout(() => setAppToast(null), 3500);
  };

  const handleCompleteOnboarding = (data: {
    userName: string;
    startDate: number;
    money: MoneySettings;
    mainReason: string;
  }) => {
    setStartDate(data.startDate);
    localStorage.setItem(STORAGE_KEYS.START, String(data.startDate));
    setMoney(data.money);
    localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(data.money));
    setReasons((prev) => [data.mainReason, ...prev.filter(r => r !== data.mainReason)]);
    setIsOnboardingOpen(false);
    setAppToast(`Ласкаво просимо, ${data.userName}! Ваш шлях розпочато 🌟`);
    setTimeout(() => setAppToast(null), 4000);
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
              goals.queue[0] && goals.queue[0].amount
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
            onAddGoal={handleAddGoal}
            onCompleteGoal={handleCompleteGoal}
            onDeleteGoal={handleDeleteGoal}
            dayRatings={days}
            dragonState={dragonState}
            zenState={zenState}
            orbitState={orbitState}
            accent={accent}
            onUpdateReasons={setReasons}
            onUpdateMoney={(newMoney) => {
              setMoney(newMoney);
              try {
                localStorage.setItem(STORAGE_KEYS.MONEY, JSON.stringify(newMoney));
              } catch {}
            }}
          />
        )}

        {activeTab === 'health' && (
          <HealthTab diffMs={totalFreeMs} startDate={startDate} />
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
            totalSeconds={totalSeconds}
            onUpdateTreeState={setTreeState}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'sand' && (
          <SandTab daysCount={totalSeconds} onSwitchTab={setActiveTab} />
        )}

        {activeTab === 'dragon' && (
          <DragonTab
            cigsAvoided={cigsAvoided}
            totalFreeMs={totalFreeMs}
            dragonState={dragonState}
            onUpdateDragonState={setDragonState}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'zen' && (
          <ZenIslandTab
            cigsAvoided={cigsAvoided}
            zenState={zenState}
            onUpdateZenState={setZenState}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'orbit' && (
          <OrbitVoyageTab
            cigsAvoided={cigsAvoided}
            orbitState={orbitState}
            dragonState={dragonState}
            onUpdateOrbitState={setOrbitState}
            onUpdateDragonState={setDragonState}
            onSwitchTab={setActiveTab}
          />
        )}

        {activeTab === 'more' && (
          <MoreTab
            reasons={reasons}
            streaks={streaks}
            currentStart={startDate}
            totalFreeMs={totalFreeMs}
            longestStreakMs={longestStreakMs}
            goals={goals}
            totalSaved={totalSaved}
            cigsAvoided={cigsAvoided}
            money={money}
            days={days}
            promptIntervalMinutes={promptIntervalMinutes}
            currentAccent={accent}
            onUpdateAccent={(val) => {
              setAccent(val);
              try {
                localStorage.setItem(STORAGE_KEYS.ACCENT, val);
              } catch {}
            }}
            onUpdatePromptInterval={(val) => {
              setPromptIntervalMinutes(val);
              try {
                localStorage.setItem('quit-smoking:prompt-interval-min', String(val));
              } catch {}
            }}
            onUpdateMoney={setMoney}
            onAddGoal={handleAddGoal}
            onCompleteGoal={handleCompleteGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddReason={handleAddReason}
            onDeleteReason={handleDeleteReason}
            onUndoLastRelapse={handleUndoLastRelapse}
            onOpenSetup={() => setIsSetupOpen(true)}
            onOpenRelapse={() => setIsRelapseOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2d2d35] py-2 px-2 sm:px-4 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-0.5 text-center">
          {/* 1. Counter / Home */}
          <button
            type="button"
            onClick={() => setActiveTab('counter')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'counter'
                ? `${getAccentTextClass(accent)} font-bold scale-105`
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Головна</span>
          </button>

          {/* 2. SOS */}
          <button
            type="button"
            id="nav-btn-sos"
            onClick={() => setIsSosOpen(true)}
            className="py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-[#E4F1ED]"
            aria-label="SOS"
          >
            <ShieldAlert className="w-5 h-5 text-[#A33A2C] dark:text-[#F08C7D]" />
            <span className="text-[10px] sm:text-[11px] leading-tight font-semibold text-[#A33A2C] dark:text-[#F08C7D]">SOS</span>
          </button>

          {/* 3. State (Стан) */}
          <button
            type="button"
            onClick={() => setActiveTab('state')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer relative transition-all ${
              activeTab === 'state'
                ? `${getAccentTextClass(accent)} font-bold scale-105`
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
            }`}
          >
            {!hasRatedToday && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#C9701A] ring-2 ring-white dark:ring-[#0D1E1B]" />
            )}
            <Smile className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Стан</span>
          </button>

          {/* 4. More */}
          <button
            type="button"
            onClick={() => setActiveTab('more')}
            className={`py-1.5 flex flex-col items-center gap-0.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'more'
                ? `${getAccentTextClass(accent)} font-bold scale-105`
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-[#f4f4f5]'
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
            setAppToast('Чудово! Чергову хвилю тяги успішно подолано! 🏆');
            setTimeout(() => setAppToast(null), 4000);
          }}
          onRelapse={() => {
            setIsSosOpen(false);
            setIsRelapseOpen(true);
          }}
          onLaunchOrbit={() => {
            setIsSosOpen(false);
            setActiveTab('orbit');
          }}
        />
      )}

      {/* Floating Notification Toast */}
      {appToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#12302B] dark:bg-[#1E8A69] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-xl border border-white/20 animate-fade-in flex items-center gap-2">
          <span>{appToast}</span>
        </div>
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

      <IntermediatePromptModal
        isOpen={isIntermediatePromptOpen}
        onClose={() => {
          setIsIntermediatePromptOpen(false);
          localStorage.setItem('quit-smoking:last-prompt', String(Date.now()));
        }}
        onSubmit={handleIntermediatePromptSubmit}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
