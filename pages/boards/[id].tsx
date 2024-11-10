import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';

interface CommonCode {
  id: number;
  code: string;
  name: string;
}

interface Board {
  id: number;
  name: string;
  type_code: string;
}

export default function BoardEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<Board>({ id: 0, name: '', type_code: '' });
  const [boardTypes, setBoardTypes] = useState<CommonCode[]>([]);

  // ... 기존 코드 유지 ...
} 