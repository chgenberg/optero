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
};

export default nextConfig;

