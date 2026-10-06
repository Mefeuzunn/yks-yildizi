import React from 'react';

export default function SoruCozLoading() {
  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '1.25rem 1rem calc(88px + env(safe-area-inset-bottom)) 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      {/* Header Bar Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ width: '140px', height: '20px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '70px', height: '28px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      {/* Question Body Skeleton */}
      <div
        style={{
          padding: '1.5rem',
          borderRadius: '18px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '180px',
        }}
      >
        <div style={{ width: '40%', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ width: '90%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ width: '85%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ width: '65%', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* 5 Options Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {['A', 'B', 'C', 'D', 'E'].map((letter) => (
          <div
            key={letter}
            style={{
              height: '54px',
              borderRadius: '14px',
              padding: '0 16px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
            <div
              style={{
                width: '60%',
                height: '14px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom Action Bar Skeleton */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '0.5rem',
        }}
      >
        <div style={{ width: '100px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ width: '120px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }} />
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
