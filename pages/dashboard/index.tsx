import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getUserStats } from '../../lib/users';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

interface Deposit {
  date: string;
  amount: number;
}

export default function Dashboard({ userStats }: DashboardProps) {
  const [exchangeData, setExchangeData] = useState<ExchangeInfo[]>([]);
  const [dailyDeposits, setDailyDeposits] = useState<Deposit[]>([]);

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

    useEffect(() => {
      const fetchDeposits = async () => {
        try {
          const response = await axios.get<Deposit[]>('/api/bybit/deposits');
          setDailyDeposits(response.data);
        } catch (error) {
          console.error('Error fetching deposit data:', error);
        }
      };

      fetchDeposits();
    }, []);

  const barData = {
    labels: dailyDeposits.map(deposit => deposit.date),
    datasets: [
      {
        label: '일별 수익률 (USDT)',
        data: dailyDeposits.map(deposit => deposit.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: '레퍼럴 일자별 수익 차트',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'USDT',
        },
      },
      x: {
        title: {
          display: true,
          text: '날짜',
        },
      },
    },
  };

  const botBarData = {
    labels: ['봇 상태'],
    datasets: [
      {
        label: '동작중',
        data: [60],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
      {
        label: '전체',
        data: [40],
        backgroundColor: 'rgba(192, 192, 192, 0.5)',
        borderColor: 'rgba(192, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 50,
      }
    ],
  };

  const botBarOptions = {
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '봇 상태 현황',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: '봇 수',
        },
        stacked: true,
      },
      y: {
        stacked: true,
        offset: true,
      },
    },
    maintainAspectRatio: false,
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
        <div className="p-4 bg-gray-200 rounded shadow w-full" style={{ height: '200px' }}>
          <Bar data={barData} options={{ ...barOptions, maintainAspectRatio: false }} />
        </div>
      </section>

      {/* 봇목록 차트 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">봇 상태</h2>
          <Link href="/bots" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="p-4 bg-gray-200 rounded shadow w-full" style={{ height: '200px' }}>
          <Bar data={botBarData} options={botBarOptions} />
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