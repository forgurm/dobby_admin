import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';

type Symbol = {
  symbolName: string;
  symbolCode: string;
  exchangeCode: string;
};

// 데이터베이스 쿼리 결과 타입 정의
type QueryResult = {
  affectedRows: number;
};

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

    if (req.method === 'PUT') {
      const { symbols }: { symbols: Symbol[] } = req.body;

      const updatePromises = symbols.map(({ symbolName, symbolCode, exchangeCode }) => {
        return db.query(`
          UPDATE exchange_info
          SET symbol_name = ?
          WHERE symbol_code = ? AND exchange_code = ?
        `, [symbolName, symbolCode, exchangeCode]);
      });

      const results = await Promise.all(updatePromises);

      // 각 쿼리 결과에서 affectedRows를 안전하게 접근
      const affectedRows = results.reduce((sum, result) => {
        const [queryResult] = result as QueryResult[];
        return sum + (queryResult.affectedRows || 0);
      }, 0);

      if (affectedRows > 0) {
        return res.status(200).json({ message: 'Symbols updated successfully' });
      } else {
        return res.status(404).json({ message: 'No symbols were updated' });
      }
    } else {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error updating symbols:', error);
    return res.status(500).json({ message: 'Error updating symbols' });
  }
} 