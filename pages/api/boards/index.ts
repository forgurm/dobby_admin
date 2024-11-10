import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const boards = await queryDatabase(
        'SELECT * FROM boards WHERE is_deleted = FALSE ORDER BY id DESC'
      );
      res.status(200).json(boards);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 