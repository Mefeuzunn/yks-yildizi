"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Eye } from 'lucide-react';
import Link from 'next/link';

export default function OptikSimulation() {
  const [f, setF] = useState(100); // Focal length (Odak uzaklığı)
  const [doVal, setDoVal] = useState(200); // Object distance (Cisim uzaklığı) - Pozitif değer
  const [ho, setHo] = useState(60); // Object height (Cisim boyu)

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Optik formülü: 1/f = 1/do + 1/di -> di = (do * f) / (do - f)
  let di = 0;
  if (doVal !== f) {
    di = (doVal * f) / (doVal - f);
  } else {
    di = Infinity; // Sonsuz
  }

  // Büyütme: m = -di / do
  const m = doVal !== f ? -di / doVal : Infinity;
  // Görüntü boyu: hi = m * ho
  const hi = m * ho;

  // Görüntü Özellikleri
  let imgDesc = '';
  if (doVal > 2 * f) imgDesc = "Gerçek, Ters, Cismin Boyundan Küçük";
  else if (doVal === 2 * f) imgDesc = "Gerçek, Ters, Cismin Boyuyla Eşit";
  else if (doVal > f && doVal < 2 * f) imgDesc = "Gerçek, Ters, Cismin Boyundan Büyük";
  else if (doVal === f) imgDesc = "Görüntü Sonsuzda Oluşur";
  else if (doVal < f) imgDesc = "Sanal (Zahiri), Düz, Cismin Boyundan Büyük";

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
    const originX = w / 2; // Lens pozisyonu

    const drawArrow = (x: number, y: number, height: number, color: string, label: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - height); // Yukarı yönlü (negatif height aşağı yönlü olur)
      ctx.stroke();

      // Ok ucu
      const headSize = 10;
      const sign = Math.sign(height);
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x - headSize/2, y - height + sign*headSize);
      ctx.lineTo(x + headSize/2, y - height + sign*headSize);
      ctx.fill();

      // Etiket
      ctx.font = '14px sans-serif';
      ctx.fillText(label, x - 15, y - height - (sign*15));
    };

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Asal Eksen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(w, centerY); ctx.stroke();
      ctx.setLineDash([]);

      // Mercek (İnce Kenarlı) - Şematik
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, centerY - 150);
      ctx.lineTo(originX, centerY + 150);
      ctx.stroke();
      // Ok uçları (İnce kenarlı)
      ctx.beginPath(); ctx.moveTo(originX, centerY - 150); ctx.lineTo(originX - 10, centerY - 140); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(originX, centerY - 150); ctx.lineTo(originX + 10, centerY - 140); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(originX, centerY + 150); ctx.lineTo(originX - 10, centerY + 140); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(originX, centerY + 150); ctx.lineTo(originX + 10, centerY + 140); ctx.stroke();

      // Odak ve Merkez Noktaları
      const points = [
        { x: originX - f, label: 'F' },
        { x: originX - 2*f, label: '2F' },
        { x: originX + f, label: 'F\'' },
        { x: originX + 2*f, label: '2F\'' }
      ];

      ctx.fillStyle = '#fff';
      points.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, centerY, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillText(p.label, p.x - 5, centerY + 20);
      });

      // Cisim
      const objX = originX - doVal;
      drawArrow(objX, centerY, ho, '#10b981', 'Cisim');

      // Görüntü
      if (doVal !== f) {
        const imgX = originX + di;
        // Eğer sanal ise (di < 0) kesik çizgi ile çiz
        if (di < 0) ctx.globalAlpha = 0.5;
        drawArrow(imgX, centerY, hi, '#f43f5e', 'Görüntü');
        ctx.globalAlpha = 1.0;
      }

      // Işın Çizimleri
      ctx.lineWidth = 1.5;
      
      // Işın 1: Asal eksene paralel gelir, odaktan (F') geçer
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)'; // Sarı
      ctx.beginPath();
      ctx.moveTo(objX, centerY - ho);
      ctx.lineTo(originX, centerY - ho); // merceğe kadar
      if (doVal !== f) {
         // Kırılan ışın
         ctx.lineTo(originX + f, centerY); // F' den geçer
         // Uzantıyı devam ettir
         const slope1 = (centerY - (centerY - ho)) / ((originX + f) - originX);
         ctx.lineTo(originX + 1000, centerY - ho + slope1 * 1000);

         // Eğer sanal görüntü ise uzantısını geriye doğru çiz (kesik)
         if (di < 0) {
           ctx.setLineDash([5, 5]);
           ctx.beginPath();
           ctx.moveTo(originX, centerY - ho);
           ctx.lineTo(originX - 1000, centerY - ho - slope1 * 1000);
           ctx.stroke();
           ctx.setLineDash([]);
         }
      }
      ctx.stroke();

      // Işın 2: Optik merkeze (O) gelen ışın kırılmadan geçer
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)'; // Mor
      ctx.beginPath();
      ctx.moveTo(objX, centerY - ho);
      ctx.lineTo(originX, centerY); // Optik merkez
      if (doVal !== f) {
        const slope2 = (centerY - (centerY - ho)) / (originX - objX);
        ctx.lineTo(originX + 1000, centerY + slope2 * 1000);

        // Sanal uzantı
        if (di < 0) {
           ctx.setLineDash([5, 5]);
           ctx.beginPath();
           ctx.moveTo(originX, centerY);
           ctx.lineTo(originX - 1000, centerY - slope2 * 1000);
           ctx.stroke();
           ctx.setLineDash([]);
         }
      }
      ctx.stroke();

    };

    render();
  }, [f, doVal, ho]);

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
              onClick={() => { setF(100); setDoVal(200); setHo(60); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>İnce Kenarlı Mercek (Optik)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Cismin uzaklığına göre özel ışınların kırılmasını ve oluşan görüntünün doğasını (Gerçek/Sanal) inceleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Göstergeler */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{doVal} cm</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cisim Uzaklığı (do)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f43f5e' }}>
                  {doVal === f ? '∞' : Math.abs(di).toFixed(1)} cm
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Görüntü Uzaklığı (di)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                  {doVal === f ? '-' : `${m > 0 ? '+' : ''}${m.toFixed(2)}x`}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Büyütme (m)</div>
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

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Optik Kontroller</h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Odak Uzaklığı (F)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{f} cm</span>
              </div>
              <input type="range" min="50" max="200" step="10" value={f} onChange={(e) => setF(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cisim Uzaklığı (do)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{doVal} cm</span>
              </div>
              <input type="range" min="20" max="500" step="10" value={doVal} onChange={(e) => setDoVal(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cisim Boyu (ho)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{ho} cm</span>
              </div>
              <input type="range" min="20" max="150" step="5" value={ho} onChange={(e) => setHo(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Eye size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>Görüntü Analizi</div>
                <div style={{ fontSize: '0.95rem', color: '#fff', lineHeight: 1.5, fontWeight: 'bold' }}>
                  {imgDesc}
                </div>
                {di < 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#fca5a5' }}>
                    *Görüntü odak (F) ile optik merkez arasına girildiğinde büyüteç görevi görerek sanal ve düz oluşur.
                  </div>
                )}
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
