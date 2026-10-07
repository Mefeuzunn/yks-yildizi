import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.zncqndfghqkafuaswphq:Muge_Ve_Efe2008@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(connectionString, { ssl: 'require', max: 20 });

const db = {
  prepare: (queryStr: string) => {
    let idx = 1;
    const pgQuery = queryStr.replace(/\?/g, () => `$${idx++}`);
    
    return {
      get: async (...args: any[]) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return res[0] || null;
        } catch (e: any) {
          console.error('DB GET ERROR:', e?.message, pgQuery);
          throw e;
        }
      },
      all: async (...args: any[]) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return res;
        } catch (e: any) {
          console.error('DB ALL ERROR:', e?.message, pgQuery);
          throw e;
        }
      },
      run: async (...args: any[]) => {
        try {
          const res = await sql.unsafe(pgQuery, args);
          return { changes: res.count, lastInsertRowid: null };
        } catch (e: any) {
          console.error('DB RUN ERROR:', e?.message, pgQuery);
          throw e;
        }
      }
    };
  },
  transaction: (callback: (...args: any[]) => any) => {
    return async (...args: any[]) => {
      return await callback(...args);
    };
  }
};

export default db;
