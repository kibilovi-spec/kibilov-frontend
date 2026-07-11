const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
    instrumentationHook: true,
  },
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '3001' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'kibilov',
  project: 'kibilov-frontend',
}, {
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  disableServerWebpackPlugin: true,
  disableClientWebpackPlugin: false,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayShadowDom: true,
    excludeReplayIframe: true,
    excludeReplayWorker: true,
  },
});
