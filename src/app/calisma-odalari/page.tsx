"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Users, BookOpen, CloudRain, Code, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CalismaOdalariLobby() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (data.rooms) setRooms(data.rooms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getThemeDetails = (theme: string) => {
    switch(theme) {
      case 'library': return { icon: <BookOpen size={32} color="#10b981" />, bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', label: 'Sessiz Ortam' };
      case 'lofi': return { icon: <Headphones size={32} color="var(--accent)" />, bg: 'var(--accent-glow)', border: 'var(--accent)', label: 'Müzikli Ortam' };
      case 'rain': return { icon: <CloudRain size={32} color="#38bdf8" />, bg: 'rgba(56, 189, 248, 0.1)', border: '#38bdf8', label: 'Doğa Sesleri' };
      case 'tech': return { icon: <Code size={32} color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', label: 'Sayısal Odak' };
      default: return { icon: <Users size={32} color="var(--text-primary)" />, bg: 'var(--secondary)', border: 'var(--text-primary)', label: 'Genel' };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="var(--accent)" className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={24} color="var(--accent)" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Sanal Çalışma Odaları</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Study With Me: Hedeflerine yürürken asla yalnız değilsin.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {rooms.map((room, i) => {
          const theme = getThemeDetails(room.theme);
          
          return (
            <motion.div 
              key={room.id}
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', borderTop: `4px solid ${theme.border}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {theme.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: room.current_participants > 0 ? '#10b981' : 'var(--text-muted)' }}></div>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>{room.current_participants} / {room.max_capacity}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{room.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>{theme.label}</p>

              <Link href={`/calisma-odalari/${room.id}`} style={{ marginTop: 'auto' }}>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.75rem' }}>
                  Odaya Katıl
                </button>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
