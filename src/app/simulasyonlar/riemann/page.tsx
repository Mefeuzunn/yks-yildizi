"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, AreaChart } from 'lucide-react';
import Link from 'next/link';

type Method = 'left' | 'right' | 'mid';

export default function RiemannSimulation() {
  const [n, setN] = useState(4); // Dikdörtgen sayısı
  const [method, setMethod] = useState<Method>('left'); // Yaklaşım yöntemi

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonksiyon: f(x) = -x^2 + 4x (Kökler: 0 ve 4, Tepe Noktası: x=2, y=4)
  const a = 0; // Başlangıç
  const b = 4; // Bitiş
  const exactArea = 32 / 3; // 10.666... (İntegral sonucu)

  const f = (x: number) => -Math.pow(x, 2) + 4 * x;

  // Riemann Toplamı Hesaplama
  const dx = (b - a) / n;
  let approxArea = 0;

  for (let i = 0; i < n; i++) {
    const xLeft = a + i * dx;
    const xRight = a + (i + 1) * dx;
    const xMid = (xLeft + xRight) / 2;

    let height = 0;
    if (method === 'left') height = f(xLeft);
    if (method === 'right') height = f(xRight);
    if (method === 'mid') height = f(xMid);

    approxArea += height * dx;
  }

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

    // Koordinat sistemi ayarları
    // X ekseni 0'dan 5'e, Y ekseni 0'dan 5'e
    const scaleX = w / 5; 
    const scaleY = h / 5;
    const originY = h; // y=0 alt çizgi
    const originX = 0; // x=0 sol çizgi

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // Grid (Izgara)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<=5; i+=0.5) {
      // Dikey çizgiler (x)
      ctx.beginPath(); ctx.moveTo(i * scaleX, 0); ctx.lineTo(i * scaleX, h); ctx.stroke();
      // Yatay çizgiler (y)
      ctx.beginPath(); ctx.moveTo(0, h - i * scaleY); ctx.lineTo(w, h - i * scaleY); ctx.stroke();
    }

    // Gerçek Eğriyi (Fonksiyonu) Çizme
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = a; x <= b; x += 0.05) {
      const px = x * scaleX;
      const py = originY - f(x) * scaleY;
      if (x === a) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Eğrinin altını doldurma (gerçek alan)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
    ctx.beginPath();
    ctx.moveTo(a * scaleX, originY);
    for (let x = a; x <= b; x += 0.05) {
      ctx.lineTo(x * scaleX, originY - f(x) * scaleY);
    }
    ctx.lineTo(b * scaleX, originY);
    ctx.closePath();
    ctx.fill();

    // Dikdörtgenleri (Riemann) Çizme
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < n; i++) {
      const xLeft = a + i * dx;
      const xRight = a + (i + 1) * dx;
      const xMid = (xLeft + xRight) / 2;

      let height = 0;
      let evalX = 0;
      if (method === 'left') { height = f(xLeft); evalX = xLeft; }
      if (method === 'right') { height = f(xRight); evalX = xRight; }
      if (method === 'mid') { height = f(xMid); evalX = xMid; }

      const rectX = xLeft * scaleX;
      const rectY = originY - height * scaleY;
      const rectW = dx * scaleX;
      const rectH = height * scaleY;

      ctx.fillRect(rectX, rectY, rectW, rectH);
      ctx.strokeRect(rectX, rectY, rectW, rectH);

      // Metodu belirten noktayı çiz
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(evalX * scaleX, originY - f(evalX) * scaleY, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'; // reset
    }

    // Eksenleri çiz (Sadece sınırları belirtmek için, sol ve alt zaten eksen)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(w, h); ctx.stroke(); // X ekseni
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, h); ctx.stroke(); // Y ekseni
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText('0', 5, h - 5);
    ctx.fillText('2', 2*scaleX - 5, h - 5);
    ctx.fillText('4', 4*scaleX - 5, h - 5);
    ctx.fillText('f(x) = -x² + 4x', 2*scaleX - 40, 30);

  }, [n, method]);

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
            onClick={() => { setN(4); setMethod('left'); }}
            className="btn-interactive"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Sıfırla
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Riemann Toplamı (İntegral)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Bir eğrinin altında kalan alanı (İntegral) bulmak için sonsuz sayıda dikdörtgen kullanmanın temel mantığını kavrayın.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Analiz Panelleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Gerçek Alan (İntegral)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f43f5e' }}>{exactArea.toFixed(4)}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Yaklaşık Alan (Riemann)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{approxArea.toFixed(4)}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hata Payı (Fark)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{Math.abs(exactArea - approxArea).toFixed(4)}</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          {/* Sağ Panel */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Limit Kontrolleri</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dikdörtgen Sayısı (n)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{n} Adet</span>
              </div>
              <input type="range" min="2" max="100" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Δx (Genişlik): {dx.toFixed(3)}</div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Yaklaşım Yöntemi</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => setMethod('left')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: method === 'left' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', background: method === 'left' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Sol Riemann Toplamı
                </button>
                <button 
                  onClick={() => setMethod('mid')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: method === 'mid' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', background: method === 'mid' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Orta Nokta (Midpoint)
                </button>
                <button 
                  onClick={() => setMethod('right')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: method === 'right' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', background: method === 'right' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Sağ Riemann Toplamı
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <AreaChart size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>İntegral İlişkisi</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Dikdörtgen sayısı (n) sonsuza giderken (Δx sıfıra yaklaşırken), Riemann toplamı tam olarak fonksiyonun belirli integraline eşittir:
                  <br/><br/>
                  <b>lim(n→∞) Σ f(x)Δx = ∫ f(x)dx</b>
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
