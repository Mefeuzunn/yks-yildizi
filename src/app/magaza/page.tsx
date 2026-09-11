"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Zap, Image as ImageIcon, Shield, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'avatars', label: 'Profillik Avatarlar', icon: <ImageIcon size={18} /> },
  { id: 'pets', label: 'Çalışma Dostları', icon: <Star size={18} /> },
  { id: 'themes', label: 'Uygulama Temaları', icon: <Zap size={18} /> },
  { id: 'badges', label: 'Özel Rozetler', icon: <Shield size={18} /> },
];

const INITIAL_SHOP_ITEMS = [
  { id: 'a1', category: 'avatars', name: 'Kozmik Baykuş', price: 500, emoji: '🦉', color: '#8b5cf6', purchased: false },
  { id: 'a2', category: 'avatars', name: 'Siber Kaplan', price: 1200, emoji: '🐯', color: '#f97316', purchased: false },
  { id: 'a3', category: 'avatars', name: 'Astro-Kedi', price: 2500, emoji: '🐱‍🚀', color: '#06b6d4', purchased: false },
  
  { id: 'p1', category: 'pets', name: 'Odaklanan Pofuduk', price: 800, emoji: '🐰', color: '#ec4899', purchased: false },
  { id: 'p2', category: 'pets', name: 'Bilge Kaplumbağa', price: 1500, emoji: '🐢', color: '#10b981', purchased: false },
  { id: 'p3', category: 'pets', name: 'Ateş Ejderhası', price: 5000, emoji: '🐉', color: '#ef4444', purchased: false },

  { id: 't1', category: 'themes', name: 'Neon Cyberpunk', price: 3000, emoji: '🌆', color: '#d946ef', purchased: false },
  { id: 't2', category: 'themes', name: 'Karanlık Orman', price: 3000, emoji: '🌲', color: '#059669', purchased: false },
  
  { id: 'b1', category: 'badges', name: 'Soru Canavarı', price: 1000, emoji: '👾', color: '#6366f1', purchased: false },
  { id: 'b2', category: 'badges', name: 'Gece Kuşu', price: 1500, emoji: '🌙', color: '#3b82f6', purchased: false },
];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState('avatars');
  const [userXP, setUserXP] = useState(0);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, invRes] = await Promise.all([
          fetch('/api/user/dashboard'),
          fetch('/api/shop/inventory')
        ]);
        
        const dashData = await dashRes.json();
        const invData = await invRes.json();

        if (dashData?.stats) {
          setUserXP(dashData.stats.league_points || 0);
        }
        
        if (invData?.success) {
          const ownedIds = invData.inventory;
          setShopItems(prev => prev.map(item => 
            ownedIds.includes(item.id) ? { ...item, purchased: true } : item
          ));
        }
      } catch (err) {
        console.error("Mağaza verisi çekilemedi", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = shopItems.filter(item => item.category === activeTab);

  const handleBuy = async (item: typeof INITIAL_SHOP_ITEMS[0]) => {
    if (userXP >= item.price && !item.purchased) {
      setBuyingId(item.id);
      try {
        const res = await fetch('/api/shop/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, price: item.price, itemType: item.category })
        });
        
        const data = await res.json();
        
        if (data.success) {
          // Deduct XP visually
          setUserXP(prev => prev - item.price);
          // Update item to purchased visually
          setShopItems(prev => prev.map(i => i.id === item.id ? { ...i, purchased: true } : i));
          // Confetti celebration
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: [item.color, '#facc15', '#ffffff']
          });
        } else {
          alert(data.error || 'Satın alma başarısız oldu.');
        }
      } catch (err) {
        console.error("Satın alma hatası", err);
        alert('Satın alma sırasında bir hata oluştu.');
      } finally {
        setBuyingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#FAFAFA' }}>
        <Loader2 className="animate-spin" size={48} color="#ec4899" />
      </div>
    );
  }

  return (
    <div className="custom-scrollbar" style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', paddingBottom: '100px' }}>
      
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(236, 72, 153, 0.3)' }}>
            <ShoppingBag size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.03em' }}>
              Yıldız Mağazası
            </h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Kazandığın XP'leri harca, profilini ve uygulamanı kişiselleştir.
            </p>
          </div>
        </div>
        
        {/* User Balance */}
        <div style={{ backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>Bakiye:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={20} color="#facc15" fill="#facc15" />
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{userXP.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '12px',
              backgroundColor: activeTab === cat.id ? 'rgba(236, 72, 153, 0.15)' : '#131827',
              color: activeTab === cat.id ? '#ec4899' : '#9ca3af',
              border: `1px solid ${activeTab === cat.id ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.05)'}`,
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filteredItems.map(item => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            key={item.id}
            style={{ 
              backgroundColor: '#131827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', 
              padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', background: item.color, opacity: 0.1, filter: 'blur(40px)', borderRadius: '50%' }} />
            
            <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
              {item.emoji}
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>{item.name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
              <Star size={16} color={item.purchased ? '#9ca3af' : "#facc15"} fill={item.purchased ? 'transparent' : "#facc15"} />
              <span style={{ fontSize: '16px', fontWeight: 600, color: item.purchased ? '#9ca3af' : '#facc15' }}>
                {item.purchased ? 'Satın Alındı' : item.price.toLocaleString('tr-TR')}
              </span>
            </div>

            <button 
              onClick={() => handleBuy(item)}
              disabled={item.purchased || userXP < item.price || buyingId === item.id}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                backgroundColor: item.purchased ? 'rgba(255,255,255,0.05)' : (userXP >= item.price ? item.color : 'rgba(255,255,255,0.02)'),
                color: item.purchased ? '#6b7280' : (userXP >= item.price ? '#fff' : '#4b5563'),
                border: 'none', fontWeight: 700, fontSize: '14px',
                cursor: (item.purchased || userXP < item.price || buyingId === item.id) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {buyingId === item.id ? <Loader2 className="animate-spin" size={18} /> : (item.purchased ? <CheckCircle2 size={18} /> : (userXP < item.price ? <Lock size={18} /> : null))}
              {buyingId === item.id ? 'İşleniyor...' : (item.purchased ? 'Kullanılıyor' : (userXP >= item.price ? 'Satın Al' : 'Yetersiz XP'))}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
