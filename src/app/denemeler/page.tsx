"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart as LucideLineChart, Plus, BarChart2, X, Trash2, GraduationCap, Sparkles, Loader2, Check, Target, Trophy, TrendingUp, Compass, ArrowUpRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import OnlineExamSimulator from '@/components/exam/OnlineExamSimulator';

// --- Types ---
type MockExam = {
  id: string;
  type: 'TYT' | 'AYT';
  date: string;
  turkce?: number; matematik?: number; sosyal?: number; fen?: number;
  aytMatematik?: number; fizik?: number; kimya?: number; biyoloji?: number;
  edebiyat?: number; tarih1?: number; cografya1?: number; 
  tarih2?: number; cografya2?: number; felsefeGrubu?: number; dinKulturu?: number;
  yabanciDil?: number;
  totalNet: number;
};

// Mapper: database to UI
const mapExamFromDb = (e: any, alan: string): MockExam => {
  const isTYT = e.type === 'TYT';
  const turkNet = e.turkishNet !== undefined ? e.turkishNet : (e.turkish_net || 0);
  const mthNet = e.mathNet !== undefined ? e.mathNet : (e.math_net || 0);
  const socNet = e.socialNet !== undefined ? e.socialNet : (e.social_net || 0);
  const sciNet = e.scienceNet !== undefined ? e.scienceNet : (e.science_net || 0);
  const totNet = e.totalNet !== undefined ? e.totalNet : (e.total_net || 0);

  if (isTYT) {
    return {
      id: e.id.toString(),
      type: 'TYT',
      date: e.date,
      turkce: turkNet,
      matematik: mthNet,
      sosyal: socNet,
      fen: sciNet,
      totalNet: totNet
    };
  } else {
    const base = {
      id: e.id.toString(),
      type: 'AYT' as const,
      date: e.date,
      totalNet: totNet
    };
    if (alan === 'Sayisal') {
      return {
        ...base,
        aytMatematik: mthNet,
        fizik: turkNet,
        kimya: sciNet,
        biyoloji: socNet
      };
    } else if (alan === 'Esit Agirlik') {
      return {
        ...base,
        aytMatematik: mthNet,
        edebiyat: turkNet,
        tarih1: sciNet,
        cografya1: socNet
      };
    } else if (alan === 'Sozel') {
      return {
        ...base,
        edebiyat: turkNet,
        tarih1: sciNet,
        cografya1: socNet,
        tarih2: mthNet
      };
    } else {
      return {
        ...base,
        yabanciDil: mthNet
      };
    }
  }
};
// --- Subjects Configuration ---
const TYT_SUBJECTS = [
  { id: 'turkce', label: 'Türkçe', max: 40 },
  { id: 'matematik', label: 'Matematik', max: 40 },
  { id: 'sosyal', label: 'Sosyal', max: 20 },
  { id: 'fen', label: 'Fen', max: 20 },
];

const AYT_SUBJECTS = {
  'Sayisal': [
    { id: 'aytMatematik', label: 'AYT Matematik', max: 40 },
    { id: 'fizik', label: 'Fizik', max: 14 },
    { id: 'kimya', label: 'Kimya', max: 13 },
    { id: 'biyoloji', label: 'Biyoloji', max: 13 },
  ],
  'Esit Agirlik': [
    { id: 'aytMatematik', label: 'AYT Matematik', max: 40 },
    { id: 'edebiyat', label: 'Edebiyat', max: 24 },
    { id: 'tarih1', label: 'Tarih-1', max: 10 },
    { id: 'cografya1', label: 'Coğrafya-1', max: 6 },
  ],
  'Sozel': [
    { id: 'edebiyat', label: 'Edebiyat', max: 24 },
    { id: 'tarih1', label: 'Tarih-1', max: 10 },
    { id: 'cografya1', label: 'Coğrafya-1', max: 6 },
    { id: 'tarih2', label: 'Tarih-2', max: 11 },
    { id: 'cografya2', label: 'Coğrafya-2', max: 11 },
    { id: 'felsefeGrubu', label: 'Felsefe Grubu', max: 12 },
    { id: 'dinKulturu', label: 'Din Kültürü', max: 6 },
  ],
  'Dil': [
    { id: 'yabanciDil', label: 'Yabancı Dil', max: 80 },
  ]
};

