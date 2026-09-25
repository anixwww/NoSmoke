import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { DayRating } from '../types';

interface StateDynamicsChartProps {
  days: Record<string, DayRating>;
  daysRange?: number;
  showPeriodSelector?: boolean;
}

export const StateDynamicsChart: React.FC<StateDynamicsChartProps> = ({
  days,
  daysRange = 7,
  showPeriodSelector = true
}) => {
  const [selectedRange, setSelectedRange] = useState<number>(daysRange);
  const activeCategory = 'all';

  const chartData = useMemo(() => {
    const points = [];
    const today = new Date();

    for (let i = selectedRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const dateKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const dayRating = days[dateKey];

      const weekday = d.toLocaleDateString('uk-UA', { weekday: 'short' });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const dayMonth = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
      const monthOnly = d.toLocaleDateString('uk-UA', { month: 'short' });

      // Smart display label depending on range
      let displayLabel = capitalizedWeekday;
      if (selectedRange > 7 && selectedRange <= 30) {
        displayLabel = `${d.getDate()} ${monthOnly}`;
      } else if (selectedRange > 30 && selectedRange <= 90) {
        displayLabel = `${d.getDate()} ${monthOnly}`;
      } else if (selectedRange > 90) {
        displayLabel = `${monthOnly}`;
      }

      const surveys = dayRating?.surveys || dayRating?.entries || [];
      const hasSurveys = surveys.length > 0;

      // Calculate averages from surveys if available
      const calcAvg = (key: 'energy' | 'sleepQuality' | 'focus' | 'intrusiveThoughts' | 'craving' | 'anxiety' | 'balance') => {
        if (!hasSurveys) return null;
        let sum = 0;
        let count = 0;
        surveys.forEach((s) => {
          const val = (s as any)[key];
          if (typeof val === 'number' && val > 0) {
            sum += val;
            count++;
          }
        });
        return count > 0 ? Number((sum / count).toFixed(1)) : null;
      };

      // Fallback to legacy single-day rating if available
      const cravingVal = calcAvg('craving') ?? dayRating?.craving ?? null;
      const anxietyVal = calcAvg('anxiety') ?? dayRating?.anxiety ?? null;
      const energyVal = calcAvg('energy') ?? (dayRating?.mood ? dayRating.mood : null);
      const sleepQualityVal = calcAvg('sleepQuality') ?? null;
      const focusVal = calcAvg('focus') ?? null;
      const intrusiveVal = calcAvg('intrusiveThoughts') ?? cravingVal;
      const balanceVal = calcAvg('balance') ?? null;

      const sleepHours = dayRating?.sleep?.hours ?? null;
      const mealsCount = dayRating?.meals?.length ?? 0;
      const drinksCount = dayRating?.drinks?.length ?? 0;

      const hasAnyData = hasSurveys || dayRating?.sleep || dayRating?.meals?.length || dayRating?.drinks?.length || dayRating?.craving;

      points.push({
        dateKey,
        displayLabel,
        fullDate: `${capitalizedWeekday}, ${dayMonth} ${d.getFullYear()}`,
        hasData: hasAnyData,
        energy: energyVal,
        sleepQuality: sleepQualityVal,
        focus: focusVal,
        intrusive: intrusiveVal,
        craving: cravingVal,
        anxiety: anxietyVal,
        balance: balanceVal,
        sleepHours,
        mealsCount,
        drinksCount,
        surveysCount: surveys.length
      });
    }

    return points;
  }, [days, selectedRange]);

  // Determine tick interval for XAxis so labels don't crowd
  const xAxisInterval = useMemo(() => {
    if (selectedRange <= 7) return 0;
    if (selectedRange <= 14) return 1;
    if (selectedRange <= 30) return 4;
    if (selectedRange <= 90) return 14;
    if (selectedRange <= 180) return 29;
    return 30;
  }, [selectedRange]);

  const getRangeTitle = () => {
    switch (selectedRange) {
      case 7: return '7 днів';
      case 30: return '1 місяць';
      case 90: return '3 місяці';
      case 180: return '6 місяців';
      case 365: return '1 рік';
      default: return `${selectedRange} днів`;
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#1c1c21]/80 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
      {/* Top Controls: Title, Range selector and Category switcher */}
      <div className="flex flex-col gap-2.5 mb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5]">
              Динаміка стану
            </h3>
            <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3]">
              Усі показники стану за обраний період
            </p>
          </div>
        <span className="text-[10px] font-bold text-[#1E8A69] dark:text-[#4CC9A0] bg-[#1E8A69]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
            {getRangeTitle()}
          </span>
        </div>

        {/* Time range switcher: Clean 5-column grid without any scrollbars */}
        {showPeriodSelector && (
          <div className="grid grid-cols-5 gap-1 p-1 bg-[#E6F0EC] dark:bg-[#25252d] rounded-xl w-full border border-[#B7CDC6]/30 dark:border-white/5 no-scrollbar">
            {[
              { r: 7, label: '7 дн' },
              { r: 30, label: '1 міс' },
              { r: 90, label: '3 міс' },
              { r: 180, label: '6 міс' },
              { r: 365, label: '1 рік' }
            ].map(({ r, label }) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                className={`py-1.5 text-[11px] font-semibold rounded-lg text-center transition-all cursor-pointer ${
                  selectedRange === r
                    ? 'bg-white dark:bg-[#121212] text-[#12302B] dark:text-[#f4f4f5] shadow-xs font-bold'
                    : 'text-[#55726B] dark:text-[#8FAAA3] hover:text-[#12302B] dark:hover:text-[#f4f4f5]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart container */}
      <div className="h-52 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#B7CDC6" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="displayLabel"
                stroke="#55726B"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval={xAxisInterval}
              />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#55726B" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#1E8A69]/40">
                      <div className="font-bold border-b border-white/10 pb-1 flex items-center justify-between gap-2">
                        <span>{p.fullDate}</span>
                        {p.surveysCount > 0 && (
                          <span className="text-[10px] text-emerald-400">
                            {p.surveysCount} зріз(ів)
                          </span>
                        )}
                      </div>
                      {p.hasData ? (
                        <div className="space-y-0.5 text-[11px]">
                          {p.intrusive !== null && <div>Нав’язливі думки: <strong className="text-amber-400">{p.intrusive}</strong></div>}
                          {p.craving !== null && <div>Тяга: <strong className="text-red-400">{p.craving}</strong></div>}
                          {p.anxiety !== null && <div>Тривожність: <strong className="text-rose-400">{p.anxiety}</strong></div>}
                          {p.balance !== null && <div>Рівновага: <strong className="text-emerald-400">{p.balance}</strong></div>}
                          {p.energy !== null && <div>Енергія: <strong className="text-teal-400">{p.energy}</strong></div>}
                          {p.sleepQuality !== null && <div>Виспаність: <strong className="text-blue-400">{p.sleepQuality}</strong></div>}
                          {p.focus !== null && <div>Концентрація: <strong className="text-purple-400">{p.focus}</strong></div>}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">Немає записів за цей день</div>
                      )}
                    </div>
                  );
                }}
              />

              {/* All metric lines */}
              <Line
                type="monotone"
                dataKey="intrusive"
                name="Нав'язливі думки"
                stroke="#D97706"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#D97706' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="craving"
                name="Тяга"
                stroke="#EF4444"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#EF4444' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                name="Тривожність"
                stroke="#F43F5E"
                strokeWidth={selectedRange > 30 ? 1.2 : 1.8}
                strokeDasharray="4 2"
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#F43F5E' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Рівновага"
                stroke="#10B981"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#10B981' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Енергія"
                stroke="#0D9488"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#0D9488' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="sleepQuality"
                name="Виспаність"
                stroke="#3B82F6"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#3B82F6' }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="focus"
                name="Концентрація"
                stroke="#8B5CF6"
                strokeWidth={selectedRange > 30 ? 1.5 : 2}
                dot={selectedRange > 30 ? false : { r: 2.5, fill: '#8B5CF6' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
      </div>

      {/* Clean Typographic Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 pt-2.5 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] text-[10px] font-medium text-[#55726B] dark:text-[#8FAAA3]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#D97706] inline-block"></span>
          <span>Нав'язливі</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block"></span>
          <span>Тяга</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#F43F5E] inline-block"></span>
          <span>Тривожність</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block"></span>
          <span>Рівновага</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] inline-block"></span>
          <span>Енергія</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#3B82F6] inline-block"></span>
          <span>Виспаність</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] inline-block"></span>
          <span>Концентрація</span>
        </div>
      </div>
    </div>
  );
};
