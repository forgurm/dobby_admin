import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const boardId = Array.isArray(id) ? id[0] : id;

  if (!boardId) {
    return res.status(400).json({ message: 'Invalid board ID' });
  }

  try {
    if (req.method === 'GET') {
      const board = await queryDatabase(
        'SELECT * FROM boards WHERE id = ? AND is_deleted = FALSE',
        [boardId]
      );
      if (Array.isArray(board) && board.length > 0) {
        res.status(200).json(board[0]);
      } else {
        res.status(404).json({ message: 'Board not found' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 