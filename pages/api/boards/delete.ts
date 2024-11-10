import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Board ID is required' });
  }

  try {
    const result = await queryDatabase(
      'UPDATE boards SET is_deleted = TRUE, updated_at = NOW() WHERE id = ? AND is_deleted = FALSE',
      [id]
    );

    return res.status(200).json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 