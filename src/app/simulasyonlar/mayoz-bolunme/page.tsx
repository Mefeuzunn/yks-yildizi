"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Info, Dna, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface StageInfo {
  title: string;
  subTitle: string;
  chromosomeCount: string;
  dnaAmount: string;
  description: string;
  keyFeature: string;
}

const STAGES: StageInfo[] = [
  {
    title: '1. İnterfaz (G1, S, G2)',
    subTitle: 'Hazırlık & Replikasyon',
    chromosomeCount: '2n = 4',
    dnaAmount: '4c (2c → 4c iki katına çıkar)',
    description: 'Hücre hacmi artar, organeller çoğalır. S evresinde DNA kendini eşler ve kromatitler oluşur.',
    keyFeature: 'Kromozom sayısı değişmez, DNA miktarı 2 katına çıkar.'
  },
  {
    title: '2. Profaz I',
    subTitle: 'Sinapsis, Tetrat & Krossing-over',
    chromosomeCount: '2n = 4',
    dnaAmount: '4c',
    description: 'Homolog kromozomlar yan yana gelerek 4 kromatitli tetratları oluşturur. Kardeş olmayan kromatitler arasında parça değişimi (krossing-over) gerçekleşir.',
    keyFeature: 'Tür içi çeşitliliğin (varyasyon) en önemli kaynaklarından biridir.'
  },
  {
    title: '3. Metafaz I',
    subTitle: 'Ekvatoral Düzlemde Çift Sıra',
    chromosomeCount: '2n = 4',
    dnaAmount: '4c',
    description: 'Homolog kromozom çiftleri hücrenin ekvatoral düzlemine karşılıklı olarak rastgele dizilir.',
    keyFeature: 'Mitozdan farkı: Kromozomlar tek sıra değil, çiftler halinde dizilir.'
  },
  {
    title: '4. Anafaz I',
    subTitle: 'Homolog Kromozomların Ayrılması',
    chromosomeCount: '2n = 4',
    dnaAmount: '4c',
    description: 'İğ iplikleri kısalır ve homolog kromozomlar kutuplara çekilir. Bağımsız dağılım genetik çeşitliliği artırır.',
    keyFeature: 'Kromozom sayısının 2n’den n’e düşmesinin asıl nedenidir!'
  },
  {
    title: '5. Telofaz I & Sitokinez I',
    subTitle: '2 Haploit Hücre Oluşumu',
    chromosomeCount: 'n = 2 (her hücrede)',
    dnaAmount: '2c (her hücrede)',
    description: 'Çekirdek zarı geçici olarak yeniden oluşur, sitoplazma bölünür. n kromozomlu 2 yavru hücre oluşur.',
    keyFeature: 'Kromozom sayısı yarıya inmiştir, ancak her kromozom hala 2 kromatitlidir.'
  },
  {
    title: '6. Mayoz II (Anafaz II)',
    subTitle: 'Kardeş Kromatitlerin Ayrılması',
    chromosomeCount: 'Geçici olarak 2n = 4',
    dnaAmount: '2c',
    description: 'Sentromerler bölünür ve kardeş kromatitler ayrılarak bağımsız birer kromozom olur.',
    keyFeature: 'Mitoz bölünmeye benzer. Kardeş kromatitler zıt kutuplara çekilir.'
  },
  {
    title: '7. Telofaz II & 4 Gamet',
    subTitle: 'Sonuç: 4 Farklı Sperm/Yumurta',
    chromosomeCount: 'n = 2',
    dnaAmount: 'c',
    description: 'Toplam 4 adet haploit (n) hücre meydana gelir. Krossing-over ve bağımsız dağılım sayesinde 4 hücrenin genetik yapısı da birbirinden farklıdır.',
    keyFeature: 'Döllenmeye hazır n kromozomlu ve c DNA miktarına sahip gametler.'
  }
];

