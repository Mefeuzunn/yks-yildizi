const fs = require('fs');
let content = fs.readFileSync('src/app/profil/page.tsx', 'utf8');

// Add invite code state and handle
const stateRegex = /const \[loading, setLoading\] = useState\(true\);/;
const newState = `const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinTeacher = async () => {
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch('/api/student/join-teacher', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: inviteCode.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Başarıyla öğretmeninize bağlandınız!');
        setInviteCode('');
      } else {
        alert(data.error || 'Bir hata oluştu');
      }
    } catch(e) {
      alert('Sunucu hatası');
    } finally {
      setJoining(false);
    }
  };`;
content = content.replace(stateRegex, newState);

// Add the UI element in the left panel
const leftPanelRegex = /<div style=\{\{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' \}\}>\s*\{\/\* Sol Panel: Kullanıcı Kartı \*\/\}/;
const newLeftPanel = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Sol Panel: Kullanıcı Kartı */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>`;

content = content.replace(leftPanelRegex, newLeftPanel);

const rightPanelRegex = /\{\/\* Sağ Panel: İstatistikler ve Rozetler \*\/\}/;
const newRightPanel = `</motion.div>
          {!isTeacher && (
            <motion.div className="premium-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>👨‍🏫 Öğretmene Bağlan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Öğretmeninizin size verdiği 6 haneli davet kodunu girerek sınıfına katılın.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  value={inviteCode} 
                  onChange={e => setInviteCode(e.target.value)}
                  placeholder="Kod: ABCDEF"
                  maxLength={6}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '12px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <button 
                  onClick={handleJoinTeacher}
                  disabled={joining || !inviteCode}
                  className="btn-interactive"
                  style={{ background: 'var(--brand-primary)', color: '#fff', padding: '0 1.25rem', borderRadius: '12px', fontWeight: 600, opacity: (!inviteCode || joining) ? 0.5 : 1 }}
                >
                  {joining ? '...' : 'Katıl'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Sağ Panel: İstatistikler ve Rozetler */}`;

// Let's modify the way we insert this to avoid breaking tags
content = content.replace('</motion.div>\n\n        {/* Sağ Panel: İstatistikler ve Rozetler */}', newRightPanel);

fs.writeFileSync('src/app/profil/page.tsx', content);
