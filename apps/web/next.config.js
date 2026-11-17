/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    const backendBase =
      process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBase.replace(/\/$/, '')}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
