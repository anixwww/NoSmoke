import React from 'react';
import { Wind, Droplets, Gamepad2, X, Check, RefreshCw } from 'lucide-react';

interface SosModalProps {
  reasons: string[];
  onClose: () => void;
  onCravingOver: () => void;
  onRelapse: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({
  reasons,
  onClose,
  onCravingOver,
  onRelapse
}) => {
  const [mode, setMode] = React.useState<'menu' | 'breath' | 'water' | 'bubbles'>('menu');
  const [breathTechnique, setBreathTechnique] = React.useState<'calm' | '478' | 'box'>('calm');
  const [breathPhase, setBreathPhase] = React.useState<'Вдих' | 'Затримка' | 'Видих'>('Вдих');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = React.useState(4);

  // Bubble mini-game state
  const [bubbleScore, setBubbleScore] = React.useState(0);
  const [bubbles, setBubbles] = React.useState<{ id: number; x: number; y: number }[]>([]);

  // Random tip or reason
  const randomReason = reasons.length > 0 ? reasons[Math.floor(Math.random() * reasons.length)] : null;

  // Breathing timer loop
  React.useEffect(() => {
    if (mode !== 'breath') return;

    let sec = 4;
    let phaseIdx = 0; // 0: inhale, 1: hold, 2: exhale, (3: hold for box)

    const timer = setInterval(() => {
      sec -= 1;
      if (sec <= 0) {
        if (breathTechnique === 'calm') {
          // Inhale 4, Hold 4, Exhale 6
          phaseIdx = (phaseIdx + 1) % 3;
          if (phaseIdx === 0) { setBreathPhase('Вдих'); sec = 4; }
          else if (phaseIdx === 1) { setBreathPhase('Затримка'); sec = 4; }
          else { setBreathPhase('Видих'); sec = 6; }
        } else if (breathTechnique === '478') {
          // Inhale 4, Hold 7, Exhale 8
          phaseIdx = (phaseIdx + 1) % 3;
          if (phaseIdx === 0) { setBreathPhase('Вдих'); sec = 4; }
          else if (phaseIdx === 1) { setBreathPhase('Затримка'); sec = 7; }
          else { setBreathPhase('Видих'); sec = 8; }
        } else {
          // Box: 4, 4, 4, 4
          phaseIdx = (phaseIdx + 1) % 4;
          if (phaseIdx === 0) { setBreathPhase('Вдих'); sec = 4; }
          else if (phaseIdx === 1) { setBreathPhase('Затримка'); sec = 4; }
          else if (phaseIdx === 2) { setBreathPhase('Видих'); sec = 4; }
          else { setBreathPhase('Затримка'); sec = 4; }
        }
      }
      setPhaseSecondsLeft(sec);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, breathTechnique]);

  // Spawn bubbles for mini-game
  React.useEffect(() => {
    if (mode !== 'bubbles') return;

    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev.slice(-6),
        {
          id: Date.now() + Math.random(),
          x: 10 + Math.random() * 80,
          y: 15 + Math.random() * 70
        }
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, [mode]);

  const popBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setBubbleScore((s) => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#E9F1EE]/95 dark:bg-[#121212]/95 backdrop-blur-md flex flex-col p-5 overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5]">
            Тяга — це хвиля
          </h2>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            Вона досягає піку за 3-5 хвилин, а потім неминуче спадає.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 border border-[#B7CDC6] rounded-full hover:bg-white/50 text-[#55726B]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-2">
        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setMode('breath')}
              className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 border-2 border-[#1E8A69]/40 hover:border-[#1E8A69] rounded-2xl flex items-center gap-3.5 text-left cursor-pointer transition-all shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center text-2xl flex-none">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Дихальні вправи (Спокій, 4-7-8, Квадрат)
                </h4>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                  Стимулює блукаючий нерв і за хвилину знижує рівень адреналіну.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('water')}
              className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 border-2 border-[#4C9BE2]/40 hover:border-[#4C9BE2] rounded-2xl flex items-center gap-3.5 text-left cursor-pointer transition-all shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#4C9BE2]/15 text-[#4C9BE2] flex items-center justify-center text-2xl flex-none">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Склянка прохолодної води
                </h4>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                  Пийте маленькими повільними ковтками, відчуваючи холод у горлі.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('bubbles')}
              className="w-full p-4 bg-white/80 dark:bg-[#1c1c21]/80 border-2 border-[#8A5DB4]/40 hover:border-[#8A5DB4] rounded-2xl flex items-center gap-3.5 text-left cursor-pointer transition-all shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#8A5DB4]/15 text-[#8A5DB4] flex items-center justify-center text-2xl flex-none">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                  Міні-гра: Лопання бульбашок
                </h4>
                <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                  Миттєво перемикає увагу мозку на візуальний рефлекс.
                </p>
              </div>
            </button>

            {/* Reason reminder */}
            {randomReason && (
              <div className="p-4 bg-[#1E8A69]/10 border border-[#1E8A69]/30 rounded-2xl mt-4">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#1E8A69] dark:text-[#4CC9A0] block mb-1">
                  Твоя мета:
                </span>
                <p className="text-sm font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                  «{randomReason}»
                </p>
              </div>
            )}
          </div>
        )}

        {/* BREATHING MODE */}
        {mode === 'breath' && (
          <div className="text-center py-4">
            {/* Technique switch */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#CBDDD7]/60 dark:bg-[#1D3832]/60 rounded-xl mb-6 max-w-xs mx-auto">
              {(['calm', '478', 'box'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setBreathTechnique(t)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    breathTechnique === t
                      ? 'bg-white dark:bg-[#1c1c21] text-[#1E8A69] shadow-xs'
                      : 'text-[#55726B] hover:text-[#12302B]'
                  }`}
                >
                  {t === 'calm' ? 'Спокій' : t === '478' ? '4-7-8' : 'Квадрат'}
                </button>
              ))}
            </div>

            {/* Breathing pulse circle */}
            <div className="w-48 h-48 rounded-full border-4 border-[#1E8A69] bg-[#1E8A69]/15 flex flex-col items-center justify-center mx-auto mb-6 shadow-inner transition-transform duration-700">
              <span className="text-xl font-bold text-[#1E8A69] dark:text-[#4CC9A0] mb-1">
                {breathPhase}
              </span>
              <span className="text-4xl font-extrabold font-mono text-[#12302B] dark:text-[#f4f4f5]">
                {phaseSecondsLeft}
              </span>
            </div>

            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto mb-6">
              Дихайте животом. Зосередьтеся на відчутті прохолодного повітря на вдиху та теплого на видиху.
            </p>

            <button
              type="button"
              onClick={() => setMode('menu')}
              className="text-xs text-[#1E8A69] underline font-semibold"
            >
              ← Інша техніка
            </button>
          </div>
        )}

        {/* WATER MODE */}
        {mode === 'water' && (
          <div className="text-center py-6">
            <div className="w-24 h-24 rounded-full bg-[#4C9BE2]/20 text-[#4C9BE2] flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
              💧
            </div>
            <h3 className="text-lg font-bold text-[#12302B] dark:text-[#f4f4f5] mb-2">
              Пийте повільно, маленькими ковтками
            </h3>
            <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] max-w-xs mx-auto mb-6 leading-relaxed">
              Вода зволожує рецептори в роті, змиває бажання затягтися та перемикає центр ковтання в мозку.
            </p>
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="text-xs text-[#1E8A69] underline font-semibold"
            >
              ← Інша техніка
            </button>
          </div>
        )}

        {/* BUBBLE POPPING GAME */}
        {mode === 'bubbles' && (
          <div className="flex flex-col items-center py-2">
            <div className="flex items-center justify-between w-full mb-2 px-2">
              <span className="text-xs font-bold text-[#8A5DB4]">
                Лопай бульбашки: {bubbleScore}
              </span>
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="text-xs text-[#55726B] underline"
              >
                ← Назад
              </button>
            </div>

            <div className="w-full h-64 bg-white/50 dark:bg-[#1c1c21]/50 border-2 border-dashed border-[#8A5DB4]/40 rounded-2xl relative overflow-hidden select-none">
              {bubbles.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => popBubble(b.id)}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-gradient-to-tr from-[#8A5DB4] to-[#C58BE6] text-white flex items-center justify-center text-lg shadow-md cursor-pointer hover:scale-110 active:scale-90 transition-transform"
                >
                  ✨
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="max-w-md mx-auto w-full pt-4 border-t border-[#B7CDC6] dark:border-[#2d2d35] flex flex-col gap-2">
        <button
          type="button"
          onClick={onCravingOver}
          className="w-full py-3 bg-[#1E8A69] hover:bg-[#187558] text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Тяга минула! Записати перемогу</span>
        </button>

        <button
          type="button"
          onClick={onRelapse}
          className="w-full py-2 text-xs font-semibold text-[#A33A2C] dark:text-[#F08C7D] hover:underline cursor-pointer"
        >
          На жаль, стався зрив...
        </button>
      </div>
    </div>
  );
};
