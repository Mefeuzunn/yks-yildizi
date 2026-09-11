const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/AnalysisTab.tsx', 'utf8');

// Replace top KPI cards
content = content.replace(/value: '39s 12d'/g, "value: '0s 0d'");
content = content.replace(/sub: 'Hedefe %95 ulaşıldı'/g, "sub: 'Veri bekleniyor'");

content = content.replace(/value: '± 2.4'/g, "value: '± 0'");
content = content.replace(/sub: 'Çok İstikrarlı'/g, "sub: 'Veri bekleniyor'");

content = content.replace(/value: '1,450'/g, "value: '0'");
content = content.replace(/sub: 'Geçen haftadan %15 fazla'/g, "sub: 'Veri bekleniyor'");

// Replace AI Text
content = content.replace(/Merhaba Efe! Son denemelerinin analizini tamamladım[^<]*/, "Yeterli veri bekleniyor... Sistemimize daha fazla deneme sınavı ve test sonucu ekledikçe yapay zeka eğitim koçunuz size özel analizler üretecektir.");

content = content.replace(/Matematik \(Problemler\) süren 1\.5 dk'dan 1\.1 dk'ya düştü\. Hız kazandın\./, "Henüz analiz edilemedi.");
content = content.replace(/AYT Fizik ve Türkçe \(Dil Bilgisi\) sorularında işlem\/bilgi hatan yüksek\./, "Henüz analiz edilemedi.");

content = content.replace(/<strong>Koçun Tavsiyesi:<\/strong> Hafta içi çalışma saatini 4 saatin altına düşürmemeye çalış[^<]*/, "<strong>Koçun Tavsiyesi:</strong> Analizlerimin isabetli olması için lütfen 'Deneme Takibi' bölümünden geçmiş sonuçlarını sisteme kaydet.");

// Replace Error Distribution to zeros
content = content.replace(/<span style={{ fontWeight: 600, color: 'var\(--text-primary\)' }}>%45<\/span>/, "<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>");
content = content.replace(/<span style={{ fontWeight: 600, color: 'var\(--text-primary\)' }}>%30<\/span>/, "<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>");
content = content.replace(/<span style={{ fontWeight: 600, color: 'var\(--text-primary\)' }}>%15<\/span>/, "<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>");
content = content.replace(/<span style={{ fontWeight: 600, color: 'var\(--text-primary\)' }}>%10<\/span>/, "<span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>%0</span>");

content = content.replace(/<span style={{ fontSize: '0.8rem', color: 'var\(--text-muted\)', fontWeight: 600 }}>50 Soru<\/span>/, "<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>0 Soru</span>");
// Make conic gradient gray
content = content.replace(/background: 'conic-gradient[^']*'/, "background: 'conic-gradient(#374151 0% 100%)'");

fs.writeFileSync('src/components/dashboard/AnalysisTab.tsx', content);
