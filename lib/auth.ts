import { db } from './db';
import type { RowDataPacket } from 'mysql2/promise';

export async function verifyAdmin(id: string, password: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE emailid = ? AND password = ?',
    [id, password]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function verifyCurrentPassword(userId: number, currentPassword: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT password FROM users WHERE no = ? AND password = ?',
    [userId, currentPassword]
  );
  return rows.length > 0;
} 