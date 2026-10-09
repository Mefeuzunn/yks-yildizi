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
    tempInteraction?: 'coffee' | 'wave' | 'energy' | null;
  };
  isCurrentUser?: boolean;
  lampOn?: boolean;
  onClick?: () => void;
  seatId: string;
  tableNumber?: number;
  seatLabel?: string;
}

export default function SeatedStudentAvatar({
  user,
  isCurrentUser = false,
  lampOn = true,
  onClick,
  seatId,
  tableNumber = 1,
  seatLabel = 'A',
}: SeatedStudentProps) {
  const config = user.avatarConfig || {};
  const outfitColor = config.outfitColor || (isCurrentUser ? '#38bdf8' : '#8b5cf6');
  const hairColor = config.hairColor || '#2d1b00';
  const skinTone = config.skinTone || '#fcd34d';
  const headphonesColor = config.headphonesColor || (isCurrentUser ? '#0ea5e9' : '#ec4899');
  const lampType = config.lampColor || 'green';
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
      className="relative flex flex-col items-center justify-end cursor-pointer group select-none"
      style={{ width: '160px', height: '190px' }}
    >
      {/* ── Overhead Info Badge (Floating HUD) ── */}
      <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none transition-transform group-hover:scale-105">
        {/* Interaction Bubble (Coffee / Wave / Energy) */}
        {user.tempInteraction && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -16, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="mb-1 px-2.5 py-1 rounded-full bg-black/80 border border-white/20 shadow-lg text-xs font-bold flex items-center gap-1.5"
          >
            {user.tempInteraction === 'coffee' && <span>☕ Teşekkürler!</span>}
            {user.tempInteraction === 'wave' && <span>👋 Selam!</span>}
            {user.tempInteraction === 'energy' && <span>⚡ +100 Odak!</span>}
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
          <span className="truncate max-w-[90px]">{user.username}</span>
          {isCurrentUser && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/30 text-sky-300 font-black">
              SEN
            </span>
          )}
        </div>

        {/* Focus Subject / Status Tag */}
        <div className="flex items-center gap-1 mt-0.5">
          {user.subject && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 border border-white/5 font-semibold truncate max-w-[100px]">
              {user.subject}
            </span>
          )}
          {status === 'break' && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-0.5">
              <Coffee size={9} /> Mola
            </span>
          )}
        </div>
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
          {/* Hood / Collar detail */}
          <path
            d="M 68 88 Q 80 96 92 88 Q 80 91 68 88"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
          />

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

          {/* Hair */}
          <path
            d="M 62 58 C 62 38, 98 38, 98 58 C 96 52, 90 44, 80 44 C 70 44, 64 52, 62 58 Z"
            fill={hairColor}
          />
          <path
            d="M 63 56 Q 73 48 84 56 Q 76 52 63 56"
            fill={hairColor}
          />

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
          <g id="coffee-mug" transform="translate(118, 126)">
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

          {/* ── Table Number Plate ── */}
          <g id="plate" transform="translate(18, 142)">
            <rect x="0" y="0" width="18" height="10" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />
            <text x="9" y="7.5" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {seatLabel}
            </text>
          </g>
        </g>
      </svg>
    </motion.div>
  );
}

/**
 * Renders an empty library chair & study desk with an invite glow.
 */
export function EmptyLibraryDesk({
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
      transition={{ duration: 0.18 }}
      onClick={onSitDown}
      className="relative flex flex-col items-center justify-end cursor-pointer group select-none"
      style={{ width: '160px', height: '190px' }}
    >
      {/* ── Hover Pill Invitation ── */}
      <div className="absolute top-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg flex items-center gap-1.5 whitespace-nowrap animate-bounce">
          <span>🪑 Masaya Otur</span>
        </div>
      </div>

      <svg
        viewBox="0 0 160 170"
        className="w-full h-full relative z-20 overflow-visible opacity-75 group-hover:opacity-100 transition-opacity"
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
}
