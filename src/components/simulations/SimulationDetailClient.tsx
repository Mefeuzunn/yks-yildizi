'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UniversalSimulationStage from './UniversalSimulationStage';
import SimulationLabPanel from './SimulationLabPanel';
import { type PhetSim } from '@/lib/phet-registry';
import { PanelRightClose, PanelRightOpen, Beaker, Sparkles } from 'lucide-react';

export default function SimulationDetailClient({ sim }: { sim: PhetSim }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'sim' | 'lab'>('sim');

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        padding: '12px 20px', background: '#0f172a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href="/simulasyonlar"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, fontSize: '13px',
              padding: '6px 12px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)'
            }}
          >
            ← Laboratuvara Dön
          </Link>
          <span className="desktop-tag" style={{ color: '#334155' }}>|</span>
          <div className="desktop-tag" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#38bdf8',
              background: 'rgba(56,189,248,0.1)', padding: '3px 8px', borderRadius: '6px',
              border: '1px solid rgba(56,189,248,0.2)'
            }}>
              {sim.subject} • {sim.topic}
            </span>
            {sim.related_yks_topics.slice(0, 2).map((t) => (
              <span key={t} style={{
                fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.04)',
                padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Mobil Segmented Tab Switcher */}
        <div className="sim-mobile-tab-bar">
          <button
            onClick={() => setMobileTab('sim')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mobileTab === 'sim' ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: mobileTab === 'sim' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🔬 Simülasyon
          </button>
          <button
            onClick={() => setMobileTab('lab')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: mobileTab === 'lab' ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
              color: mobileTab === 'lab' ? '#fff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            📝 Föy & AI
          </button>
        </div>

        {/* Panel Toggle Button (Desktop) */}
        <button
          className="sim-desktop-toggle-btn"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isPanelOpen ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: isPanelOpen ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 12px', color: isPanelOpen ? '#c4b5fd' : '#94a3b8',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer'
          }}
        >
          {isPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
          <span>{isPanelOpen ? 'Föyü Gizle' : 'Deney Föyü & AI (+50 XP)'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1, padding: '16px', maxWidth: '1600px', width: '100%', margin: '0 auto',
        display: 'flex', flexDirection: 'column'
      }}>
        <div className="sim-detail-grid" style={{
          display: 'grid',
          gridTemplateColumns: isPanelOpen ? 'minmax(0, 1fr) 390px' : 'minmax(0, 1fr)',
          gap: '16px',
          height: 'calc(100vh - 90px)',
          minHeight: '620px'
        }}>
          {/* Left: Simulation Canvas */}
          <div className={`sim-stage-container ${mobileTab !== 'sim' ? 'mobile-hidden' : ''}`} style={{ height: '100%', minHeight: 0 }}>
            <UniversalSimulationStage sim={sim} />
          </div>

          {/* Right: Lab Quests & AstraTutor AI */}
          <div className={`sim-lab-container ${mobileTab !== 'lab' ? 'mobile-hidden' : ''} ${!isPanelOpen ? 'desktop-hidden' : ''}`} style={{ height: '100%', minHeight: 0 }}>
            <SimulationLabPanel sim={sim} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .sim-mobile-tab-bar {
          display: none;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          padding: 3px;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .sim-mobile-tab-bar {
            display: flex !important;
          }
          .sim-desktop-toggle-btn {
            display: none !important;
          }
          .desktop-tag {
            display: none !important;
          }
          .sim-detail-grid {
            display: block !important;
            height: auto !important;
            min-height: unset !important;
          }
          .mobile-hidden {
            display: none !important;
          }
          .sim-stage-container {
            height: calc(100dvh - 120px) !important;
            min-height: 480px !important;
          }
          .sim-lab-container {
            height: auto !important;
            min-height: 500px !important;
          }
        }

        @media (min-width: 769px) {
          .desktop-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
