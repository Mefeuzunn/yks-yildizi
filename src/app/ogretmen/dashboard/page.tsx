"use client";
// v2 – comprehensive teacher panel

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Megaphone, FileText,
  Plus, Copy, Check, Loader2, X, TrendingUp, AlertTriangle,
  Star, Calendar, Award, Eye, BarChart2, Search, Filter,
  ChevronUp, ChevronDown, Trash2, Bell, Zap, Target,
  GraduationCap, BookMarked, PenLine, RefreshCw, ArrowRight,
  CheckCircle, Clock, AlertCircle, Flame, Trophy, Shield, Sparkles, BrainCircuit, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Tab = 'genel' | 'siniflar' | 'ogrenciler' | 'odevler' | 'analiz' | 'kaynaklar' | 'duyurular' | 'profil';

interface ClassItem { id: string; class_name: string; class_code: string; student_count: number; avg_success: number; created_at: string; }
interface StudentItem {
  id: string;
  username: string;
  alan: string;
  sinif: string;
  solved_questions: number;
  success_rate: number;
  league: string;
  league_points: number;
  streak_days: number;
  class_id?: string;
  class_name?: string;
  class_names?: string;
  is_live_focusing?: boolean;
  active_subject?: string;
  active_topic?: string;
  active_duration_min?: number;
  active_started_at?: string;
  active_time_left_sec?: number;
  focus_elapsed_min?: number;
  live_status?: string;
  live_mode?: string;
}
interface ResourceItem { id: string; title: string; content: string; subject: string; topic: string; resource_type: string; class_id: string; created_at: string; }
interface AnnouncementItem { id: string; title: string; content: string; class_id: string; class_name?: string; category?: string; event_date?: string; created_at: string; }
interface AssignmentItem { id: string; title: string; description?: string; category?: string; subject?: string; topic?: string; target_sinif?: string; due_date?: string; created_at: string; total_assigned: number; submitted_count: number; }

// ─────────────────────────────────────────────
// HELPERS & CONSTANTS
// ─────────────────────────────────────────────
const ANNOUNCEMENT_CATEGORIES = ['Tümü', 'Genel', 'Sınav Duyurusu', 'Ödev Hatırlatma', 'Etkinlik', 'Ders Programı', 'Önemli'];
const ANNOUNCEMENT_CATEGORY_COLORS: Record<string, string> = {
  Genel: '#8b5cf6',
  'Sınav Duyurusu': '#f43f5e',
  'Ödev Hatırlatma': '#f59e0b',
  Etkinlik: '#10b981',
  'Ders Programı': '#3b82f6',
  Önemli: '#ef4444',
};

const ASSIGNMENT_CATEGORIES = ['Tümü', 'Genel', 'TYT Deneme', 'AYT Deneme', 'Konu Testi', 'Haftalık Ödev', 'Soru Çözümü', 'Proje'];
const ASSIGNMENT_CATEGORY_COLORS: Record<string, string> = {
  Genel: '#6b7280',
  'TYT Deneme': '#38bdf8',
  'AYT Deneme': '#a855f7',
  'Konu Testi': '#10b981',
  'Haftalık Ödev': '#f59e0b',
  'Soru Çözümü': '#ec4899',
  Proje: '#6366f1',
};

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
        className="modal-overlay-mobile"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{ background: 'linear-gradient(135deg,#12141c,#0d0f18)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: maxW, maxHeight: '88vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="mobile-only modal-drag-handle" />

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

function AIAssistantWidget({ classId }: { classId: string | null }) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [assigning, setAssigning] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!classId) return;
    setLoading(true);
    fetch(`/api/ogretmen/ai-recommendations?classId=${classId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [classId]);

  const handleQuickAssign = async (action: any) => {
    setAssigning(action.id);
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch('/api/ogretmen/ai-recommendations/quick-assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId,
        subject: action.subject,
        topic: action.topic,
        title: action.label.replace('Ata', '').trim(),
        dueDate
      })
    });
    const d = await res.json();
    setAssigning(null);
    if (d.success) setSuccess(`"${action.topic}" ödevi başarıyla atandı!`);
    setTimeout(() => setSuccess(null), 4000);
  };

  if (!classId) return (
    <div style={{ padding: 24, background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, marginBottom: 24, textAlign: 'center', color: '#94a3b8' }}>
      <span style={{ fontSize: 28 }}>🤖</span>
      <p style={{ margin: '8px 0 0' }}>AI önerileri için sol üstten bir sınıf seçin.</p>
    </div>
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
        <div>
          <h3 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 16 }}>AstraTutor Sınıf Asistanı</h3>
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Yapay zeka destekli ödev ve içerik önerileri</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Analiz yapılıyor...</div>
      ) : data?.success ? (
        <div>
          {/* Özet Mesaj */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 10, marginBottom: 16, color: '#c4b5fd', fontSize: 13, lineHeight: 1.7 }}>
            {data.summaryText}
          </div>

          {/* Zayıf Konular */}
          {data.weakTopics?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
              {data.weakTopics.map((t: any, i: number) => (
                <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${ t.severity === 'high' ? 'rgba(239,68,68,0.3)' : t.severity === 'medium' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)' }`, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{t.subject} · {t.topic}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: t.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: t.severity === 'high' ? '#fca5a5' : '#fcd34d' }}>
                      {t.severity === 'high' ? 'KRİTİK' : t.severity === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                    </span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 6px' }}>{t.affectedStudents} öğrenci · {t.errorCount} hata</p>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, t.errorCount / 2)}%`, background: t.severity === 'high' ? '#ef4444' : '#f59e0b', borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hızlı Aksiyon Butonları */}
          {success && (
            <div style={{ padding: '10px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#6ee7b7', fontSize: 13, marginBottom: 12 }}>✅ {success}</div>
          )}
          {data.quickActions?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.quickActions.map((action: any) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAssign(action)}
                  disabled={!!assigning}
                  style={{ padding: '8px 16px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.15))', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 8, color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: assigning ? 'not-allowed' : 'pointer', opacity: assigning === action.id ? 0.6 : 1 }}
                >
                  {assigning === action.id ? '⏳ Atanıyor...' : `⚡ ${action.label}`}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Bu sınıf için yeterli veri henüz birikmemiş.</div>
      )}
    </div>
  );
}

