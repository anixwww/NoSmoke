import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Save, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Heart, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  Bell
} from 'lucide-react';

export interface GratitudeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string;
  g1: string;
  g2: string;
  g3: string;
  updatedAt: number;
}

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getTodayFormattedDate = () => {
  const d = new Date();
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
};

const GRATITUDE_JOURNAL_STORAGE_KEY = 'quit-smoking:gratitude-journal-entries';
const GRATITUDE_SHOW_INDICATOR_KEY = 'quit-smoking:gratitude-show-indicator';
const GRATITUDE_INDICATOR_TIME_KEY = 'quit-smoking:gratitude-indicator-time';

interface GratitudeJournalCardProps {
  onUpdate?: () => void;
}

export const GratitudeJournalCard: React.FC<GratitudeJournalCardProps> = ({ onUpdate }) => {
  const todayDateStr = getTodayDateStr();

  const [g1, setG1] = useState('');
  const [g2, setG2] = useState('');
  const [g3, setG3] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  
  const [journalHistory, setJournalHistory] = useState<GratitudeEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<GratitudeEntry | null>(null);

  // Settings
  const [showIndicator, setShowIndicator] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(GRATITUDE_SHOW_INDICATOR_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const [indicatorTime, setIndicatorTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(GRATITUDE_INDICATOR_TIME_KEY);
      if (saved) return saved;
    } catch {}
    return 'always'; // 'always', '18:00', '20:00', '21:00'
  });

  // Load entries
  useEffect(() => {
    try {
      const saved = localStorage.getItem(GRATITUDE_JOURNAL_STORAGE_KEY);
      if (saved) {
        const list: GratitudeEntry[] = JSON.parse(saved);
        setJournalHistory(list);

        const todayEntry = list.find((e) => e.date === todayDateStr);
        if (todayEntry) {
          setG1(todayEntry.g1 || '');
          setG2(todayEntry.g2 || '');
          setG3(todayEntry.g3 || '');
        }
      }
    } catch {}
  }, [todayDateStr]);

  // Persist showIndicator
  useEffect(() => {
    try {
      localStorage.setItem(GRATITUDE_SHOW_INDICATOR_KEY, showIndicator.toString());
      window.dispatchEvent(new Event('gratitude-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    onUpdate?.();
  }, [showIndicator, onUpdate]);

  // Persist indicatorTime
  useEffect(() => {
    try {
      localStorage.setItem(GRATITUDE_INDICATOR_TIME_KEY, indicatorTime);
      window.dispatchEvent(new Event('gratitude-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    onUpdate?.();
  }, [indicatorTime, onUpdate]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const formatted = getTodayFormattedDate();
    const entry: GratitudeEntry = {
      id: todayDateStr,
      date: todayDateStr,
      formattedDate: formatted,
      g1: g1.trim(),
      g2: g2.trim(),
      g3: g3.trim(),
      updatedAt: Date.now()
    };

    try {
      const existing = journalHistory.filter((item) => item.date !== todayDateStr);
      const updatedList = [entry, ...existing];
      setJournalHistory(updatedList);
      localStorage.setItem(GRATITUDE_JOURNAL_STORAGE_KEY, JSON.stringify(updatedList));

      // Mark gratitude habit as completed in Mental Health
      const d = new Date();
      const todayKey = `quit-smoking:mental-health-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const savedLogStr = localStorage.getItem(todayKey);
      const log = savedLogStr ? JSON.parse(savedLogStr) : {};

      const hasContent = g1.trim().length > 0 || g2.trim().length > 0 || g3.trim().length > 0;
      log.gratitude = hasContent;

      localStorage.setItem(todayKey, JSON.stringify(log));

      // Notify other components (like MentalHealthCard and CounterTab)
      window.dispatchEvent(new Event('gratitude-updated'));
      window.dispatchEvent(new Event('storage'));

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
      onUpdate?.();
    } catch {}
  };

  const handleDeleteEntry = (dateToDelete: string) => {
    try {
      const updatedList = journalHistory.filter((item) => item.date !== dateToDelete);
      setJournalHistory(updatedList);
      localStorage.setItem(GRATITUDE_JOURNAL_STORAGE_KEY, JSON.stringify(updatedList));

      if (dateToDelete === todayDateStr) {
        setG1('');
        setG2('');
        setG3('');

        const d = new Date();
        const todayKey = `quit-smoking:mental-health-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const savedLogStr = localStorage.getItem(todayKey);
        const log = savedLogStr ? JSON.parse(savedLogStr) : {};
        log.gratitude = false;
        localStorage.setItem(todayKey, JSON.stringify(log));

        window.dispatchEvent(new Event('gratitude-updated'));
        window.dispatchEvent(new Event('storage'));
      }

      if (selectedEntry?.date === dateToDelete) {
        setSelectedEntry(null);
      }

      onUpdate?.();
    } catch {}
  };

  const todayCount = (g1.trim() ? 1 : 0) + (g2.trim() ? 1 : 0) + (g3.trim() ? 1 : 0);

  return (
    <div className="w-full bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-1.5">
              <span>Щоденник вдячності</span>
              <span className="text-xs">📖</span>
            </h2>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
              3 слова вдячності щодня для переналаштування мозку
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">{showHistory ? 'Сховати історію' : 'Історія'}</span>
        </button>
      </div>

      {/* Progress Badge */}
      <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-amber-500 fill-amber-500/30" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Заповнено за сьогодні ({getTodayFormattedDate()}):
          </span>
        </div>
        <span className="text-xs font-bold font-mono px-2 py-0.5 bg-amber-500 text-white rounded-full">
          {todayCount}/3
        </span>
      </div>

      {/* Today Inputs */}
      <form onSubmit={handleSave} className="space-y-3 mb-5">
        <div>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">1</span>
            <span>За що ви вдячні перш за все?</span>
          </label>
          <input
            type="text"
            value={g1}
            onChange={(e) => setG1(e.target.value)}
            placeholder="Наприклад: За теплу каву та сонячний ранок..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-amber-500/30 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">2</span>
            <span>Хто або що порадувало вас сьогодні?</span>
          </label>
          <input
            type="text"
            value={g2}
            onChange={(e) => setG2(e.target.value)}
            placeholder="Наприклад: Підтримка друга / комплімент від колеги..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-amber-500/30 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-mono">3</span>
            <span>Яку дрібничку ви зробили для себе чи інших?</span>
          </label>
          <input
            type="text"
            value={g3}
            onChange={(e) => setG3(e.target.value)}
            placeholder="Наприклад: Випив(ла) воду та зробив(ла) розтяжку..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-amber-500/30 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {savedToast ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Збережено! Чекпойнтив у ментальному здоров’ї закрито ✨</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Збереження відмічає пункт у Ментальному здоров'ї
            </span>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95 ml-auto"
          >
            <Save className="w-4 h-4" />
            <span>Зберегти запис</span>
          </button>
        </div>
      </form>

      {/* History Log Section */}
      {showHistory && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Історія щоденника (записи по днях):</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Всього днів: {journalHistory.length}
            </span>
          </div>

          {journalHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Поки немає збережених записів. Збережіть першу вдячність вище!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {journalHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                      <span>🗓️</span> {item.formattedDate || item.date}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(item.date)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      title="Видалити запис за цей день"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {item.g1 && (
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">1.</span>
                        <span>{item.g1}</span>
                      </li>
                    )}
                    {item.g2 && (
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">2.</span>
                        <span>{item.g2}</span>
                      </li>
                    )}
                    {item.g3 && (
                      <li className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">3.</span>
                        <span>{item.g3}</span>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Section (Indicator time & display) */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          <span>Налаштування нагадування / індикатора</span>
        </h3>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            📖 Показувати індикатор щоденника на головному екрані
          </span>
          <button
            type="button"
            onClick={() => setShowIndicator(!showIndicator)}
            className={`relative inline-flex h-5 w-9 flex-none cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showIndicator ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                showIndicator ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {showIndicator && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Час появи нагадування:</span>
            </span>
            <select
              value={indicatorTime}
              onChange={(e) => setIndicatorTime(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-medium"
            >
              <option value="always">Завжди цілий день</option>
              <option value="18:00">Після 18:00 (увечері)</option>
              <option value="20:00">Після 20:00 (перед сном)</option>
              <option value="21:00">Після 21:00 (ввечері)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
