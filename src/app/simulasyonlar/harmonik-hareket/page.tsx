"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HarmonikHareketSimulation() {
  const [mass, setMass] = useState(1); // kg
  const [k, setK] = useState(10); // N/m
  const [amplitude, setAmplitude] = useState(100); // px
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  // w = sqrt(k/m)
  const omega = Math.sqrt(k / mass);
  const period = 2 * Math.PI / omega;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;
    const eqX = w / 2; // Equilibrium position (Denge noktası)

    let animationFrameId: number;
    let lastTime = performance.now();

    const drawSpring = (startX: number, startY: number, endX: number, endY: number, coils: number) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      const dist = endX - startX;
      const coilWidth = dist / coils;
      
      for(let i=0; i<coils; i++) {
        const xCenter = startX + i * coilWidth + coilWidth/2;
        const xEnd = startX + (i+1) * coilWidth;
        
        // Up and down zig-zag
        ctx.lineTo(xCenter, startY - 15);
        ctx.lineTo(xEnd, startY + (i === coils - 1 ? 0 : 15));
      }
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000; // seconds
      lastTime = time;

      if (isRunning) {
        timeRef.current += dt * 3; // speed up time visually
      }

      const t = timeRef.current;
      
      // x(t) = A * cos(w*t)
      const x = amplitude * Math.cos(omega * t);
      // v(t) = -A * w * sin(w*t)
      const v = -amplitude * omega * Math.sin(omega * t);
      // a(t) = -A * w^2 * cos(w*t)
      const a = -amplitude * Math.pow(omega, 2) * Math.cos(omega * t);

      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Zemin ve Duvar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, centerY + 30, w, h); // Zemin
      ctx.fillRect(0, centerY - 80, 20, 110); // Duvar

      // Denge Konumu (Kesik Çizgi)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(eqX, centerY - 100);
      ctx.lineTo(eqX, centerY + 50);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Denge (x=0)', eqX, centerY + 65);

      // Amplitüd Çizgileri
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath(); ctx.moveTo(eqX - amplitude, centerY - 100); ctx.lineTo(eqX - amplitude, centerY + 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(eqX + amplitude, centerY - 100); ctx.lineTo(eqX + amplitude, centerY + 50); ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.fillText('-A', eqX - amplitude, centerY + 65);
      ctx.fillText('+A', eqX + amplitude, centerY + 65);

      // Kütle pozisyonu
      const massX = eqX + x;
      const massSize = 40 + (mass * 5); // Visually scale mass

      // Yay
      drawSpring(20, centerY, massX - massSize/2, centerY, 15);

      // Kütle
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(massX - massSize/2, centerY - massSize/2, massSize, massSize);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(massX - massSize/2, centerY - massSize/2, massSize, massSize);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${mass}kg`, massX, centerY + 5);

      // Hız Vektörü (Yeşil)
      if (Math.abs(v) > 5) {
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = '#10b981';
        ctx.lineWidth = 3;
        const vLen = v * 0.5; // scale for display
        ctx.beginPath();
        ctx.moveTo(massX, centerY - massSize/2 - 10);
        ctx.lineTo(massX + vLen, centerY - massSize/2 - 10);
        ctx.stroke();
        // Ok ucu
        ctx.beginPath();
        ctx.arc(massX + vLen, centerY - massSize/2 - 10, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.fillText('v', massX + vLen/2, centerY - massSize/2 - 15);
      }

      // İvme / Kuvvet Vektörü (Kırmızı)
      if (Math.abs(a) > 5) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 3;
        const aLen = a * 0.05; // scale for display
        ctx.beginPath();
        ctx.moveTo(massX, centerY - massSize/2 - 30);
        ctx.lineTo(massX + aLen, centerY - massSize/2 - 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(massX + aLen, centerY - massSize/2 - 30, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.fillText('a (F)', massX + aLen/2, centerY - massSize/2 - 35);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, mass, k, amplitude, omega]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => { setIsRunning(false); timeRef.current = 0; }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Basit Harmonik Hareket</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Yatay düzlemdeki yay sarkacının periyodunu, hızını ve geri çağırıcı kuvvet ivmesini interaktif olarak gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Formül Göstergeleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{period.toFixed(2)} s</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Periyot (T = 2π√(m/k))</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{(amplitude * omega).toFixed(1)}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max Hız (Vmax)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{(amplitude * Math.pow(omega, 2)).toFixed(1)}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max İvme (Amax)</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '450px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Laboratuvar Ayarları</h3>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : '#38bdf8',
                color: isRunning ? '#ef4444' : '#000',
                fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {isRunning ? 'Durdur' : 'Hareketi Başlat'}
            </button>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kütle (m)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{mass} kg</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={mass} onChange={(e) => setMass(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Yay Sabiti (k)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{k} N/m</span>
              </div>
              <input type="range" min="5" max="50" step="5" value={k} onChange={(e) => setK(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Genlik (A)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{amplitude} cm</span>
              </div>
              <input type="range" min="50" max="200" step="10" value={amplitude} onChange={(e) => { setAmplitude(Number(e.target.value)); if(!isRunning) timeRef.current = 0; }} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Activity size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>Önemli Notlar</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    <li><b>Uç noktalarda (±A):</b> Hız sıfırdır, kuvvet ve ivme maksimumdur.</li>
                    <li><b>Denge noktasında (x=0):</b> Kuvvet ve ivme sıfırdır, hız maksimumdur.</li>
                    <li>Genlik değişimi <b>periyodu etkilemez!</b> (T = 2π√(m/k))</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style jsx>{`
        @media (max-width: 900px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
