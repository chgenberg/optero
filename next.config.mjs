/** @type {import('next').NextConfig} */
const nextConfig = {
  // Multi-language support via middleware and LanguageContext
  // Supported languages: sv, en, es, fr, de
  async redirects() {
    return [
      // Redirect /en, /es, /fr, /de to root with language detection
      {
        source: '/:lang(en|es|fr|de)',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

