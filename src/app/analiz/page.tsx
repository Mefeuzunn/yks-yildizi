"use client";

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Planet Component
function Planet({ position, size, color, speed, name, progress }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (ref.current) {
      // Orbit around center
      const time = state.clock.getElapsedTime();
      ref.current.position.x = Math.cos(time * speed) * position[0];
      ref.current.position.z = Math.sin(time * speed) * position[0];
      // Rotate planet itself
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh 
      ref={ref} 
      position={[position[0], 0, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.2}
        roughness={0.4}
        metalness={0.8}
      />
      {/* HTML Label */}
      <Html distanceFactor={15} center>
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: `1px solid ${color}`,
          color: '#fff',
          fontSize: '0.8rem',
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{name}</div>
          <div style={{ color: color }}>%{progress} Tamamlandı</div>
        </div>
      </Html>
    </mesh>
  );
}

function SolarSystem() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#f59e0b" distance={50} />
      
      {/* Central Sun (Student Core) */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" />
        <Html distanceFactor={15} center>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', textShadow: '0 0 10px #f59e0b', pointerEvents: 'none', transform: 'translateY(-30px)' }}>
            Öğrenci Özü
          </div>
        </Html>
      </mesh>

      {/* Planets */}
      {/* Matematik */}
      <Planet position={[4, 0, 0]} size={0.6} color="#38bdf8" speed={0.5} name="Matematik" progress={65} />
      {/* Fizik */}
      <Planet position={[6.5, 0, 0]} size={0.5} color="#8b5cf6" speed={0.3} name="Fizik" progress={42} />
      {/* Kimya */}
      <Planet position={[8.5, 0, 0]} size={0.45} color="#10b981" speed={0.2} name="Kimya" progress={80} />
      {/* Biyoloji */}
      <Planet position={[10.5, 0, 0]} size={0.55} color="#ec4899" speed={0.15} name="Biyoloji" progress={55} />

      {/* Orbit Rings */}
      {[4, 6.5, 8.5, 10.5].map((radius, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function AnalizPage() {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 80px)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, pointerEvents: 'none' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>3D Gelişim Galaksisi</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '400px', marginTop: '0.5rem' }}>
          Gezegenlerin büyüklüğü ve hızı derslerdeki yetkinliğinizi temsil eder. Daha yakından incelemek için farenizi sürükleyerek kamerayı çevirebilir veya gezegenlerin üzerine gelebilirsiniz.
        </p>
      </div>

      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <color attach="background" args={['#050510']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enablePan={false} maxDistance={30} minDistance={5} />
        <SolarSystem />
      </Canvas>
    </div>
  );
}
