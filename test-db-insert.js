const db = require('./src/lib/yks-db-async').default;
const uuid = require('uuid');

async function test() {
  try {
    const res = await db.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('ogretmen');
    if (!res) { console.log('No teacher found'); return; }
    
    console.log('Teacher ID:', res.id);
    const classId = uuid.v4();
    const result = await db.prepare('INSERT INTO teacher_classes (id, teacher_id, class_name, class_code) VALUES (?, ?, ?, ?) RETURNING *')
      .run(classId, res.id, 'Test Sınıfı', 'ABCDEF');
      
    console.log('Insert Result:', result);
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
