import { NextApiRequest, NextApiResponse } from 'next';
import { queryDatabase } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        try {
          const boards = await queryDatabase(
            `SELECT b.*, c.name as type_name 
             FROM boards b 
             LEFT JOIN common_codes c ON b.type_code = c.code 
             WHERE b.is_deleted = FALSE AND c.group_code = 'BOARD_TYPE' 
             ORDER BY b.created_at DESC`,
            []
          );
          console.log('Fetched boards:', boards);
          return res.status(200).json(boards);
        } catch (error) {
          console.error('Error fetching boards:', error);
          return res.status(500).json({ error: 'Failed to fetch boards', details: error });
        }

      case 'POST':
        try {
          const { name, type_code } = req.body;
          console.log('Received POST request with data:', { name, type_code });
          
          // 입력값 검증
          if (!name || !type_code) {
            return res.status(400).json({ error: 'Name and type_code are required' });
          }

          // common_codes 테이블에서 type_code 유효성 검사
          const validCode = await queryDatabase(
            'SELECT code FROM common_codes WHERE group_code = ? AND code = ?',
            ['BOARD_TYPE', type_code]
          );

          if (!validCode || (Array.isArray(validCode) && validCode.length === 0)) {
            return res.status(400).json({ error: 'Invalid type_code' });
          }

          // 게시판 생성
          const result = await queryDatabase(
            'INSERT INTO boards (name, type_code) VALUES (?, ?)',
            [name, type_code]
          );
          
          console.log('Insert result:', result);
          return res.status(201).json(result);
        } catch (error) {
          console.error('Error creating board:', error);
          if (error instanceof Error) {
            return res.status(500).json({ 
              error: 'Failed to create board', 
              details: {
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
              }
            });
          }
          return res.status(500).json({ error: 'Failed to create board', details: error });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in board controller:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error 
    });
  }
} 