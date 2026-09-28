import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, ChevronRight, ChevronLeft, Flag } from 'lucide-react';

interface ActiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testData: {
    id: number;
    name: string;
    subject: string;
    questions: number;
    time: string; // e.g. "40 Dk"
  } | null;
  onFinish: (score: number, accuracy: number, timeSpent: string) => void;
}

export default function ActiveTestModal({ isOpen, onClose, testData, onFinish }: ActiveTestModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [showMobileOptic, setShowMobileOptic] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const toggleFlag = (qNum: number) => setFlaggedQuestions(p => ({ ...p, [qNum]: !p[qNum] }));

  useEffect(() => {
    if (isOpen && testData) {
      setCurrentQuestion(1);
      setAnswers({});
      setFlaggedQuestions({});
      setShowMobileOptic(false);
      // Parse time
      const minutes = parseInt(testData.time.split(' ')[0]);
      setTimeLeft(minutes * 60);
    }
  }, [isOpen, testData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isOpen) {
      handleFinish(); // Auto finish if time is up
    }
    return () => clearInterval(interval);
  }, [isOpen, timeLeft]);

  if (!isOpen || !testData) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qNumber: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qNumber]: prev[qNumber] === option ? '' : option }));
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch (_) {}
    }
  };

  const handleFinish = () => {
    // Mock logic to calculate score
    const answeredCount = Object.keys(answers).length;
    const mockCorrect = Math.floor(answeredCount * 0.8); // 80% accuracy mock
    const score = mockCorrect;
    const accuracy = answeredCount === 0 ? 0 : Math.round((mockCorrect / answeredCount) * 100);
    
    // Time spent calculation
    const totalSeconds = parseInt(testData.time.split(' ')[0]) * 60;
    const spentSeconds = totalSeconds - timeLeft;
    const spentMins = Math.floor(spentSeconds / 60);
    
    onFinish(score, accuracy, `${spentMins} Dk`);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#050505',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          minHeight: '64px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem clamp(1rem, 3vw, 2rem)',
          backgroundColor: '#0a0d14',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{testData.name}</h2>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{testData.subject} • Soru {currentQuestion}/{testData.questions}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeLeft < 300 ? '#ef4444' : '#10b981', fontWeight: 800, fontSize: '1.05rem', background: timeLeft < 300 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
              <Clock size={16} />
              {formatTime(timeLeft)}
            </div>

            <button 
              type="button"
              onClick={() => setShowMobileOptic(true)}
              className="mobile-only"
              style={{ padding: '0.45rem 0.85rem', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '8px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Optik ({Object.values(answers).filter(Boolean).length})
            </button>
            
            <button 
              type="button"
              onClick={handleFinish}
              style={{ padding: '0.45rem 1.1rem', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
              className="hover:bg-blue-600 transition-colors"
            >
              Sınavı Bitir
            </button>
            <button type="button" onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} className="hover:text-white">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Mobile-Only Question Quick-Ribbon */}
        <div className="mobile-only" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 12px', background: '#080b12', borderBottom: '1px solid rgba(255,255,255,0.06)', WebkitOverflowScrolling: 'touch' }}>
          {Array.from({ length: testData.questions }).map((_, idx) => {
            const qNum = idx + 1;
            const isCurrent = qNum === currentQuestion;
            const ans = answers[qNum];
            const isFlagged = flaggedQuestions[qNum];
            return (
              <button
                key={qNum}
                type="button"
                onClick={() => setCurrentQuestion(qNum)}
                style={{
                  flex: '0 0 auto',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: isCurrent ? '2px solid #38bdf8' : isFlagged ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  background: ans ? '#2563eb' : isCurrent ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                  color: ans || isCurrent ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {ans ? ans : qNum}
                {isFlagged && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
          
          {/* Left: Question Area */}
          <div style={{ flex: '999 1 300px', padding: 'clamp(1rem, 2.5vw, 1.5rem)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            
            <div style={{ flex: 1, backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(1.2rem, 3.5vw, 2.5rem)', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                 <button 
                   type="button"
                   onClick={() => toggleFlag(currentQuestion)}
                   style={{ background: 'transparent', border: 'none', color: flaggedQuestions[currentQuestion] ? '#f59e0b' : 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }} 
                   className="hover:text-amber-500 transition-colors"
                 >
                    <Flag size={16} fill={flaggedQuestions[currentQuestion] ? '#f59e0b' : 'none'} /> {flaggedQuestions[currentQuestion] ? 'İşaretlendi' : 'Boş Bırak / İşaretle'}
                 </button>
               </div>
               
               <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Soru {currentQuestion}</h3>
               <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                 Yapay Zeka tarafından oluşturulmuş mock soru metni burada yer alacak. Gerçek sistemde bu alanda PDF veya görsel render edilebilir. 
                 <br/><br/>
                 Buna göre aşağıdakilerden hangisi yanlıştır?
               </p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {['A', 'B', 'C', 'D', 'E'].map(opt => (
                    <button 
                      key={opt}
                      type="button"
                      onClick={() => handleSelectAnswer(currentQuestion, opt)}
                      style={{ 
                        padding: '0.9rem 1rem', 
                        minHeight: '48px',
                        textAlign: 'left',
                        backgroundColor: answers[currentQuestion] === opt ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${answers[currentQuestion] === opt ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '12px',
                        color: answers[currentQuestion] === opt ? '#60a5fa' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                      className="hover:bg-white/5"
                    >
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        backgroundColor: answers[currentQuestion] === opt ? '#3b82f6' : 'transparent',
                        border: `1.5px solid ${answers[currentQuestion] === opt ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: answers[currentQuestion] === opt ? '#fff' : 'rgba(255,255,255,0.6)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0
                      }}>
                        {opt}
                      </div>
                      <span style={{ fontSize: '0.95rem' }}>Mock şık açıklaması {opt}.</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={() => setCurrentQuestion(p => Math.max(1, p - 1))}
                disabled={currentQuestion === 1}
                style={{ flex: '1 0 120px', minHeight: '46px', padding: '0.75rem 1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', color: currentQuestion === 1 ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', cursor: currentQuestion === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600 }}
              >
                <ChevronLeft size={18} /> Önceki Soru
              </button>
              <button 
                type="button"
                onClick={() => setCurrentQuestion(p => Math.min(testData.questions, p + 1))}
                disabled={currentQuestion === testData.questions}
                style={{ flex: '1 0 120px', minHeight: '46px', padding: '0.75rem 1.25rem', backgroundColor: currentQuestion === testData.questions ? 'rgba(255,255,255,0.05)' : '#3b82f6', color: currentQuestion === testData.questions ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '10px', border: 'none', cursor: currentQuestion === testData.questions ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
              >
                Sonraki Soru <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right: Optik Form (Desktop Only) */}
          <div className="desktop-only" style={{ flex: '1 1 300px', backgroundColor: '#0a0d14', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
             <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span>Optik Form</span>
               <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{Object.values(answers).filter(Boolean).length} / {testData.questions}</span>
             </h3>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {Array.from({ length: testData.questions }).map((_, idx) => {
                 const qNum = idx + 1;
                 const isCurrent = qNum === currentQuestion;
                 return (
                   <div 
                     key={qNum} 
                     style={{ 
                       display: 'flex', alignItems: 'center', gap: '1rem', 
                       padding: '0.5rem', borderRadius: '8px',
                       backgroundColor: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                       cursor: 'pointer'
                     }}
                     onClick={() => setCurrentQuestion(qNum)}
                   >
                     <div style={{ width: '25px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', textAlign: 'right' }}>{qNum}.</div>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {['A', 'B', 'C', 'D', 'E'].map(opt => (
                         <button
                           key={opt}
                           type="button"
                           onClick={(e) => { e.stopPropagation(); handleSelectAnswer(qNum, opt); }}
                           style={{
                             width: '24px', height: '24px', borderRadius: '12px',
                             border: `1px solid ${answers[qNum] === opt ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                             backgroundColor: answers[qNum] === opt ? '#3b82f6' : 'transparent',
                             color: answers[qNum] === opt ? '#fff' : 'rgba(255,255,255,0.3)',
                             fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                             cursor: 'pointer', padding: 0
                           }}
                         >
                           {opt}
                         </button>
                       ))}
                     </div>
                   </div>
                 )
               })}
             </div>
          </div>

        </div>

        {/* Mobile Optic Bottom Sheet Drawer */}
        <AnimatePresence>
          {showMobileOptic && (
            <div
              className="modal-overlay-mobile"
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
              onClick={() => setShowMobileOptic(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-content"
                style={{
                  width: '100vw',
                  backgroundColor: '#0a0d14',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px 24px 0 0',
                  padding: '16px 20px calc(24px + env(safe-area-inset-bottom)) 20px',
                  maxHeight: '82dvh',
                  overflowY: 'auto'
                }}
              >
                <div className="modal-drag-handle" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Optik Form</h3>
                  <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    {Object.values(answers).filter(Boolean).length} / {testData.questions} Dolu
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                  {Array.from({ length: testData.questions }).map((_, idx) => {
                    const qNum = idx + 1;
                    const ans = answers[qNum];
                    return (
                      <div
                        key={qNum}
                        onClick={() => { setCurrentQuestion(qNum); setShowMobileOptic(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          background: qNum === currentQuestion ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                          border: qNum === currentQuestion ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#9ca3af' }}>{qNum}.</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {['A', 'B', 'C', 'D', 'E'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSelectAnswer(qNum, opt); }}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                border: `1px solid ${ans === opt ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                                backgroundColor: ans === opt ? '#3b82f6' : 'transparent',
                                color: ans === opt ? '#fff' : 'rgba(255,255,255,0.4)',
                                fontSize: '10px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </AnimatePresence>
  );
}
