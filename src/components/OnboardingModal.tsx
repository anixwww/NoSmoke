import React, { useState } from 'react';
import { Sparkles, Calendar, Calculator, Heart, User, Check, ArrowRight, ShieldCheck, Smile } from 'lucide-react';
import { MoneySettings } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    userName: string;
    startDate: number;
    money: MoneySettings;
    mainReason: string;
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('quit-smoking:user-name') || '');
  const [perDay, setPerDay] = useState<string>('20');
  const [packPrice, setPackPrice] = useState<string>('100');
  const [packSize, setPackSize] = useState<string>('20');
  const [minutesPerCig, setMinutesPerCig] = useState<string>('7');
  
  // Start date mode: 'now' or 'custom'
  const [dateMode, setDateMode] = useState<'now' | 'custom'>('now');
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date(Date.now() - 3 * 24 * 3600 * 1000);
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const [mainReason, setMainReason] = useState<string>('Дихати на повні груди без задишки та втоми');

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    let finalStart = Date.now();
    if (dateMode === 'custom') {
      const parsed = new Date(customDate).getTime();
      if (isFinite(parsed) && parsed > 0) {
        finalStart = parsed;
      }
    }

    const moneySettings: MoneySettings = {
      perDay: Math.max(1, parseFloat(perDay) || 20),
      packPrice: Math.max(1, parseFloat(packPrice) || 100),
      packSize: Math.max(1, parseInt(packSize, 10) || 20),
      minutesPerCig: Math.max(1, parseInt(minutesPerCig, 10) || 7),
      cur: '₴'
    };

    const finalName = userName.trim() || 'Мандрівник';
    localStorage.setItem('quit-smoking:user-name', finalName);
    localStorage.setItem('quit-smoking:onboarded', 'true');

    onComplete({
      userName: finalName,
      startDate: finalStart,
      money: moneySettings,
      mainReason
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#E9F1EE] dark:bg-[#18181c] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative background aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#1E8A69]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Progress indicator */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1E8A69] text-white flex items-center justify-center font-bold text-sm shadow-md">
              🌱
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1E8A69] dark:text-[#4CC9A0]">
              Крок {step} із 4
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-6 bg-[#1E8A69] dark:bg-[#4CC9A0]' : s < step ? 'w-3 bg-[#1E8A69]/50' : 'w-2 bg-[#B7CDC6] dark:bg-[#2d2d35]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME & GREETING */}
        {step === 1 && (
          <div className="space-y-5 my-auto text-center relative z-10 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#1E8A69] to-teal-400 text-white flex items-center justify-center shadow-lg text-3xl">
              🌿
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
                Ласкаво просимо до Freedom!
              </h2>
              <p className="text-xs sm:text-sm text-[#55726B] dark:text-[#8FAAA3] leading-relaxed max-w-sm mx-auto">
                Це ваш затишний простір для звільнення від нікотинової залежності, накопичення заощаджень та відновлення гармонії тіла й духу.
              </p>
            </div>

            <div className="p-4 bg-white/60 dark:bg-[#121212]/60 rounded-2xl border border-[#B7CDC6]/50 dark:border-[#2d2d35] text-left space-y-2 text-xs text-[#55726B] dark:text-[#8FAAA3]">
              <div className="flex items-center gap-2 font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                <ShieldCheck className="w-4 h-4 text-[#1E8A69]" />
                <span>Науково доведені методики відновлення</span>
              </div>
              <p className="pl-6">Трекер життєвих сил, анти-стрес інструменти SOS, вирощування дерев та контроль фінансів у єдиному додатку.</p>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Розпочати налаштування</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PROFILE & NAME (AUTHORIZATION / NICKNAME) */}
        {step === 2 && (
          <div className="space-y-5 my-auto relative z-10 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center text-xl">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Як до вас звертатися?
              </h2>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Введіть ваше ім'я або нікнейм для персоналізації підтримки
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                  Ваше ім'я:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Наприклад: Андрій"
                  className="w-full text-sm font-semibold p-3 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  autoFocus
                />
              </div>

              <div className="p-3 bg-white/40 dark:bg-[#121212]/40 rounded-xl border border-[#B7CDC6]/30 text-xs text-[#55726B] dark:text-[#8FAAA3] flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#1E8A69] shrink-0" />
                <span>Ваші дані зберігаються виключно на цьому пристрої у безпечному сховищі браузера.</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Далі</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SMOKING HABITS & START DATE */}
        {step === 3 && (
          <div className="space-y-4 my-auto relative z-10 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#1E8A69]/15 text-[#1E8A69] dark:text-[#4CC9A0] flex items-center justify-center text-xl">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Ваші параметри куріння
              </h2>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Для точного підрахунку економії та відновлення організму
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                    Сигарет на день:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={perDay}
                    onChange={(e) => setPerDay(e.target.value)}
                    className="w-full text-center text-xs font-bold font-mono py-2 px-3 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                    Ціна пачки (₴):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={packPrice}
                    onChange={(e) => setPackPrice(e.target.value)}
                    className="w-full text-center text-xs font-bold font-mono py-2 px-3 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#1E8A69] dark:text-[#4CC9A0] outline-none focus:border-[#1E8A69]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5]">
                    Час на 1 сигарету (хв):
                  </label>
                  <span className="text-[10px] text-[#55726B] dark:text-[#8FAAA3]">
                    разом із виходом на перекур
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={minutesPerCig}
                    onChange={(e) => setMinutesPerCig(e.target.value)}
                    className="w-20 text-center text-xs font-bold font-mono py-2 px-2 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  />
                  <div className="flex items-center gap-1 flex-1">
                    {[5, 7, 10, 15].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinutesPerCig(String(m))}
                        className={`flex-1 py-2 text-[11px] rounded-xl font-bold transition-colors cursor-pointer ${
                          parseInt(minutesPerCig, 10) === m
                            ? 'bg-[#1E8A69] text-white shadow-xs'
                            : 'bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
                        }`}
                      >
                        {m} хв
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#12302B] dark:text-[#f4f4f5] block mb-1">
                  Коли ви викурили останню сигарету?
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setDateMode('now')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      dateMode === 'now' ? 'bg-[#1E8A69] text-white shadow-xs' : 'bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
                    }`}
                  >
                    ⚡ Прямо зараз
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateMode('custom')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      dateMode === 'custom' ? 'bg-[#1E8A69] text-white shadow-xs' : 'bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3]'
                    }`}
                  >
                    📅 Раніше (обрати дату)
                  </button>
                </div>

                {dateMode === 'custom' && (
                  <input
                    type="datetime-local"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69]"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Далі</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CORE MOTIVATION REASON */}
        {step === 4 && (
          <form onSubmit={handleFinish} className="space-y-4 my-auto relative z-10 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5]">
                Головна мотивація
              </h2>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
                Що надихає вас бути вільним? (Вкажіть вашу ключову причину)
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={mainReason}
                onChange={(e) => setMainReason(e.target.value)}
                rows={3}
                placeholder="Наприклад: Заради здоров'я, легкого дихання та свободи від залежності..."
                className="w-full text-xs p-3 bg-white dark:bg-[#121212] border border-[#B7CDC6] dark:border-[#2d2d35] rounded-xl text-[#12302B] dark:text-[#f4f4f5] outline-none focus:border-[#1E8A69] resize-none"
                required
              />

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-[#55726B] dark:text-[#8FAAA3] block">
                  Або оберіть готовий орієнтир:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Дихати на повні груди без задишки',
                    'Зберегти здорове серце та судини',
                    'Заощадити кошти на власні мрії',
                    'Повернути чистий смак та свіжий подих'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMainReason(preset)}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-white/60 dark:bg-[#2d2d35] hover:bg-[#1E8A69]/20 text-[#12302B] dark:text-[#f4f4f5] transition-colors cursor-pointer border border-[#B7CDC6]/50 dark:border-[#2d2d35]"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 bg-white/60 dark:bg-[#2d2d35] text-[#55726B] dark:text-[#8FAAA3] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Назад
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#1E8A69] hover:bg-[#176d53] text-white rounded-xl font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Завершити налаштування ✨</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
