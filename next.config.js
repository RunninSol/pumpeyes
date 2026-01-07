/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Optimize for production
  swcMinify: true,
  // Enable compression
  compress: true,
}

module.exports = nextConfig

