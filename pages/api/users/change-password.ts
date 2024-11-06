import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyCurrentPassword, updatePassword } from '../../../lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, currentPassword, newPassword } = req.body;

    // 현재 비밀번호 확인
    const isValid = await verifyCurrentPassword(userId, currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // 새 비밀번호로 업데이트
    await updatePassword(userId, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    if (error.message === 'New password must be different from the current password') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating password' });
  }
} 