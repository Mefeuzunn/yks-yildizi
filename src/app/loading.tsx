import React from 'react';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        gap: '1.25rem',
      }}
    >
      {/* Animated Glowing Ring Skeleton */}
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.15)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        <div
          style={{
            height: '14px',
            width: '140px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
