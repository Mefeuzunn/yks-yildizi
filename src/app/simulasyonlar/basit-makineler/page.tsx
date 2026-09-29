"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw, Info, Settings, Compass, Sliders, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type SystemType = 'sabit' | 'hareketli' | 'palanga_asagi' | 'palanga_yukari';

interface SystemConfig {
  name: string;
  desc: string;
  mechanicalAdvantageIdeal: number;
  pullDirection: 'down' | 'up';
}

const SYSTEMS: Record<SystemType, SystemConfig> = {
  sabit: {
    name: 'Sabit Makara',
    desc: 'Kuvvetin yönünü değiştirir, kuvvetten veya yoldan kazanç sağlamaz.',
    mechanicalAdvantageIdeal: 1,
    pullDirection: 'down'
  },
  hareketli: {
    name: 'Hareketli Makara',
    desc: 'Yük 2 ipe bölünür. Kuvvetten 2 kat kazanç, yoldan 2 kat kayıp vardır.',
    mechanicalAdvantageIdeal: 2,
    pullDirection: 'up'
  },
  palanga_asagi: {
    name: 'Palanga (İp Aşağı)',
    desc: '1 sabit + 1 hareketli makara. Çeken ip aşağı yönlüdür (F = G / 2).',
    mechanicalAdvantageIdeal: 2,
    pullDirection: 'down'
  },
  palanga_yukari: {
    name: 'Palanga (İp Yukarı)',
    desc: '1 sabit + 1 hareketli makara. Çeken ip hareketli makaraya bağlıdır (F = G / 3).',
    mechanicalAdvantageIdeal: 3,
    pullDirection: 'up'
  }
};

