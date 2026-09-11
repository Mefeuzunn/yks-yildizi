const fs = require('fs');

let content = fs.readFileSync('src/app/ogretmen/dashboard/page.tsx', 'utf8');

const handlersSection = '// ── Handlers ──';
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

// Check if invite code UI is there
const inviteCodeExists = content.includes('Öğrenci Davet Kodunuz');
if (!inviteCodeExists) {
  const headerRegex = /<h1 className="header-title">Merhaba, Öğretmen <span style=\{\{ color: 'var\(--brand-primary\)' \}\}>\{user\?.username\}<\/span><\/h1>\s*<p className="header-subtitle">YKS Yıldızı'na hoş geldiniz\.<\/p>/;
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
}

fs.writeFileSync('src/app/ogretmen/dashboard/page.tsx', content);
