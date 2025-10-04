module.exports = {
  i18n: {
    defaultLocale: 'sv',
    locales: ['sv', 'en', 'es', 'fr'],
    localeDetection: true,
  },
  localePath: typeof window === 'undefined' 
    ? require('path').resolve('./public/locales')
    : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
