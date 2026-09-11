"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings } from 'lucide-react';
import Link from 'next/link';

export default function YoungDeneyiSimulation() {
  // Simülasyon Değişkenleri
  const [lambda, setLambda] = useState(550); // Dalga boyu (nm) [400 - 700]
  const [d, setD] = useState(0.5); // Yarıklar arası mesafe (mm) [0.1 - 2.0]
  const [L, setL] = useState(1.0); // Perde uzaklığı (m) [0.5 - 3.0]

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dalga boyunu (nm) RGB rengine çeviren yardımcı fonksiyon
  const waveLengthToRGB = (Wavelength: number) => {
    let R, G, B;
    if (Wavelength >= 380 && Wavelength < 440) {
      R = -(Wavelength - 440) / (440 - 380);
      G = 0.0;
      B = 1.0;
    } else if (Wavelength >= 440 && Wavelength < 490) {
      R = 0.0;
      G = (Wavelength - 440) / (490 - 440);
      B = 1.0;
    } else if (Wavelength >= 490 && Wavelength < 510) {
      R = 0.0;
      G = 1.0;
      B = -(Wavelength - 510) / (510 - 490);
    } else if (Wavelength >= 510 && Wavelength < 580) {
      R = (Wavelength - 510) / (580 - 510);
      G = 1.0;
      B = 0.0;
    } else if (Wavelength >= 580 && Wavelength < 645) {
      R = 1.0;
      G = -(Wavelength - 645) / (645 - 580);
      B = 0.0;
    } else if (Wavelength >= 645 && Wavelength <= 780) {
      R = 1.0;
      G = 0.0;
      B = 0.0;
    } else {
      R = 0.0;
      G = 0.0;
      B = 0.0;
    }

    let factor;
    if (Wavelength >= 380 && Wavelength < 420) {
      factor = 0.3 + 0.7 * (Wavelength - 380) / (420 - 380);
    } else if (Wavelength >= 420 && Wavelength < 701) {
      factor = 1.0;
    } else if (Wavelength >= 701 && Wavelength <= 780) {
      factor = 0.3 + 0.7 * (780 - Wavelength) / (780 - 700);
    } else {
      factor = 0.0;
    }

    const rgb = [
      Math.round(R * factor * 255),
      Math.round(G * factor * 255),
      Math.round(B * factor * 255)
    ];
    return rgb;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutlarını kapsayıcıya göre ayarla
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Arka planı siyah yap
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const rgb = waveLengthToRGB(lambda);

    // Young Deneyi formülü: I = I_0 * cos^2( (pi * d * y) / (lambda * L) )
    // Ölçeklendirme (Görsel olarak ekrana sığması için ölçek çarpanı)
    const scale = 50000; 

    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let y = 0; y < h; y++) {
      // Y merkezden uzaklık
      const yCenter = y - h / 2;
      
      // Işık şiddeti (Intensity) hesaplama
      // delta_x = (L * lambda) / d
      const phase = (Math.PI * d * yCenter * scale) / (lambda * L * 1000);
      const intensity = Math.pow(Math.cos(phase), 2);

      for (let x = 0; x < w; x++) {
        const index = (y * w + x) * 4;
        
        // Işığın merkeze (x ekseni ortasına) doğru parlaklaşması efekti
        const xDist = Math.abs(x - w / 2) / (w / 2);
        const fade = Math.max(0, 1 - xDist * xDist);

        data[index] = rgb[0] * intensity * fade;     // R
        data[index + 1] = rgb[1] * intensity * fade; // G
        data[index + 2] = rgb[2] * intensity * fade; // B
        data[index + 3] = 255;                       // Alpha
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Ortaya merkez çizgisi çek (opsiyonel gösterge)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();

  }, [lambda, d, L]);

  // Saçak genişliği hesaplama: Δx = (L * λ) / d
  const deltaX = ((L * (lambda * 1e-9)) / (d * 1e-3)) * 1000; // mm cinsinden

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
              onClick={() => { setLambda(550); setD(0.5); setL(1.0); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Young Deneyi (Çift Yarık)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Işığın dalga doğasını inceleyin. Dalga boyu, yarık genişliği ve perde uzaklığının girişim saçaklarına etkisini gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı (Canvas) */}
          <div style={{ background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f111a' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>GİRİŞİM DESENİ (PERDE)</div>
              <div style={{ fontSize: '0.875rem', color: '#38bdf8', fontWeight: 600 }}>Saçak Genişliği (Δx) = {deltaX.toFixed(2)} mm</div>
            </div>
            
            <div style={{ width: '100%', height: '500px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              
              {/* Lazer Kaynağı İllüstrasyonu */}
              <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', width: '40px', height: '80px', background: '#1e293b', border: '2px solid #334155', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '20px', height: '10px', background: `rgb(${waveLengthToRGB(lambda).join(',')})`, boxShadow: `0 0 20px rgb(${waveLengthToRGB(lambda).join(',')})` }}></div>
              </div>
            </div>
          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Laboratuvar Kontrolleri</h3>
            </div>

            {/* Slider: Dalga Boyu */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dalga Boyu (λ)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{lambda} nm</span>
              </div>
              <input 
                type="range" 
                min="400" 
                max="700" 
                value={lambda} 
                onChange={(e) => setLambda(Number(e.target.value))}
                style={{ width: '100%', accentColor: `rgb(${waveLengthToRGB(lambda).join(',')})` }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Mor (400nm)</span>
                <span>Kırmızı (700nm)</span>
              </div>
            </div>

            {/* Slider: Yarıklar Arası Mesafe */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Yarıklar Arası Mesafe (d)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{d.toFixed(1)} mm</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1"
                value={d} 
                onChange={(e) => setD(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Dar (0.1mm)</span>
                <span>Geniş (2.0mm)</span>
              </div>
            </div>

            {/* Slider: Perde Uzaklığı */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Perde Uzaklığı (L)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{L.toFixed(1)} m</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="3.0" 
                step="0.1"
                value={L} 
                onChange={(e) => setL(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Info size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>Formül Yorumu</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Saçak genişliği (Δx) formülü gereği: Dalga boyu (λ) veya perde uzaklığı (L) arttıkça saçaklar <b>genişler</b>. Yarıklar arası mesafe (d) arttıkça saçaklar <b>daralır</b>.
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
