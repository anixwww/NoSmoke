import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Heart, 
  Users, 
  Sun, 
  Music, 
  Zap, 
  Smile, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Info, 
  Flame,
  Award
} from 'lucide-react';

export interface DopamineHabit {
  id: string;
  title: string;
  category: 'social' | 'body' | 'mind' | 'sensory';
  icon: string;
  type: 'counter' | 'checkbox';
  targetCount?: number;
  currentCount?: number;
  completed?: boolean;
  description: string;
  isCustom?: boolean;
}

const DEFAULT_HABITS: DopamineHabit[] = [
  {
    id: 'hugs',
    title: 'Обійми або погладити тваринку',
    category: 'social',
    icon: '🤗',
    type: 'checkbox',
    completed: false,
    description: 'Вивільняє окситоцин та знижує рівень кортизолу (стресу), замінюючи нікотиновий спалах.'
  },
  {
    id: 'gratitude',
    title: 'Заповнити щоденник вдячності (у вкладці «Ще»)',
    category: 'mind',
    icon: '📝',
    type: 'checkbox',
    completed: false,
    description: 'Заповніть 3 приємні моменти у щоденнику (вкладка «Ще») для фокусу на ресурсах та дофамінового балансу.'
  },
  {
    id: 'chat',
    title: 'Душевна розмова з близькою людиною',
    category: 'social',
    icon: '💬',
    type: 'checkbox',
    completed: false,
    description: 'Соціальний контакт вивільняє серотонін і знімає психологічну самотність відмови.'
  },
  {
    id: 'cold_splash',
    title: 'Контрастний душ або холодна вода на обличчя',
    category: 'body',
    icon: '❄️',
    type: 'checkbox',
    completed: false,
    description: 'Стимуляція блукаючого нерва дає природний стрибок дофаміну до +250% без відкату.'
  },
  {
    id: 'sun_walk',
    title: '15-20 хвилин на сонячному світлі / прогулянка',
    category: 'body',
    icon: '☀️',
    type: 'checkbox',
    completed: false,
    description: 'Денне світло активує синтез серотоніну та нормалізує циркадні ритми після куріння.'
  },
  {
    id: 'music',
    title: 'Улюблена музика, яка викликає мурашки',
    category: 'sensory',
    icon: '🎧',
    type: 'checkbox',
    completed: false,
    description: 'Акустичне задоволення активує систему винагороди мозку (прилегле ядро).'
  },
  {
    id: 'dark_chocolate',
    title: 'Шматочок чорного шоколаду (>70%) чи горіхи',
    category: 'sensory',
    icon: '🍫',
    type: 'checkbox',
    completed: false,
    description: 'Фенілетиламін та магній сприяють м\'якому підйому настрою.'
  },
  {
    id: 'breathing',
    title: '2 хвилини глибокого дихання (видих довший за вдих)',
    category: 'mind',
    icon: '🫁',
    type: 'checkbox',
    completed: false,
    description: 'Вмикає парасимпатичну нервову систему і заспокоює нікотиновий імпульс.'
  },
  {
    id: 'micro_win',
    title: '1 мікро-перемога (застелити ліжко / прибрати стіл)',
    category: 'mind',
    icon: '✨',
    type: 'checkbox',
    completed: false,
    description: 'Завершення маленької справи дає мозку природний "дофаміновий бонус".'
  },
  {
    id: 'smile',
    title: 'Щира посмішка або перегляд кумедного відео',
    category: 'mind',
    icon: '😄',
    type: 'checkbox',
    completed: false,
    description: 'Ендорфіновий сплеск розслабляє мімічні м\'язи та знижує напругу.'
  }
];

