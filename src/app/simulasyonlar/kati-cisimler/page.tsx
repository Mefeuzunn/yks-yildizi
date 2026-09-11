"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Box } from 'lucide-react';
import Link from 'next/link';

type ShapeType = 'cylinder' | 'cone' | 'sphere';

export default function KatiCisimlerSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [shape, setShape] = useState<ShapeType>('cylinder');
  const [radius, setRadius] = useState(5); // cm
  const [height, setHeight] = useState(10); // cm
  const [rotation, setRotation] = useState(0); // Görsel döndürme (Y ekseni etrafında)

  // Otomatik döndürme
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setRotation(prev => (prev + 0.01) % (Math.PI * 2));
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;
    
    // Temizle
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // Ölçek: cm başına piksel
    const scale = 15;
    const rPx = radius * scale;
    const hPx = height * scale;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    // 3D çizim için pseudo-isometric (izometrik) yaklaşım
    // Oval (Elips) çizimi fonksiyonu
    const drawEllipse = (x: number, y: number, rw: number, rh: number, fill?: string) => {
      ctx.beginPath();
      ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      ctx.stroke();
    };

    const drawDashedEllipse = (x: number, y: number, rw: number, rh: number) => {
      // Arka kısmı kesik, ön kısmı düz
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.ellipse(x, y, rw, rh, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI);
      ctx.stroke();
    };

    const perspectiveY = 0.3; // Elipsin basıklık oranı

    if (shape === 'cylinder') {
      const topY = cy - hPx / 2;
      const bottomY = cy + hPx / 2;
      const rx = rPx;
      const ry = rPx * perspectiveY;

      // Gövde dolgusu
      ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx - rx, topY);
      ctx.lineTo(cx - rx, bottomY);
      ctx.ellipse(cx, bottomY, rx, ry, 0, Math.PI, 0, true);
      ctx.lineTo(cx + rx, topY);
      ctx.ellipse(cx, topY, rx, ry, 0, 0, Math.PI, true);
      ctx.fill();

      // Alt taban
      drawDashedEllipse(cx, bottomY, rx, ry);
      
      // Üst taban
      drawEllipse(cx, topY, rx, ry, 'rgba(56, 189, 248, 0.2)');

      // Yan kenarlar
      ctx.beginPath();
      ctx.moveTo(cx - rx, topY); ctx.lineTo(cx - rx, bottomY);
      ctx.moveTo(cx + rx, topY); ctx.lineTo(cx + rx, bottomY);
      ctx.stroke();

      // r ve h etiketleri
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.beginPath();
      ctx.strokeStyle = '#f43f5e';
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx + rx, topY);
      ctx.stroke();
      ctx.fillText('r', cx + rx/2, topY - 10);

      ctx.beginPath();
      ctx.moveTo(cx + rx + 20, topY);
      ctx.lineTo(cx + rx + 20, bottomY);
      ctx.stroke();
      ctx.fillText('h', cx + rx + 30, cy);

    } else if (shape === 'cone') {
      const topY = cy - hPx / 2;
      const bottomY = cy + hPx / 2;
      const rx = rPx;
      const ry = rPx * perspectiveY;

      // Gövde dolgusu
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx, topY); // Tepe noktası
      ctx.lineTo(cx - rx, bottomY);
      ctx.ellipse(cx, bottomY, rx, ry, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();

      // Taban
      ctx.strokeStyle = '#10b981';
      drawDashedEllipse(cx, bottomY, rx, ry);

      // Yan yüzeyler (Ana doğrular)
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.strokeStyle = '#10b981';
      ctx.moveTo(cx, topY); ctx.lineTo(cx - rx, bottomY);
      ctx.moveTo(cx, topY); ctx.lineTo(cx + rx, bottomY);
      ctx.stroke();

      // r ve h etiketleri
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.strokeStyle = '#f43f5e';
      ctx.moveTo(cx, bottomY);
      ctx.lineTo(cx + rx, bottomY);
      ctx.stroke();
      ctx.fillText('r', cx + rx/2, bottomY + 20);

      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, bottomY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillText('h', cx - 20, cy);

    } else if (shape === 'sphere') {
      const rx = rPx;

      // Küre 3D illüzyonu (Radial Gradient)
      const gradient = ctx.createRadialGradient(cx - rx*0.3, cy - rx*0.3, rx*0.1, cx, cy, rx);
      gradient.addColorStop(0, '#fcd34d');
      gradient.addColorStop(1, '#b45309');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, rx, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#f59e0b';
      ctx.stroke();

      // Ekvator çizgisi (Dashed ellipse to show 3D volume)
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.ellipse(cx, cy, rx, rx * perspectiveY, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.ellipse(cx, cy, rx, rx * perspectiveY, 0, 0, Math.PI);
      ctx.stroke();

      // r etiketi
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.strokeStyle = '#f43f5e';
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + rx, cy);
      ctx.stroke();
      ctx.fillText('r', cx + rx/2, cy - 10);
    }

  }, [shape, radius, height, rotation]);

  // Hesaplamalar
  let volume = 0;
  let area = 0;
  const PI = Math.PI;

  if (shape === 'cylinder') {
    volume = PI * Math.pow(radius, 2) * height;
    area = 2 * PI * radius * (radius + height);
  } else if (shape === 'cone') {
    volume = (1/3) * PI * Math.pow(radius, 2) * height;
    const l = Math.sqrt(radius*radius + height*height); // Ana doğru
    area = PI * radius * (radius + l);
  } else if (shape === 'sphere') {
    volume = (4/3) * PI * Math.pow(radius, 3);
    area = 4 * PI * Math.pow(radius, 2);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Katı Cisimler (Geometri)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Silindir, Koni ve Küre'nin hacim ve yüzey alanı formüllerini görsel olarak kavrayın.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Analiz Panelleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hacim (V)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8' }}>{volume.toFixed(2)} cm³</div>
                <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '0.25rem' }}>
                  {shape === 'cylinder' && 'V = π·r²·h'}
                  {shape === 'cone' && 'V = ⅓·π·r²·h'}
                  {shape === 'sphere' && 'V = 4/3·π·r³'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Yüzey Alanı (A)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{area.toFixed(2)} cm²</div>
                <div style={{ fontSize: '0.8rem', color: '#f43f5e', marginTop: '0.25rem' }}>
                  {shape === 'cylinder' && 'A = 2πr² + 2πrh'}
                  {shape === 'cone' && 'A = πr² + πrl (l: Ana doğru)'}
                  {shape === 'sphere' && 'A = 4πr²'}
                </div>
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
              <Settings size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Cisim Ayarları</h3>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Geometrik Şekil</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShape('cylinder')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: shape === 'cylinder' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', background: shape === 'cylinder' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Silindir
                </button>
                <button 
                  onClick={() => setShape('cone')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: shape === 'cone' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', background: shape === 'cone' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Dik Koni
                </button>
                <button 
                  onClick={() => setShape('sphere')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: shape === 'sphere' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', background: shape === 'sphere' ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Küre
                </button>
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Yarıçap (r)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{radius} cm</span>
              </div>
              <input 
                type="range" min="1" max="15" step="0.5" 
                value={radius} 
                onChange={(e) => setRadius(Number(e.target.value))} 
                style={{ width: '100%', accentColor: '#f43f5e' }} 
              />
            </div>

            {shape !== 'sphere' && (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Yükseklik (h)</label>
                  <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{height} cm</span>
                </div>
                <input 
                  type="range" min="2" max="25" step="1" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: '#f43f5e' }} 
                />
              </div>
            )}

            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Box size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f43f5e', marginBottom: '0.25rem' }}>3D Hacim Mantığı</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Aynı yarıçap ve yüksekliğe sahip bir Silindirin hacmi, bir Koninin hacminin tam <b>3 katıdır</b>. Bu ilişkiyi r ve h değerlerini eşitleyerek test edebilirsiniz.
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
