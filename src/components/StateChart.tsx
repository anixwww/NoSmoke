import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot
} from 'recharts';
import { DayRating } from '../types';

interface StateChartProps {
  days: Record<string, DayRating>;
}

export const StateChart: React.FC<StateChartProps> = ({ days }) => {
  const data = React.useMemo(() => {
    const last3Days = [];
    const today = new Date();
    
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const rating = days[dateStr];
      
      last3Days.push({
        date: d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }),
        rawDate: dateStr,
        mood: rating ? rating.mood : null,
        craving: rating ? rating.craving : null,
        anxiety: rating ? rating.anxiety : null,
        hasData: !!rating
      });
    }
    return last3Days;
  }, [days]);

  return (
    <div className="mb-4 bg-white/70 dark:bg-[#1c1c21]/70 border border-[#B7CDC6] dark:border-[#2d2d35] rounded-2xl p-4 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#12302B] dark:text-[#f4f4f5] mb-3">Динаміка стану</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#B7CDC6" opacity={0.2} />
            <XAxis dataKey="date" stroke="#55726B" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis domain={[0, 6]} hide />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload;
                  return (
                    <div className="bg-[#112723] text-white p-2 rounded text-xs space-y-1">
                      <div className="font-bold">{p.rawDate}</div>
                      {p.hasData ? (
                        <>
                          <div>Настрій: {p.mood ?? '-'}</div>
                          <div>Тяга: {p.craving ?? '-'}</div>
                          <div>Тривожність: {p.anxiety ?? '-'}</div>
                        </>
                      ) : (
                        <div>Немає даних</div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              name="Настрій"
              stroke="#1E8A69" 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="craving" 
              name="Тяга"
              stroke="#F59E0B" 
              strokeWidth={2} 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="anxiety" 
              name="Тривожність"
              stroke="#5B54C8" 
              strokeWidth={2} 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
