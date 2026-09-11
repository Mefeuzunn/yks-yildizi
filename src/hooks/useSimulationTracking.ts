'use client';

import { useEffect, useRef } from 'react';
import { updateSimulationProgress } from '@/lib/actions/simulations';

interface UseSimulationTrackingProps {
  simulationId: number | null;
  intervalSeconds?: number;
}

/**
 * Öğrencinin simülasyon sayfasında geçirdiği süreyi takip eden Hook.
 * Sekme değiştirildiğinde veya pencere minimize edildiğinde süreyi durdurur.
 */
export function useSimulationTracking({ simulationId, intervalSeconds = 30 }: UseSimulationTrackingProps) {
  // Zamanlayıcı referansları
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // React Strict Mode çift render sorununu engellemek ve geçmişi tutmak için
  const accumulatedTimeRef = useRef(0);
  const lastSyncTimeRef = useRef(0);

  useEffect(() => {
    // Eğer bir simülasyon açık değilse track etme
    if (!simulationId) return;

    // Veritabanına senkronize etme fonksiyonu
    const syncProgress = async (timeToAdd: number) => {
      if (timeToAdd <= 0) return;
      try {
        await updateSimulationProgress(simulationId, timeToAdd);
      } catch (err) {
        console.error('Süre kaydedilirken hata oluştu', err);
      }
    };

    // Her X saniyede bir çalışacak sayaç
    const startTracking = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        accumulatedTimeRef.current += intervalSeconds;
        
        // Sadece pencere aktifse (kullanıcı simülasyonla gerçekten ilgileniyorsa) kaydet
        if (document.visibilityState === 'visible') {
          syncProgress(intervalSeconds);
          lastSyncTimeRef.current = accumulatedTimeRef.current;
        }
      }, intervalSeconds * 1000);
    };

    const stopTracking = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Sekme görünürlüğü değiştiğinde (kullanıcı başka sekmeye geçerse)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        stopTracking();
        // Sekmeden çıkarken artakalan küçük saniyeleri kaydet (Opsiyonel)
        const unsyncedTime = accumulatedTimeRef.current - lastSyncTimeRef.current;
        if (unsyncedTime > 5) {
          syncProgress(unsyncedTime);
          lastSyncTimeRef.current = accumulatedTimeRef.current;
        }
      }
    };

    // Component mount olduğunda dinlemeye başla
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTracking();

    // Component unmount olduğunda temizle
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTracking();
      
      // Çıkarken senkronize edilmemiş süre kaldıysa son bir kez kaydet
      const unsyncedTime = accumulatedTimeRef.current - lastSyncTimeRef.current;
      if (unsyncedTime > 5) {
        syncProgress(unsyncedTime);
      }
    };
  }, [simulationId, intervalSeconds]);
}
