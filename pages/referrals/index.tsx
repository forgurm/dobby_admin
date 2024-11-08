import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.js에 필요한 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReferralsPage = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [dailyDeposits, setDailyDeposits] = useState([]);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await axios.get('/api/bybit/deposits');
        const data = response.data;

        // 총 잔액 계산
        const total = data.reduce((acc, deposit) => acc + deposit.amount, 0);
        setTotalBalance(total);

        // 일별 디파짓 데이터 설정
        setDailyDeposits(data);
      } catch (error) {
        console.error('Error fetching deposit data:', error);
      }
    };

    fetchDeposits();
  }, []);

  // 바 차트 데이터 설정
  const chartData = {
    labels: dailyDeposits.map(deposit => deposit.date),
    datasets: [
      {
        label: 'USDT Deposits',
        data: dailyDeposits.map(deposit => deposit.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div>
      <h1>Referrals</h1>
      <div className="card">
        <h2>Total Balance: {totalBalance} USDT</h2>
      </div>
      <div className="chart">
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default ReferralsPage; 