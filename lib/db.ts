import mysql from 'mysql2/promise';

declare global {
  let dbPool: mysql.Pool | undefined;
}

const globalWithDbPool = global as typeof globalThis & { dbPool?: mysql.Pool };

export const db = globalWithDbPool.dbPool || mysql.createPool({
  host: 'forgurm.iptime.org',
  user: 'forgurm',
  password: 'asdfqwer1!',
  database: 'tpsl',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

if (!globalWithDbPool.dbPool) {
  globalWithDbPool.dbPool = db;
}

export async function queryDatabase(query: string, params: Array<string | number>) {
  const connection = await db.getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export type User = {
  no: number;
  emailid: string;
  name: string;
  phone: string;
  add1: string;
  add2: string | null;
  referral_exchange: string | null;
  referral_code: string | null;
  lv: number;
  status: string;
  memo: string | null;
  creat_dt: Date;
  update_dt: Date;
  password?: string;
};