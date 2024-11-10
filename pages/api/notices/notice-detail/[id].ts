import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await queryDatabase(
        'SELECT * FROM notices WHERE id = $1',
        [id]
      );
      
      if (result.length === 0) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error fetching notice:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, content } = req.body;
      
      const result = await queryDatabase(
        'UPDATE notices SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [title, content, id]
      );
      
      if (result.length === 0) {
        return res.status(404).json({ message: 'Notice not found' });
      }
      
      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error updating notice:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 