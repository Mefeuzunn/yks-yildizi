import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

interface MistakeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakeData: any | {
    subject: string;
    topic: string;
    errorType: string;
    questionId: string;
  } | null;
}

export default function MistakeDetailModal({ isOpen, onClose, mistakeData }: MistakeDetailModalProps) {
  const [showAI, setShowAI] = useState(false);

  if (!isOpen || !mistakeData) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          style={{
            width: '90%', maxWidth: '900px', height: '80vh', backgroundColor: '#0a0d14',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                {mistakeData.subject}
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{mistakeData.topic}</h2>
                <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>Hata Tipi: {mistakeData.errorType}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: '36px', height: '36px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }} className="hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1, overflowY: 'auto' }}>
            {/* Left: The Question */}
            <div style={{ flex: '999 1 300px', padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Soru ({mistakeData.questionId})</h3>
              

              <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', minHeight: '300px' }}>
                {mistakeData.imageData && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={mistakeData.imageData} alt="Soru Görseli" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {mistakeData.icerik || 'Soru metni bulunamadı.'}
                </p>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {mistakeData.secenekler && Array.isArray(mistakeData.secenekler) ? mistakeData.secenekler.map((opt: string, i: number) => {
                    const isSelected = opt === mistakeData.secilenCevap || (['A','B','C','D','E'][i] === mistakeData.secilenCevap);
                    const isCorrect = opt === mistakeData.dogruCevap || (['A','B','C','D','E'][i] === mistakeData.dogruCevap);
                    let bgColor = 'rgba(255,255,255,0.02)';
                    let borderColor = 'rgba(255,255,255,0.05)';
                    let color = 'rgba(255,255,255,0.7)';
                    let suffix = '';

                    if (isCorrect) {
                      bgColor = 'rgba(16, 185, 129, 0.1)';
                      borderColor = '#10b981';
                      color = '#10b981';
                      suffix = ' (Doğru Cevap)';
                    } else if (isSelected) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = '#ef4444';
                      color = '#ef4444';
                      suffix = ' (İşaretlenen)';
                    }

                    return (
                      <div key={i} style={{ 
                        padding: '1rem', borderRadius: '8px', 
                        backgroundColor: bgColor,
                        border: `1px solid ${borderColor}`,
                        color: color
                      }}>
                        {['A', 'B', 'C', 'D', 'E'][i]}) {opt}{suffix}
                      </div>
                    )
                  }) : null}
                </div>
              </div>
            </div>

            {/* Right: AstraTutor Solution */}
            <div style={{ flex: '1 1 300px', backgroundColor: '#050505', display: 'flex', flexDirection: 'column' }}>
              {!showAI ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <Sparkles size={40} color="#6366f1" />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Soruyu Anlayamadın mı?</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    AstraTutor bu sorunun çözümünü sana adım adım, mantığını anlatarak çözebilir.
                  </p>
                  <button 
                    onClick={() => setShowAI(true)}
                    style={{ padding: '0.75rem 2rem', backgroundColor: '#6366f1', color: '#fff', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    className="hover:bg-indigo-500 transition-colors"
                  >
                    AstraTutor'a Sor <ArrowRight size={18} />
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Sparkles size={20} color="#6366f1" />
                    <span style={{ color: '#fff', fontWeight: 700 }}>AstraTutor Çözümü</span>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '12px', color: '#e0e7ff', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      Merhaba Efe! Bu soruda "İşlem Hatası" yaptığını görüyorum. Formülü doğru hatırlamışsın ancak değerleri yerine koyarken küçük bir dikkatsizlik olmuş.
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      <strong>1. Adım:</strong> F = m * a formülünü uygulayacağız.<br/><br/>
                      <strong>2. Adım:</strong> Toplam kütle m1 + m2 = 5kg.<br/><br/>
                      <strong>3. Adım:</strong> F = 125N. 125 = 5 * a'dan a = 25 bulmalıyız. <br/><br/>
                      Senin işaretlediğin 15 değeri, sadece 3kg'lık cismi hesaba kattığında çıkar. Ortak ivmeyi bulurken toplam kütleyi almayı unutma! 😊
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Başka bir sorun var mı?"
                      style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', color: '#fff' }}
                    />
                    <button style={{ backgroundColor: '#6366f1', border: 'none', width: '45px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                       <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
