import React from 'react';
import {
  Wind,
  Droplets,
  Waves,
  Eye,
  Snowflake,
  X,
  Check,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Flame,
  Brain
} from 'lucide-react';
import { DailyStepsSection } from './DailyStepsSection';

interface SosModalProps {
  reasons: string[];
  onClose: () => void;
  onCravingOver: () => void;
  onRelapse: () => void;
  onLaunchOrbit?: () => void;
}

type SosMode = 'menu' | 'fourD' | 'breath' | 'wave' | 'grounding' | 'cold' | 'steps';
type BreathTechnique = 'sigh' | 'box' | '478';

export const SosModal: React.FC<SosModalProps> = ({
  reasons,
  onClose,
  onCravingOver,
  onRelapse,
  onLaunchOrbit
}) => {
  const [mode, setMode] = React.useState<SosMode>('menu');

  // Breathing state
  const [breathTechnique, setBreathTechnique] = React.useState<BreathTechnique>('sigh');
  const [breathPhase, setBreathPhase] = React.useState<'Вдих 1' | 'Вдих 2' | 'Видих' | 'Вдих' | 'Затримка'>('Вдих 1');
  const [breathSecLeft, setBreathSecLeft] = React.useState(2);

  // Wave (Urge Surfing) state - 180 seconds total (3 minutes)
  const [waveSecLeft, setWaveSecLeft] = React.useState(180);
  const [waveRunning, setWaveRunning] = React.useState(false);

  // Grounding 5-4-3-2-1 active step
  const [groundingStep, setGroundingStep] = React.useState<number>(0);

  // Random reason reminder
  const randomReason = React.useMemo(() => {
    return reasons.length > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : null;
  }, [reasons]);

  // Breathing loop
  React.useEffect(() => {
    if (mode !== 'breath') return;

    let sec = breathTechnique === 'sigh' ? 2 : 4;
    let step = 0;

    const timer = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        if (breathTechnique === 'sigh') {
          // Physiological sigh: Inhale 1 (2s), Inhale 2 (1s), Long Exhale (5s)
          step = (step + 1) % 3;
          if (step === 0) {
            setBreathPhase('Вдих 1');
            sec = 2;
          } else if (step === 1) {
            setBreathPhase('Вдих 2');
            sec = 1;
          } else {
            setBreathPhase('Видих');
            sec = 5;
          }
        } else if (breathTechnique === 'box') {
          // 4-4-4-4
          step = (step + 1) % 4;
          if (step === 0) {
            setBreathPhase('Вдих');
            sec = 4;
          } else if (step === 1) {
            setBreathPhase('Затримка');
            sec = 4;
          } else if (step === 2) {
            setBreathPhase('Видих');
            sec = 4;
          } else {
            setBreathPhase('Затримка');
            sec = 4;
          }
        } else {
          // 4-7-8
          step = (step + 1) % 3;
          if (step === 0) {
            setBreathPhase('Вдих');
            sec = 4;
          } else if (step === 1) {
            setBreathPhase('Затримка');
            sec = 7;
          } else {
            setBreathPhase('Видих');
            sec = 8;
          }
        }
      }
      setBreathSecLeft(sec);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, breathTechnique]);

  // Urge wave timer
  React.useEffect(() => {
    if (mode !== 'wave' || !waveRunning) return;

    const timer = setInterval(() => {
      setWaveSecLeft((prev) => {
        if (prev <= 1) {
          setWaveRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, waveRunning]);

  return (
    <div className="fixed inset-0 z-50 bg-[#E9F1EE]/95 dark:bg-[#121212]/95 backdrop-blur-md flex flex-col p-4 sm:p-5 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full mb-3">
        <div className="flex items-center gap-2">
          {mode !== 'menu' && (
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="p-1.5 rounded-lg border border-[#B7CDC6] dark:border-[#2d2d35] text-[#55726B] hover:text-[#12302B] dark:hover:text-[#f4f4f5] cursor-pointer"
              title="До списку методик"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#12302B] dark:text-[#f4f4f5] flex items-center gap-1.5">
              <span>Швидка допомога SOS</span>
              <span className="text-sm">🛡️</span>
            </h2>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Тяга — це хвиля на 3–5 хв. Вона неминуче спаде.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-full hover:bg-white/50 text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-2">
        {/* 1. ГОЛОВНЕ МЕНЮ МЕТОДИК */}
        {mode === 'menu' && (
          <div className="space-y-2.5">
            {/* 1.1 Метод 4D */}
            <button
              type="button"
              onClick={() => setMode('fourD')}
              className="w-full p-3.5 bg-white/85 dark:bg-[#1c1c21]/85 border-2 border-emerald-500/40 hover:border-emerald-500 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl flex-none group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Золотий протокол 4D
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                    ВООЗ
                  </span>
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] truncate">
                  1. Відклади • 2. Подихай • 3. Вода • 4. Перемкнись
                </p>
              </div>
            </button>

            {/* 1.2 Дихальний антистрес */}
            <button
              type="button"
              onClick={() => {
                setBreathTechnique('sigh');
                setBreathPhase('Вдих 1');
                setBreathSecLeft(2);
                setMode('breath');
              }}
              className="w-full p-3.5 bg-white/85 dark:bg-[#1c1c21]/85 border-2 border-teal-500/40 hover:border-teal-500 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl flex-none group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Фізіологічне дихання
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold">
                    40 сек
                  </span>
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Зітхання Губермана, Квадрат 4-4-4-4 або 4-7-8
                </p>
              </div>
            </button>

            {/* 1.3 Серфінг на хвилі (Urge Surfing) */}
            <button
              type="button"
              onClick={() => {
                setWaveSecLeft(180);
                setWaveRunning(true);
                setMode('wave');
              }}
              className="w-full p-3.5 bg-white/85 dark:bg-[#1c1c21]/85 border-2 border-cyan-500/40 hover:border-cyan-500 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xl flex-none group-hover:scale-105 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Серфінг на хвилі (Urge Surfing)
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold">
                    3 хв
                  </span>
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Усвідомлене спостереження спаду дофамінової паніки
                </p>
              </div>
            </button>

            {/* 1.4 Заземлення 5-4-3-2-1 */}
            <button
              type="button"
              onClick={() => {
                setGroundingStep(0);
                setMode('grounding');
              }}
              className="w-full p-3.5 bg-white/85 dark:bg-[#1c1c21]/85 border-2 border-indigo-500/40 hover:border-indigo-500 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl flex-none group-hover:scale-105 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Заземлення 5-4-3-2-1
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
                    Увага
                  </span>
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Витягує мозок із пастки думок у фізичну реальність
                </p>
              </div>
            </button>

            {/* 1.5 Крижаний шок і рефлекс нирця */}
            <button
              type="button"
              onClick={() => setMode('cold')}
              className="w-full p-3.5 bg-white/85 dark:bg-[#1c1c21]/85 border-2 border-blue-500/40 hover:border-blue-500 rounded-2xl flex items-center gap-3 text-left cursor-pointer transition-all shadow-xs group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl flex-none group-hover:scale-105 transition-transform">
                <Snowflake className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                    Крижаний шок (Dive Reflex)
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold">
                    Шок
                  </span>
                </div>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] truncate">
                  Холодна вода на обличчя вмикає миттєве гальмування пульсу
                </p>
              </div>
            </button>


          </div>
        )}

        {/* 2. ПРОТОКОЛ 4D */}
        {mode === 'fourD' && (
          <div className="space-y-3 py-1">
            <div className="text-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Міжнародний алгоритм 4D
              </span>
              <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5]">
                4 кроки, які зупиняють імпульс
              </h3>
            </div>

            <div className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs flex-none">
                1D
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Delay (Відклади рішення на 3 хвилини)
                </h4>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                  Не забороняй собі назавжди, просто скажи: «Я вирішу через 3 хвилини». За цей час біохімічний пік тяги впаде сам.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs flex-none">
                2D
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Deep breath (Зроби глибокий видих)
                </h4>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                  Зроби 2 коротких вдихи носом і довгий, повільний видих через рот. Це вмикає парасимпатичну нервову систему.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs flex-none">
                3D
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Drink water (Випий крижаної води)
                </h4>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                  Повільно, маленькими ковтками, відчуваючи холод у стравоході. Рецептори рота витісняють потребу затяжки.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs flex-none">
                4D
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Distract (Перемкни фізичну дію)
                </h4>
                <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
                  Зміни локацію, вийди в іншу кімнату, зроби 10 присідань або вмий обличчя холодною водою.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. ДИХАЛЬНІ ВПРАВИ */}
        {mode === 'breath' && (
          <div className="text-center py-2">
            {/* Техніка перемикач */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#CBDDD7]/60 dark:bg-[#1D3832]/60 rounded-xl mb-5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  setBreathTechnique('sigh');
                  setBreathPhase('Вдих 1');
                  setBreathSecLeft(2);
                }}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  breathTechnique === 'sigh'
                    ? 'bg-white dark:bg-[#1c1c21] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs'
                    : 'text-[#55726B] dark:text-[#8FAAA3]'
                }`}
              >
                Зітхання
              </button>
              <button
                type="button"
                onClick={() => {
                  setBreathTechnique('box');
                  setBreathPhase('Вдих');
                  setBreathSecLeft(4);
                }}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  breathTechnique === 'box'
                    ? 'bg-white dark:bg-[#1c1c21] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs'
                    : 'text-[#55726B] dark:text-[#8FAAA3]'
                }`}
              >
                Квадрат
              </button>
              <button
                type="button"
                onClick={() => {
                  setBreathTechnique('478');
                  setBreathPhase('Вдих');
                  setBreathSecLeft(4);
                }}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  breathTechnique === '478'
                    ? 'bg-white dark:bg-[#1c1c21] text-[#1E8A69] dark:text-[#4CC9A0] shadow-xs'
                    : 'text-[#55726B] dark:text-[#8FAAA3]'
                }`}
              >
                4-7-8
              </button>
            </div>

            {/* Пульсуюче коло */}
            <div
              className={`w-44 h-44 rounded-full border-4 border-[#1E8A69] dark:border-[#4CC9A0] bg-[#1E8A69]/15 flex flex-col items-center justify-center mx-auto mb-4 shadow-inner transition-transform duration-700 ${
                breathPhase.includes('Вдих') ? 'scale-110' : breathPhase === 'Затримка' ? 'scale-105' : 'scale-90'
              }`}
            >
              <span className="text-lg font-bold text-[#1E8A69] dark:text-[#4CC9A0] mb-0.5">
                {breathPhase}
              </span>
              <span className="text-4xl font-black font-mono text-[#12302B] dark:text-[#f4f4f5]">
                {breathSecLeft}
              </span>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto mb-3">
              {breathTechnique === 'sigh'
                ? 'Фізіологічне зітхання: 2 вдихи носом (повні легені) → довгий, повільний видих ротом.'
                : breathTechnique === 'box'
                ? 'Квадрат: 4с вдих, 4с затримка, 4с видих, 4с затримка. Знижує пульс за 60 секунд.'
                : 'Техніка 4-7-8: вдих 4с, глибока затримка 7с, повний розслаблений видих 8с.'}
            </p>
          </div>
        )}

        {/* 4. СЕРФІНГ НА ХВИЛІ ТЯГИ (URGE SURFING) */}
        {mode === 'wave' && (
          <div className="text-center py-2">
            <div className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#CBDDD7" strokeWidth="6" opacity="0.4" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="6"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * (180 - waveSecLeft)) / 180}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {Math.floor(waveSecLeft / 60)}:{String(waveSecLeft % 60).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                  {waveSecLeft > 120 ? 'Пік хвилі' : waveSecLeft > 60 ? 'Хвиля спадає' : 'Берег спокою'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl max-w-sm mx-auto mb-4 text-left">
              <p className="text-xs text-[#12302B] dark:text-[#f4f4f5] leading-relaxed">
                {waveSecLeft > 120
                  ? '🌊 Зараз хвиля найвища. Не борися з нею — просто відчуй, де вона в тілі (у грудях, горлі, руках). Дихай крізь неї.'
                  : waveSecLeft > 60
                  ? '📉 Хвиля втрачає силу. Напруга в м’язах спадає. Твій мозок починає розуміти, що небезпеки немає.'
                  : '✨ Штиль. Ти переміг пік імпульсу без сигарети. Кожна така хвиля робить рецептори слабшими.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setWaveRunning(!waveRunning)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              {waveRunning ? 'Пауза' : 'Продовжити відлік'}
            </button>
          </div>
        )}

        {/* 5. ТЕХНІКА ЗАЗЕМЛЕННЯ 5-4-3-2-1 */}
        {mode === 'grounding' && (() => {
          const steps = [
            {
              count: '5',
              title: 'Знайди 5 речей навколо, які ти бачиш',
              desc: 'Подивись навколо і подумки назви їх: годинник, тінь на стіні, текстура столу, вікно, черевик.',
              color: 'text-indigo-600 dark:text-indigo-400',
              icon: '👀'
            },
            {
              count: '4',
              title: 'Торкнися 4 різних речей фізично',
              desc: 'Відчуй тканину штанів, холод скла телефону, поверхню крісла, край столу.',
              color: 'text-teal-600 dark:text-teal-400',
              icon: '✋'
            },
            {
              count: '3',
              title: 'Почуй 3 звуки прямо зараз',
              desc: 'Шум транспорту за вікном, гудіння комп’ютера, власне дихання чи кроки.',
              color: 'text-amber-600 dark:text-amber-400',
              icon: '👂'
            },
            {
              count: '2',
              title: 'Влови 2 запахи',
              desc: 'Запах кави, свіжого повітря, одягу або крему для рук.',
              color: 'text-pink-600 dark:text-pink-400',
              icon: '👃'
            },
            {
              count: '1',
              title: 'Зроби 1 ковток води або відчуй смак у роті',
              desc: 'Зосередься на фізичному відчутті язика, ковтка води або м’ятного льодяника.',
              color: 'text-emerald-600 dark:text-emerald-400',
              icon: '👅'
            }
          ];

          const current = steps[groundingStep];

          return (
            <div className="py-2 text-center">
              <div className="flex justify-center gap-1.5 mb-4">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-1.5 rounded-full transition-all ${
                      idx === groundingStep
                        ? 'bg-indigo-600 dark:bg-indigo-400 w-8'
                        : idx < groundingStep
                        ? 'bg-emerald-500'
                        : 'bg-black/10 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-3xl mx-auto mb-3">
                {current.icon}
              </div>

              <span className={`text-2xl font-black ${current.color} block mb-1`}>
                Крок {current.count}
              </span>

              <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5] mb-2 px-4">
                {current.title}
              </h4>

              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto mb-6 leading-relaxed">
                {current.desc}
              </p>

              <button
                type="button"
                onClick={() => {
                  if (groundingStep < 4) {
                    setGroundingStep(groundingStep + 1);
                  } else {
                    setMode('menu');
                  }
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                {groundingStep < 4 ? 'Зроблено, далі →' : 'Завершити заземлення ✓'}
              </button>
            </div>
          );
        })()}

        {/* 6. КРИЖАНИЙ ШОК ТА РЕФЛЕКС НИРЦЯ */}
        {mode === 'cold' && (
          <div className="space-y-3 py-2 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mx-auto mb-2 animate-pulse">
              ❄️
            </div>
            <h3 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Рефлекс нирця (Mammalian Dive Reflex)
            </h3>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto leading-relaxed">
              Коли крижана вода торкається зони навколо очей і носа, блукаючий нерв миттєво сповільнює серце і перериває викид адреналіну.
            </p>

            <div className="p-3 bg-white/80 dark:bg-[#1c1c21]/80 rounded-xl border border-blue-500/30 text-left space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                <span>Набери в долоні крижаної води та вмий обличчя 3–4 рази.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                <span>Або приклади кубик льоду до зап’ясть чи задньої частини шиї на 15 секунд.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                <span>Зроби повільний ковток дуже холодної води.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Нижня панель: "На жаль, стався зрив" у ЛІВОМУ КУТКУ */}
      <div className="max-w-md mx-auto w-full pt-3 mt-auto border-t border-[#B7CDC6] dark:border-[#2d2d35] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRelapse}
          className="text-[11px] text-[#A33A2C] dark:text-[#F08C7D] hover:underline cursor-pointer opacity-75 hover:opacity-100 transition-opacity font-medium text-left"
        >
          На жаль, стався зрив...
        </button>

        <button
          type="button"
          onClick={onCravingOver}
          className="px-4 py-2.5 bg-[#1E8A69] hover:bg-[#187558] text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 flex-none"
        >
          <Check className="w-4 h-4" />
          <span>Тяга минула!</span>
        </button>
      </div>
    </div>
  );
};
