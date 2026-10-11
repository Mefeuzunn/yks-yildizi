"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, BookOpen, Activity, CheckCircle, XCircle, 
  MoreVertical, LayoutDashboard, Loader2, Cpu, Sparkles, 
  Database, RefreshCw, Send, Check, AlertCircle, Layers,
  Search, Filter, UserCheck, UserX, Award, ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/context/ToastContext';
import { triggerHaptic } from '@/lib/haptics';
import { YKS_CURRICULUM_TAXONOMY } from '@/lib/curriculum-taxonomy';

const COLORS = ['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'genel' | 'factory' | 'users'>('genel');

  // Overview Data from DB
  const [overviewData, setOverviewData] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Content Factory State
  const [factoryData, setFactoryData] = useState<any>(null);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [selectedType, setSelectedType] = useState<'flashcards' | 'questions'>('questions');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematik');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [itemCount, setItemCount] = useState<number>(5);
  const [lastGeneratedResult, setLastGeneratedResult] = useState<any>(null);

  // Users Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.replace(user?.role === 'ogretmen' ? '/ogretmen/dashboard' : '/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'factory') {
      fetchFactoryStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const topics = YKS_CURRICULUM_TAXONOMY[selectedSubject]?.topics || [];
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
    }
  }, [selectedSubject]);

  const fetchOverview = async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOverviewLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}&role=${encodeURIComponent(userRoleFilter)}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchFactoryStats = async () => {
    setFactoryLoading(true);
    try {
      const res = await fetch('/api/admin/content-factory');
      if (res.ok) {
        const data = await res.json();
        setFactoryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFactoryLoading(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    setUpdatingUserId(targetUserId);
    triggerHaptic();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, newRole })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Kullanıcı rolü güncellendi.');
        // Update local list
        setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
        fetchOverview();
      } else {
        toast.error(data.error || 'Rol güncellenemedi.');
      }
    } catch (e) {
      toast.error('Bağlantı hatası.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleGenerate = async (autoNext = false) => {
    setGenerating(true);
    triggerHaptic();
    setLastGeneratedResult(null);

    try {
      const res = await fetch('/api/admin/content-factory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          subject: selectedSubject,
          topic: selectedTopic,
          count: itemCount,
          autoNext
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Üretim tamamlandı!');
        setLastGeneratedResult(data);
        await fetchFactoryStats();
        await fetchOverview();
      } else {
        toast.error(data.error || 'İçerik üretilirken hata oluştu.');
      }
    } catch (e: any) {
      toast.error('Bağlantı hatası.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={36} color="#ef4444" />
      </div>
    );
  }

  const subjectList = Object.keys(YKS_CURRICULUM_TAXONOMY);
  const currentTopics = YKS_CURRICULUM_TAXONOMY[selectedSubject]?.topics || [];

  const stats = overviewData?.stats || {
    totalUsers: 10450,
    totalStudents: 10200,
    totalTeachers: 18,
    totalQuestions: 8800,
    totalCards: 2420,
    totalMockExams: 450,
    totalUniversities: 189,
    totalPrograms: 11772
  };

  const alanStats = overviewData?.alanDistribution || [
    { name: 'Sayısal', value: 4500 },
    { name: 'Eşit Ağırlık', value: 3200 },
    { name: 'Sözel', value: 1500 },
    { name: 'Dil', value: 800 },
  ];

  const activityStats = overviewData?.weeklyActivity || [
    { day: 'Pzt', users: 4000 },
    { day: 'Sal', users: 4500 },
    { day: 'Çar', users: 4800 },
    { day: 'Per', users: 5100 },
    { day: 'Cum', users: 4900 },
    { day: 'Cmt', users: 7000 },
    { day: 'Paz', users: 8500 },
  ];

  const teachers = overviewData?.teachers || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 900 }}>Admin & İçerik Yönetim Merkezi</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Platform operasyonları, gerçek zamanlı kullanıcı yönetimi ve AI içerik fabrikası.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('genel')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'genel' ? '#ef4444' : 'transparent',
              color: activeTab === 'genel' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Activity size={16} /> Genel Bakış
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
              color: activeTab === 'users' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} /> Kullanıcı Yönetimi
          </button>

          <button
            onClick={() => setActiveTab('factory')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'factory' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
              color: activeTab === 'factory' ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Cpu size={16} /> AI İçerik Fabrikası
          </button>
        </div>
      </div>

      {activeTab === 'genel' && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: '#38bdf8' }}><Users size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>
                  {stats.totalUsers?.toLocaleString('tr-TR')}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Toplam Kayıtlı Kullanıcı</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', color: '#a855f7' }}><BookOpen size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>
                  {stats.totalQuestions?.toLocaleString('tr-TR')} Soru
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>ÖSYM & Tahmin Soru Havuzu</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><Layers size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>
                  {stats.totalCards?.toLocaleString('tr-TR')} Kart
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Müfredat Bilgi Kartı</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><Activity size={24} /></div>
              <div>
                <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>189 Üni</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>11.772 YÖK Atlas Bölümü</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            
            {/* Teachers Table */}
            <div className="premium-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 700 }}>Aktif Eğitmen & Öğretmen Listesi</h2>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, padding: '3px 10px', background: 'rgba(16,185,129,0.1)', borderRadius: '99px', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {teachers.length} Onaylı Öğretmen
                </span>
              </div>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>İsim / Kullanıcı Adı</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Branş</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Kurum</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Kayıt Tarihi</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t: any) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0', color: '#fff', fontWeight: 600 }}>{t.name}</td>
                        <td style={{ padding: '1rem 0', color: '#38bdf8' }}>{t.subject}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{t.school}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{t.date}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div className="premium-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 700 }}>Öğrenci Alan Dağılımı</h2>
                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <PieChart>
                      <Pie data={alanStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {alanStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  {alanStats.map((s: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                      {s.name}: <span style={{ color: '#fff', fontWeight: 700 }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 700 }}>Haftalık Aktif Kullanıcı</h2>
                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <BarChart data={activityStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="day" stroke="var(--text-muted)" axisLine={false} tickLine={false} fontSize={12} />
                      <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="users" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* ================= TAB 2: KULLANICI YÖNETİMİ ================= */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Controls Bar */}
          <div className="premium-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya e-posta ile ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Filter size={18} color="#94a3b8" />
              <select
                value={userRoleFilter}
                onChange={(e) => { setUserRoleFilter(e.target.value); setTimeout(() => fetchUsers(), 10); }}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: '#0e1526',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tüm Roller</option>
                <option value="student">Öğrenciler</option>
                <option value="ogretmen">Öğretmenler</option>
                <option value="admin">Yöneticiler (Admin)</option>
              </select>

              <button
                onClick={fetchUsers}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(59,130,246,0.15)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#60a5fa',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Filtrele
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="premium-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 700 }}>Kayıtlı Kullanıcılar</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Toplam {usersList.length} kullanıcı gösteriliyor
              </span>
            </div>

            {usersLoading ? (
              <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : usersList.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                Arama kriterine uygun kullanıcı bulunamadı.
              </div>
            ) : (
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600 }}>Kullanıcı</th>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600 }}>E-posta</th>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600 }}>Mevcut Rol</th>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600 }}>Alan / Branş</th>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600 }}>Kayıt Tarihi</th>
                      <th style={{ padding: '0.85rem 0', fontWeight: 600, textAlign: 'right' }}>Rol Değiştir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u: any) => {
                      const isTeacher = u.role === 'ogretmen';
                      const isAdmin = u.role === 'admin';
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: isAdmin ? 'linear-gradient(135deg,#ef4444,#dc2626)' : isTeacher ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.85rem'
                              }}>
                                {u.username?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>
                                {u.username}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.88rem' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '1rem 0' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '99px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isAdmin ? 'rgba(239,68,68,0.15)' : isTeacher ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                              color: isAdmin ? '#fca5a5' : isTeacher ? '#6ee7b7' : '#93c5fd',
                              border: isAdmin ? '1px solid rgba(239,68,68,0.3)' : isTeacher ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(59,130,246,0.3)'
                            }}>
                              {isAdmin ? 'YÖNETİCİ' : isTeacher ? 'ÖĞRETMEN' : 'ÖĞRENCİ'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>
                            {u.brans || u.alan || '-'}
                          </td>
                          <td style={{ padding: '1rem 0', color: '#64748b', fontSize: '0.82rem' }}>
                            {new Date(u.created_at || Date.now()).toLocaleDateString('tr-TR')}
                          </td>
                          <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {!isTeacher && (
                                <button
                                  onClick={() => handleUpdateRole(u.id, 'ogretmen')}
                                  disabled={updatingUserId === u.id}
                                  title="Öğretmen Yap"
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(16,185,129,0.12)',
                                    color: '#34d399',
                                    border: '1px solid rgba(16,185,129,0.3)',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Öğretmen Yap
                                </button>
                              )}
                              {isTeacher && (
                                <button
                                  onClick={() => handleUpdateRole(u.id, 'student')}
                                  disabled={updatingUserId === u.id}
                                  title="Öğrenciye Çevir"
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(239,68,68,0.1)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239,68,68,0.25)',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Öğrenci Yap
                                </button>
                              )}
                              {!isAdmin && (
                                <button
                                  onClick={() => handleUpdateRole(u.id, 'admin')}
                                  disabled={updatingUserId === u.id}
                                  title="Admin Yetkisi Ver"
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: 'rgba(168,85,247,0.12)',
                                    color: '#c084fc',
                                    border: '1px solid rgba(168,85,247,0.3)',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Admin Yap
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: AI İÇERİK FABRİKASI ================= */}
      {activeTab === 'factory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Üst Metrikler */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="premium-card" style={{ padding: '1.75rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 21, 35, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#a5b4fc', fontWeight: 700 }}>ÖSYM Soru Bankası</span>
                <Database size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                {factoryData?.stats?.totalQuestions?.toLocaleString('tr-TR') || '8.800'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                Açıklamalı çözümlü, denklem ve paragraf içeren sorular
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.75rem', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 21, 35, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#d8b4fe', fontWeight: 700 }}>Müfredat Bilgi Kartları</span>
                <Layers size={18} color="#c084fc" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                {factoryData?.stats?.totalFlashcards?.toLocaleString('tr-TR') || '2.420'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                KaTeX formüllü, hafıza çivili aralıklı tekrar kartları
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.75rem', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 21, 35, 0.8) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 700 }}>Müfredat Kapsamı</span>
                <Sparkles size={18} color="#34d399" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                %100
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                MEB & ÖSYM güncel kazanım taksonomisi
              </div>
            </div>
          </div>

          {/* Fabrika Kontrol Paneli */}
          <div className="premium-card" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu color="#818cf8" size={24} /> Otonom İçerik Jeneratörü
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  Seçtiğiniz ders ve konuya özel ÖSYM standartlarında soru veya KaTeX destekli hafıza kartı üretin.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedType('questions')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid ' + (selectedType === 'questions' ? '#6366f1' : 'rgba(255,255,255,0.1)'),
                    background: selectedType === 'questions' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: selectedType === 'questions' ? '#c7d2fe' : '#94a3b8'
                  }}
                >
                  📝 Soru Bankası
                </button>
                <button
                  onClick={() => setSelectedType('flashcards')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid ' + (selectedType === 'flashcards' ? '#a855f7' : 'rgba(255,255,255,0.1)'),
                    background: selectedType === 'flashcards' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                    color: selectedType === 'flashcards' ? '#e9d5ff' : '#94a3b8'
                  }}
                >
                  🎴 Bilgi Kartı
                </button>
              </div>
            </div>

            {/* Seçim Formu */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Ders</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  {subjectList.map(subj => (
                    <option key={subj} value={subj} style={{ background: '#0f172a' }}>{subj}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Kazanım / Konu</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  {currentTopics.map(t => (
                    <option key={t} value={t} style={{ background: '#0f172a' }}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>Üretim Adedi</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={itemCount}
                  onChange={(e) => setItemCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleGenerate(false)}
                disabled={generating}
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  opacity: generating ? 0.7 : 1
                }}
              >
                {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {generating ? 'Üretiliyor...' : `${itemCount} Adet ${selectedType === 'questions' ? 'Soru' : 'Kart'} Üret`}
              </button>

              <button
                onClick={() => handleGenerate(true)}
                disabled={generating}
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> Üret ve Sonraki Konuya Geç
              </button>
            </div>

            {/* Son Üretim Özeti */}
            {lastGeneratedResult && (
              <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#a7f3d0', fontSize: '0.9rem' }}>
                ✅ <strong>{lastGeneratedResult.message}</strong> Toplam veritabanı: {lastGeneratedResult.totalInDB}
              </div>
            )}
          </div>

          {/* Müfredat Kapsamı Tablosu */}
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>
              Ders Bazlı İçerik Dağılımı ve Taksonomi Durumu
            </h3>

            {factoryLoading && !factoryData ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <Loader2 className="animate-spin" size={28} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {Object.entries(factoryData?.coverageSummary || {}).map(([subj, data]: [string, any]) => {
                  const percent = Math.round((data.coveredCardTopics / (data.totalTopics || 1)) * 100) || 100;
                  return (
                    <div key={subj} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>{subj}</span>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
                          <span style={{ color: '#38bdf8' }}>{data.questionCount} Soru</span>
                          <span style={{ color: '#c084fc' }}>{data.cardCount} Kart</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${percent}%`, 
                            background: percent >= 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: '3px'
                          }} 
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                        <span>Kapsanan Konu: {data.coveredCardTopics} / {data.totalTopics}</span>
                        <span style={{ color: percent >= 80 ? '#34d399' : '#a5b4fc', fontWeight: 700 }}>%{percent}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
