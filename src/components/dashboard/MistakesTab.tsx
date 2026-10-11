import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Filter, Loader2, Camera, Sparkles, BookOpen } from 'lucide-react';
import { toast } from '@/context/ToastContext';
import MistakeDetailModal from './MistakeDetailModal';
import ScanMistakeModal from './ScanMistakeModal';

export default function MistakesTab() {
  const router = useRouter();
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedMistake, setSelectedMistake] = useState<any>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [studioLoading, setStudioLoading] = useState(false);

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/user/errors');
      if (res.ok) {
        const data = await res.json();
        setMistakes(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch errors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const startErrorQuizInStudio = async () => {
    setStudioLoading(true);
    try {
      const res = await fetch('/api/questions/error-quiz');
      if (res.ok) {
        const data = await res.json();
        if (!data || data.length === 0) {
          toast.info('Çözülecek hata sorusu bulunamadı.');
          return;
        }

        const formattedQuestions = data.map((q: any, idx: number) => {
          const options = q.secenekler || [];
          const optMap: { A: string; B: string; C: string; D: string; E: string } = {
            A: options[0] || 'Seçenek A',
            B: options[1] || 'Seçenek B',
            C: options[2] || 'Seçenek C',
            D: options[3] || 'Seçenek D',
            E: options[4] || 'Seçenek E'
          };
          let correctOption: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
          const letters: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
          letters.forEach(l => {
            if (optMap[l] === q.dogruCevap) correctOption = l;
          });

          return {
            id: `mistake_q_${q.originalId || idx}`,
            subject: q.subject || 'Genel',
            topic: q.topic || 'Hata Tekrarı',
            examType: 'TYT' as const,
            difficulty: 3,
            text: q.metin,
            options: optMap,
            correctOption,
            explanation: q.cozum || 'Bu soru daha önce takıldığın konulardan seçilmiştir.',
            hint: 'Bu soruda daha önce takılmıştın. Soru kökünü ve ipuçlarını dikkatle oku.'
          };
        });

        const customId = 'mistakes_' + Date.now();
        const customPayload = {
          id: customId,
          title: 'Akıllı Hata Kapatma Denemesi',
          category: 'procedural',
          examType: 'TYT',
          subject: 'Hata Defteri',
          topic: 'Kişisel Hatalar',
          questionCount: formattedQuestions.length,
          durationMinutes: Math.max(10, Math.ceil(formattedQuestions.length * 1.5)),
          difficultyLabel: 'ÖSYM Seviyesi',
          badgeColor: '#ef4444',
          description: 'Hata defterindeki sorulardan derlenmiş profesyonel pekiştirme sınavı.',
          questions: formattedQuestions
        };

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('custom_test_' + customId, JSON.stringify(customPayload));
        }

        toast.success('Hata testi stüdyoda başlatılıyor...');
        router.push(`/test-coz?customId=${customId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Quiz oluşturulamadı.');
      }
    } catch (e) {
      toast.error('Bağlantı hatası oluştu.');
      console.error(e);
    } finally {
      setStudioLoading(false);
    }
  };

  const subjects = Array.from(new Set(mistakes.map(m => m.subject)));
  const filteredMistakes = activeFilter ? mistakes.filter(m => m.subject === activeFilter) : mistakes;
  const solvedCount = mistakes.filter(m => (m.leitnerBox || 1) > 1 || (m.reviewCount || 0) > 0).length;

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}><Loader2 className="animate-spin text-purple-500" size={32} /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mistakes-tab-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="mistakes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            ❌ Yanlışlarım (Hata Defteri)
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Deneme ve testlerde yanlış yaptığınız veya boş bıraktığınız sorular burada listelenir. Tekrar çözerek kalıcı öğrenme sağlayın.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {mistakes.length > 0 && (
            <button
              onClick={startErrorQuizInStudio}
              disabled={studioLoading}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: studioLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                opacity: studioLoading ? 0.7 : 1
              }}
            >
              <Sparkles size={18} /> {studioLoading ? 'Açılıyor...' : 'Stüdyoda Çöz (ÖSYM Modu)'}
            </button>
          )}

          <Link
            href="/hata-defteri"
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none'
            }}
          >
            <BookOpen size={17} /> Leitner Defteri
          </Link>

          <button 
            onClick={() => setIsScanModalOpen(true)}
            style={{ padding: '10px 16px', backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            className="hover:bg-purple-500/25"
          >
            <Camera size={18} /> Fotoğraftan Ekle
          </button>
        </div>
      </div>

      <div className="mistakes-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#0e121e', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{mistakes.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>BİRİKEN YANLIŞ</div>
          </div>
        </div>
        <div style={{ backgroundColor: '#0e121e', borderRadius: '12px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{solvedCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>TEKRAR ÇÖZÜLEN / PEKİŞEN</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Son Yanlışlar</h3>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="rgba(255,255,255,0.5)" />
            <button 
              onClick={() => setActiveFilter(null)}
              style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', border: `1px solid ${!activeFilter ? '#6366f1' : 'transparent'}`, backgroundColor: !activeFilter ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: !activeFilter ? '#6366f1' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}
            >Tümü</button>
            {subjects.map(sub => (
              <button 
                key={sub as string}
                onClick={() => setActiveFilter(sub as string)}
                style={{ padding: '0.25rem 0.75rem', borderRadius: '8px', border: `1px solid ${activeFilter === sub ? '#6366f1' : 'transparent'}`, backgroundColor: activeFilter === sub ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeFilter === sub ? '#6366f1' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}
              >{sub as string}</button>
            ))}
          </div>
        </div>
        <div>
          {filteredMistakes.length === 0 && (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Henüz kaydedilmiş bir yanlışınız bulunmuyor.</div>
          )}
          {filteredMistakes.map((m, i) => (
            <div key={m.id} className="mistake-item" style={{ padding: '1.5rem', borderBottom: i === filteredMistakes.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', minWidth: '80px', textAlign: 'center' }}>
                  {m.subject}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{m.topic}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>Hata Tipi: <span style={{ color: '#f59e0b' }}>Eksik Bilgi</span> • {new Date(m.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMistake(m)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} className="hover:bg-purple-500/20 mistake-solve-btn"
              >
                Çözümü İncele <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <MistakeDetailModal 
        isOpen={!!selectedMistake}
        onClose={() => setSelectedMistake(null)}
        mistakeData={selectedMistake}
      />

      <ScanMistakeModal 
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSaved={() => { fetchErrors(); setIsScanModalOpen(false); }}
      />

      <style jsx>{`
        @media (max-width: 768px) {
          .mistakes-header { flex-direction: column !important; align-items: flex-start !important; }
          .mistakes-stats-grid { grid-template-columns: 1fr 1fr !important; gap: 0.75rem !important; }
          .mistake-item { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
          .mistake-solve-btn { width: 100% !important; justify-content: center !important; }
          .mistakes-tab-wrap { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; }
        }
      `}</style>
    </motion.div>
  );
}
