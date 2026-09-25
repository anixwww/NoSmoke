import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DayRating } from '../types';

interface StateChartProps {
  days: Record<string, DayRating>;
}

export const StateChart: React.FC<StateChartProps> = ({ days }) => {
  const data = React.useMemo(() => {
    const chartPoints = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rating = days[dateStr];

      const weekdayStr = d.toLocaleDateString('uk-UA', { weekday: 'short' });
      const capitalizedWeekday = weekdayStr.charAt(0).toUpperCase() + weekdayStr.slice(1);
      const dateFormatted = d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
      
      if (rating) {
        chartPoints.push({
          date: dateFormatted,
          weekday: capitalizedWeekday,
          displayLabel: capitalizedWeekday,
          rawDate: dateStr,
          time: 'Основна',
          mood: rating.mood,
          craving: rating.craving,
          anxiety: rating.anxiety,
          hasData: true,
          isIntermediate: false
        });

        if (rating.entries && rating.entries.length > 0) {
          const sortedEntries = [...rating.entries].sort((a, b) => a.time.localeCompare(b.time));
          sortedEntries.forEach((entry) => {
            chartPoints.push({
              date: dateFormatted,
              weekday: capitalizedWeekday,
              displayLabel: `${capitalizedWeekday} ${entry.time}`,
              rawDate: dateStr,
              time: entry.time,
              mood: entry.mood,
              craving: entry.craving,
              anxiety: entry.anxiety,
              hasData: true,
              isIntermediate: true,
              note: entry.note
            });
          });
        }
      } else {
        chartPoints.push({
          date: dateFormatted,
          weekday: capitalizedWeekday,
          displayLabel: capitalizedWeekday,
          rawDate: dateStr,
          time: '',
          mood: null,
          craving: null,
          anxiety: null,
          hasData: false,
          isIntermediate: false
        });
      }
    }
    return chartPoints;
  }, [days]);

  return (
    <div className="mb-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5] mb-1">
        Динаміка за останній тиждень
      </h3>
      <p className="text-[11px] text-[#55726B] dark:text-[#8FAAA3] mb-3">
        Нав’язливість думок (тяга) та Дратівливість
      </p>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 25, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#B7CDC6" opacity={0.2} />
            <XAxis dataKey="displayLabel" stroke="#55726B" fontSize={9} tickLine={false} axisLine={false} orientation="top" interval={0} />
            <YAxis domain={[0, 6]} hide />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg border border-[#1E8A69]/40">
                      <div className="font-bold flex items-center justify-between gap-2">
                        <span>{p.weekday}, {p.date}</span>
                        {p.time && p.time !== 'Основна' && (
                          <span className="text-[10px] font-mono text-[#4CC9A0] bg-[#1E8A69]/30 px-1.5 py-0.5 rounded">
                            {p.time}
                          </span>
                        )}
                      </div>
                      {p.hasData ? (
                        <>
                          <div>Нав'язливість (тяга): <span className="font-bold text-[#D97706]">{p.craving}</span></div>
                          <div>Дратівливість: <span className="font-bold text-[#EF4444]">{p.anxiety}</span></div>
                          <div>Настрій: <span className="font-bold text-[#10B981]">{p.mood}</span></div>
                          {p.note && <div className="text-[10px] italic opacity-90 mt-1">«{p.note}»</div>}
                        </>
                      ) : (
                        <div>Немає даних за цей день</div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="craving" 
              name="Нав'язливість"
              stroke="#D97706" 
              strokeWidth={2.5} 
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload.hasData || payload.craving === null || payload.craving === undefined) return <></>;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={payload.isIntermediate ? 3.5 : 5} 
                    fill="#D97706" 
                    stroke="#fff" 
                    strokeWidth={1.5} 
                  />
                );
              }}
            />
            <Line 
              type="monotone" 
              dataKey="anxiety" 
              name="Дратівливість"
              stroke="#EF4444" 
              strokeWidth={2.5} 
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload.hasData || payload.anxiety === null || payload.anxiety === undefined) return <></>;
                return (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={payload.isIntermediate ? 3.5 : 5} 
                    fill="#EF4444" 
                    stroke="#fff" 
                    strokeWidth={1.5} 
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-2.5 border-t border-[#B7CDC6]/30 dark:border-[#2d2d35] text-[11px] font-medium text-[#55726B] dark:text-[#8FAAA3]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block"></span>
          <span>Нав'язливість думок (тяга)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block"></span>
          <span>Дратівливість</span>
        </div>
      </div>
    </div>
  );
};
