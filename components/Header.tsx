import { signOut } from 'next-auth/react';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {

  const handleLogout = () => {
    // NextAuth의 signOut 함수 사용
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="bg-gray-200 p-4 flex justify-between items-center relative">
      <button className="md:hidden p-2" onClick={toggleSidebar}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <p className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
        도비 관리자
      </p>
      <button
        className="p-2 bg-gray-800 text-white rounded ml-auto"
        onClick={handleLogout}  
      >
        로그아웃
      </button>
    </header>
  );
} 