const http = require('http');
fetch('http://localhost:3000/api/user/focus')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
