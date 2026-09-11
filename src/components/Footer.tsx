"use client";

import React from 'react';
import { MessageCircle, Camera, Globe, Mail, Star, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
        
        {/* Brand Section */}
        <div>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
            >
              <Star size={24} fill="#f59e0b" color="#f59e0b" />
            </motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.02em' }}>
              YKS Yıldızı
            </span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Türkiye'nin ilk ve tek %100 parametrik, yapay zeka destekli üniversiteye hazırlık platformu. Ezberleme, mantığını öğren.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
            <a href="#" className="footer-icon"><MessageCircle size={20} /></a>
            <a href="#" className="footer-icon"><Camera size={20} /></a>
            <a href="#" className="footer-icon"><Globe size={20} /></a>
          </div>
        </div>

        {/* Links 1 */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>Platform</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Link href="/ozellikler" className="footer-link">Özellikler</Link>
            <Link href="/parametrik-motor" className="footer-link">Parametrik Soru Motoru</Link>
            <Link href="/duello" className="footer-link">Gerçek Zamanlı Düello</Link>
            <Link href="/fiyatlandirma" className="footer-link">Fiyatlandırma</Link>
            <Link href="/basari-hikayeleri" className="footer-link">Başarı Hikayeleri</Link>
          </div>
        </div>

        {/* Links 2 */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>Destek</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <Link href="/sss" className="footer-link">Sıkça Sorulan Sorular</Link>
            <Link href="/iletisim" className="footer-link">İletişim</Link>
            <Link href="/blog" className="footer-link">YKS Blog</Link>
            <Link href="/rehberlik" className="footer-link">Rehberlik Servisi</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>İletişim</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} />
              <span>destek@yksyildizi.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} />
              <span>0850 123 45 67</span>
            </div>
          </div>
        </div>

      </div>

      <div style={{ 
        maxWidth: '1200px', margin: '0 auto', 
        paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        color: 'var(--text-muted)', fontSize: '0.875rem'
      }}>
        <p>© 2026 YKS Yıldızı. Tüm hakları saklıdır.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link href="/gizlilik" className="footer-link">Gizlilik Politikası</Link>
          <Link href="/kullanim" className="footer-link">Kullanım Koşulları</Link>
        </div>
      </div>

      <style jsx>{`
        .footer-wrapper {
          width: 100%;
          background-color: var(--bg-card);
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 4rem 4rem 2rem 4rem;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .footer-wrapper {
            padding: 2rem 1.5rem 1.5rem 1.5rem;
          }
        }
        .footer-link {
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #fff;
        }
        .footer-icon {
          transition: all 0.2s ease;
        }
        .footer-icon:hover {
          color: #fff;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
