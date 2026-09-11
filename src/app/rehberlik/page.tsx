"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, BookOpen, Calendar, Calculator, BarChart, Users, Timer, Swords, ExternalLink, HeartHandshake, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export type Action = {
  label: string;
  url: string;
  icon?: string;
};

export type ReportCard = {
  diagnosis: string;
  prescription: string;
  chartData: { subject: string; score: number; maxScore: number }[];
};

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  actions?: Action[];
  report?: ReportCard;
};

const SUGGESTED_TOPICS = [
  "Haftalık program taslağı oluştur",
  "Motivasyonum düştü, yardım et",
  "Sınav kaygısını nasıl yönetirim?",
  "TYT netlerimi nasıl arttırırım?",
  "Tercih stratejisi öner"
];

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'BookOpen': return <BookOpen size={16} />;
    case 'Target': return <Target size={16} />;
    case 'Calendar': return <Calendar size={16} />;
    case 'Calculator': return <Calculator size={16} />;
    case 'BarChart': return <BarChart size={16} />;
    case 'Users': return <Users size={16} />;
    case 'Timer': return <Timer size={16} />;
    case 'Swords': return <Swords size={16} />;
    case 'HeartHandshake': return <HeartHandshake size={16} />;
    default: return <ExternalLink size={16} />;
  }
};

export default function RehberlikPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('yks_ai_memory');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setMessages([{
        id: '1',
        sender: 'ai',
        text: `Merhaba ${user?.username || 'öğrenci'}! Ben kişisel rehberlik uzmanınınım. Kariyer hedeflerin, ders çalışma stratejilerin, sınav kaygısı veya motivasyon konularında sana yardımcı olmak için buradayım. Bugün hangi konuda konuşmak istersin?`,
        timestamp: Date.now()
      }]);
    }
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('yks_ai_memory', JSON.stringify(messages));
    }
  }, [messages]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/counselor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });

      const data = await res.json();
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: data.reply || "Bir sorun oluştu.", 
        timestamp: Date.now(),
        actions: data.actions,
        report: data.report
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        text: "Bağlantı hatası oluştu. Lütfen tekrar deneyin.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>Rehberlik Uzmanı</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Kariyer, motivasyon ve çalışma stratejileri konusunda kişisel rehberlik.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '24px', minHeight: 0 }}>
        
        {/* Main Chat Area */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          
          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '12px', flexDirection: isAI ? 'row' : 'row-reverse' }}
                  >
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: isAI ? '#E5E7EB' : '#2563EB',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: isAI ? '#6B7280' : '#FFFFFF'
                    }}>
                      <User size={16} />
                    </div>
                    <div style={{ 
                      maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '8px' 
                    }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        background: isAI ? '#F3F4F6' : '#2563EB',
                        color: isAI ? '#374151' : '#FFFFFF', 
                        fontSize: '14px', lineHeight: 1.5,
                        borderRadius: '12px',
                        borderTopLeftRadius: isAI ? '4px' : '12px',
                        borderTopRightRadius: isAI ? '12px' : '4px',
                      }}>
                        {msg.text}
                      </div>

                      {/* Render Report Card Dashboard if present */}
                      {msg.report && (
                        <div style={{
                          marginTop: '8px', padding: '16px', borderRadius: '8px',
                          background: '#FFFFFF', border: '1px solid #E5E7EB'
                        }}>
                          <h4 style={{ color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                            <BarChart size={16} color="#2563EB" /> Karne Analizi
                          </h4>
                          
                          {/* Bar Charts */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                            {msg.report.chartData.map((data, i) => {
                              const percentage = (data.score / data.maxScore) * 100;
                              return (
                                <div key={i}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#4B5563', fontWeight: 500 }}>
                                    <span>{data.subject}</span>
                                    <span>{data.score} / {data.maxScore}</span>
                                  </div>
                                  <div style={{ width: '100%', height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div 
                                      initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                                      style={{ height: '100%', background: '#2563EB', borderRadius: '4px' }} 
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Diagnosis & Prescription */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '12px', background: '#FEF2F2', borderLeft: '4px solid #EF4444', borderRadius: '0 4px 4px 0' }}>
                              <strong style={{ color: '#991B1B', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Teşhis (Zayıflık Analizi)</strong>
                              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{msg.report.diagnosis}</p>
                            </div>
                            <div style={{ padding: '12px', background: '#F0FDF4', borderLeft: '4px solid #22C55E', borderRadius: '0 4px 4px 0' }}>
                              <strong style={{ color: '#166534', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Taktiksel Reçete</strong>
                              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{msg.report.prescription}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Render Actions if present */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {msg.actions.map((act, i) => (
                            <button
                              key={i}
                              onClick={() => router.push(act.url)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 12px', borderRadius: '6px',
                                background: '#EFF6FF',
                                border: '1px solid #DBEAFE',
                                color: '#2563EB', fontSize: '12px',
                                cursor: 'pointer', transition: 'all 0.2s',
                                fontWeight: 500
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#DBEAFE'; }}
                              onMouseOut={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                            >
                              {getIcon(act.icon)}
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                    <User size={16} />
                  </div>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', gap: '4px', borderTopLeftRadius: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }} />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }} />
                      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'row' }}>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              style={{ display: 'flex', gap: '12px', width: '100%' }}
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Aklına takılanları bana sor..."
                style={{ 
                  flex: 1, padding: '12px 16px', borderRadius: '8px',
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  color: '#111827', fontSize: '14px', outline: 'none',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '8px',
                  background: inputValue.trim() && !isTyping ? '#2563EB' : '#9CA3AF',
                  color: '#FFFFFF',
                  border: 'none', cursor: inputValue.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Suggestions */}
        <div style={{ flex: 1, maxWidth: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
            Önerilen Konular
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SUGGESTED_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(topic)}
                disabled={isTyping}
                style={{
                  padding: '16px', borderRadius: '8px', background: '#FFFFFF',
                  border: '1px solid #E5E7EB', textAlign: 'left',
                  color: '#111827', fontSize: '14px', fontWeight: 500,
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
                }}
                onMouseOver={(e) => { if(!isTyping) { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; }}}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
