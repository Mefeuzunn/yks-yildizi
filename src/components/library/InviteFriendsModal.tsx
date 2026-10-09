"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Copy, Check, Share2, Users, Sparkles, 
  Send, ExternalLink, QrCode, MessageCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { haptics } from '@/lib/haptics';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomId: string;
  participantCount?: number;
}

export default function InviteFriendsModal({
  isOpen,
  onClose,
  roomName,
  roomId,
  participantCount = 1,
}: InviteFriendsModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  // Build absolute share URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yks-yildizi.vercel.app';
  const shareUrl = `${baseUrl}/calisma-odalari/${roomId}`;

  const shareText = `📚 Selam! YKS Yıldızı Sanal Kütüphanesi'nde "${roomName}" odasındayım. Bir masa seç, birlikte canlı odaklanıp ders çalışalım: ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        haptics.selection();
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (_) {}
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `YKS Yıldızı - ${roomName}`,
          text: `Gel beraber ders çalışalım! Oda: ${roomName}`,
          url: shareUrl,
        });
        haptics.selection();
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  const openWhatsApp = () => {
    haptics.impact('light');
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const openTelegram = () => {
    haptics.impact('light');
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`📚 YKS Yıldızı ${roomName} Çalışma Odası Daveti`)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const openTwitter = () => {
    haptics.impact('light');
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl bg-[#0b101b] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Ambient Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="relative p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Arkadaşını Davet Et</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {roomName} · Masada Birlikte Odaklanın
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mode Switcher (Link / QR Kod) */}
          <div className="px-5 sm:px-6 pt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Share2 size={13} />
              <span>Bağlantı & Sosyal</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <QrCode size={13} />
              <span>Kamera ile QR Kod</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4">

            {activeTab === 'link' ? (
              <>
                {/* Room Link Input & Copy Button */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                    Oda Katılım Bağlantısı
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 focus-within:border-emerald-500/50 transition-colors">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent px-2.5 py-1 text-xs text-gray-200 outline-none select-all truncate font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        copied
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'bg-white/10 hover:bg-white/15 text-white active:scale-95'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="stroke-[3]" />
                          <span>Kopyalandı!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct Social Share Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Hızlı Paylaş
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {/* WhatsApp */}
                    <button
                      onClick={openWhatsApp}
                      className="p-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      <MessageCircle size={16} />
                      <span>WhatsApp</span>
                    </button>

                    {/* Telegram */}
                    <button
                      onClick={openTelegram}
                      className="p-3 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      <Send size={16} />
                      <span>Telegram</span>
                    </button>

                    {/* X (Twitter) */}
                    <button
                      onClick={openTwitter}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      <span className="font-mono font-black text-sm">𝕏</span>
                      <span>Paylaş</span>
                    </button>

                    {/* Native Web Share */}
                    <button
                      onClick={handleNativeShare}
                      className="p-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
                    >
                      <Share2 size={16} />
                      <span>Cihaz Menüsü</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* QR Code Mode */
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <div className="p-3.5 bg-white rounded-2xl shadow-xl border border-white/20 mb-3">
                  <QRCodeSVG 
                    value={shareUrl} 
                    size={160}
                    level="Q"
                    bgColor="#ffffff"
                    fgColor="#080c14"
                  />
                </div>
                <div className="text-xs font-bold text-gray-200">
                  Telefon kamerasını QR koda tut
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 max-w-xs">
                  Arkadaşın telefon veya tablet kamerasıyla doğrudan bu odaya ve masaya katılabilir.
                </p>
              </div>
            )}

            {/* Study Buddy Motivation Card */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/20 text-xs text-gray-300 flex items-start gap-2.5">
              <span className="text-base select-none">💡</span>
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-emerald-300">Birlikte Çalışma Gücü:</span> Bir arkadaşıyla aynı çalışma odasında bulunan öğrenciler ortalama <span className="font-extrabold text-white">%64 daha uzun süre</span> kesintisiz odaklanıyor.
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 pt-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Şu an odada <b>{participantCount}</b> öğrenci var</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer transition-all"
            >
              Tamam
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
