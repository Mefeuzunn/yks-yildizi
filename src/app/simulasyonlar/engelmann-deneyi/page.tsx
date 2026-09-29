"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Info, Dna, Sparkles, Sliders } from 'lucide-react';
import Link from 'next/link';

interface Bacteria {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
}

export default function EngelmannExperimentPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [lightIntensity, setLightIntensity] = useState<number>(80); // %
  const [bacteriaCount, setBacteriaCount] = useState<number>(300);
  const [temperature, setTemperature] = useState<number>(25); // Celsius

  const bacteriaRef = useRef<Bacteria[]>([]);

  // Photosynthesis efficiency by wavelength (nm) across the spectrum
  // 400nm (Purple) -> 700nm (Red)
  const getEfficiencyAtX = (x: number, width: number) => {
    const norm = x / width; // 0 to 1
    // Peak 1 around 0.1 - 0.25 (Mor/Mavi ~430nm), Valley around 0.45 - 0.55 (Yeşil ~520nm), Peak 2 around 0.8 - 0.95 (Kırmızı ~660nm)
    const bluePeak = Math.exp(-Math.pow(norm - 0.18, 2) / 0.012);
    const redPeak = Math.exp(-Math.pow(norm - 0.86, 2) / 0.018);
    const greenDip = 0.08;

    let eff = (bluePeak * 0.95) + (redPeak * 0.85) + greenDip;
    // Temperature effect (optimum 25-30C)
    const tempFactor = Math.max(0.2, 1 - Math.pow(temperature - 28, 2) / 400);
    return eff * (lightIntensity / 100) * tempFactor;
  };

  // Initialize Bacteria
  useEffect(() => {
    const arr: Bacteria[] = [];
    for (let i = 0; i < bacteriaCount; i++) {
      arr.push({
        x: Math.random() * 760 + 20,
        y: Math.random() * 80 + 170,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        targetX: Math.random() < 0.55 ? (Math.random() * 160 + 50) : (Math.random() * 160 + 580)
      });
    }
    bacteriaRef.current = arr;
  }, [bacteriaCount]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spectrumWidth = canvas.width - 40;
      const spectrumX = 20;

      // ── 1. PRISM & WHITE LIGHT BEAM (Top) ──
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(30, 20);
      ctx.lineTo(80, 50);
      ctx.lineTo(20, 80);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White Light Beam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 50);
      ctx.lineTo(45, 50);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.fillText('Beyaz Işık', 5, 42);
      ctx.fillText('Prizma', 50, 95);

      // ── 2. SPECTRUM LIGHT GRADIENT (Mor -> Kırmızı) ──
      const specGradient = ctx.createLinearGradient(spectrumX, 0, spectrumX + spectrumWidth, 0);
      specGradient.addColorStop(0.0, '#7c3aed'); // Mor (~400nm)
      specGradient.addColorStop(0.2, '#2563eb'); // Mavi (~450nm)
      specGradient.addColorStop(0.4, '#059669'); // Yeşil (~520nm)
      specGradient.addColorStop(0.65, '#eab308'); // Sarı (~580nm)
      specGradient.addColorStop(0.8, '#f97316'); // Turuncu (~620nm)
      specGradient.addColorStop(1.0, '#dc2626'); // Kırmızı (~700nm)

      // Light Beams spreading down to algae
      ctx.fillStyle = specGradient;
      ctx.globalAlpha = 0.35 * (lightIntensity / 100);
      ctx.beginPath();
      ctx.moveTo(80, 50);
      ctx.lineTo(spectrumX + spectrumWidth, 140);
      ctx.lineTo(spectrumX, 140);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Color Bar strip
      ctx.fillStyle = specGradient;
      ctx.fillRect(spectrumX, 138, spectrumWidth, 14);

      // Wavelength labels
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#c4b5fd';
      ctx.fillText('Mor (400nm)', spectrumX + 10, 132);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('Mavi (450nm)', spectrumX + 140, 132);
      ctx.fillStyle = '#34d399';
      ctx.fillText('Yeşil (520nm)', spectrumX + 320, 132);
      ctx.fillStyle = '#fde047';
      ctx.fillText('Sarı (580nm)', spectrumX + 480, 132);
      ctx.fillStyle = '#fca5a5';
      ctx.fillText('Kırmızı (700nm)', spectrumX + spectrumWidth - 80, 132);

      // ── 3. FILAMENTOUS GREEN ALGA (Spirogyra / İpliksi Yeşil Alg) ──
      const algaeY = 195;
      const algaeHeight = 32;

      ctx.fillStyle = '#166534';
      ctx.fillRect(spectrumX, algaeY, spectrumWidth, algaeHeight);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(spectrumX, algaeY, spectrumWidth, algaeHeight);

      // Spiral chloroplast band inside alga
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = spectrumX; x <= spectrumX + spectrumWidth; x += 4) {
        const y = algaeY + algaeHeight / 2 + Math.sin(x * 0.08) * 9;
        if (x === spectrumX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('İpliksi Yeşil Alg (Spirogyra) — Fotosentez Bölgesi', spectrumX + 10, algaeY + 20);

      // ── 4. AEROBIC BACTERIA (Oksijen Seven Bakteriler) ──
      const bacteria = bacteriaRef.current;
      for (let b of bacteria) {
        if (isRunning) {
          // Chemotaxis towards O2 (attracted to high efficiency regions)
          const eff = getEfficiencyAtX(b.x, canvas.width);
          const pullSpeed = eff * 0.9;

          // Pull towards closest peak (Mor/Mavi: ~150px, Kırmızı: ~660px)
          const target = b.x < 400 ? 150 : 660;
          b.vx += (target - b.x) * 0.001 * pullSpeed;
          b.vy += (algaeY + algaeHeight / 2 - b.y) * 0.0015;

          // Random Brownian motion
          b.vx += (Math.random() - 0.5) * 0.5;
          b.vy += (Math.random() - 0.5) * 0.5;

          // Clamp velocity
          b.vx = Math.max(-1.8, Math.min(1.8, b.vx));
          b.vy = Math.max(-1.2, Math.min(1.2, b.vy));

          b.x += b.vx;
          b.y += b.vy;

          // Bounds clamp around algae
          if (b.x < spectrumX) b.x = spectrumX;
          if (b.x > spectrumX + spectrumWidth) b.x = spectrumX + spectrumWidth;
          if (b.y < algaeY - 35) b.y = algaeY - 35;
          if (b.y > algaeY + algaeHeight + 35) b.y = algaeY + algaeHeight + 35;
        }

        // Draw individual bacterium (cyan/gold dot)
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      // ── 5. PHOTOSYNTHESIS RATE CURVE (Alt Grafik) ──
      const graphY = 320;
      const graphH = 65;

      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(spectrumX, graphY - graphH, spectrumWidth, graphH);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(spectrumX, graphY - graphH, spectrumWidth, graphH);

      // Curve
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2.5;

      for (let x = 0; x <= spectrumWidth; x += 3) {
        const eff = getEfficiencyAtX(x, spectrumWidth);
        const y = graphY - (eff * (graphH - 10));
        if (x === 0) ctx.moveTo(spectrumX + x, y);
        else ctx.lineTo(spectrumX + x, y);
      }
      ctx.stroke();

      // Legend on Graph
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Fotosentez Hızı & O₂ Üretim Eğrisi', spectrumX + 10, graphY - graphH + 16);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Mor-Mavi ve Kırmızıda Zirve • Yeşilde Minimum', spectrumX + 220, graphY - graphH + 16);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, lightIntensity, bacteriaCount, temperature]);

  const handleReset = () => {
    setLightIntensity(80);
    setTemperature(25);
    setIsRunning(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f8fafc', padding: 'clamp(16px, 3vw, 24px)', paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))' }}>
      
      {/* Top Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/simulasyonlar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, margin: 0 }}>
                Engelmann Deneyi & Kloroplast Işık Spektrumu
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                AYT BİYOLOJİ
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Işığın dalga boyu, klorofilin ışığı soğurması ve aerobik bakteri kümelenmesi
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsRunning(!isRunning)}
            style={{ padding: '8px 14px', borderRadius: '10px', background: isRunning ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', border: isRunning ? '1px solid #f59e0b' : '1px solid #10b981', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
          >
            {isRunning ? <Pause size={14} color="#f59e0b" /> : <Play size={14} color="#10b981" />}
            {isRunning ? 'Durdur' : 'Canlandır'}
          </button>
          <button
            onClick={handleReset}
            style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
          >
            <RotateCcw size={14} /> Sıfırla
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Canvas Display */}
        <div style={{ gridColumn: 'span 2', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
          
          {/* Realtime Stat Cards */}
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Mor-Mavi Bölge (400-450nm)</span>
              <strong style={{ fontSize: '15px', color: '#60a5fa' }}>Maksimum Fotosentez</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Yeşil Bölge (500-550nm)</span>
              <strong style={{ fontSize: '15px', color: '#f87171' }}>Minimum (Yansıtılır)</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Kırmızı Bölge (650-700nm)</span>
              <strong style={{ fontSize: '15px', color: '#f87171' }}>Yüksek Fotosentez</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Bakteri Davranışı</span>
              <strong style={{ fontSize: '15px', color: '#38bdf8' }}>O₂ Kemotaksisi</strong>
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef} width={800} height={390} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Controls and Exam Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9' }}>
              <Sliders size={18} color="#22c55e" /> Deney Ortamı
            </h3>

            {/* Light Intensity */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Işık Şiddeti</span>
                <strong style={{ color: '#facc15' }}>%{lightIntensity}</strong>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                step={5}
                value={lightIntensity}
                onChange={e => setLightIntensity(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#facc15' }}
              />
            </div>

            {/* Temperature */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Ortam Sıcaklığı</span>
                <strong style={{ color: '#f97316' }}>{temperature} °C</strong>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={1}
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }}
              />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Optimum sıcaklık: 25-30°C. 45°C üstünde enzimler denatüre olur.</span>
            </div>

            {/* Bacteria Count */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Aerobik Bakteri Popülasyonu</span>
                <strong style={{ color: '#38bdf8' }}>{bacteriaCount} adet</strong>
              </div>
              <input
                type="range"
                min={100}
                max={500}
                step={50}
                value={bacteriaCount}
                onChange={e => setBacteriaCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>
          </div>

          {/* Exam Crucial Notes */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM AYT Biyoloji Kuralı
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>Deneyin Amacı:</strong> Klorofilin hangi dalga boyundaki ışığı en çok soğurduğunu (absorbe ettiğini) ve fotosentez hızını kanıtlamaktır.</li>
              <li><strong>Bakterilerin Rolü:</strong> Bakteriler fotosentez <strong>yapmaz</strong>! Aerobik (oksijenli solunum yapan) oldukları için algin $O_2$ ürettiği mor ve kırmızı ışık bölgelerine doğru toplanırlar.</li>
              <li><strong>Yeşil Işık Yanılgısı:</strong> Klorofil yeşil ışığı soğurmaz, <strong>yansıtır</strong>. Bu yüzden yeşil ışıkta fotosentez en azdır.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
