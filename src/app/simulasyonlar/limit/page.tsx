"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function LimitSimulation() {
  const [xValue, setXValue] = useState(0); // -2 to 6
  const targetX = 2;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // f(x) = (x^2 - 4) / (x - 2)
  // undefined at x=2, otherwise x+2
  const f = (x: number) => {
    if (Math.abs(x - targetX) < 0.001) return null; // Undefined (Hole)
    return x + 2;
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

    ctx.clearRect(0, 0, w, h);

    // Coordinate System Setup
    const minX = -1;
    const maxX = 5;
    const minY = -1;
    const maxY = 7;

    const mapX = (x: number) => ((x - minX) / (maxX - minX)) * w;
    const mapY = (y: number) => h - ((y - minY) / (maxY - minY)) * h;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = minX; i <= maxX; i++) {
      ctx.beginPath(); ctx.moveTo(mapX(i), 0); ctx.lineTo(mapX(i), h); ctx.stroke();
    }
    for (let i = minY; i <= maxY; i++) {
      ctx.beginPath(); ctx.moveTo(0, mapY(i)); ctx.lineTo(w, mapY(i)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), h); ctx.stroke(); // Y axis
    ctx.beginPath(); ctx.moveTo(0, mapY(0)); ctx.lineTo(w, mapY(0)); ctx.stroke(); // X axis

    // Draw Function Curve
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let isFirst = true;
    for (let px = 0; px <= w; px++) {
      const x = minX + (px / w) * (maxX - minX);
      // Skip drawing exactly at targetX to leave a hole, though we draw the hole manually later
      const y = x + 2; 
      
      if (isFirst) {
        ctx.moveTo(px, mapY(y));
        isFirst = false;
      } else {
        ctx.lineTo(px, mapY(y));
      }
    }
    ctx.stroke();

    // Draw Hole at x=2
    const holeX = mapX(targetX);
    const holeY = mapY(4);
    ctx.fillStyle = '#0b0f19'; // background color
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(holeX, holeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw current X indicator
    const currentY = f(xValue);
    if (currentY !== null) {
      const cx = mapX(xValue);
      const cy = mapY(currentY);

      // Dashed lines to axes
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      // Vertical line to x-axis
      ctx.beginPath(); ctx.moveTo(cx, mapY(0)); ctx.lineTo(cx, cy); ctx.stroke();
      // Horizontal line to y-axis
      ctx.beginPath(); ctx.moveTo(mapX(0), cy); ctx.lineTo(cx, cy); ctx.stroke();
      
      ctx.setLineDash([]); // reset

      // Point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();

      // Tooltip
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText(`(${xValue.toFixed(2)}, ${currentY.toFixed(2)})`, cx + 10, cy - 10);
    } else {
      // Exactly at hole
      const cx = mapX(targetX);
      const cy = mapY(4);
      
      // Vertical line to x-axis
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(cx, mapY(0)); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.setLineDash([]);
      
      // Red Cross for undefined
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
      ctx.moveTo(cx + 8, cy - 8); ctx.lineTo(cx - 8, cy + 8);
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Tanımsız!`, cx + 15, cy - 10);
    }

    // Approach Arrows
    if (xValue < targetX - 0.1) {
      // Approaching from left
      ctx.fillStyle = '#10b981';
      ctx.font = '20px sans-serif';
      ctx.fillText("⟶", mapX(targetX) - 40, mapY(0) - 10);
    } else if (xValue > targetX + 0.1) {
      // Approaching from right
      ctx.fillStyle = '#10b981';
      ctx.font = '20px sans-serif';
      ctx.fillText("⟵", mapX(targetX) + 20, mapY(0) - 10);
    }

  }, [xValue]);

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
              onClick={() => setXValue(0)}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Limit ve Süreklilik</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Bir fonksiyonda tanımsız noktaya sağdan ve soldan yaklaşırken değerlerin (y) nereye gittiğini keşfedin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Fonksiyon Denklemi */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#c084fc' }}>f(x) =</span> 
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #fff', padding: '0 0.5rem' }}>x² - 4</span>
                  <span style={{ padding: '0 0.5rem' }}>x - 2</span>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>x = 2 noktasında payda 0 olduğu için tanımsızdır. Ancak limiti vardır.</div>
            </div>

            {/* Canvas Grafik */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Yaklaşım Kontrolü</h3>
            </div>

            {/* Değer Göstergeleri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>x Değeri:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{xValue.toFixed(3)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>f(x) Değeri:</span>
                <span style={{ fontWeight: 700, color: Math.abs(xValue - 2) < 0.001 ? '#ef4444' : '#c084fc' }}>
                  {Math.abs(xValue - 2) < 0.001 ? 'Tanımsız' : (xValue + 2).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Slider: X Değeri */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Noktayı Kaydır (x)</label>
              </div>
              <input 
                type="range" 
                min="-1" 
                max="5" 
                step="0.01"
                value={xValue} 
                onChange={(e) => setXValue(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Sol</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>x=2 (Hedef)</span>
                <span>Sağ</span>
              </div>
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(192, 132, 252, 0.1)', border: '1px solid rgba(192, 132, 252, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Calculator size={24} color="#c084fc" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#c084fc', marginBottom: '0.25rem' }}>Limit Ne Söyler?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {xValue < 1.9 ? "Sağdan x=2 noktasına doğru yaklaşın." :
                   xValue > 2.1 ? "Soldan x=2 noktasına doğru yaklaşın." :
                   Math.abs(xValue - 2) < 0.001 ? "Tam x=2 noktasında fonksiyon deliklidir (tanımsız). Ancak sağdan ve soldan yaklaştığımızda y'nin 4'e gittiğini gördük. İşte limit budur!" :
                   "Gördüğünüz gibi x değeri 2'ye yaklaştıkça, f(x) değeri 4'e yaklaşıyor."}
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
