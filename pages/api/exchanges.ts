import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // 데이터베이스 연결 설정

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const [rows] = await db.query(`
        SELECT 
          exchange_name, 
          exchange_code, 
          COUNT(*) as total_symbols, 
          SUM(CASE WHEN symbol_name = '' OR symbol_name IS NULL THEN 1 ELSE 0 END) as empty_symbol_names
        FROM exchange_info
        GROUP BY exchange_name, exchange_code
      `);
      return res.status(200).json(rows);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return res.status(500).json({ message: 'Error fetching exchanges' });
  }
} 