import { RowDataPacket, FieldPacket } from 'mysql2';
import { db } from './db';

export async function verifyAdmin(id: string, password: string) {
  const [rows] = (await db.query(
    'SELECT * FROM users WHERE emailid = ? AND password = ?',
    [id, password]
  )) as [RowDataPacket[], FieldPacket[]];

  if (rows.length > 0) {
    return rows[0];
  }

  return null;
}

export async function verifyCurrentPassword(userId: number, currentPassword: string) {
  const [rows] = (await db.query(
    'SELECT password FROM users WHERE no = ? AND password = ?',
    [userId, currentPassword]
  )) as [RowDataPacket[], FieldPacket[]];

  return rows.length > 0;
} 