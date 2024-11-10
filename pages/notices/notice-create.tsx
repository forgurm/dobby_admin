import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axiosInstance from '@/lib/axios';

const NoticeEditor = dynamic(() => import('@/components/notices/NoticeEditor'), {
  ssr: false,
  loading: () => <div className="text-center py-4">에디터 로딩중...</div>,
});

interface Board {
  id: number;
  name: string;
}

export default function NoticeCreate() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [editor, setEditor] = useState<any>(null);
  const [exposureType, setExposureType] = useState<'ALL' | 'SELECTED' | 'NONE'>('NONE');
  const [selectedBoards, setSelectedBoards] = useState<number[]>([]);
  const [expireDate, setExpireDate] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axiosInstance.get('/api/boards');
      setBoards(response.data);
    } catch (error) {
      console.error('게시판 목록 조회 실패:', error);
    }
  };

  const handleEditorMount = (editorInstance: any) => {
    setEditor(editorInstance);
  };

  const handleBoardChange = (boardId: number) => {
    setSelectedBoards(prev => 
      prev.includes(boardId)
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!editor) return;

      const content = editor.getInstance()?.getHTML() || '';
      
      if (!title.trim() || !content.trim()) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('exposure_type', exposureType);
      if (exposureType === 'SELECTED') {
        formData.append('board_ids', JSON.stringify(selectedBoards));
      }
      if (expireDate) {
        formData.append('expire_date', expireDate);
      }

      files.forEach(file => {
        formData.append('files', file);
      });

      await axiosInstance.post('/api/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/notices');
    } catch (error) {
      console.error('공지사항 등록 실패:', error);
      alert('공지사항 등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">공지사항 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            노출 게시판
          </label>
          <div className="space-y-2">
            <div className="mb-4">
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  value="ALL"
                  checked={exposureType === 'ALL'}
                  onChange={(e) => setExposureType(e.target.value as 'ALL')}
                  className="form-radio"
                />
                <span className="ml-2">전체</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  value="SELECTED"
                  checked={exposureType === 'SELECTED'}
                  onChange={(e) => setExposureType(e.target.value as 'SELECTED')}
                  className="form-radio"
                />
                <span className="ml-2">게시판 선택</span>
              </label>
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  value="NONE"
                  checked={exposureType === 'NONE'}
                  onChange={(e) => setExposureType(e.target.value as 'NONE')}
                  className="form-radio"
                />
                <span className="ml-2">비노출</span>
              </label>
            </div>
            {exposureType === 'SELECTED' && (
              <div className="mt-4 space-y-2">
                {boards.map(board => (
                  <label key={board.id} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={selectedBoards.includes(board.id)}
                      onChange={() => handleBoardChange(board.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">{board.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            만료일
          </label>
          <input
            type="date"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <NoticeEditor
            height="500px"
            onMount={handleEditorMount}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            첨부 파일
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push('/notices')}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
}