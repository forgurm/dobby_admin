import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // 데이터베이스 연결 설정

type SymbolInfo = {
  // 여기에 실제 필드와 타입을 정의하세요.
  id: number;
  symbol: string;
  // 다른 필드들...
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'PUT') {
      const symbolInfos: SymbolInfo[] = req.body;

      const updatePromises = symbolInfos.map((info: SymbolInfo) =>
        db.query(
          'UPDATE symbol_info SET symbol = ? WHERE id = ?',
          [info.symbol, info.id]
        )
      );

      await Promise.all(updatePromises);

      return res.status(200).json({ message: 'Symbol infos updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error updating symbols:', error);
    return res.status(500).json({ message: 'Error updating symbols' });
  }
} 