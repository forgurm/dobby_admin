import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getUserStats } from '../../lib/users';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

interface DashboardProps {
  userStats: {
    referralCount: number;
    nonReferralCount: number;
    rejectedCount: number;
  };
}

export const getServerSideProps: GetServerSideProps<DashboardProps> = async () => {
  try {
    const userStats = await getUserStats();
    return {
      props: {
        userStats
      }
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      props: {
        userStats: {
          referralCount: 0,
          nonReferralCount: 0,
          rejectedCount: 0
        }
      }
    };
  }
};

interface ExchangeInfo {
  exchange_name: string;
  total_symbols: number;
  empty_symbol_names: number;
}

export default function Dashboard({ userStats }: DashboardProps) {
  const [exchangeData, setExchangeData] = useState<ExchangeInfo[]>([]);

  useEffect(() => {
    const fetchExchangeData = async () => {
      try {
        const response = await fetch('/api/exchanges');
        if (!response.ok) throw new Error('Failed to fetch exchange data');
        const data = await response.json();
        setExchangeData(data);
      } catch (error) {
        console.error('Error fetching exchange data:', error);
      }
    };

    fetchExchangeData();
  }, []);

  const barData = {
    labels: ['2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05'],
    datasets: [
      {
        label: '일별 수익률 ($)',
        data: [100, 150, 200, 250, 300],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '레퍼럴 일자별 수익 차트',
      },
    },
  };

  const doughnutData = {
    labels: ['동작', '멈춤'],
    datasets: [
      {
        label: '봇 상태',
        data: [60, 40], // 예시 데이터, 실제 데이터로 필요
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '봇 목록 원형 차트',
      },
    },
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
      {/* 회원수 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">회원수</h2>
          <Link href="/referrals" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">레퍼럴 사용자</h3>
            <p className="text-lg">{userStats.referralCount}명</p>
          </div>
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">미사용자</h3>
            <p className="text-lg">{userStats.nonReferralCount}명</p>
          </div>
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">거절</h3>
            <p className="text-lg">{userStats.rejectedCount}명</p>
          </div>
        </div>
      </section>

      {/* 레퍼럴 일자별 수익 차트 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">레퍼럴 일자별 수익 차트</h2>
          <Link href="/referrals" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="p-4 bg-gray-200 rounded shadow w-full">
          <Bar data={barData} options={barOptions} />
        </div>
      </section>

      {/* 봇목록 원형차트 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">봇목록 원형차트</h2>
          <Link href="/bots" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="p-4 bg-gray-200 rounded shadow w-full">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </section>

      {/* 심볼 목록 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">심볼 목록</h2>
          <Link href="/settings/symbol" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="p-4 bg-gray-200 rounded shadow">
          <div className="grid grid-cols-4 gap-4">
            {exchangeData.map((exchange, index) => {
              const symbolData = {
                labels: ['', ''],
                datasets: [
                  {
                    label: `${exchange.exchange_name} 심볼 상태`,
                    data: [exchange.empty_symbol_names, exchange.total_symbols - exchange.empty_symbol_names],
                    backgroundColor: ['rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)'],
                  },
                ],
              };

              const symbolOptions = {
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: `${exchange.exchange_name}`,
                  },
                  datalabels: {
                    color: '#000',
                    formatter: (value: number) => `${value}`,
                  },
                },
              };

              return (
                <div key={index} className="p-2 bg-gray-200 rounded shadow">
                  <Doughnut data={symbolData} options={symbolOptions} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 알림 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">알림</h2>
          <Link href="/notifications" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="p-4 bg-gray-200 rounded shadow">
          <ul>
            <li>회원 문의 1</li>
            <li>회원 문의 2</li>
            <li>회원 문의 3</li>
          </ul>
        </div>
      </section>
    </div>
  );
} 