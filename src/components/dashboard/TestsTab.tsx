import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, CheckCircle2, TrendingUp, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import ActiveTestModal from './ActiveTestModal';
import TestResultModal from './TestResultModal';

export default function TestsTab() {
  const [pastTests, setPastTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeTests = [
    {
      id: 1,
      suiteId: 'osym-2024-tyt-full',
      name: '2024 ÖSYM TYT Orijinal Tam Sınavı',
      subject: 'Tüm Dersler',
      difficulty: 'ÖSYM',
      questions: 120,
      time: '165 Dk',
      color: '#ef4444'
    },
    {
      id: 2,
      suiteId: 'osym-2024-ayt-full',
      name: '2024 ÖSYM AYT Sayısal Orijinal Sınavı',
      subject: 'Matematik & Fen',
      difficulty: 'ÖSYM',
      questions: 80,
      time: '180 Dk',
      color: '#dc2626'
    },
    {
      id: 3,
      suiteId: 'osym-2023-tyt-full',
      name: '2023 ÖSYM TYT Orijinal Sınavı',
      subject: 'Tüm Dersler',
      difficulty: 'ÖSYM',
      questions: 120,
      time: '165 Dk',
      color: '#f43f5e'
    },
    {
      id: 4,
      suiteId: 'pred-2025-tyt-full',
      name: '2025 ÖSYM TYT Nokta Atışı Büyük Sınav',
      subject: 'Tüm Dersler',
      difficulty: 'Derece',
      questions: 120,
      time: '165 Dk',
      color: '#a855f7'
    },
    {
      id: 5,
      suiteId: 'osym-2021-ayt-full',
      name: '2021 ÖSYM AYT Tarihin En Zor Sınavı',
      subject: 'Matematik & Fen',
      difficulty: 'Derece',
      questions: 80,
      time: '180 Dk',
      color: '#ea580c'
    }
  ];

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/user/tests');
      if (res.ok) {
        const data = await res.json();
        setPastTests(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const [activeTest, setActiveTest] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);

  const handleStartTest = (test: any) => {
    setActiveTest(test);
  };

  const handleFinishTest = (score: number, accuracy: number, timeSpent: string) => {
    const data = {
      name: activeTest.name,
      score,
      total: activeTest.questions,
      accuracy,
      timeSpent
    };
    setActiveTest(null);
    setResultData(data);
    fetchTests();
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><Loader2 className="animate-spin text-purple-500" size={32} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          📝 Testlerim
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Yapay zekanın senin için oluşturduğu eksik kapatma testlerini çöz veya geçmiş başarılarını incele.</p>
      </div>

      {/* 🚀 New Million-Question Pool & Pro Test Studio Showcase Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.12) 50%, rgba(16,185,129,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', background: 'rgba(139,92,246,0.25)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ⭐ Yeni Nesil Soru Havuzu
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                ● 12,000+ Aktif Soru & 2018–2024 ÖSYM Çıkmış Sınavlar
              </span>
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.3 }}>
              ÖSYM Çıkmış Sorular & Profesyonel Test Stüdyosu
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.4rem', marginBottom: 0, lineHeight: 1.5 }}>
              2018–2024 ÖSYM çıkmış soruları, 2025–2026 nokta atışı tahmin soruları, şık eleme (üzerini çizme), karalama tuvali ve AstraTutor Sokratik ipuçlarıyla donatılmış profesyonel test stüdyosu.
            </p>
          </div>

          <Link
            href="/testler"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.4rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(99,102,241,0.35)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Tüm Test Merkezine Git <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', flexWrap: 'wrap', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Active Tests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', boxShadow: '0 0 10px #ef4444' }}></span>
            Bekleyen Testler
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTests.length === 0 && (
              <div className="premium-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Şu an bekleyen bir testiniz yok. Yeni bir test başlatmak için Soru Çöz modülünü kullanın.
              </div>
            )}
            {activeTests.map(test => (
              <div key={test.id} className="premium-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${test.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: test.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{test.subject}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{test.name}</div>
                  </div>
                  <div style={{ backgroundColor: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {test.difficulty}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={16} /> {test.questions} Soru</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} /> {test.time}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Link
                    href={`/test-coz?id=${test.suiteId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    <Sparkles size={15} /> Stüdyoda Çöz
                  </Link>

                  <button 
                    onClick={() => handleStartTest(test)}
                    className="btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                  >
                    <PlayCircle size={15} /> Hızlı Çöz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Tests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#10b981" /> Geçmiş Başarılar
          </h3>
          
          <div className="premium-card" style={{ overflow: 'hidden' }}>
            {pastTests.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Henüz tamamlanmış bir testiniz bulunmuyor.
              </div>
            )}
            {pastTests.map((test, i) => {
              const totalQ = test.correct_count + test.wrong_count + test.blank_count;
              const accuracy = totalQ > 0 ? Math.round((test.correct_count / totalQ) * 100) : 0;
              return (
                <div key={test.id} style={{ padding: '1.5rem', borderBottom: i === pastTests.length - 1 ? 'none' : '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{test.test_type === 'error_quiz' ? 'Hata Kapatma Testi' : 'Genel Test'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(test.created_at).toLocaleDateString('tr-TR')} • {Math.floor(test.duration / 60)} Dk</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{test.correct_count}/{totalQ}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Başarı: %{accuracy}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
        </div>

      </div>

      <ActiveTestModal 
        isOpen={!!activeTest} 
        testData={activeTest} 
        onClose={() => setActiveTest(null)} 
        onFinish={handleFinishTest} 
      />

      <TestResultModal 
        isOpen={!!resultData}
        resultData={resultData}
        onClose={() => setResultData(null)}
      />
    </motion.div>
  );
}
