/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = {
    env: {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    },
  };
export default nextConfig;
