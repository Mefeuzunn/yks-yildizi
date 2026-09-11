"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Play, Square, RotateCcw, Settings, Info } from 'lucide-react';
import Link from 'next/link';

// Constants for simulation
const G = 0.5; // Gravitational constant (scaled for simulation)
const TIME_STEP = 0.5; // Integration time step

export default function KeplerSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Physics State
  const [starMass, setStarMass] = useState(5000);
  const [planetMass, setPlanetMass] = useState(10);
  const [initialVelocityY, setInitialVelocityY] = useState(3.5);
  const [initialDistanceX, setInitialDistanceX] = useState(200);

  // Mutable state for the animation loop
  const stateRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    trail: [] as {x: number, y: number}[]
  });

  const initSimulation = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Reset state
    stateRef.current = {
      x: canvas.width / 2 + initialDistanceX,
      y: canvas.height / 2,
      vx: 0,
      vy: initialVelocityY,
      trail: []
    };

    drawFrame();
  };

  useEffect(() => {
    initSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starMass, initialVelocityY, initialDistanceX]);

  const drawFrame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with trail fade effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw Star
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(starMass / 200, 40), 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    gradient.addColorStop(0, '#fef08a'); // yellow-200
    gradient.addColorStop(0.5, '#eab308'); // yellow-500
    gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Trail
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; // sky-400
    ctx.lineWidth = 1;
    stateRef.current.trail.forEach((point, i) => {
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    // Draw Planet
    ctx.beginPath();
    ctx.arc(stateRef.current.x, stateRef.current.y, Math.max(planetMass / 2, 4), 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8'; // sky-400
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#38bdf8';
  };

  const updatePhysics = () => {
    const s = stateRef.current;
    if (!canvasRef.current) return;
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;

    // Calculate distance vector
    const dx = centerX - s.x;
    const dy = centerY - s.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < Math.min(starMass / 200, 40)) {
      // Collision with star
      setIsRunning(false);
      return;
    }

    // Force = G * (M * m) / r^2
    // Accel = Force / m = G * M / r^2
    const accel = (G * starMass) / distSq;
    
    // Components of acceleration
    const ax = accel * (dx / dist);
    const ay = accel * (dy / dist);

    // Update velocity
    s.vx += ax * TIME_STEP;
    s.vy += ay * TIME_STEP;

    // Update position
    s.x += s.vx * TIME_STEP;
    s.y += s.vy * TIME_STEP;

    // Add to trail
    s.trail.push({ x: s.x, y: s.y });
    if (s.trail.length > 300) s.trail.shift();

    drawFrame();
  };

  const loop = () => {
    if (isRunning) {
      updatePhysics();
      animationRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(loop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Kepler & Kütle Çekim Simülasyonu
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Newton'un Evrensel Kütle Çekim Yasasını ve gezegen yörüngelerini interaktif olarak keşfet.</p>
        </div>
        <Link href="/simulasyonlar" style={{ color: '#38bdf8', textDecoration: 'none', background: 'rgba(56, 189, 248, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          Simülasyonlara Dön
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Canvas Area */}
        <div className="premium-card" style={{ flex: 3, padding: '1rem', background: '#0f172a' }}>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600} 
            style={{ width: '100%', borderRadius: '12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)' }} 
          />
        </div>

        {/* Controls Panel */}
        <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-interactive"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem', borderRadius: '8px', border: 'none', color: '#fff',
                background: isRunning ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              {isRunning ? <><Square size={18} /> Durdur</> : <><Play size={18} /> Başlat</>}
            </button>
            <button
              onClick={() => { setIsRunning(false); initSimulation(); }}
              className="btn-interactive"
              style={{
                padding: '0.75rem', borderRadius: '8px', border: 'none', color: '#fff',
                background: 'rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Merkezi Yıldız Kütlesi (M)</span>
              <span style={{ color: '#eab308' }}>{starMass}</span>
            </label>
            <input 
              type="range" min="1000" max="15000" step="100" value={starMass}
              onChange={(e) => setStarMass(Number(e.target.value))}
              disabled={isRunning}
              style={{ width: '100%', accentColor: '#eab308' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Gezegenin Kütlesi (m)</span>
              <span style={{ color: '#38bdf8' }}>{planetMass}</span>
            </label>
            <input 
              type="range" min="1" max="50" step="1" value={planetMass}
              onChange={(e) => setPlanetMass(Number(e.target.value))}
              disabled={isRunning}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>* İvme kütleden bağımsızdır (a = F/m).</small>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>İlk Hız (V0)</span>
              <span style={{ color: '#a855f7' }}>{initialVelocityY.toFixed(1)}</span>
            </label>
            <input 
              type="range" min="1" max="8" step="0.1" value={initialVelocityY}
              onChange={(e) => setInitialVelocityY(Number(e.target.value))}
              disabled={isRunning}
              style={{ width: '100%', accentColor: '#a855f7' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Yıldıza Uzaklık (r)</span>
              <span style={{ color: '#10b981' }}>{initialDistanceX}</span>
            </label>
            <input 
              type="range" min="100" max="350" step="10" value={initialDistanceX}
              onChange={(e) => setInitialDistanceX(Number(e.target.value))}
              disabled={isRunning}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
            <h4 style={{ color: '#38bdf8', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
              <Info size={16} /> Fizik Notu
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Eğer fırlatma hızı çok düşükse gezegen yıldıza çarpacaktır. Uygun bir hız verirseniz Elips veya Çembersel yörünge çizer. Hız çok yüksekse gezegen sistemden kopup uzaklaşır (Hiperbolik yörünge).
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
