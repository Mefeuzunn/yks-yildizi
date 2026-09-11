"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText,  Activity, BookOpen, Target, ShieldCheck, ChevronRight, CheckCircle2, TrendingUp, Lock  } from 'lucide-react';
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
          style={{ background: 'var(--surface-color)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <ShieldCheck size={32} color="#10b981" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem' }}>Veli Girişi</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>Öğrencinizin profilindeki bağlantı kodunu girerek gelişimini takip edin.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(inputCode); }}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bağlantı Kodu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="premium-input" 
                  placeholder="Örn: 8A4F10BC" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  style={{ paddingLeft: '2.75rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}
                  required
                />
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>{error}</div>}
            </div>
            
            <button type="submit" className="btn-interactive" style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #047857)', color: '#fff' }}>
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={32} color="#10b981" /> Veli Takip Paneli
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Öğrencinizin gelişimini şeffaf bir şekilde izliyorsunuz.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <FileText size={16} /> PDF İndir
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
              {studentData.student.username.substring(0, 2)}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{studentData.student.username}</div>
              <div style={{ color: '#10b981', fontSize: '0.75rem' }}>{studentData.student.alan} - {studentData.student.sinif}. Sınıf</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Çıkış</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="premium-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Son Deneme Neti</span>
            <Target color="#ec4899" />
          </div>
          <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700 }}>{lastExam ? lastExam.totalNet : '-'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {lastExam ? `${lastExam.type} Denemesi (${lastExam.name})` : 'Henüz deneme çözülmedi'}
          </div>
        </div>

        <div className="premium-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Çözülen Soru</span>
            <BookOpen color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 700 }}>
            {studentData.student.stats?.solved_questions || 0}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={16} /> Gelişim devam ediyor
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        
        {/* Chart */}
        <div className="premium-card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>Deneme Net Gelişimi</h2>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Henüz yeterli deneme verisi bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* 360 Derece Görünürlük (Faz 1) - Timeline ve Zayıf Konular */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          
          <div className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#3b82f6" /> Son 7 Gün - Ders Odaklanma Dağılımı
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {subjectFocus.length > 0 ? subjectFocus.map((sf: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{sf.subject}</span>
                  <span style={{ color: '#3b82f6', fontWeight: 700 }}>{Math.floor(sf.total_min / 60)}s {sf.total_min % 60}dk</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)' }}>Son 7 günde kaydedilmiş odaklanma yok.</div>
              )}
            </div>
          </div>

          <div className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#ef4444" /> Gelişim Bekleyen Dersler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mistakes.length > 0 ? mistakes.map((m: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{m.subject}</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{m.mistake_count} Hata</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-muted)' }}>Öğrencinin hata defterinde kayıt yok. Harika!</div>
              )}
            </div>
          </div>
          
        </div>

        <div className="premium-card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#8b5cf6" /> Günlük Çalışma Akışı (Timeline)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {timeline.length > 0 ? timeline.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `4px solid ${item.mode === 'pomodoro' ? '#8b5cf6' : '#38bdf8'}` }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', width: '60px', flexShrink: 0 }}>
                  {new Date(item.started_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                    {item.mode === 'pomodoro' ? (item.subject ? `${item.subject} Çalıştı` : 'Serbest Çalışma') : (item.mode === 'shortBreak' ? 'Kısa Ara Verdi' : 'Uzun Ara Verdi')}
                  </div>
                  {item.topic && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.topic}</div>}
                </div>
                <div style={{ marginLeft: 'auto', color: item.mode === 'pomodoro' ? '#8b5cf6' : '#38bdf8', fontWeight: 700, fontSize: '0.9rem' }}>
                  {item.duration_min} dk
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)' }}>Bugün kaydedilmiş çalışma yok.</div>
            )}
          </div>
        </div>

        {/* Veli Bildirim Sistemi ve AI Mektubu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          
          {/* AI Veli Raporu */}
          <div className="premium-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#10b981" /> AI Haftalık Veli Mektubu
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

      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
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

    </div>
  );
}
