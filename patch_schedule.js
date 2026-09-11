const fs = require('fs');

let content = fs.readFileSync('src/components/dashboard/ScheduleTab.tsx', 'utf8');

const titleSection = `
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{fontSize:'1.8rem',fontWeight:800,color:'var(--text-primary)',marginBottom:'0.25rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
            📅 Çalışma Programı
          </h2>
          <p style={{color:'var(--text-secondary)',margin:0,fontSize:'14px'}}>
            Haftalık programını oluştur. Bloklara tıklayarak detay ekle, sürükleyerek taşı.
          </p>
        </div>
        <button 
          onClick={async () => {
            if (confirm('Yapay zeka analizlerine göre eski program silinip yepyeni bir adaptif takvim çizilecek. Onaylıyor musun?')) {
              try {
                await fetch('/api/user/calendar/generate', { method: 'POST' });
                window.location.reload();
              } catch (e) {
                alert('Hata oluştu!');
              }
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            border: 'none', borderRadius: '12px', padding: '12px 20px',
            color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)'
          }}
        >
          <Sparkles size={18} /> Yapay Zeka Planı Çiz
        </button>
      </div>
`;

content = content.replace(
  /<div>\s*<h2 style={{fontSize:'1.8rem',fontWeight:800,color:'var\(--text-primary\)',marginBottom:'0.25rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>\s*📅 Çalışma Programı\s*<\/h2>\s*<p style={{color:'var\(--text-secondary\)',margin:0,fontSize:'14px'}}>\s*Haftalık programını oluştur\. Bloklara tıklayarak detay ekle, sürükleyerek taşı\.\s*<\/p>\s*<\/div>/g,
  titleSection
);

if (!content.includes('Sparkles')) {
  content = content.replace(/import { Calendar as CalIcon, Clock, X, Trash2, Plus, Pencil, ChevronLeft, ChevronRight, FileText, Moon, Sun, Sunset } from 'lucide-react';/, "import { Calendar as CalIcon, Clock, X, Trash2, Plus, Pencil, ChevronLeft, ChevronRight, FileText, Moon, Sun, Sunset, Sparkles } from 'lucide-react';");
}

fs.writeFileSync('src/components/dashboard/ScheduleTab.tsx', content);
