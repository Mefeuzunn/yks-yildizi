'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { haptics } from '@/lib/haptics';

interface Props {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
}

const PULL_THRESHOLD = 52;
const MAX_PULL = 85;

export default function PullToRefresh({ children, onRefresh }: Props) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const passedThresholdRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 2 && !isRefreshing) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
      passedThresholdRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && window.scrollY <= 2) {
      // Resistance curve
      const dist = Math.min(MAX_PULL, diff * 0.45);
      setPullDistance(dist);

      if (dist >= PULL_THRESHOLD && !passedThresholdRef.current) {
        passedThresholdRef.current = true;
        haptics.impact('light');
      } else if (dist < PULL_THRESHOLD && passedThresholdRef.current) {
        passedThresholdRef.current = false;
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      haptics.selection();

      try {
        await onRefresh();
      } catch (err) {
        console.error('Pull-to-refresh error:', err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', width: '100%', minHeight: '100%' }}
    >
      {/* Pull / Refresh Indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: Math.min(1, pullDistance / (PULL_THRESHOLD * 0.7)),
              y: pullDistance - 44,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'fixed',
              top: 'calc(58px + env(safe-area-inset-top, 0px))',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4), 0 0 15px rgba(139, 92, 246, 0.25)',
              pointerEvents: 'none',
            }}
          >
            <RotateCw
              size={18}
              color="#a78bfa"
              style={{
                transform: isRefreshing ? 'none' : `rotate(${pullDistance * 4.5}deg)`,
                animation: isRefreshing ? 'ptr-spin 0.8s linear infinite' : 'none',
                transition: isRefreshing ? 'none' : 'transform 0.05s linear',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with soft transform down when pulling */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : 'none',
          transition: isPullingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        @keyframes ptr-spin {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
