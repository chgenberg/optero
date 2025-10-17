/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-language support via middleware and LanguageContext
  // Default language: English (/)
  // Other languages: /sv, /es, /fr, /de
  async rewrites() {
    return [
      // Language-specific routes
      {
        source: '/sv/:path*',
        destination: '/:path*',
      },
      {
        source: '/es/:path*',
        destination: '/:path*',
      },
      {
        source: '/fr/:path*',
        destination: '/:path*',
      },
      {
        source: '/de/:path*',
        destination: '/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }
};

export default nextConfig;

