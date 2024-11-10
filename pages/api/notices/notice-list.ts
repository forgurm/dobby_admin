import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const notices = await queryDatabase(
      'SELECT id, title, content, created_at FROM notices ORDER BY created_at DESC',
      []
    );
    
    res.status(200).json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 