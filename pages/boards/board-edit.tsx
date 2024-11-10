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

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await axiosInstance.get(`/api/boards/board-detail-controller?id=${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching board:', error);
      }
    };

    const fetchBoardTypes = async () => {
      try {
        const response = await axiosInstance.get('/api/common-codes/code-controller', {
          params: { group_code: 'BOARD_TYPE' }
        });
        setBoardTypes(response.data);
      } catch (error) {
        console.error('Error fetching board types:', error);
      }
    };

    if (id) {
      fetchBoard();
      fetchBoardTypes();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/boards/board-detail-controller?id=${id}`, formData);
      router.push('/boards/board-list');
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">게시판 수정</h1>
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