import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export type FocusSession = {
  id: string;
  user_id: string;
  subject: string | null;
  topic: string | null;
  duration_minutes: number;
  created_at: string;
};

export type FocusStats = {
  todayTotalMin: number;
  todaySessions: number;
  allTimeTotalMin: number;
  allTimeCount: number;
  weekData: { day: string; total_min: number }[];
};

export function useFocusData() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState<FocusStats>({
    todayTotalMin: 0,
    todaySessions: 0,
    allTimeTotalMin: 0,
    allTimeCount: 0,
    weekData: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/user/focus?t=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        
        if (data.recentSessions) {
          setSessions(data.recentSessions.map((s: any) => ({
            ...s,
            created_at: s.started_at,
            duration_minutes: s.duration_min
          })));
        }
        
        // Parse weekData properly (backend returns date strings in 'day')
        const days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
        const today = new Date();
        const weekArr = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const iso = d.toISOString().split('T')[0];
          const daySessions = data.weekData?.filter((s: { day: string; total_min: number }) => s.day.split('T')[0] === iso) || [];
          const dailyTotal = daySessions.reduce((acc: number, curr: any) => acc + (Number(curr.total_min) || 0), 0);
          const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
          return { day: dayName, total_min: dailyTotal };
        });

        setStats({
          todayTotalMin: Number(data.todayTotalMin) || 0,
          todaySessions: Number(data.todaySessions) || 0,
          allTimeTotalMin: Number(data.allTimeTotalMin) || 0,
          allTimeCount: Number(data.allTimeCount) || 0,
          weekData: weekArr,
        });
      } else {
        const err = await res.json();
        console.error("API GET Error:", err);
        alert("Veriler yüklenirken hata oluştu: " + (err.error || res.statusText));
      }
    } catch(e: any) {
      console.error("Fetch Exception:", e);
      alert("Bağlantı hatası: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const refresh = () => fetchSessions();

  const handleTimerComplete = async (subject: string | null, topic: string | null, duration_minutes: number) => {
    if (!user) return;

    const optimisticSession: FocusSession = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      subject,
      topic,
      duration_minutes,
      created_at: new Date().toISOString(),
    };

    setSessions((prev) => [optimisticSession, ...prev]);
    setStats((prev) => ({
      ...prev,
      todayTotalMin: prev.todayTotalMin + duration_minutes,
      todaySessions: prev.todaySessions + 1,
      allTimeCount: prev.allTimeCount + 1,
      allTimeTotalMin: prev.allTimeTotalMin + duration_minutes,
    }));

    try {
      const res = await fetch('/api/user/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          taskName: null,
          mode: 'pomodoro',
          durationMin: duration_minutes,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch (e: any) {
      console.error("Kayıt hatası:", e);
      alert("HATA: " + e.message);
      setSessions((prev) => prev.filter(s => s.id !== optimisticSession.id));
      // Simplistic rollback for stats:
      setStats((prev) => ({
        ...prev,
        todayTotalMin: prev.todayTotalMin - duration_minutes,
        todaySessions: prev.todaySessions - 1,
        allTimeCount: prev.allTimeCount - 1,
        allTimeTotalMin: prev.allTimeTotalMin - duration_minutes,
      }));
    }
  };

  return { sessions, stats, loading, handleTimerComplete, refresh };
}
