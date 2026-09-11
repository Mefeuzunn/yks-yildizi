'use client';

import React from 'react';
import { Filter, BookOpen, Layers, Star, Search } from 'lucide-react';

export type Subject = 'Tümü' | 'Fizik' | 'Kimya' | 'Biyoloji' | 'Genel';
export type Category = 'Tümü' | 'TYT' | 'AYT';
export type Difficulty = 0 | 1 | 2 | 3 | 4 | 5;

interface SimulationFilterProps {
  subject: Subject;
  setSubject: (s: Subject) => void;
  category: Category;
  setCategory: (c: Category) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  search: string;
  setSearch: (s: string) => void;
}

export default function SimulationFilter({
  subject, setSubject,
  category, setCategory,
  difficulty, setDifficulty,
  search, setSearch
}: SimulationFilterProps) {
  
  const selectStyle = {
    width: '100%',
    appearance: 'none' as const,
    backgroundColor: '#0b0f19',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    borderRadius: '12px',
    padding: '10px 10px 10px 36px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box' as const
  };

  const inputStyle = {
    ...selectStyle,
    cursor: 'text'
  };

  const wrapperStyle = {
    position: 'relative' as const,
    flex: '1 1 180px',
    minWidth: '160px'
  };

  const iconStyle = {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    pointerEvents: 'none' as const
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'rgba(18,24,43,0.8)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      backdropFilter: 'blur(4px)'
    }}>
      {/* Üst Kısım: Arama Çubuğu */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search size={18} style={{ ...iconStyle, color: '#3b82f6' }} />
        <input 
          type="text"
          placeholder="İvme, Türev, pH gibi bir konu, etiket veya simülasyon adı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: 'white',
            fontSize: '15px',
            borderRadius: '12px',
            padding: '14px 14px 14px 40px',
            outline: 'none',
            boxSizing: 'border-box' as const,
            boxShadow: '0 4px 20px -5px rgba(59, 130, 246, 0.15)'
          }}
        />
      </div>

      {/* Alt Kısım: Dropdown Filtreler */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', fontWeight: 600, marginRight: '8px' }}>
          <Filter size={16} color="#9ca3af" />
          <span style={{ fontSize: '14px' }}>Hızlı Filtreler:</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
          <div style={wrapperStyle}>
            <Layers size={16} style={iconStyle} />
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)} style={selectStyle}>
              <option value="Tümü">Sınav: Tümü</option>
              <option value="TYT">TYT</option>
              <option value="AYT">AYT</option>
            </select>
          </div>

          <div style={wrapperStyle}>
            <BookOpen size={16} style={iconStyle} />
            <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} style={selectStyle}>
              <option value="Tümü">Ders: Tümü</option>
              <option value="Fizik">Fizik</option>
              <option value="Kimya">Kimya</option>
              <option value="Biyoloji">Biyoloji</option>
              <option value="Genel">Matematik / Genel</option>
            </select>
          </div>

          <div style={wrapperStyle}>
            <Star size={16} style={iconStyle} />
            <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)} style={selectStyle}>
              <option value={0}>Zorluk: Tümü</option>
              <option value={1}>Seviye 1 (En Kolay)</option>
              <option value={2}>Seviye 2 (Kolay)</option>
              <option value={3}>Seviye 3 (Orta)</option>
              <option value={4}>Seviye 4 (Zor)</option>
              <option value={5}>Seviye 5 (Uzman)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
