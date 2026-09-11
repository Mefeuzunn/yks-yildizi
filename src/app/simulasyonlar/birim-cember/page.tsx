"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function UnitCircleSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Angle in radians (0 to 2PI)
  const [angle, setAngle] = useState<number>(Math.PI / 6); // Default 30 degrees
  const [isDragging, setIsDragging] = useState(false);

  // Constants
  const R = 200; // Radius
  const CX = 300; // Center X
  const CY = 300; // Center Y

  const colors = {
    sin: '#ef4444',
    cos: '#3b82f6',
    tan: '#10b981',
    cot: '#a855f7',
    circle: 'rgba(255,255,255,0.2)',
    axis: 'rgba(255,255,255,0.4)',
    point: '#fff'
  };

  useEffect(() => {
    draw(angle);
  }, [angle]);

  const draw = (a: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Axes
    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    // X Axis
    ctx.moveTo(0, CY);
    ctx.lineTo(canvas.width, CY);
    // Y Axis
    ctx.moveTo(CX, 0);
    ctx.lineTo(CX, canvas.height);
    ctx.stroke();

    // Tangent Axis (x = 1)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'; // faded green
    ctx.setLineDash([5, 5]);
    ctx.moveTo(CX + R, 0);
    ctx.lineTo(CX + R, canvas.height);
    ctx.stroke();

    // Cotangent Axis (y = 1) -> which in standard math is top, in canvas is CY - R
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)'; // faded purple
    ctx.moveTo(0, CY - R);
    ctx.lineTo(canvas.width, CY - R);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Unit Circle
    ctx.beginPath();
    ctx.strokeStyle = colors.circle;
    ctx.lineWidth = 2;
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();

    // Calculate P(x, y)
    // Note: Canvas Y goes down. So y = CY - R * sin(a)
    const px = CX + R * Math.cos(a);
    const py = CY - R * Math.sin(a);

    // 1. Draw Cosine (Blue)
    ctx.beginPath();
    ctx.strokeStyle = colors.cos;
    ctx.lineWidth = 4;
    ctx.moveTo(CX, CY);
    ctx.lineTo(px, CY);
    ctx.stroke();

    // 2. Draw Sine (Red)
    ctx.beginPath();
    ctx.strokeStyle = colors.sin;
    ctx.lineWidth = 4;
    ctx.moveTo(px, CY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Draw hypotenuse
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.moveTo(CX, CY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // 3. Draw Tangent (Green)
    const tanVal = Math.tan(a);
    // Be careful with infinity
    if (Math.abs(Math.cos(a)) > 0.01) {
      const tx = CX + R;
      const ty = CY - R * tanVal;
      
      // Extension line to tangent axis
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.moveTo(px, py);
      // We draw it passing through P and reaching (tx, ty) or beyond if needed, but just to tx is fine
      // Actually if angle is in Q2 or Q3, the ray goes backwards to intersect tangent axis.
      // Math: intersection of line y = tan(a) * x with x = 1.
      ctx.lineTo(CX + Math.sign(Math.cos(a))*R, CY - Math.sign(Math.cos(a))*R*tanVal);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = colors.tan;
      ctx.lineWidth = 4;
      ctx.moveTo(CX + R, CY);
      ctx.lineTo(CX + R, ty);
      ctx.stroke();
    }

    // 4. Draw Cotangent (Purple)
    const cotVal = 1 / Math.tan(a);
    if (Math.abs(Math.sin(a)) > 0.01) {
      const cx_cot = CX + R * cotVal;
      const cy_cot = CY - R;

      // Extension line to cotangent axis
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.moveTo(px, py);
      ctx.lineTo(CX + Math.sign(Math.sin(a))*R*cotVal, CY - Math.sign(Math.sin(a))*R);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = colors.cot;
      ctx.lineWidth = 4;
      ctx.moveTo(CX, CY - R);
      ctx.lineTo(cx_cot, CY - R);
      ctx.stroke();
    }

    // Draw Point P
    ctx.beginPath();
    ctx.fillStyle = colors.point;
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    // Add glowing effect to P
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Draw Angle Arc
    ctx.beginPath();
    ctx.strokeStyle = '#fcd34d'; // yellow
    ctx.lineWidth = 2;
    // arc(x, y, radius, startAngle, endAngle, counterclockwise)
    // Canvas angles: 0 is right. We need to draw from 0 to -a.
    ctx.arc(CX, CY, 30, 0, -a, true);
    ctx.stroke();
  };

  const updateAngleFromMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - CX;
    const y = -(e.clientY - rect.top - CY); // Invert Y for standard math coordinates

    let newAngle = Math.atan2(y, x);
    if (newAngle < 0) {
      newAngle += 2 * Math.PI;
    }
    setAngle(newAngle);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    updateAngleFromMouse(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updateAngleFromMouse(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Math conversions
  const degrees = Math.round(angle * (180 / Math.PI));
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const tan = Math.tan(angle);
  const cot = 1 / tan;

  const getRegion = (deg: number) => {
    if (deg === 0 || deg === 90 || deg === 180 || deg === 270 || deg === 360) return "Eksen Üzerinde";
    if (deg > 0 && deg < 90) return "1. Bölge (Tümü +)";
    if (deg > 90 && deg < 180) return "2. Bölge (Sadece Sin +)";
    if (deg > 180 && deg < 270) return "3. Bölge (Tan ve Cot +)";
    return "4. Bölge (Sadece Cos +)";
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c10', color: '#fff', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Dinamik Birim Çember</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Çember üzerindeki noktayı sürükleyerek trigonometrik değerleri gözlemleyin.</p>
        </div>
        <button 
          onClick={() => setAngle(Math.PI / 6)}
          className="btn-interactive" 
          style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RotateCcw size={18} /> Sıfırla
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Canvas Area */}
        <div style={{ backgroundColor: '#13141c', borderRadius: '16px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', backgroundColor: '#0b0c10', borderRadius: '50%', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
          />
        </div>

        {/* Dashboard/Stats Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="premium-card">
            <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Mevcut Açı</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fcd34d', lineHeight: 1 }}>{degrees}°</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', paddingBottom: '0.5rem' }}>/ {(angle / Math.PI).toFixed(2)}π</span>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0' }}>
              📍 {getRegion(degrees)}
            </div>
          </div>

          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Trigonometrik Değerler</h3>

             {/* Sinus */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.sin }}></div>
                 <span style={{ fontWeight: 600, color: colors.sin }}>Sinüs (y)</span>
               </div>
               <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>{sin.toFixed(3)}</span>
             </div>

             {/* Cosinus */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.cos }}></div>
                 <span style={{ fontWeight: 600, color: colors.cos }}>Kosinüs (x)</span>
               </div>
               <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>{cos.toFixed(3)}</span>
             </div>

             {/* Tangent */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.tan }}></div>
                 <span style={{ fontWeight: 600, color: colors.tan }}>Tanjant</span>
               </div>
               <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>
                 {Math.abs(tan) > 100 ? 'Tanımsız' : tan.toFixed(3)}
               </span>
             </div>

             {/* Cotangent */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.cot }}></div>
                 <span style={{ fontWeight: 600, color: colors.cot }}>Kotanjant</span>
               </div>
               <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700 }}>
                  {Math.abs(cot) > 100 ? 'Tanımsız' : cot.toFixed(3)}
               </span>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}
