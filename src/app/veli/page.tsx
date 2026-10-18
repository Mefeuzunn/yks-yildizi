"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Activity, BookOpen, Target, ShieldCheck, ChevronRight, CheckCircle2, 
  TrendingUp, Lock, Share2, Heart, Coffee, Rocket, Star, MessageSquare, Radio, 
  Sparkles, Award, Compass, Clock, CheckCircle, ChevronDown, ChevronUp, AlertCircle,
  Flame, UserCheck, HelpCircle, Phone, Smartphone, Edit2, X, Check, Printer
} from 'lucide-react';
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
  const [liveSession, setLiveSession] = useState<any>(null);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [teacherNotes, setTeacherNotes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<any>(null);
  const [maarifCompetencies, setMaarifCompetencies] = useState<any[]>([]);
  const [aiLetter, setAiLetter] = useState<string>('');
  
  const [whatsappActive, setWhatsappActive] = useState(false);
  const [smsActive, setSmsActive] = useState(false);
  const [parentPhone, setParentPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [tempName, setTempName] = useState('');
  const [phoneModalError, setPhoneModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cheerLoading, setCheerLoading] = useState(false);
  const [cheerNote, setCheerNote] = useState('');
  const [selectedCheerType, setSelectedCheerType] = useState<'coffee' | 'rocket' | 'heart' | 'star'>('coffee');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Rehberlik kartları açık/kapalı durumu
  const [expandedGuidance, setExpandedGuidance] = useState<number | null>(0);

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

  // Canlı odaklanma durumunu her 25 saniyede bir sessizce yenile (sayfa aktifken)
  useEffect(() => {
    if (!parentCode) return;
    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/parent/student?code=${encodeURIComponent(parentCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveSession(data.liveSession || null);
            setTodaySummary(data.todaySummary || null);
            if (data.teacherNotes) setTeacherNotes(data.teacherNotes);
            if (data.assignments) setAssignments(data.assignments);
            if (data.assignmentStats) setAssignmentStats(data.assignmentStats);
          }
        }
      } catch (_) {}
    }, 25000);
    return () => clearInterval(interval);
  }, [parentCode]);

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
        setLiveSession(data.liveSession || null);
        setTodaySummary(data.todaySummary || null);
        setTeacherNotes(data.teacherNotes || []);
        setAssignments(data.assignments || []);
        setAssignmentStats(data.assignmentStats || null);
        setMaarifCompetencies(data.maarifCompetencies || []);
        setParentCode(codeToUse);
        
        // Fetch AI Weekly Report
        try {
          const letterRes = await fetch(`/api/veli/ai-report?code=${encodeURIComponent(codeToUse)}`);
          const letterData = await letterRes.json();
          if (letterData.letter) setAiLetter(letterData.letter);
        } catch (e) {
          console.error('Failed to load AI Letter:', e);
        }
        
        if (data.notificationPreferences) {
          setWhatsappActive(Boolean(data.notificationPreferences.whatsapp_active));
          setSmsActive(Boolean(data.notificationPreferences.sms_active));
          setParentPhone(data.notificationPreferences.parent_phone || '');
          setParentName(data.notificationPreferences.parent_name || '');
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

  const handleSavePreferences = async (overrides: {
    whatsapp_active?: boolean;
    sms_active?: boolean;
    parent_phone?: string;
    parent_name?: string;
  }) => {
    const code = parentCode;
    if (!code) return;
    setIsSavingPrefs(true);
    const targetWhatsapp = overrides.whatsapp_active !== undefined ? overrides.whatsapp_active : whatsappActive;
    const targetSms = overrides.sms_active !== undefined ? overrides.sms_active : smsActive;
    const targetPhone = overrides.parent_phone !== undefined ? overrides.parent_phone : parentPhone;
    const targetName = overrides.parent_name !== undefined ? overrides.parent_name : parentName;

    try {
      const res = await fetch('/api/parent/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          parent_phone: targetPhone,
          parent_name: targetName,
          whatsapp_active: targetWhatsapp,
          sms_active: targetSms
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsappActive(targetWhatsapp);
        setSmsActive(targetSms);
        setParentPhone(targetPhone);
        setParentName(targetName);
        setToastMessage('✅ Veli bildirim tercihleriniz başarıyla kaydedildi!');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        setToastMessage(`⚠️ Hata: ${data.error || 'Kaydedilemedi'}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (_) {
      setToastMessage('⚠️ Sunucu bağlantı hatası.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleToggleWhatsApp = () => {
    const nextState = !whatsappActive;
    if (nextState && !parentPhone.trim()) {
      setTempPhone(parentPhone);
      setTempName(parentName);
      setPhoneModalError('');
      setShowPhoneModal(true);
      return;
    }
    handleSavePreferences({ whatsapp_active: nextState });
  };

  const handleToggleSms = () => {
    const nextState = !smsActive;
    if (nextState && !parentPhone.trim()) {
      setTempPhone(parentPhone);
      setTempName(parentName);
      setPhoneModalError('');
      setShowPhoneModal(true);
      return;
    }
    handleSavePreferences({ sms_active: nextState });
  };

  const handleLogout = () => {
    setStudentData(null);
    setTimeline([]);
    setSubjectFocus([]);
    setMistakes([]);
    setLiveSession(null);
    setTodaySummary(null);
    setTeacherNotes([]);
    setAssignments([]);
    setAssignmentStats(null);
    setMaarifCompetencies([]);
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
    
    const todayFocus = todaySummary?.focusMinutes || 0;
    const todaySolved = todaySummary?.questionsSolved || 0;
    const targetUni = student?.target_university ? `${student.target_university}${student.target_department ? ` - ${student.target_department}` : ''}` : '';
    const hwRate = assignmentStats ? `%${assignmentStats.rate} (${assignmentStats.completed}/${assignmentStats.total} Teslim)` : '';

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const reportText = `📊 *YKS YILDIZI - VELİ BİLGİLENDİRME RAPORU*\n\n` +
      `👤 *Öğrenci:* ${username} (${alan} - ${sinif}. Sınıf)\n` +
      (targetUni ? `🎯 *Hedef:* ${targetUni}\n` : '') +
      `🔥 *Çalışma Serisi:* ${streak} Gün Kesintisiz\n` +
      `⏱️ *Bugünkü Odak:* ${todayFocus} Dakika (${todaySolved} Soru Çözüldü)\n` +
      (hwRate ? `📝 *Ödev Durumu:* ${hwRate}\n` : '') +
      `📚 *Toplam Çözülen Soru:* ${solved} Soru\n` +
      `🎯 *Son Deneme Neti:* ${lastNet}\n\n` +
      (liveSession?.isLive ? `🟢 *Şu An Canlı:* ${liveSession.subject} dersi çalışıyor (${liveSession.elapsedMinutes} dk)\n\n` : '') +
      (teacherNotes?.length > 0 ? `👨‍🏫 *Öğretmen Tavsiyesi:* "${teacherNotes[0].note.slice(0, 150)}..." (${teacherNotes[0].teacher_name})\n\n` : '') +
      (aiLetter ? `🤖 *Astra AI Danışman Özeti:*\n"${aiLetter.slice(0, 220)}..."\n\n` : '') +
      `🔗 *Canlı Veli Takip Portalı:*\n${currentUrl}\n\n` +
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
  
  const chartData = (studentData.exams || []).map((e: any) => ({
    name: e.date,
    score: e.totalNet
  }));

  const lastExam = studentData.exams?.length > 0 ? studentData.exams[studentData.exams.length - 1] : null;

  return (
    <div className="veli-page-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* Header */}
      <div className="veli-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            <ShieldCheck size={32} color="#34d399" /> Veli Takip & Rehberlik Portalı
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Öğrencinizin gelişimini, öğretmen notlarını ve canlı çalışma ritmini izliyorsunuz.
          </p>
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
            onClick={() => setIsReportModalOpen(true)}
            className="active:scale-[0.98]"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.4)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 800, boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <FileText size={16} /> Resmi Karne / PDF
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(15, 21, 35, 0.85)', padding: '0.5rem 1rem', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}>
              {studentData.student.username.substring(0, 2)}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}>{studentData.student.username}</div>
              <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>{studentData.student.alan} - {studentData.student.sinif}. Sınıf</div>
              {studentData.student.target_university && (
                <div style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 600, marginTop: 1 }}>
                  🎯 {studentData.student.target_university} {studentData.student.target_department ? `• ${studentData.student.target_department}` : ''}
                </div>
              )}
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

      {/* 🔴 CANLI ÇALIŞMA DURUMU KARTI (REAL-TIME LIVE FOCUS PULSE) */}
      <div style={{ marginBottom: '1.75rem' }}>
        {liveSession?.isLive ? (
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '12px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.3rem', boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>
                <Radio size={22} color="#fff" />
                <span style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #0f1523', animation: 'pulse 1.5s infinite' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Şu Anda Canlı Çalışıyor!
                  </span>
                  <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#a7f3d0', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    {liveSession.elapsedMinutes} Dakikadır Odaklanmış
                  </span>
                </div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>
                  {liveSession.subject} {liveSession.topic ? `· ${liveSession.topic}` : ''}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '2px 0 0' }}>
                  Öğrenciniz çalışma odasında masada, odağını koruyor.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSendCheer('coffee')}
                disabled={cheerLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ☕ Kahve İkram Et
              </button>
              <button
                onClick={() => handleSendCheer('heart')}
                disabled={cheerLoading}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ❤️ Moral Gönder
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            color: '#94a3b8',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b' }} />
              <span><strong>Oturum Durumu:</strong> Şu an aktif çalışma oturumu yok (Mola / Dinlenme modunda).</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
              Canlı durum 25 saniyede bir otomatik güncellenir
            </div>
          </div>
        )}
      </div>

      {/* 4'LÜ TEMEL METRİK KARTLARI */}
      <div className="veli-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Son Deneme Neti */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Son Deneme Neti</span>
            <Target color="#ec4899" size={20} />
          </div>
          <div style={{ fontSize: '2.4rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {lastExam ? lastExam.totalNet : '-'}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {lastExam ? `${lastExam.type} (${lastExam.name})` : 'Henüz deneme çözülmedi'}
          </div>
        </div>

        {/* Bugün Ne Yaptı? */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(15,21,35,0.8))'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bugünkü Verimlilik</span>
            <Clock color="#34d399" size={20} />
          </div>
          <div style={{ fontSize: '2.4rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {todaySummary?.focusMinutes || 0} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>dk</span>
          </div>
          <div style={{ color: '#a7f3d0', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <CheckCircle2 size={14} color="#34d399" /> Bugün {todaySummary?.questionsSolved || 0} soru çözdü
          </div>
        </div>

        {/* Çözülen Toplam Soru */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Toplam Soru</span>
            <BookOpen color="#fbbf24" size={20} />
          </div>
          <div style={{ fontSize: '2.4rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {studentData.student.stats?.solved_questions || 0}
          </div>
          <div style={{ color: '#34d399', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <TrendingUp size={14} /> Başarı Oranı: %{studentData.student.stats?.success_rate || 75}
          </div>
        </div>

        {/* Kesintisiz Seri */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '20px',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disiplin Serisi</span>
            <Flame color="#f59e0b" size={20} />
          </div>
          <div style={{ fontSize: '2.4rem', color: '#fff', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {studentData.student.stats?.streak_days || 0} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>Gün</span>
          </div>
          <div style={{ color: '#fcd34d', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            🔥 Kesintisiz devam ediyor
          </div>
        </div>

      </div>

      {/* ── ÖĞRETMEN NOTLARI & TAVSİYELERİ KÖPRÜSÜ (TEACHER-PARENT BRIDGE) ── */}
      <div
        className="premium-card"
        style={{
          backgroundColor: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(15, 21, 35, 0.8))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <UserCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                Öğretmen Görüşleri & Veli Tavsiyeleri
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>
                Öğrencinizin ders öğretmenleri ve rehberlik danışmanları tarafından paylaşılan değerlendirmeler.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', background: 'rgba(99, 102, 241, 0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 700 }}>
            {teacherNotes?.length || 0} Öğretmen Notu
          </span>
        </div>

        {teacherNotes && teacherNotes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {teacherNotes.map((tn: any, idx: number) => {
              const categoryTags: Record<string, { label: string; color: string }> = {
                rehberlik: { label: '🎯 Rehberlik', color: '#a855f7' },
                akademik: { label: '📈 Akademik', color: '#38bdf8' },
                motivasyon: { label: '🔥 Motivasyon', color: '#f59e0b' },
                genel: { label: '📌 Genel', color: '#94a3b8' }
              };
              const tag = categoryTags[tn.category] || categoryTags.genel;

              return (
                <div
                  key={tn.id || idx}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                          {tn.teacher_name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                          {tn.teacher_branch || 'Öğretmen'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: tag.color, fontWeight: 700 }}>
                        {tag.label}
                      </span>
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                      "{tn.note}"
                    </p>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                    {new Date(tn.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.85rem' }}>
            <MessageSquare size={28} color="#6366f1" style={{ margin: '0 auto 8px auto', opacity: 0.8 }} />
            Öğretmenler tarafından veliyle paylaşılan not henüz bulunmuyor.
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Öğretmen öğrenci için gelişim notu girdiğinde bu alanda otomatik listelenecektir.</p>
          </div>
        )}
      </div>

      {/* ── ÖDEV & GÖREV TAKİP KARNESİ (ASSIGNMENTS & HOMEWORK PROGRESS) ── */}
      <div
        className="premium-card"
        style={{
          backgroundColor: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(15, 21, 35, 0.8))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)' }}>
              📝
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                Ödev & Görev Takip Karnesi
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>
                Öğretmenler tarafından atanan ödevlerin teslim durumu, notlandırma ve öğretmen geri bildirimleri.
              </p>
            </div>
          </div>
          {assignmentStats && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
                %{assignmentStats.rate} Tamamlama Başarısı
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '20px' }}>
                {assignmentStats.completed}/{assignmentStats.total} Teslim
              </span>
            </div>
          )}
        </div>

        {assignments && assignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {assignments.map((as: any, idx: number) => {
              const isGraded = as.status === 'graded';
              const isCompleted = as.status === 'completed' || as.status === 'submitted' || isGraded;

              return (
                <div
                  key={as.assignment_id || idx}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: 8 }}>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem' }}>{as.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{as.subject || 'Ders'} {as.topic ? `• ${as.topic}` : ''}</span>
                          <span style={{ color: '#64748b' }}>({as.teacher_name} - {as.teacher_brans})</span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isGraded ? 'rgba(16,185,129,0.2)' : isCompleted ? 'rgba(56,189,248,0.2)' : 'rgba(245,158,11,0.2)',
                        color: isGraded ? '#34d399' : isCompleted ? '#38bdf8' : '#fcd34d',
                        border: `1px solid ${isGraded ? 'rgba(16,185,129,0.35)' : isCompleted ? 'rgba(56,189,248,0.35)' : 'rgba(245,158,11,0.35)'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {isGraded ? `✅ Not: ${as.score}/100` : isCompleted ? '✅ Teslim Edildi' : '⏳ Bekliyor'}
                      </span>
                    </div>

                    {as.description && (
                      <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0', lineHeight: 1.5 }}>
                        {as.description}
                      </p>
                    )}

                    {as.feedback && (
                      <div style={{ marginTop: '0.65rem', padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#c7d2fe', fontSize: '0.78rem', lineHeight: 1.5 }}>
                        <strong>💬 Öğretmen Notu:</strong> "{as.feedback}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.72rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                    <span>{as.due_date ? `Son Teslim: ${new Date(as.due_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}` : 'Tarih belirtilmedi'}</span>
                    {as.submitted_at && <span>Teslim: {new Date(as.submitted_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📚</div>
            Öğrenciye atanmış aktif ödev bulunmuyor.
          </div>
        )}
      </div>

      {/* ── TÜRKİYE YÜZYILI MAARİF MODELİ - BÜTÜNCÜL YETKİNLİK GÖZLEMİ ── */}
      <div
        className="premium-card"
        style={{
          backgroundColor: 'rgba(15, 21, 35, 0.75)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(15, 21, 35, 0.8))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)' }}>
              🏛️
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                Türkiye Yüzyılı Maarif Modeli · Bütüncül Yetkinlik Gözlemi
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>
                Yalnızca net puanı değil; öğrencinin azim, zihinsel disiplin, analitik muhakeme ve çabasını ölçen pedagojik endeks.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fcd34d', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700 }}>
            MEB Maarif Çerçevesi
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {(maarifCompetencies && maarifCompetencies.length > 0 ? maarifCompetencies : [
            { name: 'Azim & Devamlılık', score: 85, icon: '🛡️', desc: 'Süreklilik Serisi' },
            { name: 'Zihinsel Odak & Disiplin', score: 75, icon: '⏱️', desc: 'Pomodoro Düzeni' },
            { name: 'Analitik Problem Çözme', score: 70, icon: '🎯', desc: 'Doğruluk Oranı' },
            { name: 'Soru Üretkenliği & Çaba', score: 80, icon: '📚', desc: 'Haftalık Çaba' }
          ]).map((comp: any, idx: number) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.3rem' }}>{comp.icon}</span>
                <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: '1.2rem', fontVariantNumeric: 'tabular-nums' }}>
                  %{comp.score}
                </span>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{comp.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>{comp.desc}</div>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${Math.min(100, Math.max(0, comp.score))}%`, 
                    background: 'linear-gradient(90deg, #f59e0b, #10b981)', 
                    borderRadius: '3px',
                    transition: 'width 1s ease'
                  }} 
                />
              </div>
            </div>
          ))}
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

        {/* 360 Derece Görünürlük - Timeline ve Zayıf Konular */}
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
              <BookOpen size={20} color="#f87171" /> Gelişim Bekleyen Dersler (Hata Analizi)
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

        {/* Günlük Çalışma Akışı */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
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

          {/* Bildirim Kanalları */}
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#10b981" /> Veli Bilgilendirme Kanalları
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: isSavingPrefs ? '#38bdf8' : '#10b981', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {isSavingPrefs ? (
                  <>
                    <Clock size={12} className="animate-spin" />
                    <span>Buluta Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Bulut Senkronize</span>
                  </>
                )}
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', textAlign: 'left' }}>
              Öğrencinizin çalışma performansını, çözdüğü soru adetlerini ve deneme sonuçlarını anlık olarak veli telefonuna raporlayabilirsiniz.
            </p>

            {/* Kayıtlı İletişim Hattı */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: parentPhone ? 'rgba(16, 185, 129, 0.04)' : 'rgba(56, 189, 248, 0.04)',
              borderRadius: '14px',
              border: `1px solid ${parentPhone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)'}`,
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: parentPhone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: parentPhone ? '#34d399' : '#38bdf8'
                }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {parentPhone ? 'Kayıtlı Veli İletişim Hattı' : 'Veli Telefonu Tanımlanmadı'}
                  </div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginTop: '2px' }}>
                    {parentPhone ? `${parentPhone} ${parentName ? `(${parentName})` : ''}` : 'Numara eklenmedi'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setTempPhone(parentPhone);
                  setTempName(parentName);
                  setPhoneModalError('');
                  setShowPhoneModal(true);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Edit2 size={13} />
                <span>{parentPhone ? 'Numarayı Değiştir' : '+ Telefon Ekle'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* WhatsApp Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>WhatsApp Bilgilendirmesi</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: whatsappActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: whatsappActive ? '#34d399' : '#64748b',
                      fontWeight: 700
                    }}>
                      {whatsappActive ? 'AKTİF' : 'PASİF'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Haftalık pazar 18:00 durum raporu ve AstraTutor yapay zeka analizini veli WhatsApp hattına iletir.
                  </div>
                </div>
                <button 
                  onClick={handleToggleWhatsApp}
                  disabled={isSavingPrefs}
                  title="WhatsApp Bildirimi Aç/Kapat"
                  style={{
                    width: '50px', height: '26px', borderRadius: '15px',
                    background: whatsappActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', border: 'none', cursor: isSavingPrefs ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>Akıllı Erken Uyarı (SMS)</span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: smsActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: smsActive ? '#34d399' : '#64748b',
                      fontWeight: 700
                    }}>
                      {smsActive ? 'AKTİF' : 'PASİF'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Öğrenci 2 gün boyunca günlük hedefinin altında kalırsa veya serisi riske girerse erken uyarı SMS'i gönderir.
                  </div>
                </div>
                <button 
                  onClick={handleToggleSms}
                  disabled={isSavingPrefs}
                  title="SMS Bildirimi Aç/Kapat"
                  style={{
                    width: '50px', height: '26px', borderRadius: '15px',
                    background: smsActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                    position: 'relative', border: 'none', cursor: isSavingPrefs ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0
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

        {/* ── VELİ İÇİN YKS REHBERLİK & PSİKOSOSYAL DESTEK KÖŞESİ ── */}
        <div
          className="premium-card"
          style={{
            backgroundColor: 'rgba(15, 21, 35, 0.75)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px',
            padding: '2rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(15, 21, 35, 0.8))'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Compass size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 800 }}>
                Veli İçin YKS Rehberlik & Psikososyal Destek Köşesi
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '2px 0 0' }}>
                Sınav sürecinde anne-baba tutumu, sınav kaygısını yönetme ve ev içi motivasyon kılavuzu.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                id: 0,
                title: '1. Deneme Netleri Düştüğünde Nasıl Yaklaşmalıyız?',
                icon: '🎯',
                content: 'Denemeler birer sıralama amacı değil, eksik tespit aracıdır. Net düşüşü öğrencinin başarısızlığı değil, henüz tam oturmamış bir konunun sinyalidir. "Neden böyle oldu?" yerine "Bu denemede hangi soru tipleri seni zorladı, beraber nasıl planlayalım?" yaklaşımı kaygıyı azaltır, öğrencinin masaya yeniden oturmasını sağlar.'
              },
              {
                id: 1,
                title: '2. Ev İçi Çalışma İklimi & Dikkat Dağıtıcıları Azaltma',
                icon: '🏡',
                content: 'Öğrencinin ders çalıştığı ortamda sessizlik ve düzen kadar, ev halkının ekran alışkanlıkları da önemlidir. Öğrenci masadayken aile bireylerinin de kitap okuması veya sessiz aktivitelere yönelmesi odaklanma psikolojisini güçlendirir. Telefonu çalışma odasının dışında tutması için destek olun.'
              },
              {
                id: 2,
                title: '3. Uyku, Beslenme & Zihinsel Dayanıklılık Rutini',
                icon: '🌙',
                content: 'Gece uykusu zihinsel bilgilerin belleğe kalıcı olarak kodlandığı zamandır. Günde 7-8 saat kesintisiz uyku, sınav haftalarında netleri doğrudan 5-10 net artırabilecek bilişsel kapasite sağlar. Ağır karbonhidrattan ziyade protein ve su dengesini destekleyin.'
              }
            ].map((guide) => (
              <div
                key={guide.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedGuidance(expandedGuidance === guide.id ? null : guide.id)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{guide.icon}</span>
                    <span>{guide.title}</span>
                  </span>
                  {expandedGuidance === guide.id ? <ChevronUp size={18} color="#38bdf8" /> : <ChevronDown size={18} color="#64748b" />}
                </button>
                {expandedGuidance === guide.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      padding: '0 1.25rem 1.25rem 1.25rem',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                      lineHeight: 1.7,
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    {guide.content}
                  </motion.div>
                )}
              </div>
            ))}
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

      {/* Veli Telefon & İletişim Bilgisi Güncelleme Modalı */}
      <AnimatePresence>
        {showPhoneModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '440px',
                background: '#0d1527',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                    <Smartphone size={18} />
                  </div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                    Veli İletişim Hattı
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                Haftalık WhatsApp raporları ve öğrencinin sınav hazırlık durumuna dair SMS erken uyarılarının iletilebilmesi için bilgilerinizi kaydedin.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const cleanPhone = tempPhone.trim().replace(/\s+/g, '');
                if (cleanPhone.length < 10) {
                  setPhoneModalError('Lütfen geçerli bir telefon numarası girin (örn: 05xx xxx xx xx).');
                  return;
                }
                setPhoneModalError('');
                await handleSavePreferences({
                  parent_phone: tempPhone.trim(),
                  parent_name: tempName.trim(),
                  whatsapp_active: true
                });
                setShowPhoneModal(false);
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Veli Adı / Hitap (İsteğe Bağlı)
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Örn: Ayşe Hanım / Mehmet Bey"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Cep Telefonu Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  {phoneModalError && (
                    <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px' }}>
                      {phoneModalError}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowPhoneModal(false)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPrefs}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: isSavingPrefs ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    {isSavingPrefs ? 'Kaydediliyor...' : 'Kaydet ve Bildirimi Etkinleştir'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📄 RESMİ ÖĞRENCİ GELİŞİM KARNESİ & A4 YAZDIRMA / PDF MODALI */}
      <AnimatePresence>
        {isReportModalOpen && studentData && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
              padding: '24px 12px'
            }}
          >
            {/* Modal Üst Eylem Çubuğu (Baskıda Gizlenir) */}
            <div
              className="no-print"
              style={{
                width: '100%',
                maxWidth: '860px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1e293b',
                padding: '12px 20px',
                borderRadius: '16px 16px 0 0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none',
                color: '#fff',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Resmi Öğrenci Gelişim Karnesi & Veli Raporu</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>A4 Standart Boyutunda Yazdırabilir veya PDF Olarak Kaydedebilirsiniz</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Printer size={16} />
                  <span>Yazdır / PDF Kaydet</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* A4 Yazdırılabilir Belge Konteyneri */}
            <div
              id="veli-official-report"
              style={{
                width: '100%',
                maxWidth: '860px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '36px 40px',
                borderRadius: '0 0 16px 16px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            >
              {/* Kurumsal Başlık & T.C. Formatı */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2.5px solid #1e3a8a', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 900 }}>
                    ★
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', letterSpacing: '0.08em' }}>T.C. AKADEMİK DEĞERLENDİRME SİSTEMİ</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em', margin: '2px 0 0' }}>YKS YILDIZI ÖĞRENCİ GELİŞİM KARNESİ</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>2025 - 2026 EĞİTİM ÖĞRETİM YILI / YKS HAZIRLIK DÖNEMİ</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                  <div><strong>Rapor No:</strong> YKS-RPR-{(studentData.student?.id || '2026').substring(0, 8).toUpperCase()}</div>
                  <div><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</div>
                  <div><strong>Düzenleme Saati:</strong> {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>

              {/* Öğrenci & Veli Kimlik Kartı */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>ÖĞRENCİ ADI SOYADI</span>
                  <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.9rem' }}>{studentData.student.username}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>SINIF & ALAN</span>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>{studentData.student.sinif}. Sınıf • {studentData.student.alan}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>HEDEF BÖLÜM</span>
                  <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{studentData.student.target_university || 'Belirtilmedi'} {studentData.student.target_department ? `(${studentData.student.target_department})` : ''}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>VELİ İSMİ</span>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>{parentName || 'Sayın Velimiz'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>VELİ TAKİP KODU</span>
                  <span style={{ color: '#059669', fontWeight: 800 }}>{parentCode}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem', fontWeight: 700 }}>DURUM</span>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>● Aktif YKS Adayı</span>
                </div>
              </div>

              {/* Temel Akademik Göstergeler (6 Metrik Kutusu) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#eff6ff', padding: '10px 8px', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1d4ed8' }}>{studentData.stats?.solved_questions || 0}</div>
                  <div style={{ fontSize: '0.65rem', color: '#1e40af', fontWeight: 700, marginTop: '2px' }}>Toplam Soru</div>
                </div>
                <div style={{ backgroundColor: '#ecfdf5', padding: '10px 8px', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>%{studentData.stats?.success_rate || 0}</div>
                  <div style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: 700, marginTop: '2px' }}>Net Doğruluk</div>
                </div>
                <div style={{ backgroundColor: '#fff7ed', padding: '10px 8px', borderRadius: '8px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#c2410c' }}>{studentData.stats?.streak_days || 0} Gün</div>
                  <div style={{ fontSize: '0.65rem', color: '#9a3412', fontWeight: 700, marginTop: '2px' }}>Çalışma Serisi</div>
                </div>
                <div style={{ backgroundColor: '#faf5ff', padding: '10px 8px', borderRadius: '8px', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#7e22ce' }}>{studentData.stats?.league || 'Bronz'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#6b21a8', fontWeight: 700, marginTop: '2px' }}>Lig Kademesi</div>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px 8px', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#15803d' }}>{Math.round((todaySummary?.focusMinutes || 45) / 60) || 1} Saat</div>
                  <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 700, marginTop: '2px' }}>Etüt Süresi</div>
                </div>
                <div style={{ backgroundColor: '#fef2f2', padding: '10px 8px', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b91c1c' }}>%{assignmentStats?.rate || 100}</div>
                  <div style={{ fontSize: '0.65rem', color: '#991b1b', fontWeight: 700, marginTop: '2px' }}>Ödev Başarısı</div>
                </div>
              </div>

              {/* Deneme Sınavları Tablosu */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📊</span> Deneme Sınavları Net Gelişim Dökümü
                </h4>
                {studentData.exams && studentData.exams.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1', textAlign: 'center' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Sınav Tarihi</th>
                        <th style={{ padding: '6px 8px', fontWeight: 700, color: '#334155' }}>Tür</th>
                        <th style={{ padding: '6px 8px', fontWeight: 700, color: '#334155' }}>Türkçe</th>
                        <th style={{ padding: '6px 8px', fontWeight: 700, color: '#334155' }}>Matematik</th>
                        <th style={{ padding: '6px 8px', fontWeight: 700, color: '#334155' }}>Fen Bil.</th>
                        <th style={{ padding: '6px 8px', fontWeight: 700, color: '#334155' }}>Sosyal Bil.</th>
                        <th style={{ padding: '6px 8px', fontWeight: 800, color: '#1e3a8a' }}>Toplam Net</th>
                        <th style={{ padding: '6px 8px', fontWeight: 800, color: '#059669' }}>Tahmini Puan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.exams.slice(-5).map((exam: any, idx: number) => {
                        const d = exam.details || {};
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'center', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ padding: '6px 8px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>{exam.exam_date || exam.date || 'Son Dönem'}</td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, color: exam.type === 'AYT' ? '#7c3aed' : '#2563eb' }}>{exam.type || 'TYT'}</td>
                            <td style={{ padding: '6px 8px', color: '#334155' }}>{d.turkce ?? exam.turkish_net ?? '-'}</td>
                            <td style={{ padding: '6px 8px', color: '#334155' }}>{d.matematik ?? exam.math_net ?? '-'}</td>
                            <td style={{ padding: '6px 8px', color: '#334155' }}>{d.fen ?? exam.science_net ?? '-'}</td>
                            <td style={{ padding: '6px 8px', color: '#334155' }}>{d.sosyal ?? exam.social_net ?? '-'}</td>
                            <td style={{ padding: '6px 8px', fontWeight: 800, color: '#1e3a8a' }}>{exam.total_net || 0} Net</td>
                            <td style={{ padding: '6px 8px', fontWeight: 800, color: '#059669' }}>{exam.score ? `${exam.score} P` : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
                    Henüz kayıtlı deneme sınavı sonucu bulunmamaktadır. Çözülen denemeler otomatik olarak bu tabloya eklenecektir.
                  </div>
                )}
              </div>

              {/* Ders Odaklanma & Kritik Telafi Konuları (2 Kolon) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', margin: '0 0 6px 0' }}>
                    🎯 En Çok Çalışılan Dersler (Son 7 Gün)
                  </h4>
                  {subjectFocus && subjectFocus.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {subjectFocus.slice(0, 4).map((sf: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>{i + 1}. {sf.subject}</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>{sf.total_min} dk</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ders etütleri düzenli olarak işlenmektedir.</div>
                  )}
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#b91c1c', margin: '0 0 6px 0' }}>
                    ⚠️ Öncelikli Telafi Konuları (Hata Analizi)
                  </h4>
                  {mistakes && mistakes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {mistakes.slice(0, 4).map((m: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>{i + 1}. {m.subject} {m.topic ? `• ${m.topic}` : ''}</span>
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>{m.mistake_count} Hata</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Kritik bir hata yığılması saptanmadı.</div>
                  )}
                </div>
              </div>

              {/* Maarif Modeli Yetkinlik Çizelgesi */}
              {maarifCompetencies && maarifCompetencies.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 8px 0' }}>
                    🌟 Türkiye Maarif Modeli Bütüncül Yetkinlik Skoru
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {maarifCompetencies.map((comp: any, idx: number) => (
                      <div key={idx} style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fafafa', textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', marginBottom: '2px' }}>{comp.icon}</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e293b' }}>{comp.name}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#2563eb', margin: '3px 0' }}>%{comp.score}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{comp.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Öğretmen Notları & Rehberlik */}
              {teacherNotes && teacherNotes.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', margin: '0 0 6px 0' }}>
                    📝 Branş Öğretmenleri Değerlendirme Notları
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {teacherNotes.slice(0, 2).map((note: any, idx: number) => (
                      <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #6366f1', fontSize: '0.72rem', color: '#334155' }}>
                        <div style={{ fontWeight: 800, color: '#4338ca', marginBottom: '2px' }}>
                          {note.teacher_name} ({note.teacher_brans || 'Öğretmen'}) — {note.created_at ? new Date(note.created_at).toLocaleDateString('tr-TR') : ''}
                        </div>
                        <div>"{note.note}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yapay Zeka Eğitim Koçu Değerlendirmesi */}
              {aiLetter && (
                <div style={{ backgroundColor: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
                    🤖 AstraTutor Yapay Zeka Eğitim Koçu Notu
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#166534', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {aiLetter.length > 420 ? `${aiLetter.substring(0, 420)}...` : aiLetter}
                  </div>
                </div>
              )}

              {/* Resmi İmza & Onay Bölümü */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px', paddingTop: '16px', borderTop: '1.5px dashed #cbd5e1' }}>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b' }}>Kurum Rehberlik Danışmanı</div>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '32px' }}>YKS Yıldızı Akademik Koordinatörlüğü</div>
                  <div style={{ width: '150px', borderBottom: '1px solid #000', margin: '0 auto 4px' }} />
                  <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>İmza / Kaşe</div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b' }}>Öğrenci Velisi</div>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', marginBottom: '32px' }}>{parentName || 'Veli İnceleme ve Onayı'}</div>
                  <div style={{ width: '150px', borderBottom: '1px solid #000', margin: '0 auto 4px' }} />
                  <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>İmza</div>
                </div>
              </div>

              {/* Kurumsal Bilgi & Karekod İbaresi */}
              <div style={{ marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: '#94a3b8' }}>
                <span>* Bu belge, YKS Yıldızı akıllı öğrenme platformu tarafından üretilmiş resmi öğrenci gelişim karnesidir.</span>
                <span>Doğrulama Kodu: {studentData.student?.id?.substring(0, 12) || 'YKS-2026-VAL'}</span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

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
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @media (max-width: 768px) {
          .veli-page-wrap { padding-bottom: calc(85px + env(safe-area-inset-bottom, 20px)) !important; }
          .veli-header { flex-direction: column !important; align-items: flex-start !important; }
          .veli-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media print {
          body * {
            visibility: hidden !important;
          }
          #veli-official-report,
          #veli-official-report * {
            visibility: visible !important;
          }
          #veli-official-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            background: #ffffff !important;
            color: #0f172a !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
