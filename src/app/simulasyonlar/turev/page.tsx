"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DerivativeSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [xVal, setXVal] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Math Function
  // f(x) = x^3 / 3 - 2x^2 + 3x
  // Let's use something simple: f(x) = 0.5 * x^3 - 3 * x^2 + 4 * x + 5
  // For better canvas fit, let's use: f(x) = sin(x) * x or just a nice polynomial
  const f = (x: number) => 0.2 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + 2 * x + 5;
  const fPrime = (x: number) => 0.6 * Math.pow(x, 2) - 3 * x + 2;

  // Domain & Range for mapping
  const minX = -2;
  const maxX = 8;
  const minY = -5;
  const maxY = 15;

  useEffect(() => {
    draw();
  }, [xVal]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Mappers
    const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

    // Draw Grid & Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i = Math.floor(minX); i <= Math.ceil(maxX); i++) {
      ctx.beginPath(); ctx.moveTo(mapX(i), 0); ctx.lineTo(mapX(i), height); ctx.stroke();
    }
    for(let i = Math.floor(minY); i <= Math.ceil(maxY); i+=2) {
      ctx.beginPath(); ctx.moveTo(0, mapY(i)); ctx.lineTo(width, mapY(i)); ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    // X Axis
    if (minY <= 0 && maxY >= 0) {
      ctx.beginPath(); ctx.moveTo(0, mapY(0)); ctx.lineTo(width, mapY(0)); ctx.stroke();
    }
    // Y Axis
    if (minX <= 0 && maxX >= 0) {
      ctx.beginPath(); ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), height); ctx.stroke();
    }

    // Draw Function f(x)
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8'; // Blue
    ctx.lineWidth = 3;
    for (let x = minX; x <= maxX; x += 0.05) {
      const px = mapX(x);
      const py = mapY(f(x));
      if (x === minX) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current point
    const currentY = f(xVal);
    const px = mapX(xVal);
    const py = mapY(currentY);

    // Draw Tangent Line
    const m = fPrime(xVal);
    // y - y1 = m(x - x1)  => y = m(x - x1) + y1
    ctx.beginPath();
    ctx.strokeStyle = '#ec4899'; // Pink
    ctx.lineWidth = 2;
    // We want the line to span the screen
    const xLeft = minX;
    const yLeft = m * (xLeft - xVal) + currentY;
    const xRight = maxX;
    const yRight = m * (xRight - xVal) + currentY;
    
    ctx.moveTo(mapX(xLeft), mapY(yLeft));
    ctx.lineTo(mapX(xRight), mapY(yRight));
    ctx.stroke();

    // Draw Point
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Optional: Draw tangent triangle to show slope
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.setLineDash([5, 5]);
    const dx = 1; // 1 unit in math
    const p2x = xVal + dx;
    const p2y = currentY + m * dx;
    ctx.moveTo(px, py);
    ctx.lineTo(mapX(p2x), py); // horizontal
    ctx.lineTo(mapX(p2x), mapY(p2y)); // vertical
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#fcd34d';
    ctx.font = '12px sans-serif';
    ctx.fillText('dx=1', mapX(xVal + dx/2) - 10, py + 15);
    ctx.fillText(`dy=${m.toFixed(2)}`, mapX(p2x) + 5, mapY(currentY + (m*dx)/2));

  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateX(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) updateX(e);
  };

  const handleMouseUp = () => setIsDragging(false);

  const updateX = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = canvas.width;
    
    let newX = minX + (x / width) * (maxX - minX);
    if (newX < minX) newX = minX;
    if (newX > maxX) newX = maxX;
    
    setXVal(newX);
  };

  const currentY = f(xVal);
  const currentSlope = fPrime(xVal);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>📈</span> Türev ve Teğet Doğrusu
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Eğri üzerindeki noktayı kaydırarak türevin (anlık eğimin) nasıl değiştiğini gözlemleyin.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        <div style={{ backgroundColor: '#0e121e', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>$f(x) = 0.2x^3 - 1.5x^2 + 2x + 5$</div>
            <div style={{ color: '#ec4899', fontWeight: 700 }}>$f'(x) = 0.6x^2 - 3x + 2$</div>
          </div>

          <canvas 
            ref={canvasRef} 
            width={800} 
            height={500} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: 'auto', backgroundColor: '#0a0d14', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: isDragging ? 'grabbing' : 'grab' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', borderTop: '4px solid #8b5cf6' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem' }}>Nokta Kontrolü</h3>
            
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>x Değeri</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{xVal.toFixed(2)}</span>
              </div>
              <input type="range" min={minX} max={maxX} step="0.01" value={xVal} onChange={e => setXVal(Number(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
            </div>
          </div>

          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Anlık Değerler</h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #38bdf8' }}>
                 <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>f(x) Değeri (Yükseklik)</span>
                 <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem', color: '#38bdf8' }}>
                   {currentY.toFixed(2)}
                 </span>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #ec4899' }}>
                 <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>f'(x) Türev (Eğim)</span>
                 <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.25rem', color: '#ec4899' }}>
                   {currentSlope.toFixed(2)}
                 </span>
               </div>
             </div>
          </div>

          <div style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            <p style={{ fontSize: '0.9rem', color: '#fbcfe8', lineHeight: 1.5, margin: 0 }}>
              <strong>Biliyor musun?</strong> Türevin sıfır olduğu ($f'(x) = 0$) noktalar, fonksiyonun yerel maksimum (tepe) veya minimum (çukur) noktalarıdır. Kaydırarak bu noktaları bulmayı dene!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
