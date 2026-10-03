import postgres from 'postgres';

// Ensure we have a database URL
const connectionString = process.env.DATABASE_URL || '';
if (!connectionString && process.env.NODE_ENV === 'production') {
  console.error('FATAL: DATABASE_URL environment variable is missing.');
}

// Create a singleton postgres client
const sql = postgres(connectionString || 'postgresql://localhost:5432/postgres', { ssl: 'require', max: 10 });

export default sql;
