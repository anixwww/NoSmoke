import React, { useState, useEffect, useMemo } from 'react';
import { DayRating, StateEntry, MealLog, DrinkLog, SleepLog } from '../types';
import { StateDynamicsChart } from './StateDynamicsChart';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  Check,
  Moon,
  Utensils,
  Coffee,
  Activity,
  History,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart2
} from 'lucide-react';

interface StateSurveyTabProps {
  days: Record<string, DayRating>;
  onSaveRating: (dateKey: string, rating: DayRating) => void;
  onDeleteRating: (dateKey: string) => void;
}

export const StateSurveyTab: React.FC<StateSurveyTabProps> = ({
  days,
  onSaveRating
}) => {
  const getTodayKey = () => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());

  // Current day data
  const currentDayData: DayRating = useMemo(() => {
    return days[selectedDate] || {};
  }, [days, selectedDate]);

  // Helper to persist updates for current day
  const updateCurrentDay = (updater: (prev: DayRating) => DayRating) => {
    const updated = updater(currentDayData);
    onSaveRating(selectedDate, updated);
  };

  // -------------------------------------------------------------
  // 1. SLEEP SECTION STATE
  // -------------------------------------------------------------
  const [bedtime, setBedtime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [isEditingSleep, setIsEditingSleep] = useState<boolean>(false);

  useEffect(() => {
    if (currentDayData.sleep) {
      setBedtime(currentDayData.sleep.bedtime || '23:00');
      setWakeTime(currentDayData.sleep.wakeTime || '07:00');
      setSleepHours(currentDayData.sleep.hours || 8);
    } else {
      setBedtime('23:00');
      setWakeTime('07:00');
      setSleepHours(8);
    }
    setIsEditingSleep(false);
  }, [selectedDate, currentDayData.sleep]);

  // Auto-calculate sleep hours when bedtime or wakeTime changes
  const handleCalculateSleepHours = (bed: string, wake: string) => {
    if (!bed || !wake) return;
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let diffMinutes = (wH * 60 + wM) - (bH * 60 + bM);
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    const hrs = Number((diffMinutes / 60).toFixed(1));
    setSleepHours(hrs);
  };

  const handleSaveSleep = () => {
    const sleep: SleepLog = {
      bedtime,
      wakeTime,
      hours: Number(sleepHours)
    };
    updateCurrentDay((prev) => ({
      ...prev,
      sleep
    }));
    setIsEditingSleep(false);
  };

  // -------------------------------------------------------------
  // 2. MEALS SECTION STATE
  // -------------------------------------------------------------
  const [isAddingMeal, setIsAddingMeal] = useState<boolean>(false);
  const [mealTime, setMealTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [mealType, setMealType] = useState<string>('Сніданок');
  const [mealNote, setMealNote] = useState<string>('');

  const handleAddMeal = () => {
    const newMeal: MealLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: mealTime || new Date().toTimeString().slice(0, 5),
      title: mealType,
      note: mealNote.trim() || undefined
    };
    updateCurrentDay((prev) => ({
      ...prev,
      meals: [...(prev.meals || []), newMeal]
    }));
    setIsAddingMeal(false);
    setMealNote('');
  };

  const handleDeleteMeal = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      meals: (prev.meals || []).filter((m) => m.id !== id)
    }));
  };

  // -------------------------------------------------------------
  // 3. DRINKS (TEA / COFFEE) SECTION STATE
  // -------------------------------------------------------------
  const handleQuickAddDrink = (type: 'coffee' | 'tea', title: string) => {
    const nowTime = new Date().toTimeString().slice(0, 5);
    const newDrink: DrinkLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: nowTime,
      type,
      title
    };
    updateCurrentDay((prev) => ({
      ...prev,
      drinks: [...(prev.drinks || []), newDrink]
    }));
  };

  const handleDeleteDrink = (id: string) => {
    updateCurrentDay((prev) => ({
      ...prev,
      drinks: (prev.drinks || []).filter((d) => d.id !== id)
    }));
  };

  // -------------------------------------------------------------
  // 4. 30-MINUTE STATE SURVEY (NO SMILEYS, CLEAN NUMERIC SCALE)
  // -------------------------------------------------------------
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [surveyTime, setSurveyTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [mood, setMood] = useState<number>(3);
  const [craving, setCraving] = useState<number>(1);
  const [anxiety, setAnxiety] = useState<number>(1);
  const [energy, setEnergy] = useState<number>(3);
  const [balance, setBalance] = useState<number>(3);
  const [focus, setFocus] = useState<number>(3);
  const [surveyNote, setSurveyNote] = useState<string>('');

  // Calculate minutes since last survey check-in
  const surveys = useMemo(() => {
    const list = currentDayData.surveys || currentDayData.entries || [];
    return [...list].sort((a, b) => a.time.localeCompare(b.time));
  }, [currentDayData]);

  const lastSurveyTime = surveys.length > 0 ? surveys[surveys.length - 1].time : null;

  const handleSaveSurvey = () => {
    const newSurvey: StateEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: surveyTime || new Date().toTimeString().slice(0, 5),
      mood,
      craving,
      anxiety,
      energy,
      balance,
      focus,
      note: surveyNote.trim() || undefined
    };

    updateCurrentDay((prev) => {
      const existingSurveys = prev.surveys || prev.entries || [];
      return {
        ...prev,
        mood,
        craving,
        anxiety,
        surveys: [...existingSurveys, newSurvey],
        entries: [...existingSurveys, newSurvey]
      };
    });

    setIsSurveyOpen(false);
    setSurveyNote('');
    // reset defaults for next check-in
    setCraving(1);
    setAnxiety(1);
  };

  const handleDeleteSurvey = (id: string) => {
    updateCurrentDay((prev) => {
      const updated = (prev.surveys || prev.entries || []).filter((s) => s.id !== id);
      return {
        ...prev,
        surveys: updated,
        entries: updated
      };
    });
  };

  // -------------------------------------------------------------
  // 5. UNIFIED TIMELINE HISTORY
  // -------------------------------------------------------------
  const unifiedHistory = useMemo(() => {
    const items: Array<{
      id: string;
      time: string;
      category: 'sleep' | 'meal' | 'drink' | 'survey';
      title: string;
      details?: string;
      onDelete?: () => void;
    }> = [];

    // Sleep
    if (currentDayData.sleep) {
      items.push({
        id: 'sleep-entry',
        time: currentDayData.sleep.wakeTime || '07:00',
        category: 'sleep',
        title: `Сон: ${currentDayData.sleep.hours} год`,
        details: `Заснув о ${currentDayData.sleep.bedtime || '—'}, прокинувся о ${currentDayData.sleep.wakeTime || '—'}`
      });
    }

    // Meals
    (currentDayData.meals || []).forEach((m) => {
      items.push({
        id: m.id,
        time: m.time,
        category: 'meal',
        title: m.title,
        details: m.note,
        onDelete: () => handleDeleteMeal(m.id)
      });
    });

    // Drinks
    (currentDayData.drinks || []).forEach((d) => {
      items.push({
        id: d.id,
        time: d.time,
        category: 'drink',
        title: d.title,
        details: d.note,
        onDelete: () => handleDeleteDrink(d.id)
      });
    });

    // Surveys
    surveys.forEach((s) => {
      const parts = [
        `Настрій: ${s.mood ?? '—'}`,
        `Жага: ${s.craving ?? '—'}`,
        `Тривожність: ${s.anxiety ?? '—'}`,
        `Енергія: ${s.energy ?? '—'}`,
        `Рівновага: ${s.balance ?? '—'}`,
        `Концентрація: ${s.focus ?? '—'}`
      ];
      items.push({
        id: s.id,
        time: s.time,
        category: 'survey',
        title: 'Опитування стану',
        details: `${parts.join(' • ')}${s.note ? ` | «${s.note}»` : ''}`,
        onDelete: () => handleDeleteSurvey(s.id)
      });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [currentDayData, surveys]);

  // History View Period: day | 30 | 90 | 180 | 365
  const [historyViewPeriod, setHistoryViewPeriod] = useState<'day' | '30' | '90' | '180' | '365'>('day');
  const [expandedHistoryDay, setExpandedHistoryDay] = useState<string | null>(null);

  // Filter days for the selected period
  const periodDaysList = useMemo(() => {
    if (historyViewPeriod === 'day') return [];
    const rangeDays = parseInt(historyViewPeriod, 10);
    const today = new Date();
    const list: Array<{ dateKey: string; data: DayRating; dateObj: Date }> = [];

    for (let i = 0; i < rangeDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const data = days[key];
      if (
        data &&
        (data.sleep ||
          (data.meals && data.meals.length > 0) ||
          (data.drinks && data.drinks.length > 0) ||
          (data.surveys && data.surveys.length > 0) ||
          (data.entries && data.entries.length > 0) ||
          typeof data.craving === 'number')
      ) {
        list.push({ dateKey: key, data, dateObj: d });
      }
    }
    return list; // Most recent first
  }, [days, historyViewPeriod]);

  // Aggregates for the selected period
  const periodAggregates = useMemo(() => {
    if (historyViewPeriod === 'day' || periodDaysList.length === 0) return null;

    let totalSleep = 0, sleepDays = 0;
    let totalEnergy = 0, energyCount = 0;
    let totalSleepQuality = 0, sleepQualityCount = 0;
    let totalFocus = 0, focusCount = 0;
    let totalIntrusive = 0, intrusiveCount = 0;
    let totalCraving = 0, cravingCount = 0;
    let totalAnxiety = 0, anxietyCount = 0;
    let totalBalance = 0, balanceCount = 0;
    let totalCoffee = 0, totalTea = 0, totalMeals = 0, totalSurveys = 0;

    periodDaysList.forEach(({ data }) => {
      if (data.sleep?.hours) {
        totalSleep += data.sleep.hours;
        sleepDays++;
      }
      totalMeals += data.meals?.length || 0;
      data.drinks?.forEach((dr) => {
        if (dr.type === 'coffee') totalCoffee++;
        else if (dr.type === 'tea') totalTea++;
      });
      const svs = data.surveys || data.entries || [];
      totalSurveys += svs.length;
      svs.forEach((s) => {
        if (typeof s.energy === 'number' && s.energy > 0) { totalEnergy += s.energy; energyCount++; }
        if (typeof s.sleepQuality === 'number' && s.sleepQuality > 0) { totalSleepQuality += s.sleepQuality; sleepQualityCount++; }
        if (typeof s.focus === 'number' && s.focus > 0) { totalFocus += s.focus; focusCount++; }
        if (typeof s.intrusiveThoughts === 'number' && s.intrusiveThoughts > 0) { totalIntrusive += s.intrusiveThoughts; intrusiveCount++; }
        if (typeof s.craving === 'number' && s.craving > 0) { totalCraving += s.craving; cravingCount++; }
        if (typeof s.anxiety === 'number' && s.anxiety > 0) { totalAnxiety += s.anxiety; anxietyCount++; }
        if (typeof s.balance === 'number' && s.balance > 0) { totalBalance += s.balance; balanceCount++; }
      });
    });

    const avg = (sum: number, cnt: number) => (cnt > 0 ? (sum / cnt).toFixed(1) : '—');

    return {
      activeDaysCount: periodDaysList.length,
      avgSleep: avg(totalSleep, sleepDays),
      sleepDays,
      avgEnergy: avg(totalEnergy, energyCount),
      avgSleepQuality: avg(totalSleepQuality, sleepQualityCount),
      avgFocus: avg(totalFocus, focusCount),
      avgIntrusive: avg(totalIntrusive, intrusiveCount),
      avgCraving: avg(totalCraving, cravingCount),
      avgAnxiety: avg(totalAnxiety, anxietyCount),
      avgBalance: avg(totalBalance, balanceCount),
      totalCoffee,
      totalTea,
      totalMeals,
      totalSurveys
    };
  }, [periodDaysList, historyViewPeriod]);

  // Export history to formatted .txt file
  const exportHistoryToTxt = (period: 'day' | '30' | '90' | '180' | '365' | 'all') => {
    const today = new Date();
    let daysKeysToExport: string[] = [];
    let periodTitle = '';

    if (period === 'day') {
      daysKeysToExport = [selectedDate];
      periodTitle = `День: ${selectedDate}`;
    } else if (period === 'all') {
      daysKeysToExport = Object.keys(days).sort().reverse();
      periodTitle = 'Уся історія';
    } else {
      const rangeDays = parseInt(period, 10);
      periodTitle =
        rangeDays === 30
          ? '1 місяць (30 днів)'
          : rangeDays === 90
          ? '3 місяці (90 днів)'
          : rangeDays === 180
          ? 'Пів року (180 днів)'
          : '1 рік (365 днів)';

      for (let i = 0; i < rangeDays; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        daysKeysToExport.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
      }
    }

    const activeDays = daysKeysToExport.filter((key) => {
      const d = days[key];
      if (!d) return false;
      return !!(
        d.sleep ||
        d.meals?.length ||
        d.drinks?.length ||
        d.surveys?.length ||
        d.entries?.length ||
        typeof d.craving === 'number'
      );
    });

    let totalSleep = 0, sleepDaysCount = 0;
    let totalEnergy = 0, energyCount = 0;
    let totalSleepQuality = 0, sleepQualityCount = 0;
    let totalFocus = 0, focusCount = 0;
    let totalIntrusive = 0, intrusiveCount = 0;
    let totalCraving = 0, cravingCount = 0;
    let totalAnxiety = 0, anxietyCount = 0;
    let totalBalance = 0, balanceCount = 0;
    let totalCoffee = 0, totalTea = 0, totalMeals = 0, totalSurveys = 0;

    activeDays.forEach((key) => {
      const d = days[key];
      if (!d) return;
      if (d.sleep?.hours) {
        totalSleep += d.sleep.hours;
        sleepDaysCount++;
      }
      totalMeals += d.meals?.length || 0;
      d.drinks?.forEach((dr) => {
        if (dr.type === 'coffee') totalCoffee++;
        else if (dr.type === 'tea') totalTea++;
      });
      const svs = d.surveys || d.entries || [];
      totalSurveys += svs.length;
      svs.forEach((s) => {
        if (typeof s.energy === 'number' && s.energy > 0) { totalEnergy += s.energy; energyCount++; }
        if (typeof s.sleepQuality === 'number' && s.sleepQuality > 0) { totalSleepQuality += s.sleepQuality; sleepQualityCount++; }
        if (typeof s.focus === 'number' && s.focus > 0) { totalFocus += s.focus; focusCount++; }
        if (typeof s.intrusiveThoughts === 'number' && s.intrusiveThoughts > 0) { totalIntrusive += s.intrusiveThoughts; intrusiveCount++; }
        if (typeof s.craving === 'number' && s.craving > 0) { totalCraving += s.craving; cravingCount++; }
        if (typeof s.anxiety === 'number' && s.anxiety > 0) { totalAnxiety += s.anxiety; anxietyCount++; }
        if (typeof s.balance === 'number' && s.balance > 0) { totalBalance += s.balance; balanceCount++; }
      });
    });

    const avg = (sum: number, cnt: number) => (cnt > 0 ? (sum / cnt).toFixed(1) : '—');

    const now = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const nowStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    let txt = `========================================================================\n`;
    txt += `        ЩОДЕННИК СТАНУ, БІОРИТМІВ ТА ЗВИЧОК (ЗВІТ)\n`;
    txt += `========================================================================\n`;
    txt += `Сформовано: ${nowStr}\n`;
    txt += `Період звіту: ${periodTitle}\n`;
    txt += `Днів із записами: ${activeDays.length}\n`;
    txt += `Всього проведено опитувань (зрізів стану): ${totalSurveys}\n\n`;

    txt += `------------------------------------------------------------------------\n`;
    txt += `                    УЗАГАЛЬНЕНА СТАТИСТИКА ЗА ПЕРІОД                    \n`;
    txt += `------------------------------------------------------------------------\n`;
    txt += `• Середній сон:                ${avg(totalSleep, sleepDaysCount)} год / добу (зафіксовано у ${sleepDaysCount} дн.)\n`;
    txt += `• Середня енергія:             ${avg(totalEnergy, energyCount)} / 5\n`;
    txt += `• Середня виспаність:          ${avg(totalSleepQuality, sleepQualityCount)} / 5\n`;
    txt += `• Середня концентрація:        ${avg(totalFocus, focusCount)} / 5\n`;
    txt += `• Нав'язливі думки:            ${avg(totalIntrusive, intrusiveCount)} / 5\n`;
    txt += `• Тяга до куріння:             ${avg(totalCraving, cravingCount)} / 5\n`;
    txt += `• Рівень тривожності:          ${avg(totalAnxiety, anxietyCount)} / 5\n`;
    txt += `• Внутрішня рівновага:         ${avg(totalBalance, balanceCount)} / 5\n`;
    txt += `• Прийоми їжі:                 ${totalMeals} разів\n`;
    txt += `• Напої:                       Кава: ${totalCoffee} | Чай: ${totalTea} (Всього: ${totalCoffee + totalTea})\n\n`;

    txt += `========================================================================\n`;
    txt += `                       ХРОНОЛОГІЧНА ІСТОРІЯ ПО ДНЯХ                     \n`;
    txt += `========================================================================\n\n`;

    if (activeDays.length === 0) {
      txt += `(За обраний період відсутні збережені записи)\n`;
    } else {
      activeDays.forEach((dateKey) => {
        const d = days[dateKey];
        const dateObj = new Date(dateKey + 'T12:00:00');
        const weekday = dateObj.toLocaleDateString('uk-UA', { weekday: 'long' });
        const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        txt += `📅 ДАТА: ${dateKey} (${capitalizedWeekday})\n`;
        txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        // Sleep
        if (d.sleep) {
          txt += `  [СОН]\n`;
          txt += `    • Тривалість: ${d.sleep.hours} год`;
          if (d.sleep.bedtime && d.sleep.wakeTime) {
            txt += ` (заснув о ${d.sleep.bedtime}, прокинувся о ${d.sleep.wakeTime})`;
          }
          if (d.sleep.note) {
            txt += ` — нотатка: ${d.sleep.note}`;
          }
          txt += `\n`;
        } else {
          txt += `  [СОН] Не зафіксовано\n`;
        }

        // Meals
        if (d.meals && d.meals.length > 0) {
          txt += `  [ХАРЧУВАННЯ] (${d.meals.length} прийомів):\n`;
          d.meals.forEach((m) => {
            const title = m.title || 'Прийом їжі';
            txt += `    • ${m.time} — ${title}${m.note ? ` (${m.note})` : ''}\n`;
          });
        }

        // Drinks
        if (d.drinks && d.drinks.length > 0) {
          txt += `  [НАПОЇ] (${d.drinks.length} порцій):\n`;
          d.drinks.forEach((dr) => {
            const drinkTitle = dr.type === 'coffee' ? 'Кава' : 'Чай';
            txt += `    • ${dr.time} — ${drinkTitle}${dr.title && dr.title !== drinkTitle ? ` (${dr.title})` : ''}\n`;
          });
        }

        // Surveys
        const svs = d.surveys || d.entries || [];
        if (svs.length > 0) {
          txt += `  [ОПИТУВАННЯ СТАНУ] (${svs.length} зрізів):\n`;
          svs.forEach((s, idx) => {
            txt += `    ${idx + 1}. Час: ${s.time}\n`;
            txt += `       Настрій: ${s.mood ?? '—'}/5 | Жага: ${s.craving ?? '—'}/5 | Тривожність: ${s.anxiety ?? '—'}/5\n`;
            txt += `       Енергія: ${s.energy ?? '—'}/5 | Рівновага: ${s.balance ?? '—'}/5 | Концентрація: ${s.focus ?? '—'}/5\n`;
            if (s.note) {
              txt += `       Нотатка: "${s.note}"\n`;
            }
          });
        }

        txt += `\n`;
      });
    }

    txt += `========================================================================\n`;
    txt += `                  КІНЕЦЬ ЗВІТУ • БУДЬТЕ ЗДОРОВІ ТА СИЛЬНІ!              \n`;
    txt += `========================================================================\n`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileNamePeriod = period === 'day' ? selectedDate : `period_${period}d`;
    a.download = `istoriya_stanu_${fileNamePeriod}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Date Navigation
  const shiftDate = (daysCount: number) => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + daysCount);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    setSelectedDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  const isToday = selectedDate === getTodayKey();

  // Helper for numeric scale render without smileys
  const renderNumericScale = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    lowLabel: string,
    highLabel: string
  ) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">{label}</span>
          <span className="text-[11px] font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
            {value} / 5
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((num) => {
            const isSelected = value === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onChange(num)}
                className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#12302B] dark:bg-[#f4f4f5] text-white dark:text-[#12302B] border-[#12302B] dark:border-[#f4f4f5] shadow-xs scale-[1.02]'
                    : 'bg-white dark:bg-[#1c1c21] border-[#B7CDC6]/60 dark:border-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] hover:border-[#1E8A69]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#55726B]/80 dark:text-[#8FAAA3]/80 px-0.5">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-12 max-w-lg mx-auto w-full space-y-4 select-none">
      {/* Header & Date Switcher */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#12302B] dark:text-[#f4f4f5]">
            Стан та біоритми
          </h1>
          <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
            Сон, їжа, напої та кожні 30 хв динаміки
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="p-1 rounded-lg text-[#55726B] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Попередній день"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            max={getTodayKey()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-2 py-0.5 bg-transparent text-[#12302B] dark:text-[#f4f4f5] cursor-pointer"
          />

          <button
            type="button"
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isToday ? 'opacity-30 cursor-not-allowed' : 'text-[#55726B] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Наступний день"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Recharts Dynamic Graph by Days */}
      <StateDynamicsChart days={days} daysRange={7} />

      {/* 2. Sleep Tracking Card */}
      <div className="bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                Сон
              </h3>
              <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                Коли заснув та тривалість сну
              </p>
            </div>
          </div>

          {!isEditingSleep && currentDayData.sleep && (
            <button
              type="button"
              onClick={() => setIsEditingSleep(true)}
              className="text-[11px] font-bold text-[#1E8A69] dark:text-[#4CC9A0] hover:underline cursor-pointer"
            >
              Змінити
            </button>
          )}
        </div>

        {currentDayData.sleep && !isEditingSleep ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-[#121212]/60 border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
            <div className="space-y-0.5 text-xs text-[#12302B] dark:text-[#f4f4f5]">
              <div>
                Заснув о: <strong className="font-mono">{currentDayData.sleep.bedtime}</strong>
                {currentDayData.sleep.wakeTime && (
                  <span> • Прокинувся о: <strong className="font-mono">{currentDayData.sleep.wakeTime}</strong></span>
                )}
              </div>
              <div className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                Тривалість сну: <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">{currentDayData.sleep.hours} год</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                  Коли заснув
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => {
                    setBedtime(e.target.value);
                    handleCalculateSleepHours(e.target.value, wakeTime);
                  }}
                  className="w-full p-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl font-mono text-xs text-[#12302B] dark:text-[#f4f4f5]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#55726B] dark:text-[#8FAAA3] mb-1">
                  Коли прокинувся
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => {
                    setWakeTime(e.target.value);
                    handleCalculateSleepHours(bedtime, e.target.value);
                  }}
                  className="w-full p-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl font-mono text-xs text-[#12302B] dark:text-[#f4f4f5]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-bold text-[#55726B] dark:text-[#8FAAA3]">
                  Кількість годин сну
                </span>
                <span className="font-mono font-bold text-xs text-[#1E8A69] dark:text-[#4CC9A0]">
                  {sleepHours} год
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={14}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-[#1E8A69] cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSleep}
              className="w-full py-2 bg-[#12302B] dark:bg-[#f4f4f5] text-white dark:text-[#12302B] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Зафіксувати сон</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Meals & Drinks Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Meals */}
        <div className="bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                  Прийом їжі
                </h3>
                <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                  {(currentDayData.meals || []).length} прийом(ів) сьогодні
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMealTime(new Date().toTimeString().slice(0, 5));
                setIsAddingMeal(!isAddingMeal);
              }}
              className="p-1.5 rounded-lg bg-[#E6F0EC] dark:bg-[#25252d] text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#B7CDC6]/50 cursor-pointer"
              title="Додати їжу"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isAddingMeal && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="p-1.5 bg-[#E6F0EC] dark:bg-[#1c1c21] rounded-lg font-mono text-xs border border-[#B7CDC6]"
                />
                <div className="flex gap-1 flex-1 overflow-x-auto">
                  {['Сніданок', 'Обід', 'Вечеря', 'Перекус'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        mealType === t
                          ? 'bg-[#12302B] text-white dark:bg-[#f4f4f5] dark:text-[#12302B]'
                          : 'bg-[#E6F0EC] dark:bg-[#1c1c21] text-[#55726B]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                maxLength={60}
                placeholder="Опис або страва (необов'язково)"
                value={mealNote}
                onChange={(e) => setMealNote(e.target.value)}
                className="w-full p-1.5 bg-[#E6F0EC] dark:bg-[#1c1c21] rounded-lg text-xs border border-[#B7CDC6] text-[#12302B] dark:text-[#f4f4f5]"
              />

              <button
                type="button"
                onClick={handleAddMeal}
                className="w-full py-1.5 bg-[#1E8A69] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Зберегти прийом їжі
              </button>
            </div>
          )}

          {/* Quick list */}
          <div className="space-y-1 mt-2 max-h-28 overflow-y-auto">
            {(currentDayData.meals || []).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/50 dark:bg-[#121212]/50 border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[10px] font-bold text-[#55726B]">{m.time}</span>
                  <span className="font-bold text-[#12302B] dark:text-[#f4f4f5]">{m.title}</span>
                  {m.note && <span className="text-[10px] text-[#55726B] truncate">({m.note})</span>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMeal(m.id)}
                  className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Drinks (Tea / Coffee) */}
        <div className="bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/40">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                  Чай / Кава
                </h3>
                <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                  {(currentDayData.drinks || []).length} порцій сьогодні
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <button
              type="button"
              onClick={() => handleQuickAddDrink('coffee', 'Кава')}
              className="py-2 px-2 rounded-xl bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#1E8A69]" />
              <span>+ Кава</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickAddDrink('tea', 'Чай')}
              className="py-2 px-2 rounded-xl bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] hover:border-[#1E8A69] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3 text-[#1E8A69]" />
              <span>+ Чай</span>
            </button>
          </div>

          {/* Drinks list */}
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {(currentDayData.drinks || []).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/50 dark:bg-[#121212]/50 border border-black/5 dark:border-white/5"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#55726B]">{d.time}</span>
                  <span className="font-bold text-[#12302B] dark:text-[#f4f4f5]">{d.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDrink(d.id)}
                  className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. 30-Minute State Survey (NO SMILEYS, CLEAN & FOCUSED) */}
      <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
                Опитування про стан (кожні 30 хв)
              </h3>
              <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                {lastSurveyTime ? `Останній запис о ${lastSurveyTime}` : 'Сьогодні ще не проводилося'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSurveyTime(new Date().toTimeString().slice(0, 5));
              setIsSurveyOpen(!isSurveyOpen);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSurveyOpen
                ? 'bg-gray-200 dark:bg-gray-800 text-[#12302B] dark:text-[#f4f4f5]'
                : 'bg-[#1E8A69] text-white hover:bg-[#187558] shadow-xs'
            }`}
          >
            {isSurveyOpen ? 'Згорнути' : '+ Зафіксувати стан'}
          </button>
        </div>

        {isSurveyOpen && (
          <div className="space-y-4 pt-2 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-3">
            {/* Time of assessment */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Час фіксації:
              </span>
              <input
                type="time"
                value={surveyTime}
                onChange={(e) => setSurveyTime(e.target.value)}
                className="p-1.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl font-mono text-xs text-[#12302B] dark:text-[#f4f4f5]"
              />
            </div>

            {/* 1. Настрій */}
            {renderNumericScale(
              '1. Настрій',
              mood,
              setMood,
              'Поганий',
              'Відмінний'
            )}

            {/* 2. Жага */}
            {renderNumericScale(
              '2. Жага (тяга до куріння)',
              craving,
              setCraving,
              'Відсутня',
              'Сильна'
            )}

            {/* 3. Тривожність */}
            {renderNumericScale(
              '3. Тривожність',
              anxiety,
              setAnxiety,
              'Спокій',
              'Висока тривога'
            )}

            {/* 4. Енергія */}
            {renderNumericScale(
              '4. Енергія',
              energy,
              setEnergy,
              'Виснаження',
              'Повна бадьорість'
            )}

            {/* 5. Рівновага */}
            {renderNumericScale(
              '5. Рівновага',
              balance,
              setBalance,
              'Дисбаланс',
              'Гармонія та спокій'
            )}

            {/* 6. Концентрація */}
            {renderNumericScale(
              '6. Концентрація',
              focus,
              setFocus,
              'Розсіяна увага',
              'Глибокий фокус'
            )}

            {/* Note */}
            <div>
              <input
                type="text"
                maxLength={80}
                placeholder="Коротка нотатка (напр.: після кави, стрес по роботі)"
                value={surveyNote}
                onChange={(e) => setSurveyNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSurvey}
              className="w-full py-2.5 bg-[#12302B] dark:bg-[#f4f4f5] text-white dark:text-[#12302B] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Зберегти в історію та графік</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Timeline History and Period Analytics */}
      <div className="bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs space-y-4">
        {/* Top bar: title and txt export button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
              Історія та аналітика
            </h3>
          </div>

          <button
            type="button"
            onClick={() => exportHistoryToTxt(historyViewPeriod)}
            className="self-start sm:self-auto px-3 py-1.5 bg-[#1E8A69] hover:bg-[#187558] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            title="Завантажити звіт у форматі .txt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Експорт у .TXT</span>
          </button>
        </div>

        {/* Period Selector Tabs: Day / 1 mo / 3 mo / 6 mo / 1 yr */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#E6F0EC] dark:bg-[#25252d] rounded-xl w-full border border-[#B7CDC6]/30 dark:border-white/5 no-scrollbar">
          {[
            { id: 'day', label: 'День' },
            { id: '30', label: '1 міс' },
            { id: '90', label: '3 міс' },
            { id: '180', label: '6 міс' },
            { id: '365', label: '1 рік' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setHistoryViewPeriod(tab.id as any)}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                historyViewPeriod === tab.id
                  ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
                  : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DAY VIEW */}
        {historyViewPeriod === 'day' ? (
          <div>
            <div className="flex items-center justify-between text-xs text-[#55726B] dark:text-[#8FAAA3] mb-2 font-medium">
              <span>Хронологія за {selectedDate}:</span>
              <span>{unifiedHistory.length} записів</span>
            </div>

            {unifiedHistory.length > 0 ? (
              <div className="divide-y divide-[#B7CDC6]/20 dark:divide-[#2d2d35]">
                {unifiedHistory.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] pt-0.5">
                        {item.time}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                          {item.title}
                        </div>
                        {item.details && (
                          <div className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed break-words mt-0.5">
                            {item.details}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.onDelete && (
                      <button
                        type="button"
                        onClick={item.onDelete}
                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                        title="Видалити запис"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#55726B] dark:text-[#8FAAA3] italic">
                За цей день ще немає записів сну, їжі, напоїв чи зрізів стану.
              </div>
            )}
          </div>
        ) : (
          /* PERIOD VIEW: 1 MONTH / 3 MONTHS / HALF YEAR / YEAR */
          <div className="space-y-4">
            {periodAggregates ? (
              <>
                {/* Period Aggregates Summary Box */}
                <div className="p-3 bg-[#E6F0EC]/50 dark:bg-[#1D3832]/30 border border-[#B7CDC6]/40 dark:border-[#2d2d35] rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] border-b border-[#B7CDC6]/30 dark:border-[#2d2d35] pb-1.5">
                    <span>Підсумки за період ({periodAggregates.activeDaysCount} активних дн.)</span>
                    <span className="font-normal text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                      {periodAggregates.totalSurveys} зрізів стану
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Середній сон</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                        {periodAggregates.avgSleep} год
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Середня тяга</span>
                      <strong className="text-red-600 dark:text-red-400 text-sm font-mono">
                        {periodAggregates.avgCraving} / 5
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Тривожність</span>
                      <strong className="text-rose-600 dark:text-rose-400 text-sm font-mono">
                        {periodAggregates.avgAnxiety} / 5
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Рівновага</span>
                      <strong className="text-teal-600 dark:text-teal-400 text-sm font-mono">
                        {periodAggregates.avgBalance} / 5
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Енергія</span>
                      <strong className="text-amber-600 dark:text-amber-400 text-sm font-mono">
                        {periodAggregates.avgEnergy} / 5
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Концентрація</span>
                      <strong className="text-purple-600 dark:text-purple-400 text-sm font-mono">
                        {periodAggregates.avgFocus} / 5
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Напої (кава/чай)</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 text-sm font-mono">
                        {periodAggregates.totalCoffee}к / {periodAggregates.totalTea}ч
                      </strong>
                    </div>
                    <div className="p-2 bg-white/70 dark:bg-[#1c1c21]/70 rounded-lg">
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Прийомів їжі</span>
                      <strong className="text-blue-600 dark:text-blue-400 text-sm font-mono">
                        {periodAggregates.totalMeals}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Days List with entries in this period */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Записи по днях ({periodDaysList.length}):
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {periodDaysList.map(({ dateKey, data, dateObj }) => {
                      const weekday = dateObj.toLocaleDateString('uk-UA', { weekday: 'short' });
                      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
                      const dayMonth = dateObj.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
                      const isExpanded = expandedHistoryDay === dateKey;
                      const daySurveys = data.surveys || data.entries || [];

                      return (
                        <div
                          key={dateKey}
                          className="bg-white/90 dark:bg-[#18181d] border border-[#B7CDC6]/50 dark:border-[#2d2d35] rounded-xl p-3 transition-all"
                        >
                          <div
                            onClick={() => setExpandedHistoryDay(isExpanded ? null : dateKey)}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                                {dayMonth}
                              </span>
                              <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                                ({capitalizedWeekday})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {data.sleep?.hours && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                                  Сон: {data.sleep.hours}г
                                </span>
                              )}
                              {daySurveys.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono">
                                  {daySurveys.length} зріз(ів)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDate(dateKey);
                                  setHistoryViewPeriod('day');
                                }}
                                className="text-[10px] text-[#1E8A69] dark:text-[#4CC9A0] font-bold hover:underline px-1"
                              >
                                Переглянути день →
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Expanded detailed breakdown */}
                          {isExpanded && (
                            <div className="mt-3 pt-2.5 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] text-xs space-y-2">
                              {/* Sleep info */}
                              {data.sleep && (
                                <div className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                                  <strong className="text-[#12302B] dark:text-[#f4f4f5]">Сон: </strong>
                                  {data.sleep.hours} год
                                  {data.sleep.bedtime && data.sleep.wakeTime && (
                                    <span> (з {data.sleep.bedtime} до {data.sleep.wakeTime})</span>
                                  )}
                                  {data.sleep.note && <span> — {data.sleep.note}</span>}
                                </div>
                              )}

                              {/* Meals */}
                              {data.meals && data.meals.length > 0 && (
                                <div className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                                  <strong className="text-[#12302B] dark:text-[#f4f4f5]">Їжа ({data.meals.length}): </strong>
                                  {data.meals.map((m) => `${m.time} ${m.title}`).join(', ')}
                                </div>
                              )}

                              {/* Drinks */}
                              {data.drinks && data.drinks.length > 0 && (
                                <div className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                                  <strong className="text-[#12302B] dark:text-[#f4f4f5]">Напої ({data.drinks.length}): </strong>
                                  {data.drinks.map((d) => `${d.time} ${d.type === 'coffee' ? 'Кава' : 'Чай'}`).join(', ')}
                                </div>
                              )}

                              {/* Surveys list */}
                              {daySurveys.length > 0 && (
                                <div className="space-y-1">
                                  <strong className="text-[11px] text-[#12302B] dark:text-[#f4f4f5] block">
                                    Зрізи стану ({daySurveys.length}):
                                  </strong>
                                  <div className="space-y-1 pl-1 text-[10px]">
                                    {daySurveys.map((s, idx) => (
                                      <div key={s.id || idx} className="text-[#55726B] dark:text-[#8FAAA3]">
                                        <span className="font-mono font-bold text-[#12302B] dark:text-[#f4f4f5]">{s.time}: </span>
                                        Енергія: {s.energy ?? '—'} | Виспаність: {s.sleepQuality ?? '—'} | Фокус: {s.focus ?? '—'} | Тяга: {s.craving ?? '—'} | Тривога: {s.anxiety ?? '—'} | Рівновага: {s.balance ?? '—'}
                                        {s.note && <span className="italic"> («{s.note}»)</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-xs text-[#55726B] dark:text-[#8FAAA3] italic">
                За обраний період ще немає збережених записів стану.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
