import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase, QueryResult } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const boardId = Array.isArray(id) ? id[0] : id;

  if (!boardId) {
    return res.status(400).json({ message: 'Invalid board ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const board = await queryDatabase(
          'SELECT id, name, type_code FROM boards WHERE id = ? AND is_deleted = FALSE',
          [boardId]
        );

        if (!board || board.length === 0) {
          return res.status(404).json({ message: 'Board not found' });
        }

        return res.status(200).json(board[0]);

      case 'DELETE':
        const deleteResult = await queryDatabase(
          'UPDATE boards SET is_deleted = TRUE, updated_at = NOW() WHERE id = ? AND is_deleted = FALSE',
          [boardId]
        );
        return res.status(200).json({ message: 'Board deleted successfully' });

      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 