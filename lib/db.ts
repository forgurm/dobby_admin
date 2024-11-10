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

export interface QueryResult {
  affectedRows?: number;
  insertId?: number;
  [key: string]: any;
}

export async function queryDatabase<T extends QueryResult>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await db.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function querySingleResult<T extends QueryResult>(
  query: string, 
  params: (string | number | null)[]
): Promise<T | null> {
  try {
    const [rows] = await db.execute(query, params);
    const results = rows as T[];
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export interface User {
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
}