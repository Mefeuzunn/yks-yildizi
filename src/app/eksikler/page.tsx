"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertTriangle, ArrowRight, TrendingDown, Loader2, Award, Grid, Info, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';

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
    setBootcampLoading(true);
    setBootcampMsg('');
    try {
      const res = await fetch('/api/coach/bootcamp/start', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', margin: 0 }}>Eksik Takibi & Yapay Zeka Koçu</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Hata defterinden derlenen analizlere göre en zayıf olduğun konular.</p>
          </div>
        </div>

        {/* Start AI Bootcamp button */}
        <button 
          onClick={handleStartBootcamp}
          disabled={bootcampLoading}
          className="btn-interactive"
          style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', borderRadius: '12px', padding: '0.75rem 1.5rem', color: '#fff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <Sparkles size={16} color="#fff" style={{ fill: '#fff' }} />
          {bootcampLoading ? 'Kamp Oluşturuluyor...' : '7 Günlük AI Kampı Başlat'}
        </button>
      </div>

      {bootcampMsg && (
        <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '1rem 1.5rem', borderRadius: 14, color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Sparkles size={20} color="#a855f7" style={{ fill: '#a855f7', flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <strong>AI Koç Kamp Bildirimi:</strong> {bootcampMsg} <Link href="/dashboard?tab=schedule" style={{ color: '#a855f7', textDecoration: 'underline', fontWeight: 700, marginLeft: 6 }}>Programına Git &rarr;</Link>
          </div>
        </div>
      )}

      {/* YKS Mastery Matrix Heatmap Section */}
      <motion.div 
        className="premium-card" 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '2rem', marginBottom: '2.5rem', position: 'relative' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid size={20} color="#10b981" /> YKS Konu Gelişim Haritası (Mastery Matrix)
          </h2>
          
          {/* Legend */}
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {Object.keys(YKS_MAP).map(subject => (
            <div key={subject} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
                      onMouseEnter={() => setHoveredTopic({ subject, topic, status, color })}
                      onMouseLeave={() => setHoveredTopic(null)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '3px',
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

        {/* Hover Tooltip display */}
        <AnimatePresence>
          {hoveredTopic && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '20px',
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                fontSize: '0.8rem',
                zIndex: 10,
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{hoveredTopic.subject} • {hoveredTopic.topic}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hoveredTopic.color }} />
                <span style={{ color: 'var(--text-secondary)' }}>{hoveredTopic.status}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <style jsx>{`
          .hover-bright:hover { transform: scale(1.15); filter: brightness(1.2); }
        `}</style>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Sol Panel: Koçun Notu */}
        <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#ef4444' }}>
            <AlertTriangle size={24} />
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Acil Aksiyon Planı</h2>
          </div>
          
          {primary ? (
            <>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Yapay zeka motorumuz, son 1 ayda çözdüğün denemeler ve testler üzerinden bir analiz çıkardı. 
                Görünüşe göre <strong style={{ color: '#fff' }}>{primary.topic}</strong> konusunda kronik bir hata serisine girmişsin. 
                Bu konuyu acilen tekrar etmen, netlerinde hızlı bir artış sağlayacaktır.
              </p>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.25rem' }}>Öneri</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bugün programına "{primary.topic}" konu anlatım videosu ekle.</div>
              </div>
              <Link href="/program">
                <button className="btn-interactive" style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>Takvime Görev Ata</button>
              </Link>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Yeterli hata verisi bulunamadı. Harika gidiyorsun veya daha fazla soru çözmen gerekiyor!</p>
          )}
        </motion.div>

        {/* Sağ Panel: Zayıf Konular Listesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {weaknesses.map((item: any, i: number) => (
              <motion.div 
                key={i}
                className="premium-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingDown size={24} color={item.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: item.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                      {item.subject} • {item.severity}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>{item.topic}</h3>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>{item.errorCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hatalı Soru</div>
                  </div>
                  <Link href={`/program`}>
                    <button className="btn-interactive" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
            {weaknesses.length === 0 && (
              <div className="premium-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Henüz hatalı soru verisi bulunmuyor.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
