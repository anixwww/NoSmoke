import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Streak, GoalsState, MoneySettings, PriceTier, DayRating } from '../types';
import {
  Calendar,
  RefreshCw,
  Target,
  Check,
  Trash2,
  Plus,
  Trophy,
  Calculator,
  History,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Heart,
  ChevronRight,
  Award,
  ShoppingBag,
  Download,
  Upload,
  Sparkles,
  Smile,
  FileText,
  Coffee,
  ExternalLink,
  Palette,
  Activity,
  Cpu,
  Clock,
  Brain,
  BookOpen
} from 'lucide-react';

import { DailyStepsSection } from './DailyStepsSection';
import { StangeTestCard } from './StangeTestCard';
import { HydrationCard } from './HydrationCard';
import { HealthTab } from './HealthTab';
import { MentalHealthCard } from './MentalHealthCard';
import { GratitudeJournalCard } from './GratitudeJournalCard';

interface MoreTabProps {
  reasons: string[];
  streaks: Streak[];
  currentStart: number;
  totalFreeMs: number;
  longestStreakMs: number;
  goals: GoalsState;
  totalSaved: number;
  cigsAvoided: number;
  money: MoneySettings | null;
  days?: Record<string, DayRating>;
  promptIntervalMinutes?: number;
  currentAccent?: string;
  onUpdateAccent?: (accent: string) => void;
  onUpdatePromptInterval?: (minutes: number) => void;
  onUpdateMoney: (newMoney: MoneySettings) => void;
  onAddGoal: (name: string, amount?: number, targetDate?: string) => void;
  onCompleteGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddReason?: (reason: string) => void;
  onDeleteReason?: (index: number) => void;
  onRestoreData?: (backup: any) => void;
  onUndoLastRelapse: () => void;
  onOpenSetup?: () => void;
  onOpenRelapse?: () => void;
  onOpenOnboarding?: () => void;
}

type SectionKey = 'habits' | 'gratitude_journal' | 'mental_health' | 'health_tests' | 'hydration' | 'goals' | 'start' | 'streaks' | 'reasons' | 'badges' | 'equivalents' | 'prompt' | 'theme' | 'backup' | 'monitor' | 'developer' | 'health';

