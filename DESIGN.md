# YKS Yıldızı — Academic Design System Specification (DESIGN.md)

**Aesthetic Direction:** Academic Precision & Modern Slate (Oxford / Apple Education / Linear Software Craft)  
**Target Surface Modes:** `Operate` (Kokpit, Test Stüdyosu, Analiz) + `Read` (Konu Anlatımı) + `Experience` (Sanal Kütüphane, Sınav Arenası)  
**Strict Prohibition:** Neon mor/menekşe (`#8b5cf6`, `#a855f7`, `#c084fc`), mor glow/ışıma efektleri ve oyun/kripto arayüz kalıntıları kesinlikle yasaklanmıştır.

---

## 1. Color Architecture (3-Katmanlı Renk Mimarisi)

### 1.1 Canvas & Surface Tokens (Zemin & Katmanlar)
- **Deep Obsidian Canvas (Koyu Ana Zemin):** `#090D16`
- **Sidebar & Chrome Background:** `#0A0F1D`
- **Card / Surface-1 (Birincil Kartlar):** `#0F172A` (Koyu Arduvaz)
- **Surface-2 / Elevated (İç Kartlar & Seçiciler):** `#1E293B`
- **Surface Inset (Girdi & Kod Alanları):** `#060A12`
- **Hairline Border Subtle:** `rgba(255, 255, 255, 0.08)`
- **Hairline Border Default:** `rgba(255, 255, 255, 0.12)`
- **Hairline Border Strong / Inset:** `rgba(255, 255, 255, 0.20)`

### 1.2 Academic Accent Tokens (Akademik Otorite & Anlamsal Renkler)
- **Primary Brand (Oxford & Kraliyet Mavisi):**
  - Base: `#2563EB` (Tailwind blue-600)
  - Light Accent: `#3B82F6` (Tailwind blue-500)
  - Hover / Active: `#1D4ED8` (Tailwind blue-700)
  - Subtle Fill: `rgba(37, 99, 235, 0.12)`
  - Border Ring: `rgba(59, 130, 246, 0.35)`
- **Mastery & Maarif Signature (Zümrüt Yeşili):**
  - Base: `#10B981` (Tailwind emerald-500)
  - Hover: `#059669` (Tailwind emerald-600)
  - Subtle Fill: `rgba(16, 185, 129, 0.12)`
- **Focus & Streak Accent (Kehribar & Sıcak Altın):**
  - Base: `#F59E0B` (Tailwind amber-500)
  - Darker Gold: `#D97706` (Tailwind amber-600)
  - Subtle Fill: `rgba(245, 158, 11, 0.12)`
- **Alert & Critical Error (Kızıl Kırmızı):**
  - Base: `#EF4444` (Tailwind red-500)
  - Darker Red: `#DC2626` (Tailwind red-600)
  - Subtle Fill: `rgba(239, 68, 68, 0.12)`

### 1.3 Course & Subject Color Standards (Branş Kodları)
- **Matematik & Geometri:** `#2563EB` (Kraliyet Mavisi)
- **Fizik:** `#0284C7` (Okyanus / Camgöbeği Mavisi — *Eski mor yerine akademik mühendislik mavisi*)
- **Kimya:** `#0D9488` (Teal / Zümrüt Yeşili)
- **Biyoloji:** `#059669` (Doğa / Canlılık Yeşili)
- **Türkçe & Edebiyat:** `#D97706` (Antik Amber / Parşömen Sarısı)
- **Tarih & Felsefe:** `#B45309` (Bronz / Toprak Tonu)
- **Coğrafya:** `#047857` (Koyu Orman Yeşili)

---

## 2. Typography & Numbers (Tipografi ve Rakam Standardı)

- **Birincil Yazı Tipi:** Inter / SF Pro Display (`var(--font-sans)`)
- **Başlık Ağırlıkları:** 700 (Bold) ve 800 (Extra Bold), negatif letter-spacing (`-0.025em` ile `-0.035em`)
- **Gövde Metni (Body):** 14px - 15px, satır yüksekliği 1.6 (`line-height: 1.6`), metin rengi `#E2E8F0`
- **Sayısal Değerler & Süreler (Numerics):** Bütün sayaçlar, netler, puanlar ve süreler zorunlu olarak `tabular-nums font-mono` formatında işlenir.
- **Matematik Formülleri:** KaTeX `$ ... $` veya `$$ ... $$` matematik motoru ile render edilir.

---

## 3. Layout, Bento Grids & Micro-Interactions

1. **Equal Content Edges:** Sayfa kenar boşlukları sol ve sağda eşit mesafede hizalanır (`max-w-7xl mx-auto px-4 sm:px-6`).
2. **Kart Yarıçapları (Border Radius):**
   - Dış modüller & paneller: `16px` (`rounded-2xl`)
   - İç butonlar ve girdi alanları: `10px` - `12px` (`rounded-xl`)
   - Hap (Pill) etiketler: `9999px` (`rounded-full`)
3. **Mikro Etkileşimler (Taste-Skill Standardı):**
   - Kart üzerine gelindiğinde (hover): `translateY(-2px)`, kenarlık `rgba(255, 255, 255, 0.16)`.
   - Butona tıklandığında (active/press): `scale-[0.98]` adım tepkisi.
   - Hiçbir kartta veya butonda mor neon halo / yayvan blur parlama kullanılmaz.
