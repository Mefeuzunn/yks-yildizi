"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BookOpen, Activity, CheckCircle, XCircle, MoreVertical, LayoutDashboard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
  const [teachers, setTeachers] = useState(mockTeachers);

  const handleApprove = (id: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };

  const handleReject = (id: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Admin Paneli</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Platform genel durumu ve yönetim merkezi.</p>
          </div>
        </div>
      </div>

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
            <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>1.2M</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Çözülen Soru</div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}><LayoutDashboard size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>450</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kayıtlı Öğretmen</div>
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}><Activity size={24} /></div>
          <div>
            <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 700 }}>120ms</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>AI Yanıt Süresi</div>
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
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
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
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
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

    </div>
  );
}
