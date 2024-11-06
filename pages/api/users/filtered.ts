import type { NextApiRequest, NextApiResponse } from 'next';
import { getFilteredUsers } from '../../../lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filters = req.body;
    const users = await getFilteredUsers({
      level: filters.level ? parseInt(filters.level) : undefined,
      hasReferral: filters.hasReferral === 'true',
      searchTerm: filters.searchTerm
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching filtered users:', error);
    res.status(500).json({ message: 'Error fetching filtered users' });
  }
} 