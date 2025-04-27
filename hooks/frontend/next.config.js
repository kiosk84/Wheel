/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow HMR websocket connections from LAN
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.107:3000'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Authorization, Content-Type' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*', // Убедитесь, что путь корректен
      },
    ];
  },
};

module.exports = nextConfig;
