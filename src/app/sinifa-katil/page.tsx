'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function JoinClassContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || '';
  
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [className, setClassName] = useState('');

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code) {
      setStatus('error');
      setErrorMessage('Lütfen bir davet kodu girin.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/sinif/katil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login?callbackUrl=' + encodeURIComponent(`/sinifa-katil?code=${code}`));
          return;
        }
        setStatus('error');
        setErrorMessage(data.error || 'Bir hata oluştu.');
      } else {
        setStatus('success');
        setSuccessMessage(data.message);
        setClassName(data.className);
        
        setTimeout(() => {
          router.push('/dashboard?tab=sinif');
        }, 1500);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Bağlantı hatası.');
    }
  };

  useEffect(() => {
    // Attempt to join automatically if we have a code and it wasn't triggered yet.
    // However, it's safer to let the user click "Katıl" explicitly, so we just show the card.
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md w-full">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        {status === 'success' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="confetti-container absolute inset-0 w-full h-full">
               <div className="confetti bg-blue-500 w-3 h-3 absolute rounded-full top-0 left-1/4 animate-[confetti_1s_ease-out_forwards]"></div>
               <div className="confetti bg-green-500 w-3 h-3 absolute rounded-full top-0 left-2/4 animate-[confetti_1.5s_ease-out_forwards]"></div>
               <div className="confetti bg-purple-500 w-3 h-3 absolute rounded-full top-0 left-3/4 animate-[confetti_1.2s_ease-out_forwards]"></div>
               <div className="confetti bg-yellow-500 w-3 h-3 absolute rounded-full top-0 left-1/3 animate-[confetti_1.8s_ease-out_forwards]"></div>
               <div className="confetti bg-red-500 w-3 h-3 absolute rounded-full top-0 left-2/3 animate-[confetti_1.3s_ease-out_forwards]"></div>
            </div>
            <style jsx>{`
              @keyframes confetti {
                0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
              }
            `}</style>
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center border border-blue-800/50">
            <GraduationCap className="w-8 h-8 text-blue-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Sınıfa Katıl</h1>
            <p className="text-gray-400">Öğretmeninizin size verdiği davet kodu ile sınıfa katılın.</p>
          </div>

          {status === 'success' ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-green-900/20 border border-green-800/50 rounded-xl p-6 flex flex-col items-center space-y-4"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
              <div className="text-center">
                <p className="text-green-400 font-medium">Başarılı!</p>
                <p className="text-white text-lg font-bold mt-1">{className}</p>
                <p className="text-gray-400 text-sm mt-2">{successMessage}</p>
                <p className="text-gray-500 text-xs mt-4">Yönlendiriliyorsunuz...</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleJoin} className="w-full space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-gray-300">Davet Kodu</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="6 Haneli Kod"
                  className="w-full bg-[#1f2937] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono uppercase"
                  maxLength={6}
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 flex items-start space-x-3 text-left">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !code}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center space-x-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Katıl</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function JoinClassPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
      <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
        <JoinClassContent />
      </Suspense>
    </div>
  );
}
