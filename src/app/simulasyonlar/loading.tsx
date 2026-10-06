import React from 'react';

export default function SimulasyonlarLoading() {
  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 1rem calc(88px + env(safe-area-inset-bottom)) 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Title & Description Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            width: '260px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <div
          style={{
            width: '380px',
            maxWidth: '100%',
            height: '16px',
            borderRadius: '6px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      {/* Filter Chips & Search Skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {[100, 75, 80, 85, 95].map((w, idx) => (
          <div
            key={idx}
            style={{
              width: `${w}px`,
              height: '36px',
              borderRadius: '20px',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
            }}
          />
        ))}
      </div>

      {/* Grid of Simulation Cards Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              height: '240px',
              borderRadius: '16px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Top thumbnail representation */}
            <div style={{ height: '130px', background: 'rgba(255,255,255,0.03)' }} />
            {/* Content area */}
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '70%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ width: '45%', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.04)' }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
