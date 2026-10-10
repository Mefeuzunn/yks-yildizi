"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Activity, BookOpen, Target, ShieldCheck, ChevronRight, CheckCircle2, TrendingUp, Lock, Share2, Heart, Coffee, Rocket, Star, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function VeliDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [parentCode, setParentCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');
  
  const [studentData, setStudentData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [subjectFocus, setSubjectFocus] = useState<any[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [aiLetter, setAiLetter] = useState<string>('');
  const [whatsappActive, setWhatsappActive] = useState(false);
  const [smsActive, setSmsActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cheerLoading, setCheerLoading] = useState(false);
  const [cheerNote, setCheerNote] = useState('');
  const [selectedCheerType, setSelectedCheerType] = useState<'coffee' | 'rocket' | 'heart' | 'star'>('coffee');

  // URL'den kod var mı kontrol et (Örn: /veli?code=YKS-1A2B)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code');
    if (codeFromUrl) {
      handleLogin(codeFromUrl);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (codeToUse: string) => {
    if (!codeToUse) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/parent/student?code=${encodeURIComponent(codeToUse)}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStudentData(data);
        setTimeline(data.timeline || []);
        setSubjectFocus(data.subjectFocus || []);
        setMistakes(data.mistakeSummary || []);
        setParentCode(codeToUse);
        
        // Fetch AI Weekly Report
        try {
          const letterRes = await fetch(`/api/veli/ai-report?code=${encodeURIComponent(codeToUse)}`);
          const letterData = await letterRes.json();
          if (letterData.letter) setAiLetter(letterData.letter);
        } catch (e) {
          console.error('Failed to load AI Letter:', e);
        }
        
        // URL'i güncelle (kullanıcı sayfayı yenilerse kod kalsın)
        window.history.pushState({}, '', `/veli?code=${encodeURIComponent(codeToUse)}`);
      } else {
        setError(data.error || 'Geçersiz bağlantı kodu.');
        setParentCode('');
      }
    } catch (err) {
      setError('Bağlantı sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setStudentData(null);
    setParentCode('');
    setInputCode('');
    window.history.pushState({}, '', `/veli`);
  };

  const handleWhatsAppShare = () => {
    const student = studentData?.student;
    const username = student?.username || 'Öğrenci';
    const alan = student?.alan || 'YKS';
    const sinif = student?.sinif || '12';
    const solved = student?.stats?.solved_questions || 0;
    const streak = student?.stats?.streak_days || 0;
    const lastExamData = studentData?.exams?.length > 0 ? studentData.exams[studentData.exams.length - 1] : null;
    const lastNet = lastExamData ? `${lastExamData.type}: ${lastExamData.totalNet} Net (${lastExamData.name})` : 'Henüz girilmedi';
    
    const totalFocusMin = (subjectFocus || []).reduce((acc: number, item: any) => acc + (Number(item.total_min) || 0), 0);
    const focusHours = Math.floor(totalFocusMin / 60);
    const focusMins = totalFocusMin % 60;

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const reportText = `📊 *YKS YILDIZI - HAFTALIK ÖĞRENCİ GELİŞİM RAPORU*\n\n` +
      `👤 *Öğrenci:* ${username} (${alan} - ${sinif}. Sınıf)\n` +
      `🔥 *Çalışma Serisi:* ${streak} Gün Kesintisiz\n` +
      `⏱️ *Haftalık Odaklanma:* ${focusHours} Saat ${focusMins} Dakika\n` +
      `📝 *Çözülen Soru:* ${solved} Soru\n` +
      `🎯 *Son Deneme Neti:* ${lastNet}\n\n` +
      (aiLetter ? `🤖 *Yapay Zeka Danışman Notu:*\n"${aiLetter.slice(0, 280)}..."\n\n` : '') +
      `🔗 *Canlı Veli Takip Paneli:*\n${currentUrl}\n\n` +
      `_YKS Yıldızı Akıllı Veli Portalı_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank');
  };

  const handleSendCheer = async (typeToUse?: 'coffee' | 'rocket' | 'heart' | 'star') => {
    const cheerType = typeToUse || selectedCheerType;
    if (!parentCode || cheerLoading) return;
    setCheerLoading(true);
    try {
      const res = await fetch('/api/parent/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: parentCode,
          cheerType,
          note: cheerNote
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage('🎉 Moral desteğiniz başarıyla öğrencinizin bildirim kutusuna ulaştı!');
        setCheerNote('');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage(data.error || 'Mesaj iletilemedi.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      setToastMessage('Bağlantı hatası oluştu.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setCheerLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin"><Activity size={48} color="#10b981" /></div>
        <style jsx>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
      </div>
    );
  }

  // --- LOGIN EKRANI ---
  if (!studentData) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: '#0f1523', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}
        >
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)' }}>
            <ShieldCheck size={32} color="#34d399" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Veli Girişi</h1>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem' }}>Öğrencinizin profilindeki bağlantı kodunu girerek gelişimini takip edin.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(inputCode); }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>Bağlantı Kodu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder="Örn: 8A4F10BC" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  style={{ paddingLeft: '2.75rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem' }}
                  required
                />
              </div>
              {error && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 600 }}>{error}</div>}
            </div>
            
            <button
              type="submit"
              className="btn-interactive active:scale-[0.98]"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              Bağlan ve Görüntüle
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD EKRANI ---
  
  // Sınav verilerini grafiğe uygun formata getir
  const chartData = studentData.exams.map((e: any) => ({
    name: e.date,
    score: e.totalNet
  }));

  const lastExam = studentData.exams.length > 0 ? studentData.exams[studentData.exams.length - 1] : null;

  return (
    <div className="veli-page-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* Header */}
      <div className="veli-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            <ShieldCheck size={32} color="#34d399" /> Veli Takip Paneli
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0' }}>Öğrencinizin gelişimini şeffaf bir şekilde izliyorsunuz.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleWhatsAppShare}
            className="active:scale-[0.98]"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Share2 size={16} /> WhatsApp Raporu
          </button>
          <button 
            onClick={() => window.print()}
            className="active:scale-[0.98]"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <FileText size={16} /> PDF İndir
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(15, 21, 35, 0.85)', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}>
              {studentData.student.username.substring(0, 2)}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{studentData.student.username}</div>
              <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>{studentData.student.alan} - {studentData.student.sinif}. Sınıf</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary active:scale-[0.98]"
            style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Çıkış
          </button>
        </div>
      </div>

      <div className="veli-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Son Deneme Neti</span>
            <Target color="#ec4899" size={20} />
          </div>
          <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{lastExam ? lastExam.totalNet : '-'}</div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {lastExam ? `${lastExam.type} Denemesi (${lastExam.name})` : 'Henüz deneme çözülmedi'}
          </div>
        </div>

        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.75rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Çözülen Soru</span>
            <BookOpen color="#fbbf24" size={20} />
          </div>
          <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {studentData.student.stats?.solved_questions || 0}
          </div>
          <div style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <TrendingUp size={15} /> Gelişim devam ediyor
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Chart */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 800 }}>Deneme Net Gelişimi</h2>
          <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ background: '#0f1523', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                Henüz yeterli deneme verisi bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* 360 Derece Görünürlük (Faz 1) - Timeline ve Zayıf Konular */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          <div
            className="premium-card"
            style={{
              backgroundColor: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
              <Activity size={20} color="#38bdf8" /> Son 7 Gün - Ders Odaklanma Dağılımı
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subjectFocus.length > 0 ? subjectFocus.map((sf: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.85rem 1rem', borderRadius: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{sf.subject}</span>
                  <span style={{ color: '#38bdf8', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{Math.floor(sf.total_min / 60)}s {sf.total_min % 60}dk</span>
                </div>
              )) : (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Son 7 günde kaydedilmiş odaklanma yok.</div>
              )}
            </div>
          </div>

          <div
            className="premium-card"
            style={{
              backgroundColor: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
              <BookOpen size={20} color="#f87171" /> Gelişim Bekleyen Dersler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mistakes.length > 0 ? mistakes.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.1)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{m.subject}</span>
                  <span style={{ color: '#f87171', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{m.mistake_count} Hata</span>
                </div>
              )) : (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Öğrencinin hata defterinde kayıt yok. Harika!</div>
              )}
            </div>
          </div>
          
        </div>

        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            marginTop: '0.5rem'
          }}
        >
          <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
            <TrendingUp size={20} color="#c084fc" /> Günlük Çalışma Akışı (Timeline)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto' }}>
            {timeline.length > 0 ? timeline.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: `4px solid ${item.mode === 'pomodoro' ? '#8b5cf6' : '#38bdf8'}`, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', width: '60px', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {new Date(item.started_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                    {item.mode === 'pomodoro' ? (item.subject ? `${item.subject} Çalıştı` : 'Serbest Çalışma') : (item.mode === 'shortBreak' ? 'Kısa Ara Verdi' : 'Uzun Ara Verdi')}
                  </div>
                  {item.topic && <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '2px' }}>{item.topic}</div>}
                </div>
                <div style={{ marginLeft: 'auto', color: item.mode === 'pomodoro' ? '#c084fc' : '#38bdf8', fontWeight: 800, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>
                  {item.duration_min} dk
                </div>
              </div>
            )) : (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Bugün kaydedilmiş çalışma yok.</div>
            )}
          </div>
        </div>

        {/* Veli Bildirim Sistemi ve AI Mektubu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
          
          {/* AI Veli Raporu */}
          <div
            className="premium-card"
            style={{
              backgroundColor: 'rgba(15, 21, 35, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800 }}>
              <TrendingUp size={20} color="#34d399" /> AI Haftalık Veli Mektubu
            </h2>
            {aiLetter ? (
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line', flex: 1, textAlign: 'left' }}>
                {aiLetter}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                Yapay zeka haftalık durum raporu oluşturuluyor...
              </div>
            )}
            {aiLetter && (
              <button
                onClick={() => {
                  const studentName = studentData?.student?.username || 'Öğrenci';
                  const studentAlan = studentData?.student?.alan || 'YKS';
                  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                  const msg = `*YKS Yıldızı - Veli Bilgilendirme Raporu*\n\n👤 Öğrenci: ${studentName}\n📚 Alan: ${studentAlan}\n\n📝 ${aiLetter}\n\n🔗 Veli Takip Linki: ${currentUrl}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                style={{
                  marginTop: '1rem',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <Share2 size={16} />
                <span>Raporu WhatsApp ile Paylaş</span>
              </button>
            )}
          </div>

          {/* Bildirim Simülasyonu */}
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#10b981" /> Veli Bilgilendirme Sistemi (Simülasyon)
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem', textAlign: 'left' }}>
              Öğrencinizin çalışma performansını, çözdüğü soru adetlerini ve deneme sonuçlarını anlık olarak veli telefonuna raporlayabilirsiniz.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* WhatsApp Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>WhatsApp Bilgilendirmesi</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Haftalık özet ve AI durum raporunu WhatsApp'tan gönder.</div>
                </div>
                <button 
                  onClick={() => {
                    const active = !whatsappActive;
                    setWhatsappActive(active);
                    if (active) {
                      setToastMessage("Simülasyon: Veliye WhatsApp'tan haftalık AI raporu gönderildi! 📱");
                      setTimeout(() => setToastMessage(null), 4000);
                    }
                  }}
                  style={{
                    width: '50px', height: '26px', borderRadius: '15px',
                    background: whatsappActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', border: 'none', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px',
                    left: whatsappActive ? '27px' : '3px',
                    transition: 'left 0.2s'
                  }} />
                </button>
              </div>

              {/* SMS Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Akıllı Erken Uyarı (SMS)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Öğrenci 2 gün hedefin altında kalırsa AI uyarır.</div>
                </div>
                <button 
                  onClick={() => {
                    const active = !smsActive;
                    setSmsActive(active);
                    if (active) {
                      const weakSubject = mistakes.length > 0 ? mistakes[0].subject : 'Matematik';
                      setToastMessage(`📱 SMS: "Sayın Veli, ${studentData.student.username} son 2 gündür odaklanma hedeflerinin gerisinde kaldı. Özellikle ${weakSubject} dersinde eksiği bulunuyor. Ufak bir motivasyon konuşması iyi gelebilir." - Astra AI`);
                      setTimeout(() => setToastMessage(null), 8000);
                    }
                  }}
                  style={{
                    width: '50px', height: '26px', borderRadius: '15px',
                    background: smsActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', border: 'none', cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px',
                    left: smsActive ? '27px' : '3px',
                    transition: 'left 0.2s'
                  }} />
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Veli Teşvik ve Moral Rozeti Bölümü */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, rgba(244,63,94,0.06), rgba(139,92,246,0.04))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 0 20px rgba(244,63,94,0.3)' }}>
                💖
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                  Öğrencinize Moral & Teşvik Notu Gönder
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>
                  Gönderdiğiniz rozet ve not anında öğrencinizin panosuna bildirim olarak düşer.
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#fca5a5', background: 'rgba(244,63,94,0.15)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(244,63,94,0.3)', fontWeight: 700 }}>
              Canlı İletim
            </span>
          </div>

          {/* 4 Cheer Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { type: 'coffee' as const, icon: '☕', title: 'Sıcak Kahve İkramı', desc: 'Biraz dinlenmeyi hak ettin, mola ver!' },
              { type: 'rocket' as const, icon: '🚀', title: 'Tam Destek', desc: 'Hedefine doğru tam gaz devam et!' },
              { type: 'heart' as const, icon: '❤️', title: 'Sevgi & Moral', desc: 'Senin gayretin her şeyden değerli.' },
              { type: 'star' as const, icon: '⭐', title: 'Haftanın Yıldızı', desc: 'Bu haftaki disiplinin için tebrikler!' },
            ].map((c) => (
              <button
                key={c.type}
                type="button"
                onClick={() => setSelectedCheerType(c.type)}
                style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  background: selectedCheerType === c.type ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.02)',
                  border: selectedCheerType === c.type ? '1.5px solid #f43f5e' : '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{c.icon}</span>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{c.title}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px', lineHeight: 1.4 }}>{c.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional Note & Submit Button */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="İsteğe bağlı özel bir mesaj ekleyin (Örn: 'Seni çok seviyoruz, başaracaksın!')"
              value={cheerNote}
              onChange={(e) => setCheerNote(e.target.value)}
              style={{
                flex: '1 1 280px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => handleSendCheer()}
              disabled={cheerLoading}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: 'none',
                cursor: cheerLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: cheerLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <span>{cheerLoading ? 'İletiliyor...' : '💌 Teşvik Gönder'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: 'calc(76px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: 'max-content', maxWidth: 'calc(100vw - 32px)' }}>
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: '#10b981', color: '#fff', padding: '1rem 2rem', borderRadius: '2rem',
                fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 768px) {
          .veli-page-wrap { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; }
          .veli-header { flex-direction: column !important; align-items: flex-start !important; }
          .veli-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
