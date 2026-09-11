import React from 'react';
import { motion } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, Bot } from 'lucide-react';

export default function ForumTab() {
  const messages = [
    { id: 1, user: 'Ahmet Y.', role: 'ogrenci', text: 'Arkadaşlar türevde zincir kuralını bir türlü oturtamadım. Mantığı nedir tam olarak?', time: '14:20' },
    { id: 2, user: 'Zeynep K.', role: 'ogrenci', text: 'İç içe geçmiş fonksiyonlar düşün. Önce dıştakinin türevini alıp içini aynen yazıyorsun, sonra içinin türeviyle çarpıyorsun. Matruşka bebekler gibi 😊', time: '14:25' },
    { id: 3, user: 'YKS AI', role: 'ai', text: 'Zeynep harika bir benzetme yaptı! Matematiksel olarak ifade edersek: f(g(x)) türevi -> f\'(g(x)) * g\'(x). Örneğin sin(x²) türevi için önce sin türevi (cos) alınır, içi (x²) aynı kalır -> cos(x²). Sonra içinin türevi (2x) ile çarpılır. Sonuç: 2x * cos(x²).', time: '14:26' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          💬 Sınıf Forumu
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Türkiye'nin dört bir yanından öğrencilerle takıldığın soruları tartış, yapay zeka asistandan anında destek al.</p>
      </div>

      <div style={{ flex: 1, backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Chat Area */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: '1rem', alignSelf: msg.role === 'ai' ? 'center' : msg.user === 'Ahmet Y.' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              
              {msg.role !== 'ai' && msg.user !== 'Ahmet Y.' && (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                  {msg.user.substring(0,1)}
                </div>
              )}

              {msg.role === 'ai' && (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <Bot size={20} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: msg.user === 'Ahmet Y.' ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: msg.role === 'ai' ? '#8b5cf6' : 'rgba(255,255,255,0.6)' }}>
                    {msg.user}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{msg.time}</span>
                </div>
                
                <div style={{ 
                  padding: '1rem 1.25rem', 
                  borderRadius: '16px', 
                  backgroundColor: msg.user === 'Ahmet Y.' ? 'rgba(56, 189, 248, 0.1)' : msg.role === 'ai' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${msg.user === 'Ahmet Y.' ? 'rgba(56, 189, 248, 0.2)' : msg.role === 'ai' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                  color: msg.user === 'Ahmet Y.' ? '#bae6fd' : msg.role === 'ai' ? '#d8b4fe' : '#fff',
                  borderTopRightRadius: msg.user === 'Ahmet Y.' ? '0' : '16px',
                  borderTopLeftRadius: msg.user !== 'Ahmet Y.' ? '0' : '16px',
                  lineHeight: 1.5,
                  fontSize: '0.95rem'
                }}>
                  {msg.text}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><ImageIcon size={20} /></button>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Bir soru sor veya sohbete katıl..." 
              style={{ width: '100%', padding: '1rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '99px', color: '#fff', fontSize: '0.95rem', outline: 'none' }} 
            />
            <button style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><Smile size={20} /></button>
          </div>
          <button style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#38bdf8', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Send size={20} style={{ marginLeft: '-2px' }} />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
