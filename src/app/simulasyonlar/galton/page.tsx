"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, BarChart2 } from 'lucide-react';
import Link from 'next/link';

// Simülasyon ayarları
const ROWS = 10;
const BINS = ROWS + 1;
const BALL_RADIUS = 4;
const PEG_RADIUS = 3;
const SPACING_Y = 25;
const SPACING_X = 25;

type Ball = {
  id: number;
  x: number;
  y: number;
  path: number[]; // 1 for right, -1 for left
  currentRow: number;
  targetX: number;
  targetY: number;
  inBin: boolean;
  binIndex: number;
  color: string;
};

export default function GaltonSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [binCounts, setBinCounts] = useState<number[]>(new Array(BINS).fill(0));
  const [speed, setSpeed] = useState(5); // Balls per second

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextBallId = useRef(0);
  const lastSpawnTime = useRef(0);

  // Top renk paleti
  const colors = ['#38bdf8', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const w = canvas.width;
    const h = canvas.height;
    
    const startX = w / 2;
    const startY = 40;

    let animationFrameId: number;

    const render = (time: number) => {
      // Arka plan
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Çivileri (Pegs) çiz
      ctx.fillStyle = '#475569';
      for (let r = 0; r < ROWS; r++) {
        const pegsInRow = r + 1;
        const rowWidth = (pegsInRow - 1) * SPACING_X;
        const rowStartX = startX - rowWidth / 2;
        const rowY = startY + r * SPACING_Y;

        for (let p = 0; p < pegsInRow; p++) {
          ctx.beginPath();
          ctx.arc(rowStartX + p * SPACING_X, rowY, PEG_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Kutuları (Bins) çiz
      const binsY = startY + ROWS * SPACING_Y + 10;
      const totalBinsWidth = ROWS * SPACING_X;
      const binsStartX = startX - totalBinsWidth / 2;
      
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      for (let b = 0; b <= BINS; b++) {
        ctx.beginPath();
        ctx.moveTo(binsStartX + b * SPACING_X - SPACING_X/2, binsY);
        ctx.lineTo(binsStartX + b * SPACING_X - SPACING_X/2, h - 20);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(binsStartX - SPACING_X/2, h - 20);
      ctx.lineTo(binsStartX + BINS * SPACING_X - SPACING_X/2, h - 20);
      ctx.stroke();

      // Bin içerik seviyelerini histogram olarak çiz (Arka planda hafif silüet)
      const maxCount = Math.max(1, ...binCounts);
      for (let b = 0; b < BINS; b++) {
        const binHeight = (binCounts[b] / maxCount) * 100; // max 100px height for histogram preview
        ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.fillRect(binsStartX + b * SPACING_X - SPACING_X/2 + 2, h - 20 - binHeight, SPACING_X - 4, binHeight);
        
        // Sayıyı yaz
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(binCounts[b].toString(), binsStartX + b * SPACING_X, h - 5);
      }

      // Topları spawn et
      if (isRunning && time - lastSpawnTime.current > 1000 / speed) {
        lastSpawnTime.current = time;
        const path: number[] = [];
        let rights = 0;
        for (let i = 0; i < ROWS; i++) {
          const isRight = Math.random() > 0.5;
          path.push(isRight ? 1 : -1);
          if (isRight) rights++;
        }

        setBalls(prev => [...prev, {
          id: nextBallId.current++,
          x: startX,
          y: startY - 20, // drop from slightly above
          path,
          currentRow: 0,
          targetX: startX,
          targetY: startY,
          inBin: false,
          binIndex: rights, // Number of right turns determines the bin
          color: colors[Math.floor(Math.random() * colors.length)]
        }]);
      }

      // Topları güncelle ve çiz
      setBalls(prevBalls => {
        const newCounts = [...binCounts];
        let countsChanged = false;

        const updatedBalls = prevBalls.map(ball => {
          if (ball.inBin) return ball;

          // Animasyon hızı
          const fallSpeed = 3; 

          // Hedefe doğru ilerle
          const dx = ball.targetX - ball.x;
          const dy = ball.targetY - ball.y;
          const dist = Math.hypot(dx, dy);

          if (dist < fallSpeed) {
            ball.x = ball.targetX;
            ball.y = ball.targetY;
            
            // Hedefe ulaştı, sıradaki hedefi belirle
            if (ball.currentRow < ROWS) {
              const dir = ball.path[ball.currentRow];
              ball.targetX += (dir * SPACING_X) / 2;
              ball.targetY += SPACING_Y;
              ball.currentRow++;
            } else if (ball.currentRow === ROWS) {
              // Kutunun içine düşme
              ball.targetY = h - 22 - (newCounts[ball.binIndex] * (BALL_RADIUS * 2));
              ball.currentRow++;
            } else {
              // Bin içine ulaştı
              ball.inBin = true;
              newCounts[ball.binIndex]++;
              countsChanged = true;
            }
          } else {
            ball.x += (dx / dist) * fallSpeed;
            ball.y += (dy / dist) * fallSpeed;
          }

          return ball;
        });

        if (countsChanged) setBinCounts(newCounts);

        // Render Balls
        updatedBalls.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = b.color;
          ctx.fill();
          
          // Parlama
          ctx.beginPath();
          ctx.arc(b.x - 1, b.y - 1, 1, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        });

        // Ekranda çok fazla top birikmesini önle (Performans)
        // Eğer tüm toplar inBin ise, eskileri silebiliriz ama bu simülasyonda görsel olarak kalmaları güzel.
        // Çok aşırı birikirse arrayi kırpabiliriz (Max 500 top)
        if (updatedBalls.length > 800) {
           return updatedBalls.slice(updatedBalls.length - 800);
        }

        return updatedBalls;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, speed, binCounts]); // binCounts is in dependency to update properly but we use state updater inside

  const resetSim = () => {
    setIsRunning(false);
    setBalls([]);
    setBinCounts(new Array(BINS).fill(0));
    nextBallId.current = 0;
  };

  const totalBalls = binCounts.reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={resetSim}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Galton Tahtası (Olasılık)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Çivilerden rastgele sağa veya sola seken topların "Normal Dağılım" (Çan Eğrisi) oluşturmasını gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* İstatistikler */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{totalBalls}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Düşen Top</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6' }}>{Math.max(...binCounts)}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Max Birikim (Tepe)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{ROWS}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Çivi Satırı</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '500px', position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Laboratuvar Kontrolleri</h3>
            </div>

            {/* Başla / Durdur Butonu */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : '#8b5cf6',
                color: isRunning ? '#ef4444' : '#fff',
                fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {isRunning ? 'Durdur' : 'Topları Bırak'}
            </button>

            {/* Slider: Top Düşme Hızı */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Düşme Hızı (Top/sn)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{speed}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }}
              />
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <BarChart2 size={24} color="#8b5cf6" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#8b5cf6', marginBottom: '0.25rem' }}>Normal Dağılım</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Her bir çivi, topun sağa veya sola düşmesi için %50 ihtimal yaratır (Pascal Üçgeni). Yeterince top düştüğünde, istatistiksel olarak ortadaki kutuların daha fazla dolduğu ve mükemmel bir çan eğrisi oluştuğu görülür.
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
