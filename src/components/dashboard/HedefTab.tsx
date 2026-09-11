"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Award, Sparkles, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function HedefTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [msg, setMsg] = useState('');

  const fetchTarget = async () => {
    try {
      const res = await fetch('/api/user/target');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.targetUniversity && json.targetDepartment) {
          setSelectedTarget(`${json.targetUniversity} - ${json.targetDepartment}`);
        } else if (json.availableTargets && json.availableTargets.length > 0) {
          setSelectedTarget(json.availableTargets[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarget();
  }, []);

  const handleSave = async () => {
    if (!selectedTarget) return;
    setSaving(true);
    setMsg('');
    try {
      const parts = selectedTarget.split(' - ');
      const targetUniversity = parts[0];
      const targetDepartment = parts[1];

      const res = await fetch('/api/user/target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUniversity, targetDepartment })
      });

      if (res.ok) {
        setMsg('Hedefiniz başarıyla güncellendi! Sihirbaz yeniden hesaplandı.');
        fetchTarget();
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem' }}>
        <div style={{ width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { studentNets = {}, targetNets = {}, avgTotalNet = 0 } = data || {};

  // Net analysis: compute deltas
  const netAnalysis = Object.keys(targetNets).map(key => {
    const target = targetNets[key] || 0;
    const actual = studentNets[key] || 0;
    const diff = Number((actual - target).toFixed(1));
    const label = key.replace('tyt_', 'TYT ').replace('ayt_', 'AYT ').replace('ydt_', 'YDT ').toUpperCase();
    return { key, label, target, actual, diff };
  });

  const totalTargetNet = Object.values(targetNets).reduce((acc: any, val: any) => acc + val, 0) as number;
  const targetPct = totalTargetNet > 0 ? Math.min(100, Math.round((avgTotalNet / totalTargetNet) * 100)) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Target selection card */}
      <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Target size={22} color="var(--accent)" /> Hedefim & Net Sihirbazı
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>Hayalindeki üniversiteye ulaşmak için ihtiyacın olan netleri takip et.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select 
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              className="premium-input"
              style={{ width: 'auto', minWidth: '280px' }}
            >
              {data.availableTargets?.map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-interactive"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={16} />
              {saving ? 'Kaydediliyor...' : 'Hedefi Güncelle'}
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: 10, color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} />
            <span>{msg}</span>
          </div>
        )}

        {/* Global Progress Bar */}
        <div style={{ background: 'var(--secondary)', padding: '1.5rem', borderRadius: 14, border: '1px solid var(--border-light)', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Genel Hedef Uyum Oranı</span>
            <span style={{ fontSize: '1.2rem', color: 'var(--accent)', fontWeight: 800 }}>%{targetPct}</span>
          </div>
          <div style={{ height: 10, background: 'var(--border-strong)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${targetPct}%`, background: 'var(--accent)', borderRadius: 5 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            <span>Mevcut Ortalaman: {avgTotalNet} Net</span>
            <span>Gereken Toplam: {totalTargetNet.toFixed(1)} Net</span>
          </div>
        </div>
      </div>

      {/* Net Wizard Split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Side: Subject Net Progress Bars */}
        <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={18} color="#f59e0b" /> Ders Bazlı Net Karşılaştırması
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {netAnalysis.map(item => {
              const maxVal = Math.max(item.target, item.actual, 1);
              const actualPct = (item.actual / maxVal) * 100;
              const targetPctVal = (item.target / maxVal) * 100;

              return (
                <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Mevcut: <strong style={{ color: 'var(--accent)' }}>{item.actual}</strong> / Hedef: <strong style={{ color: '#f59e0b' }}>{item.target}</strong>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 4, position: 'relative' }}>
                    {/* Actual Net Bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${actualPct}%`, background: 'var(--accent)', borderRadius: 4 }} />
                    {/* Target net pointer indicator */}
                    <div style={{ position: 'absolute', top: -3, left: `${targetPctVal}%`, transform: 'translateX(-50%)', width: 14, height: 14, borderRadius: '50%', background: '#f59e0b', border: '2px solid var(--surface)', boxShadow: '0 0 8px #f59e0b', zIndex: 5 }} title={`Hedef: ${item.target}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: AI Assistant Net wizard suggestions */}
        <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={18} color="#a855f7" style={{ fill: '#a855f7' }} /> AI Net Sihirbazı Önerileri
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'center' }}>
            {netAnalysis.some(n => n.diff < 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {netAnalysis.filter(n => n.diff < 0).slice(0, 4).map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '0.85rem 1rem', borderRadius: 10 }}>
                    <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <strong>{item.label}</strong> dersinde hedefin gerisindesin. Hedefe ulaşmak için <strong style={{ color: '#ef4444' }}>+{Math.abs(item.diff)} net</strong> daha eklemelisin.
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={32} color="#10b981" />
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Tebrikler! Hedefe Ulaştın!</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Mevcut net ortalamanız, hedeflediğiniz üniversitenin baraj netlerini tamamen karşılıyor. Bu disiplini korumaya devam edin!
                </div>
              </div>
            )}
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--secondary)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-light)', marginTop: 8 }}>
              💡 <strong>Yapay Zeka Koçunun İpucu:</strong> Net hedeflerine ulaşmak için zayıf olduğun konuları tespit edip (/eksikler sekmesinden) "7 Günlük AI Kampa" katılabilirsin!
            </div>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
