"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, AlignCenter } from 'lucide-react';
import Link from 'next/link';

type Cart = {
  x: number;
  y: number;
  m: number; // mass
  v: number; // velocity
  w: number; // width (visual mass)
  color: string;
};

export default function MomentumSimulation() {
  const [m1, setM1] = useState(1);
  const [v1, setV1] = useState(2);
  const [m2, setM2] = useState(1);
  const [v2, setV2] = useState(-1);
  const [isElastic, setIsElastic] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCollided, setHasCollided] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for rendering carts
  const [c1, setC1] = useState<Cart>({ x: 200, y: 300, m: 1, v: 2, w: 40, color: '#38bdf8' });
  const [c2, setC2] = useState<Cart>({ x: 600, y: 300, m: 1, v: -1, w: 40, color: '#f43f5e' });

  // P = mv
  const initialP = (m1 * v1) + (m2 * v2);
  const currentP = (c1.m * c1.v) + (c2.m * c2.v);

  // E = 1/2 mv^2
  const initialE = 0.5 * m1 * Math.pow(v1, 2) + 0.5 * m2 * Math.pow(v2, 2);
  const currentE = 0.5 * c1.m * Math.pow(c1.v, 2) + 0.5 * c2.m * Math.pow(c2.v, 2);

  const resetSim = () => {
    setIsRunning(false);
    setHasCollided(false);
    setC1({ x: 200, y: 300, m: m1, v: v1, w: 30 + m1 * 10, color: '#38bdf8' });
    setC2({ x: 600, y: 300, m: m2, v: v2, w: 30 + m2 * 10, color: '#f43f5e' });
  };

  // Keep carts updated when inputs change before running
  useEffect(() => {
    if (!isRunning && !hasCollided) {
      setC1(prev => ({ ...prev, m: m1, v: v1, w: 30 + m1 * 10 }));
      setC2(prev => ({ ...prev, m: m2, v: v2, w: 30 + m2 * 10 }));
    }
  }, [m1, v1, m2, v2, isRunning, hasCollided]);

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
    const groundY = h / 2 + 50;

    let animationFrameId: number;
    const localC1 = { ...c1, y: groundY - 40 };
    const localC2 = { ...c2, y: groundY - 40 };
    let collided = hasCollided;

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Zemin
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Izgara
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for(let i=0; i<w; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }

      // Physics Step
      if (isRunning) {
        localC1.x += localC1.v * 2; // scale speed for visual
        localC2.x += localC2.v * 2;

        // Collision Check
        if (!collided && localC1.x + localC1.w >= localC2.x - localC2.w) {
          collided = true;
          setHasCollided(true);
          
          if (isElastic) {
            // Elastic Collision (1D)
            const v1f = ((localC1.m - localC2.m) * localC1.v + 2 * localC2.m * localC2.v) / (localC1.m + localC2.m);
            const v2f = ((localC2.m - localC1.m) * localC2.v + 2 * localC1.m * localC1.v) / (localC1.m + localC2.m);
            localC1.v = v1f;
            localC2.v = v2f;
          } else {
            // Inelastic Collision (Stick together)
            const vf = ((localC1.m * localC1.v) + (localC2.m * localC2.v)) / (localC1.m + localC2.m);
            localC1.v = vf;
            localC2.v = vf;
            // Snap them together
            const center = (localC1.x + localC2.x) / 2;
            localC1.x = center - localC1.w/2;
            localC2.x = center + localC2.w/2;
          }
          
          // Update state so UI sees new speeds
          setC1({ ...localC1 });
          setC2({ ...localC2 });
        }
      }

      // Draw Carts
      const drawCart = (cart: Cart, label: string) => {
        // Body
        ctx.fillStyle = cart.color;
        ctx.fillRect(cart.x - cart.w/2, cart.y, cart.w, 30);
        
        // Wheels
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(cart.x - cart.w/2 + 5, cart.y + 30, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cart.x + cart.w/2 - 5, cart.y + 30, 8, 0, Math.PI*2); ctx.fill();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, cart.x, cart.y + 20);

        // Velocity Vector Arrow
        if (Math.abs(cart.v) > 0.01) {
          const arrowLength = cart.v * 15;
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cart.x, cart.y - 15);
          ctx.lineTo(cart.x + arrowLength, cart.y - 15);
          // Arrowhead
          const angle = Math.atan2(0, arrowLength);
          ctx.lineTo(cart.x + arrowLength - Math.sign(arrowLength)*5, cart.y - 15 - 5);
          ctx.moveTo(cart.x + arrowLength, cart.y - 15);
          ctx.lineTo(cart.x + arrowLength - Math.sign(arrowLength)*5, cart.y - 15 + 5);
          ctx.stroke();

          // v text
          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText(`v=${cart.v.toFixed(1)}`, cart.x + arrowLength/2, cart.y - 25);
        }
      };

      drawCart(localC1, `m=${localC1.m}`);
      drawCart(localC2, `m=${localC2.m}`);

      // Ekran dışına çıkınca durdur
      if (localC1.x < -100 || localC1.x > w+100 || localC2.x < -100 || localC2.x > w+100) {
        setIsRunning(false);
      }

      if (isRunning) {
        setC1({ ...localC1 });
        setC2({ ...localC2 });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, hasCollided, isElastic]);

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
              onClick={resetSim}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Momentum ve Çarpışmalar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Farklı kütle ve hızlara sahip iki cismin esnek veya esnek olmayan (kenetlenme) çarpışmalarını inceleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Göstergeler */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Toplam Momentum (P = mv)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>İlk: <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{initialP.toFixed(2)}</span> kg.m/s</div>
                  <div>Son: <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{currentP.toFixed(2)}</span> kg.m/s</div>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Toplam Kinetik Enerji (E = ½mv²)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>İlk: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{initialE.toFixed(2)}</span> J</div>
                  <div>Son: <span style={{ color: !isElastic && hasCollided ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>{currentE.toFixed(2)}</span> J</div>
                </div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {!isElastic && hasCollided && (
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #ef4444', fontWeight: 'bold' }}>
                  Esnek olmayan çarpışmada kinetik enerji ısıya dönüştü! (Kayıp: {(initialE - currentE).toFixed(2)} J)
                </div>
              )}
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Çarpışma Ayarları</h3>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={hasCollided}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: hasCollided ? '#475569' : isRunning ? 'rgba(239, 68, 68, 0.2)' : '#38bdf8',
                color: hasCollided ? '#94a3b8' : isRunning ? '#ef4444' : '#000',
                fontSize: '1.1rem', fontWeight: 600, cursor: hasCollided ? 'not-allowed' : 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {hasCollided ? 'Çarpışma Gerçekleşti' : isRunning ? 'Durdur' : 'Başlat'}
            </button>

            {/* Çarpışma Türü */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => { setIsElastic(true); resetSim(); }} 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: isElastic ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', background: isElastic ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                Esnek Çarpışma
              </button>
              <button 
                onClick={() => { setIsElastic(false); resetSim(); }} 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: !isElastic ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)', background: !isElastic ? 'rgba(139, 92, 246, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                Esnek Olmayan
              </button>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#38bdf8', margin: '0 0 1rem 0' }}>1. Cisim (Mavi)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kütle (m₁): {m1} kg</label>
              </div>
              <input type="range" min="1" max="10" step="1" value={m1} onChange={(e) => setM1(Number(e.target.value))} style={{ width: '100%', marginBottom: '1rem', accentColor: '#38bdf8' }} disabled={isRunning || hasCollided} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hız (v₁): {v1} m/s</label>
              </div>
              <input type="range" min="-5" max="5" step="1" value={v1} onChange={(e) => setV1(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} disabled={isRunning || hasCollided} />
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#f43f5e', margin: '0 0 1rem 0' }}>2. Cisim (Kırmızı)</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Kütle (m₂): {m2} kg</label>
              </div>
              <input type="range" min="1" max="10" step="1" value={m2} onChange={(e) => setM2(Number(e.target.value))} style={{ width: '100%', marginBottom: '1rem', accentColor: '#f43f5e' }} disabled={isRunning || hasCollided} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hız (v₂): {v2} m/s</label>
              </div>
              <input type="range" min="-5" max="5" step="1" value={v2} onChange={(e) => setV2(Number(e.target.value))} style={{ width: '100%', accentColor: '#f43f5e' }} disabled={isRunning || hasCollided} />
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
