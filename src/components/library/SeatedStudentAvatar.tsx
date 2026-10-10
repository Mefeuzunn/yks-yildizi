"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Coffee, BookOpen, Clock, Target, Volume2, Flame } from 'lucide-react';

export interface AvatarConfig {
  hairStyle?: 'short' | 'curly' | 'ponytail' | 'messy' | 'beanie';
  hairColor?: string;
  outfitType?: 'hoodie' | 'sweater' | 'jacket' | 'tshirt';
  outfitColor?: string;
  skinTone?: string;
  headphonesColor?: string;
  lampColor?: 'green' | 'amber' | 'cyan' | 'purple';
  petType?: 'none' | 'cat' | 'owl';
  hasCat?: boolean;
}

export interface SeatedStudentProps {
  user: {
    id: string;
    username: string;
    league?: string;
    target?: string;
    subject?: string;
    avatarConfig?: AvatarConfig;
    focusMinutes?: number;
    status?: 'focusing' | 'break' | 'afk';
    tempInteraction?: 'coffee' | 'wave' | 'energy' | 'fire' | 'brain' | 'star' | null;
  };
  isCurrentUser?: boolean;
  lampOn?: boolean;
  onClick?: () => void;
  onStatusClick?: () => void;
  seatId: string;
  tableNumber?: number;
  seatLabel?: string;
}

