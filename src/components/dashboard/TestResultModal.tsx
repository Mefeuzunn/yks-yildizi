import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Award, Clock } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultData: {
    name: string;
    score: number;
    total: number;
    accuracy: number;
    timeSpent: string;
  } | null;
}

export default function TestResultModal({ isOpen, onClose, resultData }: TestResultModalProps) {
  if (!isOpen || !resultData) return null;

  const radarData = [
    { subject: 'Bilgi', A: Math.min(100, resultData.accuracy + 10), fullMark: 100 },
    { subject: 'Hız', A: resultData.timeSpent.includes('Dk') ? 85 : 60, fullMark: 100 },
    { subject: 'Dikkat', A: Math.max(0, resultData.accuracy - 5), fullMark: 100 },
    { subject: 'Analiz', A: resultData.accuracy, fullMark: 100 },
    { subject: 'Muhakeme', A: Math.min(100, resultData.accuracy + 5), fullMark: 100 },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{
            width: '90%', maxWidth: '800px', backgroundColor: '#0a0d14',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>Sınav Sonucu</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>{resultData.name} testini tamamladın!</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }} className="hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', padding: '2rem', gap: '2rem' }}>
            
            {/* Stats Left */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#10b981', width: '60px', height: '60px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Target size={30} />
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Doğru Sayısı</div>
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: 800 }}>{resultData.score} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/ {resultData.total}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={24} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>%{resultData.accuracy}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Başarı Oranı</div>
                </div>
                
                <div style={{ flex: 1, backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} color="#f59e0b" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>{resultData.timeSpent}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Harcanan Süre</div>
                </div>
              </div>
            </div>

            {/* Radar Chart Right */}
            <div style={{ flex: 1, backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', height: '300px' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', textAlign: 'center', marginBottom: '1rem' }}>Yetenek Analizi</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Öğrenci" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

          </div>
          
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '0.75rem 2rem', backgroundColor: '#fff', color: '#000', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }} className="hover:bg-gray-200">
              Analizlere Dön
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
