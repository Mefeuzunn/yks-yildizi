const fs = require('fs');

let schema = fs.readFileSync('schema.sql', 'utf8');

// Replacements for Postgres
schema = schema.replace(/AUTOINCREMENT/g, ''); // We will handle this with SERIAL or just leave it for TEXT PRIMARY KEY
schema = schema.replace(/INTEGER PRIMARY KEY/g, 'SERIAL PRIMARY KEY');
schema = schema.replace(/DATETIME/g, 'TIMESTAMP');

// Remove sqlite_sequence if exists
schema = schema.split('\n').filter(line => !line.includes('sqlite_sequence')).join('\n');

fs.writeFileSync('schema_pg.sql', schema);
