import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // 데이터베이스 연결 설정

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'PUT') {
      const { symbols, exchange_code } = req.body;

      // 각 심볼에 대해 업데이트 쿼리 실행
      const updatePromises = symbols.map((symbol: any) =>
        db.query(
          'UPDATE exchange_info SET symbol_name = ? WHERE symbol_code = ? AND exchange_code = ?',
          [symbol.symbol_name, symbol.symbol_code, exchange_code]
        )
      );

      await Promise.all(updatePromises);

      return res.status(200).json({ message: 'Symbols updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error updating symbols:', error);
    return res.status(500).json({ message: 'Error updating symbols' });
  }
} 