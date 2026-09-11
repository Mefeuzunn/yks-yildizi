"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function FotosentezSimulation() {
  const [light, setLight] = useState(50); // 0-100
  const [temp, setTemp] = useState(25); // 0-50 C

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reaction Rates
  // Photosynthesis optimal at ~25C. Denatures at 40C. 
  // Respiration optimal at ~37C.
  const getPhotosynthesisRate = () => {
    let tempFactor = 1;
    if (temp < 10) tempFactor = 0.2;
    else if (temp < 20) tempFactor = 0.6;
    else if (temp <= 30) tempFactor = 1.0;
    else if (temp <= 40) tempFactor = 0.5;
    else tempFactor = 0.0;

    const lightFactor = light / 100;
    return tempFactor * lightFactor * 5; // max 5 particles per tick
  };

  const getRespirationRate = () => {
    let tempFactor = 1;
    if (temp < 10) tempFactor = 0.3;
    else if (temp < 25) tempFactor = 0.7;
    else if (temp <= 40) tempFactor = 1.0;
    else tempFactor = 0.2;

    return tempFactor * 2; // Respiration is generally slower but constant
  };

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

    // Organelle positions
    const chloroX = w * 0.25;
    const chloroY = h / 2;
    const mitoX = w * 0.75;
    const mitoY = h / 2;
    const radius = 60;

    const particles: any[] = [];
    let frameId: number;

    const createParticle = (type: 'O2' | 'CO2' | 'Glucose' | 'ATP', from: 'Chloro' | 'Mito') => {
      const startX = from === 'Chloro' ? chloroX : mitoX;
      const startY = from === 'Chloro' ? chloroY : mitoY;
      
      let targetX = from === 'Chloro' ? mitoX : chloroX;
      let targetY = from === 'Chloro' ? mitoY : chloroY;

      // Add some random scatter
      targetX += (Math.random() - 0.5) * 40;
      targetY += (Math.random() - 0.5) * 40;

      let color = '#fff';
      if (type === 'O2') color = '#ef4444'; // Red
      if (type === 'CO2') color = '#38bdf8'; // Blue
      if (type === 'Glucose') color = '#10b981'; // Green
      if (type === 'ATP') color = '#eab308'; // Yellow

      // ATP leaves mito to the cell body (random)
      if (type === 'ATP') {
        targetX = Math.random() * w;
        targetY = Math.random() * h;
      }

      particles.push({
        x: startX + (Math.random() - 0.5) * 20,
        y: startY + (Math.random() - 0.5) * 20,
        tx: targetX,
        ty: targetY,
        type,
        color,
        life: 1.0,
        speed: Math.random() * 0.01 + 0.005
      });
    };

    let tick = 0;

    const render = () => {
      ctx.fillStyle = '#0f111a'; // Cell fluid background
      ctx.fillRect(0, 0, w, h);

      // Draw Chloroplast (Left)
      ctx.fillStyle = '#065f46'; // Dark Green
      ctx.beginPath();
      ctx.ellipse(chloroX, chloroY, radius, radius * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#10b981';
      ctx.stroke();
      // Grana (Thylakoids)
      ctx.fillStyle = '#34d399';
      for(let i=0; i<3; i++) {
        ctx.fillRect(chloroX - 20, chloroY - 30 + i*25, 40, 10);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Kloroplast", chloroX, chloroY + radius*1.5 + 20);

      // Draw Mitochondrion (Right)
      ctx.fillStyle = '#7f1d1d'; // Dark Red
      ctx.beginPath();
      ctx.ellipse(mitoX, mitoY, radius, radius * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ef4444';
      ctx.stroke();
      // Cristae
      ctx.beginPath();
      ctx.moveTo(mitoX - radius + 10, mitoY);
      ctx.lineTo(mitoX - 20, mitoY - 20);
      ctx.lineTo(mitoX, mitoY + 20);
      ctx.lineTo(mitoX + 20, mitoY - 20);
      ctx.lineTo(mitoX + radius - 10, mitoY);
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText("Mitokondri", mitoX, mitoY + radius*1.2 + 20);

      // Light Beams if Light > 0
      if (light > 0) {
        ctx.fillStyle = `rgba(250, 204, 21, ${light/200})`; // Yellow transparent
        ctx.beginPath();
        ctx.moveTo(chloroX - radius, 0);
        ctx.lineTo(chloroX + radius, 0);
        ctx.lineTo(chloroX + radius + 20, chloroY);
        ctx.lineTo(chloroX - radius - 20, chloroY);
        ctx.fill();
      }

      // Logic
      tick++;
      const pRate = getPhotosynthesisRate();
      const rRate = getRespirationRate();

      // Photosynthesis spawns O2 and Glucose going right
      if (Math.random() < pRate * 0.1) {
        createParticle('O2', 'Chloro');
        if (Math.random() < 0.3) createParticle('Glucose', 'Chloro'); // less frequent visual
      }

      // Respiration spawns CO2 going left, and ATP going everywhere
      if (Math.random() < rRate * 0.1) {
        createParticle('CO2', 'Mito');
        if (Math.random() < 0.5) createParticle('ATP', 'Mito');
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Lerp position
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;

        // Distance to target
        const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
        if (dist < 5) {
          p.life -= 0.05; // fade out when arrived
        }

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.type === 'Glucose') {
          ctx.fillRect(p.x - 4, p.y - 4, 8, 8); // Square for Glucose
        } else if (p.type === 'ATP') {
          // Star-ish
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 5);
          ctx.lineTo(p.x + 3, p.y + 3);
          ctx.lineTo(p.x - 4, p.y - 1);
          ctx.lineTo(p.x + 4, p.y - 1);
          ctx.lineTo(p.x - 3, p.y + 3);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.type === 'O2' ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [light, temp]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => { setLight(50); setTemp(25); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Fotosentez ve Solunum Döngüsü</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Bitki hücresi içindeki kloroplast ve mitokondri arasındaki gaz, glikoz ve enerji alışverişini izleyin.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div> O₂</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '50%' }}></div> CO₂</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#10b981' }}></div> Glikoz</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#eab308', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}></div> ATP</div>
              </div>
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Çevre Şartları</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Işık Şiddeti</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>%{light}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={light} 
                onChange={(e) => setLight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#eab308' }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sıcaklık</label>
                <span style={{ fontSize: '0.9rem', color: temp > 40 ? '#ef4444' : '#fff', fontWeight: 700 }}>{temp} °C</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={temp} 
                onChange={(e) => setTemp(Number(e.target.value))}
                style={{ width: '100%', accentColor: temp > 40 ? '#ef4444' : '#ef4444' }}
              />
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Leaf size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Organeller Ne Yapıyor?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {temp > 40 ? "Sıcaklık çok yüksek! Kloroplast enzimleri denatüre oldu, fotosentez durdu." :
                   light === 0 ? "Karanlık ortamda fotosentez yapılmaz. Sadece oksijenli solunum (mitokondri) aktiftir." :
                   "Işık enerjisi kloroplastta glikoz ve O₂ üretir. Mitokondri bunları alıp enerji (ATP) ve CO₂ üretir."}
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
