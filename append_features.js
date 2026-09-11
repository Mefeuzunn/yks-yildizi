const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Insert import at the top
content = content.replace("import AnimatedCounter from '@/components/AnimatedCounter';", "import AnimatedCounter from '@/components/AnimatedCounter';\nimport FadeInUp from '@/components/FadeInUp';");

// Remove the closing tags at the very bottom
content = content.replace(/      <\/div>\n    <\/div>\n  \);\n}\n?$/, '');

// Add the new sections
const newSections = `      </div>

      {/* ─── FEATURES SECTION (NEDEN YKS YILDIZI?) ─── */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl text-center mx-auto mb-16">
            <FadeInUp delay={0.1}>
              <h2 className="text-4xl font-heading font-extrabold text-text-heading mb-6">
                Neden YKS Yıldızı?
              </h2>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <p className="text-lg text-text-body">
                Klasik test kitaplarını ve statik soru bankalarını unutun. Yapay zeka ile kişiselleştirilmiş, oyunlaştırılmış ve ölçülebilir bir öğrenme deneyimi sunuyoruz.
              </p>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInUp delay={0.3}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">01</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">Adaptif Öğrenme</h3>
                <p className="text-text-body leading-relaxed">
                  8.800+ sorudan oluşan havuzda, zayıf olduğun konular yapay zeka tarafından analiz edilir ve odaklanman gereken testler önüne getirilir.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">02</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">Sıralama Ligleri</h3>
                <p className="text-text-body leading-relaxed">
                  Türkiye genelindeki öğrencilerle yarış. Rozetler kazan, XP biriktir ve Platin Lig'e kadar tırmanarak başarı hissini yaşa.
                </p>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand/30 transition-all">
                <div className="bg-brand-light text-brand text-xs font-bold px-3 py-1 rounded-md inline-block mb-4">03</div>
                <h3 className="text-xl font-heading font-bold text-text-heading mb-3">3D Simülasyonlar</h3>
                <p className="text-text-body leading-relaxed">
                  Fizik, Kimya ve Biyoloji derslerindeki soyut kavramları PhET entegrasyonu ve 3D modeller ile görselleştirerek öğren.
                </p>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 bg-white border-t border-gray-100 border-b">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeInUp delay={0.1}>
            <h2 className="text-4xl font-heading font-extrabold text-text-heading mb-6">
              Hayalindeki Üniversiteye<br />Bir Adım Kaldı
            </h2>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <p className="text-lg text-text-body max-w-2xl mx-auto mb-10">
              Hemen ücretsiz hesabını oluştur ve yeni nesil YKS hazırlık platformuyla rakiplerinin bir adım önüne geç.
            </p>
          </FadeInUp>
          <FadeInUp delay={0.3}>
            <Link href="/register">
              <button className="bg-brand hover:bg-brand-hover text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-xl shadow-brand/30 transition-transform hover:-translate-y-1">
                Ücretsiz Hesabını Oluştur
              </button>
            </Link>
          </FadeInUp>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="text-xl font-heading font-extrabold text-text-heading flex items-center gap-2 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15 9L22 10L17 15L18.5 22L12 18.5L5.5 22L7 15L2 10L9 9L12 2Z" fill="currentColor"/>
                </svg>
                YKS Yıldızı
              </div>
              <p className="text-sm text-text-body">
                Türkiye'nin en modern, adaptif ve veri odaklı üniversiteye hazırlık ekosistemi.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li><Link href="/soru-coz" className="hover:text-brand transition-colors">Soru Havuzu</Link></li>
                <li><Link href="/simulasyonlar" className="hover:text-brand transition-colors">Simülasyonlar</Link></li>
                <li><Link href="/ligler" className="hover:text-brand transition-colors">Ligler & Düello</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">Hizmetler</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li><Link href="/rehberlik" className="hover:text-brand transition-colors">AstraTutor AI</Link></li>
                <li><Link href="/forum" className="hover:text-brand transition-colors">Öğrenci Forumu</Link></li>
                <li><Link href="/veli" className="hover:text-brand transition-colors">Veli Takibi</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-text-heading mb-6 uppercase text-sm tracking-wider">İletişim</h4>
              <ul className="space-y-4 text-sm text-text-body font-medium">
                <li>destek@yksyildizi.com</li>
                <li>0850 123 45 67</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">© 2026 YKS Yıldızı. Tüm hakları saklıdır.</p>
            <div className="flex gap-6 text-xs text-text-muted font-medium">
              <Link href="/gizlilik" className="hover:text-brand">Gizlilik Politikası</Link>
              <Link href="/kullanim" className="hover:text-brand">Kullanım Koşulları</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', content + newSections);
