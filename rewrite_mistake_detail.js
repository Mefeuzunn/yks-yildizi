const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/MistakeDetailModal.tsx', 'utf8');

const importReplacement = `import { X, ArrowRight, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';`;
content = content.replace(/import \{ X, ArrowRight, Sparkles, MessageSquare \} from 'lucide-react';/, importReplacement);

const newContentBlock = `
              <div style={{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', minHeight: '300px' }}>
                {mistakeData.imageData && (
                  <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={mistakeData.imageData} alt="Soru Görseli" style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
                <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {mistakeData.icerik || 'Soru metni bulunamadı.'}
                </p>

                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {mistakeData.secenekler && Array.isArray(mistakeData.secenekler) ? mistakeData.secenekler.map((opt: string, i: number) => {
                    const isSelected = opt === mistakeData.secilenCevap || (['A','B','C','D','E'][i] === mistakeData.secilenCevap);
                    const isCorrect = opt === mistakeData.dogruCevap || (['A','B','C','D','E'][i] === mistakeData.dogruCevap);
                    let bgColor = 'rgba(255,255,255,0.02)';
                    let borderColor = 'rgba(255,255,255,0.05)';
                    let color = 'rgba(255,255,255,0.7)';
                    let suffix = '';

                    if (isCorrect) {
                      bgColor = 'rgba(16, 185, 129, 0.1)';
                      borderColor = '#10b981';
                      color = '#10b981';
                      suffix = ' (Doğru Cevap)';
                    } else if (isSelected) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = '#ef4444';
                      color = '#ef4444';
                      suffix = ' (İşaretlenen)';
                    }

                    return (
                      <div key={i} style={{ 
                        padding: '1rem', borderRadius: '8px', 
                        backgroundColor: bgColor,
                        border: \`1px solid \${borderColor}\`,
                        color: color
                      }}>
                        {['A', 'B', 'C', 'D', 'E'][i]}) {opt}{suffix}
                      </div>
                    )
                  }) : null}
                </div>
              </div>`;

content = content.replace(
  /              <div style=\{\{ backgroundColor: '#0e121e', borderRadius: '16px', border: '1px solid rgba\(255,255,255,0\.05\)', padding: '2rem', minHeight: '300px' \}\}>[\s\S]*?<\/div>\n            <\/div>/,
  newContentBlock + "\n            </div>"
);

fs.writeFileSync('src/components/dashboard/MistakeDetailModal.tsx', content);
console.log("Rewrote MistakeDetailModal");
