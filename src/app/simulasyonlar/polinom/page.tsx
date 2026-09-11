"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function PolinomSimulation() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-4);
  const [d, setD] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // P(x) = ax^3 + bx^2 + cx + d
  const f = (x: number) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;

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
    const originX = w / 2;
    const originY = h / 2;
    const scale = 40; // 40px = 1 unit

    let animationFrameId: number;

    const render = () => {
      // Arka plan
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Grid çizimi
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Dikey gridler
      for (let x = originX % scale; x < w; x += scale) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      // Yatay gridler
      for (let y = originY % scale; y < h; y += scale) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Eksenler
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(w, originY); ctx.stroke(); // X ekseni
      ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, h); ctx.stroke(); // Y ekseni

      // Sayılar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = -10; i <= 10; i++) {
        if (i !== 0) {
          ctx.fillText(i.toString(), originX + i * scale, originY + 5);
          ctx.fillText(i.toString(), originX - 10, originY - i * scale - 5);
        }
      }

      // Polinom Eğrisi
      ctx.strokeStyle = '#8b5cf6'; // Mor
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const points = [];
      for (let px = 0; px <= w; px++) {
        // Pixel to Cartesian X
        const cx = (px - originX) / scale;
        // Calculate Y
        const cy = f(cx);
        // Cartesian Y to Pixel
        const py = originY - (cy * scale);
        
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);

        points.push({ px, py, cx, cy });
      }
      ctx.stroke();

      // Kökleri Bul (X Eksenini Kestiği Noktalar)
      // Basit tarama metodu ile y=0 geçişlerini yakalayalım
      const roots = [];
      for (let i = 1; i < points.length; i++) {
        const p1 = points[i-1];
        const p2 = points[i];
        
        // İşaret değiştiyse arada bir kök vardır (y eksenini kesiyor)
        if (p1.cy * p2.cy <= 0) {
           // Lineer interpolasyon ile kökün tam piksel x'ini bul
           const t = Math.abs(p1.cy) / (Math.abs(p1.cy) + Math.abs(p2.cy));
           const rootPx = p1.px + t * (p2.px - p1.px);
           const rootCx = p1.cx + t * (p2.cx - p1.cx);
           roots.push({ rootPx, rootCx });
        }
      }

      // Kökleri Çiz
      roots.forEach(root => {
        ctx.beginPath();
        ctx.arc(root.rootPx, originY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981'; // Yeşil
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Kök değerini yaz
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`x: ${root.rootCx.toFixed(2)}`, root.rootPx, originY - 20);
      });

      // Y Eksenini Kestiği Nokta
      ctx.beginPath();
      ctx.arc(originX, originY - (d * scale), 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b'; // Turuncu
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`y: ${d}`, originX + 25, originY - (d * scale) - 5);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [a, b, c, d]);

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
              onClick={() => { setA(1); setB(0); setC(-4); setD(0); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Polinomların Dansı</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>3. Dereceden bir polinomun katsayılarını değiştirerek köklerin ve tepe noktalarının nasıl "dans ettiğini" izleyin.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Fonksiyon Gösterimi */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
               <span style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'serif' }}>
                 P(x) = 
                 <span style={{ color: '#8b5cf6' }}> {a !== 0 ? (a === 1 ? 'x³' : a === -1 ? '-x³' : `${a}x³`) : ''} </span>
                 <span style={{ color: '#ec4899' }}> {b !== 0 ? (b > 0 ? (a!==0 ? '+ ' : '') + (b===1 ? 'x²' : `${b}x²`) : (b===-1 ? '-x²' : `${b}x²`)) : ''} </span>
                 <span style={{ color: '#38bdf8' }}> {c !== 0 ? (c > 0 ? ((a!==0 || b!==0) ? '+ ' : '') + (c===1 ? 'x' : `${c}x`) : (c===-1 ? '-x' : `${c}x`)) : ''} </span>
                 <span style={{ color: '#f59e0b' }}> {d !== 0 ? (d > 0 ? ((a!==0 || b!==0 || c!==0) ? '+ ' : '') + d : d) : ((a===0&&b===0&&c===0) ? '0' : '')} </span>
               </span>
            </div>

            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div> Kökler (x)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></div> y Eksenini Kestiği Yer</div>
              </div>
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Katsayılar</h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#8b5cf6' }}>a (x³ katsayısı)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{a}</span>
              </div>
              <input type="range" min="-5" max="5" step="0.5" value={a} onChange={(e) => setA(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ec4899' }}>b (x² katsayısı)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{b}</span>
              </div>
              <input type="range" min="-10" max="10" step="0.5" value={b} onChange={(e) => setB(Number(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8' }}>c (x katsayısı)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{c}</span>
              </div>
              <input type="range" min="-20" max="20" step="1" value={c} onChange={(e) => setC(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b' }}>d (Sabit terim)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{d}</span>
              </div>
              <input type="range" min="-10" max="10" step="1" value={d} onChange={(e) => setD(Number(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Calculator size={24} color="#8b5cf6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.25rem' }}>Matematiksel Analiz</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    <li><b>a {'>'} 0</b> ise sağ kol yukarı, sol kol aşağı bakar.</li>
                    <li>Sabit terim (<b>d</b>), fonksiyonun Y eksenini kestiği noktadır.</li>
                    <li>Türevi (eğim sıfır) hesaplayarak tepe ve çukur noktalarını da bulabilirsiniz.</li>
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
