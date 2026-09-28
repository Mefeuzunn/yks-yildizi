'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Target, Brain, Activity, Clock, BarChart3, 
  PieChart, LineChart, Calendar, X, Plus, Sparkles, BookOpen, 
  Award, Zap, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

const SUBJECT_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Matematik':   { emoji: '📐', color: '#3b82f6' },
  'Geometri':    { emoji: '📐', color: '#6366f1' },
  'Türkçe':      { emoji: '📖', color: '#ef4444' },
  'Edebiyat':    { emoji: '✍️', color: '#ec4899' },
  'Fizik':       { emoji: '⚡', color: '#06b6d4' },
  'Kimya':       { emoji: '🧪', color: '#10b981' },
  'Biyoloji':    { emoji: '🔬', color: '#8b5cf6' },
  'Tarih':       { emoji: '🏛️', color: '#f59e0b' },
  'Coğrafya':    { emoji: '🌍', color: '#14b8a6' },
  'Felsefe':     { emoji: '🤔', color: '#fb923c' },
  'Din Kültürü': { emoji: '☪️', color: '#84cc16' },
  'Diğer':       { emoji: '🎯', color: '#a855f7' },
};

export default function AnalysisTab() {
  const [examType, setExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  // Deneme Ekleme Form State
  const [newExam, setNewExam] = useState({
    name: '',
    date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    turkce: '', mat: '', fen: '', sosyal: '', // TYT
    fizik: '', kimya: '', biyo: '' // AYT
  });

  const [examsData, setExamsData] = useState<{ TYT: any[]; AYT: any[] }>({ TYT: [], AYT: [] });
  const [focusData, setFocusData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verileri çek
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [examsRes, focusRes, dashRes] = await Promise.all([
        fetch('/api/user/exams', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/user/focus?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/user/dashboard', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      // Denemeleri ayrıştır
      const formatted = { TYT: [] as any[], AYT: [] as any[] };
      if (Array.isArray(examsRes)) {
        examsRes.forEach(exam => {
          const net = Number(exam.totalNet) || 0;
          const mapped = {
            id: exam.id,
            name: exam.name || 'Deneme Sınavı',
            date: new Date(exam.date).toLocaleDateString('tr-TR'),
            net: net,
            breakdown: {
              turkce: Number(exam.turkishNet) || 0,
              mat: Number(exam.mathNet) || 0,
              fen: Number(exam.scienceNet) || 0,
              sosyal: Number(exam.socialNet) || 0,
              fizik: Number(exam.scienceNet ? exam.scienceNet / 3 : 0),
              kimya: Number(exam.scienceNet ? exam.scienceNet / 3 : 0),
              biyo: Number(exam.scienceNet ? exam.scienceNet / 3 : 0)
            }
          };
          if (exam.type === 'AYT') {
            formatted.AYT.push(mapped);
          } else {
            formatted.TYT.push(mapped);
          }
        });
      }
      setExamsData(formatted);
      setFocusData(focusRes);
      setDashboardData(dashRes);
    } catch (err) {
      console.error('Analysis data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentExams = examsData[examType] || [];
  const maxNet = examType === 'TYT' ? 120 : 80;

  // Gerçek Odak & Soru Metrikleri
  const weekTotalMin = useMemo(() => {
    if (!focusData?.weekData) return 0;
    return focusData.weekData.reduce((acc: number, curr: any) => acc + (Number(curr.total_min) || 0), 0);
  }, [focusData]);

  const weeklyQuestions = useMemo(() => {
    if (!focusData?.weekData) return 0;
    return focusData.weekData.reduce((acc: number, curr: any) => acc + (Number(curr.total_questions) || 0), 0);
  }, [focusData]);

  const allTimeTotalMin = Number(focusData?.allTimeTotalMin) || 0;
  const allTimeQuestions = Number(focusData?.allTimeQuestions) || Number(dashboardData?.stats?.solved_questions) || 0;
  const allTimeCorrect = Number(focusData?.allTimeCorrect) || 0;
  const allTimeWrong = Number(focusData?.allTimeWrong) || 0;
  const overallAccuracy = allTimeQuestions > 0 ? Math.round((allTimeCorrect / allTimeQuestions) * 100) : 0;

  // Günlük Çalışma Saatleri (Gerçek weekData)
  const studyHours = useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    if (!focusData?.weekData || focusData.weekData.length === 0) {
      return days.map(d => ({ day: d, hours: 0, questions: 0 }));
    }
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const iso = d.toISOString().split('T')[0];
      const match = focusData.weekData.find((w: any) => (w.day || '').split('T')[0] === iso);
      const dayMin = Number(match?.total_min) || 0;
      const dayQ = Number(match?.total_questions) || 0;
      const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
      return {
        day: dayName,
        hours: Number((dayMin / 60).toFixed(1)),
        minutes: dayMin,
        questions: dayQ,
      };
    });
  }, [focusData]);

  const maxStudy = useMemo(() => {
    const maxVal = Math.max(...studyHours.map(s => s.hours), 4);
    return Math.ceil(maxVal);
  }, [studyHours]);

  // Deneme İstatistikleri
  const latestNet = currentExams.length > 0 ? currentExams[currentExams.length - 1].net : 0;
  const avgNet = currentExams.length > 0 
    ? (currentExams.reduce((acc, curr) => acc + curr.net, 0) / currentExams.length)
    : 0;

  // SVG Çizgi Grafiği Hesaplamaları
  const pxPerExam = 70;
  const chartWidth = Math.max(500, currentExams.length * pxPerExam);
  const chartHeight = 150;

  const pointsString = currentExams.map((ex, i) => {
    const x = currentExams.length === 1 ? chartWidth / 2 : (i / (currentExams.length - 1)) * chartWidth;
    const y = chartHeight - ((ex.net / maxNet) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [currentExams]);

  // Yeni Deneme Ekle
  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.name.trim()) return;

    let net = 0;
    let t = 0, m = 0, f = 0, s = 0, fiz = 0, kim = 0, bio = 0;

    if (examType === 'TYT') {
      t = parseFloat(newExam.turkce) || 0;
      m = parseFloat(newExam.mat) || 0;
      f = parseFloat(newExam.fen) || 0;
      s = parseFloat(newExam.sosyal) || 0;
      net = parseFloat((t + m + f + s).toFixed(2));
    } else {
      m = parseFloat(newExam.mat) || 0;
      fiz = parseFloat(newExam.fizik) || 0;
      kim = parseFloat(newExam.kimya) || 0;
      bio = parseFloat(newExam.biyo) || 0;
      f = fiz + kim + bio;
      net = parseFloat((m + f).toFixed(2));
    }

    setIsSubmittingExam(true);
    try {
      const res = await fetch('/api/user/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_type: examType,
          exam_name: newExam.name.trim(),
          turkish_net: t,
          math_net: m,
          social_net: s,
          science_net: f,
          total_net: net,
          exam_date: new Date().toISOString()
        })
      });

      const newEntry = {
        id: Date.now(),
        name: newExam.name.trim(),
        date: new Date().toLocaleDateString('tr-TR'),
        net,
        breakdown: examType === 'TYT' 
          ? { turkce: t, mat: m, fen: f, sosyal: s }
          : { mat: m, fizik: fiz, kimya: kim, biyo: bio }
      };

      setExamsData(prev => ({
        ...prev,
        [examType]: [...prev[examType], newEntry]
      }));

      setShowAddForm(false);
      setNewExam({
        name: '', date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
        turkce: '', mat: '', fen: '', sosyal: '', fizik: '', kimya: '', biyo: ''
      });
    } catch (err) {
      console.error('Deneme ekleme hatası:', err);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Ders Bazlı Dağılım
  const subjectBreakdown = focusData?.subjectBreakdown || [];
  const topSubject = subjectBreakdown.length > 0 ? subjectBreakdown[0] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.2 }} 
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}
    >
      
      {/* ─── Başlık ve Hızlı Eylemler ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            📊 Kapsamlı Analiz & Gelişim Paneli
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Odak oturumların, çözdüğün sorular, deneme netlerin ve YZ tabanlı öğrenci analizlerin tek ekranda.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={loadAllData} 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
            title="Verileri Yenile"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Yenile
          </button>
        </div>
      </div>

      {/* ─── 4 Ana KPI Kartı (Gerçek Verilerle Canlı) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { 
            title: 'Haftalık Odak Süresi', 
            value: `${Math.floor(weekTotalMin / 60)}s ${weekTotalMin % 60}d`, 
            sub: allTimeTotalMin > 0 ? `Toplam: ${(allTimeTotalMin / 60).toFixed(1)} saat odak` : 'Bu hafta ilk oturumunu yap', 
            icon: <Clock size={20} />, 
            color: '#f59e0b' 
          },
          { 
            title: 'Çözülen Soru (Haftalık)', 
            value: `${weeklyQuestions} Soru`, 
            sub: allTimeQuestions > 0 ? `Tüm zamanlar: ${allTimeQuestions} soru` : 'Oturum sonlarında soru kaydet', 
            icon: <Target size={20} />, 
            color: '#8b5cf6' 
          },
          { 
            title: 'Soru Doğruluk Oranı', 
            value: allTimeQuestions > 0 ? `%${overallAccuracy}` : '%0', 
            sub: allTimeQuestions > 0 ? `${allTimeCorrect} Doğru • ${allTimeWrong} Yanlış` : 'Henüz soru verisi yok', 
            icon: <Activity size={20} />, 
            color: '#10b981' 
          },
          { 
            title: `Güncel ${examType} Neti`, 
            value: latestNet > 0 ? `${latestNet} Net` : '0.0 Net', 
            sub: currentExams.length > 0 ? `Ortalama: ${avgNet.toFixed(1)} Net (${currentExams.length} deneme)` : 'Deneme ekleyerek takip et', 
            icon: <TrendingUp size={20} />, 
            color: '#38bdf8' 
          },
        ].map((kpi, i) => (
          <div key={i} className="premium-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: kpi.color }}>
              <div style={{ padding: '0.5rem', backgroundColor: `${kpi.color}15`, borderRadius: '10px' }}>{kpi.icon}</div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                Canlı Veri
              </span>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 600 }}>{kpi.title}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── Ana Grafikler Bölümü (Deneme Takibi & Günlük Odak) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        
        {/* Sol: İnteraktif Deneme Takip Çizgisi */}
        <div className="premium-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <LineChart size={18} color={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} /> Deneme Net Gelişimi
            </h3>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', fontSize: '12px', fontWeight: 700 }}
              >
                <Plus size={15} /> Yeni Ekle
              </button>

              <div style={{ display: 'flex', backgroundColor: 'var(--secondary)', borderRadius: '8px', padding: '0.2rem' }}>
                <button 
                  onClick={() => { setExamType('TYT'); setSelectedExam(null); }}
                  style={{ 
                    padding: '0.25rem 0.85rem', borderRadius: '6px', border: 'none', 
                    backgroundColor: examType === 'TYT' ? '#38bdf8' : 'transparent', 
                    color: examType === 'TYT' ? '#fff' : 'var(--text-muted)', 
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  TYT
                </button>
                <button 
                  onClick={() => { setExamType('AYT'); setSelectedExam(null); }}
                  style={{ 
                    padding: '0.25rem 0.85rem', borderRadius: '6px', border: 'none', 
                    backgroundColor: examType === 'AYT' ? '#8b5cf6' : 'transparent', 
                    color: examType === 'AYT' ? '#fff' : 'var(--text-muted)', 
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' 
                  }}
                >
                  AYT
                </button>
              </div>
            </div>
          </div>

          {/* Yeni Deneme Ekleme Formu */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddExam}
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Yeni {examType} Denemesi Ekle
                  </h4>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input type="text" placeholder="Yayın Adı (Örn: 3D, Bilgi Sarmal)" required value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '13px' }} />
                  <input type="text" placeholder="Tarih" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '13px' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  {examType === 'TYT' ? (
                    <>
                      <input type="number" step="0.25" placeholder="Türkçe" required value={newExam.turkce} onChange={e => setNewExam({...newExam, turkce: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Matematik" required value={newExam.mat} onChange={e => setNewExam({...newExam, mat: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Fen" required value={newExam.fen} onChange={e => setNewExam({...newExam, fen: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Sosyal" required value={newExam.sosyal} onChange={e => setNewExam({...newExam, sosyal: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                    </>
                  ) : (
                    <>
                      <input type="number" step="0.25" placeholder="Matematik" required value={newExam.mat} onChange={e => setNewExam({...newExam, mat: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Fizik" required value={newExam.fizik} onChange={e => setNewExam({...newExam, fizik: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Kimya" required value={newExam.kimya} onChange={e => setNewExam({...newExam, kimya: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                      <input type="number" step="0.25" placeholder="Biyoloji" required value={newExam.biyo} onChange={e => setNewExam({...newExam, biyo: e.target.value})} className="premium-input" style={{ width: '100%', fontSize: '12px' }} />
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isSubmittingExam} className="btn-interactive" style={{ backgroundColor: examType === 'TYT' ? '#38bdf8' : '#8b5cf6', fontSize: '13px', padding: '0.45rem 1rem' }}>
                    {isSubmittingExam ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* SVG Çizgi Grafiği */}
          <div 
            ref={scrollContainerRef}
            style={{ flex: 1, position: 'relative', minHeight: '220px', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'thin' }}
            className="smooth-scroll"
          >
            {currentExams.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', color: '#64748b' }}>
                <BookOpen size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <span style={{ fontSize: '13px' }}>Henüz kaydedilmiş {examType} denemesi bulunamadı.</span>
                <button onClick={() => setShowAddForm(true)} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#8b5cf6', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  + İlk Denemeni Ekle
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', width: `${chartWidth}px`, height: '170px' }}>
                {[0, maxNet * 0.25, maxNet * 0.5, maxNet * 0.75, maxNet].reverse().map((val, i) => (
                  <div key={i} style={{ position: 'absolute', top: `${(i / 4) * 160}px`, left: 0, width: '100%', borderTop: '1px dashed var(--border-light)', zIndex: 1 }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '0', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--surface)', paddingRight: '4px' }}>{val}</span>
                  </div>
                ))}
                
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '160px', zIndex: 2 }}>
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={examType === 'TYT' ? "rgba(56,189,248, 0.4)" : "rgba(139,92,246, 0.4)"} />
                        <stop offset="100%" stopColor={examType === 'TYT' ? "rgba(56,189,248, 0)" : "rgba(139,92,246, 0)"} />
                      </linearGradient>
                    </defs>
                    
                    {currentExams.length > 1 && (
                      <>
                        <motion.polygon 
                          key={`poly-${examType}-${currentExams.length}`}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                          points={`0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`} 
                          fill="url(#gradientLine)" 
                        />
                        <motion.polyline 
                          key={`line-${examType}-${currentExams.length}`}
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }}
                          fill="none" stroke={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} strokeWidth="3" points={pointsString} strokeLinejoin="round" strokeLinecap="round" 
                        />
                      </>
                    )}
                    
                    {currentExams.map((ex, i) => {
                      const x = currentExams.length === 1 ? chartWidth / 2 : (i / (currentExams.length - 1)) * chartWidth;
                      const y = chartHeight - ((ex.net / maxNet) * chartHeight);
                      const isSelected = selectedExam?.id === ex.id;
                      
                      return (
                        <g key={ex.id || i} onClick={() => setSelectedExam(ex)} style={{ cursor: 'pointer' }}>
                          <circle cx={x} cy={y} r="15" fill="transparent" />
                          <motion.circle 
                            initial={{ scale: 0 }} animate={{ scale: isSelected ? 1.5 : 1 }} transition={{ delay: 0.2 + (i * 0.05), type: 'spring' }}
                            cx={x} cy={y} r="5" 
                            fill={isSelected ? (examType === 'TYT' ? "#38bdf8" : "#8b5cf6") : "var(--surface)"} 
                            stroke={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} strokeWidth="2" 
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                
                <div style={{ position: 'absolute', top: '175px', left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', zIndex: 3 }}>
                  {currentExams.map((ex, i) => {
                    const x = currentExams.length === 1 ? '50%' : `${(i / (currentExams.length - 1)) * 100}%`;
                    return (
                      <span key={ex.id || i} style={{ position: 'absolute', left: x, fontSize: '0.68rem', color: 'var(--text-secondary)', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                        {ex.name.substring(0, 10)}{ex.name.length > 10 ? '...' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Seçilen Deneme Detayları */}
          <AnimatePresence>
            {selectedExam && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-strong)', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: examType === 'TYT' ? '#38bdf8' : '#8b5cf6', fontWeight: 700 }}>{selectedExam.date}</div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selectedExam.name}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedExam.net} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net</span></div>
                    <button onClick={() => setSelectedExam(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                  {Object.entries(selectedExam.breakdown || {}).map(([key, val]) => (
                    <div key={key} style={{ backgroundColor: 'var(--secondary)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{Number(val).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sağ: Günlük Çalışma Saati & Soru Grafiği (Gerçek weekData) */}
        <div className="premium-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Calendar size={18} color="#f59e0b" /> Günlük Odak & Soru Grafiği
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>Son 7 günde tamamlanan gerçek odak oturumları</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b' }}>
                {Math.floor(weekTotalMin / 60)}s {weekTotalMin % 60}d
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Toplam Odak</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', gap: '8px', paddingTop: '10px' }}>
            {studyHours.map((d, i) => {
              const hPct = maxStudy > 0 ? (d.hours / maxStudy) * 100 : 0;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                  <span style={{ fontSize: '0.7rem', color: d.hours > 0 ? '#fcd34d' : '#64748b', fontWeight: 700 }}>
                    {d.hours > 0 ? `${d.hours}s` : '0'}
                  </span>
                  
                  <div style={{ width: '100%', maxWidth: '28px', height: '110px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: `${Math.max(d.hours > 0 ? 8 : 0, hPct)}%` }} 
                      transition={{ duration: 0.8, delay: i * 0.08, type: 'spring' }}
                      style={{ 
                        width: '100%', 
                        background: d.hours > 0 ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' : 'transparent', 
                        borderRadius: '6px',
                        boxShadow: d.hours > 0 ? '0 0 12px rgba(245,158,11,0.25)' : 'none'
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.75rem', color: d.hours > 0 ? '#e2e8f0' : 'var(--text-muted)', fontWeight: 600 }}>{d.day}</span>
                  {d.questions > 0 && (
                    <span style={{ fontSize: '10px', color: '#8b5cf6', fontWeight: 700 }}>{d.questions}S</span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: '#94a3b8' }}>
            <span>🟡 Odak Süresi (Saat)</span>
            <span>🟣 Çözülen Soru Sayısı</span>
          </div>
        </div>

      </div>

      {/* ─── DERS BAZLI ODAK & SORU ANALİZİ (YEPYENİ KAPSAMLI BÖLÜM) ─── */}
      <div className="premium-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <BookOpen size={18} color="#8b5cf6" /> Derslere Göre Odak & Soru Dağılımı
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Hangi derse ne kadar çalıştın ve ne kadar soru çözdün?</p>
          </div>
          {subjectBreakdown.length > 0 && (
            <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, background: 'rgba(139,92,246,0.15)', padding: '4px 10px', borderRadius: '12px' }}>
              {subjectBreakdown.length} Farklı Ders
            </span>
          )}
        </div>

        {subjectBreakdown.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🎯</span>
            <p style={{ margin: 0, fontSize: '13px' }}>Henüz ders seçilmiş bir odak oturumu kaydedilmedi.</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Odak sayfasında oturum bittiğinde dersini seçtiğinde ders analizin burada otomatik listelenecektir.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {subjectBreakdown.map((item: any, i: number) => {
              const cfg = SUBJECT_CONFIG[item.subject] || SUBJECT_CONFIG['Diğer'];
              const pctOfTotal = allTimeTotalMin > 0 ? Math.round((item.total_min / allTimeTotalMin) * 100) : 0;
              const subAccuracy = item.total_questions > 0 ? Math.round((item.total_correct / item.total_questions) * 100) : null;
              
              return (
                <div 
                  key={i} 
                  style={{ 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${cfg.color}30`,
                    display: 'flex', flexDirection: 'column', gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{cfg.emoji}</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>{item.subject}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: cfg.color }}>
                      {Math.floor(item.total_min / 60)}s {item.total_min % 60}d
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, Math.max(5, pctOfTotal))}%`, 
                        height: '100%', 
                        backgroundColor: cfg.color, 
                        borderRadius: '3px' 
                      }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#94a3b8' }}>
                    <span>Odağın %{pctOfTotal}'i</span>
                    <span>{item.session_count} Oturum</span>
                  </div>

                  {/* Soru Detayları (Varsa) */}
                  {item.total_questions > 0 ? (
                    <div style={{ 
                      marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' 
                    }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>📝 {item.total_questions} Soru</span>
                      <span style={{ color: '#4ade80' }}>{item.total_correct}D</span>
                      <span style={{ color: '#f87171' }}>{item.total_wrong}Y</span>
                      {subAccuracy !== null && (
                        <span style={{ color: '#c4b5fd', fontWeight: 700 }}>%{subAccuracy} Başarı</span>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '2px', fontSize: '10px', color: '#64748b' }}>
                      Sadece konu/teori çalışıldı
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Alt Bölüm: YZ Eğitim Koçu & Soru/Hata Dağılımı ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* YZ Eğitim Koçu Analizi (Dinamik & Gerçek Verilere Dayalı) */}
        <div className="premium-card" style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', position: 'relative', zIndex: 2 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Brain size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>YZ Eğitim Koçu Raporu</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Öğrenci Verilerine Dayalı Bireysel Analiz</span>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 2 }}>
            {allTimeTotalMin === 0 && allTimeQuestions === 0 ? (
              <p>
                Analiz sistemimiz seni tanımaya başlıyor. Odak sayfasında çalışma oturumları yapıp soru sayılarını girdikçe YZ Koçun eksiklerini ve çalışma dengeni raporlayacaktır.
              </p>
            ) : (
              <p>
                Bu hafta toplam <strong style={{ color: '#f59e0b' }}>{Math.floor(weekTotalMin / 60)} saat {weekTotalMin % 60} dakika</strong> odaklandın ve <strong style={{ color: '#8b5cf6' }}>{weeklyQuestions} soru</strong> çözdün. 
                {topSubject && (
                  <> En yoğun çalıştığın alan <strong style={{ color: '#38bdf8' }}>{topSubject.subject}</strong> oldu.</>
                )}
                {overallAccuracy > 70 ? (
                  <> Çözdüğün sorulardaki <strong style={{ color: '#10b981' }}>%{overallAccuracy} doğruluk oranı</strong> yüksek bir kavrama seviyesine işaret ediyor.</>
                ) : allTimeQuestions > 0 ? (
                  <> Yanlış yaptığın soruları Hata Defteri üzerinden tekrar çözmen net artışını hızlandıracaktır.</>
                ) : null}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--secondary)', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #10b981' }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>GÜÇLÜ YÖN</div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  {topSubject ? `${topSubject.subject} disiplini ve odak istikrarı` : 'Gelişim analizi bekleniyor'}
                </div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--secondary)', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #ef4444' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.25rem' }}>GELİŞİM ALANI</div>
                <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  {allTimeWrong > 0 ? `${allTimeWrong} adet yanlış sorunun analizi` : 'Daha fazla soru çözümü'}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--accent)', margin: 0 }}>
              <strong>Koçun Tavsiyesi:</strong> Odaklanma sonrasında doğru ve yanlışlarını kaydetmeye devam et; her test sonucun başarı grafiğini daha keskin kılacaktır.
            </p>
          </div>
        </div>

        {/* Soru Başarı & Hata Dağılımı */}
        <div className="premium-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', margin: 0 }}>
            <PieChart size={18} color="#ec4899" /> Soru Başarı & Dağılım Analizi
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, flexWrap: 'wrap' }}>
            
            {/* Donut Chart */}
            <div style={{ 
              width: '130px', height: '130px', borderRadius: '50%', 
              background: allTimeQuestions > 0 
                ? `conic-gradient(#10b981 0% ${overallAccuracy}%, #ef4444 ${overallAccuracy}% 100%)`
                : 'conic-gradient(#374151 0% 100%)',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0
            }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {allTimeQuestions}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Soru</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981' }}></span> Doğru Cevaplar
                </div>
                <span style={{ fontWeight: 700, color: '#4ade80' }}>
                  {allTimeCorrect} ({allTimeQuestions > 0 ? Math.round((allTimeCorrect / allTimeQuestions) * 100) : 0}%)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#ef4444' }}></span> Yanlış Cevaplar
                </div>
                <span style={{ fontWeight: 700, color: '#f87171' }}>
                  {allTimeWrong} ({allTimeQuestions > 0 ? Math.round((allTimeWrong / allTimeQuestions) * 100) : 0}%)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></span> Tamamlanan Odak
                </div>
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>
                  {focusData?.allTimeCount || 0} Oturum
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#8b5cf6' }}></span> Toplam Odak
                </div>
                <span style={{ fontWeight: 700, color: '#c4b5fd' }}>
                  {Math.floor(allTimeTotalMin / 60)}s {allTimeTotalMin % 60}d
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}
