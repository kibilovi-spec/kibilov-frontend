/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/uploads/:path*`,
      },
    ];
  },
  images: {
    domains: ['localhost', 'kibilov.ge', 'cdn.kibilov.ge'],
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};
module.exports = nextConfig;
