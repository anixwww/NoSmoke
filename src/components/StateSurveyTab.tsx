import React from 'react';
import { DayRating } from '../types';
import { Sparkles, Calendar, Check, TrendingUp, AlertCircle } from 'lucide-react';

interface StateSurveyTabProps {
  days: Record<string, DayRating>;
  onSaveRating: (dateKey: string, rating: DayRating) => void;
  onDeleteRating: (dateKey: string) => void;
}

const TAG_OPTIONS = [
  { id: 'Кава', label: 'Кава', icon: '☕' },
  { id: 'Стрес', label: 'Стрес', icon: '⚡' },
  { id: 'Алкоголь', label: 'Алкоголь', icon: '🍷' },
  { id: 'Після їжі', label: 'Після їжі', icon: '🍽️' },
  { id: 'Компанія', label: 'Компанія курців', icon: '👥' },
  { id: 'Нудьга', label: 'Нудьга', icon: '🥱' },
  { id: 'Робота', label: 'Робота/дедлайн', icon: '💼' },
  { id: 'Недосип', label: 'Втома/недосип', icon: '😴' }
];

const MOOD_OPTIONS = [
  { v: 1, emoji: '😞', label: 'Важко', desc: 'Занепад сил' },
  { v: 2, emoji: '😕', label: 'Пригнічено', desc: 'Трохи сумно' },
  { v: 3, emoji: '😐', label: 'Звичайно', desc: 'Рівний стан' },
  { v: 4, emoji: '🙂', label: 'Добре', desc: 'Приємний настрій' },
  { v: 5, emoji: '🌟', label: 'Чудово!', desc: 'Піднесення' }
];

const CRAVING_OPTIONS = [
  { v: 1, emoji: '🛡️', label: 'Нуль', desc: 'Не згадував' },
  { v: 2, emoji: '🍃', label: 'Легка', desc: 'Миттєва думка' },
  { v: 3, emoji: '⚡', label: 'Помітна', desc: 'Довелося відволіктися' },
  { v: 4, emoji: '🌊', label: 'Сильна хвиля', desc: 'Було важко' },
  { v: 5, emoji: '💥', label: 'Штормило', desc: 'Гострий пік' }
];

const ANXIETY_OPTIONS = [
  { v: 1, emoji: '🧘', label: 'Спокій', desc: 'Повна рівновага' },
  { v: 2, emoji: '🌿', label: 'Легке', desc: 'Звичний ритм' },
  { v: 3, emoji: '⏱️', label: 'Помірне', desc: 'Фонова напруга' },
  { v: 4, emoji: '🌪️', label: 'Висока', desc: 'Важко зосередитись' },
  { v: 5, emoji: '🔥', label: 'Сильний стрес', desc: 'Перевантаження' }
];

