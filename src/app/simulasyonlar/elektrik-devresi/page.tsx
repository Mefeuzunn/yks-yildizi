"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ElectricCircuitSim() {
  const [voltage, setVoltage] = useState(12); // Volts
  const [resistance, setResistance] = useState(10); // Ohms
  
  // Ohm's Law: I = V / R
  const current = voltage / resistance;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Circuit path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.moveTo(100, 100);
      ctx.lineTo(500, 100);
      ctx.lineTo(500, 300);
      ctx.lineTo(100, 300);
      ctx.closePath();
      ctx.stroke();

      // Draw Battery (Left)
      ctx.fillStyle = '#13141c';
      ctx.fillRect(80, 180, 40, 40);
      
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b'; // + terminal
      ctx.lineWidth = 6;
      ctx.moveTo(85, 190);
      ctx.lineTo(115, 190);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8'; // - terminal
      ctx.lineWidth = 4;
      ctx.moveTo(95, 210);
      ctx.lineTo(105, 210);
      ctx.stroke();
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`${voltage}V`, 130, 205);

      // Draw Resistor (Top)
      ctx.fillStyle = '#13141c';
      ctx.fillRect(250, 80, 100, 40);
      
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      // zigzag
      ctx.moveTo(250, 100);
      ctx.lineTo(260, 85);
      ctx.lineTo(280, 115);
      ctx.lineTo(300, 85);
      ctx.lineTo(320, 115);
      ctx.lineTo(340, 85);
      ctx.lineTo(350, 100);
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.fillText(`${resistance}Ω`, 280, 70);

      // Draw Ammeter (Right)
      ctx.fillStyle = '#13141c';
      ctx.fillRect(480, 180, 40, 40);
      ctx.beginPath();
      ctx.fillStyle = '#10b981';
      ctx.arc(500, 200, 20, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(`A`, 493, 206);
      
      // Animate electrons
      const speed = current * 2; 
      time += speed;

      ctx.fillStyle = '#fcd34d'; // Electrons
      
      // Calculate electron positions along the path
      // Path perimeter = 400 (top) + 200 (right) + 400 (bottom) + 200 (left) = 1200
      for (let i = 0; i < 20; i++) {
        const offset = (time + i * 60) % 1200;
        let ex = 0, ey = 0;
        
        if (offset < 400) {
          // Top edge (left to right)
          ex = 100 + offset;
          ey = 100;
        } else if (offset < 600) {
          // Right edge (top to bottom)
          ex = 500;
          ey = 100 + (offset - 400);
        } else if (offset < 1000) {
          // Bottom edge (right to left)
          ex = 500 - (offset - 600);
          ey = 300;
        } else {
          // Left edge (bottom to top)
          ex = 100;
          ey = 300 - (offset - 1000);
        }

        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI*2);
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fcd34d';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [voltage, resistance, current]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>⚡</span> Ohm Kanunu ve Devreler
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Voltaj ve direnci değiştirerek devreden geçen elektrik akımını gözlemleyin.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        <div style={{ backgroundColor: '#0e121e', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas ref={canvasRef} width={600} height={400} style={{ backgroundColor: '#0a0d14', borderRadius: '16px' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', borderTop: '4px solid #10b981' }}>
            <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Akım Şiddeti (I)</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
              {current.toFixed(2)} <span style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.5)' }}>Amper</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#0e121e', borderRadius: '20px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Potansiyel Fark (Voltaj - V)</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>{voltage} V</span>
              </div>
              <input type="range" min="1" max="50" value={voltage} onChange={e => setVoltage(Number(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#94a3b8' }}>Direnç (R)</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>{resistance} Ω</span>
              </div>
              <input type="range" min="1" max="100" value={resistance} onChange={e => setResistance(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#c084fc', marginBottom: '0.5rem' }}>
              V = I × R
            </div>
            <p style={{ fontSize: '0.85rem', color: '#ddd', textAlign: 'center', margin: 0 }}>
              Direnç arttıkça akım azalır, voltaj arttıkça akım artar. Elektronların akış hızından bunu doğrulayabilirsiniz.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
