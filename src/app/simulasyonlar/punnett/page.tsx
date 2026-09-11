"use client";

import React, { useState } from 'react';
import { ArrowLeft, Dna, Settings, Users, HelpCircle } from 'lucide-react';
import Link from 'next/link';

type Allele = 'A' | 'a';
type Genotype = [Allele, Allele];

const getPhenotype = (genotype: Genotype) => {
  return genotype.includes('A') ? 'Baskın (A)' : 'Çekinik (a)';
};

const getColor = (genotype: Genotype) => {
  if (genotype[0] === 'A' && genotype[1] === 'A') return '#38bdf8'; // AA: Saf Baskın (Mavi)
  if (genotype.includes('A') && genotype.includes('a')) return '#a855f7'; // Aa: Melez Baskın (Mor)
  return '#f43f5e'; // aa: Saf Çekinik (Kırmızı)
};

export default function PunnettSimulation() {
  const [parent1, setParent1] = useState<Genotype>(['A', 'a']);
  const [parent2, setParent2] = useState<Genotype>(['A', 'a']);
  const [children, setChildren] = useState<Genotype[]>([]);

  // Punnett Square calculations
  const square: Genotype[] = [
    [parent1[0], parent2[0]],
    [parent1[0], parent2[1]],
    [parent1[1], parent2[0]],
    [parent1[1], parent2[1]],
  ];

  // Sırala (Aa yerine aA olmasın diye)
  square.forEach(g => g.sort((x, y) => (x === 'A' ? -1 : 1)));

  // Olasılıklar
  const counts = {
    'AA': square.filter(g => g[0] === 'A' && g[1] === 'A').length,
    'Aa': square.filter(g => g[0] === 'A' && g[1] === 'a').length,
    'aa': square.filter(g => g[0] === 'a' && g[1] === 'a').length,
  };

  const generateChild = () => {
    // Randomly pick one from the square
    const randomChild = square[Math.floor(Math.random() * square.length)];
    setChildren([...children, randomChild]);
  };

  const resetChildren = () => setChildren([]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Üst Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Simülasyonlara Dön
          </Link>
        </div>

        {/* Başlık */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem' }}>Punnett Karesi ve Soyağacı</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Mendel genetiğine göre otozomal kalıtım oranlarını hesaplayın ve rastgele yavrular oluşturarak soyağacını izleyin.</p>
        </div>

        {/* Ana İçerik Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }} className="mobile-stack">
          
          {/* Sol: Punnett ve Ağaç */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Punnett Karesi Görseli */}
            <div style={{ background: '#0b0f19', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ marginBottom: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Dna size={20} color="#a855f7" /> Punnett Karesi Çaprazlaması</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '50px 100px 100px', gridTemplateRows: '50px 100px 100px', gap: '4px' }}>
                {/* Boş Köşe */}
                <div></div>
                {/* Parent 2 Alleles (Top) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{parent2[0]}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{parent2[1]}</div>
                
                {/* Row 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{parent1[0]}</div>
                <div style={{ background: getColor(square[0]), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                  {square[0].join('')}
                </div>
                <div style={{ background: getColor(square[1]), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                  {square[1].join('')}
                </div>

                {/* Row 2 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{parent1[1]}</div>
                <div style={{ background: getColor(square[2]), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                  {square[2].join('')}
                </div>
                <div style={{ background: getColor(square[3]), borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                  {square[3].join('')}
                </div>
              </div>
            </div>

            {/* Soyağacı Animasyonu (Basit) */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={20} color="#38bdf8" /> Dinamik Soyağacı</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={generateChild} style={{ background: '#38bdf8', color: '#000', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Çocuk Yap</button>
                  <button onClick={resetChildren} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>Temizle</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Parents */}
                <div style={{ display: 'flex', gap: '4rem', marginBottom: '2rem', position: 'relative' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: getColor(parent1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', zIndex: 2 }}>{parent1.join('')}</div>
                  <div style={{ position: 'absolute', top: '30px', left: '60px', width: '4rem', height: '2px', background: 'rgba(255,255,255,0.3)', zIndex: 1 }}></div>
                  <div style={{ position: 'absolute', top: '30px', left: '50%', width: '2px', height: '2rem', background: 'rgba(255,255,255,0.3)', zIndex: 1 }}></div>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: getColor(parent2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', zIndex: 2 }}>{parent2.join('')}</div>
                </div>

                {/* Children */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', paddingTop: '1rem' }}>
                  {children.length > 0 && (
                    <div style={{ position: 'absolute', top: '-1rem', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.3)' }}></div>
                  )}
                  {children.map((child, idx) => (
                    <div key={idx} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', top: '-1rem', width: '2px', height: '1rem', background: 'rgba(255,255,255,0.3)' }}></div>
                      <div 
                        style={{ 
                          width: '50px', height: '50px', 
                          borderRadius: Math.random() > 0.5 ? '50%' : '8px', // Random male(square) or female(circle)
                          background: getColor(child), 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontSize: '1rem', fontWeight: 'bold' 
                        }}
                      >
                        {child.join('')}
                      </div>
                    </div>
                  ))}
                  {children.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Henüz çocuk yok.</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Sağ: Kontrol Paneli */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Settings size={20} color="#a855f7" />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Ebeveyn Genotipleri</h3>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>1. Ebeveyn (Anne/Yuvarlak)</label>
              <select 
                value={parent1.join('')} 
                onChange={(e) => {
                  const val = e.target.value;
                  setParent1([val[0] as Allele, val[1] as Allele]);
                  resetChildren();
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '1rem' }}
              >
                <option value="AA" style={{ background: '#1e293b' }}>AA - Saf Baskın</option>
                <option value="Aa" style={{ background: '#1e293b' }}>Aa - Melez Baskın</option>
                <option value="aa" style={{ background: '#1e293b' }}>aa - Saf Çekinik</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>2. Ebeveyn (Baba/Kare)</label>
              <select 
                value={parent2.join('')} 
                onChange={(e) => {
                  const val = e.target.value;
                  setParent2([val[0] as Allele, val[1] as Allele]);
                  resetChildren();
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: '1rem' }}
              >
                <option value="AA" style={{ background: '#1e293b' }}>AA - Saf Baskın</option>
                <option value="Aa" style={{ background: '#1e293b' }}>Aa - Melez Baskın</option>
                <option value="aa" style={{ background: '#1e293b' }}>aa - Saf Çekinik</option>
              </select>
            </div>

            <div style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#a855f7' }}>Oluşma Olasılıkları</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#38bdf8', borderRadius: 2 }}></div> AA (Saf Baskın)</div>
                <div style={{ fontWeight: 'bold' }}>%{counts['AA'] * 25}</div>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem', borderRadius: '2px' }}><div style={{ width: `${counts['AA'] * 25}%`, height: '100%', background: '#38bdf8', borderRadius: '2px' }}></div></div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#a855f7', borderRadius: 2 }}></div> Aa (Melez Baskın)</div>
                <div style={{ fontWeight: 'bold' }}>%{counts['Aa'] * 25}</div>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem', borderRadius: '2px' }}><div style={{ width: `${counts['Aa'] * 25}%`, height: '100%', background: '#a855f7', borderRadius: '2px' }}></div></div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#f43f5e', borderRadius: 2 }}></div> aa (Saf Çekinik)</div>
                <div style={{ fontWeight: 'bold' }}>%{counts['aa'] * 25}</div>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><div style={{ width: `${counts['aa'] * 25}%`, height: '100%', background: '#f43f5e', borderRadius: '2px' }}></div></div>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '0.75rem' }}>
              <HelpCircle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f43f5e', marginBottom: '0.25rem' }}>Soyağacı Analizi</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Eğer hastalık <b>çekinik (a)</b> ise, sadece kırmızı (aa) bireyler hasta olur. İki sağlıklı taşıyıcı ebeveynin (Aa x Aa) hasta çocuğu olma olasılığı <b>%25</b>'tir.
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