const getTodayKey = () => {
  const d = new Date();
  return `quit-smoking:mental-health-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const HABITS_STORAGE_KEY = 'quit-smoking:mental-health-habits-config';
const SHOW_INDICATOR_KEY = 'quit-smoking:mental-health-show-indicator';

interface MentalHealthCardProps {
  onUpdate?: () => void;
}

export const MentalHealthCard: React.FC<MentalHealthCardProps> = ({ onUpdate }) => {
  const todayKey = getTodayKey();

  // Habit definitions (defaults + custom)
  const [habitConfigs, setHabitConfigs] = useState<DopamineHabit[]>(() => {
    try {
      const saved = localStorage.getItem(HABITS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list: DopamineHabit[] = parsed.map((h: DopamineHabit): DopamineHabit => {
            if (h.id === 'hugs') {
              return {
                ...h,
                title: 'Обійми або погладити тваринку',
                type: 'checkbox' as const
              };
            }
            if (h.id === 'gratitude') {
              return {
                ...h,
                title: 'Заповнити щоденник вдячності (у вкладці «Ще»)',
                description: 'Заповніть 3 приємні моменти у щоденнику (вкладка «Ще») для фокусу на ресурсах та дофамінового балансу.',
                type: 'checkbox' as const
              };
            }
            return h;
          });

          // If gratitude habit is missing, add it to list
          if (!list.some((h: DopamineHabit) => h.id === 'gratitude')) {
            const defaultGratitude = DEFAULT_HABITS.find((h) => h.id === 'gratitude');
            if (defaultGratitude) list.splice(1, 0, defaultGratitude);
          }

          return list;
        }
      }
    } catch {}
    return DEFAULT_HABITS;
  });

  // Today's log: { [habitId]: number | boolean }
  const [todayLog, setTodayLog] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(todayKey);
      const log = saved ? JSON.parse(saved) : {};

      // Check if gratitude journal already has entries today
      const d = new Date();
      const todayDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const savedEntries = localStorage.getItem('quit-smoking:gratitude-journal-entries');
      if (savedEntries) {
        const list = JSON.parse(savedEntries);
        const todayEntry = Array.isArray(list) ? list.find((e: any) => e.date === todayDateStr) : null;
        if (todayEntry && (todayEntry.g1?.trim() || todayEntry.g2?.trim() || todayEntry.g3?.trim())) {
          log.gratitude = true;
        }
      }

      return log;
    } catch {}
    return {};
  });

  // Listen for gratitude journal updates from "Ще" tab
  useEffect(() => {
    const handleGratitudeSync = () => {
      try {
        const saved = localStorage.getItem(todayKey);
        if (saved) {
          setTodayLog(JSON.parse(saved));
        }
      } catch {}
    };

    window.addEventListener('gratitude-updated', handleGratitudeSync);
    window.addEventListener('storage', handleGratitudeSync);

    return () => {
      window.removeEventListener('gratitude-updated', handleGratitudeSync);
      window.removeEventListener('storage', handleGratitudeSync);
    };
  }, [todayKey]);

  const [showIndicator, setShowIndicator] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SHOW_INDICATOR_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // default enabled
  });

  const [showTip, setShowTip] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'social' | 'body' | 'mind' | 'sensory'>('all');

  // Persist configurations
  useEffect(() => {
    try {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitConfigs));
    } catch {}
    onUpdate?.();
  }, [habitConfigs, onUpdate]);

  // Persist today's log
  useEffect(() => {
    try {
      localStorage.setItem(todayKey, JSON.stringify(todayLog));
    } catch {}
    onUpdate?.();
  }, [todayLog, todayKey, onUpdate]);

  // Persist showIndicator
  useEffect(() => {
    try {
      localStorage.setItem(SHOW_INDICATOR_KEY, showIndicator.toString());
    } catch {}
    onUpdate?.();
  }, [showIndicator, onUpdate]);

  // Calculate score
  const totalWeight = habitConfigs.length;
  let totalScore = 0;

  habitConfigs.forEach((h) => {
    const val = todayLog[h.id];
    if (h.type === 'counter') {
      const target = h.targetCount || 10;
      const count = typeof val === 'number' ? val : 0;
      totalScore += Math.min(1, count / target);
    } else {
      if (val === true) {
        totalScore += 1;
      }
    }
  });

  const mentalHealthPct = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;

  const handleToggleCheckbox = (id: string) => {
    setTodayLog((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpdateCounter = (id: string, delta: number, max: number) => {
    setTodayLog((prev) => {
      const current = typeof prev[id] === 'number' ? prev[id] : 0;
      const updated = Math.max(0, Math.min(max, current + delta));
      return {
        ...prev,
        [id]: updated
      };
    });
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHabit: DopamineHabit = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      category: 'mind',
      icon: '🌱',
      type: 'checkbox',
      completed: false,
      description: 'Ваш власний корисний ритуал для підтримки душевного стану.',
      isCustom: true
    };

    setHabitConfigs((prev) => [...prev, newHabit]);
    setNewTitle('');
  };

  const handleDeleteCustomHabit = (id: string) => {
    setHabitConfigs((prev) => prev.filter((h) => h.id !== id));
    setTodayLog((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const filteredHabits = habitConfigs.filter(
    (h) => selectedCategory === 'all' || h.category === selectedCategory
  );

  return (
    <div className="w-full bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-1.5">
              <span>Ментальне здоров'я</span>
              <span className="text-xs">🧠</span>
            </h2>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
              Природні дофамінові замінники та щоденник вдячності
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTip(!showTip)}
          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          title="Як це працює?"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Science Info Tip */}
      {showTip && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
            <Sparkles className="w-4 h-4 flex-none" />
            <span>Чому мозок вимагає дофаміну при відмові від куріння?</span>
          </div>
          <p>
            Нікотин насильницьки вивільняв штучний дофамін у мозку. Після відмови дофамінові рецептори потребують 2-3 тижні на відновлення чутливості.
          </p>
          <p>
            <strong>Природні замінники</strong> (обійми, холодна вода, сонце, щоденник вдячності, музика) допомагають мозку м'яко синтезувати дофамін, серотонін та окситоцин без "відкату" та хімічної залежності.
          </p>
        </div>
      )}

      {/* Progress Bar & Status */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 dark:from-rose-950/30 dark:via-amber-950/30 dark:to-emerald-950/30 border border-rose-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            Індекс ментального ресурсу:
          </span>
          <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
            {mentalHealthPct}%
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              mentalHealthPct >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : mentalHealthPct >= 20
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
            style={{ width: `${mentalHealthPct}%` }}
          />
        </div>

        <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 italic">
          {mentalHealthPct >= 80
            ? '🌟 Чудово! Ваш мозок наповнений природними гормонами щастя (80%+)'
            : mentalHealthPct >= 20
            ? '💪 Гарний рівень (20-80%). Використовуйте дофамінові практики нижче.'
            : '🌱 Менше 20%. Спробуйте виконати кілька простих практик для відновлення ресурсу.'}
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Усі практики
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('social')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'social'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🤗 Соціальні
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('body')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'body'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          ⚡ Тілесні
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('mind')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'mind'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🧘 Ментальні
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('sensory')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'sensory'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🎧 Сенсорні
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredHabits.map((habit) => {
          const val = todayLog[habit.id];

          if (habit.type === 'counter') {
            const count = typeof val === 'number' ? val : 0;
            const target = habit.targetCount || 10;
            const isDone = count >= target;

            return (
              <div
                key={habit.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-xl flex-none select-none">{habit.icon}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {habit.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {habit.description}
                      </p>
                    </div>
                  </div>

                  {/* Counter Control */}
                  <div className="flex items-center gap-1.5 flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateCounter(habit.id, -1, target)}
                      className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs cursor-pointer active:scale-90 transition-transform"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold w-9 text-center text-slate-800 dark:text-slate-200">
                      {count}/{target}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateCounter(habit.id, 1, target)}
                      className="w-6 h-6 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center justify-center text-xs cursor-pointer active:scale-90 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Checkbox type
          const isCompleted = val === true;

          return (
            <div
              key={habit.id}
              onClick={() => handleToggleCheckbox(habit.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer select-none group ${
                isCompleted
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="text-xl flex-none">{habit.icon}</span>
                  <div className="min-w-0">
                    <h4
                      className={`text-xs font-bold leading-snug transition-colors ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                      }`}
                    >
                      {habit.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {habit.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-none">
                  {habit.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomHabit(habit.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Видалити власний ритуал"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-rose-500 border-rose-500 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Habit Form */}
      <form onSubmit={handleAddCustomHabit} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="+ Додати власний дофамінові ритуал..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="px-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Додати</span>
        </button>
      </form>

      {/* Show on main tab toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
          <span>🧠 Показувати індикатор на головному екрані</span>
        </span>
        <button
          type="button"
          onClick={() => setShowIndicator(!showIndicator)}
          className={`relative inline-flex h-5 w-9 flex-none cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            showIndicator ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              showIndicator ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
