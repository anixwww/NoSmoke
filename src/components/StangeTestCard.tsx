import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Play,
  Square,
  RotateCcw,
  History,
  Info,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface StangeResult {
  id: string;
  timestamp: number;
  dateStr: string;
  seconds: number;
}

const STORAGE_KEY = 'quit-smoking:stange-test-history';

export const StangeTestCard: React.FC = () => {
  const [history, setHistory] = useState<StangeResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [testState, setTestState] = useState<'idle' | 'prep' | 'running' | 'done'>('idle');
  const [prepCount, setPrepCount] = useState<number>(3);
  const [elapsed, setElapsed] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Handle prep countdown
  useEffect(() => {
    if (testState !== 'prep') return;

    if (prepCount > 0) {
      const t = setTimeout(() => {
        setPrepCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(t);
    } else {
      // Start test
      setTestState('running');
      setElapsed(0);
      startTimeRef.current = performance.now();
    }
  }, [testState, prepCount]);

  // Handle running stopwatch
  useEffect(() => {
    if (testState !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const diffSec = (performance.now() - startTimeRef.current) / 1000;
      setElapsed(diffSec);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState]);

  const handleStart = () => {
    setPrepCount(3);
    setTestState('prep');
    setElapsed(0);
  };

  const handleStop = () => {
    const finalSeconds = Math.round(elapsed * 10) / 10;
    setElapsed(finalSeconds);
    setTestState('done');

    const newResult: StangeResult = {
      id: `stange-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      seconds: finalSeconds
    };

    setHistory((prev) => [newResult, ...prev.slice(0, 19)]); // Keep last 20 tests
  };

  const handleReset = () => {
    setTestState('idle');
    setElapsed(0);
  };

  const getEvaluation = (sec: number) => {
    if (sec < 20) {
      return {
        label: 'Знижена ємність',
        color: 'text-amber-600 dark:text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/30',
        desc: 'Початковий етап відновлення. Альвеоли та бронхіоли поступово звільняються від слизу та смол.'
      };
    }
    if (sec < 35) {
      return {
        label: 'Задовільно',
        color: 'text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-500/10 border-sky-500/30',
        desc: 'Помітний прогрес! Газообмін у легенях налагоджується, гемоглобін активніше переносить кисень.'
      };
    }
    if (sec < 50) {
      return {
        label: 'Добре (Норма)',
        color: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-500/10 border-emerald-500/30',
        desc: 'Чудовий результат здорової некурящої людини. Ваші легені відновили природну витривалість.'
      };
    }
    return {
      label: 'Відмінно',
      color: 'text-teal-600 dark:text-teal-300',
      badgeBg: 'bg-teal-500/10 border-teal-500/30',
      desc: 'Рівень витривалості спортсмена. Тіло повністю компенсувало кисневий дефіцит.'
    };
  };

  const bestResult = history.length > 0 ? Math.max(...history.map((h) => h.seconds)) : null;
  const lastResult = history.length > 0 ? history[0] : null;

  return (
    <div className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs transition-all mb-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
              Тест Штанге: Витривалість легень
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Медична проба затримки дихання після глибокого вдиху
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="p-1.5 text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5] rounded-lg transition-colors cursor-pointer"
          title="Як правильно робити тест"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Rules Notice */}
      {showInfo && (
        <div className="mb-3 p-3 bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 rounded-xl text-[11px] text-[#55726B] dark:text-[#8FAAA3] leading-relaxed">
          <p className="font-semibold text-[#12302B] dark:text-[#f4f4f5] mb-1">
            Інструкція для точного вимірювання:
          </p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Сядьте зручно, зробіть 2–3 спокійних вдихи-видихи.</li>
            <li>Зробіть глибокий вдих на 80–90% ємності легень.</li>
            <li>Затримайте дихання (можна затиснути ніс) і натисніть «Почати».</li>
            <li>При першому бажанні вдихнути натисніть «Видихнути». Не робіть над зусилля.</li>
          </ol>
        </div>
      )}

      {/* Active Testing Area */}
      <div className="flex flex-col items-center justify-center py-4 px-2 bg-[#CBDDD7]/20 dark:bg-[#1D3832]/20 rounded-2xl border border-[#B7CDC6]/40 dark:border-[#2A4A43]/40 mb-3 text-center relative overflow-hidden">
        {/* State: Idle */}
        {testState === 'idle' && (
          <div className="space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-teal-500/10 dark:bg-teal-400/10 border-2 border-teal-500/30 flex items-center justify-center">
              <Activity className="w-9 h-9 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                {history.length === 0
                  ? 'Зробіть свій перший замір легеневої ємності'
                  : `Останній результат: ${lastResult?.seconds} с`}
              </p>
              <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] mt-0.5">
                Затримайте дихання на вдиху та натисніть кнопку
              </p>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="py-2.5 px-6 bg-[#1E8A69] hover:bg-[#167054] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 mx-auto cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Почати вимірювання</span>
            </button>
          </div>
        )}

        {/* State: Preparation Countdown */}
        {testState === 'prep' && (
          <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <span className="text-[11px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider">
              Глибокий вдих на 80-90%...
            </span>
            <div className="text-5xl font-extrabold font-mono text-teal-600 dark:text-teal-400 scale-110 transition-transform">
              {prepCount === 0 ? 'СТАРТ' : prepCount}
            </div>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Затримайте повітря в грудях
            </p>
          </div>
        )}

        {/* State: Running Stopwatch */}
        {testState === 'running' && (
          <div className="space-y-3 w-full">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Pulsing ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping opacity-25"
                style={{ animationDuration: '2s' }}
              />
              <div className="w-24 h-24 rounded-full bg-teal-500/10 border-2 border-teal-500/60 flex items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                  {Math.floor(elapsed)}
                  <span className="text-base text-teal-600 dark:text-teal-400 font-normal">.{(elapsed % 1).toFixed(1).slice(2)}</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
              Тримайте дихання спокійно, без напруження шиї
            </p>

            <button
              type="button"
              onClick={handleStop}
              className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 mx-auto cursor-pointer transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Видихнути (Завершити)</span>
            </button>
          </div>
        )}

        {/* State: Finished Result */}
        {testState === 'done' && (
          <div className="space-y-2.5 w-full animate-in fade-in duration-200">
            <div className="text-3xl font-extrabold font-mono text-[#12302B] dark:text-[#f4f4f5]">
              {elapsed} <span className="text-base font-normal text-[#55726B] dark:text-[#8FAAA3]">секунд</span>
            </div>

            {(() => {
              const evalData = getEvaluation(elapsed);
              return (
                <div className="space-y-1">
                  <span className={`inline-block py-0.5 px-2.5 rounded-full text-xs font-bold border ${evalData.badgeBg} ${evalData.color}`}>
                    {evalData.label}
                  </span>
                  <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto leading-relaxed">
                    {evalData.desc}
                  </p>
                </div>
              );
            })()}

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleStart}
                className="py-2 px-4 bg-[#1E8A69] hover:bg-[#167054] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Пройти ще раз</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 text-xs text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5] cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats Footer */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs mb-2">
        <div className="p-2 rounded-xl bg-white/50 dark:bg-black/20 border border-[#B7CDC6]/30 dark:border-[#2d2d35]">
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Найкращий час</span>
          <span className="font-mono font-bold text-[#12302B] dark:text-[#f4f4f5]">
            {bestResult ? `${bestResult} с` : '—'}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-white/50 dark:bg-black/20 border border-[#B7CDC6]/30 dark:border-[#2d2d35]">
          <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] block">Всього спроб</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
            {history.length}
          </span>
        </div>
      </div>

      {/* History Toggle */}
      {history.length > 0 && (
        <div className="border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] pt-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between py-1 text-xs text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5] font-medium cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Історія вимірювань ({history.length})</span>
            </span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showHistory && (
            <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
              {history.map((item, idx) => {
                const evalData = getEvaluation(item.seconds);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/40 dark:bg-black/10 border border-[#B7CDC6]/20 dark:border-white/5 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#12302B] dark:text-[#f4f4f5]">
                        {item.seconds} с
                      </span>
                      <span className={`text-[10px] ${evalData.color}`}>
                        • {evalData.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                      {item.dateStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
