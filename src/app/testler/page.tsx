"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Sparkles, Clock, CheckCircle2, Flame, Award, 
  Search, SlidersHorizontal, BookOpen, Layers, Play, Plus, 
  RotateCcw, ShieldCheck, Zap, X, ChevronRight, HelpCircle,
  BarChart2, Calendar, TrendingUp, AlertCircle, Check,
  Download, ExternalLink, FileDown, ChevronDown, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { haptics } from '@/lib/haptics';
import { YKS_CURRICULUM_TAXONOMY } from '@/lib/curriculum-taxonomy';

type TestCategory = 'all' | 'pdf_archive' | 'past_exam' | 'predicted' | 'meb_kazanim' | 'branch_trial' | 'procedural';

const OSYM_PDF_ARCHIVE = [
  {
    year: 2025,
    badge: 'En Güncel 2025 YKS',
    badgeColor: '#10b981',
    title: '2025 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: '2025 ÖSYM Temel Soru Kitapçığı ve Cevap Anahtarı (120 TYT + 80 AYT Sayısal)',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2025/YKS/2025_TYT_Temel_Soru_Kitapcigi_ve_Cevap_Anahtari.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2025/YKS/2025_AYT_Temel_Soru_Kitapcigi_ve_Cevap_Anahtari.pdf',
    tytSuiteId: 'osym-2025-tyt-deneme',
    aytSuiteId: 'osym-2025-ayt-mat-deneme'
  },
  {
    year: 2024,
    badge: '2024 Çıkmış',
    badgeColor: '#ef4444',
    title: '2024 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: '2024 ÖSYM Temel Soru Kitapçığı ve Cevap Anahtarı (120 TYT + 80 AYT Sayısal)',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2024/YKS/2024_TYT_Temel_Soru_Kitapcigi_ve_Cevap_Anahtari.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2024/YKS/2024_AYT_Temel_Soru_Kitapcigi_ve_Cevap_Anahtari.pdf',
    tytSuiteId: 'osym-2024-tyt-full',
    aytSuiteId: 'osym-2024-ayt-full'
  },
  {
    year: 2023,
    badge: '12. Sınıf 2. Dönem Muaf',
    badgeColor: '#f43f5e',
    title: '2023 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'Deprem dönemi müfredatı: Limit, türev, integral, organik kimya ve bitki muafiyetli sınav.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2023/YKS/2023_YKS_TYT_WEB.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2023/YKS/2023_YKS_AYT_WEB.pdf',
    tytSuiteId: 'osym-2023-tyt-full',
    aytSuiteId: 'osym-2023-ayt-full'
  },
  {
    year: 2022,
    badge: '165 Dk Yeni Dönem',
    badgeColor: '#f59e0b',
    title: '2022 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'TYT sınav süresinin 165 dakikaya uzatıldığı ve baraj puanının kaldırıldığı ilk sınav.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2022/YKS/2022_YKS_TYT_WEB.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2022/YKS/2022_YKS_AYT_WEB.pdf',
    tytSuiteId: 'osym-2022-tyt-full',
    aytSuiteId: 'osym-2022-ayt-full'
  },
  {
    year: 2021,
    badge: 'Tarihin En Zor Sınavı',
    badgeColor: '#ea580c',
    title: '2021 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'YKS tarihinin en seçici matematik ve fizik sorularını barındıran efsane zor sınav.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2021/YKS/2021_YKS_TYT_WEB.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2021/YKS/2021_YKS_AYT_WEB.pdf',
    tytSuiteId: 'osym-2021-tyt-full',
    aytSuiteId: 'osym-2021-ayt-full'
  },
  {
    year: 2020,
    badge: 'Pandemi Özel Müfredat',
    badgeColor: '#14b8a6',
    title: '2020 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'Pandemi sebebiyle 12. sınıf 2. dönem konularının dahil edilmediği özel oturum.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2020/YKS/2020_YKS_TYT_WEB.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2020/YKS/2020_YKS_AYT_WEB.pdf',
    tytSuiteId: 'osym-2020-tyt-full',
    aytSuiteId: 'osym-2020-ayt-full'
  },
  {
    year: 2019,
    badge: 'Klasik YKS Formatı',
    badgeColor: '#6366f1',
    title: '2019 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'Yeni nesil soruların ve problem metinlerinin tam oturduğu standart sınav oturumu.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2019/YKS/2019_TYT.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2019/YKS/2019_AYT.pdf',
    tytSuiteId: 'osym-2019-tyt-full',
    aytSuiteId: 'osym-2019-ayt-full'
  },
  {
    year: 2018,
    badge: 'İlk YKS Oturumu',
    badgeColor: '#8b5cf6',
    title: '2018 YKS (TYT & AYT) Resmi Soru Kitapçıkları',
    desc: 'YGS/LYS sisteminden YKS sistemine geçiş yapılan ilk sınav soru kitapçıkları.',
    tytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2018/YKS/TYT_2018.pdf',
    aytPdf: 'https://dokuman.osym.gov.tr/pdfdokuman/2018/YKS/AYT_2018.pdf',
    tytSuiteId: 'osym-2018-tyt-full',
    aytSuiteId: 'osym-2018-ayt-full'
  }
];

