import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'forgurm.iptime.org',
  user: 'forgurm',
  password: 'asdfqwer1!',
  database: 'tpsl',
  charset: 'utf8mb4'
});

export async function verifyAdmin(id: string, password: string) {
  console.log('Verifying admin with ID:', id);
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE emailid = ? AND password = ?', [id, password]);
  console.log('Query result:', rows);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}