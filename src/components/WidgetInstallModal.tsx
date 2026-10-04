'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Flame, 
  Timer,
  Layers
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
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
    }
  }, []);

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          {/* Backdrop */}
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
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(56, 189, 248, 0.15)',
              padding: '24px',
              color: '#f8fafc',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(139, 92, 246, 0.2))',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <Smartphone size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Ana Ekran Widget Kurulumu
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    YKS 2027 sayacı ve soru hedefini telefonunun ana ekranına ekle!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
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

            {/* Platform Selector Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                padding: '4px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('android');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'android' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeTab === 'android' ? '#38bdf8' : '#94a3b8',
                  outline: activeTab === 'android' ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                }}
              >
                <span>🤖 Android (Chrome/Edge)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('ios');
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === 'ios' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  color: activeTab === 'ios' ? '#c084fc' : '#94a3b8',
                  outline: activeTab === 'ios' ? '1px solid rgba(139, 92, 246, 0.3)' : 'none',
                }}
              >
                <span>🍎 iOS (iPhone Safari)</span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'android' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Uygulamayı Telefonunuza Yükleyin
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        Chrome sağ üstündeki <b>üç nokta (⋮)</b> menüsüne dokunun ve <b>&quot;Ana Ekrana Ekle&quot;</b> veya <b>&quot;Uygulamayı Yükle&quot;</b> seçeneğini seçin.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Ana Ekranda Widget&apos;ı Konumlandırın
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        Telefonunuzun ana ekranında boş bir alana <b>uzun basın</b>. Açılan menüden <b>&quot;Araç Takımları / Widgets&quot;</b> sekmesine girip <b>YKS Yıldızı</b> sayacını seçin ve ekranınıza sürükleyin.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#38bdf8',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Alternatif: Doğrudan Widget Kısayolu Ekle
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        Aşağıdaki Canlı Widget bağlantısını açıp Chrome menüsünden <b>&quot;Ana Ekrana Ekle&quot;</b> derseniz ana ekranınızda bağımsız, çerçevesiz bir mini widget simgesi oluşur!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Safari Paylaş Menüsünü Açın
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        iPhone Safari&apos;de sayfanın altındaki <b>Paylaş (kare içinden çıkan ok 📤)</b> butonuna dokunun.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        &quot;Ana Ekrana Ekle&quot; Seçin
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        Aşağı kaydırarak <b>&quot;Ana Ekrana Ekle&quot;</b> butonuna basın. YKS Yıldızı bağımsız bir yerel uygulama simgesi olarak eklenir.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    borderRadius: '16px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#c084fc',
                        color: '#0f172a',
                        fontWeight: 800,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Kilit Ekranı Canlı Etkinlik (Live Activity)
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                        Pomodoro sayacını başlattığınızda, telefonunuz kilitliyken bile kilit ekranında canlı geri sayım ve soru ilerlemeniz oynatıcı formatında gösterilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions & Widget Link */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="/widget"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('medium')}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'linear-gradient(135deg, #0284c7, #2563eb)',
                    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <Layers size={16} />
                  <span>Canlı Widget Sayfasını Aç</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    color: copied ? '#4ade80' : '#f8fafc',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                💡 İpucu: Widget sayfası her 60 saniyede bir YKS güncel net ve soru istatistiğinizi otomatik tazeler.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
