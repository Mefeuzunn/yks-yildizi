'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Clock, ArrowRight, BookOpen, CheckCircle, XCircle, Sparkles, Award } from 'lucide-react';
import Link from 'next/link';
import { OFFLINE_QUESTIONS, saveOfflineQuizSubmission, syncOfflineQuizSubmissions, getOfflineQuizSubmissions } from '@/lib/offline-quiz';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [syncedBanner, setSyncedBanner] = useState<{ synced: number; xpAwarded: number } | null>(null);

  const currentQ = OFFLINE_QUESTIONS[currentQIndex];

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync offline quiz answers
      const res = await syncOfflineQuizSubmissions();
      if (res.synced > 0) {
        setSyncedBanner(res);
      }
      // Auto-reload after 2.5 seconds when back online
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Already answered
    setSelectedOption(idx);
    setShowExplanation(true);

    const isCorrect = idx === currentQ.correctAnswer;
    saveOfflineQuizSubmission({
      id: `offline-sub-${Date.now()}-${currentQ.id}`,
      questionId: currentQ.id,
      subject: currentQ.subject,
      topic: currentQ.topic,
      selectedOption: idx,
      isCorrect,
      answeredAt: new Date().toISOString()
    });
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentQIndex((prev) => (prev + 1) % OFFLINE_QUESTIONS.length);
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      color: '#f8fafc',
    }}>
      {/* Synced Alert */}
      {syncedBanner && (
        <div style={{
          maxWidth: '560px',
          width: '100%',
          marginBottom: '1.5rem',
          padding: '12px 20px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <Sparkles size={20} color="#34d399" />
          <span>Çevrimdışı çözdüğün {syncedBanner.synced} soru senkronize edildi (+{syncedBanner.xpAwarded} XP kazandın!)</span>
        </div>
      )}

      {/* Icon Card */}
      <div style={{
        width: '76px',
        height: '76px',
        borderRadius: '24px',
        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.25)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        boxShadow: isOnline ? '0 0 35px rgba(16, 185, 129, 0.3)' : '0 0 35px rgba(239, 68, 68, 0.25)',
        transition: 'all 0.4s ease',
      }}>
        {isOnline ? (
          <RefreshCw size={34} color="#10b981" className="animate-spin" />
        ) : (
          <WifiOff size={34} color="#f87171" />
        )}
      </div>

      {/* Status Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        borderRadius: '20px',
        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
        color: isOnline ? '#34d399' : '#fbbf24',
        border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.25)'}`,
        fontSize: '0.8rem',
        fontWeight: 700,
        marginBottom: '0.85rem',
      }}>
        {isOnline ? '⚡ Bağlantı Yeniden Sağlandı! Sayfa Yenileniyor...' : '📡 Çevrimdışı Mod Aktif'}
      </div>

      <h1 style={{
        fontSize: '1.65rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        color: '#ffffff',
      }}>
        {isOnline ? 'Bağlantı Kuruldu' : 'İnternet Bağlantısı Bulunamadı'}
      </h1>

      <p style={{
        maxWidth: '460px',
        color: '#94a3b8',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        marginBottom: '1.5rem',
      }}>
        {isOnline
          ? 'İnternet bağlantınız sağlandı. Birkaç saniye içinde kaldığınız yere yönlendiriliyorsunuz.'
          : 'Bağlantı yokken bile çalışmaya ara verme! Aşağıdaki çevrimdışı YKS sorularını çözebilir, internet geldiğinde kazandığın XP ve netleri otomatik eşitleyebilirsin.'}
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        marginBottom: '2rem',
      }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
          }}
        >
          <RefreshCw size={16} />
          Yeniden Bağlanmayı Dene
        </button>

        <Link
          href="/dashboard?tab=focus"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e2e8f0',
            fontWeight: 600,
            fontSize: '0.85rem',
            textDecoration: 'none',
          }}
        >
          <Clock size={16} color="#f59e0b" />
          Çevrimdışı Pomodoro
        </Link>
      </div>

      {/* Interactive Offline Question Card */}
      <div style={{
        maxWidth: '560px',
        width: '100%',
        padding: '1.5rem',
        borderRadius: '20px',
        background: 'rgba(15, 21, 35, 0.85)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 12px 35px rgba(0,0,0,0.4)',
        textAlign: 'left',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
              {currentQ.subject} · {currentQ.topic}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
            Soru {currentQIndex + 1} / {OFFLINE_QUESTIONS.length}
          </span>
        </div>

        <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.25rem' }}>
          {currentQ.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {currentQ.options.map((opt, oIdx) => {
            let bg = 'rgba(255,255,255,0.03)';
            let borderColor = 'rgba(255,255,255,0.08)';
            let textColor = '#cbd5e1';

            if (selectedOption !== null) {
              if (oIdx === currentQ.correctAnswer) {
                bg = 'rgba(16, 185, 129, 0.2)';
                borderColor = '#10b981';
                textColor = '#34d399';
              } else if (oIdx === selectedOption) {
                bg = 'rgba(239, 68, 68, 0.2)';
                borderColor = '#ef4444';
                textColor = '#f87171';
              }
            }

            return (
              <button
                key={oIdx}
                type="button"
                onClick={() => handleSelectOption(oIdx)}
                disabled={selectedOption !== null}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  color: textColor,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: selectedOption !== null ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{opt}</span>
                {selectedOption !== null && oIdx === currentQ.correctAnswer && (
                  <CheckCircle size={16} color="#34d399" />
                )}
                {selectedOption !== null && oIdx === selectedOption && oIdx !== currentQ.correctAnswer && (
                  <XCircle size={16} color="#f87171" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next */}
        {showExplanation && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <strong style={{ color: '#fff' }}>Çözüm:</strong> {currentQ.explanation}
            </div>
            <button
              type="button"
              onClick={handleNextQuestion}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Sonraki Çevrimdışı Soru</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Offline Info Box */}
      <div style={{
        maxWidth: '560px',
        width: '100%',
        padding: '14px 18px',
        borderRadius: '14px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        textAlign: 'left',
        fontSize: '0.8rem',
        color: '#94a3b8',
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💡 PWA Çevrimdışı Senkronizasyonu
        </div>
        Çözdüğünüz her soru yerel hafızaya kaydedilir. İnternet bağlantınız yeniden sağlandığında doğru cevaplarınız için otomatik XP kazanır ve istatistiklerinizi güncellersiniz.
      </div>
    </div>
  );
}

