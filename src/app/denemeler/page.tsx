"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart as LucideLineChart, Plus, BarChart2, X, Trash2, GraduationCap, Sparkles, Loader2, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'TYT' | 'AYT'>('TYT');
  const [modalTab, setModalTab] = useState<'TYT' | 'AYT'>('TYT');

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={24} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Deneme Analizi</h1>
            <p style={{ color: 'var(--text-secondary)' }}>TYT ve AYT netlerindeki gelişimi takip et, eksiklerini gör.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', color: '#8b5cf6', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={18} /> {userAlan} Alanı
          </div>
          <button 
            onClick={() => { setModalTab(activeTab); setIsModalOpen(true); }} 
            className="btn-interactive" style={{ background: 'linear-gradient(135deg, #10b981, #047857)' }}
          >
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Yeni Deneme Ekle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '2rem', width: 'fit-content' }}>
        <button 
          onClick={() => setActiveTab('TYT')}
          style={{ padding: '0.5rem 2rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: activeTab === 'TYT' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: activeTab === 'TYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >TYT (120 Soru)</button>
        <button 
          onClick={() => setActiveTab('AYT')}
          style={{ padding: '0.5rem 2rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: activeTab === 'AYT' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: activeTab === 'AYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >AYT (80 Soru)</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Grafik Alanı */}
        <div className="premium-card" style={{ padding: '2rem', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LucideLineChart size={20} color={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} /> {activeTab} Net Gelişimi Grafiği
          </h2>
          
          <div style={{ height: `${chartHeight}px`, minWidth: '600px', position: 'relative' }}>
            {filteredExams.length === 0 ? (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Henüz {activeTab} deneme verisi yok.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredExams} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)" 
                    tickFormatter={(tick) => format(parseISO(tick), 'd MMM', { locale: tr })} 
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    domain={[0, maxNet]} 
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                  <Area 
                    type="monotone" 
                    dataKey="totalNet" 
                    stroke={activeTab === 'TYT' ? '#10b981' : '#38bdf8'} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorNet)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Alt Kısım: Özet ve Liste */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Son Deneme Özeti */}
          <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={activeTab}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Son {activeTab} Denemesi</div>
            
            {lastExam ? (
              <>
                <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {lastExam.totalNet}
                  {Number(netDiff) !== 0 && (
                    <span style={{ fontSize: '1rem', color: Number(netDiff) > 0 ? '#10b981' : '#ef4444', fontWeight: 600, padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      {Number(netDiff) > 0 ? '+' : ''}{netDiff}
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentSubjects.map((sub, i) => {
                    const val = lastExam[sub.id as keyof MockExam];
                    return (
                      <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingBottom: '0.5rem', borderBottom: i < currentSubjects.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{sub.label}</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{val !== undefined ? val : 0} Net</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>Veri bulunamadı.</div>
            )}
          </motion.div>

          {/* Deneme Geçmişi Listesi */}
          <div className="premium-card">
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.5rem' }}>Tüm Deneme Geçmişi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {exams.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Deneme bulunmuyor.</div>}
              
              {[...exams].reverse().map(exam => (
                <div key={exam.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: exam.type === 'TYT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: exam.type === 'TYT' ? '#10b981' : '#38bdf8'
                    }}>
                      {exam.type}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Deneme Sınavı</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{format(parseISO(exam.date), 'd MMMM yyyy', { locale: tr })}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: exam.type === 'TYT' ? '#10b981' : '#38bdf8', fontWeight: 700 }}>{exam.totalNet} Net</span>
                    <button onClick={() => deleteExam(exam.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: '#1e293b', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Yeni Deneme Ekle</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              {/* Modal Tabs */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
                <button 
                  onClick={() => { setModalTab('TYT'); setNewExam({ date: newExam.date }); }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: modalTab === 'TYT' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: modalTab === 'TYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                >TYT</button>
                <button 
                  onClick={() => { setModalTab('AYT'); setNewExam({ date: newExam.date }); }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: modalTab === 'AYT' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: modalTab === 'AYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                >AYT</button>
              </div>

               <form onSubmit={handleAddExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* AI Optik / Sonuç Belgesi Okuyucu Panel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} color="#a855f7" style={{ fill: '#a855f7' }} /> AI Optik Okuyucu & Deneme Analizör
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>PREMIUM</span>
                  </div>
                  
                  {isScanning ? (
                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                      {/* Scanning laser effect */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', animation: 'scanAnim 2s infinite ease-in-out' }} />
                      <Loader2 size={24} color="#10b981" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Optik form taranıyor ve hatalar çözümleniyor...</span>
                      <style jsx>{`
                        @keyframes scanAnim {
                          0% { top: 0%; }
                          50% { top: 100%; }
                          100% { top: 0%; }
                        }
                      `}</style>
                    </div>
                  ) : scanDone ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: 8, color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Check size={16} />
                        <span>Başarılı! Optik veri okundu, netler forma dolduruldu.</span>
                      </div>
                      
                      {ocrMistakes.length > 0 && (
                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '0.75rem', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textAlign: 'left' }}>Tespit Edilen ve Hata Defterine Eklenecek Konular:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 2 }}>
                            {ocrMistakes.map((m, idx) => (
                              <span key={idx} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
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
                      className="btn-interactive"
                      style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px dashed rgba(168, 85, 247, 0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    >
                      <span>📸</span>
                      <span>Optik Form / Sonuç Belgesi Fotoğrafı Yükle</span>
                    </button>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tarih</label>
                  <input type="date" required value={newExam.date || ''} onChange={e => handleInputChange('date', e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {(modalTab === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS[userAlan]).map((sub) => (
                    <div key={sub.id}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{sub.label} Net</label>
                      <input 
                        type="number" step="0.25" min="-20" max={sub.max} required 
                        value={newExam[sub.id] || ''} 
                        onChange={e => handleInputChange(sub.id, e.target.value)} 
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                        placeholder={`Maks: ${sub.max}`} 
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.5rem', padding: '1rem', background: modalTab === 'TYT' ? 'rgba(16,185,129,0.1)' : 'rgba(56, 189, 248,0.1)', borderRadius: '8px', border: `1px dashed ${modalTab === 'TYT' ? '#10b981' : '#38bdf8'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: modalTab === 'TYT' ? '#10b981' : '#38bdf8', fontWeight: 600 }}>Toplam Net:</span>
                  <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700 }}>
                    {calculateCurrentTotal().toFixed(2)}
                  </span>
                </div>

                <button type="submit" className="btn-interactive" style={{ background: modalTab === 'TYT' ? 'linear-gradient(135deg, #10b981, #047857)' : 'linear-gradient(135deg, #38bdf8, #0284c7)', marginTop: '0.5rem' }}>
                  {modalTab} Denemesini Kaydet
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
