'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  color: string;
  speed: number;
  name: string;
  progress: number;
  isEco: boolean;
}

function Planet({ position, size, color, speed, name, progress, isEco }: PlanetProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.position.x = Math.cos(time * speed) * position[0];
      ref.current.position.z = Math.sin(time * speed) * position[0];
      ref.current.rotation.y += isEco ? 0.004 : 0.008;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[position[0], 0, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[size, isEco ? 16 : 24, isEco ? 16 : 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.9 : 0.25}
        roughness={0.4}
        metalness={0.8}
      />
      <Html distanceFactor={15} center>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: '8px',
            border: `1px solid ${color}`,
            color: '#fff',
            fontSize: '12px',
            pointerEvents: 'none',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            boxShadow: `0 4px 16px ${color}44`,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '2px' }}>{name}</div>
          <div style={{ color, fontWeight: 800 }}>%{progress} Yetkinlik</div>
        </div>
      </Html>
    </mesh>
  );
}

function SolarSystem({ planets, isEco }: { planets: any[]; isEco: boolean }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FF0000" distance={60} />

      {/* Central Star (Broadcast Core / Student Essence) */}
      <mesh>
        <sphereGeometry args={[1.4, isEco ? 16 : 24, isEco ? 16 : 24]} />
        <meshBasicMaterial color="#FF0000" />
        <Html distanceFactor={15} center>
          <div
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '12px',
              textShadow: '0 0 14px #FF0000',
              pointerEvents: 'none',
              transform: 'translateY(-28px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🔴</span>
            <span>YKS Özü</span>
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

      {/* Orbit Rings */}
      {planets.map((planet, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export default function GalaxyVisualizer({
  planets,
  isEco = false,
  isTabVisible = true,
}: {
  planets: any[];
  isEco?: boolean;
  isTabVisible?: boolean;
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0a0f' }}>
      <Canvas
        frameloop={isTabVisible ? 'always' : 'demand'}
        dpr={isEco ? 1 : [1, 1.25]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 8, 15], fov: 60 }}
      >
        <color attach="background" args={['#08080f']} />
        <Stars
          radius={90}
          depth={50}
          count={isEco ? 600 : 1400}
          factor={4}
          saturation={0}
          fade
          speed={isEco ? 0.2 : 0.4}
        />
        <OrbitControls enablePan={false} maxDistance={32} minDistance={5} />
        <SolarSystem planets={planets} isEco={isEco} />
      </Canvas>
    </div>
  );
}
