"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Zap, Image as ImageIcon, Shield, CheckCircle2, Lock, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { haptics } from '@/lib/haptics';
import { SHOP_ITEMS } from '@/lib/shop-items';

const CATEGORIES = [
  { id: 'avatars', label: 'Profillik Avatarlar', icon: <ImageIcon size={18} /> },
  { id: 'pets', label: 'Çalışma Dostları', icon: <Star size={18} /> },
  { id: 'themes', label: 'Uygulama Temaları', icon: <Zap size={18} /> },
  { id: 'badges', label: 'Özel Rozetler', icon: <Shield size={18} /> },
];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState('avatars');
  const [userXP, setUserXP] = useState(0);
  const [shopItems, setShopItems] = useState(SHOP_ITEMS.map(i => ({ ...i, purchased: false })));
  const [equippedIds, setEquippedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);

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
          const coins = dashData.stats.coins !== undefined && dashData.stats.coins !== null && Number(dashData.stats.coins) > 0
            ? Number(dashData.stats.coins)
            : Math.max(Number(dashData.stats.league_points || 0), Number(dashData.stats.xp || 0));
          setUserXP(coins);
        }
        
        if (invData?.success) {
          const ownedIds = invData.inventory || invData.purchased || [];
          const equipped = invData.equipped || [];
          setEquippedIds(equipped);
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

  const handleBuy = async (item: typeof shopItems[0]) => {
    if (userXP >= item.price && !item.purchased) {
      haptics.selection();
      setBuyingId(item.id);
      try {
        const res = await fetch('/api/shop/buy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, price: item.price, itemType: item.category })
        });
        
        const data = await res.json();
        
        if (data.success) {
          haptics.notification('success');
          // Deduct coins visually
          if (typeof data.newCoins === 'number') {
            setUserXP(data.newCoins);
          } else {
            setUserXP(prev => Math.max(0, prev - item.price));
          }
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
          haptics.notification('warning');
          alert(data.error || 'Satın alma başarısız oldu.');
        }
      } catch (err) {
        haptics.notification('warning');
        console.error("Satın alma hatası", err);
        alert('Satın alma sırasında bir hata oluştu.');
      } finally {
        setBuyingId(null);
      }
    }
  };

  const handleEquip = async (item: typeof shopItems[0]) => {
    haptics.selection();
    setEquippingId(item.id);
    const isCurrentlyEquipped = equippedIds.includes(item.id);
    const action = isCurrentlyEquipped ? 'unequip' : 'equip';

    try {
      const res = await fetch('/api/shop/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, action })
      });
      const data = await res.json();
      if (data.success) {
        haptics.notification('success');
        if (action === 'equip') {
          // Remove other items in same category, add this one
          const categoryItemIds = shopItems.filter(i => i.category === item.category).map(i => i.id);
          setEquippedIds(prev => [...prev.filter(id => !categoryItemIds.includes(id)), item.id]);
          if (item.category === 'themes') {
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: item.id }));
          }
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
            colors: [item.color, '#6366f1', '#10b981']
          });
        } else {
          setEquippedIds(prev => prev.filter(id => id !== item.id));
          if (item.category === 'themes') {
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: 'default' }));
          }
        }
      }
    } catch (e) {
      console.error('Kuşanma hatası', e);
    } finally {
      setEquippingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#080c14' }}>
        <Loader2 className="animate-spin" size={48} color="#ec4899" />
      </div>
    );
  }

  return (
    <div className="custom-scrollbar shop-container" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 20px))' }}>
      
      <header className="shop-header" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(236, 72, 153, 0.3)', flexShrink: 0 }}>
            <ShoppingBag size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: '#fff', margin: '0 0 4px 0', letterSpacing: '-0.03em' }}>
              Yıldız Mağazası
            </h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Kazandığın Yıldız Altınlarını (Coin) harca, profilini ve unvanlarını özelleştir.
            </p>
          </div>
        </div>
        
        {/* User Balance */}
        <div className="shop-balance" style={{ backgroundColor: 'rgba(15, 21, 35, 0.85)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '12px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 700 }}>Yıldız Altını:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={20} color="#facc15" fill="#facc15" />
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{userXP.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="shop-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className="active:scale-[0.98]"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '14px',
              backgroundColor: activeTab === cat.id ? 'rgba(236, 72, 153, 0.15)' : 'rgba(15, 21, 35, 0.75)',
              color: activeTab === cat.id ? '#f472b6' : '#94a3b8',
              border: `1px solid ${activeTab === cat.id ? 'rgba(236, 72, 153, 0.4)' : 'rgba(255,255,255,0.08)'}`,
              fontWeight: 800, fontSize: '13.5px', cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', whiteSpace: 'nowrap',
              boxShadow: activeTab === cat.id ? '0 0 20px rgba(236, 72, 153, 0.25)' : 'none'
            }}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="shop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filteredItems.map(item => {
          const isEquipped = equippedIds.includes(item.id);

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              key={item.id}
              className="shop-card"
              style={{ 
                backgroundColor: 'rgba(15, 21, 35, 0.85)', 
                border: isEquipped ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)', 
                boxShadow: isEquipped ? '0 0 30px rgba(16, 185, 129, 0.25)' : '0 8px 30px rgba(0,0,0,0.3)',
                borderRadius: '22px', 
                padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                position: 'relative', overflow: 'hidden',
                backdropFilter: 'blur(16px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Active Equipped Badge */}
              {isEquipped && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#34d399', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <CheckCircle2 size={13} /> Kuşanıldı
                </div>
              )}

              {/* Background Glow */}
              <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '110px', height: '110px', background: item.color, opacity: 0.15, filter: 'blur(45px)', borderRadius: '50%' }} />
              
              <div className="shop-emoji" style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}>
                {item.emoji}
              </div>
              
              <h3 className="shop-item-name" style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>{item.name}</h3>
              
              <div className="shop-price-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
                <Star size={16} color={item.purchased ? '#64748b' : "#facc15"} fill={item.purchased ? 'transparent' : "#facc15"} />
                <span className="shop-price-text" style={{ fontSize: '15px', fontWeight: 700, color: item.purchased ? '#64748b' : '#facc15', fontVariantNumeric: 'tabular-nums' }}>
                  {item.purchased ? 'Satın Alındı' : item.price.toLocaleString('tr-TR')}
                </span>
              </div>

              {/* Action Button: Buy or Equip/Unequip */}
              {!item.purchased ? (
                <button 
                  onClick={() => handleBuy(item)}
                  disabled={userXP < item.price || buyingId === item.id}
                  className="shop-buy-btn active:scale-[0.98]"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px',
                    backgroundColor: userXP >= item.price ? item.color : 'rgba(255,255,255,0.03)',
                    color: userXP >= item.price ? '#fff' : '#64748b',
                    border: 'none', fontWeight: 800, fontSize: '14px',
                    cursor: (userXP < item.price || buyingId === item.id) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginTop: 'auto',
                    boxShadow: userXP >= item.price ? `0 4px 16px ${item.color}50` : 'none'
                  }}
                >
                  {buyingId === item.id ? <Loader2 className="animate-spin" size={18} /> : (userXP < item.price ? <Lock size={18} /> : null)}
                  {buyingId === item.id ? 'İşleniyor...' : (userXP >= item.price ? 'Satın Al' : 'Yetersiz XP')}
                </button>
              ) : isEquipped ? (
                <button
                  onClick={() => handleEquip(item)}
                  disabled={equippingId === item.id}
                  className="shop-buy-btn active:scale-[0.98]"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 800, fontSize: '14px',
                    cursor: equippingId === item.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginTop: 'auto'
                  }}
                >
                  {equippingId === item.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  {equippingId === item.id ? 'İşleniyor...' : 'Kuşanıldı (Çıkar)'}
                </button>
              ) : (
                <button
                  onClick={() => handleEquip(item)}
                  disabled={equippingId === item.id}
                  className="shop-buy-btn active:scale-[0.98]"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    border: 'none', fontWeight: 800, fontSize: '14px',
                    cursor: equippingId === item.id ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginTop: 'auto',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)'
                  }}
                >
                  {equippingId === item.id ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {equippingId === item.id ? 'İşleniyor...' : 'Kuşan'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.shop-container) {
            padding: 16px 12px calc(80px + env(safe-area-inset-bottom, 20px)) 12px !important;
          }
          :global(.shop-header) {
            margin-bottom: 20px !important;
            gap: 12px !important;
          }
          :global(.shop-balance) {
            padding: 8px 14px !important;
            border-radius: 12px !important;
            width: 100% !important;
            justify-content: space-between !important;
          }
          :global(.shop-tabs) {
            margin-bottom: 20px !important;
            gap: 8px !important;
          }
          :global(.shop-grid) {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          :global(.shop-card) {
            padding: 16px 10px !important;
            border-radius: 16px !important;
          }
          :global(.shop-emoji) {
            font-size: 44px !important;
            margin-bottom: 8px !important;
          }
          :global(.shop-item-name) {
            font-size: 13px !important;
            margin-bottom: 4px !important;
            min-height: 36px !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          :global(.shop-price-row) {
            margin-bottom: 12px !important;
            gap: 4px !important;
          }
          :global(.shop-price-text) {
            font-size: 13px !important;
          }
          :global(.shop-buy-btn) {
            padding: 10px 8px !important;
            font-size: 12px !important;
            border-radius: 10px !important;
            min-height: 42px !important;
          }
        }
      `}</style>
    </div>
  );
}
