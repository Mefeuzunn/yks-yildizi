"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Bot, User, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actions?: Array<{ label: string; url: string }>;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  '9. Sınıf Matematik: Algoritmik akıl yürütme açık uçlu sorusu sor.',
  'Fizik: Sürtünme kuvvetinde statik ve kinetik katsayıyı nasıl ayırt ederim?',
  'MEB Ortak Yazılılarda dereceli puanlama anahtarı (rubrik) nasıl işler?',
  'Kimya: Atom modellerinin tarihsel serüvenini Sokratik olarak açıkla.',
];

export default function MaarifAstraTutorChat({ grade = 9 }: { grade?: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Merhaba! Ben Türkiye Yüzyılı Maarif Modeli için özel eğitilmiş Sokratik Öğrenme Mentorunum. ${grade}. sınıf yeni müfredat konuların, MEB açık uçlu ortak sınav provaların veya PhET bilim simülasyonların hakkında aklına takılan her şeyi sorabilirsin. Birlikte ezberlemeden, adım adım keşfedelim!`,
      actions: [
        { label: '📝 MEB Yazılı Senaryoları', url: '/maarif?tab=senaryolar' },
        { label: '🔬 PhET Bilim Deneyleri', url: '/maarif?tab=phet' },
      ],
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    triggerHaptic('light');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/maarif/astratutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          grade,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Maarif düşünce adımlarını gözden geçirirken bir aksaklık oldu. Tekrar deneyebilir misin?',
        actions: data.actions || [],
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
      triggerHaptic('success');
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Bağlantı sırasında bir sorun oluştu. Lütfen sorunuzu tekrar yazınız.',
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        borderRadius: '24px',
        maxWidth: '820px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '620px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                AstraTutor Maarif Mentoru
              </h3>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#c084fc',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                Sokratik AI
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {grade}. Sınıf Bütüncül Beceri ve MEB Yazılı Rehberi
            </p>
          </div>
        </div>
      </div>

      {/* ── MESAJ ALANI ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                backgroundColor: msg.sender === 'user' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '13.5px',
                lineHeight: 1.6,
                boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(139, 92, 246, 0.3)' : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.text}

              {/* Aksiyon Butonları */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {msg.actions.map((act, i) => (
                    <Link
                      key={i}
                      href={act.url}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#c4b5fd',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>{act.label}</span>
                      <ArrowRight size={12} />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px', marginInline: '4px' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12.5px' }}>
            <Loader2 size={16} className="animate-spin" color="#8b5cf6" />
            <span>AstraTutor Sokratik rehberlikle düşünüyor...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── HIZLI ÖNERİ BALONCUKLARI ── */}
      <div
        style={{
          padding: '8px 1.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {SAMPLE_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            disabled={loading}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontSize: '11.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── INPUT FORMU ── */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`${grade}. Sınıf Maarif müfredatı veya MEB yazılıları hakkında bir şey sor...`}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontSize: '13.5px',
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: input.trim() ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: input.trim() ? '0 4px 14px rgba(139, 92, 246, 0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
