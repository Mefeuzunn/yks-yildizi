"use client";

import React, { useState } from 'react';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { curriculumData } from '@/lib/data/curriculum';

// Helper to slugify
const slugify = (text: string) => {
  const trMap: Record<string, string> = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
  return text.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

const getDynamicTopicData = (subjectSlug: string, topicSlug: string) => {
  let foundTitle = "Konu Yükleniyor...";
  let foundSubject = subjectSlug.toUpperCase();
  let subtopics: string[] = [];

  for (const exam of Object.values(curriculumData)) {
    for (const [subjName, topics] of Object.entries(exam)) {
      if (slugify(subjName) === subjectSlug) {
        foundSubject = subjName;
        for (const t of topics) {
          if (slugify(t.topic) === topicSlug) {
            foundTitle = t.topic;
            subtopics = t.subtopics;
            break;
          }
        }
      }
    }
  }

  // Generate mock questions based on actual subtopics
  const genericQuestions = subtopics.length > 0 ? subtopics.map((sub, idx) => ({
    id: `g_q${idx}`,
    text: `'${sub}' alt başlığı için yapay zeka tarafından üretilmiş kavrama sorusu. Doğru seçeneği işaretleyin.`,
    options: ['Çeldirici Seçenek A', 'Çeldirici Seçenek B', 'Doğru Seçenek (C)', 'Çeldirici Seçenek D', 'Çeldirici Seçenek E'],
    correctAnswer: 2,
    subtopic: sub,
    videoTimestamp: 60 * (idx + 1), // Her alt konu için videoda farazi bir saniye
  })) : [
    {
      id: 'g_q1',
      text: `${foundTitle} konusu genel değerlendirme sorusu. Doğru seçeneği bulunuz.`,
      options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Doğru Seçenek (D)', 'Seçenek E'],
      correctAnswer: 3,
      subtopic: 'Genel Tekrar',
      videoTimestamp: 120,
    }
  ];

  return {
    title: foundTitle,
    subject: foundSubject,
    // Generic Lofi Girl study stream as a placeholder for any video
    videoUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?rel=0&modestbranding=1&controls=1&showinfo=0',
    questions: genericQuestions
  };
};

// Mock veritabanı (Örnek: Fizik Bilimine Giriş)
const TOPIC_DB: Record<string, any> = {
  'fizik-bilimine-giris': {
    title: 'Fizik Bilimine Giriş',
    subject: 'Fizik',
    videoUrl: 'https://www.youtube-nocookie.com/embed/QvKzGqE7iX8?rel=0&modestbranding=1&controls=1&showinfo=0',
    questions: [
      {
        id: 'q1',
        text: 'Aşağıdakilerden hangisi temel bir büyüklüktür?',
        options: ['Hız', 'Kuvvet', 'Kütle', 'İvme', 'Enerji'],
        correctAnswer: 2, // Kütle
        subtopic: 'Temel ve Türetilmiş Büyüklükler',
        videoTimestamp: 180, // 3. dakika (180 saniye)
      },
      {
        id: 'q2',
        text: 'Aşağıdaki eşleştirmelerden hangisi yanlıştır?',
        options: ['Uzunluk - Metre', 'Zaman - Saniye', 'Sıcaklık - Santigrat', 'Madde Miktarı - Mol', 'Akım Şiddeti - Amper'],
        correctAnswer: 2, // Santigrat (Kelvin olmalı)
        subtopic: 'SI Birim Sistemi',
        videoTimestamp: 300, // 5. dakika
      },
      {
        id: 'q3',
        text: 'Optik, fiziğin hangi alanı ile ilgilenir?',
        options: ['Hareket ve Enerji', 'Işık ve görme olayları', 'Atomun yapısı', 'Isı ve sıcaklık', 'Maddenin manyetik özellikleri'],
        correctAnswer: 1,
        subtopic: 'Fiziğin Alt Dalları',
        videoTimestamp: 60, // 1. dakika
      },
      {
        id: 'q4',
        text: 'Bir niceliğin yön ve doğrultu bilgisi içermesi onun hangi tür büyüklük olduğunu gösterir?',
        options: ['Skaler', 'Vektörel', 'Temel', 'Türetilmiş', 'Mutlak'],
        correctAnswer: 1, // Vektörel
        subtopic: 'Skaler ve Vektörel Büyüklükler',
        videoTimestamp: 420, // 7. dakika
        simulationRec: '/simulasyonlar/vektorler'
      }
    ]
  }
};

export default function TopicStudyPage({ params }: { params: Promise<{ subject: string, topic: string }> }) {
  const unwrappedParams = React.use(params);
  const topicId = unwrappedParams.topic;
  const subjectId = unwrappedParams.subject;
  const data = TOPIC_DB[topicId] || getDynamicTopicData(subjectId, topicId);

  const [mode, setMode] = useState<'video' | 'test' | 'analysis'>('video');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (qId: string, optionIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const finishTest = () => {
    setShowResults(true);
    setMode('analysis');
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let empty = 0;
    const missingSubtopics: any[] = [];

    data.questions.forEach((q: any) => {
      const ans = answers[q.id];
      if (ans === undefined) {
        empty++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
        missingSubtopics.push(q);
      }
    });

    return { correct, wrong, empty, total: data.questions.length, missingSubtopics, score: Math.round((correct / data.questions.length) * 100) };
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <Link href="/konular" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Konulara Dön
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                {data.subject}
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{data.title}</h1>
            </div>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => setMode('video')}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: mode === 'video' ? '#8b5cf6' : 'transparent', color: mode === 'video' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <PlayCircle size={18} /> Ders İzle
            </button>
            <button 
              onClick={() => setMode('test')}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: mode === 'test' ? '#10b981' : 'transparent', color: mode === 'test' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <FileText size={18} /> Konu Testi
            </button>
            {showResults && (
              <button 
                onClick={() => setMode('analysis')}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: mode === 'analysis' ? '#38bdf8' : 'transparent', color: mode === 'analysis' ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <BarChart2 size={18} /> Analiz
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {mode === 'video' && (
            <motion.div key="video" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Embedded YouTube Player (No Ads / Privacy Enhanced Mode) */}
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={data.videoUrl} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e121e', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Videoyu bitirdin mi?</h3>
                  <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Şimdi öğrendiklerini pekiştirme ve eksiklerini bulma zamanı.</p>
                </div>
                <button onClick={() => setMode('test')} className="btn-interactive" style={{ padding: '1rem 2rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Teste Başla <ArrowRightIcon />
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'test' && (
            <motion.div key="test" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.questions.map((q: any, qIdx: number) => (
                  <div key={q.id} style={{ background: '#0e121e', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {qIdx + 1}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', lineHeight: 1.5 }}>{q.text}</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '3rem' }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[q.id] === optIdx;
                        const optionStyle = {
                          padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#10b981' : '#cbd5e1', cursor: showResults ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
                        };

                        if (showResults) {
                          if (optIdx === q.correctAnswer) {
                            optionStyle.background = 'rgba(16, 185, 129, 0.2)';
                            optionStyle.border = '1px solid #10b981';
                            optionStyle.color = '#fff';
                          } else if (isSelected && optIdx !== q.correctAnswer) {
                            optionStyle.background = 'rgba(239, 68, 68, 0.2)';
                            optionStyle.border = '1px solid #ef4444';
                            optionStyle.color = '#fff';
                          }
                        }

                        return (
                          <div key={optIdx} onClick={() => handleOptionSelect(q.id, optIdx)} style={optionStyle} className={!showResults ? "hover:bg-white/5" : ""}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? '6px solid #10b981' : '2px solid rgba(255,255,255,0.2)', transition: 'all 0.2s' }}></div>
                            {String.fromCharCode(65 + optIdx)}) {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!showResults && (
                  <button onClick={finishTest} className="btn-interactive" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', textAlign: 'center', marginTop: '1rem' }}>
                    Testi Bitir ve Analizi Gör
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'analysis' && showResults && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                
                {/* Sol Taraf: Eksik Kapatma Haritası */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <RefreshCw color="#38bdf8" /> Eksik Kapatma Haritası
                  </h2>
                  
                  {calculateResults().missingSubtopics.length === 0 ? (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                      <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                      <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>Tebrikler, Kusursuz!</h3>
                      <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Bu konudaki tüm soruları doğru cevapladın. Bir sonraki konuya geçmeye hazırsın.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>Yapay zeka analizimiz, aşağıdaki alt konularda eksiğin olduğunu tespit etti. Bu eksikleri kapatmak için sana özel tekrarları listeledik:</p>
                      
                      {calculateResults().missingSubtopics.map((q: any, i: number) => (
                        <div key={i} style={{ background: '#0e121e', border: '1px solid rgba(239, 68, 68, 0.3)', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <AlertCircle color="#ef4444" />
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Eksik Konu: {q.subtopic}</h4>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button 
                              onClick={() => {
                                setMode('video');
                                // Gerçek bir app'te videoyu bu saniyeden başlatırız
                                setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 100);
                              }}
                              style={{ flex: 1, padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#c084fc', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              className="hover:bg-purple-500/20 transition-all"
                            >
                              <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Dersi Tekrar Et</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(192, 132, 252, 0.7)' }}>Videonun {formatTime(q.videoTimestamp)} anına git</div>
                              </div>
                              <PlayCircle size={24} />
                            </button>

                            {q.simulationRec && (
                              <Link href={q.simulationRec} style={{ flex: 1, textDecoration: 'none' }}>
                                <div style={{ height: '100%', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', color: '#7dd3fc', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="hover:bg-sky-500/20 transition-all">
                                  <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Simülasyonla Öğren</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(125, 211, 252, 0.7)' }}>İnteraktif Laboratuvar</div>
                                  </div>
                                  <span style={{ fontSize: '1.5rem' }}>🔬</span>
                                </div>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sağ Taraf: Skor */}
                <div>
                  <div style={{ background: '#0e121e', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'sticky', top: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Test Sonucu</h3>
                    
                    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 2rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke={calculateResults().score >= 70 ? '#10b981' : calculateResults().score >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeDasharray={`${calculateResults().score * 2.83} 283`} strokeLinecap="round" style={{ transition: 'all 1s ease-out' }} />
                      </svg>
                      <div style={{ position: 'absolute', fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
                        %{calculateResults().score}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{calculateResults().correct}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Doğru</div>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{calculateResults().wrong}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Yanlış</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5l7 7-7 7"></path>
  </svg>
);