export const StateSurveyTab: React.FC<StateSurveyTabProps> = ({
  days,
  onSaveRating,
  onDeleteRating
}) => {
  const getTodayKey = () => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = React.useState<string>(getTodayKey());
  const [mood, setMood] = React.useState<number>(0);
  const [craving, setCraving] = React.useState<number>(0);
  const [anxiety, setAnxiety] = React.useState<number>(0);
  const [tags, setTags] = React.useState<string[]>([]);
  const [note, setNote] = React.useState<string>('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [chartRange, setChartRange] = React.useState<'week' | 'month' | 'all'>('week');

  // Load existing rating for selected date if exists
  React.useEffect(() => {
    const existing = days[selectedDate];
    if (existing) {
      setMood(existing.mood);
      setCraving(existing.craving);
      setAnxiety(existing.anxiety);
      setTags(existing.tags || []);
      setNote(existing.note || '');
    } else {
      setMood(0);
      setCraving(0);
      setAnxiety(0);
      setTags([]);
      setNote('');
    }
    setSaveSuccess(false);
  }, [selectedDate, days]);

  const toggleTag = (id: string) => {
    setTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!mood || !craving || !anxiety) {
      alert('Будь ласка, оберіть оцінку для всіх трьох категорій (настрій, тяга, тривожність).');
      return;
    }
    onSaveRating(selectedDate, {
      mood,
      craving,
      anxiety,
      tags,
      note: note.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Recent logged entries for chart
  const dateKeys = Object.keys(days).sort();
  const recentDays = dateKeys.slice(chartRange === 'week' ? -7 : chartRange === 'month' ? -30 : 0);

  // Simple insight calculation
  const totalDaysRated = dateKeys.length;
  const avgCraving = totalDaysRated
    ? (dateKeys.reduce((acc, k) => acc + days[k].craving, 0) / totalDaysRated).toFixed(1)
    : '0';
  const avgMood = totalDaysRated
    ? (dateKeys.reduce((acc, k) => acc + days[k].mood, 0) / totalDaysRated).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
          Щоденник стану
        </h1>
        <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
          Відстежуй свій настрій, моменти тяги та знаходь приховані тригери
        </p>
      </div>

      {/* Date picker bar */}
      <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
          <span className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5]">
            Оцінка за день:
          </span>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={getTodayKey()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5]"
        />
      </div>

      {/* SECTION 1: MOOD */}
      <div className="p-4 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Який сьогодні настрій?
            </h3>
          </div>
          {mood > 0 && (
            <span className="text-xs font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
              {MOOD_OPTIONS.find((m) => m.v === mood)?.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = mood === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setMood(opt.v)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#1E8A69] bg-[#1E8A69]/15 dark:bg-[#4CC9A0]/20 shadow-xs scale-[1.02]'
                    : 'border-[#B7CDC6]/60 dark:border-[#2d2d35]/60 bg-white/40 dark:bg-[#1c1c21]/40 hover:bg-white'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[10px] font-bold text-[#12302B] dark:text-[#f4f4f5] leading-none">
                  {opt.label}
                </span>
                <span className="text-[8px] text-[#55726B] dark:text-[#8FAAA3] text-center leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: CRAVING */}
      <div className="p-4 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚬</span>
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Рівень тяги до сигарети
            </h3>
          </div>
          {craving > 0 && (
            <span className="text-xs font-bold text-[#C9701A] dark:text-[#F2A65A]">
              {CRAVING_OPTIONS.find((c) => c.v === craving)?.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {CRAVING_OPTIONS.map((opt) => {
            const isSelected = craving === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setCraving(opt.v)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#C9701A] bg-[#C9701A]/15 dark:bg-[#F2A65A]/20 shadow-xs scale-[1.02]'
                    : 'border-[#B7CDC6]/60 dark:border-[#2d2d35]/60 bg-white/40 dark:bg-[#1c1c21]/40 hover:bg-white'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[10px] font-bold text-[#12302B] dark:text-[#f4f4f5] leading-none">
                  {opt.label}
                </span>
                <span className="text-[8px] text-[#55726B] dark:text-[#8FAAA3] text-center leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: ANXIETY */}
      <div className="p-4 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧘</span>
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Рівень тривожності та стресу
            </h3>
          </div>
          {anxiety > 0 && (
            <span className="text-xs font-bold text-[#5B54C8] dark:text-[#A29BFF]">
              {ANXIETY_OPTIONS.find((a) => a.v === anxiety)?.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {ANXIETY_OPTIONS.map((opt) => {
            const isSelected = anxiety === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => setAnxiety(opt.v)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[#5B54C8] bg-[#5B54C8]/15 dark:bg-[#A29BFF]/20 shadow-xs scale-[1.02]'
                    : 'border-[#B7CDC6]/60 dark:border-[#2d2d35]/60 bg-white/40 dark:bg-[#1c1c21]/40 hover:bg-white'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-[10px] font-bold text-[#12302B] dark:text-[#f4f4f5] leading-none">
                  {opt.label}
                </span>
                <span className="text-[8px] text-[#55726B] dark:text-[#8FAAA3] text-center leading-tight">
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: TRIGGERS */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3] mb-2.5">
          Що вплинуло на бажання закурити? (необов’язково)
        </h3>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => {
            const isChecked = tags.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isChecked
                    ? 'border-[#1E8A69] bg-[#1E8A69] text-white shadow-xs'
                    : 'border-[#B7CDC6] dark:border-[#2d2d35] bg-white/50 dark:bg-[#1c1c21]/50 text-[#12302B] dark:text-[#f4f4f5] hover:bg-white'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: NOTE */}
      <div className="p-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl mb-5 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3]">
            Особиста нотатка до дня
          </label>
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
            {note.length}/300
          </span>
        </div>
        <textarea
          rows={2}
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Що було важливого сьогодні? Як ти подолав спокусу?"
          className="w-full text-xs p-2.5 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] placeholder:text-[#55726B]/50 resize-none focus:outline-none focus:border-[#1E8A69]"
        />
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 bg-[#1E8A69] hover:bg-[#187558] text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mb-4"
      >
        <Check className="w-4 h-4" />
        <span>{days[selectedDate] ? 'Оновити оцінку дня' : 'Зберегти оцінку дня'}</span>
      </button>

      {saveSuccess && (
        <div className="p-3 bg-[#1E8A69]/15 border border-[#1E8A69]/30 rounded-xl text-xs font-semibold text-center text-[#1E8A69] dark:text-[#4CC9A0] mb-5">
          ✓ Оцінку успішно збережено в щоденник!
        </div>
      )}

      {/* Analytics & Insights Card */}
      <div className="p-4 bg-white/60 dark:bg-[#1c1c21]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-[#1E8A69]" />
          <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Аналітика твоїх записів
          </h3>
        </div>

        {totalDaysRated > 0 ? (
          <div className="space-y-2 text-xs text-[#55726B] dark:text-[#8FAAA3]">
            <p>
              📊 Оцінено днів: <strong className="text-[#12302B] dark:text-[#f4f4f5]">{totalDaysRated}</strong>.
              Середня тяга: <strong className="text-[#C9701A]">{avgCraving} / 5</strong>.
              Середній настрій: <strong className="text-[#1E8A69]">{avgMood} / 5</strong>.
            </p>
            {totalDaysRated >= 3 && (
              <p className="p-2.5 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-[#B7CDC6]/50 leading-relaxed text-[#12302B] dark:text-[#f4f4f5]">
                💡 <strong>Спостереження:</strong> регулярний запис емоцій допомагає мозку відокремити почуття від фізичної потреби в димі. Що довше триває серія, то рідшими стають пікові хвилі тяги.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic">
            Збережи першу оцінку, щоб тут з’явилася аналітика твого прогресу та тригерів.
          </p>
        )}
      </div>
    </div>
  );
};
