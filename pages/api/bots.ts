import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // 데이터베이스 연결 설정

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT botName, botPath FROM bot_config');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { botName, botPath } = req.body;
      await db.query('INSERT INTO bot_config (botName, botPath) VALUES (?, ?)', [botName, botPath]);
      const [updatedRows] = await db.query('SELECT botName, botPath FROM bot_config');
      return res.status(200).json(updatedRows);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling bot configs:', error);
    return res.status(500).json({ message: 'Error handling bot configs' });
  }
} 