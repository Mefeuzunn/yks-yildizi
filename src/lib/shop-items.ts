export interface ShopItem {
  id: string;
  category: 'avatars' | 'pets' | 'themes' | 'badges';
  name: string;
  price: number;
  emoji: string;
  color: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'a1', category: 'avatars', name: 'Kozmik Baykuş', price: 500, emoji: '🦉', color: '#8b5cf6' },
  { id: 'a2', category: 'avatars', name: 'Siber Kaplan', price: 1200, emoji: '🐯', color: '#f97316' },
  { id: 'a3', category: 'avatars', name: 'Astro-Kedi', price: 2500, emoji: '🐱‍🚀', color: '#06b6d4' },
  
  { id: 'p1', category: 'pets', name: 'Odaklanan Pofuduk', price: 800, emoji: '🐰', color: '#ec4899' },
  { id: 'p2', category: 'pets', name: 'Bilge Kaplumbağa', price: 1500, emoji: '🐢', color: '#10b981' },
  { id: 'p3', category: 'pets', name: 'Ateş Ejderhası', price: 5000, emoji: '🐉', color: '#ef4444' },

  { id: 't1', category: 'themes', name: 'Neon Cyberpunk', price: 3000, emoji: '🌆', color: '#d946ef' },
  { id: 't2', category: 'themes', name: 'Karanlık Orman', price: 3000, emoji: '🌲', color: '#059669' },
  
  { id: 'b1', category: 'badges', name: 'Soru Canavarı', price: 1000, emoji: '👾', color: '#6366f1' },
  { id: 'b2', category: 'badges', name: 'Gece Kuşu', price: 1500, emoji: '🌙', color: '#3b82f6' },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}
