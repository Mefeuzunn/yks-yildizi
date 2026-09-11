'use client';

import React, { useState, useEffect } from 'react';
import { getSimulations } from '@/lib/actions/simulations';
import SimulationFilter, { Category, Subject, Difficulty } from '@/components/simulations/SimulationFilter';
import SimulationViewer from '@/components/simulations/SimulationViewer';
import { useSimulationTracking } from '@/hooks/useSimulationTracking';
import { Loader2, Play, X, Star, Beaker, Atom, FlaskConical, Dna, ArrowLeft } from 'lucide-react';
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
        backgroundColor: '#0b0f19',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
        backgroundColor: '#12182b', borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: 0 }}>{simulation.title}</h2>
            <div style={{ fontSize: '14px', color: '#60a5fa', fontWeight: 500, marginTop: '4px' }}>
              {simulation.category} • {simulation.subject}
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#34d399', borderRadius: '8px', fontSize: '14px', fontWeight: 500
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
  const [category, setCategory] = useState<Category>('Tümü');
  const [subject, setSubject] = useState<Subject>('Tümü');
  const [difficulty, setDifficulty] = useState<Difficulty>(0);
  const [search, setSearch] = useState('');
  
  const [simulations, setSimulations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);

  // Arama için debounce mekanizması (Hemen istek atmasın, yazma bitince atsın)
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
    }, 400); // 400ms bekle
    
    return () => clearTimeout(timer);
  }, [category, subject, difficulty, search]);

  const getSubjectIcon = (subj: string) => {
    switch (subj) {
      case 'Fizik': return <Atom color="#60a5fa" size={32} />;
      case 'Kimya': return <FlaskConical color="#34d399" size={32} />;
      case 'Biyoloji': return <Dna color="#fbbf24" size={32} />;
      default: return <Beaker color="#a78bfa" size={32} />;
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sayfa Başlığı */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 8px 0' }}>
          <Beaker color="#3b82f6" size={32} />
          İnteraktif Laboratuvar
        </h1>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>
          PhET altyapısı ile Fizik, Kimya ve Biyoloji simülasyonlarında deneyler yap, YKS konularını görselleştirerek öğren.
        </p>
      </div>

      {/* Filtreler */}
      <div style={{ marginBottom: '32px' }}>
        <SimulationFilter 
          category={category} setCategory={setCategory}
          subject={subject} setSubject={setSubject}
          difficulty={difficulty} setDifficulty={setDifficulty}
          search={search} setSearch={setSearch}
        />
      </div>

      {/* Simülasyon Grid'i */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={48} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#9ca3af', fontWeight: 500 }}>Laboratuvar hazırlanıyor...</p>
        </div>
      ) : simulations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: 'rgba(18,24,43,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          <Beaker size={64} color="#4b5563" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '20px', color: 'white', fontWeight: 500, margin: '0 0 8px 0' }}>Simülasyon Bulunamadı</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Seçtiğiniz filtrelere uygun bir deney bulunamadı.</p>
          <button 
            onClick={() => { setCategory('Tümü'); setSubject('Tümü'); setDifficulty(0); }}
            style={{ marginTop: '24px', padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 500 }}
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {simulations.map((sim, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={sim.id} 
              style={{
                position: 'relative',
                backgroundColor: '#12182b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Kart Üst (Kategori & Zorluk) */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <span style={{ padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '12px', fontWeight: 700, borderRadius: '8px' }}>
                  {sim.category}
                </span>
                <div style={{ display: 'flex', gap: '2px', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={12} 
                      color={idx < sim.difficulty_level ? "#fbbf24" : "#4b5563"}
                      fill={idx < sim.difficulty_level ? "#fbbf24" : "transparent"} 
                    />
                  ))}
                </div>
              </div>

              {/* Görsel / İkon Alanı */}
              <div style={{ height: '160px', background: 'linear-gradient(135deg, #1a233a 0%, #0b0f19 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getSubjectIcon(sim.subject)}
              </div>

              {/* Kart İçerik */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                  {sim.title}
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 16px 0', flex: 1, lineHeight: 1.5 }}>
                  {sim.description}
                </p>

                {/* YKS Konuları Etiketleri */}
                {sim.related_yks_topics && sim.related_yks_topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {sim.related_yks_topics.slice(0, 3).map((topic: string, idx: number) => (
                      <span key={idx} style={{ fontSize: '10px', fontWeight: 600, padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#d1d5db', borderRadius: '6px' }}>
                        {topic}
                      </span>
                    ))}
                    {sim.related_yks_topics.length > 3 && (
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', borderRadius: '6px' }}>
                        +{sim.related_yks_topics.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Başlat Butonu */}
                <button 
                  onClick={() => setActiveSimulation(sim)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Play size={16} fill="white" />
                  Simülasyonu Başlat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Oynatıcı Modal */}
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
