import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLinkClick = () => {
    toggleSidebar();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-gray-800 text-white p-4 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:relative md:translate-x-0 w-64 min-w-[200px] h-screen z-50`}
    >
      <div className="flex flex-col h-full">
        <ul className="flex-grow">
          <li className="mb-2">
            <Link href="/dashboard" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>대시보드</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/members" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>회원 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/referrals" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>레퍼럴 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/boards" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>게시판 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/menu" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>메뉴 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/bots" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>봇 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/chat" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>채팅 관리</a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/notices" legacyBehavior>
              <a className="block p-2 bg-gray-700 rounded hover:bg-gray-600" onClick={handleLinkClick}>
                공지사항 관리
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <div className="block p-2 bg-gray-700 rounded cursor-pointer" onClick={toggleSettings}>
              설정
            </div>
            {isSettingsOpen && (
              <ul className="ml-4">
                <li className="mb-2">
                  <Link href="/settings/symbol" legacyBehavior>
                    <a className="block p-2 bg-gray-600 rounded hover:bg-gray-500" onClick={handleLinkClick}>심볼명 설정</a>
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/settings/bot" legacyBehavior>
                    <a className="block p-2 bg-gray-600 rounded hover:bg-gray-500" onClick={handleLinkClick}>봇 설정</a>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
        <button className="mt-4 p-2 bg-gray-700 text-white rounded w-full md:hidden" onClick={toggleSidebar}>
          닫기
        </button>
      </div>
    </aside>
  );
}