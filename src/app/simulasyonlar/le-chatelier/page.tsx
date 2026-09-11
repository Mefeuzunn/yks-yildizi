"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Info, Settings, FlaskConical } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Sabitler
const INITIAL_TEMP = 400; // Kelvin
const INITIAL_VOL = 10;   // Litre
const REACTION_STR = "N₂ (g) + 3H₂ (g) ⇌ 2NH₃ (g) + Isı";

export default function LeChatelierSimulation() {
  const [temperature, setTemperature] = useState(INITIAL_TEMP); // 300K - 800K
  const [volume, setVolume] = useState(INITIAL_VOL); // 5L - 20L
  
  // Derişim durumları (Mole sayıları: n)
  // Basit bir Denge (K_c) simülasyon modeli:
  // Egzotermik tepkime: T artarsa NH3 azalır, N2 ve H2 artar.
  // Hacim (V) azalırsa P artar, denge sağa (az mol olan yöne) kayar: NH3 artar.
  
  const [moles, setMoles] = useState({ n2: 10, h2: 30, nh3: 20 });
  const [prevMoles, setPrevMoles] = useState({ n2: 10, h2: 30, nh3: 20 });
  const [shiftDirection, setShiftDirection] = useState<'right' | 'left' | 'none'>('none');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  // Denge Hesaplama Simülasyonu (Pseudo-Chemical Equilibrium)
  useEffect(() => {
    // Referans değerler üzerinden değişim yüzdesi hesabı
    const tempRatio = temperature / INITIAL_TEMP; 
    const volRatio = volume / INITIAL_VOL; 

    // Egzotermik olduğu için T artarsa Denge Sola (Reaktiflere) kayar.
    // T artışı = nh3 azalır
    const tempEffectOnProduct = 1 / Math.pow(tempRatio, 1.5); 

    // Hacim artarsa (Basınç azalır), mol sayısının çok olduğu yöne (Sola) kayar.
    // Hacim azalırsa (Basınç artar), mol sayısının az olduğu yöne (Sağa) kayar.
    const pressureEffectOnProduct = 1 / Math.pow(volRatio, 1.2); 

    // Yeni NH3 molü
    const baseNH3 = 20;
    let newNH3 = baseNH3 * tempEffectOnProduct * pressureEffectOnProduct;
    // Maksimum / Minimum sınırlar
    newNH3 = Math.max(2, Math.min(50, newNH3));

    // N2 ve H2 stokiometrik olarak değişir: 
    // Denge bağıntısı: N2 + 3H2 <-> 2NH3
    // Eğer NH3 20'den (yeni)'ye değiştiyse, fark = newNH3 - 20
    const diff = newNH3 - 20;
    
    // N2 = baseN2 - diff/2
    let newN2 = 10 - (diff / 2);
    // H2 = baseH2 - (3*diff)/2
    let newH2 = 30 - (3 * diff) / 2;

    // Sınırlar
    newN2 = Math.max(1, newN2);
    newH2 = Math.max(3, newH2);

    setPrevMoles(moles);
    setMoles({ n2: newN2, h2: newH2, nh3: newNH3 });

    if (newNH3 > moles.nh3 + 0.5) setShiftDirection('right');
    else if (newNH3 < moles.nh3 - 0.5) setShiftDirection('left');
    else setShiftDirection('none');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temperature, volume]);

  // Particle Engine for Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Initialize Particles based on Moles
    // Görsel kalabalığı önlemek için mol sayısını bir katsayı ile çarpıyoruz
    const targetN2 = Math.floor(moles.n2 * 2);
    const targetH2 = Math.floor(moles.h2 * 2);
    const targetNH3 = Math.floor(moles.nh3 * 2);

    let particles = particlesRef.current;

    // Fonksiyonlar
    const createParticle = (type: 'n2' | 'h2' | 'nh3') => {
      // Hız, sıcaklıkla doğru orantılı
      const speedBase = (temperature / 300);
      return {
        type,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4 * speedBase,
        vy: (Math.random() - 0.5) * 4 * speedBase,
        radius: type === 'n2' ? 8 : type === 'h2' ? 4 : 10,
        color: type === 'n2' ? '#3b82f6' : type === 'h2' ? '#e2e8f0' : '#8b5cf6'
      };
    };

    // Mevcut tanecik sayılarını ayarla (geçiş efektli)
    const currentN2 = particles.filter(p => p.type === 'n2').length;
    const currentH2 = particles.filter(p => p.type === 'h2').length;
    const currentNH3 = particles.filter(p => p.type === 'nh3').length;

    // N2 Ekle/Çıkar
    if (currentN2 < targetN2) {
      for (let i = 0; i < targetN2 - currentN2; i++) particles.push(createParticle('n2'));
    } else if (currentN2 > targetN2) {
      let removed = 0;
      particles = particles.filter(p => {
        if (p.type === 'n2' && removed < currentN2 - targetN2) { removed++; return false; }
        return true;
      });
    }

    // H2 Ekle/Çıkar
    if (currentH2 < targetH2) {
      for (let i = 0; i < targetH2 - currentH2; i++) particles.push(createParticle('h2'));
    } else if (currentH2 > targetH2) {
      let removed = 0;
      particles = particles.filter(p => {
        if (p.type === 'h2' && removed < currentH2 - targetH2) { removed++; return false; }
        return true;
      });
    }

    // NH3 Ekle/Çıkar
    if (currentNH3 < targetNH3) {
      for (let i = 0; i < targetNH3 - currentNH3; i++) particles.push(createParticle('nh3'));
    } else if (currentNH3 > targetNH3) {
      let removed = 0;
      particles = particles.filter(p => {
        if (p.type === 'nh3' && removed < currentNH3 - targetNH3) { removed++; return false; }
        return true;
      });
    }

    particlesRef.current = particles;

    let animationFrameId: number;

    const render = () => {
      // Hacim görselleştirmesi (Piston yüksekliği)
      // Max hacim 20L (tam ekran), min 5L (çeyrek ekran)
      const containerHeight = (volume / 20) * canvas.height;
      const pistonY = canvas.height - containerHeight;

      // Siyah Arka Plan
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Gaz Kabı (Cam)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, pistonY, canvas.width, containerHeight);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, pistonY, canvas.width, containerHeight);

      // Piston (Üst Kapak)
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, pistonY - 10, canvas.width, 10);
      // Piston kolu
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(canvas.width / 2 - 5, 0, 10, pistonY - 10);

      const speedBase = (temperature / 300);

      // Partikülleri Güncelle ve Çiz
      particlesRef.current.forEach(p => {
        // Hızları sıcaklığa göre dinamik güncelle
        const currentSpeed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const targetSpeed = 2 * speedBase;
        
        // Hız değişimi çok ani olmasın
        if (currentSpeed > 0.1) {
          p.vx = (p.vx / currentSpeed) * targetSpeed;
          p.vy = (p.vy / currentSpeed) * targetSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Duvarlardan Sekme (Hacim sınırları içinde)
        if (p.x - p.radius < 0) { p.x = p.radius; p.vx *= -1; }
        if (p.x + p.radius > canvas.width) { p.x = canvas.width - p.radius; p.vx *= -1; }
        
        if (p.y - p.radius < pistonY) { p.y = pistonY + p.radius; p.vy *= -1; }
        if (p.y + p.radius > canvas.height) { p.y = canvas.height - p.radius; p.vy *= -1; }

        // Çizim
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();

        // Eğer NH3 ise üçgenimsi yapı çiz (Görsel Zenginlik)
        if (p.type === 'nh3') {
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath(); ctx.arc(p.x - 5, p.y + 3, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x + 5, p.y + 3, 3, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x, p.y - 5, 3, 0, Math.PI*2); ctx.fill();
        } else if (p.type === 'n2') {
          // İkili bağ görseli
          ctx.beginPath(); ctx.arc(p.x - 3, p.y, p.radius, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x + 3, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        } else if (p.type === 'h2') {
          ctx.beginPath(); ctx.arc(p.x - 2, p.y, p.radius, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(p.x + 2, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        }
      });

      // Ateş Efekti (Sıcaklığa göre)
      if (temperature > 300) {
        const fireAlpha = (temperature - 300) / 500; // max alpha at 800K
        ctx.fillStyle = `rgba(239, 68, 68, ${fireAlpha * 0.3})`;
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Alevler
        for(let i=0; i<5; i++) {
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.2 * i + 20, canvas.height);
          ctx.lineTo(canvas.width * 0.2 * i + 30 + Math.random()*20, canvas.height - 20 - Math.random() * 20 * fireAlpha);
          ctx.lineTo(canvas.width * 0.2 * i + 40, canvas.height);
          ctx.fillStyle = `rgba(245, 158, 11, ${fireAlpha * 0.8})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [moles, temperature, volume]);

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
              onClick={() => { setTemperature(INITIAL_TEMP); setVolume(INITIAL_VOL); }}
              className="btn-interactive"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={16} /> Sıfırla
            </button>
          </div>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Le Chatelier Prensibi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Kimyasal dengede basınç (hacim) ve sıcaklık etkilerini Haber-Bosch prosesi üzerinden gözlemleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Simülasyon Ekranı */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Tepkime Denklemi */}
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#3b82f6' }}>N₂</span> + <span style={{ color: '#e2e8f0' }}>3H₂</span> 
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 1rem' }}>
                  <motion.div 
                    animate={{ x: shiftDirection === 'right' ? 10 : 0, opacity: shiftDirection === 'right' ? 1 : 0.3 }}
                    style={{ fontSize: '1.2rem', color: '#10b981' }}
                  >
                    ⟶
                  </motion.div>
                  <motion.div 
                    animate={{ x: shiftDirection === 'left' ? -10 : 0, opacity: shiftDirection === 'left' ? 1 : 0.3 }}
                    style={{ fontSize: '1.2rem', color: '#ef4444' }}
                  >
                    ⟵
                  </motion.div>
                </div>

                <span style={{ color: '#8b5cf6' }}>2NH₃</span> + <span style={{ color: '#f59e0b' }}>Isı</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Egzotermik Tepkime (ΔH &lt; 0)</div>
            </div>

            {/* Canvas Piston Konteyneri */}
            <div style={{ background: '#000', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px' }}>
              <canvas 
                ref={canvasRef} 
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

            {/* Derişim Barları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{moles.n2.toFixed(1)} mol</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>N₂ Miktarı</div>
              </div>
              <div style={{ background: 'rgba(226, 232, 240, 0.1)', border: '1px solid rgba(226, 232, 240, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0' }}>{moles.h2.toFixed(1)} mol</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>H₂ Miktarı</div>
              </div>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8b5cf6' }}>{moles.nh3.toFixed(1)} mol</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>NH₃ Miktarı</div>
              </div>
            </div>
          </div>

          {/* Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Ortam Şartları</h3>
            </div>

            {/* Slider: Sıcaklık */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Sıcaklık (T)</label>
                <span style={{ fontSize: '0.9rem', color: temperature > 500 ? '#ef4444' : '#fff', fontWeight: 700 }}>{temperature} K</span>
              </div>
              <input 
                type="range" 
                min="300" 
                max="800" 
                step="10"
                value={temperature} 
                onChange={(e) => setTemperature(Number(e.target.value))}
                style={{ width: '100%', accentColor: temperature > 500 ? '#ef4444' : '#f59e0b' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Soğuk (300K)</span>
                <span>Sıcak (800K)</span>
              </div>
            </div>

            {/* Slider: Hacim */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hacim (V)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{volume.toFixed(1)} L</span>
              </div>
              <input 
                type="range" 
                min="5.0" 
                max="20.0" 
                step="0.5"
                value={volume} 
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>Dar (Basınçlı)</span>
                <span>Geniş (Rahat)</span>
              </div>
            </div>

            {/* Bilgi Kutusu */}
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <FlaskConical size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Sistem Ne Yapıyor?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {shiftDirection === 'right' && "Şartlar değişti: Sistem stresi azaltmak için ÜRÜNLER (Sağ) yönüne kayıyor. NH₃ üretimi artıyor!"}
                  {shiftDirection === 'left' && "Şartlar değişti: Sistem stresi azaltmak için GİRENLER (Sol) yönüne kayıyor. NH₃ parçalanıyor!"}
                  {shiftDirection === 'none' && "Sistem şu an kimyasal dengede. Ortam şartlarını değiştirerek dengeyi bozabilirsiniz."}
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
