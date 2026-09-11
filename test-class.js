const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ogretmen/siniflar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'yks_session=test_ogretmen' // Assuming we can use a mock cookie or we need the actual one. Let me check the users.
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.write(JSON.stringify({ class_name: 'Deneme Sınıfı' }));
req.end();
