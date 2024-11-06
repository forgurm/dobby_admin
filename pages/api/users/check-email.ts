import type { NextApiRequest, NextApiResponse } from 'next';
import { checkEmailExists } from '../../../lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { emailid } = req.body;
    const exists = await checkEmailExists(emailid);
    res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ message: 'Error checking email' });
  }
} 