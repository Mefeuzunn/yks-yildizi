const fetch = require('node-fetch');

async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test_teacher_1789072992500',
        password: 'password123'
      })
    });
    const data = await res.json();
    console.log(res.status, data);
  } catch(e) {
    console.error(e);
  }
}
run();
