import postgres from 'postgres';

// Ensure we have a database URL
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

// Create a singleton postgres client
const sql = postgres(connectionString, { ssl: 'require', max: 10 });

export default sql;
