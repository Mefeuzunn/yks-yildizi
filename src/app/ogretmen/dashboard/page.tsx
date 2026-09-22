"use client";
// v2 – comprehensive teacher panel

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Megaphone, FileText,
  Plus, Copy, Check, Loader2, X, TrendingUp, AlertTriangle,
  Star, Calendar, Award, Eye, BarChart2, Search, Filter,
  ChevronUp, ChevronDown, Trash2, Bell, Zap, Target,
  GraduationCap, BookMarked, PenLine, RefreshCw, ArrowRight,
  CheckCircle, Clock, AlertCircle, Flame, Trophy, Shield, Sparkles, BrainCircuit, Target
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Tab = 'genel' | 'siniflar' | 'ogrenciler' | 'odevler' | 'analiz' | 'kaynaklar' | 'duyurular';

interface ClassItem { id: string; class_name: string; class_code: string; student_count: number; avg_success: number; created_at: string; }
interface StudentItem { id: string; username: string; alan: string; sinif: string; solved_questions: number; success_rate: number; league: string; league_points: number; streak_days: number; }
interface AssignmentItem { id: string; title: string; description: string; due_date: string; total_assigned: number; submitted_count: number; created_at: string; }
interface ResourceItem { id: string; title: string; content: string; subject: string; topic: string; resource_type: string; class_id: string; created_at: string; }
interface AnnouncementItem { id: string; title: string; content: string; class_id: string; class_name?: string; created_at: string; }

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const LEAGUE_COLORS: Record<string, string> = {
  Bronz: '#cd7f32', Gümüş: '#9ca3af', Altın: '#f59e0b',
  Elmas: '#38bdf8', Zümrüt: '#10b981', Efsane: '#a855f7',
};
const ALAN_COLORS: Record<string, string> = {
  Sayisal: '#38bdf8', 'Esit Agirlik': '#10b981', Sozel: '#a855f7', Dil: '#f59e0b',
};

function successColor(rate: number) {
  if (rate >= 70) return '#10b981';
  if (rate >= 40) return '#f59e0b';
  return '#ef4444';
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(due: string) {
  if (!due) return null;
  const diff = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  return diff;
}

// Mini bar chart
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  );
}

// Success ring
function SuccessRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = successColor(value);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
    </svg>
  );
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: `${color}18`, padding: '0.65rem', borderRadius: 12 }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────
function Modal({ open, onClose, title, children, maxW = 560 }: any) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ background: 'linear-gradient(135deg,#12141c,#0d0f18)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: maxW, maxHeight: '88vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#9ca3af', padding: '6px', display: 'flex', alignItems: 'center' }}>
              <X size={20} />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ background: `${color}18`, color, padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
import { useSearchParams, useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', color: '#fff' }}>Yükleniyor...</div>}>
      <TeacherDashboardContent />
    </Suspense>
  );
}

function TeacherDashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams?.get('tab') as Tab | null;
  
  const [activeTab, setActiveTab] = useState<Tab>('genel');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('genel');
    }
  }, [tabParam]);

  const handleTabChange = (key: Tab) => {
    setActiveTab(key);
    if (key === 'genel') {
      router.push('/ogretmen/dashboard');
    } else {
      router.push(`/ogretmen/dashboard?tab=${key}`);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'ogretmen') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [assignmentDetail, setAssignmentDetail] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  const [aiClassId, setAiClassId] = useState<string>('');
  const [classInsights, setClassInsights] = useState<any>(null);
  const [classInsightsLoading, setClassInsightsLoading] = useState(false);

  const fetchClassInsights = useCallback(async (classId: string) => {
    if (!classId) return;
    setClassInsightsLoading(true);
    try {
      const res = await fetch(`/api/ogretmen/analytics/class-insights?classId=${classId}`);
      if (res.ok) {
        const data = await res.json();
        setClassInsights(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClassInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (aiClassId) {
      fetchClassInsights(aiClassId);
    }
  }, [aiClassId, fetchClassInsights]);

  useEffect(() => {
    if (selectedStudent) {
      setStudentDetailLoading(true);
      setStudentDetail(null);
      fetch(`/api/ogretmen/ogrenciler/${selectedStudent.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setStudentDetail(data);
        })
        .catch(err => console.error(err))
        .finally(() => setStudentDetailLoading(false));
    } else {
      setStudentDetail(null);
    }
  }, [selectedStudent]);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSort, setStudentSort] = useState<{ field: keyof StudentItem; dir: 'asc' | 'desc' }>({ field: 'success_rate', dir: 'desc' });

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', class_id: '', due_date: '' });
  const [newResource, setNewResource] = useState({ title: '', content: '', subject: '', topic: '', resource_type: 'note', class_id: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', class_id: '' });

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<Record<string, string>>({});
  
  // XP Awarding States
  const [awardXpModal, setAwardXpModal] = useState<StudentItem | null>(null);
  const [awardAmount, setAwardAmount] = useState<number>(50);

  // ── Fetch Functions ──
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/dashboard');
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const handleAwardXp = async () => {
    if (!awardXpModal) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/students/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: awardXpModal.id, amount: awardAmount })
      });
      if (res.ok) {
        setAwardXpModal(null);
        fetchStudents();
        // Optional: you can show a toast here
      } else {
        const err = await res.json();
        alert(err.error || 'Hata oluştu');
      }
    } catch (e) {
      console.error(e);
      alert('Beklenmeyen bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/analytics');
      if (res.ok) setAnalytics(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/siniflar');
      if (res.ok) {
        const data = await res.json();
        const list = data.classes ?? data ?? [];
        setClasses(list);
        if (list.length > 0 && !aiClassId) {
          setAiClassId(list[0].id);
        }
      }
    } catch (e) { console.error(e); }
  }, [aiClassId]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedClassId !== 'all' ? `/api/ogretmen/ogrenciler?classId=${selectedClassId}` : '/api/ogretmen/ogrenciler';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students ?? data ?? []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedClassId]);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/odev');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments ?? data ?? []);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/kaynaklar');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources ?? data ?? []);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/ogretmen/duyurular');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements ?? data ?? []);
      }
    } catch (e) { console.error(e); }
  }, []);

  const fetchAssignmentDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/ogretmen/odev/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Merge { assignment, submissions } into a flat object for the modal
        setAssignmentDetail({ ...data.assignment, submissions: data.submissions ?? [] });
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`"${className}" sınıfını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
    try {
      const res = await fetch(`/api/ogretmen/siniflar?id=${classId}`, { method: 'DELETE' });
      if (res.ok) { fetchClasses(); fetchDashboard(); }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user?.role === 'ogretmen') {
      fetchDashboard();
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'ogretmen') return;
    if (activeTab === 'ogrenciler') fetchStudents();
    if (activeTab === 'odevler') fetchAssignments();
    if (activeTab === 'kaynaklar') fetchResources();
    if (activeTab === 'duyurular') fetchAnnouncements();
    if (activeTab === 'analiz') { fetchAnalytics(); fetchClasses(); if (aiClassId) fetchClassInsights(aiClassId); }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ogrenciler') fetchStudents();
  }, [selectedClassId]);

  // ── Handlers ──
  const handleAssignStudent = async (studentId: string, classId: string) => {
    try {
      const res = await fetch('/api/ogretmen/ogrenciler/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, class_id: classId })
      });
      if (res.ok) {
        fetchStudents();
      } else {
        alert('Öğrenci sınıfı değiştirilirken hata oluştu.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/siniflar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_name: newClassName })
      });
      if (res.ok) { fetchClasses(); fetchDashboard(); setNewClassName(''); setActiveModal(null); }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.class_id) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/odev', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      if (res.ok) {
        fetchAssignments(); fetchDashboard();
        setNewAssignment({ title: '', description: '', class_id: '', due_date: '' });
        setActiveModal(null);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/kaynaklar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResource)
      });
      if (res.ok) {
        fetchResources();
        setNewResource({ title: '', content: '', subject: '', topic: '', resource_type: 'note', class_id: '' });
        setActiveModal(null);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/duyurular', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement)
      });
      if (res.ok) {
        fetchAnnouncements(); fetchDashboard();
        setNewAnnouncement({ title: '', content: '', class_id: '' });
        setActiveModal(null);
      }
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleGrade = async (assignmentId: string, studentId: string, score: number) => {
    try {
      await fetch(`/api/ogretmen/odev/${assignmentId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, score })
      });
      fetchAssignmentDetail(assignmentId);
    } catch (e) { console.error(e); }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // ── Filtered/sorted students ──
  const filteredStudents = students
    .filter(s => s.username?.toLowerCase().includes(studentSearch.toLowerCase()) || s.alan?.toLowerCase().includes(studentSearch.toLowerCase()))
    .sort((a, b) => {
      const va = a[studentSort.field] as any;
      const vb = b[studentSort.field] as any;
      return studentSort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const toggleSort = (field: keyof StudentItem) => {
    setStudentSort(prev => prev.field === field ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'desc' });
  };

  if (!user || user.role !== 'ogretmen') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Shield size={48} color="#ef4444" />
        <p style={{ color: '#fff', fontSize: '1.25rem' }}>Sadece öğretmenler bu sayfaya erişebilir.</p>
      </div>
    );
  }

  // ── Shared input styles ──
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: '0.95rem', outline: 'none',
    boxSizing: 'border-box',
  };
  const sel: React.CSSProperties = { ...inp, appearance: 'none' as any };

  // ── Tab config ──
  const TABS: { key: Tab; label: string; icon: any; color: string }[] = [
    { key: 'genel', label: 'Genel Bakış', icon: LayoutDashboard, color: '#38bdf8' },
    { key: 'siniflar', label: 'Sınıflarım', icon: GraduationCap, color: '#10b981' },
    { key: 'ogrenciler', label: 'Öğrenciler', icon: Users, color: '#a855f7' },
    { key: 'odevler', label: 'Ödevler', icon: ClipboardList, color: '#f59e0b' },
    { key: 'analiz', label: 'Analiz', icon: BarChart2, color: '#f43f5e' },
    { key: 'kaynaklar', label: 'Kaynaklar', icon: BookMarked, color: '#3b82f6' },
    { key: 'duyurular', label: 'Duyurular', icon: Bell, color: '#8b5cf6' },
  ];

  const activeTabConfig = TABS.find(t => t.key === activeTab)!;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1rem', minHeight: '100vh' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#10b981,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', margin: 0, fontWeight: 800 }}>Eğitmen Paneli</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              {user.username} · <span style={{ color: '#10b981' }}>{(user as any).brans || 'Genel'}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => { fetchDashboard(); fetchClasses(); }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9ca3af', padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <RefreshCw size={16} /> Yenile
          </button>
          <button onClick={() => setActiveModal('sinif')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> Yeni Sınıf
          </button>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)} style={{
            padding: '0.65rem 1.1rem', borderRadius: 12, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', fontWeight: 600,
            whiteSpace: 'nowrap', transition: 'all 0.2s',
            background: activeTab === t.key ? `${t.color}20` : 'rgba(255,255,255,0.04)',
            color: activeTab === t.key ? t.color : 'var(--text-secondary)',
            boxShadow: activeTab === t.key ? `0 0 0 1px ${t.color}40` : 'none',
          }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          TAB: GENEL BAKIŞ
      ══════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'genel' && (
          <motion.div key="genel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <StatCard label="Toplam Öğrenci" value={stats?.totalStudents ?? 0} icon={Users} color="#38bdf8" sub={`${stats?.classCount ?? 0} sınıf`} />
              <StatCard label="Aktif Ödev" value={stats?.activeAssignments ?? 0} icon={ClipboardList} color="#f59e0b" />
              <StatCard label="Ortalama Başarı" value={`%${(stats?.avgSuccess ?? 0).toFixed(1)}`} icon={TrendingUp} color="#10b981" />
              <StatCard label="Yaklaşan Teslim" value={stats?.upcomingDeadlines?.length ?? 0} icon={Clock} color="#f43f5e" sub="7 gün içinde" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

              {/* Upcoming deadlines */}
              <div className="premium-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Clock size={18} color="#f43f5e" />
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>Yaklaşan Teslimler</h3>
                </div>
                {(stats?.upcomingDeadlines ?? []).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Yaklaşan teslim tarihi yok.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(stats?.upcomingDeadlines ?? []).map((a: any) => {
                      const left = daysLeft(a.due_date);
                      const rate = a.total_assigned > 0 ? Math.round((a.submitted_count / a.total_assigned) * 100) : 0;
                      return (
                        <div key={a.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</span>
                            <span style={{ color: (left ?? 0) <= 2 ? '#ef4444' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                              {left === 0 ? 'Bugün!' : left === 1 ? 'Yarın' : `${left} gün`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MiniBar value={a.submitted_count} max={a.total_assigned} color="#10b981" />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{rate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent announcements */}
              <div className="premium-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Bell size={18} color="#8b5cf6" />
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>Son Duyurular</h3>
                  </div>
                  <button onClick={() => { setActiveModal('duyuru'); setActiveTab('duyurular'); }} style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> Yeni
                  </button>
                </div>
                {(stats?.recentAnnouncements ?? []).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Henüz duyuru yok.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {(stats?.recentAnnouncements ?? []).map((a: any) => (
                      <div key={a.id} style={{ padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>
                          {a.class_name ?? 'Tüm Sınıflar'} · {formatDate(a.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="premium-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#f59e0b" /> Hızlı İşlemler
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Yeni Ödev Ata', icon: ClipboardList, color: '#f59e0b', action: () => { setActiveTab('odevler'); setActiveModal('odev'); } },
                  { label: 'Duyuru Yap', icon: Megaphone, color: '#8b5cf6', action: () => { setActiveTab('duyurular'); setActiveModal('duyuru'); } },
                  { label: 'Kaynak Paylaş', icon: FileText, color: '#3b82f6', action: () => { setActiveTab('kaynaklar'); setActiveModal('kaynak'); } },
                  { label: 'Analiz Görüntüle', icon: BarChart2, color: '#f43f5e', action: () => setActiveTab('analiz') },
                ].map((item) => (
                  <button key={item.label} onClick={item.action} style={{
                    padding: '1.1rem 1.25rem', background: `${item.color}10`, border: `1px solid ${item.color}25`,
                    borderRadius: 12, color: item.color, textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s',
                    fontWeight: 600, fontSize: '0.875rem',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${item.color}20`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${item.color}10`)}
                  >
                    <item.icon size={20} /> {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: SINIFLARIM
        ══════════════════════════════════════════ */}
        {activeTab === 'siniflar' && (
          <motion.div key="siniflar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Sınıflarım</h2>
              <button onClick={() => setActiveModal('sinif')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Plus size={16} /> Yeni Sınıf
              </button>
            </div>

            {classes.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <GraduationCap size={52} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 1.25rem', display: 'block' }} />
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Henüz sınıf oluşturmadınız</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Sınıf oluşturun ve öğrencilerinizi davet edin.</p>
                <button onClick={() => setActiveModal('sinif')} className="btn-interactive" style={{ background: '#10b981' }}>Sınıf Oluştur</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.25rem' }}>
                {classes.map((c, idx) => {
                  const colors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#f43f5e', '#3b82f6'];
                  const col = colors[idx % colors.length];
                  return (
                    <div key={c.id} className="premium-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${col},${col}80)` }} />

                      {/* Card header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{c.class_name}</h3>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 4 }}>{formatDate(c.created_at)} oluşturuldu</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <div style={{ background: `${col}18`, color: col, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${col}30` }}>
                            {c.student_count} öğrenci
                          </div>
                          {c.student_count > 0 && (
                            <div style={{ color: successColor(c.avg_success ?? 0), fontSize: '0.78rem', fontWeight: 700 }}>
                              Ort. %{(c.avg_success ?? 0).toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Class code box */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: 2 }}>Sınıf Kodu</div>
                          <code style={{ color: col, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.15em' }}>{c.class_code}</code>
                        </div>
                        <button onClick={() => copyToClipboard(c.class_code)} style={{ marginLeft: 'auto', background: copiedCode === c.class_code ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)', border: `1px solid ${copiedCode === c.class_code ? '#10b98140' : 'rgba(255,255,255,0.12)'}`, borderRadius: 8, cursor: 'pointer', color: copiedCode === c.class_code ? '#10b981' : '#9ca3af', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', transition: 'all 0.2s' }}>
                          {copiedCode === c.class_code ? <><Check size={14} /> Kopyalandı</> : <><Copy size={14} /> Kopyala</>}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button onClick={() => { setSelectedClassId(c.id); setActiveTab('ogrenciler'); }} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: 'var(--text-secondary)', padding: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${col}12`; e.currentTarget.style.color = col; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          <Users size={14} /> Öğrenciler <ArrowRight size={14} />
                        </button>
                        <button onClick={() => handleDeleteClass(c.id, c.class_name)} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', padding: '0.6rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                          title="Sınıfı Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: ÖĞRENCİLERİM
        ══════════════════════════════════════════ */}
        {activeTab === 'ogrenciler' && (
          <motion.div key="ogrenciler" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Öğrenci ara…" style={{ ...inp, paddingLeft: '2.4rem' }} />
              </div>
              <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} style={{ ...sel, width: 'auto', minWidth: 180 }}>
                <option value="all" style={{ background: '#0f1015' }}>Tüm Sınıflar</option>
                {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
              </select>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.4rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={14} /> {filteredStudents.length} öğrenci
              </div>
              {/* Risk filter badge */}
              {students.filter(s => (s.streak_days ?? 0) === 0).length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '0.4rem 0.85rem', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <AlertTriangle size={14} /> {students.filter(s => (s.streak_days ?? 0) === 0).length} öğrenci hareketsiz
                </div>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={32} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <Users size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3 style={{ color: '#fff' }}>{studentSearch ? 'Sonuç bulunamadı' : 'Henüz öğrenciniz yok'}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Sınıf kodunuzu öğrencilerinizle paylaşarak başlayın.</p>
              </div>
            ) : (
              <div className="premium-card" style={{ overflow: 'hidden', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                      {[
                        { label: 'Öğrenci', field: 'username' },
                        { label: 'Alan', field: 'alan' },
                        { label: 'Çözülen', field: 'solved_questions' },
                        { label: 'Başarı', field: 'success_rate' },
                        { label: 'Lig', field: 'league' },
                        { label: 'Streak', field: 'streak_days' },
                        { label: 'Sınıf', field: 'class_id' },
                        { label: '', field: null },
                      ].map((h, i) => (
                        <th key={i} onClick={h.field ? () => toggleSort(h.field as keyof StudentItem) : undefined}
                          style={{ padding: '0.85rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: h.field ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {h.label}
                            {h.field && studentSort.field === h.field && (
                              studentSort.dir === 'asc' ? <ChevronUp size={12} color="#38bdf8" /> : <ChevronDown size={12} color="#38bdf8" />
                            )}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, idx) => {
                      const isAtRisk = (s.streak_days ?? 0) === 0;
                      return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', background: isAtRisk ? 'rgba(239,68,68,0.03)' : 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = isAtRisk ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = isAtRisk ? 'rgba(239,68,68,0.03)' : 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${['#38bdf8','#10b981','#a855f7','#f59e0b','#f43f5e'][idx % 5]}, ${['#0ea5e9','#059669','#7c3aed','#d97706','#dc2626'][idx % 5]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                              {s.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {s.username}
                                {isAtRisk && <AlertTriangle size={12} color="#ef4444" title="Hareketsiz öğrenci" />}
                              </div>
                              {s.sinif && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.sinif}. Sınıf</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {s.alan ? <Badge label={s.alan} color={ALAN_COLORS[s.alan] ?? '#9ca3af'} /> : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#38bdf8', fontWeight: 700 }}>{s.solved_questions ?? 0}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <SuccessRing value={s.success_rate ?? 0} size={36} />
                            <span style={{ color: successColor(s.success_rate ?? 0), fontWeight: 700, fontSize: '0.9rem' }}>
                              %{(s.success_rate ?? 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Badge label={s.league ?? 'Bronz'} color={LEAGUE_COLORS[s.league] ?? '#cd7f32'} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ color: s.streak_days > 0 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                            {s.streak_days > 0 ? `${s.streak_days} 🔥` : '⚠️ 0'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select 
                            value={s.class_id || ''} 
                            onChange={(e) => handleAssignStudent(s.id, e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem', borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            <option value="">-- Havuz (Sınıfsız) --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button onClick={() => setAwardXpModal(s)} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', color: '#fff', padding: '0.4rem 0.85rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                              <Star size={13} fill="currentColor" /> XP Ver
                            </button>
                            <button onClick={() => setSelectedStudent(s)} style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', padding: '0.4rem 0.85rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                              <BarChart2 size={13} /> Analiz
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: ÖDEVLER
        ══════════════════════════════════════════ */}
        {activeTab === 'odevler' && (
          <motion.div key="odevler" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Ödevler</h2>
              <button onClick={() => setActiveModal('odev')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Plus size={16} /> Ödev Ata
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <ClipboardList size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3 style={{ color: '#fff' }}>Henüz ödev ataması yapılmadı</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assignments.map((a) => {
                  const submitRate = a.total_assigned > 0 ? (a.submitted_count / a.total_assigned) * 100 : 0;
                  const left = daysLeft(a.due_date);
                  const isOverdue = left !== null && left < 0;
                  const isUrgent = left !== null && left >= 0 && left <= 2;
                  return (
                    <div key={a.id} className="premium-card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onClick={() => { fetchAssignmentDetail(a.id); setActiveModal('odevDetay'); }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{a.title}</h3>
                            {isOverdue && <Badge label="Süresi Geçti" color="#ef4444" />}
                            {isUrgent && !isOverdue && <Badge label="Acil" color="#f59e0b" />}
                          </div>
                          {a.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{a.description.substring(0, 100)}{a.description.length > 100 ? '…' : ''}</p>}
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: '1rem', flexShrink: 0 }}>
                          <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>{a.submitted_count}<span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>/{a.total_assigned}</span></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>teslim</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                        <MiniBar value={a.submitted_count} max={a.total_assigned} color={submitRate === 100 ? '#10b981' : submitRate >= 50 ? '#f59e0b' : '#ef4444'} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{Math.round(submitRate)}%</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {submitRate === 100 && <Badge label="Tamamlandı ✓" color="#10b981" />}
                        </div>
                        {a.due_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.78rem' }}>
                            <Calendar size={12} />
                            {isOverdue ? 'Süresi doldu' : `Son: ${formatDate(a.due_date)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: ANALİZ
        ══════════════════════════════════════════ */}
        {activeTab === 'analiz' && (
          <motion.div key="analiz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!analytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                <Loader2 size={36} color="#f43f5e" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* AI Insights (Faz 3) */}
                <div className="premium-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BrainCircuit size={20} color="#a78bfa" /> Yapay Zeka Sınıf Asistanı
                  </h3>
                  <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    {analytics.aiInsight || "Sınıflarınızın verileri henüz analiz ediliyor..."}
                  </p>
                </div>

                {/* Top summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem' }}>
                  <StatCard label="Teslim Oranı" value={`%${analytics.submissionStats?.rate ?? 0}`} icon={CheckCircle} color="#10b981" sub={`${analytics.submissionStats?.submitted ?? 0}/${analytics.submissionStats?.total ?? 0} teslim`} />
                  <StatCard label="Notlanan Ödev" value={analytics.submissionStats?.graded ?? 0} icon={PenLine} color="#38bdf8" />
                  <StatCard label="Haftalık Ödev" value={analytics.recentAssignments ?? 0} icon={ClipboardList} color="#f59e0b" sub="son 7 gün" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                  {/* Class performance */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <BarChart2 size={18} color="#f43f5e" /> Sınıf Performansları
                    </h3>
                    {(analytics.classPerformance ?? []).length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Veri yok.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                        {analytics.classPerformance.map((c: any, i: number) => {
                          const colors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#f43f5e'];
                          const col = colors[i % colors.length];
                          return (
                            <div key={c.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{c.class_name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.student_count} öğrenci</span>
                                  <span style={{ color: col, fontWeight: 700, fontSize: '0.875rem' }}>%{c.avg_success}</span>
                                </div>
                              </div>
                              <MiniBar value={c.avg_success} max={100} color={col} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Success bands donut */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target size={18} color="#38bdf8" /> Başarı Dağılımı
                    </h3>
                    {(() => {
                      const { low = 0, mid = 0, high = 0 } = analytics.successBands ?? {};
                      const total = low + mid + high || 1;
                      const bands = [
                        { label: 'Yüksek (≥70%)', value: high, color: '#10b981' },
                        { label: 'Orta (40-70%)', value: mid, color: '#f59e0b' },
                        { label: 'Düşük (<40%)', value: low, color: '#ef4444' },
                      ];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          {bands.map(b => (
                            <div key={b.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ color: b.color, fontSize: '0.85rem', fontWeight: 600 }}>{b.label}</span>
                                <span style={{ color: '#fff', fontWeight: 700 }}>{b.value} öğrenci <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round((b.value / total) * 100)}%)</span></span>
                              </div>
                              <MiniBar value={b.value} max={total} color={b.color} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Sınıf AI Analizi */}
                <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={20} color="#a855f7" style={{ fill: '#a855f7' }} /> Sınıf AI Analizi & Ortak Zayıf Yönler
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>Sınıf genelindeki hata istatistiklerine göre adaptif eğitim planı.</p>
                    </div>

                    {/* Class Selector Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sınıf Seç:</span>
                      <select 
                        value={aiClassId} 
                        onChange={e => setAiClassId(e.target.value)}
                        className="premium-input" 
                        style={{ padding: '0.4rem 2rem 0.4rem 1rem', width: 'auto', fontSize: '0.85rem', minWidth: '160px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id} style={{ background: '#0f1015', color: '#fff' }}>{c.class_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {classInsightsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                      <Loader2 size={24} color="#a855f7" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : classInsights ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                      
                      {/* Left: Collective Weaknesses List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 4, textAlign: 'left' }}>
                          Ortak Zayıf Konular (Top 3)
                        </div>
                        {classInsights.weaknesses && classInsights.weaknesses.length > 0 ? (
                          classInsights.weaknesses.map((w: any, i: number) => {
                            const colors = ['#ef4444', '#f59e0b', '#38bdf8'];
                            const col = colors[i % colors.length];
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{w.subject}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginTop: 2 }}>{w.topic}</div>
                                </div>
                                <span style={{ background: `${col}18`, color: col, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${col}30` }}>
                                  {w.collective_errors} Hata
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Sınıfa ait hata verisi bulunmuyor.
                          </div>
                        )}
                      </div>

                      {/* Right: AI Insight box */}
                      <div style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.15)', padding: '1.5rem', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a855f7', fontWeight: 700, fontSize: '0.9rem' }}>
                          <Zap size={16} color="#a855f7" style={{ fill: '#a855f7' }} /> AI Koçun Sınıf Tavsiyesi
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'left', whiteSpace: 'pre-line' }}>
                          {classInsights.aiInsight}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem' }}>
                      Sınıf seçin.
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                  {/* Top students */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Trophy size={18} color="#f59e0b" /> En Başarılı Öğrenciler
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(analytics.topStudents ?? []).map((s: any, i: number) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i === 1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#cd7f32,#a05a20)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{s.username}</span>
                          <span style={{ color: successColor(s.success_rate), fontWeight: 700, fontSize: '0.875rem' }}>%{(s.success_rate ?? 0).toFixed(1)}</span>
                        </div>
                      ))}
                      {(analytics.topStudents ?? []).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Veri yok.</p>}
                    </div>
                  </div>

                  {/* At-risk students */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={18} color="#ef4444" /> Dikkat Gerektiren
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(analytics.atRiskStudents ?? []).map((s: any) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
                          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', flex: 1 }}>{s.username}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>%{(s.success_rate ?? 0).toFixed(1)}</div>
                            {s.streak_days === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>streak yok</div>}
                          </div>
                        </div>
                      ))}
                      {(analytics.atRiskStudents ?? []).length === 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem' }}>
                          <CheckCircle size={16} /> Tüm öğrenciler iyi durumda!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* League distribution */}
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={18} color="#a855f7" /> Lig Dağılımı
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {(analytics.leagueDistribution ?? []).map((l: any) => (
                      <div key={l.league} style={{ flex: '1 1 140px', padding: '1rem', background: `${LEAGUE_COLORS[l.league] ?? '#9ca3af'}15`, border: `1px solid ${LEAGUE_COLORS[l.league] ?? '#9ca3af'}35`, borderRadius: 12, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: LEAGUE_COLORS[l.league] ?? '#9ca3af' }}>{l.count}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{l.league}</div>
                      </div>
                    ))}
                    {(analytics.leagueDistribution ?? []).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Veri yok.</p>}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: KAYNAKLAR
        ══════════════════════════════════════════ */}
        {activeTab === 'kaynaklar' && (
          <motion.div key="kaynaklar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Kaynaklar</h2>
              <button onClick={() => setActiveModal('kaynak')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Plus size={16} /> Kaynak Paylaş
              </button>
            </div>
            {resources.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <BookMarked size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3 style={{ color: '#fff' }}>Henüz kaynak paylaşılmadı</h3>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
                {resources.map((r) => {
                  const typeColor = r.resource_type === 'note' ? '#38bdf8' : r.resource_type === 'link' ? '#10b981' : '#f59e0b';
                  const typeLabel = r.resource_type === 'note' ? 'Ders Notu' : r.resource_type === 'link' ? 'Bağlantı' : 'Görev';
                  return (
                    <div key={r.id} className="premium-card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                        <Badge label={typeLabel} color={typeColor} />
                        {r.subject && <Badge label={r.subject} color="#6b7280" />}
                      </div>
                      <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{r.title}</h3>
                      {r.topic && <div style={{ color: typeColor, fontSize: '0.78rem', marginBottom: '0.5rem', fontWeight: 600 }}>{r.topic}</div>}
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, margin: '0 0 1rem' }}>
                        {r.content?.substring(0, 130)}{(r.content?.length ?? 0) > 130 ? '…' : ''}
                      </p>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(r.created_at)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            TAB: DUYURULAR
        ══════════════════════════════════════════ */}
        {activeTab === 'duyurular' && (
          <motion.div key="duyurular" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Duyurular</h2>
              <button onClick={() => setActiveModal('duyuru')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Plus size={16} /> Duyuru Gönder
              </button>
            </div>
            {announcements.length === 0 ? (
              <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                <Megaphone size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <h3 style={{ color: '#fff' }}>Henüz duyuru gönderilmedi</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.map((a) => (
                  <div key={a.id} className="premium-card" style={{ padding: '1.5rem', borderLeft: '3px solid #8b5cf6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{a.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, marginLeft: '1rem' }}>
                        <Badge label={a.class_name ?? 'Tüm Sınıflar'} color="#8b5cf6" />
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{a.content}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════ */}

      {/* Yeni Sınıf */}
      <Modal open={activeModal === 'sinif'} onClose={() => setActiveModal(null)} title="Yeni Sınıf Oluştur">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Sınıf adı (örn: 12-A Sayısal)" style={inp}
            onKeyDown={e => e.key === 'Enter' && handleCreateClass()} />
          <button onClick={handleCreateClass} disabled={submitting || !newClassName.trim()} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', width: '100%', opacity: !newClassName.trim() ? 0.5 : 1 }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sınıf Oluştur'}
          </button>
        </div>
      </Modal>

      {/* Yeni Ödev */}
      <Modal open={activeModal === 'odev'} onClose={() => setActiveModal(null)} title="Yeni Ödev Ata">
        <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <input value={newAssignment.title} onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })} placeholder="Ödev başlığı *" style={inp} required />
          <textarea value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} placeholder="Açıklama (isteğe bağlı)" style={{ ...inp, minHeight: 90, resize: 'vertical' }} />
          <select value={newAssignment.class_id} onChange={e => setNewAssignment({ ...newAssignment, class_id: e.target.value })} style={sel} required>
            <option value="" style={{ background: '#0f1015' }}>Sınıf Seçin *</option>
            {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
          </select>
          <div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "rgba(139, 92, 246, 0.1)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Akıllı Soru Üretimi
              </div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>YKS Yıldızı AI Motoru bu ödev için otomatik eşsiz sorular türetsin.</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "40px", height: "24px" }}>
              <input type="checkbox" checked={newAssignment.generateQuestions || false} onChange={e => setNewAssignment({ ...newAssignment, generateQuestions: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: (newAssignment.generateQuestions) ? "#8b5cf6" : "rgba(255,255,255,0.1)", transition: ".4s", borderRadius: "24px" }}>
                <span style={{ position: "absolute", content: "", height: "18px", width: "18px", left: "3px", bottom: "3px", backgroundColor: "white", transition: ".4s", borderRadius: "50%", transform: (newAssignment.generateQuestions) ? "translateX(16px)" : "translateX(0)" }} />
              </span>
            </label>
          </div>
          {(newAssignment.generateQuestions) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginTop: "-0.5rem" }}>
              <input value={newAssignment.subject || ""} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} placeholder="Ders (örn: Matematik)" style={inp} />
              <input value={newAssignment.topic || ""} onChange={e => setNewAssignment({ ...newAssignment, topic: e.target.value })} placeholder="Konu (örn: Limit)" style={inp} />
              <input type="number" min={1} max={20} value={newAssignment.questionCount || 5} onChange={e => setNewAssignment({ ...newAssignment, questionCount: parseInt(e.target.value) || 5 })} placeholder="Soru Sayısı" style={inp} />
            </div>
          )}
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: 6 }}>Son Teslim Tarihi</label>
            <input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })} style={inp} />
          </div>
          <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', width: '100%', fontWeight: 700 }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Ödev Ata'}
          </button>
        </form>
      </Modal>

      {/* Kaynak Paylaş */}
      <Modal open={activeModal === 'kaynak'} onClose={() => setActiveModal(null)} title="Kaynak Paylaş">
        <form onSubmit={handleCreateResource} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <input value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} placeholder="Başlık *" style={inp} required />
          <textarea value={newResource.content} onChange={e => setNewResource({ ...newResource, content: e.target.value })} placeholder="İçerik / Açıklama *" style={{ ...inp, minHeight: 110, resize: 'vertical' }} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <input value={newResource.subject} onChange={e => setNewResource({ ...newResource, subject: e.target.value })} placeholder="Ders (örn: Matematik)" style={inp} />
            <input value={newResource.topic} onChange={e => setNewResource({ ...newResource, topic: e.target.value })} placeholder="Konu (örn: Türev)" style={inp} />
          </div>
          <select value={newResource.resource_type} onChange={e => setNewResource({ ...newResource, resource_type: e.target.value })} style={sel}>
            <option value="note" style={{ background: '#0f1015' }}>📝 Ders Notu</option>
            <option value="link" style={{ background: '#0f1015' }}>🔗 Bağlantı / Video</option>
            <option value="task" style={{ background: '#0f1015' }}>📋 Görev</option>
          </select>
          <select value={newResource.class_id} onChange={e => setNewResource({ ...newResource, class_id: e.target.value })} style={sel}>
            <option value="" style={{ background: '#0f1015' }}>Tüm Sınıflar</option>
            {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
          </select>
          <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', width: '100%' }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Paylaş'}
          </button>
        </form>
      </Modal>

      {/* Duyuru */}
      <Modal open={activeModal === 'duyuru'} onClose={() => setActiveModal(null)} title="Duyuru Gönder">
        <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="Duyuru başlığı *" style={inp} required />
          <textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="Duyuru içeriği *" style={{ ...inp, minHeight: 120, resize: 'vertical' }} required />
          <select value={newAnnouncement.class_id} onChange={e => setNewAnnouncement({ ...newAnnouncement, class_id: e.target.value })} style={sel}>
            <option value="" style={{ background: '#0f1015' }}>📢 Tüm Sınıflar</option>
            {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
          </select>
          <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', width: '100%' }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Gönder'}
          </button>
        </form>
      </Modal>

      {/* Ödev Detayı */}
      <Modal open={activeModal === 'odevDetay' && !!assignmentDetail} onClose={() => { setActiveModal(null); setAssignmentDetail(null); }} title={assignmentDetail?.title ?? 'Ödev Detayı'} maxW={640}>
        {assignmentDetail && (
          <div>
            {assignmentDetail.description && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.65 }}>{assignmentDetail.description}</p>
            )}
            {assignmentDetail.due_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <Calendar size={14} /> Son Teslim: {formatDate(assignmentDetail.due_date)}
              </div>
            )}
            <h4 style={{ color: '#fff', marginBottom: '1rem', fontSize: '0.95rem' }}>Öğrenci Durumları</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {(assignmentDetail.submissions ?? []).map((sub: any) => (
                <div key={sub.student_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 700, fontSize: '0.8rem' }}>
                      {sub.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{sub.username}</div>
                      <div style={{ fontSize: '0.72rem', color: sub.status === 'submitted' ? '#10b981' : sub.status === 'graded' ? '#38bdf8' : '#6b7280' }}>
                        {sub.status === 'pending' ? '⏳ Bekleniyor' : sub.status === 'submitted' ? '✅ Teslim Edildi' : `🎯 Notlandı: ${sub.score}/100`}
                      </div>
                    </div>
                  </div>
                  {sub.status === 'submitted' && (
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input
                        type="number" min={0} max={100}
                        placeholder="Not"
                        value={gradeInput[sub.student_id] ?? ''}
                        onChange={e => setGradeInput(prev => ({ ...prev, [sub.student_id]: e.target.value }))}
                        style={{ ...inp, width: 70, padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      />
                      <button
                        onClick={() => {
                          const score = parseInt(gradeInput[sub.student_id] ?? '');
                          if (!isNaN(score) && score >= 0 && score <= 100) {
                            handleGrade(assignmentDetail.id, sub.student_id, score);
                            setGradeInput(prev => { const n = { ...prev }; delete n[sub.student_id]; return n; });
                          }
                        }}
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                        Kaydet
                      </button>
                    </div>
                  )}
                  {sub.status === 'graded' && (
                    <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem' }}>{sub.score}/100</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════
          KAPSAMLI ÖĞRENCİ DETAY MODALİ
      ═══════════════════════════════════════ */}
      <Modal open={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Öğrenci Analiz Kartı" maxW={760}>
        {selectedStudent && (
          <div>
            {/* Header — Kimlik */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#38bdf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.6rem', flexShrink: 0 }}>
                {selectedStudent.username?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem' }}>{selectedStudent.username}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  {selectedStudent.alan && <Badge label={selectedStudent.alan} color={ALAN_COLORS[selectedStudent.alan] ?? '#9ca3af'} />}
                  {selectedStudent.sinif && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedStudent.sinif}. Sınıf</span>}
                  {studentDetail?.student?.target_university && (
                    <span style={{ color: '#a78bfa', fontSize: '0.78rem' }}>🎯 {studentDetail.student.target_university}</span>
                  )}
                  {studentDetail?.lastActivity && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Son aktiflik: {new Date(studentDetail.lastActivity).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
              {/* Risk badge */}
              {studentDetail && (() => {
                const daysSinceActive = studentDetail.lastActivity
                  ? Math.floor((Date.now() - new Date(studentDetail.lastActivity).getTime()) / 86400000)
                  : 999;
                if (daysSinceActive >= 7) return (
                  <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>{daysSinceActive}g hareketsiz</span>
                  </div>
                );
                return null;
              })()}
            </div>

            {studentDetailLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12, color: 'var(--text-secondary)' }}>
                <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Veriler derleniyor...</span>
              </div>
            ) : (
              <>
                {/* ── Blok 1: Temel İstatistikler ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  {[
                    { label: 'Çözülen Soru', value: selectedStudent.solved_questions ?? 0, color: '#38bdf8', icon: BookOpen },
                    { label: 'Başarı Oranı', value: `%${(selectedStudent.success_rate ?? 0).toFixed(1)}`, color: successColor(selectedStudent.success_rate ?? 0), icon: TrendingUp },
                    { label: 'Streak', value: `${selectedStudent.streak_days ?? 0} gün`, color: selectedStudent.streak_days > 0 ? '#f59e0b' : '#6b7280', icon: Flame },
                    { label: 'Lig', value: selectedStudent.league ?? 'Bronz', color: LEAGUE_COLORS[selectedStudent.league] ?? '#cd7f32', icon: Trophy },
                    { label: 'Haftalık Odak', value: studentDetail ? `${Math.round((studentDetail.weeklyTotalMinutes ?? 0) / 60 * 10) / 10} saat` : '—', color: '#a855f7', icon: Clock },
                    { label: 'Toplam XP', value: studentDetail?.student?.xp ?? selectedStudent.league_points ?? 0, color: '#f59e0b', icon: Star },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: '0.9rem 1rem', background: `${item.color}0d`, borderRadius: 12, border: `1px solid ${item.color}20` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                        <item.icon size={13} color={item.color} />
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.label}</div>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* ── Blok 2: Haftalık Odak Grafiği (Mini Bar Chart) ── */}
                {studentDetail?.weeklyFocus?.length > 0 && (
                  <div style={{ background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                      <BarChart2 size={16} color="#a855f7" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Son 7 Gün — Odak Çalışması</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: 70 }}>
                      {(() => {
                        const maxMin = Math.max(...(studentDetail.weeklyFocus.map((d: any) => d.total_minutes ?? 0)), 1);
                        return studentDetail.weeklyFocus.map((d: any, i: number) => {
                          const pct = ((d.total_minutes ?? 0) / maxMin) * 100;
                          const label = new Date(d.date).toLocaleDateString('tr-TR', { weekday: 'short' });
                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                              <div title={`${d.total_minutes} dk`} style={{ width: '100%', height: `${Math.max(pct, 4)}%`, background: 'linear-gradient(180deg, #a855f7, #7c3aed)', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', minHeight: 4 }} />
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{label}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* ── Blok 3: Ders Bazlı Çalışma Dağılımı ── */}
                {studentDetail?.subjectBreakdown?.length > 0 && (
                  <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <BookOpen size={16} color="#38bdf8" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Ders Bazlı Çalışma</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {studentDetail.subjectBreakdown.slice(0, 5).map((s: any, i: number) => {
                        const maxMin = studentDetail.subjectBreakdown[0]?.total_minutes ?? 1;
                        const pct = Math.round((s.total_minutes / maxMin) * 100);
                        const colors = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e'];
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>{s.subject}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.round(s.total_minutes / 60 * 10) / 10}s · {s.session_count} oturum</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 3, transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Blok 4: Hata Defteri (Zayıf Konular) ── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Zayıf Konular (Hata Defteri)</span>
                  </div>
                  {(studentDetail?.weaknesses?.length ?? 0) === 0 ? (
                    <div style={{ padding: '0.875rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, color: '#10b981', fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle size={14} /> Kayıtlı zayıf konu yok — harika!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(studentDetail?.weaknesses ?? []).slice(0, 5).map((w: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{w.subject}</div>
                            <div style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600, marginTop: 1 }}>{w.topic}</div>
                          </div>
                          <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(239,68,68,0.2)' }}>
                            {w.mistake_count} hata
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Blok 5: Deneme Sonuçları ── */}
                {(studentDetail?.examResults?.length ?? 0) > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <FileText size={16} color="#f59e0b" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Son Deneme Sonuçları</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {studentDetail.examResults.map((e: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                          <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>{e.exam_name || 'Deneme'}</span>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {e.total_net != null && <Badge label={`Net: ${e.total_net}`} color="#f59e0b" />}
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(e.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Blok 6: Son Çalışma Oturumları ── */}
                {(studentDetail?.recentSessions?.length ?? 0) > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <Clock size={16} color="#a855f7" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Son Çalışma Oturumları</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {studentDetail.recentSessions.map((s: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <span style={{ fontSize: '0.83rem', color: '#fff', fontWeight: 500 }}>{s.subject || 'Serbest Çalışma'}</span>
                            {s.topic && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 6 }}>· {s.topic}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 600 }}>{s.duration_minutes} dk</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(s.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Blok 7: Konu Tamamlanma İlerlemesi ── */}
                {(studentDetail?.subjectProgress?.length ?? 0) > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <BookOpen size={16} color="#10b981" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Konu Tamamlanma Durumu</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {studentDetail.subjectProgress.slice(0, 8).map((p: any, i: number) => {
                        const pct = Math.min(100, p.completion_rate ?? 0);
                        const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontSize: '0.78rem', color: '#fff' }}>{p.subject}{p.topic ? ` · ${p.topic}` : ''}</span>
                              <span style={{ fontSize: '0.72rem', color, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Blok 8: Test Performansı (Doğru/Yanlış Trendi) ── */}
                {(studentDetail?.testSessions?.length ?? 0) > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <Target size={16} color="#f59e0b" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Test Çözme Performansı (Son {Math.min(studentDetail.testSessions.length, 10)} Test)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem', height: 60, marginBottom: '0.5rem' }}>
                      {[...studentDetail.testSessions].reverse().map((t: any, i: number) => {
                        const total = (t.correct_count ?? 0) + (t.wrong_count ?? 0) + (t.blank_count ?? 0);
                        const pct = total > 0 ? ((t.correct_count ?? 0) / total) * 100 : 0;
                        const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <div title={`${pct.toFixed(0)}% doğru · ${formatDate(t.created_at)}`}
                              style={{ width: '100%', height: `${Math.max(pct, 5)}%`, background: color, borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.4s ease' }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
                      {(() => {
                        const last = studentDetail.testSessions[0];
                        const total = (last?.correct_count ?? 0) + (last?.wrong_count ?? 0) + (last?.blank_count ?? 0);
                        return (
                          <>
                            <span style={{ color: '#10b981' }}>✓ {last?.correct_count ?? 0} doğru</span>
                            <span style={{ color: '#ef4444' }}>✗ {last?.wrong_count ?? 0} yanlış</span>
                            <span style={{ color: '#6b7280' }}>— {last?.blank_count ?? 0} boş</span>
                            {total > 0 && <span style={{ color: '#9ca3af' }}>(Son test: {formatDate(last?.created_at)})</span>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ── Blok 9: Sınıf Ortalaması Karşılaştırması ── */}
                {(studentDetail?.classStudentCount ?? 0) > 1 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.875rem' }}>
                      <Users size={16} color="#38bdf8" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Sınıf Ortalamasıyla Karşılaştırma</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      {[
                        {
                          label: 'Bu Öğrenci (Haftalık Odak)',
                          value: `${Math.round((studentDetail.weeklyTotalMinutes ?? 0) / 60 * 10) / 10} saat`,
                          color: (studentDetail.weeklyTotalMinutes ?? 0) >= (studentDetail.classAvgFocusMinutes ?? 0) ? '#10b981' : '#ef4444',
                        },
                        {
                          label: `Sınıf Ortalaması (${studentDetail.classStudentCount} öğrenci)`,
                          value: `${Math.round((studentDetail.classAvgFocusMinutes ?? 0) / 60 * 10) / 10} saat`,
                          color: '#38bdf8',
                        },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '0.875rem', background: `${item.color}0d`, borderRadius: 10, border: `1px solid ${item.color}20` }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Bonus XP Modal */}
      <Modal open={!!awardXpModal} onClose={() => setAwardXpModal(null)} title="Bonus XP Gönder">
        {awardXpModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Star size={32} fill="#f59e0b" color="#f59e0b" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>{awardXpModal.username}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Öğrenciye motivasyon amaçlı Lig Puanı (XP) gönder.</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Miktar Seç</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {[50, 100, 250, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAwardAmount(amt)}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                      background: awardAmount === amt ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                      border: awardAmount === amt ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                      color: awardAmount === amt ? '#f59e0b' : 'var(--text-muted)'
                    }}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={awardAmount}
                  onChange={(e) => setAwardAmount(Number(e.target.value))}
                  style={{ ...inp, paddingRight: '2rem' }}
                  min={1} max={1000}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem', pointerEvents: 'none' }}>XP</span>
              </div>
            </div>

            <button 
              onClick={handleAwardXp} 
              disabled={submitting || awardAmount <= 0} 
              className="btn-interactive" 
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', width: '100%', color: '#000', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (submitting || awardAmount <= 0) ? 0.7 : 1 }}
            >
              {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <><Star size={16} fill="currentColor" /> Gönder</>}
            </button>
          </div>
        )}
      </Modal>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
