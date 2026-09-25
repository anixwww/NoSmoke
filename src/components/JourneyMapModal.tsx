import React from 'react';
import { X, Check, MapPin, Compass, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredHours: number;
}

interface JourneyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  totalHours: number;
}

export const JourneyMapModal: React.FC<JourneyMapModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalHours
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#F7F2E7] dark:bg-[#1f1b16] border-2 border-[#8C6D48] dark:border-[#5a4630] rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Vintage Parchment watermark effect */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#8C6D48_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#8C6D48]/30 dark:border-[#5a4630]/50 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#8C6D48]/15 text-[#63482A] dark:text-[#D4B595] flex items-center justify-center text-xl shadow-xs">
              🗺️
            </div>
            <div>
              <h2 className="text-base font-black text-[#3d2c1d] dark:text-[#f4e8d8] tracking-tight">
                Старовинна карта мандрівки
              </h2>
              <p className="text-[11px] text-[#63482A] dark:text-[#a89078]">
                Ваш шлях витримки та здобуті віхи
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#8C6D48]/10 hover:bg-[#8C6D48]/20 text-[#63482A] dark:text-[#D4B595] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Checkpoints List with Winding Dashed Line */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 relative z-10 pr-1">
          {/* Vertical dashed line connecting points */}
          <div className="absolute left-7 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-[#8C6D48]/40 dark:border-[#5a4630] pointer-events-none" />

          {achievements.map((ach, idx) => {
            const unlocked = totalHours >= ach.requiredHours;
            const daysCount = Math.ceil(ach.requiredHours / 24);

            return (
              <div
                key={ach.id}
                className={`relative flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-[#EFE8D6] dark:bg-[#2b251d] border-[#8C6D48]/60 dark:border-[#70573e] text-[#3d2c1d] dark:text-[#f4e8d8] shadow-xs'
                    : 'bg-[#F1ECE0]/50 dark:bg-[#1a1612]/50 border-[#8C6D48]/20 dark:border-[#3a2e22] opacity-60 text-[#7a6552] dark:text-[#8a7560]'
                }`}
              >
                {/* Checkpoint marker icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 z-10 shadow-xs ${
                    unlocked
                      ? 'bg-[#8C6D48] text-white'
                      : 'bg-[#D6C5B2] dark:bg-[#382f25] text-[#7a6552]'
                  }`}
                >
                  {unlocked ? <Check className="w-4 h-4 stroke-[3]" /> : ach.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black tracking-tight">{ach.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      unlocked
                        ? 'bg-[#8C6D48]/20 text-[#543b22] dark:text-[#d4b595]'
                        : 'bg-[#8C6D48]/10 text-[#7a6552] dark:text-[#a89078]'
                    }`}>
                      {unlocked ? '✅ Готово' : ach.description}
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 mt-0.5">
                    {unlocked ? 'Віху успішно подолано на вашому шляху' : `Потрібно витримки: ~${daysCount > 1 ? `${daysCount} дн.` : `${ach.requiredHours} год.`}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#8C6D48]/30 dark:border-[#5a4630]/50 text-center text-[11px] text-[#63482A] dark:text-[#a89078] relative z-10">
          🧭 Пройнено годин: <span className="font-mono font-bold text-[#3d2c1d] dark:text-[#f4e8d8]">{Math.floor(totalHours)} год.</span>
        </div>

      </div>
    </div>
  );
};
