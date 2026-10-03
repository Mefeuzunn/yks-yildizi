'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import UniversalSimulationStage from './UniversalSimulationStage';
import { type PhetSim } from '@/lib/phet-registry';

export default function SimulationDetailClient({ sim }: { sim: PhetSim }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          href="/simulasyonlar"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}
        >
          ← Tüm Simülasyonlar
        </Link>
        <span style={{ color: '#334155' }}>|</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {sim.related_yks_topics.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 65px)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ height: '100%' }}
        >
          <UniversalSimulationStage sim={sim} />
        </motion.div>
      </div>
    </div>
  );
}
