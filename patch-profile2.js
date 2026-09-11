const fs = require('fs');
let content = fs.readFileSync('src/app/profil/page.tsx', 'utf8');

const target1 = `        {/* Sol Panel: Kullanıcı Kartı */}
        <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>`;

const replacement1 = `        {/* Sol Panel: Kullanıcı Kartı ve Öğretmen Widget'ı */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>`;

content = content.replace(target1, replacement1);

const target2 = `        </motion.div>

        {/* Sağ Panel: Detaylar */}`;

const replacement2 = `        </motion.div>
        
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
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '12px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', outline: 'none' }}
                />
                <button 
                  onClick={handleJoinTeacher}
                  disabled={joining || !inviteCode}
                  className="btn-interactive"
                  style={{ background: 'var(--brand-primary)', border: 'none', color: '#fff', padding: '0 1.25rem', borderRadius: '12px', fontWeight: 600, opacity: (!inviteCode || joining) ? 0.5 : 1, cursor: 'pointer' }}
                >
                  {joining ? '...' : 'Katıl'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sağ Panel: Detaylar */}`;

content = content.replace(target2, replacement2);

fs.writeFileSync('src/app/profil/page.tsx', content);
