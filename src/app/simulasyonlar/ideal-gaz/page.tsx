"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function IdealGasSim() {
  const [temperature, setTemperature] = useState<number>(300); // Kelvin
  const [moles, setMoles] = useState<number>(1); // mol
  const pressure = 1; // atm (constant)
  const R = 0.082; // L.atm/(mol.K)
  
  // V = nRT / P
  const volume = (moles * R * temperature) / pressure; // Liters
  
  // Canvas for particles
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef(Array.from({ length: 50 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Speed multiplier based on temperature (300K is base 1)
      const speed = Math.sqrt(temperature / 300);
      
      // Draw particles
      ctx.fillStyle = '#38bdf8';
      
      // Update particle count based on moles (1 mol = 50 particles)
      const targetParticles = Math.floor(moles * 50);
      if (particles.current.length < targetParticles) {
        particles.current.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 });
      } else if (particles.current.length > targetParticles) {
        particles.current.pop();
      }

      particles.current.forEach(p => {
        p.x += p.vx * speed * 0.02;
        p.y += p.vy * speed * 0.02;

        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [temperature, moles]);

  // Max volume for scaling is approx 5 * 0.082 * 1000 = 410 L
  // Let's cap max visual height at 100L.
  const visualHeight = Math.min((volume / 100) * 300, 300); 

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🎈</span> İdeal Gaz Yasası (PV = nRT)
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Sabit basınçlı pistonlu bir kapta sıcaklık ve madde miktarının hacme etkisini izleyin.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Experiment Setup */}
        <div style={{ backgroundColor: '#0e121e', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Piston Container */}
          <div style={{ position: 'relative', width: '250px', height: '350px', border: '4px solid rgba(255,255,255,0.2)', borderTop: 'none', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', display: 'flex', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            
            {/* Piston Head */}
            <div style={{ position: 'absolute', bottom: `${visualHeight}px`, left: '-10px', width: '262px', height: '20px', backgroundColor: '#94a3b8', borderRadius: '4px', transition: 'bottom 0.5s ease-out' }}>
              {/* Handle */}
              <div style={{ position: 'absolute', bottom: '20px', left: '125px', width: '12px', height: '50px', backgroundColor: '#64748b' }}></div>
            </div>

            {/* Gas Volume & Particles */}
            <div style={{ width: '100%', height: `${visualHeight}px`, position: 'relative', overflow: 'hidden', transition: 'height 0.5s ease-out' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(14, 165, 233, 0.1)' }}></div>
              <canvas ref={canvasRef} width={242} height={300} style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '300px' }} />
            </div>

          </div>

          {/* Fire / Heat Indicator */}
          <div style={{ height: '40px', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', opacity: temperature > 300 ? (temperature-300)/700 : 0 }}>
            🔥
          </div>

          <div style={{ width: '100%', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Sıcaklık (T)</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{temperature} K</span>
              </div>
              <input type="range" min="100" max="1000" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Madde Miktarı (n)</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{moles.toFixed(1)} mol</span>
              </div>
              <input type="range" min="0.1" max="5" step="0.1" value={moles} onChange={e => setMoles(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
          </div>

        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', borderTop: '4px solid #38bdf8' }}>
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Gazın Hacmi (V)</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>
              {volume.toFixed(1)} <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.5)' }}>Litre</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Değişkenler</h3>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
               <span style={{ color: '#cbd5e1' }}>Basınç (P)</span>
               <span style={{ fontWeight: 700 }}>{pressure} atm (Sabit)</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
               <span style={{ color: '#cbd5e1' }}>R Sabiti</span>
               <span style={{ fontWeight: 700 }}>0.082 L·atm/mol·K</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
