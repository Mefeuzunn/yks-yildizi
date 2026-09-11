const fs = require('fs');

let content = fs.readFileSync('src/app/ogretmen/dashboard/page.tsx', 'utf8');

// Add the column header
const searchStr = "{ label: 'Streak', field: 'streak_days' },";
const replaceStr = "{ label: 'Streak', field: 'streak_days' },\n                        { label: 'Sınıf', field: 'class_id' },";
content = content.replace(searchStr, replaceStr);

// Add the td for assigning the class
const tdStr = `                          <span style={{ color: s.streak_days > 0 ? '#f59e0b' : '#6b7280', fontWeight: 700 }}>
                            {s.streak_days > 0 ? \`\${s.streak_days} 🔥\` : '—'}
                          </span>
                        </td>`;
const newTdStr = `                          <span style={{ color: s.streak_days > 0 ? '#f59e0b' : '#6b7280', fontWeight: 700 }}>
                            {s.streak_days > 0 ? \`\${s.streak_days} 🔥\` : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select 
                            value={s.class_id || ''} 
                            onChange={(e) => handleAssignStudent(s.id, e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.3rem', borderRadius: '6px', fontSize: '0.8rem' }}
                          >
                            <option value="">-- Havuz (Sınıfsız) --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                          </select>
                        </td>`;
content = content.replace(tdStr, newTdStr);

fs.writeFileSync('src/app/ogretmen/dashboard/page.tsx', content);
