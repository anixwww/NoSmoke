import React from 'react';
import { DayRating } from '../types';

interface CravingHistogramProps {
  dayRatings: Record<string, DayRating>;
}

export const CravingHistogram: React.FC<CravingHistogramProps> = ({ dayRatings }) => {
  const data = React.useMemo(() => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({
        date: d.toLocaleDateString('uk-UA', { weekday: 'short' }),
        craving: dayRatings[dateStr]?.craving || 0,
      });
    }
    return last7Days;
  }, [dayRatings]);

  return (
    <div className="mb-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5] mb-3">Тяга за тиждень</h3>
      <div className="flex items-end justify-between h-20 gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-full h-full bg-[#CBDDD7] dark:bg-[#1D3832] rounded-md relative flex items-end">
              <div
                className="w-full bg-[#F59E0B] rounded-md"
                style={{ height: `${(d.craving / 5) * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-[#55726B] dark:text-[#8FAAA3] uppercase">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
