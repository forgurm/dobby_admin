import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { exchange } = req.query;

      const [rows] = await db.query(`
        SELECT symbol_name, symbol_code
        FROM exchange_info
        WHERE exchange_code = ?
        ORDER BY symbol_name ASC
      `, [exchange]);

      return res.status(200).json(rows);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching symbols:', error);
    return res.status(500).json({ message: 'Error fetching symbols' });
  }
} 