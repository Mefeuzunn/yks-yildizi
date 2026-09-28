import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ChartProps = {
  weekData?: { day: string; total_min: number }[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <p style={{ color: '#d1d5db', fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>{label}</p>
        <p style={{ color: '#34d399', fontWeight: 800, fontSize: '15px', margin: 0 }}>
          {payload[0].value} Dakika
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyFocusChart({ weekData }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = useMemo(() => {
    if (!weekData || !Array.isArray(weekData)) return [];
    return weekData.map(d => ({ name: d.day, dakika: Number(d.total_min) || 0 }));
  }, [weekData]);

  if (!mounted) {
    return (
      <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
        Grafik yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ height: '220px', width: '100%', minWidth: 0, marginTop: '16px' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
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
          <Tooltip cursor={{ fill: '#374151', opacity: 0.3 }} content={<CustomTooltip />} />
          
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
