import React from 'react';
import { Streak, MoneySettings, GoalsState, DayRating, TreeState } from '../types';
import { Palette, Trash2, Plus, Download, Upload, Shield, RefreshCw, FileCode, Calendar, Sparkles, Smile } from 'lucide-react';

interface MoreTabProps {
  reasons: string[];
  streaks: Streak[];
  currentStart: number;
  totalFreeMs: number;
  longestStreakMs: number;
  money: MoneySettings | null;
  days: Record<string, DayRating>;
  goals: GoalsState;
  treeState: TreeState;
  theme: 'light' | 'dark' | 'system';
  accent: string;
  onUpdateReasons: (reasons: string[]) => void;
  onSetTheme: (t: 'light' | 'dark' | 'system') => void;
  onSetAccent: (a: string) => void;
  onUndoLastRelapse: () => void;
  onRestoreAllData: (data: any) => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onSwitchTab?: (tab: any) => void;
}

const ACCENT_COLORS = [
  { id: 'green', hex: '#2E9E7A', name: 'Смарагд' },
  { id: 'blue', hex: '#2568C7', name: 'Океан' },
  { id: 'purple', hex: '#7B4FD1', name: 'Лаванда' },
  { id: 'pink', hex: '#C43D7D', name: 'Троянда' },
  { id: 'amber', hex: '#B8791A', name: 'Бурштин' }
];

