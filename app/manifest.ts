import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mendio — AI that understands your business',
    short_name: 'Mendio',
    description: 'AI chatbots that understand your business',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/MENDIO_logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
