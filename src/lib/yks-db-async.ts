import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || '';
if (!connectionString && process.env.NODE_ENV === 'production') {
  console.error('FATAL: DATABASE_URL environment variable is missing.');
}
const sql = postgres(connectionString || 'postgresql://localhost:5432/postgres', { ssl: 'require', max: 20 });

const db = {
  prepare: (queryStr) => {
    let idx = 1;
    const pgQuery = queryStr.replace(/\?/g, () => `$${idx++}`);
    
    return {
      get: async (...args) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return res[0] || null;
        } catch (e) {
          console.error('DB GET ERROR:', e.message, pgQuery);
          throw e;
        }
      },
      all: async (...args) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return res;
        } catch (e) {
          console.error('DB ALL ERROR:', e.message, pgQuery);
          throw e;
        }
      },
      run: async (...args) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return { changes: res.count, lastInsertRowid: null };
        } catch (e) {
          console.error('DB RUN ERROR:', e.message, pgQuery);
          throw e;
        }
      }
    };
  },
  transaction: (callback) => {
    return async (...args) => {
      return await callback(...args);
    };
  }
};

export default db;
