import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function CardsTab() {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    { front: 'Mitoz ve Mayoz bölünme arasındaki en temel fark nedir?', back: 'Mitozda kromozom sayısı sabit kalırken, mayozda yarıya iner. (2n -> n)' },
    { front: 'İdeal Gaz Yasası formülü nedir?', back: 'PV = nRT (P: Basınç, V: Hacim, n: Mol, R: İdeal gaz sabiti, T: Sıcaklık)' },
    { front: 'Türevin fiziksel anlamı nedir?', back: 'Konumun zamana göre türevi "Hız"ı, hızın zamana göre türevi ise "İvme"yi verir.' },
    { front: 'Coulomb Yasası formülü nedir?', back: 'F = k * (|q1 * q2| / d^2)' },
  ];

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const currentCard = cards[currentIndex];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', gap: '2rem' }}>
      
      <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          🎴 Aralıklı Tekrar Kartları (Flashcards)
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Unutmaya yüz tutmuş bilgileri yapay zeka algoritması ile tam zamanında tekrar et.</p>
      </div>

      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        
        <div style={{ width: '100%', perspective: '1000px' }}>
          <motion.div
            style={{
              width: '100%', height: '300px', position: 'relative',
              transformStyle: 'preserve-3d', cursor: 'pointer'
            }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setFlipped(!flipped)}
          >
            {/* Front */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
              backgroundColor: '#a855f7', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              boxShadow: '0 10px 30px rgba(168, 85, 247, 0.2)'
            }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.5 }}><RefreshCcw size={20} /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{currentCard.front}</h3>
            </div>

            {/* Back */}
            <div style={{
              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
              backgroundColor: '#10b981', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
              transform: 'rotateY(180deg)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.5 }}><RefreshCcw size={20} /></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#fff', lineHeight: 1.6 }}>{currentCard.back}</h3>
            </div>
          </motion.div>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
          KART {currentIndex + 1} / {cards.length}
        </div>

        <AnimatePresence>
          {flipped && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button onClick={handleNext} style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                <ThumbsDown size={18} /> Zorlandım
              </button>
              <button onClick={handleNext} style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                <ThumbsUp size={18} /> Kolaydı
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
