import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mendio - AI för ditt yrke',
    short_name: 'Mendio',
    description: 'Hitta AI-verktyg och prompts anpassade för ditt yrke',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/mendio_logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
