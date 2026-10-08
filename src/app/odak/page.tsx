'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import FullscreenFocusOverlay from '@/components/dashboard/FullscreenFocusOverlay';

export default function OdakStandalonePage() {
  const router = useRouter();

  const handleClose = () => {
    // Return smoothly to the focus tab in dashboard
    router.push('/dashboard?tab=focus');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#040711',
        overflow: 'hidden',
        zIndex: 99999,
      }}
    >
      <FullscreenFocusOverlay isOpen={true} onClose={handleClose} isStandalonePage={true} />
    </div>
  );
}
