import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const boards = await queryDatabase(
      'SELECT DISTINCT id, name FROM boards WHERE name != "공지사항" AND is_deleted = 0 ORDER BY id ASC',
      []
    );
    
    res.status(200).json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : error 
    });
  }
} 