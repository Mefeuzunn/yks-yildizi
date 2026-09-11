"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Target, Settings2, Compass, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EgikAtisSimulasyonu() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Physics State
  const [velocity, setVelocity] = useState<number>(40); // m/s
  const [angle, setAngle] = useState<number>(45); // degrees
  const [gravity, setGravity] = useState<number>(9.8); // m/s^2
  
  // Animation State
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // seconds
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  // Computed Values for HUD
  const radianAngle = (angle * Math.PI) / 180;
  const v0x = velocity * Math.cos(radianAngle);
  const v0y = velocity * Math.sin(radianAngle);
  
  const totalFlightTime = (2 * v0y) / gravity;
  const maxHeight = Math.pow(v0y, 2) / (2 * gravity);
  const maxRange = v0x * totalFlightTime;

  const currentX = v0x * time;
  const currentY = (v0y * time) - (0.5 * gravity * Math.pow(time, 2));

  // Trajectory History for Drawing
  const [path, setPath] = useState<{x: number, y: number}[]>([]);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    let lastTimestamp = performance.now();
    let currentTime = time;

    const renderLoop = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimestamp) / 1000; // in seconds
      lastTimestamp = timestamp;

      // Simulation runs at 2x speed for better UX
      currentTime += deltaTime * 2; 

      if (currentTime >= totalFlightTime) {
        currentTime = totalFlightTime;
        setIsRunning(false);
      }

      setTime(currentTime);
      
      const newX = v0x * currentTime;
      const newY = (v0y * currentTime) - (0.5 * gravity * Math.pow(currentTime, 2));
      setPath(prev => [...prev, { x: newX, y: newY }]);

      if (currentTime < totalFlightTime) {
        setAnimationFrameId(requestAnimationFrame(renderLoop));
      }
    };

    setAnimationFrameId(requestAnimationFrame(renderLoop));

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);

  // Canvas Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw Grid & Background
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Origin mapping (Bottom-Left corner with some padding)
    const originX = 50;
    const originY = height - 50;

    // Scale mapping (Meters to Pixels) - Auto scale based on max range
    // Allow max range up to 300 meters realistically in UI
    const pixelsPerMeter = (width - 100) / Math.max(maxRange * 1.2, 100);

    // Draw Axis
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, 0); ctx.lineTo(originX, height); // Y Axis
    ctx.moveTo(0, originY); ctx.lineTo(width, originY);  // X Axis
    ctx.stroke();

    // Draw Ideal Trajectory (Dashed)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let t = 0; t <= totalFlightTime; t += 0.1) {
      const px = originX + (v0x * t) * pixelsPerMeter;
      const py = originY - ((v0y * t) - (0.5 * gravity * Math.pow(t, 2))) * pixelsPerMeter;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Actual Path (Solid line behind ball)
    if (path.length > 0) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      path.forEach((p, index) => {
        const px = originX + p.x * pixelsPerMeter;
        const py = originY - p.y * pixelsPerMeter;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // Draw Projectile (Ball)
    const ballPx = originX + currentX * pixelsPerMeter;
    const ballPy = originY - currentY * pixelsPerMeter;

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ballPx, ballPy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset

  }, [time, currentX, currentY, path, maxRange, totalFlightTime, v0x, v0y, gravity]);

  const handleFire = () => {
    setIsRunning(false);
    setTime(0);
    setPath([]);
    setTimeout(() => setIsRunning(true), 50);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    setTime(0);
    setPath([]);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/simulasyonlar">
            <button className="btn-interactive" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} color="#ef4444" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Eğik Atış Simülasyonu</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Fiziksel değişkenleri ayarlayarak parabolik hareketi gözlemleyin.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleReset} className="btn-interactive" style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={18} /> Sıfırla
          </button>
          <button onClick={handleFire} className="btn-interactive" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
            <Play size={18} fill="currentColor" /> Ateşle
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        
        {/* Controls Panel */}
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
            <Settings2 size={20} />
            <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Parametreler</h2>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>İlk Hız ($v_0$)</label>
              <span style={{ color: '#fff', fontWeight: 600 }}>{velocity} m/s</span>
            </div>
            <input 
              type="range" min="10" max="100" value={velocity} 
              onChange={e => { setVelocity(Number(e.target.value)); handleReset(); }}
              style={{ width: '100%', accentColor: '#38bdf8' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Atış Açısı ($\theta$)</label>
              <span style={{ color: '#fff', fontWeight: 600 }}>{angle}°</span>
            </div>
            <input 
              type="range" min="0" max="90" value={angle} 
              onChange={e => { setAngle(Number(e.target.value)); handleReset(); }}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Yerçekimi İvmesi ($g$)</label>
              <span style={{ color: '#fff', fontWeight: 600 }}>{gravity} m/s²</span>
            </div>
            <select 
              value={gravity} 
              onChange={e => { setGravity(Number(e.target.value)); handleReset(); }}
              style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            >
              <option value="9.8">Dünya (9.8 m/s²)</option>
              <option value="1.62">Ay (1.62 m/s²)</option>
              <option value="3.72">Mars (3.72 m/s²)</option>
              <option value="24.79">Jüpiter (24.79 m/s²)</option>
            </select>
          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
            <h4 style={{ color: '#10b981', fontSize: '0.875rem', marginBottom: '0.5rem' }}>İpucu</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.5 }}>
              Aynı hızda maksimum menzile ulaşmak için atış açısını 45° olarak ayarlayın. Birbirini 90 dereceye tamamlayan açıların menzilleri eşittir!
            </p>
          </div>
        </div>

        {/* Simulation Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={500} 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
            
            {/* Live Data HUD inside Canvas */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minWidth: '200px' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Canlı X</div>
                <div style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>{currentX.toFixed(1)}m</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Canlı Y</div>
                <div style={{ fontSize: '1.25rem', color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>{Math.max(0, currentY).toFixed(1)}m</div>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Süre (t)</div>
                <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{time.toFixed(2)}s</div>
              </div>
            </div>
          </div>

          {/* Results Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="premium-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Compass size={20} color="#8b5cf6" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maksimum Menzil (X_max)</div>
                <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{maxRange.toFixed(2)} m</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={20} color="#ec4899" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maksimum Yükseklik (H_max)</div>
                <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{maxHeight.toFixed(2)} m</div>
              </div>
            </div>
            <div className="premium-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={20} color="#f59e0b" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Toplam Uçuş Süresi (t_ucus)</div>
                <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>{totalFlightTime.toFixed(2)} s</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
