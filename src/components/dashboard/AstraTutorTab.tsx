import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, BrainCircuit, Mic, MicOff, Square } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AstraTutorTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Merhaba! Ben AstraTutor, senin kişisel yapay zeka eğitim koçunum. YKS hazırlığında sana nasıl yardımcı olabilirim? İster çözemediğin bir soruyu sor, ister çalışma programı iste!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/astratutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content })
      });
      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply || 'Şu an meşgulüm, lütfen daha sonra tekrar dene.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      console.log(e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }} 
      transition={{ duration: 0.3 }}
      className="relative flex flex-col h-[calc(100vh-140px)]"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative z-10 p-6 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 flex items-center gap-2">
            AstraTutor <Sparkles className="w-5 h-5 text-indigo-400" />
          </h2>
          <p className="text-gray-400 font-medium">YKS Yapay Zeka Koçu</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 font-bold text-sm">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-6 p-4 rounded-3xl bg-black/20 border border-white/5 relative z-10 custom-scrollbar">
        <div className="flex flex-col gap-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center ${
                  msg.role === 'user' 
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' 
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-3xl relative group ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-[0_0_30px_rgba(14,165,233,0.15)] rounded-tr-sm'
                    : 'bg-white/[0.05] border border-white/10 text-gray-200 shadow-xl backdrop-blur-md rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  <span className={`text-[10px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity font-medium ${msg.role === 'user' ? 'right-2 text-gray-400' : 'left-2 text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex gap-4 max-w-[85%]"
              >
                <div className="w-10 h-10 flex-shrink-0 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-3xl rounded-tl-sm bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10">
        <div className="bg-white/[0.03] border border-white/10 p-2 rounded-[2rem] flex items-end gap-2 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="AstraTutor'a bir soru sor... (Örn: Bana bir haftalık fizik programı yapar mısın?)"
            className="flex-1 bg-transparent border-none text-white p-4 max-h-32 outline-none resize-none placeholder:text-gray-600 custom-scrollbar relative z-10"
            rows={1}
            style={{ minHeight: '60px' }}
          />
          {voiceSupported && (
            <button
              onClick={toggleVoice}
              disabled={isTyping}
              className={`p-4 rounded-full flex-shrink-0 relative z-10 transition-all duration-300 ${
                isListening
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-4 rounded-full flex-shrink-0 relative z-10 transition-all duration-300 ${
              !input.trim() || isTyping
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1'
            }`}
          >
            {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-1" />}
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-600 mt-3 font-medium">
          AstraTutor yapay zeka tabanlıdır. Kritik kararlar öncesi (örn. tercih listesi) lütfen bilgileri teyit ediniz.
        </p>
      </div>

      {/* Global CSS for scrollbar inside this component */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </motion.div>
  );
}
