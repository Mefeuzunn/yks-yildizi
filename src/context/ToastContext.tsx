'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Universal global toast dispatcher that can be called anywhere in client code
 * even outside React components via custom event.
 */
export const toast = {
  show: (message: string, type: ToastType = 'info', duration = 3500) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('yks:toast', {
          detail: { message, type, duration },
        })
      );
    }
  },
  success: (message: string, duration = 3500) => {
    toast.show(message, 'success', duration);
  },
  error: (message: string, duration = 4000) => {
    toast.show(message, 'error', duration);
  },
  warning: (message: string, duration = 3500) => {
    toast.show(message, 'warning', duration);
  },
  info: (message: string, duration = 3500) => {
    toast.show(message, 'info', duration);
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      
      // Haptics
      if (type === 'success') triggerHaptic('success');
      else if (type === 'error') triggerHaptic('error');
      else triggerHaptic('light');

      setToasts((prev) => [...prev.slice(-3), { id, message, type, duration }]);

      // Auto dismiss
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, d?: number) => showToast(msg, 'success', d), [showToast]);
  const error = useCallback((msg: string, d?: number) => showToast(msg, 'error', d), [showToast]);
  const warning = useCallback((msg: string, d?: number) => showToast(msg, 'warning', d), [showToast]);
  const info = useCallback((msg: string, d?: number) => showToast(msg, 'info', d), [showToast]);

  // Listen to window events
  useEffect(() => {
    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: ToastType; duration?: number }>;
      if (customEvent.detail?.message) {
        showToast(
          customEvent.detail.message,
          customEvent.detail.type || 'info',
          customEvent.detail.duration || 3500
        );
      }
    };

    window.addEventListener('yks:toast', handleCustomToast);
    return () => window.removeEventListener('yks:toast', handleCustomToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return fallback that uses the window event dispatcher
    return {
      showToast: toast.show,
      success: toast.success,
      error: toast.error,
      warning: toast.warning,
      info: toast.info,
      removeToast: () => {},
    };
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(16px + env(safe-area-inset-top, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => onRemove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({
  toast: item,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const styles = {
    success: {
      bg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(4, 47, 46, 0.95))',
      border: 'rgba(52, 211, 153, 0.4)',
      shadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
      icon: <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />,
      text: '#ecfdf5',
    },
    error: {
      bg: 'linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(76, 5, 25, 0.95))',
      border: 'rgba(248, 113, 113, 0.4)',
      shadow: '0 10px 30px rgba(239, 68, 68, 0.25)',
      icon: <AlertCircle size={18} color="#f87171" style={{ flexShrink: 0 }} />,
      text: '#fef2f2',
    },
    warning: {
      bg: 'linear-gradient(135deg, rgba(120, 53, 15, 0.95), rgba(69, 26, 3, 0.95))',
      border: 'rgba(251, 191, 36, 0.4)',
      shadow: '0 10px 30px rgba(245, 158, 11, 0.25)',
      icon: <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />,
      text: '#fffbeb',
    },
    info: {
      bg: 'linear-gradient(135deg, rgba(12, 74, 110, 0.95), rgba(8, 47, 73, 0.95))',
      border: 'rgba(56, 189, 248, 0.4)',
      shadow: '0 10px 30px rgba(14, 165, 233, 0.25)',
      icon: <Info size={18} color="#38bdf8" style={{ flexShrink: 0 }} />,
      text: '#f0f9ff',
    },
  }[item.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        pointerEvents: 'auto',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '14px',
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        boxShadow: `${styles.shadow}, 0 4px 12px rgba(0,0,0,0.5)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {styles.icon}
        <span
          style={{
            color: styles.text,
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {item.message}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '2px',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </motion.div>
  );
}