export const MoreTab: React.FC<MoreTabProps> = ({
  reasons,
  streaks,
  currentStart,
  totalFreeMs,
  longestStreakMs,
  money,
  days,
  goals,
  treeState,
  theme,
  accent,
  onUpdateReasons,
  onSetTheme,
  onSetAccent,
  onUndoLastRelapse,
  onRestoreAllData,
  onOpenSetup,
  onOpenRelapse,
  onSwitchTab
}) => {
  const [newReason, setNewReason] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const formattedStartDate = React.useMemo(() => {
    try {
      return new Date(currentStart).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(currentStart).toLocaleString();
    }
  }, [currentStart]);

  const handleAddReason = () => {
    if (!newReason.trim()) return;
    if (reasons.length >= 20) {
      alert('Максимум 20 причин. Будь ласка, видаліть якусь, щоб додати нову.');
      return;
    }
    onUpdateReasons([...reasons, newReason.trim()]);
    setNewReason('');
  };

  const handleDeleteReason = (idx: number) => {
    onUpdateReasons(reasons.filter((_, i) => i !== idx));
  };

  const fmtDuration = (ms: number) => {
    const d = Math.floor(ms / (24 * 3600 * 1000));
    const h = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    if (d > 0) return `${d} дн. ${h} год.`;
    return `${h} год.`;
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const data = {
      app: 'bez-syharet-react',
      version: 4,
      exportedAt: Date.now(),
      start: currentStart,
      money,
      days,
      streaks,
      reasons,
      goals,
      tree: treeState
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bez-syharet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download standalone single-file HTML
  const handleDownloadStandaloneHtml = async () => {
    try {
      const res = await fetch('/standalone.html');
      if (!res.ok) throw new Error('Failed to load standalone');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bez-syharet-standalone-${new Date().toISOString().slice(0, 10)}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open('/standalone.html', '_blank');
    }
  };

  // Import JSON backup from file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !parsed.start) {
          alert('Файл резервної копії пошкоджений або не містить дати старту.');
          return;
        }
        if (confirm('Відновити всі дані з цього файлу? Поточні дані буде замінено.')) {
          onRestoreAllData(parsed);
        }
      } catch (err) {
        alert('Помилка читання файлу JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
          Налаштування та історія
        </h1>
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
          Теми оформлення, особисті причини, архів серій та резервні копії
        </p>
      </div>

      {/* START DATE & ACTION BUTTONS (ПОЧАТОК ШЛЯХУ) */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Початок шляху
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 px-1">
          <span>Точний час старту:</span>
          <span className="font-semibold font-mono text-[#12302B] dark:text-[#f4f4f5]">
            {formattedStartDate}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenSetup}
            className="py-2.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/60 dark:hover:bg-[#112723]/60 rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#55726B] dark:text-[#8FAAA3]" />
            <span>Змінити дату</span>
          </button>

          <button
            type="button"
            onClick={onOpenRelapse}
            className="py-2.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#A33A2C] dark:hover:border-[#F08C7D] hover:bg-[#A33A2C]/5 rounded-xl text-xs font-semibold text-[#A33A2C] dark:text-[#F08C7D] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Зірвався</span>
          </button>
        </div>
      </div>

      {/* DAILY MOOD / STATE SHORTCUT */}
      {onSwitchTab && (
        <button
          type="button"
          onClick={() => onSwitchTab('state')}
          className="w-full p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] rounded-2xl mb-4 shadow-xs text-left cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E8A69]/10 dark:bg-[#4CC9A0]/15 flex items-center justify-center text-xl flex-none">
              <Smile className="w-5 h-5 text-[#1E8A69] dark:text-[#4CC9A0]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] group-hover:text-[#1E8A69] transition-colors">
                Щоденний стан та настрій
              </h3>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Відстежуй симптоми відміни, настрій та тягу щодня
              </p>
            </div>
          </div>
          <span className="text-xs text-[#1E8A69] dark:text-[#4CC9A0] font-bold group-hover:translate-x-0.5 transition-transform">
            Відкрити →
          </span>
        </button>
      )}

      {/* APPEARANCE SECTION */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-[#1E8A69]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Вигляд та кольори
          </h3>
        </div>

        {/* Theme Segment */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#CBDDD7]/60 dark:bg-[#1D3832]/60 rounded-xl mb-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSetTheme(t)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                theme === t
                  ? 'bg-white dark:bg-[#1c1c21] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
                  : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
              }`}
            >
              {t === 'light' ? 'Світла' : t === 'dark' ? 'Темна' : 'Системна'}
            </button>
          ))}
        </div>

        {/* Accent Colors */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-[#55726B] dark:text-[#8FAAA3] font-medium">Акцент:</span>
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSetAccent(c.id)}
              style={{ backgroundColor: c.hex }}
              className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                accent === c.id ? 'ring-3 ring-offset-2 ring-[#1E8A69] scale-110' : 'hover:scale-105'
              }`}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* REASONS SECTION: НАВІЩО Я КИНУВ КУРИТИ */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Навіщо я кинув курити
          </h3>
        </div>
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3">
          Твої особисті причини та мотивація для свободи від тютюну.
        </p>

        {/* Add reason row */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            maxLength={140}
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
            placeholder="Наприклад: Здорове серце, дихати без задишки"
            className="flex-1 text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] focus:outline-none focus:border-[#1E8A69]"
          />
          <button
            type="button"
            onClick={handleAddReason}
            className="px-3 py-2 bg-[#1E8A69] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Додати</span>
          </button>
        </div>

        {/* Reasons list */}
        <div className="space-y-1.5">
          {reasons.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6]/50"
            >
              <span className="text-[#12302B] dark:text-[#f4f4f5]">{r}</span>
              <button
                type="button"
                onClick={() => handleDeleteReason(i)}
                className="text-[#55726B] hover:text-red-500 p-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STREAKS AND RELAPSE HISTORY */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] mb-2">
          Історія серій
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="p-2 bg-white/50 dark:bg-[#1c1c21]/50 rounded-xl">
            <span className="text-[11px] text-[#55726B] block">Найдовша серія:</span>
            <span className="font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
              {fmtDuration(longestStreakMs)}
            </span>
          </div>
          <div className="p-2 bg-white/50 dark:bg-[#1c1c21]/50 rounded-xl">
            <span className="text-[11px] text-[#55726B] block">Всього без сигарет:</span>
            <span className="font-bold text-[#12302B] dark:text-[#f4f4f5]">
              {fmtDuration(totalFreeMs)}
            </span>
          </div>
        </div>

        {streaks.length > 0 ? (
          <div className="space-y-1.5 mb-2">
            {streaks.map((s, idx) => (
              <div
                key={idx}
                className="text-xs p-2 rounded-xl bg-white/40 dark:bg-[#1c1c21]/40 border border-[#B7CDC6]/40 flex items-center justify-between"
              >
                <div>
                  <span className="text-[#55726B]">
                    {new Date(s.from).toLocaleDateString('uk-UA')} – {new Date(s.to).toLocaleDateString('uk-UA')}
                  </span>
                  {s.note && <p className="text-[11px] text-[#12302B]/80 mt-0.5">«{s.note}»</p>}
                </div>
                <span className="font-bold text-[#1E8A69]">
                  {fmtDuration(s.to - s.from)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#55726B] italic mb-2">
            Жодного зриву! Поточна серія триває з моменту старту.
          </p>
        )}

        {streaks.length > 0 && (
          <button
            type="button"
            onClick={onUndoLastRelapse}
            className="text-xs text-[#55726B] hover:text-[#1E8A69] underline cursor-pointer mt-1"
          >
            Скасувати останній зрив (повернути серію)
          </button>
        )}
      </div>

      {/* BACKUP & RESTORE */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs">
        <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
          Резервна копія
        </h3>
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 leading-relaxed">
          Усі дані зберігаються тільки у цьому браузері. Збережіть копію у файл .json, щоб не втратити прогрес.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 border border-[#1E8A69] hover:bg-[#1E8A69]/10 text-[#1E8A69] dark:text-[#4CC9A0] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Зберегти у файл</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/40 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-[#12302B] dark:text-[#f4f4f5]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Відновити з файлу</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* STANDALONE SINGLE-FILE HTML EXPORT */}
      <div className="p-4 bg-gradient-to-br from-white/90 to-[#1E8A69]/10 dark:from-[#112723]/90 dark:to-[#4CC9A0]/10 border border-[#1E8A69]/40 dark:border-[#4CC9A0]/40 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <FileCode className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Один автономний файл (.html)
          </h3>
        </div>
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-3 leading-relaxed">
          Містить увесь застосунок в одному файлі (React + Tailwind + звуки + всі розділи). Ідеально для офлайну або продовження розробки в інших ШІ (Claude, ChatGPT тощо).
        </p>

        <button
          type="button"
          onClick={handleDownloadStandaloneHtml}
          className="w-full py-2.5 px-4 bg-[#1E8A69] hover:bg-[#187558] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Завантажити весь додаток в один HTML-файл</span>
        </button>
      </div>
    </div>
  );
};
