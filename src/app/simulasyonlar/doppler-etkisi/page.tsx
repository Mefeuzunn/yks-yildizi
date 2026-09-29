"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Info, Compass, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DopplerSimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation Parameters
  const [sourceSpeed, setSourceSpeed] = useState<number>(120); // m/s
  const [soundSpeed, setSoundSpeed] = useState<number>(340); // m/s (ses hızı)
  const [sourceFreq, setSourceFreq] = useState<number>(440); // Hz
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);

  // Position of source and observer
  const [sourceX, setSourceX] = useState<number>(100);
  const [waves, setWaves] = useState<{ x: number; y: number; radius: number; time: number }[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Observer position is fixed in center
  const observerX = 400;
  const observerY = 200;

  // Computed apparent frequency
  const isApproaching = sourceX < observerX;
  const apparentFreq = isApproaching 
    ? Math.round(sourceFreq * (soundSpeed / Math.max(10, soundSpeed - sourceSpeed)))
    : Math.round(sourceFreq * (soundSpeed / (soundSpeed + sourceSpeed)));

  // Sound Engine
  useEffect(() => {
    if (!isAudioEnabled) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!oscRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(apparentFreq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      } else {
        oscRef.current.frequency.setTargetAtTime(apparentFreq, audioCtxRef.current.currentTime, 0.05);
      }
    } catch (_) {}

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
          oscRef.current = null;
        } catch (_) {}
      }
    };
  }, [isAudioEnabled, apparentFreq]);

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastWaveTime = 0;
    let curX = sourceX;

    const render = (time: number) => {
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Observer (Gözlemci)
      ctx.beginPath();
      ctx.arc(observerX, observerY, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Gözlemci', observerX, observerY - 24);
      ctx.fillStyle = '#34d399';
      ctx.fillText(`${apparentFreq} Hz`, observerX, observerY + 30);

      // Waves animation
      if (isRunning) {
        // Emit wave every 120ms
        if (time - lastWaveTime > 120) {
          waves.push({ x: curX, y: observerY, radius: 2, time });
          lastWaveTime = time;
        }

        // Advance source
        curX += (sourceSpeed / soundSpeed) * 3;
        if (curX > canvas.width + 50) {
          curX = -50;
        }
        setSourceX(curX);
      }

      // Update & draw waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        if (isRunning) {
          w.radius += 2.5;
        }

        if (w.radius > canvas.width) {
          waves.splice(i, 1);
          continue;
        }

        const alpha = Math.max(0, 1 - (w.radius / (canvas.width * 0.7)));
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.7})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Source (Ses Kaynağı / Ambulans / Araç)
      ctx.beginPath();
      ctx.arc(curX, observerY, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kaynak', curX, observerY - 26);
      ctx.fillStyle = '#f87171';
      ctx.fillText(`${sourceFreq} Hz`, curX, observerY + 32);

      // Velocity Arrow on Source
      ctx.beginPath();
      ctx.moveTo(curX + 16, observerY);
      ctx.lineTo(curX + 38, observerY);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(curX + 34, observerY - 5);
      ctx.lineTo(curX + 40, observerY);
      ctx.lineTo(curX + 34, observerY + 5);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, sourceSpeed, soundSpeed, sourceFreq, apparentFreq]);

  const handleReset = () => {
    setSourceX(60);
    setWaves([]);
    setIsRunning(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f8fafc', padding: 'clamp(16px, 3vw, 24px)', paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))' }}>
      
      {/* Header Bar */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/simulasyonlar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, margin: 0 }}>
                Doppler Etkisi Simülasyonu
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                AYT FİZİK
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Dalga boyunun sıkışması, frekans kayması ve algılanan ses perdesi
            </p>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          style={{
            background: isAudioEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            border: isAudioEnabled ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
            color: isAudioEnabled ? '#34d399' : '#94a3b8',
            borderRadius: '12px',
            padding: '8px 14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          {isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>{isAudioEnabled ? 'Ses Açık (Algılanan Ton)' : 'Sesi Aç'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Canvas Stage */}
        <div style={{ gridColumn: 'span 2', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
          
          {/* Top HUD */}
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Kaynak Frekansı ($f_0$)</span>
                <strong style={{ fontSize: '15px', color: '#ef4444' }}>{sourceFreq} Hz</strong>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Algılanan Frekans ($f&apos;$)</span>
                <strong style={{ fontSize: '15px', color: '#10b981' }}>{apparentFreq} Hz</strong>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Hareket Durumu</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isApproaching ? '#38bdf8' : '#fbbf24' }}>
                  {isApproaching ? 'Yaklaşıyor (Tizleşir)' : 'Uzaklaşıyor (Pesleşir)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsRunning(!isRunning)}
                style={{ padding: '8px 14px', borderRadius: '10px', background: isRunning ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', border: isRunning ? '1px solid #f59e0b' : '1px solid #10b981', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
              >
                {isRunning ? <Pause size={14} color="#f59e0b" /> : <Play size={14} color="#10b981" />}
                {isRunning ? 'Durdur' : 'Devam Et'}
              </button>
              <button
                onClick={handleReset}
                style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
              >
                <RotateCcw size={14} /> Sıfırla
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef} width={800} height={400} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Controls & Formula Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Controls Card */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9' }}>
              <Compass size={18} color="#38bdf8" /> Deney Parametreleri
            </h3>

            {/* Source Speed */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Kaynak Hızı ($v_k$)</span>
                <strong style={{ color: '#ef4444' }}>{sourceSpeed} m/s</strong>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                step={10}
                value={sourceSpeed}
                onChange={e => setSourceSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Ses hızına ({soundSpeed} m/s) yaklaştıkça dalgalar sıkışır.</span>
            </div>

            {/* Base Frequency */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Temel Frekans ($f_0$)</span>
                <strong style={{ color: '#38bdf8' }}>{sourceFreq} Hz</strong>
              </div>
              <input
                type="range"
                min={220}
                max={880}
                step={20}
                value={sourceFreq}
                onChange={e => setSourceFreq(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Sound Speed */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Ortamdaki Ses Hızı ($v_s$)</span>
                <strong style={{ color: '#10b981' }}>{soundSpeed} m/s</strong>
              </div>
              <input
                type="range"
                min={300}
                max={400}
                step={10}
                value={soundSpeed}
                onChange={e => setSoundSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>
          </div>

          {/* YKS Summary Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM YKS İpuçları
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>Yaklaşırken:</strong> Dalga boyu ($\lambda$) küçülür, frekans ($f$) artar $\to$ Ses daha <strong>tiz</strong> duyulur.</li>
              <li><strong>Uzaklaşırken:</strong> Dalga boyu ($\lambda$) büyür, frekans ($f$) azalır $\to$ Ses daha <strong>pes (kalın)</strong> duyulur.</li>
              <li><strong>Kırmızıya / Maviye Kayma:</strong> Işıkta da aynı ilke geçerlidir; uzaklaşan galaksiler kırmızıya kayar.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
