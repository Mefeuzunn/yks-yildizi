"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Music, CloudRain, Coffee, Sparkles } from 'lucide-react';

type Station = {
  id: string;
  name: string;
  icon: any;
  embedUrl: string;
  color: string;
};

const STATIONS: Station[] = [
  { 
    id: 'lofi', 
    name: 'Lofi Study Beats', 
    icon: Coffee, 
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
    color: '#a78bfa' // purple
  },
  { 
    id: 'piano', 
    name: 'Klasik Piyano', 
    icon: Sparkles, 
    embedUrl: 'https://www.youtube.com/embed/4bCo9T9j-8Q',
    color: '#38bdf8' // blue
  },
  { 
    id: 'rain', 
    name: 'Yağmur Ambiyansı', 
    icon: CloudRain, 
    embedUrl: 'https://www.youtube.com/embed/n7Z_63lU5G4',
    color: '#10b981' // green
  },
  { 
    id: 'synth', 
    name: 'Synthwave Space Chill', 
    icon: Music, 
    embedUrl: 'https://www.youtube.com/embed/5Wq1GyP4Ghk',
    color: '#ec4899' // pink
  }
];

export default function FocusBeats({ compact = false }: { compact?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStation, setActiveStation] = useState<Station>(STATIONS[0]);
  const [volume, setVolume] = useState(50);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send volume commands to YouTube iframe
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && isPlaying) {
      const volumeCmd = JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [volume]
      });
      // Delay slightly to let player load
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(volumeCmd, '*');
      }, 1000);
    }
  }, [volume, activeStation, isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStationChange = (stationId: string) => {
    const station = STATIONS.find(s => s.id === stationId);
    if (station) {
      setActiveStation(station);
      // Auto play when station changes
      setIsPlaying(true);
    }
  };

  const IconComponent = activeStation.icon;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: compact ? '1rem' : '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      width: '100%'
    }}>
      
      {/* Station Header & Pulse Visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `rgba(${activeStation.color === '#a78bfa' ? '167, 139, 250' : activeStation.color === '#38bdf8' ? '56, 189, 248' : activeStation.color === '#10b981' ? '16, 185, 129' : '236, 72, 153'}, 0.15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeStation.color
          }}>
            <IconComponent size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Odak Radyosu
            </div>
            <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>
              {activeStation.name}
            </div>
          </div>
        </div>

        {/* CSS Soundwave Animation */}
        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '16px' }}>
            {[1.2, 0.6, 1.5, 0.9, 0.5].map((delay, i) => (
              <div 
                key={i} 
                style={{
                  width: '3px',
                  background: activeStation.color,
                  borderRadius: '2px',
                  animation: `soundwave 1s ease-in-out infinite alternate`,
                  animationDelay: `${delay}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Select Dropdown & Main Button */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={activeStation.id}
          onChange={(e) => handleStationChange(e.target.value)}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: '#fff',
            fontSize: '0.85rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {STATIONS.map(s => (
            <option key={s.id} value={s.id} style={{ background: '#0b0c10', color: '#fff' }}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          onClick={togglePlay}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isPlaying ? '#ef4444' : activeStation.color,
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
        </button>
      </div>

      {/* Volume Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
        <Volume2 size={16} color="var(--text-muted)" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          style={{
            flex: 1,
            accentColor: activeStation.color,
            height: '4px',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '24px', textAlign: 'right' }}>
          {volume}%
        </span>
      </div>

      {/* Hidden YouTube player with JavaScript API enabled */}
      {isPlaying && (
        <iframe
          ref={iframeRef}
          width="0"
          height="0"
          src={`${activeStation.embedUrl}?autoplay=1&controls=0&enablejsapi=1&volume=${volume}`}
          title="Focus Beats Stream"
          frameBorder="0"
          allow="autoplay"
          style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
        />
      )}

      {/* Animation definition */}
      <style jsx global>{`
        @keyframes soundwave {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
}