const SeatedStudentAvatar = React.memo(function SeatedStudentAvatar({
  user,
  isCurrentUser = false,
  lampOn = true,
  onClick,
  onStatusClick,
  seatId,
  tableNumber = 1,
  seatLabel = 'A',
}: SeatedStudentProps) {
  const config = user.avatarConfig || {};
  const outfitColor = config.outfitColor || (isCurrentUser ? '#38bdf8' : '#8b5cf6');
  const outfitType = config.outfitType || 'hoodie';
  const hairStyle = config.hairStyle || 'short';
  const hairColor = config.hairColor || '#2d1b00';
  const skinTone = config.skinTone || '#fcd34d';
  const headphonesColor = config.headphonesColor || (isCurrentUser ? '#0ea5e9' : '#ec4899');
  const lampType = config.lampColor || 'green';
  const petType = config.petType || (config.hasCat ? 'cat' : 'none');
  const status = user.status || 'focusing';

  // Lamp style variables
  const lampGlow = {
    green: 'rgba(16, 185, 129, 0.45)',
    amber: 'rgba(245, 158, 11, 0.45)',
    cyan: 'rgba(56, 189, 248, 0.45)',
    purple: 'rgba(168, 85, 247, 0.45)',
  }[lampType];

  const lampColorHex = {
    green: '#10b981',
    amber: '#f59e0b',
    cyan: '#38bdf8',
    purple: '#a855f7',
  }[lampType];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-end cursor-pointer group select-none w-[136px] min-[390px]:w-[152px] sm:w-[160px] h-[166px] min-[390px]:h-[182px] sm:h-[190px]"
    >
      {/* ── Overhead Info Badge (Floating HUD) ── */}
      <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none transition-transform group-hover:scale-105">
        {/* Interaction Bubble (Coffee / Wave / Energy / Fire / Brain / Star) */}
        {user.tempInteraction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -18, scale: 1.15 }}
            exit={{ opacity: 0 }}
            className="mb-1 px-3 py-1 rounded-full bg-black/90 border border-white/25 shadow-xl text-xs font-black flex items-center gap-1.5"
          >
            {user.tempInteraction === 'coffee' && <span className="text-amber-300">☕ Teşekkürler!</span>}
            {user.tempInteraction === 'wave' && <span className="text-sky-300">👋 Selam!</span>}
            {user.tempInteraction === 'energy' && <span className="text-yellow-300">⚡ +100 Odak!</span>}
            {user.tempInteraction === 'fire' && <span className="text-orange-400">🔥 Odak Tavan!</span>}
            {user.tempInteraction === 'brain' && <span className="text-purple-300">🧠 Zihin Açık!</span>}
            {user.tempInteraction === 'star' && <span className="text-amber-300">⭐ Sen de Yıldızsın!</span>}
          </motion.div>
        )}

        {/* Username & League Pill */}
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 backdrop-blur-md shadow-md border ${
          isCurrentUser
            ? 'bg-sky-500/25 text-sky-200 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
            : 'bg-black/75 text-gray-200 border-white/15'
        }`}>
          {isCurrentUser && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          )}
          <span className="truncate max-w-[70px] min-[390px]:max-w-[85px] sm:max-w-[95px]">{user.username}</span>
          {isCurrentUser && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/30 text-sky-300 font-black">
              SEN
            </span>
          )}
        </div>

        {/* Canlı Durum & Aktivite Baloncuğu (Floating Activity Bubble) */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          onClick={(e) => {
            if (isCurrentUser && onStatusClick) {
              e.stopPropagation();
              onStatusClick();
            }
          }}
          className={`mt-1 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-md border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
            isCurrentUser && onStatusClick ? 'pointer-events-auto cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${
            status === 'break'
              ? 'bg-amber-500/25 text-amber-200 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : isCurrentUser
              ? 'bg-gradient-to-r from-sky-500/25 to-indigo-500/25 text-sky-200 border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
              : 'bg-black/85 text-gray-200 border-white/20'
          }`}
          title={isCurrentUser ? 'Canlı durumunu değiştirmek için tıkla' : undefined}
        >
          {status === 'break' ? (
            <>
              <Coffee size={10} className="text-amber-400" />
              <span>5 Dk Mola</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[85px] sm:max-w-[110px]">
                {user.subject || 'Genel Tekrar'}
              </span>
            </>
          )}

          {isCurrentUser && (
            <span className="text-[8px] opacity-75 text-sky-300">✏️</span>
          )}
        </motion.div>
      </div>

      {/* ── Desk Lamp Light Cone (Glow on Table) ── */}
      {lampOn && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-28 pointer-events-none rounded-full z-10 opacity-70 blur-xl transition-all duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${lampGlow} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* ── Main SVG Desk & Seated Character ── */}
      <svg
        viewBox="0 0 160 170"
        className="w-full h-full relative z-20 overflow-visible"
        style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.45))' }}
      >
        <defs>
          {/* Wood Desk Gradient */}
          <linearGradient id="deskWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c1d11" />
            <stop offset="60%" stopColor="#1e130a" />
            <stop offset="100%" stopColor="#140c06" />
          </linearGradient>

          {/* Desk Highlight Strip */}
          <linearGradient id="deskHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>

          {/* Chair Leather Gradient */}
          <linearGradient id="chairLeather" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Book Pages Gradient */}
          <linearGradient id="bookPages" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* ── 1. Chair Backrest (Behind Student) ── */}
        <g id="chair">
          <rect
            x="48"
            y="42"
            width="64"
            height="72"
            rx="14"
            fill="url(#chairLeather)"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Chair Headrest stitch detail */}
          <line x1="56" y1="62" x2="104" y2="62" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
        </g>

        {/* ── 2. Seated Student Character ── */}
        <g id="student" className={status === 'focusing' ? 'animate-pulse-subtle' : ''}>
          {/* Torso / Clothes */}
          <path
            d="M 52 110 C 52 82, 108 82, 108 110 Z"
            fill={outfitColor}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="1.5"
          />

          {/* Outfit Type Details */}
          {outfitType === 'hoodie' && (
            <g id="outfit-hoodie">
              {/* Hood / Collar curve */}
              <path
                d="M 68 88 Q 80 96 92 88 Q 80 91 68 88"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              {/* Drawstrings */}
              <line x1="76" y1="92" x2="76" y2="104" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
              <line x1="84" y1="92" x2="84" y2="104" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
            </g>
          )}

          {outfitType === 'sweater' && (
            <g id="outfit-sweater">
              {/* Ribbed crew neck */}
              <path d="M 71 86 Q 80 92 89 86" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeDasharray="2,1.5" />
              {/* Cozy knit horizontal band */}
              <line x1="62" y1="98" x2="98" y2="98" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3,3" />
            </g>
          )}

          {outfitType === 'jacket' && (
            <g id="outfit-jacket">
              {/* White inner t-shirt triangle */}
              <polygon points="76,82 80,94 84,82" fill="#ffffff" />
              {/* Open jacket lapel seams */}
              <path d="M 68 86 L 76 96 L 73 110" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.6" />
              <path d="M 92 86 L 84 96 L 87 110" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="1.6" />
            </g>
          )}

          {outfitType === 'tshirt' && (
            <g id="outfit-tshirt">
              <path d="M 72 85 Q 80 92 88 85" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" />
            </g>
          )}

          {/* Neck */}
          <rect x="74" y="74" width="12" height="12" rx="3" fill={skinTone} />

          {/* Head */}
          <ellipse cx="80" cy="62" rx="17" ry="20" fill={skinTone} />

          {/* Eyes (Focused on book below, curved closed arcs) */}
          {status !== 'afk' ? (
            <g id="eyes" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none">
              <path d="M 72 65 Q 75 68 78 65" />
              <path d="M 82 65 Q 85 68 88 65" />
            </g>
          ) : (
            /* AFK / Sleeping eyes */
            <g id="eyes-afk" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" fill="none">
              <path d="M 72 67 L 78 67" />
              <path d="M 82 67 L 88 67" />
            </g>
          )}

          {/* Hair based on hairStyle */}
          {hairStyle === 'short' && (
            <g id="hair-short">
              <path
                d="M 62 58 C 62 38, 98 38, 98 58 C 96 52, 90 44, 80 44 C 70 44, 64 52, 62 58 Z"
                fill={hairColor}
              />
              <path
                d="M 63 56 Q 73 48 84 56 Q 76 52 63 56"
                fill={hairColor}
              />
            </g>
          )}

          {hairStyle === 'curly' && (
            <g id="hair-curly">
              <path d="M 62 58 C 60 42, 70 36, 80 36 C 90 36, 100 42, 98 58 Z" fill={hairColor} />
              <circle cx="68" cy="42" r="6" fill={hairColor} />
              <circle cx="80" cy="38" r="7" fill={hairColor} />
              <circle cx="92" cy="42" r="6" fill={hairColor} />
              <circle cx="64" cy="50" r="5" fill={hairColor} />
              <circle cx="96" cy="50" r="5" fill={hairColor} />
              <circle cx="73" cy="47" r="5" fill={hairColor} />
              <circle cx="87" cy="47" r="5" fill={hairColor} />
            </g>
          )}

          {hairStyle === 'ponytail' && (
            <g id="hair-ponytail">
              <path
                d="M 63 58 C 63 40, 97 40, 97 58 C 95 48, 80 44, 63 58 Z"
                fill={hairColor}
              />
              {/* Ponytail Hair Tie */}
              <circle cx="97" cy="52" r="3" fill="#f43f5e" />
              {/* Ponytail Strand over shoulder */}
              <path d="M 97 52 Q 106 62 104 78 Q 101 74 96 64 Z" fill={hairColor} />
            </g>
          )}

          {hairStyle === 'messy' && (
            <g id="hair-messy">
              <path d="M 61 58 C 60 38, 100 38, 99 58 Z" fill={hairColor} />
              {/* Layered spiky bangs */}
              <polygon points="62,56 67,42 72,58" fill={hairColor} />
              <polygon points="70,58 77,39 82,58" fill={hairColor} />
              <polygon points="80,58 87,40 93,58" fill={hairColor} />
              <polygon points="89,56 97,44 99,58" fill={hairColor} />
              <polygon points="60,54 54,48 62,46" fill={hairColor} />
              <polygon points="100,54 106,48 98,46" fill={hairColor} />
            </g>
          )}

          {hairStyle === 'beanie' && (
            <g id="hair-beanie">
              {/* Beanie Knit Dome */}
              <path d="M 61 58 C 60 33, 100 33, 99 58 Z" fill={hairColor} stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
              {/* Folded Brim */}
              <rect x="59" y="51" width="42" height="7.5" rx="3.75" fill={hairColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              {/* Pompom on top */}
              <circle cx="80" cy="33" r="5" fill="#f8fafc" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              {/* Little hair strands peeking out */}
              <path d="M 64 60 Q 68 66 72 60" stroke="#2d1b00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 88 60 Q 92 66 96 60" stroke="#2d1b00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Over-Ear Headphones */}
          <g id="headphones">
            {/* Headband arch */}
            <path
              d="M 61 64 C 60 40, 100 40, 99 64"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Left Ear Cushion */}
            <rect
              x="58"
              y="58"
              width="6.5"
              height="14"
              rx="3"
              fill={headphonesColor}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Right Ear Cushion */}
            <rect
              x="95.5"
              y="58"
              width="6.5"
              height="14"
              rx="3"
              fill={headphonesColor}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* LED pulsing dot on ear cup */}
            <circle cx="61.2" cy="65" r="1.3" fill="#ffffff" />
            <circle cx="98.7" cy="65" r="1.3" fill="#ffffff" />
          </g>

          {/* Arms resting on table */}
          {/* Left Arm holding notebook page */}
          <path
            d="M 52 104 Q 62 114 68 122"
            fill="none"
            stroke={outfitColor}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="68" cy="122" r="4.5" fill={skinTone} />

          {/* Right Arm writing with pencil */}
          <path
            d="M 108 104 Q 98 114 92 122"
            fill="none"
            stroke={outfitColor}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="92" cy="122" r="4.5" fill={skinTone} />

          {/* Pencil in hand */}
          <line
            x1="91"
            y1="123"
            x2="85"
            y2="128"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* ── 3. Study Desk Surface (Foreground Table) ── */}
        <g id="desk-surface">
          {/* Wooden Table Top */}
          <rect
            x="8"
            y="120"
            width="144"
            height="46"
            rx="6"
            fill="url(#deskWood)"
            stroke="#3d2716"
            strokeWidth="2"
          />
          {/* Table Bevel / Highlight Line */}
          <rect
            x="9"
            y="121"
            width="142"
            height="2.5"
            rx="1"
            fill="url(#deskHighlight)"
          />

          {/* ── Open Question Bank Book ── */}
          <g id="open-book" transform="translate(62, 124)">
            {/* Left Page */}
            <path
              d="M 0 3 Q 16 0 17 2 L 17 22 Q 16 20 0 22 Z"
              fill="url(#bookPages)"
              stroke="#64748b"
              strokeWidth="0.75"
            />
            {/* Right Page */}
            <path
              d="M 17 2 Q 18 0 34 3 L 34 22 Q 18 20 17 22 Z"
              fill="url(#bookPages)"
              stroke="#64748b"
              strokeWidth="0.75"
            />
            {/* Spine Center Fold */}
            <line x1="17" y1="1" x2="17" y2="22" stroke="#334155" strokeWidth="1" />
            {/* Simulated Printed Lines / Formulas */}
            <line x1="3" y1="7" x2="13" y2="7" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="11" x2="14" y2="11" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="3" y1="15" x2="11" y2="15" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="20" y1="7" x2="31" y2="7" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="20" y1="11" x2="29" y2="11" stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="20" y1="15" x2="31" y2="15" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Red bookmark ribbon */}
            <path d="M 17 22 Q 19 25 18 28 L 15 28 Z" fill="#ef4444" />
          </g>

          {/* ── Classic Banker's Desk Lamp ── */}
          <g id="desk-lamp" transform="translate(18, 114)">
            {/* Brass Base */}
            <rect x="5" y="26" width="16" height="5" rx="2" fill="#78350f" stroke="#b45309" strokeWidth="0.8" />
            {/* Curved Brass Pole */}
            <path
              d="M 13 26 Q 13 10 18 6"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Lamp Shade (Green glass or customized) */}
            <path
              d="M 11 8 C 11 4, 25 4, 25 8 L 27 12 C 27 13, 9 13, 9 12 Z"
              fill={lampColorHex}
              stroke="#b45309"
              strokeWidth="1"
            />
            {/* Bulb & Glow dot */}
            {lampOn && (
              <circle cx="18" cy="12" r="2.5" fill="#fef08a" />
            )}
          </g>

          {/* ── Steaming Coffee / Tea Mug ── */}
          <g id="coffee-mug" transform={`translate(${petType !== 'none' ? 104 : 118}, 126)`}>
            {/* Mug Body */}
            <rect x="2" y="5" width="12" height="15" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
            {/* Handle */}
            <path d="M 14 8 Q 18 10 18 13 Q 18 16 14 17" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
            {/* Coffee inside */}
            <ellipse cx="8" cy="6" rx="4.5" ry="1.5" fill="#451a03" />
            {/* Rising Steam Wiggles */}
            <path
              d="M 6 3 Q 5 1 7 -1 Q 9 -3 7 -5"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M 10 3 Q 12 1 10 -1 Q 8 -3 10 -5"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </g>

          {/* ── Desktop Pets (Astro-Kedi & Kozmik Baykuş) ── */}
          {petType === 'cat' && (
            <g id="desk-cat" transform="translate(124, 128)">
              {/* Cat coaster/shadow */}
              <ellipse cx="12" cy="14" rx="12" ry="4" fill="rgba(0,0,0,0.3)" />
              {/* Curled Body */}
              <ellipse cx="12" cy="10" rx="10" ry="7.5" fill="#f97316" stroke="#c2410c" strokeWidth="0.75" />
              {/* Cat Head */}
              <circle cx="7" cy="7.5" r="5.5" fill="#f97316" stroke="#c2410c" strokeWidth="0.75" />
              {/* Left Ear */}
              <polygon points="4,4.5 2,1 7,2.5" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
              <polygon points="4,3.8 3,2 6,2.8" fill="#fda4af" />
              {/* Right Ear */}
              <polygon points="8,3 10,0.5 11,4" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
              <polygon points="9,3 10,1.5 10.8,3.5" fill="#fda4af" />
              {/* Sleeping Eyes (^ ^) */}
              <path d="M 4 7 Q 5.5 8 7 7" fill="none" stroke="#7c2d12" strokeWidth="0.8" strokeLinecap="round" />
              {/* Nose & Whiskers */}
              <circle cx="5.5" cy="9" r="0.6" fill="#fda4af" />
              <line x1="3" y1="9" x2="0" y2="8.5" stroke="#fed7aa" strokeWidth="0.5" />
              <line x1="3" y1="10" x2="0" y2="10.8" stroke="#fed7aa" strokeWidth="0.5" />
              {/* Curled Tail wrapping around body */}
              <path d="M 21 11 C 23 7, 18 5, 17 7" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" />
            </g>
          )}

          {petType === 'owl' && (
            <g id="desk-owl" transform="translate(126, 122)">
              {/* Shadow */}
              <ellipse cx="10" cy="20" rx="9" ry="3" fill="rgba(0,0,0,0.3)" />
              {/* Perch Stand / Mini Wooden Perch */}
              <rect x="5" y="19" width="10" height="3" rx="1.5" fill="#78350f" />
              {/* Owl Body */}
              <ellipse cx="10" cy="13" rx="8" ry="9" fill="#6366f1" stroke="#4338ca" strokeWidth="0.8" />
              {/* Belly Patch with star-like feathers */}
              <ellipse cx="10" cy="15" rx="5" ry="6" fill="#e0e7ff" />
              <path d="M 8 13 Q 10 14 12 13" fill="none" stroke="#818cf8" strokeWidth="0.7" />
              <path d="M 8 16 Q 10 17 12 16" fill="none" stroke="#818cf8" strokeWidth="0.7" />
              {/* Ear Tufts */}
              <polygon points="5,7 4,3 8,6" fill="#4338ca" />
              <polygon points="15,7 16,3 12,6" fill="#4338ca" />
              {/* Big Wise Eyes */}
              <circle cx="7.5" cy="9.5" r="3.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="7.5" cy="9.5" r="1.5" fill="#1e1b4b" />
              <circle cx="8" cy="9" r="0.6" fill="#ffffff" />
              <circle cx="12.5" cy="9.5" r="3.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="12.5" cy="9.5" r="1.5" fill="#1e1b4b" />
              <circle cx="13" cy="9" r="0.6" fill="#ffffff" />
              {/* Tiny Orange Beak */}
              <polygon points="9.3,10.5 10.7,10.5 10,12.5" fill="#f97316" />
            </g>
          )}

          {/* ── Table Number Plate ── */}
          <g id="plate" transform="translate(18, 142)">
            <rect x="0" y="0" width="18" height="10" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            <text x="9" y="7.5" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {seatLabel}
            </text>
          </g>

          {/* ── Center Brass Student Nameplate ── */}
          <g id="desk-nameplate" transform="translate(54, 150)">
            <rect x="0" y="0" width="52" height="11" rx="2.5" fill="#451a03" stroke="#b45309" strokeWidth="0.9" />
            <rect x="1" y="1" width="50" height="9" rx="1.5" fill="#291203" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="3" cy="5.5" r="0.8" fill="#d97706" />
            <circle cx="49" cy="5.5" r="0.8" fill="#d97706" />
            <text x="26" y="7.5" fill={isCurrentUser ? "#38bdf8" : "#fef08a"} fontSize="5.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.3">
              {isCurrentUser ? '★ SEN ★' : user.username.slice(0, 9).toUpperCase()}
            </text>
          </g>
        </g>
      </svg>
    </motion.div>
  );
});

export default SeatedStudentAvatar;

/**
 * Renders an empty library chair & study desk with an invite glow.
 */
export const EmptyLibraryDesk = React.memo(function EmptyLibraryDesk({
  seatId,
  seatLabel = 'A',
  tableNumber = 1,
  onSitDown,
}: {
  seatId: string;
  seatLabel?: string;
  tableNumber?: number;
  onSitDown: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onClick={onSitDown}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSitDown();
        }
      }}
      className="relative flex flex-col items-center justify-end cursor-pointer group select-none focus:outline-none w-[136px] min-[390px]:w-[152px] sm:w-[160px] h-[166px] min-[390px]:h-[182px] sm:h-[190px]"
      title={`Masa ${tableNumber} - Koltuk ${seatLabel}: Masaya Oturmak için Tıkla`}
    >
      {/* ── Prominent Sit Down Button (Touch + Click Ready) ── */}
      <div className="absolute top-2 z-30 transition-all duration-200">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSitDown();
          }}
          className="px-2.5 min-[390px]:px-3.5 py-1 rounded-full text-[10px] min-[390px]:text-[11px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 whitespace-nowrap opacity-90 group-hover:opacity-100 group-hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-300/40"
        >
          <span>🪑 Masaya Otur</span>
        </button>
      </div>

      <svg
        viewBox="0 0 160 170"
        className="w-full h-full relative z-20 overflow-visible opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}
      >
        <defs>
          <linearGradient id="emptyWood" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#25170d" />
            <stop offset="100%" stopColor="#120a04" />
          </linearGradient>
          <linearGradient id="emptyChair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* ── Empty Chair Backrest ── */}
        <rect
          x="52"
          y="48"
          width="56"
          height="66"
          rx="12"
          fill="url(#emptyChair)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          className="group-hover:stroke-emerald-400 group-hover:stroke-dasharray-none transition-all"
        />

        {/* Chair Seat cushion outline */}
        <ellipse cx="80" cy="116" rx="26" ry="7" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* Plus / Seat Icon in Center of Chair */}
        <g transform="translate(80, 80)" className="text-gray-500 group-hover:text-emerald-400 transition-colors">
          <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.04)" stroke="currentColor" strokeWidth="1.5" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* ── Table Top ── */}
        <rect
          x="8"
          y="120"
          width="144"
          height="46"
          rx="6"
          fill="url(#emptyWood)"
          stroke="#3d2716"
          strokeWidth="2"
        />

        {/* Unlit Lamp */}
        <g id="empty-lamp" transform="translate(18, 114)">
          <rect x="5" y="26" width="16" height="5" rx="2" fill="#522507" />
          <path d="M 13 26 Q 13 10 18 6" fill="none" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          <path d="M 11 8 C 11 4, 25 4, 25 8 L 27 12 C 27 13, 9 13, 9 12 Z" fill="#065f46" stroke="#047857" strokeWidth="0.8" />
        </g>

        {/* Closed Book on Desk */}
        <g id="closed-book" transform="translate(70, 126)">
          <rect x="0" y="0" width="22" height="16" rx="2" fill="#1e3a8a" stroke="#1d4ed8" strokeWidth="0.8" />
          <line x1="3" y1="0" x2="3" y2="16" stroke="#93c5fd" strokeWidth="1" />
          <text x="12" y="10" fill="#93c5fd" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            YKS
          </text>
        </g>

        {/* Seat Label Plate */}
        <g id="plate" transform="translate(18, 142)">
          <rect x="0" y="0" width="18" height="10" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
          <text x="9" y="7.5" fill="#64748b" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            {seatLabel}
          </text>
        </g>
      </svg>
    </motion.div>
  );
});
