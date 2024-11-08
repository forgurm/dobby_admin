import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUser } from '../../../lib/users'; // lib/users.ts에 updateUser 함수가 있다고 가정

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { no, name, referral_exchange, referral_code, status, lv } = req.body;

    // lib/users.ts에 정의된 updateUser 함수를 사용하여 사용자 정보 업데이트
    const updatedUser = await updateUser({
      no,
      name,
      referral_exchange,
      referral_code,
      status,
      lv: parseInt(lv, 10),
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
} 