"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User } from 'lucide-react';

export default function AstroTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
    { role: 'ai', content: "Merhaba! Ben AstroTutor, senin yapay zeka fizik ve matematik hocanım. Soruyu doğrudan çözmek yerine sana doğru yolu buldururum. Nerede takıldın?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMsgs = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMsgs);
    setInput('');

    // Socratic AI Logic (Mock)
    setTimeout(() => {
      let aiResponse = "";
      const lower = input.toLowerCase();
      
      if (lower.includes("kuvvet") || lower.includes("ivme") || lower.includes("newton")) {
        aiResponse = "Harika bir noktaya değindin. Newton'un ikinci yasasını hatırlıyor musun? F=m.a formülünde sence m (kütle) sabitken ivme artarsa kuvvete ne olur?";
      } else if (lower.includes("türev")) {
        aiResponse = "Türev aslında bir anlık değişim oranıdır. x^2'nin türevini bulurken üssü başa çarpım olarak indirdiğimizi düşün. Sonuç ne çıkmalı?";
      } else {
        aiResponse = "Bunu çözmek için önce elindeki verileri bir kenara yazalım. Sence bu soruda hangi formülü veya kuralı kullanmamız en mantıklısı olur?";
      }

      setMessages([...newMsgs, { role: 'ai', content: aiResponse }]);
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50,
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <Sparkles size={32} color="#fff" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 51,
              width: '380px', height: '600px', maxHeight: '80vh',
              background: '#0f1015', borderRadius: '24px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(139, 92, 246, 0.2)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={24} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '1.125rem' }}>AstroTutor</h3>
                  <span style={{ color: '#a855f7', fontSize: '0.75rem', fontWeight: 600 }}>Sokratik AI Asistan</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: m.role === 'ai' ? 'row' : 'row-reverse' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.role === 'ai' ? '#6366f1' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {m.role === 'ai' ? <Bot size={18} color="#fff" /> : <User size={18} color="#fff" />}
                  </div>
                  <div style={{ 
                    padding: '1rem', borderRadius: '16px', fontSize: '0.9rem', lineHeight: 1.5,
                    background: m.role === 'ai' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: '#fff', border: m.role === 'ai' ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                    borderTopLeftRadius: m.role === 'ai' ? '4px' : '16px',
                    borderTopRightRadius: m.role === 'user' ? '4px' : '16px'
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', background: '#181922' }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Takıldığın noktayı yaz..." 
                style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
              />
              <button 
                onClick={handleSend}
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
