"use client";

import { useEffect } from 'react';

export default function ThemeEngine() {
  useEffect(() => {
    // 1. Initial fast apply from localStorage to prevent visual jump
    const cachedTheme = localStorage.getItem('yks_equipped_theme');
    if (cachedTheme && cachedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', cachedTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // 2. Fetch active equipped theme from user inventory
    async function syncTheme() {
      try {
        const res = await fetch('/api/shop/inventory');
        if (res.ok) {
          const data = await res.json();
          if (data.equipped && Array.isArray(data.equipped)) {
            // Find if t1 or t2 is equipped
            const activeTheme = data.equipped.find((id: string) => id === 't1' || id === 't2');
            if (activeTheme) {
              document.documentElement.setAttribute('data-theme', activeTheme);
              localStorage.setItem('yks_equipped_theme', activeTheme);
            } else {
              document.documentElement.removeAttribute('data-theme');
              localStorage.removeItem('yks_equipped_theme');
            }
          }
        }
      } catch (err) {
        // Silent catch for offline or non-authenticated views
      }
    }

    syncTheme();

    // 3. Listen for immediate client-side theme equip/unequip events
    const handleThemeChange = (e: CustomEvent) => {
      const themeId = e.detail;
      if (themeId && themeId !== 'default') {
        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('yks_equipped_theme', themeId);
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('yks_equipped_theme');
      }
    };

    window.addEventListener('themeChanged' as any, handleThemeChange);
    return () => {
      window.removeEventListener('themeChanged' as any, handleThemeChange);
    };
  }, []);

  return null;
}
