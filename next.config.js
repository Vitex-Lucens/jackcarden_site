/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // No basePath needed for root domain
  images: {
    domains: ['localhost', 'jackcarden.art'],
    unoptimized: true, // Don't optimize uploaded images
  },

  // Disable server API routes when exporting
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
