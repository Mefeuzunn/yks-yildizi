"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Magnet } from 'lucide-react';
import Link from 'next/link';

export default function ManyetikInduksiyonSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mıknatıs Pozisyonu
  const [magnetX, setMagnetX] = useState(150);
  const [isDragging, setIsDragging] = useState(false);
  const [current, setCurrent] = useState(0); // Ampermetre Akımı

  const lastPosRef = useRef(150);
  const lastTimeRef = useRef(Date.now());
  const velocityRef = useRef(0);
  const currentSmoothingRef = useRef(0); // Akımın yumuşak değişimi için

  const solenoidX = 500;
  const solenoidWidth = 150;
  const magnetWidth = 120;

  // Çizim Döngüsü
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;

    let animationFrameId: number;

    const render = () => {
      // 1. İndüksiyon Akımı Hesaplama (Faraday Yasası)
      // Yaklaştıkça manyetik akı (Phi) artar, v hızına göre d(Phi)/dt hesaplanır
      // Basitleştirilmiş formül: I ~ v * B(x)
      // B(x) bobine yaklaştıkça artar. Bobinin merkezi: solenoidX + solenoidWidth/2
      const bobinCenter = solenoidX + solenoidWidth / 2;
      const magnetCenter = magnetX + magnetWidth / 2;
      const dist = Math.abs(bobinCenter - magnetCenter);
      
      // Mesafe faktörü (Yaklaştıkça artar, Gaussian gibi)
      const bField = 10000 / (Math.pow(dist, 2) + 10000); 

      let rawCurrent = 0;
      if (Math.abs(velocityRef.current) > 0.1) {
         // Hız pozitifse (sağa gidiyorsa) N kutbu yaklaşıyor -> akı artıyor -> Lenz yasasına göre zıt akım (-)
         // Sağda ise uzaklaşıyor -> akı azalıyor -> pozitif akım (+)
         const direction = magnetCenter < bobinCenter ? 1 : -1;
         rawCurrent = -velocityRef.current * bField * direction * 0.5;
      }
      
      // Hız sıfıra yaklaşınca akımı sıfırla (sürükleme durduğunda)
      if (!isDragging) {
        velocityRef.current *= 0.8; // Hız sönümleme
        if (Math.abs(velocityRef.current) < 0.1) velocityRef.current = 0;
      }

      // Akım yumuşatma (İbre titremesini engellemek için)
      currentSmoothingRef.current += (rawCurrent - currentSmoothingRef.current) * 0.2;
      setCurrent(currentSmoothingRef.current);

      // --- ÇİZİM ---
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // 1. Bobin (Solenoid) Çizimi
      const sy = h / 2 + 50;
      ctx.strokeStyle = '#fcd34d'; // Bakır tel rengi
      ctx.lineWidth = 4;
      for (let i = 0; i < 15; i++) {
        const xOffset = solenoidX + i * 10;
        ctx.beginPath();
        // Arkada kalan teller
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.4)';
        ctx.ellipse(xOffset, sy, 15, 40, 0, Math.PI / 2, 3 * Math.PI / 2);
        ctx.stroke();
        // Önde kalan teller
        ctx.beginPath();
        ctx.strokeStyle = '#fcd34d';
        ctx.ellipse(xOffset, sy, 15, 40, 0, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
      
      // Bobin nüvesi (İçindeki demir çubuk)
      ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.fillRect(solenoidX - 10, sy - 30, solenoidWidth + 20, 60);

      // 2. Kablo ve Ampermetre
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Bobin sol ucundan ampermetreye
      ctx.moveTo(solenoidX, sy + 40);
      ctx.lineTo(solenoidX, sy + 150);
      ctx.lineTo(solenoidX + 50, sy + 150);
      // Bobin sağ ucundan ampermetreye
      ctx.moveTo(solenoidX + solenoidWidth, sy + 40);
      ctx.lineTo(solenoidX + solenoidWidth, sy + 150);
      ctx.lineTo(solenoidX + solenoidWidth - 50, sy + 150);
      ctx.stroke();

      // Ampermetre Gövdesi
      const amX = solenoidX + solenoidWidth / 2;
      const amY = sy + 150;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(amX, amY, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', amX, amY + 25);

      // Ampermetre İbresi
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(amX, amY + 10);
      // Akıma göre ibre açısı (Maksimum +- 45 derece = +- PI/4)
      const maxCurrent = 20; // UI için sınır
      let clampedCurrent = currentSmoothingRef.current;
      if (clampedCurrent > maxCurrent) clampedCurrent = maxCurrent;
      if (clampedCurrent < -maxCurrent) clampedCurrent = -maxCurrent;
      
      const angle = (clampedCurrent / maxCurrent) * (Math.PI / 3) - Math.PI / 2;
      ctx.lineTo(amX + Math.cos(angle) * 30, amY + 10 + Math.sin(angle) * 30);
      ctx.stroke();

      // İbre merkezi nokta
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(amX, amY + 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // 3. Mıknatıs
      const my = h / 2 + 50;
      // N Kutbu (Sağ - Kırmızı)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(magnetX + magnetWidth / 2, my - 20, magnetWidth / 2, 40);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', magnetX + magnetWidth * 0.75, my + 7);
      
      // S Kutbu (Sol - Mavi)
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(magnetX, my - 20, magnetWidth / 2, 40);
      ctx.fillStyle = '#fff';
      ctx.fillText('S', magnetX + magnetWidth * 0.25, my + 7);

      // Mıknatıs çerçevesi
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(magnetX, my - 20, magnetWidth, 40);

      // Manyetik Alan Çizgileri (Görsel Efekt)
      if (Math.abs(clampedCurrent) > 1) {
         ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
         ctx.lineWidth = 2;
         // İndüklenen manyetik alan (Bobin etrafında)
         const r = 60 + Math.abs(clampedCurrent) * 2;
         ctx.beginPath();
         ctx.ellipse(bobinCenter, sy, solenoidWidth/2 + 20, r, 0, 0, Math.PI*2);
         ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  // Mouse / Touch Events
  const updateVelocity = (newX: number) => {
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dx = newX - lastPosRef.current;
      velocityRef.current = dx / dt; // pixels per ms
    }
    lastPosRef.current = newX;
    lastTimeRef.current = now;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    // Mıknatısa tıklandı mı?
    if (x >= magnetX - 20 && x <= magnetX + magnetWidth + 20) {
      setIsDragging(true);
      lastPosRef.current = x;
      lastTimeRef.current = Date.now();
      velocityRef.current = 0;
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    
    // Mıknatısı ortala
    let newMagX = x - magnetWidth / 2;
    // Sınırlar
    if (newMagX < 50) newMagX = 50;
    if (newMagX > canvas.width - magnetWidth - 50) newMagX = canvas.width - magnetWidth - 50;

    setMagnetX(newMagX);
    updateVelocity(newMagX);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

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
            onClick={() => { setMagnetX(150); setCurrent(0); velocityRef.current = 0; }}
            className="btn-interactive"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Konumu Sıfırla
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Manyetik İndüksiyon (Faraday Yasası)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Mıknatısı bobine doğru sürükleyerek manyetik akı değişimi oluşturun ve indüksiyon akımını gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '450px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Anlık Akım (A): </span>
                  <span style={{ fontWeight: 700, color: Math.abs(current) > 0.5 ? '#38bdf8' : '#fff' }}>{current.toFixed(2)} mA</span>
                </div>
              </div>

              <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'none' }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Mıknatıs Hızı (v): </span>
                  <span style={{ fontWeight: 700 }}>{Math.abs(velocityRef.current).toFixed(2)} m/s</span>
                </div>
              </div>

              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block', cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              />
              
              {!isDragging && (
                <div style={{ position: 'absolute', top: '50%', left: magnetX + 60, transform: 'translate(-50%, -100px)', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'bounce 2s infinite' }}>
                  <div style={{ background: '#f43f5e', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Beni Sürükle</div>
                  <div style={{ width: 2, height: 20, background: '#f43f5e', marginTop: 4 }}></div>
                </div>
              )}
            </div>

            {/* Bilgi Kartı */}
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Magnet size={32} color="#38bdf8" />
               <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Faraday ve Lenz Yasası</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bir devrede oluşan indüksiyon emk'sı (voltajı), devreden geçen manyetik akının zamana göre değişim hızına (v) eşittir. Mıknatıs durduğunda (v=0) akım oluşmaz.</div>
               </div>
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Kurallar & Analiz</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                  <h4 style={{ margin: 0, color: '#38bdf8', marginBottom: '0.5rem' }}>1. Hareket Şarttır</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Mıknatıs bobin içinde hareketsiz dursa bile akım geçmez. Akım sadece akı <b>değişirken</b> (hareket varken) oluşur.</p>
               </div>

               <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
                  <h4 style={{ margin: 0, color: '#f43f5e', marginBottom: '0.5rem' }}>2. Hız (v) Etkisi</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Mıknatısı ne kadar hızlı sürüklerseniz ampermetredeki sapma (akım şiddeti) o kadar büyük olur.</p>
               </div>

               <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                  <h4 style={{ margin: 0, color: '#10b981', marginBottom: '0.5rem' }}>3. Yön (Lenz Yasası)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Mıknatıs yaklaşırken oluşan akımın yönü, mıknatıs uzaklaşırken oluşan akımın yönüne zıttır. İbre ters yöne sapar.</p>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -100px); }
          50% { transform: translate(-50%, -110px); }
        }
        @media (max-width: 900px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
