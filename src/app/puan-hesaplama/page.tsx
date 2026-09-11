"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Award, ArrowRight, BarChart, Info } from 'lucide-react';

// Type definitions
type SubjectData = { d: number | ''; y: number | ''; n: number };
type Scores = Record<string, SubjectData>;

export default function PuanHesaplamaPage() {
  // TYT States
  const [tyt, setTyt] = useState<Scores>({
    turkce: { d: '', y: '', n: 0 },
    matematik: { d: '', y: '', n: 0 },
    sosyal: { d: '', y: '', n: 0 },
    fen: { d: '', y: '', n: 0 }
  });

  // AYT States
  const [ayt, setAyt] = useState<Scores>({
    matematik: { d: '', y: '', n: 0 },
    fizik: { d: '', y: '', n: 0 },
    kimya: { d: '', y: '', n: 0 },
    biyoloji: { d: '', y: '', n: 0 },
    edebiyat: { d: '', y: '', n: 0 },
    tarih1: { d: '', y: '', n: 0 },
    cografya1: { d: '', y: '', n: 0 },
    tarih2: { d: '', y: '', n: 0 },
    cografya2: { d: '', y: '', n: 0 },
    felsefe: { d: '', y: '', n: 0 },
    din: { d: '', y: '', n: 0 },
    dil: { d: '', y: '', n: 0 }
  });

  const [obp, setObp] = useState<number | ''>(85); // Default diploma notu
  const [hasDiplomaOnceki, setHasDiplomaOnceki] = useState(false); // OBP kırılsın mı?

  // Results State
  const [results, setResults] = useState({
    tytNet: 0,
    aytSayNet: 0,
    aytEaNet: 0,
    aytSozNet: 0,
    tytPuan: 0,
    sayPuan: 0,
    eaPuan: 0,
    sozPuan: 0,
    dilPuan: 0,
    tytYerlestirme: 0,
    sayYerlestirme: 0,
    eaYerlestirme: 0,
    sozYerlestirme: 0,
    dilYerlestirme: 0,
  });

  // Handle Input Changes
  const handleInputChange = (exam: 'tyt' | 'ayt', subject: string, field: 'd' | 'y', value: string, maxQuestions: number) => {
    const numValue = value === '' ? '' : Math.min(Math.max(0, Number(value)), maxQuestions);
    
    if (exam === 'tyt') {
      const currentSub = tyt[subject];
      const newSub = { ...currentSub, [field]: numValue };
      // Check total questions constraint
      if (typeof newSub.d === 'number' && typeof newSub.y === 'number' && (newSub.d + newSub.y > maxQuestions)) {
        if (field === 'd') newSub.y = maxQuestions - newSub.d;
        else newSub.d = maxQuestions - newSub.y;
      }
      
      const dVal = typeof newSub.d === 'number' ? newSub.d : 0;
      const yVal = typeof newSub.y === 'number' ? newSub.y : 0;
      newSub.n = Math.max(0, dVal - (yVal * 0.25));
      
      setTyt({ ...tyt, [subject]: newSub });
    } else {
      const currentSub = ayt[subject];
      const newSub = { ...currentSub, [field]: numValue };
      if (typeof newSub.d === 'number' && typeof newSub.y === 'number' && (newSub.d + newSub.y > maxQuestions)) {
        if (field === 'd') newSub.y = maxQuestions - newSub.d;
        else newSub.d = maxQuestions - newSub.y;
      }
      
      const dVal = typeof newSub.d === 'number' ? newSub.d : 0;
      const yVal = typeof newSub.y === 'number' ? newSub.y : 0;
      newSub.n = Math.max(0, dVal - (yVal * 0.25));
      
      setAyt({ ...ayt, [subject]: newSub });
    }
  };

  // Calculation Logic (Approximate based on recent years ÖSYM formulas)
  useEffect(() => {
    // 1. Calculate Nets
    const tNet = tyt.turkce.n + tyt.matematik.n + tyt.sosyal.n + tyt.fen.n;
    const aytSayNet = ayt.matematik.n + ayt.fizik.n + ayt.kimya.n + ayt.biyoloji.n;
    const aytEaNet = ayt.matematik.n + ayt.edebiyat.n + ayt.tarih1.n + ayt.cografya1.n;
    const aytSozNet = ayt.edebiyat.n + ayt.tarih1.n + ayt.cografya1.n + ayt.tarih2.n + ayt.cografya2.n + ayt.felsefe.n + ayt.din.n;

    // Base Points (ÖSYM gives 100 base points for TYT and AYT)
    const BASE_TYT = 100;
    const BASE_AYT = 100;

    // Estimated Coefficients
    // TYT
    const cTytTr = 3.3; const cTytMat = 3.3; const cTytSos = 3.4; const cTytFen = 3.4;
    
    // AYT Sayısal
    const cAytMatSay = 3.0; const cAytFiz = 2.85; const cAytKim = 3.07; const cAytBio = 3.07;
    // AYT EA
    const cAytMatEa = 3.0; const cAytEde = 3.0; const cAytTar1 = 2.8; const cAytCog1 = 3.3;
    // AYT Sözel
    const cAytTar2 = 2.91; const cAytCog2 = 2.91; const cAytFel = 3.0; const cAytDin = 3.33;
    // AYT Dil
    const cAytDil = 3.0;

    // Calculate Raw Scores (Ham Puan)
    const tytP = BASE_TYT + (tyt.turkce.n * cTytTr) + (tyt.matematik.n * cTytMat) + (tyt.sosyal.n * cTytSos) + (tyt.fen.n * cTytFen);
    
    // YKS Puanları %40 TYT, %60 AYT etkiler (TYT Puanı doğrudan değil, netlerin katsayısı aktarılır)
    // Actually, ÖSYM directly calculates AYT scores including TYT nets with different coefficients:
    // TYT effect on AYT: TR (1.32), MAT (1.32), SOS (1.36), FEN (1.36)
    const tytEffectOnAyt = (tyt.turkce.n * 1.32) + (tyt.matematik.n * 1.32) + (tyt.sosyal.n * 1.36) + (tyt.fen.n * 1.36);

    const sayP = BASE_AYT + tytEffectOnAyt + (ayt.matematik.n * cAytMatSay) + (ayt.fizik.n * cAytFiz) + (ayt.kimya.n * cAytKim) + (ayt.biyoloji.n * cAytBio);
    const eaP = BASE_AYT + tytEffectOnAyt + (ayt.matematik.n * cAytMatEa) + (ayt.edebiyat.n * cAytEde) + (ayt.tarih1.n * cAytTar1) + (ayt.cografya1.n * cAytCog1);
    const sozP = BASE_AYT + tytEffectOnAyt + (ayt.edebiyat.n * cAytEde) + (ayt.tarih1.n * cAytTar1) + (ayt.cografya1.n * cAytCog1) + (ayt.tarih2.n * cAytTar2) + (ayt.cografya2.n * cAytCog2) + (ayt.felsefe.n * cAytFel) + (ayt.din.n * cAytDin);
    const dilP = BASE_AYT + tytEffectOnAyt + (ayt.dil.n * cAytDil);

    // OBP (Ortaöğretim Başarı Puanı)
    // Diploma notu * 5 * 0.12 (Normal) 
    // Eğer geçen sene yerleştiyse * 0.06 (Kırık OBP)
    const obpMultiplier = hasDiplomaOnceki ? 0.3 : 0.6; // 100'lük sistemde notu önce 5 ile çarpıyoruz sonra 0.12 ile. 5 * 0.12 = 0.6. Kırık ise 0.3
    const actualObp = (typeof obp === 'number' ? obp : 0);
    const obpPoints = actualObp * obpMultiplier;

    setResults({
      tytNet: tNet,
      aytSayNet: aytSayNet,
      aytEaNet: aytEaNet,
      aytSozNet: aytSozNet,
      tytPuan: Math.min(500, Math.round(tytP * 100) / 100),
      sayPuan: Math.min(500, Math.round(sayP * 100) / 100),
      eaPuan: Math.min(500, Math.round(eaP * 100) / 100),
      sozPuan: Math.min(500, Math.round(sozP * 100) / 100),
      dilPuan: Math.min(500, Math.round(dilP * 100) / 100),
      tytYerlestirme: Math.min(560, Math.round((tytP + obpPoints) * 100) / 100),
      sayYerlestirme: Math.min(560, Math.round((sayP + obpPoints) * 100) / 100),
      eaYerlestirme: Math.min(560, Math.round((eaP + obpPoints) * 100) / 100),
      sozYerlestirme: Math.min(560, Math.round((sozP + obpPoints) * 100) / 100),
      dilYerlestirme: Math.min(560, Math.round((dilP + obpPoints) * 100) / 100),
    });

  }, [tyt, ayt, obp, hasDiplomaOnceki]);

  // Rank estimation logic (Very rough estimation based on recent curves)
  const getEstimatedRank = (score: number) => {
    if (score < 150) return "Hesaplanmadı";
    if (score >= 540) return "1 - 100";
    if (score >= 500) return "100 - 15K";
    if (score >= 450) return "15K - 60K";
    if (score >= 400) return "60K - 120K";
    if (score >= 350) return "120K - 250K";
    if (score >= 300) return "250K - 500K";
    return "500K+";
  };

  const InputRow = ({ label, exam, subject, max }: { label: string, exam: 'tyt'|'ayt', subject: string, max: number }) => {
    const data = exam === 'tyt' ? tyt[subject] : ayt[subject];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 60px', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.875rem', color: '#cbd5e1', fontWeight: 600 }}>{label}</div>
        <input 
          type="number" min="0" max={max} placeholder="D"
          value={data.d} onChange={(e) => handleInputChange(exam, subject, 'd', e.target.value, max)}
          style={{ width: '100%', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#10b981', textAlign: 'center', outline: 'none' }}
        />
        <input 
          type="number" min="0" max={max} placeholder="Y"
          value={data.y} onChange={(e) => handleInputChange(exam, subject, 'y', e.target.value, max)}
          style={{ width: '100%', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', textAlign: 'center', outline: 'none' }}
        />
        <div style={{ textAlign: 'center', fontWeight: 800, color: '#fff' }}>{data.n.toFixed(2)}</div>
      </div>
    );
  };

  const ResultCard = ({ title, rawScore, placedScore, rank, color }: any) => (
    <div style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.02), ${color}10)`, border: `1px solid ${color}30`, borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: color, filter: 'blur(50px)', opacity: 0.1, borderRadius: '50%' }}></div>
      <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={20} color={color} /> {title}
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Ham Puan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{rawScore > 100 ? rawScore.toFixed(3) : '-'}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Yerleştirme Puanı</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color }}>{placedScore > 100 ? placedScore.toFixed(3) : '-'}</div>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tahmini Sıralama</span>
        <span style={{ fontWeight: 800, color: '#fff' }}>{placedScore > 100 ? rank : '-'}</span>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calculator size={24} color="#10b981" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.25rem' }}>YKS Puan Hesaplama</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Güncel ÖSYM katsayılarıyla TYT ve AYT puanını, tahmini sıralamanı anında öğren.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Sol Kolon: Giriş Alanları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* OBP Giriş */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} color="#38bdf8" /> Diploma Notu (OBP)
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Diploma Notunuz (50-100)</label>
                <input 
                  type="number" min="50" max="100" 
                  value={obp} onChange={(e) => setObp(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Kırık OBP?</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                  <input type="checkbox" id="kirikObp" checked={hasDiplomaOnceki} onChange={(e) => setHasDiplomaOnceki(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label htmlFor="kirikObp" style={{ fontSize: '0.875rem', color: '#fff', cursor: 'pointer' }}>Evet, geçen sene yerleştim</label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TYT Giriş */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>TYT (120 Soru)</h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>{results.tytNet.toFixed(2)} Net</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 60px', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DERS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>DOĞRU</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>YANLIŞ</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>NET</div>
            </div>

            <InputRow label="Türkçe" exam="tyt" subject="turkce" max={40} />
            <InputRow label="Matematik" exam="tyt" subject="matematik" max={40} />
            <InputRow label="Sosyal" exam="tyt" subject="sosyal" max={20} />
            <InputRow label="Fen Bilimleri" exam="tyt" subject="fen" max={20} />
          </motion.div>

          {/* AYT Giriş */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>AYT (Alan Yeterlilik)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 60px', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DERS</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>DOĞRU</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>YANLIŞ</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>NET</div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Sayısal / EA Ortak</div>
              <InputRow label="Matematik" exam="ayt" subject="matematik" max={40} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Sayısal Alan</div>
              <InputRow label="Fizik" exam="ayt" subject="fizik" max={14} />
              <InputRow label="Kimya" exam="ayt" subject="kimya" max={13} />
              <InputRow label="Biyoloji" exam="ayt" subject="biyoloji" max={13} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Eşit Ağırlık / Sözel Alan</div>
              <InputRow label="Edebiyat" exam="ayt" subject="edebiyat" max={24} />
              <InputRow label="Tarih-1" exam="ayt" subject="tarih1" max={10} />
              <InputRow label="Coğrafya-1" exam="ayt" subject="cografya1" max={6} />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Sözel Alan / Dil</div>
              <InputRow label="Tarih-2" exam="ayt" subject="tarih2" max={11} />
              <InputRow label="Coğrafya-2" exam="ayt" subject="cografya2" max={11} />
              <InputRow label="Felsefe Grubu" exam="ayt" subject="felsefe" max={12} />
              <InputRow label="Din Kültürü" exam="ayt" subject="din" max={6} />
              <div style={{ marginTop: '0.5rem' }}>
                <InputRow label="Yabancı Dil" exam="ayt" subject="dil" max={80} />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Sağ Kolon: Sonuçlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <BarChart size={24} color="#8b5cf6" /> Hesaplanan Puanlar
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ResultCard title="TYT Puanı" rawScore={results.tytPuan} placedScore={results.tytYerlestirme} rank={getEstimatedRank(results.tytYerlestirme)} color="#38bdf8" />
              <ResultCard title="Sayısal (SAY)" rawScore={results.sayPuan} placedScore={results.sayYerlestirme} rank={getEstimatedRank(results.sayYerlestirme)} color="#10b981" />
              <ResultCard title="Eşit Ağırlık (EA)" rawScore={results.eaPuan} placedScore={results.eaYerlestirme} rank={getEstimatedRank(results.eaYerlestirme)} color="#f59e0b" />
              <ResultCard title="Sözel (SÖZ)" rawScore={results.sozPuan} placedScore={results.sozYerlestirme} rank={getEstimatedRank(results.sozYerlestirme)} color="#ec4899" />
              <ResultCard title="Yabancı Dil (DİL)" rawScore={results.dilPuan} placedScore={results.dilYerlestirme} rank={getEstimatedRank(results.dilYerlestirme)} color="#8b5cf6" />
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong>Not:</strong> Bu modül ÖSYM'nin geçmiş yıllardaki standart sapmaları ve katsayılarına göre hesaplama yapar. Gerçek sonuçlar sınavın zorluk derecesine ve o yılki genel başarı durumuna göre değişiklik gösterebilir.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