export default function MayozSimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStage, setCurrentStage] = useState<number>(1); // Start at Profaz I
  const [hasCrossingOver, setHasCrossingOver] = useState<boolean>(true);

  const stage = STAGES[currentStage];

  // Draw Cell & Chromosomes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Draw Cytoplasm / Membrane
    ctx.beginPath();
    ctx.ellipse(cx, cy, 210, 140, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Centrosomes (Poles)
    const poleLeftX = cx - 180;
    const poleRightX = cx + 180;

    const drawCentrosome = (x: number, y: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawCentrosome(poleLeftX, cy);
    drawCentrosome(poleRightX, cy);

    // Spindle fibers (iğ iplikleri)
    if (currentStage >= 1 && currentStage <= 5) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let offset = -50; offset <= 50; offset += 25) {
        ctx.beginPath();
        ctx.moveTo(poleLeftX, cy);
        ctx.lineTo(cx, cy + offset);
        ctx.lineTo(poleRightX, cy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Helper to draw single chromosome (X shape or rod)
    const drawChromosome = (
      x: number,
      y: number,
      color: string,
      hasOverlapTip: boolean = false,
      tipColor: string = '#f43f5e',
      rotation: number = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Left Chromatid
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.lineTo(0, 0);
      ctx.lineTo(-10, 22);
      ctx.stroke();

      // Right Chromatid
      ctx.beginPath();
      ctx.moveTo(10, -22);
      ctx.lineTo(0, 0);
      ctx.lineTo(10, 22);
      ctx.stroke();

      // Crossing-over recombinant tip
      if (hasOverlapTip) {
        ctx.strokeStyle = tipColor;
        ctx.beginPath();
        ctx.moveTo(7, 14);
        ctx.lineTo(10, 22);
        ctx.stroke();
      }

      // Centromere dot
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    };

    // Stage specific drawings
    if (currentStage === 0) {
      // Interphase (chromatin thread ball)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const rad = 50 + Math.sin(i) * 20;
        const angle = i * 0.4;
        ctx.lineTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
      }
      ctx.stroke();
    } else if (currentStage === 1) {
      // Profaz I: Tetrads hugging together
      drawChromosome(cx - 16, cy - 20, '#38bdf8', hasCrossingOver, '#f43f5e', 0.1);
      drawChromosome(cx + 16, cy - 20, '#f43f5e', hasCrossingOver, '#38bdf8', -0.1);

      drawChromosome(cx - 16, cy + 35, '#38bdf8', hasCrossingOver, '#f43f5e', -0.08);
      drawChromosome(cx + 16, cy + 35, '#f43f5e', hasCrossingOver, '#38bdf8', 0.08);

      // Label Tetrad & Sinapsis
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = '#facc15';
      ctx.textAlign = 'center';
      ctx.fillText('Tetrat & Sinapsis (Krossing-over)', cx, cy + 85);
    } else if (currentStage === 2) {
      // Metafaz I: Double row equatorial plate
      drawChromosome(cx - 24, cy - 30, '#38bdf8', hasCrossingOver, '#f43f5e', 0);
      drawChromosome(cx + 24, cy - 30, '#f43f5e', hasCrossingOver, '#38bdf8', 0);

      drawChromosome(cx - 24, cy + 30, '#38bdf8', hasCrossingOver, '#f43f5e', 0);
      drawChromosome(cx + 24, cy + 30, '#f43f5e', hasCrossingOver, '#38bdf8', 0);

      // Equatorial dashed line
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 90);
      ctx.lineTo(cx, cy + 90);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (currentStage === 3) {
      // Anafaz I: Homologous pulled apart to poles
      drawChromosome(cx - 80, cy - 25, '#38bdf8', hasCrossingOver, '#f43f5e', 0.2);
      drawChromosome(cx - 80, cy + 25, '#38bdf8', hasCrossingOver, '#f43f5e', -0.2);

      drawChromosome(cx + 80, cy - 25, '#f43f5e', hasCrossingOver, '#38bdf8', -0.2);
      drawChromosome(cx + 80, cy + 25, '#f43f5e', hasCrossingOver, '#38bdf8', 0.2);
    } else if (currentStage === 4) {
      // Telofaz I: 2 nuclei pinching
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 130);
      ctx.lineTo(cx, cy + 130);
      ctx.stroke();
      ctx.setLineDash([]);

      drawChromosome(cx - 90, cy, '#38bdf8', hasCrossingOver, '#f43f5e', 0);
      drawChromosome(cx + 90, cy, '#f43f5e', hasCrossingOver, '#38bdf8', 0);
    } else if (currentStage === 5) {
      // Anafaz II: Chromatids separate
      drawChromosome(cx - 110, cy - 25, '#38bdf8', false);
      drawChromosome(cx - 50, cy - 25, '#38bdf8', hasCrossingOver, '#f43f5e');

      drawChromosome(cx + 50, cy + 25, '#f43f5e', false);
      drawChromosome(cx + 110, cy + 25, '#f43f5e', hasCrossingOver, '#38bdf8');
    } else {
      // 4 Gametes
      const gameteCenters = [
        { x: cx - 110, y: cy - 45, col: '#38bdf8' },
        { x: cx - 110, y: cy + 45, col: '#34d399' },
        { x: cx + 110, y: cy - 45, col: '#f43f5e' },
        { x: cx + 110, y: cy + 45, col: '#a78bfa' }
      ];

      gameteCenters.forEach((g, idx) => {
        ctx.beginPath();
        ctx.arc(g.x, g.y, 35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fill();
        ctx.strokeStyle = g.col;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillStyle = g.col;
        ctx.textAlign = 'center';
        ctx.fillText(`Gamet ${idx + 1} (n=2)`, g.x, g.y + 4);
      });
    }
  }, [currentStage, hasCrossingOver]);

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
                Mayoz Bölünme & Krossing-over
              </h1>
              <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                TYT / AYT BİYOLOJİ
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              Tetrat, sinapsis, krossing-over parça değişimi, kromozom sayısı ve DNA miktarı evre evre simülasyonu.
            </p>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
            disabled={currentStage === 0}
            style={{ padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: currentStage === 0 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, opacity: currentStage === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft size={16} /> Önceki Evre
          </button>
          <button
            onClick={() => setCurrentStage(Math.min(STAGES.length - 1, currentStage + 1))}
            disabled={currentStage === STAGES.length - 1}
            style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(52,211,153,0.2)', border: '1px solid #34d399', color: '#fff', cursor: currentStage === STAGES.length - 1 ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, opacity: currentStage === STAGES.length - 1 ? 0.5 : 1 }}
          >
            Sonraki Evre <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Canvas View */}
        <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Dna size={16} /> {stage.title}
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              {stage.subTitle}
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', background: 'rgba(0,0,0,0.4)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
            <canvas
              ref={canvasRef}
              width={540}
              height={340}
              style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
            />
          </div>

          {/* Metric KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Kromozom Sayısı</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{stage.chromosomeCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>DNA Miktarı</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#facc15' }}>{stage.dnaAmount}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Krossing-over Durumu</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: hasCrossingOver ? '#4ade80' : '#94a3b8' }}>
                {hasCrossingOver ? 'Aktif (Varyasyon Var)' : 'Kapalı (Klon Kardeş)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stage Selector & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Crossing-over Toggle */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Krossing-over Simülasyonu</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Kromozom uçlarında gen takası gerçekleşsin mi?</div>
            </div>
            <button
              onClick={() => setHasCrossingOver(!hasCrossingOver)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                background: hasCrossingOver ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
                border: hasCrossingOver ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)',
                color: hasCrossingOver ? '#34d399' : '#94a3b8'
              }}
            >
              {hasCrossingOver ? 'Açık' : 'Kapalı'}
            </button>
          </div>

          {/* Evreler Listesi */}
          <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Mayoz Evreleri
            </span>
            {STAGES.map((s, idx) => {
              const isActive = currentStage === idx;
              return (
                <button
                  key={s.title}
                  onClick={() => setCurrentStage(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    background: isActive ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))' : 'rgba(255,255,255,0.02)',
                    border: isActive ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: isActive ? '#fff' : '#cbd5e1' }}>
                    {s.title}
                  </span>
                  <span style={{ fontSize: '10px', color: isActive ? '#34d399' : '#64748b' }}>
                    {s.chromosomeCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Stage Description Card */}
          <div style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>
              {stage.subTitle}
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#cbd5e1', lineHeight: 1.6 }}>
              {stage.description}
            </p>
            <div style={{ fontSize: '11px', color: '#facc15', fontWeight: 600 }}>
              💡 {stage.keyFeature}
            </div>
          </div>

          {/* Exam Crucial Notes */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
              <Info size={16} /> ÖSYM Biyoloji Kritik Kuralları
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <li><strong>Krossing-over Şart Değildir:</strong> Mayozda her zaman krossing-over olmak zorunda <em>değildir</em>. Ancak krossing-over olmasa bile <strong>Anafaz I'deki homolog kromozomların rastgele dağılımı</strong> tek başına çeşitlilik sağlar!</li>
              <li><strong>DNA Miktarı vs Kromozom:</strong> Kromozom sayısı Anafaz I'de değil, sitokinez I sonucunda yarıya iner (2n → n). Anafaz II'de ise sentromer bölünmesi nedeniyle geçici olarak kromozom sayısı 2 katına çıkar!</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
