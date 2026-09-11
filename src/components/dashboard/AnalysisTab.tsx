import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, Brain, Activity, Clock, BarChart3, PieChart, LineChart, Calendar, X, Plus } from 'lucide-react';

export default function AnalysisTab() {
  const [examType, setExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newExam, setNewExam] = useState({
    name: '',
    date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    turkce: '', mat: '', fen: '', sosyal: '', // TYT
    fizik: '', kimya: '', biyo: '' // AYT (matematik ortak alan)
  });

  // Deep Mock Data as State

  const [examsData, setExamsData] = useState({ TYT: [], AYT: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch('/api/user/exams');
        if (res.ok) {
          const data = await res.json();
          // Separate into TYT and AYT
          const formatted = { TYT: [], AYT: [] };
          data.forEach(exam => {
             const net = exam.totalNet || 0;
             const mapped = {
               id: exam.id,
               name: exam.name || 'Deneme Sınavı',
               date: new Date(exam.date).toLocaleDateString('tr-TR'),
               net: net,
               breakdown: { turkce: exam.turkishNet, mat: exam.mathNet, fen: exam.scienceNet, sosyal: exam.socialNet, fizik: exam.scienceNet/3, kimya: exam.scienceNet/3, biyo: exam.scienceNet/3 }
             };
             if (exam.type === 'TYT') formatted.TYT.push(mapped);
             else formatted.AYT.push(mapped);
          });
          setExamsData(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);
  

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentExams = examsData[examType];
  const maxNet = examType === 'TYT' ? 120 : 80;
  
  const studyHours = [
    { day: 'Pzt', hours: 0 }, { day: 'Sal', hours: 0 }, { day: 'Çar', hours: 0 },
    { day: 'Per', hours: 0 }, { day: 'Cum', hours: 0 }, { day: 'Cmt', hours: 0 },
    { day: 'Paz', hours: 0 }
  ];
  const maxStudy = 10;

  // SVG Line Chart calculations
  const pxPerExam = 70; // Horizontal spacing between points
  const chartWidth = Math.max(500, currentExams.length * pxPerExam);
  const chartHeight = 150;
  
  const pointsString = currentExams.map((ex, i) => {
    // If only one exam, place it in the middle. Otherwise, spread evenly.
    const x = currentExams.length === 1 ? chartWidth / 2 : (i / (currentExams.length - 1)) * chartWidth;
    const y = chartHeight - ((ex.net / maxNet) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  // Scroll to rightmost when exams change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [currentExams]);

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.name) return;

    let net = 0;
    let breakdown: any = {};

    if (examType === 'TYT') {
      const t = parseFloat(newExam.turkce) || 0;
      const m = parseFloat(newExam.mat) || 0;
      const f = parseFloat(newExam.fen) || 0;
      const s = parseFloat(newExam.sosyal) || 0;
      net = t + m + f + s;
      breakdown = { turkce: t, mat: m, fen: f, sosyal: s };
    } else {
      const m = parseFloat(newExam.mat) || 0;
      const f = parseFloat(newExam.fizik) || 0;
      const k = parseFloat(newExam.kimya) || 0;
      const b = parseFloat(newExam.biyo) || 0;
      net = m + f + k + b;
      breakdown = { mat: m, fizik: f, kimya: k, biyo: b };
    }

    const newEntry = {
      id: Date.now(),
      name: newExam.name,
      date: newExam.date,
      net,
      breakdown
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
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            📊 Profesyonel İstatistik ve Takip
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tüm denemelerin, çalışma saatlerin ve YZ tabanlı gelişim raporun tek bir ekranda.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={18} /> Raporu PDF İndir
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'Güncel TYT Neti', value: examsData.TYT[examsData.TYT.length - 1]?.net.toString() || '0', sub: 'Son deneme', icon: <TrendingUp size={20} />, color: '#3b82f6' },
          { title: 'Haftalık Çalışma', value: '0s 0d', sub: 'Veri bekleniyor', icon: <Clock size={20} />, color: '#f59e0b' },
          { title: 'Net İstikrarı (Std Sapma)', value: '± 0', sub: 'Veri bekleniyor', icon: <Activity size={20} />, color: '#10b981' },
          { title: 'Çözülen Soru (Haftalık)', value: '0', sub: 'Veri bekleniyor', icon: <Target size={20} />, color: '#8b5cf6' },
        ].map((kpi, i) => (
          <div key={i} className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: kpi.color }}>
              <div style={{ padding: '0.5rem', backgroundColor: `${kpi.color}15`, borderRadius: '8px' }}>{kpi.icon}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{kpi.title}</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {/* Inside we need to fix the children, but we'll do that using flex basis. */}
        
        {/* Interactive Line Chart */}
        <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LineChart size={18} color={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} /> Deneme Takibi
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem' }}
              >
                <Plus size={16} /> Yeni Ekle
              </button>

              {/* TYT / AYT Toggle */}
              <div style={{ display: 'flex', backgroundColor: 'var(--secondary)', borderRadius: '8px', padding: '0.25rem' }}>
                <button 
                  onClick={() => { setExamType('TYT'); setSelectedExam(null); setShowAddForm(false); }}
                  style={{ padding: '0.25rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: examType === 'TYT' ? '#38bdf8' : 'transparent', color: examType === 'TYT' ? '#fff' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  TYT
                </button>
                <button 
                  onClick={() => { setExamType('AYT'); setSelectedExam(null); setShowAddForm(false); }}
                  style={{ padding: '0.25rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: examType === 'AYT' ? '#8b5cf6' : 'transparent', color: examType === 'AYT' ? '#fff' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  AYT
                </button>
              </div>
            </div>
          </div>

          {/* Add Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddExam}
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Yeni {examType} Denemesi Ekle</h4>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" placeholder="Yayın Adı (Örn: 3D Yayınları)" required value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                  <input type="text" placeholder="Tarih" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {examType === 'TYT' ? (
                    <>
                      <input type="number" step="0.25" placeholder="Türkçe Net" required value={newExam.turkce} onChange={e => setNewExam({...newExam, turkce: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Matematik Net" required value={newExam.mat} onChange={e => setNewExam({...newExam, mat: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Fen Net" required value={newExam.fen} onChange={e => setNewExam({...newExam, fen: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Sosyal Net" required value={newExam.sosyal} onChange={e => setNewExam({...newExam, sosyal: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                    </>
                  ) : (
                    <>
                      <input type="number" step="0.25" placeholder="Matematik Net" required value={newExam.mat} onChange={e => setNewExam({...newExam, mat: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Fizik Net" required value={newExam.fizik} onChange={e => setNewExam({...newExam, fizik: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Kimya Net" required value={newExam.kimya} onChange={e => setNewExam({...newExam, kimya: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                      <input type="number" step="0.25" placeholder="Biyoloji Net" required value={newExam.biyo} onChange={e => setNewExam({...newExam, biyo: e.target.value})} className="premium-input" style={{ width: '100%' }} />
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-interactive" style={{ backgroundColor: examType === 'TYT' ? '#38bdf8' : '#8b5cf6' }}>Ekle ve Kaydet</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div 
            ref={scrollContainerRef}
            style={{ flex: 1, position: 'relative', minHeight: '240px', overflowX: 'auto', overflowY: 'hidden', 
                     scrollbarWidth: 'thin', scrollbarColor: 'var(--border-strong) transparent' }}
            className="smooth-scroll"
          >
            <div style={{ position: 'relative', width: `${chartWidth}px`, height: '180px' }}>
              {/* Y Axis Guides */}
              {[0, maxNet * 0.25, maxNet * 0.5, maxNet * 0.75, maxNet].reverse().map((val, i) => (
                <div key={i} style={{ position: 'absolute', top: `${(i / 4) * 180}px`, left: 0, width: '100%', borderTop: '1px dashed var(--border-light)', zIndex: 1 }}>
                  <span style={{ position: 'absolute', top: '-10px', left: '0', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--surface)', paddingRight: '4px' }}>{val}</span>
                </div>
              ))}
              
              {/* SVG Line */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '180px', zIndex: 2 }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={examType === 'TYT' ? "rgba(56,189,248, 0.4)" : "rgba(139,92,246, 0.4)"} />
                      <stop offset="100%" stopColor={examType === 'TYT' ? "rgba(56,189,248, 0)" : "rgba(139,92,246, 0)"} />
                    </linearGradient>
                  </defs>
                  
                  {currentExams.length > 1 && (
                    <>
                      {/* Area under line */}
                      <motion.polygon 
                        key={`poly-${examType}-${currentExams.length}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                        points={`0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`} 
                        fill="url(#gradientLine)" 
                      />
                      {/* Line */}
                      <motion.polyline 
                        key={`line-${examType}-${currentExams.length}`}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }}
                        fill="none" stroke={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} strokeWidth="3" points={pointsString} strokeLinejoin="round" strokeLinecap="round" 
                      />
                    </>
                  )}
                  
                  {/* Interactive Points */}
                  {currentExams.map((ex, i) => {
                    const x = currentExams.length === 1 ? chartWidth / 2 : (i / (currentExams.length - 1)) * chartWidth;
                    const y = chartHeight - ((ex.net / maxNet) * chartHeight);
                    const isSelected = selectedExam?.id === ex.id;
                    
                    return (
                      <g key={ex.id} onClick={() => setSelectedExam(ex)} style={{ cursor: 'pointer' }}>
                        {/* Invisible larger circle for easier clicking */}
                        <circle cx={x} cy={y} r="15" fill="transparent" />
                        <motion.circle 
                          initial={{ scale: 0 }} animate={{ scale: isSelected ? 1.5 : 1 }} transition={{ delay: 0.5 + (i * 0.05), type: 'spring' }}
                          cx={x} cy={y} r="5" 
                          fill={isSelected ? (examType === 'TYT' ? "#38bdf8" : "#8b5cf6") : "var(--surface)"} 
                          stroke={examType === 'TYT' ? "#38bdf8" : "#8b5cf6"} strokeWidth="2" 
                          style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' : 'none' }}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              
              {/* X Axis Labels */}
              <div style={{ position: 'absolute', top: '195px', left: 0, width: '100%', display: 'flex', justifyContent: 'space-between', zIndex: 3 }}>
                {currentExams.map((ex, i) => {
                  const x = currentExams.length === 1 ? '50%' : `${(i / (currentExams.length - 1)) * 100}%`;
                  return (
                    <span key={ex.id} style={{ position: 'absolute', left: x, fontSize: '0.7rem', color: 'var(--text-secondary)', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                      {ex.name.substring(0, 10)}{ex.name.length > 10 ? '...' : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Selected Exam Details Panel */}
          <AnimatePresence>
            {selectedExam && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-strong)', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: examType === 'TYT' ? '#38bdf8' : '#8b5cf6', fontWeight: 600, marginBottom: '0.25rem' }}>{selectedExam.date}</div>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedExam.name} ({examType})</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedExam.net} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Net</span></div>
                     <button onClick={() => setSelectedExam(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                  {examType === 'TYT' ? (
                    <>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Türkçe</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.turkce}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matematik</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.mat}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fen</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.fen}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sosyal</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.sosyal}</div></div>
                    </>
                  ) : (
                    <>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matematik</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.mat}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fizik</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.fizik}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kimya</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.kimya}</div></div>
                      <div style={{ backgroundColor: 'var(--secondary)', padding: '0.75rem', borderRadius: '8px' }}><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Biyoloji</div><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedExam.breakdown.biyo}</div></div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Daily Study Hours (Bar Chart) */}
        <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} color="#f59e0b" /> Günlük Çalışma Saati</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px' }}>
            {studyHours.map((d, i) => {
              const hPct = (d.hours / maxStudy) * 100;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fcd34d', fontWeight: 600 }}>{d.hours}s</span>
                  <div style={{ width: '24px', height: '150px', backgroundColor: 'var(--border-light)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end' }}>
                    <motion.div 
                      initial={{ height: 0 }} animate={{ height: `${hPct}%` }} transition={{ duration: 1, delay: i * 0.1, type: 'spring' }}
                      style={{ width: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Area: AI Report & Distribution */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* AI Educator Report */}
        <div className="premium-card" style={{ flex: '1 1 300px', padding: '2rem', position: 'relative', overflow: 'hidden', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Brain size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>YZ Eğitim Koçu Analizi</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Güncel Verilere Dayalı Öğrenci Raporu</span>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 2 }}>
            <p>
              Yeterli veri bekleniyor... Sistemimize daha fazla deneme sınavı ve test sonucu ekledikçe yapay zeka eğitim koçunuz size özel analizler üretecektir.<strong style={{ color: 'var(--accent)' }}>yükseliş trendi</strong> var. Grafikteki son artış, çalışmalarının karşılığını aldığını gösteriyor.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '0.25rem' }}>GÜÇLÜ YÖN</div>
                <div style={{ fontSize: '0.85rem' }}>Henüz analiz edilemedi.</div>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--secondary)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.25rem' }}>GELİŞİM ALANI</div>
                <div style={{ fontSize: '0.85rem' }}>Henüz analiz edilemedi.</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
              <strong>Koçun Tavsiyesi:</strong> Analizlerimin isabetli olması için lütfen 'Deneme Takibi' bölümünden geçmiş sonuçlarını sisteme kaydet.</p>
          </div>
        </div>

        {/* Error Breakdown / Distribution */}
        <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}><PieChart size={18} color="#ec4899" /> Hata Dağılım Analizi</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flex: 1 }}>
            
            {/* Pure CSS Pie Chart (Conic Gradient) */}
            <div style={{ 
              width: '140px', height: '140px', borderRadius: '50%', 
              background: 'conic-gradient(#374151 0% 100%)',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
              {/* Inner Circle for Donut Effect */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>0 Soru</span>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }}></span> Bilgi / Konu Eksiği</div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f59e0b' }}></span> Dikkatsizlik / Okuma</div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#3b82f6' }}></span> İşlem Hatası</div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#a855f7' }}></span> Süre Yetmemesi</div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}
