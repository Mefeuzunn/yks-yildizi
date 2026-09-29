'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSimulations } from '@/lib/actions/simulations';
import SimulationFilter, { Category, Subject, Difficulty } from '@/components/simulations/SimulationFilter';
import SimulationViewer from '@/components/simulations/SimulationViewer';
import { useSimulationTracking } from '@/hooks/useSimulationTracking';
import { 
  Loader2, Play, X, Star, Beaker, Atom, FlaskConical, Dna, 
  ArrowLeft, Calculator, Sparkles, Compass, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simülasyon Oynatıcı Modal / Tam Ekran Bileşeni
function SimulationPlayer({ simulation, onClose }: { simulation: any, onClose: () => void }) {
  useSimulationTracking({ simulationId: simulation.id, intervalSeconds: 30 });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: '#080c14',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px',
        backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ color: 'white', fontWeight: 800, fontSize: '18px', margin: 0 }}>{simulation.title}</h2>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
              {simulation.category} • {simulation.subject}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
          backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399', borderRadius: '10px', fontSize: '13px', fontWeight: 600
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          Süre Takipte
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflow: 'hidden' }}>
        <SimulationViewer url={simulation.source_url} title={simulation.title} />
      </div>
    </motion.div>
  );
}

export default function SimulasyonlarPage() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('Tümü');
  const [subject, setSubject] = useState<Subject>('Tümü');
  const [difficulty, setDifficulty] = useState<Difficulty>(0);
  const [search, setSearch] = useState('');
  
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchData() {
        setIsLoading(true);
        const res = await getSimulations({ category, subject, difficulty, search });
        if (res.success && res.data) {
          setSimulations(res.data);
        }
        setIsLoading(false);
      }
      fetchData();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [category, subject, difficulty, search]);

  const getSubjectMeta = (subj: string) => {
    switch (subj) {
      case 'Fizik': 
        return { icon: <Atom color="#38bdf8" size={32} />, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' };
      case 'Kimya': 
        return { icon: <FlaskConical color="#34d399" size={32} />, color: '#34d399', bg: 'rgba(52,211,153,0.1)' };
      case 'Biyoloji': 
        return { icon: <Dna color="#4ade80" size={32} />, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' };
      case 'Matematik': 
        return { icon: <Calculator color="#c084fc" size={32} />, color: '#c084fc', bg: 'rgba(192,132,252,0.1)' };
      default: 
        return { icon: <Compass color="#a78bfa" size={32} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' };
    }
  };

  const SUBJECT_BUTTONS: { key: Subject; label: string; count?: string }[] = [
    { key: 'Tümü', label: 'Tüm Deneyler', count: '49' },
    { key: 'Fizik', label: 'Fizik', count: '22' },
    { key: 'Kimya', label: 'Kimya', count: '10' },
    { key: 'Biyoloji', label: 'Biyoloji', count: '7' },
    { key: 'Matematik', label: 'Matematik', count: '10' },
  ];

  const handleLaunch = (sim: any) => {
    if (sim.source_url.startsWith('/')) {
      router.push(sim.source_url);
    } else {
      setActiveSimulation(sim);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px, 3vw, 32px) clamp(12px, 2vw, 20px)', minHeight: '100vh', paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))' }}>
      
      {/* ── Page Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 35px rgba(59, 130, 246, 0.35)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Beaker color="#fff" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.85rem)', fontWeight: 800, color: 'white', margin: '0 0 4px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              İnteraktif Laboratuvar
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                49 SİMÜLASYON
              </span>
            </h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
              Fizik, Kimya, Biyoloji ve Matematik formüllerini deneylerle canlandır, YKS konularını ezberlemeden kalıcı öğren.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Subject Tabs ── */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        {SUBJECT_BUTTONS.map((btn) => {
          const isActive = subject === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setSubject(btn.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                background: isActive ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(37,99,235,0.15))' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{btn.label}</span>
              {btn.count && (
                <span style={{ fontSize: '10px', background: isActive ? '#3b82f6' : 'rgba(255,255,255,0.08)', color: '#fff', padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>
                  {btn.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div style={{ marginBottom: '32px' }}>
        <SimulationFilter 
          category={category} setCategory={setCategory}
          subject={subject} setSubject={setSubject}
          difficulty={difficulty} setDifficulty={setDifficulty}
          search={search} setSearch={setSearch}
        />
      </div>

      {/* ── Simulations Grid ── */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={44} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', fontWeight: 600 }}>Laboratuvar deneyleri yükleniyor...</p>
        </div>
      ) : simulations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
          <Beaker size={56} color="#64748b" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', color: 'white', fontWeight: 700, margin: '0 0 6px 0' }}>Deney Bulunamadı</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Arama kriterlerinize uygun interaktif bir simülasyon bulunamadı.</p>
          <button 
            onClick={() => { setCategory('Tümü'); setSubject('Tümü'); setDifficulty(0); setSearch(''); }}
            style={{ marginTop: '20px', padding: '10px 22px', backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {simulations.map((sim, i) => {
            const meta = getSubjectMeta(sim.subject);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                key={sim.id} 
                style={{
                  position: 'relative',
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  transition: 'border-color 0.2s ease, transform 0.2s ease'
                }}
              >
                {/* Top Badges (Category & Difficulty / Exam Tag) */}
                <div style={{ position: 'absolute', top: '14px', left: '14px', right: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                  <span style={{ padding: '3px 9px', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: '11px', fontWeight: 800, borderRadius: '8px' }}>
                    {sim.category}
                  </span>
                  
                  {sim.badge ? (
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.35)', backdropFilter: 'blur(8px)' }}>
                      {sim.badge}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: '2px', padding: '3px 7px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          size={11} 
                          color={idx < sim.difficulty_level ? "#fbbf24" : "#4b5563"}
                          fill={idx < sim.difficulty_level ? "#fbbf24" : "transparent"} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Hero / Subject Icon Area */}
                <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.3) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${meta.color}40`, boxShadow: `0 0 20px ${meta.color}20` }}>
                    {meta.icon}
                  </div>
                  <span style={{ position: 'absolute', bottom: '10px', right: '14px', fontSize: '11px', fontWeight: 700, color: meta.color }}>
                    {sim.subject}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {sim.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0', flex: 1, lineHeight: 1.5 }}>
                    {sim.description}
                  </p>

                  {/* YKS Topics Pills */}
                  {sim.related_yks_topics && sim.related_yks_topics.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {sim.related_yks_topics.slice(0, 3).map((topic: string, idx: number) => (
                        <span key={idx} style={{ fontSize: '10px', fontWeight: 600, padding: '3px 7px', backgroundColor: 'rgba(255,255,255,0.04)', color: '#cbd5e1', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Launch Button */}
                  <button 
                    onClick={() => handleLaunch(sim)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      fontWeight: 700, 
                      fontSize: '13px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '7px',
                      boxShadow: '0 0 15px rgba(37,99,235,0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Play size={14} fill="white" />
                    Deneyi Başlat
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Player (for external or iframe embed fallback) */}
      <AnimatePresence>
        {activeSimulation && (
          <SimulationPlayer 
            simulation={activeSimulation} 
            onClose={() => setActiveSimulation(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}
