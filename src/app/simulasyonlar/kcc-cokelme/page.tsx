"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, FlaskConical, Beaker } from 'lucide-react';
import Link from 'next/link';

type Ion = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'Ag' | 'Cl';
  state: 'aqueous' | 'solid';
  targetX?: number;
  targetY?: number;
};

export default function KccCokelmeSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derişimler (Molarite * 10^-5)
  // Ag+ derişimi ve Cl- derişimi
  const [agConc, setAgConc] = useState(20); // 20 x 10^-5 M
  const [clConc, setClConc] = useState(20); // 20 x 10^-5 M
  const [mixed, setMixed] = useState(false);

  // Kçç (AgCl için) ~ 1.8 x 10^-10 (Basitleştirilmiş simülasyon mantığı için Kçç'yi ölçekliyoruz)
  // Görselleştirmeyi kolaylaştırmak adına Kçç limitimizi 100 olarak belirleyelim.
  // Q = (agConc) * (clConc). Eğer Q > 400 ise çökelme başlar (Örnek değerler).
  const Kcc_limit = 400; 

  const ionsRef = useRef<Ion[]>([]);

  const initSimulation = () => {
    setMixed(false);
    ionsRef.current = [];
  };

  const handleMix = () => {
    setMixed(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    
    // Su seviyesi
    const waterTop = h * 0.3;
    const bottom = h - 20;

    const newIons: Ion[] = [];
    
    // İyon sayıları derişimle orantılı
    const numAg = Math.floor(agConc);
    const numCl = Math.floor(clConc);

    let id = 0;
    for(let i=0; i<numAg; i++) {
      newIons.push({
        id: id++,
        x: Math.random() * (w - 40) + 20,
        y: Math.random() * (bottom - waterTop - 20) + waterTop + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'Ag',
        state: 'aqueous'
      });
    }

    for(let i=0; i<numCl; i++) {
      newIons.push({
        id: id++,
        x: Math.random() * (w - 40) + 20,
        y: Math.random() * (bottom - waterTop - 20) + waterTop + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'Cl',
        state: 'aqueous'
      });
    }

    ionsRef.current = newIons;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;
    
    const waterTop = h * 0.3;
    const bottom = h - 20;

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Beher çizimi
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(10, bottom + 10);
      ctx.lineTo(w - 10, bottom + 10);
      ctx.lineTo(w - 10, 20);
      ctx.stroke();

      // Su
      if (mixed) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fillRect(12, waterTop, w - 24, bottom + 8 - waterTop);
        // Su yüzeyi çizgisi
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.moveTo(12, waterTop);
        ctx.lineTo(w - 12, waterTop);
        ctx.stroke();
      }

      if (mixed) {
        // Çökelme Fiziği (Eğer Q > Kçç ise, fazlalık katılaşır)
        const Q = agConc * clConc;
        const isPrecipitating = Q > Kcc_limit;
        
        let solidCount = 0;
        if (isPrecipitating) {
           // Ne kadar çökecek? Q - Kçç ile orantılı basit bir oran
           const excessRatio = (Q - Kcc_limit) / Q;
           // İyonların belirli bir yüzdesini 'solid' yap
           const agSolidLimit = Math.floor(agConc * excessRatio);
           const clSolidLimit = Math.floor(clConc * excessRatio);
           // Çöken Ag ve Cl sayısı eşit olmalı (AgCl)
           const precipitateAmount = Math.min(agSolidLimit, clSolidLimit);
           
           let agCount = 0;
           let clCount = 0;

           ionsRef.current.forEach(ion => {
             if (ion.type === 'Ag' && agCount < precipitateAmount) {
               if (ion.state === 'aqueous') { ion.state = 'solid'; ion.targetX = w/2 + (Math.random()-0.5)*100; ion.targetY = bottom; }
               agCount++;
             }
             if (ion.type === 'Cl' && clCount < precipitateAmount) {
               if (ion.state === 'aqueous') { ion.state = 'solid'; ion.targetX = w/2 + (Math.random()-0.5)*100; ion.targetY = bottom; }
               clCount++;
             }
           });
        } else {
           // Çözünme (Eğer Q < Kçç ise katılar tekrar sulu faza geçer)
           ionsRef.current.forEach(ion => { ion.state = 'aqueous'; });
        }

        // İyonları Çiz ve Hareket Ettir
        ionsRef.current.forEach(ion => {
          if (ion.state === 'aqueous') {
             ion.x += ion.vx;
             ion.y += ion.vy;

             // Çarpışma
             if (ion.x < 20) { ion.x = 20; ion.vx *= -1; }
             if (ion.x > w - 20) { ion.x = w - 20; ion.vx *= -1; }
             if (ion.y < waterTop + 10) { ion.y = waterTop + 10; ion.vy *= -1; }
             if (ion.y > bottom - 10) { ion.y = bottom - 10; ion.vy *= -1; }

          } else if (ion.state === 'solid' && ion.targetX && ion.targetY) {
             // Dibe çökme
             const dx = ion.targetX - ion.x;
             const dy = ion.targetY - ion.y;
             if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
               ion.x += dx * 0.05;
               ion.y += dy * 0.05;
             } else {
               // Dipte hafif titreme (Brownian)
               ion.x += (Math.random() - 0.5) * 0.5;
               ion.y += (Math.random() - 0.5) * 0.5;
             }
             solidCount++;
          }

          // Çizim
          ctx.beginPath();
          ctx.arc(ion.x, ion.y, 6, 0, Math.PI * 2);
          if (ion.type === 'Ag') {
             ctx.fillStyle = '#f43f5e'; // Kırmızımsı gümüş
             ctx.fill();
             ctx.fillStyle = '#fff';
             ctx.font = '8px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('+', ion.x, ion.y + 3);
          } else {
             ctx.fillStyle = '#10b981'; // Yeşil klor
             ctx.fill();
             ctx.fillStyle = '#fff';
             ctx.font = '8px sans-serif';
             ctx.textAlign = 'center';
             ctx.fillText('-', ion.x, ion.y + 3);
          }
        });

        // Çökelme varsa Dipte katı kümesi çizimi efekti
        if (solidCount > 0) {
           ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
           ctx.font = 'bold 14px sans-serif';
           ctx.textAlign = 'center';
           ctx.fillText('AgCl(k) Çökeltisi', w/2, bottom - 15);
        }

      } else {
         // Karıştırılmadı yazısı
         ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
         ctx.font = 'bold 24px sans-serif';
         ctx.textAlign = 'center';
         ctx.fillText('İki çözeltiyi karıştırın', w/2, h/2);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mixed, agConc, clConc]);

  const Q = agConc * clConc;
  let statusText = "";
  let statusColor = "";
  if (!mixed) {
    statusText = "Karışım Bekleniyor";
    statusColor = "var(--text-secondary)";
  } else if (Q > Kcc_limit) {
    statusText = "Aşırı Doymuş (Çökelme Var)";
    statusColor = "#ef4444";
  } else if (Q === Kcc_limit) {
    statusText = "Doymuş Çözelti (Dengede)";
    statusColor = "#f59e0b";
  } else {
    statusText = "Doymamış Çözelti (Çökelme Yok)";
    statusColor = "#10b981";
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
          <button 
            onClick={initSimulation}
            className="btn-interactive"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Temizle
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Çözünürlük Dengesi (Kçç) ve Çökelme</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Ag⁺ ve Cl⁻ iyonlarını içeren iki çözeltiyi karıştırarak İyon Çarpımı (Q) ile Kçç arasındaki ilişkiyi gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Analiz Panelleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>İyon Çarpımı (Q)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{mixed ? Q : 0}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Çözünürlük Çarpımı (Kçç)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{Kcc_limit}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Durum</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: statusColor, marginTop: '0.4rem' }}>{statusText}</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Derişim Ayarları</h3>
            </div>

            {!mixed ? (
              <button
                onClick={handleMix}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                  background: '#10b981', color: '#fff',
                  fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                <Beaker size={20}/> Çözeltileri Karıştır
              </button>
            ) : (
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Tepkime gerçekleşti. Değerleri değiştirerek dengeyi kaydırın.
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>[Ag⁺] Derişimi</label>
                <span style={{ fontSize: '0.9rem', color: '#f43f5e', fontWeight: 700 }}>{agConc} br</span>
              </div>
              <input 
                type="range" min="5" max="50" step="1" 
                value={agConc} 
                onChange={(e) => setAgConc(Number(e.target.value))} 
                style={{ width: '100%', accentColor: '#f43f5e' }} 
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>[Cl⁻] Derişimi</label>
                <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>{clConc} br</span>
              </div>
              <input 
                type="range" min="5" max="50" step="1" 
                value={clConc} 
                onChange={(e) => setClConc(Number(e.target.value))} 
                style={{ width: '100%', accentColor: '#10b981' }} 
              />
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <FlaskConical size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.25rem' }}>Çökelme Şartı</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Eğer iyon derişimleri çarpımı (Q), çözünürlük çarpımı sabitini (Kçç) aşarsa, aşan iyonlar <b>AgCl(k)</b> katısı olarak dibe çöker. Çökelme Q = Kçç oluncaya kadar devam eder.
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
