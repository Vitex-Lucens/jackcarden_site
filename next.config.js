/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/jackcarden',
  images: {
    domains: ['localhost'],
    unoptimized: true, // Don't optimize uploaded images
  },

  // Disable server API routes when exporting
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
