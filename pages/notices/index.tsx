import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import Popup from '@/components/Popup';

interface Board {
  id: number;
  name: string;
}

interface Notice {
  id: number;
  title: string;
  created_at: string;
  exposure_type: 'ALL' | 'SELECTED' | 'NONE';
  board_ids: number[] | null;
  expire_date: string | null;
}

interface SearchParams {
  title?: string;
  startDate?: string;
  endDate?: string;
  exposureType?: 'ALL' | 'SELECTED' | 'NONE' | '';
  boardId?: number;
  excludeExpired: boolean;
}

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    title: '',
    startDate: '',
    endDate: '',
    exposureType: '',
    boardId: undefined,
    excludeExpired: true
  });
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isErrorPopupOpen, setErrorPopupOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.startDate) queryParams.append('startDate', searchParams.startDate);
      if (searchParams.endDate) queryParams.append('endDate', searchParams.endDate);
      if (searchParams.exposureType) queryParams.append('exposureType', searchParams.exposureType);
      if (searchParams.boardId) queryParams.append('boardId', searchParams.boardId.toString());
      if (searchParams.excludeExpired) queryParams.append('excludeExpired', 'true');

      const response = await axiosInstance.get(`/api/notices?${queryParams.toString()}`);
      setNotices(response.data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBoards();
    fetchNotices();
  }, [searchParams, fetchNotices]);

  const fetchBoards = async () => {
    try {
      const response = await axiosInstance.get('/api/boards');
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  const resetSearch = () => {
    setSearchParams({
      title: '',
      startDate: '',
      endDate: '',
      exposureType: '',
      boardId: undefined,
      excludeExpired: true
    });
  };

  const handleDelete = async () => {
    if (selectedNoticeId === null) return;

    try {
      await axiosInstance.delete(`/api/notices/${selectedNoticeId}`);
      setPopupOpen(false);
      fetchNotices(); // 목록 새로고침
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      setErrorMessage('공지사항 삭제에 실패했습니다.');
      setPopupOpen(false); // 실패 시에도 팝업 닫기
      setErrorPopupOpen(true);
    }
  };

  const openPopup = (noticeId: number) => {
    setSelectedNoticeId(noticeId);
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
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <Link href="/notices/notice-create" legacyBehavior>
          <a className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            공지사항 추가
          </a>
        </Link>
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={searchParams.title}
              onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="제목 검색"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              생성일 범위
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <span className="self-center">~</span>
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              노출 상태
            </label>
            <select
              value={searchParams.exposureType}
              onChange={(e) => setSearchParams(prev => ({ ...prev, exposureType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">전체</option>
              <option value="NONE">비노출</option>
              {boards.map(board => (
                <option key={board.id} value={board.name}>{board.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              만료된 공지
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={searchParams.excludeExpired}
                onChange={(e) => setSearchParams(prev => ({ ...prev, excludeExpired: e.target.checked }))}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-600">만료된 공지 제외</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={resetSearch}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            초기화
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </form>

      {/* 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                번호
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                제목
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                노출 상태
              </th>
              <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                만료일
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
            {notices.map((notice, index) => (
              <tr key={notice.id}>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  <Link href={`/notices/${notice.id}`} legacyBehavior>
                    <a className="text-blue-500 hover:text-blue-700">{notice.title}</a>
                  </Link>
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {notice.exposure_type === 'ALL' && '전체 게시판'}
                  {notice.exposure_type === 'SELECTED' && '선택 게시판'}
                  {notice.exposure_type === 'NONE' && '비노출'}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {notice.expire_date ? new Date(notice.expire_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  {new Date(notice.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-xs whitespace-nowrap text-left">
                  <div className="flex space-x-2">
                    <Link href={`/notices/${notice.id}`} legacyBehavior>
                      <a className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">
                        수정
                      </a>
                    </Link>
                    <button
                      onClick={() => openPopup(notice.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
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