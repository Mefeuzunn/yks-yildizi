import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b0f19',
};

export const metadata: Metadata = {
  title: "YKS Yıldızı - Premium",
  description: "Türkiye'nin en gelişmiş, yapay zeka destekli YKS hazırlık ve tercih platformu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YKS Yıldızı",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
  keywords: ["YKS", "TYT", "AYT", "Puan Hesaplama", "YÖK Atlas", "Tercih Robotu", "Yapay Zeka Koçluk", "Çalışma Programı"],
  openGraph: {
    title: "YKS Yıldızı - Premium Eğitim Platformu",
    description: "Yapay zeka eğitim koçu AstraTutor ile YKS'ye hazırlan, puanını hesapla ve YÖK Atlas verileriyle hedefini belirle.",
    url: "https://yksyildizi.com",
    siteName: "YKS Yıldızı",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YKS Yıldızı - Premium",
    description: "Yapay zeka ile kişiselleştirilmiş YKS deneyimi.",
  },
};

import LayoutShell from "@/components/LayoutShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
