import React, { useState, useEffect } from 'react';
import { MoneySettings, TreeState, GoalsState, DragonState, ZenIslandState, OrbitVoyageState, DayRating } from '../types';
import { TREE_SPECIES, getTreeStageInfo } from '../data/treeSpecies';
import { getTodayHealthFact, HEALTH_MILESTONES, getBodySystemsRecovery } from '../data/healthData';
import { LEVEL_CONFIG, getLevelCounts } from '../data/sandConfig';
import { DRAGON_UNLOCK_CIGS, getDragonStage, getDragonLevelTitle, calculateCombatPower } from '../data/dragonData';
import {
  User,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Trees,
  ArrowRight,
  Target,
  Check,
  Lock,
  TrendingUp,
  Clock,
  BookOpen,
  Dumbbell,
  Footprints,
  CheckSquare,
  Brain,
  ChevronUp,
  ChevronDown,
  Gift,
  Minimize2,
  Maximize2
} from 'lucide-react';

import { JourneyMapModal } from './JourneyMapModal';
import { TriggerActionPlans } from './TriggerActionPlans';
import { HydrationCard } from './HydrationCard';
import { DailyStepsSection } from './DailyStepsSection';
import { MentalHealthCard } from './MentalHealthCard';
import { GratitudeJournalCard } from './GratitudeJournalCard';
import { HealthRecoveryWidget } from './HealthRecoveryWidget';
import { MotivationalPhrasesModal, MotivationStyle } from './MotivationalPhrasesModal';
import { SavedResourcesSettingsModal } from './SavedResourcesSettingsModal';
import { GoalSettingsModal } from './GoalSettingsModal';
import { QuickGoalCard } from './QuickGoalCard';
import { 
  X, 
  Bookmark, 
  Pin, 
  Edit3, 
  ChevronLeft, 
  ChevronRight as ChevronRightIcon,
  Coins,
  Hourglass,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredHours: number;
}

const STAR_ACHIEVEMENTS: Achievement[] = [
  { id: 't_1h', title: '1 година', description: 'Початок шляху', icon: '⏱️', requiredHours: 1 },
  { id: 't_12h', title: '12 годин', description: 'Половина доби', icon: '⏳', requiredHours: 12 },
  { id: 't_1d', title: '1 день', description: '24 години вільності', icon: '🌅', requiredHours: 24 },
  { id: 't_2d', title: '2 дні', description: '48 годин чистоти', icon: '🌿', requiredHours: 48 },
  { id: 't_3d', title: '3 дні', description: '72 години витримки', icon: '🔥', requiredHours: 72 },
  { id: 't_5d', title: '5 днів', description: '5 днів без нікотину', icon: '⚡', requiredHours: 120 },
  { id: 't_7d', title: '1 тиждень', description: '7 днів перемоги', icon: '🛡️', requiredHours: 168 },
  { id: 't_14d', title: '2 тижні', description: '14 днів свободи', icon: '🌟', requiredHours: 336 },
  { id: 't_30d', title: '1 місяць', description: '30 днів відновлення', icon: '🌙', requiredHours: 720 },
  { id: 't_90d', title: '3 місяці', description: '90 днів сили', icon: '👑', requiredHours: 2160 },
  { id: 't_180d', title: '6 місяців', description: 'Пів року вільності', icon: '🚀', requiredHours: 4380 },
  { id: 't_1y', title: '1 рік', description: '365 днів гармонії', icon: '🏆', requiredHours: 8760 },
  { id: 't_2y', title: '2 роки', description: '730 днів свободи', icon: '⭐', requiredHours: 17520 },
  { id: 't_3y', title: '3 роки', description: 'Стійка звичка чистоти', icon: '🏅', requiredHours: 26280 },
  { id: 't_4y', title: '4 роки', description: '4 роки вільне життя', icon: '🎖️', requiredHours: 35040 },
  { id: 't_5y', title: '5 років', description: 'П’ятирічний рубіж вільності', icon: '💎', requiredHours: 43800 },
  { id: 't_6y', title: '6 років', description: '6 років гармонії та сили', icon: '🌿', requiredHours: 52560 },
  { id: 't_7y', title: '7 років', description: '7 років повного оновлення', icon: '🔥', requiredHours: 61320 },
  { id: 't_8y', title: '8 років', description: '8 років незламності', icon: '⚡', requiredHours: 70080 },
  { id: 't_9y', title: '9 років', description: '9 років свіжого дихання', icon: '🌟', requiredHours: 78840 },
  { id: 't_10y', title: '10+ років', description: 'Легендарне десятиліття вільності', icon: '👑', requiredHours: 87600 },
];

