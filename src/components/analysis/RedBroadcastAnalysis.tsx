'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Play, Pause, Plus, X, Check, Bell, Share2, Download, 
  Sparkles, Zap, Award, Target, Clock, TrendingUp, ThumbsUp, 
  ThumbsDown, ChevronRight, BarChart3, AlertCircle, RefreshCw, 
  CheckCircle2, Flame, Maximize2, Layers, BookOpen, MessageSquare,
  HelpCircle, Eye, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DEMO_TYT_FALLBACK, DEMO_AYT_FALLBACK } from '@/components/dashboard/DemoVisualsShowcase';

// Dynamic import for 3D Galaxy Visualizer to avoid SSR Three.js issues
const GalaxyVisualizer = dynamic(() => import('@/components/analysis/GalaxyVisualizer'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#94a3b8' }}>
      <RefreshCw size={24} className="animate-spin" color="#FF0000" />
      <span style={{ marginLeft: '10px', fontSize: '13px' }}>3D Galaksi Yükleniyor…</span>
    </div>
  ),
});

// ── Red Broadcast Design Tokens ──
const RED_PRIMARY = '#FF0000';
const RED_HOVER = '#CC0000';
const LINK_BLUE = '#065FD4';
const TEXT_PRIMARY = '#F1F1F1';
const TEXT_SECONDARY = '#AAAAAA';
const BG_DARK = '#0F0F0F';
const SURFACE_CARD = '#181818';
const SURFACE_CHIP = '#212121';
const BORDER_COLOR = '#2B2B2B';
const SUCCESS_GREEN = '#2BA640';
const WARNING_AMBER = '#FB8C00';

interface ExamItem {
  id: string | number;
  name: string;
  type: 'TYT' | 'AYT';
  date: string;
  net: number;
  breakdown: {
    turkce?: number;
    mat?: number;
    sosyal?: number;
    fen?: number;
    fizik?: number;
    kimya?: number;
    biyo?: number;
  };
}

const CATEGORY_CHIPS = [
  'Tümü',
  'TYT Denemeleri',
  'AYT Denemeleri',
  'Soru Hızı Stüdyosu',
  '3D Gelişim Galaksisi',
  'Zayıf Konu Çalma Listesi',
  'Koç Canlı Yorumları',
];

