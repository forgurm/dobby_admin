import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://seaman501.cafe24.com:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전에 수행할 작업
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error('Response Error:', error.response.data);
      console.error('Status:', error.response.status);

      // 401 에러 처리 (인증 실패)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error('Request Error:', error.request);
    } else {
      // 요청 설정 중에 오류가 발생한 경우
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 