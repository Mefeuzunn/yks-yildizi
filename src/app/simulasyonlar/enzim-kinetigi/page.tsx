"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, Dna, Play, Pause } from 'lucide-react';
import Link from 'next/link';

type ParticleType = 'E' | 'S' | 'P' | 'ES'; // Enzim, Substrat, Ürün, Enzim-Substrat Kompleksi

type Particle = {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  denatured?: boolean;
  esTimer?: number; // ES kompleksi çözülme süresi
  targetS_id?: number; // ES kompleksi içindeki substratın ID'si
};

export default function EnzimKinetigiSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [eCount, setECount] = useState(15);
  const [sCount, setSCount] = useState(60);
  const [temp, setTemp] = useState(37); // Sıcaklık
  const [ph, setPh] = useState(7); // pH

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ E: 0, S: 0, P: 0, ES: 0 });

  const particlesRef = useRef<Particle[]>([]);

  const initSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width || 600;
    const h = canvas.height || 400;

    const newParticles: Particle[] = [];
    let idCounter = 0;

    // Enzimler
    for (let i = 0; i < eCount; i++) {
      newParticles.push({
        id: idCounter++,
        type: 'E',
        x: Math.random() * (w - 60) + 30,
        y: Math.random() * (h - 60) + 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: 18,
        denatured: false
      });
    }

    // Substratlar
    for (let i = 0; i < sCount; i++) {
      newParticles.push({
        id: idCounter++,
        type: 'S',
        x: Math.random() * (w - 20) + 10,
        y: Math.random() * (h - 20) + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 8,
      });
    }

    particlesRef.current = newParticles;
    setStats({ E: eCount, S: sCount, P: 0, ES: 0 });
    setIsRunning(false);
  };

  useEffect(() => {
    // Canvas initial size
    if (canvasRef.current && canvasRef.current.parentElement) {
      canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
      canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      initSimulation();
    }
  }, [eCount, sCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const w = canvas.width;
    const h = canvas.height;

    const render = () => {
      // --- FİZİK GÜNCELLEMELERİ ---
      if (isRunning) {
        // Çevresel Faktörlerin Enzime Etkisi (Denatürasyon)
        const isDenatured = (t: number, p: number) => {
          return t > 55 || p < 4 || p > 10;
        };
        const currentDenatured = isDenatured(temp, ph);

        // Sıcaklık Kinetik Enerjiyi (Hızı) etkiler
        // 0C'de hız çok düşük, 40C'de optimum, 60C'de çok hızlı ama denatüre
        const speedFactor = Math.max(0.2, temp / 20);

        const nextParticles: Particle[] = [];
        let curE = 0, curS = 0, curP = 0, curES = 0;

        particlesRef.current.forEach(p => {
           if (p.type === 'E') {
              p.denatured = currentDenatured;
           }

           // Hareket
           if (p.type !== 'ES' || (p.type === 'ES' && p.radius === 18)) { 
              // ES de enzim gibi hareket eder, substrat ona bağlıdır
              p.x += p.vx * speedFactor;
              p.y += p.vy * speedFactor;
           }

           // Duvar Çarpışmaları
           if (p.x - p.radius < 0) { p.x = p.radius; p.vx *= -1; }
           if (p.x + p.radius > w) { p.x = w - p.radius; p.vx *= -1; }
           if (p.y - p.radius < 0) { p.y = p.radius; p.vy *= -1; }
           if (p.y + p.radius > h) { p.y = h - p.radius; p.vy *= -1; }
        });

        // Çarpışmalar ve Reaksiyonlar
        for (let i = 0; i < particlesRef.current.length; i++) {
           const p1 = particlesRef.current[i];
           if (p1.type === 'E' && !p1.denatured) {
              for (let j = 0; j < particlesRef.current.length; j++) {
                 const p2 = particlesRef.current[j];
                 if (p2.type === 'S') {
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Çarpışma: Enzim ve Substrat kompleks oluşturur
                    if (dist < p1.radius + p2.radius) {
                       p1.type = 'ES';
                       p1.esTimer = 30; // 30 frame sürer (yaklaşık 0.5 sn)
                       p1.targetS_id = p2.id;
                       p2.type = 'ES'; // Artık serbest değil
                       break; // Bir enzim aynı anda tek substrat alır
                    }
                 }
              }
           }
        }

        // ES Kompleksi Ayrışması (Ürün oluşumu)
        particlesRef.current.forEach(p => {
           if (p.type === 'ES' && p.radius === 18) { // Sadece Enzim olan ES'yi işle
              if (p.esTimer && p.esTimer > 0) {
                 p.esTimer--;
                 // Bağlı substratı enzime kilitle (görsel olarak)
                 const boundS = particlesRef.current.find(s => s.id === p.targetS_id);
                 if (boundS) {
                    boundS.x = p.x;
                    boundS.y = p.y;
                 }
              } else {
                 // Süre doldu, Ürün olarak serbest bırak
                 p.type = 'E'; // Enzim tekrar serbest
                 const boundS = particlesRef.current.find(s => s.id === p.targetS_id);
                 if (boundS) {
                    boundS.type = 'P'; // Ürün oldu
                    // Ürün enzimi terk eder (Ters yöne doğru hız)
                    boundS.vx = p.vx * -2;
                    boundS.vy = p.vy * -2;
                    boundS.x = p.x + p.vx * 10;
                    boundS.y = p.y + p.vy * 10;
                 }
              }
           }
        });

        // İstatistik hesaplama
        particlesRef.current.forEach(p => {
           if (p.type === 'E') curE++;
           if (p.type === 'S') curS++;
           if (p.type === 'P') curP++;
           if (p.type === 'ES' && p.radius === 18) curES++;
        });

        setStats({ E: curE, S: curS, P: curP, ES: curES });
      }

      // --- ÇİZİM ---
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Parçacık çizimleri
      particlesRef.current.forEach(p => {
         if (p.type === 'E' || (p.type === 'ES' && p.radius === 18)) {
            // Enzim (Pacman şeklinde aktif bölge)
            ctx.fillStyle = p.denatured ? '#64748b' : '#38bdf8'; // Denatüre ise gri
            ctx.beginPath();
            
            // Eğer ES ise ağzı kapalı, değilse açık (Aktif bölge)
            if (p.type === 'ES' || p.denatured) {
               ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            } else {
               // Pacman ağzı
               const angle = Math.atan2(p.vy, p.vx);
               ctx.arc(p.x, p.y, p.radius, angle + 0.5, angle + 2 * Math.PI - 0.5);
               ctx.lineTo(p.x, p.y);
            }
            ctx.fill();

            // Denatüre olduysa üzerine X çiz
            if (p.denatured) {
               ctx.strokeStyle = '#ef4444';
               ctx.lineWidth = 2;
               ctx.beginPath();
               ctx.moveTo(p.x - 8, p.y - 8); ctx.lineTo(p.x + 8, p.y + 8);
               ctx.moveTo(p.x + 8, p.y - 8); ctx.lineTo(p.x - 8, p.y + 8);
               ctx.stroke();
            }
         } else if (p.type === 'S') {
            // Substrat (Kare veya üçgen gibi farklı şekil olabilir, basit yuvarlak yapalım)
            ctx.fillStyle = '#10b981'; // Yeşil
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
         } else if (p.type === 'P') {
            // Ürün (Bölünmüş veya renk değiştirmiş)
            ctx.fillStyle = '#f59e0b'; // Turuncu
            ctx.beginPath();
            ctx.rect(p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
            ctx.fill();
         }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, temp, ph]);

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
            <RefreshCw size={16} /> Karışımı Yenile
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Enzim Kinetiği</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sıcaklık ve pH'ın enzimlerin üç boyutlu yapısına ve tepkime hızına olan etkisini inceleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Analiz Panelleri */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8', marginBottom: '0.5rem' }}>Serbest Enzim (E)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>{stats.E}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '0.5rem' }}>Substrat (S)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.S}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#f43f5e', marginBottom: '0.5rem' }}>E-S Kompleksi</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f43f5e' }}>{stats.ES}</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '0.5rem' }}>Ürün (P)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.P}</div>
              </div>
            </div>

            {/* Canvas Container */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '450px', position: 'relative' }}>
              
              {(temp > 55 || ph < 4 || ph > 10) && (
                <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '20px', fontWeight: 600, zIndex: 10 }}>
                   ⚠️ Enzimler Denatüre Oldu! (Aktif bölge bozuldu)
                </div>
              )}

              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#f43f5e" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Ortam Şartları</h3>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : '#10b981',
                color: isRunning ? '#ef4444' : '#fff',
                fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {isRunning ? <Pause size={20}/> : <Play size={20}/>}
              {isRunning ? 'Tepkimeyi Durdur' : 'Tepkimeyi Başlat'}
            </button>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sıcaklık (T)</label>
                <span style={{ fontSize: '0.9rem', color: temp > 55 ? '#ef4444' : '#fff', fontWeight: 700 }}>{temp} °C</span>
              </div>
              <input 
                type="range" min="0" max="100" step="1" 
                value={temp} 
                onChange={(e) => setTemp(Number(e.target.value))} 
                style={{ width: '100%', accentColor: temp > 55 ? '#ef4444' : '#f43f5e' }} 
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>0°C (Yavaş)</span>
                <span>37°C (Optimum)</span>
                <span>55°C+ (Denatürasyon)</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ortam pH'ı</label>
                <span style={{ fontSize: '0.9rem', color: (ph < 4 || ph > 10) ? '#ef4444' : '#fff', fontWeight: 700 }}>pH {ph}</span>
              </div>
              <input 
                type="range" min="1" max="14" step="1" 
                value={ph} 
                onChange={(e) => setPh(Number(e.target.value))} 
                style={{ width: '100%', accentColor: (ph < 4 || ph > 10) ? '#ef4444' : '#38bdf8' }} 
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Asidik</span>
                <span>Nötr (7)</span>
                <span>Bazik</span>
              </div>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <Dna size={24} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.25rem' }}>Anahtar-Kilit Uyumu</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Enzim (Mavi) ve Substrat (Yeşil) birleşerek E-S kompleksi oluşturur. Yüksek sıcaklık veya aşırı uç pH değerleri enzimin aktif bölgesinin şeklini bozar (Denatürasyon) ve tepkime durur.
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