export default function TestlerPage() {
  const router = useRouter();
  const [mainView, setMainView] = useState<'pool' | 'history'>('pool');
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPoolSize: 8815,
    pastExamQuestions: 10,
    predictedQuestions: 5,
    testSuitesCount: 10
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom Test Builder Modal State
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    subject: 'Matematik',
    topic: 'all',
    examType: 'TYT',
    questionCount: 10,
    durationMinutes: 15,
    difficulty: 'all'
  });
  const [customBuilding, setCustomBuilding] = useState(false);

  const fetchSuites = async () => {
    try {
      const res = await fetch('/api/tests');
      if (res.ok) {
        const data = await res.json();
        setTestSuites(data.testSuites || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastSessions = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/user/tests');
      if (res.ok) {
        const data = await res.json();
        setPastSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchSuites();
    fetchPastSessions();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('subject');
      const cat = params.get('category');
      const yr = params.get('year');
      const tab = params.get('tab');
      if (sub) setSelectedSubject(sub);
      if (cat) setSelectedCategory(cat as TestCategory);
      if (yr) setSelectedYear(yr);
      if (tab === 'history') setMainView('history');
    }
  }, []);

  const handleStartCustomTest = async () => {
    haptics.impact('medium');
    setCustomBuilding(true);
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customForm)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.test) {
          // Store compiled custom test in sessionStorage for instant retrieval
          sessionStorage.setItem(`custom_test_${data.test.id}`, JSON.stringify(data.test));
          router.push(`/test-coz?customId=${data.test.id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCustomBuilding(false);
      setIsCustomModalOpen(false);
    }
  };

  const filteredSuites = testSuites.filter(suite => {
    const matchesCategory = selectedCategory === 'all' || suite.category === selectedCategory;
    const matchesSubject = selectedSubject === 'all' || suite.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchesYear = selectedYear === 'all' || (suite.year && suite.year.toString() === selectedYear);
    const matchesSearch = !searchQuery || 
      suite.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      suite.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suite.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubject && matchesYear && matchesSearch;
  });

  const availableTopics = customForm.subject && YKS_CURRICULUM_TAXONOMY[customForm.subject]
    ? YKS_CURRICULUM_TAXONOMY[customForm.subject].topics
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem calc(85px + env(safe-area-inset-bottom, 20px)) 1rem' }}>
      
      {/* ── Header & Action ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PRO TEST MERKEZİ & HAVUZU
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Canlı Havuz
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', color: '#fff', margin: 0, fontWeight: 800 }}>
            Testler & Soru Havuzu
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
            ÖSYM çıkmış soruları, 2025-2026 tahmin denemeleri ve sonsuz parametrik soru havuzu ile gerçek sınav provası.
          </p>
        </div>

        {/* Custom Test Builder Trigger Button */}
        <button
          onClick={() => {
            haptics.impact('light');
            setIsCustomModalOpen(true);
          }}
          className="btn-interactive"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            border: 'none',
            borderRadius: '14px',
            padding: '0.85rem 1.4rem',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus size={18} /> Özel Test Oluştur
        </button>
      </div>

      {/* ── View Mode Switcher (Pool vs History) ────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            haptics.selection();
            setMainView('pool');
          }}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: '12px',
            border: mainView === 'pool' ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
            background: mainView === 'pool' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(139, 92, 246, 0.15))' : 'rgba(255, 255, 255, 0.03)',
            color: mainView === 'pool' ? '#c7d2fe' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: mainView === 'pool' ? '0 4px 16px rgba(99, 102, 241, 0.2)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Layers size={17} /> Soru Havuzu & Denemeler
        </button>

        <button
          onClick={() => {
            haptics.selection();
            setMainView('history');
            if (pastSessions.length === 0) fetchPastSessions();
          }}
          style={{
            padding: '0.65rem 1.4rem',
            borderRadius: '12px',
            border: mainView === 'history' ? '1px solid rgba(16, 185, 129, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
            background: mainView === 'history' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15))' : 'rgba(255, 255, 255, 0.03)',
            color: mainView === 'history' ? '#a7f3d0' : '#94a3b8',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: mainView === 'history' ? '0 4px 16px rgba(16, 185, 129, 0.2)' : 'none',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Award size={17} /> Sınav Geçmişim & Karnelerim
          {pastSessions.length > 0 && (
            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '99px', background: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}>
              {pastSessions.length}
            </span>
          )}
        </button>
      </div>

      {mainView === 'history' ? (
        <div>
          {/* History Overview Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>{pastSessions.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tamamlanan Test</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#10b981', fontWeight: 800 }}>
                  {pastSessions.length > 0
                    ? (pastSessions.reduce((acc, s) => acc + (Number(s.score) || 0), 0) / pastSessions.length).toFixed(2)
                    : '0.00'} Net
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ortalama Net Skoru</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#f59e0b', fontWeight: 800 }}>
                  {pastSessions.reduce((acc, s) => acc + (Number(s.duration) || 0), 0)} dk
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toplam Çözüm Süresi</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} color="#a855f7" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#c084fc', fontWeight: 800 }}>
                  {pastSessions.length > 0 ? Math.max(...pastSessions.map(s => Number(s.score) || 0), 0).toFixed(2) : '0.00'} Net
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>En Yüksek Net Rekoru</div>
              </div>
            </div>
          </div>

          {/* Past Sessions List */}
          {historyLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#818cf8', fontWeight: 600 }}>
              Sınav geçmişiniz ve karneleriniz yükleniyor...
            </div>
          ) : pastSessions.length === 0 ? (
            <div className="premium-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <FileText size={32} color="#818cf8" />
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                Henüz Sınav Kaydı Bulunmuyor
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                ÖSYM çıkmış sorularını çözerek, branş denemelerine girerek veya özel test oluşturarak ilk karnenizi hemen oluşturun.
              </p>
              <button
                onClick={() => setMainView('pool')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Hemen Bir Test Çöz &rarr;
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pastSessions.map((s, idx) => {
                const answered = (s.correct_count || 0) + (s.wrong_count || 0);
                const accuracy = answered > 0 ? Math.round(((s.correct_count || 0) / answered) * 100) : 0;
                const formattedDate = s.created_at ? new Date(s.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Tarih Yok';

                return (
                  <motion.div
                    key={s.id || idx}
                    className="premium-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{ padding: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.15))', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: '#34d399' }}>
                        {s.score}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                            {s.test_type || 'Genel YKS Testi'}
                          </h4>
                          {s.details?.subject && (
                            <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
                              {s.details.subject}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} /> {formattedDate} • <Clock size={13} /> {s.duration || 0} dk
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#6ee7b7', fontSize: '0.82rem', fontWeight: 700 }}>
                          ✓ {s.correct_count || 0} D
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700 }}>
                          ✗ {s.wrong_count || 0} Y
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(148, 163, 184, 0.12)', border: '1px solid rgba(148, 163, 184, 0.25)', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700 }}>
                          - {s.blank_count || 0} B
                        </span>
                      </div>

                      <div style={{ padding: '4px 10px', borderRadius: '8px', background: accuracy >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: accuracy >= 70 ? '#34d399' : '#fcd34d', fontWeight: 800, fontSize: '0.82rem' }}>
                        %{accuracy} Başarı
                      </div>

                      <Link href="/hata-defteri" style={{ textDecoration: 'none' }}>
                        <button
                          style={{
                            padding: '6px 14px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#e2e8f0',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s'
                          }}
                        >
                          Hataları İncele &rarr;
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Pool Stats Bar ─────────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>{stats.totalPoolSize.toLocaleString()}+</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toplam Aktif Soru Havuzu</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>2018 - 2024</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ÖSYM Çıkmış Sorular</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={22} color="#a855f7" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>2025 - 2026</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nokta Atışı Çıkabilecekler</div>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>Sonsuz Parametrik</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Algoritmik Soru Üretimi</div>
              </div>
            </div>
          </div>

          {/* ── Filters & Category Bar ────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            
            {/* Category Pill Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { id: 'all', label: 'Tüm Testler', icon: '🌟' },
                { id: 'pdf_archive', label: 'ÖSYM Resmi PDF Arşivi', icon: '📥' },
                { id: 'past_exam', label: 'ÖSYM Çıkmış Sorular', icon: '🏛️' },
                { id: 'predicted', label: '2025-2026 Tahmin Denemeleri', icon: '🎯' },
                { id: 'branch_trial', label: 'Hızlı Branş Denemeleri', icon: '⚡' },
                { id: 'meb_kazanim', label: 'MEB Maarif Kazanım', icon: '📚' },
                { id: 'procedural', label: 'Sonsuz Parametrik', icon: '♾️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    haptics.selection();
                    setSelectedCategory(tab.id as TestCategory);
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: selectedCategory === tab.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                    color: selectedCategory === tab.id ? '#fff' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Year Quick Filter Bar (2018 - 2026) */}
            <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, marginRight: '4px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} color="#818cf8" /> Sınav Yılı:
              </span>
              {[
                { id: 'all', label: 'Tüm Yıllar' },
                { id: '2026', label: '2026 Maarif', badge: 'Vizyon' },
                { id: '2025', label: '2025', badge: 'Son Çıkmış' },
                { id: '2024', label: '2024', badge: 'Çıkmış' },
                { id: '2023', label: '2023', badge: 'Çıkmış' },
                { id: '2022', label: '2022', badge: 'Çıkmış' },
                { id: '2021', label: '2021', badge: 'Zor Sınav' },
                { id: '2020', label: '2020', badge: 'Pandemi' },
                { id: '2019', label: '2019', badge: 'Çıkmış' },
                { id: '2018', label: '2018', badge: 'İlk YKS' },
              ].map(yr => (
                <button
                  key={yr.id}
                  onClick={() => {
                    haptics.selection();
                    setSelectedYear(yr.id);
                  }}
                  style={{
                    padding: '0.38rem 0.8rem',
                    borderRadius: '8px',
                    border: selectedYear === yr.id ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: selectedYear === yr.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedYear === yr.id ? '#c7d2fe' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {yr.label}
                  {yr.badge && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: selectedYear === yr.id ? 'rgba(99, 102, 241, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                      color: selectedYear === yr.id ? '#fff' : '#64748b'
                    }}>
                      {yr.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search & Subject Dropdown Bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Test veya ders adı ara... (Örn: 2024 AYT Matematik, Paragraf)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Ders:</span>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  style={{
                    padding: '0.6rem 1.8rem 0.6rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">Tüm Dersler</option>
                  <option value="Matematik">Matematik</option>
                  <option value="Geometri">Geometri</option>
                  <option value="Fizik">Fizik</option>
                  <option value="Kimya">Kimya</option>
                  <option value="Biyoloji">Biyoloji</option>
                  <option value="Türkçe">Türkçe</option>
                  <option value="Tarih">Tarih</option>
                  <option value="Coğrafya">Coğrafya</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── ÖSYM Resmi PDF Arşivi Hızlı Erişim Banner'ı (Normal Görünümde) ── */}
          {selectedCategory !== 'pdf_archive' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card"
              style={{
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(99, 102, 241, 0.12))',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileDown size={24} color="#f87171" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: '#ef4444', color: '#fff' }}>
                      ÖSYM RESMİ DÖKÜMANLARI
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>2018 – 2024 (8 Yılın Tüm Kitapçıkları)</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 800 }}>
                    ÖSYM Resmi Sınav Kitapçıkları & PDF İndirme Merkezi
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    120 TYT ve 80 AYT orijinal soru kitapçıklarını doğrudan PDF olarak indirin veya platformda 1-tıkla süre tutarak çözün.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  haptics.selection();
                  setSelectedCategory('pdf_archive');
                }}
                className="btn-interactive"
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Download size={16} /> PDF Arşivini Görüntüle & İndir
              </button>
            </motion.div>
          )}

          {/* ── ÖSYM Resmi PDF Arşivi & Kitapçık İndirme Hub'ı (Seçildiğinde) ── */}
          {selectedCategory === 'pdf_archive' ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              {/* Header Info */}
              <div
                className="premium-card"
                style={{
                  padding: '1.5rem 1.75rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(168, 85, 247, 0.1))',
                  border: '1px solid rgba(239, 68, 68, 0.35)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '20px', background: '#ef4444', color: '#fff' }}>
                    T.C. ÖSYM RESMİ DÖKÜMANLARI
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700 }}>Doğrulanmış Orijinal Kitapçıklar</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
                  2018 – 2024 YKS Soru Kitapçıkları & PDF İndirme Arşivi
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>
                  ÖSYM tarafından kamuoyuna sunulan tüm geçmiş yılların temel soru kitapçıkları ve resmi cevap anahtarları aşağıda listelenmiştir. Dilediğiniz sınavın resmi PDF&apos;ini cihazınıza indirebilir ya da <strong>&quot;Platformda Çöz&quot;</strong> butonuna tıklayarak 120 TYT / 80 AYT orijinal süre ve optik form desteğiyle canlı sınav provası yapabilirsiniz.
                </p>
              </div>

              {/* PDF Archive Year Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                {OSYM_PDF_ARCHIVE.map(item => (
                  <div
                    key={item.year}
                    className="premium-card"
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'border 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff' }}>
                            {item.year} YKS
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 9px', borderRadius: '12px', background: `${item.badgeColor}22`, color: item.badgeColor, border: `1px solid ${item.badgeColor}44` }}>
                            {item.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8' }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                      {/* TYT Card */}
                      <div style={{ padding: '1.15rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>TYT</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>Temel Yeterlilik Testi</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>120 Soru • 165 Dk</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                          <a
                            href={item.tytPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              textDecoration: 'none',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Download size={15} color="#38bdf8" /> Resmi PDF İndir
                          </a>
                          <Link
                            href={`/test-coz?id=${item.tytSuiteId}`}
                            style={{
                              flex: 1,
                              textDecoration: 'none',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)'
                            }}
                          >
                            <Play size={15} fill="#fff" /> Platformda Çöz (120 Soru)
                          </Link>
                        </div>
                      </div>

                      {/* AYT Card */}
                      <div style={{ padding: '1.15rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>AYT</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>Alan Yeterlilik Testi (Sayısal)</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>80 Soru • 180 Dk</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1rem' }}>
                          <a
                            href={item.aytPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              textDecoration: 'none',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#cbd5e1',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Download size={15} color="#c084fc" /> Resmi PDF İndir
                          </a>
                          <Link
                            href={`/test-coz?id=${item.aytSuiteId}`}
                            style={{
                              flex: 1,
                              textDecoration: 'none',
                              padding: '0.65rem 0.85rem',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                              border: 'none',
                              color: '#fff',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              boxShadow: '0 2px 10px rgba(168, 85, 247, 0.3)'
                            }}
                          >
                            <Play size={15} fill="#fff" /> Platformda Çöz (80 Soru)
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MEB OGM Materyal Resource Card */}
              <div
                className="premium-card"
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#10b981', color: '#fff' }}>
                      MEB RESMİ KAZANIM
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 700 }}>OGM Materyal & EBA</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
                    Milli Eğitim Bakanlığı YKS Hazırlık & Çevrim İçi Deneme Sınavları
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                    MEB Ortaöğretim Genel Müdürlüğü tarafından hazırlanan konu özetleri, soru bankaları ve Türkiye geneli deneme sınavlarına doğrudan erişin.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <a
                    href="https://ogmmateryal.eba.gov.tr/yks-hazirlik"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ExternalLink size={15} /> OGM YKS Hazırlık
                  </a>
                  <a
                    href="https://ogmmateryal.eba.gov.tr/deneme-sinavlari"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration: 'none',
                      padding: '0.65rem 1.15rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <ExternalLink size={15} /> MEB Deneme Sınavları
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* ── Test Suites Grid ─────────────────────────────────────────────── */}
              {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center', color: '#818cf8', fontSize: '1rem', fontWeight: 600 }}>
                  Soru havuzu ve testler yükleniyor...
                </div>
              ) : filteredSuites.length === 0 ? (
                <div className="premium-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  Seçilen kriterlere uygun test bulunamadı. Lütfen filtrelerinizi sıfırlayın veya &quot;Özel Test Oluştur&quot; ile kendi testinizi yaratın.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {filteredSuites.map((suite, idx) => (
                    <motion.div
                      key={suite.id}
                      className="premium-card"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: `${suite.badgeColor}22`, color: suite.badgeColor, border: `1px solid ${suite.badgeColor}44` }}>
                            {suite.difficultyLabel} • {suite.examType}
                          </span>
                          {suite.year && (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                              📅 {suite.year}
                            </span>
                          )}
                        </div>

                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: 700, lineHeight: 1.4 }}>
                          {suite.title}
                        </h3>

                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {suite.description}
                        </p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <FileText size={15} color="#38bdf8" /> {suite.questionCount} Soru
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={15} color="#f59e0b" /> {suite.durationMinutes} Dakika
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#a855f7' }}>
                            <Award size={15} /> +{suite.questionCount * 15} XP
                          </span>
                        </div>

                        <Link href={`/test-coz?id=${suite.id}`} style={{ textDecoration: 'none' }}>
                          <button
                            className="btn-interactive"
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Play size={16} fill="#fff" /> Sınavı Başlat
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Custom Test Builder Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {isCustomModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              style={{
                width: '100%',
                maxWidth: '520px',
                background: '#0e1526',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SlidersHorizontal size={20} color="#818cf8" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>Kişisel Test Oluşturucu</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Milyonluk havuzdan dilediğin parametrelerle anında sınav derle.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Sınav Tipi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Sınav Oturumu</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['TYT', 'AYT'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCustomForm(f => ({ ...f, examType: type }))}
                        style={{
                          flex: 1,
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: customForm.examType === type ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                          background: customForm.examType === type ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: customForm.examType === type ? '#fff' : '#94a3b8',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ders Seçimi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Ders</label>
                  <select
                    value={customForm.subject}
                    onChange={e => setCustomForm(f => ({ ...f, subject: e.target.value, topic: 'all' }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    {Object.keys(YKS_CURRICULUM_TAXONOMY).map(subj => (
                      <option key={subj} value={subj} style={{ background: '#0e1526' }}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Konu Seçimi */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Konu</label>
                  <select
                    value={customForm.topic}
                    onChange={e => setCustomForm(f => ({ ...f, topic: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="all" style={{ background: '#0e1526' }}>Tüm Konulardan Karışık</option>
                    {availableTopics.map(t => (
                      <option key={t} value={t} style={{ background: '#0e1526' }}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Soru Sayısı ve Süre */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Soru Sayısı</label>
                    <select
                      value={customForm.questionCount}
                      onChange={e => setCustomForm(f => ({ 
                        ...f, 
                        questionCount: Number(e.target.value),
                        durationMinutes: Math.round(Number(e.target.value) * 1.5)
                      }))}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    >
                      <option value={5} style={{ background: '#0e1526' }}>5 Soru (Mini)</option>
                      <option value={10} style={{ background: '#0e1526' }}>10 Soru (Standart)</option>
                      <option value={15} style={{ background: '#0e1526' }}>15 Soru (Branş)</option>
                      <option value={20} style={{ background: '#0e1526' }}>20 Soru (Yoğun)</option>
                      <option value={40} style={{ background: '#0e1526' }}>40 Soru (Tam Oturum)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Süre (Dakika)</label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={customForm.durationMinutes}
                      onChange={e => setCustomForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Zorluk */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>Zorluk Seviyesi</label>
                  <select
                    value={customForm.difficulty}
                    onChange={e => setCustomForm(f => ({ ...f, difficulty: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  >
                    <option value="all" style={{ background: '#0e1526' }}>Dengeli (ÖSYM Karışık)</option>
                    <option value="2" style={{ background: '#0e1526' }}>Temel Kavrama (Kolay)</option>
                    <option value="3" style={{ background: '#0e1526' }}>ÖSYM Standartı (Orta)</option>
                    <option value="4" style={{ background: '#0e1526' }}>Seçici & Zor (İleri Düzey)</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleStartCustomTest}
                  disabled={customBuilding}
                  className="btn-interactive"
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.85rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: customBuilding ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Play size={16} fill="#fff" />
                  {customBuilding ? 'Test Derleniyor...' : 'Özel Testi Başlat'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
