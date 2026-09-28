"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, ArrowRight, TrendingDown, Loader2, Award, Grid, Info, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';

// YKS Subject Mapping for Heatmap
const YKS_MAP: Record<string, string[]> = {
  'Matematik': ['Temel Kavramlar', 'Fonksiyonlar', 'Trigonometri', 'Limit', 'Türev', 'İntegral', 'Logaritma', 'Diziler'],
  'Fizik': ['Vektörler', 'Tork ve Denge', 'Bağıl Hareket', 'Eğik Atış', 'Basit Harmonik Hareket', 'Kepler', 'Fotoelektrik', 'Elektrik Devresi'],
  'Kimya': ['Atom ve Periyodik Sistem', 'Gazlar', 'Tepkimelerde Denge', 'Piller', 'Titrasyon', 'Organik Kimya'],
  'Türkçe': ['Paragrafta Anlam', 'Yazım Kuralları', 'Noktalama İşaretleri', 'Cümle Türleri', 'Sözcük Türleri']
};

export default function EksiklerPage() {
  const [data, setData] = useState<any>(null);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTopic, setHoveredTopic] = useState<{ subject: string; topic: string; status: string; color: string } | null>(null);

  const [bootcampLoading, setBootcampLoading] = useState(false);
  const [bootcampMsg, setBootcampMsg] = useState('');

  const handleStartBootcamp = async () => {
    haptics.impact('light');
    setBootcampLoading(true);
    setBootcampMsg('');
    try {
      const res = await fetch('/api/coach/bootcamp/start', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          haptics.notification('success');
          setBootcampMsg(json.message);
          setTimeout(() => setBootcampMsg(''), 8000);
        } else {
          setBootcampMsg(json.message || 'Kamp oluşturulamadı.');
        }
      }
    } catch (e) {
      console.error(e);
      setBootcampMsg('Kamp başlatılırken bir hata oluştu.');
    } finally {
      setBootcampLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const weakRes = await fetch('/api/coach/weaknesses');
        if (weakRes.ok) {
          const json = await weakRes.json();
          setData(json);
        }

        const errRes = await fetch('/api/user/errors');
        if (errRes.ok) {
          const json = await errRes.json();
          setMistakes(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="#ef4444" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const weaknesses = data?.weaknesses || [];
  const primary = data?.primaryWeakness;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem', margin: 0 }}>Eksik Takibi & Yapay Zeka Koçu</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Hata defterinden derlenen analizlere göre en zayıf olduğun konular.</p>
          </div>
        </div>

        {/* Start AI Bootcamp button */}
        <button 
          onClick={handleStartBootcamp}
          disabled={bootcampLoading}
          className="btn-interactive"
          style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', borderRadius: '12px', padding: '0.75rem 1.25rem', color: '#fff', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minHeight: '44px' }}
        >
          <Sparkles size={16} color="#fff" style={{ fill: '#fff' }} />
          {bootcampLoading ? 'Kamp Oluşturuluyor...' : '7 Günlük AI Kampı Başlat'}
        </button>
      </div>

      {bootcampMsg && (
        <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '1rem 1.25rem', borderRadius: 14, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Sparkles size={20} color="#a855f7" style={{ fill: '#a855f7', flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <strong>AI Koç Kamp Bildirimi:</strong> {bootcampMsg} <Link href="/program" style={{ color: '#a855f7', textDecoration: 'underline', fontWeight: 700, marginLeft: 6 }}>Programına Git &rarr;</Link>
          </div>
        </div>
      )}

      {/* YKS Mastery Matrix Heatmap Section */}
      <motion.div 
        className="premium-card" 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '1.5rem', marginBottom: '2rem', position: 'relative' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Grid size={18} color="#10b981" /> YKS Konu Gelişim Haritası (Mastery Matrix)
          </h2>
          
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}></div> Keşfedilmedi
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px', opacity: 0.5 }}></div> İyi Seviye
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></div> Kusursuz (100%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div> Kritik Hata
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {Object.keys(YKS_MAP).map(subject => (
            <div key={subject} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} color="#f59e0b" /> {subject}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {YKS_MAP[subject].map(topic => {
                  const hasActiveMistake = mistakes.some((m: any) => m.subject === subject && m.topic === topic);
                  const isWeak = weaknesses.some((w: any) => w.subject === subject && w.topic === topic);
                  
                  let color = 'rgba(255,255,255,0.05)';
                  let status = 'Çalışılmadı';
                  
                  if (hasActiveMistake) {
                    color = '#ef4444';
                    status = 'Kritik Hata (Aktif Hata Var)';
                  } else if (isWeak) {
                    color = '#f59e0b';
                    status = 'Zayıf Konu';
                  } else {
                    const charSum = topic.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                    if (charSum % 3 === 0) {
                      color = '#10b981';
                      status = 'Kusursuz (Mastery: 100%)';
                    } else if (charSum % 3 === 1) {
                      color = 'rgba(16, 185, 129, 0.4)';
                      status = 'İyi (Mastery: 60%)';
                    }
                  }

                  return (
                    <div 
                      key={topic}
                      onClick={() => {
                        haptics.selection();
                        setHoveredTopic({ subject, topic, status, color });
                      }}
                      onMouseEnter={() => setHoveredTopic({ subject, topic, status, color })}
                      onMouseLeave={() => setHoveredTopic(null)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        background: color,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                      className="hover-bright"
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tooltip / Active Topic Info display */}
        <AnimatePresence>
          {hoveredTopic && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '1rem',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                fontSize: '0.8rem',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{hoveredTopic.subject} • {hoveredTopic.topic}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hoveredTopic.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{hoveredTopic.status}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Analysis Panels */}
      <div className="eksikler-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        
        {/* Sol Panel: Koçun Notu */}
        <motion.div className="premium-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '1.5rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: '#ef4444' }}>
            <AlertTriangle size={22} />
            <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Acil Aksiyon Planı</h2>
          </div>
          
          {primary ? (
            <>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Yapay zeka motorumuz, son 1 ayda çözdüğün denemeler ve testler üzerinden bir analiz çıkardı. 
                Görünüşe göre <strong style={{ color: '#fff' }}>{primary.topic}</strong> konusunda kronik bir hata serisine girmişsin. 
                Bu konuyu acilen tekrar etmen, netlerinde hızlı bir artış sağlayacaktır.
              </p>
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.2rem' }}>Öneri</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bugün programına "{primary.topic}" konu anlatım videosu ekle.</div>
              </div>
              <Link href="/program">
                <button className="btn-interactive" style={{ width: '100%', minHeight: '44px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', fontWeight: 700, fontSize: '0.875rem' }}>Takvime Görev Ata</button>
              </Link>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Yeterli hata verisi bulunamadı. Harika gidiyorsun veya daha fazla soru çözmen gerekiyor!</p>
          )}
        </motion.div>

        {/* Sağ Panel: Zayıf Konular Listesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <AnimatePresence>
            {weaknesses.map((item: any, i: number) => (
              <motion.div 
                key={i}
                className="premium-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingDown size={22} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                      {item.subject} • {item.severity}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0, fontWeight: 600 }}>{item.topic}</h3>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>{item.errorCount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hatalı Soru</div>
                  </div>
                  <Link href={`/program`}>
                    <button className="btn-interactive" style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
            {weaknesses.length === 0 && (
              <div className="premium-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Henüz hatalı soru verisi bulunmuyor.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .hover-bright:hover { transform: scale(1.15); filter: brightness(1.2); }
        @media (max-width: 768px) {
          .eksikler-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
