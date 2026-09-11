"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, BatteryCharging } from 'lucide-react';
import Link from 'next/link';

export default function PillerSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [timePassed, setTimePassed] = useState(0); // in ticks
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Zn -> Zn2+ + 2e- (Oxidation / Anode) -> E0 = 0.76 V
  // Cu2+ + 2e- -> Cu (Reduction / Cathode) -> E0 = 0.34 V
  // Total E0 = 1.10 V
  const maxTime = 1000; // When battery dies

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

    // Dimensions
    const beakerW = 150;
    const beakerH = 200;
    const leftBeakerX = w * 0.25 - beakerW/2;
    const rightBeakerX = w * 0.75 - beakerW/2;
    const beakerY = h - beakerH - 50;

    const electrodeW = 40;
    const electrodeH = 150;
    
    const particles: {x: number, y: number, type: string, vx: number, vy: number, life: number}[] = [];
    let frameId: number;

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // --- Çizimler ---
      
      // Çözeltiler (Sıvı)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)'; // ZnSO4 solution (renksiz/hafif gri)
      ctx.fillRect(leftBeakerX, beakerY + 50, beakerW, beakerH - 50);
      
      const cuIntensity = Math.max(0, 1 - (timePassed / maxTime)); // Cu2+ mavi rengi zamanla solar
      ctx.fillStyle = `rgba(56, 189, 248, ${0.4 * cuIntensity})`; // CuSO4 solution (mavi)
      ctx.fillRect(rightBeakerX, beakerY + 50, beakerW, beakerH - 50);

      // Beherler (Cam)
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 4;
      // Sol Beher
      ctx.beginPath();
      ctx.moveTo(leftBeakerX, beakerY);
      ctx.lineTo(leftBeakerX, beakerY + beakerH);
      ctx.lineTo(leftBeakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(leftBeakerX + beakerW, beakerY);
      ctx.stroke();
      // Sağ Beher
      ctx.beginPath();
      ctx.moveTo(rightBeakerX, beakerY);
      ctx.lineTo(rightBeakerX, beakerY + beakerH);
      ctx.lineTo(rightBeakerX + beakerW, beakerY + beakerH);
      ctx.lineTo(rightBeakerX + beakerW, beakerY);
      ctx.stroke();

      // Tuz Köprüsü
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 20;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(leftBeakerX + beakerW - 30, beakerY + 80); // sol içine
      ctx.lineTo(leftBeakerX + beakerW - 30, beakerY - 30); // yukarı çık
      ctx.lineTo(rightBeakerX + 30, beakerY - 30); // sağa git
      ctx.lineTo(rightBeakerX + 30, beakerY + 80); // sağ içine
      ctx.stroke();
      // Tuz köprüsü içi
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 16;
      ctx.stroke();

      // Elektrotlar
      // Anot (Zn) - Zamanla aşınır
      const znDecay = (timePassed / maxTime) * 15; // daralma
      const znX = leftBeakerX + beakerW/2 - electrodeW/2 + znDecay;
      const znW = Math.max(5, electrodeW - znDecay*2);
      ctx.fillStyle = '#94a3b8'; // Çinko grisi
      ctx.fillRect(znX, beakerY - 50, znW, electrodeH);

      // Katot (Cu) - Zamanla kalınlaşır
      const cuGrow = (timePassed / maxTime) * 15; // kalınlaşma
      const cuX = rightBeakerX + beakerW/2 - electrodeW/2 - cuGrow;
      const cuW = electrodeW + cuGrow*2;
      ctx.fillStyle = '#b45309'; // Bakır rengi
      ctx.fillRect(cuX, beakerY - 50, cuW, electrodeH);

      // İletken Tel
      ctx.strokeStyle = '#fbbf24'; // Bakır tel
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftBeakerX + beakerW/2, beakerY - 50);
      ctx.lineTo(leftBeakerX + beakerW/2, beakerY - 120);
      ctx.lineTo(rightBeakerX + beakerW/2, beakerY - 120);
      ctx.lineTo(rightBeakerX + beakerW/2, beakerY - 50);
      ctx.stroke();

      // Voltmetre
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w/2 - 40, beakerY - 145, 80, 50);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(w/2 - 40, beakerY - 145, 80, 50);
      ctx.fillStyle = isRunning ? '#10b981' : '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      
      // Pil bitince voltaj 0 olur
      let voltage = 1.10;
      if (timePassed >= maxTime) voltage = 0.00;
      else if (isRunning) voltage = 1.10 - (timePassed / maxTime) * 0.2; // slight drop over time
      else voltage = 0.00; // Devre açık
      
      ctx.fillText(`${voltage.toFixed(2)} V`, w/2, beakerY - 115);

      // --- Dinamik Animasyonlar ---
      if (isRunning && timePassed < maxTime) {
        // Elektron Spawn (Telde soldan sağa)
        if (Math.random() < 0.3) {
          particles.push({
            x: leftBeakerX + beakerW/2,
            y: beakerY - 50,
            type: 'e',
            vx: 0, vy: -5,
            life: 1
          });
        }

        // Zn2+ Spawn (Anot'tan çözeltiye)
        if (Math.random() < 0.1) {
          particles.push({
            x: leftBeakerX + beakerW/2 + (Math.random()*20 - 10),
            y: beakerY + 100,
            type: 'zn2',
            vx: (Math.random() - 0.5) * 2, vy: Math.random() * 2,
            life: 1
          });
        }

        // Cu2+ Spawn (Çözeltiden Katota)
        if (Math.random() < 0.1) {
           particles.push({
            x: rightBeakerX + beakerW/2 + (Math.random()*60 - 30),
            y: beakerY + beakerH - 20,
            type: 'cu2',
            vx: (Math.random() - 0.5) * 2, vy: -2,
            life: 1
          });
        }

        // Tuz Köprüsü İyonları
        if (Math.random() < 0.1) {
          // NO3- sola gider
          particles.push({
            x: w/2, y: beakerY - 30, type: 'no3', vx: -2, vy: 0, life: 1
          });
        }
        if (Math.random() < 0.1) {
          // K+ sağa gider
          particles.push({
            x: w/2, y: beakerY - 30, type: 'k', vx: 2, vy: 0, life: 1
          });
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        if (p.type === 'e') {
          // Elektron rotası: yukarı -> sağa -> aşağı
          if (p.y <= beakerY - 120 && p.x < rightBeakerX + beakerW/2) {
             p.vy = 0; p.vx = 5;
          } else if (p.x >= rightBeakerX + beakerW/2 && p.y <= beakerY - 120) {
             p.vx = 0; p.vy = 5;
          }
          
          if (p.y > beakerY - 50 && p.x > w/2) p.life = 0; // Katota ulaştı

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = '8px sans-serif'; ctx.fillText('e-', p.x, p.y+3);

        } else if (p.type === 'zn2') {
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#000'; ctx.font = '9px sans-serif'; ctx.fillText('Zn²⁺', p.x, p.y+3);
          p.life -= 0.005; // Fade in solution
          ctx.globalAlpha = p.life;
        } else if (p.type === 'cu2') {
           ctx.fillStyle = '#0ea5e9';
           ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.fillText('Cu²⁺', p.x, p.y+3);
           if (p.y < beakerY + 100) p.life = 0; // Katota yapıştı
        } else if (p.type === 'no3') {
           if (p.x < leftBeakerX + beakerW - 30) { p.vx = 0; p.vy = 2; }
           if (p.y > beakerY + 80) p.life = 0;
           ctx.fillStyle = '#fca5a5';
           ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#000'; ctx.font = '8px sans-serif'; ctx.fillText('NO₃⁻', p.x, p.y+3);
        } else if (p.type === 'k') {
           if (p.x > rightBeakerX + 30) { p.vx = 0; p.vy = 2; }
           if (p.y > beakerY + 80) p.life = 0;
           ctx.fillStyle = '#c084fc';
           ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
           ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.fillText('K⁺', p.x, p.y+3);
        }

        ctx.globalAlpha = 1.0;

        p.x += p.vx;
        p.y += p.vy;

        if (p.life <= 0) particles.splice(i, 1);
      }

      // Etiketler
      ctx.fillStyle = '#fff'; ctx.font = '16px sans-serif';
      ctx.fillText("ANOT (Yükseltgenme)", leftBeakerX + beakerW/2, beakerY + beakerH + 30);
      ctx.fillText("Zn(k) ⟶ Zn²⁺(suda) + 2e⁻", leftBeakerX + beakerW/2, beakerY + beakerH + 50);
      
      ctx.fillText("KATOT (İndirgenme)", rightBeakerX + beakerW/2, beakerY + beakerH + 30);
      ctx.fillText("Cu²⁺(suda) + 2e⁻ ⟶ Cu(k)", rightBeakerX + beakerW/2, beakerY + beakerH + 50);

      ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif';
      ctx.fillText("Tuz Köprüsü", w/2, beakerY - 40);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isRunning, timePassed]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timePassed < maxTime) {
      interval = setInterval(() => {
        setTimePassed(prev => prev + 1);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, timePassed]);

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
              onClick={() => { setIsRunning(false); setTimePassed(0); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Pili Yenile
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Elektrokimyasal Piller (Daniell Pili)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Anot ve katot hücrelerindeki aşınma ve birikme tepkimeleri ile elektronların dış devredeki akışını izleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı */}
          <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', height: '500px', position: 'relative' }}>
             <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Devre Anahtarı</h3>
            </div>

            {/* Başla / Durdur Butonu */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={timePassed >= maxTime}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: timePassed >= maxTime ? '#475569' : isRunning ? 'rgba(239, 68, 68, 0.2)' : '#10b981',
                color: timePassed >= maxTime ? '#94a3b8' : isRunning ? '#ef4444' : '#fff',
                fontSize: '1.1rem', fontWeight: 600, cursor: timePassed >= maxTime ? 'not-allowed' : 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {timePassed >= maxTime ? 'Pil Bitti' : isRunning ? 'Devreyi Kapat (Dur)' : 'Devreyi Aç (Çalıştır)'}
            </button>

            {/* Pil Ömrü Göstergesi */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pil Ömrü</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981' }}>{Math.max(0, 100 - (timePassed/maxTime)*100).toFixed(0)}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(0, 100 - (timePassed/maxTime)*100)}%`, height: '100%', background: '#10b981', transition: 'width 0.1s linear' }}></div>
              </div>
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <BatteryCharging size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Elektrokimya Kuralları</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                    <li style={{ marginBottom: '0.25rem' }}>Anot elektron verir ve kütlesi azalır (Aşınma).</li>
                    <li style={{ marginBottom: '0.25rem' }}>Elektronlar dış devreden (tel üzerinden) katota akar.</li>
                    <li style={{ marginBottom: '0.25rem' }}>Katotta çözeltideki iyonlar elektron alıp toplanır (Birikme).</li>
                    <li>Tuz köprüsündeki eksi iyonlar (anyon) anota, artı iyonlar (katyon) katota giderek yük denkliğini sağlar.</li>
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
