const fs = require('fs');
const path = require('path');

const simulations = [
  { id: 'kuvvet-ve-hareket', title: 'Kuvvet ve Hareket', url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_tr.html', category: 'Fizik' },
  { id: 'enerji-parki', title: 'Enerji Parkı', url: 'https://phet.colorado.edu/sims/html/energy-skate-park/latest/energy-skate-park_tr.html', category: 'Fizik' },
  { id: 'yaylar-ve-kutleler', title: 'Yaylar ve Kütleler', url: 'https://phet.colorado.edu/sims/html/masses-and-springs/latest/masses-and-springs_tr.html', category: 'Fizik' },
  { id: 'maddenin-halleri', title: 'Maddenin Halleri', url: 'https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_tr.html', category: 'Kimya' },
  { id: 'atom-olustur', title: 'Atom Oluştur', url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_tr.html', category: 'Kimya' },
  { id: 'molekul-sekilleri', title: 'Molekül Şekilleri', url: 'https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_tr.html', category: 'Kimya' },
  { id: 'denge-oyunu', title: 'Denge Oyunu', url: 'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_tr.html', category: 'Fizik' },
  { id: 'kesirler', title: 'Kesirler', url: 'https://phet.colorado.edu/sims/html/fractions-intro/latest/fractions-intro_tr.html', category: 'Matematik' },
  { id: 'alan-olusturucu', title: 'Alan Oluşturucu', url: 'https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_tr.html', category: 'Matematik' },
  { id: 'dogal-secilim', title: 'Doğal Seçilim', url: 'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_tr.html', category: 'Biyoloji' },
  { id: 'renk-gorme', title: 'Renk Görme', url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_tr.html', category: 'Biyoloji' },
  { id: 'yay-dalgalari', title: 'Yay Dalgaları', url: 'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_tr.html', category: 'Fizik' },
  { id: 'surtunme', title: 'Sürtünme', url: 'https://phet.colorado.edu/sims/html/friction/latest/friction_tr.html', category: 'Fizik' },
  { id: 'isigin-kirilmasi', title: 'Işığın Kırılması', url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_tr.html', category: 'Fizik' },
  { id: 'yari-omur', title: 'Yarı Ömür', url: 'https://phet.colorado.edu/sims/html/alpha-decay/latest/alpha-decay_tr.html', category: 'Fizik' } // Fallback to english if tr doesn't exist, PhET handles it
];

const template = (title, url) => `"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Maximize2 } from 'lucide-react';

export default function EmbeddedSimulation() {
  const handleFullscreen = () => {
    const iframe = document.getElementById('sim-iframe');
    if (iframe && iframe.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c10', color: '#fff', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <Link href="/simulasyonlar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', textDecoration: 'none', marginBottom: '1rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Simülasyonlara Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>${title}</h1>
        </div>
        <button 
          onClick={handleFullscreen}
          className="btn-interactive" 
          style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <Maximize2 size={18} /> Tam Ekran
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', height: 'calc(100vh - 200px)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        <iframe 
          id="sim-iframe"
          src="${url}" 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
`;

const baseDir = path.join(__dirname, 'src', 'app', 'simulasyonlar');

simulations.forEach(sim => {
  const simDir = path.join(baseDir, sim.id);
  if (!fs.existsSync(simDir)) {
    fs.mkdirSync(simDir, { recursive: true });
  }
  fs.writeFileSync(path.join(simDir, 'page.tsx'), template(sim.title, sim.url));
  console.log(`Created simulation: ${sim.title}`);
});
console.log(`Added ${simulations.length} new simulations!`);
