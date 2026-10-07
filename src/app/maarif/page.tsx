"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { triggerHaptic } from '@/lib/haptics';
import {
  Sparkles,
  BookOpen,
  Calendar,
  GraduationCap,
  Clock,
  Award,
  FileText,
  Atom,
  Layers,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { MaarifCurriculumNode, MaarifExamScenario, MaarifSubject, MaarifGrade } from '@/types/maarif';

const SUBJECT_LIST: { id: MaarifSubject; name: string; emoji: string; color: string }[] = [
  { id: 'Matematik', name: 'Matematik', emoji: '📐', color: '#3b82f6' },
  { id: 'Fizik', name: 'Fizik', emoji: '⚡', color: '#8b5cf6' },
  { id: 'Kimya', name: 'Kimya', emoji: '🧪', color: '#10b981' },
  { id: 'Biyoloji', name: 'Biyoloji', emoji: '🧬', color: '#ec4899' },
  { id: 'Türk Dili ve Edebiyatı', name: 'Edebiyat', emoji: '📖', color: '#f59e0b' },
  { id: 'Tarih', name: 'Tarih', emoji: '📜', color: '#d97706' },
  { id: 'Coğrafya', name: 'Coğrafya', emoji: '🌍', color: '#06b6d4' },
];

export default function MaarifPortalPage() {
  const { user } = useAuth();

  // Aktif Sınıf: Kullanıcının sınıfı (9, 10, 11) veya varsayılan 9
  const initialGrade: MaarifGrade =
    user?.sinif === '10' ? 10 : user?.sinif === '11' ? 11 : 9;

  const [selectedGrade, setSelectedGrade] = useState<MaarifGrade>(initialGrade);
  const [selectedSubject, setSelectedSubject] = useState<MaarifSubject>('Matematik');
  const [activeTab, setActiveTab] = useState<'dersler' | 'senaryolar' | 'deneyler' | 'mentor'>('dersler');

  // Veri State'leri
  const [nodes, setNodes] = useState<MaarifCurriculumNode[]>([]);
  const [themes, setThemes] = useState<{ name: string; subject: string; nodes: MaarifCurriculumNode[] }[]>([]);
  const [scenarios, setScenarios] = useState<MaarifExamScenario[]>([]);
  const [loading, setLoading] = useState(true);

  // Geri Sayım Hesaplayıcı (MEB 1. Dönem 1. Ortak Yazılı Sınavları: Örn: 3 Kasım)
  const [daysLeft, setDaysLeft] = useState<number>(24);

  useEffect(() => {
    // Sınav hedef tarihi: 3 Kasım 2026 (veya dinamik)
    const targetDate = new Date('2026-11-03T09:00:00');
    const now = new Date();
    const diff = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setDaysLeft(diff > 0 ? diff : 24);
  }, []);

  // Müfredat ve Senaryo verilerini çek
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/maarif/curriculum?grade=${selectedGrade}&subject=${encodeURIComponent(selectedSubject)}`)
        .then(r => r.json())
        .catch(() => ({ success: false })),
      fetch(`/api/maarif/scenarios?grade=${selectedGrade}&subject=${encodeURIComponent(selectedSubject)}`)
        .then(r => r.json())
        .catch(() => ({ success: false }))
    ]).then(([currData, scenData]) => {
      if (!isMounted) return;

      if (currData?.success) {
        setNodes(currData.nodes || []);
        setThemes(currData.themes || []);
      }
      if (scenData?.success) {
        setScenarios(scenData.scenarios || []);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: MaarifGrade) => {
    triggerHaptic('light');
    setSelectedGrade(grade);
  };

  const handleSubjectChange = (subject: MaarifSubject) => {
    triggerHaptic('light');
    setSelectedSubject(subject);
  };

  return (
    <div
      className="maarif-page-wrap"
      style={{
        minHeight: '100vh',
        backgroundColor: '#070a13',
        color: '#f8fafc',
        padding: '1.5rem 1rem calc(95px + env(safe-area-inset-bottom, 20px))',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* ── ÜST BAŞLIK & MAARİF ROZETİ ── */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            🌱 TÜRKİYE YÜZYILI MAARİF MODELİ
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            ✨ MEB 2024-2025+ Müfredatı
          </span>

          {user?.curriculum_mode === 'legacy_yks' && (
            <Link
              href="/dashboard"
              style={{
                marginLeft: 'auto',
                fontSize: '12px',
                color: '#94a3b8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>12. Sınıf / YKS Paneline Dön</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
                fontWeight: 900,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Lise Maarif Öğrenme Portalı
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: '6px 0 0', maxWidth: '650px', lineHeight: 1.5 }}>
              9, 10 ve 11. sınıflar için özel kurgulanmış beceri temelli öğrenme çıktıları, PhET laboratuvar deneyleri ve resmi MEB Ortak Yazılı Sınav simülasyonları.
            </p>
          </div>

          {/* Sınıf Seçici Butonları */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {([9, 10, 11] as MaarifGrade[]).map(grade => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => handleGradeChange(grade)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isSelected ? '#10b981' : 'transparent',
                    color: isSelected ? '#fff' : '#94a3b8',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {grade}. Sınıf
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MEB ORTAK YAZILI GERİ SAYIM KARTI ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
            }}
          >
            📝
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', letterSpacing: '0.05em' }}>
              MEB RESMİ SINAV TAKVİMİ
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              1. Dönem 1. Ortak Yazılı Sınavları
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
              İl/İlçe ve okul geneli açık uçlu senaryo sınavlarına hazırlık provaları aktif.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(7, 10, 19, 0.65)',
              padding: '8px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>{daysLeft}</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>GÜN KALDI</div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              setActiveTab('senaryolar');
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: '#10b981',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <span>Senaryoları İncele</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ── SEKMELER (DERSLER, SENARYOLAR, DENEYLER, MENTOR) ── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {[
          { key: 'dersler', label: 'Dersler & Temalar', icon: BookOpen },
          { key: 'senaryolar', label: 'MEB Yazılı Senaryoları', icon: FileText },
          { key: 'deneyler', label: 'PhET Deneyleri', icon: Atom },
          { key: 'mentor', label: 'AstraTutor Maarif Mentoru', icon: Sparkles },
        ].map(tab => {
          const isSelected = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.key as any);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: isSelected ? '#34d399' : '#94a3b8',
                fontWeight: isSelected ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── DERS SEÇİCİ ŞERİDİ (Dersler veya Senaryolar sekmesindeyse) ── */}
      {(activeTab === 'dersler' || activeTab === 'senaryolar') && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '1.75rem',
            overflowX: 'auto',
            paddingBottom: '6px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {SUBJECT_LIST.map(sub => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  border: isSelected ? `1px solid ${sub.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected ? `${sub.color}22` : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? '#fff' : '#94a3b8',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
              >
                <span>{sub.emoji}</span>
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── İÇERİK ALANI ── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌱</div>
            <div style={{ fontWeight: 600 }}>Maarif müfredat verileri yükleniyor...</div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab + selectedGrade + selectedSubject}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. SEKME: DERSLER & TEMALAR */}
            {activeTab === 'dersler' && (
              <div>
                {themes.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Bu ders için henüz tema bulunamadı.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {themes.map((theme, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '18px',
                          padding: '1.25rem 1.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '18px' }}>📂</span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                            {theme.name}
                          </h3>
                          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>
                            {theme.nodes.length} Öğrenme Çıktısı
                          </span>
                        </div>

                        {/* Çıktı Kartları Izgarası */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                          {theme.nodes.map(node => (
                            <div
                              key={node.code}
                              style={{
                                backgroundColor: 'rgba(7, 10, 19, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.07)',
                                borderRadius: '14px',
                                padding: '1.1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <span
                                    style={{
                                      fontFamily: 'monospace',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: '#38bdf8',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                                    }}
                                  >
                                    {node.code}
                                  </span>

                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: 700,
                                      color: '#a78bfa',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(167, 139, 250, 0.12)',
                                    }}
                                  >
                                    {node.skill_domain}
                                  </span>
                                </div>

                                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                                  {node.outcome_title}
                                </h4>

                                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                                  {node.outcome_description}
                                </p>
                              </div>

                              <div style={{ marginTop: '1rem', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {node.has_phet_sim && node.related_sim_slug && (
                                  <Link
                                    href={`/simulasyonlar/${node.related_sim_slug}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                      border: '1px solid rgba(16, 185, 129, 0.35)',
                                      color: '#6ee7b7',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <Atom size={13} />
                                    <span>Laboratuvarda İncele</span>
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. SEKME: MEB YAZILI SENARYOLARI */}
            {activeTab === 'senaryolar' && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {selectedGrade}. Sınıf {selectedSubject} Resmi MEB Yazılı Sınav Senaryoları
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '4px 0 0' }}>
                    MEB Ölçme ve Değerlendirme Genel Müdürlüğü tarafından yayımlanan konu-soru dağılım tabloları esas alınmıştır.
                  </p>
                </div>

                {scenarios.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Bu ders için tanımlı senaryo bulunamadı.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                    {scenarios.map(scen => (
                      <div
                        key={scen.id}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '18px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#10b981',
                                padding: '3px 9px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              }}
                            >
                              {scen.term}. Dönem {scen.exam_number}. Yazılı
                            </span>

                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>
                              ⭐ {scen.total_points} Tam Puan
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                            {scen.scenario_name}
                          </h4>

                          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 1rem' }}>
                            {scen.description}
                          </p>

                          {/* Soru Dağılım Matrisi */}
                          <div style={{ backgroundColor: 'rgba(7, 10, 19, 0.6)', borderRadius: '12px', padding: '10px 12px', marginBottom: '1.25rem' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                              📊 Konu Soru Dağılımı:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {(scen.question_distribution || []).map((dist: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8' }}>
                                  <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{dist.node_code}</span>
                                  <span>{dist.count} Açık Uçlu Soru</span>
                                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{dist.points} P</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/maarif/sinav/${scen.id}`}
                          onClick={() => triggerHaptic('success')}
                          style={{
                            width: '100%',
                            padding: '11px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Sınav Provasını Başlat</span>
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. SEKME: PhET DENEYLERİ */}
            {activeTab === 'deneyler' && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Maarif Modeli Etkileşimli Deney ve Simülasyon Kataloğu
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '4px 0 0' }}>
                    Formülleri ezberlemek yerine interaktif parametreleri değiştirerek öğrenme çıktılarını keşfedin.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {nodes
                    .filter(n => n.has_phet_sim && n.related_sim_slug)
                    .map(node => (
                      <div
                        key={node.code}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399' }}>
                              🔬 {node.subject}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#38bdf8' }}>
                              {node.code}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                            {node.outcome_title}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                            {node.outcome_description}
                          </p>
                        </div>

                        <Link
                          href={`/simulasyonlar/${node.related_sim_slug}`}
                          style={{
                            marginTop: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '9px 14px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#6ee7b7',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          <Atom size={15} />
                          <span>Deneyi Aç ve Keşfet</span>
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. SEKME: ASTRATUTOR MAARİF MENTORU */}
            {activeTab === 'mentor' && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '20px',
                  padding: '2rem',
                  maxWidth: '750px',
                  margin: '0 auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      AstraTutor Maarif Mentoru
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      Sokratik rehberlik ile ezbersiz akıl yürütme ortağın
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                    fontSize: '13px',
                    color: '#c4b5fd',
                    lineHeight: 1.6,
                  }}
                >
                  <p style={{ margin: '0 0 8px' }}>
                    💡 <strong>Maarif Modeli İlkesi:</strong> Cevabı doğrudan söylemek yerine seni adım adım düşündürüyorum. MEB açık uçlu sorularında tam puan (10/10) alabilmen için hangi adımları yazman gerektiğini keşfedelim!
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
                    Örnek Keşif Başlıkları:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      '9. Sınıf Matematik: Doğrusal değişimde oransal akıl yürütme problem senaryosu ver.',
                      'Fizik: Sürtünme kuvveti deneyinde statik ve kinetik katsayıyı nasıl ayırt ederim?',
                      'Edebiyat: Olay hikâyesinde hâkim bakış açısını metin üzerinde nasıl tespit ederim?',
                    ].map((prompt, idx) => (
                      <Link
                        key={idx}
                        href={`/dashboard?tab=astratutor&maarifPrompt=${encodeURIComponent(prompt)}`}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          color: '#e2e8f0',
                          fontSize: '12.5px',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{prompt}</span>
                        <ChevronRight size={14} color="#a78bfa" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