function WeeklyReportWidget({ classId }: { classId: string | null }) {
  const [report, setReport] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [weekOffset, setWeekOffset] = React.useState(0);

  React.useEffect(() => {
    if (!classId) return;
    setLoading(true);
    fetch(`/api/ogretmen/weekly-report?classId=${classId}&weekOffset=${weekOffset}`)
      .then(r => r.json())
      .then(d => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [classId, weekOffset]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📊</div>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: 16 }}>Haftalık Sınıf Raporu</h3>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{report?.report?.week_start && `${report.report.week_start} – ${report.report.week_end}`}{report?.isLive && ' (Canlı)'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>← Önceki</button>
          {weekOffset > 0 && <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, color: '#6ee7b7', cursor: 'pointer', fontSize: 12 }}>Bu Hafta</button>}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>Rapor yükleniyor...</div>
      ) : !classId ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Rapor için sınıf seçin.</div>
      ) : report?.report ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {/* Aktif Öğrenci Oranı */}
          <div style={{ padding: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{report.report.active_student_rate?.toFixed(0) ?? 0}%</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Aktif Öğrenci</div>
          </div>

          {/* Zayıf Konular */}
          <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
            <div style={{ color: '#fca5a5', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>🎯 Zayıf Konular</div>
            {(report.report.top_weaknesses ?? []).slice(0,3).map((w: any, i: number) => (
              <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{i+1}. {w.subject} - {w.topic}</div>
            ))}
          </div>

          {/* En Çok Gelişenler */}
          <div style={{ padding: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
            <div style={{ color: '#fcd34d', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>⭐ En Çok Geliştiler</div>
            {(report.report.top_improvers ?? []).slice(0,3).map((s: any, i: number) => (
              <div key={i} style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{i+1}. {s.username ?? s.student_id?.slice(0,8)}</div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Bu hafta için rapor henüz oluşturulmadı.</div>
      )}
    </div>
  );
}

function TeacherProfileTab() {
  const [profile, setProfile] = React.useState<any>(null);
  const [stats, setStats] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    brans: '', bio: '', phone: '', email: '', website: '',
    social_twitter: '', social_linkedin: '', experience_years: 0,
    specialties: [] as string[],
  });
  const [newSpecialty, setNewSpecialty] = React.useState('');

  React.useEffect(() => {
    fetch('/api/ogretmen/profil')
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          const p = d.profile || {};
          setForm({
            brans: p.brans || '',
            bio: p.bio || '',
            phone: p.phone || '',
            email: p.email || d.email || '',
            website: p.website || '',
            social_twitter: p.social_twitter || '',
            social_linkedin: p.social_linkedin || '',
            experience_years: p.experience_years || 0,
            specialties: (() => { try { return typeof p.specialties === 'string' ? JSON.parse(p.specialties) : (p.specialties || []); } catch { return []; } })(),
          });
          setProfile(d);
          setStats(d.stats || {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/ogretmen/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !form.specialties.includes(newSpecialty.trim())) {
      setForm(f => ({ ...f, specialties: [...f.specialties, newSpecialty.trim()] }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (s: string) => {
    setForm(f => ({ ...f, specialties: f.specialties.filter(x => x !== s) }));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} color="#6366f1" /></div>;

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem',
    color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600,
    letterSpacing: '0.03em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', fontSize: '0.9rem',
    outline: 'none',
    transition: 'border 0.2s',
  };

  const BRANS_OPTIONS = [
    'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyatı',
    'Tarih', 'Coğrafya', 'Felsefe', 'İngilizce', 'Almanca',
    'Geometri', 'Paragraf', 'Rehberlik', 'Diğer',
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

      {/* ── Left: Edit Form ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Basic Info Card */}
        <div style={cardStyle}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#6366f1" /> Temel Bilgiler
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Branş</label>
              <select
                value={form.brans}
                onChange={e => setForm(f => ({ ...f, brans: e.target.value }))}
                style={{ ...inputStyle, appearance: 'none' as any, cursor: 'pointer' }}
              >
                <option value="">Seçiniz...</option>
                {BRANS_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Deneyim (Yıl)</label>
              <input
                type="number" min={0} max={50}
                value={form.experience_years}
                onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Biyografi</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Kendinizi kısaca tanıtın... (Öğrencileriniz bu bilgiyi görecek)"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as any }}
            />
          </div>
        </div>

        {/* Contact Card */}
        <div style={cardStyle}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📞 İletişim Bilgileri
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Telefon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="0 (5XX) XXX XX XX"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Web Sitesi</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Specialties Card */}
        <div style={cardStyle}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏷️ Uzmanlık Alanları
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {form.specialties.map((s: string) => (
              <span
                key={s}
                style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem',
                  background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {s}
                <button onClick={() => removeSpecialty(s)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0, fontSize: '14px', lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              value={newSpecialty}
              onChange={e => setNewSpecialty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSpecialty()}
              placeholder="Örn: Limit-Türev, Organik Kimya..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addSpecialty} style={{ padding: '0 1rem', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', fontWeight: 600 }}>Ekle</button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '12px',
            background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            justifyContent: 'center',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.3s',
            boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(99,102,241,0.3)',
          }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Star size={18} />}
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Profili Güncelle'}
        </button>
      </div>

      {/* ── Right: Live Preview Card ── */}
      <div>
        <div style={{
          ...cardStyle,
          background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
          position: 'sticky' as any,
          top: '2rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '1.5rem',
              margin: '0 auto 0.75rem',
              boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            }}>
              {profile?.username?.charAt(0)?.toUpperCase() || 'Ö'}
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {profile?.username || 'Öğretmen'}
            </h3>
            {form.brans && (
              <span style={{
                display: 'inline-block', marginTop: '0.4rem',
                padding: '3px 12px', borderRadius: '20px', fontSize: '0.75rem',
                background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.25)',
              }}>{form.brans}</span>
            )}
          </div>

          {form.bio && (
            <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '1rem', textAlign: 'center' as any }}>
              "{form.bio}"
            </p>
          )}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.3rem' }}>{stats.classCount || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>Sınıf</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.3rem' }}>{stats.studentCount || 0}</div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>Öğrenci</div>
            </div>
          </div>

          {form.experience_years > 0 && (
            <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '0.75rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>{form.experience_years} Yıl Deneyim</span>
            </div>
          )}

          {/* Specialties in preview */}
          {form.specialties.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
              {form.specialties.map((s: string) => (
                <span key={s} style={{
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem',
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>{s}</span>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#475569', fontSize: '0.7rem' }}>
            ✨ Öğrencileriniz bu kartı görüntüleyebilir
          </div>
        </div>
      </div>

    </div>
  );
}

function StudentDetailModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeSubTab, setActiveSubTab] = React.useState<'overview' | 'sessions' | 'weaknesses' | 'exams' | 'assignments'>('overview');

  const fetchDetail = React.useCallback(async (isInitial = false) => {
    if (!studentId) return;
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/ogretmen/ogrenciler/${studentId}/detail`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      } else {
        const err = await res.json().catch(() => ({}));
        setData({ error: err.error || 'Öğrenci verileri yüklenemedi.' });
      }
    } catch (e: any) {
      console.error('Fetch student detail error:', e);
      setData({ error: e.message || 'Öğrenci verileri yüklenemedi.' });
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [studentId]);

  React.useEffect(() => {
    fetchDetail(true);
    // Real-time live status polling every 12 seconds while modal is open
    const pollInterval = setInterval(() => {
      fetchDetail(false);
    }, 12000);
    return () => clearInterval(pollInterval);
  }, [fetchDetail]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!studentId) return null;

  return (
    <AnimatePresence>
      <div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(5, 8, 16, 0.75)', 
          zIndex: 9999, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          backdropFilter: 'blur(8px)' 
        }} 
        onClick={onClose}
      >
        <motion.div
          className="modal-drawer-responsive custom-scrollbar"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          style={{ 
            width: '100%', 
            maxWidth: 880, 
            background: '#0d111a', 
            borderLeft: '1px solid rgba(255,255,255,0.1)', 
            height: '100%', 
            overflowY: 'auto', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.6)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#38bdf8,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <BarChart2 size={20} />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Öğrenci Gelişim & Analiz Paneli</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>Canlı odak verileri, soru analizi ve ders dağılımı</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: 16 }}>
              <Loader2 size={36} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Öğrencinin tüm verileri derleniyor...</span>
            </div>
          ) : !data || data.error ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '3rem', background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
              <div>{data?.error || 'Öğrenci verileri yüklenemedi.'}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* ── 1. Öğrenci Kimlik Kartı ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#38bdf8,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.6rem', fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 15px rgba(56,189,248,0.25)' }}>
                  {data.student?.username?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{data.student?.username}</h3>
                    <Badge label={data.stats?.league || 'Bronz'} color={LEAGUE_COLORS[data.stats?.league] || '#cd7f32'} />
                    {data.student?.alan && <Badge label={data.student.alan} color={ALAN_COLORS[data.student.alan] || '#38bdf8'} />}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 5, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>🏫 <strong>Sınıf:</strong> {data.className || 'Sınıf Yok'}</span>
                    {data.student?.sinif && <span>• {data.student.sinif}. Sınıf</span>}
                    {data.student?.target_university && <span style={{ color: '#a78bfa' }}>• 🎯 {data.student.target_university}</span>}
                  </div>
                </div>
              </div>

              {/* ── 2. Canlı Odaklanma Bildirimi (Live Presence Banner) ── */}
              {data.liveSession?.isLive ? (() => {
                const isBreak = data.liveSession.status === 'break' || data.liveSession.status === 'break_paused' || data.liveSession.mode?.includes('Break');
                const isPaused = data.liveSession.status === 'paused';

                if (isBreak) {
                  const breakMinutesLeft = Math.max(1, Math.ceil((data.liveSession.time_left_sec || 300) / 60));
                  return (
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(180,83,9,0.25))',
                      border: '1.5px solid rgba(245,158,11,0.4)',
                      boxShadow: '0 0 25px rgba(245,158,11,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ position: 'relative', width: 16, height: 16 }}>
                          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#f59e0b', opacity: 0.6, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                          <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                              ŞU AN MOLADA
                            </span>
                            <span style={{ background: 'rgba(245,158,11,0.25)', color: '#fcd34d', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                              {data.liveSession.mode === 'longBreak' ? 'Uzun Mola' : 'Kısa Mola'}
                            </span>
                            {data.liveSession.topic && (
                              <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                                • {data.liveSession.topic}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                            ☕ Zihinsel dinlenme seansı • Kalan mola süresi: ~<strong>{breakMinutesLeft} dakika</strong>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(245,158,11,0.2)', padding: '6px 14px', borderRadius: 20, color: '#fef3c7', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(245,158,11,0.3)' }}>
                        ☕ Molada
                      </div>
                    </div>
                  );
                }

                if (isPaused) {
                  return (
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(30,58,138,0.25))',
                      border: '1.5px solid rgba(59,130,246,0.4)',
                      boxShadow: '0 0 25px rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ position: 'relative', width: 16, height: 16 }}>
                          <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ color: '#93c5fd', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                              SEANS DURAKLATILDI
                            </span>
                            <span style={{ background: 'rgba(59,130,246,0.25)', color: '#bfdbfe', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                              {data.liveSession.subject}
                            </span>
                            {data.liveSession.topic && (
                              <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                                • {data.liveSession.topic}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                            ⏸️ <strong>{data.liveSession.elapsed_min} dakikadır</strong> açık • Seans geçici olarak bekletiliyor
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'rgba(59,130,246,0.2)', padding: '6px 14px', borderRadius: 20, color: '#dbeafe', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(59,130,246,0.3)' }}>
                        ⏸️ Duraklatıldı
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,78,59,0.25))',
                    border: '1.5px solid rgba(16,185,129,0.4)',
                    boxShadow: '0 0 25px rgba(16,185,129,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ position: 'relative', width: 16, height: 16 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', opacity: 0.6, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                        <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.04em' }}>
                            ŞU AN CANLI ODAKLANIYOR
                          </span>
                          <span style={{ background: 'rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>
                            {data.liveSession.subject}
                          </span>
                          {data.liveSession.topic && (
                            <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>
                              • {data.liveSession.topic}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
                          ⏱️ <strong>{data.liveSession.elapsed_min} dakikadır</strong> çalışıyor • Hedef: {data.liveSession.duration_min} dk Pomodoro • Kalan süre: ~{Math.max(0, Math.floor(data.liveSession.time_left_sec / 60))} dk
                        </div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.2)', padding: '6px 14px', borderRadius: 20, color: '#a7f3d0', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                      🟢 Aktif Odakta
                    </div>
                  </div>
                );
              })() : (
                <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: '0.82rem' }}>
                  <Clock size={16} color="#64748b" />
                  <span>Şu an aktif bir odak oturumu yok (Öğrenci çevrimdışı veya serbest modda).</span>
                </div>
              )}

              {/* ── 3. Genel KPI İstatistikleri ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.65rem' }}>
                <div style={{ background: 'rgba(168,85,247,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(168,85,247,0.2)', textAlign: 'center' }}>
                  <div style={{ color: '#c084fc', fontSize: '1.25rem', fontWeight: 800 }}>
                    {Math.round((data.totals?.totalMinutes || 0) / 60 * 10) / 10} <span style={{ fontSize: '0.75rem' }}>saat</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Toplam Odak</div>
                </div>
                <div style={{ background: 'rgba(56,189,248,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(56,189,248,0.2)', textAlign: 'center' }}>
                  <div style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 800 }}>
                    {data.totals?.totalQuestions || data.stats?.solved_questions || 0}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Çözülen Soru</div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                  <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 800 }}>
                    {(Number(data.totals?.totalNet) || 0).toFixed(1)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Net Skoru</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                  <div style={{ color: successColor(Number(data.stats?.success_rate) || 0), fontSize: '1.25rem', fontWeight: 800 }}>
                    %{(Number(data.stats?.success_rate) || 0).toFixed(1)}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Başarı Oranı</div>
                </div>
                <div style={{ background: 'rgba(249,115,22,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(249,115,22,0.2)', textAlign: 'center' }}>
                  <div style={{ color: '#f97316', fontSize: '1.25rem', fontWeight: 800 }}>
                    {data.stats?.streak_days || 0} 🔥
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Seri (Gün)</div>
                </div>
                <div style={{ background: 'rgba(234,179,8,0.07)', padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(234,179,8,0.2)', textAlign: 'center' }}>
                  <div style={{ color: '#facc15', fontSize: '1.25rem', fontWeight: 800 }}>
                    {data.stats?.xp || 0}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 3 }}>Toplam XP</div>
                </div>
              </div>

              {/* ── 4. Alt Tab Navigasyonu ── */}
              <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'overview', label: '📊 Genel Analiz & Grafikler' },
                  { key: 'sessions', label: `⏱️ Odak Oturumları (${data.recentSessions?.length || 0})` },
                  { key: 'weaknesses', label: `🎯 Zayıf Konular (${data.weaknesses?.length || 0})` },
                  { key: 'exams', label: `📝 Denemeler (${data.mockExams?.length || 0})` },
                  { key: 'assignments', label: `📋 Ödev Durumu (${data.assignments?.length || 0})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSubTab(tab.key as any)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: activeSubTab === tab.key ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: `1px solid ${activeSubTab === tab.key ? 'rgba(56,189,248,0.3)' : 'transparent'}`,
                      color: activeSubTab === tab.key ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.82rem',
                      fontWeight: activeSubTab === tab.key ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── 5. TAB 1: Genel Analiz & Grafikler ── */}
              {activeSubTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Son 14 Günlük Odaklanma Bar Grafiği */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart2 size={16} color="#a855f7" />
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Son 14 Gün — Günlük Odak Süresi & Soru Trendi</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Mor = Odak Dakikası • Mavi = Soru</span>
                    </div>

                    {(!data.dailyActivity || data.dailyActivity.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Son 14 günde kaydedilmiş odak oturumu bulunmuyor.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 120, paddingTop: 10 }}>
                        {(() => {
                          const maxMin = Math.max(...data.dailyActivity.map((d: any) => d.total_minutes || 0), 30);
                          return data.dailyActivity.map((d: any, idx: number) => {
                            const pct = Math.max(8, ((d.total_minutes || 0) / maxMin) * 100);
                            const dayName = new Date(d.day).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' });
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700 }}>
                                  {d.total_questions > 0 ? `${d.total_questions}S` : ''}
                                </div>
                                <div
                                  title={`${d.day}: ${d.total_minutes} dakika odak, ${d.total_questions} soru`}
                                  style={{
                                    width: '100%',
                                    maxWidth: 32,
                                    height: `${pct}%`,
                                    background: 'linear-gradient(180deg, #a855f7, #6366f1)',
                                    borderRadius: '6px 6px 0 0',
                                    transition: 'height 0.4s ease',
                                    boxShadow: '0 0 8px rgba(168,85,247,0.2)'
                                  }}
                                />
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                  {dayName}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Ders Bazlı Çalışma & Soru Dağılımı */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                      <BookOpen size={16} color="#38bdf8" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Ders Bazlı Toplam Çalışma & Net Analizi</span>
                    </div>

                    {(!data.subjectBreakdown || data.subjectBreakdown.length === 0) ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Henüz ders bazlı çalışma verisi oluşmamış.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {data.subjectBreakdown.map((s: any, idx: number) => {
                          const maxMin = data.subjectBreakdown[0]?.total_minutes || 1;
                          const pct = Math.round(((s.total_minutes || 0) / maxMin) * 100);
                          const colors = ['#38bdf8', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'];
                          const color = colors[idx % colors.length];

                          return (
                            <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{s.subject}</span>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({s.session_count} oturum)</span>
                                </div>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.8rem' }}>
                                  <span style={{ color: '#cbd5e1' }}>⏱️ <strong>{Math.round((s.total_minutes || 0) / 60 * 10) / 10} saat</strong></span>
                                  <span style={{ color: '#38bdf8' }}>📝 <strong>{s.total_questions || 0} soru</strong></span>
                                  <span style={{ color: '#10b981', fontWeight: 700 }}>🎯 {Number(s.total_net || 0).toFixed(1)} Net</span>
                                </div>
                              </div>
                              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ── 6. TAB 2: Odak Oturumları & Soru Takibi Tablosu ── */}
              {activeSubTab === 'sessions' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={16} color="#10b981" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Öğrencinin Tamamladığı Odak & Soru Oturumları</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Son 50 Oturum</span>
                  </div>

                  {(!data.recentSessions || data.recentSessions.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Henüz kaydedilmiş çalışma oturumu bulunmuyor.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            <th style={{ padding: '10px 14px' }}>Tarih</th>
                            <th style={{ padding: '10px 14px' }}>Ders</th>
                            <th style={{ padding: '10px 14px' }}>Konu</th>
                            <th style={{ padding: '10px 14px' }}>Süre</th>
                            <th style={{ padding: '10px 14px' }}>Soru</th>
                            <th style={{ padding: '10px 14px' }}>D / Y / B</th>
                            <th style={{ padding: '10px 14px' }}>Net</th>
                            <th style={{ padding: '10px 14px' }}>Soru Hızı</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recentSessions.map((session: any) => {
                            const dateStr = session.created_at 
                              ? new Date(session.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : '—';
                            const hasQuestions = (session.questions_solved || 0) > 0;
                            const pace = hasQuestions ? Math.round((session.duration_min * 60) / session.questions_solved) : null;

                            return (
                              <tr key={session.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dateStr}</td>
                                <td style={{ padding: '10px 14px' }}>
                                  <span style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.75rem' }}>
                                    {session.subject || 'Genel'}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 14px', color: '#fff', fontWeight: 600 }}>
                                  {session.topic || session.task_name || 'Genel Tekrar'}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#a855f7', fontWeight: 700 }}>
                                  {session.duration_min} dk
                                </td>
                                <td style={{ padding: '10px 14px', color: hasQuestions ? '#fff' : 'var(--text-muted)', fontWeight: 600 }}>
                                  {hasQuestions ? `${session.questions_solved} soru` : '—'}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                  {hasQuestions ? (
                                    <span style={{ fontSize: '0.78rem' }}>
                                      <strong style={{ color: '#10b981' }}>{session.correct_count}D</strong> • <strong style={{ color: '#ef4444' }}>{session.wrong_count}Y</strong> • <span style={{ color: '#94a3b8' }}>{session.empty_count}B</span>
                                    </span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                  {hasQuestions ? (
                                    <span style={{ color: '#f59e0b', fontWeight: 800, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                                      {session.net_score} Net
                                    </span>
                                  ) : '—'}
                                </td>
                                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                                  {pace ? `${pace} sn/soru` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── 7. TAB 3: Zayıf Konular (Hata Defteri) ── */}
              {activeSubTab === 'weaknesses' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                    <Target size={18} color="#ef4444" />
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Öğrencinin En Çok Hata Yaptığı Konular (Son 30 Gün)</span>
                  </div>

                  {(!data.weaknesses || data.weaknesses.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#10b981', fontSize: '0.88rem' }}>
                      <CheckCircle size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                      Harika! Öğrencinin son 30 günde birikmiş kritik hatası bulunmuyor.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {data.weaknesses.map((w: any, idx: number) => {
                        const isHigh = w.error_count >= 10;
                        const isMedium = w.error_count >= 5;
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '1rem',
                              background: isHigh ? 'rgba(239,68,68,0.08)' : isMedium ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                              borderRadius: 12,
                              border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : isMedium ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                {w.subject}
                              </span>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: 12,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: isHigh ? 'rgba(239,68,68,0.2)' : isMedium ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                                color: isHigh ? '#fca5a5' : isMedium ? '#fcd34d' : '#cbd5e1'
                              }}>
                                {isHigh ? 'KRİTİK' : isMedium ? 'ORTA' : 'DÜŞÜK'}
                              </span>
                            </div>
                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, margin: '4px 0 8px' }}>
                              {w.topic}
                            </div>
                            <div style={{ color: isHigh ? '#ef4444' : isMedium ? '#f59e0b' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>
                              {w.error_count} Yanlış Soru
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── 8. TAB 4: Deneme Sınavları ── */}
              {activeSubTab === 'exams' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={16} color="#f59e0b" />
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Öğrencinin Çözdüğü Deneme Sınavları</span>
                  </div>

                  {(!data.mockExams || data.mockExams.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Kayıtlı deneme sınavı sonucu bulunmuyor.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {data.mockExams.map((exam: any) => (
                        <div
                          key={exam.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(255,255,255,0.04)'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Badge label={exam.exam_type || 'TYT'} color="#38bdf8" />
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{exam.exam_name || 'Deneme Sınavı'}</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                              {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tarih yok'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                              {exam.total_net != null ? `${exam.total_net} Net` : '—'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── 9. TAB 5: Bu Öğretmenin Ödevleri (İzolasyon) ── */}
              {activeSubTab === 'assignments' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ClipboardList size={16} color="#6366f1" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Bu Öğrenciye Atadığınız Ödevler</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Yalnızca sizin ödevleriniz listelenir</span>
                  </div>

                  {(!data.assignments || data.assignments.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Bu öğrenciye henüz atanmış bir ödeviniz yok.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {data.assignments.map((a: any) => (
                        <div
                          key={a.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.25rem',
                            borderBottom: '1px solid rgba(255,255,255,0.04)'
                          }}
                        >
                          <div>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{a.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3 }}>
                              {a.submitted_at ? `Teslim Tarihi: ${formatDate(a.submitted_at)}` : a.due_date ? `Son Tarih: ${formatDate(a.due_date)}` : 'Süresiz'}
                            </div>
                          </div>
                          <div>
                            {a.status === 'graded' ? (
                              <Badge label={`Not: ${a.score}`} color="#10b981" />
                            ) : a.status === 'submitted' ? (
                              <Badge label="Teslim Edildi (Bekliyor)" color="#f59e0b" />
                            ) : (
                              <Badge label="Teslim Edilmedi" color="#ef4444" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
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
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', class_id: '', due_date: '',
    category: 'Genel', subject: '', topic: '', generateQuestions: false, questionCount: 5
  });
  const [newResource, setNewResource] = useState({ title: '', content: '', subject: '', topic: '', resource_type: 'note', class_id: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '', content: '', class_id: '', category: 'Genel', event_date: ''
  });

  // Edit & Category Filter States
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [announcementCategory, setAnnouncementCategory] = useState<string>('Tümü');
  const [assignmentCategory, setAssignmentCategory] = useState<string>('Tümü');

  // UI states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<Record<string, string>>({});
  
  // XP Awarding States
  const [awardXpModal, setAwardXpModal] = useState<StudentItem | null>(null);
  const [awardAmount, setAwardAmount] = useState<number>(50);

  // Invite & Leaderboard States
  const [inviteModal, setInviteModal] = useState<{code: string; url: string; expires: string} | null>(null);
  const [expandedLeaderboard, setExpandedLeaderboard] = useState<string | null>(null);
  const [classLeaderboards, setClassLeaderboards] = useState<Record<string, any[]>>({});

  const generateInvite = async (classId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/sinif/davet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });
      if (res.ok) {
        const data = await res.json();
        setInviteModal({
          code: data.code,
          url: data.inviteUrl || data.url || '',
          expires: data.expiresAt || data.expires || ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Hata');
      }
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const toggleLeaderboard = async (classId: string) => {
    if (expandedLeaderboard === classId) {
      setExpandedLeaderboard(null);
      return;
    }
    setExpandedLeaderboard(classId);
    if (!classLeaderboards[classId]) {
      try {
        const res = await fetch(`/api/ogretmen/ogrenciler?classId=${classId}`);
        if (res.ok) {
          const data = await res.json();
          const list = data.students ?? [];
          list.sort((a: any, b: any) => (b.league_points || 0) - (a.league_points || 0));
          setClassLeaderboards(prev => ({ ...prev, [classId]: list.slice(0, 5) }));
        }
      } catch(e) { console.error(e); }
    }
  };

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

  // Live polling for student focus activity
  useEffect(() => {
    if (!user || user.role !== 'ogretmen' || activeTab !== 'ogrenciler') return;
    const interval = setInterval(() => {
      fetchStudents();
    }, 20000);
    return () => clearInterval(interval);
  }, [user, activeTab, fetchStudents]);

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
      fetchAssignments();
    } catch (e) { console.error(e); }
  };

  const handleUpdateAssignmentStatus = async (assignmentId: string, studentId: string, status: 'completed' | 'not_completed') => {
    // Optimistik anlık UI güncellemesi
    setAssignmentDetail((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        submissions: (prev.submissions || []).map((sub: any) =>
          sub.student_id === studentId
            ? { ...sub, status, score: status === 'not_completed' ? null : sub.score }
            : sub
        )
      };
    });

    try {
      await fetch(`/api/ogretmen/odev/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status })
      });
      fetchAssignmentDetail(assignmentId);
      fetchAssignments();
    } catch (e) {
      console.error('Update assignment status error:', e);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editingAssignment.title) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ogretmen/odev/${editingAssignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingAssignment,
          isAssignmentUpdate: true
        })
      });
      if (res.ok) {
        fetchAssignments();
        fetchDashboard();
        setEditingAssignment(null);
        setActiveModal(null);
      }
    } catch (e) {
      console.error('Update assignment error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Bu ödevi ve tüm öğrenci teslimlerini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      const res = await fetch(`/api/ogretmen/odev/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAssignments();
        fetchDashboard();
        if (activeModal === 'odevDetay') setActiveModal(null);
      }
    } catch (e) {
      console.error('Delete assignment error:', e);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editingAnnouncement.title) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/ogretmen/duyurular', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAnnouncement)
      });
      if (res.ok) {
        fetchAnnouncements();
        fetchDashboard();
        setEditingAnnouncement(null);
        setActiveModal(null);
      }
    } catch (e) {
      console.error('Update announcement error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/ogretmen/duyurular?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
        fetchDashboard();
      }
    } catch (e) {
      console.error('Delete announcement error:', e);
    }
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
    { key: 'profil', label: 'Profilim', icon: User, color: '#6366f1' },
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
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
                            {Number(c.student_count) || 0} öğrenci
                          </div>
                          {Number(c.student_count) > 0 && (
                            <div style={{ color: successColor(Number(c.avg_success) || 0), fontSize: '0.78rem', fontWeight: 700 }}>
                              Ort. %{(Number(c.avg_success) || 0).toFixed(1)}
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

                      {/* Invite & Leaderboard Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button onClick={() => generateInvite(c.id)} disabled={submitting} style={{ flex: 1, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, color: '#60a5fa', padding: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          Davet Linki Oluştur
                        </button>
                        <button onClick={() => toggleLeaderboard(c.id)} style={{ flex: 1, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, color: '#fbbf24', padding: '0.6rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Trophy size={14} /> Liderlik Tablosu
                        </button>
                      </div>

                      {/* Leaderboard Section */}
                      {expandedLeaderboard === c.id && (
                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Trophy size={16} color="#fbbf24" /> İlk 5 Öğrenci
                          </h4>
                          {(!classLeaderboards[c.id]) ? (
                            <div style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>Yükleniyor...</div>
                          ) : classLeaderboards[c.id].length === 0 ? (
                            <div style={{ color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center' }}>Bu sınıfta henüz öğrenci yok.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {classLeaderboards[c.id].map((student, i) => (
                                <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1.1rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                                    <span style={{ color: '#e5e7eb', fontSize: '0.85rem', fontWeight: 500 }}>{student.username}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{student.league}</span>
                                    <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>{student.league_points} XP</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
              {students.filter(s => (s.streak_days ?? 0) === 0 && !s.is_live_focusing).length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '0.4rem 0.85rem', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                  <AlertTriangle size={14} /> {students.filter(s => (s.streak_days ?? 0) === 0 && !s.is_live_focusing).length} öğrenci hareketsiz
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
              <div className="premium-card table-responsive-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: 0 }}>
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
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
                      const isAtRisk = (s.streak_days ?? 0) === 0 && !s.is_live_focusing;
                      return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', background: isAtRisk ? 'rgba(239,68,68,0.03)' : 'transparent', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.background = isAtRisk ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = isAtRisk ? 'rgba(239,68,68,0.03)' : 'transparent')}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('button')) return;
                          setSelectedStudentId(s.id);
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${['#38bdf8','#10b981','#a855f7','#f59e0b','#f43f5e'][idx % 5]}, ${['#0ea5e9','#059669','#7c3aed','#d97706','#dc2626'][idx % 5]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                              {s.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span>{s.username}</span>
                                {s.is_live_focusing && (() => {
                                  const isBreak = s.live_status === 'break' || s.live_status === 'break_paused' || s.live_mode?.includes('Break');
                                  const isPaused = s.live_status === 'paused';

                                  if (isBreak) {
                                    const breakMinutesLeft = Math.max(1, Math.ceil((s.active_time_left_sec || 300) / 60));
                                    return (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        background: 'rgba(245,158,11,0.2)',
                                        border: '1px solid rgba(245,158,11,0.4)',
                                        color: '#fcd34d',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        boxShadow: '0 0 10px rgba(245,158,11,0.2)'
                                      }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                                        ☕ MOLADA: {s.live_mode === 'longBreak' ? 'Uzun Mola' : 'Kısa Mola'} ({breakMinutesLeft} dk kaldı)
                                      </span>
                                    );
                                  }

                                  if (isPaused) {
                                    return (
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        padding: '2px 8px',
                                        borderRadius: 12,
                                        background: 'rgba(59,130,246,0.2)',
                                        border: '1px solid rgba(59,130,246,0.4)',
                                        color: '#93c5fd',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        boxShadow: '0 0 10px rgba(59,130,246,0.2)'
                                      }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                                        ⏸️ DURAKLATILDI: {s.active_subject || 'Odak'} ({s.focus_elapsed_min || 1} dk)
                                      </span>
                                    );
                                  }

                                  return (
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 5,
                                      padding: '2px 8px',
                                      borderRadius: 12,
                                      background: 'rgba(16,185,129,0.2)',
                                      border: '1px solid rgba(16,185,129,0.4)',
                                      color: '#6ee7b7',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      boxShadow: '0 0 10px rgba(16,185,129,0.2)'
                                    }}>
                                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                                      🟢 CANLI: {s.active_subject || 'Odak'} ({s.focus_elapsed_min || 1} dk)
                                    </span>
                                  );
                                })()}
                                {isAtRisk && <AlertTriangle size={12} color="#ef4444" title="Hareketsiz öğrenci" />}
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                                {s.sinif && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.sinif}. Sınıf</span>}
                                {s.class_names && <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>• {s.class_names}</span>}
                              </div>
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
                            <button onClick={() => setSelectedStudentId(s.id)} style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8', padding: '0.4rem 0.85rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
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
        {activeTab === 'odevler' && (() => {
          const filteredAssignments = assignments.filter(a => {
            if (assignmentCategory === 'Tümü') return true;
            return (a.category || 'Genel') === assignmentCategory;
          });

          return (
            <motion.div key="odevler" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Ödevler</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0' }}>Sınıflara atanan ödevlerin teslim durumu, notlandırma ve kategori yönetimi</p>
                </div>
                <button onClick={() => setActiveModal('odev')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 700 }}>
                  <Plus size={16} /> Ödev Ata
                </button>
              </div>

              {/* Kategori Filtre Çubuğu */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {ASSIGNMENT_CATEGORIES.map(cat => {
                  const isActive = assignmentCategory === cat;
                  const catColor = ASSIGNMENT_CATEGORY_COLORS[cat] || '#f59e0b';
                  return (
                    <button
                      key={cat}
                      onClick={() => setAssignmentCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: isActive ? catColor : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#fff' : '#9ca3af',
                        border: `1px solid ${isActive ? catColor : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                  <ClipboardList size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <h3 style={{ color: '#fff', margin: 0 }}>
                    {assignments.length === 0 ? 'Henüz ödev ataması yapılmadı' : 'Bu kategoride ödev bulunamadı'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>Yeni bir ödev oluşturarak öğrencilerinize görev atayabilirsiniz.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredAssignments.map((a) => {
                    const submitRate = a.total_assigned > 0 ? (a.submitted_count / a.total_assigned) * 100 : 0;
                    const left = daysLeft(a.due_date);
                    const isOverdue = left !== null && left < 0;
                    const isUrgent = left !== null && left >= 0 && left <= 2;
                    const catColor = ASSIGNMENT_CATEGORY_COLORS[a.category || 'Genel'] || '#f59e0b';

                    return (
                      <div key={a.id} className="premium-card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', borderLeft: `3px solid ${catColor}` }}
                        onClick={() => { fetchAssignmentDetail(a.id); setActiveModal('odevDetay'); }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                              <Badge label={a.category || 'Genel'} color={catColor} />
                              {a.target_sinif && <Badge label={a.target_sinif} color="#6b7280" />}
                              {a.subject && (
                                <span style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                                  {a.subject}{a.topic ? ` • ${a.topic}` : ''}
                                </span>
                              )}
                              {isOverdue && <Badge label="Süresi Geçti" color="#ef4444" />}
                              {isUrgent && !isOverdue && <Badge label="Acil" color="#f59e0b" />}
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{a.title}</h3>
                            {a.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{a.description.substring(0, 120)}{a.description.length > 120 ? '…' : ''}</p>}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>
                                {a.submitted_count}<span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>/{a.total_assigned}</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>teslim edildi</div>
                            </div>

                            {/* Aksiyonlar: Düzenle & Sil */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAssignment({
                                    id: a.id,
                                    title: a.title,
                                    description: a.description || '',
                                    due_date: a.due_date ? a.due_date.split('T')[0] : '',
                                    category: a.category || 'Genel',
                                    subject: a.subject || '',
                                    topic: a.topic || ''
                                  });
                                  setActiveModal('odevDuzenle');
                                }}
                                title="Ödevi Düzenle"
                                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '6px 12px', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                              >
                                <PenLine size={13} /> Düzenle
                              </button>
                              <button
                                onClick={(e) => handleDeleteAssignment(a.id, e)}
                                title="Ödevi Sil"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 12px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                              >
                                <Trash2 size={13} /> Sil
                              </button>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                          <MiniBar value={a.submitted_count} max={a.total_assigned} color={submitRate === 100 ? '#10b981' : submitRate >= 50 ? '#f59e0b' : '#ef4444'} />
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{Math.round(submitRate)}%</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {submitRate === 100 && <Badge label="Tamamlandı ✓" color="#10b981" />}
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Oluşturulma: {formatDate(a.created_at)}</span>
                          </div>
                          {a.due_date && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: isOverdue ? '#ef4444' : isUrgent ? '#f59e0b' : '#38bdf8', fontSize: '0.78rem', fontWeight: 600 }}>
                              <Calendar size={13} />
                              {isOverdue ? 'Son Teslim Geçti' : `Son Teslim: ${formatDate(a.due_date)}`}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* ══════════════════════════════════════════
            TAB: ANALİZ
        ══════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════
            TAB: ANALİZ (KURUMSAL BAŞARI MERKEZİ)
        ══════════════════════════════════════════ */}
        {activeTab === 'analiz' && (
          <motion.div key="analiz" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!analytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
                <Loader2 size={36} color="#f43f5e" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Başlık ve Yenile Butonu */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ color: '#fff', fontSize: '1.45rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BarChart2 size={24} color="#f43f5e" /> Kurumsal Analiz & Başarı Merkezi
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                      Kurumunuzdaki tüm sınıfların, branşların ve yüzlerce öğrencinin derinlemesine analitiği
                    </p>
                  </div>
                  <button 
                    onClick={() => { fetchAnalytics(); fetchClasses(); if (aiClassId) fetchClassInsights(aiClassId); }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <RefreshCw size={14} /> Analizi Yenile
                  </button>
                </div>

                {/* AI Asistan ve Haftalık Rapor Bölümü */}
                <AIAssistantWidget classId={aiClassId} />
                <WeeklyReportWidget classId={aiClassId} />

                {/* Dinamik AI Kurumsal Yönetici Özeti */}
                <div className="premium-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(16, 185, 129, 0.08))', border: '1px solid rgba(139, 92, 246, 0.35)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrainCircuit size={18} color="#fff" />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>AstraTutor Kurumsal Değerlendirme & Teşhis</h4>
                      <span style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>Yapay Zeka Destekli Kurum Analitiği</span>
                    </div>
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
                    {analytics.aiInsight || "Sınıflarınızın çalışma ve deneme verileri derleniyor..."}
                  </p>
                </div>

                {/* Kurumsal KPI Grid Kartları (6'lı Kart) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.9rem' }}>
                  <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#38bdf8', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>TOPLAM ÖĞRENCİ</span>
                      <Users size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{analytics.overview?.totalStudents || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>{analytics.overview?.totalClasses || 0} Aktif Sınıf</div>
                  </div>

                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>ORTALAMA BAŞARI</span>
                      <Target size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>%{analytics.overview?.avgSuccessRate || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>Kurum Geneli Başarı</div>
                  </div>

                  <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a855f7', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>TOPLAM ODAK SÜRESİ</span>
                      <Clock size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc' }}>{analytics.overview?.totalFocusHours || 0} <span style={{ fontSize: '0.85rem' }}>Saat</span></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>Tamamlanan Pomodoro Seansları</div>
                  </div>

                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>ÇÖZÜLEN TOPLAM SORU</span>
                      <BookOpen size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>{analytics.overview?.totalSolvedQuestions || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>Soru Çözüm Kayıtları</div>
                  </div>

                  <div style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ec4899', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>AKTİF ÖĞRENCİ (7 GÜN)</span>
                      <Flame size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f472b6' }}>%{analytics.overview?.activeStudentRate || 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>Haftalık Çalışan Öğrenci</div>
                  </div>

                  <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6366f1', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>ÖDEV TESLİM ORANI</span>
                      <CheckCircle size={18} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>%{analytics.submissionStats?.rate ?? 0}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 4 }}>{analytics.submissionStats?.submitted || 0}/{analytics.submissionStats?.total || 0} Teslim Edildi</div>
                  </div>
                </div>

                {/* Sınıf Karşılaştırma & Başarı Matrisi */}
                <div className="premium-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BarChart2 size={18} color="#f43f5e" /> Sınıf Karşılaştırma & Başarı Matrisi
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0' }}>Kurumunuzdaki sınıfların başarı, soru çözümü ve odaklanma kıyaslaması</p>
                    </div>
                  </div>

                  {(analytics.classPerformance ?? []).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '1rem 0' }}>Henüz kayıtlı sınıf bulunmuyor.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                            {['Sınıf Adı', 'Öğrenci', 'Ortalama Başarı', 'Toplam Soru', 'Odak Saati', 'Ort. Seri', 'Risk Durumu', 'İşlem'].map((h, i) => (
                              <th key={i} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.classPerformance.map((c: any, i: number) => {
                            const colors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#f43f5e'];
                            const col = colors[i % colors.length];
                            return (
                              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                                <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: 700 }}>
                                  {c.class_name}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#38bdf8', fontWeight: 600 }}>
                                  {c.student_count} öğrenci
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 90 }}>
                                      <MiniBar value={c.avg_success || 0} max={100} color={col} />
                                    </div>
                                    <span style={{ color: col, fontWeight: 700 }}>%{c.avg_success || 0}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#fbbf24', fontWeight: 700 }}>
                                  {c.total_solved || 0}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#c084fc', fontWeight: 600 }}>
                                  {c.total_focus_hours || 0} saat
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#f59e0b' }}>
                                  {c.avg_streak || 0} gün 🔥
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  {c.at_risk_count > 0 ? (
                                    <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700 }}>
                                      ⚠️ {c.at_risk_count} Riskli
                                    </span>
                                  ) : (
                                    <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>✅ Dengeli</span>
                                  )}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <button
                                    onClick={() => {
                                      setAiClassId(c.id);
                                      setSelectedClassId(c.id);
                                      fetchClassInsights(c.id);
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                  >
                                    AI Analiz Et
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Branş ve Ders Bazlı Çalışma & Soru Dağılımı */}
                {analytics.subjectDistribution && analytics.subjectDistribution.length > 0 && (
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <BookOpen size={18} color="#38bdf8" /> Branş & Ders Bazlı Çalışma ve Soru Dağılımı
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0' }}>Kurum öğrencilerinin hangi derslere ağırlık verdiğinin detaylı dökümü</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                      {analytics.subjectDistribution.map((s: any, idx: number) => {
                        const colors = ['#38bdf8', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];
                        const col = colors[idx % colors.length];
                        return (
                          <div key={s.subject} style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{s.subject}</span>
                              <span style={{ color: col, fontWeight: 800, fontSize: '0.85rem' }}>{s.total_hours || (Math.round((s.total_minutes || 0) / 60 * 10) / 10)} saat</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                              <span>{s.total_questions || 0} soru</span>
                              <span>✅ {s.total_correct || 0} D / ❌ {s.total_wrong || 0} Y</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, (s.total_correct / (Math.max(1, s.total_questions))) * 100)}%`, background: col, borderRadius: 3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Kritik Konu Hata Haritası & Acil Eylem Tablosu */}
                {analytics.topWeaknesses && analytics.topWeaknesses.length > 0 && (
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <AlertTriangle size={18} color="#ef4444" /> Kurum Genelinde En Çok Zorlanılan Kritik Konular
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0' }}>Öğrencilerin hata kayıtlarından otomatik tespit edilen acil pekiştirme alanları</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                      {analytics.topWeaknesses.map((w: any, idx: number) => {
                        const isHigh = w.severity === 'high';
                        const isMed = w.severity === 'medium';
                        return (
                          <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : isMed ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>{w.subject} — {w.topic}</span>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: isHigh ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: isHigh ? '#fca5a5' : '#fcd34d' }}>
                                {isHigh ? '🔴 KRİTİK' : isMed ? '🟡 ORTA' : '🔵 DÜŞÜK'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {w.error_count} hata · {w.affected_students} öğrenci etkileniyor
                              </span>
                              <button
                                onClick={() => {
                                  setNewAssignment({
                                    title: `${w.subject} — ${w.topic} Pekiştirme Testi`,
                                    description: `Kurum genelinde ${w.topic} konusunda yapılan hataları telafi etmek için hazırlanan pekiştirme ödevidir.`,
                                    subject: w.subject,
                                    topic: w.topic,
                                    category: 'Pekiştirme',
                                    target_class_id: aiClassId || (classes[0]?.id ?? ''),
                                    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                                  });
                                  setActiveModal('odev');
                                }}
                                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.2))', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
                              >
                                ⚡ Ödev Ata
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Günlük Aktivite & Zaman Çizelgesi Trendi */}
                {analytics.dailyTrend && analytics.dailyTrend.length > 0 && (
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
                      <Calendar size={18} color="#10b981" />
                      <div>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700 }}>Son 14 Günlük Kurumsal Aktivite & Soru Çözüm Trendi</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '2px 0 0' }}>Kurum öğrencilerinin günlük toplam odaklanma ve soru çözüm temposu</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 90, paddingBottom: 6 }}>
                      {(() => {
                        const maxVal = Math.max(...analytics.dailyTrend.map((d: any) => d.total_questions || d.total_minutes || 0), 10);
                        return analytics.dailyTrend.map((d: any, idx: number) => {
                          const heightPct = Math.max(6, Math.min(100, Math.round(((d.total_questions || d.total_minutes) / maxVal) * 100)));
                          const label = new Date(d.day).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
                          return (
                            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                              <div
                                title={`${label}: ${d.total_questions || 0} soru, ${d.total_minutes || 0} dk odak`}
                                style={{
                                  width: '100%',
                                  height: `${heightPct}%`,
                                  background: 'linear-gradient(180deg, #10b981, #059669)',
                                  borderRadius: '4px 4px 0 0',
                                  transition: 'height 0.4s ease',
                                }}
                              />
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Sınıf AI Analizi & Ortak Zayıf Yönler */}
                <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={20} color="#a855f7" style={{ fill: '#a855f7' }} /> Sınıf Odaklı AI Zayıf Yön Raporu
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>Seçilen sınıfa ait hata yoğunluğuna göre kişiselleştirilmiş analiz</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sınıf Seç:</span>
                      <select 
                        value={aiClassId} 
                        onChange={e => {
                          setAiClassId(e.target.value);
                          fetchClassInsights(e.target.value);
                        }}
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

                {/* Öğrenci Performans Segmentasyonu (2 Kolon Grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
                  {/* Sol: En Başarılı Öğrenciler (Tıklanabilir detay modalı) */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={18} color="#f59e0b" /> En Başarılı Yıldız Öğrenciler
                      </h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Detay için tıklayın</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(analytics.topStudents ?? []).map((s: any, i: number) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudentId(s.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : i === 1 ? 'linear-gradient(135deg,#9ca3af,#6b7280)' : 'linear-gradient(135deg,#cd7f32,#a05a20)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{s.username}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.alan || 'Genel'} · {s.solved_questions || 0} soru</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ color: successColor(s.success_rate), fontWeight: 800, fontSize: '0.9rem' }}>%{Number(s.success_rate || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                      {(analytics.topStudents ?? []).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kayıtlı öğrenci bulunmuyor.</p>}
                    </div>
                  </div>

                  {/* Sağ: Dikkat & Destek Gerektiren Öğrenciler (Tıklanabilir) */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ color: '#fff', margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={18} color="#ef4444" /> Takip & Destek Gerektirenler
                      </h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Müdahale için tıklayın</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(analytics.atRiskStudents ?? []).map((s: any) => (
                        <div 
                          key={s.id} 
                          onClick={() => setSelectedStudentId(s.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.9rem', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                        >
                          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{s.username}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{s.sinif ? `${s.sinif}. Sınıf` : 'Öğrenci'} · {s.solved_questions || 0} soru</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.88rem' }}>%{Number(s.success_rate || 0).toFixed(1)}</div>
                            {s.streak_days === 0 && <div style={{ color: '#f87171', fontSize: '0.68rem', fontWeight: 600 }}>0 gün seri</div>}
                          </div>
                        </div>
                      ))}
                      {(analytics.atRiskStudents ?? []).length === 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.875rem', padding: '1rem 0' }}>
                          <CheckCircle size={16} /> Tüm öğrenciler aktif ve hedeflerinde ilerliyor!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lig ve Başarı Bantları Dağılımı */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
                  {/* Başarı Dağılımı */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Target size={18} color="#38bdf8" /> Kurumsal Başarı Dağılımı
                    </h3>
                    {(() => {
                      const { low = 0, mid = 0, high = 0 } = analytics.successBands ?? {};
                      const total = low + mid + high || 1;
                      const bands = [
                        { label: 'Yüksek Başarı (≥70%)', value: high, color: '#10b981' },
                        { label: 'Orta Düzey (40-70%)', value: mid, color: '#f59e0b' },
                        { label: 'Destek Gerekli (<40%)', value: low, color: '#ef4444' },
                      ];
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                          {bands.map(b => (
                            <div key={b.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                <span style={{ color: b.color, fontSize: '0.82rem', fontWeight: 600 }}>{b.label}</span>
                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{b.value} öğrenci <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round((b.value / total) * 100)}%)</span></span>
                              </div>
                              <MiniBar value={b.value} max={total} color={b.color} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Lig Dağılımı */}
                  <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={18} color="#a855f7" /> Kurum Lig Dağılımı
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {(analytics.leagueDistribution ?? []).map((l: any) => (
                        <div key={l.league} style={{ flex: '1 1 120px', padding: '0.9rem', background: `${LEAGUE_COLORS[l.league] ?? '#9ca3af'}15`, border: `1px solid ${LEAGUE_COLORS[l.league] ?? '#9ca3af'}35`, borderRadius: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: LEAGUE_COLORS[l.league] ?? '#9ca3af' }}>{l.count}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>{l.league}</div>
                        </div>
                      ))}
                      {(analytics.leagueDistribution ?? []).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Veri yok.</p>}
                    </div>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1rem' }}>
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
        {activeTab === 'duyurular' && (() => {
          const filteredAnnouncements = announcements.filter(a => {
            if (announcementCategory === 'Tümü') return true;
            return (a.category || 'Genel') === announcementCategory;
          });

          return (
            <motion.div key="duyurular" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Duyurular</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0' }}>Sınıflara ve tüm öğrencilere yönelik bilgilendirme ve duyuru yönetimi</p>
                </div>
                <button onClick={() => setActiveModal('duyuru')} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Plus size={16} /> Duyuru Gönder
                </button>
              </div>

              {/* Kategori Filtre Çubuğu */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {ANNOUNCEMENT_CATEGORIES.map(cat => {
                  const isActive = announcementCategory === cat;
                  const catColor = ANNOUNCEMENT_CATEGORY_COLORS[cat] || '#8b5cf6';
                  return (
                    <button
                      key={cat}
                      onClick={() => setAnnouncementCategory(cat)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: isActive ? catColor : 'rgba(255,255,255,0.04)',
                        color: isActive ? '#fff' : '#9ca3af',
                        border: `1px solid ${isActive ? catColor : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {filteredAnnouncements.length === 0 ? (
                <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                  <Megaphone size={52} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <h3 style={{ color: '#fff', margin: 0 }}>
                    {announcements.length === 0 ? 'Henüz duyuru gönderilmedi' : 'Bu kategoride duyuru bulunamadı'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>Yeni bir duyuru ekleyerek öğrencileri bilgilendirebilirsiniz.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredAnnouncements.map((a) => {
                    const catColor = ANNOUNCEMENT_CATEGORY_COLORS[a.category || 'Genel'] || '#8b5cf6';
                    return (
                      <div key={a.id} className="premium-card" style={{ padding: '1.5rem', borderLeft: `3px solid ${catColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem', flexWrap: 'wrap' }}>
                              <Badge label={a.category || 'Genel'} color={catColor} />
                              <Badge label={a.class_name ?? 'Tüm Sınıflar'} color="#6b7280" />
                              {a.event_date && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: 6 }}>
                                  <Calendar size={12} /> Tarih: {formatDate(a.event_date)}
                                </span>
                              )}
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{a.title}</h3>
                          </div>

                          {/* Düzenle & Sil Butonları */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                            <button
                              onClick={() => {
                                setEditingAnnouncement({
                                  id: a.id,
                                  title: a.title,
                                  content: a.content || '',
                                  class_id: a.class_id || '',
                                  category: a.category || 'Genel',
                                  event_date: a.event_date ? a.event_date.split('T')[0] : ''
                                });
                                setActiveModal('duyuruDuzenle');
                              }}
                              title="Duyuruyu Düzenle"
                              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 8, padding: '6px 12px', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            >
                              <PenLine size={13} /> Düzenle
                            </button>
                            <button
                              onClick={(e) => handleDeleteAnnouncement(a.id, e)}
                              title="Duyuruyu Sil"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '6px 12px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            >
                              <Trash2 size={13} /> Sil
                            </button>
                          </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 0.85rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{a.content}</p>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Oluşturulma: {formatDate(a.created_at)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })()}

        {activeTab === 'profil' && (
          <motion.div key="profil" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            <TeacherProfileTab />
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
          <textarea value={newAssignment.description} onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })} placeholder="Açıklama (isteğe bağlı)" style={{ ...inp, minHeight: 85, resize: 'vertical' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Sınıf Seçimi *</label>
              <select value={newAssignment.class_id} onChange={e => setNewAssignment({ ...newAssignment, class_id: e.target.value })} style={sel} required>
                <option value="" style={{ background: '#0f1015' }}>Sınıf Seçin *</option>
                {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Ödev Kategorisi</label>
              <select value={newAssignment.category} onChange={e => setNewAssignment({ ...newAssignment, category: e.target.value })} style={sel}>
                {ASSIGNMENT_CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                  <option key={c} value={c} style={{ background: '#0f1015' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Ders (İsteğe bağlı)</label>
              <input value={newAssignment.subject || ''} onChange={e => setNewAssignment({ ...newAssignment, subject: e.target.value })} placeholder="örn: Matematik" style={inp} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Konu (İsteğe bağlı)</label>
              <input value={newAssignment.topic || ''} onChange={e => setNewAssignment({ ...newAssignment, topic: e.target.value })} placeholder="örn: Trigonometri" style={inp} />
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Son Teslim Tarihi</label>
            <input type="date" value={newAssignment.due_date} onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })} style={inp} />
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "rgba(139, 92, 246, 0.1)", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: '0.85rem' }}>
                <Zap size={15} color="#a78bfa" /> Akıllı Soru Üretimi
              </div>
              <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>YKS Yıldızı AI Motoru bu ödev için otomatik sorular türetsin.</div>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "40px", height: "24px" }}>
              <input type="checkbox" checked={newAssignment.generateQuestions || false} onChange={e => setNewAssignment({ ...newAssignment, generateQuestions: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: (newAssignment.generateQuestions) ? "#8b5cf6" : "rgba(255,255,255,0.1)", transition: ".4s", borderRadius: "24px" }}>
                <span style={{ position: "absolute", content: "", height: "18px", width: "18px", left: "3px", bottom: "3px", backgroundColor: "white", transition: ".4s", borderRadius: "50%", transform: (newAssignment.generateQuestions) ? "translateX(16px)" : "translateX(0)" }} />
              </span>
            </label>
          </div>

          <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', width: '100%', fontWeight: 700, padding: '0.75rem' }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Ödev Ata'}
          </button>
        </form>
      </Modal>

      {/* Ödev Düzenle */}
      <Modal open={activeModal === 'odevDuzenle' && !!editingAssignment} onClose={() => { setActiveModal(null); setEditingAssignment(null); }} title="Ödevi Düzenle">
        {editingAssignment && (
          <form onSubmit={handleUpdateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <input value={editingAssignment.title} onChange={e => setEditingAssignment({ ...editingAssignment, title: e.target.value })} placeholder="Ödev başlığı *" style={inp} required />
            <textarea value={editingAssignment.description || ''} onChange={e => setEditingAssignment({ ...editingAssignment, description: e.target.value })} placeholder="Açıklama" style={{ ...inp, minHeight: 85, resize: 'vertical' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Kategori</label>
                <select value={editingAssignment.category || 'Genel'} onChange={e => setEditingAssignment({ ...editingAssignment, category: e.target.value })} style={sel}>
                  {ASSIGNMENT_CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                    <option key={c} value={c} style={{ background: '#0f1015' }}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Son Teslim Tarihi</label>
                <input type="date" value={editingAssignment.due_date || ''} onChange={e => setEditingAssignment({ ...editingAssignment, due_date: e.target.value })} style={inp} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Ders</label>
                <input value={editingAssignment.subject || ''} onChange={e => setEditingAssignment({ ...editingAssignment, subject: e.target.value })} placeholder="Ders" style={inp} />
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Konu</label>
                <input value={editingAssignment.topic || ''} onChange={e => setEditingAssignment({ ...editingAssignment, topic: e.target.value })} placeholder="Konu" style={inp} />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', width: '100%', fontWeight: 700, padding: '0.75rem' }}>
              {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Ödevi Güncelle'}
            </button>
          </form>
        )}
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
          <textarea value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} placeholder="Duyuru içeriği *" style={{ ...inp, minHeight: 110, resize: 'vertical' }} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Hedef Sınıf</label>
              <select value={newAnnouncement.class_id} onChange={e => setNewAnnouncement({ ...newAnnouncement, class_id: e.target.value })} style={sel}>
                <option value="" style={{ background: '#0f1015' }}>📢 Tüm Sınıflar</option>
                {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Duyuru Kategorisi</label>
              <select value={newAnnouncement.category} onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })} style={sel}>
                {ANNOUNCEMENT_CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                  <option key={c} value={c} style={{ background: '#0f1015' }}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Etkinlik / Geçerlilik Tarihi (İsteğe bağlı)</label>
            <input type="date" value={newAnnouncement.event_date} onChange={e => setNewAnnouncement({ ...newAnnouncement, event_date: e.target.value })} style={inp} />
          </div>

          <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', width: '100%', padding: '0.75rem' }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Duyuru Yayınla'}
          </button>
        </form>
      </Modal>

      {/* Duyuru Düzenle */}
      <Modal open={activeModal === 'duyuruDuzenle' && !!editingAnnouncement} onClose={() => { setActiveModal(null); setEditingAnnouncement(null); }} title="Duyuruyu Düzenle">
        {editingAnnouncement && (
          <form onSubmit={handleUpdateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <input value={editingAnnouncement.title} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })} placeholder="Duyuru başlığı *" style={inp} required />
            <textarea value={editingAnnouncement.content || ''} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })} placeholder="Duyuru içeriği *" style={{ ...inp, minHeight: 110, resize: 'vertical' }} required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Hedef Sınıf</label>
                <select value={editingAnnouncement.class_id || ''} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, class_id: e.target.value })} style={sel}>
                  <option value="" style={{ background: '#0f1015' }}>📢 Tüm Sınıflar</option>
                  {classes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f1015' }}>{c.class_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Kategori</label>
                <select value={editingAnnouncement.category || 'Genel'} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, category: e.target.value })} style={sel}>
                  {ANNOUNCEMENT_CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                    <option key={c} value={c} style={{ background: '#0f1015' }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: 4 }}>Tarih</label>
              <input type="date" value={editingAnnouncement.event_date || ''} onChange={e => setEditingAnnouncement({ ...editingAnnouncement, event_date: e.target.value })} style={inp} />
            </div>

            <button type="submit" disabled={submitting} className="btn-interactive" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', width: '100%', padding: '0.75rem' }}>
              {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Duyuruyu Güncelle'}
            </button>
          </form>
        )}
      </Modal>

      {/* Ödev Detayı */}
      <Modal open={activeModal === 'odevDetay' && !!assignmentDetail} onClose={() => { setActiveModal(null); setAssignmentDetail(null); }} title={assignmentDetail?.title ?? 'Ödev Detayı'} maxW={680}>
        {assignmentDetail && (
          <div>
            {/* Header: Kategori, Sınıf ve Hızlı İşlemler */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Badge label={assignmentDetail.category || 'Genel'} color={ASSIGNMENT_CATEGORY_COLORS[assignmentDetail.category || 'Genel'] || '#f59e0b'} />
                {assignmentDetail.target_sinif && <Badge label={assignmentDetail.target_sinif} color="#6b7280" />}
                {assignmentDetail.subject && (
                  <span style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                    {assignmentDetail.subject}{assignmentDetail.topic ? ` • ${assignmentDetail.topic}` : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => {
                    setEditingAssignment({
                      id: assignmentDetail.id,
                      title: assignmentDetail.title,
                      description: assignmentDetail.description || '',
                      due_date: assignmentDetail.due_date ? assignmentDetail.due_date.split('T')[0] : '',
                      category: assignmentDetail.category || 'Genel',
                      subject: assignmentDetail.subject || '',
                      topic: assignmentDetail.topic || ''
                    });
                    setActiveModal('odevDuzenle');
                  }}
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <PenLine size={13} /> Düzenle
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignmentDetail.id)}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.4rem 0.75rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Trash2 size={13} /> Sil
                </button>
              </div>
            </div>

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
              {(assignmentDetail.submissions ?? []).map((sub: any) => {
                const isCompleted = sub.status === 'completed' || sub.status === 'submitted' || sub.status === 'graded';
                const isNotCompleted = sub.status === 'not_completed';

                return (
                  <div key={sub.student_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 160 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: isCompleted ? 'rgba(16,185,129,0.2)' : isNotCompleted ? 'rgba(239,68,68,0.2)' : '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? '#10b981' : isNotCompleted ? '#ef4444' : '#3b82f6', fontWeight: 700, fontSize: '0.85rem' }}>
                        {sub.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>{sub.username}</div>
                        <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          {isCompleted ? (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>
                              ✅ Yaptı {sub.status === 'graded' && `(${sub.score}/100)`}
                            </span>
                          ) : isNotCompleted ? (
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>❌ Yapmadı</span>
                          ) : (
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>⏳ Bekleniyor</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Aksiyon Butonları: Yaptı / Yapmadı & Notlandırma */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {/* Yaptı Butonu */}
                      <button
                        onClick={() => handleUpdateAssignmentStatus(assignmentDetail.id, sub.student_id, 'completed')}
                        style={{
                          background: isCompleted ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.04)',
                          border: isCompleted ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          color: isCompleted ? '#34d399' : '#9ca3af',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s'
                        }}
                      >
                        ✅ Yaptı
                      </button>

                      {/* Yapmadı Butonu */}
                      <button
                        onClick={() => handleUpdateAssignmentStatus(assignmentDetail.id, sub.student_id, 'not_completed')}
                        style={{
                          background: isNotCompleted ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.04)',
                          border: isNotCompleted ? '1.5px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                          color: isNotCompleted ? '#f87171' : '#9ca3af',
                          padding: '0.45rem 0.85rem',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.15s'
                        }}
                      >
                        ❌ Yapmadı
                      </button>

                      {/* İsteğe Bağlı Puan Girişi */}
                      {isCompleted && (
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', marginLeft: 4 }}>
                          <input
                            type="number" min={0} max={100}
                            placeholder={sub.score != null ? String(sub.score) : "Not"}
                            value={gradeInput[sub.student_id] ?? ''}
                            onChange={e => setGradeInput(prev => ({ ...prev, [sub.student_id]: e.target.value }))}
                            style={{ ...inp, width: 62, padding: '0.4rem 0.5rem', fontSize: '0.8rem', textAlign: 'center' }}
                          />
                          <button
                            onClick={() => {
                              const score = parseInt(gradeInput[sub.student_id] ?? '');
                              if (!isNaN(score) && score >= 0 && score <= 100) {
                                handleGrade(assignmentDetail.id, sub.student_id, score);
                                setGradeInput(prev => { const n = { ...prev }; delete n[sub.student_id]; return n; });
                              }
                            }}
                            style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '0.4rem 0.65rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                            {sub.score != null ? 'Güncelle' : 'Puanla'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                if (studentDetail.liveSession?.isLive || selectedStudent?.is_live_focusing) return null;
                if (!studentDetail.lastActivity) return null;
                const daysSinceActive = Math.floor((Date.now() - new Date(studentDetail.lastActivity).getTime()) / 86400000);
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

      {/* Invite Code Modal */}
      <Modal open={!!inviteModal} onClose={() => setInviteModal(null)} title="Sınıf Davet Linki" maxW={420}>
        {inviteModal && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, display: 'inline-block', margin: '0 auto' }}>
              <QRCodeSVG value={inviteModal.url || 'https://yks-yildizi.vercel.app'} size={200} />
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 6 }}>Davet Kodu</div>
              <code style={{ color: '#38bdf8', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.1em' }}>{inviteModal.code}</code>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => {
                if (inviteModal.url) navigator.clipboard.writeText(inviteModal.url);
                setCopiedCode('invite');
                setTimeout(() => setCopiedCode(''), 2000);
              }} style={{ flex: 1, background: copiedCode === 'invite' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copiedCode === 'invite' ? '#10b981' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, color: copiedCode === 'invite' ? '#10b981' : '#e5e7eb', padding: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                {copiedCode === 'invite' ? <><Check size={16} /> Kopyalandı</> : <><Copy size={16} /> Linki Kopyala</>}
              </button>
              
              <a href={`https://wa.me/?text=${encodeURIComponent(`Sınıfıma katılmak için tıkla: ${inviteModal.url || ''}`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#25D366', color: '#fff', borderRadius: 8, padding: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}>
                WhatsApp'ta Paylaş
              </a>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <Clock size={12} /> Geçerlilik: {inviteModal.expires ? new Date(inviteModal.expires).toLocaleString('tr-TR') : '7 Gün'}
            </div>
          </div>
        )}
      </Modal>

      {selectedStudentId && <StudentDetailModal studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
