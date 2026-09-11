"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2 } from 'lucide-react';

export default function EmbeddedSimulation() {
  const handleFullscreen = () => {
    const iframe = document.getElementById('sim-iframe');
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c10', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Molekül Şekilleri</h1>
        </div>
        <button 
          onClick={handleFullscreen}
          className="btn-interactive" 
          style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <Maximize2 size={18} /> Tam Ekran
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 200px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <iframe 
          id="sim-iframe"
          src="https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_tr.html" 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
