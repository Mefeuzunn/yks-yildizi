"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Battery, Zap, Sparkles, Info, Sliders, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SigacKondansatorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation Parameters
  const [distance, setDistance] = useState<number>(6); // mm (d)
  const [plateArea, setPlateArea] = useState<number>(200); // mm^2 (A)
  const [dielectricK, setDielectricK] = useState<number>(1); // Hava: 1, Cam/Porselen: 5-8
  const [isConnectedToBattery, setIsConnectedToBattery] = useState<boolean>(true); // V sabit vs Q sabit
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12); // Volt

  // Initial stored charge when disconnected
  const [lockedCharge, setLockedCharge] = useState<number>(50);

  // Computations
  // C = eps0 * K * A / d
  const capacitance = ((dielectricK * plateArea) / distance) * 0.0885; // pF (approx scale)

  let voltage = batteryVoltage;
  let charge = capacitance * voltage;

  if (!isConnectedToBattery) {
    charge = lockedCharge;
    voltage = charge / Math.max(0.01, capacitance);
  }

  // Energy U = 0.5 * C * V^2 (or Q^2 / 2C)
  const energy = 0.5 * capacitance * Math.pow(voltage, 2);
  // Electric Field E = V / d
  const electricField = (voltage / distance) * 100; // V/m scaled

  // Sync locked charge on disconnect
  const toggleBattery = (connect: boolean) => {
    if (!connect && isConnectedToBattery) {
      setLockedCharge(charge);
    }
    setIsConnectedToBattery(connect);
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Plate geometry
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const plateWidth = Math.min(260, plateArea * 1.1);
    const plateHeight = 16;
    const gap = distance * 14;

    const topPlateY = centerY - gap / 2 - plateHeight;
    const bottomPlateY = centerY + gap / 2;

    // Dielectric Slab (Plakalar arasına giren madde)
    if (dielectricK > 1) {
      const slabHeight = gap;
      ctx.fillStyle = dielectricK >= 5 ? 'rgba(168, 85, 247, 0.35)' : 'rgba(56, 189, 248, 0.3)';
      ctx.fillRect(centerX - plateWidth / 2, topPlateY + plateHeight, plateWidth, slabHeight);
      ctx.strokeStyle = dielectricK >= 5 ? '#c084fc' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(centerX - plateWidth / 2, topPlateY + plateHeight, plateWidth, slabHeight);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Dielektrik Madde (κ = ${dielectricK})`, centerX, centerY + 4);
    }

    // Electric Field Lines (Elektrik Alan Çizgileri)
    const lineCount = Math.min(18, Math.max(3, Math.round(electricField / 30)));
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < lineCount; i++) {
      const x = (centerX - plateWidth / 2 + 15) + (i * ((plateWidth - 30) / Math.max(1, lineCount - 1)));
      ctx.beginPath();
      ctx.moveTo(x, topPlateY + plateHeight);
      ctx.lineTo(x, bottomPlateY);
      ctx.stroke();

      // Downward arrow
      ctx.beginPath();
      ctx.moveTo(x - 3, bottomPlateY - 8);
      ctx.lineTo(x, bottomPlateY);
      ctx.lineTo(x + 3, bottomPlateY - 8);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.fill();
    }

    // Top Plate (Pozitif Levha)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(centerX - plateWidth / 2, topPlateY, plateWidth, plateHeight);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - plateWidth / 2, topPlateY, plateWidth, plateHeight);

    // Bottom Plate (Negatif Levha)
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX - plateWidth / 2, bottomPlateY, plateWidth, plateHeight);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - plateWidth / 2, bottomPlateY, plateWidth, plateHeight);

    // Charge signs on plates (+ and -)
    const chargeCount = Math.min(14, Math.max(2, Math.round(charge / 8)));
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < chargeCount; i++) {
      const x = (centerX - plateWidth / 2 + 15) + (i * ((plateWidth - 30) / Math.max(1, chargeCount - 1)));
      ctx.fillStyle = '#ffffff';
      ctx.fillText('+', x, topPlateY + 12);
      ctx.fillText('-', x, bottomPlateY + 12);
    }

    // Battery / Wires
    ctx.strokeStyle = isConnectedToBattery ? '#10b981' : '#64748b';
    ctx.lineWidth = 2.5;

    // Top wire
    ctx.beginPath();
    ctx.moveTo(centerX, topPlateY);
    ctx.lineTo(centerX, topPlateY - 30);
    ctx.lineTo(centerX - 240, topPlateY - 30);
    ctx.lineTo(centerX - 240, centerY - 20);
    ctx.stroke();

    // Bottom wire
    ctx.beginPath();
    ctx.moveTo(centerX, bottomPlateY + plateHeight);
    ctx.lineTo(centerX, bottomPlateY + plateHeight + 30);
    ctx.lineTo(centerX - 240, bottomPlateY + plateHeight + 30);
    ctx.lineTo(centerX - 240, centerY + 20);
    ctx.stroke();

    // Battery Symbol
    if (isConnectedToBattery) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 255, centerY - 15);
      ctx.lineTo(centerX - 225, centerY - 15);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 245, centerY + 15);
      ctx.lineTo(centerX - 235, centerY + 15);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Pil: ${batteryVoltage}V`, centerX - 240, centerY + 40);
    } else {
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Pil Bağlı Değil (Açık Devre)', centerX - 240, centerY + 5);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Yük (Q) Sabit Kalır', centerX - 240, centerY + 22);
    }

  }, [distance, plateArea, dielectricK, isConnectedToBattery, batteryVoltage, charge, voltage, electricField]);

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#f8fafc', padding: 'clamp(16px, 3vw, 24px)', paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/simulasyonlar" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, margin: 0 }}>
                Kondansatör (Sığaç) & Dielektrik
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)' }}>
                AYT FİZİK
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Plakalar arası dielektrik, mesafe, sığa ($C$), yük ($Q$) ve gerilim ($V$) değişimi
            </p>
          </div>
        </div>

        {/* Battery Connection Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => toggleBattery(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: isConnectedToBattery ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: isConnectedToBattery ? '#fff' : '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Battery size={14} /> Pile Bağlı (V Sabit)
          </button>
          <button
            onClick={() => toggleBattery(false)}
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: !isConnectedToBattery ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'transparent',
              color: !isConnectedToBattery ? '#fff' : '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={14} /> Pilden Ayrılmış (Q Sabit)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* Canvas Area */}
        <div style={{ gridColumn: 'span 2', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden' }}>
          
          {/* Realtime Metrics Bar */}
          <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Sığa (C = ε·A / d)</span>
              <strong style={{ fontSize: '16px', color: '#c084fc' }}>{capacitance.toFixed(2)} pF</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Depolanan Yük (Q)</span>
              <strong style={{ fontSize: '16px', color: '#facc15' }}>{charge.toFixed(1)} pC</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Gerilim (V)</span>
              <strong style={{ fontSize: '16px', color: '#38bdf8' }}>{voltage.toFixed(1)} V</strong>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Elektrik Alan (E = V / d)</span>
              <strong style={{ fontSize: '16px', color: '#10b981' }}>{electricField.toFixed(0)} V/m</strong>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <canvas ref={canvasRef} width={800} height={380} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        {/* Controls Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f1f5f9' }}>
              <Sliders size={18} color="#c084fc" /> Deney Kontrolleri
            </h3>

            {/* Distance d */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Plakalar Arası Mesafe ($d$)</span>
                <strong style={{ color: '#38bdf8' }}>{distance} mm</strong>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={0.5}
                value={distance}
                onChange={e => setDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
              <span style={{ fontSize: '10px', color: '#64748b' }}>Mesafe arttıkça sığa ($C$) ters orantılı olarak azalır.</span>
            </div>

            {/* Area A */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Plaka Alanı ($A$)</span>
                <strong style={{ color: '#c084fc' }}>{plateArea} mm²</strong>
              </div>
              <input
                type="range"
                min={100}
                max={250}
                step={10}
                value={plateArea}
                onChange={e => setPlateArea(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#c084fc' }}
              />
            </div>

            {/* Dielectric Constant K */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#94a3b8' }}>Dielektrik Madde Katsayısı ($\kappa$)</span>
                <strong style={{ color: '#facc15' }}>{dielectricK === 1 ? '1 (Hava / Boşluk)' : `${dielectricK} (Yalıtkan)`}</strong>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={dielectricK}
                onChange={e => setDielectricK(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#facc15' }}
              />
            </div>

            {/* Battery Voltage (if connected) */}
            {isConnectedToBattery && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Pil Gerilimi ($V$)</span>
                  <strong style={{ color: '#10b981' }}>{batteryVoltage} V</strong>
                </div>
                <input
                  type="range"
                  min={3}
                  max={24}
                  step={1}
                  value={batteryVoltage}
                  onChange={e => setBatteryVoltage(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
            )}
          </div>

          {/* Exam Crucial Notes */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM AYT Kritik Kuralı
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>Pile Bağlıyken:</strong> Gerilim (V) sabit kalır. d azaltılırsa veya dielektrik katsayısı artarsa C artar, Q artar.</li>
              <li><strong>Pilden Ayrılınca:</strong> Yük (Q) sabit kalır! Araya dielektrik konursa C artar, formülden (Q = C · V) gerilim V azalır.</li>
              <li><strong>Elektrik Alan (E = V / d):</strong> Pilden ayrılmış kondansatörde d artırılırsa hem V hem d aynı oranda artar, E değişmez!</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
