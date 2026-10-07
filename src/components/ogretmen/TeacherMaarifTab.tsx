"use client";

import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  ChevronRight,
  Filter,
  User,
  Check,
  Star,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface TeacherMaarifTabProps {
  classes: any[];
}

export default function TeacherMaarifTab({ classes }: TeacherMaarifTabProps) {
  // Maarif sınıflarını filtrele (9, 10, 11 ile başlayanlar veya curriculum_mode === 'maarif_v1')
  const maarifClasses = classes.filter(
    c => c.curriculum_mode === 'maarif_v1' || /^(9|10|11)/.test(c.class_name)
  );

  const [selectedClassId, setSelectedClassId] = useState<string>(
    maarifClasses[0]?.id || (classes[0]?.id || '')
  );

  // Senaryo Atama Durumları
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Öğrenci Değerlendirmeleri
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [teacherScores, setTeacherScores] = useState<Record<string, number>>({});
  const [teacherFeedbacks, setTeacherFeedbacks] = useState<Record<string, string>>({});
  const [savingEvalId, setSavingEvalId] = useState<string | null>(null);
  const [savedEvalSuccess, setSavedEvalSuccess] = useState<string | null>(null);

  // Senaryoları Çek
  useEffect(() => {
    setScenariosLoading(true);
    fetch('/api/ogretmen/maarif/scenarios')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setScenarios(d.scenarios || []);
          if (d.scenarios?.length > 0) {
            setSelectedScenarioId(d.scenarios[0].id);
          }
        }
      })
      .catch(err => console.error('Scenarios fetch error:', err))
      .finally(() => setScenariosLoading(false));
  }, []);

  // Seçili Sınıfın Değerlendirmelerini Çek
  const fetchEvaluations = (classId: string) => {
    setEvalLoading(true);
    fetch(`/api/ogretmen/maarif/evaluations?classId=${classId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEvaluations(d.evaluations || []);
          // Mevcut öğretmen notlarını initialize et
          const initialScores: Record<string, number> = {};
          const initialFeedbacks: Record<string, string> = {};
          d.evaluations.forEach((ev: any) => {
            if (ev.teacher_score !== null && ev.teacher_score !== undefined) {
              initialScores[ev.id] = ev.teacher_score;
            } else if (ev.ai_score !== null && ev.ai_score !== undefined) {
              initialScores[ev.id] = ev.ai_score;
            }
            if (ev.teacher_feedback) {
              initialFeedbacks[ev.id] = ev.teacher_feedback;
            }
          });
          setTeacherScores(initialScores);
          setTeacherFeedbacks(initialFeedbacks);
        }
      })
      .catch(err => console.error('Evals fetch error:', err))
      .finally(() => setEvalLoading(false));
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchEvaluations(selectedClassId);
    }
  }, [selectedClassId]);

  // Senaryo Ödevi Ata
  const handleAssignScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedScenarioId) return;

    setAssigning(true);
    triggerHaptic('light');

    try {
      const scen = scenarios.find(s => s.id === selectedScenarioId);
      const res = await fetch('/api/ogretmen/maarif/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          scenarioId: selectedScenarioId,
          title: `${scen?.scenario_name || 'MEB Ortak Yazılı'} Provası`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAssignSuccess(data.message);
        triggerHaptic('success');
        setTimeout(() => setAssignSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Öğretmen Notunu Kaydet
  const handleSaveTeacherGrade = async (evaluationId: string) => {
    setSavingEvalId(evaluationId);
    triggerHaptic('light');

    try {
      const score = teacherScores[evaluationId] || 0;
      const feedback = teacherFeedbacks[evaluationId] || '';

      const res = await fetch('/api/ogretmen/maarif/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationId,
          teacherScore: score,
          teacherFeedback: feedback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedEvalSuccess(evaluationId);
        triggerHaptic('success');
        setTimeout(() => setSavedEvalSuccess(null), 3000);
        fetchEvaluations(selectedClassId);
      }
    } catch (err) {
      console.error('Grade save error:', err);
    } finally {
      setSavingEvalId(null);
    }
  };

  // Süreç başarı istatistikleri
  const totalEvals = evaluations.length;
  const tamBasarili = evaluations.filter(e => e.mastery_level === 'Tam Başarılı').length;
  const basarili = evaluations.filter(e => e.mastery_level === 'Başarılı').length;
  const kismen = evaluations.filter(e => e.mastery_level === 'Kısmen Başarılı').length;
  const gelistirilmeli = evaluations.filter(e => e.mastery_level === 'Geliştirilmeli').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── ÜST BİLGİ & SINIF SEÇİCİ ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(139, 92, 246, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            🌱
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Türkiye Yüzyılı Maarif Modeli Yönetim Modülü
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              9, 10 ve 11. sınıflar için MEB Ortak Yazılı Senaryoları & Açık Uçlu Rubrik Değerlendirmesi
            </p>
          </div>
        </div>

        {/* Sınıf Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: '#94a3b8', fontWeight: 600 }}>Aktif Şube:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '13px',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.class_name} ({c.student_count || 0} Öğrenci)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── İSTATİSTİK KARTLARI ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Toplam Yanıt</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginTop: '4px' }}>{totalEvals}</div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>Tam Başarılı (%85+)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{tamBasarili}</div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>Başarılı (%70-%84)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{basarili}</div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>Kısmen Başarılı (%50-%69)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>{kismen}</div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px' }}>
          <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 700 }}>Geliştirilmeli (&lt;%50)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ef4444', marginTop: '4px' }}>{gelistirilmeli}</div>
        </div>
      </div>

      {/* ── MEB SENARYOSU ATAMA SİHİRBAZI ── */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Award size={18} color="#10b981" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            MEB Senaryo Uyumlu Yazılı Provası Ata
          </h3>
        </div>

        <form onSubmit={handleAssignScenario} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              MEB Ortak Yazılı Senaryosu Seç:
            </label>
            <select
              value={selectedScenarioId}
              onChange={e => setSelectedScenarioId(e.target.value)}
              disabled={scenariosLoading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              {scenarios.map(s => (
                <option key={s.id} value={s.id} style={{ backgroundColor: '#0f172a' }}>
                  {s.grade}. Sınıf {s.subject} • {s.term}. Dönem {s.exam_number}. Yazılı ({s.scenario_name}) - {s.total_points || 100}P
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
              Hedef Şube:
            </label>
            <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', fontSize: '13px', fontWeight: 700 }}>
              {classes.find(c => c.id === selectedClassId)?.class_name || 'Seçili Sınıf'}
            </div>
          </div>

          <button
            type="submit"
            disabled={assigning || !selectedScenarioId}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              fontSize: '13px',
              cursor: assigning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            }}
          >
            {assigning ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{assigning ? 'Atanıyor...' : 'Sınıfa Sınav Ata'}</span>
          </button>
        </form>

        {assignSuccess && (
          <div style={{ marginTop: '1rem', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '12.5px', fontWeight: 600 }}>
            ✅ {assignSuccess}
          </div>
        )}
      </div>

      {/* ── ÖĞRENCİ AÇIK UÇLU YANITLARI & ÖĞRETMEN RUBRİK NOTLANDIRMASI ── */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Öğrenci Açık Uçlu Yanıtları ve Rubrik Değerlendirme Masası
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>
              Yapay zeka (AstraTutor) ön puanını inceleyip nihai öğretmen notunu ve dönütünü kaydedebilirsiniz.
            </p>
          </div>

          <button
            onClick={() => fetchEvaluations(selectedClassId)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Yenile
          </button>
        </div>

        {evalLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#10b981" />
            <div>Öğrenci sınav yanıtları yükleniyor...</div>
          </div>
        ) : evaluations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Bu şube için henüz tamamlanmış açık uçlu sınav yanıtı bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {evaluations.map(ev => {
              const isSaving = savingEvalId === ev.id;
              const isSaved = savedEvalSuccess === ev.id;

              return (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                  }}
                >
                  {/* Öğrenci & Soru Başlığı */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '13.5px' }}>
                        👤 {ev.student_username} ({ev.student_grade}. Sınıf)
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '6px' }}>
                        {ev.subject} • {ev.curriculum_node_code}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(139, 92, 246, 0.15)',
                          color: '#c084fc',
                        }}
                      >
                        🤖 AI Puanı: {ev.ai_score ?? 0} / {ev.max_score || 10}P ({ev.mastery_level})
                      </span>

                      {ev.teacher_score !== null && ev.teacher_score !== undefined && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            color: '#34d399',
                          }}
                        >
                          👨‍🏫 Onaylı Not: {ev.teacher_score}P
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Soru Metni */}
                  <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px', lineHeight: 1.5 }}>
                    <strong>Soru:</strong> {ev.question_text}
                  </p>

                  {/* Öğrencinin Yazdığı Cevap */}
                  <div style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)', padding: '10px 12px', borderRadius: '10px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                      ✍️ Öğrencinin Yanıtı:
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#fff', fontStyle: ev.student_answer_text ? 'normal' : 'italic' }}>
                      {ev.student_answer_text || 'Yanıt girilmedi.'}
                    </div>
                  </div>

                  {/* AI Pedagojik Dönütü */}
                  {ev.ai_feedback && (
                    <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '8px 12px', borderRadius: '10px', marginBottom: '12px', fontSize: '12px', color: '#c4b5fd' }}>
                      🤖 <strong>AstraTutor AI Ön Değerlendirmesi:</strong> {ev.ai_feedback}
                    </div>
                  )}

                  {/* Öğretmen Not Giriş Çubuğu */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '10px',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
                        Öğretmen Notu (0-{ev.max_score || 10}):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={ev.max_score || 10}
                        value={teacherScores[ev.id] ?? ''}
                        onChange={e => setTeacherScores({ ...teacherScores, [ev.id]: Number(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
                        Öğretmen Geri Bildirim Notu:
                      </label>
                      <input
                        type="text"
                        placeholder="Öğrenciye pedagojik dönüt ve yönerge yazın..."
                        value={teacherFeedbacks[ev.id] ?? ''}
                        onChange={e => setTeacherFeedbacks({ ...teacherFeedbacks, [ev.id]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '12.5px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveTeacherGrade(ev.id)}
                      disabled={isSaving}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        backgroundColor: isSaved ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: isSaved ? '#fff' : '#6ee7b7',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                        height: '35px',
                        alignSelf: 'end',
                      }}
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : isSaved ? <Check size={14} /> : <CheckCircle size={14} />}
                      <span>{isSaving ? 'Kaydediliyor...' : isSaved ? 'Kaydedildi' : 'Notu Onayla'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
