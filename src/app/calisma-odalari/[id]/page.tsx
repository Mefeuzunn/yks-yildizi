"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { ArrowLeft, Users, MessageSquare, Send, Timer, Pause, Play, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { haptics } from '@/lib/haptics';

export default function LiveStudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const mobileChatRef = useRef<HTMLDivElement>(null);

  // Pomodoro State
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize Socket Connection
  useEffect(() => {
    if (!user) return;

    // Connect to the local Socket.IO server on port 3001
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-room', { 
        roomId: id, 
        user: { id: user.id, username: user.username, league: user.league } 
      });
    });

    newSocket.on('room-users', (users) => {
      setParticipants(users);
    });

    newSocket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    if (mobileChatRef.current) {
      mobileChatRef.current.scrollTop = mobileChatRef.current.scrollHeight;
    }
  }, [messages, showMobileDrawer]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            haptics.notification('success');
            if (socket) socket.emit('update-timer', { roomId: id, timerState: 'finished', timeLeft: 0 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!timerActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, socket, id]);

  // Sync timer state with others occasionally (every 10 seconds)
  useEffect(() => {
    if (!socket || !timerActive) return;
    const interval = setInterval(() => {
      socket.emit('update-timer', { roomId: id, timerState: 'active', timeLeft });
    }, 10000);
    return () => clearInterval(interval);
  }, [socket, timerActive, timeLeft, id]);

  const toggleTimer = () => {
    haptics.impact('light');
    const newState = !timerActive;
    setTimerActive(newState);
    if (socket) {
      socket.emit('update-timer', { roomId: id, timerState: newState ? 'active' : 'paused', timeLeft });
    }
  };

  const resetTimer = () => {
    haptics.selection();
    setTimerActive(false);
    setTimeLeft(initialTime);
    if (socket) {
      socket.emit('update-timer', { roomId: id, timerState: 'paused', timeLeft: initialTime });
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    haptics.impact('light');
    const msg = {
      id: Date.now().toString(),
      sender: user.username,
      text: newMessage,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    };

    socket.emit('send-message', { roomId: id, message: msg });
    setNewMessage('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!user) return <div className="p-8 text-center">Giriş yapılıyor...</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden relative">
      {/* Left Panel: Timer & Video (Full width on mobile, flex-1 on desktop) */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto pb-28 md:pb-6">
        <Link href="/calisma-odalari" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 md:mb-6 w-fit">
          <ArrowLeft size={20} />
          <span>Odalara Dön</span>
        </Link>
        
        {/* Placeholder for video / visual background */}
        <div className="w-full aspect-video bg-gray-900 rounded-2xl mb-6 md:mb-8 flex items-center justify-center relative overflow-hidden shadow-xl">
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10" />
           <h1 className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white text-xl md:text-3xl font-bold z-20">Lofi Kütüphane</h1>
        </div>

        {/* Timer UI */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="text-5xl md:text-6xl font-black text-gray-800 tracking-tighter mb-6 md:mb-8 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${timerActive ? 'bg-amber-100 text-amber-600' : 'bg-blue-600 text-white'}`}
            >
              {timerActive ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Chat & Participants */}
      <button
        onClick={() => {
          haptics.selection();
          setShowMobileDrawer(true);
        }}
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 'calc(76px + env(safe-area-inset-bottom, 20px))',
          right: '16px',
          zIndex: 40,
          backgroundColor: '#2563eb',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '13px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <MessageSquare size={17} />
        <span>Sohbet</span>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
          {participants.length} 👤
        </span>
      </button>

      {/* Mobile Drawer Backdrop & Bottom Sheet */}
      {showMobileDrawer && (
        <div 
          className="mobile-only fixed inset-0 bg-black/60 z-50 flex flex-col justify-end transition-opacity"
          onClick={() => setShowMobileDrawer(false)}
        >
          <div 
            className="bg-white rounded-t-3xl max-h-[82vh] h-[540px] flex flex-col shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle & Header */}
            <div className="pt-3 pb-2 px-4 border-b border-gray-100 flex flex-col items-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  <span className="font-bold text-gray-900 text-sm">Oda Sohbeti & Katılımcılar</span>
                </div>
                <button 
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Participants Bar (Horizontal scroll on mobile drawer) */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                {participants.length} Odakta:
              </span>
              <div className="flex items-center gap-2">
                {participants.map(p => (
                  <span key={p.socketId} className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-200 text-xs text-gray-700 whitespace-nowrap shadow-xs">
                    <span className="font-medium">{p.username}</span>
                    <span className={`font-mono text-[10px] font-bold ${p.timerState === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                      {formatTime(p.timeLeft)}
                    </span>
                  </span>
                ))}
                {participants.length === 0 && <span className="text-xs text-gray-400">Kimse yok</span>}
              </div>
            </div>

            {/* Chat Messages */}
            <div ref={mobileChatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-gray-50/40">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col max-w-[85%] ${msg.isSystem ? 'mx-auto items-center' : (msg.sender === user?.username ? 'self-end items-end' : 'self-start items-start')}`}>
                  {msg.isSystem ? (
                    <span className="text-[11px] text-gray-400 bg-gray-200/60 px-3 py-0.5 rounded-full">{msg.text}</span>
                  ) : (
                    <>
                      {msg.sender !== user?.username && <span className="text-[10px] text-gray-400 mb-0.5 ml-1">{msg.sender}</span>}
                      <div className={`px-3 py-2 rounded-2xl text-xs md:text-sm shadow-xs ${msg.sender === user?.username ? 'bg-blue-600 text-white rounded-br-xs' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'}`}>
                        {msg.text}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              <input 
                type="text" 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Right Panel: Chat & Participants (Desktop Only - untouched layout & styling) */}
      <div className="w-80 bg-white border-l border-gray-200 flex-col desktop-only" style={{ display: undefined }}>
        {/* Participants Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Odaktakiler
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              {participants.length} Kişi
            </span>
          </div>
          
          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {participants.map(p => (
              <div key={p.socketId} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 text-sm shadow-sm">
                <span className="font-medium text-gray-700">{p.username}</span>
                <span className={`text-xs font-mono font-bold ${p.timerState === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                  {formatTime(p.timeLeft)}
                </span>
              </div>
            ))}
            {participants.length === 0 && <div className="text-xs text-gray-400">Kimse yok</div>}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-white shadow-sm z-10 flex items-center gap-2">
            <MessageSquare size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Canlı Sohbet</span>
          </div>
          
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-gray-50/30">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[90%] ${msg.isSystem ? 'mx-auto items-center' : (msg.sender === user?.username ? 'self-end items-end' : 'self-start items-start')}`}>
                {msg.isSystem ? (
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.text}</span>
                ) : (
                  <>
                    {msg.sender !== user?.username && <span className="text-[10px] text-gray-400 mb-1 ml-1">{msg.sender}</span>}
                    <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === user?.username ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Mesaj yaz..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send size={16} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
