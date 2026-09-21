import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FocusSession } from '@/hooks/useFocusData';

type ChartProps = {
  weekData: { day: string; total_min: number }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-xl">
        <p className="text-gray-300 font-medium mb-1">{label}</p>
        <p className="text-emerald-400 font-bold text-lg">
          {payload[0].value} Dakika
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyFocusChart({ weekData }: ChartProps) {
  // Convert weekData which is {day: 'Pzt', total_min: 0} to the format the chart expects: {name: 'Pzt', dakika: 0}
  const chartData = useMemo(() => {
    return weekData.map(d => ({ name: d.day, dakika: d.total_min }));
  }, [weekData]);

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value} dk`}
          />
          <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} content={<CustomTooltip />} />
          
          <Bar dataKey="dakika" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.dakika > 0 ? '#10B981' : '#374151'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
