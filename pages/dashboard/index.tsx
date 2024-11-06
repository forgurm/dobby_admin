import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
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
        data: [60, 40],
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
          <Link href="/members" legacyBehavior>
            <a className="text-blue-500">More</a>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">레퍼럴 사용자</h3>
            <p className="text-lg">100명</p>
          </div>
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">미사용자</h3>
            <p className="text-lg">50명</p>
          </div>
          <div className="p-4 bg-gray-200 rounded shadow">
            <h3 className="font-medium">거절</h3>
            <p className="text-lg">10명</p>
          </div>
        </div>
      </section>

      {/* 레퍼럴 일자별 수익 차트 섹션 */}
      <section className="mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">레퍼럴 일자별 수익 차트</h2>
          <Link href="/revenue" legacyBehavior>
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
          <p>심볼 목록 내용이 여기에 표시됩니다.</p>
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