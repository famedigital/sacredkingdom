import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sacredkingdom.travel',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'bhutannobletour.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/blog', destination: '/journal', permanent: false },
      { source: '/blog/:slug', destination: '/journal/:slug', permanent: false },
      { source: '/travel-info', destination: '/bhutan', permanent: false },
      { source: '/trip', destination: '/tours', permanent: false },
      { source: '/trip/:slug', destination: '/tours/:slug', permanent: false },
      {
        source: '/tours/drukpath-trek-cultural-immersion',
        destination: '/tours/drukpath-trek-cultural-immersion-8-nights-9-days',
        permanent: false,
      },
      {
        source: '/tours/thimphu-tshechu-festival-tour-2026',
        destination: '/tours/bhutan-festival-tour-20262',
        permanent: false,
      },
      { source: '/activities', destination: '/tours', permanent: false },
      { source: '/about-us-bhutan-tour-operator', destination: '/about', permanent: false },
      { source: '/tourist-attraction', destination: '/experience', permanent: false },
      { source: '/tourist-attraction/punakha-attractions-2', destination: '/experience/punakha', permanent: false },
      { source: '/tourist-attraction/zhemgang-attractions', destination: '/experience/zhemgang', permanent: false },
      { source: '/tourist-attraction/wangdue-attractions', destination: '/experience/wangdue', permanent: false },
      { source: '/tourist-attraction/trongsa-attractions', destination: '/experience/trongsa', permanent: false },
      { source: '/tourist-attraction/thimphu-attractions', destination: '/experience/thimphu', permanent: false },
      { source: '/tourist-attraction/trashigang-attractions', destination: '/experience/trashigang', permanent: false },
      { source: '/tourist-attraction/trashiyangtse-attractions', destination: '/experience/trashiyangtse', permanent: false },
      { source: '/tourist-attraction/paro-attractions', destination: '/experience/paro', permanent: false },
      { source: '/tourist-attraction/mongar-attractions', destination: '/experience/mongar', permanent: false },
      { source: '/tourist-attraction/lhuntse-attractions', destination: '/experience/lhuntse', permanent: false },
      { source: '/tourist-attraction/haa-attractions', destination: '/experience/haa', permanent: false },
      { source: '/tourist-attraction/gasa-attractions', destination: '/experience/gasa', permanent: false },
      { source: '/tourist-attraction/bumthang-attractions', destination: '/experience/bumthang', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/admin/' },
        ],
      },
      {
        source: '/admin-pwa/manifest.webmanifest',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
