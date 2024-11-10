import { NextApiRequest, NextApiResponse } from 'next';
import { querySingleResult, QueryResult } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await querySingleResult<QueryResult>(
      `INSERT INTO notices (title, content, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [req.body.title, req.body.content]
    );

    if (!result) {
      throw new Error('Failed to create notice');
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 