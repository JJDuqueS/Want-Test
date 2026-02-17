/**
 * @type {import('next').NextConfig} 
 */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;