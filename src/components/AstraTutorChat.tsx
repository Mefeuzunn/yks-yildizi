"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, X, Sparkles, Loader2, Mic, MicOff, Volume2, Camera, ScanLine } from 'lucide-react';
import Tesseract from 'tesseract.js';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Declare SpeechRecognition for TS
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  role: 'user' | 'astratutor';
  content: string;
};

type Props = {
  questionContext: any;
  onClose: () => void;
};

export default function AstraTutorChat({ questionContext, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'astratutor', content: 'Merhaba! Ben AstraTutor. Görünen o ki bu soruda takıldın. Doğrudan cevabı vermek yerine, bunu seninle birlikte bulacağız. Hangi kısmında zorlandığını bana söyleyebilir misin?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'tr-TR';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    
    // Strip latex for speaking: Replace $$x$$ with just x temporarily, or just let the engine read it as best it can
    const strippedText = text.replace(/\\/g, '').replace(/\$/g, '');
    
    const utterance = new SpeechSynthesisUtterance(strippedText);
    utterance.lang = 'tr-TR';
    utterance.pitch = 1;
    utterance.rate = 1.1; // Slightly faster for AI feel
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/astratutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionContext, messages: newMessages })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'astratutor', content: data.reply }]);
        speakText(data.reply);
      } else {
        setMessages(prev => [...prev, { role: 'astratutor', content: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'astratutor', content: 'Üzgünüm, bir hata oluştu.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(file, 'tur');
      const text = result.data.text;
      
      // Remove excessive newlines and weird chars
      const cleaned = text.replace(/\n+/g, ' ').trim();
      
      if (cleaned) {
        setInput(prev => prev + (prev ? ' ' : '') + cleaned);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Görsel okunamadı, lütfen daha net bir fotoğraf yükleyin.');
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="premium-card"
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%', 
        width: '100%', maxWidth: '400px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.15)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {ocrLoading ? <ScanLine size={18} color="#fff" className="pulse-anim" /> : <Sparkles size={18} color="#fff" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AstraTutor
              {isSpeaking && <Volume2 size={14} color="#38bdf8" className="pulse-anim" />}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c4b5fd' }}>Yapay Zeka Hocan</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#c4b5fd', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '90%', padding: '0.875rem 1.25rem', borderRadius: '16px',
              background: msg.role === 'user' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
              color: '#fff', fontSize: '0.9rem', lineHeight: 1.6,
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
              borderBottomLeftRadius: msg.role === 'astratutor' ? '4px' : '16px'
            }}>
              {msg.role === 'astratutor' ? (
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
              {msg.role === 'user' ? 'Sen' : 'AstraTutor'}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', fontSize: '0.875rem' }}>
            <Loader2 size={16} className="spin" /> AstraTutor düşünüyor...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
        {/* OCR Loading Overlay */}
        <AnimatePresence>
          {ocrLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ position: 'absolute', top: '-40px', left: '1rem', right: '1rem', background: 'rgba(139, 92, 246, 0.9)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 -4px 20px rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(4px)', zIndex: 10 }}
            >
              <ScanLine size={16} className="pulse-anim" /> Görsel analiz ediliyor (OCR)...
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.5rem' }}>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid transparent', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Camera size={18} />
          </button>

          <button 
            type="button"
            onClick={toggleListen}
            style={{ 
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
              border: isListening ? '1px solid #ef4444' : '1px solid transparent', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isListening ? '#ef4444' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isListening ? <Mic className="pulse-anim" size={18} /> : <MicOff size={18} />}
          </button>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Sizi dinliyorum..." : "Takıldığın yeri yaz..."} 
            className="premium-input"
            style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.875rem' }}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            style={{ 
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: input.trim() && !loading ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : 'rgba(255,255,255,0.1)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
      <style jsx global>{`
        .spin { animation: spin 1s linear infinite; }
        .pulse-anim { animation: pulse 1.5s infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        
        /* KaTeX markdown overrides for better colors */
        .katex { color: #f8fafc; font-size: 1.05em; }
        .katex-display { margin: 0.5rem 0; padding: 0.5rem; background: rgba(0,0,0,0.2); border-radius: 8px; overflow-x: auto; }
      `}</style>
    </motion.div>
  );
}