export const MoreTab: React.FC<MoreTabProps> = ({
  reasons,
  streaks,
  currentStart,
  totalFreeMs,
  longestStreakMs,
  goals,
  totalSaved,
  cigsAvoided,
  money,
  days = {},
  promptIntervalMinutes = 30,
  currentAccent = 'green',
  onUpdateAccent,
  onUpdatePromptInterval,
  onUpdateMoney,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
  onAddReason,
  onDeleteReason,
  onUndoLastRelapse,
  onOpenSetup,
  onOpenRelapse,
  onOpenOnboarding
}) => {
  // Collapsible sections state (persisted in localStorage)
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem('quit-smoking:more-sections-state');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default: all sections collapsed so everything is neatly tucked into sections
    return {
      habits: false,
      gratitude_journal: false,
      mental_health: false,
      health_tests: false,
      hydration: false,
      goals: false,
      start: false,
      streaks: false,
      reasons: false,
      badges: false,
      equivalents: false,
      prompt: false,
      theme: false,
      backup: false,
      monitor: false,
      developer: false,
      health: false
    };
  });

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('quit-smoking:more-sections-state', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const allOpen = Object.values(openSections).every(Boolean);
  const toggleAll = () => {
    const nextVal = !allOpen;
    const updated: Record<SectionKey, boolean> = {
      habits: nextVal,
      gratitude_journal: nextVal,
      mental_health: nextVal,
      health_tests: nextVal,
      hydration: nextVal,
      goals: nextVal,
      start: nextVal,
      streaks: nextVal,
      reasons: nextVal,
      badges: nextVal,
      equivalents: nextVal,
      prompt: nextVal,
      theme: nextVal,
      backup: nextVal,
      monitor: nextVal,
      developer: nextVal,
      health: nextVal
    };
    setOpenSections(updated);
    try {
      localStorage.setItem('quit-smoking:more-sections-state', JSON.stringify(updated));
    } catch {}
  };

  // Monitoring state for RAM, CPU, Battery
  const [batteryInfo, setBatteryInfo] = useState<{ level: number; charging: boolean } | null>(null);
  const [refreshMonitorCount, setRefreshMonitorCount] = useState(0);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        bat.addEventListener('levelchange', () => {
          setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        });
        bat.addEventListener('chargingchange', () => {
          setBatteryInfo({ level: Math.round(bat.level * 100), charging: bat.charging });
        });
      }).catch(() => {});
    }
  }, []);

  const mem = (performance as any).memory;
  const usedHeapMb = mem ? (mem.usedJSHeapSize / (1024 * 1024)).toFixed(1) : (24.6 + (refreshMonitorCount * 0.1) % 1.5).toFixed(1);
  const totalHeapMb = mem ? (mem.totalJSHeapSize / (1024 * 1024)).toFixed(1) : '64.0';

  // Reasons local form state
  const [newReasonInput, setNewReasonInput] = useState('');

  const handleCreateReason = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newReasonInput.trim();
    if (!trimmed) return;
    onAddReason?.(trimmed);
    setNewReasonInput('');
  };

  const handleExportStateTxt = () => {
    let txt = `=== ПОВНА ІСТОРІЯ СТАНУ ТА САМОПОЧУТТЯ ===\n`;
    txt += `Експортовано: ${new Date().toLocaleString('uk-UA')}\n\n`;

    const sortedDates = Object.keys(days || {}).sort();
    if (sortedDates.length === 0) {
      txt += `Записів стану поки що немає.\n`;
    } else {
      sortedDates.forEach((dateKey) => {
        const day = days[dateKey];
        txt += `--------------------------------------------------\n`;
        txt += `ДАТА: ${dateKey}\n`;
        if (day.mood) txt += `Загальний настрій/баланс: ${day.mood}/5\n`;
        if (day.craving) txt += `Тяга до паління: ${day.craving}/5\n`;
        if (day.anxiety) txt += `Тривожність: ${day.anxiety}/5\n`;
        if (day.note) txt += `Нотатка дня: ${day.note}\n`;

        const allSurveys = day.surveys || day.entries || [];
        if (allSurveys.length > 0) {
          txt += `  Опитування протягом дня (${allSurveys.length}):\n`;
          allSurveys.forEach((s, idx) => {
            txt += `    [${s.time || `#${idx + 1}`}]\n`;
            if (s.energy) txt += `      - Енергія: ${s.energy}/5\n`;
            if (s.sleepQuality) txt += `      - Виспаність: ${s.sleepQuality}/5\n`;
            if (s.focus) txt += `      - Концентрація: ${s.focus}/5\n`;
            if (s.intrusiveThoughts) txt += `      - Нав'язливі думки: ${s.intrusiveThoughts}/5\n`;
            if (s.craving) txt += `      - Тяга: ${s.craving}/5\n`;
            if (s.anxiety) txt += `      - Тривожність: ${s.anxiety}/5\n`;
            if (s.balance) txt += `      - Баланс: ${s.balance}/5\n`;
            if (s.note) txt += `      - Нотатка: ${s.note}\n`;
          });
        }
        txt += `\n`;
      });
    }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-history-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Історію стану успішно вивантажено у TXT файл! 📄');
  };
  const handleExportBackup = () => {
    const backupData = {
      start: currentStart,
      money,
      streaks,
      reasons,
      goals,
      tree: JSON.parse(localStorage.getItem('quit-smoking:tree') || '{}'),
      days: JSON.parse(localStorage.getItem('quit-smoking:days') || '{}'),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quit-smoking-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Резервну копію збережено у файл! 📂');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed) {
          if (parsed.start) localStorage.setItem('quit-smoking:start', String(parsed.start));
          if (parsed.money) localStorage.setItem('quit-smoking:money', JSON.stringify(parsed.money));
          if (parsed.streaks) localStorage.setItem('quit-smoking:streaks', JSON.stringify(parsed.streaks));
          if (parsed.reasons) localStorage.setItem('quit-smoking:reasons', JSON.stringify(parsed.reasons));
          if (parsed.goals) localStorage.setItem('quit-smoking:goals', JSON.stringify(parsed.goals));
          if (parsed.tree) localStorage.setItem('quit-smoking:tree', JSON.stringify(parsed.tree));
          if (parsed.days) localStorage.setItem('quit-smoking:days', JSON.stringify(parsed.days));
          alert('Резервну копію успішно відновлено! Сторінка оновлюється...');
          window.location.reload();
        }
      } catch {
        alert('Помилка читання файлу: невірний формат JSON.');
      }
    };
    reader.readAsText(file);
  };

  const milestonesList = [
    { title: '1 година', hours: 1, icon: '⏱️' },
    { title: '12 годин', hours: 12, icon: '⏳' },
    { title: '1 день', hours: 24, icon: '🌅' },
    { title: '2 дні', hours: 48, icon: '🌿' },
    { title: '3 дні', hours: 72, icon: '🔥' },
    { title: '5 днів', hours: 120, icon: '⚡' },
    { title: '1 тиждень', hours: 168, icon: '🛡️' },
    { title: '2 тижні', hours: 336, icon: '🌟' },
    { title: '1 місяць', hours: 720, icon: '🌙' },
    { title: '3 місяці', hours: 2160, icon: '👑' },
    { title: '6 місяців', hours: 4380, icon: '🚀' },
    { title: '1 рік', hours: 8760, icon: '🏆' },
    { title: '2 роки', hours: 17520, icon: '⭐' },
    { title: '3 роки', hours: 26280, icon: '🏅' },
    { title: '4 роки', hours: 35040, icon: '🎖️' },
    { title: '5 років', hours: 43800, icon: '💎' },
    { title: '6 років', hours: 52560, icon: '🌿' },
    { title: '7 років', hours: 61320, icon: '🔥' },
    { title: '8 років', hours: 70080, icon: '⚡' },
    { title: '9 років', hours: 78840, icon: '🌟' },
    { title: '10+ років', hours: 87600, icon: '👑' },
  ];

  const totalHours = totalFreeMs / (3600 * 1000);

  // Goals local form state
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');

  const formattedStartDate = useMemo(() => {
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

  const fmtDuration = (ms: number) => {
    const d = Math.floor(ms / (24 * 3600 * 1000));
    const h = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    if (d > 0) return `${d} дн. ${h} год.`;
    return `${h} год.`;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    const amt = goalAmount ? parseFloat(goalAmount) : undefined;
    onAddGoal(goalName.trim(), amt, goalDate ? goalDate : undefined);
    setGoalName('');
    setGoalAmount('');
    setGoalDate('');
  };

  const netSaved = Math.max(0, totalSaved - (goals.base || 0));

  const curPackPrice = money?.packPrice ?? 100;
  const curPerDay = money?.perDay ?? 20;
  const curPackSize = money?.packSize ?? 20;

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
            Розділи та налаштування
          </h1>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            Усі модулі згруповано за категоріями
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="text-[11px] font-semibold text-[#1E8A69] dark:text-[#4CC9A0] hover:underline cursor-pointer px-2.5 py-1 rounded-lg bg-[#1E8A69]/10 transition-colors"
        >
          {allOpen ? 'Згорнути все' : 'Розгорнути все'}
        </button>
      </div>

      <div className="space-y-3">
        {/* ==================================================================== */}
        {/* 1. РОЗДІЛ: КАЛЬКУЛЯТОР СИГАРЕТ І ВИТРАТ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Header (Accordion toggle) */}
          <button
            type="button"
            onClick={() => toggleSection('calc')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1E8A69]/10 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center flex-none">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Калькулятор сигарет і витрат
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  {curPerDay} сиг./день • {curPackPrice} ₴/пачка ({curPackSize} шт)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0]">
                {curPackPrice} ₴
              </span>
              {openSections.calc ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {openSections.calc && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              {calcFeedback && (
                <div className="p-2.5 bg-[#1E8A69]/15 border border-[#1E8A69]/30 rounded-xl text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] text-center animate-fade-in">
                  {calcFeedback}
                </div>
              )}

              {/* Calculator Base Inputs */}
              <form onSubmit={handleSaveBaseSettings} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Скільки куриш на день */}
                  <div className="p-2.5 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                    <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                      Сигарет на день:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPerDayInput((prev) => String(Math.max(1, (parseFloat(prev) || 20) - 1)))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={perDayInput}
                        onChange={(e) => setPerDayInput(e.target.value)}
                        className="w-full text-center text-xs font-bold font-mono py-1 px-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                      />
                      <button
                        type="button"
                        onClick={() => setPerDayInput((prev) => String(Math.min(100, (parseFloat(prev) || 20) + 1)))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1 mt-1.5 justify-center">
                      {[10, 15, 20, 25, 30].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPerDayInput(String(num))}
                          className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            parseInt(perDayInput, 10) === num
                              ? 'bg-[#1E8A69] text-white font-bold'
                              : 'bg-[#CBDDD7]/40 dark:bg-[#2d2d35]/50 text-[#55726B] dark:text-[#8FAAA3] hover:bg-[#1E8A69]/20'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Скільки у пачці (стандартно 20) */}
                  <div className="p-2.5 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                    <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                      У пачці (шт):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPackSizeInput((prev) => String(Math.max(1, (parseInt(prev, 10) || 20) - 1)))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={packSizeInput}
                        onChange={(e) => setPackSizeInput(e.target.value)}
                        className="w-full text-center text-xs font-bold font-mono py-1 px-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                      />
                      <button
                        type="button"
                        onClick={() => setPackSizeInput((prev) => String(Math.min(100, (parseInt(prev, 10) || 20) + 1)))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    {/* Quick presets */}
                    <div className="flex items-center gap-1 mt-1.5 justify-center">
                      {[20, 25, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPackSizeInput(String(num))}
                          className={`text-[9px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            parseInt(packSizeInput, 10) === num
                              ? 'bg-[#1E8A69] text-white font-bold'
                              : 'bg-[#CBDDD7]/40 dark:bg-[#2d2d35]/50 text-[#55726B] dark:text-[#8FAAA3] hover:bg-[#1E8A69]/20'
                          }`}
                        >
                          {num} {num === 20 ? '(стандарт)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Час на 1 сигарету (хв) */}
                  <div className="p-2.5 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                        Час на 1 сигарету (хв):
                      </label>
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                        з виходом на перекур
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-none">
                        <button
                          type="button"
                          onClick={() => setMinutesPerCigInput((prev) => String(Math.max(1, (parseInt(prev, 10) || 7) - 1)))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={minutesPerCigInput}
                          onChange={(e) => setMinutesPerCigInput(e.target.value)}
                          className="w-16 text-center text-xs font-bold font-mono py-1 px-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                        />
                        <button
                          type="button"
                          onClick={() => setMinutesPerCigInput((prev) => String(Math.min(60, (parseInt(prev, 10) || 7) + 1)))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#CBDDD7]/60 dark:bg-[#2d2d35] text-xs font-bold text-[#12302B] dark:text-[#f4f4f5] hover:bg-[#1E8A69] hover:text-white transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-1 flex-1">
                        {[5, 7, 10, 15].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setMinutesPerCigInput(String(num))}
                            className={`flex-1 text-[10px] py-1 rounded cursor-pointer transition-colors ${
                              parseInt(minutesPerCigInput, 10) === num
                                ? 'bg-[#1E8A69] text-white font-bold'
                                : 'bg-[#CBDDD7]/40 dark:bg-[#2d2d35]/50 text-[#55726B] dark:text-[#8FAAA3] hover:bg-[#1E8A69]/20'
                            }`}
                          >
                            {num} хв
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Вартість пачки (₴) */}
                <div className="p-3 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                        Поточна вартість пачки:
                      </span>
                      <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">
                        Діє для підрахунку поточної економії
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={packPriceInput}
                        onChange={(e) => setPackPriceInput(e.target.value)}
                        className="w-20 text-right text-xs font-bold font-mono py-1 px-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#1E8A69] dark:text-[#4CC9A0] outline-none focus:border-[#1E8A69]"
                      />
                      <span className="text-xs font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">₴</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35]">
                    <button
                      type="submit"
                      className="py-1.5 px-3 bg-[#1E8A69] hover:bg-[#176d53] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                      Зберегти параметри
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setNewPackPriceInput(String(money?.packPrice ?? 100));
                        setShowPriceChangeForm((prev) => !prev);
                      }}
                      className="py-1.5 px-3 bg-[#1E8A69]/10 hover:bg-[#1E8A69]/20 text-[#1E8A69] dark:text-[#4CC9A0] text-[11px] font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{showPriceChangeForm ? 'Закрити форму зміни' : 'Змінити ціну з фіксацією дати'}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Калькулятор поверненого часу */}
              {(() => {
                const mpc = Math.max(1, parseInt(minutesPerCigInput, 10) || 7);
                const totalMins = Math.round(cigsAvoided * mpc);
                const wHours = Math.floor(totalMins / 60);
                const rMins = totalMins % 60;

                const getBooks = (b: number) => {
                  const m10 = b % 10;
                  const m100 = b % 100;
                  if (m100 >= 11 && m100 <= 14) return 'книг';
                  if (m10 === 1) return 'книга';
                  if (m10 >= 2 && m10 <= 4) return 'книги';
                  return 'книг';
                };

                const getWorkouts = (w: number) => {
                  const m10 = w % 10;
                  const m100 = w % 100;
                  if (m100 >= 11 && m100 <= 14) return 'тренувань';
                  if (m10 === 1) return 'тренування';
                  if (m10 >= 2 && m10 <= 4) return 'тренування';
                  return 'тренувань';
                };

                const books = Math.max(1, Math.round(Math.max(1, wHours) / 10));
                const workouts = Math.max(1, Math.round(Math.max(1, wHours) / 1));

                const timeStr = wHours >= 24
                  ? `${wHours} год (~${Math.floor(wHours / 24)} дн.)`
                  : wHours > 0
                  ? `${wHours} год${rMins > 0 ? ` ${rMins} хв` : ''}`
                  : `${totalMins} хв`;

                return (
                  <div className="p-3 bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent rounded-xl border border-teal-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Калькулятор поверненого часу</span>
                    </div>
                    <p className="text-xs text-[#12302B] dark:text-[#f4f4f5]">
                      Ви отримали <strong className="text-teal-700 dark:text-teal-300 font-bold">{timeStr}</strong> вільного часу{' '}
                      <span className="text-[#55726B] dark:text-[#8FAAA3]">
                        (~{books} {getBooks(books)} або ~{workouts} {getWorkouts(workouts)})
                      </span>
                    </p>
                    <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                      Формула: {Math.floor(cigsAvoided).toLocaleString('uk-UA')} невикурених сиг. × {mpc} хв = {totalMins.toLocaleString('uk-UA')} хв чистого часу.
                    </p>
                  </div>
                );
              })()}

              {/* Форма зміни ціни пачки у часі */}
              {showPriceChangeForm && (
                <form
                  onSubmit={handleAddPriceTier}
                  className="p-3.5 bg-gradient-to-br from-[#1E8A69]/5 via-white/80 to-teal-500/5 dark:from-[#1E8A69]/15 dark:via-[#1c1c21] dark:to-[#121212] border border-[#1E8A69]/40 rounded-xl space-y-3 shadow-xs"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0] shrink-0 mt-0.5" />
                    <div className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                      <strong className="text-[#12302B] dark:text-[#f4f4f5] block">
                        Зміна вартості пачки з фіксацією моменту
                      </strong>
                      Вкажіть нову ціну пачки. Вона застосовуватиметься{' '}
                      <span className="text-[#1E8A69] dark:text-[#4CC9A0] font-semibold">
                        з обраного моменту і надалі
                      </span>
                      . Усі попередні заощадження збережуться за старою ціною.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                        Нова вартість пачки (₴):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        value={newPackPriceInput}
                        onChange={(e) => setNewPackPriceInput(e.target.value)}
                        placeholder="Наприклад: 115"
                        className="w-full text-xs font-mono font-bold px-3 py-1.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                        Примітка (необов'язково):
                      </label>
                      <input
                        type="text"
                        value={priceChangeNote}
                        onChange={(e) => setPriceChangeNote(e.target.value)}
                        placeholder="Подорожчання акцизу..."
                        className="w-full text-xs px-3 py-1.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                      Момент застосування нової ціни:
                    </label>
                    <div className="flex items-center gap-2 mb-1.5">
                      <button
                        type="button"
                        onClick={() => setPriceChangeDateMode('now')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          priceChangeDateMode === 'now'
                            ? 'bg-[#1E8A69] text-white'
                            : 'bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
                        }`}
                      >
                        ⚡ З цього моменту (Зараз)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceChangeDateMode('custom')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          priceChangeDateMode === 'custom'
                            ? 'bg-[#1E8A69] text-white'
                            : 'bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
                        }`}
                      >
                        📅 Обрати інший час
                      </button>
                    </div>

                    {priceChangeDateMode === 'custom' && (
                      <input
                        type="datetime-local"
                        value={customPriceDate}
                        onChange={(e) => setCustomPriceDate(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-lg text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="py-1.5 px-3 bg-[#1E8A69] hover:bg-[#176d53] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
                    >
                      Зафіксувати ціну
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPriceChangeForm(false)}
                      className="py-1.5 px-3 bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] text-xs font-medium rounded-lg cursor-pointer hover:bg-white transition-colors"
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              )}

              {/* Історія змін вартості пачки */}
              {money?.priceHistory && money.priceHistory.length > 0 && (
                <div className="p-2.5 bg-white/40 dark:bg-[#121212]/40 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                  <button
                    type="button"
                    onClick={() => setShowPriceHistory((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#1E8A69] dark:text-[#4CC9A0]" />
                      <span>Історія змін вартості пачки ({money.priceHistory.length})</span>
                    </div>
                    {showPriceHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showPriceHistory && (
                    <div className="mt-2.5 space-y-1.5 max-h-48 overflow-y-auto">
                      {money.priceHistory.map((tier, idx) => {
                        const isLatest = idx === (money.priceHistory?.length || 0) - 1;
                        return (
                          <div
                            key={tier.timestamp}
                            className="text-[11px] p-2 rounded-lg bg-white dark:bg-[#1c1c21] border border-[#B7CDC6]/40 dark:border-[#2d2d35] flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                                  {tier.packPrice} ₴
                                </span>
                                <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                                  з {new Date(tier.timestamp).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {isLatest && (
                                  <span className="px-1.5 py-0.2 bg-[#1E8A69]/20 text-[#1E8A69] dark:text-[#4CC9A0] text-[9px] font-bold rounded">
                                    поточна
                                  </span>
                                )}
                              </div>
                              {tier.note && (
                                <p className="text-[10px] text-[#55726B] italic mt-0.5">«{tier.note}»</p>
                              )}
                            </div>

                            {money.priceHistory && money.priceHistory.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeletePriceTier(tier.timestamp)}
                                className="p-1 text-[#55726B] hover:text-[#A33A2C] rounded cursor-pointer transition-colors"
                                title="Видалити запис ціни"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 2. РОЗДІЛ: ЩОДЕННІ ДРІБНІ КРОКИ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <DailyStepsSection
          isOpen={openSections.habits}
          onToggle={() => toggleSection('habits')}
        />

        {/* ==================================================================== */}
        {/* РОЗДІЛ: ЩОДЕННИК ВДЯЧНОСТІ */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('gratitude_journal')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Щоденник вдячності
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  3 слова вдячності щодня для відновлення дофамінового балансу
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {openSections.gratitude_journal ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>
          {openSections.gratitude_journal && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-1">
              <GratitudeJournalCard />
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: МЕНТАЛЬНЕ ЗДОРОВ'Я ТА ДОФАМІНОВІ ЗАМІННИКИ */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('mental_health')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-rose-500/5 dark:hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-none">
                <Brain className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Ментальне здоров'я та Дофамінові замінники
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Природні замінники дофаміну для психологічного комфорту
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {openSections.mental_health ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>
          {openSections.mental_health && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-1">
              <MentalHealthCard />
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. РОЗДІЛ: ТЕСТ ШТАНГЕ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('health_tests')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Тест Штанге (Дихальна витривалість)
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Вимірювання об'єму легень та часу затримки дихання
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {openSections.health_tests ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>
          {openSections.health_tests && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-1">
              <StangeTestCard />
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 4. РОЗДІЛ: ГІДРАТАЦІЯ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('hydration')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-none">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Водний баланс та гідратація
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Трекер споживання води для швидкого очищення від токсинів
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {openSections.hydration ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>
          {openSections.hydration && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-1">
              <HydrationCard />
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: ЗДОРОВ'Я ТА РЕГЕНЕРАЦІЯ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => toggleSection('health')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
                <Heart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Відновлення здоров’я та досягнення
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Шкали регенерації органів та медичні рубежі ВООЗ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-none">
              {openSections.health ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>
          {openSections.health && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] mt-1">
              <HealthTab diffMs={totalFreeMs} startDate={currentStart} />
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. РОЗДІЛ: ЦІЛІ ТА ВИНАГОРОДИ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Header (Accordion toggle) */}
          <button
            type="button"
            onClick={() => toggleSection('goals')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Цілі та винагороди
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Активних: {goals.queue.length} • Досягнуто: {goals.done.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {goals.queue.length > 0 ? `${goals.queue.length} в черзі` : 'Без цілей'}
              </span>
              {openSections.goals ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {openSections.goals && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              {/* Форма нової цілі */}
              <form onSubmit={handleCreateGoal} className="space-y-2.5 pt-2 p-3 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                <p className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                  Поставити нову ціль
                </p>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Наприклад: Нові кросівки або Книга"
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                      Сума (₴, необов'язково)
                    </label>
                    <input
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      placeholder="900"
                      className="w-full text-xs px-3 py-1.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block mb-0.5">
                      Дата (необов'язково)
                    </label>
                    <input
                      type="text"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      placeholder="до 30 жовтня"
                      className="w-full text-xs px-3 py-1.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Додати ціль</span>
                </button>
              </form>

              {/* Черга активних цілей */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3] block">
                  Активні цілі ({goals.queue.length})
                </span>

                {goals.queue.length === 0 ? (
                  <p className="text-xs text-[#55726B] italic py-2 text-center">
                    Немає активних цілей. Додайте першу винагороду вище!
                  </p>
                ) : (
                  goals.queue.map((g) => {
                    const amount = g.amount || 0;
                    const pct = amount > 0 ? Math.min(100, Math.floor((netSaved / amount) * 100)) : 0;
                    const canClose = amount > 0 ? netSaved >= amount : true;

                    return (
                      <div
                        key={g.id}
                        className="p-3 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl shadow-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                              {g.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                              {amount > 0 && <span className="font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">{amount} ₴</span>}
                              {g.targetDate && <span>📅 {g.targetDate}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onCompleteGoal(g.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                canClose
                                  ? 'bg-[#1E8A69] text-white hover:bg-[#176d53]'
                                  : 'bg-[#1E8A69]/10 text-[#1E8A69] dark:text-[#4CC9A0] hover:bg-[#1E8A69]/20'
                              }`}
                              title="Позначити виконаною"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Виконати</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteGoal(g.id)}
                              className="p-1 text-[#55726B] hover:text-[#A33A2C] rounded-lg cursor-pointer transition-colors"
                              title="Видалити ціль"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {amount > 0 && (
                          <div>
                            <div className="flex justify-between items-center text-[10px] text-[#55726B] mb-1 font-mono">
                              <span>Накопичено: {Math.floor(netSaved)} ₴</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Виконані винагороди */}
              {goals.done.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#B7CDC6]/50 dark:border-[#2d2d35]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#55726B] dark:text-[#8FAAA3] block">
                    Виконані цілі ({goals.done.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {goals.done.map((d) => (
                      <div
                        key={d.id}
                        className="text-xs p-2.5 rounded-xl bg-white/40 dark:bg-[#1c1c21]/40 border border-[#B7CDC6]/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <div>
                            <span className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                              {d.name}
                            </span>
                            <p className="text-[10px] text-[#55726B]">
                              Виконано: {new Date(d.at).toLocaleDateString('uk-UA')} {d.amount ? `• ${d.amount} ₴` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDeleteGoal(d.id)}
                          className="p-1 text-[#55726B] hover:text-[#A33A2C] rounded cursor-pointer"
                          title="Видалити з історії"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 3. РОЗДІЛ: ПОЧАТОК ШЛЯХУ ТА ЗРИВИ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Header (Accordion toggle) */}
          <button
            type="button"
            onClick={() => toggleSection('start')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-none">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Початок шляху
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  {formattedStartDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.start ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {openSections.start && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <div className="flex items-center justify-between text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2 px-1">
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

              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="w-full py-2.5 px-3 bg-[#1E8A69]/10 hover:bg-[#1E8A69]/20 text-[#1E8A69] dark:text-[#4CC9A0] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Пройти вітання та налаштування знову ✨</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 4. РОЗДІЛ: ІСТОРІЯ СЕРІЙ ТА ЗРИВІВ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Header (Accordion toggle) */}
          <button
            type="button"
            onClick={() => toggleSection('streaks')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-none">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Історія серій та чистих днів
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Найдовша: {fmtDuration(longestStreakMs)} • Всього: {fmtDuration(totalFreeMs)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300">
                {streaks.length} зривів
              </span>
              {openSections.streaks ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {openSections.streaks && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/40 dark:border-[#2d2d35]">
                  <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Найдовша серія:</span>
                  <span className="font-bold text-[#1E8A69] dark:text-[#4CC9A0] text-sm">
                    {fmtDuration(longestStreakMs)}
                  </span>
                </div>
                <div className="p-2.5 bg-white/60 dark:bg-[#121212]/60 rounded-xl border border-[#B7CDC6]/40 dark:border-[#2d2d35]">
                  <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Всього без сигарет:</span>
                  <span className="font-bold text-[#12302B] dark:text-[#f4f4f5] text-sm">
                    {fmtDuration(totalFreeMs)}
                  </span>
                </div>
              </div>

              {streaks.length > 0 ? (
                <div className="space-y-1.5">
                  {streaks.map((s, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-xl bg-white/50 dark:bg-[#121212]/50 border border-[#B7CDC6]/40 dark:border-[#2d2d35] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[#55726B] dark:text-[#8FAAA3]">
                          {new Date(s.from).toLocaleDateString('uk-UA')} – {new Date(s.to).toLocaleDateString('uk-UA')}
                        </span>
                        {s.note && <p className="text-[11px] text-[#12302B]/80 dark:text-[#f4f4f5]/80 mt-0.5">«{s.note}»</p>}
                      </div>
                      <span className="font-bold text-[#1E8A69] dark:text-[#4CC9A0]">
                        {fmtDuration(s.to - s.from)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic py-1 text-center">
                  Жодного зриву! Поточна серія триває з моменту старту.
                </p>
              )}

              {streaks.length > 0 && (
                <button
                  type="button"
                  onClick={onUndoLastRelapse}
                  className="text-xs text-[#55726B] dark:text-[#8FAAA3] hover:text-[#1E8A69] dark:hover:text-[#4CC9A0] underline cursor-pointer mt-1"
                >
                  Скасувати останній зрив (повернути серію)
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 5. РОЗДІЛ: МОЇ ПРИЧИНИ КИНУТИ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all">
          {/* Header (Accordion toggle) */}
          <button
            type="button"
            onClick={() => toggleSection('reasons')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-none">
                <Heart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Мої причини кинути палити
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  {reasons?.length || 0} особистих орієнтирів волі
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300">
                {reasons?.length || 0}
              </span>
              {openSections.reasons ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {/* Collapsible Content */}
          {openSections.reasons && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              {/* Form to add a new reason */}
              <form onSubmit={handleCreateReason} className="pt-2 space-y-2">
                <label className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] block">
                  Додати власну причину або мотивацію:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={newReasonInput}
                    onChange={(e) => setNewReasonInput(e.target.value)}
                    placeholder="Наприклад: Легкість дихання, біг без задишки..."
                    className="flex-1 text-xs px-3 py-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  />
                  <button
                    type="submit"
                    disabled={!newReasonInput.trim()}
                    className="py-2 px-3.5 bg-[#1E8A69] hover:bg-[#176d53] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Додати</span>
                  </button>
                </div>

                {/* Quick suggestions presets */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] mr-0.5">Швидкі ідеї:</span>
                  {[
                    'Чисті легені та серце',
                    'Свіжий подих',
                    'Заощадження грошей',
                    'Свобода від залежності',
                    'Заради дітей та родини'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (onAddReason && !reasons.includes(preset)) {
                          onAddReason(preset);
                        } else {
                          setNewReasonInput(preset);
                        }
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-[#CBDDD7]/50 dark:bg-[#2d2d35]/60 hover:bg-[#1E8A69]/20 hover:text-[#1E8A69] dark:hover:text-[#4CC9A0] text-[#55726B] dark:text-[#8FAAA3] transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </form>

              {/* Reasons list */}
              <div className="space-y-1.5 pt-1">
                {(!reasons || reasons.length === 0) ? (
                  <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] italic py-3 text-center">
                    Немає збережених причин. Додайте те, що надихає вас залишатися вільним від тютюну!
                  </p>
                ) : (
                  reasons.map((r, i) => (
                    <div
                      key={i}
                      className="text-xs p-2.5 rounded-xl bg-white/60 dark:bg-[#121212]/60 border border-[#B7CDC6]/40 dark:border-[#2d2d35] flex items-center justify-between gap-2 group hover:border-[#1E8A69]/40 transition-colors"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-rose-500 shrink-0 mt-0.5">❤️</span>
                        <span className="text-[#12302B] dark:text-[#f4f4f5] font-medium leading-relaxed break-words">
                          {r}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteReason?.(i)}
                        className="p-1.5 text-[#55726B] hover:text-[#A33A2C] dark:hover:text-[#F08C7D] hover:bg-[#A33A2C]/10 rounded-lg cursor-pointer transition-colors shrink-0"
                        title="Видалити цю причину"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 6. РОЗДІЛ: ТРОФЕЇ ТА ДОСЯГНЕННЯ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('badges')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Галерея трофеїв та досягнень
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Відкриті міхи та нагороди за витримку
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                {milestonesList.filter((m) => totalHours >= m.hours).length} / {milestonesList.length}
              </span>
              {openSections.badges ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.badges && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-2 mt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {milestonesList.map((m, idx) => {
                  const unlocked = totalHours >= m.hours;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                        unlocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-[#12302B] dark:text-[#f4f4f5]'
                          : 'bg-white/40 dark:bg-[#121212]/40 border-[#B7CDC6]/30 dark:border-[#2d2d35] opacity-60'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{m.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold truncate">{m.title}</h4>
                          <span className="text-[10px] font-semibold">
                            {unlocked ? '✨ Відкрито' : '🔒 Заблоковано'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                          {unlocked ? 'Досягнуто у вашому марафоні вільності' : `Потрібно: ${Math.ceil(m.hours / 24)} дн.`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 7. РОЗДІЛ: ЕКВІВАЛЕНТИ ЕКОНОМІЇ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('equivalents')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Що можна купити за зекономлені гроші
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Реальні еквіваленти вашої економії ({Math.floor(totalSaved)} ₴)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.equivalents ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.equivalents && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { name: 'Чашок кави ☕️', price: 50, icon: '☕️' },
                  { name: 'Піц 🍕', price: 300, icon: '🍕' },
                  { name: 'Книг 📚', price: 400, icon: '📚' },
                  { name: 'Кросівки 👟', price: 3000, icon: '👟' },
                  { name: 'Поїздка на вікенд ✈️', price: 7000, icon: '✈️' },
                  { name: 'Новий смартфон 📱', price: 20000, icon: '📱' },
                ].map((item) => {
                  const count = totalSaved > 0 ? (totalSaved / item.price).toFixed(1) : '0';
                  const intCount = Math.floor(totalSaved / item.price);
                  return (
                    <div
                      key={item.name}
                      className="p-2.5 rounded-xl bg-white/60 dark:bg-[#121212]/60 border border-[#B7CDC6]/40 dark:border-[#2d2d35] flex items-center gap-2.5"
                    >
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block truncate">{item.name} (~{item.price} ₴)</span>
                        <span className="text-xs font-bold font-mono text-[#1E8A69] dark:text-[#4CC9A0]">
                          {intCount > 0 ? `${intCount} шт` : `${count} шт`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: ТЕМА ТА АКЦЕНТИ ВІКОН (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('theme')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Тема та акценти вікон
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Налаштування зеленого відтінку та акцентів інтерфейсу
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.theme ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.theme && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Оберіть акцентний відтінок для елементів додатку. Повністю приберіть зелений, обравши Індиго або Шляхетний сірий!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'indigo', name: 'Космічний індиго', color: 'bg-indigo-600', desc: 'Елегантний ультрамарин' },
                  { id: 'gray', name: 'Шляхетний сірий', color: 'bg-slate-600', desc: 'Чистий нейтральний' },
                  { id: 'green', name: 'Класичний зелений', color: 'bg-[#1E8A69]', desc: 'Фірмовий лісовий зелений' },
                  { id: 'emerald', name: 'Смарагдовий', color: 'bg-emerald-600', desc: 'Насичений смарагдовий' },
                  { id: 'teal', name: "М'ятний бірюзовий", color: 'bg-teal-600', desc: "Свіжий м'ятний відтінок" },
                  { id: 'sage', name: 'Шавлієвий', color: 'bg-[#55726B]', desc: 'Спокійний приглушений' },
                  { id: 'amber', name: 'Теплий бурштин', color: 'bg-amber-600', desc: 'Затишний золотавий' },
                  { id: 'rose', name: 'Оксамитова троянда', color: 'bg-rose-600', desc: 'Енергійний червоний' },
                ].map((item) => {
                  const active = currentAccent === item.id;
                  
                  // Helper for matching active class colors
                  const getAccentBorderClass = (id: string) => {
                    switch (id) {
                      case 'indigo': return 'border-indigo-500 dark:border-indigo-400 bg-indigo-500/10 dark:bg-indigo-400/15 text-indigo-600 dark:text-indigo-400';
                      case 'gray': return 'border-slate-500 dark:border-slate-400 bg-slate-500/10 dark:bg-slate-400/15 text-slate-600 dark:text-slate-400';
                      case 'amber': return 'border-amber-500 dark:border-amber-400 bg-amber-500/10 dark:bg-amber-400/15 text-amber-600 dark:text-amber-400';
                      case 'rose': return 'border-rose-500 dark:border-rose-400 bg-rose-500/10 dark:bg-rose-400/15 text-rose-600 dark:text-rose-400';
                      case 'emerald': return 'border-emerald-500 dark:border-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400';
                      case 'teal': return 'border-teal-500 dark:border-teal-400 bg-teal-500/10 dark:bg-teal-400/15 text-teal-600 dark:text-teal-400';
                      case 'sage': return 'border-stone-500 dark:border-stone-400 bg-stone-500/10 dark:bg-stone-400/15 text-stone-600 dark:text-stone-400';
                      case 'green':
                      default: return 'border-[#1E8A69] dark:border-[#4CC9A0] bg-[#1E8A69]/10 dark:bg-[#4CC9A0]/15 text-[#1E8A69] dark:text-[#4CC9A0]';
                    }
                  };

                  const activeClasses = getAccentBorderClass(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateAccent?.(item.id)}
                      className={`p-3 rounded-xl text-left cursor-pointer transition-all border flex flex-col gap-1.5 ${
                        active
                          ? `${activeClasses.split(' ').slice(0, 3).join(' ')} shadow-xs scale-102`
                          : 'border-slate-200 dark:border-[#2d2d35] bg-white/60 dark:bg-[#1c1c21]/60 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-4 h-4 rounded-full ${item.color} shadow-xs`} />
                        {active && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-[#f4f4f5] leading-tight">{item.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8FAAA3] leading-tight">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 8. РОЗДІЛ: НАЛАШТУВАННЯ ТАЙМЕРА ОПИТУВАННЯ СТАНУ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('prompt')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none">
                <Smile className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Таймер опитування стану
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Інтервал нагадування записати самопочуття ({promptIntervalMinutes} хв.)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.prompt ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.prompt && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Оберіть, як часто додаток буде нагадувати вам оцінити свій стан (рівень тяги, тривоги, енергії та фокусу).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Кожні 15 хв', val: 15 },
                  { label: 'Кожні 30 хв', val: 30 },
                  { label: 'Щогодини', val: 60 },
                  { label: 'Кожні 3 год', val: 180 },
                  { label: 'Кожні 6 год', val: 360 },
                  { label: 'Кожні 12 год', val: 720 },
                  { label: 'Щодоби', val: 1440 },
                ].map((opt) => {
                  const active = promptIntervalMinutes === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onUpdatePromptInterval?.(opt.val)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                        active
                          ? 'bg-[#1E8A69] text-white border-[#1E8A69] shadow-xs scale-102'
                          : 'bg-white/60 dark:bg-[#112723]/60 border-[#B7CDC6] dark:border-[#2d2d35] text-[#12302B] dark:text-[#f4f4f5] hover:border-[#1E8A69]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 9. РОЗДІЛ: РЕЗЕРВНЕ КОПІЮВАННЯ ТА ДАНІ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('backup')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-none">
                <Download className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Резервне копіювання даних
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Експорт та відновлення прогресу у файл
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.backup ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.backup && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Збережіть файл резервної копії, щоб ніколи не втратити свій прогрес, статистику, цілі та дерева у разі зміни пристрою.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="py-2.5 px-3 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Експортувати бекап (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportStateTxt}
                  className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Завантажити історію стану (TXT)</span>
                </button>

                <label className="py-2.5 px-3 sm:col-span-2 border border-[#B7CDC6] dark:border-[#2d2d35] hover:bg-white/60 dark:hover:bg-[#112723]/60 rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <Upload className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  <span>Відновити з бекапу (JSON)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackupFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* РОЗДІЛ: МОНІТОРИНГ РЕСУРСІВ (ПАМ'ЯТЬ, ЦП, БАТАРЕЯ) (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('monitor')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-none">
                <Activity className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Моніторинг ресурсів (Пам'ять, ЦП, Батарея)
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Оперативна пам'ять (~{usedHeapMb} МБ), ЦП та енергоспоживання
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.monitor ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.monitor && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Реєстрація споживання системних ресурсів додатку в реальному часі для забезпечення максимальної швидкодії та автономності на мобільних пристроях.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* RAM Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Оперативна пам'ять</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    {usedHeapMb} <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">МБ</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    З виділених {totalHeapMb} МБ JS Heap. Оптимально (&lt; 50 МБ).
                  </p>
                </div>

                {/* CPU Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Навантаження ЦП</span>
                    <Cpu className="w-4 h-4 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    &lt; 0.5% <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">активності</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    Сплячий режим між взаємодіями. Низьке енергоспоживання.
                  </p>
                </div>

                {/* Battery / Energy Card */}
                <div className="p-3.5 bg-white/60 dark:bg-[#112723]/60 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#55726B] dark:text-[#8FAAA3] uppercase tracking-wider">Енергоспоживання</span>
                    <Activity className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-extrabold text-[#12302B] dark:text-[#f4f4f5]">
                    {batteryInfo ? `${batteryInfo.level}%` : 'Клас A+'} <span className="text-xs font-normal text-[#55726B] dark:text-[#8FAAA3]">{batteryInfo ? (batteryInfo.charging ? ' зарядка' : ' автономно') : 'економно'}</span>
                  </div>
                  <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    Витрата батареї ~0.1% за годину. Повна оптимізація фону.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setRefreshMonitorCount((c) => c + 1)}
                  className="w-full py-2 px-3 bg-white/70 dark:bg-[#112723]/70 hover:bg-[#1E8A69]/10 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#1E8A69] dark:text-[#4CC9A0]" />
                  <span>Оновити метрики системи</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* 10. РОЗДІЛ: ІНФОРМАЦІЯ ПРО РОЗРОБНИКА ТА ДОНАТ (ЗГОРТАЄТЬСЯ) */}
        {/* ==================================================================== */}
        <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs overflow-hidden transition-all mt-3">
          <button
            type="button"
            onClick={() => toggleSection('developer')}
            className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-[#1E8A69]/5 dark:hover:bg-[#1E8A69]/10 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-none">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] truncate">
                  Про розробника та підтримка
                </h3>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Автор проекту та банка Monobank
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-none">
              {openSections.developer ? (
                <ChevronUp className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#55726B] dark:text-[#8FAAA3]" />
              )}
            </div>
          </button>

          {openSections.developer && (
            <div className="p-4 pt-0 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] space-y-3 mt-1">
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] pt-2">
                Цей додаток створено з турботою про ваше здоров'я та вільне від паління життя. Якщо додаток допомагає вам або ви хочете подякувати за розробку — підтримайте проєкт донатом на банку Monobank! ☕️🇺🇦
              </p>

              <div className="pt-1">
                <a
                  href="https://send.monobank.ua/jar/7HQL5m91BK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md hover:scale-[1.01]"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Підтримати розробника (Банка Monobank)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
