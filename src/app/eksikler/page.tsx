"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, AlertTriangle, ArrowRight, TrendingDown, Loader2, 
  Grid, Sparkles, BookOpen, CheckCircle2, Bookmark, Flame, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { haptics } from '@/lib/haptics';
import { YKS_CURRICULUM_TAXONOMY } from '@/lib/curriculum-taxonomy';

// Helper to slugify for URL routing
const slugify = (text: string) => {
  const trMap: Record<string, string> = { 
    'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 
    'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' 
  };
  return text.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

type CategoryFilter = 'ALL' | 'TYT' | 'AYT';

export default function EksiklerPage() {
  const [data, setData] = useState<any>(null);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<{
    subject: string;
    topic: string;
    status: string;
    color: string;
    errorCount: number;
    leitnerBox?: number;
    category?: string;
  } | null>(null);

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

  // Filter subjects by category
  const filteredSubjects = Object.entries(YKS_CURRICULUM_TAXONOMY).filter(([_, details]) => {
    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'TYT') return details.category === 'TYT' || details.category === 'TYT/AYT';
    if (categoryFilter === 'AYT') return details.category === 'AYT' || details.category === 'TYT/AYT';
    return true;
  });

  // Calculate dynamic topic mastery from real user data
  const getTopicMastery = (subject: string, topic: string) => {
    const sLower = subject.toLowerCase();
    const tLower = topic.toLowerCase();

    // 1. Check real student mistakes
    const matchingMistakes = mistakes.filter((m: any) => {
      const msLower = (m.subject || '').toLowerCase();
      const mtLower = (m.topic || '').toLowerCase();
      const subjectMatch = msLower.includes(sLower) || sLower.includes(msLower);
      const topicMatch = mtLower.includes(tLower) || tLower.includes(mtLower);
      return subjectMatch && topicMatch;
    });

    if (matchingMistakes.length > 0) {
      const activeErrors = matchingMistakes.filter(m => (m.leitnerBox || 1) <= 2);
      const masteredErrors = matchingMistakes.filter(m => (m.leitnerBox || 1) >= 4);

      if (activeErrors.length > 0) {
        return {
          status: `Kritik Hata (${matchingMistakes.length} Soru Kayıtlı)`,
          color: '#ef4444',
          errorCount: matchingMistakes.length,
          leitnerBox: Math.min(...matchingMistakes.map(m => m.leitnerBox || 1))
        };
      } else if (masteredErrors.length === matchingMistakes.length) {
        return {
          status: 'Pekiştirildi (Mastery: %95 - Leitner 4/5)',
          color: '#10b981',
          errorCount: matchingMistakes.length,
          leitnerBox: 5
        };
      } else {
        return {
          status: 'Gelişiyor (Leitner 3. Kutu)',
          color: '#f59e0b',
          errorCount: matchingMistakes.length,
          leitnerBox: 3
        };
      }
    }

    // 2. Check coach weaknesses
    const weakMatch = weaknesses.find((w: any) => {
      const wsLower = (w.subject || '').toLowerCase();
      const wtLower = (w.topic || '').toLowerCase();
      return (wsLower.includes(sLower) || sLower.includes(wsLower)) &&
             (wtLower.includes(tLower) || tLower.includes(wtLower));
    });

    if (weakMatch) {
      return {
        status: `Zayıf Konu (${weakMatch.errorCount || 1} Hata)`,
        color: weakMatch.color || '#f59e0b',
        errorCount: weakMatch.errorCount || 1,
        leitnerBox: 1
      };
    }

    // 3. Not studied yet
    return {
      status: 'Henüz Çalışılmadı',
      color: 'rgba(255, 255, 255, 0.08)',
      errorCount: 0,
      leitnerBox: 0
    };
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem', margin: 0, fontWeight: 800 }}>Eksik Takibi & Yapay Zeka Koçu</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Hata defterinden derlenen canlı analizlere göre zayıf ve pekiştirilmesi gereken tüm konular.</p>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontWeight: 700 }}>
              <Grid size={18} color="#10b981" /> YKS Konu Gelişim Haritası (Mastery Matrix)
            </h2>

            {/* Category Switcher Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px' }}>
              {(['ALL', 'TYT', 'AYT'] as CategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    haptics.selection();
                    setCategoryFilter(cat);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: categoryFilter === cat ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    color: categoryFilter === cat ? '#fff' : '#94a3b8',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat === 'ALL' ? 'Tümü (10 Ders)' : cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}></div> Çalışılmadı
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px' }}></div> Gelişiyor / Zayıf
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px' }}></div> Pekiştirildi (%95)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }}></div> Kritik Hata
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' }}>
          {filteredSubjects.map(([subject, details]) => (
            <div key={subject} style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <h4 style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={13} color="#f59e0b" /> {subject}
                </h4>
                <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  {details.category}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {details.topics.map(topic => {
                  const mastery = getTopicMastery(subject, topic);
                  const isSelected = selectedTopic?.subject === subject && selectedTopic?.topic === topic;

                  return (
                    <div 
                      key={topic}
                      title={`${topic} • ${mastery.status}`}
                      onClick={() => {
                        haptics.selection();
                        setSelectedTopic({
                          subject,
                          topic,
                          status: mastery.status,
                          color: mastery.color,
                          errorCount: mastery.errorCount,
                          leitnerBox: mastery.leitnerBox,
                          category: details.category
                        });
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '3px',
                        background: mastery.color,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: isSelected ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.15)',
                        transform: isSelected ? 'scale(1.2)' : 'none',
                        boxShadow: isSelected ? `0 0 10px ${mastery.color}` : 'none'
                      }}
                      className="hover-bright"
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Topic Interactive Action Card */}
        <AnimatePresence>
          {selectedTopic && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '1.25rem',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '1.15rem',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>
                      {selectedTopic.subject} • {selectedTopic.category}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: `${selectedTopic.color}22`, color: selectedTopic.color, border: `1px solid ${selectedTopic.color}44` }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedTopic.color }} />
                      {selectedTopic.status}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 800 }}>
                    {selectedTopic.topic}
                  </h3>
                </div>

                <button 
                  onClick={() => setSelectedTopic(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}
                >
                  &times;
                </button>
              </div>

              {/* 1-Click Action Buttons */}
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <Link 
                  href={`/soru-coz?subject=${encodeURIComponent(selectedTopic.subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button 
                    className="btn-interactive"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Flame size={14} /> 🎯 Pratik Soru Çöz
                  </button>
                </Link>

                <Link 
                  href={`/konular/${slugify(selectedTopic.subject)}/${slugify(selectedTopic.topic)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button 
                    className="btn-interactive"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <BookOpen size={14} /> 📖 Konu Anlatımı & Video
                  </button>
                </Link>

                <Link href="/program" style={{ textDecoration: 'none' }}>
                  <button 
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.85rem',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Calendar size={14} /> 📅 Takvime Görev Ata
                  </button>
                </Link>

                {selectedTopic.errorCount > 0 && (
                  <Link href="/dashboard?tab=mistakes" style={{ textDecoration: 'none' }}>
                    <button 
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        color: '#f87171',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Bookmark size={14} /> 📕 Hata Defterinde Gör ({selectedTopic.errorCount})
                    </button>
                  </Link>
                )}
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
            <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700 }}>Acil Aksiyon Planı</h2>
          </div>
          
          {primary ? (
            <>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Yapay zeka motorumuz, çözdüğün denemeler ve testler üzerinden kronik eksiklerini analiz etti. 
                Şu anda <strong style={{ color: '#fff' }}>{primary.subject} - {primary.topic}</strong> konusunda odaklı bir tekrara ihtiyacın var. 
                Bu konuyu pekiştirmen netlerinde anında sıçrama sağlayacaktır.
              </p>
              <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.2rem' }}>AI Koç Tavsiyesi</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Bugün programına "{primary.topic}" konu videosu ekle ve en az 10 soru çöz.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <Link 
                  href={`/soru-coz?subject=${encodeURIComponent(primary.subject)}&topic=${encodeURIComponent(primary.topic)}`}
                  style={{ textDecoration: 'none' }}
                >
                  <button className="btn-interactive" style={{ width: '100%', minHeight: '44px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Flame size={16} /> Bu Konudan Soru Çöz
                  </button>
                </Link>
                
                <Link href="/program" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', minHeight: '40px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontWeight: 600, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', cursor: 'pointer' }}>
                    Takvime Görev Ata &rarr;
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tebrikler! Aktif kritik hata tespit edilmedi. Yeni sorular çözerek başarı seviyeni koruyabilirsin.</p>
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
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>{item.errorCount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hatalı Soru</div>
                  </div>
                  
                  <Link 
                    href={`/soru-coz?subject=${encodeURIComponent(item.subject)}&topic=${encodeURIComponent(item.topic)}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <button 
                      className="btn-interactive" 
                      title="Bu konudan soru çöz"
                      style={{ padding: '0.65rem', background: 'rgba(255,255,255,0.06)', borderRadius: '50%', minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#fff' }}
                    >
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
        .hover-bright:hover { transform: scale(1.25); filter: brightness(1.25); }
        @media (max-width: 768px) {
          .eksikler-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
