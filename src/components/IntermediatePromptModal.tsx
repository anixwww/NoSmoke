import React, { useState } from 'react';
import { Clock, Check, X } from 'lucide-react';

interface IntermediatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: {
    mood: number;
    craving: number;
    anxiety: number;
    energy: number;
    balance: number;
    focus: number;
    note: string;
  }) => void;
}

export const IntermediatePromptModal: React.FC<IntermediatePromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [mood, setMood] = useState<number>(3);
  const [craving, setCraving] = useState<number>(1);
  const [anxiety, setAnxiety] = useState<number>(1);
  const [energy, setEnergy] = useState<number>(3);
  const [balance, setBalance] = useState<number>(3);
  const [focus, setFocus] = useState<number>(3);
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const renderScale = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    low: string,
    high: string
  ) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#12302B] dark:text-[#f4f4f5]">{label}</span>
        <span className="font-mono font-bold text-[#1E8A69] dark:text-[#4CC9A0]">{value}/5</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
              value === v
                ? 'bg-[#12302B] dark:bg-[#f4f4f5] text-white dark:text-[#12302B] border-[#12302B] dark:border-[#f4f4f5]'
                : 'bg-white dark:bg-[#1c1c21] border-[#B7CDC6]/50 dark:border-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-[#55726B]/70 dark:text-[#8FAAA3]/70">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#1E8A69]/10 text-[#1E8A69] dark:text-[#4CC9A0]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Зріз стану (30 хв)
              </h3>
              <p className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                Коротка фіксація самопочуття
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#55726B] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {renderScale('Настрій', mood, setMood, 'Поганий', 'Відмінний')}
          {renderScale('Жага (тяга до куріння)', craving, setCraving, 'Відсутня', 'Сильна')}
          {renderScale('Тривожність', anxiety, setAnxiety, 'Спокій', 'Висока тривога')}
          {renderScale('Енергія', energy, setEnergy, 'Виснаження', 'Повна бадьорість')}
          {renderScale('Рівновага', balance, setBalance, 'Дисбаланс', 'Гармонія')}
          {renderScale('Концентрація', focus, setFocus, 'Розсіяна увага', 'Глибокий фокус')}
        </div>

        <div>
          <input
            type="text"
            maxLength={80}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Коротка нотатка (необов'язково)"
            className="w-full text-xs p-2 bg-white dark:bg-[#1c1c21] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5]"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-[#B7CDC6] dark:border-[#2d2d35] text-xs font-bold rounded-xl text-[#55726B] dark:text-[#8FAAA3] cursor-pointer"
          >
            Пізніше
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({
                mood,
                craving,
                anxiety,
                energy,
                balance,
                focus,
                note: note.trim()
              });
              onClose();
            }}
            className="flex-1 py-2 bg-[#1E8A69] hover:bg-[#187558] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Зберегти</span>
          </button>
        </div>
      </div>
    </div>
  );
};
