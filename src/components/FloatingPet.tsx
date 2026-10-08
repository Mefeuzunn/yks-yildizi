"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Mascot, getMascotById, MASCOTS } from '@/lib/mascots';

export default function FloatingPet() {
  const [pet, setPet] = useState<Mascot>(MASCOTS[2]); // Default: Fox Pofuduk
  const [isHovered, setIsHovered] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [isPetting, setIsPetting] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const pathname = usePathname();

  // Load pet from localStorage or API
  useEffect(() => {
    const loadPet = () => {
      try {
        const saved = localStorage.getItem('yks_focus_pet');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (typeof parsed === 'string') {
              setPet(getMascotById(parsed));
              return;
            } else if (parsed?.id) {
              setPet(getMascotById(parsed.id));
              return;
            } else if (parsed?.name) {
              const match = MASCOTS.find(m => m.name === parsed.name || m.nickname === parsed.name || m.emoji === parsed.emoji);
              if (match) {
                setPet(match);
                return;
              }
            }
          } catch {
            setPet(getMascotById(saved));
            return;
          }
        }
      } catch (e) {}

      // Fallback: check API if online
      fetch('/api/user/mascot')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.equippedMascot) {
            setPet(data.equippedMascot);
            localStorage.setItem('yks_focus_pet', JSON.stringify(data.equippedMascot));
          }
        })
        .catch(() => {});
    };

    loadPet();

    window.addEventListener('storage', loadPet);
    window.addEventListener('pet-updated', loadPet);

    return () => {
      window.removeEventListener('storage', loadPet);
      window.removeEventListener('pet-updated', loadPet);
    };
  }, []);

  useEffect(() => {
    if (pet?.quotes?.length) {
      const q = pet.quotes[Math.floor(Math.random() * pet.quotes.length)];
      setCurrentQuote(q);
    }
  }, [pet, isHovered]);

  // Hide on landing page, login, register, and dashboard (dashboard has the hero mascot card)
  const hiddenPaths = ['/', '/login', '/register', '/dashboard'];
  if (hiddenPaths.includes(pathname || '')) {
    return null;
  }

  const handlePet = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPetting(true);
    setShowHearts(true);

    if (pet.petReactions?.length) {
      const reaction = pet.petReactions[Math.floor(Math.random() * pet.petReactions.length)];
      setCurrentQuote(reaction);
    }

    setTimeout(() => setIsPetting(false), 500);
    setTimeout(() => setShowHearts(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))',
        left: '1.75rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.75rem'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {(isHovered || showHearts) && (
          <motion.div
            initial={{ opacity: 0, x: -16, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.85 }}
            style={{
              backgroundColor: '#0f1523',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${pet.color}50`,
              padding: '0.85rem 1.15rem',
              borderRadius: '18px 18px 18px 4px',
              color: '#fff',
              fontSize: '0.85rem',
              boxShadow: `0 12px 32px rgba(0,0,0,0.7), 0 0 20px ${pet.glow}`,
              marginBottom: '2rem',
              maxWidth: '240px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 800, color: pet.color, fontSize: '0.9rem' }}>{pet.nickname}</span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '6px' }}>{pet.title}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
              "{currentQuote || pet.quotes[0]}"
            </div>
            {showHearts && (
              <div style={{ position: 'absolute', top: -14, right: 10, fontSize: '1.1rem', animation: 'bounce 0.6s infinite' }}>
                💖✨
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onClick={handlePet}
        animate={isPetting 
          ? { rotate: [-15, 15, -10, 10, 0], scale: [1, 1.25, 1] }
          : { y: [0, -7, 0], scale: isHovered ? 1.1 : 1 }
        }
        transition={isPetting ? { duration: 0.5 } : { repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        style={{
          fontSize: '3.2rem',
          cursor: 'pointer',
          filter: `drop-shadow(0 6px 14px ${pet.glow})`,
          userSelect: 'none',
          position: 'relative'
        }}
        title={`${pet.name} (${pet.nickname}) - Sevmek için tıkla!`}
      >
        {pet.emoji}
      </motion.div>
    </div>
  );
}
