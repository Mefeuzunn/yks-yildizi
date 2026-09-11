"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Settings, FlaskConical } from 'lucide-react';
import Link from 'next/link';

export default function TitrasyonSimulation() {
  // Constants
  const vFlask = 50; // ml
  const [mFlask, setMFlask] = useState(0.1); // Molarite (Erlen)
  const [mBurette, setMBurette] = useState(0.1); // Molarite (Büret)
  
  const [typeFlask, setTypeFlask] = useState<'acid' | 'base'>('acid'); // Erlendeki madde
  const [vAdded, setVAdded] = useState(0); // Eklenen hacim (ml)
  const [isRunning, setIsRunning] = useState(false);

  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const vAddedRef = useRef(0);

  // pH Hesaplama (Kuvvetli Asit / Kuvvetli Baz)
  const calculatePH = (vAdded: number) => {
    const molesFlask = mFlask * vFlask;
    const molesAdded = mBurette * vAdded;
    const totalVolume = vFlask + vAdded;

    if (typeFlask === 'acid') {
      if (molesFlask > molesAdded) {
        const concH = (molesFlask - molesAdded) / totalVolume;
        return -Math.log10(concH);
      } else if (molesAdded > molesFlask) {
        const concOH = (molesAdded - molesFlask) / totalVolume;
        return 14 - (-Math.log10(concOH));
      } else {
        return 7.0;
      }
    } else {
      if (molesFlask > molesAdded) {
        const concOH = (molesFlask - molesAdded) / totalVolume;
        return 14 - (-Math.log10(concOH));
      } else if (molesAdded > molesFlask) {
        const concH = (molesAdded - molesFlask) / totalVolume;
        return -Math.log10(concH);
      } else {
        return 7.0;
      }
    }
  };

  const currentPH = calculatePH(vAdded);

  // Fenolftalein Rengi (pH < 8.2 renksiz/beyazımsı, pH > 10 pembe)
  const getIndicatorColor = (ph: number) => {
    if (ph < 8.2) return 'rgba(255, 255, 255, 0.1)'; // Asidik
    if (ph >= 8.2 && ph < 10) {
      // Geçiş (0.1 den 0.6 ya alpha)
      const ratio = (ph - 8.2) / (10 - 8.2);
      return `rgba(236, 72, 153, ${0.1 + ratio * 0.5})`; // Pembeleşiyor
    }
    return 'rgba(236, 72, 153, 0.6)'; // Bazik (Pembe)
  };

  // Metil Oranj Rengi (İsterseniz eklenebilir, şimdilik fenolftalein)

  // Damlatma motoru
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setVAdded(prev => {
          const next = prev + 0.2; // saniyede 10 kere, 0.2 ml = 2 ml/sn
          if (next >= 100) {
            setIsRunning(false);
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Grafik Çizimi
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<=14; i+=2) {
      const y = h - (i / 14) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px sans-serif';
      ctx.fillText(i.toString(), 2, y - 2);
    }
    for(let i=0; i<=100; i+=20) {
      const x = (i / 100) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      if (i > 0) ctx.fillText(i.toString(), x + 2, h - 2);
    }

    // Eğri
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let v = 0; v <= vAdded; v += 0.5) {
      const ph = calculatePH(v);
      const x = (v / 100) * w;
      const y = h - (ph / 14) * h;
      if (v === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Dönüm noktası (pH=7) işaretleme
    // Eşdeğerlik hacmi: M1V1 = M2V2 -> V2 = (M1*V1)/M2
    const vEq = (mFlask * vFlask) / mBurette;
    if (vAdded >= vEq) {
      const eqX = (vEq / 100) * w;
      const eqY = h - (7 / 14) * h;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(eqX, eqY, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillText('Dönüm Nok.', eqX + 10, eqY);
    }

    // Geçerli nokta
    const curX = (vAdded / 100) * w;
    const curY = h - (currentPH / 14) * h;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(curX, curY, 4, 0, Math.PI*2); ctx.fill();

  }, [vAdded, mFlask, mBurette, typeFlask, currentPH]);

  const reset = () => {
    setIsRunning(false);
    setVAdded(0);
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
            onClick={reset}
            className="btn-interactive"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} /> Sıfırla
          </button>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Asit-Baz Titrasyonu</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Fenolftalein indikatörü kullanarak kuvvetli asit/baz nötralleşme tepkimelerini ve titrasyon eğrisini (pH grafiği) oluşturun.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Üst Paneller */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Erlen (Alttaki) Madde</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: typeFlask === 'acid' ? '#ef4444' : '#3b82f6' }}>
                  {typeFlask === 'acid' ? 'Kuvvetli Asit (HCl)' : 'Kuvvetli Baz (NaOH)'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Eklenen Hacim</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{vAdded.toFixed(1)} ml</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Anlık pH</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentPH < 7 ? '#ef4444' : currentPH > 7 ? '#3b82f6' : '#10b981' }}>
                  {currentPH.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Görsel + Grafik */}
            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1rem' }}>
              
              {/* Çizim Alanı (Büret ve Erlen) */}
              <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', height: '400px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Büret */}
                <div style={{ position: 'absolute', top: '20px', width: '30px', height: '200px', border: '2px solid rgba(255,255,255,0.3)', borderTop: 'none', borderRadius: '0 0 4px 4px', overflow: 'hidden' }}>
                  {/* Sıvı */}
                  <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${100 - vAdded}%`, background: typeFlask === 'acid' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)', transition: 'height 0.1s' }}></div>
                  {/* Damla (Eğer çalışıyorsa) */}
                  {isRunning && (
                    <div style={{ position: 'absolute', bottom: '-20px', left: '12px', width: '6px', height: '10px', background: typeFlask === 'acid' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(239, 68, 68, 0.6)', borderRadius: '50%', animation: 'drop 0.2s infinite linear' }}></div>
                  )}
                </div>

                {/* Vana */}
                <div style={{ position: 'absolute', top: '220px', width: '40px', height: '8px', background: isRunning ? '#10b981' : '#ef4444', borderRadius: '4px' }}></div>
                <div style={{ position: 'absolute', top: '228px', width: '6px', height: '20px', background: 'rgba(255,255,255,0.3)' }}></div>

                {/* Erlen */}
                <div style={{ position: 'absolute', bottom: '20px', width: '120px', height: '120px' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <path d="M45,20 L45,40 L20,110 A10,10 0 0,0 30,120 L90,120 A10,10 0 0,0 100,110 L75,40 L75,20 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4"/>
                    {/* Sıvı */}
                    <path d="M30,80 L90,80 L97,105 A5,5 0 0,1 92,115 L28,115 A5,5 0 0,1 23,105 Z" fill={getIndicatorColor(currentPH)} style={{ transition: 'fill 0.3s' }}/>
                    {/* Hacim Artışı */}
                    <path d={`M${30 - (vAdded*0.1)},${80 - (vAdded*0.3)} L${90 + (vAdded*0.1)},${80 - (vAdded*0.3)} L90,80 L30,80 Z`} fill={getIndicatorColor(currentPH)} style={{ transition: 'fill 0.3s' }}/>
                  </svg>
                </div>

                <style>{`
                  @keyframes drop {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(80px); opacity: 0; }
                  }
                `}</style>
              </div>

              {/* Grafik Alanı */}
              <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', height: '400px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'center' }}>Titrasyon Eğrisi (Eklenen Hacim vs pH)</div>
                <canvas ref={graphCanvasRef} width="450" height="340" style={{ width: '100%', height: 'calc(100% - 20px)' }} />
              </div>

            </div>
          </div>

          {/* Sağ Panel */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#10b981" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Titrasyon Ayarları</h3>
            </div>

            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={vAdded >= 100}
              style={{
                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                background: vAdded >= 100 ? '#475569' : isRunning ? 'rgba(239, 68, 68, 0.2)' : '#10b981',
                color: vAdded >= 100 ? '#94a3b8' : isRunning ? '#ef4444' : '#000',
                fontSize: '1.1rem', fontWeight: 600, cursor: vAdded >= 100 ? 'not-allowed' : 'pointer', marginBottom: '2rem',
                transition: 'all 0.2s'
              }}
            >
              {vAdded >= 100 ? 'Titrasyon Bitti' : isRunning ? 'Vanayı Kapat' : 'Vanayı Aç (Damlat)'}
            </button>

            {/* Madde Seçimi */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Erlendeki Madde (Alttaki)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => { setTypeFlask('acid'); reset(); }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: typeFlask === 'acid' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', background: typeFlask === 'acid' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  Asit (HCl)
                </button>
                <button 
                  onClick={() => { setTypeFlask('base'); reset(); }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: typeFlask === 'base' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)', background: typeFlask === 'base' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}
                >
                  Baz (NaOH)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Erlen Derişimi (M1)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{mFlask} M</span>
              </div>
              <input type="range" min="0.05" max="0.5" step="0.05" value={mFlask} onChange={(e) => { setMFlask(Number(e.target.value)); reset(); }} style={{ width: '100%', accentColor: '#10b981' }} disabled={isRunning || vAdded > 0} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Büret Derişimi (M2)</label>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{mBurette} M</span>
              </div>
              <input type="range" min="0.05" max="0.5" step="0.05" value={mBurette} onChange={(e) => { setMBurette(Number(e.target.value)); reset(); }} style={{ width: '100%', accentColor: '#10b981' }} disabled={isRunning || vAdded > 0} />
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <FlaskConical size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#10b981', marginBottom: '0.25rem' }}>Dönüm Noktası</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  pH'ın tam 7 olduğu an, asit ve bazın mol sayılarının eşitlendiği andır (M₁V₁ = M₂V₂). İndikatör (Fenolftalein) bu noktadan hemen sonra pembeleşir.
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
