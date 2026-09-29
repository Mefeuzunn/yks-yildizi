"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Info, FlaskConical, Gauge, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface GasOption {
  name: string;
  formula: string;
  molarMass: number; // g/mol
  color: string;
}

const GAS_OPTIONS: GasOption[] = [
  { name: 'Amonyak', formula: 'NH₃', molarMass: 17, color: '#38bdf8' },
  { name: 'Metan', formula: 'CH₄', molarMass: 16, color: '#34d399' },
  { name: 'Helyum', formula: 'He', molarMass: 4, color: '#facc15' },
  { name: 'Hidrojen', formula: 'H₂', molarMass: 2, color: '#c084fc' },
  { name: 'Hidroklorik Asit', formula: 'HCl', molarMass: 36.5, color: '#fb7185' },
  { name: 'Kükürt Dioksit', formula: 'SO₂', molarMass: 64, color: '#f97316' },
  { name: 'Oksijen', formula: 'O₂', molarMass: 32, color: '#60a5fa' },
  { name: 'Karbondioksit', formula: 'CO₂', molarMass: 44, color: '#a3e635' }
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gasType: 'left' | 'right';
  color: string;
}

export default function GrahamDiffusionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gas Selections
  const [leftGasIndex, setLeftGasIndex] = useState<number>(0); // NH3
  const [rightGasIndex, setRightGasIndex] = useState<number>(4); // HCl

  // Temperatures in Kelvin
  const [tempLeft, setTempLeft] = useState<number>(300); // K
  const [tempRight, setTempRight] = useState<number>(300); // K

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [meetingX, setMeetingX] = useState<number | null>(null);

  const leftGas = GAS_OPTIONS[leftGasIndex];
  const rightGas = GAS_OPTIONS[rightGasIndex];

  // Graham Law: v1 / v2 = sqrt( (M2 * T1) / (M1 * T2) )
  const speedRatio = Math.sqrt((rightGas.molarMass * tempLeft) / (leftGas.molarMass * tempRight));
  
  // Meeting position in a 100 cm tube:
  // x1 / x2 = speedRatio, x1 + x2 = 100 => x1 = 100 * speedRatio / (1 + speedRatio)
  const theoreticalX1 = Number((100 * speedRatio / (1 + speedRatio)).toFixed(1));
  const theoreticalX2 = Number((100 - theoreticalX1).toFixed(1));

  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or reset particles
  const resetSimulation = () => {
    setIsRunning(false);
    setProgress(0);
    setMeetingX(null);
    particlesRef.current = [];
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const startSimulation = () => {
    resetSimulation();
    setIsRunning(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const tubeLength = canvas.width - 120;
    const tubeY = canvas.height / 2;
    const tubeHeight = 70;

    // Create 60 particles for left and right
    const newParticles: Particle[] = [];
    for (let i = 0; i < 70; i++) {
      newParticles.push({
        x: 60 + Math.random() * 20,
        y: tubeY - tubeHeight / 2 + 10 + Math.random() * (tubeHeight - 20),
        vx: (1.2 + Math.random() * 0.8) * Math.sqrt(tempLeft / leftGas.molarMass) * 0.22,
        vy: (Math.random() - 0.5) * 1.5,
        gasType: 'left',
        color: leftGas.color
      });
      newParticles.push({
        x: canvas.width - 60 - Math.random() * 20,
        y: tubeY - tubeHeight / 2 + 10 + Math.random() * (tubeHeight - 20),
        vx: -(1.2 + Math.random() * 0.8) * Math.sqrt(tempRight / rightGas.molarMass) * 0.22,
        vy: (Math.random() - 0.5) * 1.5,
        gasType: 'right',
        color: rightGas.color
      });
    }
    particlesRef.current = newParticles;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localMeeting: number | null = null;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tubeStart = 60;
      const tubeEnd = canvas.width - 60;
      const tubeLen = tubeEnd - tubeStart;
      const tubeY = canvas.height / 2;
      const tubeH = 70;

      // Draw Glass Tube Background & Glow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(tubeStart, tubeY - tubeH / 2, tubeLen, tubeH);

      // Glass Tube Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 3;
      ctx.strokeRect(tubeStart, tubeY - tubeH / 2, tubeLen, tubeH);

      // Tube Reflections
      const grad = ctx.createLinearGradient(0, tubeY - tubeH / 2, 0, tubeY + tubeH / 2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.02)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.0)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = grad;
      ctx.fillRect(tubeStart, tubeY - tubeH / 2, tubeLen, tubeH);

      // Draw cm Scale Markings
      ctx.fillStyle = '#64748b';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let cm = 0; cm <= 100; cm += 10) {
        const x = tubeStart + (cm / 100) * tubeLen;
        ctx.strokeStyle = cm % 20 === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
        ctx.lineWidth = cm % 20 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x, tubeY + tubeH / 2);
        ctx.lineTo(x, tubeY + tubeH / 2 + (cm % 20 === 0 ? 12 : 6));
        ctx.stroke();

        if (cm % 20 === 0) {
          ctx.fillText(`${cm} cm`, x, tubeY + tubeH / 2 + 24);
        }
      }

      // Draw End Caps / Cotton Plugs
      ctx.fillStyle = leftGas.color;
      ctx.fillRect(tubeStart - 18, tubeY - tubeH / 2 - 4, 18, tubeH + 8);
      ctx.fillStyle = rightGas.color;
      ctx.fillRect(tubeEnd, tubeY - tubeH / 2 - 4, 18, tubeH + 8);

      // Draw Gas Labels at ends
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = leftGas.color;
      ctx.textAlign = 'right';
      ctx.fillText(`${leftGas.formula} (${tempLeft}K)`, tubeStart - 26, tubeY + 4);

      ctx.fillStyle = rightGas.color;
      ctx.textAlign = 'left';
      ctx.fillText(`${rightGas.formula} (${tempRight}K)`, tubeEnd + 26, tubeY + 4);

      // Update & Draw Particles
      if (isRunning) {
        let minLeftX = tubeStart;
        let maxLeftX = tubeStart;
        let minRightX = tubeEnd;
        let maxRightX = tubeEnd;

        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off top/bottom walls
          if (p.y <= tubeY - tubeH / 2 + 5 || p.y >= tubeY + tubeH / 2 - 5) {
            p.vy *= -1;
          }

          if (p.gasType === 'left') {
            if (p.x > maxLeftX) maxLeftX = p.x;
          } else {
            if (p.x < minRightX) minRightX = p.x;
          }

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Detect collision / meeting front
        if (maxLeftX >= minRightX && !localMeeting) {
          localMeeting = (maxLeftX + minRightX) / 2;
          const cmMeet = Math.round(((localMeeting - tubeStart) / tubeLen) * 100);
          setMeetingX(cmMeet);
          setIsRunning(false);
        }
      }

      // Draw Reaction Precipitate / White Smoke Ring if meeting occurred
      const effectiveMeeting = meetingX !== null ? meetingX : null;
      if (effectiveMeeting !== null) {
        const xPos = tubeStart + (effectiveMeeting / 100) * tubeLen;

        // Smoke glow
        const smokeGrad = ctx.createRadialGradient(xPos, tubeY, 5, xPos, tubeY, 35);
        smokeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        smokeGrad.addColorStop(0.4, 'rgba(240, 240, 255, 0.6)');
        smokeGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = smokeGrad;
        ctx.fillRect(xPos - 30, tubeY - tubeH / 2 + 2, 60, tubeH - 4);

        // Marker line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xPos, tubeY - tubeH / 2 - 15);
        ctx.lineTo(xPos, tubeY + tubeH / 2 + 15);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Karşılaşma: ${effectiveMeeting} cm`, xPos, tubeY - tubeH / 2 - 20);
        if (leftGas.formula === 'NH₃' && rightGas.formula === 'HCl') {
          ctx.font = '10px Inter, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`NH₄Cl (Beyaz Duman)`, xPos, tubeY + tubeH / 2 + 38);
        }
      }

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, leftGas, rightGas, tempLeft, tempRight, meetingX]);

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
                Graham Gaz Difüzyon Yasası
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                AYT KİMYA
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Gazların molekül kütlesi (M) ve sıcaklık (T) parametrelerine göre cam borudaki difüzyon hızı ve karşılaşma noktası.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={startSimulation}
            disabled={isRunning}
            style={{ padding: '8px 14px', borderRadius: '10px', background: isRunning ? 'rgba(255,255,255,0.05)' : 'rgba(56,189,248,0.2)', border: isRunning ? '1px solid rgba(255,255,255,0.1)' : '1px solid #38bdf8', color: '#fff', cursor: isRunning ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
          >
            <Play size={14} color="#38bdf8" />
            {isRunning ? 'Difüzyon Akıyor...' : 'Gazları Sal'}
          </button>
          <button
            onClick={resetSimulation}
            style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
          >
            <RotateCcw size={14} /> Sıfırla
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Canvas View */}
        <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FlaskConical size={16} /> 100 cm Cam Boru Reaksiyon Odası
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Formül: v₁ / v₂ = √(M₂·T₁ / M₁·T₂)
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
            <canvas
              ref={canvasRef}
              width={700}
              height={220}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
            />
          </div>

          {/* Real-time Calculation Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hız Oranı (v₁ / v₂)</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                {speedRatio.toFixed(2)}x
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Sol gaz sağ gazdan hızlı</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Teorik Karşılaşma (Sol)</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                {theoreticalX1} cm
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Sol uçtan uzaklık</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Teorik Karşılaşma (Sağ)</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#facc15' }}>
                {theoreticalX2} cm
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Sağ uçtan uzaklık</div>
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Exam Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Left Gas Controls */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: leftGas.color }}>
                Sol Uç Gazı: {leftGas.formula} ({leftGas.name})
              </span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)' }}>
                M = {leftGas.molarMass} g/mol
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
              {GAS_OPTIONS.map((g, idx) => (
                <button
                  key={g.formula}
                  onClick={() => { setLeftGasIndex(idx); resetSimulation(); }}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: leftGasIndex === idx ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.03)',
                    border: leftGasIndex === idx ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    color: leftGasIndex === idx ? '#fff' : '#94a3b8'
                  }}
                >
                  {g.formula}
                </button>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Sıcaklık (T₁):</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{tempLeft} K ({tempLeft - 273} °C)</span>
              </div>
              <input
                type="range"
                min={100}
                max={600}
                step={25}
                value={tempLeft}
                onChange={(e) => { setTempLeft(Number(e.target.value)); resetSimulation(); }}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>
          </div>

          {/* Right Gas Controls */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: rightGas.color }}>
                Sağ Uç Gazı: {rightGas.formula} ({rightGas.name})
              </span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)' }}>
                M = {rightGas.molarMass} g/mol
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
              {GAS_OPTIONS.map((g, idx) => (
                <button
                  key={g.formula}
                  onClick={() => { setRightGasIndex(idx); resetSimulation(); }}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: rightGasIndex === idx ? 'rgba(251,113,133,0.25)' : 'rgba(255,255,255,0.03)',
                    border: rightGasIndex === idx ? '1px solid #fb7185' : '1px solid rgba(255,255,255,0.08)',
                    color: rightGasIndex === idx ? '#fff' : '#94a3b8'
                  }}
                >
                  {g.formula}
                </button>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Sıcaklık (T₂):</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{tempRight} K ({tempRight - 273} °C)</span>
              </div>
              <input
                type="range"
                min={100}
                max={600}
                step={25}
                value={tempRight}
                onChange={(e) => { setTempRight(Number(e.target.value)); resetSimulation(); }}
                style={{ width: '100%', accentColor: '#fb7185' }}
              />
            </div>
          </div>

          {/* Exam Crucial Notes */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM AYT Kimya Tuzakları
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>Molekül Kütlesi (M):</strong> Gazların difüzyon hızı, mol kütlesinin karekökü ile <em>ters</em> orantılıdır. Hafif olan gaz daima daha hızlı uçar!</li>
              <li><strong>Mutlak Sıcaklık (T):</strong> Sıcaklık Celsius (°C) değil, <strong>Kelvin (K)</strong> cinsinden alınır. Hız, mutlak sıcaklığın karekökü ile doğru orantılıdır.</li>
              <li><strong>Difüzyon Süresi (t):</strong> Hız ile süre ters orantılıdır: (t₁ / t₂ = v₂ / v₁ = √(M₁ / M₂)). Hızlı gaz boruyu daha kısa sürede geçer.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
