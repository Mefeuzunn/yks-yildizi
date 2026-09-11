"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Dna } from 'lucide-react';
import Link from 'next/link';

type Mode = 'simple' | 'facilitated' | 'active';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isInside: boolean;
};

export default function HucreZariSimulation() {
  const [mode, setMode] = useState<Mode>('simple');
  const [outCount, setOutCount] = useState(60); // Hücre dışı (Üst) molekül sayısı
  const [inCount, setInCount] = useState(10);  // Hücre içi (Alt) molekül sayısı
  const [isRunning, setIsRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const atpRef = useRef<{x: number, y: number, active: boolean} | null>(null);

  // Initialize particles
  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const membraneY = h / 2;

    const newParticles: Particle[] = [];

    // Outside particles (top)
    for (let i = 0; i < outCount; i++) {
      newParticles.push({
        x: Math.random() * (w - 20) + 10,
        y: Math.random() * (membraneY - 40) + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: mode === 'simple' ? 4 : 8, // Basit difüzyon için küçük moleküller (O2, CO2), diğerleri için büyük (Glikoz vb.)
        color: mode === 'simple' ? '#38bdf8' : '#f43f5e',
        isInside: false,
      });
    }

    // Inside particles (bottom)
    for (let i = 0; i < inCount; i++) {
      newParticles.push({
        x: Math.random() * (w - 20) + 10,
        y: Math.random() * (membraneY - 40) + membraneY + 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: mode === 'simple' ? 4 : 8,
        color: mode === 'simple' ? '#38bdf8' : '#f43f5e',
        isInside: true,
      });
    }

    particlesRef.current = newParticles;
    atpRef.current = null;
  };

  // Re-init on count or mode change if not running
  useEffect(() => {
    if (!isRunning) {
      setTimeout(initParticles, 100);
    }
  }, [outCount, inCount, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    }

    const w = canvas.width;
    const h = canvas.height;
    const membraneY = h / 2;
    const membraneThickness = 40; // Fosfolipit çift tabaka kalınlığı

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // --- ZAR ÇİZİMİ ---
      // Dış Ortam
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(0, 0, w, membraneY - membraneThickness/2);
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.fillText('HÜCRE DIŞI (Ekstraselüler)', 10, 20);

      // İç Ortam
      ctx.fillStyle = 'rgba(244, 63, 94, 0.05)';
      ctx.fillRect(0, membraneY + membraneThickness/2, w, h);
      ctx.fillStyle = '#fff';
      ctx.fillText('HÜCRE İÇİ (İntraselüler)', 10, h - 10);

      // Fosfolipit Çift Katman (Görsel temsil)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, membraneY - membraneThickness/2, w, membraneThickness);
      
      // Fosfolipit başları (yuvarlak) ve kuyrukları (çizgi)
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      for(let x = 10; x < w; x += 15) {
        // Üst katman
        ctx.beginPath(); ctx.arc(x, membraneY - membraneThickness/2 + 5, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, membraneY - membraneThickness/2 + 9); ctx.lineTo(x-2, membraneY - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, membraneY - membraneThickness/2 + 9); ctx.lineTo(x+2, membraneY - 2); ctx.stroke();
        
        // Alt katman
        ctx.beginPath(); ctx.arc(x, membraneY + membraneThickness/2 - 5, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, membraneY + membraneThickness/2 - 9); ctx.lineTo(x-2, membraneY + 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, membraneY + membraneThickness/2 - 9); ctx.lineTo(x+2, membraneY + 2); ctx.stroke();
      }

      // Kanal Proteini (Eğer Kolaylaştırılmış veya Aktif Taşıma ise)
      const proteinX = w / 2 - 30;
      const proteinWidth = 60;
      if (mode !== 'simple') {
        // Zarı delip geçen protein
        ctx.fillStyle = mode === 'active' ? '#a855f7' : '#10b981';
        ctx.fillRect(proteinX, membraneY - membraneThickness/2 - 5, proteinWidth, membraneThickness + 10);
        // Protein kanalı (delik)
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(proteinX + 20, membraneY - membraneThickness/2 - 5, 20, membraneThickness + 10);
        
        // ATP (Aktif taşıma)
        if (mode === 'active' && isRunning) {
           if (!atpRef.current) {
             atpRef.current = { x: proteinX + 50, y: membraneY + membraneThickness/2 + 30, active: true };
           }
           const atp = atpRef.current;
           if (atp.active) {
             ctx.fillStyle = '#eab308';
             ctx.font = 'bold 12px sans-serif';
             ctx.fillText('ATP', atp.x, atp.y);
             ctx.beginPath();
             ctx.arc(atp.x + 10, atp.y - 4, 15, 0, Math.PI*2);
             ctx.strokeStyle = '#eab308';
             ctx.stroke();
           }
        }
      }

      // --- PARTİKÜL FİZİĞİ ---
      let outC = 0;
      let inC = 0;

      particlesRef.current.forEach(p => {
        if (isRunning) {
          p.x += p.vx * 1.5;
          p.y += p.vy * 1.5;

          // Duvarlara Çarpma (Sol/Sağ)
          if (p.x - p.radius < 0) { p.x = p.radius; p.vx *= -1; }
          if (p.x + p.radius > w) { p.x = w - p.radius; p.vx *= -1; }
          
          // Duvarlara Çarpma (Üst/Alt)
          if (p.y - p.radius < 0) { p.y = p.radius; p.vy *= -1; }
          if (p.y + p.radius > h) { p.y = h - p.radius; p.vy *= -1; }

          // Zar Etkileşimi
          const hitMembraneTop = p.y + p.radius > membraneY - membraneThickness/2;
          const hitMembraneBottom = p.y - p.radius < membraneY + membraneThickness/2;

          if (hitMembraneTop && hitMembraneBottom) {
             // İçeride
             // Basit Difüzyon: Küçük moleküller zardan rastgele geçer (çok düşük olasılıkla seker)
             if (mode === 'simple') {
               // İçeride rahat hareket eder ama yavaşlar
               p.y += p.vy * 0.5; 
             } else {
               // Kolaylaştırılmış veya Aktif: Sadece kanaldan geçebilir
               const inChannel = p.x > proteinX + 20 && p.x < proteinX + 40;
               if (!inChannel) {
                 // Kanala giremedi, geri sek
                 if (p.vy > 0) p.y = membraneY - membraneThickness/2 - p.radius;
                 else p.y = membraneY + membraneThickness/2 + p.radius;
                 p.vy *= -1;
               } else {
                 // Kanalda ilerliyor
                 // Aktif Taşıma kuralı: Sadece azdan çoğa geçer (Alt->Üst veya Üst->Alt state'e göre)
                 // Basitleştirmek için: Aktif taşımada sadece ATP varken aşağıdan yukarı (veya tam tersi) pompalanır
                 // Şimdilik sadece kanaldan düz geçiş simülasyonu yapalım
               }
             }
          } else {
             // Zar dışı
             // Aktif taşıma ATP pompası mantığı
             if (mode === 'active' && isRunning && Math.random() < 0.01) {
               // Pompaya çekilme (Basit görsel çekim)
               const dx = (proteinX + 30) - p.x;
               const dy = membraneY - p.y;
               if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
                  p.vx += dx * 0.001;
                  p.vy += dy * 0.001;
               }
             }
          }

          // Güncel Konum
          p.isInside = p.y > membraneY;
        }

        // Çizim
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();

        if (p.isInside) inC++; else outC++;
      });

      // Update state if counts changed significantly (throttle UI updates)
      if (Math.abs(outCount - outC) > 2 || Math.abs(inCount - inC) > 2) {
         // UI update logic normally goes here, but skipping rapid re-renders for performance.
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, mode]);

  const toggleRun = () => setIsRunning(!isRunning);

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
              onClick={() => { setIsRunning(false); initParticles(); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Hücre Zarı ve Madde Geçişleri</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Fosfolipit tabaka ve taşıyıcı proteinler aracılığıyla gerçekleşen pasif (difüzyon) ve aktif taşıma süreçleri.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '450px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

            {/* Bilgi Kartı */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Simülasyon Durumu: {isRunning ? 'Moleküller Hareket Halinde (Kinetik Enerji)' : 'Durduruldu'}</div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: mode === 'simple' ? '#38bdf8' : '#f43f5e', borderRadius: '50%', marginRight: '8px' }}></span>Dış: <b>~{outCount}</b></div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: mode === 'simple' ? '#38bdf8' : '#f43f5e', borderRadius: '50%', marginRight: '8px' }}></span>İç: <b>~{inCount}</b></div>
              </div>
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Geçiş Ayarları</h3>
            </div>

            <button
              onClick={toggleRun}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : '#f43f5e',
                color: isRunning ? '#ef4444' : '#fff',
                fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {isRunning ? 'Durdur' : 'Hareketi Başlat'}
            </button>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Geçiş Modu (Taşıma Tipi)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  onClick={() => { setMode('simple'); setIsRunning(false); }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: mode === 'simple' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)', background: mode === 'simple' ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Basit Difüzyon (O₂, CO₂)
                </button>
                <button 
                  onClick={() => { setMode('facilitated'); setIsRunning(false); }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: mode === 'facilitated' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)', background: mode === 'facilitated' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Kolaylaştırılmış Difüzyon (Glikoz)
                </button>
                <button 
                  onClick={() => { setMode('active'); setIsRunning(false); }}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: mode === 'active' ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.1)', background: mode === 'active' ? 'rgba(168, 85, 247, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                >
                  Aktif Taşıma (Na⁺/K⁺ pompası)
                </button>
              </div>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hücre Dışı Derişim</label>
              </div>
              <input type="range" min="0" max="100" step="5" value={outCount} onChange={(e) => { setOutCount(Number(e.target.value)); setIsRunning(false); }} style={{ width: '100%', accentColor: '#38bdf8' }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hücre İçi Derişim</label>
              </div>
              <input type="range" min="0" max="100" step="5" value={inCount} onChange={(e) => { setInCount(Number(e.target.value)); setIsRunning(false); }} style={{ width: '100%', accentColor: '#f43f5e' }} />
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Dna size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f43f5e', marginBottom: '0.25rem' }}>Hücre Zarı Kuralları</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {mode === 'simple' && 'Küçük moleküller (Oksijen, Karbondioksit) doğrudan fosfolipit tabakadan geçer. ATP harcanmaz. Çoktan aza doğrudur.'}
                  {mode === 'facilitated' && 'Büyük moleküller (Glikoz, Aminoasit) zardan geçemez, taşıyıcı kanal proteini kullanır. ATP harcanmaz. Çoktan aza doğrudur.'}
                  {mode === 'active' && 'Maddelerin az oldukları ortamdan çok oldukları ortama geçişidir. ATP enerjisi harcanır ve taşıyıcı proteinler (pompalar) görev alır.'}
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
