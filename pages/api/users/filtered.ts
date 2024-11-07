import { NextApiRequest, NextApiResponse } from 'next';
import { getFilteredUsers } from '../../../lib/users';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const filters = req.body;
      const users = await getFilteredUsers(filters);
      res.status(200).json(users);
    } catch (err) {
      console.error('Failed to fetch filtered users:', err);
      res.status(500).json({ error: 'Failed to fetch filtered users' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 