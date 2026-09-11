"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calculator, Atom, FlaskConical, Dna, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { curriculumData } from '@/lib/data/curriculum';

type ExamType = 'TYT' | 'AYT';
type SubjectType = 'Matematik' | 'Fizik' | 'Kimya' | 'Biyoloji';

export default function KonularPage() {
  const [activeTab, setActiveTab] = useState<ExamType>('TYT');
  const [expandedSubject, setExpandedSubject] = useState<SubjectType | null>('Matematik');

  const icons: Record<SubjectType, React.ReactNode> = {
    Matematik: <Calculator size={24} color="#38bdf8" />,
    Fizik: <Atom size={24} color="#8b5cf6" />,
    Kimya: <FlaskConical size={24} color="#10b981" />,
    Biyoloji: <Dna size={24} color="#f59e0b" />
  };

  const colors: Record<SubjectType, string> = {
    Matematik: 'rgba(56, 189, 248, 0.1)',
    Fizik: 'rgba(139, 92, 246, 0.1)',
    Kimya: 'rgba(16, 185, 129, 0.1)',
    Biyoloji: 'rgba(245, 158, 11, 0.1)'
  };

  const borderColors: Record<SubjectType, string> = {
    Matematik: '#38bdf8',
    Fizik: '#8b5cf6',
    Kimya: '#10b981',
    Biyoloji: '#f59e0b'
  };

  const currentData = curriculumData[activeTab];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={24} color="#8b5cf6" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Dersler ve Konular</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Müfredata uygun tüm konuları sınıf ve sınava göre incele.</p>
        </div>
      </div>

      {/* TYT / AYT Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '2rem', maxWidth: '300px' }}>
        <button 
          onClick={() => setActiveTab('TYT')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, background: activeTab === 'TYT' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: activeTab === 'TYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >TYT (9-10. Sınıf)</button>
        <button 
          onClick={() => setActiveTab('AYT')}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, background: activeTab === 'AYT' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: activeTab === 'AYT' ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
        >AYT (11-12. Sınıf)</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(Object.keys(currentData) as SubjectType[]).map((subject, index) => {
          const isExpanded = expandedSubject === subject;
          const topics = currentData[subject];

          return (
            <motion.div 
              key={subject}
              className="premium-card" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }}
              style={{ padding: '0', overflow: 'hidden' }}
            >
              {/* Accordion Header */}
              <div 
                onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: colors[subject], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icons[subject]}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>{subject}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{topics.length} Ana Konu Başlığı</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                  <ChevronDown size={24} color="var(--text-secondary)" />
                </motion.div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                      {topics.map((t, idx) => (
                        <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${borderColors[subject]}` }}>
                          
                          {(() => {
                            // Slugify function that properly converts Turkish characters to English
                            const turkishToEnglish: Record<string, string> = { 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C' };
                            const slugify = (text: string) => text.split('').map(char => turkishToEnglish[char] || char).join('').toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const slug = slugify(t.topic);
                            const subjSlug = slugify(subject);

                            return (
                              <>
                                <Link href={`/konular/${subjSlug}/${slug}`} style={{ textDecoration: 'none' }}>
                                  <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} className="hover:text-purple-400 transition-colors">
                                    {t.topic}
                                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#cbd5e1' }}>Derse Git ➔</span>
                                  </h4>
                                </Link>

                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {t.subtopics.map((sub: string, sIdx: number) => (
                                    <li key={sIdx}>
                                      <Link 
                                        href={`/konular/${subjSlug}/${slug}`}
                                        style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', transition: 'color 0.2s' }}
                                        className="hover:text-white"
                                      >
                                        <span style={{ color: borderColors[subject] }}>•</span> {sub}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            );
                          })()}
                        </div>
                      ))}
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
