"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Atom, Play, Pause } from 'lucide-react';
import Link from 'next/link';

type Nucleus = {
  id: number;
  x: number;
  y: number;
  decayed: boolean;
  decayTime: number | null;
};

export default function RadyoaktifBozunmaSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef = useRef<HTMLCanvasElement>(null);

  const [n0, setN0] = useState(400); // Başlangıç çekirdek sayısı
  const [halfLife, setHalfLife] = useState(5); // Yarı ömür (saniye)
  const [isRunning, setIsRunning] = useState(false);
  
  const [time, setTime] = useState(0); // Geçen süre
  const [remaining, setRemaining] = useState(400);

  const nucleiRef = useRef<Nucleus[]>([]);
  const timeRef = useRef(0);
  const historyRef = useRef<{t: number, n: number}[]>([]); // Grafik için geçmiş

  // Çekirdekleri başlat
  const initNuclei = () => {
    const newNuclei: Nucleus[] = [];
    // 600x400 canvas içinde grid şeklinde dağıt
    const cols = Math.ceil(Math.sqrt(n0 * 1.5)); // Aspect ratio ~ 1.5
    const rows = Math.ceil(n0 / cols);
    
    const cw = 600;
    const ch = 400;
    const padding = 40;
    const spacingX = (cw - 2 * padding) / cols;
    const spacingY = (ch - 2 * padding) / rows;

    for (let i = 0; i < n0; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      // Hafif rastgelelik ekle (Grid gibi durmasın)
      const offsetX = (Math.random() - 0.5) * spacingX * 0.8;
      const offsetY = (Math.random() - 0.5) * spacingY * 0.8;
      
      newNuclei.push({
        id: i,
        x: padding + c * spacingX + offsetX,
        y: padding + r * spacingY + offsetY,
        decayed: false,
        decayTime: null,
      });
    }
    nucleiRef.current = newNuclei;
    timeRef.current = 0;
    setTime(0);
    setRemaining(n0);
    historyRef.current = [{ t: 0, n: n0 }];
  };

  useEffect(() => {
    if (!isRunning && time === 0) {
      initNuclei();
    }
  }, [n0, isRunning]);

  // Simülasyon Döngüsü (Fizik ve Çizim)
  useEffect(() => {
    const canvas = canvasRef.current;
    const graphCanvas = graphRef.current;
    if (!canvas || !graphCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const gctx = graphCanvas.getContext('2d');
    if (!ctx || !gctx) return;

    // Canvas boyutlandırma
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height; // Veya sabit bir oran
    }
    const grect = graphCanvas.parentElement?.getBoundingClientRect();
    if (grect) {
      graphCanvas.width = grect.width;
      graphCanvas.height = 200; // Sabit yükseklik
    }

    const w = canvas.width;
    const h = canvas.height;
    const gw = graphCanvas.width;
    const gh = graphCanvas.height;

    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const render = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000; // Saniye cinsinden
      lastTimestamp = timestamp;

      if (isRunning) {
        timeRef.current += dt;
        setTime(timeRef.current);

        // Bozunma Olasılığı: P = 1 - e^(-lambda * dt)
        // lambda = ln(2) / T_1/2
        const lambda = Math.LN2 / halfLife;
        const decayProb = 1 - Math.exp(-lambda * dt);

        let currentRemaining = 0;
        nucleiRef.current.forEach(n => {
          if (!n.decayed) {
            if (Math.random() < decayProb) {
              n.decayed = true;
              n.decayTime = timeRef.current;
            } else {
              currentRemaining++;
            }
          }
        });

        setRemaining(currentRemaining);

        // Grafiğe ekle (Saniyede birkaç kez)
        if (historyRef.current.length === 0 || timeRef.current - historyRef.current[historyRef.current.length - 1].t > 0.1) {
          historyRef.current.push({ t: timeRef.current, n: currentRemaining });
        }
      }

      // --- ANA CANVAS ÇİZİMİ ---
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      const radius = n0 > 500 ? 3 : n0 > 200 ? 5 : 8;

      nucleiRef.current.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        
        if (!n.decayed) {
          // Radyoaktif çekirdek (Bozunmamış) - Mavi/Mor parlayan
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
          if (n0 <= 200) {
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else {
          // Kararlı çekirdek (Bozunmuş) - Kırmızı/Gri mat
          // Yeni bozunduğunda parlaması için animasyon
          const timeSinceDecay = timeRef.current - (n.decayTime || 0);
          if (timeSinceDecay < 0.5 && isRunning) {
             ctx.fillStyle = '#fde047'; // Sarımsı parlama anlık
             ctx.fill();
          } else {
             ctx.fillStyle = '#ef4444'; // Kırmızı kararlı
             ctx.fill();
          }
        }
      });

      // --- GRAFİK CANVAS ÇİZİMİ ---
      gctx.fillStyle = '#1e293b';
      gctx.fillRect(0, 0, gw, gh);

      // Eksenler
      const padLeft = 40;
      const padBottom = 30;
      const padTop = 20;
      const padRight = 20;

      gctx.strokeStyle = 'rgba(255,255,255,0.2)';
      gctx.lineWidth = 1;
      gctx.beginPath();
      gctx.moveTo(padLeft, padTop);
      gctx.lineTo(padLeft, gh - padBottom);
      gctx.lineTo(gw - padRight, gh - padBottom);
      gctx.stroke();

      gctx.fillStyle = 'rgba(255,255,255,0.5)';
      gctx.font = '10px sans-serif';
      gctx.fillText('N', 10, padTop + 5);
      gctx.fillText('Zaman (t)', gw / 2, gh - 5);

      // Çizgi
      if (historyRef.current.length > 0) {
        const maxT = Math.max(timeRef.current, halfLife * 3); // En az 3 yarı ömür göster
        
        gctx.beginPath();
        gctx.strokeStyle = '#38bdf8';
        gctx.lineWidth = 2;

        historyRef.current.forEach((pt, idx) => {
           const x = padLeft + (pt.t / maxT) * (gw - padLeft - padRight);
           const y = (gh - padBottom) - (pt.n / n0) * (gh - padBottom - padTop);
           if (idx === 0) gctx.moveTo(x, y);
           else gctx.lineTo(x, y);
        });
        gctx.stroke();

        // Şimdiki nokta
        const lastPt = historyRef.current[historyRef.current.length - 1];
        const lx = padLeft + (lastPt.t / maxT) * (gw - padLeft - padRight);
        const ly = (gh - padBottom) - (lastPt.n / n0) * (gh - padBottom - padTop);
        gctx.fillStyle = '#f43f5e';
        gctx.beginPath();
        gctx.arc(lx, ly, 4, 0, Math.PI * 2);
        gctx.fill();

        // Teorik Eğri (İnce beyaz kesik çizgi)
        gctx.beginPath();
        gctx.strokeStyle = 'rgba(255,255,255,0.3)';
        gctx.setLineDash([5, 5]);
        gctx.lineWidth = 1;
        for (let t = 0; t <= maxT; t += maxT/50) {
           const val = n0 * Math.exp(-(Math.LN2 / halfLife) * t);
           const x = padLeft + (t / maxT) * (gw - padLeft - padRight);
           const y = (gh - padBottom) - (val / n0) * (gh - padBottom - padTop);
           if (t === 0) gctx.moveTo(x, y);
           else gctx.lineTo(x, y);
        }
        gctx.stroke();
        gctx.setLineDash([]);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, n0, halfLife]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
          <button 
            onClick={() => { setIsRunning(false); initNuclei(); }}
            className="btn-interactive"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Sıfırla
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Radyoaktif Bozunma ve Yarı Ömür</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Kararsız atom çekirdeklerinin zamanla rastgele bozunarak kararlı hale geçmesi ve üstel azalma yasası.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Analiz Panelleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Geçen Zaman (t)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{time.toFixed(1)} sn</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#38bdf8', marginBottom: '0.5rem' }}>Kalan Çekirdek (N)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{remaining}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#ef4444', marginBottom: '0.5rem' }}>Bozunan Çekirdek</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{n0 - remaining}</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

            {/* Graph Container */}
            <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '200px' }}>
              <canvas 
                ref={graphRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Kontroller</h3>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : '#10b981',
                color: isRunning ? '#ef4444' : '#fff',
                fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {isRunning ? <Pause size={20}/> : <Play size={20}/>}
              {isRunning ? 'Durdur' : 'Bozunmayı Başlat'}
            </button>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Başlangıç Çekirdek (N₀)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{n0}</span>
              </div>
              <input 
                type="range" min="100" max="1000" step="10" 
                value={n0} 
                onChange={(e) => { setN0(Number(e.target.value)); setIsRunning(false); }} 
                disabled={isRunning || time > 0}
                style={{ width: '100%', accentColor: '#38bdf8', opacity: (isRunning || time > 0) ? 0.5 : 1 }} 
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Yarı Ömür (T₁/₂)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{halfLife} sn</span>
              </div>
              <input 
                type="range" min="1" max="20" step="1" 
                value={halfLife} 
                onChange={(e) => setHalfLife(Number(e.target.value))} 
                style={{ width: '100%', accentColor: '#f43f5e' }} 
              />
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Atom size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>Bozunma Yasası</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <b style={{ color: '#fff' }}>N(t) = N₀ · e^(-λt)</b>
                  <br/>
                  <br/>
                  Her bir radyoaktif çekirdeğin ne zaman bozunacağı tamamen rastgele (olasılıksal) olsa da, çok sayıda çekirdek bir araya geldiğinde mükemmel bir üstel eğri (kesik çizgili teorik eğri) ortaya çıkar.
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
