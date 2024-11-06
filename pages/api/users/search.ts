import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db';
import type { RowDataPacket } from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { status, level, searchTerm } = req.body;
    let query = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (level) {
      query += ' AND lv = ?';
      params.push(parseInt(level));
    }

    if (searchTerm) {
      query += ' AND (emailid LIKE ? OR name LIKE ? OR phone LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY creat_dt DESC';

    const [rows] = await db.query<RowDataPacket[]>(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
} 