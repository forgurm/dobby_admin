import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase, QueryResult } from '@/lib/db';

interface CommonCode extends QueryResult {
  id: number;
  group_code: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { group_code } = req.query;

  try {
    if (req.method === 'GET') {
      if (!group_code) {
        return res.status(400).json({ message: 'Group code is required' });
      }

      const codes = await queryDatabase<CommonCode>(
        'SELECT * FROM common_codes WHERE group_code = ? AND is_active = TRUE ORDER BY sort_order',
        [group_code]
      );

      res.status(200).json(codes);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 