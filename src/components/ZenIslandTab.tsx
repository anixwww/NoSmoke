import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZenIslandState, TabType } from '../types';
import {
  ZEN_EVENTS,
  ZenEventType,
  zenSound
} from '../data/zenStonesData';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface ZenIslandTabProps {
  cigsAvoided: number;
  zenState: ZenIslandState;
  onUpdateZenState: (updater: (prev: ZenIslandState) => ZenIslandState) => void;
  onSwitchTab: (tab: TabType) => void;
}

export const ZenIslandTab: React.FC<ZenIslandTabProps> = ({
  zenState,
  onUpdateZenState,
  onSwitchTab
}) => {
  // Current active mindful event
  const [activeEvent, setActiveEvent] = useState<ZenEventType | null>(null);
  const [isResonating, setIsResonating] = useState<boolean>(false);
  const [touchFeedback, setTouchFeedback] = useState<boolean>(false);

  const soundEnabled = zenState.soundEnabled ?? true;
  const totalSounds = zenState.totalSounds || 0;
  const heardInTime = zenState.heardInTime || 0;
  const mindfulnessPercent = totalSounds > 0 ? Math.round((heardInTime / totalSounds) * 100) : 100;

  // Timers
  const nextEventTimerRef = useRef<number | null>(null);
  const eventExpireTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (nextEventTimerRef.current) clearTimeout(nextEventTimerRef.current);
    if (eventExpireTimerRef.current) clearTimeout(eventExpireTimerRef.current);
  }, []);

  // Schedule next mindful event (slow, unhurried, meditative 4.5 to 8.5 seconds)
  const scheduleNextEvent = useCallback(() => {
    clearTimers();
    setActiveEvent(null);
    setIsResonating(false);

    const delay = Math.floor(Math.random() * 4000) + 4500;

    nextEventTimerRef.current = window.setTimeout(() => {
      const events: ZenEventType[] = ['resonance', 'ripple', 'breath'];
      const chosen = events[Math.floor(Math.random() * events.length)];
      const config = ZEN_EVENTS[chosen];

      setActiveEvent(chosen);
      setIsResonating(true);

      // Increment total count
      onUpdateZenState((prev) => ({
        ...prev,
        totalSounds: (prev.totalSounds || 0) + 1
      }));

      // Play soft meditative whisper sound cue
      if (soundEnabled) {
        zenSound.playCueBell(chosen);
      }

      // Event expiration if not touched
      eventExpireTimerRef.current = window.setTimeout(() => {
        setActiveEvent(null);
        setIsResonating(false);
        scheduleNextEvent();
      }, config.reactionTimeMs);
    }, delay);
  }, [clearTimers, onUpdateZenState, soundEnabled]);

  // Start meditative cycle
  useEffect(() => {
    scheduleNextEvent();
    return () => clearTimers();
  }, [scheduleNextEvent, clearTimers]);

  // Handle touching the stone
  const handleTouchStone = useCallback(() => {
    zenSound.init();

    // Visual ripple feedback on the stone
    setTouchFeedback(true);
    setTimeout(() => setTouchFeedback(false), 800);

    // Subtle haptic pulse
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(18);
      } catch {}
    }

    if (activeEvent) {
      // Mindfully caught in time!
      clearTimers();
      setActiveEvent(null);
      setIsResonating(false);

      if (soundEnabled) {
        zenSound.playBell();
      }

      onUpdateZenState((prev) => ({
        ...prev,
        heardInTime: (prev.heardInTime || 0) + 1,
        harmonyScore: (prev.harmonyScore || 0) + 1
      }));

      // Peaceful pause before next cycle (2 seconds of stillness)
      nextEventTimerRef.current = window.setTimeout(() => {
        scheduleNextEvent();
      }, 2000);
    } else {
      // Touched in quiet stillness (gentle, calming water drop)
      if (soundEnabled) {
        zenSound.playMutedBell();
      }
    }
  }, [activeEvent, clearTimers, onUpdateZenState, scheduleNextEvent, soundEnabled]);

  // Keyboard Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        handleTouchStone();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTouchStone]);

  const toggleSound = () => {
    zenSound.init();
    onUpdateZenState((prev) => ({
      ...prev,
      soundEnabled: !soundEnabled
    }));
  };

  const resetStats = () => {
    onUpdateZenState((prev) => ({
      ...prev,
      totalSounds: 0,
      heardInTime: 0
    }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] pb-8 select-none max-w-lg mx-auto w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          type="button"
          onClick={() => onSwitchTab('counter')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] hover:border-[#1E8A69] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Назад</span>
        </button>

        <div className="flex items-center gap-2">
          {(totalSounds > 0 || heardInTime > 0) && (
            <button
              type="button"
              onClick={resetStats}
              className="p-1.5 rounded-xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] hover:text-[#1E8A69] dark:hover:text-[#4CC9A0] transition-colors cursor-pointer"
              title="Скинути статистику"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-white/70 dark:bg-[#18181d]/80 border-[#B7CDC6] dark:border-[#2d2d35] text-[#8FAAA3]'
            }`}
            title={soundEnabled ? 'Звук увімкнено' : 'Звук вимкнено'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Zen Stone Sanctuary Card */}
      <div
        onClick={handleTouchStone}
        className={`relative w-full bg-gradient-to-b from-[#F2F7F5] via-[#E8F0ED] to-[#DFEBE6] dark:from-[#0D1412] dark:via-[#0F1916] dark:to-[#0A100E] border transition-all duration-700 rounded-3xl p-6 sm:p-7 shadow-xs cursor-pointer overflow-hidden ${
          isResonating
            ? 'border-emerald-500/50 dark:border-emerald-500/40 ring-1 ring-emerald-500/20'
            : 'border-[#B7CDC6] dark:border-[#1E2E28]'
        }`}
      >
        {/* Soft meditative background lighting / Still water glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-72 h-72 rounded-full transition-all duration-1000 ${
              isResonating
                ? 'bg-emerald-500/15 dark:bg-emerald-400/10 blur-3xl scale-110'
                : 'bg-teal-500/5 dark:bg-teal-400/5 blur-2xl scale-90'
            }`}
          />
        </div>

        {/* Status prompt */}
        <div className="relative z-10 text-center mb-1">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-500 ${
              isResonating
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 shadow-xs'
                : 'bg-white/60 dark:bg-white/5 text-[#55726B] dark:text-[#8FAAA3] border border-black/5 dark:border-white/5'
            }`}
          >
            <Sparkles
              className={`w-3 h-3 ${
                isResonating ? 'text-amber-500 dark:text-amber-300 animate-spin' : 'text-[#55726B] dark:text-[#8FAAA3]'
              }`}
              style={{ animationDuration: '6s' }}
            />
            <span>
              {isResonating
                ? 'Камінь резонує • Торкніться зараз'
                : 'Тиша і дихання... Слухайте простір'}
            </span>
          </div>
        </div>

        {/* Minimalist Zen Stone in Still Water SVG */}
        <div className="relative z-10 flex items-center justify-center my-3 h-64 sm:h-72">
          <svg
            viewBox="0 0 320 280"
            className="w-full h-full select-none"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Natural Stone Gradient - Smooth Basalt / River Stone */}
              <linearGradient id="zenStoneBasalt" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="45%" stopColor="#475569" />
                <stop offset="85%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>

              {/* Stone Warm Resonance Gradient */}
              <linearGradient id="zenStoneWarm" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#788896" />
                <stop offset="40%" stopColor="#5B6E75" />
                <stop offset="70%" stopColor="#3F5A56" />
                <stop offset="100%" stopColor="#253C38" />
              </linearGradient>

              {/* Inner Warm Heart / Core Glow */}
              <radialGradient id="innerGlow" cx="50%" cy="55%" r="45%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
                <stop offset="45%" stopColor="#34D399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>

              {/* Still Water Shadow & Depth */}
              <radialGradient id="waterDepth" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0F172A" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#0F172A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Still Water Rings (Ripples) */}
            <g transform="translate(160, 200)" opacity="0.75">
              {/* Ambient gentle ripples */}
              <ellipse
                cx="0"
                cy="0"
                rx="135"
                ry="24"
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                opacity="0.15"
                className="dark:opacity-20"
              />
              <ellipse
                cx="0"
                cy="0"
                rx="105"
                ry="19"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.2"
                opacity="0.25"
                className="dark:opacity-30"
              />
              <ellipse
                cx="0"
                cy="0"
                rx="75"
                ry="14"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="1.2"
                opacity="0.35"
                className="dark:opacity-40"
              />

              {/* Deep Water Foundation Shadow under Stone */}
              <ellipse cx="0" cy="0" rx="65" ry="13" fill="url(#waterDepth)" />

              {/* Active Resonance Concentric Pulse */}
              {isResonating && (
                <>
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="50"
                    ry="10"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2"
                    className="animate-zen-ripple-1"
                  />
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="50"
                    ry="10"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    className="animate-zen-ripple-2"
                  />
                </>
              )}

              {/* Touch Feedback Wave */}
              {touchFeedback && (
                <ellipse
                  cx="0"
                  cy="0"
                  rx="60"
                  ry="12"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  className="animate-ping"
                />
              )}
            </g>

            {/* The Central Pure Zen Stone */}
            <g transform="translate(160, 150)">
              <g className="animate-zen-stone">
                {/* Soft stone cast shadow onto water */}
                <ellipse cx="0" cy="50" rx="55" ry="12" fill="#0F172A" opacity="0.35" />

                {/* Stone Body: Sculptural, Organic, Minimalist River Stone */}
                <path
                  d="M-52,42 C-60,18 -48,-35 -18,-68 C-2,-86 18,-86 34,-68 C58,-32 64,15 54,42 C44,52 -42,52 -52,42 Z"
                  fill={isResonating ? 'url(#zenStoneWarm)' : 'url(#zenStoneBasalt)'}
                  stroke={isResonating ? '#34D399' : '#475569'}
                  strokeWidth={isResonating ? '1.5' : '1'}
                  className="transition-colors duration-700"
                />

                {/* Inner Sacred Resonance Glow (only shines during mindfulness event) */}
                {isResonating && (
                  <path
                    d="M-40,35 C-46,15 -36,-25 -12,-52 C-2,-65 12,-65 24,-52 C42,-25 48,12 40,35 Z"
                    fill="url(#innerGlow)"
                    className="animate-zen-glow"
                  />
                )}

                {/* Subtle Natural Stone Reflection Line (Soft Polished Sheen) */}
                <path
                  d="M-22,-62 C-8,-72 8,-72 20,-62 C38,-35 44,5 36,36"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity={isResonating ? '0.7' : '0.35'}
                  className="transition-opacity duration-700"
                />

                {/* Organic Mineral Vein (Gentle single line) */}
                <path
                  d="M-15,35 Q-5,0 8,-35"
                  fill="none"
                  stroke={isResonating ? '#FDE68A' : '#64748B'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  opacity={isResonating ? '0.85' : '0.25'}
                  className="transition-all duration-700"
                />
              </g>
            </g>

            {/* Water Reflection of the Stone */}
            <g transform="translate(160, 206) scale(1, -0.22)" opacity="0.2">
              <path
                d="M-52,42 C-60,18 -48,-35 -18,-68 C-2,-86 18,-86 34,-68 C58,-32 64,15 54,42 C44,52 -42,52 -52,42 Z"
                fill="#334155"
              />
            </g>
          </svg>
        </div>

        {/* Minimalist Calm Action Button */}
        <div className="relative z-10 flex flex-col items-center mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTouchStone();
            }}
            className={`w-full max-w-sm py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-500 cursor-pointer shadow-xs active:scale-[0.98] ${
              isResonating
                ? 'bg-[#1E8A69] text-white shadow-emerald-600/25 ring-2 ring-emerald-400/50'
                : 'bg-white/90 dark:bg-[#15201C] text-[#12302B] dark:text-[#f4f4f5] border border-[#B7CDC6] dark:border-[#243B33] hover:border-[#1E8A69]'
            }`}
          >
            <span className="text-base">🪨</span>
            <span>ТОРКНУТИСЯ КАМЕНЯ</span>
          </button>
        </div>
      </div>

      {/* The 3 Core Mindfulness Stats - Clean & Minimalist */}
      <div className="w-full grid grid-cols-3 gap-3 mt-4">
        {/* 1. Звуків загалом */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
            Звуків загалом
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#12302B] dark:text-[#f4f4f5] font-mono">
            {totalSounds}
          </div>
        </div>

        {/* 2. Вчасно почуто */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
            Вчасно почуто
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {heardInTime}
          </div>
        </div>

        {/* 3. Уважність */}
        <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#18181d]/80 border border-[#B7CDC6] dark:border-[#2d2d35] text-center shadow-2xs">
          <div className="text-[11px] font-semibold text-[#55726B] dark:text-[#8FAAA3] mb-1">
            Уважність
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0284C7] dark:text-[#38BDF8] font-mono">
            {mindfulnessPercent}%
          </div>
        </div>
      </div>
    </div>
  );
};
