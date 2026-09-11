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
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isOpen && testData) {
      setCurrentQuestion(1);
      setAnswers({});
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
    setAnswers(prev => ({ ...prev, [qNumber]: option }));
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
          height: '70px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          backgroundColor: '#0a0d14'
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{testData.name}</h2>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{testData.subject} • Soru {currentQuestion}/{testData.questions}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 300 ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '1.2rem' }}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
            
            <button 
              onClick={handleFinish}
              style={{ padding: '0.5rem 1.5rem', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              className="hover:bg-blue-600 transition-colors"
            >
              Sınavı Bitir
            </button>
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', overflowY: 'auto' }}>
          
          {/* Left: Question Area */}
          <div style={{ flex: '999 1 300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            
            <div style={{ flex: 1, backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                 <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="hover:text-amber-500 transition-colors">
                    <Flag size={18} /> Boş Bırak / İşaretle
                 </button>
               </div>
               
               <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Soru {currentQuestion}</h3>
               <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                 Yapay Zeka tarafından oluşturulmuş mock soru metni burada yer alacak. Gerçek sistemde bu alanda PDF veya görsel render edilebilir. 
                 <br/><br/>
                 Buna göre aşağıdakilerden hangisi yanlıştır?
               </p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['A', 'B', 'C', 'D', 'E'].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleSelectAnswer(currentQuestion, opt)}
                      style={{ 
                        padding: '1rem', 
                        textAlign: 'left',
                        backgroundColor: answers[currentQuestion] === opt ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${answers[currentQuestion] === opt ? '#3b82f6' : 'rgba(255,255,255,0.05)'}`,
                        borderRadius: '12px',
                        color: answers[currentQuestion] === opt ? '#3b82f6' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                      className="hover:bg-white/5 transition-all"
                    >
                      <div style={{ 
                        width: '30px', height: '30px', borderRadius: '15px', 
                        backgroundColor: answers[currentQuestion] === opt ? '#3b82f6' : 'transparent',
                        border: `1px solid ${answers[currentQuestion] === opt ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: answers[currentQuestion] === opt ? '#fff' : 'rgba(255,255,255,0.5)'
                      }}>
                        {opt}
                      </div>
                      Mock şık açıklaması {opt}.
                    </button>
                  ))}
               </div>
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button 
                onClick={() => setCurrentQuestion(p => Math.max(1, p - 1))}
                disabled={currentQuestion === 1}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', color: currentQuestion === 1 ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px', border: 'none', cursor: currentQuestion === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ChevronLeft size={20} /> Önceki Soru
              </button>
              <button 
                onClick={() => setCurrentQuestion(p => Math.min(testData.questions, p + 1))}
                disabled={currentQuestion === testData.questions}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: currentQuestion === testData.questions ? 'rgba(255,255,255,0.05)' : '#3b82f6', color: currentQuestion === testData.questions ? 'rgba(255,255,255,0.2)' : '#fff', borderRadius: '8px', border: 'none', cursor: currentQuestion === testData.questions ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Sonraki Soru <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Right: Optik Form */}
          <div style={{ flex: '1 1 300px', backgroundColor: '#0a0d14', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
             <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <span>Optik Form</span>
               <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{Object.keys(answers).length} / {testData.questions}</span>
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
      </motion.div>
    </AnimatePresence>
  );
}
