import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/lib/axios';

interface Board {
  id: number;
  name: string;
  type_code: string;
}

export default function BoardEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<Board>({ id: 0, name: '', type_code: '' });

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await axiosInstance.get(`/api/boards/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };

    if (id) {
      fetchBoard();
    }
  }, [id]);

  // ... 나머지 코드
} 