import { db } from './db';
import type { RowDataPacket } from 'mysql2/promise';
import type { User } from './db';

export async function getUsers() {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT * FROM users ORDER BY creat_dt DESC'
  );
  return rows as User[];
}

export async function getUserStats() {
  const [referralUsers] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users WHERE referral_code IS NOT NULL'
  );
  const [nonReferralUsers] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users WHERE referral_code IS NULL'
  );
  const [rejectedUsers] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users WHERE referral_exchange = ?',
    ['rejected']
  );

  return {
    referralCount: referralUsers[0].count,
    nonReferralCount: nonReferralUsers[0].count,
    rejectedCount: rejectedUsers[0].count
  };
}

export async function updateUser(user: Partial<User> & { no: number }) {
  const [result] = await db.query(
    'UPDATE users SET name = ?, phone = ?, referral_code = ?, referral_exchange = ?, lv = ?, status = ? WHERE no = ?',
    [user.name, user.phone, user.referral_code, user.referral_exchange, user.lv, user.status, user.no]
  );
  return result;
}

export async function updatePassword(userId: number, newPassword: string) {
  // 이전 비밀번호와 동일한지 확인
  const [prevPassword] = await db.query<RowDataPacket[]>(
    'SELECT password FROM users WHERE no = ?',
    [userId]
  );

  if (prevPassword[0]?.password === newPassword) {
    throw new Error('New password must be different from the current password');
  }

  const [result] = await db.query(
    'UPDATE users SET password = ? WHERE no = ?',
    [newPassword, userId]
  );
  return result;
}

export async function createUser(user: Omit<User, 'no' | 'creat_dt' | 'update_dt'>) {
  const [result] = await db.query(
    'INSERT INTO users (emailid, name, phone, referral_code, referral_exchange, lv, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [user.emailid, user.name, user.phone, user.referral_code, user.referral_exchange, user.lv, user.status, user.password]
  );
  return result;
}

export async function checkEmailExists(emailid: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users WHERE emailid = ?',
    [emailid]
  );
  return rows[0].count > 0;
}

export async function getFilteredUsers(filters: {
  level?: number;
  hasReferral?: boolean;
  searchTerm?: string;
}) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params: any[] = [];

  if (filters.level !== undefined) {
    query += ' AND lv = ?';
    params.push(filters.level);
  }

  if (filters.hasReferral !== undefined) {
    if (filters.hasReferral) {
      query += ' AND referral_code IS NOT NULL';
    } else {
      query += ' AND referral_code IS NULL';
    }
  }

  if (filters.searchTerm) {
    query += ' AND (emailid LIKE ? OR name LIKE ? OR phone LIKE ?)';
    const searchPattern = `%${filters.searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY creat_dt DESC';

  const [rows] = await db.query<RowDataPacket[]>(query, params);
  return rows as User[];
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const [result] = await db.query(
    'UPDATE users SET password = ? WHERE no = ?',
    [newPassword, userId]
  );
  return result;
}

export async function updateUserDetails(user: Partial<User> & { no: number }) {
  const [result] = await db.query(
    `UPDATE users 
     SET name = ?, phone = ?, add1 = ?, add2 = ?, 
         referral_code = ?, referral_exchange = ?, lv = ?, status = ?
     WHERE no = ?`,
    [
      user.name,
      user.phone,
      user.add1,
      user.add2,
      user.referral_code,
      user.referral_exchange,
      user.lv,
      user.status,
      user.no
    ]
  );
  return result;
} 