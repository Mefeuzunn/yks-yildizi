"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, RotateCcw, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Vector {
  id: number;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function VektorToplama() {
  const [vectors, setVectors] = useState<Vector[]>([
    { id: 1, x: 4, y: 3, color: '#ef4444' },
    { id: 2, x: -2, y: 5, color: '#3b82f6' }
  ]);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addVector = () => {
    if (vectors.length >= 5) return;
    const newId = vectors.length > 0 ? Math.max(...vectors.map(v => v.id)) + 1 : 1;
    setVectors([...vectors, { id: newId, x: 2, y: 2, color: COLORS[vectors.length % COLORS.length] }]);
    setShowResult(false);
  };

  const removeVector = (id: number) => {
    setVectors(vectors.filter(v => v.id !== id));
    setShowResult(false);
  };

  const updateVector = (id: number, axis: 'x' | 'y', value: number) => {
    setVectors(vectors.map(v => v.id === id ? { ...v, [axis]: value } : v));
    setShowResult(false);
  };

  const resultVector = {
    x: vectors.reduce((sum, v) => sum + v.x, 0),
    y: vectors.reduce((sum, v) => sum + v.y, 0),
  };

  const resultMagnitude = Math.sqrt(resultVector.x ** 2 + resultVector.y ** 2).toFixed(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and setup
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 20; // 20px per unit

    // Draw Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += scale) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Draw Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.stroke();

    const drawArrow = (startX: number, startY: number, endX: number, endY: number, color: string, width = 3) => {
      const headlen = 10;
      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.fill();
    };

    // Uç uca ekleme yöntemi ile çizim
    let currentX = centerX;
    let currentY = centerY;

    vectors.forEach(v => {
      const nextX = currentX + v.x * scale;
      const nextY = currentY - v.y * scale; // Y is inverted in canvas
      drawArrow(currentX, currentY, nextX, nextY, v.color);
      currentX = nextX;
      currentY = nextY;
    });

    if (showResult && vectors.length > 0) {
      drawArrow(centerX, centerY, centerX + resultVector.x * scale, centerY - resultVector.y * scale, '#fff', 4);
    }

  }, [vectors, showResult]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none' }} className="hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#38bdf8' }}>Vektör Toplama</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.5)' }}>Uç uca ekleme yöntemiyle bileşke kuvvet hesaplama laboratuvarı</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          <div style={{ background: '#0e121e', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={600} 
              style={{ width: '100%', height: 'auto', background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#0e121e', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Vektörler
                <button onClick={addVector} disabled={vectors.length >= 5} style={{ background: 'rgba(56, 189, 248, 0.2)', border: 'none', color: '#38bdf8', padding: '0.5rem', borderRadius: '8px', cursor: vectors.length >= 5 ? 'not-allowed' : 'pointer' }}>
                  <Plus size={18} />
                </button>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {vectors.map((v, i) => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', borderLeft: `4px solid ${v.color}` }}>
                    <div style={{ fontWeight: 800, color: v.color }}>V{i+1}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>X</span>
                        <input type="range" min="-15" max="15" value={v.x} onChange={e => updateVector(v.id, 'x', parseInt(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Y</span>
                        <input type="range" min="-15" max="15" value={v.y} onChange={e => updateVector(v.id, 'y', parseInt(e.target.value))} style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', width: '40px', textAlign: 'right' }}>({v.x}, {v.y})</div>
                    
                    <button onClick={() => removeVector(v.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(139, 92, 246, 0.1))', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8' }}>Bileşke Vektör (R)</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Koordinatlar</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>({resultVector.x}, {resultVector.y})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Büyüklük (|R|)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{resultMagnitude} br</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShowResult(true)}
                  style={{ flex: 1, padding: '1rem', background: '#38bdf8', color: '#0b0f19', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Play size={18} fill="currentColor" /> Bileşkeyi Çiz
                </button>
                <button 
                  onClick={() => { setVectors([{ id: 1, x: 0, y: 0, color: '#ef4444' }]); setShowResult(false); }}
                  style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
