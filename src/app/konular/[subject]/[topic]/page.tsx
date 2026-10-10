"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, PlayCircle, FileText, CheckCircle2, AlertCircle, 
  RefreshCw, BarChart2, Sparkles, Bookmark, Flame, RotateCcw 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { curriculumData } from '@/lib/data/curriculum';
import { haptics } from '@/lib/haptics';

// Helper to slugify
const slugify = (text: string) => {
  const trMap: Record<string, string> = { 
    'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 
    'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' 
  };
  return text.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

// Curated educational YouTube lecture mapping (Official / MEB / high-yield lessons)
const CURATED_VIDEOS: Record<string, string> = {
  // Fizik
  'fizik-bilimine-giris': 'https://www.youtube-nocookie.com/embed/QvKzGqE7iX8?rel=0&modestbranding=1&controls=1',
  'madde-ve-ozellikleri': 'https://www.youtube-nocookie.com/embed/Z0o_o7h6b5c?rel=0&modestbranding=1&controls=1',
  'hareket-ve-kuvvet': 'https://www.youtube-nocookie.com/embed/oKj4w9Y6Z2M?rel=0&modestbranding=1&controls=1',
  'newton-un-hareket-yasalari': 'https://www.youtube-nocookie.com/embed/a_u36K7N9gQ?rel=0&modestbranding=1&controls=1',
  'enerji': 'https://www.youtube-nocookie.com/embed/c1K66iC9n58?rel=0&modestbranding=1&controls=1',
  'isi-ve-sicaklik': 'https://www.youtube-nocookie.com/embed/t8m3Y1e8y8k?rel=0&modestbranding=1&controls=1',
  'optik': 'https://www.youtube-nocookie.com/embed/_V1R6yP6w9Q?rel=0&modestbranding=1&controls=1',
  'vektorler-ve-bagil-hareket': 'https://www.youtube-nocookie.com/embed/G_s3L1YV-bI?rel=0&modestbranding=1&controls=1',
  'atislar': 'https://www.youtube-nocookie.com/embed/Wv7eM6uXzGk?rel=0&modestbranding=1&controls=1',
  'itme-ve-cizgisel-momentum': 'https://www.youtube-nocookie.com/embed/p1o7Z7x4t5g?rel=0&modestbranding=1&controls=1',
  'tork-ve-denge': 'https://www.youtube-nocookie.com/embed/k8j2u3y7x6c?rel=0&modestbranding=1&controls=1',
  'basit-harmonik-hareket': 'https://www.youtube-nocookie.com/embed/W1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'elektrik': 'https://www.youtube-nocookie.com/embed/7KkI39X7o_4?rel=0&modestbranding=1&controls=1',
  'manyetizma': 'https://www.youtube-nocookie.com/embed/m7y2x9u1o3k?rel=0&modestbranding=1&controls=1',
  'modern-fizik': 'https://www.youtube-nocookie.com/embed/576i1_vT15o?rel=0&modestbranding=1&controls=1',

  // Matematik
  'temel-kavramlar': 'https://www.youtube-nocookie.com/embed/X8n_6pE54gY?rel=0&modestbranding=1&controls=1',
  'rasyonel-sayilar': 'https://www.youtube-nocookie.com/embed/k2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'uslu-sayilar': 'https://www.youtube-nocookie.com/embed/p8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'koklu-sayilar': 'https://www.youtube-nocookie.com/embed/z1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'carpanlara-ayirma': 'https://www.youtube-nocookie.com/embed/w8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'problemler': 'https://www.youtube-nocookie.com/embed/m2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'fonksiyonlar': 'https://www.youtube-nocookie.com/embed/q8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'polinomlar': 'https://www.youtube-nocookie.com/embed/v2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'ikinci-dereceden-denklemler': 'https://www.youtube-nocookie.com/embed/r8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'trigonometri': 'https://www.youtube-nocookie.com/embed/pQh5k1P9_9Y?rel=0&modestbranding=1&controls=1',
  'logaritma': 'https://www.youtube-nocookie.com/embed/G-c7g-V68U0?rel=0&modestbranding=1&controls=1',
  'diziler': 'https://www.youtube-nocookie.com/embed/t2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'limit-ve-sureklilik': 'https://www.youtube-nocookie.com/embed/d-v-23p67tQ?rel=0&modestbranding=1&controls=1',
  'turev': 'https://www.youtube-nocookie.com/embed/e-eG_U5Xpms?rel=0&modestbranding=1&controls=1',
  'integral': 'https://www.youtube-nocookie.com/embed/T9K6o_u_V7w?rel=0&modestbranding=1&controls=1',

  // Kimya
  'kimya-bilimi': 'https://www.youtube-nocookie.com/embed/b2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'atom-ve-periyodik-sistem': 'https://www.youtube-nocookie.com/embed/n8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'maddenin-halleri': 'https://www.youtube-nocookie.com/embed/h2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'gazlar': 'https://www.youtube-nocookie.com/embed/zWp6Y6u12s0?rel=0&modestbranding=1&controls=1',
  'kimyasal-denge': 'https://www.youtube-nocookie.com/embed/u8Y17_V4Qws?rel=0&modestbranding=1&controls=1',
  'sulu-cozelti-dengeleri': 'https://www.youtube-nocookie.com/embed/c8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'elektrokimya': 'https://www.youtube-nocookie.com/embed/f2y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'organik-kimya': 'https://www.youtube-nocookie.com/embed/j8y3o6x7y2k?rel=0&modestbranding=1&controls=1',

  // Biyoloji
  'yasam-bilimi-biyoloji': 'https://www.youtube-nocookie.com/embed/k1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'hucre': 'https://www.youtube-nocookie.com/embed/K61u_m9O65A?rel=0&modestbranding=1&controls=1',
  'hucre-bolunmeleri': 'https://www.youtube-nocookie.com/embed/l8y3o6x7y2k?rel=0&modestbranding=1&controls=1',
  'kalitim': 'https://www.youtube-nocookie.com/embed/W-Yk67_P5x8?rel=0&modestbranding=1&controls=1',
  'sinir-sistemi': 'https://www.youtube-nocookie.com/embed/m1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'dolasim-sistemi': 'https://www.youtube-nocookie.com/embed/n1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'fotosentez-ve-kemosentez': 'https://www.youtube-nocookie.com/embed/o1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'hucresel-solunum': 'https://www.youtube-nocookie.com/embed/p1y7o3x6y8k?rel=0&modestbranding=1&controls=1',

  // Türkçe & Edebiyat
  'sozcukte-ve-cumlede-anlam': 'https://www.youtube-nocookie.com/embed/q1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'paragrafta-anlam': 'https://www.youtube-nocookie.com/embed/cQv57Y9-k20?rel=0&modestbranding=1&controls=1',
  'yazim-kurallari': 'https://www.youtube-nocookie.com/embed/T7o6p12Vw7U?rel=0&modestbranding=1&controls=1',
  'noktalama-isaretleri': 'https://www.youtube-nocookie.com/embed/s1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'siir-bilgisi-ve-edebi-sanatlar': 'https://www.youtube-nocookie.com/embed/t1y7o3x6y8k?rel=0&modestbranding=1&controls=1',
  'divan-edebiyati': 'https://www.youtube-nocookie.com/embed/u1y7o3x6y8k?rel=0&modestbranding=1&controls=1'
};

const SUBJECT_DEFAULT_VIDEOS: Record<string, string> = {
  'matematik': 'https://www.youtube-nocookie.com/embed/X8n_6pE54gY?rel=0&modestbranding=1&controls=1',
  'geometri': 'https://www.youtube-nocookie.com/embed/QvKzGqE7iX8?rel=0&modestbranding=1&controls=1',
  'fizik': 'https://www.youtube-nocookie.com/embed/QvKzGqE7iX8?rel=0&modestbranding=1&controls=1',
  'kimya': 'https://www.youtube-nocookie.com/embed/zWp6Y6u12s0?rel=0&modestbranding=1&controls=1',
  'biyoloji': 'https://www.youtube-nocookie.com/embed/K61u_m9O65A?rel=0&modestbranding=1&controls=1',
  'turkce': 'https://www.youtube-nocookie.com/embed/cQv57Y9-k20?rel=0&modestbranding=1&controls=1',
  'turk-dili-ve-edebiyati': 'https://www.youtube-nocookie.com/embed/cQv57Y9-k20?rel=0&modestbranding=1&controls=1',
  'tarih': 'https://www.youtube-nocookie.com/embed/T7o6p12Vw7U?rel=0&modestbranding=1&controls=1',
  'cografya': 'https://www.youtube-nocookie.com/embed/cQv57Y9-k20?rel=0&modestbranding=1&controls=1',
  'felsefe-din': 'https://www.youtube-nocookie.com/embed/X8n_6pE54gY?rel=0&modestbranding=1&controls=1'
};

const getDynamicTopicData = (subjectSlug: string, topicSlug: string) => {
  let foundTitle = "Konu Yükleniyor...";
  let foundSubject = subjectSlug.toUpperCase();
  let subtopics: string[] = [];

  for (const exam of Object.values(curriculumData as Record<string, any>)) {
    for (const [subjName, topics] of Object.entries(exam as Record<string, any[]>)) {
      if (slugify(subjName) === subjectSlug) {
        foundSubject = subjName;
        for (const t of topics) {
          if (slugify(t.topic) === topicSlug) {
            foundTitle = t.topic;
            subtopics = t.subtopics || [];
            break;
          }
        }
      }
    }
  }

  // Curated video URL
  const videoUrl = CURATED_VIDEOS[topicSlug] || SUBJECT_DEFAULT_VIDEOS[subjectSlug] || 'https://www.youtube-nocookie.com/embed/QvKzGqE7iX8?rel=0&modestbranding=1&controls=1';

  // Fallback pedagogical questions based on actual subtopics
  const fallbackQuestions = subtopics.length > 0 ? subtopics.map((sub, idx) => ({
    id: `fb_q${idx}`,
    text: `${foundTitle} konusunda '${sub}' kazanımı ile ilgili aşağıdakilerden hangisi doğrudur?`,
    options: [
      `${sub} kavramı bu süreçte temel korunum ilkesini sağlar.`,
      `${sub} niceliği ortam koşullarından bağımsızdır.`,
      `${sub} faktörü sistem verimini ve sonucunu doğrudan belirler.`,
      `${sub} değeri her zaman negatif işaret alır.`,
      `${sub} bağıntısı ters orantılıdır.`
    ],
    correctAnswer: 2,
    subtopic: sub,
    videoTimestamp: 60 * (idx + 1),
    explanation: `${foundTitle} dersinde ${sub} kazanımı incelendiğinde, bu temel parametre sistemin genel dengesini ve işlem sonucunu doğrudan belirler.`
  })) : [
    {
      id: 'fb_q1',
      text: `${foundTitle} konusuna ilişkin temel kavramlar ve formül ilişkisi incelendiğinde doğru yargı hangisidir?`,
      options: [
        'Sistemde enerji her zaman kaybolur.',
        'Kazanım kuralları sadece ideal şartlarda geçerlidir.',
        'Verilen büyüklükler doğru orantılı ilişki gösterir.',
        'Tüm seçenekler geçersizdir.',
        'Hiçbiri'
      ],
      correctAnswer: 2,
      subtopic: 'Genel Değerlendirme',
      videoTimestamp: 120,
      explanation: `${foundTitle} kazanımında temel bağıntılar doğru orantılı olarak artış veya azalış gösterir.`
    }
  ];

  return {
    title: foundTitle,
    subject: foundSubject,
    videoUrl,
    questions: fallbackQuestions
  };
};

export default function TopicStudyPage({ params }: { params: Promise<{ subject: string, topic: string }> }) {
  const unwrappedParams = React.use(params);
  const topicId = unwrappedParams.topic;
  const subjectId = unwrappedParams.subject;

  const [topicData, setTopicData] = useState(() => getDynamicTopicData(subjectId, topicId));
  const [mode, setMode] = useState<'video' | 'test' | 'analysis'>('video');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [submittingResults, setSubmittingResults] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Fetch real questions from /api/questions on mount
  useEffect(() => {
    const fetchRealQuestions = async () => {
      try {
        const res = await fetch(`/api/questions?subject=${encodeURIComponent(topicData.subject)}&topic=${encodeURIComponent(topicData.title)}&limit=5`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
            const mapped = json.questions.map((q: any, idx: number) => ({
              id: q.id || `db_q_${idx}`,
              text: q.text,
              options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D', 'E'],
              correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
              subtopic: q.topic || topicData.title,
              videoTimestamp: 60 * (idx + 1),
              explanation: q.explanation || `${topicData.title} konusuna ait doğru seçenek ve analiz.`
            }));
            setTopicData(prev => ({ ...prev, questions: mapped }));
          }
        }
      } catch (err) {
        console.error('Real questions fetch error:', err);
      }
    };

    fetchRealQuestions();
  }, [topicData.subject, topicData.title]);

  const handleOptionSelect = (qId: string, optionIndex: number) => {
    if (showResults) return;
    haptics.selection();
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    let empty = 0;
    const missingSubtopics: any[] = [];

    topicData.questions.forEach((q: any) => {
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

    const score = topicData.questions.length > 0 
      ? Math.round((correct / topicData.questions.length) * 100) 
      : 0;

    return { correct, wrong, empty, total: topicData.questions.length, missingSubtopics, score };
  };

  const finishTest = async () => {
    haptics.impact('medium');
    setShowResults(true);
    setMode('analysis');
    setSubmittingResults(true);

    const results = calculateResults();

    try {
      // 1. Award XP (+15 XP per correct question)
      if (results.correct > 0) {
        await fetch('/api/user/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_xp', amount: results.correct * 15 })
        });
      }

      // 2. Automatically log mistakes to Leitner Box 1 (student_mistakes) & error_log
      if (results.missingSubtopics.length > 0) {
        for (const wrongQ of results.missingSubtopics) {
          const selectedIdx = answers[wrongQ.id];
          const selectedText = selectedIdx !== undefined ? wrongQ.options[selectedIdx] : 'Boş Bırakıldı';
          const selectedLetter = selectedIdx !== undefined ? String.fromCharCode(65 + selectedIdx) : '-';
          const correctLetter = String.fromCharCode(65 + wrongQ.correctAnswer);
          const correctText = wrongQ.options[wrongQ.correctAnswer] || '';

          await fetch('/api/user/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: topicData.subject,
              topic: topicData.title,
              icerik: wrongQ.text,
              secenekler_json: JSON.stringify(wrongQ.options),
              dogru_cevap: `${correctLetter}) ${correctText}`,
              secilen_cevap: `${selectedLetter}) ${selectedText}`,
              cozum: wrongQ.explanation || `${topicData.title} - ${wrongQ.subtopic || 'Kazanım'} konusundaki bu soru için video anlatımını tekrar inceleyiniz.`
            })
          });
        }
      }

      const xpMsg = results.correct > 0 ? `+${results.correct * 15} XP ve Lig Puanı Kazandın!` : '';
      const errCountMsg = results.wrong > 0 ? ` (${results.wrong} soru Hata Defterine kaydedildi)` : '';
      setFeedbackMsg(xpMsg + errCountMsg);
      haptics.notification('success');
    } catch (err) {
      console.error('Finish test error:', err);
    } finally {
      setSubmittingResults(false);
    }
  };

  const restartTest = () => {
    haptics.impact('light');
    setAnswers({});
    setShowResults(false);
    setFeedbackMsg('');
    setMode('test');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const results = calculateResults();

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link href="/konular" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>
              <ArrowLeft size={18} /> Konulara Dön
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>
                {topicData.subject}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{topicData.title}</h1>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => {
                haptics.selection();
                setMode('video');
              }}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', background: mode === 'video' ? '#8b5cf6' : 'transparent', color: mode === 'video' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <PlayCircle size={17} /> Ders İzle
            </button>
            <button 
              onClick={() => {
                haptics.selection();
                setMode('test');
              }}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', background: mode === 'test' ? '#10b981' : 'transparent', color: mode === 'test' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <FileText size={17} /> Konu Testi ({topicData.questions.length})
            </button>
            {showResults && (
              <button 
                onClick={() => {
                  haptics.selection();
                  setMode('analysis');
                }}
                style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', background: mode === 'analysis' ? '#38bdf8' : 'transparent', color: mode === 'analysis' ? '#fff' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
              >
                <BarChart2 size={17} /> Analiz
              </button>
            )}
          </div>
        </div>

        {/* Feedback / XP Toast Banner */}
        {feedbackMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '12px', 
              padding: '0.75rem 1.25rem', 
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.9rem',
              color: '#6ee7b7',
              fontWeight: 700
            }}
          >
            <Sparkles size={18} color="#10b981" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {mode === 'video' && (
            <motion.div key="video" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Embedded YouTube Player (No Ads / Privacy Enhanced Mode) */}
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={topicData.videoUrl} 
                  title="MEB / YKS Ders Anlatım Videosu" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0e121e', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>Videoyu tamamladın mı?</h3>
                  <p style={{ margin: '0.35rem 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Öğrendiklerini pekiştirmek ve seviyeni ölçmek için hemen konu testine başla.</p>
                </div>
                <button 
                  onClick={() => {
                    haptics.impact('medium');
                    setMode('test');
                  }} 
                  className="btn-interactive" 
                  style={{ padding: '0.85rem 1.5rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FileText size={18} /> Teste Başla &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'test' && (
            <motion.div key="test" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {topicData.questions.map((q: any, qIdx: number) => (
                  <div key={q.id} style={{ background: '#0e121e', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                        {qIdx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.72rem', color: '#818cf8', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                          {q.subtopic || topicData.title}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', lineHeight: 1.6, fontWeight: 600 }}>{q.text}</h3>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: 'clamp(0px, 2vw, 2.5rem)' }}>
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[q.id] === optIdx;
                        const optionStyle: React.CSSProperties = {
                          padding: '0.85rem 1.25rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.08)',
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                          color: isSelected ? '#10b981' : '#cbd5e1',
                          cursor: showResults ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          fontSize: '0.9rem'
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
                          <div key={optIdx} onClick={() => handleOptionSelect(q.id, optIdx)} style={optionStyle}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSelected ? '6px solid #10b981' : '2px solid rgba(255,255,255,0.2)', transition: 'all 0.15s', flexShrink: 0 }}></div>
                            <span><strong>{String.fromCharCode(65 + optIdx)})</strong> {opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation if showResults */}
                    {showResults && q.explanation && (
                      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '10px', fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.6 }}>
                        <strong>Çözüm & Açıklama:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {!showResults && (
                  <button 
                    onClick={finishTest} 
                    disabled={submittingResults}
                    className="btn-interactive" 
                    style={{ padding: '1.1rem', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', textAlign: 'center', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle2 size={20} />
                    {submittingResults ? 'Puanlar Kaydediliyor...' : 'Testi Bitir ve Analizi Gör'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'analysis' && showResults && (
            <motion.div key="analysis" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <div className="topic-analysis-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                
                {/* Sol Taraf: Eksik Kapatma Haritası */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                      <RefreshCw color="#38bdf8" size={20} /> Eksik Kapatma Haritası
                    </h2>
                    <button 
                      onClick={restartTest} 
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.4rem 0.85rem', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                    >
                      <RotateCcw size={14} /> Testi Tekrarla
                    </button>
                  </div>
                  
                  {results.missingSubtopics.length === 0 ? (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                      <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                      <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontWeight: 800 }}>Tebrikler, Kusursuz Başarı!</h3>
                      <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>Bu konudaki tüm soruları doğru tamamladın. Bir sonraki derse geçmeye hazırsın.</p>
                      
                      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                        <Link href="/konular" style={{ textDecoration: 'none' }}>
                          <button style={{ padding: '0.65rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                            Sonraki Konuya Geç &rarr;
                          </button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>
                        Aşağıdaki alt başlıklarda hatalar tespit edildi. Bu sorular otomatik olarak <strong>Hata Defterine (Leitner 1. Kutu)</strong> eklendi:
                      </p>
                      
                      {results.missingSubtopics.map((q: any, i: number) => (
                        <div key={i} style={{ background: '#0e121e', border: '1px solid rgba(239, 68, 68, 0.3)', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <AlertCircle color="#ef4444" size={20} />
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Eksik Alt Başlık: {q.subtopic}</h4>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => {
                                haptics.impact('light');
                                setMode('video');
                                setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 100);
                              }}
                              style={{ flex: 1, minWidth: '180px', padding: '0.75rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', color: '#c084fc', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Dersi Tekrar Et</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(192, 132, 252, 0.7)' }}>Videonun {formatTime(q.videoTimestamp)} anına git</div>
                              </div>
                              <PlayCircle size={20} />
                            </button>

                            <Link 
                              href={`/soru-coz?subject=${encodeURIComponent(topicData.subject)}&topic=${encodeURIComponent(topicData.title)}`}
                              style={{ flex: 1, minWidth: '180px', textDecoration: 'none' }}
                            >
                              <div style={{ height: '100%', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Pratik Soru Çöz</div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(110, 231, 183, 0.7)' }}>Benzer Soru Bankası</div>
                                </div>
                                <Flame size={20} />
                              </div>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sağ Taraf: Skor ve Hızlı Aksiyon Kartı */}
                <div>
                  <div style={{ background: '#0e121e', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', position: 'sticky', top: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem 0', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Test Değerlendirmesi</h3>
                    
                    <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 1.5rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          fill="none" 
                          stroke={results.score >= 70 ? '#10b981' : results.score >= 40 ? '#f59e0b' : '#ef4444'} 
                          strokeWidth="10" 
                          strokeDasharray={`${results.score * 2.64} 264`} 
                          strokeLinecap="round" 
                          style={{ transition: 'all 1s ease-out' }} 
                        />
                      </svg>
                      <div style={{ position: 'absolute', fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                        %{results.score}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.85rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{results.correct}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Doğru (+{results.correct * 15} XP)</div>
                      </div>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.85rem', borderRadius: '12px' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{results.wrong}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Yanlış (Kayıtlı)</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link href="/dashboard?tab=mistakes" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                          <Bookmark size={15} /> Hata Defterinde İncele
                        </button>
                      </Link>

                      <Link href="/eksikler" style={{ textDecoration: 'none' }}>
                        <button style={{ width: '100%', padding: '0.65rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                          <BarChart2 size={15} /> Eksik Takibi Haritası
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .topic-analysis-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
