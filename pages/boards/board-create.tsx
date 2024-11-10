import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/lib/axios';

interface CommonCode {
  id: number;
  code: string;
  name: string;
}

export default function BoardCreate() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type_code: ''
  });
  const [boardTypes, setBoardTypes] = useState<CommonCode[]>([]);

  useEffect(() => {
    const fetchBoardTypes = async () => {
      try {
        const response = await axiosInstance.get('/api/common-codes/code-controller', {
          params: { group_code: 'BOARD_TYPE' }
        });
        setBoardTypes(response.data);
        
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            type_code: response.data[0].code
          }));
        }
      } catch (error) {
        console.error('Error fetching board types:', error);
      }
    };

    fetchBoardTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/boards/board-controller', formData);
      router.push('/boards');
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">게시판 추가</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            게시판명
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            게시판 타입
          </label>
          <select
            value={formData.type_code}
            onChange={(e) => setFormData({ ...formData, type_code: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          >
            {boardTypes.map((type) => (
              <option key={type.id} value={type.code}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
} 