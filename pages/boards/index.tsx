import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axiosInstance from '@/lib/axios';
import Popup from '@/components/Popup';

interface Board {
  id: number;
  name: string;
  type_code: string;
  type_name: string;
  created_at: string;
}

export default function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isErrorPopupOpen, setErrorPopupOpen] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axiosInstance.get('/api/boards');
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedBoardId === null) return;

    try {
      const response = await axiosInstance.post('/api/boards/delete', { id: selectedBoardId });
      //console.log('게시판 삭제:', response);
      setPopupOpen(false);
      fetchBoards(); // 목록 새로고침
      //router.push('/boards'); // 삭제 후 게시판 목록 페이지로 리다이렉트
    } catch (error) {
      console.error('Error deleting board:', error);
      setErrorMessage('삭제에 실패했습니다.');
      setPopupOpen(false); // 실패 시에도 팝업 닫기
      setErrorPopupOpen(true);
    }
  };

  const openPopup = (boardId: number) => {
    setSelectedBoardId(boardId);
    setPopupOpen(true);
  };

  return (
    <div className="p-4">
      <Popup
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onCancel={() => setPopupOpen(false)}
        isOpen={isPopupOpen}
      />

      <Popup
        title="오류"
        message={errorMessage}
        onConfirm={() => setErrorPopupOpen(false)}
        onCancel={() => setErrorPopupOpen(false)}
        isOpen={isErrorPopupOpen}
      />

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
                      onClick={() => openPopup(board.id)}
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