interface CounterTabProps {
  diffMs: number;
  startDate: number;
  money: MoneySettings | null;
  totalSaved: number;
  cigsAvoided: number;
  treeState: TreeState;
  dragonState?: DragonState;
  zenState?: ZenIslandState;
  orbitState?: OrbitVoyageState;
  daysCount: number;
  reasons: string[];
  goals?: GoalsState;
  activeGoalName?: string;
  activeGoalPct?: number;
  onOpenSos: () => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onSwitchTab: (tab: any) => void;
  onAddGoal?: (name: string, amount?: number, targetDate?: string) => void;
  onCompleteGoal?: (goalId: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  dayRatings: Record<string, DayRating>;
  accent?: string;
  onUpdateReasons?: (reasons: string[]) => void;
  onUpdateMoney?: (money: MoneySettings) => void;
}

export const CounterTab: React.FC<CounterTabProps> = ({
  diffMs,
  startDate,
  money,
  totalSaved,
  cigsAvoided,
  treeState,
  dragonState,
  zenState,
  orbitState,
  daysCount,
  reasons,
  goals,
  activeGoalName,
  activeGoalPct,
  onOpenSos,
  onOpenSetup,
  onOpenRelapse,
  onSwitchTab,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
  dayRatings,
  accent = 'indigo',
  onUpdateReasons,
  onUpdateMoney
}) => {
  const [currentReasonIdx, setCurrentReasonIdx] = React.useState(0);
  const [timerStyle, setTimerStyle] = React.useState<'neon' | 'minimal' | 'digital' | 'threed' | 'handwritten' | 'matrix'>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:timer-style');
      if (['neon', 'minimal', 'digital', 'threed', 'handwritten', 'matrix'].includes(saved || '')) {
        return saved as any;
      }
    } catch {}
    return 'neon';
  });
  const [showStyleModal, setShowStyleModal] = React.useState(false);

  const updateTimerStyle = (style: typeof timerStyle) => {
    setTimerStyle(style);
    try {
      localStorage.setItem('quit-smoking:timer-style', style);
    } catch {}
  };

  // Timer long press
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const handleMouseDown = () => {
    pressTimer.current = setTimeout(() => {
        setShowStyleModal(true);
    }, 500);
  };
  const handleMouseUp = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const [hideStars, setHideStars] = React.useState<boolean>(() => sessionStorage.getItem('hide_star_achievements') === 'true');
  const [dragonToast, setDragonToast] = React.useState<string | null>(null);
  const [isJourneyMapOpen, setIsJourneyMapOpen] = React.useState(false);
  const [flickerActive, setFlickerActive] = React.useState(false);
  const [flickeringIndices, setFlickeringIndices] = React.useState<number[]>([]);
  const [extinguishedIndices, setExtinguishedIndices] = React.useState<number[]>([]);
  const [globalBlackout, setGlobalBlackout] = React.useState(false);

  const [isHydrationOpen, setIsHydrationOpen] = React.useState(false);
  const [isStepsOpen, setIsStepsOpen] = React.useState(false);
  const [isMentalHealthOpen, setIsMentalHealthOpen] = React.useState(false);
  const [isGratitudeOpen, setIsGratitudeOpen] = React.useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = React.useState(false);
  const [isMotivationsModalOpen, setIsMotivationsModalOpen] = React.useState(false);
  const [isSavedResourcesModalOpen, setIsSavedResourcesModalOpen] = React.useState(false);

  const [motivationStyle, setMotivationStyle] = React.useState<MotivationStyle>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:motivational-style');
      if (saved === 'quote' || saved === 'card' || saved === 'neon' || saved === 'kraft' || saved === 'ticker') {
        return saved;
      }
    } catch {}
    return 'quote';
  });

  const [autoRotateMotivations, setAutoRotateMotivations] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:motivational-autorotate') === 'true';
    } catch {
      return false;
    }
  });

  const handleStyleChange = (style: MotivationStyle) => {
    setMotivationStyle(style);
    try {
      localStorage.setItem('quit-smoking:motivational-style', style);
    } catch {}
  };

  const handleAutoRotateChange = (val: boolean) => {
    setAutoRotateMotivations(val);
    try {
      localStorage.setItem('quit-smoking:motivational-autorotate', String(val));
    } catch {}
  };

  // Auto-rotate effect
  React.useEffect(() => {
    if (!autoRotateMotivations || reasons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReasonIdx((prev) => (prev + 1) % (reasons.length || 1));
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRotateMotivations, reasons.length]);

  const [isCompactGoals, setIsCompactGoals] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('quit-smoking:use-compact-goals') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCompactGoals = () => {
    const nextVal = !isCompactGoals;
    setIsCompactGoals(nextVal);
    try {
      localStorage.setItem('quit-smoking:use-compact-goals', String(nextVal));
      window.dispatchEvent(new Event('compact-goals-change'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  React.useEffect(() => {
    const handleCompactChange = () => {
      try {
        setIsCompactGoals(localStorage.getItem('quit-smoking:use-compact-goals') === 'true');
      } catch {}
    };
    window.addEventListener('storage', handleCompactChange);
    window.addEventListener('compact-goals-change', handleCompactChange);
    return () => {
      window.removeEventListener('storage', handleCompactChange);
      window.removeEventListener('compact-goals-change', handleCompactChange);
    };
  }, []);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const handleUpdate = () => setRefreshTick(prev => prev + 1);

  const accentThemeInfo = React.useMemo(() => {
    switch (accent) {
      case 'indigo':
        return {
          glowColor: '#818cf8', // indigo-400
          offColor: '#1e1b4b',   // indigo-950
          shadowColor: '#4f46e5', // indigo-600
          gradientClass: 'bg-gradient-to-r from-indigo-600 to-sky-400 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent'
        };
      case 'gray':
        return {
          glowColor: '#94a3b8', // slate-400
          offColor: '#1e293b',   // slate-800
          shadowColor: '#475569', // slate-600
          gradientClass: 'bg-gradient-to-r from-slate-600 to-slate-400 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent'
        };
      case 'amber':
        return {
          glowColor: '#fbbf24', // amber-400
          offColor: '#451a03',   // amber-950
          shadowColor: '#d97706', // amber-600
          gradientClass: 'bg-gradient-to-r from-amber-600 to-yellow-400 dark:from-amber-400 dark:to-yellow-300 bg-clip-text text-transparent'
        };
      case 'rose':
        return {
          glowColor: '#fb7185', // rose-400
          offColor: '#4c0519',   // rose-950
          shadowColor: '#e11d48', // rose-600
          gradientClass: 'bg-gradient-to-r from-rose-600 to-pink-400 dark:from-rose-400 dark:to-pink-300 bg-clip-text text-transparent'
        };
      case 'emerald':
        return {
          glowColor: '#34d399', // emerald-400
          offColor: '#064e3b',   // emerald-950
          shadowColor: '#059669', // emerald-600
          gradientClass: 'bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent'
        };
      case 'teal':
        return {
          glowColor: '#2dd4bf', // teal-400
          offColor: '#134e4a',   // teal-950
          shadowColor: '#0d9488', // teal-600
          gradientClass: 'bg-gradient-to-r from-teal-600 to-cyan-400 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent'
        };
      case 'sage':
        return {
          glowColor: '#a8a29e', // stone-400
          offColor: '#292524',   // stone-800
          shadowColor: '#57534e', // stone-600
          gradientClass: 'bg-gradient-to-r from-stone-600 to-stone-400 dark:from-stone-400 dark:to-stone-200 bg-clip-text text-transparent'
        };
      case 'green':
      default:
        return {
          glowColor: '#4CC9A0',
          offColor: '#12302B',
          shadowColor: '#1E8A69',
          gradientClass: 'bg-gradient-to-r from-[#1E8A69] to-[#4CC9A0] bg-clip-text text-transparent'
        };
    }
  }, [accent]);

  const getAccentBorderClass = (id: string) => {
    switch (id) {
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

  const getAccentBgClass = (id: string) => {
    switch (id) {
      case 'indigo': return 'bg-indigo-500/10 dark:bg-indigo-400/15';
      case 'gray': return 'bg-slate-500/10 dark:bg-slate-400/15';
      case 'amber': return 'bg-amber-500/10 dark:bg-amber-400/15';
      case 'rose': return 'bg-rose-500/10 dark:bg-rose-400/15';
      case 'emerald': return 'bg-emerald-500/10 dark:bg-emerald-400/15';
      case 'teal': return 'bg-teal-500/10 dark:bg-teal-400/15';
      case 'sage': return 'bg-stone-500/10 dark:bg-stone-400/15';
      case 'green':
      default: return 'bg-emerald-500/10 dark:bg-emerald-400/15';
    }
  };

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

  const triggerTimerFlicker = () => {
    if (flickerActive) return;
    
    const textLen = humanQuitTimeText.length;
    if (textLen === 0) return;
    
    setFlickerActive(true);
    
    // Choose if this click triggered a long/severe malfunction combination (45% chance)
    const isLongMalfunction = Math.random() < 0.45;

    if (isLongMalfunction) {
      // --- LONG SEVERE MALFUNCTION SEQUENCE (~3.1 seconds of agonizing struggle) ---
      
      // Stage L1: Immediate global blackout
      setGlobalBlackout(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate([100, 60, 100]);
        } catch (e) {}
      }

      // Stage L2: Power returns weakly. Most chars are extinguished (completely out) and a few flicker
      setTimeout(() => {
        setGlobalBlackout(false);
        // Almost all chars extinguished
        const extIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(() => Math.random() < 0.7); // 70% of chars go dead
        setExtinguishedIndices(extIdxs);

        const flickIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(i => !extIdxs.includes(i) && Math.random() < 0.5);
        setFlickeringIndices(flickIdxs);
        
        if (navigator.vibrate) {
          try {
            navigator.vibrate([40, 40, 40]);
          } catch (e) {}
        }
      }, 250);

      // Stage L3: Power drops again (second blackout)
      setTimeout(() => {
        setGlobalBlackout(true);
      }, 950);

      // Stage L4: Rapid chaotic flickering on all segments (neon buzzes furiously)
      setTimeout(() => {
        setGlobalBlackout(false);
        setExtinguishedIndices([]);
        // All characters flicker rapidly like a dying lamp
        const allIdxs = Array.from({ length: textLen }, (_, i) => i);
        setFlickeringIndices(allIdxs);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([30, 20, 30, 20, 30, 20]);
          } catch (e) {}
        }
      }, 1150);

      // Stage L5: Third quick drop to darkness
      setTimeout(() => {
        setGlobalBlackout(true);
        setFlickeringIndices([]);
      }, 1800);

      // Stage L6: Partial return. Only a few letters spark.
      setTimeout(() => {
        setGlobalBlackout(false);
        const extIdxs = Array.from({ length: textLen }, (_, i) => i)
          .filter(() => Math.random() < 0.4); // 40% dead
        setExtinguishedIndices(extIdxs);
        
        const flickCount = Math.floor(Math.random() * 3) + 1;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx) && !extIdxs.includes(randIdx)) {
            flickIdxs.push(randIdx);
          }
        }
        setFlickeringIndices(flickIdxs);
      }, 2050);

      // Stage L7: Stabilization and full bright return!
      setTimeout(() => {
        setFlickerActive(false);
        setFlickeringIndices([]);
        setExtinguishedIndices([]);
        setGlobalBlackout(false);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([40, 200]);
          } catch (e) {}
        }
      }, 3100);

    } else {
      // --- STANDARD QUICK FLICKER SEQUENCE (~1.6 seconds) ---
      
      // Stage S1: Immediate total blackout of the entire neon board!
      setGlobalBlackout(true);
      if (navigator.vibrate) {
        try {
          navigator.vibrate([80, 50, 40]);
        } catch (e) {}
      }

      // Stage S2: Turn back on, but with some characters flickering and some completely extinguished
      setTimeout(() => {
        setGlobalBlackout(false);
        
        const flickCount = Math.floor(Math.random() * 3) + 2;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx)) flickIdxs.push(randIdx);
        }
        setFlickeringIndices(flickIdxs);

        const extCount = Math.floor(Math.random() * 2) + 1;
        const extIdxs: number[] = [];
        while (extIdxs.length < extCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!extIdxs.includes(randIdx)) extIdxs.push(randIdx);
        }
        setExtinguishedIndices(extIdxs);

        if (navigator.vibrate) {
          try {
            navigator.vibrate([30, 100, 30]);
          } catch (e) {}
        }
      }, 180);

      // Stage S3: A momentary second full blackout (power drop) after 700ms
      setTimeout(() => {
        setGlobalBlackout(true);
      }, 700);

      // Stage S4: Restore with different flickering indices, and some extinguished
      setTimeout(() => {
        setGlobalBlackout(false);
        
        const extCount = Math.floor(Math.random() * 2) + 1;
        const extIdxs: number[] = [];
        while (extIdxs.length < extCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!extIdxs.includes(randIdx)) extIdxs.push(randIdx);
        }
        setExtinguishedIndices(extIdxs);
        
        const flickCount = Math.floor(Math.random() * 2) + 1;
        const flickIdxs: number[] = [];
        while (flickIdxs.length < flickCount) {
          const randIdx = Math.floor(Math.random() * textLen);
          if (!flickIdxs.includes(randIdx) && !extIdxs.includes(randIdx)) flickIdxs.push(randIdx);
        }
        setFlickeringIndices(flickIdxs);
      }, 850);

      // Stage S5: Final neon stabilization and fully restore
      setTimeout(() => {
        setFlickerActive(false);
        setFlickeringIndices([]);
        setExtinguishedIndices([]);
        setGlobalBlackout(false);
        if (navigator.vibrate) {
          try {
            navigator.vibrate([20]);
          } catch (e) {}
        }
      }, 1600);
    }
  };

  // Auto-rotate reasons every 10 seconds
  React.useEffect(() => {
    if (reasons.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReasonIdx((prev) => (prev + 1) % reasons.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [reasons.length]);

  // Check hydration for today
  const hydrationState = React.useMemo(() => {
    try {
      const d = new Date();
      const key = `quit-smoking:hydration-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const goalKey = 'quit-smoking:hydration-goal';
      const showIndicatorKey = 'quit-smoking:hydration-show-indicator';
      const saved = localStorage.getItem(key);
      const savedGoal = localStorage.getItem(goalKey);
      const savedShow = localStorage.getItem(showIndicatorKey);
      const ml = saved !== null ? parseInt(saved, 10) || 0 : 0;
      const goal = savedGoal !== null ? parseInt(savedGoal, 10) || 2000 : 2000;
      const showIndicator = savedShow !== null ? savedShow === 'true' : true;
      const pct = Math.min(100, Math.round((ml / goal) * 100));
      const isLow = ml < Math.round(goal * 0.25);
      return { ml, isLow, goal, pct, showIndicator };
    } catch {
      return { ml: 0, isLow: true, goal: 2000, pct: 0, showIndicator: true };
    }
  }, [refreshTick]);

  // Check mental health for today
  const mentalHealthState = React.useMemo(() => {
    try {
      const d = new Date();
      const todayKey = `quit-smoking:mental-health-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const habitsKey = 'quit-smoking:mental-health-habits-config';
      const showIndicatorKey = 'quit-smoking:mental-health-show-indicator';

      const savedLog = localStorage.getItem(todayKey);
      const savedHabits = localStorage.getItem(habitsKey);
      const savedShow = localStorage.getItem(showIndicatorKey);

      const log = savedLog ? JSON.parse(savedLog) : {};
      const habits = savedHabits ? JSON.parse(savedHabits) : [];
      const showIndicator = savedShow !== null ? savedShow === 'true' : true;

      const list = Array.isArray(habits) && habits.length > 0 ? habits : [
        { id: 'hugs', type: 'checkbox' },
        { id: 'chat', type: 'checkbox' },
        { id: 'cold_splash', type: 'checkbox' },
        { id: 'sun_walk', type: 'checkbox' },
        { id: 'music', type: 'checkbox' },
        { id: 'gratitude', type: 'checkbox' },
        { id: 'dark_chocolate', type: 'checkbox' },
        { id: 'breathing', type: 'checkbox' },
        { id: 'micro_win', type: 'checkbox' },
        { id: 'smile', type: 'checkbox' }
      ];

      let score = 0;
      list.forEach((h: any) => {
        const val = log[h.id];
        if (h.type === 'counter') {
          const target = h.targetCount || 10;
          const count = typeof val === 'number' ? val : 0;
          score += Math.min(1, count / target);
        } else if (val === true) {
          score += 1;
        }
      });

      const pct = list.length > 0 ? Math.round((score / list.length) * 100) : 0;
      return { pct, showIndicator };
    } catch {
      return { pct: 0, showIndicator: true };
    }
  }, [refreshTick]);

  // Check gratitude journal state for today and reminder visibility
  const gratitudeState = React.useMemo(() => {
    try {
      const d = new Date();
      const todayDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const showKey = 'quit-smoking:gratitude-show-indicator';
      const timeKey = 'quit-smoking:gratitude-indicator-time';
      const storageKey = 'quit-smoking:gratitude-journal-entries';

      const savedShow = localStorage.getItem(showKey);
      const savedTime = localStorage.getItem(timeKey);
      const savedEntries = localStorage.getItem(storageKey);

      const showIndicator = savedShow !== null ? savedShow === 'true' : true;
      const indicatorTime = savedTime || 'always';

      let isVisibleByTime = true;
      if (indicatorTime !== 'always') {
        const targetHour = parseInt(indicatorTime.split(':')[0], 10) || 18;
        const currentHour = d.getHours();
        if (currentHour < targetHour) {
          isVisibleByTime = false;
        }
      }

      const list = savedEntries ? JSON.parse(savedEntries) : [];
      const todayEntry = Array.isArray(list) ? list.find((e: any) => e.date === todayDateStr) : null;

      let count = 0;
      if (todayEntry) {
        if (todayEntry.g1 && todayEntry.g1.trim()) count++;
        if (todayEntry.g2 && todayEntry.g2.trim()) count++;
        if (todayEntry.g3 && todayEntry.g3.trim()) count++;
      }

      return {
        count,
        showIndicator: showIndicator && isVisibleByTime,
        isCompleted: count >= 3
      };
    } catch {
      return { count: 0, showIndicator: true, isCompleted: false };
    }
  }, [refreshTick]);

  const isDragonUnlocked = cigsAvoided >= DRAGON_UNLOCK_CIGS;
  const dragonStage = getDragonStage(cigsAvoided);
  const dragonLeft = Math.max(0, Math.ceil(DRAGON_UNLOCK_CIGS - cigsAvoided));
  const dragonProgressPct = Math.min(100, Math.max(3, (cigsAvoided / DRAGON_UNLOCK_CIGS) * 100));

  const handleDragonClick = () => {
    if (!isDragonUnlocked) {
      setDragonToast(`Ще ${dragonLeft} невикурених сигарет до пробудження Космічного Дракона! 🐉✨`);
      setTimeout(() => setDragonToast(null), 3500);
      return;
    }
    onSwitchTab('dragon');
  };

  const handleHealthClick = () => {
    try {
      const saved = localStorage.getItem('quit-smoking:more-sections-open');
      const current = saved ? JSON.parse(saved) : {};
      current.health = true;
      localStorage.setItem('quit-smoking:more-sections-open', JSON.stringify(current));
    } catch (e) {}
    onSwitchTab('more');
  };

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

  // Digital format: D:HH:MM:SS:CC
  const digitalTimeText = React.useMemo(() => {
    const ms = diffMs % 1000;
    const cs = Math.floor(ms / 10);
    if (days > 0) {
      return `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(cs)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(cs)}`;
  }, [days, hours, minutes, seconds, diffMs]);

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
    return (goals?.done || []).reduce((acc, g) => acc + (g.total || g.amount || 0), 0);
  }, [goals?.done]);

  const availableForDreams = React.useMemo(() => {
    return Math.max(0, totalSaved - (goals?.base || 0));
  }, [totalSaved, goals?.base]);

  // Current active smoking expense rates
  const curPerDay = money?.perDay ?? 20;
  const curPackSize = money?.packSize ?? 20;
  const curPackPrice = money?.packPrice ?? 100;

  const costPerCig = curPackSize > 0 ? curPackPrice / curPackSize : 0;
  const costPerDay = curPackSize > 0 ? (curPerDay / curPackSize) * curPackPrice : 0;
  const costPerMonth = costPerDay * 30;
  const costPerYear = costPerDay * 365;

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

  // Calculation of returned time: 1 cigarette takes user-defined minutes (default 7 min)
  const returnedTimeData = React.useMemo(() => {
    const minutesPerCig = money?.minutesPerCig ?? 7;
    const totalMinutes = Math.round(cigsAvoided * minutesPerCig);
    const wholeHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const getBooksDeclension = (b: number) => {
      const m10 = b % 10;
      const m100 = b % 100;
      if (m100 >= 11 && m100 <= 14) return 'книг';
      if (m10 === 1) return 'книга';
      if (m10 >= 2 && m10 <= 4) return 'книги';
      return 'книг';
    };

    const getWorkoutsDeclension = (w: number) => {
      const m10 = w % 10;
      const m100 = w % 100;
      if (m100 >= 11 && m100 <= 14) return 'тренувань';
      if (m10 === 1) return 'тренування';
      if (m10 >= 2 && m10 <= 4) return 'тренування';
      return 'тренувань';
    };

    let timeText = '';
    if (wholeHours >= 24) {
      const d = Math.floor(wholeHours / 24);
      const h = wholeHours % 24;
      timeText = `${wholeHours} год (${d} дн. ${h > 0 ? `${h} год` : ''})`.trim();
    } else if (wholeHours > 0) {
      timeText = `${wholeHours} год${remainingMinutes > 0 ? ` ${remainingMinutes} хв` : ''}`;
    } else {
      timeText = `${Math.max(1, totalMinutes)} хв`;
    }

    // Realistic equivalents
    const booksCount = Math.max(1, Math.round(Math.max(1, wholeHours) / 10));
    const workoutsCount = Math.max(1, Math.round(Math.max(1, wholeHours) / 1));

    const perDay = money?.perDay ?? 15;
    const yearlyMinutes = perDay * minutesPerCig * 365;
    const yearlyHours = Math.round(yearlyMinutes / 60);

    return {
      totalMinutes,
      wholeHours,
      timeText,
      yearlyHoursText: `${yearlyHours.toLocaleString('uk-UA')} год/рік`,
      booksText: `${booksCount} ${getBooksDeclension(booksCount)}`,
      workoutsText: `${workoutsCount} ${getWorkoutsDeclension(workoutsCount)}`
    };
  }, [cigsAvoided, money?.minutesPerCig, money?.perDay]);

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
         <style dangerouslySetInnerHTML={{ __html: `
          @keyframes neonFlicker {
            0%, 18%, 22%, 25%, 53%, 57%, 100% {
              opacity: 1;
              color: ${accentThemeInfo.glowColor};
              text-shadow: 0 0 6px ${accentThemeInfo.glowColor}, 0 0 12px ${accentThemeInfo.shadowColor}, 0 0 20px ${accentThemeInfo.shadowColor};
            }
            20%, 24%, 55% {
              opacity: 0.1;
              color: ${accentThemeInfo.offColor};
              text-shadow: none;
            }
          }
          .neon-flickering-char {
            animation: neonFlicker 0.18s infinite;
          }
          .neon-extinguished-char {
            opacity: 0.04 !important;
            color: ${accentThemeInfo.offColor} !important;
            text-shadow: none !important;
          }
          @keyframes redFlicker {
            0%, 100% {
              box-shadow: 0 0 4px #ef4444;
              border-color: #f87171;
              opacity: 0.85;
            }
            50% {
              box-shadow: 0 0 10px #ef4444, 0 0 15px #f87171;
              border-color: #ef4444;
              opacity: 1;
            }
          }
          @keyframes yellowGlow {
            0%, 100% {
              box-shadow: 0 0 2px #eab308;
              border-color: #facc15;
            }
            50% {
              box-shadow: 0 0 8px #eab308;
              border-color: #eab308;
            }
          }
          @keyframes greenGlow {
            0%, 100% {
              box-shadow: 0 0 2px #22c55e;
              border-color: #4ade80;
            }
            50% {
              box-shadow: 0 0 8px #22c55e;
              border-color: #22c55e;
            }
          }
          .flicker-glow-red {
            animation: redFlicker 1s infinite ease-in-out;
          }
          .flicker-glow-yellow {
            animation: yellowGlow 1.8s infinite ease-in-out;
          }
          .flicker-glow-green {
            animation: greenGlow 2.5s infinite ease-in-out;
          }
          @keyframes matrixGlow {
            0%, 100% {
              color: #22c55e;
              text-shadow: 0 0 8px #22c55e, 0 0 15px #16a34a;
            }
            50% {
              color: #4ade80;
              text-shadow: 0 0 12px #22c55e, 0 0 25px #4ade80;
            }
          }
          .timer-matrix {
            animation: matrixGlow 3s infinite ease-in-out;
            font-family: monospace;
          }
          .timer-sketch {
            background: repeating-linear-gradient(
              45deg,
              currentColor,
              currentColor 2px,
              transparent 2px,
              transparent 4px
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent !important;
            filter: drop-shadow(1px 1px 0px rgba(0,0,0,0.1));
            letter-spacing: 2px;
          }
          .timer-3d {
            color: #f8fafc;
            text-shadow: 
              1px 1px 0px #cbd5e1,
              2px 2px 0px #94a3b8,
              3px 3px 0px #64748b,
              4px 4px 5px rgba(0,0,0,0.3);
            transform: skew(-2deg, 1deg);
          }
          .timer-handwritten {
            font-family: "Brush Script MT", cursive;
            font-style: italic;
            letter-spacing: -1px;
            transform: rotate(-1deg);
          }
          .timer-digital {
            font-family: "Courier New", Courier, monospace;
            background: #000;
            color: #ef4444;
            padding: 4px 12px;
            border-radius: 4px;
            box-shadow: inset 0 0 10px #000, 0 0 15px rgba(239, 68, 68, 0.4);
            border: 1px solid #333;
          }
        `}} />

        <h1 
          onClick={triggerTimerFlicker}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums whitespace-nowrap animate-breathing cursor-pointer select-none active:scale-95 transition-all duration-75 flex items-center justify-center gap-[0.5px] ${globalBlackout ? 'opacity-5' : ''} ${timerStyle === 'digital' ? 'timer-digital' : ''}`}
          title="Натисніть на таймер, щоб перевірити контакт! ⚡. Утримуйте для зміни стилю."
        >
          {(timerStyle === 'digital' ? digitalTimeText : humanQuitTimeText).split('').map((char, index) => {
            const isFlickering = flickerActive && flickeringIndices.includes(index);
            const isExtinguished = flickerActive && extinguishedIndices.includes(index);
            
            let charClass = `${accentThemeInfo.gradientClass} inline-block`;
            
            if (timerStyle === 'neon') {
              if (isExtinguished) {
                charClass = 'neon-extinguished-char inline-block';
              } else if (isFlickering) {
                charClass = 'neon-flickering-char inline-block';
              }
            } else if (timerStyle === 'minimal') {
              charClass = `text-slate-600 dark:text-slate-400 font-mono inline-block`;
            } else if (timerStyle === 'matrix') {
              charClass = `timer-matrix inline-block`;
            } else if (timerStyle === 'threed') {
              charClass = `timer-3d inline-block`;
            } else if (timerStyle === 'handwritten') {
              charClass = `timer-handwritten inline-block text-slate-700 dark:text-slate-300`;
            } else if (timerStyle === 'digital') {
              charClass = `inline-block`;
            }

            return (
              <span
                key={index}
                className={charClass}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </h1>

        {showStyleModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
            <div className="bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 w-full max-w-[280px] shadow-2xl scale-in-center">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Циферблат</h2>
                <button onClick={() => setShowStyleModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'neon', name: 'Неон', icon: '✨' },
                  { id: 'digital', name: 'LCD', icon: '📟' },
                  { id: 'threed', name: '3D', icon: '🧊' },
                  { id: 'matrix', name: 'Зелений', icon: '📟' },
                  { id: 'handwritten', name: 'Курсив', icon: '✍️' },
                  { id: 'minimal', name: 'Моно', icon: '🕒' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => { updateTimerStyle(style.id as any); setShowStyleModal(false); }}
                    className={`flex-1 min-w-[100px] flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      timerStyle === style.id 
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm' 
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-slate-400 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{style.icon}</span>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Current active star badge under timer */}
        {!hideStars && (() => {
          const totalHours = diffMs / (3600 * 1000);
          const unlocked = STAR_ACHIEVEMENTS.filter((ach) => totalHours >= ach.requiredHours);
          const currentBadge = unlocked.length > 0 ? unlocked[unlocked.length - 1] : STAR_ACHIEVEMENTS[0];
          const nextAchievement = STAR_ACHIEVEMENTS.find((ach) => totalHours < ach.requiredHours);

          const prevHours = unlocked.length > 1 ? unlocked[unlocked.length - 2].requiredHours : 0;
          const targetHours = nextAchievement ? nextAchievement.requiredHours : currentBadge.requiredHours;
          const currentStepHours = Math.max(0, totalHours - prevHours);
          const totalStepHours = targetHours - prevHours;
          const progressPct = nextAchievement && totalStepHours > 0 
            ? Math.min(100, Math.max(0, (currentStepHours / totalStepHours) * 100))
            : 100;

          return (
            <div className="mt-3 flex flex-col items-center gap-1.5 relative group">
              <button
                type="button"
                onClick={() => setIsJourneyMapOpen(true)}
                className={`relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-[#1c1c21]/80 border ${getAccentBorderClass(accent)} rounded-full shadow-xs backdrop-blur-xs cursor-pointer hover:scale-105 transition-all text-left`}
                title="Натисніть, щоб відкрити карту мандрівки"
              >
                {/* Background progress fill */}
                <div
                  className={`absolute inset-0 ${getAccentBgClass(accent)} opacity-60 transition-all duration-500 pointer-events-none`}
                  style={{ width: `${progressPct}%` }}
                />

                <span className="text-base relative z-10">{currentBadge.icon}</span>
                <span className="text-xs font-black text-slate-800 dark:text-[#f4f4f5] relative z-10">
                  {currentBadge.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-[#8FAAA3] font-mono relative z-10">
                  ({currentBadge.description})
                </span>
                <span className={`text-[10px] font-bold ${getAccentTextClass(accent)} ml-1 relative z-10`}>
                  {Math.floor(progressPct)}%
                </span>
              </button>
            </div>
          );
        })()}

        {/* ПРИЧИНИ КИНУТИ ПАЛИТИ ПІД ТАЙМЕРОМ */}
        {reasons.length > 0 && (
          <div className="mt-4 w-full flex flex-col items-start gap-2">
            {/* Причина кинути (клікабельна для відкриття модалки або перемикання) */}
            <div className="w-full">
              {motivationStyle === 'quote' && (
                <div 
                  onClick={() => setIsMotivationsModalOpen(true)}
                  className="w-full text-center cursor-pointer group relative py-1.5 px-4 rounded-xl hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-all"
                  title="Натисніть для редагування фраз або зміни стилю"
                >
                  <p className={`text-xs font-medium text-slate-700 dark:text-[#f4f4f5] italic transition-colors group-hover:${getAccentTextClass(accent)} inline-flex items-center gap-1.5 justify-center`}>
                    <span>«{currentReason}»</span>
                    <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity flex-none" />
                  </p>
                  {reasons.length > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-80 transition-opacity">
                      {reasons.slice(0, 6).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentReasonIdx(idx);
                          }}
                          className={`h-1 rounded-full transition-all cursor-pointer ${
                            idx === currentReasonIdx % reasons.length
                              ? 'bg-emerald-500 w-3'
                              : 'bg-slate-300 dark:bg-slate-600 w-1 hover:bg-slate-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {motivationStyle === 'card' && (
                <div 
                  onClick={() => setIsMotivationsModalOpen(true)}
                  className={`w-full p-2.5 sm:p-3 rounded-2xl ${getAccentBgClass(accent)} border ${getAccentBorderClass(accent)} shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between gap-2.5`}
                  title="Натисніть для редагування мотивацій або зміни стилю"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Bookmark className={`w-4 h-4 ${getAccentTextClass(accent)} flex-none`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${getAccentTextClass(accent)}`}>
                          Моя мотивація
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          ({(currentReasonIdx % reasons.length) + 1}/{reasons.length})
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:underline">
                        {currentReason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-none" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setCurrentReasonIdx((prev) => (prev - 1 + reasons.length) % reasons.length)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                      title="Попередня"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentReasonIdx((prev) => (prev + 1) % reasons.length)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 cursor-pointer transition-colors"
                      title="Наступна"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {motivationStyle === 'neon' && (
                <div 
                  onClick={() => setIsMotivationsModalOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 text-left flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(16,185,129,0.12)] cursor-pointer group hover:border-emerald-400 transition-all"
                  title="Натисніть для редагування мотивацій або зміни стилю"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-none" />
                    <p className="text-xs font-mono font-bold text-emerald-300 truncate">
                      {currentReason}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-none" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[9px] font-mono text-emerald-400/90 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                      #{(currentReasonIdx % reasons.length) + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentReasonIdx((prev) => (prev + 1) % reasons.length)}
                      className="p-0.5 text-emerald-400/80 hover:text-emerald-200 cursor-pointer transition-colors"
                      title="Наступна фраза"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {motivationStyle === 'kraft' && (
                <div 
                  onClick={() => setIsMotivationsModalOpen(true)}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-dashed border-amber-500/40 flex items-center justify-between gap-2 cursor-pointer group hover:bg-amber-500/15 transition-all shadow-2xs"
                  title="Натисніть для редагування мотивацій або зміни стилю"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm flex-none">📌</span>
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 italic truncate">
                      {currentReason}
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex-none opacity-80 group-hover:opacity-100">
                    {(currentReasonIdx % reasons.length) + 1}/{reasons.length} ✏️
                  </span>
                </div>
              )}

              {motivationStyle === 'ticker' && (
                <div 
                  onClick={() => setIsMotivationsModalOpen(true)}
                  className="w-full py-2 px-3 rounded-2xl bg-white/80 dark:bg-[#1c1c21]/80 border border-slate-200 dark:border-[#2d2d35] shadow-2xs flex items-center justify-between gap-2 cursor-pointer group hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  title="Натисніть для редагування мотивацій або зміни стилю"
                >
                  <span className={`text-xs ${getAccentTextClass(accent)} font-bold flex-none`}>⚡</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex-1 text-center group-hover:underline">
                    {currentReason}
                  </p>
                  <div className="flex items-center gap-1 flex-none" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setCurrentReasonIdx((prev) => (prev - 1 + reasons.length) % reasons.length)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">
                      {(currentReasonIdx % reasons.length) + 1}/{reasons.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentReasonIdx((prev) => (prev + 1) % reasons.length)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <ChevronRightIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Індикатори (ліворуч) та Статус (праворуч) */}
            <div className="w-full flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {/* Гідратація */}
                {hydrationState.showIndicator && (
                  <button
                    type="button"
                    onClick={() => setIsHydrationOpen(true)}
                    className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:bg-opacity-80 active:scale-95 active:ring-2 active:ring-sky-500/50 ${
                      hydrationState.isLow
                        ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/40 text-rose-600 dark:text-rose-400'
                        : 'bg-sky-500/10 dark:bg-sky-950/30 border-sky-500/30 text-sky-600 dark:text-sky-400'
                    }`}
                    title={`Випито ${hydrationState.ml} з ${hydrationState.goal} мл (${hydrationState.pct}%). Натисніть для перегляду.`}
                  >
                    <span className="font-mono">💧 {hydrationState.pct}%</span>
                  </button>
                )}

                {/* Щоденні кроки */}
                {(() => {
                  const STEPS_STORAGE_KEY = 'quit-smoking:daily-micro-steps';
                  const HISTORY_STORAGE_KEY = 'quit-smoking:daily-steps-history';
                  const SHOW_INDICATOR_KEY = 'quit-smoking:daily-steps-show-indicator';
                  
                  let total = 0;
                  let done = 0;
                  let show = true;
                  let pct = 0;
                  
                  try {
                    const savedSteps = localStorage.getItem(STEPS_STORAGE_KEY);
                    const steps = savedSteps ? JSON.parse(savedSteps) : [];
                    total = steps.length;
                    
                    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
                    const history = savedHistory ? JSON.parse(savedHistory) : {};
                    const savedShow = localStorage.getItem(SHOW_INDICATOR_KEY);
                    show = savedShow !== null ? savedShow === 'true' : true;
                    
                    const d = new Date();
                    const todayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const todayDone = history[todayKey] || [];
                    done = steps.filter((s: any) => todayDone.includes(s.id)).length;
                    pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  } catch {}

                  if (total === 0 || !show) return null;

                  let indicatorClass = 'bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400';
                  if (pct >= 0 && pct <= 20) {
                    indicatorClass = 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400';
                  } else if (pct >= 50 && pct <= 80) {
                    indicatorClass = 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400';
                  } else if (pct > 80) {
                    indicatorClass = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
                  } else {
                    // 21-49%
                    indicatorClass = 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsStepsOpen(true)}
                      className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:bg-opacity-80 active:scale-95 ${indicatorClass}`}
                      title={`Виконано ${done} з ${total} щоденних справ (${pct}%). Натисніть для перегляду.`}
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span className="font-mono">{done}/{total}</span>
                    </button>
                  );
                })()}

                {/* Ментальне здоров'я */}
                {mentalHealthState.showIndicator && (() => {
                  const pct = mentalHealthState.pct;
                  let colorClass = 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/40 text-rose-600 dark:text-rose-400';
                  let iconColor = 'text-rose-500';
                  if (pct >= 20 && pct < 80) {
                    colorClass = 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 text-amber-600 dark:text-amber-400';
                    iconColor = 'text-amber-500';
                  } else if (pct >= 80) {
                    colorClass = 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
                    iconColor = 'text-emerald-500';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsMentalHealthOpen(true)}
                      className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:bg-opacity-80 active:scale-95 ${colorClass}`}
                      title={`Індекс ментального ресурсу: ${pct}%. Натисніть для відкриття щоденника та практик.`}
                    >
                      <Brain className={`w-3 h-3 ${iconColor}`} />
                      <span className="font-mono">{pct}%</span>
                    </button>
                  );
                })()}

                {/* Щоденник вдячності (з налаштуванням часу нагадування) */}
                {gratitudeState.showIndicator && (() => {
                  const count = gratitudeState.count;
                  const isDone = gratitudeState.isCompleted;
                  let colorClass = 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/40 text-amber-600 dark:text-amber-400';
                  if (isDone) {
                    colorClass = 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-600 dark:text-emerald-400';
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setIsGratitudeOpen(true)}
                      className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] font-semibold border transition-all cursor-pointer hover:bg-opacity-80 active:scale-95 ${colorClass}`}
                      title={`Щоденник вдячності: ${count}/3 заповнено. Натисніть для відкриття.`}
                    >
                      <BookOpen className="w-3 h-3 text-amber-500" />
                      <span className="font-mono">{count}/3</span>
                    </button>
                  );
                })()}
              </div>

              {/* Статус відновлення */}
            </div>
          </div>
        )}
      </div>

      {/* 1. ЄДИНИЙ ЛАКОНІЧНИЙ БЛОК: ЗБЕРЕЖЕНІ РЕСУРСИ (ГРОШІ, ЧАС, ТЮТЮН) */}
      <div className="mt-4 mb-4 p-3.5 bg-white/80 dark:bg-[#18181c]/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs backdrop-blur-xs">
        {/* 3 головні показники: Заощаджено, Вільного часу, Не викурено */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center">
          {/* 1. Заощаджено */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-amber-500/40 dark:hover:border-amber-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування вартості пачки та розрахунку заощаджень"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <Coins className="w-3 h-3 text-amber-500/80 dark:text-amber-400/80 flex-none" />
              <span className="break-words">Заощаджено</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {Math.floor(totalSaved).toLocaleString('uk-UA')}&nbsp;₴
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-500 dark:text-zinc-400 block truncate" title={`Прогноз економії за 1 рік: ~${Math.round(costPerYear).toLocaleString('uk-UA')} ₴`}>
                ~{Math.round(costPerYear).toLocaleString('uk-UA')}&nbsp;₴/рік
              </span>
            </div>
          </button>

          {/* 2. Вільного часу */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-sky-500/40 dark:hover:border-sky-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування часу на одну сигарету"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <Hourglass className="w-3 h-3 text-sky-500/80 dark:text-sky-400/80 flex-none" />
              <span className="break-words">Вільного часу</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {returnedTimeData.timeText}
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-500 dark:text-zinc-400 block truncate" title={`Час за 1 рік: ~${returnedTimeData.yearlyHoursText} (${returnedTimeData.booksText})`}>
                ~{returnedTimeData.yearlyHoursText}
              </span>
            </div>
          </button>

          {/* 3. Не викурено */}
          <button
            type="button"
            onClick={() => setIsSavedResourcesModalOpen(true)}
            className="flex flex-col justify-between items-center p-2.5 sm:p-3 bg-slate-50/70 dark:bg-[#141418]/70 hover:bg-white dark:hover:bg-[#1a1a20] border border-slate-200/70 dark:border-zinc-800/70 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group active:scale-[0.98] text-center"
            title="Натисніть для налаштування кількості сигарет на день та у пачці"
          >
            <div className="flex items-center justify-center gap-1 text-[9.5px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors mb-1 w-full text-center leading-tight">
              <ShieldCheck className="w-3 h-3 text-emerald-500/80 dark:text-emerald-400/80 flex-none" />
              <span className="break-words">Не викурено</span>
            </div>
            
            <div className="my-auto py-1 w-full flex items-center justify-center">
              <span className={`text-sm sm:text-base font-black font-mono tracking-tight ${getAccentTextClass(accent)} block truncate`}>
                {Math.floor(cigsAvoided).toLocaleString('uk-UA')}&nbsp;<span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">шт</span>
              </span>
            </div>
            
            <div className="mt-1 pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/60 w-full">
              <span className={`text-[9.5px] sm:text-[10px] font-medium ${getAccentTextClass(accent)} block truncate`} title={`Упаковок сигарет: ${packsAvoidedText}`}>
                ~{packsAvoidedText}
              </span>
            </div>
          </button>
        </div>

        {/* 2. БЛОК: ЦІЛЬ ТА ІНДИКАТОРИ */}
        {(() => {
          const activeGoals = goals?.queue || [];
          const netSaved = Math.max(0, totalSaved - (goals?.base || 0));

          if (isCompactGoals) {
            if (activeGoals.length === 0) {
              return (
                <div className="mt-3">
                  <div
                    onClick={() => setIsGoalModalOpen(true)}
                    className="w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-amber-950/30 border border-amber-400/30 dark:border-amber-500/20 rounded-xl hover:border-amber-500/50 transition-all text-left relative overflow-hidden cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1.5 relative z-10 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Натисніть, щоб додати ціль ✨</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompactGoals();
                      }}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors"
                      title="Розгорнути ціль"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            const primaryGoal = activeGoals[0];
            const amount = primaryGoal?.amount || 0;
            const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
            const isGoalReached = pct >= 100;

            return (
              <div className="mt-3">
                <div
                  className={`w-full py-1.5 px-2.5 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-amber-500/10 dark:from-amber-950/30 dark:via-rose-950/20 dark:to-amber-950/30 border ${
                    isGoalReached
                      ? 'border-emerald-500/60 shadow-xs animate-pulse'
                      : 'border-amber-400/30 dark:border-amber-500/20'
                  } rounded-xl transition-all hover:border-amber-500/50 text-left relative overflow-hidden flex items-center justify-between gap-2`}
                >
                  <div
                    onClick={() => setIsGoalModalOpen(true)}
                    className="flex items-center gap-1.5 min-w-0 flex-1 relative z-10 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-[#f4f4f5] truncate">
                      {primaryGoal.name}
                    </span>
                    {amount > 0 && (
                      <div className="w-12 h-1 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isGoalReached
                              ? 'bg-emerald-400 animate-pulse'
                              : 'bg-gradient-to-r from-amber-500 to-rose-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 relative z-10">
                    {amount > 0 && (
                      <div className="font-mono text-[10px] font-bold flex items-center gap-1">
                        <span className="text-amber-600 dark:text-amber-400">{pct}%</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {netSaved.toLocaleString('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / {amount.toLocaleString('uk-UA')} ₴
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompactGoals();
                      }}
                      className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors ml-0.5"
                      title="Розгорнути ціль"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          const activeGoal = activeGoals.length > 0 ? activeGoals[0] : null;
          const amount = activeGoal?.amount || 0;
          const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
          const isGoalReached = pct >= 100;

          // Estimate target accumulation date
          const dailyRate = money ? (money.perDay / (money.packSize || 20)) * money.packPrice : 0;
          const remainingAmount = Math.max(0, amount - netSaved);
          
          let estDateText = '';
          if (isGoalReached) {
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

            estDateText = `Очікувана дата: ~${formattedTargetDate} (ще ~${daysLeft} ${daysWord(daysLeft)})`;
          }

          return (
            <div
              onClick={() => setIsGoalModalOpen(true)}
              className={`w-full mt-3 p-3.5 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-rose-950/30 dark:to-amber-950/40 border ${
                isGoalReached
                  ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10 animate-pulse'
                  : 'border-amber-400/40 dark:border-amber-500/30 shadow-xs'
              } rounded-2xl transition-all hover:scale-[1.01] hover:shadow-md active:scale-[0.98] text-left relative overflow-hidden group cursor-pointer`}
            >
              {/* Festive background glowing gradient accent */}
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-[#f4f4f5]">
                    Ціль
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompactGoals();
                  }}
                  className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-lg hover:bg-amber-500/10 transition-colors"
                  title="Мінімізувати ціль"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeGoal ? (
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#f4f4f5] truncate">
                      {activeGoal.name}
                    </span>
                    {amount > 0 && (
                      <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
                        {amount.toLocaleString('uk-UA')} ₴
                      </span>
                    )}
                  </div>

                  {amount > 0 && (
                    <div>
                      <div className="w-full h-2 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isGoalReached
                              ? 'bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 animate-pulse'
                              : 'bg-gradient-to-r from-amber-500 via-rose-400 to-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1 text-[10px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {netSaved.toLocaleString('uk-UA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ₴ з {amount.toLocaleString('uk-UA')} ₴
                        </span>
                        <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                          {pct}%
                        </span>
                      </div>

                      {estDateText && (
                        <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500 flex-none" />
                          <span>{estDateText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-amber-700 dark:text-amber-300/80 italic flex items-center gap-1 relative z-10">
                  <span>✨ Натисніть, щоб обрати бажану ціль або подарунок</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* ШВИДКА ЦІЛЬ (ДО 24 ГОДИН) */}
        <QuickGoalCard accent={accent} startDate={startDate} />

        {/* ЄДИНИЙ ЗАГАЛЬНИЙ ВІДЖЕТ ВІДНОВЛЕННЯ ЗДОРОВ'Я ТА МЕДИЧНИХ ЕТАПІВ */}
        <HealthRecoveryWidget
          diffMs={diffMs}
          startDate={startDate}
          accent={accent}
          onOpenFullHealth={handleHealthClick}
        />
      </div>



      {/* ПІЩИНКИ ЧАСУ (У СТИЛІСТИЦІ КАРТКИ ДЕРЕВА) */}
      <button
        type="button"
        onClick={() => onSwitchTab('sand')}
        className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#112723] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                Піщинки часу
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#D97706] dark:text-[#FBBF24] font-bold">
                {daysCount} {daysCount === 1 ? 'піщинка' : daysCount >= 2 && daysCount <= 4 ? 'піщинки' : 'піщинок'}
              </span>
            </div>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-1">
              Левітують по центру та реагують на дотики • Кристали чистоти
            </p>
            <span className="text-[11px] text-[#1E8A69] dark:text-[#4CC9A0] font-medium flex items-center gap-1">
              <span>✨ Відкрити сад піщинок</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Animated Zen Sand Garden & Balancing Crystals/Dunes Illustration in Tree style */}
          <div className="relative w-24 h-24 flex-none flex items-center justify-center">
            {/* Gentle sand breeze lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <path
                d="M8,26 Q32,18 62,24 T96,20"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-breeze opacity-50"
              />
              <path
                d="M6,66 Q35,58 65,64 T94,60"
                fill="none"
                stroke="#1E8A69"
                strokeWidth="1"
                strokeDasharray="3 5"
                className="animate-breeze opacity-40"
                style={{ animationDelay: '1.2s' }}
              />
            </svg>

            {/* Zen Sand Garden with Dune layers, stacked meditation stones & glowing crystal */}
            <svg
              viewBox="0 0 120 140"
              className="w-full h-full drop-shadow-sm select-none"
              style={{ overflow: 'visible' }}
            >
              {/* Dune & wooden garden tray base */}
              <ellipse cx="60" cy="132" rx="44" ry="7" fill="#85532F" opacity="0.25" />
              <ellipse cx="60" cy="130" rx="38" ry="5.5" fill="#D97706" opacity="0.2" />

              {/* Concentric Zen rake sand ripple rings */}
              <ellipse cx="60" cy="126" rx="34" ry="4.5" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.4" strokeDasharray="3 3" />
              <ellipse cx="60" cy="123" rx="26" ry="3.5" fill="none" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />

              {/* Gentle layered sand dunes in background */}
              <path d="M22,126 Q45,108 75,126 Z" fill="#F59E0B" opacity="0.3" />
              <path d="M50,126 Q80,110 102,126 Z" fill="#D97706" opacity="0.25" />

              {/* Tier 1: Base Zen Balance Stone (smooth deep forest slate) */}
              <g>
                <ellipse cx="60" cy="118" rx="26" ry="8.5" fill="#1C3831" />
                <ellipse cx="60" cy="117" rx="24" ry="7.5" fill="#244E44" />
                <ellipse cx="58" cy="115" rx="16" ry="3.5" fill="#3D7266" opacity="0.6" />
              </g>

              {/* Tier 2: Mid Zen Balance Stone (smooth jade stone swaying gently) */}
              <g className="animate-pine-mid">
                <ellipse cx="60" cy="103" rx="19" ry="6.5" fill="#145A32" />
                <ellipse cx="60" cy="102" rx="17" ry="5.5" fill="#1E8A69" />
                <ellipse cx="58" cy="100.5" rx="11" ry="2.5" fill="#4CC9A0" opacity="0.7" />
              </g>

              {/* Tier 3: Floating / resting multi-faceted glowing crystal apex */}
              <g className="animate-breathing" style={{ transformOrigin: '60px 75px' }}>
                {/* Gentle aura glow */}
                <circle cx="60" cy="74" r="18" fill="#FDE68A" opacity="0.25" />
                <circle cx="60" cy="74" r="10" fill="#67E8F9" opacity="0.2" />

                {/* Faceted Crystal Pyramid / Gem (matching sand crystal styles) */}
                {/* Left facet */}
                <polygon points="60,54 44,76 60,90" fill="#06B6D4" opacity="0.85" />
                {/* Right facet */}
                <polygon points="60,54 76,76 60,90" fill="#0891B2" opacity="0.95" />
                {/* Center highlight facet */}
                <polygon points="60,54 52,76 60,90" fill="#67E8F9" opacity="0.9" />
                {/* Upper apex light facet */}
                <polygon points="60,48 44,76 60,54" fill="#A5F3FC" opacity="0.8" />
                <polygon points="60,48 76,76 60,54" fill="#38BDF8" opacity="0.85" />

                {/* Crystal Sparkle Highlight */}
                <circle cx="60" cy="48" r="2.5" fill="#FFFFFF" opacity="0.95" />
              </g>

              {/* Floating Golden & Emerald Sand Grains around the stones */}
              <g transform="translate(32, 48) scale(0.85)" className="animate-pine-mid">
                <polygon points="10,2 12,8 18,10 12,12 10,18 8,12 2,10 8,8" fill="#F59E0B" />
                <circle cx="10" cy="10" r="1.5" fill="#FEF3C7" />
              </g>
              <g transform="translate(82, 40) scale(0.95)" className="animate-pine-crown">
                <polygon points="10,2 12,8 18,10 12,12 10,18 8,12 2,10 8,8" fill="#4CC9A0" />
                <circle cx="10" cy="10" r="1.5" fill="#D1FAE5" />
              </g>
              <g transform="translate(24, 82) scale(0.7)" className="animate-pine-crown" style={{ animationDelay: '0.8s' }}>
                <polygon points="8,0 16,8 8,16 0,8" fill="#A855F7" />
                <circle cx="8" cy="8" r="1.5" fill="#F3E8FF" />
              </g>
              <g transform="translate(94, 88) scale(0.75)" className="animate-pine-mid" style={{ animationDelay: '1.4s' }}>
                <polygon points="8,2 10,6 14,8 10,10 8,14 6,10 2,8 6,6" fill="#FBBF24" />
              </g>
            </svg>
          </div>
        </div>
      </button>

      {/* 5. КАРПАТСЬКА СОСНА (З АНІМАЦІЄЮ ХИТАННЯ ВЕРХІВОК ДЕРЕВ) */}
      <button
        type="button"
        onClick={() => onSwitchTab('tree')}
        className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#112723] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden mb-4"
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

      {/* 6. КОСМІЧНИЙ ДРАКОН (ВІДКРИВАЄТЬСЯ НА 500 НЕВИКУРЕНИХ СИГАРЕТАХ) */}
      {dragonToast && (
        <div className="mb-2 p-2.5 bg-[#A855F7]/15 border border-[#A855F7]/30 rounded-xl text-xs font-semibold text-center text-[#A855F7] dark:text-[#C084FC] animate-fadeIn">
          {dragonToast}
        </div>
      )}

      <button
        type="button"
        onClick={handleDragonClick}
        className={`w-full p-4 border rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden mb-4 ${
          isDragonUnlocked
            ? 'bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#122228] border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#06B6D4]'
            : 'bg-white/60 dark:bg-[#151518]/60 hover:bg-white/80 dark:hover:bg-[#1a1a1f] border-[#B7CDC6]/60 dark:border-[#2d2d35] hover:border-[#A855F7]/50'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate flex items-center gap-1.5">
                <span>{isDragonUnlocked ? (dragonState?.name || 'Космічний дракон') : 'Космічний дракон'}</span>
                <span className="text-xs">🐉</span>
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isDragonUnlocked
                  ? 'bg-[#06B6D4]/15 text-[#0891B2] dark:text-[#22D3EE]'
                  : 'bg-[#A855F7]/15 text-[#A855F7] dark:text-[#C084FC]'
              }`}>
                {isDragonUnlocked ? (
                  <>
                    <span>⭐</span>
                    <span>Рівень {dragonState?.level || 1} • {getDragonLevelTitle(dragonState?.level || 1).title}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5" />
                    <span>500 сиг.</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-1.5 leading-relaxed">
              {isDragonUnlocked
                ? `⚔️ Бойова сила: ${calculateCombatPower(dragonState?.stardust || 0, dragonState?.level || 1, dragonState?.relics?.length || 0)} • Данж: ${dragonState?.dungeonFloor || 1} поверх • Енергія: ${Math.round(dragonState?.energy || 85)}%`
                : `Астральний супутник чистого дихання • ${Math.floor(cigsAvoided)} / 500 сиг.`}
            </p>

            {/* Progress bar if locked */}
            {!isDragonUnlocked ? (
              <div className="mb-1.5">
                <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1E8A69] via-[#06B6D4] to-[#A855F7] rounded-full transition-all duration-500"
                    style={{ width: `${dragonProgressPct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#A855F7] dark:text-[#C084FC] font-semibold mt-1 block">
                  Залишилося ще {dragonLeft} сиг. для пробудження
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-[#0891B2] dark:text-[#22D3EE] font-medium flex items-center gap-1">
                <span>🌌 Увійти в космос</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </div>

          {/* Animated Cosmic Dragon Illustration */}
          <div className="relative w-24 h-24 flex-none flex items-center justify-center">
            {/* Drifting Nebula Breeze */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
              <path
                d="M10,25 Q35,18 60,24 T95,22"
                fill="none"
                stroke={isDragonUnlocked ? '#22D3EE' : '#A855F7'}
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-breeze opacity-60"
              />
              <path
                d="M5,65 Q30,55 60,60 T92,55"
                fill="none"
                stroke={isDragonUnlocked ? '#F59E0B' : '#1E8A69'}
                strokeWidth="1"
                strokeDasharray="3 5"
                className="animate-breeze opacity-40"
                style={{ animationDelay: '1.4s' }}
              />
            </svg>

            {isDragonUnlocked ? (
              /* Unlocked Awakened Cosmic Dragon Art */
              <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-xs select-none" style={{ overflow: 'visible' }}>
                {/* Celestial Nebula Base */}
                <ellipse cx="60" cy="132" rx="42" ry="6" fill="#1C3831" opacity="0.3" />
                <ellipse cx="60" cy="130" rx="34" ry="4.5" fill="#0D9488" opacity="0.35" />

                {/* Orbiting Stardust Sparkles */}
                <circle cx="25" cy="40" r="1.5" fill="#FDE68A" className="animate-star-twinkle" />
                <circle cx="95" cy="35" r="2" fill="#67E8F9" className="animate-star-twinkle" style={{ animationDelay: '1s' }} />
                <circle cx="18" cy="95" r="1.2" fill="#A7F3D0" className="animate-star-twinkle" style={{ animationDelay: '0.5s' }} />
                <circle cx="102" cy="100" r="1.8" fill="#F59E0B" className="animate-star-twinkle" style={{ animationDelay: '1.5s' }} />

                {/* Left Wing (gentle flapping) */}
                <g className="animate-wing-left">
                  <polygon points="55,75 15,48 24,78 40,88" fill="#0D9488" />
                  <polygon points="55,75 22,58 30,82 46,88" fill="#14B8A6" />
                  <polygon points="55,75 28,68 36,86 48,90" fill="#2DD4BF" opacity="0.9" />
                </g>

                {/* Right Wing (gentle flapping) */}
                <g className="animate-wing-right">
                  <polygon points="65,75 105,48 96,78 80,88" fill="#0D9488" />
                  <polygon points="65,75 98,58 90,82 74,88" fill="#14B8A6" />
                  <polygon points="65,75 92,68 84,86 72,90" fill="#2DD4BF" opacity="0.9" />
                </g>

                {/* Dragon Body & Tail */}
                <path d="M60,95 C60,118 75,124 72,134 C70,138 65,138 62,134" fill="none" stroke="#0F766E" strokeWidth="5" strokeLinecap="round" />
                <polygon points="73,135 77,130 72,131 69,129 70,134" fill="#F59E0B" />

                {/* Torso */}
                <ellipse cx="60" cy="85" rx="14" ry="20" fill="#0F766E" />
                <ellipse cx="60" cy="85" rx="11" ry="16" fill="#14B8A6" />

                {/* Glowing Star Gem Heart (pulsing) */}
                <g className="animate-breathing" style={{ transformOrigin: '60px 83px' }}>
                  <polygon points="60,76 65,83 60,90 55,83" fill="#67E8F9" />
                  <circle cx="60" cy="83" r="1.5" fill="#FFFFFF" />
                  <circle cx="60" cy="83" r="7" fill="#67E8F9" opacity="0.3" />
                </g>

                {/* Head */}
                <ellipse cx="60" cy="56" rx="9" ry="11" fill="#14B8A6" />
                {/* Horns */}
                <path d="M57,50 C52,40 44,35 40,34 C44,38 50,45 55,50 Z" fill="#F59E0B" />
                <path d="M63,50 C68,40 76,35 80,34 C76,38 70,45 65,50 Z" fill="#F59E0B" />
                {/* Eyes */}
                <circle cx="56" cy="55" r="2" fill="#FDE68A" />
                <circle cx="64" cy="55" r="2" fill="#FDE68A" />
                <circle cx="56" cy="55" r="1" fill="#042F2E" />
                <circle cx="64" cy="55" r="1" fill="#042F2E" />
              </svg>
            ) : (
              /* Locked Sleeping Dragon Nebula Cocoon */
              <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-xs select-none" style={{ overflow: 'visible' }}>
                <ellipse cx="60" cy="130" rx="42" ry="7" fill="#1C3831" opacity="0.3" />
                <ellipse cx="60" cy="128" rx="36" ry="5.5" fill="#3B1C54" opacity="0.4" />

                {/* Sleeping Egg Silhouette with glowing cracks */}
                <circle cx="60" cy="80" r="32" fill="#581C87" opacity="0.2" className="animate-breathing" />
                <path d="M60,45 C78,45 92,72 92,98 C92,118 78,126 60,126 C42,126 28,118 28,98 C28,72 42,45 60,45 Z" fill="#1E1B4B" opacity="0.9" />
                <path d="M56,65 L62,78 L54,90 L66,105" fill="none" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />

                {/* Lock Badge in Center */}
                <circle cx="60" cy="85" r="14" fill="#0D1E1B" stroke="#A855F7" strokeWidth="1.5" />
                <path d="M55,83 L55,79 C55,76 57,74 60,74 C63,74 65,76 65,79 L65,83" fill="none" stroke="#A855F7" strokeWidth="1.5" />
                <rect x="53" y="83" width="14" height="10" rx="2" fill="#7E22CE" />
                <circle cx="60" cy="88" r="1.5" fill="#FFFFFF" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* 7. КАМІНЬ СПОКОЮ (МЕДИТАТИВНЕ ТРЕНУВАННЯ УВАГИ ТА БУТИ В МОМЕНТІ) */}
      <button
        type="button"
        onClick={() => onSwitchTab('zen')}
        className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#112420] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate flex items-center gap-1.5">
                <span>Камінь Спокою: Практика Уважності</span>
                <span className="text-xs">🪨</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] font-bold flex items-center gap-1">
                <span>🎯</span>
                <span>
                  {zenState?.totalSounds
                    ? `${Math.round(((zenState.heardInTime || 0) / zenState.totalSounds) * 100)}% уважності`
                    : 'Медитація'}
                </span>
              </span>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-1.5 leading-relaxed">
              {zenState?.totalSounds
                ? `Вчасно почуто: ${zenState.heardInTime || 0} із ${zenState.totalSounds} звуків • Тренування присутності`
                : 'Почуйте м’який резонанс та торкніться каменя • Спокій і заземлення'}
            </p>

            <span className="text-[11px] text-[#1E8A69] dark:text-[#34D399] font-medium flex items-center gap-1">
              <span>🪨 Практикувати присутність</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Minimalist Zen Stone in Still Water Preview SVG */}
          <div className="relative w-24 h-24 flex-none flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full select-none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="previewStoneGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="60%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
              </defs>

              {/* Water Rings */}
              <ellipse cx="50" cy="72" rx="42" ry="9" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.25" />
              <ellipse cx="50" cy="72" rx="28" ry="6" fill="none" stroke="#14B8A6" strokeWidth="1.2" opacity="0.4" />
              <ellipse cx="50" cy="72" rx="20" ry="4.5" fill="#0F172A" opacity="0.2" />

              {/* Central Minimalist River Stone */}
              <g transform="translate(50, 52)">
                <g className="animate-zen-stone">
                  <ellipse cx="0" cy="18" rx="19" ry="4" fill="#0F172A" opacity="0.3" />
                  <path
                    d="M-18,16 C-22,6 -18,-14 -7,-24 C-1,-30 7,-30 13,-24 C22,-12 24,5 20,16 C16,20 -14,20 -18,16 Z"
                    fill="url(#previewStoneGrad)"
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {/* Soft sheen */}
                  <path
                    d="M-8,-22 C-3,-26 3,-26 7,-22 C13,-12 15,2 12,14"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </button>

      {/* 8. ГРАВІТАЦІЙНІ ОРБІТИ (ФІЗИЧНИЙ СИМУЛЯТОР ОРБІТ ТА МУЗИКА СФЕР) */}
      <button
        type="button"
        onClick={() => onSwitchTab('orbit')}
        className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 hover:bg-white dark:hover:bg-[#0B1513] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#38BDF8] rounded-2xl transition-all cursor-pointer shadow-xs active:scale-[0.99] group text-left relative overflow-hidden mb-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate flex items-center gap-1.5">
                <span>Гравітаційні Орбіти</span>
                <span className="text-xs">🪐</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold">
                {orbitState?.stardustCollected ? `${orbitState.stardustCollected} пилу ✨` : 'Фізика орбіт 🪐'}
              </span>
            </div>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-1">
              {orbitState?.stardustCollected
                ? `Зоряний пил: ${orbitState.stardustCollected} ✨ • Можна передати у гру про Дракона`
                : 'Фізичний симулятор • Запускайте орбіти, творіть гармонію та пил'}
            </p>
            <span className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] font-medium flex items-center gap-1">
              <span>🪐 Творити орбіти</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          {/* Animated Gravity Well & Orbiting Resonant Bodies Illustration */}
          <div className="relative w-24 h-24 flex-none flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs select-none" style={{ overflow: 'visible' }}>
              <defs>
                <radialGradient id="sunCoreGrad" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="60%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#78350F" />
                </radialGradient>
              </defs>

              {/* Concentric Gravitational Waves */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#38BDF8" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="26" fill="none" stroke="#34D399" strokeWidth="1" opacity="0.35" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#FDE047" strokeWidth="0.8" opacity="0.4" />

              {/* Central Glowing Star / Gravity Well */}
              <circle cx="50" cy="50" r="18" fill="#F59E0B" opacity="0.15" className="animate-pulse" />
              <circle cx="50" cy="50" r="8" fill="url(#sunCoreGrad)" />

              {/* Orbiting Celestial Body 1 (Cyan with trail arc) */}
              <g className="animate-spin" style={{ transformOrigin: '50px 50px', animationDuration: '6s' }}>
                <path d="M 50,12 A 38 38 0 0 1 76.8,23" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
                <circle cx="76.8" cy="23" r="3.5" fill="#38BDF8" />
                <circle cx="76.8" cy="23" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Orbiting Celestial Body 2 (Emerald) */}
              <g className="animate-spin" style={{ transformOrigin: '50px 50px', animationDuration: '3.5s', animationDirection: 'reverse' }}>
                <path d="M 50,24 A 26 26 0 0 1 68,31" fill="none" stroke="#34D399" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
                <circle cx="68" cy="31" r="3" fill="#34D399" />
                <circle cx="68" cy="31" r="1" fill="#FFFFFF" />
              </g>

              {/* Craving Mote dissolving into Stardust */}
              <circle cx="32" cy="74" r="4" fill="#C084FC" opacity="0.7" />
              <circle cx="28" cy="70" r="1" fill="#FDE047" />
              <circle cx="36" cy="78" r="1" fill="#FDE047" />
            </svg>
          </div>
        </div>
      </button>





      <JourneyMapModal
        isOpen={isJourneyMapOpen}
        onClose={() => setIsJourneyMapOpen(false)}
        achievements={STAR_ACHIEVEMENTS}
        totalHours={diffMs / (3600 * 1000)}
      />

      {isHydrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative">
            <button
              onClick={() => setIsHydrationOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <HydrationCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {isStepsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative">
            <button
              onClick={() => setIsStepsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <DailyStepsSection isOpen={true} onToggle={() => {}} onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {isMentalHealthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsMentalHealthOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <MentalHealthCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {isGratitudeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-50 dark:bg-[#121212] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#2d2d35] p-5 shadow-2xl relative my-auto">
            <button
              onClick={() => setIsGratitudeOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c21] cursor-pointer transition-colors"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-2">
              <GratitudeJournalCard onUpdate={handleUpdate} />
            </div>
          </div>
        </div>
      )}

      {goals && (
        <GoalSettingsModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          goals={goals}
          totalSaved={totalSaved}
          money={money}
          onAddGoal={onAddGoal || (() => {})}
          onCompleteGoal={onCompleteGoal || (() => {})}
          onDeleteGoal={onDeleteGoal || (() => {})}
        />
      )}

      {/* Модальне вікно редагування мотиваційних фраз та стилів */}
      <MotivationalPhrasesModal
        isOpen={isMotivationsModalOpen}
        onClose={() => setIsMotivationsModalOpen(false)}
        reasons={reasons}
        onSaveReasons={(newReasons) => {
          onUpdateReasons?.(newReasons);
          try {
            localStorage.setItem('quit-smoking:reasons', JSON.stringify(newReasons));
            window.dispatchEvent(new Event('storage'));
          } catch {}
        }}
        currentStyle={motivationStyle}
        onStyleChange={handleStyleChange}
        autoRotate={autoRotateMotivations}
        onAutoRotateChange={handleAutoRotateChange}
        accent={accent}
      />

      {/* Модальне вікно параметрів розрахунку збережених ресурсів */}
      <SavedResourcesSettingsModal
        isOpen={isSavedResourcesModalOpen}
        onClose={() => setIsSavedResourcesModalOpen(false)}
        money={money}
        onSave={(newMoney) => {
          onUpdateMoney?.(newMoney);
        }}
        accent={accent}
        startDate={startDate}
      />
    </div>
  );
};
