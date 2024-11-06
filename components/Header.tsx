import { useRouter } from 'next/router';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    // 로그아웃 로직 구현
    // 예: 세션 삭제 후 로그인 페이지로 리디렉션
    router.push('/login');
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
        로그오프
      </button>
    </header>
  );
} 