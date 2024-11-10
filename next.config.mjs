/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // 웹팩 설정 수정
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // 기존 설정 유지
    return config;
  },
  // API 라우트에서 formidable 사용을 위한 설정
  api: {
    bodyParser: false,
  },
};

export default nextConfig;
