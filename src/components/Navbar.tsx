"use client";

import React, { useState } from 'react';
import { Star, Trophy, Swords, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav style={{
        width: '100%',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'var(--bg-color)'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
          >
            <Star size={24} fill="#f59e0b" color="#f59e0b" />
          </motion.div>
          <span style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 700, 
            fontSize: '1.25rem',
            color: '#fff',
            letterSpacing: '-0.02em'
          }}>
            YKS Yıldızı
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="mobile-only">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="desktop-flex" style={{ alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <Link href="/soru-coz" className="nav-link" style={{ color: '#8b5cf6', fontWeight: 600, textShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}>Soru Çöz (AI)</Link>
          
          {user?.role === 'ogretmen' && (
            <Link href="/ogretmen/dashboard" className="nav-link" style={{ color: '#38bdf8', fontWeight: 600 }}>Eğitmen Paneli</Link>
          )}
          {user?.role === 'ogrenci' && (
            <>
              <Link href="/sinifim" className="nav-link" style={{ color: '#10b981', fontWeight: 600 }}>Sınıfım</Link>
              <Link href="/hata-defteri" className="nav-link" style={{ color: '#ef4444', fontWeight: 600 }}>Hata Defterim</Link>
            </>
          )}

          <Link href="/simulasyonlar" className="nav-link">Simülasyonlar</Link>
          <Link href="/calisma-odalari" className="nav-link" style={{ color: '#f59e0b', fontWeight: 600 }}>Odalar</Link>
          <Link href="/ligler" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#fbbf24' }}>
            <Trophy size={14} /> Ligler
          </Link>
          <Link href="/duello" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f87171' }}>
            <Swords size={14} /> Düello
          </Link>
          <Link href="/rehberlik" className="nav-link" style={{ color: '#2dd4bf', fontWeight: 600 }}>Rehberlik (AI)</Link>
          <Link href="/puan-hesaplama" className="nav-link" style={{ color: '#ec4899', fontWeight: 600 }}>Puan Hesapla</Link>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link href="/ayarlar" className="nav-link">Ayarlar</Link>
        </div>

        {/* User Profile (Desktop) */}
        <div className="desktop-flex" style={{ alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 600, color: '#fff', cursor: 'pointer'
                }}>
                  {user.username.substring(0,2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', color: '#fff' }}>{user.username}</span>
              </Link>
              <button onClick={logout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                Çıkış
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} className="nav-link">
                Giriş
              </Link>
              <Link href="/register" className="btn-interactive" style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '72px', // Below navbar
              left: 0,
              width: '100%',
              backgroundColor: 'var(--surface)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              zIndex: 90,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}
            className="mobile-only"
          >
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 600, color: '#fff'
                }}>
                  {user.username.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{user.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
                </div>
              </div>
            )}

            <Link onClick={() => setMobileMenuOpen(false)} href="/soru-coz" style={{ color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>Soru Çöz (AI)</Link>
            {user?.role === 'ogretmen' && (
              <Link onClick={() => setMobileMenuOpen(false)} href="/ogretmen/dashboard" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Eğitmen Paneli</Link>
            )}
            {user?.role === 'ogrenci' && (
              <>
                <Link onClick={() => setMobileMenuOpen(false)} href="/sinifim" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Sınıfım</Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/hata-defteri" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}>Hata Defterim</Link>
              </>
            )}
            <Link onClick={() => setMobileMenuOpen(false)} href="/simulasyonlar" style={{ color: '#fff', textDecoration: 'none' }}>Simülasyonlar</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/calisma-odalari" style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>Odalar</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/ligler" style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}><Trophy size={16}/> Ligler</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/duello" style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}><Swords size={16}/> Düello</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/rehberlik" style={{ color: '#2dd4bf', fontWeight: 600, textDecoration: 'none' }}>Rehberlik (AI)</Link>
            <Link onClick={() => setMobileMenuOpen(false)} href="/puan-hesaplama" style={{ color: '#ec4899', fontWeight: 600, textDecoration: 'none' }}>Puan Hesapla</Link>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }}></div>
            
            {user ? (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ width: '100%', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Çıkış Yap</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link onClick={() => setMobileMenuOpen(false)} href="/login" style={{ width: '100%', textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Giriş Yap</Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/register" style={{ width: '100%', textAlign: 'center', padding: '0.75rem', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Kayıt Ol</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
