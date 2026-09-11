"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, Battery, Zap } from 'lucide-react';
import Link from 'next/link';

// Sabitler
const HC = 1240; // Planck constant * speed of light in eV*nm

// Metal türleri ve Eşik Enerjileri (eV)
const METALS = [
  { name: 'Sodyum (Na)', workFunction: 2.28, color: '#fca5a5' },
  { name: 'Potasyum (K)', workFunction: 2.30, color: '#f87171' },
  { name: 'Çinko (Zn)', workFunction: 4.31, color: '#94a3b8' },
  { name: 'Bakır (Cu)', workFunction: 4.70, color: '#f59e0b' },
  { name: 'Platin (Pt)', workFunction: 6.35, color: '#e2e8f0' },
];

export default function FotoelektrikSimulation() {
  const [lambda, setLambda] = useState(400); // 100nm (UV) - 800nm (IR)
  const [intensity, setIntensity] = useState(50); // 0 - 100%
  const [metalIndex, setMetalIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const metal = METALS[metalIndex];
  const ePhoton = HC / lambda; // eV
  const eKinetic = ePhoton - metal.workFunction;
  const isEmitting = eKinetic >= 0;

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
      // Görünmez bölge (UV veya IR) -> Gri veya Beyaza yakın
      R = 0.5; G = 0.5; B = 0.5; 
      if (Wavelength < 380) { R=0.7; G=0.3; B=1.0; } // UV -> morumsu beyaz
      if (Wavelength > 780) { R=0.8; G=0.2; B=0.2; } // IR -> soluk kırmızı
    }

    let factor = 1.0;
    if (Wavelength < 380 || Wavelength > 780) factor = 0.3; // Görünmez bölgede soluk

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

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Koordinatlar
    const cathodeX = w * 0.2;
    const anodeX = w * 0.8;
    const plateWidth = 20;
    const plateHeight = 250;
    const plateY = (h - plateHeight) / 2;

    const particles: {x: number, y: number, type: 'photon' | 'electron', speed: number, wavePhase?: number}[] = [];
    let frameId: number;
    let tick = 0;

    const rgb = waveLengthToRGB(lambda);
    const lightColor = `rgb(${rgb.join(',')})`;

    const render = () => {
      tick++;

      // Arka plan
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Devre Çizgileri
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cathodeX + plateWidth/2, plateY + plateHeight);
      ctx.lineTo(cathodeX + plateWidth/2, h - 30);
      ctx.lineTo(anodeX + plateWidth/2, h - 30);
      ctx.lineTo(anodeX + plateWidth/2, plateY + plateHeight);
      ctx.stroke();

      // Ampermetre
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(w/2, h - 30, 25, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', w/2, h - 25);
      
      // Ampermetre İbresi
      ctx.save();
      ctx.translate(w/2, h - 30);
      const currentAngle = isEmitting ? (intensity / 100) * (Math.PI / 2) : 0; // 0 to 90 deg
      ctx.rotate(currentAngle);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -15);
      ctx.stroke();
      ctx.restore();

      // Katot (Sol Levha)
      ctx.fillStyle = metal.color;
      ctx.fillRect(cathodeX, plateY, plateWidth, plateHeight);
      // Işık huzmesi görseli (Katota düşen)
      if (intensity > 0) {
        ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${intensity / 300})`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(cathodeX, plateY);
        ctx.lineTo(cathodeX, plateY + plateHeight);
        ctx.lineTo(0, plateHeight);
        ctx.fill();
      }

      // Anot (Sağ Levha)
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(anodeX, plateY, plateWidth, plateHeight);

      // Foton Spawn
      if (intensity > 0 && tick % Math.max(1, Math.floor(10 - intensity/10)) === 0) {
        particles.push({
          x: 0,
          y: (Math.random() * plateHeight * 0.8) + (Math.random() * 50),
          type: 'photon',
          speed: 6,
          wavePhase: Math.random() * Math.PI * 2
        });
      }

      // Güncelle ve Çiz
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (p.type === 'photon') {
          p.x += p.speed;
          // Hafif dalga hareketi
          const yOffset = Math.sin((p.x / 20) + p.wavePhase!) * 10;
          
          ctx.fillStyle = lightColor;
          ctx.beginPath();
          ctx.arc(p.x, p.y + yOffset, 3, 0, Math.PI*2);
          ctx.fill();

          // Katota çarptı mı?
          if (p.x >= cathodeX) {
            particles.splice(i, 1);
            
            // Elektron kopar mı?
            if (isEmitting && Math.random() < 0.5) { // 50% chance of emission per photon for visual balance
              particles.push({
                x: cathodeX + plateWidth,
                y: p.y,
                type: 'electron',
                speed: 1 + (eKinetic * 2) // kinetik enerjiye bağlı hız
              });
            }
          }
        } else if (p.type === 'electron') {
          p.x += p.speed;
          
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Elektron izi
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.fillRect(p.x - 10, p.y - 1, 10, 2);

          // Anota çarptı mı?
          if (p.x >= anodeX) {
            particles.splice(i, 1);
          }
        }
      }

      // Etiketler
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Katot (Metal)', cathodeX + 10, plateY - 15);
      ctx.fillText('Anot', anodeX + 10, plateY - 15);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [lambda, intensity, metal, isEmitting, eKinetic]);

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
              onClick={() => { setLambda(400); setIntensity(50); setMetalIndex(0); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Fotoelektrik Olay</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Işık taneciklerinin (fotonların) metal yüzeyden elektron koparma anını inceleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Durum Göstergeleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#eab308' }}>{ePhoton.toFixed(2)} eV</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Foton Enerjisi</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>{metal.workFunction.toFixed(2)} eV</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Eşik Enerjisi (E₀)</div>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isEmitting ? '#38bdf8' : '#64748b' }}>
                  {isEmitting ? eKinetic.toFixed(2) : '0.00'} eV
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max Kinetik Enerji</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              {!isEmitting && intensity > 0 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', border: '1px solid #ef4444', fontWeight: 'bold' }}>
                  Foton enerjisi eşik enerjisinden düşük! Elektron kopamaz.
                </div>
              )}
            </div>

          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#eab308" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Laboratuvar Kontrolleri</h3>
            </div>

            {/* Metal Seçimi */}
            <div style={{ marginBottom: '2rem' }}>
               <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Katot Metali Seçimi</label>
               <select 
                  value={metalIndex} 
                  onChange={(e) => setMetalIndex(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                >
                  {METALS.map((m, idx) => (
                    <option key={idx} value={idx} style={{ background: '#1e293b' }}>{m.name} - {m.workFunction} eV</option>
                  ))}
               </select>
            </div>

            {/* Slider: Dalga Boyu */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Işık Dalga Boyu (λ)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{lambda} nm</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="800" 
                value={lambda} 
                onChange={(e) => setLambda(Number(e.target.value))}
                style={{ width: '100%', accentColor: `rgb(${waveLengthToRGB(lambda).join(',')})` }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Mor Ötesi (UV)</span>
                <span>Kızılötesi (IR)</span>
              </div>
            </div>

            {/* Slider: Işık Şiddeti */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Işık Şiddeti (Parlaklık)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>%{intensity}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={intensity} 
                onChange={(e) => setIntensity(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#eab308' }}
              />
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Zap size={24} color="#eab308" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#eab308', marginBottom: '0.25rem' }}>Einstein'ın Denklemi</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  E(foton) = E(eşik) + E(kinetik). Gelen ışığın enerjisi eşik enerjisinden küçükse (kırmızı/uzun dalga boyu), ışık şiddeti ne kadar artarsa artsın elektron <b>kopamaz.</b>
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
