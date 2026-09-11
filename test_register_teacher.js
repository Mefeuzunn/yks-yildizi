const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_teacher_' + Date.now(),
        password: 'password123',
        role: 'ogretmen',
        brans: 'Fizik',
        kurum: 'Test Lisesi'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) {
    console.error(e);
  }
}
run();
