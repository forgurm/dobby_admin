import { NextApiRequest, NextApiResponse } from 'next';
import { getFilteredUsers } from '../../../lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Search API - Request Method:', req.method);
  console.log('Search API - Request Body:', req.body);
  console.log('Search API - Request Query:', req.query);

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const filters = req.body;
      console.log('Search API - Filters:', filters);
      const users = await getFilteredUsers(filters);
      console.log('Search API - Results:', users);
      res.status(200).json(users);
    } catch (error) {
      console.error('Search API - Error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 