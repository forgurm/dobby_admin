import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { SessionProvider, useSession } from 'next-auth/react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import React, { ComponentType, useState, useEffect } from 'react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }: { Component: ComponentType, pageProps: Record<string, unknown> }) {
  const router = useRouter();
  const { status } = useSession();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isLoginPage = router.pathname === '/login';

  // 인증 상태에 따른 리디렉션
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' && !isLoginPage) {
      router.replace('/login');
    }
    if (status === 'authenticated' && isLoginPage) {
      router.replace('/dashboard');
    }
  }, [status, isLoginPage, router]);

  // 로딩 상태일 때 로딩 화면 표시
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 로그인 페이지일 때는 레이아웃 없이 표시
  if (isLoginPage) {
    return <Component {...pageProps} />;
  }

  // 인증된 상태일 때는 레이아웃과 함께 표시
  if (status === 'authenticated') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 overflow-auto">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    );
  }

  // 그 외의 경우 (인증되지 않은 상태)
  return null;
}

export default MyApp; 