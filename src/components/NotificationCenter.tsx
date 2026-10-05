'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, Sparkles, Send, Volume2, VolumeX } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { playMelodicChime } from '@/lib/client-notifications';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  icon: string;
  url: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationCenterProps {
  align?: 'left' | 'right';
  className?: string;
}

export default function NotificationCenter({ align = 'right', className = '' }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'focus' | 'homework' | 'lesson'>('all');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [inAppToast, setInAppToast] = useState<{ title: string; body: string; url?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        const unread = data.unreadCount || 0;
        setUnreadCount(unread);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('yks:unread-count', { detail: unread }));
        }
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 minute auto refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Listen for in-app floating notifications (e.g. from TimerContext)
  useEffect(() => {
    const handleInApp = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string; url?: string }>;
      if (customEvent.detail) {
        setInAppToast(customEvent.detail);
        fetchNotifications();
        setTimeout(() => setInAppToast(null), 5000);
      }
    };
    window.addEventListener('yks:in-app-notification', handleInApp);
    return () => window.removeEventListener('yks:in-app-notification', handleInApp);
  }, [fetchNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    triggerHaptic('light');
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('yks:unread-count', { detail: 0 }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    triggerHaptic('light');
    if (!notif.is_read) {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(c => {
        const next = Math.max(0, c - 1);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('yks:unread-count', { detail: next }));
        }
        return next;
      });
    }
    setIsOpen(false);
  };

  const handleSendTest = async () => {
    triggerHaptic('medium');
    setIsTesting(true);
    setTestResult(null);
    try {
      playMelodicChime('success');
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.message || 'Test gönderildi!');
      fetchNotifications();
    } catch (e) {
      setTestResult('Test gönderilemedi');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Az önce';
      if (diffMin < 60) return `${diffMin} dk önce`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} sa önce`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} gün önce`;
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* ── Top Floating In-App Toast ── */}
      <AnimatePresence>
        {inAppToast && (
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 100000,
              maxWidth: '380px',
              width: 'calc(100% - 40px)',
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              borderRadius: '16px',
              padding: '14px 18px',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.25)',
              backdropFilter: 'blur(20px)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>
              🔔
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#f1f5f9' }}>{inAppToast.title}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: 2, lineHeight: 1.35 }}>{inAppToast.body}</div>
            </div>
            <button
              onClick={() => setInAppToast(null)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bell Trigger & Dropdown Tray ── */}
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsOpen(o => !o);
            if (!isOpen) fetchNotifications();
          }}
          aria-label="Bildirimler"
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: isOpen ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isOpen ? 'rgba(139, 92, 246, 0.45)' : 'rgba(255, 255, 255, 0.1)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: unreadCount > 0 ? '#c4b5fd' : '#94a3b8',
            transition: 'all 0.2s ease',
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                borderRadius: '9999px',
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)',
                border: '2px solid #0b0f19',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                ...(align === 'left' ? { left: 0 } : { right: 0 }),
                width: '360px',
                maxWidth: 'calc(100vw - 24px)',
                maxHeight: '520px',
                backgroundColor: '#0c101d',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '18px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(139, 92, 246, 0.15)',
                backdropFilter: 'blur(20px)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '16px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔔</span>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>Bildirimler</span>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                    }}>
                      {unreadCount} yeni
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a78bfa',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 8px',
                      borderRadius: 6,
                    }}
                  >
                    <CheckCheck size={14} /> Tümünü Oku
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div style={{
                display: 'flex',
                gap: 6,
                padding: '10px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                overflowX: 'auto',
              }}>
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'focus', label: '🍅 Odak' },
                  { id: 'homework', label: '📋 Ödev' },
                  { id: 'lesson', label: '📚 Ders' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '14px',
                      fontSize: '11.5px',
                      fontWeight: activeFilter === f.id ? 700 : 500,
                      background: activeFilter === f.id ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${activeFilter === f.id ? 'rgba(139, 92, 246, 0.45)' : 'transparent'}`,
                      color: activeFilter === f.id ? '#c4b5fd' : '#94a3b8',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }} className="custom-scrollbar">
                {filteredNotifications.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✨</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Henüz bildiriminiz yok</div>
                    <div style={{ fontSize: 11.5, marginTop: 4 }}>Ders hatırlatıcıları ve ödevler burada görünür.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredNotifications.map(item => (
                      <Link
                        key={item.id}
                        href={item.url || '/dashboard'}
                        onClick={() => handleNotificationClick(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          textDecoration: 'none',
                          background: item.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.06)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                          marginTop: 2,
                        }}>
                          {item.icon || '🔔'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 2,
                          }}>
                            <span style={{
                              color: item.is_read ? '#e2e8f0' : '#fff',
                              fontWeight: item.is_read ? 600 : 700,
                              fontSize: '13px',
                            }}>
                              {item.title}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '10.5px' }}>
                              {formatTimeAgo(item.created_at)}
                            </span>
                          </div>
                          <div style={{
                            color: '#94a3b8',
                            fontSize: '11.5px',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {item.body}
                          </div>
                        </div>
                        {!item.is_read && (
                          <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#8b5cf6',
                            boxShadow: '0 0 8px #8b5cf6',
                            flexShrink: 0,
                            marginTop: 6,
                          }} />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with Test Button */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <button
                  onClick={handleSendTest}
                  disabled={isTesting}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#c4b5fd',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: 0,
                  }}
                >
                  <Send size={12} />
                  {isTesting ? 'Gönderiliyor...' : 'Cihazıma Test Bildirimi Gönder'}
                </button>

                {testResult && (
                  <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 600 }}>
                    {testResult}
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
