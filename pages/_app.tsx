import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { SessionProvider, useSession } from 'next-auth/react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppContent Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoginPage = router.pathname === '/login';

  // 로그인 페이지가 아니고, 사용자가 로그인되어 있을 때만 헤더와 사이드바를 렌더링
  const showLayout = !isLoginPage && status === 'authenticated';

  return (
    <div>
      {showLayout && <Header />}
      {showLayout && <Sidebar />}
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp; 