const fs = require('fs');

let content = fs.readFileSync('src/app/ogretmen/dashboard/page.tsx', 'utf8');

// 1. Add "Davet Kodu" display at the top header
const headerRegex = /<h1 className="header-title">Merhaba, Öğretmen <span style={{ color: 'var\(--brand-primary\)' }}>\{user\?.username\}<\/span><\/h1>\s*<p className="header-subtitle">YKS Yıldızı'na hoş geldiniz\./;
const newHeader = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="header-title">Merhaba, Öğretmen <span style={{ color: 'var(--brand-primary)' }}>{user?.username}</span></h1>
            <p className="header-subtitle">YKS Yıldızı'na hoş geldiniz.</p>
          </div>
          {user?.invite_code && (
            <div className="premium-card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 2 }}>Öğrenci Davet Kodunuz</div>
                <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, letterSpacing: '0.1em' }}>{user.invite_code}</div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(user.invite_code); alert('Kopyalandı!'); }} className="btn-interactive" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.4rem 0.8rem', borderRadius: 8, fontSize: '0.85rem' }}>
                Kopyala
              </button>
            </div>
          )}
        </div>`;
content = content.replace(headerRegex, newHeader);

// 2. Add assignStudent function
const handlersSection = /\/\/ ── Handlers ──/;
const assignFn = `// ── Handlers ──
  const handleAssignStudent = async (studentId: string, classId: string) => {
    try {
      const res = await fetch('/api/ogretmen/ogrenciler/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, class_id: classId })
      });
      if (res.ok) {
        fetchStudents();
      } else {
        alert('Öğrenci sınıfı değiştirilirken hata oluştu.');
      }
    } catch (e) {
      console.error(e);
    }
  };\n`;
content = content.replace(handlersSection, assignFn);

// 3. Add Sınıf dropdown to students table
// Look for the columns in the students table
const tableHeaderRegex = /\{ label: '', field: null \},/
const tableHeaderReplace = `{ label: 'Sınıf', field: 'class_id' },\n                        { label: '', field: null },`
content = content.replace(tableHeaderRegex, tableHeaderReplace);

// Let's replace the row rendering for students
const rowRenderRegex = /<td style=\{\{ padding: '1rem', borderBottom: '1px solid rgba\(255,255,255,0.05\)' \}\}>\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap' \}\}>[\s\S]*?<\/td>/;
// Wait, I need to find the entire row render. It's inside students table body.
