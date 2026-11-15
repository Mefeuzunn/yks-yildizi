"use client";

import React, { useState } from 'react';
import { Star, Trophy, Swords, Menu, X, Sparkles } from 'lucide-react';
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
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'var(--bg-card, #090d16)'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(37, 99, 235, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}>
            <Star size={17} fill="#fbbf24" color="#fbbf24" />
          </div>
          <span style={{ 
            fontFamily: 'var(--font-display, inherit)', 
            fontWeight: 800, 
            fontSize: '1.2rem',
            color: '#fff',
            letterSpacing: '-0.025em'
          }}>
            YKS<span style={{ color: '#38bdf8' }}>Yıldızı</span>
          </span>
        </Link>

        {/* Mobile Menu Button */}
        <div className="mobile-only">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <div className="desktop-flex" style={{ alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>
          <Link href="/soru-coz" className="nav-link" style={{ 
            color: '#38bdf8', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            <Sparkles size={13} />
            <span>Soru Çöz (AI)</span>
          </Link>
          
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
          <Link href="/puan-hesaplama" className="nav-link" style={{ color: '#38bdf8', fontWeight: 600 }}>Puan Hesapla</Link>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link href="/ayarlar" className="nav-link">Ayarlar</Link>
        </div>

        {/* User Profile (Desktop) */}
        <div className="desktop-flex" style={{ alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/profil" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '8px', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff', cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 0 10px rgba(37, 99, 235, 0.3)'
                }}>
                  {user.username.substring(0,2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 600 }}>{user.username}</span>
              </Link>
              <button onClick={logout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                Çıkış
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/login" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textDecoration: 'none', transition: 'color 0.2s' }} className="nav-link">
                Giriş
              </Link>
              <Link href="/register" className="btn-interactive" style={{ padding: '0.45rem 1rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.15)', cursor: 'pointer', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)' }}>
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
              top: '65px',
              left: 0,
              width: '100%',
              backgroundColor: '#090d16',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              zIndex: 90,
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 12px 30px rgba(0,0,0,0.7)'
            }}
            className="mobile-flex"
          >
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  {user.username.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>{user.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>{user.role}</div>
                </div>
              </div>
            )}

            <Link onClick={() => setMobileMenuOpen(false)} href="/soru-coz" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Soru Çöz (AI)</Link>
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
            <Link onClick={() => setMobileMenuOpen(false)} href="/puan-hesaplama" style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>Puan Hesapla</Link>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.35rem 0' }}></div>
            
            {user ? (
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ width: '100%', padding: '0.65rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Çıkış Yap</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link onClick={() => setMobileMenuOpen(false)} href="/login" style={{ width: '100%', textAlign: 'center', padding: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Giriş Yap</Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/register" style={{ width: '100%', textAlign: 'center', padding: '0.65rem', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Kayıt Ol</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