export default function RedBroadcastAnalysis({ onNavigateTab }: { onNavigateTab?: (tab: string) => void }) {
  const { user } = useAuth();
  const isDemoAccount =
    user?.email === 'deneme@gmail.com' ||
    user?.username === 'deneme' ||
    user?.id === 'bbaa9549-136f-4206-86e3-5aa1f8c5d128';

  // Navigation & Filtering
  const [selectedChip, setSelectedChip] = useState('Tümü');
  const [playerMode, setPlayerMode] = useState<'chart' | 'speed' | 'galaxy'>('chart');
  const [examType, setExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);

  // Data states
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<{ TYT: ExamItem[]; AYT: ExamItem[] }>({ TYT: [], AYT: [] });
  const [focusData, setFocusData] = useState<any>(null);
  const [speedSummary, setSpeedSummary] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isEco, setIsEco] = useState(false);

  // New Exam Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [newExamForm, setNewExamForm] = useState({
    name: '',
    type: 'TYT' as 'TYT' | 'AYT',
    date: new Date().toISOString().split('T')[0],
    turkce: '32.5',
    mat: '28.0',
    sosyal: '14.5',
    fen: '13.0',
    fizik: '8.5',
    kimya: '7.0',
    biyo: '6.5',
  });

  // Chat message input in Live Chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; role: string; text: string; time: string; avatarColor: string }>>([
    {
      sender: 'AstraTutor AI',
      role: 'Eğitim Koçu',
      text: 'Son 3 denemedir TYT Matematikte 30 net barajını aştın! Şimdi Geometriye odaklanarak 35+ seviyesine tırmanabiliriz.',
      time: '2 dk önce',
      avatarColor: '#FF0000',
    },
    {
      sender: 'Soru Radarı',
      role: 'Hız Telemetrisi',
      text: 'Türkçe paragraf sorularında soru başına ortalama süren 62 saniyeye geriledi. Sınavda fazladan 14 dakika kazanacaksın.',
      time: '12 dk önce',
      avatarColor: '#065FD4',
    },
    {
      sender: 'Maarif Analizörü',
      role: 'Sistem',
      text: 'Fizik Dalgalar ve Kimya Piller konularında pekiştirme testleri sırada bekliyor.',
      time: '34 dk önce',
      avatarColor: '#2BA640',
    },
  ]);

  // Load all analysis data
  const loadData = async () => {
    setLoading(true);
    try {
      const [examsRes, focusRes, speedRes] = await Promise.all([
        fetch('/api/user/exams', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/user/focus?t=' + Date.now(), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/user/speed-stats', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      const formatted = { TYT: [] as ExamItem[], AYT: [] as ExamItem[] };
      if (Array.isArray(examsRes) && examsRes.length > 0) {
        examsRes.forEach((exam) => {
          const net = Number(exam.totalNet) || 0;
          const mapped: ExamItem = {
            id: exam.id,
            name: exam.name || 'Deneme Sınavı',
            type: exam.type === 'AYT' ? 'AYT' : 'TYT',
            date: new Date(exam.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
            net,
            breakdown: {
              turkce: Number(exam.turkishNet) || 0,
              mat: Number(exam.mathNet) || 0,
              fen: Number(exam.scienceNet) || 0,
              sosyal: Number(exam.socialNet) || 0,
              fizik: Number(exam.scienceNet ? exam.scienceNet / 3 : 0),
              kimya: Number(exam.scienceNet ? exam.scienceNet / 3 : 0),
              biyo: Number(exam.scienceNet ? exam.scienceNet / 3 : 0),
            },
          };
          if (mapped.type === 'AYT') formatted.AYT.push(mapped);
          else formatted.TYT.push(mapped);
        });
      }

      if (isDemoAccount || formatted.TYT.length === 0) {
        if (formatted.TYT.length === 0) {
          formatted.TYT = (DEMO_TYT_FALLBACK as any[]).map((d) => ({
            ...d,
            type: 'TYT',
          }));
        }
        if (formatted.AYT.length === 0) {
          formatted.AYT = (DEMO_AYT_FALLBACK as any[]).map((d) => ({
            ...d,
            type: 'AYT',
          }));
        }
      }

      setExams(formatted);
      setSelectedExam(formatted.TYT[formatted.TYT.length - 1] || null);
      setFocusData(focusRes);
      if (speedRes?.summary) setSpeedSummary(speedRes.summary);
    } catch (err) {
      console.error('RedBroadcast load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const savedEco = localStorage.getItem('yks_battery_saver') === 'true';
    if (savedEco) setIsEco(true);
  }, [isDemoAccount]);

  const activeExams = examType === 'TYT' ? exams.TYT : exams.AYT;
  const maxNetThreshold = examType === 'TYT' ? 120 : 80;
  const targetNet = examType === 'TYT' ? 105 : 72;

  // Calculation metrics
  const highestExam = useMemo(() => {
    if (activeExams.length === 0) return null;
    return [...activeExams].sort((a, b) => b.net - a.net)[0];
  }, [activeExams]);

  const avgNet = useMemo(() => {
    if (activeExams.length === 0) return 0;
    const sum = activeExams.reduce((acc, curr) => acc + curr.net, 0);
    return Number((sum / activeExams.length).toFixed(1));
  }, [activeExams]);

  const latestNet = activeExams.length > 0 ? activeExams[activeExams.length - 1].net : 0;
  const previousNet = activeExams.length > 1 ? activeExams[activeExams.length - 2].net : latestNet;
  const netDelta = Number((latestNet - previousNet).toFixed(2));

  // Planets for 3D Galaxy view
  const galaxyPlanets = useMemo(() => {
    return [
      { name: 'Matematik', color: '#38bdf8', distance: 4.5, size: 0.72, speed: 0.45, progress: 92 },
      { name: 'Fizik', color: '#8b5cf6', distance: 7.0, size: 0.65, speed: 0.35, progress: 84 },
      { name: 'Kimya', color: '#10b981', distance: 9.5, size: 0.74, speed: 0.52, progress: 95 },
      { name: 'Biyoloji', color: '#ec4899', distance: 12.0, size: 0.64, speed: 0.30, progress: 86 },
      { name: 'Türkçe', color: '#ef4444', distance: 14.5, size: 0.70, speed: 0.42, progress: 90 },
      { name: 'Geometri', color: '#f59e0b', distance: 17.0, size: 0.62, speed: 0.28, progress: 80 },
    ];
  }, []);

  // Weak topics playlist
  const weakTopicsPlaylist = [
    { id: 'w1', subject: 'Matematik', topic: 'Limit ve Süreklilik', errors: 3, netLoss: '-3.75 Net', timeEst: '15 dk', color: '#3b82f6' },
    { id: 'w2', subject: 'Fizik', topic: 'Manyetizma & İndüksiyon', errors: 2, netLoss: '-2.50 Net', timeEst: '20 dk', color: '#06b6d4' },
    { id: 'w3', subject: 'Kimya', topic: 'Elektrokimyasal Piller', errors: 2, netLoss: '-2.50 Net', timeEst: '12 dk', color: '#10b981' },
    { id: 'w4', subject: 'Türkçe', topic: 'Cümlede Anlam & Vurgu', errors: 4, netLoss: '-5.00 Net', timeEst: '10 dk', color: '#ef4444' },
    { id: 'w5', subject: 'Biyoloji', topic: 'Kalıtım & Soy Ağaçları', errors: 2, netLoss: '-2.50 Net', timeEst: '18 dk', color: '#8b5cf6' },
  ];

  // Handle adding new mock exam
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamForm.name) return;
    setIsSavingExam(true);

    try {
      const turk = parseFloat(newExamForm.turkce) || 0;
      const mat = parseFloat(newExamForm.mat) || 0;
      const sos = parseFloat(newExamForm.sosyal) || 0;
      const fen = parseFloat(newExamForm.fen) || 0;
      const total = turk + mat + sos + fen;

      const payload = {
        name: newExamForm.name,
        type: newExamForm.type,
        date: newExamForm.date,
        totalNet: total,
        turkishNet: turk,
        mathNet: mat,
        socialNet: sos,
        scienceNet: fen,
      };

      const res = await fetch('/api/user/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadData();
        setShowAddModal(false);
        setNewExamForm({
          name: '',
          type: 'TYT',
          date: new Date().toISOString().split('T')[0],
          turkce: '32.5',
          mat: '28.0',
          sosyal: '14.5',
          fen: '13.0',
          fizik: '8.5',
          kimya: '7.0',
          biyo: '6.5',
        });
      }
    } catch (err) {
      console.error('Exam save error:', err);
    } finally {
      setIsSavingExam(false);
    }
  };

  // Handle sending chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: user?.username || user?.full_name || 'Sen',
      role: 'Öğrenci',
      text: chatInput.trim(),
      time: 'Şimdi',
      avatarColor: '#8b5cf6',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Simulate instant AI coach response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'AstraTutor AI',
          role: 'Eğitim Koçu',
          text: `Analiz talebini aldım! "${chatInput.trim()}" doğrultusunda deneme soru hızını ve konu frekansını önceliklendiriyorum.`,
          time: 'Şimdi',
          avatarColor: '#FF0000',
        },
      ]);
    }, 1200);
  };

  // Toggle battery saver
  const toggleEco = () => {
    const next = !isEco;
    setIsEco(next);
    localStorage.setItem('yks_battery_saver', next ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('yks:toggle-battery-saver', { detail: next }));
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: BG_DARK,
        color: TEXT_PRIMARY,
        fontFamily: "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 24px))',
      }}
    >
      {/* ── TOP HORIZONTAL CHIPS BAR (Red Broadcast Chips) ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(15, 15, 15, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          padding: '8px 16px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedChip === chip;
          return (
            <button
              key={chip}
              onClick={() => {
                setSelectedChip(chip);
                if (chip === 'TYT Denemeleri') setExamType('TYT');
                if (chip === 'AYT Denemeleri') setExamType('AYT');
                if (chip === 'Soru Hızı Stüdyosu') setPlayerMode('speed');
                if (chip === '3D Gelişim Galaksisi') setPlayerMode('galaxy');
                if (chip === 'Tümü') setPlayerMode('chart');
              }}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: isSelected ? '#FFFFFF' : SURFACE_CHIP,
                color: isSelected ? '#0F0F0F' : TEXT_PRIMARY,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'background-color 0.15s ease, color 0.15s ease',
              }}
            >
              {chip === 'Soru Hızı Stüdyosu' && <Zap size={13} color={isSelected ? '#0F0F0F' : '#FF0000'} />}
              {chip === '3D Gelişim Galaksisi' && <span>🪐</span>}
              {chip === 'Koç Canlı Yorumları' && <MessageSquare size={13} />}
              {chip}
            </button>
          );
        })}
      </div>

      {/* ── MAIN CONTENT CONTAINER (Fluid with Max 2200px) ── */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '16px' }}>
        
        {/* ── 16:9 WIDESCREEN BROADCAST STUDIO PLAYER STAGE ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto 20px',
            backgroundColor: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${BORDER_COLOR}`,
            aspectRatio: '16 / 9',
            maxHeight: '640px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top-Left Live Streaming Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: RED_PRIMARY,
                boxShadow: `0 0 10px ${RED_PRIMARY}`,
                animation: 'pulse 1.8s infinite',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
              CANLI YAYIN • YKS GELİŞİM TELEMETRİSİ
            </span>
          </div>

          {/* Top-Right Telemetry Badges & Fullscreen Action */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              onClick={toggleEco}
              style={{
                height: '28px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: isEco ? 'rgba(43, 166, 64, 0.25)' : 'rgba(0, 0, 0, 0.6)',
                color: isEco ? '#2BA640' : '#AAAAAA',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Zap size={12} />
              <span>{isEco ? 'Eko Mod Açık' : 'GPU Yüksek'}</span>
            </button>

            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(8px)',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#FFFFFF',
              }}
            >
              {examType}: {latestNet} Net
            </div>
          </div>

          {/* ── PLAYER VIEW 1: NET AKIŞ GRAFİĞİ (Interactive SVG Telemetry) ── */}
          {playerMode === 'chart' && (
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 24px 44px', background: 'radial-gradient(circle at 50% 30%, #1a0a0a 0%, #000000 100%)' }}>
              
              {/* Chart Grid Lines & Target Line */}
              <div style={{ position: 'absolute', top: '60px', left: '24px', right: '24px', bottom: '50px', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, borderBottom: `1px dashed ${WARNING_AMBER}`, opacity: 0.4 }}>
                  <span style={{ position: 'absolute', right: 0, top: '-18px', fontSize: '11px', color: WARNING_AMBER, fontWeight: 700 }}>
                    🎯 Hedef Net: {targetNet}.0
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
              </div>

              {/* Main SVG Path for Net Progression */}
              <div style={{ width: '100%', height: '70%', position: 'relative' }}>
                <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="broadcastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED_PRIMARY} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={RED_PRIMARY} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  {activeExams.length > 1 && (
                    <polygon
                      points={`0,300 ${activeExams
                        .map((ex, i) => {
                          const x = (i / (activeExams.length - 1)) * 1000;
                          const y = 300 - (ex.net / maxNetThreshold) * 280;
                          return `${x},${y}`;
                        })
                        .join(' ')} 1000,300`}
                      fill="url(#broadcastGradient)"
                    />
                  )}

                  {/* Stroke line */}
                  {activeExams.length > 1 && (
                    <polyline
                      fill="none"
                      stroke={RED_PRIMARY}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={activeExams
                        .map((ex, i) => {
                          const x = (i / (activeExams.length - 1)) * 1000;
                          const y = 300 - (ex.net / maxNetThreshold) * 280;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Interactive Points */}
                  {activeExams.map((ex, i) => {
                    const x = activeExams.length === 1 ? 500 : (i / (activeExams.length - 1)) * 1000;
                    const y = 300 - (ex.net / maxNetThreshold) * 280;
                    const isSelected = selectedExam?.id === ex.id;
                    return (
                      <g key={ex.id || i} style={{ cursor: 'pointer' }} onClick={() => setSelectedExam(ex)} onMouseEnter={() => setHoveredDataPoint(ex)} onMouseLeave={() => setHoveredDataPoint(null)}>
                        <circle cx={x} cy={y} r={isSelected ? '8' : '5'} fill={isSelected ? '#FFFFFF' : RED_PRIMARY} stroke="#000000" strokeWidth="2" />
                        {isSelected && <circle cx={x} cy={y} r="14" fill="none" stroke={RED_PRIMARY} strokeWidth="2" opacity="0.6" />}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip if Point Hovered */}
                {hoveredDataPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(15, 15, 15, 0.95)',
                      border: `1px solid ${RED_PRIMARY}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                      zIndex: 35,
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{hoveredDataPoint.name}</div>
                    <div style={{ color: RED_PRIMARY, fontWeight: 800, marginTop: '2px' }}>
                      {hoveredDataPoint.net} Net • {hoveredDataPoint.date}
                    </div>
                  </div>
                )}
              </div>

              {/* Exam X-Axis Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', color: TEXT_SECONDARY }}>
                {activeExams.map((ex, i) => (
                  <span key={ex.id || i} style={{ fontWeight: selectedExam?.id === ex.id ? 700 : 400, color: selectedExam?.id === ex.id ? '#FFFFFF' : TEXT_SECONDARY }}>
                    {ex.date}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── PLAYER VIEW 2: SPEED STUDIO (Soru Hızı Radarı) ── */}
          {playerMode === 'speed' && (
            <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
              <div style={{ textAlign: 'center', maxWidth: '520px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,0,0,0.15)', border: `2px solid ${RED_PRIMARY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: RED_PRIMARY }}>
                  <Zap size={32} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                  Canlı Soru Hızı ve Süre Telemetrisi
                </h3>
                <p style={{ fontSize: '13px', color: TEXT_SECONDARY, lineHeight: 1.5, marginBottom: '20px' }}>
                  ÖSYM sınav standardında soru başına ideal süren 75 saniyedir. Şu anki soru hızın ortalama 64 saniye ile <strong>%14 ideal tempo üstünde</strong>!
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: SURFACE_CARD, padding: '12px', borderRadius: '8px', border: `1px solid ${BORDER_COLOR}` }}>
                    <div style={{ fontSize: '11px', color: TEXT_SECONDARY }}>Ort. Soru Süresi</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: SUCCESS_GREEN, marginTop: '4px' }}>64 sn</div>
                  </div>
                  <div style={{ backgroundColor: SURFACE_CARD, padding: '12px', borderRadius: '8px', border: `1px solid ${BORDER_COLOR}` }}>
                    <div style={{ fontSize: '11px', color: TEXT_SECONDARY }}>Zaman Kazancı</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>+14 dk</div>
                  </div>
                  <div style={{ backgroundColor: SURFACE_CARD, padding: '12px', borderRadius: '8px', border: `1px solid ${BORDER_COLOR}` }}>
                    <div style={{ fontSize: '11px', color: TEXT_SECONDARY }}>İdeal Hız Oranı</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: RED_PRIMARY, marginTop: '4px' }}>%82</div>
                  </div>
                </div>
                <Link
                  href="/soru-coz"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: RED_PRIMARY,
                    color: '#FFFFFF',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  <Play size={15} fill="#FFFFFF" />
                  <span>Kronometreli Hız Testi Başlat</span>
                </Link>
              </div>
            </div>
          )}

          {/* ── PLAYER VIEW 3: 3D GALAXY (Gelişim Galaksisi) ── */}
          {playerMode === 'galaxy' && (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <GalaxyVisualizer planets={galaxyPlanets} isEco={isEco} />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }}>
                Farenizle sürükleyerek galakside 3D gezinebilirsiniz
              </div>
            </div>
          )}

          {/* ── BOTTOM RED BROADCAST PROGRESS BAR & CONTROLS OVERLAY ── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              backgroundColor: 'rgba(15, 15, 15, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '6px 16px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Red Scrub Bar Indicator */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (latestNet / targetNet) * 100)}%`,
                  backgroundColor: RED_PRIMARY,
                  boxShadow: `0 0 8px ${RED_PRIMARY}`,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-4px',
                    top: '-3.5px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: RED_PRIMARY,
                  }}
                />
              </div>
            </div>

            {/* View Switcher Chips (Player Controls) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <button
                onClick={() => setPlayerMode('chart')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: playerMode === 'chart' ? RED_PRIMARY : 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <BarChart3 size={12} />
                <span>Net Akış Grafiği</span>
              </button>

              <button
                onClick={() => setPlayerMode('speed')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: playerMode === 'speed' ? RED_PRIMARY : 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Zap size={12} />
                <span>Soru Hızı</span>
              </button>

              <button
                onClick={() => setPlayerMode('galaxy')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: playerMode === 'galaxy' ? RED_PRIMARY : 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span>🪐</span>
                <span>3D Galaksi</span>
              </button>
            </div>

            {/* Exam Type Toggle (TYT vs AYT) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: '9999px',
                padding: '2px',
                marginTop: '4px',
              }}
            >
              <button
                onClick={() => setExamType('TYT')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: examType === 'TYT' ? '#FFFFFF' : 'transparent',
                  color: examType === 'TYT' ? '#0F0F0F' : TEXT_SECONDARY,
                }}
              >
                TYT
              </button>
              <button
                onClick={() => setExamType('AYT')}
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: examType === 'AYT' ? '#FFFFFF' : 'transparent',
                  color: examType === 'AYT' ? '#0F0F0F' : TEXT_SECONDARY,
                }}
              >
                AYT
              </button>
            </div>
          </div>
        </div>

        {/* ── STREAM DETAILS & CHANNEL METADATA BAR (Directly Below Player) ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto 28px' }}>
          {/* Stream Title (Watch Title: Roboto 20px/28px 700) */}
          <h1
            style={{
              fontSize: '20px',
              lineHeight: '28px',
              fontWeight: 700,
              color: TEXT_PRIMARY,
              margin: '0 0 12px',
            }}
          >
            YKS 2026 {examType} Sürekli Gelişim Karnesi & Net Akışı (Son {activeExams.length} Deneme Yayını)
          </h1>

          {/* Channel Row & Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            {/* Left: Channel Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF0000 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'Y'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: TEXT_PRIMARY }}>
                    {user?.username || user?.full_name || 'YKS Şampiyonu'}
                  </span>
                  <span
                    title="Doğrulanmış Öğrenci Kanalı"
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: SUCCESS_GREEN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }}>
                  🔥 24 Günlük Seri • 1.680 Çözülen Soru • Hedef: İlk 5.000
                </div>
              </div>

              {/* Subscribe/Target Button */}
              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: isSubscribed ? SURFACE_CHIP : RED_PRIMARY,
                  color: isSubscribed ? TEXT_PRIMARY : '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '8px',
                  transition: 'background-color 0.2s',
                }}
              >
                <Bell size={14} fill={isSubscribed ? TEXT_PRIMARY : 'none'} />
                <span>{isSubscribed ? 'Hedef Takipte' : 'Hedefi Takip Et'}</span>
              </button>
            </div>

            {/* Right: Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Like/Dislike Segmented Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: SURFACE_CHIP,
                  borderRadius: '9999px',
                  border: `1px solid ${BORDER_COLOR}`,
                  height: '36px',
                  overflow: 'hidden',
                }}
              >
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: TEXT_PRIMARY,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRight: `1px solid ${BORDER_COLOR}`,
                  }}
                  title="En Yüksek Net Rekoru"
                >
                  <ThumbsUp size={14} color={SUCCESS_GREEN} />
                  <span>{highestExam ? `${highestExam.net} Net Rekor` : '104.25 Net'}</span>
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 12px',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    color: TEXT_SECONDARY,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  title="Son Değişim Oranı"
                >
                  <TrendingUp size={14} color={netDelta >= 0 ? SUCCESS_GREEN : RED_PRIMARY} />
                  <span>{netDelta >= 0 ? `+${netDelta}` : netDelta}</span>
                </button>
              </div>

              {/* Add Mock Exam Button (Signature Red Action) */}
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  height: '36px',
                  padding: '0 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  backgroundColor: RED_PRIMARY,
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(255,0,0,0.3)',
                  transition: 'background-color 0.2s',
                }}
              >
                <Plus size={16} />
                <span>Yeni Deneme Yayını Ekle</span>
              </button>

              {/* Speed Test Button */}
              <Link
                href="/soru-coz"
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '9999px',
                  border: `1px solid ${BORDER_COLOR}`,
                  backgroundColor: SURFACE_CHIP,
                  color: TEXT_PRIMARY,
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <Zap size={14} color="#FF0000" />
                <span>Hız Testi</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN MAIN BROADCAST LAYOUT (Grid Left + Up Next Right) ── */}
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '24px',
          }}
          className="mobile-stack"
        >
          {/* ── LEFT COLUMN: VIDEO GRID ARCHITECTURE (Broadcast Deneme Kayıtları) ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: TEXT_PRIMARY, margin: 0 }}>
                Yayın Arşivi & Deneme Kayıtları
              </h2>
              <span style={{ fontSize: '13px', color: TEXT_SECONDARY }}>
                Toplam {activeExams.length} Deneme Çözüldü
              </span>
            </div>

            {/* Video Cards Grid (Auto-fill with 300px min width) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
                rowGap: '32px',
              }}
            >
              {activeExams.map((exam, index) => {
                const isSelected = selectedExam?.id === exam.id;
                const netPercent = Math.min(100, (exam.net / maxNetThreshold) * 100);

                return (
                  <div
                    key={exam.id || index}
                    onClick={() => {
                      setSelectedExam(exam);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      outline: 'none',
                    }}
                  >
                    {/* 16:9 Thumbnail Stack (No card border/shadow as per Red Broadcast spec) */}
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#161616',
                        background: 'linear-gradient(135deg, #1c1313 0%, #111111 100%)',
                        border: isSelected ? `2px solid ${RED_PRIMARY}` : '1px solid rgba(255,255,255,0.06)',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* Top-Left Exam Type Chip */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(6px)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {exam.type}
                      </div>

                      {/* Center Giant Net Display */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: '#FFFFFF',
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 14px rgba(0,0,0,0.8)',
                          }}
                        >
                          {exam.net}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: RED_PRIMARY,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}
                        >
                          TOPLAM NET
                        </div>
                      </div>

                      {/* Duration / Date Badge Bottom-Right (Red Broadcast Spec) */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {exam.date}
                      </div>

                      {/* Bottom Red Broadcast Progress Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${netPercent}%`,
                            backgroundColor: RED_PRIMARY,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadata Below Thumbnail: Avatar Left, Title & Stats Right */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* Avatar */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#262626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          flexShrink: 0,
                          color: '#FFFFFF',
                        }}
                      >
                        📝
                      </div>

                      {/* Title + Metadata (2-line clamp strict) */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            lineHeight: '20px',
                            fontWeight: 500,
                            color: TEXT_PRIMARY,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {exam.name}
                        </div>

                        <div style={{ fontSize: '12px', color: TEXT_SECONDARY, marginTop: '2px' }}>
                          YKS Yıldızı Simülasyonu
                        </div>

                        <div style={{ fontSize: '12px', color: TEXT_SECONDARY, marginTop: '1px' }}>
                          {exam.net} Net • {exam.breakdown.mat || 0} Mat • {exam.breakdown.turkce || 0} Türkçe
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── DERS BAZLI NET TELEMETRİSİ ── */}
            <div style={{ marginTop: '36px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: TEXT_PRIMARY, marginBottom: '14px' }}>
                Branş Bazlı Canlı Net Dağılımı ({selectedExam?.name || 'Son Deneme'})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {[
                  { name: 'Türkçe', net: selectedExam?.breakdown.turkce ?? 32.5, max: 40, color: '#ef4444' },
                  { name: 'Matematik', net: selectedExam?.breakdown.mat ?? 28.0, max: 40, color: '#3b82f6' },
                  { name: 'Sosyal', net: selectedExam?.breakdown.sosyal ?? 14.5, max: 20, color: '#f59e0b' },
                  { name: 'Fen Bilimleri', net: selectedExam?.breakdown.fen ?? 13.0, max: 20, color: '#10b981' },
                ].map((subject) => (
                  <div
                    key={subject.name}
                    style={{
                      backgroundColor: SURFACE_CARD,
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${BORDER_COLOR}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: TEXT_SECONDARY }}>
                      <span>{subject.name}</span>
                      <span style={{ color: subject.color, fontWeight: 700 }}>
                        {subject.net} / {subject.max}
                      </span>
                    </div>

                    <div
                      style={{
                        height: '4px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '9999px',
                        marginTop: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (subject.net / subject.max) * 100)}%`,
                          backgroundColor: subject.color,
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: UP NEXT PLAYLIST & LIVE CHAT FEED ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ── 1. UP NEXT PLAYLIST: KRİTİK EKSİK KONULAR ── */}
            <div
              style={{
                backgroundColor: SURFACE_CARD,
                borderRadius: '12px',
                border: `1px solid ${BORDER_COLOR}`,
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: TEXT_PRIMARY, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Sıradaki Tekrarlar</span>
                  <span style={{ fontSize: '11px', color: RED_PRIMARY, fontWeight: 700 }}>• KRİTİK LİSTE</span>
                </h3>
                <span style={{ fontSize: '11px', color: TEXT_SECONDARY }}>5 Konu</span>
              </div>

              {/* Horizontal List Items (168x94px Thumbnail Left, Info Right) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {weakTopicsPlaylist.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      padding: '6px',
                      borderRadius: '8px',
                      transition: 'background-color 0.15s',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Compact 16:9 Thumbnail (approx 120x68px on sidebar) */}
                    <div
                      style={{
                        width: '110px',
                        aspectRatio: '16 / 9',
                        borderRadius: '8px',
                        backgroundColor: '#111111',
                        border: '1px solid rgba(255,255,255,0.08)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: '18px' }}>🎯</div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: 500,
                          padding: '1px 4px',
                          borderRadius: '2px',
                        }}
                      >
                        {item.timeEst}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: TEXT_PRIMARY,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.topic}
                      </div>
                      <div style={{ fontSize: '11px', color: item.color, fontWeight: 600, marginTop: '2px' }}>
                        {item.subject}
                      </div>
                      <div style={{ fontSize: '11px', color: WARNING_AMBER, marginTop: '2px' }}>
                        {item.errors} Yanlış • {item.netLoss}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/eksikler"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '8px',
                  marginTop: '12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: TEXT_PRIMARY,
                  fontSize: '12px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: `1px solid ${BORDER_COLOR}`,
                }}
              >
                Tüm Eksik Listesini Aç
              </Link>
            </div>

            {/* ── 2. LIVE CHAT / KOÇ YORUMLARI FEED ── */}
            <div
              style={{
                backgroundColor: SURFACE_CARD,
                borderRadius: '12px',
                border: `1px solid ${BORDER_COLOR}`,
                display: 'flex',
                flexDirection: 'column',
                height: '420px',
                overflow: 'hidden',
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: RED_PRIMARY }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Canlı Koç Akışı</span>
                </div>
                <span style={{ fontSize: '11px', color: TEXT_SECONDARY }}>AstraTutor Telemetrisi</span>
              </div>

              {/* Chat Messages Body */}
              <div
                style={{
                  flex: 1,
                  padding: '12px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: msg.avatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    >
                      {msg.sender.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: msg.avatarColor }}>
                          {msg.sender}
                        </span>
                        <span style={{ fontSize: '10px', color: TEXT_SECONDARY }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: '12px', lineHeight: 1.45, color: '#E0E0E0', margin: '2px 0 0' }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar (Red Broadcast Comment Style) */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '10px 12px',
                  borderTop: `1px solid ${BORDER_COLOR}`,
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  placeholder="Koçuna soru sor veya analiz iste..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{
                    flex: 1,
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: '9999px',
                    padding: '0 14px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: RED_PRIMARY,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: YENİ DENEME YAYINI EKLE (Red Broadcast Elevation Level 3) ── */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#1c1c1c',
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: '16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${BORDER_COLOR}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: RED_PRIMARY }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Yeni Deneme Yayını Kaydet
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: TEXT_SECONDARY,
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveExam} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: TEXT_SECONDARY, marginBottom: '6px' }}>
                  Deneme Adı & Yayıncı
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3D Türkiye Geneli TYT Denemesi #5"
                  value={newExamForm.name}
                  onChange={(e) => setNewExamForm({ ...newExamForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${BORDER_COLOR}`,
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: TEXT_SECONDARY, marginBottom: '6px' }}>
                    Sınav Türü
                  </label>
                  <select
                    value={newExamForm.type}
                    onChange={(e) => setNewExamForm({ ...newExamForm, type: e.target.value as 'TYT' | 'AYT' })}
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${BORDER_COLOR}`,
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13px',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="TYT">TYT (Temel Yeterlilik)</option>
                    <option value="AYT">AYT (Alan Yeterlilik)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: TEXT_SECONDARY, marginBottom: '6px' }}>
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={newExamForm.date}
                    onChange={(e) => setNewExamForm({ ...newExamForm, date: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${BORDER_COLOR}`,
                      borderRadius: '8px',
                      padding: '0 12px',
                      fontSize: '13px',
                      color: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Net Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: TEXT_SECONDARY, marginBottom: '4px' }}>Türkçe Net</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newExamForm.turkce}
                    onChange={(e) => setNewExamForm({ ...newExamForm, turkce: e.target.value })}
                    style={{ width: '100%', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '6px', padding: '0 10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: TEXT_SECONDARY, marginBottom: '4px' }}>Matematik Net</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newExamForm.mat}
                    onChange={(e) => setNewExamForm({ ...newExamForm, mat: e.target.value })}
                    style={{ width: '100%', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '6px', padding: '0 10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: TEXT_SECONDARY, marginBottom: '4px' }}>Sosyal Net</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newExamForm.sosyal}
                    onChange={(e) => setNewExamForm({ ...newExamForm, sosyal: e.target.value })}
                    style={{ width: '100%', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '6px', padding: '0 10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: TEXT_SECONDARY, marginBottom: '4px' }}>Fen Net</label>
                  <input
                    type="number"
                    step="0.25"
                    value={newExamForm.fen}
                    onChange={(e) => setNewExamForm({ ...newExamForm, fen: e.target.value })}
                    style={{ width: '100%', height: '36px', backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER_COLOR}`, borderRadius: '6px', padding: '0 10px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '9999px',
                    border: `1px solid ${BORDER_COLOR}`,
                    background: 'transparent',
                    color: TEXT_PRIMARY,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSavingExam}
                  style={{
                    height: '36px',
                    padding: '0 18px',
                    borderRadius: '9999px',
                    border: 'none',
                    backgroundColor: RED_PRIMARY,
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(255,0,0,0.4)',
                  }}
                >
                  {isSavingExam ? 'Kaydediliyor…' : 'Yayına Al'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
