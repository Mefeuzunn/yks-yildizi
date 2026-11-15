"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calculator, Atom, FlaskConical, Dna, ChevronDown,
  Compass, Globe, Landmark, Feather, Lightbulb, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { curriculumData } from '@/lib/data/curriculum';

type ExamType = 'TYT' | 'AYT';

export default function KonularPage() {
  const [activeTab, setActiveTab] = useState<ExamType>('TYT');
  const [expandedSubject, setExpandedSubject] = useState<string | null>('Matematik');

  const icons: Record<string, React.ReactNode> = {
    Matematik: <Calculator size={24} color="#2563eb" />,
    Geometri: <Compass size={24} color="#0284c7" />,
    Fizik: <Atom size={24} color="#0ea5e9" />,
    Kimya: <FlaskConical size={24} color="#0d9488" />,
    Biyoloji: <Dna size={24} color="#059669" />,
    Türkçe: <Feather size={24} color="#dc2626" />,
    "Türk Dili ve Edebiyatı": <BookOpen size={24} color="#d97706" />,
    Tarih: <Landmark size={24} color="#b45309" />,
    Coğrafya: <Globe size={24} color="#047857" />,
    "Felsefe & Din": <Lightbulb size={24} color="#ca8a04" />
  };

  const colors: Record<string, string> = {
    Matematik: 'rgba(37, 99, 235, 0.1)',
    Geometri: 'rgba(2, 132, 199, 0.1)',
    Fizik: 'rgba(14, 165, 233, 0.1)',
    Kimya: 'rgba(13, 148, 136, 0.1)',
    Biyoloji: 'rgba(5, 150, 105, 0.1)',
    Türkçe: 'rgba(220, 38, 38, 0.1)',
    "Türk Dili ve Edebiyatı": 'rgba(217, 119, 6, 0.1)',
    Tarih: 'rgba(180, 83, 9, 0.1)',
    Coğrafya: 'rgba(4, 120, 87, 0.1)',
    "Felsefe & Din": 'rgba(202, 138, 4, 0.1)'
  };

  const borderColors: Record<string, string> = {
    Matematik: '#2563eb',
    Geometri: '#0284c7',
    Fizik: '#0ea5e9',
    Kimya: '#0d9488',
    Biyoloji: '#059669',
    Türkçe: '#dc2626',
    "Türk Dili ve Edebiyatı": '#d97706',
    Tarih: '#b45309',
    Coğrafya: '#047857',
    "Felsefe & Din": '#ca8a04'
  };

  const currentData = (curriculumData as Record<string, any>)[activeTab] || {};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={24} color="#2563eb" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 800 }}>Dersler ve Konular</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>ÖSYM YKS ve MEB müfredatına tam uyumlu tüm ders ve konular.</p>
        </div>
      </div>

      {/* TYT / AYT Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '2rem', maxWidth: '340px' }}>
        <button 
          onClick={() => setActiveTab('TYT')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, background: activeTab === 'TYT' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent', color: activeTab === 'TYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >TYT (9-10. Sınıf)</button>
        <button 
          onClick={() => setActiveTab('AYT')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700, background: activeTab === 'AYT' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', color: activeTab === 'AYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >AYT (11-12. Sınıf)</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.keys(currentData).map((subject, index) => {
          const isExpanded = expandedSubject === subject;
          const topics = currentData[subject] || [];
          const icon = icons[subject] || <Sparkles size={24} color="#2563eb" />;
          const color = colors[subject] || 'rgba(37, 99, 235, 0.1)';
          const borderColor = borderColors[subject] || '#2563eb';

          return (
            <motion.div 
              key={subject}
              className="premium-card" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.05 }}
              style={{ padding: '0', overflow: 'hidden' }}
            >
              {/* Accordion Header */}
              <div 
                onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, fontWeight: 700 }}>{subject}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>{topics.length} Ana Konu Başlığı</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                  <ChevronDown size={22} color="var(--text-secondary)" />
                </motion.div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
                      {topics.map((t: any, idx: number) => {
                        const turkishToEnglish: Record<string, string> = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
                        const slugify = (text: string) => text.split('').map(char => turkishToEnglish[char] || char).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        const slug = slugify(t.topic);
                        const subjSlug = slugify(subject);

                        return (
                          <div key={idx} style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '10px', borderLeft: `3px solid ${borderColor}`, border: '1px solid rgba(255,255,255,0.05)', borderLeftWidth: '3px', borderLeftColor: borderColor }}>
                            <Link href={`/konular/${subjSlug}/${slug}`} style={{ textDecoration: 'none' }}>
                              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: 600 }} className="hover:text-blue-400 transition-colors">
                                <span>{t.topic}</span>
                                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', color: '#cbd5e1' }}>Derse Git ➔</span>
                              </h4>
                            </Link>

                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {(t.subtopics || []).map((sub: string, sIdx: number) => (
                                <li key={sIdx}>
                                  <Link 
                                    href={`/konular/${subjSlug}/${slug}`}
                                    style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0', transition: 'color 0.2s' }}
                                    className="hover:text-white"
                                  >
                                    <span style={{ color: borderColor, fontSize: '0.9rem' }}>•</span> {sub}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
