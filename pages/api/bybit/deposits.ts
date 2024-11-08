import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';

// Bybit API 키와 시크릿 설정
const BYBIT_API_KEY = "4lDDBTRCfgZ2gKRPiU";
const BYBIT_API_SECRET = "ZmETfyM21wldz7Xr0GSbYF0lin21wvymGCyD";

// Bybit API 엔드포인트
const BYBIT_API_URL = 'https://api.bybit.com/v5/asset/deposit/query-record';

// API 응답 타입 정의
interface DepositRecord {
  successAt: string;
  amount: string;
}

interface ApiResponse {
  result: {
    rows: DepositRecord[];
  };
}

// 가공된 데이터 타입 정의
interface ProcessedDeposit {
  date: string;
  amount: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const timestamp = Date.now().toString();
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10일 전
      const params = {
        coin: 'USDT',
        startTime: tenDaysAgo.toString(),
        endTime: Date.now().toString(),
        api_key: BYBIT_API_KEY,
        timestamp,
      };

      // 쿼리 문자열 생성 (알파벳 순서로 정렬)
      const queryString = new URLSearchParams(Object.entries(params).sort()).toString();

      // 서명 생성
      const signature = crypto
        .createHmac('sha256', BYBIT_API_SECRET)
        .update(queryString)
        .digest('hex');

      // Bybit API 호출
      const response = await axios.get<ApiResponse>(`${BYBIT_API_URL}?${queryString}&sign=${signature}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      // 날짜별 입금 데이터 가공
      const deposits: ProcessedDeposit[] = data.result.rows.map((row) => ({
        date: new Date(parseInt(row.successAt)).toISOString().split('T')[0],
        amount: parseFloat(row.amount),
      }));

      res.status(200).json(deposits);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching deposit data:', error.response?.data);
        console.error('Status:', error.response?.status);
      } else {
        console.error('Error:', error);
      }
      res.status(500).json({ error: 'Failed to fetch deposit data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 