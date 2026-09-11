"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FloatingPet() {
  const [pet, setPet] = useState<{ emoji: string; name: string } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Load pet from localStorage
  useEffect(() => {
    const loadPet = () => {
      const saved = localStorage.getItem('yks_focus_pet');
      if (saved) {
        setPet(JSON.parse(saved));
      } else {
        // Default pet
        setPet({ emoji: '🦊', name: 'Pofuduk' });
      }
    };
    loadPet();

    // Listen for storage changes from other tabs or components
    window.addEventListener('storage', loadPet);
    // Custom event for same-tab updates
    window.addEventListener('pet-updated', loadPet);

    return () => {
      window.removeEventListener('storage', loadPet);
      window.removeEventListener('pet-updated', loadPet);
    };
  }, []);

  // Hide on certain pages if necessary, but the user said "site içinde gerekli yerlerde takip etsin"
  // Let's hide it on the landing page, login, register, and dashboard (since dashboard has the big version)
  const hiddenPaths = ['/', '/login', '/register', '/dashboard'];
  if (hiddenPaths.includes(pathname || '')) {
    return null;
  }

  if (!pet) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1rem'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '16px 16px 16px 0',
              color: '#fff',
              fontSize: '0.85rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              marginBottom: '2rem',
              maxWidth: '200px'
            }}
          >
            <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.25rem' }}>{pet.name}</div>
            <div>"Buradayım, harika gidiyorsun! Çalışmaya devam!"</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          fontSize: '3.5rem',
          cursor: 'pointer',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
        }}
      >
        {pet.emoji}
      </motion.div>
    </div>
  );
}
