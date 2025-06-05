import createNextIntlPlugin from 'next-intl/plugin';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 添加重定向
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return [
      {
        source: '/ads.txt',
        destination: 'https://srv.adstxtmanager.com/19390/limgx.com',
        permanent: true, // 使用 301 永久重定向
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);