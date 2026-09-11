"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, LineChart, MoveHorizontal, Baseline } from 'lucide-react';
import Link from 'next/link';

type FunctionType = 'sin' | 'cos' | 'quad' | 'cubic';

export default function MatematikGrafikleriPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Settings
  const [funcType, setFuncType] = useState<FunctionType>('sin');
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);

  // Parameters
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);

  // Calculus points
  const [tangentX, setTangentX] = useState(0); // for derivative
  const [intStart, setIntStart] = useState(-2); // for integral start
  const [intEnd, setIntEnd] = useState(2); // for integral end

  // Math Evaluators
  const f = (x: number) => {
    switch (funcType) {
      case 'sin': return a * Math.sin(b * x + c);
      case 'cos': return a * Math.cos(b * x + c);
      case 'quad': return a * Math.pow(x, 2) + b * x + c;
      case 'cubic': return a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x;
      default: return 0;
    }
  };

  const derivative = (x: number) => {
    // Exact derivatives
    switch (funcType) {
      case 'sin': return a * b * Math.cos(b * x + c);
      case 'cos': return -a * b * Math.sin(b * x + c);
      case 'quad': return 2 * a * x + b;
      case 'cubic': return 3 * a * Math.pow(x, 2) + 2 * b * x + c;
      default: return 0;
    }
  };

  // Numerical Integral (Trapezoidal Rule)
  const calculateIntegral = () => {
    let sum = 0;
    const steps = 1000;
    const dx = (intEnd - intStart) / steps;
    for (let i = 0; i < steps; i++) {
      const x1 = intStart + i * dx;
      const x2 = x1 + dx;
      sum += (f(x1) + f(x2)) * dx / 2;
    }
    return sum;
  };

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Viewport scaling
    const scale = 50; // pixels per unit
    const originX = width / 2;
    const originY = height / 2;

    const toScreenX = (x: number) => originX + x * scale;
    const toScreenY = (y: number) => originY - y * scale;
    const toMathX = (px: number) => (px - originX) / scale;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY); ctx.stroke(); // X
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height); ctx.stroke(); // Y

    // 1. Draw Integral Area (must be behind function line)
    if (showIntegral) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      let started = false;
      for (let px = 0; px < width; px += 2) {
        const mx = toMathX(px);
        if (mx >= intStart && mx <= intEnd) {
          const my = f(mx);
          if (!started) {
            ctx.moveTo(toScreenX(mx), toScreenY(0));
            started = true;
          }
          ctx.lineTo(toScreenX(mx), toScreenY(my));
        }
      }
      if (started) {
        ctx.lineTo(toScreenX(intEnd), toScreenY(0));
        ctx.fill();
      }

      // Draw bounds lines
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(toScreenX(intStart), toScreenY(0)); ctx.lineTo(toScreenX(intStart), toScreenY(f(intStart))); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(toScreenX(intEnd), toScreenY(0)); ctx.lineTo(toScreenX(intEnd), toScreenY(f(intEnd))); ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Main Function
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
      const mx = toMathX(px);
      const my = f(mx);
      if (px === 0) ctx.moveTo(toScreenX(mx), toScreenY(my));
      else ctx.lineTo(toScreenX(mx), toScreenY(my));
    }
    ctx.stroke();

    // 3. Draw Tangent Line (Derivative)
    if (showDerivative) {
      const m = derivative(tangentX); // slope
      const y0 = f(tangentX);
      
      // y - y0 = m(x - x0) => y = m(x - x0) + y0
      const getTangentY = (x: number) => m * (x - tangentX) + y0;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Draw tangent line across the screen
      const xLeft = toMathX(0);
      const xRight = toMathX(width);
      ctx.moveTo(toScreenX(xLeft), toScreenY(getTangentY(xLeft)));
      ctx.lineTo(toScreenX(xRight), toScreenY(getTangentY(xRight)));
      ctx.stroke();

      // Draw tangent point
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toScreenX(tangentX), toScreenY(y0), 6, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [funcType, a, b, c, showDerivative, showIntegral, tangentX, intStart, intEnd]);

  // Labels
  const funcLabels = {
    sin: `f(x) = ${a} * sin(${b}x + ${c})`,
    cos: `f(x) = ${a} * cos(${b}x + ${c})`,
    quad: `f(x) = ${a}x² + ${b}x + ${c}`,
    cubic: `f(x) = ${a}x³ + ${b}x² + ${c}x`
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/simulasyonlar">
            <button className="btn-interactive" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LineChart size={24} color="#10b981" />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>Fonksiyonlar & Kalkülüs</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Türev, İntegral ve Fonksiyon dönüşümlerini görsel olarak keşfedin.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        
        {/* Controls */}
        <div className="premium-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          
          <div>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} color="#38bdf8" /> Fonksiyon Seçimi
            </h3>
            <select 
              value={funcType} 
              onChange={e => { setFuncType(e.target.value as FunctionType); setA(1); setB(1); setC(0); }}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            >
              <option value="sin">Trigonometrik: Sinüs</option>
              <option value="cos">Trigonometrik: Kosinüs</option>
              <option value="quad">Polinom: Parabol (2. Derece)</option>
              <option value="cubic">Polinom: Kübik (3. Derece)</option>
            </select>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981', color: '#10b981', fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center' }}>
            {funcLabels[funcType]}
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Katsayılar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Parametre A: </span> <span style={{ color: '#fff' }}>{a}</span>
                </div>
                <input type="range" min="-5" max="5" step="0.5" value={a} onChange={e => setA(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Parametre B: </span> <span style={{ color: '#fff' }}>{b}</span>
                </div>
                <input type="range" min="-5" max="5" step="0.5" value={b} onChange={e => setB(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Parametre C: </span> <span style={{ color: '#fff' }}>{c}</span>
                </div>
                <input type="range" min="-10" max="10" step="1" value={c} onChange={e => setC(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Calculus Tools */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Derivative */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={showDerivative} onChange={e => setShowDerivative(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#f59e0b' }} />
                <span style={{ color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MoveHorizontal size={18} color="#f59e0b" /> Teğet (Türev) Göster</span>
              </label>
              
              {showDerivative && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Teğet Noktası ($x_0$): </span> <span style={{ color: '#f59e0b', fontWeight: 600 }}>{tangentX}</span>
                  </div>
                  <input type="range" min="-10" max="10" step="0.1" value={tangentX} onChange={e => setTangentX(Number(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f59e0b' }}>Anlık Eğim: {derivative(tangentX).toFixed(3)}</div>
                </motion.div>
              )}
            </div>

            {/* Integral */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
                <input type="checkbox" checked={showIntegral} onChange={e => setShowIntegral(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#ef4444' }} />
                <span style={{ color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Baseline size={18} color="#ef4444" /> Alan (İntegral) Göster</span>
              </label>
              
              {showIntegral && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Alt Sınır ($x_1$): </span> <span style={{ color: '#ef4444', fontWeight: 600 }}>{intStart}</span>
                  </div>
                  <input type="range" min="-10" max={intEnd - 0.5} step="0.5" value={intStart} onChange={e => setIntStart(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444', marginBottom: '1rem' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Üst Sınır ($x_2$): </span> <span style={{ color: '#ef4444', fontWeight: 600 }}>{intEnd}</span>
                  </div>
                  <input type="range" min={intStart + 0.5} max="10" step="0.5" value={intEnd} onChange={e => setIntEnd(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
                  
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.875rem', color: '#ef4444' }}>
                    Net Alan: <strong>{calculateIntegral().toFixed(3)}</strong> birim kare
                  </div>
                </motion.div>
              )}
            </div>

          </div>

        </div>

        {/* Graph Display */}
        <div className="premium-card" style={{ padding: 0, overflow: 'hidden', height: '600px', position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            width={1000} 
            height={600} 
            style={{ width: '100%', height: '100%', display: 'block' }} 
          />
          
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' }}></div> f(x)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></div> f'(x)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%' }}></div> ∫ f(x)dx</span>
          </div>
        </div>

      </div>
    </div>
  );
}