export default function BasitMakinelerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [systemType, setSystemType] = useState<SystemType>('hareketli');
  const [loadWeight, setLoadWeight] = useState<number>(60); // Newton (G)
  const [pulleyWeight, setPulleyWeight] = useState<number>(0); // Newton (Gm)
  const [pullDistance, setPullDistance] = useState<number>(2.0); // meters (h)

  // Calculations
  const config = SYSTEMS[systemType];

  let requiredForce = 0;
  let loadLiftDistance = 0;

  if (systemType === 'sabit') {
    // Sabit makarada makara ağırlığı kuvvete etki etmez, tavana biner!
    requiredForce = loadWeight;
    loadLiftDistance = pullDistance;
  } else if (systemType === 'hareketli') {
    // Hareketli makarada yük ve makara 2 ipe bölünür: F = (G + Gm) / 2
    requiredForce = (loadWeight + pulleyWeight) / 2;
    loadLiftDistance = pullDistance / 2;
  } else if (systemType === 'palanga_asagi') {
    // 2 ipli palanga, son ip aşağı: F = (G + Gm) / 2
    requiredForce = (loadWeight + pulleyWeight) / 2;
    loadLiftDistance = pullDistance / 2;
  } else if (systemType === 'palanga_yukari') {
    // 3 ipli palanga, son ip yukarı: F = (G + Gm) / 3
    requiredForce = (loadWeight + pulleyWeight) / 3;
    loadLiftDistance = pullDistance / 3;
  }

  const mechanicalAdvantage = Number((loadWeight / Math.max(0.1, requiredForce)).toFixed(2));
  const workInput = Number((requiredForce * pullDistance).toFixed(1)); // Joules
  const workOutput = Number((loadWeight * loadLiftDistance).toFixed(1)); // Joules (faydalı iş)
  const efficiency = Number(((workOutput / Math.max(0.1, workInput)) * 100).toFixed(0));

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const ceilingY = 50;

    // Draw Ceiling
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, ceilingY);
    ctx.lineTo(w - 40, ceilingY);
    ctx.stroke();

    // Ceiling hatch marks
    ctx.lineWidth = 1;
    for (let x = 50; x < w - 40; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, ceilingY);
      ctx.lineTo(x + 10, ceilingY - 10);
      ctx.stroke();
    }

    const drawPulley = (x: number, y: number, r: number, label: string) => {
      // Outer rim
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner axle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();

      // Label
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - r - 6);
    };

    const drawWeightBlock = (x: number, y: number, massVal: number) => {
      const bw = 50;
      const bh = 40;
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x - bw / 2, y, bw, bh);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - bw / 2, y, bw, bh);

      // Mass label
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(`G = ${massVal}N`, x, y + bh / 2 + 4);

      // Hook
      ctx.beginPath();
      ctx.arc(x, y, 6, Math.PI, Math.PI * 2);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Render depending on systemType
    if (systemType === 'sabit') {
      const px = w / 2;
      const py = ceilingY + 50;
      const r = 32;

      // Anchor to ceiling
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, ceilingY);
      ctx.lineTo(px, py);
      ctx.stroke();

      drawPulley(px, py, r, 'Sabit');

      // Left rope hanging load
      const loadY = py + 80 - pullDistance * 12;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(px - r, py);
      ctx.lineTo(px - r, loadY);
      ctx.stroke();

      drawWeightBlock(px - r, loadY, loadWeight);

      // Right rope pulled down by user
      const pullHandY = py + 50 + pullDistance * 12;
      ctx.beginPath();
      ctx.moveTo(px + r, py);
      ctx.lineTo(px + r, pullHandY);
      ctx.stroke();

      // Force Vector
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + r, pullHandY);
      ctx.lineTo(px + r, pullHandY + 35);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`F = ${requiredForce.toFixed(0)} N`, px + r + 10, pullHandY + 25);
    } else if (systemType === 'hareketli') {
      const anchorX = w / 2 - 40;
      const pulleyX = w / 2;
      const r = 32;
      const movingY = ceilingY + 120 - (pullDistance / 2) * 16;

      // Anchor line from ceiling to left edge of moving pulley
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(anchorX, ceilingY);
      ctx.lineTo(anchorX, movingY);
      ctx.arc(pulleyX, movingY, r, Math.PI, 0, true);
      ctx.stroke();

      drawPulley(pulleyX, movingY, r, 'Hareketli');

      // Hanging load from axle of moving pulley
      const loadY = movingY + r + 15;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pulleyX, movingY);
      ctx.lineTo(pulleyX, loadY);
      ctx.stroke();

      drawWeightBlock(pulleyX, loadY, loadWeight);

      // Pull rope going UP
      const pullHandY = movingY - 40 - pullDistance * 10;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pulleyX + r, movingY);
      ctx.lineTo(pulleyX + r, Math.max(ceilingY + 10, pullHandY));
      ctx.stroke();

      // Force arrow UP
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pulleyX + r, Math.max(ceilingY + 10, pullHandY));
      ctx.lineTo(pulleyX + r, Math.max(ceilingY + 10, pullHandY) - 30);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`F = ${requiredForce.toFixed(1)} N`, pulleyX + r + 10, Math.max(ceilingY + 10, pullHandY) - 10);
    } else {
      // Palanga System (1 Fixed top, 1 Moving bottom)
      const fixedX = w / 2;
      const fixedY = ceilingY + 50;
      const r = 28;
      const movingY = ceilingY + 160 - (systemType === 'palanga_yukari' ? (pullDistance / 3) : (pullDistance / 2)) * 16;

      // Anchor top pulley to ceiling
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fixedX, ceilingY);
      ctx.lineTo(fixedX, fixedY);
      ctx.stroke();

      drawPulley(fixedX, fixedY, r, 'Sabit');
      drawPulley(fixedX, movingY, r, 'Hareketli');

      // Thread ropes through both pulleys
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fixedX - r, fixedY);
      ctx.lineTo(fixedX - r, movingY);
      ctx.arc(fixedX, movingY, r, Math.PI, 0, true);
      ctx.lineTo(fixedX + r, fixedY);
      ctx.stroke();

      // Draw load hanging from moving pulley
      const loadY = movingY + r + 15;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fixedX, movingY);
      ctx.lineTo(fixedX, loadY);
      ctx.stroke();

      drawWeightBlock(fixedX, loadY, loadWeight);

      // Pull rope
      const pullHandY = fixedY + 60 + pullDistance * 10;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fixedX + r + 14, fixedY);
      ctx.lineTo(fixedX + r + 14, pullHandY);
      ctx.stroke();

      // Force Vector
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fixedX + r + 14, pullHandY);
      ctx.lineTo(fixedX + r + 14, pullHandY + 30);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`F = ${requiredForce.toFixed(1)} N`, fixedX + r + 24, pullHandY + 20);
    }
  }, [systemType, loadWeight, pulleyWeight, pullDistance, requiredForce]);

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
                Basit Makineler & Makara Sistemleri
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                TYT / AYT FİZİK
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Sabit, hareketli makara ve palangalarda kuvvet kazancı, yoldan kayıp ve verim bağıntıları.
            </p>
          </div>
        </div>

        <button
          onClick={() => { setPullDistance(2.0); setLoadWeight(60); setPulleyWeight(0); }}
          style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
        >
          <RotateCcw size={14} /> Sıfırla
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Canvas View */}
        <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={16} /> Mekanik Denge & İp Gerilmesi
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {config.name} Modu
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
            <canvas
              ref={canvasRef}
              width={540}
              height={360}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
            />
          </div>

          {/* Metric KPI Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gereken Kuvvet (F)</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#38bdf8' }}>{requiredForce.toFixed(1)} N</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Kuvvet Kazancı</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#34d399' }}>{mechanicalAdvantage}x</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Yükün Yükselmesi (h)</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#facc15' }}>{loadLiftDistance.toFixed(2)} m</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sistem Verimi</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: efficiency === 100 ? '#4ade80' : '#fb923c' }}>%{efficiency}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* System Mode Picker */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'block' }}>
              Makara / Palanga Düzeneği Seçimi
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(Object.keys(SYSTEMS) as SystemType[]).map((key) => {
                const sys = SYSTEMS[key];
                const isActive = systemType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSystemType(key)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#fff' : '#cbd5e1' }}>
                      {sys.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                      İdeal Kazanç: {sys.mechanicalAdvantageIdeal}x
                    </div>
                  </button>
                );
              })}
            </div>
            <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              {config.desc}
            </p>
          </div>

          {/* Sliders */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Pull Distance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>İp Çekme Miktarı (x):</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{pullDistance.toFixed(1)} metre</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.1}
                value={pullDistance}
                onChange={(e) => setPullDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Load Weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Kaldırılan Yük Ağırlığı (G):</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>{loadWeight} N</span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={loadWeight}
                onChange={(e) => setLoadWeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Pulley Weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Makara Ağırlığı (G_makara):</span>
                <span style={{ fontWeight: 700, color: pulleyWeight > 0 ? '#fb923c' : '#4ade80' }}>
                  {pulleyWeight > 0 ? `${pulleyWeight} N (Ağırlıklı)` : 'Ağırlıksız (İdeal)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={5}
                value={pulleyWeight}
                onChange={(e) => setPulleyWeight(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#fb923c' }}
              />
            </div>

          </div>

          {/* Golden Rules */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM Fizik Altın Kuralı
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>İşten Kazanç Olmaz:</strong> Hiçbir basit makine işten ya da enerjiden kazanç sağlamaz! Kuvvetten kaç kat kazanırsan, yoldan o kadar kaybedersin (F · x = G · h).</li>
              <li><strong>Sabit Makara:</strong> Yalnızca kuvvetin yönünü değiştirerek iş kolaylığı sağlar. Makara ağırlığı çekme kuvvetini <em>etkilemez</em>.</li>
              <li><strong>Verim Formülü:</strong> Verim = (Faydalı İş / Harcanan İş) × 100. Makara ağırlığı ve sürtünme arttıkça verim %100'ün altına düşer.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
