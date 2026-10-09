"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, BookOpen, Activity, CheckCircle, XCircle, 
  MoreVertical, LayoutDashboard, Loader2, Cpu, Sparkles, 
  Database, RefreshCw, Send, Check, AlertCircle, Layers
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/context/ToastContext';
import { triggerHaptic } from '@/lib/haptics';
import { YKS_CURRICULUM_TAXONOMY } from '@/lib/content-factory';

const mockTeachers = [
  { id: 1, name: 'Ahmet Yılmaz', subject: 'Matematik', school: 'Atatürk Anadolu Lisesi', date: '21 Haziran 2026', status: 'pending' },
  { id: 2, name: 'Elif Kaya', subject: 'Fizik', school: 'Bireysel', date: '20 Haziran 2026', status: 'pending' },
  { id: 3, name: 'Can Demir', subject: 'Kimya', school: 'Özel Kariyer Koleji', date: '19 Haziran 2026', status: 'approved' },
];

const mockStats = [
  { name: 'Sayısal', value: 4500 },
  { name: 'Eşit Ağırlık', value: 3200 },
  { name: 'Sözel', value: 1500 },
  { name: 'Dil', value: 800 },
];
const COLORS = ['#38bdf8', '#8b5cf6', '#ec4899', '#10b981'];

