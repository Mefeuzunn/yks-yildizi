import React from 'react';

export default function DashboardLoading() {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '1.5rem 1rem calc(88px + env(safe-area-inset-bottom)) 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Top Banner Skeleton */}
      <div
        style={{
          height: '110px',
          borderRadius: '16px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      />

      {/* Stats Row Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: '95px',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div
        style={{
          height: '320px',
          borderRadius: '18px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