// --- Default Data ---
const DEFAULT_MOCK_DATA: MockExam[] = [
  { id: '1', type: 'TYT', date: '2026-09-10', turkce: 15, matematik: 10, sosyal: 10, fen: 10, totalNet: 45 },
  { id: '2', type: 'TYT', date: '2026-10-10', turkce: 20, matematik: 15, sosyal: 13, fen: 10, totalNet: 58 },
  { id: '3', type: 'AYT', date: '2026-10-15', aytMatematik: 10, fizik: 5, kimya: 5, biyoloji: 5, totalNet: 25 },
];

export default function DenemelerPage() {
  const [exams, setExams] = useState<MockExam[]>(DEFAULT_MOCK_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [ocrMistakes, setOcrMistakes] = useState<any[]>([]);
  
  const [userAlan, setUserAlan] = useState<'Sayisal'|'Esit Agirlik'|'Sozel'|'Dil'>('Sayisal');
  const [userTarget, setUserTarget] = useState<{ uni: string; dept: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'TYT' | 'AYT'>('TYT');
  const [modalTab, setModalTab] = useState<'TYT' | 'AYT'>('TYT');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);

  const handleOpenAiAnalysis = async (type: 'TYT' | 'AYT') => {
    setIsAiAnalyzing(true);
    setAiAnalysisError(null);
    setAiAnalysisModalOpen(true);
    try {
      const res = await fetch('/api/ai/exam-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiAnalysisData(data.analysis);
      } else {
        setAiAnalysisError(data.error || 'Analiz oluşturulurken bir hata oluştu.');
      }
    } catch (e: any) {
      setAiAnalysisError('Sunucu bağlantısı sağlanamadı.');
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanDone(false);
    setOcrMistakes([]);
    
    setTimeout(() => {
      setIsScanning(false);
      setScanDone(true);
      if (modalTab === 'TYT') {
        setNewExam({
          date: newExam.date,
          turkce: '32.5',
          matematik: '28.5',
          sosyal: '14.75',
          fen: '12.25'
        });
        setOcrMistakes([
          { 
            subject: 'Matematik (TYT-AYT)', 
            topic: 'Trigonometri', 
            icerik: 'YKS Deneme Sınavı Soru 14 (Hatalı Çözüm)', 
            secenekler_json: JSON.stringify(['A', 'B', 'C', 'D', 'E']), 
            dogru_cevap: 'C', 
            secilen_cevap: 'B', 
            cozum: 'Yarıçap formülü yanlış kullanılmıştır.' 
          },
          { 
            subject: 'Fizik (TYT-AYT)', 
            topic: 'Vektörler', 
            icerik: 'YKS Deneme Sınavı Soru 28 (Bileşke Vektör)', 
            secenekler_json: JSON.stringify(['A', 'B', 'C', 'D', 'E']), 
            dogru_cevap: 'A', 
            secilen_cevap: 'E', 
            cozum: 'Kosinüs teoremi işareti eksi yerine artı alınmıştır.' 
          }
        ]);
      } else {
        if (userAlan === 'Sayisal') {
          setNewExam({
            date: newExam.date,
            aytMatematik: '30.0',
            fizik: '10.5',
            kimya: '9.0',
            biyoloji: '8.25'
          });
          setOcrMistakes([
            { 
              subject: 'Matematik (TYT-AYT)', 
              topic: 'Türev', 
              icerik: 'AYT Deneme Sınavı Soru 8 (Türev Alma Kuralları)', 
              secenekler_json: JSON.stringify(['A', 'B', 'C', 'D', 'E']), 
              dogru_cevap: 'D', 
              secilen_cevap: 'A', 
              cozum: 'Zincir kuralı uygulanırken iç türev çarpımı unutulmuştur.' 
            }
          ]);
        } else {
          setNewExam({
            date: newExam.date,
            aytMatematik: '24.0',
            edebiyat: '18.0',
            tarih1: '7.5',
            cografya1: '4.25'
          });
          setOcrMistakes([
            { 
              subject: 'Edebiyat (AYT)', 
              topic: 'Paragrafta Anlam', 
              icerik: 'AYT Deneme Sınavı Soru 3', 
              secenekler_json: JSON.stringify(['A', 'B', 'C', 'D', 'E']), 
              dogru_cevap: 'E', 
              secilen_cevap: 'C', 
              cozum: 'Paragraftaki ana düşünce yanlış analiz edilmiştir.' 
            }
          ]);
        }
      }
    }, 2500);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isTYT = data.type === 'TYT';
      
      return (
        <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>
            {format(parseISO(data.date), 'd MMMM yyyy', { locale: tr })}
          </p>
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
            Toplam Net: <span style={{ color: isTYT ? '#10b981' : '#38bdf8' }}>{data.totalNet}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {isTYT ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Türkçe:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.turkce || 0} Net</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Matematik:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.matematik || 0} Net</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Sosyal:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.sosyal || 0} Net</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Fen:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.fen || 0} Net</span>
                </div>
              </>
            ) : (
              userAlan === 'Sayisal' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>AYT Matematik:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.aytMatematik || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Fizik:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.fizik || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Kimya:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.kimya || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Biyoloji:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.biyoloji || 0} Net</span>
                  </div>
                </>
              ) : userAlan === 'Esit Agirlik' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>AYT Matematik:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.aytMatematik || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Edebiyat:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.edebiyat || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Tarih-1:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.tarih1 || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Coğrafya-1:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.cografya1 || 0} Net</span>
                  </div>
                </>
              ) : userAlan === 'Sozel' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Edebiyat:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.edebiyat || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Tarih-1:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.tarih1 || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Coğrafya-1:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.cografya1 || 0} Net</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Tarih-2:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.tarih2 || 0} Net</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Yabancı Dil:</span> <span style={{ color: '#fff', fontWeight: 600 }}>{data.yabanciDil || 0} Net</span>
                </div>
              )
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const [newExam, setNewExam] = useState<any>({ date: format(new Date(), 'yyyy-MM-dd') });

  // Load from API
  useEffect(() => {
    const loadData = async () => {
      try {
        let alan = 'Sayisal';
        const userRes = await fetch('/api/user/dashboard');
        if (userRes.ok) {
          const json = await userRes.json();
          if (json.user && json.user.alan) {
            const tempAlan = json.user.alan;
            if (['Sayisal', 'Esit Agirlik', 'Sozel', 'Dil'].includes(tempAlan)) {
              alan = tempAlan;
              setUserAlan(tempAlan);
            }
          }
          if (json.user && (json.user.target_university || json.user.target_department)) {
            setUserTarget({
              uni: json.user.target_university || '',
              dept: json.user.target_department || ''
            });
          }
        }

        const examsRes = await fetch('/api/user/exams');
        if (examsRes.ok) {
          const data = await examsRes.json();
          if (Array.isArray(data)) {
            const mappedExams = data.map((e: any) => mapExamFromDb(e, alan));
            setExams(mappedExams.length > 0 ? mappedExams : DEFAULT_MOCK_DATA);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const refreshExams = async () => {
    try {
      const examsRes = await fetch('/api/user/exams');
      if (examsRes.ok) {
        const data = await examsRes.json();
        if (Array.isArray(data)) {
          const mappedExams = data.map((e: any) => mapExamFromDb(e, userAlan));
          setExams(mappedExams.length > 0 ? mappedExams : DEFAULT_MOCK_DATA);
        }
      }
    } catch (err) {
      console.error('Error refreshing exams:', err);
    }
  };

  // Handle Input Changes
  const handleInputChange = (fieldId: string, value: string) => {
    setNewExam((prev: any) => ({ ...prev, [fieldId]: value }));
  };

  const calculateCurrentTotal = () => {
    let total = 0;
    const subjects = modalTab === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS[userAlan];
    subjects.forEach(sub => {
      const val = parseFloat(newExam[sub.id]);
      if (!isNaN(val)) total += val;
    });
    return total;
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const examObj: any = {
      exam_type: modalTab,
      exam_name: `${modalTab} Denemesi`,
      exam_date: newExam.date,
      total_net: calculateCurrentTotal(),
      turkish_net: 0,
      math_net: 0,
      social_net: 0,
      science_net: 0
    };

    if (modalTab === 'TYT') {
      examObj.turkish_net = parseFloat(newExam.turkce) || 0;
      examObj.math_net = parseFloat(newExam.matematik) || 0;
      examObj.social_net = parseFloat(newExam.sosyal) || 0;
      examObj.science_net = parseFloat(newExam.fen) || 0;
    } else {
      // AYT: Map dynamically to mock_exams' 4 fields
      if (userAlan === 'Sayisal') {
        examObj.math_net = parseFloat(newExam.aytMatematik) || 0;
        examObj.turkish_net = parseFloat(newExam.fizik) || 0;
        examObj.science_net = parseFloat(newExam.kimya) || 0;
        examObj.social_net = parseFloat(newExam.biyoloji) || 0;
      } else if (userAlan === 'Esit Agirlik') {
        examObj.math_net = parseFloat(newExam.aytMatematik) || 0;
        examObj.turkish_net = parseFloat(newExam.edebiyat) || 0;
        examObj.science_net = parseFloat(newExam.tarih1) || 0;
        examObj.social_net = parseFloat(newExam.cografya1) || 0;
      } else if (userAlan === 'Sozel') {
        examObj.turkish_net = parseFloat(newExam.edebiyat) || 0;
        examObj.science_net = parseFloat(newExam.tarih1) || 0;
        examObj.social_net = parseFloat(newExam.cografya1) || 0;
        examObj.math_net = parseFloat(newExam.tarih2) || 0;
      } else {
        // Dil
        examObj.math_net = parseFloat(newExam.yabanciDil) || 0;
      }
    }

    try {
      const res = await fetch('/api/user/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examObj)
      });
      const data = await res.json();
      
      if (data.success) {
        // Optimistic UI for frontend
        const newExamObjForUI = mapExamFromDb({
          id: data.id.toString(),
          type: modalTab,
          date: newExam.date,
          turkishNet: examObj.turkish_net,
          mathNet: examObj.math_net,
          socialNet: examObj.social_net,
          scienceNet: examObj.science_net,
          totalNet: examObj.total_net
        }, userAlan);
        
         const updatedExams = [...exams, newExamObjForUI].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setExams(updatedExams);

        if (ocrMistakes.length > 0) {
          for (const m of ocrMistakes) {
            await fetch('/api/user/errors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(m)
            });
          }
          setOcrMistakes([]);
        }
        setScanDone(false);
      }
    } catch (e) {}

    setIsModalOpen(false);
    setNewExam({ date: format(new Date(), 'yyyy-MM-dd') }); // Reset
  };

  const deleteExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  if (!isLoaded) return null;

  // Render logic
  const filteredExams = exams.filter(e => e.type === activeTab);
  const maxNet = activeTab === 'TYT' ? 120 : 80;
  const chartHeight = 300;
  
  const lastExam = filteredExams.length > 0 ? filteredExams[filteredExams.length - 1] : null;
  const previousExam = filteredExams.length > 1 ? filteredExams[filteredExams.length - 2] : null;
  const netDiff = lastExam && previousExam ? (lastExam.totalNet - previousExam.totalNet).toFixed(1) : 0;

  const currentSubjects = activeTab === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS[userAlan];

  const tytExams = exams.filter(e => e.type === 'TYT');
  const aytExams = exams.filter(e => e.type === 'AYT');
  const latestTytNet = tytExams.length > 0 ? tytExams[tytExams.length - 1].totalNet : 0;
  const latestAytNet = aytExams.length > 0 ? aytExams[aytExams.length - 1].totalNet : 0;

  const getRankProjection = () => {
    if (latestTytNet === 0 && latestAytNet === 0) {
      return { rankText: 'Veri Bekleniyor', score: 0, color: '#94a3b8', badge: 'Yeni Başlayan' };
    }
    const rawScore = 100 + (latestTytNet * 1.33) + (latestAytNet * 3.0) + 50;
    const score = Math.min(500, Math.round(rawScore));
    
    let rankText = '300.000+';
    let color = '#f87171';
    let badge = 'Geliştirilmeli';

    if (score >= 480) { rankText = 'İlk 1.500'; color = '#10b981'; badge = 'Zirve Derece'; }
    else if (score >= 450) { rankText = '1.500 – 8.000'; color = '#34d399'; badge = 'İlk 10 Bin'; }
    else if (score >= 415) { rankText = '8.000 – 25.000'; color = '#38bdf8'; badge = 'Üst Dilim'; }
    else if (score >= 375) { rankText = '25.000 – 65.000'; color = '#818cf8'; badge = 'Hedef Yakın'; }
    else if (score >= 335) { rankText = '65.000 – 130.000'; color = '#fbbf24'; badge = 'İlerleme Var'; }
    else if (score >= 290) { rankText = '130.000 – 220.000'; color = '#fb923c'; badge = 'Temel Düzey'; }
    else { rankText = '220.000 – 380.000'; color = '#f87171'; badge = 'Hızlanmalı'; }

    return { rankText, score, color, badge };
  };

  const rankProjection = getRankProjection();

  return (
    <div className="denemeler-page-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* Header */}
      <div className="denemeler-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            }}
          >
            <BarChart2 size={24} color="#34d399" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.85rem', color: '#ffffff', marginBottom: '0.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Deneme Analizi</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>TYT ve AYT netlerindeki gelişimi takip et, eksiklerini gör.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(139, 92, 246, 0.14)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#c084fc',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <GraduationCap size={17} /> {userAlan} Alanı
          </div>
          <button 
            onClick={() => setIsSimulatorOpen(true)} 
            className="active:scale-[0.98] online-sim-start-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.35rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(139, 92, 246, 0.45)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Sparkles size={18} className="animate-pulse" /> ⚡ Online {activeTab} Başlat ({activeTab === 'TYT' ? '165 dk' : '180 dk'})
          </button>
          <button 
            onClick={() => { setModalTab(activeTab); setIsModalOpen(true); }} 
            className="active:scale-[0.98]"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Plus size={18} /> Yeni Deneme Ekle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="denemeler-tabs"
        style={{
          display: 'flex',
          backgroundColor: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '5px',
          marginBottom: '2rem',
          width: 'fit-content',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button 
          onClick={() => setActiveTab('TYT')}
          className="active:scale-[0.98]"
          style={{
            padding: '0.55rem 1.75rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 800,
            background: activeTab === 'TYT' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))' : 'transparent',
            color: activeTab === 'TYT' ? '#34d399' : '#94a3b8',
            border: activeTab === 'TYT' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'TYT' ? '0 2px 10px rgba(16, 185, 129, 0.25)' : 'none',
          }}
        >
          TYT (120 Soru)
        </button>
        <button 
          onClick={() => setActiveTab('AYT')}
          className="active:scale-[0.98]"
          style={{
            padding: '0.55rem 1.75rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 800,
            background: activeTab === 'AYT' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(6, 182, 212, 0.15))' : 'transparent',
            color: activeTab === 'AYT' ? '#38bdf8' : '#94a3b8',
            border: activeTab === 'AYT' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: activeTab === 'AYT' ? '0 2px 10px rgba(56, 189, 248, 0.25)' : 'none',
          }}
        >
          AYT (80 Soru)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Grafik Alanı */}
        <div
          className="premium-card table-responsive-container"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            backdropFilter: 'blur(16px)',
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
            <LucideLineChart size={22} color={activeTab === 'TYT' ? '#34d399' : '#38bdf8'} /> {activeTab} Net Gelişimi Grafiği
          </h2>
          
          <div style={{ height: `${chartHeight}px`, minWidth: '600px', position: 'relative' }}>
            {filteredExams.length === 0 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.95rem' }}>Henüz {activeTab} deneme verisi yok.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={filteredExams} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tickFormatter={(tick) => format(parseISO(tick), 'd MMM', { locale: tr })} 
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    domain={[0, maxNet]} 
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="totalNet" 
                    stroke={activeTab === 'TYT' ? '#34d399' : '#38bdf8'} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorNet)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        {/* YÖK Atlas YKS Tahmini Sıralama & Hedef Projeksiyon Kartı */}
        <div
          className="premium-card"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '1.75rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(14,165,233,0.3)' }}>
                <Compass size={24} color="#fff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>YÖK Atlas Sıralama & Hedef Projeksiyonu</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: `${rankProjection.color}20`, color: rankProjection.color, border: `1px solid ${rankProjection.color}40` }}>
                    {rankProjection.badge}
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.825rem', margin: '3px 0 0' }}>
                  Son denemelerindeki netlerine göre hesaplanan tahmini ÖSYM 2026 yerleştirme tablosu.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link 
                href="/dashboard?tab=hedef"
                style={{ padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', fontSize: '0.825rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <Target size={15} /> Hedef Net Sihirbazı <ArrowUpRight size={13} />
              </Link>
              <Link 
                href="/puan-hesaplama"
                style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', fontSize: '0.825rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                Detaylı Hesaplayıcı
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* 1. Tahmini Sıralama Bandı */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trophy size={14} color="#f59e0b" /> Tahmini Sıralama Bandı
              </div>
              <div style={{ fontSize: '1.6rem', color: rankProjection.color, fontWeight: 900, letterSpacing: '-0.02em' }}>
                {rankProjection.rankText}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                {userAlan} Puanı: <strong style={{ color: '#fff' }}>{rankProjection.score} Puan</strong>
              </div>
            </div>

            {/* 2. Hedef Üniversite Durumu */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Target size={14} color="#38bdf8" /> Hedef Üniversite & Bölüm
              </div>
              {userTarget?.uni || userTarget?.dept ? (
                <>
                  <div style={{ fontSize: '1.05rem', color: '#38bdf8', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userTarget.uni || 'Hedef Üniversite'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600, marginTop: '2px' }}>
                    {userTarget.dept || 'Hedef Bölüm'}
                  </div>
                </>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                  Henüz hedef belirlenmedi.{' '}
                  <Link href="/ayarlar" style={{ color: '#38bdf8', textDecoration: 'underline' }}>
                    Belirle →
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Mevcut Net Dengesi */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} color="#10b981" /> Son Deneme Netleri
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '4px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Son TYT</div>
                  <div style={{ fontSize: '1.3rem', color: '#34d399', fontWeight: 800 }}>{latestTytNet} Net</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Son AYT</div>
                  <div style={{ fontSize: '1.3rem', color: '#38bdf8', fontWeight: 800 }}>{latestAytNet} Net</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kısım: Özet ve Liste */}
        <div className="denemeler-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Son Deneme Özeti */}
          <motion.div
            className="premium-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTab}
            style={{
              backgroundColor: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.75rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Son {activeTab} Denemesi</div>
            
            {lastExam ? (
              <>
                <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                  {lastExam.totalNet}
                  {Number(netDiff) !== 0 && (
                    <span
                      style={{
                        fontSize: '0.95rem',
                        color: Number(netDiff) > 0 ? '#34d399' : '#f87171',
                        fontWeight: 800,
                        padding: '4px 10px',
                        background: Number(netDiff) > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: Number(netDiff) > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '10px',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {Number(netDiff) > 0 ? '+' : ''}{netDiff}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentSubjects.map((sub, i) => {
                    const val = lastExam[sub.id as keyof MockExam];
                    return (
                      <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', paddingBottom: '0.6rem', borderBottom: i < currentSubjects.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>{sub.label}</span>
                        <span style={{ color: '#fff', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{val !== undefined ? val : 0} Net</span>
                      </div>
                    )
                  })}
                </div>

                {/* AI Analiz ve Reçete Butonu */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenAiAnalysis(activeTab)}
                    disabled={isAiAnalyzing}
                    className="ai-analysis-btn active:scale-[0.98]"
                    style={{
                      width: '100%',
                      padding: '11px 16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
                      border: '1px solid rgba(139,92,246,0.45)',
                      color: '#c4b5fd',
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: isAiAnalyzing ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(139,92,246,0.2)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {isAiAnalyzing ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        <span>Analiz Ediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} color="#c084fc" />
                        <span>✨ AI Koç Analizi & Reçete</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b' }}>Veri bulunamadı.</div>
            )}
          </motion.div>

          {/* Deneme Geçmişi Listesi */}
          <div
            className="premium-card"
            style={{
              backgroundColor: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.75rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 800 }}>Tüm Deneme Geçmişi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {exams.length === 0 && <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Deneme bulunmuyor.</div>}
              
              {[...exams].reverse().map(exam => (
                <div
                  key={exam.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                      background: exam.type === 'TYT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: exam.type === 'TYT' ? '#34d399' : '#38bdf8',
                      border: exam.type === 'TYT' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                    }}>
                      {exam.type}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.15rem' }}>Deneme Sınavı</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{format(parseISO(exam.date), 'd MMMM yyyy', { locale: tr })}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: exam.type === 'TYT' ? '#34d399' : '#38bdf8', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{exam.totalNet} Net</span>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="active:scale-[0.95]"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <motion.div 
              className="denemeler-modal-inner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: '#0f1523',
                padding: '2rem',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                border: '1px solid rgba(255,255,255,0.1)',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Yeni Deneme Ekle</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '1.5rem',
                }}
              >
                <button 
                  onClick={() => { setModalTab('TYT'); setNewExam({ date: newExam.date }); }}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    background: modalTab === 'TYT' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))' : 'transparent',
                    color: modalTab === 'TYT' ? '#34d399' : '#94a3b8',
                    border: modalTab === 'TYT' ? '1px solid rgba(16, 185, 129, 0.35)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  TYT (120 Soru)
                </button>
                <button 
                  onClick={() => { setModalTab('AYT'); setNewExam({ date: newExam.date }); }}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    background: modalTab === 'AYT' ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(6, 182, 212, 0.15))' : 'transparent',
                    color: modalTab === 'AYT' ? '#38bdf8' : '#94a3b8',
                    border: modalTab === 'AYT' ? '1px solid rgba(56, 189, 248, 0.35)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  AYT (80 Soru)
                </button>
              </div>

               <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* AI Optik / Sonuç Belgesi Okuyucu Panel */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} color="#c084fc" /> AI Optik Okuyucu & Deneme Analizör
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#c084fc', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>PRO</span>
                  </div>
                  
                  {isScanning ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                      {/* Scanning laser effect */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', animation: 'scanAnim 2s infinite ease-in-out' }} />
                      <Loader2 size={24} color="#34d399" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>Optik form taranıyor ve hatalar çözümleniyor...</span>
                    </div>
                  ) : scanDone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: 10, color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                        <Check size={16} />
                        <span>Başarılı! Optik veri okundu, netler forma dolduruldu.</span>
                      </div>
                      
                      {ocrMistakes.length > 0 && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 800, textAlign: 'left' }}>Tespit Edilen ve Hata Defterine Eklenecek Konular:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 2 }}>
                            {ocrMistakes.map((m, idx) => (
                              <span key={idx} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 600 }}>
                                {m.topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleSimulateScan}
                      className="active:scale-[0.98]"
                      style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px dashed rgba(168, 85, 247, 0.35)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <span>📸</span>
                      <span>Optik Form / Sonuç Belgesi Fotoğrafı Yükle</span>
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 700 }}>Tarih</label>
                  <input
                    type="date"
                    required
                    value={newExam.date || ''}
                    onChange={e => handleInputChange('date', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div className="denemeler-subject-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
                  {(modalTab === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS[userAlan]).map((sub) => (
                    <div key={sub.id}>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 700 }}>{sub.label} Net</label>
                      <input 
                        type="number" step="0.25" min="-20" max={sub.max} required 
                        value={newExam[sub.id] || ''} 
                        onChange={e => handleInputChange(sub.id, e.target.value)} 
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none', fontVariantNumeric: 'tabular-nums' }} 
                        placeholder={`Maks: ${sub.max}`} 
                      />
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.85rem 1.1rem',
                    background: modalTab === 'TYT' ? 'rgba(16,185,129,0.1)' : 'rgba(56, 189, 248,0.1)',
                    borderRadius: '12px',
                    border: `1px solid ${modalTab === 'TYT' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ color: modalTab === 'TYT' ? '#34d399' : '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>Toplam Net:</span>
                  <span style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                    {calculateCurrentTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="active:scale-[0.98]"
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    color: '#ffffff',
                    background: modalTab === 'TYT' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    boxShadow: modalTab === 'TYT' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(56, 189, 248, 0.35)',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {modalTab} Denemesini Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Koç Analiz & Reçete Modalı */}
      <AnimatePresence>
        {aiAnalysisModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
            <motion.div
              className="denemeler-modal-inner"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#131827',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '24px',
                padding: '2rem',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' }}>
                    <Sparkles size={22} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      AI Koç {activeTab} Deneme Teşhisi
                    </h3>
                    <p style={{ color: '#c4b5fd', fontSize: '0.8rem', margin: '2px 0 0' }}>
                      Net analizi, kaçan fırsatlar ve kişisel çalışma reçetesi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiAnalysisModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {isAiAnalyzing ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Loader2 size={36} color="#8b5cf6" className="animate-spin" />
                  <p style={{ color: '#c4b5fd', fontSize: '0.95rem', fontWeight: 600, maxWidth: '400px' }}>
                    Yapay zeka son {activeTab} denemeni, hata defterindeki eksiklerini ve sıralama hedefini harmanlıyor...
                  </p>
                </div>
              ) : aiAnalysisError ? (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '1rem' }}>{aiAnalysisError}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAiAnalysis(activeTab)}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.2)', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : aiAnalysisData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Genel Değerlendirme */}
                  <div style={{ padding: '1.25rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>💡</span>
                      <h4 style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Koçun Genel Değerlendirmesi</h4>
                    </div>
                    <p style={{ color: '#c4b5fd', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                      {aiAnalysisData.overallEvaluation}
                    </p>
                  </div>

                  {/* Kaçan Netler ve Sıralama Fırsatları */}
                  {aiAnalysisData.criticalGaps?.length > 0 && (
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🎯</span> En Kritik Kaçan Net Fırsatları
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                        {aiAnalysisData.criticalGaps.map((gap: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: '1rem',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              borderRadius: '14px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <span style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{gap.subject}</span>
                                <h5 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, margin: '2px 0 0' }}>{gap.topic}</h5>
                              </div>
                              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af', fontWeight: 700 }}>
                                {gap.netLoss}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.5rem' }}>
                              ⚡ Potansiyel Sıçrama: {gap.potentialRankGain}
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                              {gap.advice}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3 Günlük Telafi Reçetesi */}
                  {aiAnalysisData.studyPrescription?.length > 0 && (
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📋</span> 3 Günlük Hızlı Telafi Reçetesi
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {aiAnalysisData.studyPrescription.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.875rem 1rem',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem'
                            }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', whiteSpace: 'nowrap' }}>
                              {item.day}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>
                                  {item.focusSubject} • {item.topic}
                                </span>
                                <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>
                                  🎯 {item.targetQuestions} Soru
                                </span>
                              </div>
                              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0', lineHeight: 1.4 }}>
                                {item.strategy}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivasyon */}
                  {aiAnalysisData.motivationalQuote && (
                    <div style={{ padding: '0.75rem 1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))', borderRadius: '12px', borderLeft: '3px solid #8b5cf6' }}>
                      <p style={{ color: '#e2e8f0', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                        "{aiAnalysisData.motivationalQuote}"
                      </p>
                    </div>
                  )}

                  {/* Aksiyon Butonları */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <a
                      href="/dashboard?tab=astratutor"
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: '#fff',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textDecoration: 'none',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🤖 AstraTutor ile Bu Sonucu Konuş
                    </a>
                    <button
                      type="button"
                      onClick={() => setAiAnalysisModalOpen(false)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gerçek Sınav Simülatörü (165 dk TYT / 180 dk AYT) */}
      {isSimulatorOpen && (
        <OnlineExamSimulator
          examType={activeTab}
          alan={userAlan}
          onClose={() => setIsSimulatorOpen(false)}
          onExamSaved={() => {
            refreshExams();
          }}
        />
      )}

      <style jsx>{`
        @keyframes scanAnim {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @media (max-width: 768px) {
          .denemeler-page-wrap { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; padding-top: 1rem !important; }
          .denemeler-header { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
          .denemeler-header h1 { font-size: 1.4rem !important; }
          .denemeler-tabs { width: 100% !important; }
          .denemeler-tabs button { flex: 1 !important; font-size: 0.8rem !important; padding: 0.4rem 0.5rem !important; }
          .denemeler-bottom-grid { grid-template-columns: 1fr !important; }
          .denemeler-modal-inner {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            max-height: 92vh !important;
            border-radius: 20px 20px 0 0 !important;
            padding: 1.5rem 1rem !important;
          }
          .denemeler-modal-inner input,
          .denemeler-modal-inner select {
            font-size: 16px !important;
          }
          .denemeler-subject-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

    </div>
  );
}
