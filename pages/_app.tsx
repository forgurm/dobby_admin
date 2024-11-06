import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { SessionProvider, useSession } from 'next-auth/react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import React, { ComponentType, useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }: { Component: ComponentType, pageProps: Record<string, unknown> }) {
  const router = useRouter();
  const { status } = useSession();
  const isLoginPage = router.pathname === '/login';

  // 로그인 페이지가 아니고, 사용자가 로그인되어 있을 때만 헤더와 사이드바를 렌더링
  const showLayout = !isLoginPage && status === 'authenticated';

  // toggleSidebar 함수 정의
  const toggleSidebar = () => {
    // 사이드바를 열고 닫는 로직을 여기에 추가하세요.
    console.log('Sidebar toggled');
  };

  // 사이드바가 열려 있는지 여부를 관리하는 상태
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      {showLayout && <Header toggleSidebar={toggleSidebar} />}
      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        {showLayout && (
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          />
        )}
        <main style={{ flex: 1, overflowX: 'auto' }}>
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}

export default MyApp; 