import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '../../lib/axios';

interface Board {
  id: number;
  name: string;
  type_code: string;
  type_name: string;
  created_at: string;
}

export default function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axiosInstance.get('/api/boards/board-controller');
        setBoards(response.data);
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    fetchBoards();
  }, []);

  const handleDelete = async (boardId: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/api/boards/board-detail-controller?id=${boardId}`);
        setBoards(boards.filter(board => board.id !== boardId));
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판 관리</h1>
        <Link href="/boards/board-create" legacyBehavior>
          <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            게시판 추가
          </a>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                번호
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                게시판명
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                게시판 타입
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                생성일
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {boards.map((board, index) => (
              <tr key={board.id}>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {board.name}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {board.type_name}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {new Date(board.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  <div className="flex space-x-2">
                    <Link href={`/boards/board-edit?id=${board.id}`} legacyBehavior>
                      <a className="text-blue-500 hover:text-blue-700">수정</a>
                    </Link>
                    <button
                      onClick={() => handleDelete(board.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 