const mockActivity = [
  { day: 'Pzt', users: 4000 },
  { day: 'Sal', users: 4500 },
  { day: 'Çar', users: 4800 },
  { day: 'Per', users: 5100 },
  { day: 'Cum', users: 4900 },
  { day: 'Cmt', users: 7000 },
  { day: 'Paz', users: 8500 },
];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'genel' | 'factory'>('genel');
  const [teachers, setTeachers] = useState(mockTeachers);

  // Content Factory State
  const [factoryData, setFactoryData] = useState<any>(null);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [selectedType, setSelectedType] = useState<'flashcards' | 'questions'>('questions');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematik');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [itemCount, setItemCount] = useState<number>(5);
  const [lastGeneratedResult, setLastGeneratedResult] = useState<any>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.replace(user?.role === 'ogretmen' ? '/ogretmen/dashboard' : '/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (activeTab === 'factory') {
      fetchFactoryStats();
    }
  }, [activeTab]);

  useEffect(() => {
    const topics = YKS_CURRICULUM_TAXONOMY[selectedSubject]?.topics || [];
    if (topics.length > 0) {
      setSelectedTopic(topics[0]);
    }
  }, [selectedSubject]);

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

  const handleApprove = (id: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
    toast.success('Öğretmen onaylandı.');
  };

  const handleReject = (id: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
    toast.warning('Öğretmen başvurusu reddedildi.');
  };

  const subjectList = Object.keys(YKS_CURRICULUM_TAXONOMY);
  const currentTopics = YKS_CURRICULUM_TAXONOMY[selectedSubject]?.topics || [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 900 }}>Admin & İçerik Yönetim Merkezi</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Platform operasyonları, onaylar ve otonom AI içerik üretim fabrikası.</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              transition: 'all 0.2s'
            }}
          >
            Genel Bakış
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

      {activeTab === 'genel' ? (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', color: '#38bdf8' }}><Users size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>10,000+</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Aktif Öğrenci</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', color: '#a855f7' }}><BookOpen size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>8,800 Soru</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ÖSYM Soru Bankası</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><Layers size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>2,420 Kart</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Müfredat Bilgi Kartı</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><Activity size={24} /></div>
              <div>
                <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>189 Üni</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>11.772 YÖK Atlas Bölümü</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            
            {/* Teachers Table */}
            <div className="premium-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Öğretmen Onay Bekleme Listesi</h2>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>İsim</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Branş</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Kurum</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Kayıt Tarihi</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600 }}>Durum</th>
                      <th style={{ padding: '1rem 0', fontWeight: 600, textAlign: 'right' }}>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem 0', color: '#fff', fontWeight: 500 }}>{t.name}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{t.subject}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{t.school}</td>
                        <td style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>{t.date}</td>
                        <td style={{ padding: '1rem 0' }}>
                          {t.status === 'pending' && <span style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Bekliyor</span>}
                          {t.status === 'approved' && <span style={{ padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Onaylandı</span>}
                          {t.status === 'rejected' && <span style={{ padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Reddedildi</span>}
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                          {t.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleApprove(t.id)} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><CheckCircle size={16} /></button>
                              <button onClick={() => handleReject(t.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><XCircle size={16} /></button>
                            </div>
                          ) : (
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                          )}
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
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Öğrenci Alan Dağılımı</h2>
                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <PieChart>
                      <Pie data={mockStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {mockStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  {mockStats.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i] }} />
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-card" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Haftalık Aktif Kullanıcı</h2>
                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <BarChart data={mockActivity}>
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
      ) : (
        /* ================= TAB 2: AI İÇERİK FABRİKASI ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Üst Metrikler */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
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
                <span style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 700 }}>YÖK Atlas Tercih Robotu</span>
                <CheckCircle size={18} color="#34d399" />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                11.772
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                189 Üniversite genelinde 5 puan türünde tam veritabanı
              </div>
            </div>
          </div>

          {/* Üretim Kontrol Paneli */}
          <div className="premium-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: '#fff', margin: '0 0 4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={22} color="#c084fc" /> Otonom İçerik Üretim İstasyonu
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Gemini 2.0 Flash pedagojik motoru ile doğrudan veritabanına yeni soru veya bilgi kartı basar.
                </p>
              </div>

              <button 
                onClick={() => handleGenerate(true)}
                disabled={generating}
                className="active:scale-[0.98]"
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                }}
              >
                {generating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                <span>🤖 Otonom Eksik Konuyu Bul & Üret</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  İçerik Türü
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value as any)}
                  className="premium-input"
                  style={{ width: '100%', background: '#131b2e', color: '#fff', borderRadius: '10px', padding: '0.65rem' }}
                >
                  <option value="questions">📝 ÖSYM Soru Bankası</option>
                  <option value="flashcards">📚 Müfredat Bilgi Kartı</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Ders / Branş
                </label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%', background: '#131b2e', color: '#fff', borderRadius: '10px', padding: '0.65rem' }}
                >
                  {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Müfredat Konusu
                </label>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%', background: '#131b2e', color: '#fff', borderRadius: '10px', padding: '0.65rem' }}
                >
                  {currentTopics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                  Üretilecek Adet
                </label>
                <select
                  value={itemCount}
                  onChange={e => setItemCount(Number(e.target.value))}
                  className="premium-input"
                  style={{ width: '100%', background: '#131b2e', color: '#fff', borderRadius: '10px', padding: '0.65rem' }}
                >
                  <option value={3}>3 Adet (Hızlı Test)</option>
                  <option value={5}>5 Adet (Standart)</option>
                  <option value={10}>10 Adet (Paket)</option>
                  <option value={20}>20 Adet (Toplu Üretim)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="active:scale-[0.98]"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.45)'
              }}
            >
              {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              <span>{generating ? 'Yapay Zeka İçeriği Üretiyor & Doğruluyor...' : `⚡ Seçili Konudan ${itemCount} Adet ${selectedType === 'questions' ? 'ÖSYM Sorusu' : 'Bilgi Kartı'} Üret`}</span>
            </button>
          </div>

          {/* Son Üretilen Canlı Önizleme */}
          {lastGeneratedResult && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="premium-card" 
              style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.05)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 800, marginBottom: '1rem' }}>
                <CheckCircle size={20} />
                <span>Başarıyla Üretildi: {lastGeneratedResult.savedCount} Adet ({lastGeneratedResult.subject} - {lastGeneratedResult.topic})</span>
              </div>

              {lastGeneratedResult.sample && lastGeneratedResult.sample.length > 0 && (
                <div style={{ background: '#0a0e1a', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                    Canlı Üretim Örneği
                  </div>
                  {lastGeneratedResult.type === 'questions' ? (
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '10px' }}>
                        {lastGeneratedResult.sample[0].text}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '10px' }}>
                        {['A', 'B', 'C', 'D', 'E'].map(opt => (
                          <div key={opt} style={{ padding: '6px 8px', borderRadius: '6px', background: opt === lastGeneratedResult.sample[0].correctOption ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)', border: opt === lastGeneratedResult.sample[0].correctOption ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', color: opt === lastGeneratedResult.sample[0].correctOption ? '#34d399' : '#cbd5e1', fontSize: '0.8rem', textAlign: 'center' }}>
                            <strong>{opt}:</strong> {lastGeneratedResult.sample[0].options?.[opt]}
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(99,102,241,0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <strong>Çözüm:</strong> {lastGeneratedResult.sample[0].explanation}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                        ❓ {lastGeneratedResult.sample[0].front_text}
                      </div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '6px' }}>
                        💡 {lastGeneratedResult.sample[0].back_text}
                      </div>
                      {lastGeneratedResult.sample[0].tip && (
                        <div style={{ fontSize: '0.75rem', color: '#facc15' }}>
                          ⚡ {lastGeneratedResult.sample[0].tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Konu Bazlı Kapsam İlerleme Çubukları */}
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '1.25rem' }}>
              Müfredat Kapsam & Doluluk Matrisi
            </h3>

            {factoryLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 className="animate-spin" size={28} color="#8b5cf6" />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                {subjectList.map(subj => {
                  const data = factoryData?.taxonomySummary?.[subj] || { totalTopics: 20, coveredCardTopics: 15, cardCount: 200, questionCount: 880 };
                  const percent = Math.min(100, Math.round((data.coveredCardTopics / data.totalTopics) * 100));

                  return (
                    <div key={subj} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{subj}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {data.cardCount} Kart • {data.questionCount} Soru
                        </span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
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
