"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import { ArrowLeft, Users, MessageSquare, Send, Timer, Pause, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

export default function LiveStudyRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

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
  }, [messages]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
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
    const newState = !timerActive;
    setTimerActive(newState);
    if (socket) {
      socket.emit('update-timer', { roomId: id, timerState: newState ? 'active' : 'paused', timeLeft });
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(initialTime);
    if (socket) {
      socket.emit('update-timer', { roomId: id, timerState: 'paused', timeLeft: initialTime });
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

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
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 overflow-hidden">
      {/* Left Panel: Timer & Video */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <Link href="/calisma-odalari" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 w-fit">
          <ArrowLeft size={20} />
          <span>Odalara Dön</span>
        </Link>
        
        {/* Placeholder for video / visual background */}
        <div className="w-full aspect-video bg-gray-900 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden shadow-xl">
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10" />
           <h1 className="absolute bottom-6 left-6 text-white text-3xl font-bold z-20">Lofi Kütüphane</h1>
        </div>

        {/* Timer UI */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          <div className="text-6xl font-black text-gray-800 tracking-tighter mb-8 font-mono">
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
              className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Chat & Participants */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
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
