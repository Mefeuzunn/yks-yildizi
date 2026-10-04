'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  Layers,
  ExternalLink
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface WidgetInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WidgetInstallModal({ isOpen, onClose }: WidgetInstallModalProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [copied, setCopied] = useState(false);

  // Otomatik işletim sistemi tespiti
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
    }
  }, []);

  // Escape tuşu ile kapatma dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = () => {
    triggerHaptic('light');
    if (typeof window !== 'undefined') {
      const widgetUrl = `${window.location.origin}/widget`;
      navigator.clipboard.writeText(widgetUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="widget-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* Backdrop (Arka plan karartması) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(5, 8, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1,
            }}
          />

          {/* Modal Kartı (Header ve Footer sabit, yalnızca gövde kaydırılabilir) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              maxWidth: '480px',
              maxHeight: 'min(88vh, 560px)',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.15)',
              color: '#f8fafc',
              overflow: 'hidden',
            }}
          >
            {/* ── 1. SABİT BAŞLIK (Asla ekrandan kaymaz, Çarpı butonu daima görünür) ── */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                backgroundColor: '#0f172a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(139, 92, 246, 0.2))',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3
                    id="widget-modal-title"
                    style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#f8fafc' }}
                  >
                    Ana Ekran Widget Kurulumu
                  </h3>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    YKS 2027 sayacını telefonuna ekle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                aria-label="Kapat"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── 2. SABİT PLATFORM SEÇİCİ ── */}
            <div
              style={{
                padding: '10px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  padding: '3px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('android');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    backgroundColor: activeTab === 'android' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: activeTab === 'android' ? '#38bdf8' : '#94a3b8',
                    outline: activeTab === 'android' ? '1px solid rgba(56, 189, 248, 0.35)' : 'none',
                  }}
                >
                  <span>🤖 Android</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('ios');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    backgroundColor: activeTab === 'ios' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    color: activeTab === 'ios' ? '#c084fc' : '#94a3b8',
                    outline: activeTab === 'ios' ? '1px solid rgba(139, 92, 246, 0.35)' : 'none',
                  }}
                >
                  <span>🍎 iOS (iPhone)</span>
                </button>
              </div>
            </div>

            {/* ── 3. AKICI VE KESİNTİSİZ KAYDIRILABİLİR İÇERİK ── */}
            <div
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {activeTab === 'android' ? (
                <>
                  <div
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        Uygulamayı Yükleyin
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Chrome sağ üstündeki <b>üç nokta (⋮)</b> menüsüne dokunun ve <b>&quot;Ana Ekrana Ekle&quot;</b> veya <b>&quot;Uygulamayı Yükle&quot;</b> seçeneğini seçin.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        Araç Takımlarından Widget Ekleyin
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Ana ekranda boş bir yere <b>uzun basın</b>. Açılan menüden <b>&quot;Araç Takımları / Widgets&quot;</b> sekmesine girip <b>YKS Yıldızı</b> sayacını seçin ve ekranınıza sürükleyin.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        Canlı Kısayol Seçeneği
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Dilerseniz aşağıdaki <b>Canlı Widget Aç</b> sayfasını açıp Chrome menüsünden &quot;Ana Ekrana Ekle&quot; diyerek bağımsız mini bir widget kısayolu da oluşturabilirsiniz.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        Safari Paylaş Menüsünü Açın
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        iPhone Safari&apos;de sayfanın altındaki <b>Paylaş (kare içinden çıkan ok 📤)</b> butonuna dokunun.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        &quot;Ana Ekrana Ekle&quot; Seçin
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Aşağı kaydırıp <b>&quot;Ana Ekrana Ekle&quot;</b> butonuna basın. YKS Yıldızı bağımsız bir uygulama simgesi olarak eklenir.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                        Kilit Ekranı Canlı Sayacı (Live Activity)
                      </h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.45 }}>
                        Pomodoro sayacını başlattığınızda telefonunuz kilitliyken bile kilit ekranında canlı geri sayım otomatik olarak gösterilir.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── 4. SABİT ALT BUTONLAR (Kapat ve Eylemler her zaman erişilebilir) ── */}
            <div
              style={{
                padding: '12px 18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="/widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('medium')}
                  style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    borderRadius: '9px',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Layers size={13} />
                  <span>Canlı Widget Aç</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '9px',
                    color: copied ? '#4ade80' : '#f8fafc',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9px',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
