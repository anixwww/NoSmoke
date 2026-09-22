import React from 'react';
import { HEALTH_MILESTONES, getBodySystemsRecovery, getTodayHealthFact, DAY, HOUR, MIN } from '../data/healthData';
import { Heart, Activity, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface HealthTabProps {
  diffMs: number;
  startDate: number;
}

export const HealthTab: React.FC<HealthTabProps> = ({ diffMs, startDate }) => {
  const [activeTab, setActiveTab] = React.useState<'systems' | 'milestones'>('systems');

  const systems = React.useMemo(() => getBodySystemsRecovery(diffMs), [diffMs]);
  const todayFact = React.useMemo(() => getTodayHealthFact(diffMs), [diffMs]);

  const daysFree = Math.floor(diffMs / DAY);

  // Milestone helpers
  const achievedCount = HEALTH_MILESTONES.filter((m) => diffMs >= m.t).length;
  const nextMilestone = HEALTH_MILESTONES.find((m) => diffMs < m.t);

  const formatShortDate = (ms: number) => {
    try {
      return new Date(ms).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date(ms).toLocaleDateString();
    }
  };

  const fmtRemaining = (ms: number) => {
    if (ms <= 0) return '0 хв';
    const d = Math.floor(ms / DAY);
    const h = Math.floor((ms % DAY) / HOUR);
    const m = Math.floor((ms % HOUR) / MIN);
    if (d > 0) return `${d} дн. ${h} год.`;
    if (h > 0) return `${h} год. ${m} хв.`;
    return `${m} хв.`;
  };

  return (
    <div className="flex flex-col flex-1 pb-8 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#12302B] dark:text-[#f4f4f5] tracking-tight">
            Відновлення здоров’я
          </h1>
          <p className="text-xs text-[#55726B] dark:text-[#8FAAA3]">
            {daysFree} {daysFree === 1 ? 'день' : daysFree < 5 ? 'дні' : 'днів'} без нікотину і диму
          </p>
        </div>
        <div className="px-3 py-1 bg-[#1E8A69]/15 dark:bg-[#4CC9A0]/20 rounded-full text-xs font-semibold text-[#1E8A69] dark:text-[#4CC9A0] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>{achievedCount} з {HEALTH_MILESTONES.length} досягнень</span>
        </div>
      </div>

      {/* Daily fact spotlight banner */}
      <div className="p-4 bg-gradient-to-br from-[#1E8A69]/15 via-[#1E8A69]/5 to-transparent border border-[#1E8A69]/30 rounded-2xl mb-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E8A69] dark:text-[#4CC9A0] mb-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Що відбувається у тілі прямо зараз</span>
        </div>
        <p className="text-sm font-medium text-[#12302B] dark:text-[#f4f4f5] leading-relaxed">
          {todayFact}
        </p>
      </div>

      {/* Switch between Systems and Milestones */}
      <div className="grid grid-cols-2 p-1 bg-[#CBDDD7]/60 dark:bg-[#1D3832]/60 rounded-xl mb-5 border border-[#B7CDC6] dark:border-[#2d2d35]">
        <button
          type="button"
          onClick={() => setActiveTab('systems')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'systems'
              ? 'bg-white dark:bg-[#1c1c21] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
              : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
          }`}
        >
          Шкали регенерації органів
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'milestones'
              ? 'bg-white dark:bg-[#1c1c21] text-[#12302B] dark:text-[#f4f4f5] shadow-xs'
              : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B]'
          }`}
        >
          Медичні рубежі ({achievedCount}/{HEALTH_MILESTONES.length})
        </button>
      </div>

      {/* Systems view */}
      {activeTab === 'systems' && (
        <div className="flex flex-col gap-3.5">
          {systems.map((sys, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label={sys.name}>
                    {sys.icon}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#12302B] dark:text-[#f4f4f5]">
                      {sys.name}
                    </h3>
                    <span className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
                      {sys.timeRemainingText}
                    </span>
                  </div>
                </div>
                <span
                  className="text-base font-extrabold font-mono"
                  style={{ color: sys.color }}
                >
                  {Math.floor(sys.progress)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.max(2, sys.progress)}%`,
                    backgroundColor: sys.color
                  }}
                />
              </div>

              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] leading-normal">
                {sys.description}
              </p>
            </div>
          ))}

          <p className="text-xs text-center text-[#55726B] dark:text-[#8FAAA3] mt-2 italic">
            * Орієнтири базуються на наукових дослідженнях Всесвітньої організації охорони здоров’я (ВООЗ) та регенеративної медицини.
          </p>
        </div>
      )}

      {/* Milestones timeline view */}
      {activeTab === 'milestones' && (
        <div className="flex flex-col gap-3">
          {/* Next milestone card */}
          {nextMilestone && (
            <div className="p-4 bg-white dark:bg-[#1c1c21] border-2 border-[#1E8A69] dark:border-[#4CC9A0] rounded-2xl mb-2 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E8A69] dark:text-[#4CC9A0] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Наступний медичний рубіж</span>
                </span>
                <span className="text-xs font-semibold text-[#55726B] dark:text-[#8FAAA3]">
                  Ще {fmtRemaining(nextMilestone.t - diffMs)}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#12302B] dark:text-[#f4f4f5] mb-1">
                {nextMilestone.icon} {nextMilestone.title}
              </h4>
              <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] mb-2 leading-relaxed">
                {nextMilestone.description}
              </p>
              {/* Progress bar to next */}
              <div className="w-full h-2 bg-[#CBDDD7] dark:bg-[#1D3832] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1E8A69] dark:bg-[#4CC9A0] rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(3, (diffMs / nextMilestone.t) * 100))}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* List of all milestones */}
          <div className="flex flex-col gap-2">
            {HEALTH_MILESTONES.map((m) => {
              const isAchieved = diffMs >= m.t;
              const pct = Math.min(100, (diffMs / m.t) * 100);
              const unlockTime = startDate + m.t;

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isAchieved
                      ? 'bg-[#1E8A69]/10 dark:bg-[#4CC9A0]/10 border-[#1E8A69]/30 dark:border-[#4CC9A0]/30'
                      : 'bg-white/50 dark:bg-[#1c1c21]/50 border-[#B7CDC6] dark:border-[#2d2d35] opacity-85'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-none shadow-xs ${
                      isAchieved
                        ? 'bg-[#1E8A69] text-white'
                        : 'bg-[#CBDDD7] dark:bg-[#1D3832]'
                    }`}
                  >
                    {isAchieved ? <CheckCircle2 className="w-6 h-6 text-white" /> : m.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isAchieved
                            ? 'text-[#1E8A69] dark:text-[#4CC9A0]'
                            : 'text-[#12302B] dark:text-[#f4f4f5]'
                        }`}
                      >
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-mono font-semibold flex-none text-[#55726B] dark:text-[#8FAAA3]">
                        {isAchieved ? 'Досягнуто' : `${Math.floor(pct)}%`}
                      </span>
                    </div>

                    <p className="text-xs text-[#55726B] dark:text-[#8FAAA3] leading-relaxed mb-1">
                      {m.description}
                    </p>

                    <p className="text-[11px] text-[#12302B]/75 dark:text-[#f4f4f5]/75 italic">
                      💡 {m.medicalFact}
                    </p>

                    <div className="text-[10px] text-[#55726B] dark:text-[#8FAAA3] mt-1.5 flex items-center gap-1 font-medium">
                      <span>{isAchieved ? 'Досягнуто:' : 'Орієнтовно:'}</span>
                      <span>{formatShortDate(unlockTime)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
