import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db'; // 데이터베이스 연결 설정

type AlertInfo = {
  id: number;
  name: string;
  lv: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT id, name, lv FROM alert_info');
      return res.status(200).json(rows);
    }

    if (req.method === 'PUT') {
      const alertInfos: AlertInfo[] = req.body;

      const updatePromises = alertInfos.map((info: AlertInfo) =>
        db.query(
          'UPDATE alert_info SET name = ?, lv = ? WHERE id = ?',
          [info.name, info.lv, info.id]
        )
      );

      await Promise.all(updatePromises);

      return res.status(200).json({ message: 'Alert infos updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling alert infos:', error);
    return res.status(500).json({ message: 'Error handling alert infos' });
  }
} 