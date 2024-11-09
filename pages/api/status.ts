import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/db';
import { RowDataPacket } from 'mysql2';

// 쿼리 결과의 타입 정의
interface StatusRow extends RowDataPacket {
  Variable_name: string;
  Value: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [rows] = await db.query<StatusRow[]>(`SHOW STATUS LIKE 'Threads_connected';`);
    const threadsConnected = rows[0]?.Value || '0';
    res.status(200).json({ threadsConnected: parseInt(threadsConnected, 10) });
  } catch (error) {
    console.error('Error fetching threads connected:', error);
    res.status(500).json({ message: 'Error fetching threads connected' });
  }
} 