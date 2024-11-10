import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axiosInstance from '@/lib/axios';
import { EditorInstance } from '@/types/editor';

const NoticeEditor = dynamic(() => import('@/components/notices/NoticeEditor'), {
  ssr: false,
  loading: () => <div className="text-center py-4">에디터 로딩중...</div>,
});

interface Board {
  id: number;
  name: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  file_urls: string[];
  exposure_type: 'ALL' | 'SELECTED' | 'NONE';
  board_ids?: number[];
  expire_date?: string;
}

export default function NoticeEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [exposureType, setExposureType] = useState<'ALL' | 'SELECTED' | 'NONE'>('NONE');
  const [selectedBoards, setSelectedBoards] = useState<number[]>([]);
  const [expireDate, setExpireDate] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleEditorMount = useCallback((editorInstance: EditorInstance) => {
    setEditor(editorInstance);
  }, []);

  const fetchNotice = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/notices/${id}`);
      setTitle(response.data.title);
      setContent(response.data.content);
      setExposureType(response.data.exposure_type);
      setSelectedBoards(response.data.board_ids || []);
      setExpireDate(response.data.expire_date?.split('T')[0] || '');
      if (editor) {
        editor.getInstance().setHTML(response.data.content);
      }
      setAttachedFiles(response.data.file_urls || []);
      setNotice(response.data);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      alert('공지사항을 불러오는데 실패했습니다.');
    }
  }, [id, editor]);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (id && editor && !isDataLoaded) {
      fetchNotice();
      setIsDataLoaded(true);
    }
  }, [id, editor, isDataLoaded, fetchNotice]);

  const fetchBoards = async () => {
    try {
      const response = await axiosInstance.get('/api/boards');
      setBoards(response.data);
    } catch (error) {
      console.error('게시판 목록 조회 실패:', error);
    }
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
      const allowedTypes = [
        // 이미지
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        // 문서
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        // 압축파일
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
      ];

      const files = Array.from(e.target.files);
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        alert('이미지, 문서, 압축 파일만 업로드 가능합니다.');
        e.target.value = ''; // 파일 선택 초기화
        return;
      }

      setFiles(files);
    }
  };

  const handleFileDelete = (fileUrl: string) => {
    setAttachedFiles(prev => prev.filter(url => url !== fileUrl));
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

      formData.append('existing_files', JSON.stringify(attachedFiles));

      files.forEach(file => {
        formData.append('files', file);
      });

      await axiosInstance.put(`/api/notices/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      router.push('/notices');
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      alert('공지사항 수정에 실패했습니다.');
    }
  };

  const handleFileDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">공지사항 수정</h1>
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

        {attachedFiles.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첨부 파일
            </label>
            <div className="space-y-2">
              {attachedFiles
                .filter(fileUrl => {
                  const fileName = fileUrl.split('/').pop() || '';
                  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
                  return !(isImage && content?.includes(fileUrl));
                })
                .map((fileUrl, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <button
                      type="button"
                      onClick={() => handleFileDownload(fileUrl)}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <span className="mr-2">📎</span>
                      <span className="underline">{fileUrl.split('/').pop()}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileDelete(fileUrl)}
                      className="text-red-500 hover:text-red-700 px-2"
                      title="파일 삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 첨부 파일
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-sm text-gray-500">
            허용된 파일 형식: 이미지(jpg, png, gif), 문서(pdf, doc, docx, xls, xlsx, ppt, pptx), 압축파일(zip, rar, 7z)
          </p>
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
            수정
          </button>
        </div>
      </form>
    </div>
  );
} 