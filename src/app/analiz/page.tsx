"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Zap } from 'lucide-react';

// Planet Component (GPU & Battery Optimized)
function Planet({ position, size, color, speed, name, progress, isEco }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    // Stop frame calculations if browser tab is hidden
    if (typeof document !== 'undefined' && document.hidden) return;
    if (ref.current) {
      // Orbit around center
      const time = state.clock.getElapsedTime();
      ref.current.position.x = Math.cos(time * speed) * position[0];
      ref.current.position.z = Math.sin(time * speed) * position[0];
      // Rotate planet itself at calm speed
      ref.current.rotation.y += isEco ? 0.004 : 0.008;
    }
  });

  return (
    <mesh 
      ref={ref} 
      position={[position[0], 0, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[size, isEco ? 16 : 24, isEco ? 16 : 24]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={hovered ? 0.9 : 0.25}
        roughness={0.4}
        metalness={0.8}
      />
      {/* HTML Label */}
      <Html distanceFactor={15} center>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '0.4rem 0.8rem',
          borderRadius: '8px',
          border: `1px solid ${color}`,
          color: '#fff',
          fontSize: '0.78rem',
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          boxShadow: `0 4px 16px ${color}33`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{name}</div>
          <div style={{ color: color, fontWeight: 700 }}>%{progress} Yetkinlik</div>
        </div>
      </Html>
    </mesh>
  );
}

function SolarSystem({ planets, isEco }: { planets: any[]; isEco: boolean }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2.2} color="#f59e0b" distance={60} />
      
      {/* Central Sun (Student Core) */}
      <mesh>
        <sphereGeometry args={[1.5, isEco ? 16 : 24, isEco ? 16 : 24]} />
        <meshBasicMaterial color="#f59e0b" />
        <Html distanceFactor={15} center>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', textShadow: '0 0 12px #f59e0b', pointerEvents: 'none', transform: 'translateY(-32px)', whiteSpace: 'nowrap' }}>
            ☀️ Öğrenci Özü
          </div>
        </Html>
      </mesh>

      {/* Dynamic Planets */}
      {planets.map((planet) => (
        <Planet 
          key={planet.name}
          position={[planet.distance, 0, 0]} 
          size={planet.size} 
          color={planet.color} 
          speed={planet.speed} 
          name={planet.name} 
          progress={planet.progress} 
          isEco={isEco}
        />
      ))}

      {/* Orbit Rings (32 segments for low GPU memory) */}
      {planets.map((planet, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={0.06} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function AnalizPage() {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isEco, setIsEco] = useState(false);

  const [planets, setPlanets] = useState<any[]>([
    { name: 'Matematik', color: '#38bdf8', distance: 4.5, size: 0.65, speed: 0.45, progress: 65 },
    { name: 'Fizik', color: '#8b5cf6', distance: 7.0, size: 0.5, speed: 0.28, progress: 42 },
    { name: 'Kimya', color: '#10b981', distance: 9.5, size: 0.75, speed: 0.58, progress: 85 },
    { name: 'Biyoloji', color: '#ec4899', distance: 12.0, size: 0.4, speed: 0.22, progress: 30 },
    { name: 'Türkçe', color: '#f43f5e', distance: 14.5, size: 0.58, speed: 0.18, progress: 70 },
  ]);

  // Page Visibility & Battery Saver listener
  useEffect(() => {
    const handleVis = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVis);

    const handlePower = (e: any) => {
      if (e.detail) {
        if (typeof e.detail.visible === 'boolean') setIsTabVisible(e.detail.visible);
        if (typeof e.detail.eco === 'boolean') setIsEco(e.detail.eco);
      }
    };
    window.addEventListener('yks:power-state' as any, handlePower);

    const savedEco = localStorage.getItem('yks_battery_saver') === 'true';
    if (savedEco) setIsEco(true);

    return () => {
      document.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('yks:power-state' as any, handlePower);
    };
  }, []);

  const toggleEco = () => {
    const next = !isEco;
    setIsEco(next);
    localStorage.setItem('yks_battery_saver', next ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('yks:toggle-battery-saver', { detail: next }));
  };

  useEffect(() => {
    async function fetchLiveProgress() {
      try {
        const res = await fetch('/api/user/subjects');
        if (res.ok) {
          const data = await res.json();
          if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
            const colorMap: Record<string, { color: string; distance: number }> = {
              'Matematik': { color: '#38bdf8', distance: 4.5 },
              'Fizik': { color: '#8b5cf6', distance: 7.0 },
              'Kimya': { color: '#10b981', distance: 9.5 },
              'Biyoloji': { color: '#ec4899', distance: 12.0 },
              'Türkçe': { color: '#f43f5e', distance: 14.5 },
              'Edebiyat': { color: '#f43f5e', distance: 14.5 },
              'Geometri': { color: '#f59e0b', distance: 17.0 },
              'Tarih': { color: '#fb923c', distance: 19.5 },
              'Coğrafya': { color: '#34d399', distance: 22.0 },
              'Felsefe': { color: '#a78bfa', distance: 24.5 },
            };

            const mapped = data.subjects.slice(0, 6).map((s: any, idx: number) => {
              const info = colorMap[s.name] || { color: '#06b6d4', distance: 4.5 + idx * 2.5 };
              const prog = Math.min(100, Math.max(10, s.percentage || 15));
              return {
                name: s.name,
                color: info.color,
                distance: info.distance,
                size: 0.35 + (prog / 100) * 0.4,
                speed: 0.12 + (prog / 100) * 0.35,
                progress: prog,
              };
            });

            if (mapped.length > 0) setPlanets(mapped);
          }
        }
      } catch (err) {
        console.error('3D Galaksi veri hatası:', err);
      }
    }
    fetchLiveProgress();
  }, []);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Overlay UI - Left */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, pointerEvents: 'none' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.5)', margin: 0 }}>
          3D Gelişim Galaksisi
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: '380px', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Gezegenlerin büyüklüğü ve hızı derslerdeki gerçek başarı yüzdenizi temsil eder. Farenizi veya parmağınızı sürükleyerek galakside gezinebilirsiniz.
        </p>
      </div>

      {/* Overlay UI - Right (Live HUD Card) */}
      <div className="mobile-hidden" style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, backgroundColor: 'rgba(15, 21, 35, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px', minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🪐 Gezegen Yetkinlikleri
          </h4>
          <button
            onClick={toggleEco}
            title="Pil Tasarruf Modunu Değiştir"
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: isEco ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
              color: isEco ? '#10b981' : '#94a3b8',
              border: `1px solid ${isEco ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`
            }}
          >
            <Zap size={11} /> {isEco ? 'Eko Mod' : 'Standart'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {planets.map(p => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: p.color, fontWeight: 700 }}>%{p.progress}</span>
              </div>
              <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${p.progress}%`, height: '100%', backgroundColor: p.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Canvas
        frameloop={isTabVisible ? 'always' : 'demand'}
        dpr={isEco ? 1 : [1, 1.25]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 8, 15], fov: 60 }}
      >
        <color attach="background" args={['#050510']} />
        <Stars radius={100} depth={50} count={isEco ? 700 : 1600} factor={4} saturation={0} fade speed={isEco ? 0.2 : 0.4} />
        <OrbitControls enablePan={false} maxDistance={35} minDistance={5} />
        <SolarSystem planets={planets} isEco={isEco} />
      </Canvas>
    </div>
  );
}
