"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, BrainCircuit, Mic, MicOff, Square, ExternalLink, Camera, X, CheckCircle2, Volume2, VolumeX, HeartHandshake, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
  actions?: { label: string; url: string }[];
  questionData?: any;
}

const DERS_WELCOME = 'Merhaba! Ben AstraTutor, senin kişisel yapay zeka ders ve soru koçunum. YKS hazırlığında çözemediğin bir sorunun fotoğrafını yükleyebilir veya aklına takılan herhangi bir konuyu ve formülü sorabilirsin!';
const REHBERLIK_WELCOME = 'Merhaba! Ben Astra Rehberlik & Psikolojik Danışmanın. Sınav kaygısı, motivasyon, odaklanma problemleri, hedef belirleme ve çalışma stratejileri konusunda seni dinlemek ve rehberlik etmek için buradayım. Bugün seni en çok düşündüren veya konuşmak istediğin konu nedir?';

export default function AstraTutorTab() {
  const searchParams = useSearchParams();
  const initialMode = searchParams?.get('mode') === 'rehberlik' ? 'rehberlik' : 'ders';
  const [activeMode, setActiveMode] = useState<'ders' | 'rehberlik'>(initialMode);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: initialMode === 'rehberlik' ? REHBERLIK_WELCOME : DERS_WELCOME,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [studentMemory, setStudentMemory] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImageFile = (file: File, maxDim = 1024, quality = 0.75): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime('image/jpeg');
    try {
      const compressedBase64 = await compressImageFile(file, 1024, 0.75);
      if (compressedBase64) {
        setSelectedImage(compressedBase64);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveToErrors = async (data: any) => {
    try {
      const res = await fetch('/api/user/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data?.subject || 'Matematik (TYT-AYT)',
          topic: data?.topic || 'Soru Çözümü',
          icerik: 'AstraTutor Fotoğraflı Soru Çözümü',
          secenekler_json: JSON.stringify(['A', 'B', 'C', 'D', 'E']),
          dogru_cevap: 'C',
          secilen_cevap: 'Boş',
          cozum: data?.content || data?.reply || '',
          image_data: data?.image || null
        })
      });
      if (res.ok) {
        setToastMessage('Soru Hata Defterine eklendi! Yanlışlarım sekmesinden tekrar çözebilirsin.');
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch student memory profile on mount
  useEffect(() => {
    fetch('/api/astratutor/memory')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.memory) {
          setStudentMemory(data.memory);
        }
      })
      .catch(() => {});
  }, []);

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

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown and latex for pleasant voice reading
    const cleanText = text
      .replace(/###\s*[^\n]+/g, '')
      .replace(/[$]{1,2}[^$]+[$]{1,2}/g, 'formül')
      .replace(/[*_#`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendPrompt = async (promptText: string, imageAttachment?: string | null) => {
    const textToSend = promptText.trim();
    const imgToSend = imageAttachment !== undefined ? imageAttachment : selectedImage;
    if (!textToSend && !imgToSend) return;
    if (isTyping) return;

    setSelectedImage(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend || 'Bu sorunun çözümünü adım adım açıklar mısın?',
      image: imgToSend || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let res;
      if (imgToSend) {
        res = await fetch('/api/ai/solve-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imgToSend,
            mimeType: imageMime,
            studentNote: textToSend
          })
        });
      } else {
        res = await fetch('/api/astratutor/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessage.content,
            mode: activeMode 
          })
        });
      }

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply || 'Şu an meşgulüm, lütfen daha sonra tekrar dene.',
        timestamp: new Date(),
        actions: data.actions,
        questionData: {
          subject: data.subject || (activeMode === 'rehberlik' ? 'Rehberlik & Motivasyon' : 'Matematik (TYT-AYT)'),
          topic: data.topic || (activeMode === 'rehberlik' ? 'Bireysel Rehberlik' : 'Soru Çözümü'),
          reply: data.reply,
          image: imgToSend
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      if (speechEnabled && data.reply) {
        speakText(data.reply);
      }
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

  const handleSend = () => handleSendPrompt(input, selectedImage);

  // Switch initial message if only welcome message is present
  const handleModeChange = (newMode: 'ders' | 'rehberlik') => {
    setActiveMode(newMode);
    setMessages(prev => {
      if (prev.length <= 1) {
        return [{
          id: '1',
          role: 'ai',
          content: newMode === 'rehberlik' ? REHBERLIK_WELCOME : DERS_WELCOME,
          timestamp: new Date()
        }];
      }
      return prev;
    });
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
      <div className={`absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 ${activeMode === 'rehberlik' ? 'bg-pink-500/10' : 'bg-indigo-500/10'}`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 ${activeMode === 'rehberlik' ? 'bg-rose-500/10' : 'bg-purple-500/10'}`} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10 p-5 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            activeMode === 'rehberlik'
              ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.4)]'
          }`}>
            {activeMode === 'rehberlik' ? (
              <HeartHandshake className="w-7 h-7 text-white" />
            ) : (
              <BrainCircuit className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 flex items-center gap-2">
              {activeMode === 'rehberlik' ? 'Astra Rehberlik' : 'AstraTutor AI'} <Sparkles className={`w-5 h-5 ${activeMode === 'rehberlik' ? 'text-pink-400' : 'text-indigo-400'}`} />
            </h2>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-gray-400 font-medium text-xs sm:text-sm">
                {activeMode === 'rehberlik' ? 'YKS Psikolojik Danışman & Motivasyon Koçu' : 'YKS Ders & Soru Çözüm Koçu'}
              </span>
              {studentMemory && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold flex items-center gap-1.5">
                  <span>⏳ {studentMemory.daysToYKS} Gün</span>
                  <span>•</span>
                  <span>{studentMemory.alan}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mode Switcher Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-2xl">
            <button
              type="button"
              onClick={() => handleModeChange('ders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'ders'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ders & Soru</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('rehberlik')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'rehberlik'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Rehberlik</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setSpeechEnabled(prev => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              speechEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
            }`}
            title={speechEnabled ? "Sesli Koçluk Açık - Yanıtlar sesli okunur" : "Sesli Koçluk Kapalı - Açmak için tıkla"}
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5 text-purple-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{speechEnabled ? 'Sesli Koç' : 'Ses'}</span>
          </button>
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
                  {msg.image && (
                    <div className="mb-3 overflow-hidden rounded-2xl border border-white/20 bg-black/40 max-w-sm">
                      <img src={msg.image} alt="Soru Görseli" className="w-full max-h-72 object-contain" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-white/10">
                      {msg.actions.map((act, idx) => (
                        act.url === '#add-to-errors' ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSaveToErrors(msg.questionData)}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>{act.label}</span>
                          </button>
                        ) : (
                          <Link
                            key={idx}
                            href={act.url}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all flex items-center gap-1.5 no-underline hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>{act.label}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </Link>
                        )
                      ))}
                    </div>
                  )}
                  <div className={`flex items-center gap-1.5 absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity font-medium ${msg.role === 'user' ? 'right-2 text-gray-400' : 'left-2 text-gray-500'}`}>
                    {msg.role === 'ai' && (
                      <button
                        type="button"
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                        className="text-gray-400 hover:text-purple-300 transition-colors cursor-pointer p-0.5"
                        title={isSpeaking ? "Durdur" : "Sesli Dinle"}
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    )}
                    <span className="text-[10px]">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
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
      <div className="relative z-10 flex flex-col gap-2">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 custom-scrollbar">
          {(activeMode === 'rehberlik' ? [
            { label: '🧠 Sınav kaygısını nasıl yönetirim?', prompt: 'Denemelerde ve sınav anında kaygımı kontrol altına almak için ne yapabilirim?' },
            { label: '🔥 Motivasyonum düştü, yardım et', prompt: 'Son günlerde çalışma isteğim azaldı, masanın başına oturmakta zorlanıyorum. Ne önerirsin?' },
            { label: '⏱️ Zaman yönetimi taktikleri', prompt: 'TYT ve AYT denemelerinde zamanı yetiştiremiyorum, bana taktik verir misin?' },
            { label: '📈 Netlerim duraksadı (plato)', prompt: 'Netlerim belli bir seviyede tıkandı ve artmıyor. Bu platoyu kırmak için ne yapmalıyım?' },
            { label: '🎯 Tercih ve hedef stratejisi', prompt: 'Hedeflediğim üniversite ve bölüme şu anki durumumla nasıl emin adımlarla ulaşabilirim?' },
          ] : [
            { label: '⚡ Bugünkü reçetem ne?', prompt: 'Bugün için kişisel reçetemi ve çalışma planımı hazırlar mısın?' },
            { label: '📊 Durumum nasıl?', prompt: 'Son denemelerime ve soru çözüm geçmişime göre genel durumumu analiz eder misin?' },
            { label: '🎯 Hedefime ne kadar var?', prompt: 'Hedeflediğim üniversite ve bölüme şu anki netlerimle ne kadar yakınım?' },
            { label: '💡 Netlerimi nasıl artırırım?', prompt: 'Netlerimi artırmak ve zayıf konularımı kapatmak için bana strateji verir misin?' },
            { label: '📐 Temel Formül & İpuçları', prompt: 'YKS için en kritik formül ve pratik soru çözüm taktiklerini özetler misin?' },
          ]).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(item.prompt)}
              disabled={isTyping}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50 ${
                activeMode === 'rehberlik'
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 border-rose-500/30 hover:border-rose-400/50'
                  : 'bg-white/[0.04] hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-200 border-white/10 hover:border-indigo-500/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="relative inline-flex items-center gap-3 p-2 bg-white/[0.06] border border-indigo-500/40 rounded-2xl mb-1 max-w-xs backdrop-blur-md">
            <img src={selectedImage} alt="Seçilen Soru" className="w-12 h-12 object-cover rounded-xl border border-white/10" />
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-xs font-semibold text-indigo-300 truncate">Soru Fotoğrafı Eklendi</p>
              <p className="text-[10px] text-gray-400">Çözüm için hazır</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-gray-300 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="bg-white/[0.03] border border-white/10 p-2 rounded-[2rem] flex items-end gap-2 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
          
          {/* Hidden File Input for Question Photos */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isTyping}
            className="p-4 rounded-full flex-shrink-0 relative z-10 transition-all duration-300 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-indigo-300 active:scale-95 cursor-pointer"
            title="Soru Fotoğrafı Çek veya Yükle"
          >
            <Camera className="w-6 h-6" />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedImage
                ? "Soruyla ilgili sormak istediğin bir not var mı? (İsteğe bağlı)"
                : activeMode === 'rehberlik'
                ? "Sınav kaygısı, motivasyon, odaklanma veya çalışma stratejisi hakkında sor..."
                : "AstraTutor'a bir soru sor veya fotoğrafını yükle..."
            }
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
            disabled={(!input.trim() && !selectedImage) || isTyping}
            className={`p-4 rounded-full flex-shrink-0 relative z-10 transition-all duration-300 ${
              (!input.trim() && !selectedImage) || isTyping
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1'
            }`}
          >
            {isTyping ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-1" />}
          </button>
        </div>
        <p className="text-center text-[11px] text-gray-600 mt-3 font-medium">
          AstraTutor yapay zeka tabanlıdır. Fotoğraf çekerek çözemediğin soruları anında sorabilirsin.
        </p>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-600/90 text-white shadow-2xl backdrop-blur-md border border-emerald-400/40 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
